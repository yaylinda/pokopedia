import {
  favoriteCategoriesByItemId,
  favoriteCategoryById,
  favoriteItemById,
  type FavoriteCategory,
  type FavoriteItem,
} from '../../data/favoriteCategories'
import type { RegionRosterPokemon } from '../../data/currentRegionRoster'
import { getCanonicalEvolutionLine } from '../../data/rosterConstraints'
import type { RosterGroup } from '../../data/types'

export type FavoriteItemOverlap = {
  item: FavoriteItem
  residentCount: number
  residentSlugs: string[]
}

export type FavoriteCategoryOverlap = {
  category: FavoriteCategory
  residentCount: number
  residentSlugs: string[]
  items: FavoriteItemOverlap[]
}

export type CompatibilityCoverage = {
  residentCount: number
  residentSlugs: string[]
  sharedByAll: boolean
}

export type AbilityCompatibility = CompatibilityCoverage & {
  ability: RegionRosterPokemon['specialties'][number]
}

export type HabitatCompatibility = CompatibilityCoverage & {
  habitat: NonNullable<RegionRosterPokemon['idealHabitat']>
}

export type FavoriteCompatibility = CompatibilityCoverage & {
  favorite: RegionRosterPokemon['favorites'][number]
}

export type ItemCategoryCompatibility = FavoriteCompatibility & {
  category: FavoriteCategory
}

export type ItemCategoryContribution = CompatibilityCoverage & {
  category: FavoriteCategory
}

export type SharedItemCompatibility = CompatibilityCoverage & {
  contributingCategories: ItemCategoryContribution[]
  item: FavoriteItem
}

export type GroupCompatibilityAnalysis = {
  abilities: AbilityCompatibility[]
  habitats: HabitatCompatibility[]
  itemCategories: ItemCategoryCompatibility[]
  flavors: FavoriteCompatibility[]
  directSharedItems: SharedItemCompatibility[]
  multiCategoryOverlapItems: SharedItemCompatibility[]
}

export type EvolutionLinePregroup = {
  /** Stable, order-neutral identity derived from the complete canonical family. */
  familyId: string
  /** The complete catalog family, including relatives absent from this region. */
  canonicalPokemonSlugs: string[]
  /** Every selected-region resident in this family; this is never house-size limited. */
  pokemon: RegionRosterPokemon[]
  residentSlugs: string[]
  isCompleteFamily: boolean
  compatibility: GroupCompatibilityAnalysis
}

export type SoloHabitatPregroup = {
  groupId: string
  habitat: RegionRosterPokemon['idealHabitat']
  pokemon: RegionRosterPokemon[]
  residentSlugs: string[]
  cohortIndex: number
  cohortCount: number
  compatibility: GroupCompatibilityAnalysis
}

export const getRosterGroupScopeKey = (
  snapshotId: string,
  regionId: string,
) => `${snapshotId}:${regionId}`

export const getAvailableGroupNumber = (groups: RosterGroup[]) => {
  const usedNames = new Set(groups.map((group) => group.name.toLowerCase()))
  let groupNumber = 1

  while (usedNames.has(`group ${groupNumber}`)) {
    groupNumber += 1
  }

  return groupNumber
}

export const makeRosterGroup = (groups: RosterGroup[]): RosterGroup => {
  const groupNumber = getAvailableGroupNumber(groups)

  return {
    groupId: crypto.randomUUID(),
    name: `Group ${groupNumber}`,
    pokemonSlugs: [],
  }
}

const makeCoverage = (
  residentSlugs: Iterable<string>,
  groupSize: number,
): CompatibilityCoverage => {
  const sortedResidentSlugs = Array.from(new Set(residentSlugs)).sort((left, right) =>
    left.localeCompare(right),
  )

  return {
    residentCount: sortedResidentSlugs.length,
    residentSlugs: sortedResidentSlugs,
    sharedByAll:
      groupSize > 0 && sortedResidentSlugs.length === groupSize,
  }
}

const hasMultiCategoryResidentOverlap = (
  contributions: ItemCategoryContribution[],
) =>
  contributions.some((left, leftIndex) =>
    contributions.slice(leftIndex + 1).some((right) =>
      left.residentSlugs.some((leftSlug) =>
        right.residentSlugs.some((rightSlug) => leftSlug !== rightSlug),
      ),
    ),
  )

