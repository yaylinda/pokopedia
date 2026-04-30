#!/usr/bin/env python3
"""Fetch and normalize Pokopia Pokemon ideal habitats and favorites."""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any
from urllib.error import HTTPError

from pokopia_common import (
    ROOT,
    absolute_url,
    clean_text,
    extract_outer_elements,
    fetch_html,
    first_alt,
    first_href,
    first_src,
    path_relative_to_root,
    slug_from_path,
    utc_now,
    write_json,
)

POKEMON_INPUT_PATH = ROOT / "data" / "json" / "pokemonpokopia" / "pokemon.json"
ITEMS_INPUT_PATH = ROOT / "data" / "json" / "pokemonpokopia" / "items.json"
RAW_POKEDEX_DIR = ROOT / "data" / "raw" / "pokemonpokopia" / "pokedex"
RAW_FAVORITES_DIR = ROOT / "data" / "raw" / "pokemonpokopia" / "favorites"
RAW_FLAVORS_PATH = ROOT / "data" / "raw" / "pokemonpokopia" / "flavors.html"
POKEMON_PREFERENCES_OUTPUT_PATH = ROOT / "data" / "json" / "pokemonpokopia" / "pokemon-preferences.json"
IDEAL_HABITATS_OUTPUT_PATH = ROOT / "data" / "json" / "pokemonpokopia" / "ideal-habitats.json"
FAVORITE_CATEGORIES_OUTPUT_PATH = ROOT / "data" / "json" / "pokemonpokopia" / "favorite-categories.json"

BASE_URL = "https://www.serebii.net/pokemonpokopia/"
FLAVORS_URL = "https://www.serebii.net/pokemonpokopia/flavors.shtml"
FAVORITE_PATH_PREFIX = "/pokemonpokopia/favorites/"
FLAVOR_ANCHORS = {
    "bitter-flavors": "bitter",
    "dry-flavors": "dry",
    "sour-flavors": "sour",
    "spicy-flavors": "spicy",
    "sweet-flavors": "sweet",
}


def main() -> None:
    pokemon = json.loads(POKEMON_INPUT_PATH.read_text(encoding="utf-8"))["pokemon"]
    items = json.loads(ITEMS_INPUT_PATH.read_text(encoding="utf-8"))["items"]
    items_by_detail = {item["detailUrl"]: item for item in items}
    items_by_name = build_unique_lookup(items, "name")

    RAW_POKEDEX_DIR.mkdir(parents=True, exist_ok=True)
    RAW_FAVORITES_DIR.mkdir(parents=True, exist_ok=True)

    preferences: list[dict[str, Any]] = []
    ideal_habitats_by_id: dict[str, dict[str, Any]] = {}
    favorite_categories_by_id: dict[str, dict[str, Any]] = {}

    for pokemon_entry in pokemon:
        html = fetch_html(pokemon_entry["detailUrl"])
        raw_path = RAW_POKEDEX_DIR / f"{pokemon_entry['slug']}.html"
        raw_path.write_text(html, encoding="utf-8")

        ideal_habitat, favorites = parse_preferences_table(html)
        if ideal_habitat:
            ideal_habitats_by_id.setdefault(
                ideal_habitat["idealHabitatId"],
                {
                    "sourceOrder": len(ideal_habitats_by_id) + 1,
                    **ideal_habitat,
                },
            )

        for favorite in favorites:
            favorite_categories_by_id.setdefault(
                favorite["favoriteId"],
                {
                    "sourceOrder": len(favorite_categories_by_id) + 1,
                    **favorite,
                },
            )

        preferences.append(
            {
                "sourceOrder": pokemon_entry["sourceOrder"],
                "pokemonSlug": pokemon_entry["slug"],
                "pokemonId": pokemon_entry["pokemonId"],
                "pokemonIdDisplay": pokemon_entry["pokemonIdDisplay"],
                "pokemonName": pokemon_entry["name"],
                "pokemonDetailUrl": pokemon_entry["detailUrl"],
                "rawHtmlPath": path_relative_to_root(raw_path),
                "idealHabitat": ideal_habitat,
                "favorites": favorites,
            }
        )

    favorite_categories = [
        hydrate_favorite_category(
            category,
            items_by_detail=items_by_detail,
            items_by_name=items_by_name,
        )
        for category in favorite_categories_by_id.values()
    ]

    fetched_at = utc_now()
    common_source = {
        "name": "Serebii",
        "page": "https://www.serebii.net/pokemonpokopia/availablepokemon.shtml",
        "fetchedAt": fetched_at,
        "rawPokedexHtmlDirectory": path_relative_to_root(RAW_POKEDEX_DIR),
        "notes": [
            "Pokemon preference data is parsed from each Pokemon detail page's Stats table.",
            "Favorite item lists are parsed from linked favorite pages and the shared flavors page.",
        ],
    }

    ideal_habitats = sorted(
        summarize_ideal_habitats(ideal_habitats_by_id.values(), preferences),
        key=lambda habitat: int(habitat["sourceOrder"]),
    )

    write_json(
        IDEAL_HABITATS_OUTPUT_PATH,
        {
            "source": common_source,
            "count": len(ideal_habitats),
            "idealHabitats": ideal_habitats,
        },
    )
    write_json(
        FAVORITE_CATEGORIES_OUTPUT_PATH,
        {
            "source": {
                **common_source,
                "rawFavoritesHtmlDirectory": path_relative_to_root(RAW_FAVORITES_DIR),
                "rawFlavorsHtmlPath": path_relative_to_root(RAW_FLAVORS_PATH),
            },
            "count": len(favorite_categories),
            "favoriteCategories": sorted(
                favorite_categories,
                key=lambda favorite: int(favorite["sourceOrder"]),
            ),
        },
    )
    write_json(
        POKEMON_PREFERENCES_OUTPUT_PATH,
        {
            "source": common_source,
            "count": len(preferences),
            "pokemon": preferences,
        },
    )

    print(f"Saved {len(ideal_habitats)} ideal habitats to {IDEAL_HABITATS_OUTPUT_PATH}")
    print(f"Saved {len(favorite_categories)} favorite categories to {FAVORITE_CATEGORIES_OUTPUT_PATH}")
    print(f"Saved preferences for {len(preferences)} Pokemon to {POKEMON_PREFERENCES_OUTPUT_PATH}")


