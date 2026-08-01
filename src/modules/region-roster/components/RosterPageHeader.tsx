import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { currentRegionRoster } from '../../../data/currentRegionRoster'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})

const formatRosterDate = (value: string) =>
  dateFormatter.format(new Date(`${value}T00:00:00Z`))

export function RosterPageHeader() {
  return (
    <Box
      component="header"
      sx={{
        alignItems: { xs: 'start', md: 'end' },
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: { xs: 2, md: 4 },
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ display: 'grid', gap: 0.75 }}>
        <Typography
          color="primary.dark"
          component="p"
          sx={{ fontWeight: 800, letterSpacing: '0.08em' }}
          variant="caption"
        >
          Current region roster
        </Typography>
        <Typography component="h1" id="region-roster-heading" variant="h3">
          Where everyone lives now
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: '62ch' }}>
          Compare comfort, habitat, skills, and favorites—then model a better
          region without losing sight of linked evolution lines.
        </Typography>
      </Box>

      <Stack
        direction="row"
        spacing={{ xs: 2, sm: 3 }}
        sx={{
          borderTop: { xs: '1px solid oklch(0.87 0.02 155)', md: 0 },
          pt: { xs: 1.5, md: 0 },
          width: { xs: '100%', md: 'auto' },
        }}
      >
        <HeaderStat
          label="Placements"
          value={currentRegionRoster.placementCount}
        />
        <HeaderStat
          label="Pokémon"
          value={currentRegionRoster.uniquePokemonCount}
        />
        <HeaderStat
          label="Updated"
          value={formatRosterDate(currentRegionRoster.updatedAt)}
        />
      </Stack>
    </Box>
  )
}

function HeaderStat({ label, value }: { label: string; value: number | string }) {
  return (
    <Box sx={{ minWidth: 72 }}>
      <Typography
        component="strong"
        sx={{ fontVariantNumeric: 'tabular-nums' }}
        variant="h5"
      >
        {value}
      </Typography>
      <Typography
        color="text.secondary"
        sx={{ display: 'block' }}
        variant="caption"
      >
        {label}
      </Typography>
    </Box>
  )
}
