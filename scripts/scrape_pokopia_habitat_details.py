#!/usr/bin/env python3
"""Fetch and normalize Pokopia habitat requirements and spawn rules."""

from __future__ import annotations

import json
import re
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
    split_br_chunks,
    utc_now,
    write_json,
)

HABITATS_INPUT_PATH = ROOT / "data" / "json" / "pokemonpokopia" / "habitats.json"
ITEMS_INPUT_PATH = ROOT / "data" / "json" / "pokemonpokopia" / "items.json"
POKEMON_INPUT_PATH = ROOT / "data" / "json" / "pokemonpokopia" / "pokemon.json"
RAW_HTML_DIR = ROOT / "data" / "raw" / "pokemonpokopia" / "habitatdex"
REQUIREMENTS_OUTPUT_PATH = ROOT / "data" / "json" / "pokemonpokopia" / "habitat-requirements.json"
SPAWNS_OUTPUT_PATH = ROOT / "data" / "json" / "pokemonpokopia" / "habitat-spawns.json"
BASE_URL = "https://www.serebii.net/pokemonpokopia/"

IMAGE_FILENAME_RE = re.compile(r"/(?P<id>\d+)(?:-(?P<form>[^/.]+))?\.png$")
TIME_WEATHER_RE = re.compile(
    r"<b>Time</b>.*?<tr><td[^>]*>\s*(?P<times>.*?)</td><td[^>]*>\s*(?P<weather>.*?)</tr></table>",
    re.DOTALL,
)
CONDITION_CELL_RE = re.compile(r'(<td class="fooinfo">\s*<table.*?</table>\s*</td>)', re.DOTALL)


def main() -> None:
    habitats = json.loads(HABITATS_INPUT_PATH.read_text(encoding="utf-8"))["habitats"]
    items = json.loads(ITEMS_INPUT_PATH.read_text(encoding="utf-8"))["items"]
    pokemon = json.loads(POKEMON_INPUT_PATH.read_text(encoding="utf-8"))["pokemon"]

    items_by_detail = {item["detailUrl"]: item for item in items}
    items_by_name = build_unique_lookup(items, "name")
    pokemon_by_detail = {entry["detailUrl"]: entry for entry in pokemon}
    pokemon_by_name = build_unique_lookup(pokemon, "name")

    RAW_HTML_DIR.mkdir(parents=True, exist_ok=True)

    requirements_records: list[dict[str, object]] = []
    spawn_records: list[dict[str, object]] = []
    total_requirements = 0
    total_spawns = 0

    for habitat in habitats:
        html = fetch_html(habitat["detailUrl"])
        raw_path = RAW_HTML_DIR / f"{habitat['slug']}.html"
        raw_path.write_text(html, encoding="utf-8")

        requirements = parse_requirements(
            html=html,
            items_by_detail=items_by_detail,
            items_by_name=items_by_name,
        )
        spawns = parse_spawns(
            html=html,
            pokemon_by_detail=pokemon_by_detail,
            pokemon_by_name=pokemon_by_name,
        )

        total_requirements += len(requirements)
        total_spawns += len(spawns)

        habitat_summary = {
            "habitatId": habitat["habitatId"],
            "habitatSlug": habitat["slug"],
            "habitatName": habitat["name"],
            "detailUrl": habitat["detailUrl"],
            "rawHtmlPath": path_relative_to_root(raw_path),
        }
        requirements_records.append({**habitat_summary, "requirements": requirements})
        spawn_records.append({**habitat_summary, "spawns": spawns})

    common_source = {
        "name": "Serebii",
        "page": "https://www.serebii.net/pokemonpokopia/habitats.shtml",
        "fetchedAt": utc_now(),
        "rawHtmlDirectory": path_relative_to_root(RAW_HTML_DIR),
        "notes": [
            "Cloud Island is omitted from normalized spawn locations.",
            "Requirement rows without direct item links are reconciled against the item catalog by exact name when possible.",
        ],
    }

    write_json(
        REQUIREMENTS_OUTPUT_PATH,
        {
            "source": common_source,
            "count": len(requirements_records),
            "totalRequirements": total_requirements,
            "habitats": requirements_records,
        },
    )
    write_json(
        SPAWNS_OUTPUT_PATH,
        {
            "source": common_source,
            "count": len(spawn_records),
            "totalSpawns": total_spawns,
            "habitats": spawn_records,
        },
    )

    print(f"Saved requirements for {len(requirements_records)} habitats to {REQUIREMENTS_OUTPUT_PATH}")
    print(f"Saved {total_requirements} habitat requirements")
    print(f"Saved spawn data for {len(spawn_records)} habitats to {SPAWNS_OUTPUT_PATH}")
    print(f"Saved {total_spawns} habitat spawns")


