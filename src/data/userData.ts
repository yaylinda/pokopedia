import type { PokopediaUserData, SavedHouse } from './types'

export const USER_DATA_STORAGE_KEY = 'pokopedia:user-data:v1'

export const createDefaultUserData = (): PokopediaUserData => ({
  version: 1,
  updatedAt: new Date().toISOString(),
  ownedPokemonSlugs: [],
  savedHouses: [],
})

export const createUserData = (
  ownedPokemonSlugs: string[],
  savedHouses: SavedHouse[],
): PokopediaUserData => ({
  version: 1,
  updatedAt: new Date().toISOString(),
  ownedPokemonSlugs: [...new Set(ownedPokemonSlugs)].sort(),
  savedHouses,
})

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((entry) => typeof entry === 'string')

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
    version: 1,
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
