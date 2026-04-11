#!/usr/bin/env python3
"""Fetch and normalize the Serebii Pokemon Pokopia items index."""

from __future__ import annotations

import re
from pathlib import Path

from pokopia_common import (
    ROOT,
    absolute_url,
    clean_text,
    clean_text_keep_breaks,
    extract_outer_elements,
    fetch_html,
    first_alt,
    first_href,
    first_src,
    location_id_from_slug,
    normalize_anchor_id,
    path_relative_to_root,
    slug_from_path,
    split_br_chunks,
    utc_now,
    write_json,
)

SOURCE_URL = "https://www.serebii.net/pokemonpokopia/items.shtml"
BASE_URL = "https://www.serebii.net/pokemonpokopia/"
RAW_HTML_PATH = ROOT / "data" / "raw" / "pokemonpokopia" / "items.html"
ITEMS_OUTPUT_PATH = ROOT / "data" / "json" / "pokemonpokopia" / "items.json"
ANCHORS_OUTPUT_PATH = ROOT / "data" / "json" / "pokemonpokopia" / "item-anchors.json"
TAGS_OUTPUT_PATH = ROOT / "data" / "json" / "pokemonpokopia" / "item-tags.json"

SECTION_RE = re.compile(
    r'<p><h2><a name="(?P<anchor>[^"]+)"></a>List of (?P<name>[^<]+)</h2></p>\s*'
    r'<table class="dextable" align="center">(?P<table>.*?)</table>',
    re.DOTALL,
)
ANCTAB_RE = re.compile(r'<table class="anctab" align="center">(?P<table>.*?)</table>', re.DOTALL)
LOCATION_METHOD_RE = re.compile(r"^(?P<name>.+?) \((?P<method>[^)]+)\)$")
DREAM_ISLAND_RE = re.compile(r"^(?P<name>.+?) Dream Island(?: \((?P<method>[^)]+)\))?$")
SHOP_UNLOCK_RE = re.compile(r"^Shop - Unlocked at (?P<location>.+?) Lv\. (?P<level>\d+)$")
SPECIALTY_ACTION_RE = re.compile(r"with Pok[eé]mon with (?P<specialty>.+)$", re.IGNORECASE)

PRIMARY_LOCATION_NAMES = {
    "Withered Wastelands": "withered-wastelands",
    "Bleak Beach": "bleak-beach",
    "Rocky Ridges": "rocky-ridges",
    "Sparkling Skylands": "sparkling-skylands",
    "Palette Town": "palette-town",
}


def main() -> None:
    html = fetch_html(SOURCE_URL)
    RAW_HTML_PATH.parent.mkdir(parents=True, exist_ok=True)
    RAW_HTML_PATH.write_text(html, encoding="utf-8")

    standard_tags = parse_standard_tags(html)
    anchors, items, discovered_tags = parse_sections(html)

    all_tags = merge_tags(standard_tags, discovered_tags)

    common_source = {
        "name": "Serebii",
        "page": SOURCE_URL,
        "fetchedAt": utc_now(),
        "htmlSnapshotPath": path_relative_to_root(RAW_HTML_PATH),
    }

    write_json(
        ANCHORS_OUTPUT_PATH,
        {
            "source": common_source,
            "count": len(anchors),
            "anchors": anchors,
        },
    )
    write_json(
        TAGS_OUTPUT_PATH,
        {
            "source": {
                **common_source,
                "notes": [
                    "Standard item tags come from the categories table at the top of the page.",
                    "Additional non-standard tags are discovered from item rows when present.",
                ],
            },
            "count": len(all_tags),
            "tags": all_tags,
        },
    )
    write_json(
        ITEMS_OUTPUT_PATH,
        {
            "source": {
                **common_source,
                "notes": [
                    "anchorId comes from the top-level items page section.",
                    "tagId comes from the optional Tag column when present.",
                    "rawLocationText preserves the mixed acquisition text from the source Locations column.",
                ],
            },
            "count": len(items),
            "items": items,
        },
    )

    print(f"Saved {len(anchors)} item anchors to {ANCHORS_OUTPUT_PATH}")
    print(f"Saved {len(all_tags)} item tags to {TAGS_OUTPUT_PATH}")
    print(f"Saved {len(items)} items to {ITEMS_OUTPUT_PATH}")


