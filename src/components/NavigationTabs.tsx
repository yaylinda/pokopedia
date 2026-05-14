import { getTabHref } from '../routing'

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
    <nav className="tab-nav" aria-label="Primary sections">
      {tabs.map((tab) => (
        <a
          aria-current={activeTab === tab.id ? 'page' : undefined}
          className={activeTab === tab.id ? 'tab-link is-active' : 'tab-link'}
          href={getTabHref(tab.id)}
          key={tab.id}
          onClick={(event) => {
            event.preventDefault()
            onChange(tab.id)
          }}
        >
          <span>{tab.kicker}</span>
          <strong>{tab.label}</strong>
        </a>
      ))}
    </nav>
  )
}
