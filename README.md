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
