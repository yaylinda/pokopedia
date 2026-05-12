import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { AppHeader } from './components/AppHeader'
import { HabitatExplorer } from './components/HabitatExplorer'
import {
  HousePlanner,
  type PlannerRosterMode,
} from './components/HousePlanner'
import { HomeDashboard } from './components/HomeDashboard'
import { type TabId } from './components/NavigationTabs'
import { PokemonExplorer, type OwnedFilter } from './components/PokemonExplorer'
import {
  datasetStats,
  favoriteCategoryById,
  habitats,
  idealHabitats,
  pokemonBySlug,
  pokemonProfiles,
  requirementsByHabitatId,
  spawnRecordsByPokemonSlug,
  spawnsByHabitatId,
  summarizeHouseDraft,
} from './data/pokopia'
import {
  parseUserData,
  readUserData,
  type SavedHouse,
  type PokopediaUserData,
  writeUserData,
} from './userData'
import { formatter, normalizeSearch } from './utils/format'

const createUserData = (
  ownedPokemonSlugs: string[],
  savedHouses: SavedHouse[],
): PokopediaUserData => ({
  version: 1,
  updatedAt: new Date().toISOString(),
  ownedPokemonSlugs: [...new Set(ownedPokemonSlugs)].sort(),
  savedHouses,
})

