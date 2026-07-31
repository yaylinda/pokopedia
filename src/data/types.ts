export type SavedHouse = {
  id: string
  name: string
  pokemonSlugs: string[]
  createdAt: string
  updatedAt: string
}

export type LindaPokemonRating = 1 | 2 | 3 | 4 | 5

export type LindaPokemonStats = {
  likeRating: LindaPokemonRating | null
  usefulnessRating: LindaPokemonRating | null
  belongsInCurrentRegion: boolean | null
}

export type PokopediaUserData = {
  version: 2
  updatedAt: string
  ownedPokemonSlugs: string[]
  savedHouses: SavedHouse[]
  pokemonStatsBySlug: Record<string, LindaPokemonStats>
  rosterRegionOverrides: Record<string, string>
}
