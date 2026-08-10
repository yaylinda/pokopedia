import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { lazy, Suspense } from 'react'
import { useSearchParams } from 'react-router-dom'
import { RosterPageHeader } from './components/RosterPageHeader'
import { RegionRosterWorkspace } from './RegionRosterWorkspace'

const RegionGroupPlanner = lazy(() =>
  import('./RegionGroupPlanner').then((module) => ({
    default: module.RegionGroupPlanner,
  })),
)

export function RegionRosterPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeView = searchParams.get('view') === 'groups' ? 'groups' : 'roster'
  const changeView = (nextView: 'roster' | 'groups') => {
    const nextSearchParams = new URLSearchParams(searchParams)

    if (nextView === 'roster') {
      nextSearchParams.delete('view')
    } else {
      nextSearchParams.set('view', nextView)
    }

    setSearchParams(nextSearchParams)
  }

  return (
    <Box
      aria-labelledby="region-roster-heading"
      component="article"
      sx={{
        display: 'grid',
        gap: { xs: 3, md: 4 },
        minWidth: 0,
      }}
    >
      <RosterPageHeader />
      <Box sx={{ display: 'grid', gap: { xs: 2, md: 3 }, minWidth: 0 }}>
        <Tabs
          aria-label="Region workspace"
          onChange={(_event, nextView: 'roster' | 'groups') =>
            changeView(nextView)
          }
          sx={{
            borderBottom: '1px solid oklch(0.82 0.025 155)',
            minHeight: 44,
            '& .MuiTab-root': {
              minHeight: 44,
              px: { xs: 1.5, sm: 2.5 },
            },
          }}
          value={activeView}
        >
          <Tab
            aria-controls="region-roster-panel"
            id="region-roster-tab"
            label="Roster"
            value="roster"
          />
          <Tab
            aria-controls="region-groups-panel"
            id="region-groups-tab"
            label="Group planner"
            value="groups"
          />
        </Tabs>

        <Box
          aria-labelledby={`${activeView === 'roster' ? 'region-roster' : 'region-groups'}-tab`}
          id={`${activeView === 'roster' ? 'region-roster' : 'region-groups'}-panel`}
          role="tabpanel"
          sx={{ minWidth: 0 }}
        >
          {activeView === 'roster' ? (
            <RegionRosterWorkspace />
          ) : (
            <Suspense
              fallback={(
                <Box aria-live="polite" sx={{ color: 'text.secondary', py: 4 }}>
                  Loading group planner…
                </Box>
              )}
            >
              <RegionGroupPlanner />
            </Suspense>
          )}
        </Box>
      </Box>
    </Box>
  )
}