def build_unique_lookup(records: list[dict[str, Any]], key: str) -> dict[str, dict[str, Any]]:
    grouped: dict[str, list[dict[str, Any]]] = {}
    for record in records:
        value = str(record[key]).strip().lower()
        grouped.setdefault(value, []).append(record)
    return {value: matches[0] for value, matches in grouped.items() if len(matches) == 1}


def parse_preferences_table(html: str) -> tuple[dict[str, Any] | None, list[dict[str, Any]]]:
    table_html = stats_table_html(html)
    match = re.search(
        r'<td class="foo">Favorites</td>\s*</tr>\s*<tr>.*?'
        r'<td class="cen" valign="top"><a href="(?P<habitat_href>/pokemonpokopia/pokedex/idealhabitat/[^"]+)">'
        r"\s*<u>(?P<habitat_name>.*?)</u>\s*</a></td>\s*"
        r'<td class="cen" valign="top">\s*(?P<favorites>.*?)</td>',
        table_html,
        re.DOTALL,
    )
    if not match:
        raise ValueError("Could not find the Stats data row.")

    ideal_habitat = parse_ideal_habitat_link(
        href=match.group("habitat_href"),
        name_html=match.group("habitat_name"),
    )
    favorites = parse_favorites(match.group("favorites"))
    return ideal_habitat, favorites


def stats_table_html(html: str) -> str:
    for table in extract_outer_elements(html, "table"):
        table_text = clean_text(table["innerHtml"])
        if "Stats" in table_text and "Ideal Habitat" in table_text and "Favorites" in table_text:
            return table["innerHtml"]
    raise ValueError("Could not find the Stats table.")


def parse_ideal_habitat_link(*, href: str | None, name_html: str) -> dict[str, Any] | None:
    name = clean_text(name_html)
    if not name:
        return None

    slug = slug_from_path(href) if href else slugify_name(name)
    return {
        "idealHabitatId": slug,
        "slug": slug,
        "name": name,
        "detailUrl": absolute_url(BASE_URL, href) if href else None,
    }


def parse_favorites(cell_html: str) -> list[dict[str, Any]]:
    favorites: list[dict[str, Any]] = []
    seen_ids: set[str] = set()

    for source_order, match in enumerate(re.finditer(r'<a href="([^"]+)">\s*<u>(.*?)</u>\s*</a>', cell_html, re.DOTALL), start=1):
        href = match.group(1)
        name = clean_text(match.group(2))
        if not name:
            continue
        favorite_id = favorite_id_from_link(name=name, href=href)
        if favorite_id in seen_ids:
            continue
        seen_ids.add(favorite_id)

        detail_url = absolute_url(BASE_URL, href)
        if favorite_id in FLAVOR_ANCHORS:
            detail_url = f"{FLAVORS_URL}#{FLAVOR_ANCHORS[favorite_id]}"

        favorites.append(
            {
                "sourceOrder": source_order,
                "favoriteId": favorite_id,
                "slug": favorite_id,
                "name": name,
                "kind": favorite_kind(name=name, href=href),
                "detailUrl": detail_url,
                "sourceHref": href,
            }
        )

    return favorites


