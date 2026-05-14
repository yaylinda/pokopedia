import { NavLink } from 'react-router-dom'
import { tabRoutes, type TabId } from '../routing'

const tabs: { id: TabId; label: string; kicker: string }[] = [
  { id: 'home', label: 'Home', kicker: 'Tracker' },
  { id: 'pokemon', label: 'Pokédex', kicker: 'Entries' },
  { id: 'habitats', label: 'Habitats', kicker: 'Builds' },
  { id: 'planner', label: 'Planner', kicker: 'Houses' },
]

export function NavigationTabs() {
  return (
    <nav className="tab-nav" aria-label="Primary sections">
      {tabs.map((tab) => (
        <NavLink
          className={({ isActive }) =>
            isActive ? 'tab-link is-active' : 'tab-link'
          }
          end={tab.id === 'home'}
          key={tab.id}
          to={tabRoutes[tab.id]}
        >
          <span>{tab.kicker}</span>
          <strong>{tab.label}</strong>
        </NavLink>
      ))}
    </nav>
  )
}
