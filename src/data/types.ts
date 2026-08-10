export type LindaPokemonRating = 1 | 2 | 3 | 4 | 5

export type LindaPokemonStats = {
  likeRating: LindaPokemonRating | null
  usefulnessRating: LindaPokemonRating | null
  belongsInCurrentRegion: boolean | null
}

export type RosterGroup = {
  groupId: string
  name: string
  pokemonSlugs: string[]
}

export type RosterGroupsByScope = Record<string, RosterGroup[]>

export type PokopediaUserData = {
  version: 8
  updatedAt: string
  pokemonStatsBySlug: Record<string, LindaPokemonStats>
  rosterRegionOverrides: Record<string, string>
  rosterGroupsByScope: RosterGroupsByScope
}
