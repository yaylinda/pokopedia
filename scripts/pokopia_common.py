#!/usr/bin/env python3
"""Shared helpers for Pokopia data scrapers."""

from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from html import unescape
from pathlib import Path
from typing import Any
from urllib.parse import urljoin
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent.parent
USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0 Safari/537.36"
)
TAG_RE = re.compile(r"<(?P<closing>/)?(?P<tag>[a-zA-Z0-9]+)\b(?P<attrs>[^>]*)>")
HREF_RE = re.compile(r'href="([^"]+)"')
SRC_RE = re.compile(r'src="([^"]+)"')
ALT_RE = re.compile(r'alt="([^"]*)"')
TD_SPLIT_RE = re.compile(r"<br\s*/?>", re.IGNORECASE)

PRIMARY_LOCATION_IDS = {
    "witheredwastelands": "withered-wastelands",
    "bleakbeach": "bleak-beach",
    "rockyridges": "rocky-ridges",
    "sparklingskylands": "sparkling-skylands",
    "palettetown": "palette-town",
}


def fetch_html(url: str) -> str:
    request = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(request) as response:
        return response.read().decode("utf-8", errors="replace")


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")


def clean_text(value: str) -> str:
    value = re.sub(r"<[^>]+>", "", value)
    value = re.sub(r"\s+", " ", value)
    return unescape(value).strip()


def clean_text_keep_breaks(value: str) -> str:
    value = re.sub(r"<br\s*/?>", "\n", value, flags=re.IGNORECASE)
    value = re.sub(r"<[^>]+>", "", value)
    value = re.sub(r"[ \t]+", " ", value)
    value = re.sub(r"\n+", "\n", value)
    return unescape(value).strip()


def absolute_url(base_url: str, path: str) -> str:
    return urljoin(base_url, path)


def path_relative_to_root(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def slug_from_path(path: str) -> str:
    return Path(path).stem


def normalize_anchor_id(source_anchor: str) -> str:
    source_anchor = source_anchor.lower()
    source_anchor = source_anchor.replace("(l)", "-l")
    source_anchor = source_anchor.replace("(s)", "-s")
    source_anchor = source_anchor.replace(".", "")
    source_anchor = source_anchor.replace("(", "-")
    source_anchor = source_anchor.replace(")", "")
    source_anchor = source_anchor.replace(" ", "-")
    if source_anchor == "keyitems":
        return "key-items"
    return source_anchor


def location_id_from_slug(location_slug: str) -> str | None:
    return PRIMARY_LOCATION_IDS.get(location_slug)


def extract_outer_elements(html: str, tag: str) -> list[dict[str, str]]:
    elements: list[dict[str, str]] = []
    depth = 0
    start_index: int | None = None
    attrs_raw = ""
    wanted_tag = tag.lower()

    for match in TAG_RE.finditer(html):
        tag_name = match.group("tag").lower()
        if tag_name != wanted_tag:
            continue

        if not match.group("closing"):
            if depth == 0:
                start_index = match.end()
                attrs_raw = match.group("attrs")
            depth += 1
            continue

        if depth == 0:
            continue

        depth -= 1
        if depth == 0 and start_index is not None:
            elements.append(
                {
                    "attrsRaw": attrs_raw,
                    "innerHtml": html[start_index : match.start()],
                }
            )
            start_index = None
            attrs_raw = ""

    return elements


def first_href(html: str) -> str | None:
    match = HREF_RE.search(html)
    return match.group(1) if match else None


def first_src(html: str) -> str | None:
    match = SRC_RE.search(html)
    return match.group(1) if match else None


def first_alt(html: str) -> str | None:
    match = ALT_RE.search(html)
    return clean_text(match.group(1)) if match else None


def split_br_chunks(html: str) -> list[str]:
    return [chunk for chunk in TD_SPLIT_RE.split(html) if clean_text(chunk)]
