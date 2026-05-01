import type { HousePlan, IdealHabitat, PokemonProfile } from '../data/pokopia'
import { formatter } from '../utils/format'

export type PlannerRosterMode = 'all' | 'owned'

export function HousePlanner({
  buildAroundSelected,
  housePlans,
  idealHabitats,
  onBuildAroundSelectedChange,
  onIdealFilterChange,
  onRosterModeChange,
  onSelectPokemon,
  ownedSet,
  plannerIdealFilter,
  plannerRosterMode,
  selectedPokemon,
}: {
  buildAroundSelected: boolean
  housePlans: HousePlan[]
  idealHabitats: IdealHabitat[]
  onBuildAroundSelectedChange: (enabled: boolean) => void
  onIdealFilterChange: (filter: string) => void
  onRosterModeChange: (mode: PlannerRosterMode) => void
  onSelectPokemon: (slug: string) => void
  ownedSet: Set<string>
  plannerIdealFilter: string
  plannerRosterMode: PlannerRosterMode
  selectedPokemon: PokemonProfile
}) {
  return (
    <section
      aria-labelledby="planner-heading"
      className="app-view planner-workspace"
      id="planner-panel"
      role="tabpanel"
    >
      <header className="planner-header">
        <div>
          <p className="eyebrow">House planner</p>
          <h2 id="planner-heading">Best groups of four</h2>
          <p>
            Scores reward shared ideal habitats and favorite overlap. Missing
            Pokemon can stay visible so you can plan ahead.
          </p>
        </div>

        <div className="planner-control-bar">
          <label>
            <span>Ideal focus</span>
            <select
              value={plannerIdealFilter}
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
          <label className="check-row">
            <input
              checked={buildAroundSelected}
              onChange={(event) =>
                onBuildAroundSelectedChange(event.target.checked)
              }
              type="checkbox"
            />
            <span>Build around {selectedPokemon.name}</span>
          </label>
        </div>
      </header>

      <div className="plan-grid">
        {housePlans.length > 0 ? (
          housePlans.map((plan, index) => (
            <article className="plan-card" key={plan.key}>
              <div className="plan-card-top">
                <span>#{index + 1}</span>
                <strong>{formatter.format(Math.round(plan.score))}</strong>
                <small>score</small>
              </div>
              <div className="plan-party">
                {plan.pokemon.map((entry) => (
                  <button
                    aria-label={`View ${entry.name}`}
                    className="plan-member"
                    key={entry.slug}
                    onClick={() => onSelectPokemon(entry.slug)}
                    type="button"
                  >
                    <img src={entry.imageUrl} alt="" />
                    <span>
                      <strong>{entry.name}</strong>
                      <small>
                        {ownedSet.has(entry.slug) ? 'Owned' : 'Planning ahead'}
                      </small>
                    </span>
                  </button>
                ))}
              </div>
              <p>{plan.explanation}</p>
              <div className="chip-row">
                <span className="chip strong">{plan.primaryIdealHabitat}</span>
                {plan.sharedFavorites.slice(0, 4).map((favorite) => (
                  <span className="chip" key={favorite.favoriteId}>
                    {favorite.name} x{favorite.count}
                  </span>
                ))}
              </div>
            </article>
          ))
        ) : (
          <p className="empty-state">
            No groups match those planner filters yet.
          </p>
        )}
      </div>
    </section>
  )
}
