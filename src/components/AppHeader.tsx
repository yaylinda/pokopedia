import type { RefObject } from 'react'
import { getTabHref } from '../routing'
import { formatter, percentFormatter } from '../utils/format'
import { NavigationTabs, type TabId } from './NavigationTabs'

export function AppHeader({
  activeTab,
  importInputRef,
  importMessage,
  onExportData,
  onImportFile,
  onTabChange,
  ownedCount,
  totalPokemon,
}: {
  activeTab: TabId
  importInputRef: RefObject<HTMLInputElement | null>
  importMessage: string
  onExportData: () => void
  onImportFile: (file: File | undefined) => void
  onTabChange: (tab: TabId) => void
  ownedCount: number
  totalPokemon: number
}) {
  const completion = totalPokemon > 0 ? ownedCount / totalPokemon : 0

  return (
    <header className="app-header">
      <div className="app-topbar">
        <a
          className="app-brand"
          href={getTabHref('home')}
          onClick={(event) => {
            event.preventDefault()
            onTabChange('home')
          }}
        >
          Pokopedia
        </a>

        <NavigationTabs activeTab={activeTab} onChange={onTabChange} />

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
            <button className="utility-button" type="button" onClick={onExportData}>
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
            onChange={(event) => onImportFile(event.currentTarget.files?.[0])}
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