def parse_standard_tags(html: str) -> list[dict[str, object]]:
    tables = [match.group("table") for match in ANCTAB_RE.finditer(html)]
    if not tables:
        raise ValueError("Could not find the item category table.")

    rows = extract_outer_elements(tables[0], "tr")
    tags: list[dict[str, object]] = []
    seen_ids: set[str] = set()

    for row in rows:
        cells = extract_outer_elements(row["innerHtml"], "td")
        for cell in cells:
            href = first_href(cell["innerHtml"])
            src = first_src(cell["innerHtml"])
            if not href or not src:
                continue

            slug = slug_from_path(href)
            if slug in seen_ids:
                continue
            seen_ids.add(slug)

            tags.append(
                {
                    "sourceOrder": len(tags) + 1,
                    "tagId": slug,
                    "slug": slug,
                    "name": clean_text(cell["innerHtml"]),
                    "detailUrl": absolute_url(BASE_URL, href),
                    "pictureUrl": absolute_url(BASE_URL, src),
                    "pictureFilename": Path(src).name,
                    "pictureAlt": first_alt(cell["innerHtml"]),
                    "isStandardCategory": True,
                }
            )

    return tags


def parse_sections(html: str) -> tuple[list[dict[str, object]], list[dict[str, object]], list[dict[str, object]]]:
    anchors: list[dict[str, object]] = []
    items: list[dict[str, object]] = []
    discovered_tags: dict[str, dict[str, object]] = {}
    global_item_order = 0

    for section_order, match in enumerate(SECTION_RE.finditer(html), start=1):
        source_anchor = match.group("anchor")
        anchor_id = normalize_anchor_id(source_anchor)
        anchor_name = clean_text(match.group("name"))
        anchors.append(
            {
                "sourceOrder": section_order,
                "anchorId": anchor_id,
                "sourceAnchor": source_anchor,
                "name": anchor_name,
                "sourceHeading": f"List of {anchor_name}",
            }
        )

        rows = extract_outer_elements(match.group("table"), "tr")
        for anchor_item_order, row in enumerate(rows[1:], start=1):
            cells = extract_outer_elements(row["innerHtml"], "td")
            if len(cells) < 5:
                continue

            global_item_order += 1
            item_record, tag_record = parse_item_row(
                cells=cells,
                anchor_id=anchor_id,
                source_order=global_item_order,
                anchor_item_order=anchor_item_order,
            )
            items.append(item_record)
            if tag_record:
                discovered_tags.setdefault(tag_record["tagId"], tag_record)

    return anchors, items, list(discovered_tags.values())


def parse_item_row(
    *,
    cells: list[dict[str, str]],
    anchor_id: str,
    source_order: int,
    anchor_item_order: int,
) -> tuple[dict[str, object], dict[str, object] | None]:
    picture_cell, name_cell, description_cell, tag_cell, locations_cell = cells[:5]

    detail_path = first_href(name_cell["innerHtml"]) or first_href(picture_cell["innerHtml"])
    image_path = first_src(picture_cell["innerHtml"])
    if not detail_path or not image_path:
        raise ValueError(f"Missing item detail or image for anchor {anchor_id} row {anchor_item_order}")

    item_name = clean_text(name_cell["innerHtml"])
    description_text, notes, is_registered = parse_description(description_cell["innerHtml"])
    tag_data = parse_tag_cell(tag_cell["innerHtml"])

    raw_location_lines = [clean_text(chunk) for chunk in split_br_chunks(locations_cell["innerHtml"])]
    availability = [entry for entry in (parse_availability_chunk(chunk) for chunk in split_br_chunks(locations_cell["innerHtml"])) if entry]

    item_record = {
        "sourceOrder": source_order,
        "sourceOrderInAnchor": anchor_item_order,
        "itemId": slug_from_path(detail_path),
        "slug": slug_from_path(detail_path),
        "name": item_name,
        "description": description_text,
        "anchorId": anchor_id,
        "tagId": tag_data["tagId"] if tag_data else None,
        "detailUrl": absolute_url(BASE_URL, detail_path),
        "pictureUrl": absolute_url(BASE_URL, image_path),
        "pictureFilename": Path(image_path).name,
        "pictureAlt": first_alt(picture_cell["innerHtml"]),
        "isRegisteredInCollection": is_registered,
        "notes": notes,
        "availability": availability,
        "rawLocationText": "; ".join(raw_location_lines),
    }

    return item_record, tag_data


def parse_description(description_html: str) -> tuple[str, list[str], bool]:
    lines = [line for line in clean_text_keep_breaks(description_html).split("\n") if line.strip()]
    description_lines: list[str] = []
    notes: list[str] = []

    for line in lines:
        if line.startswith("Note:"):
            notes.append(line.replace("Note:", "", 1).strip())
        else:
            description_lines.append(line.strip())

    is_registered = all("Not registered in collection" not in note for note in notes)
    return " ".join(description_lines).strip(), notes, is_registered