def build_unique_lookup(records: list[dict[str, object]], key: str) -> dict[str, dict[str, object]]:
    grouped: dict[str, list[dict[str, object]]] = {}
    for record in records:
        value = str(record[key]).strip().lower()
        grouped.setdefault(value, []).append(record)
    return {value: matches[0] for value, matches in grouped.items() if len(matches) == 1}


def parse_requirements(
    *,
    html: str,
    items_by_detail: dict[str, dict[str, object]],
    items_by_name: dict[str, dict[str, object]],
) -> list[dict[str, object]]:
    table_html = section_table_html(html, "Requirements", "Available Pok")
    rows = extract_outer_elements(table_html, "tr")
    requirements: list[dict[str, object]] = []

    for source_order, row in enumerate(rows[1:], start=1):
        cells = extract_outer_elements(row["innerHtml"], "td")
        if len(cells) < 3:
            continue

        picture_cell, name_cell, quantity_cell = cells[:3]
        source_detail_path = first_href(name_cell["innerHtml"]) or first_href(picture_cell["innerHtml"])
        source_detail_url = absolute_url(BASE_URL, source_detail_path) if source_detail_path else None
        source_item_slug = slug_from_path(source_detail_path) if source_detail_path else None
        item_name = clean_text(name_cell["innerHtml"])
        image_path = first_src(picture_cell["innerHtml"])

        matched_item = None
        catalog_match_type = "unmatched"
        if source_detail_url and source_detail_url in items_by_detail:
            matched_item = items_by_detail[source_detail_url]
            catalog_match_type = "source-link"
        elif item_name.lower() in items_by_name:
            matched_item = items_by_name[item_name.lower()]
            catalog_match_type = "name-match"

        requirements.append(
            {
                "sourceOrder": source_order,
                "quantity": parse_quantity(quantity_cell["innerHtml"]),
                "itemId": matched_item["itemId"] if matched_item else (source_item_slug or slugify_name(item_name)),
                "itemSlug": matched_item["slug"] if matched_item else (source_item_slug or slugify_name(item_name)),
                "itemName": item_name,
                "sourceDetailUrl": source_detail_url,
                "detailUrl": matched_item["detailUrl"] if matched_item else source_detail_url,
                "pictureUrl": absolute_url(BASE_URL, image_path) if image_path else None,
                "pictureFilename": Path(image_path).name if image_path else None,
                "pictureAlt": first_alt(picture_cell["innerHtml"]),
                "isCatalogLinked": matched_item is not None,
                "catalogMatchType": catalog_match_type,
            }
        )

    return requirements


