#!/usr/bin/env python3
"""Fetch and normalize the Serebii Pokemon Pokopia habitats table."""

from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from html import unescape
from pathlib import Path
from urllib.parse import urljoin
from urllib.request import Request, urlopen

SOURCE_URL = "https://www.serebii.net/pokemonpokopia/habitats.shtml"
BASE_URL = "https://www.serebii.net/pokemonpokopia/"
ROOT = Path(__file__).resolve().parent.parent
RAW_HTML_PATH = ROOT / "data" / "raw" / "pokemonpokopia" / "habitats.html"
OUTPUT_JSON_PATH = ROOT / "data" / "json" / "pokemonpokopia" / "habitats.json"

TABLE_RE = re.compile(
    r"<p><h2>List of Habitats</h2></p>\s*<table align=\"center\" class=\"dextable\">(?P<table>.*?)</table>",
    re.DOTALL,
)
EVENT_HEADER = '<tr><td class="fooevo" colspan="4">Habitats (Event)</td></tr>'
ROW_RE = re.compile(
    r"<tr>\s*"
    r"<td class=\"cen\">#(?P<id>\d+)</td>\s*"
    r"<td class=\"cen\"><a href=\"(?P<detail>[^\"]+)\"><img src=\"(?P<image>[^\"]+)\"[^>]*alt=\"(?P<alt>[^\"]*)\"[^>]*></a></td>\s*"
    r"<td class=\"fooinfo\"><a href=\"(?P<name_detail>[^\"]+)\"><u>(?P<name>.*?)</u></a></td>\s*"
    r"<td class=\"fooinfo\">(?P<description>.*?)</td>\s*"
    r"</tr>",
    re.DOTALL,
)


def main() -> None:
    html = fetch_html(SOURCE_URL)
    RAW_HTML_PATH.parent.mkdir(parents=True, exist_ok=True)
    RAW_HTML_PATH.write_text(html, encoding="utf-8")

    habitats = parse_habitats(html)

    OUTPUT_JSON_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_JSON_PATH.write_text(
        json.dumps(
            {
                "source": {
                    "name": "Serebii",
                    "page": SOURCE_URL,
                    "fetchedAt": utc_now(),
                    "htmlSnapshotPath": path_relative_to_root(RAW_HTML_PATH),
                    "notes": [
                        "This dataset includes only the top-level habitats table.",
                        "The separate Habitats (Event) section is intentionally excluded.",
                    ],
                },
                "count": len(habitats),
                "habitats": habitats,
            },
            indent=2,
            ensure_ascii=True,
        )
        + "\n",
        encoding="utf-8",
    )

    print(f"Saved {len(habitats)} habitats to {OUTPUT_JSON_PATH}")


def fetch_html(url: str) -> str:
    request = Request(
        url,
        headers={
            "User-Agent": (
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0 Safari/537.36"
            )
        },
    )
    with urlopen(request) as response:
        return response.read().decode("utf-8", errors="replace")


def parse_habitats(html: str) -> list[dict[str, object]]:
    match = TABLE_RE.search(html)
    if not match:
        raise ValueError("Could not find the habitats table on the page.")

    table_html = match.group("table")
    table_html = table_html.split(EVENT_HEADER, 1)[0]

    habitats: list[dict[str, object]] = []
    for row_match in ROW_RE.finditer(table_html):
        habitat_id = int(row_match.group("id"))
        detail_path = row_match.group("detail")
        name_detail_path = row_match.group("name_detail")
        if detail_path != name_detail_path:
            raise ValueError(f"Mismatched habitat detail paths for habitat #{habitat_id:03d}")

        habitats.append(
            {
                "habitatId": habitat_id,
                "habitatIdDisplay": f"#{habitat_id:03d}",
                "name": clean_text(row_match.group("name")),
                "description": clean_text(row_match.group("description")),
                "slug": Path(detail_path).stem,
                "detailUrl": absolute_url(detail_path),
                "pictureUrl": absolute_url(row_match.group("image")),
                "pictureFilename": Path(row_match.group("image")).name,
                "pictureAlt": clean_text(row_match.group("alt")),
            }
        )

    if not habitats:
        raise ValueError("No habitats were parsed from the top-level table.")

    return habitats


def clean_text(value: str) -> str:
    value = re.sub(r"<[^>]+>", "", value)
    value = re.sub(r"\s+", " ", value)
    return unescape(value).strip()


def absolute_url(path: str) -> str:
    return urljoin(BASE_URL, path)


def path_relative_to_root(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


if __name__ == "__main__":
    main()
