import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  createUserData,
  readUserData,
  writeUserData,
} from './userData'
import type { LindaPokemonStats, SavedHouse } from './types'
import { UserDataContext, type UserDataContextValue } from './userDataContext'

export function UserDataProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState(readUserData)

  useEffect(() => {
    writeUserData(userData)
  }, [userData])

  const ownedSet = useMemo(
    () => new Set(userData.ownedPokemonSlugs),
    [userData.ownedPokemonSlugs],
  )

  const toggleOwned = (slug: string) => {
    setUserData((current) => {
      const nextOwned = new Set(current.ownedPokemonSlugs)

      if (nextOwned.has(slug)) {
        nextOwned.delete(slug)
      } else {
        nextOwned.add(slug)
      }

      return createUserData(
        [...nextOwned],
        current.savedHouses,
        current.pokemonStatsBySlug,
        current.rosterRegionOverrides,
      )
    })
  }

  const saveHouse = (savedHouse: SavedHouse) => {
    setUserData((current) => {
      const exists = current.savedHouses.some(
        (house) => house.id === savedHouse.id,
      )
      const savedHouses = exists
        ? current.savedHouses.map((house) =>
            house.id === savedHouse.id ? savedHouse : house,
          )
        : [savedHouse, ...current.savedHouses]

      return createUserData(
        current.ownedPokemonSlugs,
        savedHouses,
        current.pokemonStatsBySlug,
        current.rosterRegionOverrides,
      )
    })
  }

  const deleteHouse = (houseId: string) => {
    setUserData((current) =>
      createUserData(
        current.ownedPokemonSlugs,
        current.savedHouses.filter((house) => house.id !== houseId),
        current.pokemonStatsBySlug,
        current.rosterRegionOverrides,
      ),
    )
  }

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

      return createUserData(
        current.ownedPokemonSlugs,
        current.savedHouses,
        pokemonStatsBySlug,
        current.rosterRegionOverrides,
      )
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

      return createUserData(
        current.ownedPokemonSlugs,
        current.savedHouses,
        current.pokemonStatsBySlug,
        rosterRegionOverrides,
      )
    })
  }

  const resetRosterModel = () => {
    setUserData((current) =>
      createUserData(
        current.ownedPokemonSlugs,
        current.savedHouses,
        current.pokemonStatsBySlug,
        {},
      ),
    )
  }

  const value: UserDataContextValue = {
    deleteHouse,
    ownedCount: userData.ownedPokemonSlugs.length,
    ownedSet,
    pokemonStatsBySlug: userData.pokemonStatsBySlug,
    resetRosterModel,
    rosterRegionOverrides: userData.rosterRegionOverrides,
    savedHouses: userData.savedHouses,
    saveHouse,
    setPokemonRosterRegion,
    toggleOwned,
    updatePokemonStats,
    userData,
  }

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  )
}
