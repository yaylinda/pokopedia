import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useSearchParams } from 'react-router-dom'
import {
  getRosterSnapshot,
  rosterSnapshots,
} from '../../../data/rosterSnapshots'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'UTC',
  timeZoneName: 'short',
})

const formatRosterDate = (value: string) =>
  dateFormatter.format(new Date(value))

export function RosterPageHeader() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedSnapshot = getRosterSnapshot(searchParams.get('snapshot'))
  const chooseSnapshot = (snapshotId: string) => {
    const nextSearchParams = new URLSearchParams(searchParams)

    if (snapshotId === 'current-region-roster') {
      nextSearchParams.delete('snapshot')
    } else {
      nextSearchParams.set('snapshot', snapshotId)
    }

    setSearchParams(nextSearchParams)
  }

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
          Roster snapshot
        </Typography>
        <Typography component="h1" id="region-roster-heading" variant="h3">
          {selectedSnapshot.title}
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: '62ch' }}>
          {selectedSnapshot.sourceNote}
        </Typography>
        <TextField
          label="Visualize JSON snapshot"
          onChange={(event) => chooseSnapshot(event.target.value)}
          select
          size="small"
          sx={{ mt: 0.75, width: { xs: '100%', sm: 390 } }}
          value={selectedSnapshot.snapshotId}
        >
          {rosterSnapshots.map((snapshot) => (
            <MenuItem key={snapshot.snapshotId} value={snapshot.snapshotId}>
              <Box sx={{ display: 'grid', gap: 0.125, minWidth: 0 }}>
                <Typography component="span" noWrap sx={{ fontWeight: 750 }}>
                  {snapshot.title}
                </Typography>
                <Typography color="text.secondary" component="span" variant="caption">
                  {formatRosterDate(snapshot.capturedAt)} · {snapshot.sourceFile}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </TextField>
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
          label={selectedSnapshot.kind === 'current' ? 'Placements' : 'Assigned'}
          value={selectedSnapshot.assignedPokemonCount}
        />
        <HeaderStat
          label={selectedSnapshot.kind === 'current' ? 'Pokémon' : 'Needs review'}
          value={
            selectedSnapshot.kind === 'current'
              ? selectedSnapshot.eligiblePokemonCount
              : selectedSnapshot.ambiguousPokemonCount +
                selectedSnapshot.unassignedPokemonCount
          }
        />
        <HeaderStat
          label="Captured"
          value={formatRosterDate(selectedSnapshot.capturedAt)}
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
