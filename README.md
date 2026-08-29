# Pokopedia

Pokopedia is a personalized Pokémon region-roster planner for Pokopia.

This repo now includes two parts:

- a React + TypeScript region-roster workspace
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

### Frontend architecture

The frontend is organized around one route without collapsing the application
and feature layers together:

- `src/App.tsx` composes the application providers and router.
- `src/app/` owns global providers, routing, the application shell, and its
  semantic page layout.
- `src/modules/region-roster/RegionRosterPage.tsx` is the route-level page and
  owns the roster heading and document structure.
- `src/modules/region-roster/RegionRosterWorkspace.tsx` composes the interactive
  region rail, summary, search, roster groups, and Pokémon controls.
- `src/modules/region-roster/hooks/` owns URL state and derived roster-model
  behavior; `regionRosterConfig.ts` owns visual vocabulary and grouping rules.
- `src/data/` owns normalized roster data, constraints, and persisted user
  decisions.

## Data pipeline

This repo starts with a small data-ingestion pipeline for Serebii's Pokemon Pokopia pages. Scrapers write normalized JSON datasets into `data/` and may spool fetched HTML into ignored `.tmp/pokopia-html/` files while they run.

## Generate the region and home plan

Build a complete five-region recommendation and 1-4 Pokemon home groups from
the normalized roster, preference, specialty, habitat, and optional litter data:

```bash
python3 scripts/generate_region_home_plan.py
```

Generated files:

- `data/region-home-plan.json` - structured assignments, scores, and source fields
- `docs/region-home-plan.md` - a readable region-by-region home roster

## Scrape the Pokemon catalogs

```bash
python3 scripts/scrape_pokopia_pokemon.py
```

Generated files:

- `data/pokemon.json`

The scraper combines the main, Event, and Basin Pokédex aggregate pages. The
tables' `No.` columns are catalog-specific Pokopia numbers, not National Pokédex
IDs; `catalogId` distinguishes their restarted numbering, and `pokemonId` is
derived from the sprite filename.

## Scrape the habitats table

```bash
python3 scripts/scrape_pokopia_habitats.py
```

Generated files:

- `data/habitats.json`

This scraper reads the main, Basin, and Event catalogs from the aggregate
habitats table. `habitatKey` combines the catalog and restarted habitat number
into a unique key.

## Scrape the specialties table

```bash
python3 scripts/scrape_pokopia_specialties.py
```

Generated files:

- `data/specialties.json`

This scraper captures the specialties reference table with image, name, and description for each specialty.

## Scrape the playable locations table

```bash
python3 scripts/scrape_pokopia_locations.py
```

Generated files:

- `data/locations.json`

This scraper keeps the six playable locations, including Bubbly Basin, and
excludes Cloud Island from normalized location data.

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

This scraper walks every main, Basin, and Event habitat page, records required
items and quantities, and normalizes Pokemon spawn rules by location, rarity,
time of day, and weather.

## Scrape Pokemon preferences

```bash
python3 scripts/scrape_pokopia_pokemon_preferences.py
```

Generated files:

- `data/ideal-habitats.json`
- `data/favorite-categories.json`
- `data/pokemon-preferences.json`

This scraper walks every Pokémon detail page from all three catalogs and records
ideal habitats, favorites, favorite items, and whether the Pokémon can go
underwater.
