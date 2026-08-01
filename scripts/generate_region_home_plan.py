#!/usr/bin/env python3
"""Generate a deterministic five-region and house plan for the Pokopia roster."""

from __future__ import annotations

import argparse
import json
from collections import Counter
from datetime import date
from itertools import combinations
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_OUTPUT = ROOT / "data" / "region-home-plan.json"
DEFAULT_REPORT = ROOT / "docs" / "region-home-plan.md"

REGION_ORDER = [
    "withered-wastelands",
    "bleak-beach",
    "rocky-ridges",
    "sparkling-skylands",
    "palette-town",
]

REGIONS: dict[str, dict[str, Any]] = {
    "withered-wastelands": {
        "name": "Withered Wastelands",
        "code": "WIT",
        "target": 62,
        "identity": "restored grassland, gardens, caves, and coast around old Fuchsia City",
        "habitatFit": {"bright": 8, "warm": 8, "humid": 6, "dry": 10, "dark": 6, "cool": 3},
        "favorites": {
            "lotsofnature": 4, "lotsofdirt": 3, "woodenstuff": 3,
            "prettyflowers": 2, "healing": 2, "watchingstuff": 1,
            "groupactivities": 1, "gatherings": 1, "lotsofwater": 1,
            "softstuff": 1, "garbage": 1,
        },
        "specialties": {
            "grow": 5, "water": 4, "chop": 4, "gather": 3,
            "yawn": 6, "search": 2, "litter": 1,
        },
        "sourceUrl": "https://www.serebii.net/pokemonpokopia/locations/witheredwastelands.shtml",
    },
    "bleak-beach": {
        "name": "Bleak Beach",
        "code": "BLE",
        "target": 62,
        "identity": "dark seashore, wetlands, palms, sea glass, and the old SS Anne",
        "habitatFit": {"bright": 4, "warm": 5, "humid": 10, "dry": 4, "dark": 10, "cool": 6},
        "favorites": {
            "oceanvibes": 5, "lotsofwater": 4, "nicebreezes": 3,
            "cleanliness": 2, "glassstuff": 2, "cutestuff": 1,
            "playspaces": 1, "colorfulstuff": 1, "shinystuff": 1,
            "softstuff": 1, "roundstuff": 1, "garbage": 1,
        },
        "specialties": {
            "water": 5, "illuminate": 7, "generate": 3, "recycle": 3,
            "gatherhoney": 2, "search": 2, "litter": 1,
        },
        "sourceUrl": "https://www.serebii.net/pokemonpokopia/locations/bleakbeach.shtml",
    },
    "rocky-ridges": {
        "name": "Rocky Ridges",
        "code": "ROC",
        "target": 61,
        "identity": "mountains, mines, caves, ore, fossils, and volcanic terrain around Pewter and Mt. Moon",
        "habitatFit": {"bright": 5, "warm": 8, "humid": 3, "dry": 10, "dark": 9, "cool": 9},
        "favorites": {
            "stonestuff": 5, "metalstuff": 4, "hardstuff": 3,
            "construction": 4, "exercise": 2, "sharpstuff": 3,
            "lotsofdirt": 2, "spookystuff": 1, "strangestuff": 1,
            "slenderobjects": 1, "blockystuff": 2,
        },
        "specialties": {
            "crush": 5, "burn": 3, "build": 4, "bulldoze": 6,
            "rarify": 6, "search": 3, "explode": 5, "gather": 1,
            "litter": 1,
        },
        "sourceUrl": "https://www.serebii.net/pokemonpokopia/locations/rockyridges.shtml",
    },
    "sparkling-skylands": {
        "name": "Sparkling Skylands",
        "code": "SKY",
        "target": 61,
        "identity": "high, windy sky islands with the urban and technological ruins of Celadon and Saffron",
        "habitatFit": {"bright": 10, "warm": 6, "humid": 5, "dry": 4, "dark": 3, "cool": 10},
        "favorites": {
            "nicebreezes": 5, "electronics": 5, "glassstuff": 3,
            "shinystuff": 3, "complicatedstuff": 3, "luxury": 2,
            "rides": 3, "noisystuff": 2, "lettersandwords": 2,
            "colorfulstuff": 2, "watchingstuff": 1, "metalstuff": 1,
        },
        "specialties": {
            "fly": 6, "generate": 5, "teleport": 5, "engineer": 7,
            "build": 2, "recycle": 2, "dj": 3, "hype": 2,
            "trade": 1, "litter": 1,
        },
        "sourceUrl": "https://www.serebii.net/pokemonpokopia/locations/sparklingskylands.shtml",
    },
    "palette-town": {
        "name": "Palette Town",
        "code": "PAL",
        "target": 62,
        "identity": "adaptable free-build and multiplayer islands with materials for nearly every biome",
        "habitatFit": {"bright": 7, "warm": 7, "humid": 7, "dry": 7, "dark": 7, "cool": 7},
        "favorites": {
            "groupactivities": 4, "gatherings": 4, "playspaces": 3,
            "cutestuff": 2, "fabric": 2, "containers": 2,
            "lookslikefood": 2, "lettersandwords": 1, "roundstuff": 1,
            "wobblystuff": 2, "spinningstuff": 2, "symbols": 2,
            "colorfulstuff": 1,
        },
        "specialties": {
            "paint": 7, "party": 7, "trade": 4, "collect": 5,
            "storage": 5, "transform": 7, "eat": 5, "dreamisland": 5,
            "hype": 3, "appraise": 3, "gather": 2, "litter": 1,
            "???": 1,
        },
        "sourceUrl": "https://www.serebii.net/pokemonpokopia/locations/palettetown.shtml",
    },
}

