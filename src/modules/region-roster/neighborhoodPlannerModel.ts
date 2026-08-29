import type { RegionRosterPokemon } from '../../data/currentRegionRoster'
import {
  getEvolutionLinePregroups,
  getGroupFavoriteCategoryCoverage,
  type EvolutionLinePregroup,
  type FavoriteCategoryCoverage,
} from './groupPlannerModel'
import {
  getIdealHabitatGrouping,
  type IdealHabitatGrouping,
} from './plannerDisplayUtils'

export type NeighborhoodPlacement = 'garden' | 'main' | 'far-main'

export type NeighborhoodFamily = EvolutionLinePregroup & {
  abilitySlugs: string[]
  averageLikeRating: number | null
  isGardenFamily: boolean
  isLowPreference: boolean
}

export type Neighborhood = {
  neighborhoodId: string
  name: string
  placement: NeighborhoodPlacement
  families: NeighborhoodFamily[]
  pokemon: RegionRosterPokemon[]
  habitatGrouping: IdealHabitatGrouping
  topFavoriteCategories: FavoriteCategoryCoverage[]
  littererCount: number
  gathererCount: number
  waterCount: number
  growCount: number
  lowPreferencePokemonCount: number
}

export type NeighborhoodRuleIssue = {
  kind: 'missing-gatherer'
  neighborhoodId: string
  message: string
}

export type NeighborhoodPlan = {
  neighborhoods: Neighborhood[]
  familyCount: number
  pokemonCount: number
  litterNeighborhoodCount: number
  balancedLitterNeighborhoodCount: number
  issues: NeighborhoodRuleIssue[]
}

type FamilyProfile = NeighborhoodFamily & {
  favoriteIds: string[]
  preferredPlacement: NeighborhoodPlacement
  primaryHabitatId: string
}

type NeighborhoodDraft = {
  placement: NeighborhoodPlacement
  families: FamilyProfile[]
}

const gardenAbilitySlugs = new Set(['grow', 'water'])
const placementOrder: NeighborhoodPlacement[] = [
  'garden',
  'main',
  'far-main',
]
const maxFamiliesPerAffinityNeighborhood = 6

const hasAbility = (family: FamilyProfile, abilitySlug: string) =>
  family.abilitySlugs.includes(abilitySlug)

const hasDraftAbility = (draft: NeighborhoodDraft, abilitySlug: string) =>
  draft.families.some((family) => hasAbility(family, abilitySlug))

const getFamilyAverageLikeRating = (pokemon: RegionRosterPokemon[]) => {
  const ratings = pokemon.flatMap((resident) =>
    resident.lindaStats.likeRating === null
      ? []
      : [resident.lindaStats.likeRating],
  )

  if (ratings.length === 0) return null
  return ratings.reduce((total, rating) => total + rating, 0) / ratings.length
}

const makeFamilyProfiles = (
  pokemon: RegionRosterPokemon[],
): FamilyProfile[] =>
  getEvolutionLinePregroups(pokemon).map((family) => {
    const abilitySlugs = Array.from(
      new Set(
        family.pokemon.flatMap((resident) =>
          resident.specialties.map((ability) => ability.slug),
        ),
      ),
    ).sort((left, right) => left.localeCompare(right))
    const favoriteIds = Array.from(
      new Set(
        family.pokemon.flatMap((resident) =>
          resident.favorites
            .filter((favorite) => favorite.kind === 'favorite-category')
            .map((favorite) => favorite.favoriteId),
        ),
      ),
    ).sort((left, right) => left.localeCompare(right))
    const isGardenFamily = abilitySlugs.some((slug) =>
      gardenAbilitySlugs.has(slug),
    )
    const isLowPreference = family.pokemon.some(
      (resident) =>
        resident.lindaStats.likeRating !== null &&
        resident.lindaStats.likeRating <= 2,
    )
    const preferredPlacement: NeighborhoodPlacement = isGardenFamily
      ? 'garden'
      : isLowPreference
        ? 'far-main'
        : 'main'

    return {
      ...family,
      abilitySlugs,
      averageLikeRating: getFamilyAverageLikeRating(family.pokemon),
      favoriteIds,
      isGardenFamily,
      isLowPreference,
      preferredPlacement,
      primaryHabitatId: getIdealHabitatGrouping(family.pokemon).groupingId,
    }
  })

