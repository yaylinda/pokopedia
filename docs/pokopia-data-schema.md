# Pokopia Data Schema

This document proposes a storage model for the large Serebii Pokopia datasets, especially:

- item listings
- area and location references
- habitat requirements
- habitat spawn rules
- Pokemon ideal habitats
- Pokemon favorites and favorite item lists

The main goal is to keep the data queryable without losing source fidelity. A lot of the source HTML is only semi-structured, so the schema should preserve normalized fields and the original raw text when needed.

## Design Principles

1. Use stable slugs as primary identifiers when the source does not provide numeric IDs.
2. Keep top-level reference entities separate from relationship data.
3. Preserve source URLs, source order, and raw text for auditability.
4. Model acquisition and spawn data as arrays of structured records, not flattened strings.
5. Treat page "anchors" and item "tags" as different concepts.

## Taxonomy

### Item anchors

These come from the `items.shtml` page sections and should be modeled as the primary item grouping:

- `materials`
- `food`
- `furniture`
- `misc`
- `outdoor`
- `utilities`
- `nature`
- `buildings`
- `blocks`
- `kits`
- `key-items`
- `other`
- `lost-relics-l`
- `lost-relics-s`
- `fossils`

These are effectively the item's section on the master items page.

### Item tags or categories

These come from the item's `Tag` column and are a separate classification:

- `decoration`
- `food`
- `relaxation`
- `road`
- `toy`

Important note: most rows either have one of the five category badges or no tag at all, but there is at least one outlier row whose tag is not one of these badges. Because of that, tags should be stored as data, not enforced as a strict enum in the raw layer.

## Recommended Datasets

### `locations.json`

Use one dataset for the five main playable locations only. These are the places that matter for habitat spawn logic.

Suggested shape:

```json
{
  "locationId": "withered-wastelands",
  "name": "Withered Wastelands",
  "slug": "witheredwastelands",
  "detailUrl": "https://www.serebii.net/pokemonpokopia/locations/witheredwastelands.shtml",
  "pictureUrl": "https://www.serebii.net/pokemonpokopia/locations/witheredwastelandsth.jpg",
  "sourceOrder": 1
}
```

Recommended contents:

- `withered-wastelands`
- `bleak-beach`
- `rocky-ridges`
- `sparkling-skylands`
- `palette-town`

Cloud Island should be ignored in the app-facing model if you do not care about it.

Dream Islands should not be modeled as main locations. They are better treated as a different kind of source on item availability records.

### `item-tags.json`

Reference dataset for the tag badges shown in the `Tag` column.

Suggested shape:

```json
{
  "tagId": "food",
  "name": "Food",
  "slug": "food",
  "detailUrl": "https://www.serebii.net/pokemonpokopia/items/food.shtml",
  "pictureUrl": "https://www.serebii.net/pokemonpokopia/items/food.png",
  "isStandardCategory": true
}
```

### `item-anchors.json`

Reference dataset for the top-level section anchors on `items.shtml`.

Suggested shape:

```json
{
  "anchorId": "materials",
  "name": "Materials",
  "sourceAnchor": "materials",
  "sourceHeading": "List of Materials",
  "sourceOrder": 1
}
```

### `items.json`

This should be the canonical item catalog.

Suggested shape:

```json
{
  "itemId": "sturdystick",
  "slug": "sturdystick",
  "name": "Sturdy stick",
  "description": "A branch that fell off a tree somewhere. Perfect for making various toys and everyday items",
  "anchorId": "materials",
  "tagId": null,
  "detailUrl": "https://www.serebii.net/pokemonpokopia/items/sturdystick.shtml",
  "pictureUrl": "https://www.serebii.net/pokemonpokopia/items/sturdystick.png",
  "pictureFilename": "sturdystick.png",
  "pictureAlt": "Sturdy stick",
  "sourceOrder": 2,
  "isRegisteredInCollection": true,
  "notes": [],
  "availability": [
    {
      "kind": "location-drop",
      "locationId": "withered-wastelands",
      "method": "Natural",
      "rawText": "Withered Wastelands (Natural)"
    },
    {
      "kind": "location-drop",
      "locationId": "bleak-beach",
      "method": "Natural",
      "rawText": "Bleak Beach (Natural)"
    },
    {
      "kind": "dream-island-drop",
      "dreamIslandId": "pikachu-doll",
      "dreamIslandName": "Pikachu Doll",
      "method": "Natural",
      "rawText": "Pikachu Doll Dream Island (Natural)"
    },
    {
      "kind": "free-text",
      "rawText": "Around trees"
    }
  ],
  "rawLocationText": "Withered Wastelands (Natural); Bleak Beach (Natural); Around trees"
}
```

