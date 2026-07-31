import type {
  LindaPokemonRating,
  LindaPokemonStats,
  PokopediaUserData,
  SavedHouse,
} from './types'

export const USER_DATA_STORAGE_KEY = 'pokopedia:user-data:v1'

export const createDefaultUserData = (): PokopediaUserData => ({
  version: 2,
  updatedAt: new Date().toISOString(),
  ownedPokemonSlugs: [],
  savedHouses: [],
  pokemonStatsBySlug: {},
  rosterRegionOverrides: {},
})

export const createUserData = (
  ownedPokemonSlugs: string[],
  savedHouses: SavedHouse[],
  pokemonStatsBySlug: Record<string, LindaPokemonStats>,
  rosterRegionOverrides: Record<string, string>,
): PokopediaUserData => ({
  version: 2,
  updatedAt: new Date().toISOString(),
  ownedPokemonSlugs: [...new Set(ownedPokemonSlugs)].sort(),
  savedHouses,
  pokemonStatsBySlug,
  rosterRegionOverrides,
})

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((entry) => typeof entry === 'string')

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

const parseSavedHouse = (value: unknown): SavedHouse | null => {
  if (!value || typeof value !== 'object') {
    return null
  }

  const maybeHouse = value as Partial<SavedHouse>

  if (
    typeof maybeHouse.id !== 'string' ||
    typeof maybeHouse.name !== 'string' ||
    !isStringArray(maybeHouse.pokemonSlugs)
  ) {
    return null
  }

  return {
    id: maybeHouse.id,
    name: maybeHouse.name.trim() || 'Untitled house',
    pokemonSlugs: [...new Set(maybeHouse.pokemonSlugs)].slice(0, 4),
    createdAt:
      typeof maybeHouse.createdAt === 'string'
        ? maybeHouse.createdAt
        : new Date().toISOString(),
    updatedAt:
      typeof maybeHouse.updatedAt === 'string'
        ? maybeHouse.updatedAt
        : new Date().toISOString(),
  }
}

export const parseUserData = (value: unknown): PokopediaUserData | null => {
  if (!value || typeof value !== 'object') {
    return null
  }

  const maybeData = value as Partial<PokopediaUserData>

  if (!isStringArray(maybeData.ownedPokemonSlugs)) {
    return null
  }

  return {
    version: 2,
    updatedAt:
      typeof maybeData.updatedAt === 'string'
        ? maybeData.updatedAt
        : new Date().toISOString(),
    ownedPokemonSlugs: [...new Set(maybeData.ownedPokemonSlugs)].sort(),
    savedHouses: Array.isArray(maybeData.savedHouses)
      ? maybeData.savedHouses
          .map(parseSavedHouse)
          .filter((house): house is SavedHouse => house !== null)
      : [],
    pokemonStatsBySlug: parsePokemonStatsBySlug(maybeData.pokemonStatsBySlug),
    rosterRegionOverrides: parseStringRecord(maybeData.rosterRegionOverrides),
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