# Tangrowth is a story anchor in the opening area rather than a habitat spawn.
STORY_ANCHORS = {"professortangrowth": "withered-wastelands"}
REGION_COHESION_WEIGHT = 0.25

COMPLEMENTARY_SPECIALTIES = {
    frozenset(pair)
    for pair in [
        ("grow", "water"),
        ("build", "bulldoze"),
        ("build", "crush"),
        ("burn", "recycle"),
        ("generate", "illuminate"),
        ("fly", "teleport"),
        ("gather", "storage"),
        ("trade", "collect"),
        ("dj", "hype"),
        ("party", "hype"),
    ]
}


def load_json(path: Path) -> dict[str, Any]:
    with path.open(encoding="utf-8") as handle:
        return json.load(handle)


def build_profiles() -> list[dict[str, Any]]:
    pokemon = load_json(ROOT / "data" / "pokemon.json")["pokemon"]
    items = {
        entry["itemId"]: {"id": entry["itemId"], "name": entry["name"]}
        for entry in load_json(ROOT / "data" / "items.json")["items"]
    }
    preferences = {
        entry["pokemonSlug"]: entry
        for entry in load_json(ROOT / "data" / "pokemon-preferences.json")["pokemon"]
    }
    spawn_groups = load_json(ROOT / "data" / "habitat-spawns.json")["habitats"]
    habitat_locations: dict[str, set[str]] = {}
    for group in spawn_groups:
        for spawn in group["spawns"]:
            habitat_locations.setdefault(spawn["pokemonSlug"], set()).update(spawn["locations"])

    litter_items = load_json(ROOT / "data" / "pokemon-litter-items.json")["pokemon"]
    litter_by_slug = {slug: items[item_id] for slug, item_id in litter_items.items()}

    profiles = []
    for entry in pokemon:
        preference = preferences.get(entry["slug"], {})
        favorites = [
            favorite
            for favorite in preference.get("favorites", [])
            if favorite["kind"] != "none"
        ]
        profiles.append(
            {
                "sourceOrder": entry["sourceOrder"],
                "pokopiaNumber": entry["pokopiaNumber"],
                "pokopiaNumberDisplay": entry["pokopiaNumberDisplay"],
                "pokemonId": entry["pokemonId"],
                "pokemonIdDisplay": entry["pokemonIdDisplay"],
                "name": entry["name"],
                "slug": entry["slug"],
                "imageUrl": entry["imageUrl"],
                "detailUrl": entry["detailUrl"],
                "idealHabitat": preference.get("idealHabitat"),
                "favorites": favorites,
                "specialties": entry["specialties"],
                "availableHabitatLocations": sorted(habitat_locations.get(entry["slug"], set())),
                "litterItem": litter_by_slug.get(entry["slug"]),
            }
        )
    return profiles


