import { createContext, useContext } from 'react'
import type {
  LindaPokemonStats,
  RosterGroup,
  RosterGroupsByScope,
} from './types'

export type UserDataContextValue = {
  pokemonStatsBySlug: Record<string, LindaPokemonStats>
  rosterGroupsByScope: RosterGroupsByScope
  rosterRegionOverrides: Record<string, string>
  resetRosterModel: () => void
  setRosterGroups: (scopeKey: string, groups: RosterGroup[]) => void
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