/**
 * Finds group-level common ground. Feature arrays contain values shared by at
 * least two residents. A direct item has at least one category shared by two
 * residents; a multi-category item reaches at least two residents through two
 * or more favorite categories. An item may intentionally appear in both arrays.
 */
export const getGroupCompatibilityAnalysis = (
  pokemon: RegionRosterPokemon[],
): GroupCompatibilityAnalysis => {
  const groupSize = pokemon.length
  const abilityResidents = new Map<
    string,
    {
      ability: RegionRosterPokemon['specialties'][number]
      residents: Set<string>
    }
  >()
  const habitatResidents = new Map<
    string,
    {
      habitat: NonNullable<RegionRosterPokemon['idealHabitat']>
      residents: Set<string>
    }
  >()
  const favoriteResidents = new Map<
    string,
    {
      favorite: RegionRosterPokemon['favorites'][number]
      residents: Set<string>
    }
  >()
  const favoriteIdsByResident = new Map<string, Set<string>>()

  pokemon.forEach((resident) => {
    resident.specialties.forEach((ability) => {
      const entry = abilityResidents.get(ability.slug) ?? {
        ability,
        residents: new Set<string>(),
      }
      entry.residents.add(resident.slug)
      abilityResidents.set(ability.slug, entry)
    })

    if (resident.idealHabitat) {
      const habitatId = resident.idealHabitat.idealHabitatId
      const entry = habitatResidents.get(habitatId) ?? {
        habitat: resident.idealHabitat,
        residents: new Set<string>(),
      }
      entry.residents.add(resident.slug)
      habitatResidents.set(habitatId, entry)
    }

    const categoryIds = new Set<string>()
    resident.favorites.forEach((favorite) => {
      const entry = favoriteResidents.get(favorite.favoriteId) ?? {
        favorite,
        residents: new Set<string>(),
      }
      entry.residents.add(resident.slug)
      favoriteResidents.set(favorite.favoriteId, entry)

      const category = favoriteCategoryById.get(favorite.favoriteId)
      if (category && category.kind !== 'flavor' && category.kind !== 'none') {
        categoryIds.add(category.favoriteId)
      }
    })
    favoriteIdsByResident.set(resident.slug, categoryIds)
  })

  const abilities = Array.from(abilityResidents.values())
    .filter(({ residents }) => residents.size >= 2)
    .map(({ ability, residents }) => ({
      ability,
      ...makeCoverage(residents, groupSize),
    }))
    .sort(
      (left, right) =>
        right.residentCount - left.residentCount ||
        left.ability.name.localeCompare(right.ability.name),
    )

  const habitats = Array.from(habitatResidents.values())
    .filter(({ residents }) => residents.size >= 2)
    .map(({ habitat, residents }) => ({
      habitat,
      ...makeCoverage(residents, groupSize),
    }))
    .sort(
      (left, right) =>
        right.residentCount - left.residentCount ||
        left.habitat.name.localeCompare(right.habitat.name),
    )

  const sharedFavorites = Array.from(favoriteResidents.values())
    .filter(({ residents }) => residents.size >= 2)
    .map(({ favorite, residents }) => ({
      favorite,
      ...makeCoverage(residents, groupSize),
    }))

  const itemCategories = sharedFavorites
    .flatMap(({ favorite, ...coverage }): ItemCategoryCompatibility[] => {
      const category = favoriteCategoryById.get(favorite.favoriteId)
      if (!category || category.kind === 'flavor' || category.kind === 'none') {
        return []
      }

      return [{ category, favorite, ...coverage }]
    })
    .sort(
      (left, right) =>
        right.residentCount - left.residentCount ||
        left.favorite.sourceOrder - right.favorite.sourceOrder ||
        left.favorite.name.localeCompare(right.favorite.name),
    )

  const flavors = sharedFavorites
    .filter(({ favorite }) => favorite.kind === 'flavor')
    .sort(
      (left, right) =>
        right.residentCount - left.residentCount ||
        left.favorite.sourceOrder - right.favorite.sourceOrder ||
        left.favorite.name.localeCompare(right.favorite.name),
    )

  const sharedItems = Array.from(favoriteCategoriesByItemId.entries())
    .flatMap(([itemId, categories]): SharedItemCompatibility[] => {
      const item = favoriteItemById.get(itemId)
      if (!item) return []

      const contributingCategories = categories
        .flatMap((category): ItemCategoryContribution[] => {
          const residents = pokemon
            .filter((resident) =>
              favoriteIdsByResident
                .get(resident.slug)
                ?.has(category.favoriteId),
            )
            .map((resident) => resident.slug)
          if (residents.length === 0) return []

          return [
            {
              category,
              ...makeCoverage(residents, groupSize),
            },
          ]
        })
        .sort(
          (left, right) =>
            right.residentCount - left.residentCount ||
            left.category.sourceOrder - right.category.sourceOrder ||
            left.category.name.localeCompare(right.category.name),
        )
      const residentSlugs = contributingCategories.flatMap(
        (contribution) => contribution.residentSlugs,
      )
      const coverage = makeCoverage(residentSlugs, groupSize)
      if (coverage.residentCount < 2) return []

      return [
        {
          item,
          contributingCategories,
          ...coverage,
        },
      ]
    })
    .sort(
      (left, right) =>
        right.residentCount - left.residentCount ||
        left.item.itemName.localeCompare(right.item.itemName),
    )

  return {
    abilities,
    habitats,
    itemCategories,
    flavors,
    directSharedItems: sharedItems.filter((item) =>
      item.contributingCategories.some(
        (contribution) => contribution.residentCount >= 2,
      ),
    ),
    multiCategoryOverlapItems: sharedItems.filter(
      (item) =>
        item.contributingCategories.length >= 2 &&
        hasMultiCategoryResidentOverlap(item.contributingCategories),
    ),
  }
}

