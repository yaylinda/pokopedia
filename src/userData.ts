export type PokopediaUserData = {
  version: 1
  updatedAt: string
  ownedPokemonSlugs: string[]
}

export const USER_DATA_STORAGE_KEY = 'pokopedia:user-data:v1'

export const createDefaultUserData = (): PokopediaUserData => ({
  version: 1,
  updatedAt: new Date().toISOString(),
  ownedPokemonSlugs: [],
})

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((entry) => typeof entry === 'string')

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
