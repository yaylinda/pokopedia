import Box from '@mui/material/Box'
import { RosterPageHeader } from './components/RosterPageHeader'
import { RegionRosterWorkspace } from './RegionRosterWorkspace'

export function RegionRosterPage() {
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
      <RegionRosterWorkspace />
    </Box>
  )
}
