export type SavedHouse = {
  id: string
  name: string
  pokemonSlugs: string[]
  createdAt: string
  updatedAt: string
}

export type PokopediaUserData = {
  version: 1
  updatedAt: string
  ownedPokemonSlugs: string[]
  savedHouses: SavedHouse[]
}
