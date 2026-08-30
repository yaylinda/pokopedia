import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { GroupingStudioWorkspace } from './GroupingStudioWorkspace'
import { useRegionRosterWorkspace } from './hooks/useRegionRosterWorkspace'

export function RegionGroupPlanner() {
  const {
    chooseRegion,
    effectiveStatsBySlug,
    modeledRegions,
    regionStyle,
    selectedRegion,
    selectedSnapshot,
  } = useRegionRosterWorkspace()
  const [studioOpen, setStudioOpen] = useState(true)
  const pokemon = selectedRegion.pokemon.map((resident) => ({
    ...resident,
    lindaStats: effectiveStatsBySlug[resident.slug] ?? resident.lindaStats,
  }))

  return (
    <>
      <Box
        component="section"
        sx={{
          alignItems: { xs: 'start', sm: 'center' },
          backgroundColor: regionStyle.soft,
          border: `1px solid ${regionStyle.accent}`,
          borderRadius: 1.5,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1.5,
          justifyContent: 'space-between',
          p: { xs: 1.5, sm: 2 },
        }}
      >
        <Box sx={{ display: 'grid', gap: 0.25 }}>
          <Typography component="h2" sx={{ color: regionStyle.deep }} variant="h5">
            Grouping studio
          </Typography>
          <Typography sx={{ color: regionStyle.deep }} variant="body2">
            The studio uses a full-screen, two-pane workspace for comparing evolution groups and neighborhoods.
          </Typography>
        </Box>
        <Button
          onClick={() => setStudioOpen(true)}
          startIcon={<OpenInFullRoundedIcon />}
          variant="contained"
        >
          Open grouping studio
        </Button>
      </Box>

      <Dialog
        aria-labelledby="grouping-studio-title"
        fullScreen
        onClose={() => setStudioOpen(false)}
        open={studioOpen}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: 'oklch(0.975 0.006 225)',
              backgroundImage: 'none',
              overflow: 'hidden',
            },
          },
        }}
      >
        <GroupingStudioWorkspace
          key={`${selectedSnapshot.snapshotId}:${selectedRegion.regionId}`}
          onChooseRegion={chooseRegion}
          onClose={() => setStudioOpen(false)}
          pokemon={pokemon}
          regionId={selectedRegion.regionId}
          regions={modeledRegions}
          snapshotId={selectedSnapshot.snapshotId}
          style={regionStyle}
        />
      </Dialog>
    </>
  )
}
