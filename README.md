# Pokopedia

Pokopedia is a smart helper for all things Pokopia.

This repo starts with a small data-ingestion pipeline for Serebii's Pokemon Pokopia pages. The first scraper snapshots the source HTML for the available Pokemon table and writes a normalized JSON dataset.

## Scrape the Pokemon table

```bash
python3 scripts/scrape_pokopia_pokemon.py
```

Generated files:

- `data/raw/pokemonpokopia/availablepokemon.html`
- `data/json/pokemonpokopia/pokemon.json`

Important data note: the table's `No.` column is the Pokopia number, not the National Dex Pokemon ID. The scraper derives `pokemonId` from the sprite image filename.

## Scrape the habitats table

```bash
python3 scripts/scrape_pokopia_habitats.py
```

Generated files:

- `data/raw/pokemonpokopia/habitats.html`
- `data/json/pokemonpokopia/habitats.json`

This scraper reads only the top-level habitats table and excludes the separate `Habitats (Event)` section later on the page.

## Scrape the specialties table

```bash
python3 scripts/scrape_pokopia_specialties.py
```

Generated files:

- `data/raw/pokemonpokopia/specialty.html`
- `data/json/pokemonpokopia/specialties.json`

This scraper captures the specialties reference table with image, name, and description for each specialty.

## Scrape the main locations table

```bash
python3 scripts/scrape_pokopia_locations.py
```

Generated files:

- `data/raw/pokemonpokopia/locations.html`
- `data/json/pokemonpokopia/locations.json`

This scraper keeps only the five main playable locations and excludes Cloud Island from normalized location data.

## Scrape the items index

```bash
python3 scripts/scrape_pokopia_items.py
```

Generated files:

- `data/raw/pokemonpokopia/items.html`
- `data/json/pokemonpokopia/item-anchors.json`
- `data/json/pokemonpokopia/item-tags.json`
- `data/json/pokemonpokopia/items.json`

This scraper captures the full item catalog, top-level anchors, and tag/category badges. Item availability is stored as structured acquisition records plus the raw source text.

## Scrape habitat requirements and spawn rules

```bash
python3 scripts/scrape_pokopia_habitat_details.py
```

Generated files:

- `data/raw/pokemonpokopia/habitatdex/*.html`
- `data/json/pokemonpokopia/habitat-requirements.json`
- `data/json/pokemonpokopia/habitat-spawns.json`

This scraper walks every top-level habitat page, records required items and quantities, and normalizes Pokemon spawn rules by location, rarity, time of day, and weather.