Recommended fields:

- `itemId`: same as slug for now
- `anchorId`: required
- `tagId`: optional
- `isRegisteredInCollection`: derived from source notes like `Note: Not registered in collection`
- `notes`: extracted footnotes or source caveats
- `availability`: structured acquisition records
- `rawLocationText`: original joined cell text for fallback/debugging

### `habitat-requirements.json`

Keep habitat requirements separate from the habitat reference list.

Suggested shape:

```json
{
  "habitatId": 67,
  "habitatSlug": "tantalizingrestaurant",
  "requirements": [
    {
      "sourceOrder": 1,
      "quantity": 1,
      "itemId": "seat",
      "itemSlug": "seat",
      "itemName": "Seat",
      "detailUrl": null,
      "pictureUrl": "https://www.serebii.net/pokemonpokopia/items/seat.png",
      "isCatalogLinked": false
    },
    {
      "sourceOrder": 2,
      "quantity": 1,
      "itemId": "menuboard",
      "itemSlug": "menuboard",
      "itemName": "Menu board",
      "detailUrl": "https://www.serebii.net/pokemonpokopia/items/menuboard.shtml",
      "pictureUrl": "https://www.serebii.net/pokemonpokopia/items/menuboard.png",
      "isCatalogLinked": true
    }
  ]
}
```

Why this needs a separate layer:

- some habitat requirement rows link directly to item pages
- some requirement rows are image-and-name only with no item link
- the requirement name may still match a catalog item later, but the source does not always give us a direct key

### `habitat-spawns.json`

Keep spawn rules separate from the habitat reference list. This is the densest relational dataset.

Suggested shape:

```json
{
  "habitatId": 1,
  "habitatSlug": "tallgrass",
  "spawns": [
    {
      "sourceOrder": 1,
      "pokemonSlug": "bulbasaur",
      "pokemonId": 1,
      "pokemonName": "Bulbasaur",
      "pokemonDetailUrl": "https://www.serebii.net/pokemonpokopia/pokedex/bulbasaur.shtml",
      "locations": [
        "withered-wastelands",
        "bleak-beach",
        "rocky-ridges",
        "sparkling-skylands",
        "palette-town"
      ],
      "rarity": "Common",
      "timeOfDay": [
        "morning",
        "day",
        "evening",
        "night"
      ],
      "weather": [
        "sun",
        "cloud",
        "rain"
      ]
    }
  ]
}
```

### `ideal-habitats.json`

Use this as a small reference dataset for the ideal habitat values shown on
Pokemon detail pages.

Suggested shape:

```json
{
  "sourceOrder": 1,
  "idealHabitatId": "bright",
  "slug": "bright",
  "name": "Bright",
  "detailUrl": "https://www.serebii.net/pokemonpokopia/pokedex/idealhabitat/bright.shtml",
  "pokemonCount": 95
}
```

This is intentionally separate from `habitats.json`. Serebii uses "ideal
habitat" values such as Bright, Warm, Humid, Dry, Dark, and Cool as preference
labels, while the habitat dex contains buildable habitat records such as Tall
Grass or Park Bench.

### `favorite-categories.json`

Use this as the canonical reference for favorite labels and the item lists linked
from each favorite.

Suggested shape:

```json
{
  "sourceOrder": 1,
  "favoriteId": "lotsofnature",
  "slug": "lotsofnature",
  "name": "Lots of nature",
  "kind": "favorite-category",
  "detailUrl": "https://www.serebii.net/pokemonpokopia/favorites/lotsofnature.shtml",
  "sourcePageUrl": "https://www.serebii.net/pokemonpokopia/favorites/lotsofnature.shtml",
  "sourceAnchor": "items",
  "rawHtmlPath": "data/raw/pokemonpokopia/favorites/lotsofnature.html",
  "fetchStatus": 200,
  "fetchError": null,
  "itemCount": 28,
  "items": [
    {
      "sourceOrder": 1,
      "itemId": "berrycase",
      "itemSlug": "berrycase",
      "itemName": "Berry case",
      "detailUrl": "https://www.serebii.net/pokemonpokopia/items/berrycase.shtml",
      "sourceDetailUrl": "https://www.serebii.net/pokemonpokopia/items/berrycase.shtml",
      "pictureUrl": "https://www.serebii.net/pokemonpokopia/items/berrycase.png",
      "pictureFilename": "berrycase.png",
      "pictureAlt": "Berry case",
      "description": "At a glance, this looks just like a glossy Cheri Berry. It opens wide for you to store things inside",
      "tagId": "decoration",
      "categoryName": "Decoration",
      "isCatalogLinked": true,
      "catalogMatchType": "source-link"
    }
  ]
}
```

Recommended fields:

- `favoriteId`: stable slug from `/favorites/*.shtml`, or a slugified label for
  flavor preferences such as `sweet-flavors`
- `kind`: `favorite-category`, `flavor`, `none`, or `reference-link`
- `sourcePageUrl`: page that actually contains the item list
- `sourceAnchor`: `items` for favorite pages, or the flavor section anchor such
  as `sweet`
- `fetchStatus` and `fetchError`: preserve source oddities without dropping the
  favorite relationship
- `items`: item references reconciled to `items.json` by source link first, then
  by unique item name

Serebii flavor favorites all link to `flavors.shtml`, so flavor labels should be
stored as separate favorite categories with anchored `detailUrl` values, for
example `https://www.serebii.net/pokemonpokopia/flavors.shtml#sweet`.

### `pokemon-preferences.json`

Use this relationship dataset to connect each Pokemon to its ideal habitat and
favorite categories.

Suggested shape:

```json
{
  "sourceOrder": 1,
  "pokemonSlug": "bulbasaur",
  "pokemonId": 1,
  "pokemonIdDisplay": "001",
  "pokemonName": "Bulbasaur",
  "pokemonDetailUrl": "https://www.serebii.net/pokemonpokopia/pokedex/bulbasaur.shtml",
  "rawHtmlPath": "data/raw/pokemonpokopia/pokedex/bulbasaur.html",
  "idealHabitat": {
    "idealHabitatId": "bright",
    "slug": "bright",
    "name": "Bright",
    "detailUrl": "https://www.serebii.net/pokemonpokopia/pokedex/idealhabitat/bright.shtml"
  },
  "favorites": [
    {
      "sourceOrder": 1,
      "favoriteId": "lotsofnature",
      "slug": "lotsofnature",
      "name": "Lots of nature",
      "kind": "favorite-category",
      "detailUrl": "https://www.serebii.net/pokemonpokopia/favorites/lotsofnature.shtml",
      "sourceHref": "/pokemonpokopia/favorites/lotsofnature.shtml"
    }
  ]
}
```

Keeping this as a relationship dataset avoids duplicating favorite item lists
inside every Pokemon record and makes it cheap to answer both directions:
"which favorites does this Pokemon like?" and "which Pokemon like this favorite?"

## Scrape Plan

1. Use `pokemon.json` as the source of Pokemon detail URLs.
2. Fetch each detail page into `data/raw/pokemonpokopia/pokedex/{slug}.html`.
3. Parse the detail page Stats table for the ideal habitat link and favorite
   links.
4. Deduplicate all ideal habitats into `ideal-habitats.json`.
5. Deduplicate all favorite links into `favorite-categories.json`.
6. Fetch each `/favorites/*.shtml` page and parse its item table.
7. Fetch `flavors.shtml` once and parse each flavor section as its own favorite
   category.
8. Reconcile favorite items to `items.json` by source detail URL first, then by
   unique item name, while preserving unmatched source rows for auditability.
9. Store the per-Pokemon relationships in `pokemon-preferences.json`.

Recommended normalized enums:

- `timeOfDay`: `morning`, `day`, `evening`, `night`
- `weather`: `sun`, `cloud`, `rain`

Recommended approach:

