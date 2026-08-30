import type { RegionRosterPokemon } from '../../data/currentRegionRoster'

export const usefulAbilitySlugs = [
  'grow',
  'litter',
  'crush',
  'chop',
  'burn',
  'gather',
  'scrub',
  'recycle',
] as const

export type UsefulAbilitySlug = (typeof usefulAbilitySlugs)[number]

export type GroupingStudioNeighborhood = {
  neighborhoodId: string
  name: string
  familyIds: string[]
}

export type GroupingStudioScope = {
  snapshotId: string
  regionId: string
  neighborhoods: GroupingStudioNeighborhood[]
}

export type GroupingStudioDocument = {
  schemaVersion: 1
  updatedAt: string
  scopes: Record<string, GroupingStudioScope>
}

const usefulAbilitySlugSet = new Set<string>(usefulAbilitySlugs)

export const getGroupingStudioScopeKey = (
  snapshotId: string,
  regionId: string,
) => `${snapshotId}:${regionId}`

export const createGroupingStudioDocument = (): GroupingStudioDocument => ({
  schemaVersion: 1,
  updatedAt: new Date(0).toISOString(),
  scopes: {},
})

const parseString = (value: unknown) =>
  typeof value === 'string' ? value.trim() : ''

const parseScope = (
  value: unknown,
  fallbackScopeKey: string,
): GroupingStudioScope | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null

  const candidate = value as Partial<GroupingStudioScope>
  const [fallbackSnapshotId = '', fallbackRegionId = ''] =
    fallbackScopeKey.split(':')
  const snapshotId = parseString(candidate.snapshotId) || fallbackSnapshotId
  const regionId = parseString(candidate.regionId) || fallbackRegionId
  const assignedFamilyIds = new Set<string>()
  const seenNeighborhoodIds = new Set<string>()
  const neighborhoods = Array.isArray(candidate.neighborhoods)
    ? candidate.neighborhoods.flatMap(
        (value, index): GroupingStudioNeighborhood[] => {
          if (!value || typeof value !== 'object' || Array.isArray(value)) {
            return []
          }

          const neighborhood = value as Partial<GroupingStudioNeighborhood>
          const neighborhoodId = parseString(neighborhood.neighborhoodId)
          if (!neighborhoodId || seenNeighborhoodIds.has(neighborhoodId)) {
            return []
          }
          seenNeighborhoodIds.add(neighborhoodId)

          const familyIds = Array.isArray(neighborhood.familyIds)
            ? neighborhood.familyIds.flatMap((familyId): string[] => {
                const parsedFamilyId = parseString(familyId)
                if (!parsedFamilyId || assignedFamilyIds.has(parsedFamilyId)) {
                  return []
                }
                assignedFamilyIds.add(parsedFamilyId)
                return [parsedFamilyId]
              })
            : []

          return [
            {
              neighborhoodId,
              name:
                parseString(neighborhood.name) || `Neighborhood ${index + 1}`,
              familyIds,
            },
          ]
        },
      )
    : []

  if (!snapshotId || !regionId) return null
  return { snapshotId, regionId, neighborhoods }
}

export const parseGroupingStudioDocument = (
  value: unknown,
): GroupingStudioDocument => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return createGroupingStudioDocument()
  }

  const candidate = value as Partial<GroupingStudioDocument>
  const scopes =
    candidate.scopes &&
    typeof candidate.scopes === 'object' &&
    !Array.isArray(candidate.scopes)
      ? Object.fromEntries(
          Object.entries(candidate.scopes).flatMap(([scopeKey, scope]) => {
            const parsedScope = parseScope(scope, scopeKey)
            return parsedScope ? [[scopeKey, parsedScope]] : []
          }),
        )
      : {}

  return {
    schemaVersion: 1,
    updatedAt:
      typeof candidate.updatedAt === 'string'
        ? candidate.updatedAt
        : new Date(0).toISOString(),
    scopes,
  }
}

export const getGroupingStudioScope = (
  document: GroupingStudioDocument,
  snapshotId: string,
  regionId: string,
): GroupingStudioScope =>
  document.scopes[getGroupingStudioScopeKey(snapshotId, regionId)] ?? {
    snapshotId,
    regionId,
    neighborhoods: [],
  }

export const updateGroupingStudioScope = (
  document: GroupingStudioDocument,
  scope: GroupingStudioScope,
): GroupingStudioDocument => ({
  ...document,
  updatedAt: new Date().toISOString(),
  scopes: {
    ...document.scopes,
    [getGroupingStudioScopeKey(scope.snapshotId, scope.regionId)]: scope,
  },
})

export const normalizeGroupingStudioScope = (
  scope: GroupingStudioScope,
  validFamilyIds: Set<string>,
): GroupingStudioScope => {
  const assignedFamilyIds = new Set<string>()

  return {
    ...scope,
    neighborhoods: scope.neighborhoods.map((neighborhood) => ({
      ...neighborhood,
      familyIds: neighborhood.familyIds.filter((familyId) => {
        if (!validFamilyIds.has(familyId) || assignedFamilyIds.has(familyId)) {
          return false
        }
        assignedFamilyIds.add(familyId)
        return true
      }),
    })),
  }
}

export const getUsefulFamilyAbilitySlugs = (
  pokemon: RegionRosterPokemon[],
): UsefulAbilitySlug[] => {
  const familyAbilitySlugs = new Set(
    pokemon.flatMap((resident) =>
      resident.specialties.map((ability) => ability.slug),
    ),
  )

  return usefulAbilitySlugs.filter((slug) => familyAbilitySlugs.has(slug))
}

export const matchesGroupingStudioQuery = (
  pokemon: RegionRosterPokemon[],
  normalizedQuery: string,
) => {
  if (!normalizedQuery) return true

  return pokemon.some((resident) =>
    [
      resident.name,
      resident.idealHabitat?.name,
      ...resident.specialties.map((ability) => ability.name),
      ...resident.favorites.map((favorite) => favorite.name),
    ].some((value) =>
      value?.toLocaleLowerCase().includes(normalizedQuery),
    ),
  )
}

export const isUsefulAbilitySlug = (
  abilitySlug: string,
): abilitySlug is UsefulAbilitySlug => usefulAbilitySlugSet.has(abilitySlug)
