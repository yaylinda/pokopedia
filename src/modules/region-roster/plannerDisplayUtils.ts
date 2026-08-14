import type { RegionRosterPokemon } from '../../data/currentRegionRoster'

export type IdealHabitatSummary = {
  habitat: NonNullable<RegionRosterPokemon['idealHabitat']>
  residentCount: number
}

export type AbilitySummary = {
  ability: RegionRosterPokemon['specialties'][number]
  residentCount: number
}

export type IdealHabitatGrouping = {
  groupingId: string
  habitat: RegionRosterPokemon['idealHabitat']
  label: string
  sortOrder: number
}

const idealHabitatSortOrder = new Map(
  ['bright', 'warm', 'humid', 'dry', 'dark', 'cool'].map((habitatId, index) => [
    habitatId,
    index,
  ]),
)

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

export function getAbilitySummaries(
  pokemon: RegionRosterPokemon[],
): AbilitySummary[] {
  const summariesBySlug = new Map<string, AbilitySummary>()

  pokemon.forEach((resident) => {
    const seenAbilitySlugs = new Set<string>()
    resident.specialties.forEach((ability) => {
      if (seenAbilitySlugs.has(ability.slug)) return
      seenAbilitySlugs.add(ability.slug)
      const summary = summariesBySlug.get(ability.slug) ?? {
        ability,
        residentCount: 0,
      }
      summary.residentCount += 1
      summariesBySlug.set(ability.slug, summary)
    })
  })

  return Array.from(summariesBySlug.values()).sort(
    (left, right) =>
      right.residentCount - left.residentCount ||
      left.ability.name.localeCompare(right.ability.name),
  )
}

export function getIdealHabitatGrouping(
  pokemon: RegionRosterPokemon[],
): IdealHabitatGrouping {
  const summaries = getIdealHabitatSummaries(pokemon)
  const primaryHabitat = summaries[0]

  if (!primaryHabitat) {
    return {
      groupingId: 'unknown',
      habitat: null,
      label: 'Habitat not listed',
      sortOrder: 101,
    }
  }

  const hasTiedPrimaryHabitat =
    summaries.length > 1 &&
    summaries[1].residentCount === primaryHabitat.residentCount

  if (hasTiedPrimaryHabitat) {
    return {
      groupingId: 'mixed',
      habitat: null,
      label: 'Mixed habitats',
      sortOrder: 100,
    }
  }

  return {
    groupingId: primaryHabitat.habitat.idealHabitatId,
    habitat: primaryHabitat.habitat,
    label: primaryHabitat.habitat.name,
    sortOrder:
      idealHabitatSortOrder.get(primaryHabitat.habitat.idealHabitatId) ?? 99,
  }
}
