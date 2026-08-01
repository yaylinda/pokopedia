import { useEffect, useState, type ReactNode } from 'react'
import {
  createUserData,
  readUserData,
  writeUserData,
} from './userData'
import type { LindaPokemonStats } from './types'
import { UserDataContext, type UserDataContextValue } from './userDataContext'

export function UserDataProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState(readUserData)

  useEffect(() => {
    writeUserData(userData)
  }, [userData])

  const updatePokemonStats = (
    slug: string,
    update: Partial<LindaPokemonStats>,
  ) => {
    setUserData((current) => {
      const currentStats = current.pokemonStatsBySlug[slug] ?? {
        likeRating: null,
        usefulnessRating: null,
        belongsInCurrentRegion: null,
      }
      const nextStats = { ...currentStats, ...update }
      const pokemonStatsBySlug = {
        ...current.pokemonStatsBySlug,
        [slug]: nextStats,
      }

      if (
        nextStats.likeRating === null &&
        nextStats.usefulnessRating === null &&
        nextStats.belongsInCurrentRegion === null
      ) {
        delete pokemonStatsBySlug[slug]
      }

      return createUserData(pokemonStatsBySlug, current.rosterRegionOverrides)
    })
  }

  const setPokemonRosterRegion = (slug: string, regionId: string | null) => {
    setUserData((current) => {
      const rosterRegionOverrides = { ...current.rosterRegionOverrides }

      if (regionId) {
        rosterRegionOverrides[slug] = regionId
      } else {
        delete rosterRegionOverrides[slug]
      }

      return createUserData(current.pokemonStatsBySlug, rosterRegionOverrides)
    })
  }

  const resetRosterModel = () => {
    setUserData((current) =>
      createUserData(current.pokemonStatsBySlug, {}),
    )
  }

  const value: UserDataContextValue = {
    pokemonStatsBySlug: userData.pokemonStatsBySlug,
    resetRosterModel,
    rosterRegionOverrides: userData.rosterRegionOverrides,
    setPokemonRosterRegion,
    updatePokemonStats,
  }

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  )
}