/**
 * Pre-groups selected residents into complete, unordered evolution families.
 * Canonical members are alphabetized because the checked-in constraint graph
 * intentionally models family membership, not evolution direction.
 */
export const getEvolutionLinePregroups = (
  pokemon: RegionRosterPokemon[],
): EvolutionLinePregroup[] => {
  const pokemonBySlug = new Map(pokemon.map((resident) => [resident.slug, resident]))
  const familiesById = new Map<
    string,
    {
      canonicalPokemonSlugs: string[]
      residentSlugs: Set<string>
    }
  >()

  pokemon.forEach((resident) => {
    const canonicalPokemonSlugs = [...getCanonicalEvolutionLine(resident.slug)]
      .sort((left, right) => left.localeCompare(right))
    const familyId = canonicalPokemonSlugs.join(':')
    const family = familiesById.get(familyId) ?? {
      canonicalPokemonSlugs,
      residentSlugs: new Set<string>(),
    }
    family.residentSlugs.add(resident.slug)
    familiesById.set(familyId, family)
  })

  return Array.from(familiesById, ([familyId, family]) => {
    const residentSlugs = family.canonicalPokemonSlugs.filter((slug) =>
      family.residentSlugs.has(slug),
    )
    const familyPokemon = residentSlugs
      .flatMap((slug) => {
        const resident = pokemonBySlug.get(slug)
        return resident ? [resident] : []
      })
      .sort(
        (left, right) =>
          (left.sourceOrder ?? Number.MAX_SAFE_INTEGER) -
            (right.sourceOrder ?? Number.MAX_SAFE_INTEGER) ||
          left.name.localeCompare(right.name),
      )

    return {
      familyId,
      canonicalPokemonSlugs: family.canonicalPokemonSlugs,
      pokemon: familyPokemon,
      residentSlugs,
      isCompleteFamily:
        residentSlugs.length === family.canonicalPokemonSlugs.length,
      compatibility: getGroupCompatibilityAnalysis(familyPokemon),
    }
  }).sort((left, right) => left.familyId.localeCompare(right.familyId))
}

/**
 * Combines residents who have no selected-region evolution relative into
 * habitat-first cohorts. Cohorts are balanced and never exceed a saved home's
 * four-resident capacity, avoiding a 4+1 split when a 3+2 split is possible.
 */