def region_score(profile: dict[str, Any], region_id: str) -> tuple[float, dict[str, Any]]:
    region = REGIONS[region_id]
    habitat_id = profile.get("idealHabitat", {}).get("idealHabitatId")
    habitat_points = region["habitatFit"].get(habitat_id, 5) * 4

    favorite_matches = []
    favorite_points = 0.0
    for favorite in profile["favorites"]:
        weight = region["favorites"].get(favorite["favoriteId"], 0)
        if weight:
            favorite_points += weight * 1.5
            favorite_matches.append({"id": favorite["favoriteId"], "name": favorite["name"], "weight": weight})

    specialty_matches = []
    specialty_points = 0.0
    for specialty in profile["specialties"]:
        weight = region["specialties"].get(specialty["slug"], 0)
        if weight:
            specialty_points += weight * 2
            specialty_matches.append({"slug": specialty["slug"], "name": specialty["name"], "weight": weight})

    availability_points = 0.0
    locations = profile["availableHabitatLocations"]
    if locations and len(locations) < len(REGION_ORDER) and region_id in locations:
        availability_points = 12 if len(locations) == 1 else 6

    components = {
        "idealHabitat": round(habitat_points, 1),
        "favoriteItems": round(favorite_points, 1),
        "specialties": round(specialty_points, 1),
        "habitatAvailability": round(availability_points, 1),
    }
    return round(sum(components.values()), 1), {
        "components": components,
        "favoriteMatches": sorted(favorite_matches, key=lambda item: (-item["weight"], item["name"])),
        "specialtyMatches": sorted(specialty_matches, key=lambda item: (-item["weight"], item["name"])),
    }


def hard_region(profile: dict[str, Any]) -> str | None:
    return STORY_ANCHORS.get(profile["slug"])


