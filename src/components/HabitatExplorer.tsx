import type { Habitat, Requirement, Spawn } from '../data/pokopia'
import { formatNameList, formatter } from '../utils/format'

export function HabitatExplorer({
  filteredHabitats,
  habitatQuery,
  onHabitatQueryChange,
  onSelectHabitat,
  onSelectPokemon,
  selectedHabitat,
  selectedHabitatRequirements,
  selectedHabitatSpawns,
}: {
  filteredHabitats: Habitat[]
  habitatQuery: string
  onHabitatQueryChange: (query: string) => void
  onSelectHabitat: (habitatId: number) => void
  onSelectPokemon: (slug: string) => void
  selectedHabitat: Habitat
  selectedHabitatRequirements: Requirement[]
  selectedHabitatSpawns: Spawn[]
}) {
  return (
    <section
      aria-labelledby="habitats-heading"
      className="app-view two-column-workspace habitat-workspace"
      id="habitats-panel"
      role="tabpanel"
    >
      <aside className="index-panel habitat-index" aria-label="Habitat list">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Habitat atlas</p>
            <h2 id="habitats-heading">
              {formatter.format(filteredHabitats.length)} habitats
            </h2>
          </div>
        </div>

        <label className="field">
          <span>Search habitat, component, spawn</span>
          <input
            value={habitatQuery}
            onChange={(event) => onHabitatQueryChange(event.target.value)}
            placeholder="Tall grass, tree, Scyther..."
          />
        </label>

        <div className="list-stack habitat-list" role="list">
          {filteredHabitats.length > 0 ? (
            filteredHabitats.map((habitat) => (
              <button
                className={
                  habitat.habitatId === selectedHabitat.habitatId
                    ? 'entity-row habitat-row is-selected'
                    : 'entity-row habitat-row'
                }
                key={habitat.habitatId}
                onClick={() => onSelectHabitat(habitat.habitatId)}
                role="listitem"
                type="button"
              >
                <img src={habitat.pictureUrl} alt="" />
                <span>
                  <strong>{habitat.name}</strong>
                  <small>{habitat.habitatIdDisplay}</small>
                </span>
              </button>
            ))
          ) : (
            <p className="empty-state">No habitats match that search.</p>
          )}
        </div>
      </aside>

      <article className="detail-panel habitat-detail-panel">
        <div className="detail-hero habitat-detail-hero">
          <img src={selectedHabitat.pictureUrl} alt="" />
          <div>
            <p className="eyebrow">{selectedHabitat.habitatIdDisplay}</p>
            <h2>{selectedHabitat.name}</h2>
            <p>{selectedHabitat.description}</p>
            <div className="chip-row">
              <span className="chip strong">
                {formatter.format(selectedHabitatRequirements.length)} components
              </span>
              <span className="chip">
                {formatter.format(selectedHabitatSpawns.length)} spawn rules
              </span>
            </div>
          </div>
        </div>

        <div className="detail-grid">
          <section className="detail-section">
            <h3>Components</h3>
            {selectedHabitatRequirements.length > 0 ? (
              <div className="component-grid">
                {selectedHabitatRequirements.map((requirement) => (
                  <div
                    className="component"
                    key={`${requirement.itemId}-${requirement.sourceOrder}`}
                  >
                    <img src={requirement.pictureUrl} alt="" />
                    <span>
                      <strong>{requirement.itemName}</strong>
                      <small>
                        {requirement.quantity === null
                          ? 'As needed'
                          : `Quantity ${formatter.format(requirement.quantity)}`}
                      </small>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-state">No normalized components found.</p>
            )}
          </section>

          <section className="detail-section">
            <h3>Spawns</h3>
            {selectedHabitatSpawns.length > 0 ? (
              <div className="spawn-pokemon-grid">
                {selectedHabitatSpawns.slice(0, 24).map((spawn) => (
                  <button
                    className="spawn-pokemon"
                    key={`${spawn.pokemonSlug}-${spawn.sourceOrder}`}
                    onClick={() => onSelectPokemon(spawn.pokemonSlug)}
                    type="button"
                  >
                    <img src={spawn.pokemonImageUrl} alt="" />
                    <span>
                      <strong>{spawn.pokemonName}</strong>
                      <small>
                        {spawn.rarity} / {formatNameList(spawn.timeOfDay)}
                      </small>
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="empty-state">No normalized spawn rules found.</p>
            )}
          </section>
        </div>
      </article>
    </section>
  )
}