export const getSoloHabitatPregroups = (
  evolutionFamilies: EvolutionLinePregroup[],
): SoloHabitatPregroup[] => {
  const residentsByHabitat = new Map<
    string,
    {
      habitat: RegionRosterPokemon['idealHabitat']
      pokemon: RegionRosterPokemon[]
    }
  >()

  evolutionFamilies
    .filter((family) => family.pokemon.length === 1)
    .forEach((family) => {
      const resident = family.pokemon[0]
      const habitatId = resident.idealHabitat?.idealHabitatId ?? 'unknown'
      const group = residentsByHabitat.get(habitatId) ?? {
        habitat: resident.idealHabitat,
        pokemon: [],
      }
      group.pokemon.push(resident)
      residentsByHabitat.set(habitatId, group)
    })

  return Array.from(residentsByHabitat.entries())
    .sort(([, left], [, right]) =>
      (left.habitat?.name ?? 'Unknown').localeCompare(
        right.habitat?.name ?? 'Unknown',
      ),
    )
    .flatMap(([habitatId, group]) => {
      const sortedPokemon = [...group.pokemon].sort(
        (left, right) =>
          (left.sourceOrder ?? Number.MAX_SAFE_INTEGER) -
            (right.sourceOrder ?? Number.MAX_SAFE_INTEGER) ||
          left.name.localeCompare(right.name),
      )
      const cohortCount = Math.ceil(sortedPokemon.length / 4)
      const baseCohortSize = Math.floor(sortedPokemon.length / cohortCount)
      const largerCohortCount = sortedPokemon.length % cohortCount
      let startIndex = 0

      return Array.from({ length: cohortCount }, (_value, cohortIndex) => {
        const cohortSize =
          baseCohortSize + (cohortIndex < largerCohortCount ? 1 : 0)
        const pokemon = sortedPokemon.slice(
          startIndex,
          startIndex + cohortSize,
        )
        startIndex += cohortSize

        return {
          groupId: `solo-habitat:${habitatId}:${cohortIndex + 1}`,
          habitat: group.habitat,
          pokemon,
          residentSlugs: pokemon.map((resident) => resident.slug),
          cohortIndex: cohortIndex + 1,
          cohortCount,
          compatibility: getGroupCompatibilityAnalysis(pokemon),
        }
      })
    })
}

export const getGroupFavoriteOverlaps = (
  pokemon: RegionRosterPokemon[],
): FavoriteCategoryOverlap[] => {
  const categoryResidents = new Map<string, Set<string>>()
  const itemResidents = new Map<string, Set<string>>()

  pokemon.forEach((resident) => {
    const residentItemIds = new Set<string>()

    resident.favorites.forEach((favorite) => {
      const category = favoriteCategoryById.get(favorite.favoriteId)
      if (!category || category.kind === 'none') return

      const residents = categoryResidents.get(category.favoriteId) ?? new Set()
      residents.add(resident.slug)
      categoryResidents.set(category.favoriteId, residents)

      category.items.forEach((item) => residentItemIds.add(item.itemId))
    })

    residentItemIds.forEach((itemId) => {
      const residents = itemResidents.get(itemId) ?? new Set()
      residents.add(resident.slug)
      itemResidents.set(itemId, residents)
    })
  })

  return Array.from(categoryResidents.entries())
    .flatMap(([favoriteId, residentSlugs]): FavoriteCategoryOverlap[] => {
      const category = favoriteCategoryById.get(favoriteId)
      if (!category || residentSlugs.size < 2) return []

      const items = category.items
        .flatMap((item): FavoriteItemOverlap[] => {
          const residents = itemResidents.get(item.itemId)
          if (!residents || residents.size < 2) return []

          return [
            {
              item,
              residentCount: residents.size,
              residentSlugs: Array.from(residents),
            },
          ]
        })
        .sort(
          (left, right) =>
            right.residentCount - left.residentCount ||
            left.item.sourceOrder - right.item.sourceOrder ||
            left.item.itemName.localeCompare(right.item.itemName),
        )

      return [
        {
          category,
          residentCount: residentSlugs.size,
          residentSlugs: Array.from(residentSlugs),
          items,
        },
      ]
    })
    .sort(
      (left, right) =>
        right.residentCount - left.residentCount ||
        left.category.sourceOrder - right.category.sourceOrder ||
        left.category.name.localeCompare(right.category.name),
    )
}