def assign_regions(profiles: list[dict[str, Any]]) -> dict[str, list[dict[str, Any]]]:
    scores = {
        profile["slug"]: {
            region_id: region_score(profile, region_id)
            for region_id in REGION_ORDER
        }
        for profile in profiles
    }
    pair_scores: dict[tuple[str, str], float] = {}
    for left, right in combinations(profiles, 2):
        key = tuple(sorted((left["slug"], right["slug"])))
        pair_scores[key] = pair_score(left, right)

    def cached_pair_score(left: dict[str, Any], right: dict[str, Any]) -> float:
        if left["slug"] == right["slug"]:
            return 0.0
        return pair_scores[tuple(sorted((left["slug"], right["slug"])))]

    assigned: dict[str, list[dict[str, Any]]] = {region_id: [] for region_id in REGION_ORDER}
    unassigned = []

    for profile in profiles:
        fixed = hard_region(profile)
        if fixed:
            profile["assignmentKind"] = "story-anchor"
            profile["assignedRegion"] = fixed
            assigned[fixed].append(profile)
        else:
            ranked = sorted(
                ((result[0], region_id) for region_id, result in scores[profile["slug"]].items()),
                reverse=True,
            )
            unassigned.append((ranked[0][0] - ranked[1][0], profile))

    remaining = {
        region_id: REGIONS[region_id]["target"] - len(assigned[region_id])
        for region_id in REGION_ORDER
    }
    if sum(remaining.values()) != len(unassigned) or min(remaining.values()) < 0:
        raise ValueError("Region targets cannot accommodate hard assignments")

    for _, profile in sorted(unassigned, key=lambda item: (-item[0], item[1]["sourceOrder"])):
        choices = [region_id for region_id in REGION_ORDER if remaining[region_id] > 0]
        selected = max(
            choices,
            key=lambda region_id: (scores[profile["slug"]][region_id][0], remaining[region_id], -REGION_ORDER.index(region_id)),
        )
        profile["assignmentKind"] = "scored-fit"
        profile["assignedRegion"] = selected
        assigned[selected].append(profile)
        remaining[selected] -= 1

    # Swap freely assigned residents when doing so improves regional fit plus a
    # smaller within-region compatibility term. This keeps likely housemates
    # together without allowing home packing to override the biome decision.
    for _ in range(100):
        best_delta = 0.0
        best_swap = None
        neighbors_by_slug_region = {
            profile["slug"]: {
                region_id: sorted(
                    (
                        (cached_pair_score(profile, neighbor), neighbor["slug"])
                        for neighbor in assigned[region_id]
                        if neighbor["slug"] != profile["slug"]
                    ),
                    reverse=True,
                )
                for region_id in REGION_ORDER
            }
            for profile in profiles
        }

        def nearest_neighbor_quality(
            profile: dict[str, Any], region_id: str, excluded_slug: str | None = None
        ) -> float:
            eligible_scores = [
                score
                for score, neighbor_slug in neighbors_by_slug_region[profile["slug"]][region_id]
                if neighbor_slug != excluded_slug
            ]
            return sum(eligible_scores[:3])

        for left_index, left_region in enumerate(REGION_ORDER):
            for right_region in REGION_ORDER[left_index + 1 :]:
                left_profiles = [p for p in assigned[left_region] if p["assignmentKind"] == "scored-fit"]
                right_profiles = [p for p in assigned[right_region] if p["assignmentKind"] == "scored-fit"]
                for left in left_profiles:
                    for right in right_profiles:
                        current = scores[left["slug"]][left_region][0] + scores[right["slug"]][right_region][0]
                        swapped = scores[left["slug"]][right_region][0] + scores[right["slug"]][left_region][0]
                        left_cohesion_delta = (
                            nearest_neighbor_quality(right, left_region, left["slug"])
                            - nearest_neighbor_quality(left, left_region)
                        )
                        right_cohesion_delta = (
                            nearest_neighbor_quality(left, right_region, right["slug"])
                            - nearest_neighbor_quality(right, right_region)
                        )
                        delta = swapped - current + REGION_COHESION_WEIGHT * (
                            left_cohesion_delta + right_cohesion_delta
                        )
                        if delta > best_delta + 1e-9:
                            best_delta = delta
                            best_swap = (left_region, right_region, left, right)
        if not best_swap:
            break
        left_region, right_region, left, right = best_swap
        assigned[left_region].remove(left)
        assigned[right_region].remove(right)
        assigned[left_region].append(right)
        assigned[right_region].append(left)
        right["assignedRegion"] = left_region
        left["assignedRegion"] = right_region

    for region_id, residents in assigned.items():
        for profile in residents:
            score, detail = scores[profile["slug"]][region_id]
            alternatives = sorted(
                (
                    {"regionId": candidate_id, "regionName": REGIONS[candidate_id]["name"], "score": result[0]}
                    for candidate_id, result in scores[profile["slug"]].items()
                    if candidate_id != region_id
                ),
                key=lambda item: (-item["score"], item["regionName"]),
            )
            profile["regionFit"] = {
                "score": score,
                **detail,
                "bestAlternative": alternatives[0],
            }
        residents.sort(key=lambda item: item["sourceOrder"])
    return assigned


def favorite_ids(profile: dict[str, Any], *, flavors: bool = False) -> set[str]:
    return {
        favorite["favoriteId"]
        for favorite in profile["favorites"]
        if (favorite["kind"] == "flavor") == flavors
    }


def specialty_ids(profile: dict[str, Any]) -> set[str]:
    return {specialty["slug"] for specialty in profile["specialties"]}


def pair_score(left: dict[str, Any], right: dict[str, Any]) -> float:
    score = 0.0
    left_habitat = left.get("idealHabitat", {}).get("idealHabitatId")
    right_habitat = right.get("idealHabitat", {}).get("idealHabitatId")
    if left_habitat and left_habitat == right_habitat:
        score += 12

    score += min(15, len(favorite_ids(left) & favorite_ids(right)) * 3)
    score += len(favorite_ids(left, flavors=True) & favorite_ids(right, flavors=True)) * 2

    left_specialties = specialty_ids(left)
    right_specialties = specialty_ids(right)
    score += min(6, len(left_specialties & right_specialties) * 3)
    for left_specialty in left_specialties:
        for right_specialty in right_specialties:
            if frozenset((left_specialty, right_specialty)) in COMPLEMENTARY_SPECIALTIES:
                score += 2

    left_litter = (left.get("litterItem") or {}).get("id")
    right_litter = (right.get("litterItem") or {}).get("id")
    if left_litter and left_litter == right_litter:
        score += 4
    return score