- store explicit arrays instead of an `allTimes` boolean
- preserve `sourceOrder` so scrape results stay deterministic
- keep `pokemonId` and `pokemonSlug` together for easier joins

## Availability Model For Items

The `Locations` column on `items.shtml` is not actually just locations. It mixes several source types:

- main-location pickups such as `Withered Wastelands (Natural)`
- treasure entries such as `Palette Town (Treasure)`
- dream island sources
- shop unlocks such as `Shop - Unlocked at Rocky Ridges Lv. 2`
- crafting or processing steps such as `Smelt Gold ore in the furnace`
- specialty-driven actions such as `Recycle Wastepaper with Pokemon with Recycle`
- one-off acquisition notes such as `Hold Y during Magnet Rise`
- extra notes such as `Each game has one secondary berry chosen at random`

Because of that, use a typed `availability` array with a permissive fallback.

Recommended `kind` values:

- `location-drop`
- `dream-island-drop`
- `shop-unlock`
- `recipe-or-process`
- `specialty-action`
- `trade`
- `interaction`
- `reference-link`
- `note`
- `free-text`

Suggested shapes:

```json
{
  "kind": "location-drop",
  "locationId": "rocky-ridges",
  "method": "Natural",
  "rawText": "Rocky Ridges (Natural)"
}
```

```json
{
  "kind": "shop-unlock",
  "locationId": "rocky-ridges",
  "level": 2,
  "shopName": "Shop",
  "rawText": "Shop - Unlocked at Rocky Ridges Lv. 2"
}
```

```json
{
  "kind": "dream-island-drop",
  "dreamIslandId": "eevee-doll",
  "dreamIslandName": "Eevee Doll",
  "method": "Natural",
  "rawText": "Eevee Doll Dream Island (Natural)"
}
```

```json
{
  "kind": "specialty-action",
  "specialtySlug": "recycle",
  "inputItemText": "Wastepaper",
  "rawText": "Recycle Wastepaper with Pokemon with Recycle"
}
```

```json
{
  "kind": "interaction",
  "mechanic": "magnet-rise",
  "rawText": "Hold Y during Magnet Rise"
}
```

## Recommended ID Strategy

### Use numeric IDs only where the source truly provides them

- habitats: numeric `habitatId`
- Pokemon: numeric `pokemonId` from image filename, not Pokopia number

### Use slugs everywhere else

- items: slug from item detail page
- specialties: slug from specialty detail page
- locations: slug from detail page
- tags: slug from tag page

## Important Edge Cases

### 1. Item tag is optional

Many item rows have no tag badge at all, especially in `Materials`.

### 2. Item tag is not always one of the five standard badges

At least one row uses a custom tag-like value:

- `Variant when placing stnadard Arched berriers`

This means the raw schema should not assume all tags are one of the standard five.

### 3. Habitat requirement rows are not always linked to an item page

Example: some habitats show `Seat`, `Table`, or `Plated Food` with an image but no anchor link.

That means habitat requirements should support:

- linked requirements
- unlinked requirements
- later reconciliation against the canonical item catalog

### 4. Habitat spawn pages mention Cloud Island

If Cloud Island is out of scope for the product, it is reasonable to drop it from the normalized `locations` array while optionally preserving the raw source text for debugging.

### 5. Item availability can contain duplicate area mentions

The source occasionally repeats a location. Preserve the raw entries during scrape, then optionally dedupe in a later transform step if needed.

## Recommended Next Output Files

If we follow this model, the next scrape outputs should look like:

- `data/json/pokemonpokopia/locations.json`
- `data/json/pokemonpokopia/item-tags.json`
- `data/json/pokemonpokopia/item-anchors.json`
- `data/json/pokemonpokopia/items.json`
- `data/json/pokemonpokopia/habitat-requirements.json`
- `data/json/pokemonpokopia/habitat-spawns.json`

The existing files still fit:

- `pokemon.json`
- `habitats.json`
- `specialties.json`

## Recommendation

For the actual implementation, I would treat `items.json` as the canonical item catalog, use `locations.json` for the five main playable locations, and keep habitat requirements and habitat spawns in separate files rather than nesting them into `habitats.json`.

That gives us:

- simpler scrapers
- cleaner joins
- smaller diffs when one source page changes
- better room for later recipe, crafting, and trade datasets
