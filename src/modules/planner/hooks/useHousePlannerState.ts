import { useMemo, useState } from 'react'
import {
  pokemonBySlug,
  pokemonProfiles,
  summarizeHouseDraft,
} from '../../../data/pokopia'
import { useUserData } from '../../../data/userDataContext'
import type { SavedHouse } from '../../../data/types'
import { normalizeSearch } from '../../../utils/format'
import type { PlannerRosterMode } from '../components/HousePlanner'

const createHouseId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `house-${Date.now()}-${Math.random().toString(36).slice(2)}`

export function useHousePlannerState() {
  const { deleteHouse, ownedSet, savedHouses, saveHouse } = useUserData()
  const [plannerRosterMode, setPlannerRosterMode] =
    useState<PlannerRosterMode>('all')
  const [houseSearchQuery, setHouseSearchQuery] = useState('')
  const [houseDraftName, setHouseDraftName] = useState('')
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

  const pokemonOptions = useMemo(() => {
    const query = normalizeSearch(houseSearchQuery)

    return pokemonProfiles.filter((entry) => {
      const matchesRoster =
        plannerRosterMode === 'all' || ownedSet.has(entry.slug)
      const matchesQuery =
        !query ||
        entry.name.toLowerCase().includes(query) ||
        entry.pokopiaNumberDisplay.toLowerCase().includes(query) ||
        entry.idealHabitat?.name.toLowerCase().includes(query) ||
        entry.favorites.some((favorite) =>
          favorite.name.toLowerCase().includes(query),
        )

      return matchesRoster && matchesQuery
    })
  }, [houseSearchQuery, ownedSet, plannerRosterMode])

  const toggleDraftPokemon = (slug: string) => {
    setHouseDraftSlugs((current) => {
      if (current.includes(slug)) {
        return current.filter((entry) => entry !== slug)
      }

      if (current.length >= 4) {
        return current
      }

      return [...current, slug]
    })
  }

  const clearHouseDraft = () => {
    setHouseDraftName('')
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
    houseSearchQuery,
    loadHouse,
    ownedSet,
    plannerRosterMode,
    pokemonOptions,
    savedHouses,
    saveDraft,
    selectedSavedHouseId,
    setHouseDraftName,
    setHouseSearchQuery,
    setPlannerRosterMode,
    toggleDraftPokemon,
  }
}
