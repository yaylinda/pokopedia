import { useNavigate } from 'react-router-dom'
import { useUserData } from '../../app/userDataContext'
import { datasetStats } from '../../data/pokopia'
import { formatSavedAt, formatter, percentFormatter } from '../../utils/format'

export function HomePage() {
  const navigate = useNavigate()
  const { ownedCount, userData } = useUserData()
  const totalPokemon = datasetStats.pokemon
  const completion = totalPokemon > 0 ? ownedCount / totalPokemon : 0
  const missingCount = Math.max(totalPokemon - ownedCount, 0)

  return (
    <section
      aria-labelledby="home-heading"
      className="app-view home-grid"
      id="home-panel"
      role="tabpanel"
    >
      <section className="home-panel home-profile">
        <p className="eyebrow">Local profile</p>
        <h2 id="home-heading">Your Pokopia notebook</h2>
        <p className="home-lede">
          A quiet starting point for your local tracker. The reference-heavy
          lists live in the tabs.
        </p>

        <div className="progress-block" aria-label="Pokemon tracker progress">
          <div>
            <strong>{percentFormatter.format(completion)}</strong>
            <span>complete</span>
          </div>
          <span className="progress-track">
            <span style={{ inlineSize: `${completion * 100}%` }} />
          </span>
        </div>

        <div className="profile-ledger" aria-label="Tracker progress">
          <div>
            <span>Owned</span>
            <strong>{formatter.format(ownedCount)}</strong>
            <small>Pokemon marked in this browser</small>
          </div>
          <div>
            <span>Missing</span>
            <strong>{formatter.format(missingCount)}</strong>
            <small>from the normalized roster</small>
          </div>
          <div>
            <span>Saved</span>
            <strong className="saved-date">
              {formatSavedAt(userData.updatedAt)}
            </strong>
            <small>in this browser</small>
          </div>
        </div>
      </section>

      <section className="home-panel home-next" aria-labelledby="next-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Next step</p>
            <h2 id="next-heading">Choose a workspace</h2>
          </div>
        </div>

        <div className="home-destinations">
          <button
            className="destination-button is-primary"
            type="button"
            onClick={() => navigate('/pokemon')}
          >
            <span>
              <strong>Pokédex</strong>
              <small>Search Pokemon and update ownership.</small>
            </span>
          </button>
          <button
            className="destination-button"
            type="button"
            onClick={() => navigate('/habitats')}
          >
            <span>
              <strong>Habitats</strong>
              <small>Check components and spawn rules.</small>
            </span>
          </button>
          <button
            className="destination-button"
            type="button"
            onClick={() => navigate('/planner')}
          >
            <span>
              <strong>Planner</strong>
              <small>Compare house groups of four.</small>
            </span>
          </button>
        </div>
      </section>
    </section>
  )
}
