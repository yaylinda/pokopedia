import Box from '@mui/material/Box'
import { RegionSelector } from './components/RegionSelector'
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
  const pokemon = selectedRegion.pokemon.map((resident) => ({
    ...resident,
    lindaStats: effectiveStatsBySlug[resident.slug] ?? resident.lindaStats,
  }))

  return (
    <Box
      sx={{
        alignItems: 'start',
        display: 'grid',
        gap: { xs: 2, lg: 3 },
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: '248px minmax(0, 1fr)' },
        minWidth: 0,
      }}
    >
      <Box
        component="aside"
        sx={{
          alignSelf: 'start',
          minWidth: 0,
          position: { lg: 'sticky' },
          top: { lg: 88 },
        }}
      >
        <RegionSelector
          baselineRegions={selectedSnapshot.regions}
          comfortIsAssessed={selectedSnapshot.kind === 'current'}
          onChoose={chooseRegion}
          regions={modeledRegions}
          selectedRegionId={selectedRegion.regionId}
        />
      </Box>

      <GroupingStudioWorkspace
        key={`${selectedSnapshot.snapshotId}:${selectedRegion.regionId}`}
        pokemon={pokemon}
        regionId={selectedRegion.regionId}
        regionName={selectedRegion.name}
        snapshotId={selectedSnapshot.snapshotId}
        style={regionStyle}
      />
    </Box>
  )
}
