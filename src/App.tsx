import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
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
  type Habitat,
  type PokemonProfile,
} from './data/pokopia'
import {
  parseUserData,
  readUserData,
  type PokopediaUserData,
  writeUserData,
} from './userData'

const formatter = new Intl.NumberFormat('en-US')

const normalize = (value: string) => value.toLowerCase().trim()

const formatList = (values: string[]) =>
  values
    .map((value) => value.charAt(0).toUpperCase() + value.slice(1))
    .join(', ')

const userDataWithOwned = (ownedPokemonSlugs: string[]): PokopediaUserData => ({
  version: 1,
  updatedAt: new Date().toISOString(),
  ownedPokemonSlugs: [...new Set(ownedPokemonSlugs)].sort(),
})

function App() {
  const [userData, setUserData] = useState(readUserData)
  const [pokemonQuery, setPokemonQuery] = useState('')
  const [idealFilter, setIdealFilter] = useState('all')
  const [ownedFilter, setOwnedFilter] = useState('all')
  const [selectedPokemonSlug, setSelectedPokemonSlug] = useState(
    pokemonProfiles[0]?.slug ?? '',
  )
  const [habitatQuery, setHabitatQuery] = useState('')
  const [selectedHabitatId, setSelectedHabitatId] = useState(
    habitats[0]?.habitatId ?? 1,
  )
  const [plannerIdealFilter, setPlannerIdealFilter] = useState('all')
  const [plannerRosterMode, setPlannerRosterMode] = useState('all')
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
    const query = normalize(pokemonQuery)

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

  const selectedPokemonSpawns = selectedPokemon
    ? (spawnRecordsByPokemonSlug.get(selectedPokemon.slug) ?? [])
    : []

  const filteredHabitats = useMemo(() => {
    const query = normalize(habitatQuery)

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

    if (!buildAroundSelected || !selectedPokemon) {
      return plans
    }

    return plans.filter((plan) =>
      plan.pokemon.some((entry) => entry.slug === selectedPokemon.slug),
    )
  }, [buildAroundSelected, plannerCandidates, selectedPokemon])

  const ownedCount = userData.ownedPokemonSlugs.length
  const selectedFavoriteDetails =
    selectedPokemon?.favorites.map((favorite) => ({
      ...favorite,
      itemCount: favoriteCategoryById.get(favorite.favoriteId)?.itemCount ?? 0,
    })) ?? []

  const toggleOwned = (slug: string) => {
    const nextOwned = new Set(userData.ownedPokemonSlugs)

    if (nextOwned.has(slug)) {
      nextOwned.delete(slug)
    } else {
      nextOwned.add(slug)
    }

    setUserData(userDataWithOwned([...nextOwned]))
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

      setUserData(userDataWithOwned(ownedPokemonSlugs))
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

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <span className="brand-mark" aria-hidden="true">
            P
          </span>
          <div>
            <p className="eyebrow">Pokopedia</p>
            <h1>Field guide and house planner</h1>
          </div>
        </div>

        <section className="data-actions" aria-label="User data">
          <div className="owned-meter">
            <strong>{formatter.format(ownedCount)}</strong>
            <span>owned of {formatter.format(datasetStats.pokemon)}</span>
          </div>
          <button className="utility-button" type="button" onClick={exportUserData}>
            Export JSON
          </button>
          <button
            className="utility-button"
            type="button"
            onClick={() => importInputRef.current?.click()}
          >
            Import JSON
          </button>
          <input
            ref={importInputRef}
            className="visually-hidden"
            type="file"
            accept="application/json"
            onChange={(event) => {
              void importUserData(event.currentTarget.files?.[0])
            }}
          />
        </section>
      </header>

      {importMessage ? <p className="status-note">{importMessage}</p> : null}

      <section className="stats-strip" aria-label="Data inventory">
        <Stat label="Pokemon" value={datasetStats.pokemon} />
        <Stat label="Habitats" value={datasetStats.habitats} />
        <Stat label="Items" value={datasetStats.items} />
        <Stat label="Favorites" value={datasetStats.favorites} />
        <Stat label="Spawn rules" value={datasetStats.spawns} />
      </section>

      <section className="workspace" aria-label="Pokopia workspace">
        <aside className="dex-panel" aria-label="Pokemon list">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Pokédex</p>
              <h2>{formatter.format(filteredPokemon.length)} entries</h2>
            </div>
          </div>

          <label className="field">
            <span>Search Pokémon, specialty, favorite</span>
            <input
              value={pokemonQuery}
              onChange={(event) => setPokemonQuery(event.target.value)}
              placeholder="Bulbasaur, Grow, soft stuff..."
            />
          </label>

          <div className="filter-row">
            <label>
              <span>Ideal</span>
              <select
                value={idealFilter}
                onChange={(event) => setIdealFilter(event.target.value)}
              >
                <option value="all">All ideals</option>
                {idealHabitats.map((habitat) => (
                  <option key={habitat.idealHabitatId} value={habitat.idealHabitatId}>
                    {habitat.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Tracker</span>
              <select
                value={ownedFilter}
                onChange={(event) => setOwnedFilter(event.target.value)}
              >
                <option value="all">All</option>
                <option value="owned">Owned</option>
                <option value="missing">Missing</option>
              </select>
            </label>
          </div>

          <div className="pokemon-list">
            {filteredPokemon.map((entry) => (
              <PokemonListButton
                key={entry.slug}
                entry={entry}
                isOwned={ownedSet.has(entry.slug)}
                isSelected={entry.slug === selectedPokemon?.slug}
                onSelect={() => setSelectedPokemonSlug(entry.slug)}
                onToggleOwned={() => toggleOwned(entry.slug)}
              />
            ))}
          </div>
        </aside>

        <section className="profile-panel" aria-label="Selected Pokemon details">
          {selectedPokemon ? (
            <PokemonProfileView
              entry={selectedPokemon}
              favoriteDetails={selectedFavoriteDetails}
              isOwned={ownedSet.has(selectedPokemon.slug)}
              spawns={selectedPokemonSpawns}
              onToggleOwned={() => toggleOwned(selectedPokemon.slug)}
            />
          ) : null}
        </section>

        <aside className="planner-panel" aria-label="House planner">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">House planner</p>
              <h2>Best groups of four</h2>
            </div>
          </div>

          <p className="panel-copy">
            Scores reward shared ideal habitats and favorite overlap. Missing
            Pokémon can still appear so you can plan ahead.
          </p>

          <div className="planner-controls">
            <label>
              <span>Ideal focus</span>
              <select
                value={plannerIdealFilter}
                onChange={(event) => setPlannerIdealFilter(event.target.value)}
              >
                <option value="all">All ideals</option>
                {idealHabitats.map((habitat) => (
                  <option key={habitat.idealHabitatId} value={habitat.idealHabitatId}>
                    {habitat.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Roster</span>
              <select
                value={plannerRosterMode}
                onChange={(event) => setPlannerRosterMode(event.target.value)}
              >
                <option value="all">Full roster</option>
                <option value="owned">Owned only</option>
              </select>
            </label>
          </div>

          <label className="check-row">
            <input
              type="checkbox"
              checked={buildAroundSelected}
              onChange={(event) => setBuildAroundSelected(event.target.checked)}
            />
            <span>Build around selected Pokémon</span>
          </label>

          <div className="plan-list">
            {housePlans.length > 0 ? (
              housePlans.map((plan, index) => (
                <article className="plan" key={plan.key}>
                  <div className="plan-rank">
                    <span>#{index + 1}</span>
                    <strong>{Math.round(plan.score)}</strong>
                  </div>
                  <div className="plan-pokemon">
                    {plan.pokemon.map((entry) => (
                      <button
                        key={entry.slug}
                        type="button"
                        className="plan-member"
                        onClick={() => setSelectedPokemonSlug(entry.slug)}
                        aria-label={`View ${entry.name}`}
                      >
                        <img src={entry.imageUrl} alt="" />
                        <span>{entry.name}</span>
                        {ownedSet.has(entry.slug) ? (
                          <span className="owned-dot">Owned</span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                  <p>{plan.explanation}</p>
                  <div className="chip-row">
                    <span className="chip">{plan.primaryIdealHabitat}</span>
                    {plan.sharedFavorites.slice(0, 4).map((favorite) => (
                      <span className="chip" key={favorite.favoriteId}>
                        {favorite.name} ×{favorite.count}
                      </span>
                    ))}
                  </div>
                </article>
              ))
            ) : (
              <p className="empty-state">
                No groups match these planner filters yet.
              </p>
            )}
          </div>
        </aside>
      </section>

      <section className="atlas" aria-label="Habitat atlas">
        <div className="atlas-list">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Habitat atlas</p>
              <h2>{formatter.format(filteredHabitats.length)} habitats</h2>
            </div>
          </div>
          <label className="field">
            <span>Search habitat, component, spawn</span>
            <input
              value={habitatQuery}
              onChange={(event) => setHabitatQuery(event.target.value)}
              placeholder="Tall grass, tree, Scyther..."
            />
          </label>
          <div className="habitat-list">
            {filteredHabitats.slice(0, 80).map((habitat) => (
              <button
                className={
                  habitat.habitatId === selectedHabitat.habitatId
                    ? 'habitat-row is-selected'
                    : 'habitat-row'
                }
                key={habitat.habitatId}
                type="button"
                onClick={() => setSelectedHabitatId(habitat.habitatId)}
              >
                <img src={habitat.pictureUrl} alt="" />
                <span>
                  <strong>{habitat.name}</strong>
                  <small>{habitat.habitatIdDisplay}</small>
                </span>
              </button>
            ))}
          </div>
        </div>

        <HabitatDetail
          habitat={selectedHabitat}
          requirements={selectedHabitatRequirements}
          spawnCount={selectedHabitatSpawns.length}
          onPokemonSelect={setSelectedPokemonSlug}
        />
      </section>
    </main>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat">
      <strong>{formatter.format(value)}</strong>
      <span>{label}</span>
    </div>
  )
}

function PokemonListButton({
  entry,
  isOwned,
  isSelected,
  onSelect,
  onToggleOwned,
}: {
  entry: PokemonProfile
  isOwned: boolean
  isSelected: boolean
  onSelect: () => void
  onToggleOwned: () => void
}) {
  return (
    <div className={isSelected ? 'pokemon-row is-selected' : 'pokemon-row'}>
      <button type="button" className="pokemon-main" onClick={onSelect}>
        <img src={entry.imageUrl} alt="" />
        <span>
          <strong>{entry.name}</strong>
          <small>
            {entry.pokopiaNumberDisplay} · {entry.idealHabitat?.name ?? 'No ideal'}
          </small>
        </span>
      </button>
      <button
        className={isOwned ? 'owned-toggle is-owned' : 'owned-toggle'}
        type="button"
        onClick={onToggleOwned}
        aria-label={isOwned ? `Mark ${entry.name} missing` : `Mark ${entry.name} owned`}
      >
        {isOwned ? '✓' : ''}
      </button>
    </div>
  )
}

function PokemonProfileView({
  entry,
  favoriteDetails,
  isOwned,
  spawns,
  onToggleOwned,
}: {
  entry: PokemonProfile
  favoriteDetails: (PokemonProfile['favorites'][number] & {
    itemCount: number
  })[]
  isOwned: boolean
  spawns: ReturnType<typeof spawnRecordsByPokemonSlug.get>
  onToggleOwned: () => void
}) {
  return (
    <article className="profile-card">
      <div className="profile-hero">
        <div className="pokemon-portrait">
          <img src={entry.imageUrl} alt="" />
        </div>
        <div className="profile-title">
          <p className="eyebrow">{entry.pokopiaNumberDisplay}</p>
          <h2>{entry.name}</h2>
          <div className="chip-row">
            {entry.idealHabitat ? (
              <span className="chip strong">{entry.idealHabitat.name} ideal</span>
            ) : null}
            {entry.specialties.map((specialty) => (
              <span className="chip" key={specialty.slug}>
                {specialty.name}
              </span>
            ))}
          </div>
        </div>
        <button
          className={isOwned ? 'primary-action is-owned' : 'primary-action'}
          type="button"
          onClick={onToggleOwned}
        >
          {isOwned ? 'Owned ✓' : 'Mark owned'}
        </button>
      </div>

      <div className="detail-grid">
        <section>
          <h3>Favorites</h3>
          <div className="favorite-grid">
            {favoriteDetails.map((favorite) => (
              <span className="favorite-token" key={favorite.favoriteId}>
                <strong>{favorite.name}</strong>
                <small>
                  {favorite.kind === 'flavor'
                    ? 'Flavor'
                    : `${favorite.itemCount} items`}
                </small>
              </span>
            ))}
          </div>
        </section>

        <section>
          <h3>Where it appears</h3>
          {spawns && spawns.length > 0 ? (
            <div className="spawn-list">
              {spawns.slice(0, 6).map((spawn) => (
                <div className="spawn-row" key={`${spawn.habitatId}-${spawn.sourceOrder}`}>
                  <strong>{spawn.habitatName}</strong>
                  <span>
                    {spawn.rarity} · {formatList(spawn.timeOfDay)} ·{' '}
                    {formatList(spawn.weather)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No normalized spawn rule found.</p>
          )}
        </section>
      </div>
    </article>
  )
}

function HabitatDetail({
  habitat,
  requirements,
  spawnCount,
  onPokemonSelect,
}: {
  habitat: Habitat
  requirements: NonNullable<
    ReturnType<typeof requirementsByHabitatId.get>
  >['requirements']
  spawnCount: number
  onPokemonSelect: (slug: string) => void
}) {
  const spawns = spawnsByHabitatId.get(habitat.habitatId)?.spawns ?? []

  return (
    <article className="habitat-detail">
      <div className="habitat-hero">
        <img src={habitat.pictureUrl} alt="" />
        <div>
          <p className="eyebrow">{habitat.habitatIdDisplay}</p>
          <h2>{habitat.name}</h2>
          <p>{habitat.description}</p>
          <div className="chip-row">
            <span className="chip strong">{requirements.length} components</span>
            <span className="chip">{spawnCount} spawn rules</span>
          </div>
        </div>
      </div>

      <div className="atlas-detail-grid">
        <section>
          <h3>Components</h3>
          <div className="component-grid">
            {requirements.map((requirement) => (
              <div className="component" key={`${requirement.itemId}-${requirement.sourceOrder}`}>
                <img src={requirement.pictureUrl} alt="" />
                <span>
                  <strong>{requirement.itemName}</strong>
                  <small>
                    {requirement.quantity === null
                      ? 'As needed'
                      : `Quantity ${requirement.quantity}`}
                  </small>
                </span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3>Spawns</h3>
          <div className="spawn-pokemon-grid">
            {spawns.slice(0, 18).map((spawn) => (
              <button
                type="button"
                className="spawn-pokemon"
                key={`${spawn.pokemonSlug}-${spawn.sourceOrder}`}
                onClick={() => onPokemonSelect(spawn.pokemonSlug)}
              >
                <img src={spawn.pokemonImageUrl} alt="" />
                <span>
                  <strong>{spawn.pokemonName}</strong>
                  <small>{spawn.rarity}</small>
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </article>
  )
}

export default App
