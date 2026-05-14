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
import { getBasePath, tabRoutes } from './routing'

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

const tabByRoute = new Map(
  Object.entries(tabRoutes).map(([tabId, route]) => [route, tabId as TabId]),
)

const getRelativePath = (pathname: string) => {
  const basePath = getBasePath()
  const baseRoot = basePath.replace(/\/$/, '')
  let relativePath = pathname

  if (baseRoot && relativePath.startsWith(baseRoot)) {
    relativePath = relativePath.slice(baseRoot.length) || '/'
  }

  if (!relativePath.startsWith('/')) {
    relativePath = `/${relativePath}`
  }

  return relativePath.replace(/\/$/, '') || '/'
}

const getPokemonSlugFromParam = (pokemonId: string | null) => {
  if (!pokemonId) {
    return null
  }

  return (
    pokemonProfiles.find(
      (entry) =>
        String(entry.pokemonId) === pokemonId ||
        entry.pokemonIdDisplay === pokemonId ||
        entry.slug === pokemonId,
    )?.slug ?? null
  )
}

const getHabitatIdFromParam = (habitatId: string | null) => {
  if (!habitatId) {
    return null
  }

  const numericId = Number(habitatId)

  return habitats.some((habitat) => habitat.habitatId === numericId)
    ? numericId
    : null
}

const readRouteState = () => {
  const url = new URL(window.location.href)
  const routeOverride = url.searchParams.get('route')
  const routePath = routeOverride ?? getRelativePath(url.pathname)
  const tab = tabByRoute.get(routePath.replace(/\/$/, '') || '/') ?? 'home'
  const pokemonSlug = getPokemonSlugFromParam(url.searchParams.get('pokemonId'))
  const habitatId = getHabitatIdFromParam(url.searchParams.get('habitatId'))

  return { habitatId, pokemonSlug, tab }
}

const buildRouteUrl = (
  tab: TabId,
  pokemonSlug: string,
  habitatId: number,
  includeSelection = false,
) => {
  const basePath = getBasePath()
  const route = tabRoutes[tab]
  const path =
    route === '/' ? basePath : `${basePath.replace(/\/$/, '')}${route}`
  const url = new URL(path, window.location.origin)

  if (includeSelection && tab === 'pokemon') {
    const pokemonId = pokemonBySlug.get(pokemonSlug)?.pokemonId

    if (pokemonId) {
      url.searchParams.set('pokemonId', String(pokemonId))
    }
  }

  if (includeSelection && tab === 'habitats') {
    url.searchParams.set('habitatId', String(habitatId))
  }

  return `${url.pathname}${url.search}`
}

function App() {
  const initialRouteState = useMemo(readRouteState, [])
  const [activeTab, setActiveTab] = useState<TabId>(initialRouteState.tab)
  const [userData, setUserData] = useState(readUserData)
  const [pokemonQuery, setPokemonQuery] = useState('')
  const [idealFilter, setIdealFilter] = useState('all')
  const [ownedFilter, setOwnedFilter] = useState<OwnedFilter>('all')
  const [selectedPokemonSlug, setSelectedPokemonSlug] = useState(
    initialRouteState.pokemonSlug ?? pokemonProfiles[0]?.slug ?? '',
  )
  const [isPokemonIndexCollapsed, setIsPokemonIndexCollapsed] = useState(
    Boolean(initialRouteState.pokemonSlug),
  )
  const [habitatQuery, setHabitatQuery] = useState('')
  const [selectedHabitatId, setSelectedHabitatId] = useState(
    initialRouteState.habitatId ?? habitats[0]?.habitatId ?? 1,
  )
  const [isHabitatIndexCollapsed, setIsHabitatIndexCollapsed] = useState(
    Boolean(initialRouteState.habitatId),
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

  useEffect(() => {
    const params = new URL(window.location.href).searchParams

    if (params.has('route')) {
      window.history.replaceState(
        null,
        '',
        buildRouteUrl(activeTab, selectedPokemonSlug, selectedHabitatId, true),
      )
    }
  }, [activeTab, selectedHabitatId, selectedPokemonSlug])

  useEffect(() => {
    const onPopState = () => {
      const routeState = readRouteState()

      setActiveTab(routeState.tab)

      if (routeState.pokemonSlug) {
        setSelectedPokemonSlug(routeState.pokemonSlug)
        setIsPokemonIndexCollapsed(true)
      }

      if (routeState.habitatId) {
        setSelectedHabitatId(routeState.habitatId)
        setIsHabitatIndexCollapsed(true)
      }
    }

    window.addEventListener('popstate', onPopState)

    return () => window.removeEventListener('popstate', onPopState)
  }, [])

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

  const writeRoute = (
    tab: TabId,
    pokemonSlug = selectedPokemon.slug,
    habitatId = selectedHabitat.habitatId,
    includeSelection = false,
  ) => {
    const routeUrl = buildRouteUrl(tab, pokemonSlug, habitatId, includeSelection)
    const currentUrl = `${window.location.pathname}${window.location.search}`

    if (routeUrl !== currentUrl) {
      window.history.pushState(null, '', routeUrl)
    }
  }

  const changeTab = (tab: TabId) => {
    setActiveTab(tab)

    if (tab === 'pokemon') {
      setIsPokemonIndexCollapsed(false)
    }

    if (tab === 'habitats') {
      setIsHabitatIndexCollapsed(false)
    }

    writeRoute(tab)
  }

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

  const selectPokemon = (slug: string) => {
    setSelectedPokemonSlug(slug)
    setIsPokemonIndexCollapsed(true)
    writeRoute('pokemon', slug, selectedHabitat.habitatId, true)
  }

  const selectHabitat = (habitatId: number) => {
    setSelectedHabitatId(habitatId)
    setIsHabitatIndexCollapsed(true)
    writeRoute('habitats', selectedPokemon.slug, habitatId, true)
  }

  const openPokemon = (slug?: string) => {
    const targetSlug = slug ?? selectedPokemon.slug

    setSelectedPokemonSlug(targetSlug)
    setIsPokemonIndexCollapsed(Boolean(slug))
    setActiveTab('pokemon')
    writeRoute('pokemon', targetSlug, selectedHabitat.habitatId, Boolean(slug))
  }

  const openHabitats = (habitatId?: number) => {
    const targetHabitatId = habitatId ?? selectedHabitat.habitatId

    setSelectedHabitatId(targetHabitatId)
    setIsHabitatIndexCollapsed(Boolean(habitatId))
    setActiveTab('habitats')
    writeRoute(
      'habitats',
      selectedPokemon.slug,
      targetHabitatId,
      Boolean(habitatId),
    )
  }

  const openPlanner = () => {
    setActiveTab('planner')
    writeRoute('planner')
  }

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
        onTabChange={changeTab}
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
          isIndexCollapsed={isPokemonIndexCollapsed}
          isSelectedOwned={ownedSet.has(selectedPokemon.slug)}
          onIdealFilterChange={setIdealFilter}
          onIndexToggle={() =>
            setIsPokemonIndexCollapsed((isCollapsed) => !isCollapsed)
          }
          onOwnedFilterChange={setOwnedFilter}
          onPokemonQueryChange={setPokemonQuery}
          onSelectPokemon={selectPokemon}
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
          isIndexCollapsed={isHabitatIndexCollapsed}
          onHabitatQueryChange={setHabitatQuery}
          onIndexToggle={() =>
            setIsHabitatIndexCollapsed((isCollapsed) => !isCollapsed)
          }
          onSelectHabitat={selectHabitat}
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
