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