def favorite_id_from_link(*, name: str, href: str) -> str:
    if href.startswith(FAVORITE_PATH_PREFIX):
        return slug_from_path(href)
    return slugify_name(name)


def favorite_kind(*, name: str, href: str) -> str:
    if name == "None":
        return "none"
    if href.startswith(FAVORITE_PATH_PREFIX):
        return "favorite-category"
    if href.endswith("/flavors.shtml") or href.endswith("flavors.shtml") or "/pokedex/flavor/" in href:
        return "flavor"
    return "reference-link"


def hydrate_favorite_category(
    category: dict[str, Any],
    *,
    items_by_detail: dict[str, dict[str, Any]],
    items_by_name: dict[str, dict[str, Any]],
) -> dict[str, Any]:
    source_page_url = FLAVORS_URL if category["kind"] == "flavor" else category["detailUrl"]

    if category["kind"] == "flavor":
        html = fetch_html(FLAVORS_URL)
        RAW_FLAVORS_PATH.write_text(html, encoding="utf-8")
        items = parse_flavor_items(
            html=html,
            favorite_id=category["favoriteId"],
            items_by_name=items_by_name,
        )
        raw_html_path = path_relative_to_root(RAW_FLAVORS_PATH)
        source_anchor = FLAVOR_ANCHORS.get(category["favoriteId"])
        fetch_status = 200
        fetch_error = None
    elif category["kind"] == "favorite-category":
        raw_path = RAW_FAVORITES_DIR / f"{category['favoriteId']}.html"
        try:
            html = fetch_html(category["detailUrl"])
            raw_path.write_text(html, encoding="utf-8")
            items = parse_favorite_items(
                html=html,
                items_by_detail=items_by_detail,
                items_by_name=items_by_name,
            )
            raw_html_path = path_relative_to_root(raw_path)
            fetch_status = 200
            fetch_error = None
        except HTTPError as error:
            items = []
            raw_html_path = None
            fetch_status = error.code
            fetch_error = f"HTTP {error.code}: {error.reason}"
        source_anchor = "items"
    else:
        items = []
        raw_html_path = None
        source_anchor = None
        fetch_status = None
        fetch_error = None

    return {
        **category,
        "sourcePageUrl": source_page_url,
        "sourceAnchor": source_anchor,
        "rawHtmlPath": raw_html_path,
        "fetchStatus": fetch_status,
        "fetchError": fetch_error,
        "itemCount": len(items),
        "items": items,
    }


def parse_favorite_items(
    *,
    html: str,
    items_by_detail: dict[str, dict[str, Any]],
    items_by_name: dict[str, dict[str, Any]],
) -> list[dict[str, Any]]:
    table_html = favorite_items_table_html(html)
    rows = extract_outer_elements(table_html, "tr")
    items: list[dict[str, Any]] = []

    for row in rows[1:]:
        cells = extract_outer_elements(row["innerHtml"], "td")
        if len(cells) < 4:
            continue
        items.append(
            parse_item_reference(
                source_order=len(items) + 1,
                picture_cell_html=cells[0]["innerHtml"],
                name_cell_html=cells[1]["innerHtml"],
                description_cell_html=cells[2]["innerHtml"],
                category_cell_html=cells[3]["innerHtml"],
                items_by_detail=items_by_detail,
                items_by_name=items_by_name,
            )
        )

    return items


def favorite_items_table_html(html: str) -> str:
    for table in extract_outer_elements(html, "table"):
        rows = extract_outer_elements(table["innerHtml"], "tr")
        if not rows:
            continue
        headers = [clean_text(cell["innerHtml"]) for cell in extract_outer_elements(rows[0]["innerHtml"], "td")]
        if headers[:4] == ["Picture", "Name", "Description", "Category"]:
            return table["innerHtml"]
    raise ValueError("Could not find favorite item table.")


