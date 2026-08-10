import type {
  LindaPokemonRating,
  LindaPokemonStats,
  PokopediaUserData,
  RosterGroup,
  RosterGroupsByScope,
} from './types'
import { legendaryOrMythicalPokemonSlugs } from './currentRegionRoster'

export const USER_DATA_STORAGE_KEY = 'pokopedia:user-data:v1'

export const createDefaultUserData = (): PokopediaUserData => ({
  version: 8,
  updatedAt: new Date().toISOString(),
  pokemonStatsBySlug: {},
  rosterRegionOverrides: {},
  rosterGroupsByScope: {},
})

export const createUserData = (
  pokemonStatsBySlug: Record<string, LindaPokemonStats>,
  rosterRegionOverrides: Record<string, string>,
  rosterGroupsByScope: RosterGroupsByScope,
): PokopediaUserData => ({
  version: 8,
  updatedAt: new Date().toISOString(),
  pokemonStatsBySlug,
  rosterRegionOverrides,
  rosterGroupsByScope,
})

const parseRating = (value: unknown): LindaPokemonRating | null =>
  typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 5
    ? (value as LindaPokemonRating)
    : null

const parsePokemonStats = (value: unknown): LindaPokemonStats | null => {
  if (!value || typeof value !== 'object') return null

  const maybeStats = value as Partial<LindaPokemonStats>

  return {
    likeRating: parseRating(maybeStats.likeRating),
    usefulnessRating: parseRating(maybeStats.usefulnessRating),
    belongsInCurrentRegion:
      typeof maybeStats.belongsInCurrentRegion === 'boolean'
        ? maybeStats.belongsInCurrentRegion
        : null,
  }
}

const parsePokemonStatsBySlug = (
  value: unknown,
): Record<string, LindaPokemonStats> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}

  return Object.fromEntries(
    Object.entries(value).flatMap(([slug, stats]) => {
      const parsed = parsePokemonStats(stats)
      return parsed ? [[slug, parsed]] : []
    }),
  )
}

const parseStringRecord = (value: unknown): Record<string, string> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}

  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string',
    ),
  )
}

const parseRosterGroupsByScope = (value: unknown): RosterGroupsByScope => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}

  return Object.fromEntries(
    Object.entries(value).flatMap(([scopeKey, maybeGroups]) => {
      if (!scopeKey || !Array.isArray(maybeGroups)) return []

      const seenGroupIds = new Set<string>()
      const assignedPokemon = new Set<string>()
      const groups = maybeGroups.flatMap((maybeGroup, index): RosterGroup[] => {
        if (!maybeGroup || typeof maybeGroup !== 'object') return []

        const candidate = maybeGroup as Partial<RosterGroup>
        const groupId =
          typeof candidate.groupId === 'string' ? candidate.groupId.trim() : ''

        if (!groupId || seenGroupIds.has(groupId)) return []
        seenGroupIds.add(groupId)

        const pokemonSlugs: string[] = []

        if (Array.isArray(candidate.pokemonSlugs)) {
          candidate.pokemonSlugs.forEach((slug) => {
            if (
              typeof slug !== 'string' ||
              !slug ||
              assignedPokemon.has(slug) ||
              pokemonSlugs.includes(slug) ||
              pokemonSlugs.length >= 4
            ) {
              return
            }

            assignedPokemon.add(slug)
            pokemonSlugs.push(slug)
          })
        }
        const name =
          typeof candidate.name === 'string' && candidate.name.trim()
            ? candidate.name.trim()
            : `Group ${index + 1}`

        return [{ groupId, name, pokemonSlugs }]
      })

      return groups.length > 0 ? [[scopeKey, groups]] : []
    }),
  )
}

export const parseUserData = (value: unknown): PokopediaUserData | null => {
  if (!value || typeof value !== 'object') {
    return null
  }

  const maybeData = value as Partial<PokopediaUserData>
  const pokemonStatsBySlug = parsePokemonStatsBySlug(
    maybeData.pokemonStatsBySlug,
  )
  const storedVersion =
    typeof maybeData.version === 'number' ? Number(maybeData.version) : 0
  const shouldNormalizeLindaRatings = storedVersion < 7

  return {
    version: 8,
    updatedAt:
      !shouldNormalizeLindaRatings && typeof maybeData.updatedAt === 'string'
        ? maybeData.updatedAt
        : new Date().toISOString(),
    pokemonStatsBySlug: shouldNormalizeLindaRatings
      ? Object.fromEntries(
          Object.entries(pokemonStatsBySlug).map(([slug, stats]) => [
            slug,
            {
              ...stats,
              likeRating: legendaryOrMythicalPokemonSlugs.has(slug) ? 5 : 3,
              usefulnessRating: null,
            },
          ]),
        )
      : pokemonStatsBySlug,
    rosterRegionOverrides: parseStringRecord(maybeData.rosterRegionOverrides),
    rosterGroupsByScope: parseRosterGroupsByScope(
      maybeData.rosterGroupsByScope,
    ),
  }
}

export const readUserData = (): PokopediaUserData => {
  const stored = window.localStorage.getItem(USER_DATA_STORAGE_KEY)

  if (!stored) {
    return createDefaultUserData()
  }

  try {
    const parsed = parseUserData(JSON.parse(stored))

    return parsed ?? createDefaultUserData()
  } catch {
    return createDefaultUserData()
  }
}

export const writeUserData = (data: PokopediaUserData) => {
  window.localStorage.setItem(USER_DATA_STORAGE_KEY, JSON.stringify(data))
}
