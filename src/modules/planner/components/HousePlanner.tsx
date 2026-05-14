import {
  pokemonBySlug,
  type HouseDraftSummary,
  type PokemonProfile,
} from '../../../data/pokopia'
import type { SavedHouse } from '../../../data/types'
import { formatNameList, formatter } from '../../../utils/format'

export type PlannerRosterMode = 'all' | 'owned'

export function HousePlanner({
  draftName,
  draftPokemon,
  draftSummary,
  houseSearchQuery,
  onDeleteHouse,
  onDraftNameChange,
  onHouseSearchQueryChange,
  onLoadHouse,
  onNewHouse,
  onRosterModeChange,
  onSaveHouse,
  onToggleDraftPokemon,
  ownedSet,
  pokemonOptions,
  plannerRosterMode,
  savedHouses,
  selectedSavedHouseId,
}: {
  draftName: string
  draftPokemon: PokemonProfile[]
  draftSummary: HouseDraftSummary
  houseSearchQuery: string
  onDeleteHouse: (houseId: string) => void
  onDraftNameChange: (name: string) => void
  onHouseSearchQueryChange: (query: string) => void
  onLoadHouse: (houseId: string) => void
  onNewHouse: () => void
  onRosterModeChange: (mode: PlannerRosterMode) => void
  onSaveHouse: () => void
  onToggleDraftPokemon: (slug: string) => void
  ownedSet: Set<string>
  pokemonOptions: PokemonProfile[]
  plannerRosterMode: PlannerRosterMode
  savedHouses: SavedHouse[]
  selectedSavedHouseId: string | null
}) {
  const selectedSlugs = new Set(draftPokemon.map((entry) => entry.slug))
  const hasDraftPokemon = draftPokemon.length > 0
  const canSave = hasDraftPokemon && draftName.trim().length > 0
  const selectedHouse = savedHouses.find(
    (house) => house.id === selectedSavedHouseId,
  )

  return (
    <section
      aria-labelledby="planner-heading"
      className="app-view planner-workspace"
      id="planner-panel"
      role="tabpanel"
    >
      <header className="planner-header house-builder-header">
        <div>
          <p className="eyebrow">House builder</p>
          <h2 id="planner-heading">Build a house</h2>
          <p>
            Name a house, choose up to four Pokemon, and check which ideal
            habitats and favorites line up for the group.
          </p>
        </div>

        <div className="planner-save-panel">
          <label className="field">
            <span>House name</span>
            <input
              value={draftName}
              onChange={(event) => onDraftNameChange(event.target.value)}
              placeholder="warm with mew"
            />
          </label>
          <div className="house-save-actions">
            <button
              className="primary-action"
              disabled={!canSave}
              onClick={onSaveHouse}
              type="button"
            >
              {selectedHouse ? 'Update house' : 'Save house'}
            </button>
            <button className="quiet-action" onClick={onNewHouse} type="button">
              New draft
            </button>
          </div>
          {selectedHouse ? (
            <p className="save-note">Editing {selectedHouse.name}</p>
          ) : null}
        </div>
      </header>

      <div className="house-builder-grid">
        <section className="builder-panel house-draft-panel" aria-labelledby="draft-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Draft</p>
              <h3 id="draft-heading">Pokemon in this house</h3>
            </div>
            <strong className="count-pill">{draftPokemon.length}/4</strong>
          </div>

          <div className="house-slot-grid">
            {Array.from({ length: 4 }).map((_, index) => {
              const entry = draftPokemon[index]

              return entry ? (
                <button
                  aria-label={`Remove ${entry.name} from this house`}
                  className="house-slot is-filled"
                  key={entry.slug}
                  onClick={() => onToggleDraftPokemon(entry.slug)}
                  type="button"
                >
                  <img src={entry.imageUrl} alt="" />
                  <span>
                    <strong>{entry.name}</strong>
                    <small>{entry.idealHabitat?.name ?? 'No ideal'} ideal</small>
                  </span>
                </button>
              ) : (
                <div className="house-slot is-empty" key={`empty-${index}`}>
                  <span>Open spot</span>
                </div>
              )
            })}
          </div>
        </section>

        <section className="builder-panel house-roster-panel" aria-labelledby="roster-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Roster</p>
              <h3 id="roster-heading">
                {formatter.format(pokemonOptions.length)} candidates
              </h3>
            </div>
          </div>

          <div className="filter-grid">
            <label>
              <span>Search</span>
              <input
                value={houseSearchQuery}
                onChange={(event) =>
                  onHouseSearchQueryChange(event.target.value)
                }
                placeholder="Mew, Warm, soft stuff..."
              />
            </label>
            <label>
              <span>Roster</span>
              <select
                value={plannerRosterMode}
                onChange={(event) =>
                  onRosterModeChange(event.target.value as PlannerRosterMode)
                }
              >
                <option value="all">Full roster</option>
                <option value="owned">Owned only</option>
              </select>
            </label>
          </div>

          <div className="house-roster-list" role="list">
            {pokemonOptions.length > 0 ? (
              pokemonOptions.map((entry) => {
                const isSelected = selectedSlugs.has(entry.slug)
                const isDisabled = draftPokemon.length >= 4 && !isSelected

                return (
                  <button
                    className={
                      isSelected
                        ? 'house-roster-row is-selected'
                        : 'house-roster-row'
                    }
                    disabled={isDisabled}
                    key={entry.slug}
                    onClick={() => onToggleDraftPokemon(entry.slug)}
                    type="button"
                  >
                    <img src={entry.imageUrl} alt="" />
                    <span>
                      <strong>{entry.name}</strong>
                      <small>
                        {entry.idealHabitat?.name ?? 'No ideal'} /{' '}
                        {ownedSet.has(entry.slug) ? 'Owned' : 'Planning ahead'}
                      </small>
                    </span>
                    <em>{isSelected ? 'Added' : 'Add'}</em>
                  </button>
                )
              })
            ) : (
              <p className="empty-state">No Pokemon match those filters.</p>
            )}
          </div>
        </section>

        <HouseMatchPanel
          draftPokemon={draftPokemon}
          draftSummary={draftSummary}
        />

        <section className="builder-panel saved-house-panel" aria-labelledby="saved-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Saved</p>
              <h3 id="saved-heading">Your houses</h3>
            </div>
          </div>

          <div className="saved-house-list">
            {savedHouses.length > 0 ? (
              savedHouses.map((house) => (
                <article
                  className={
                    house.id === selectedSavedHouseId
                      ? 'saved-house is-selected'
                      : 'saved-house'
                  }
                  key={house.id}
                >
                  <div>
                    <strong>{house.name}</strong>
                    <small>
                      {formatter.format(house.pokemonSlugs.length)} Pokemon
                    </small>
                  </div>
                  <p>
                    {formatNameList(
                      house.pokemonSlugs.map(
                        (slug) => pokemonBySlug.get(slug)?.name ?? slug,
                      ),
                    )}
                  </p>
                  <div className="saved-house-actions">
                    <button
                      className="quiet-action"
                      onClick={() => onLoadHouse(house.id)}
                      type="button"
                    >
                      Load
                    </button>
                    <button
                      className="utility-button"
                      onClick={() => onDeleteHouse(house.id)}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <p className="empty-state">
                Saved houses will appear here after you name and save a draft.
              </p>
            )}
          </div>
        </section>
      </div>
    </section>
  )
}

function HouseMatchPanel({
  draftPokemon,
  draftSummary,
}: {
  draftPokemon: PokemonProfile[]
  draftSummary: HouseDraftSummary
}) {
  return (
    <section className="builder-panel house-match-panel" aria-labelledby="match-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Matches</p>
          <h3 id="match-heading">Ideal habitats and favorites</h3>
        </div>
      </div>

      {draftPokemon.length > 0 ? (
        <div className="match-stack">
          <div className="match-section">
            <h4>Ideal habitats</h4>
            {draftSummary.idealHabitats.length > 0 ? (
              <div className="match-list">
                {draftSummary.idealHabitats.map((match) => (
                  <MatchRow key={match.id} match={match} />
                ))}
              </div>
            ) : (
              <p className="empty-state">No ideal habitat data found.</p>
            )}
          </div>

          <div className="match-section">
            <h4>Shared favorites</h4>
            {draftSummary.sharedFavorites.length > 0 ? (
              <div className="match-list">
                {draftSummary.sharedFavorites.map((match) => (
                  <MatchRow key={match.id} match={match} />
                ))}
              </div>
            ) : (
              <p className="empty-state">
                Add another Pokemon to reveal overlapping favorites.
              </p>
            )}
          </div>

          <p className="coverage-note">
            {formatter.format(draftSummary.favoriteCoverage)} total favorite
            categories across this draft.
          </p>
        </div>
      ) : (
        <p className="empty-state">
          Choose Pokemon from the roster to see what habitat and favorite
          patterns they share.
        </p>
      )}
    </section>
  )
}

function MatchRow({ match }: { match: HouseDraftSummary['idealHabitats'][number] }) {
  return (
    <div className="match-row">
      <strong>{match.name}</strong>
      <span>{match.count}/4</span>
      <small>{formatNameList(match.pokemon.map((entry) => entry.name))}</small>
    </div>
  )
}
