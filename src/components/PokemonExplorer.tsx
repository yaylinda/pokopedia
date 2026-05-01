import type {
  IdealHabitat,
  PokemonProfile,
  PokemonSpawnRecord,
} from '../data/pokopia'
import { formatNameList, formatter } from '../utils/format'

export type OwnedFilter = 'all' | 'missing' | 'owned'

type FavoriteDetail = PokemonProfile['favorites'][number] & {
  itemCount: number
}

export function PokemonExplorer({
  favoriteDetails,
  filteredPokemon,
  idealFilter,
  idealHabitats,
  isSelectedOwned,
  onIdealFilterChange,
  onOwnedFilterChange,
  onPokemonQueryChange,
  onSelectPokemon,
  onToggleOwned,
  ownedFilter,
  ownedSet,
  pokemonQuery,
  selectedPokemon,
  selectedPokemonSpawns,
}: {
  favoriteDetails: FavoriteDetail[]
  filteredPokemon: PokemonProfile[]
  idealFilter: string
  idealHabitats: IdealHabitat[]
  isSelectedOwned: boolean
  onIdealFilterChange: (filter: string) => void
  onOwnedFilterChange: (filter: OwnedFilter) => void
  onPokemonQueryChange: (query: string) => void
  onSelectPokemon: (slug: string) => void
  onToggleOwned: (slug: string) => void
  ownedFilter: OwnedFilter
  ownedSet: Set<string>
  pokemonQuery: string
  selectedPokemon: PokemonProfile
  selectedPokemonSpawns: PokemonSpawnRecord[]
}) {
  return (
    <section
      aria-labelledby="pokemon-heading"
      className="app-view two-column-workspace"
      id="pokemon-panel"
      role="tabpanel"
    >
      <aside className="index-panel pokemon-index" aria-label="Pokemon list">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Pokédex</p>
            <h2 id="pokemon-heading">
              {formatter.format(filteredPokemon.length)} entries
            </h2>
          </div>
        </div>

        <label className="field">
          <span>Search Pokemon, specialty, favorite</span>
          <input
            value={pokemonQuery}
            onChange={(event) => onPokemonQueryChange(event.target.value)}
            placeholder="Bulbasaur, Grow, soft stuff..."
          />
        </label>

        <div className="filter-grid">
          <label>
            <span>Ideal</span>
            <select
              value={idealFilter}
              onChange={(event) => onIdealFilterChange(event.target.value)}
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
              onChange={(event) =>
                onOwnedFilterChange(event.target.value as OwnedFilter)
              }
            >
              <option value="all">All</option>
              <option value="owned">Owned</option>
              <option value="missing">Missing</option>
            </select>
          </label>
        </div>

        <div className="list-stack pokemon-list" role="list">
          {filteredPokemon.length > 0 ? (
            filteredPokemon.map((entry) => (
              <PokemonListButton
                entry={entry}
                isOwned={ownedSet.has(entry.slug)}
                isSelected={entry.slug === selectedPokemon.slug}
                key={entry.slug}
                onSelect={() => onSelectPokemon(entry.slug)}
                onToggleOwned={() => onToggleOwned(entry.slug)}
              />
            ))
          ) : (
            <p className="empty-state">No Pokemon match those filters.</p>
          )}
        </div>
      </aside>

      <PokemonProfilePanel
        entry={selectedPokemon}
        favoriteDetails={favoriteDetails}
        isOwned={isSelectedOwned}
        onToggleOwned={() => onToggleOwned(selectedPokemon.slug)}
        spawns={selectedPokemonSpawns}
      />
    </section>
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
    <div
      className={isSelected ? 'entity-row pokemon-row is-selected' : 'entity-row pokemon-row'}
      role="listitem"
    >
      <button type="button" className="entity-main" onClick={onSelect}>
        <img src={entry.imageUrl} alt="" />
        <span>
          <strong>{entry.name}</strong>
          <small>
            {entry.pokopiaNumberDisplay} /{' '}
            {entry.idealHabitat?.name ?? 'No ideal'}
          </small>
        </span>
      </button>
      <button
        aria-label={isOwned ? `Mark ${entry.name} missing` : `Mark ${entry.name} owned`}
        className={isOwned ? 'owned-toggle is-owned' : 'owned-toggle'}
        onClick={onToggleOwned}
        type="button"
      >
        {isOwned ? '✓' : ''}
      </button>
    </div>
  )
}

function PokemonProfilePanel({
  entry,
  favoriteDetails,
  isOwned,
  onToggleOwned,
  spawns,
}: {
  entry: PokemonProfile
  favoriteDetails: FavoriteDetail[]
  isOwned: boolean
  onToggleOwned: () => void
  spawns: PokemonSpawnRecord[]
}) {
  return (
    <article className="detail-panel pokemon-detail-panel">
      <div className="detail-hero pokemon-detail-hero">
        <div className="pokemon-portrait">
          <img src={entry.imageUrl} alt="" />
        </div>
        <div className="detail-title">
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
        <section className="detail-section">
          <h3>Favorites</h3>
          <div className="favorite-grid">
            {favoriteDetails.map((favorite) => (
              <span className="favorite-token" key={favorite.favoriteId}>
                <strong>{favorite.name}</strong>
                <small>
                  {favorite.kind === 'flavor'
                    ? 'Flavor'
                    : `${formatter.format(favorite.itemCount)} items`}
                </small>
              </span>
            ))}
          </div>
        </section>

        <section className="detail-section">
          <h3>Where it appears</h3>
          {spawns.length > 0 ? (
            <div className="spawn-list">
              {spawns.slice(0, 8).map((spawn) => (
                <div
                  className="spawn-row"
                  key={`${spawn.habitatId}-${spawn.sourceOrder}`}
                >
                  <strong>{spawn.habitatName}</strong>
                  <span>
                    {spawn.rarity} / {formatNameList(spawn.timeOfDay)} /{' '}
                    {formatNameList(spawn.weather)}
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
