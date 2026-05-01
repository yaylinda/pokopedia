import type { RefObject } from 'react'
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
      <div className="header-main">
        <div className="brand-block">
          <span className="brand-mark" aria-hidden="true">
            P
          </span>
          <div>
            <p className="eyebrow">Pokopedia</p>
            <h1>Field guide and house planner</h1>
          </div>
        </div>

        <section className="tracker-tools" aria-label="User data">
          <div className="tracker-summary">
            <span>Owned</span>
            <strong>{formatter.format(ownedCount)}</strong>
            <small>
              {formatter.format(totalPokemon)} total /{' '}
              {percentFormatter.format(completion)}
            </small>
          </div>
          <div className="header-actions">
            <button className="utility-button" type="button" onClick={onExportData}>
              Export JSON
            </button>
            <button
              className="utility-button"
              type="button"
              onClick={() => importInputRef.current?.click()}
            >
              Import JSON
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

      <NavigationTabs activeTab={activeTab} onChange={onTabChange} />

      {importMessage ? (
        <p className="status-note" role="status">
          {importMessage}
        </p>
      ) : null}
    </header>
  )
}
