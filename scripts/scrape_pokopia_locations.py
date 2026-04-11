#!/usr/bin/env python3
"""Fetch and normalize the main Pokopia locations table."""

from __future__ import annotations

from pathlib import Path

from pokopia_common import (
    ROOT,
    absolute_url,
    clean_text,
    extract_outer_elements,
    fetch_html,
    first_alt,
    first_href,
    first_src,
    location_id_from_slug,
    path_relative_to_root,
    slug_from_path,
    utc_now,
    write_json,
)

SOURCE_URL = "https://www.serebii.net/pokemonpokopia/locations.shtml"
BASE_URL = "https://www.serebii.net/pokemonpokopia/"
RAW_HTML_PATH = ROOT / "data" / "raw" / "pokemonpokopia" / "locations.html"
OUTPUT_JSON_PATH = ROOT / "data" / "json" / "pokemonpokopia" / "locations.json"


def main() -> None:
    html = fetch_html(SOURCE_URL)
    RAW_HTML_PATH.parent.mkdir(parents=True, exist_ok=True)
    RAW_HTML_PATH.write_text(html, encoding="utf-8")

    included_locations, excluded_locations = parse_locations(html)

    write_json(
        OUTPUT_JSON_PATH,
        {
            "source": {
                "name": "Serebii",
                "page": SOURCE_URL,
                "fetchedAt": utc_now(),
                "htmlSnapshotPath": path_relative_to_root(RAW_HTML_PATH),
                "notes": [
                    "This dataset includes only the five main playable locations.",
                    "Cloud Island is intentionally excluded from normalized location data.",
                ],
                "excludedLocations": excluded_locations,
            },
            "count": len(included_locations),
            "locations": included_locations,
        },
    )

    print(f"Saved {len(included_locations)} locations to {OUTPUT_JSON_PATH}")


def parse_locations(html: str) -> tuple[list[dict[str, object]], list[dict[str, object]]]:
    start_marker = '<table align="center" class="dextable">'
    end_marker = "</table>"
    start = html.find(start_marker)
    if start == -1:
        raise ValueError("Could not find the locations table.")
    start += len(start_marker)
    end = html.find(end_marker, start)
    if end == -1:
        raise ValueError("Could not find the end of the locations table.")

    table_html = html[start:end]
    rows = extract_outer_elements(table_html, "tr")
    if len(rows) < 2:
        raise ValueError("Locations table did not contain data rows.")

    included: list[dict[str, object]] = []
    excluded: list[dict[str, object]] = []

    for row_index, row in enumerate(rows[1:], start=1):
        cells = extract_outer_elements(row["innerHtml"], "td")
        if len(cells) < 2:
            continue

        detail_path = first_href(cells[0]["innerHtml"])
        image_path = first_src(cells[0]["innerHtml"])
        if not detail_path or not image_path:
            continue

        slug = slug_from_path(detail_path)
        record = {
            "sourceOrder": row_index,
            "slug": slug,
            "name": clean_text(cells[1]["innerHtml"]),
            "detailUrl": absolute_url(BASE_URL, detail_path),
            "pictureUrl": absolute_url(BASE_URL, image_path),
            "pictureFilename": Path(image_path).name,
            "pictureAlt": first_alt(cells[0]["innerHtml"]),
        }

        location_id = location_id_from_slug(slug)
        if location_id is None:
            excluded.append(record)
            continue

        included.append({"locationId": location_id, **record})

    return included, excluded


if __name__ == "__main__":
    main()
