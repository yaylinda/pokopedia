export type TabId = 'home' | 'pokemon' | 'habitats' | 'planner'

const tabs: { id: TabId; label: string; kicker: string }[] = [
  { id: 'home', label: 'Home', kicker: 'Tracker' },
  { id: 'pokemon', label: 'Pokédex', kicker: 'Entries' },
  { id: 'habitats', label: 'Habitats', kicker: 'Builds' },
  { id: 'planner', label: 'Planner', kicker: 'Houses' },
]

export function NavigationTabs({
  activeTab,
  onChange,
}: {
  activeTab: TabId
  onChange: (tab: TabId) => void
}) {
  return (
    <nav className="tab-nav" aria-label="Primary sections" role="tablist">
      {tabs.map((tab) => (
        <button
          aria-controls={`${tab.id}-panel`}
          aria-selected={activeTab === tab.id}
          className={activeTab === tab.id ? 'tab-button is-active' : 'tab-button'}
          id={`${tab.id}-tab`}
          key={tab.id}
          onClick={() => onChange(tab.id)}
          role="tab"
          type="button"
        >
          <span>{tab.kicker}</span>
          <strong>{tab.label}</strong>
        </button>
      ))}
    </nav>
  )
}