def cross_average(left: list[dict[str, Any]], right: list[dict[str, Any]]) -> float:
    values = [pair_score(a, b) for a in left for b in right]
    return sum(values) / len(values)


def group_average(group: list[dict[str, Any]]) -> float:
    values = [pair_score(left, right) for left, right in combinations(group, 2)]
    return sum(values) / len(values) if values else 0.0


def build_houses(residents: list[dict[str, Any]]) -> list[list[dict[str, Any]]]:
    clusters = [[resident] for resident in residents]
    while True:
        candidates = []
        for left_index, left in enumerate(clusters):
            for right_index in range(left_index + 1, len(clusters)):
                right = clusters[right_index]
                if len(left) + len(right) > 4:
                    continue
                cross = cross_average(left, right)
                merged = left + right
                average = group_average(merged)
                if cross >= 12 and average >= 14:
                    candidates.append((cross + average * 0.25, len(merged), left_index, right_index))
        if not candidates:
            break
        _, _, left_index, right_index = max(candidates, key=lambda item: (item[0], item[1], -item[2], -item[3]))
        clusters[left_index] += clusters[right_index]
        del clusters[right_index]

    # Give a remaining singleton a compatible home, but never force a weak fit.
    changed = True
    while changed:
        changed = False
        for singleton_index, singleton in enumerate(clusters):
            if len(singleton) != 1:
                continue
            options = []
            for target_index, target in enumerate(clusters):
                if singleton_index == target_index or len(target) >= 4:
                    continue
                compatibility = cross_average(singleton, target)
                if compatibility >= 14:
                    options.append((compatibility, -len(target), target_index))
            if not options:
                continue
            _, _, target_index = max(options)
            clusters[target_index] += singleton
            del clusters[singleton_index]
            changed = True
            break

    for cluster in clusters:
        cluster.sort(key=lambda item: item["sourceOrder"])
    return sorted(clusters, key=lambda group: min(item["sourceOrder"] for item in group))


def summarize_house(group: list[dict[str, Any]]) -> dict[str, Any]:
    habitats = Counter(
        profile.get("idealHabitat", {}).get("name", "Unknown") for profile in group
    )
    favorites = Counter(
        favorite["name"]
        for profile in group
        for favorite in profile["favorites"]
        if favorite["kind"] != "flavor"
    )
    specialties = Counter(
        specialty["name"] for profile in group for specialty in profile["specialties"]
    )
    litter = Counter(
        profile["litterItem"]["name"] for profile in group if profile.get("litterItem")
    )
    primary_habitat, primary_count = habitats.most_common(1)[0]
    shared_favorites = [
        {"name": name, "count": count}
        for name, count in sorted(favorites.items(), key=lambda item: (-item[1], item[0]))
        if count > 1
    ]
    shared_specialties = [
        {"name": name, "count": count}
        for name, count in sorted(specialties.items(), key=lambda item: (-item[1], item[0]))
        if count > 1
    ]
    shared_litter = [
        {"name": name, "count": count}
        for name, count in sorted(litter.items(), key=lambda item: (-item[1], item[0]))
        if count > 1
    ]
    average = group_average(group)
    explanation_parts = [f"{primary_count}/{len(group)} prefer {primary_habitat}"]
    if shared_favorites:
        explanation_parts.append(
            "shared favorites: " + ", ".join(item["name"] for item in shared_favorites[:3])
        )
    if shared_specialties:
        explanation_parts.append(
            "shared skills: " + ", ".join(item["name"] for item in shared_specialties[:2])
        )
    if shared_litter:
        explanation_parts.append("shared litter: " + ", ".join(item["name"] for item in shared_litter))

    favorite_label = shared_favorites[0]["name"].replace("Lots of ", "") if shared_favorites else "Mixed"
    return {
        "nameStem": f"{primary_habitat} {favorite_label}",
        "size": len(group),
        "compatibilityScore": round(min(100, average / 35 * 100), 1) if len(group) > 1 else None,
        "primaryIdealHabitat": {"name": primary_habitat, "count": primary_count},
        "sharedFavorites": shared_favorites,
        "sharedSpecialties": shared_specialties,
        "sharedLitterItems": shared_litter,
        "explanation": "; ".join(explanation_parts) + ".",
    }


