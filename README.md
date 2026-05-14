# Pokopedia

Pokopedia is a smart helper for all things Pokopia.

This repo now includes two parts:

- a React + TypeScript frontend scaffold for the reference app
- the source data ingestion pipeline for Serebii's Pokemon Pokopia pages

## Frontend app

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

The app is configured for GitHub Pages deployment through GitHub Actions.

## Data pipeline

This repo starts with a small data-ingestion pipeline for Serebii's Pokemon Pokopia pages. Scrapers write normalized JSON datasets into `data/` and may spool fetched HTML into ignored `.tmp/pokopia-html/` files while they run.

## Scrape the Pokemon table

```bash
python3 scripts/scrape_pokopia_pokemon.py
```

Generated files:

- `data/pokemon.json`

Important data note: the table's `No.` column is the Pokopia number, not the National Dex Pokemon ID. The scraper derives `pokemonId` from the sprite image filename.

## Scrape the habitats table

```bash
python3 scripts/scrape_pokopia_habitats.py
```

Generated files:

- `data/habitats.json`

This scraper reads only the top-level habitats table and excludes the separate `Habitats (Event)` section later on the page.

## Scrape the specialties table

```bash
python3 scripts/scrape_pokopia_specialties.py
```

Generated files:

- `data/specialties.json`

This scraper captures the specialties reference table with image, name, and description for each specialty.

## Scrape the main locations table

```bash
python3 scripts/scrape_pokopia_locations.py
```

Generated files:

- `data/locations.json`

This scraper keeps only the five main playable locations and excludes Cloud Island from normalized location data.

## Scrape the items index

```bash
python3 scripts/scrape_pokopia_items.py
```

Generated files:

- `data/item-anchors.json`
- `data/item-tags.json`
- `data/items.json`

This scraper captures the full item catalog, top-level anchors, and tag/category badges. Item availability is stored as structured acquisition records plus the raw source text.

## Scrape habitat requirements and spawn rules

```bash
python3 scripts/scrape_pokopia_habitat_details.py
```

Generated files:

- `data/habitat-requirements.json`
- `data/habitat-spawns.json`

This scraper walks every top-level habitat page, records required items and quantities, and normalizes Pokemon spawn rules by location, rarity, time of day, and weather.