def parse_flavor_items(
    *,
    html: str,
    favorite_id: str,
    items_by_name: dict[str, dict[str, Any]],
) -> list[dict[str, Any]]:
    anchor = FLAVOR_ANCHORS.get(favorite_id)
    if not anchor:
        return []

    table_html = flavor_items_table_html(html)
    rows = extract_outer_elements(table_html, "tr")
    items: list[dict[str, Any]] = []
    is_active_section = False

    for row in rows[1:]:
        cells = extract_outer_elements(row["innerHtml"], "td")
        if not cells:
            continue

        first_cell_html = cells[0]["innerHtml"]
        if len(cells) == 1:
            anchor_match = re.search(r'<a name="([^"]+)"></a>', first_cell_html)
            is_active_section = bool(anchor_match and anchor_match.group(1) == anchor)
            continue

        if not is_active_section or len(cells) < 3:
            continue

        item_name = clean_text(cells[1]["innerHtml"])
        matched_item = items_by_name.get(item_name.lower())
        image_path = first_src(cells[0]["innerHtml"])

        items.append(
            {
                "sourceOrder": len(items) + 1,
                "itemId": matched_item["itemId"] if matched_item else slugify_name(item_name),
                "itemSlug": matched_item["slug"] if matched_item else slugify_name(item_name),
                "itemName": item_name,
                "detailUrl": matched_item["detailUrl"] if matched_item else None,
                "pictureUrl": matched_item["pictureUrl"] if matched_item else absolute_url(BASE_URL, image_path) if image_path else None,
                "pictureFilename": matched_item["pictureFilename"] if matched_item else Path(image_path).name if image_path else None,
                "pictureAlt": first_alt(cells[0]["innerHtml"]),
                "description": clean_text(cells[2]["innerHtml"]),
                "tagId": matched_item["tagId"] if matched_item else None,
                "isCatalogLinked": matched_item is not None,
                "catalogMatchType": "name-match" if matched_item else "unmatched",
            }
        )

    return items


def flavor_items_table_html(html: str) -> str:
    for table in extract_outer_elements(html, "table"):
        table_text = clean_text(table["innerHtml"])
        if "List of Food and their Flavors" in table_text or "No Flavor" in table_text and "Sweet" in table_text:
            rows = extract_outer_elements(table["innerHtml"], "tr")
            if rows and [clean_text(cell["innerHtml"]) for cell in extract_outer_elements(rows[0]["innerHtml"], "td")][:3] == [
                "Picture",
                "Name",
                "Description",
            ]:
                return table["innerHtml"]
    raise ValueError("Could not find flavors item table.")


def parse_item_reference(
    *,
    source_order: int,
    picture_cell_html: str,
    name_cell_html: str,
    description_cell_html: str,
    category_cell_html: str,
    items_by_detail: dict[str, dict[str, Any]],
    items_by_name: dict[str, dict[str, Any]],
) -> dict[str, Any]:
    detail_path = first_href(name_cell_html) or first_href(picture_cell_html)
    detail_url = absolute_url(BASE_URL, detail_path) if detail_path else None
    item_name = clean_text(name_cell_html)
    matched_item = items_by_detail.get(detail_url) if detail_url else None
    catalog_match_type = "source-link" if matched_item else "unmatched"

    if matched_item is None and item_name.lower() in items_by_name:
        matched_item = items_by_name[item_name.lower()]
        catalog_match_type = "name-match"

    image_path = first_src(picture_cell_html)
    tag_href = first_href(category_cell_html)
    tag_id = slug_from_path(tag_href) if tag_href else (matched_item["tagId"] if matched_item else None)

    return {
        "sourceOrder": source_order,
        "itemId": matched_item["itemId"] if matched_item else slug_from_path(detail_path) if detail_path else slugify_name(item_name),
        "itemSlug": matched_item["slug"] if matched_item else slug_from_path(detail_path) if detail_path else slugify_name(item_name),
        "itemName": item_name,
        "detailUrl": matched_item["detailUrl"] if matched_item else detail_url,
        "sourceDetailUrl": detail_url,
        "pictureUrl": matched_item["pictureUrl"] if matched_item else absolute_url(BASE_URL, image_path) if image_path else None,
        "pictureFilename": matched_item["pictureFilename"] if matched_item else Path(image_path).name if image_path else None,
        "pictureAlt": first_alt(picture_cell_html),
        "description": clean_text(description_cell_html),
        "tagId": tag_id,
        "categoryName": clean_text(category_cell_html) or None,
        "isCatalogLinked": matched_item is not None,
        "catalogMatchType": catalog_match_type,
    }


def summarize_ideal_habitats(
    ideal_habitats: list[dict[str, Any]] | Any,
    preferences: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    pokemon_counts: dict[str, int] = {}
    for preference in preferences:
        habitat = preference["idealHabitat"]
        if habitat:
            pokemon_counts[habitat["idealHabitatId"]] = pokemon_counts.get(habitat["idealHabitatId"], 0) + 1

    return [
        {
            **habitat,
            "pokemonCount": pokemon_counts.get(habitat["idealHabitatId"], 0),
        }
        for habitat in ideal_habitats
    ]


def slugify_name(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


if __name__ == "__main__":
    main()