def parse_spawns(
    *,
    html: str,
    pokemon_by_detail: dict[str, dict[str, object]],
    pokemon_by_name: dict[str, dict[str, object]],
) -> list[dict[str, object]]:
    table_html = section_table_html(html, "Available Pok", "</main>")
    rows = extract_outer_elements(table_html, "tr")
    if not rows:
        return []

    spawns: list[dict[str, object]] = []
    group_size = 5
    if len(rows) % group_size != 0:
        raise ValueError(f"Unexpected spawn table row count: {len(rows)}")

    for offset in range(0, len(rows), group_size):
        name_cells = extract_outer_elements(rows[offset]["innerHtml"], "td")
        image_cells = extract_outer_elements(rows[offset + 1]["innerHtml"], "td")
        location_cells = extract_outer_elements(rows[offset + 2]["innerHtml"], "td")
        rarity_cells = extract_outer_elements(rows[offset + 3]["innerHtml"], "td")
        condition_cells = extract_outer_elements(rows[offset + 4]["innerHtml"], "td")
        if not condition_cells:
            condition_cells = [{"attrsRaw": ' class="fooinfo"', "innerHtml": html} for html in extract_condition_cells(rows[offset + 4]["innerHtml"])]

        cell_count = len(name_cells)
        if not all(
            len(cells) == cell_count for cells in [image_cells, location_cells, rarity_cells, condition_cells]
        ):
            raise ValueError("Spawn row group did not have matching cell counts.")

        for index in range(cell_count):
            detail_path = first_href(name_cells[index]["innerHtml"]) or first_href(image_cells[index]["innerHtml"])
            image_path = first_src(image_cells[index]["innerHtml"])
            if not detail_path or not image_path:
                continue

            detail_url = absolute_url(BASE_URL, detail_path)
            matched_pokemon = pokemon_by_detail.get(detail_url)
            pokemon_name = clean_text(name_cells[index]["innerHtml"])
            if matched_pokemon is None and pokemon_name.lower() in pokemon_by_name:
                matched_pokemon = pokemon_by_name[pokemon_name.lower()]

            raw_location_names, normalized_location_ids = parse_spawn_locations(location_cells[index]["innerHtml"])
            time_of_day, weather = parse_time_weather(condition_cells[index]["innerHtml"])

            parsed_image = parse_image_filename(image_path)
            spawns.append(
                {
                    "sourceOrder": len(spawns) + 1,
                    "pokemonId": matched_pokemon["pokemonId"] if matched_pokemon else parsed_image["pokemonId"],
                    "pokemonSlug": matched_pokemon["slug"] if matched_pokemon else slug_from_path(detail_path),
                    "pokemonName": matched_pokemon["name"] if matched_pokemon else pokemon_name,
                    "pokemonDetailUrl": detail_url,
                    "pokemonImageUrl": absolute_url(BASE_URL, image_path),
                    "pokemonImageFilename": Path(image_path).name,
                    "pokemonFormSlug": parsed_image["pokemonFormSlug"],
                    "locations": normalized_location_ids,
                    "rawLocationText": "; ".join(raw_location_names),
                    "rarity": parse_rarity(rarity_cells[index]["innerHtml"]),
                    "timeOfDay": time_of_day,
                    "weather": weather,
                }
            )

    return spawns


def section_table_html(html: str, heading: str, next_marker: str) -> str:
    start = html.find(heading)
    if start == -1:
        raise ValueError(f"Could not find section heading containing {heading!r}")

    segment = html[start:]
    next_index = segment.find(next_marker)
    if next_index != -1:
        segment = segment[:next_index]

    table_start_marker = '<table class="dextable" align="center"'
    table_start = segment.find(table_start_marker)
    if table_start == -1:
        raise ValueError(f"Could not find table for section {heading!r}")

    segment = segment[table_start:]
    tables = extract_outer_elements(segment, "table")
    if not tables:
        raise ValueError(f"Could not isolate table for section {heading!r}")
    return tables[0]["innerHtml"]


def parse_spawn_locations(cell_html: str) -> tuple[list[str], list[str]]:
    location_names: list[str] = []
    location_ids: list[str] = []

    for href_match in re.finditer(r'href="([^"]+)"', cell_html):
        href = href_match.group(1)
        if "locations/" not in href:
            continue
        slug = slug_from_path(href)
        name_match = re.search(rf'href="{re.escape(href)}"><u>(.*?)</u></a>', cell_html)
        location_name = clean_text(name_match.group(1)) if name_match else slug
        location_names.append(location_name)

        location_id = location_id_from_slug(slug)
        if location_id and location_id not in location_ids:
            location_ids.append(location_id)

    return location_names, location_ids


def parse_time_weather(cell_html: str) -> tuple[list[str], list[str]]:
    match = TIME_WEATHER_RE.search(cell_html)
    if not match:
        return [], []

    times = [normalize_time_or_weather(value) for value in split_br_chunks(match.group("times"))]
    weather = [normalize_time_or_weather(value) for value in split_br_chunks(match.group("weather"))]
    return [value for value in times if value], [value for value in weather if value]


def extract_condition_cells(row_html: str) -> list[str]:
    return [match.group(1) for match in CONDITION_CELL_RE.finditer(row_html)]


def normalize_time_or_weather(value: str) -> str:
    value = clean_text(value).strip().lower()
    return value.replace(" ", "-")


def parse_image_filename(image_path: str) -> dict[str, object]:
    match = IMAGE_FILENAME_RE.search(image_path)
    if not match:
        raise ValueError(f"Could not parse Pokemon image filename: {image_path}")
    return {
        "pokemonId": int(match.group("id")),
        "pokemonFormSlug": match.group("form"),
    }


def slugify_name(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def parse_quantity(quantity_html: str) -> int | None:
    text = clean_text(quantity_html)
    return int(text) if text else None


def parse_rarity(rarity_html: str) -> str:
    text = clean_text(rarity_html)
    return text.replace("Rarity:", "", 1).strip() if text.startswith("Rarity:") else text


if __name__ == "__main__":
    main()