const createHouseId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `house-${Date.now()}-${Math.random().toString(36).slice(2)}`

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('home')
  const [userData, setUserData] = useState(readUserData)
  const [pokemonQuery, setPokemonQuery] = useState('')
  const [idealFilter, setIdealFilter] = useState('all')
  const [ownedFilter, setOwnedFilter] = useState<OwnedFilter>('all')
  const [selectedPokemonSlug, setSelectedPokemonSlug] = useState(
    pokemonProfiles[0]?.slug ?? '',
  )
  const [habitatQuery, setHabitatQuery] = useState('')
  const [selectedHabitatId, setSelectedHabitatId] = useState(
    habitats[0]?.habitatId ?? 1,
  )
  const [plannerRosterMode, setPlannerRosterMode] =
    useState<PlannerRosterMode>('all')
  const [houseSearchQuery, setHouseSearchQuery] = useState('')
  const [houseDraftName, setHouseDraftName] = useState('')
  const [houseDraftSlugs, setHouseDraftSlugs] = useState<string[]>([])
  const [selectedSavedHouseId, setSelectedSavedHouseId] = useState<
    string | null
  >(null)
  const [importMessage, setImportMessage] = useState('')
  const importInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    writeUserData(userData)
  }, [userData])

  const ownedSet = useMemo(
    () => new Set(userData.ownedPokemonSlugs),
    [userData.ownedPokemonSlugs],
  )

  const filteredPokemon = useMemo(() => {
    const query = normalizeSearch(pokemonQuery)

    return pokemonProfiles.filter((entry) => {
      const matchesQuery =
        !query ||
        entry.name.toLowerCase().includes(query) ||
        entry.pokopiaNumberDisplay.toLowerCase().includes(query) ||
        entry.specialties.some((specialty) =>
          specialty.name.toLowerCase().includes(query),
        ) ||
        entry.favorites.some((favorite) =>
          favorite.name.toLowerCase().includes(query),
        )

      const matchesIdeal =
        idealFilter === 'all' ||
        entry.idealHabitat?.idealHabitatId === idealFilter
      const matchesOwned =
        ownedFilter === 'all' ||
        (ownedFilter === 'owned' && ownedSet.has(entry.slug)) ||
        (ownedFilter === 'missing' && !ownedSet.has(entry.slug))

      return matchesQuery && matchesIdeal && matchesOwned
    })
  }, [idealFilter, ownedFilter, ownedSet, pokemonQuery])

  const selectedPokemon =
    pokemonProfiles.find((entry) => entry.slug === selectedPokemonSlug) ??
    filteredPokemon[0] ??
    pokemonProfiles[0]

  const selectedPokemonSpawns =
    spawnRecordsByPokemonSlug.get(selectedPokemon.slug) ?? []

  const filteredHabitats = useMemo(() => {
    const query = normalizeSearch(habitatQuery)

    return habitats.filter((habitat) => {
      const requirements =
        requirementsByHabitatId.get(habitat.habitatId)?.requirements ?? []
      const spawns = spawnsByHabitatId.get(habitat.habitatId)?.spawns ?? []

      return (
        !query ||
        habitat.name.toLowerCase().includes(query) ||
        habitat.description.toLowerCase().includes(query) ||
        requirements.some((requirement) =>
          requirement.itemName.toLowerCase().includes(query),
        ) ||
        spawns.some((spawn) => spawn.pokemonName.toLowerCase().includes(query))
      )
    })
  }, [habitatQuery])

  const selectedHabitat =
    habitats.find((habitat) => habitat.habitatId === selectedHabitatId) ??
    filteredHabitats[0] ??
    habitats[0]

  const selectedHabitatRequirements =
    requirementsByHabitatId.get(selectedHabitat.habitatId)?.requirements ?? []
  const selectedHabitatSpawns =
    spawnsByHabitatId.get(selectedHabitat.habitatId)?.spawns ?? []

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

  const housePokemonOptions = useMemo(() => {
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

  const selectedFavoriteDetails = selectedPokemon.favorites.map((favorite) => ({
    ...favorite,
    itemCount: favoriteCategoryById.get(favorite.favoriteId)?.itemCount ?? 0,
  }))

  const ownedCount = userData.ownedPokemonSlugs.length

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

  const saveHouse = () => {
    const name = houseDraftName.trim()

    if (!name || houseDraftSlugs.length === 0) {
      return
    }

    const now = new Date().toISOString()
    const uniqueSlugs = [...new Set(houseDraftSlugs)].slice(0, 4)
    const targetHouseId = selectedSavedHouseId ?? createHouseId()

    setUserData((current) => {
      const existingHouse = current.savedHouses.find(
        (house) => house.id === targetHouseId,
      )
      const savedHouse: SavedHouse = {
        id: targetHouseId,
        name,
        pokemonSlugs: uniqueSlugs,
        createdAt: existingHouse?.createdAt ?? now,
        updatedAt: now,
      }
      const savedHouses = existingHouse
        ? current.savedHouses.map((house) =>
            house.id === targetHouseId ? savedHouse : house,
          )
        : [savedHouse, ...current.savedHouses]

      return createUserData(current.ownedPokemonSlugs, savedHouses)
    })
    setSelectedSavedHouseId(targetHouseId)
  }

  const loadHouse = (houseId: string) => {
    const house = userData.savedHouses.find((entry) => entry.id === houseId)

    if (!house) {
      return
    }

    setHouseDraftName(house.name)
    setHouseDraftSlugs(house.pokemonSlugs)
    setSelectedSavedHouseId(house.id)
  }

  const deleteHouse = (houseId: string) => {
    setUserData((current) =>
      createUserData(
        current.ownedPokemonSlugs,
        current.savedHouses.filter((house) => house.id !== houseId),
      ),
    )

    if (selectedSavedHouseId === houseId) {
      clearHouseDraft()
    }
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

  const openPokemon = (slug = selectedPokemon.slug) => {
    setSelectedPokemonSlug(slug)
    setActiveTab('pokemon')
  }

  const openHabitats = (habitatId = selectedHabitat.habitatId) => {
    setSelectedHabitatId(habitatId)
    setActiveTab('habitats')
  }

  const openPlanner = () => setActiveTab('planner')

  return (
    <main className="app-shell">
      <AppHeader
        activeTab={activeTab}
        importInputRef={importInputRef}
        importMessage={importMessage}
        onExportData={exportUserData}
        onImportFile={(file) => {
          void importUserData(file)
        }}
        onTabChange={setActiveTab}
        ownedCount={ownedCount}
        totalPokemon={datasetStats.pokemon}
      />

      {activeTab === 'home' ? (
        <HomeDashboard
          lastSavedAt={userData.updatedAt}
          onOpenHabitats={() => openHabitats()}
          onOpenPlanner={openPlanner}
          onOpenPokemon={() => openPokemon()}
          ownedCount={ownedCount}
          totalPokemon={datasetStats.pokemon}
        />
      ) : null}

      {activeTab === 'pokemon' ? (
        <PokemonExplorer
          favoriteDetails={selectedFavoriteDetails}
          filteredPokemon={filteredPokemon}
          idealFilter={idealFilter}
          idealHabitats={idealHabitats}
          isSelectedOwned={ownedSet.has(selectedPokemon.slug)}
          onIdealFilterChange={setIdealFilter}
          onOwnedFilterChange={setOwnedFilter}
          onPokemonQueryChange={setPokemonQuery}
          onSelectPokemon={setSelectedPokemonSlug}
          onToggleOwned={toggleOwned}
          ownedFilter={ownedFilter}
          ownedSet={ownedSet}
          pokemonQuery={pokemonQuery}
          selectedPokemon={selectedPokemon}
          selectedPokemonSpawns={selectedPokemonSpawns}
        />
      ) : null}

      {activeTab === 'habitats' ? (
        <HabitatExplorer
          filteredHabitats={filteredHabitats}
          habitatQuery={habitatQuery}
          onHabitatQueryChange={setHabitatQuery}
          onSelectHabitat={setSelectedHabitatId}
          onSelectPokemon={openPokemon}
          selectedHabitat={selectedHabitat}
          selectedHabitatRequirements={selectedHabitatRequirements}
          selectedHabitatSpawns={selectedHabitatSpawns}
        />
      ) : null}

      {activeTab === 'planner' ? (
        <HousePlanner
          draftName={houseDraftName}
          draftPokemon={draftPokemon}
          draftSummary={draftSummary}
          houseSearchQuery={houseSearchQuery}
          onDeleteHouse={deleteHouse}
          onDraftNameChange={setHouseDraftName}
          onHouseSearchQueryChange={setHouseSearchQuery}
          onLoadHouse={loadHouse}
          onNewHouse={clearHouseDraft}
          onRosterModeChange={setPlannerRosterMode}
          onSaveHouse={saveHouse}
          onToggleDraftPokemon={toggleDraftPokemon}
          ownedSet={ownedSet}
          pokemonOptions={housePokemonOptions}
          plannerRosterMode={plannerRosterMode}
          savedHouses={userData.savedHouses}
          selectedSavedHouseId={selectedSavedHouseId}
        />
      ) : null}
    </main>
  )
}

export default App