const familySimilarity = (
  existingFamilies: FamilyProfile[],
  candidate: FamilyProfile,
) => {
  const existingFavoriteIds = new Set(
    existingFamilies.flatMap((family) => family.favoriteIds),
  )
  const existingAbilitySlugs = new Set(
    existingFamilies.flatMap((family) => family.abilitySlugs),
  )
  const sharedFavorites = candidate.favoriteIds.filter((favoriteId) =>
    existingFavoriteIds.has(favoriteId),
  ).length
  const sharedAbilities = candidate.abilitySlugs.filter((abilitySlug) =>
    existingAbilitySlugs.has(abilitySlug),
  ).length
  const sharedHabitat = existingFamilies.some(
    (family) => family.primaryHabitatId === candidate.primaryHabitatId,
  )

  return sharedFavorites * 4 + sharedAbilities * 2 + (sharedHabitat ? 8 : 0)
}

const makeAffinityClusters = (
  families: FamilyProfile[],
): FamilyProfile[][] => {
  const pending = [...families].sort((left, right) =>
    left.familyId.localeCompare(right.familyId),
  )
  const clusters: FamilyProfile[][] = []

  while (pending.length > 0) {
    const cluster = [pending.shift()!]

    while (
      cluster.length < maxFamiliesPerAffinityNeighborhood &&
      pending.length > 0
    ) {
      const rankedCandidates = pending
        .map((candidate, index) => ({
          candidate,
          index,
          score: familySimilarity(cluster, candidate),
        }))
        .sort(
          (left, right) =>
            right.score - left.score ||
            left.candidate.familyId.localeCompare(right.candidate.familyId),
        )
      const next = rankedCandidates[0]
      cluster.push(next.candidate)
      pending.splice(next.index, 1)
    }

    clusters.push(cluster)
  }

  return clusters
}

