import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { Link, useLocation } from 'react-router-dom'
import { tabRoutes, type TabId } from '../routing'

const tabs: { id: TabId; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'pokemon', label: 'Pokédex' },
  { id: 'habitats', label: 'Habitats' },
  { id: 'planner', label: 'Planner' },
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
      role="navigation"
      textColor="primary"
      value={activeTab}
      variant="scrollable"
      scrollButtons="auto"
      sx={{
        width: '100%',
        minWidth: 0,
      }}
    >
      {tabs.map((tab) => (
        <Tab
          component={Link}
          key={tab.id}
          label={tab.label}
          sx={{
            flex: { xs: '0 0 auto', sm: '1 1 0' },
            maxWidth: 'none',
          }}
          to={tabRoutes[tab.id]}
          value={tab.id}
        />
      ))}
    </Tabs>
  )
}