def parse_tag_cell(tag_html: str) -> dict[str, object] | None:
    href = first_href(tag_html)
    src = first_src(tag_html)
    name = clean_text(tag_html)
    if not href and not name:
        return None

    if href:
        slug = slug_from_path(href)
    elif name:
        slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    else:
        return None

    return {
        "tagId": slug,
        "slug": slug,
        "name": name or slug,
        "detailUrl": absolute_url(BASE_URL, href) if href else None,
        "pictureUrl": absolute_url(BASE_URL, src) if src else None,
        "pictureFilename": Path(src).name if src else None,
        "pictureAlt": first_alt(tag_html),
        "isStandardCategory": slug in {"decoration", "food", "relaxation", "road", "toy"},
    }


def parse_availability_chunk(chunk_html: str) -> dict[str, object] | None:
    raw_text = clean_text(chunk_html)
    if not raw_text:
        return None

    href = first_href(chunk_html)
    if href and "locations/" in href:
        location_slug = slug_from_path(href)
        method_match = LOCATION_METHOD_RE.match(raw_text)
        method = method_match.group("method") if method_match else None
        return {
            "kind": "location-drop",
            "locationId": location_id_from_slug(location_slug),
            "locationSlug": location_slug,
            "locationName": method_match.group("name") if method_match else raw_text,
            "method": method,
            "isPrimaryLocation": location_id_from_slug(location_slug) is not None,
            "rawText": raw_text,
        }

    if href and "dreamisland/" in href:
        dream_island_slug = slug_from_path(href)
        dream_match = DREAM_ISLAND_RE.match(raw_text)
        return {
            "kind": "dream-island-drop",
            "dreamIslandSlug": dream_island_slug,
            "dreamIslandName": dream_match.group("name") if dream_match else raw_text,
            "method": dream_match.group("method") if dream_match else None,
            "detailUrl": absolute_url(BASE_URL, href),
            "rawText": raw_text,
        }

    if href and (raw_text.startswith("Cook ") or raw_text == "Cook with ingredients"):
        return {
            "kind": "recipe-or-process",
            "detailUrl": absolute_url(BASE_URL, href),
            "rawText": raw_text,
        }

    if href:
        return {
            "kind": "reference-link",
            "detailUrl": absolute_url(BASE_URL, href),
            "text": raw_text,
            "rawText": raw_text,
        }

    shop_match = SHOP_UNLOCK_RE.match(raw_text)
    if shop_match:
        location_name = shop_match.group("location")
        return {
            "kind": "shop-unlock",
            "shopName": "Shop",
            "locationId": PRIMARY_LOCATION_NAMES.get(location_name),
            "locationName": location_name,
            "level": int(shop_match.group("level")),
            "rawText": raw_text,
        }

    specialty_match = SPECIALTY_ACTION_RE.search(raw_text)
    if specialty_match:
        specialty = specialty_match.group("specialty").strip().lower()
        return {
            "kind": "specialty-action",
            "specialtyName": clean_specialty_name(specialty),
            "rawText": raw_text,
        }

    if raw_text.startswith("Trade with "):
        return {
            "kind": "trade",
            "partner": raw_text.replace("Trade with ", "", 1).strip(),
            "rawText": raw_text,
        }

    if raw_text.startswith("Hold Y during Magnet Rise"):
        return {
            "kind": "interaction",
            "mechanic": "magnet-rise",
            "rawText": raw_text,
        }

    if raw_text.startswith("Smelt ") or raw_text.startswith("Mix ") or raw_text.startswith("Cook ") or raw_text.startswith("Crush "):
        return {
            "kind": "recipe-or-process",
            "rawText": raw_text,
        }

    if raw_text.startswith("Give "):
        return {
            "kind": "interaction",
            "rawText": raw_text,
        }

    if raw_text.startswith("Each game has "):
        return {
            "kind": "note",
            "rawText": raw_text,
        }

    if raw_text == "Dream Island":
        return {
            "kind": "dream-island-drop",
            "dreamIslandSlug": None,
            "dreamIslandName": "Dream Island",
            "method": None,
            "rawText": raw_text,
        }

    return {
        "kind": "free-text",
        "rawText": raw_text,
    }


def clean_specialty_name(value: str) -> str:
    words = [word.capitalize() for word in re.split(r"\s+", value) if word]
    return " ".join(words)


def merge_tags(standard_tags: list[dict[str, object]], discovered_tags: list[dict[str, object]]) -> list[dict[str, object]]:
    merged: dict[str, dict[str, object]] = {tag["tagId"]: dict(tag) for tag in standard_tags}

    for tag in discovered_tags:
        if tag["tagId"] in merged:
            continue
        merged[tag["tagId"]] = {
            "sourceOrder": len(merged) + 1,
            **tag,
        }

    return sorted(merged.values(), key=lambda tag: int(tag["sourceOrder"]))


if __name__ == "__main__":
    main()
