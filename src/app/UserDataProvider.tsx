import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { pokemonProfiles } from '../data/pokopia'
import {
  createUserData,
  parseUserData,
  readUserData,
  type SavedHouse,
  writeUserData,
} from '../userData'
import { formatter } from '../utils/format'
import { UserDataContext, type UserDataContextValue } from './userDataContext'

export function UserDataProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState(readUserData)
  const [importMessage, setImportMessage] = useState('')
  const importInputRef = useRef<HTMLInputElement>(null)

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

  const exportUserData = () => {
    const blob = new Blob([JSON.stringify(userData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')

    anchor.href = url
    anchor.download = 'pokopedia-user-data.json'
    anchor.click()
    URL.revokeObjectURL(url)
    setImportMessage('Exported your tracker JSON.')
  }

  const importUserData = async (file: File | undefined) => {
    if (!file) {
      return
    }

    try {
      const parsed = parseUserData(JSON.parse(await file.text()))

      if (!parsed) {
        setImportMessage('That JSON did not match the Pokopedia user format.')
        return
      }

      const validSlugs = new Set(pokemonProfiles.map((entry) => entry.slug))
      const ownedPokemonSlugs = parsed.ownedPokemonSlugs.filter((slug) =>
        validSlugs.has(slug),
      )
      const savedHouses = parsed.savedHouses
        .map((house) => ({
          ...house,
          pokemonSlugs: house.pokemonSlugs.filter((slug) =>
            validSlugs.has(slug),
          ),
        }))
        .filter((house) => house.pokemonSlugs.length > 0)

      setUserData(createUserData(ownedPokemonSlugs, savedHouses))
      setImportMessage(
        `Imported ${formatter.format(ownedPokemonSlugs.length)} owned Pokemon and ${formatter.format(savedHouses.length)} houses.`,
      )
    } catch {
      setImportMessage('That file could not be read as JSON.')
    } finally {
      if (importInputRef.current) {
        importInputRef.current.value = ''
      }
    }
  }

  const value: UserDataContextValue = {
    deleteHouse,
    exportUserData,
    importInputRef,
    importMessage,
    importUserData,
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
