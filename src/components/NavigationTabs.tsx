import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { Link, useLocation } from 'react-router-dom'
import { tabRoutes, type TabId } from '../routing'

const tabs: { id: TabId; label: string; kicker: string }[] = [
  { id: 'home', label: 'Home', kicker: 'Tracker' },
  { id: 'pokemon', label: 'Pokédex', kicker: 'Entries' },
  { id: 'habitats', label: 'Habitats', kicker: 'Builds' },
  { id: 'planner', label: 'Planner', kicker: 'Houses' },
]

export function NavigationTabs() {
  const location = useLocation()
  const activeTab =
    tabs.find((tab) =>
      tab.id === 'home'
        ? location.pathname === tabRoutes.home
        : location.pathname.startsWith(tabRoutes[tab.id]),
    )?.id ?? 'home'

  return (
    <Tabs
      aria-label="Primary sections"
      className="tab-nav"
      role="navigation"
      textColor="primary"
      value={activeTab}
      variant="scrollable"
      scrollButtons="auto"
    >
      {tabs.map((tab) => (
        <Tab
          className="tab-link"
          component={Link}
          key={tab.id}
          label={
            <span className="tab-label">
              <span>{tab.kicker}</span>
              <strong>{tab.label}</strong>
            </span>
          }
          to={tabRoutes[tab.id]}
          value={tab.id}
        />
      ))}
    </Tabs>
  )
}
