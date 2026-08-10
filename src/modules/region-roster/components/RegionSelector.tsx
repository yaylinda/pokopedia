import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import {
  comfortLevels,
  type CurrentRegion,
  type RegionRosterPokemon,
} from '../../../data/currentRegionRoster'
import {
  comfortStyles,
  getComfortCounts,
  regionStyles,
} from '../regionRosterConfig'

export function RegionSelector({
  baselineRegions,
  comfortIsAssessed,
  onChoose,
  regions,
  selectedRegionId,
}: {
  baselineRegions: CurrentRegion[]
  comfortIsAssessed: boolean
  onChoose: (regionId: string) => void
  regions: CurrentRegion[]
  selectedRegionId: string
}) {
  return (
    <Box sx={{ display: 'grid', gap: 0.75, minWidth: 0 }}>
      <Box sx={{ alignItems: 'baseline', display: 'flex', justifyContent: 'space-between' }}>
        <Typography component="h2" sx={{ fontWeight: 850 }} variant="subtitle1">
          Regions
        </Typography>
        <Typography color="text.secondary" variant="caption">
          {regions.length} total
        </Typography>
      </Box>
      <Box
        aria-label="Choose a region"
        component="nav"
        sx={{
          display: 'grid',
          gap: 1,
          gridTemplateColumns: {
            xs: `repeat(${regions.length}, minmax(172px, 1fr))`,
            lg: 'minmax(0, 1fr)',
          },
          mx: { xs: -1.5, sm: -2, lg: 0 },
          overflowX: { xs: 'auto', lg: 'visible' },
          px: { xs: 1.5, sm: 2, lg: 0 },
          pb: { xs: 0.5, lg: 0 },
          scrollbarWidth: 'thin',
        }}
      >
        {regions.map((region) => {
          const style = regionStyles[region.regionId]
          const selected = selectedRegionId === region.regionId
          const originalCount =
            baselineRegions.find(
              (currentRegion) => currentRegion.regionId === region.regionId,
            )?.pokemon.length ?? region.pokemon.length
          const countDelta = region.pokemon.length - originalCount

          return (
            <ButtonBase
              aria-pressed={selected}
              key={region.regionId}
              onClick={() => onChoose(region.regionId)}
              sx={{
                alignItems: 'start',
                backgroundColor: selected ? style.soft : 'oklch(0.99 0.004 250)',
                border: `1px solid ${selected ? style.accent : 'oklch(0.86 0.015 250)'}`,
                borderRadius: 1.5,
                color: style.deep,
                display: 'grid',
                gap: 0.75,
                justifyItems: 'stretch',
                minHeight: { xs: 88, lg: 76 },
                p: 1,
                textAlign: 'left',
                transition: 'transform 150ms ease-out, border-color 150ms ease-out',
                '&:hover': {
                  borderColor: style.accent,
                  transform: 'translateX(2px)',
                },
                '&:focus-visible': {
                  outline: `3px solid ${style.accent}`,
                  outlineOffset: 2,
                },
              }}
            >
              <Box sx={{ alignItems: 'start', display: 'flex', gap: 1, justifyContent: 'space-between' }}>
                <Typography component="span" noWrap sx={{ fontWeight: 800 }}>
                  {region.name}
                </Typography>
                <Typography component="strong" variant="h6">
                  {region.pokemon.length}
                </Typography>
              </Box>
              <ComfortBar
                comfortIsAssessed={comfortIsAssessed}
                pokemon={region.pokemon}
                regionId={region.regionId}
              />
              {countDelta !== 0 && (
                <Typography
                  component="span"
                  sx={{ color: style.deep, fontWeight: 800, justifySelf: 'end' }}
                  variant="caption"
                >
                  {countDelta > 0 ? '+' : ''}
                  {countDelta} in model
                </Typography>
              )}
            </ButtonBase>
          )
        })}
      </Box>
    </Box>
  )
}

export function ComfortBar({
  comfortIsAssessed = true,
  large = false,
  pokemon,
  regionId,
}: {
  comfortIsAssessed?: boolean
  large?: boolean
  pokemon: RegionRosterPokemon[]
  regionId: string
}) {
  const counts = getComfortCounts(pokemon, regionId)
  const movedHereCount = pokemon.filter((entry) => entry.regionId !== regionId).length
  const label = comfortLevels
    .map(
      (level) =>
        `${!comfortIsAssessed && level === 'no-home' ? 'Not assessed' : comfortStyles[level].label}: ${counts[level]}`,
    )
    .concat(movedHereCount > 0 ? [`Comfort to recheck: ${movedHereCount}`] : [])
    .join(', ')

  return (
    <Box
      aria-label={label}
      role="img"
      sx={{
        backgroundColor: 'oklch(0.91 0.01 250)',
        borderRadius: 8,
        display: 'flex',
        gap: '2px',
        height: large ? 18 : 8,
        overflow: 'hidden',
      }}
    >
      {comfortLevels.map((level) =>
        counts[level] > 0 ? (
          <Tooltip
            key={level}
            title={`${!comfortIsAssessed && level === 'no-home' ? 'Not assessed' : comfortStyles[level].label}: ${counts[level]}`}
          >
            <Box
              sx={{
                backgroundColor: comfortStyles[level].accent,
                flex: `${counts[level]} 1 0`,
                minWidth: large ? 5 : 2,
              }}
            />
          </Tooltip>
        ) : null,
      )}
      {movedHereCount > 0 && (
        <Tooltip title={`Comfort to recheck: ${movedHereCount}`}>
          <Box
            sx={{
              backgroundColor: 'oklch(0.62 0.025 250)',
              flex: `${movedHereCount} 1 0`,
              minWidth: large ? 5 : 2,
            }}
          />
        </Tooltip>
      )}
    </Box>
  )
}
