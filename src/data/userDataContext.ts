import { createContext, useContext } from 'react'
import type { LindaPokemonStats } from './types'

export type UserDataContextValue = {
  pokemonStatsBySlug: Record<string, LindaPokemonStats>
  rosterRegionOverrides: Record<string, string>
  resetRosterModel: () => void
  setPokemonRosterRegion: (slug: string, regionId: string | null) => void
  updatePokemonStats: (
    slug: string,
    update: Partial<LindaPokemonStats>,
  ) => void
}

export const UserDataContext = createContext<UserDataContextValue | null>(null)

export const useUserData = () => {
  const context = useContext(UserDataContext)

  if (!context) {
    throw new Error('useUserData must be used within UserDataProvider')
  }

  return context
}
