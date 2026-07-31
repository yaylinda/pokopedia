import { createContext, useContext } from 'react'
import type {
  LindaPokemonStats,
  PokopediaUserData,
  SavedHouse,
} from './types'

export type UserDataContextValue = {
  ownedCount: number
  ownedSet: Set<string>
  pokemonStatsBySlug: Record<string, LindaPokemonStats>
  rosterRegionOverrides: Record<string, string>
  savedHouses: SavedHouse[]
  userData: PokopediaUserData
  deleteHouse: (houseId: string) => void
  resetRosterModel: () => void
  saveHouse: (house: SavedHouse) => void
  setPokemonRosterRegion: (slug: string, regionId: string | null) => void
  updatePokemonStats: (
    slug: string,
    update: Partial<LindaPokemonStats>,
  ) => void
  toggleOwned: (slug: string) => void
}

export const UserDataContext = createContext<UserDataContextValue | null>(null)

export const useUserData = () => {
  const context = useContext(UserDataContext)

  if (!context) {
    throw new Error('useUserData must be used within UserDataProvider')
  }

  return context
}