def resident_output(profile: dict[str, Any]) -> dict[str, Any]:
    return {
        "pokopiaNumber": profile["pokopiaNumber"],
        "pokopiaNumberDisplay": profile["pokopiaNumberDisplay"],
        "pokemonId": profile["pokemonId"],
        "pokemonIdDisplay": profile["pokemonIdDisplay"],
        "slug": profile["slug"],
        "name": profile["name"],
        "imageUrl": profile["imageUrl"],
        "detailUrl": profile["detailUrl"],
        "idealHabitat": {
            "id": profile["idealHabitat"]["idealHabitatId"],
            "name": profile["idealHabitat"]["name"],
        },
        "favorites": [
            {"id": favorite["favoriteId"], "name": favorite["name"], "kind": favorite["kind"]}
            for favorite in profile["favorites"]
        ],
        "specialties": [
            {"slug": specialty["slug"], "name": specialty["name"]}
            for specialty in profile["specialties"]
        ],
        "availableHabitatLocations": profile["availableHabitatLocations"],
        "litterItem": (
            {"id": profile["litterItem"]["id"], "name": profile["litterItem"]["name"]}
            if profile["litterItem"]
            else None
        ),
        "assignmentKind": profile["assignmentKind"],
        "regionFit": profile["regionFit"],
    }


def create_plan(generated_at: str) -> dict[str, Any]:
    profiles = build_profiles()
    assignments = assign_regions(profiles)
    region_outputs = []
    for region_id in REGION_ORDER:
        region = REGIONS[region_id]
        houses = []
        for index, group in enumerate(build_houses(assignments[region_id]), start=1):
            summary = summarize_house(group)
            houses.append(
                {
                    "houseId": f"{region['code']}-{index:02d}",
                    "name": f"{summary.pop('nameStem')} House {index:02d}",
                    **summary,
                    "pokemon": [resident_output(profile) for profile in group],
                }
            )
        size_counts = Counter(house["size"] for house in houses)
        ideal_counts = Counter(
            profile.get("idealHabitat", {}).get("name", "Unknown")
            for profile in assignments[region_id]
        )
        region_outputs.append(
            {
                "regionId": region_id,
                "name": region["name"],
                "identity": region["identity"],
                "sourceUrl": region["sourceUrl"],
                "pokemonCount": len(assignments[region_id]),
                "homeCount": len(houses),
                "homeSizeCounts": {str(size): size_counts.get(size, 0) for size in range(1, 5)},
                "idealHabitatCounts": dict(sorted(ideal_counts.items())),
                "houses": houses,
            }
        )

    return {
        "generatedAt": generated_at,
        "pokemonCount": len(profiles),
        "regionCount": len(region_outputs),
        "homeCount": sum(region["homeCount"] for region in region_outputs),
        "methodology": {
            "goal": "Maximize thematic region fit and within-home compatibility while covering every Pokemon exactly once.",
            "regionAssignment": [
                "Honor the Tangrowth opening-story anchor and reward regions where a Pokemon's source habitat is available.",
                "Score ideal habitat at 4x the researched region affinity.",
                "Add weighted favorite-item and specialty matches to the region identity.",
                "Use equal practical region targets (62, 62, 61, 61, 62) so flexible regions do not absorb the roster.",
                "Improve the deterministic greedy assignment with pair swaps that optimize region fit and a smaller housemate-cohesion term.",
            ],
            "homeGrouping": [
                "Score pairs for shared ideal habitat, favorite categories, flavor, skills, complementary skills, and litter output.",
                "Merge only when cross-group and whole-home compatibility clear quality thresholds.",
                "Allow 1-4 residents; do not force four residents or minimize the number of homes.",
                "Treat a shared litter item as a small bonus, never as a mandatory pairing rule.",
            ],
            "caveat": "This is a reproducible recommendation, not a game rule. Pokemon can be moved, and Palette Town can reproduce many biomes.",
        },
        "sources": {
            "pokemon": "data/pokemon.json",
            "preferences": "data/pokemon-preferences.json",
            "habitatSpawns": "data/habitat-spawns.json",
            "specialties": "data/specialties.json",
            "litterItems": "data/pokemon-litter-items.json",
            "locations": "data/locations.json",
        },
        "regions": region_outputs,
    }


