import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  createUserData,
  readUserData,
  writeUserData,
} from './userData'
import type { SavedHouse } from './types'
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

      return createUserData([...nextOwned], current.savedHouses)
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

      return createUserData(current.ownedPokemonSlugs, savedHouses)
    })
  }

  const deleteHouse = (houseId: string) => {
    setUserData((current) =>
      createUserData(
        current.ownedPokemonSlugs,
        current.savedHouses.filter((house) => house.id !== houseId),
      ),
    )
  }

  const value: UserDataContextValue = {
    deleteHouse,
    ownedCount: userData.ownedPokemonSlugs.length,
    ownedSet,
    savedHouses: userData.savedHouses,
    saveHouse,
    toggleOwned,
    userData,
  }

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  )
}
