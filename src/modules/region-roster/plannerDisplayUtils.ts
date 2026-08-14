import type { RegionRosterPokemon } from '../../data/currentRegionRoster'

export function getResidentNames(
  residentSlugs: string[],
  pokemonBySlug: Map<string, RegionRosterPokemon>,
) {
  return residentSlugs
    .map((slug) => pokemonBySlug.get(slug)?.name ?? slug)
    .join(', ')
}