def write_report(plan: dict[str, Any], path: Path) -> None:
    lines = [
        "# Pokopia Region and Home Plan",
        "",
        f"Generated {plan['generatedAt']} from the repository's {plan['pokemonCount']}-Pokemon dataset.",
        "Every Pokemon appears exactly once. This is a thematic recommendation, not a restriction on moving residents.",
        "",
        "## Heuristics",
        "",
    ]
    for item in plan["methodology"]["regionAssignment"]:
        lines.append(f"- Region: {item}")
    for item in plan["methodology"]["homeGrouping"]:
        lines.append(f"- Home: {item}")
    lines.extend(["", f"> {plan['methodology']['caveat']}", ""])

    for region in plan["regions"]:
        size_summary = ", ".join(
            f"{count} x {size}-resident" for size, count in region["homeSizeCounts"].items() if count
        )
        habitat_summary = ", ".join(
            f"{name} {count}" for name, count in sorted(region["idealHabitatCounts"].items())
        )
        lines.extend(
            [
                f"## {region['name']}",
                "",
                f"{region['pokemonCount']} Pokemon in {region['homeCount']} homes ({size_summary}).",
                f"Identity: {region['identity']}.",
                f"Ideal-habitat mix: {habitat_summary}.",
                "",
            ]
        )
        for house in region["houses"]:
            residents = ", ".join(profile["name"] for profile in house["pokemon"])
            score = "solo" if house["compatibilityScore"] is None else f"{house['compatibilityScore']}/100"
            lines.extend(
                [
                    f"### {house['houseId']} - {house['name']}",
                    "",
                    f"- Residents ({house['size']}): {residents}",
                    f"- Compatibility: {score}",
                    f"- Why: {house['explanation']}",
                    "",
                ]
            )
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines), encoding="utf-8")


def validate_plan(plan: dict[str, Any]) -> None:
    residents = [
        profile
        for region in plan["regions"]
        for house in region["houses"]
        for profile in house["pokemon"]
    ]
    slugs = [profile["slug"] for profile in residents]
    if len(slugs) != plan["pokemonCount"]:
        raise ValueError(f"Expected {plan['pokemonCount']} residents, found {len(slugs)}")
    duplicates = [slug for slug, count in Counter(slugs).items() if count > 1]
    if duplicates:
        raise ValueError(f"Duplicate residents: {', '.join(duplicates)}")
    invalid_houses = [
        house["houseId"]
        for region in plan["regions"]
        for house in region["houses"]
        if not 1 <= house["size"] <= 4 or house["size"] != len(house["pokemon"])
    ]
    if invalid_houses:
        raise ValueError(f"Invalid house sizes: {', '.join(invalid_houses)}")
    for region in plan["regions"]:
        if region["pokemonCount"] != sum(house["size"] for house in region["houses"]):
            raise ValueError(f"Incorrect count for {region['name']}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--report", type=Path, default=DEFAULT_REPORT)
    parser.add_argument("--generated-at", default=date.today().isoformat())
    args = parser.parse_args()

    plan = create_plan(args.generated_at)
    validate_plan(plan)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(plan, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")
    write_report(plan, args.report)
    print(
        f"Wrote {plan['pokemonCount']} Pokemon across {plan['regionCount']} regions "
        f"and {plan['homeCount']} homes to {args.output.relative_to(ROOT)}"
    )


if __name__ == "__main__":
    main()
