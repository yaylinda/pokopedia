import type { RegionRosterPokemon } from '../../data/currentRegionRoster'

export type IdealHabitatSummary = {
  habitat: NonNullable<RegionRosterPokemon['idealHabitat']>
  residentCount: number
}

export function getResidentNames(
  residentSlugs: string[],
  pokemonBySlug: Map<string, RegionRosterPokemon>,
) {
  return residentSlugs
    .map((slug) => pokemonBySlug.get(slug)?.name ?? slug)
    .join(', ')
}

export function getIdealHabitatSummaries(
  pokemon: RegionRosterPokemon[],
): IdealHabitatSummary[] {
  const summariesById = new Map<string, IdealHabitatSummary>()

  pokemon.forEach((resident) => {
    if (!resident.idealHabitat) return
    const habitatId = resident.idealHabitat.idealHabitatId
    const summary = summariesById.get(habitatId) ?? {
      habitat: resident.idealHabitat,
      residentCount: 0,
    }
    summary.residentCount += 1
    summariesById.set(habitatId, summary)
  })

  return Array.from(summariesById.values()).sort(
    (left, right) =>
      right.residentCount - left.residentCount ||
      left.habitat.name.localeCompare(right.habitat.name),
  )
}