const makePlacementDrafts = (
  families: FamilyProfile[],
  placement: NeighborhoodPlacement,
): NeighborhoodDraft[] => {
  if (families.length === 0) return []

  // The garden is intentionally one shared utility cluster so Water and Grow
  // families reinforce the same crop and plant area.
  if (placement === 'garden') return [{ placement, families }]

  const familiesByHabitat = new Map<string, FamilyProfile[]>()
  families.forEach((family) => {
    const habitatFamilies = familiesByHabitat.get(family.primaryHabitatId) ?? []
    habitatFamilies.push(family)
    familiesByHabitat.set(family.primaryHabitatId, habitatFamilies)
  })

  return Array.from(familiesByHabitat.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .flatMap(([, habitatFamilies]) =>
      makeAffinityClusters(habitatFamilies).map((cluster) => ({
        placement,
        families: cluster,
      })),
    )
}

const canMoveGatherFamily = (
  source: NeighborhoodDraft,
  family: FamilyProfile,
  targetPlacement: NeighborhoodPlacement,
) => {
  if (!hasAbility(family, 'gather')) return false
  if (
    family.preferredPlacement !== targetPlacement &&
    family.preferredPlacement !== 'main'
  ) {
    return false
  }

  const sourceWouldStillHaveLitter = source.families
    .filter((entry) => entry.familyId !== family.familyId)
    .some((entry) => hasAbility(entry, 'litter'))
  const sourceWouldStillHaveGather = source.families
    .filter((entry) => entry.familyId !== family.familyId)
    .some((entry) => hasAbility(entry, 'gather'))

  return !sourceWouldStillHaveLitter || sourceWouldStillHaveGather
}

const repairLitterGatherBalance = (drafts: NeighborhoodDraft[]) => {
  const mutableDrafts = drafts.map((draft) => ({
    ...draft,
    families: [...draft.families],
  }))
  const priority: NeighborhoodPlacement[] = ['garden', 'far-main', 'main']
  let didChange = true

  while (didChange) {
    didChange = false
    const unbalancedDrafts = mutableDrafts
      .filter(
        (draft) =>
          hasDraftAbility(draft, 'litter') &&
          !hasDraftAbility(draft, 'gather'),
      )
      .sort(
        (left, right) =>
          priority.indexOf(left.placement) -
            priority.indexOf(right.placement) ||
          left.families[0].familyId.localeCompare(right.families[0].familyId),
      )

    for (const target of unbalancedDrafts) {
      if (hasDraftAbility(target, 'gather')) continue

      const candidates = mutableDrafts
        .filter((source) => source !== target)
        .flatMap((source) =>
          source.families.flatMap((family) =>
            canMoveGatherFamily(source, family, target.placement)
              ? [
                  {
                    family,
                    source,
                    score:
                      familySimilarity(target.families, family) +
                      (source.placement === target.placement ? 5 : 0),
                  },
                ]
              : [],
          ),
        )
        .sort(
          (left, right) =>
            right.score - left.score ||
            left.family.familyId.localeCompare(right.family.familyId),
        )
      const candidate = candidates[0]

      if (candidate) {
        candidate.source.families = candidate.source.families.filter(
          (family) => family.familyId !== candidate.family.familyId,
        )
        target.families.push(candidate.family)
        didChange = true
        continue
      }

      const litterFamilies = target.families.filter((family) =>
        hasAbility(family, 'litter'),
      )
      const balancedLitterDrafts = mutableDrafts.filter(
        (draft) =>
          draft !== target &&
          draft.placement === target.placement &&
          hasDraftAbility(draft, 'litter') &&
          hasDraftAbility(draft, 'gather'),
      )

      if (balancedLitterDrafts.length > 0) {
        litterFamilies.forEach((family) => {
          const destination = [...balancedLitterDrafts].sort(
            (left, right) => {
              const leftScore =
                familySimilarity(left.families, family) -
                left.families.length * 3
              const rightScore =
                familySimilarity(right.families, family) -
                right.families.length * 3

              return (
                rightScore - leftScore ||
                left.families.length - right.families.length ||
                left.families[0].familyId.localeCompare(
                  right.families[0].familyId,
                )
              )
            },
          )[0]
          destination.families.push(family)
        })
        const movedFamilyIds = new Set(
          litterFamilies.map((family) => family.familyId),
        )
        target.families = target.families.filter(
          (family) => !movedFamilyIds.has(family.familyId),
        )
        didChange = true
      }
    }

    for (let index = mutableDrafts.length - 1; index >= 0; index -= 1) {
      if (mutableDrafts[index].families.length === 0) {
        mutableDrafts.splice(index, 1)
      }
    }
  }

  return mutableDrafts
}

const mergeSingletonDrafts = (drafts: NeighborhoodDraft[]) => {
  const mutableDrafts = drafts.map((draft) => ({
    ...draft,
    families: [...draft.families],
  }))

  mutableDrafts
    .filter((draft) => draft.families.length === 1)
    .forEach((source) => {
      if (source.families.length !== 1) return
      const family = source.families[0]
      const familyNeedsGather = hasAbility(family, 'litter')
      const candidates = mutableDrafts
        .filter(
          (target) =>
            target !== source &&
            target.placement === source.placement &&
            target.families.length > 0 &&
            target.families.length < maxFamiliesPerAffinityNeighborhood &&
            (!familyNeedsGather || hasDraftAbility(target, 'gather')),
        )
        .map((target) => ({
          target,
          score:
            familySimilarity(target.families, family) -
            target.families.length * 2,
        }))
        .sort(
          (left, right) =>
            right.score - left.score ||
            left.target.families.length - right.target.families.length ||
            left.target.families[0].familyId.localeCompare(
              right.target.families[0].familyId,
            ),
        )
      const destination = candidates[0]?.target

      if (!destination) return
      destination.families.push(family)
      source.families = []
    })

  return mutableDrafts.filter((draft) => draft.families.length > 0)
}

const countPokemonWithAbility = (
  pokemon: RegionRosterPokemon[],
  abilitySlug: string,
) =>
  pokemon.filter((resident) =>
    resident.specialties.some((ability) => ability.slug === abilitySlug),
  ).length

const getNeighborhoodBaseName = (
  placement: NeighborhoodPlacement,
  grouping: IdealHabitatGrouping,
) => {
  const habitatName =
    grouping.groupingId === 'mixed' || grouping.groupingId === 'unknown'
      ? 'Mixed'
      : grouping.label

  if (placement === 'garden') return `${habitatName} garden`
  if (placement === 'far-main') return `${habitatName} outskirts`
  return `${habitatName} commons`
}

const finalizeNeighborhoods = (
  drafts: NeighborhoodDraft[],
): Neighborhood[] => {
  const sortedDrafts = drafts
    .map((draft) => {
      const pokemon = draft.families
        .flatMap((family) => family.pokemon)
        .sort(
          (left, right) =>
            (left.sourceOrder ?? Number.MAX_SAFE_INTEGER) -
              (right.sourceOrder ?? Number.MAX_SAFE_INTEGER) ||
            left.name.localeCompare(right.name),
        )

      return {
        ...draft,
        pokemon,
        habitatGrouping: getIdealHabitatGrouping(pokemon),
      }
    })
    .sort(
      (left, right) =>
        placementOrder.indexOf(left.placement) -
          placementOrder.indexOf(right.placement) ||
        left.habitatGrouping.sortOrder - right.habitatGrouping.sortOrder ||
        left.families[0].familyId.localeCompare(right.families[0].familyId),
    )
  const nameCounts = new Map<string, number>()

  return sortedDrafts.map((draft, index) => {
    const baseName = getNeighborhoodBaseName(
      draft.placement,
      draft.habitatGrouping,
    )
    const nameCount = (nameCounts.get(baseName) ?? 0) + 1
    nameCounts.set(baseName, nameCount)
    const name = nameCount === 1 ? baseName : `${baseName} ${nameCount}`

    return {
      neighborhoodId: `neighborhood-${draft.placement}-${index + 1}`,
      name,
      placement: draft.placement,
      families: [...draft.families].sort((left, right) =>
        left.familyId.localeCompare(right.familyId),
      ),
      pokemon: draft.pokemon,
      habitatGrouping: draft.habitatGrouping,
      topFavoriteCategories: getGroupFavoriteCategoryCoverage(draft.pokemon)
        .filter((coverage) => coverage.residentCount >= 2)
        .slice(0, 3),
      littererCount: countPokemonWithAbility(draft.pokemon, 'litter'),
      gathererCount: countPokemonWithAbility(draft.pokemon, 'gather'),
      waterCount: countPokemonWithAbility(draft.pokemon, 'water'),
      growCount: countPokemonWithAbility(draft.pokemon, 'grow'),
      lowPreferencePokemonCount: draft.pokemon.filter(
        (resident) =>
          resident.lindaStats.likeRating !== null &&
          resident.lindaStats.likeRating <= 2,
      ).length,
    }
  })
}

export const getNeighborhoodPlan = (
  pokemon: RegionRosterPokemon[],
): NeighborhoodPlan => {
  const familyProfiles = makeFamilyProfiles(pokemon)
  const initialDrafts = placementOrder.flatMap((placement) =>
    makePlacementDrafts(
      familyProfiles.filter(
        (family) => family.preferredPlacement === placement,
      ),
      placement,
    ),
  )
  const neighborhoods = finalizeNeighborhoods(
    mergeSingletonDrafts(repairLitterGatherBalance(initialDrafts)),
  )
  const litterNeighborhoods = neighborhoods.filter(
    (neighborhood) => neighborhood.littererCount > 0,
  )
  const issues = litterNeighborhoods.flatMap(
    (neighborhood): NeighborhoodRuleIssue[] =>
      neighborhood.gathererCount > 0
        ? []
        : [
            {
              kind: 'missing-gatherer',
              neighborhoodId: neighborhood.neighborhoodId,
              message: `${neighborhood.name} has litterers but no Gather family could be paired under the current placement rules.`,
            },
          ],
  )

  return {
    neighborhoods,
    familyCount: familyProfiles.length,
    pokemonCount: pokemon.length,
    litterNeighborhoodCount: litterNeighborhoods.length,
    balancedLitterNeighborhoodCount: litterNeighborhoods.filter(
      (neighborhood) => neighborhood.gathererCount > 0,
    ).length,
    issues,
  }
}
