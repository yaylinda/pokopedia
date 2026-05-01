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
  generateHousePlans,
  habitats,
  idealHabitats,
  pokemonProfiles,
  requirementsByHabitatId,
  spawnRecordsByPokemonSlug,
  spawnsByHabitatId,
} from './data/pokopia'
import {
  parseUserData,
  readUserData,
  type PokopediaUserData,
  writeUserData,
} from './userData'
import { formatter, normalizeSearch } from './utils/format'

const createUserDataWithOwned = (
  ownedPokemonSlugs: string[],
): PokopediaUserData => ({
  version: 1,
  updatedAt: new Date().toISOString(),
  ownedPokemonSlugs: [...new Set(ownedPokemonSlugs)].sort(),
})

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
  const [plannerIdealFilter, setPlannerIdealFilter] = useState('all')
  const [plannerRosterMode, setPlannerRosterMode] =
    useState<PlannerRosterMode>('all')
  const [buildAroundSelected, setBuildAroundSelected] = useState(false)
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

  const plannerCandidates = useMemo(() => {
    return pokemonProfiles.filter((entry) => {
      const matchesIdeal =
        plannerIdealFilter === 'all' ||
        entry.idealHabitat?.idealHabitatId === plannerIdealFilter
      const matchesRoster =
        plannerRosterMode === 'all' || ownedSet.has(entry.slug)

      return matchesIdeal && matchesRoster
    })
  }, [ownedSet, plannerIdealFilter, plannerRosterMode])

  const housePlans = useMemo(() => {
    const plans = generateHousePlans(plannerCandidates, 12)

    if (!buildAroundSelected) {
      return plans
    }

    return plans.filter((plan) =>
      plan.pokemon.some((entry) => entry.slug === selectedPokemon.slug),
    )
  }, [buildAroundSelected, plannerCandidates, selectedPokemon.slug])

  const selectedFavoriteDetails = selectedPokemon.favorites.map((favorite) => ({
    ...favorite,
    itemCount: favoriteCategoryById.get(favorite.favoriteId)?.itemCount ?? 0,
  }))

  const ownedCount = userData.ownedPokemonSlugs.length

  const toggleOwned = (slug: string) => {
    const nextOwned = new Set(userData.ownedPokemonSlugs)

    if (nextOwned.has(slug)) {
      nextOwned.delete(slug)
    } else {
      nextOwned.add(slug)
    }

    setUserData(createUserDataWithOwned([...nextOwned]))
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

      setUserData(createUserDataWithOwned(ownedPokemonSlugs))
      setImportMessage(
        `Imported ${formatter.format(ownedPokemonSlugs.length)} owned Pokemon.`,
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
          buildAroundSelected={buildAroundSelected}
          housePlans={housePlans}
          idealHabitats={idealHabitats}
          onBuildAroundSelectedChange={setBuildAroundSelected}
          onIdealFilterChange={setPlannerIdealFilter}
          onRosterModeChange={setPlannerRosterMode}
          onSelectPokemon={openPokemon}
          ownedSet={ownedSet}
          plannerIdealFilter={plannerIdealFilter}
          plannerRosterMode={plannerRosterMode}
          selectedPokemon={selectedPokemon}
        />
      ) : null}
    </main>
  )
}

export default App
