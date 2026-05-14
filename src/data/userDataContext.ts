import { createContext, useContext } from 'react'
import type { RefObject } from 'react'
import type { PokopediaUserData, SavedHouse } from './types'

export type UserDataContextValue = {
  importInputRef: RefObject<HTMLInputElement | null>
  importMessage: string
  ownedCount: number
  ownedSet: Set<string>
  savedHouses: SavedHouse[]
  userData: PokopediaUserData
  deleteHouse: (houseId: string) => void
  exportUserData: () => void
  importUserData: (file: File | undefined) => Promise<void>
  saveHouse: (house: SavedHouse) => void
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
