#!/usr/bin/env python3
"""Fetch and normalize the Serebii Pokemon Pokopia available Pokemon table."""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from html import unescape
from pathlib import Path
from typing import Any
from urllib.parse import urljoin
from urllib.request import Request, urlopen

SOURCE_URL = "https://www.serebii.net/pokemonpokopia/availablepokemon.shtml"
BASE_URL = "https://www.serebii.net/"
ROOT = Path(__file__).resolve().parent.parent
RAW_HTML_PATH = ROOT / "data" / "raw" / "pokemonpokopia" / "availablepokemon.html"
OUTPUT_JSON_PATH = ROOT / "data" / "json" / "pokemonpokopia" / "pokemon.json"

ROW_START_RE = re.compile(r'<td class="cen">#(?P<number>\d+)</td>')
POKEMON_CELL_RE = re.compile(
    r'<a href="(?P<detail>[^"]+)"><img src="(?P<image>[^"]+)"\s+alt="(?P<alt>[^"]+)"[^>]*></a>'
)
NAME_CELL_RE = re.compile(r'<a href="(?P<detail>[^"]+)"><u>(?P<name>.*?)</u></a>')
IMAGE_FILENAME_RE = re.compile(r"/(?P<id>\d+)(?:-(?P<form>[^/.]+))?\.png$")
SPECIALTY_RE = re.compile(
    r'<a href="(?P<detail>[^"]+)"><img src="(?P<icon>[^"]+)" alt="(?P<alt>[^"]*)"[^>]*></a></td>'
    r"<td><a href=\"[^\"]+\"><u>(?P<name>.*?)</u></a></td>"
)


@dataclass
class ParseResult:
    fetched_at: str
    pokemon: list[dict[str, Any]]


def main() -> None:
    html = fetch_html(SOURCE_URL)
    RAW_HTML_PATH.parent.mkdir(parents=True, exist_ok=True)
    RAW_HTML_PATH.write_text(html, encoding="utf-8")

    result = ParseResult(
        fetched_at=datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        pokemon=parse_rows(html.splitlines()),
    )

    duplicate_pokopia_numbers = find_duplicate_pokopia_numbers(result.pokemon)

    OUTPUT_JSON_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_JSON_PATH.write_text(
        json.dumps(
            {
                "source": {
                    "name": "Serebii",
                    "page": SOURCE_URL,
                    "fetchedAt": result.fetched_at,
                    "htmlSnapshotPath": path_relative_to_root(RAW_HTML_PATH),
                    "notes": [
                        "The table No. column is the Pokopia number, not the Pokemon ID.",
                        "pokemonId is derived from the Pokemon image filename.",
                        "Pokopia numbers are not unique in the source table, so sourceOrder is included as a stable row identifier.",
                    ],
                    "duplicatePokopiaNumbers": duplicate_pokopia_numbers,
                },
                "count": len(result.pokemon),
                "pokemon": result.pokemon,
            },
            indent=2,
            ensure_ascii=True,
        )
        + "\n",
        encoding="utf-8",
    )

    print(f"Saved {len(result.pokemon)} Pokemon to {OUTPUT_JSON_PATH}")


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


def parse_rows(lines: list[str]) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []

    for index, line in enumerate(lines):
        if line.strip() != "<tr>":
            continue
        if index + 5 >= len(lines):
            continue
        if 'class="cen">#' not in lines[index + 1]:
            continue

        row_lines = lines[index : index + 6]
        rows.append(parse_row(len(rows) + 1, row_lines))

    if not rows:
        raise ValueError("No Pokemon rows were parsed from the page.")

    return rows


def parse_row(source_order: int, row_lines: list[str]) -> dict[str, Any]:
    pokopia_line, pokemon_line, name_line, specialty_line = row_lines[1:5]

    pokopia_match = ROW_START_RE.search(pokopia_line)
    pokemon_match = POKEMON_CELL_RE.search(pokemon_line)
    name_match = NAME_CELL_RE.search(name_line)

    if not pokopia_match or not pokemon_match or not name_match:
        raise ValueError(f"Unable to parse row: {' '.join(row_lines)}")

    pokopia_number = int(pokopia_match.group("number"))
    detail_path = pokemon_match.group("detail")
    image_path = pokemon_match.group("image")
    parsed_image = parse_image_filename(image_path)

    if detail_path != name_match.group("detail"):
        raise ValueError(f"Mismatched Pokemon detail URLs for Pokopia #{pokopia_number}")

    name = clean_text(name_match.group("name"))

    return {
        "sourceOrder": source_order,
        "pokopiaNumber": pokopia_number,
        "pokopiaNumberDisplay": f"#{pokopia_number:03d}",
        "pokemonId": parsed_image["pokemonId"],
        "pokemonIdDisplay": f"{parsed_image['pokemonId']:03d}",
        "pokemonFormSlug": parsed_image["pokemonFormSlug"],
        "name": name,
        "slug": slug_from_path(detail_path),
        "detailUrl": absolute_url(detail_path),
        "imageUrl": absolute_url(image_path),
        "imageFilename": Path(image_path).name,
        "specialties": parse_specialties(specialty_line),
    }


def parse_image_filename(image_path: str) -> dict[str, Any]:
    match = IMAGE_FILENAME_RE.search(image_path)
    if not match:
        raise ValueError(f"Could not derive Pokemon ID from image path: {image_path}")

    return {
        "pokemonId": int(match.group("id")),
        "pokemonFormSlug": match.group("form"),
    }


def parse_specialties(line: str) -> list[dict[str, str | None]]:
    specialties: list[dict[str, str | None]] = []

    for match in SPECIALTY_RE.finditer(line):
        detail_path = match.group("detail")
        specialties.append(
            {
                "name": clean_text(match.group("name")),
                "slug": slug_from_path(detail_path),
                "detailUrl": absolute_url(detail_path),
                "iconUrl": absolute_url(match.group("icon")),
                "iconFilename": Path(match.group("icon")).name,
            }
        )

    if not specialties:
        raise ValueError(f"No specialties found in line: {line}")

    return specialties


def find_duplicate_pokopia_numbers(rows: list[dict[str, Any]]) -> list[str]:
    counts: dict[int, int] = {}
    for row in rows:
        counts[row["pokopiaNumber"]] = counts.get(row["pokopiaNumber"], 0) + 1

    return [f"#{number:03d}" for number, count in counts.items() if count > 1]


def slug_from_path(path: str) -> str:
    return Path(path).stem


def clean_text(value: str) -> str:
    return unescape(re.sub(r"<[^>]+>", "", value)).strip()


def absolute_url(path: str) -> str:
    return urljoin(BASE_URL, path)


def path_relative_to_root(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


if __name__ == "__main__":
    main()
