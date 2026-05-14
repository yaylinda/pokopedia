import { Link } from 'react-router-dom'
import { useUserData } from '../app/userDataContext'
import { datasetStats } from '../data/pokopia'
import { formatter, percentFormatter } from '../utils/format'
import { NavigationTabs } from './NavigationTabs'

export function AppHeader() {
  const {
    exportUserData,
    importInputRef,
    importMessage,
    importUserData,
    ownedCount,
  } = useUserData()
  const totalPokemon = datasetStats.pokemon
  const completion = totalPokemon > 0 ? ownedCount / totalPokemon : 0

  return (
    <header className="app-header">
      <div className="app-topbar">
        <Link className="app-brand" to="/">
          Pokopedia
        </Link>

        <NavigationTabs />

        <section className="tracker-tools" aria-label="User data">
          <div className="tracker-summary">
            <strong>{formatter.format(ownedCount)}</strong>
            <small>
              {percentFormatter.format(completion)} owned
              <span aria-hidden="true"> / </span>
              <span className="tracker-total">
                {formatter.format(totalPokemon)} total
              </span>
            </small>
          </div>
          <div className="header-actions">
            <button className="utility-button" type="button" onClick={exportUserData}>
              Export
            </button>
            <button
              className="utility-button"
              type="button"
              onClick={() => importInputRef.current?.click()}
            >
              Import
            </button>
          </div>
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
      </div>

      {importMessage ? (
        <p className="status-note" role="status">
          {importMessage}
        </p>
      ) : null}
    </header>
  )
}
