import { useMemo, useState } from 'react'
import {
  pokemonBySlug,
  pokemonProfiles,
  summarizeHouseDraft,
} from '../../../data/pokopia'
import { useUserData } from '../../../data/userDataContext'
import type { SavedHouse } from '../../../data/types'

const createHouseId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `house-${Date.now()}-${Math.random().toString(36).slice(2)}`

const createAutomaticHouseName = (pokemonSlugs: string[]) =>
  pokemonSlugs.map((slug) => pokemonBySlug.get(slug)?.name ?? slug).join(' + ')

export function useHousePlannerState() {
  const { deleteHouse, savedHouses, saveHouse } = useUserData()
  const [houseDraftName, setHouseDraftName] = useState('')
  const [isHouseDraftNameEdited, setIsHouseDraftNameEdited] = useState(false)
  const [houseDraftSlugs, setHouseDraftSlugs] = useState<string[]>([])
  const [selectedSavedHouseId, setSelectedSavedHouseId] = useState<
    string | null
  >(null)

  const draftPokemon = useMemo(
    () =>
      houseDraftSlugs
        .map((slug) => pokemonBySlug.get(slug))
        .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry)),
    [houseDraftSlugs],
  )

  const draftSummary = useMemo(
    () => summarizeHouseDraft(draftPokemon),
    [draftPokemon],
  )

  const updateHouseDraftName = (name: string) => {
    setIsHouseDraftNameEdited(true)
    setHouseDraftName(name)
  }

  const toggleDraftPokemon = (slug: string) => {
    let nextSlugs = houseDraftSlugs

    if (houseDraftSlugs.includes(slug)) {
      nextSlugs = houseDraftSlugs.filter((entry) => entry !== slug)
    } else if (houseDraftSlugs.length < 4) {
      nextSlugs = [...houseDraftSlugs, slug]
    }

    setHouseDraftSlugs(nextSlugs)

    if (!isHouseDraftNameEdited) {
      setHouseDraftName(createAutomaticHouseName(nextSlugs))
    }
  }

  const clearHouseDraft = () => {
    setHouseDraftName('')
    setIsHouseDraftNameEdited(false)
    setHouseDraftSlugs([])
    setSelectedSavedHouseId(null)
  }

  const saveDraft = () => {
    const name = houseDraftName.trim()

    if (!name || houseDraftSlugs.length === 0) {
      return
    }

    const now = new Date().toISOString()
    const uniqueSlugs = [...new Set(houseDraftSlugs)].slice(0, 4)
    const targetHouseId = selectedSavedHouseId ?? createHouseId()
    const existingHouse = savedHouses.find(
      (house) => house.id === targetHouseId,
    )
    const savedHouse: SavedHouse = {
      id: targetHouseId,
      name,
      pokemonSlugs: uniqueSlugs,
      createdAt: existingHouse?.createdAt ?? now,
      updatedAt: now,
    }

    saveHouse(savedHouse)
    setSelectedSavedHouseId(targetHouseId)
  }

  const loadHouse = (houseId: string) => {
    const house = savedHouses.find((entry) => entry.id === houseId)

    if (!house) {
      return
    }

    setHouseDraftName(house.name)
    setIsHouseDraftNameEdited(true)
    setHouseDraftSlugs(house.pokemonSlugs)
    setSelectedSavedHouseId(house.id)
  }

  const deleteSavedHouse = (houseId: string) => {
    deleteHouse(houseId)

    if (selectedSavedHouseId === houseId) {
      clearHouseDraft()
    }
  }

  return {
    clearHouseDraft,
    deleteSavedHouse,
    draftName: houseDraftName,
    draftPokemon,
    draftSummary,
    loadHouse,
    pokemonOptions: pokemonProfiles,
    savedHouses,
    saveDraft,
    selectedSavedHouseId,
    setHouseDraftName: updateHouseDraftName,
    toggleDraftPokemon,
  }
}
