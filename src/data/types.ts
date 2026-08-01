export type LindaPokemonRating = 1 | 2 | 3 | 4 | 5

export type LindaPokemonStats = {
  likeRating: LindaPokemonRating | null
  usefulnessRating: LindaPokemonRating | null
  belongsInCurrentRegion: boolean | null
}

export type PokopediaUserData = {
  version: 6
  updatedAt: string
  pokemonStatsBySlug: Record<string, LindaPokemonStats>
  rosterRegionOverrides: Record<string, string>
}
