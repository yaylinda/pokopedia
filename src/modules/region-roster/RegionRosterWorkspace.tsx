import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded'
import FilterAltOffRoundedIcon from '@mui/icons-material/FilterAltOffRounded'
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded'
import HandymanRoundedIcon from '@mui/icons-material/HandymanRounded'
import LandscapeRoundedIcon from '@mui/icons-material/LandscapeRounded'
import LinkRoundedIcon from '@mui/icons-material/LinkRounded'
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded'
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import WorkspacesRoundedIcon from '@mui/icons-material/WorkspacesRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Chip from '@mui/material/Chip'
import Collapse from '@mui/material/Collapse'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import {
  comfortLevels,
  type CurrentRegion,
  type RegionRosterPokemon,
} from '../../data/currentRegionRoster'
import {
  getEvolutionConstraintGroup,
  rosterConstraintGraph,
} from '../../data/rosterConstraints'
import type {
  LindaPokemonRating,
  LindaPokemonStats,
} from '../../data/types'
import {
  allRosterPokemonBySlug,
  comfortStyles,
  getAbilityDistribution,
  getComfortCounts,
  getFlavorDistribution,
  getHabitatDistribution,
  regionStyles,
  type DistributionSegment,
  type PokemonGroup,
  type VisualStyle,
} from './regionRosterConfig'
import { useRegionRosterWorkspace } from './hooks/useRegionRosterWorkspace'

export function RegionRosterWorkspace() {
  const {
    chooseRegion,
    effectiveStatsBySlug,
    evolutionViolationCount,
    expandedKey,
    filteredPokemon,
    groups,
    modeledRegions,
    moveCount,
    movePokemon,
    query,
    regionStyle,
    resetRosterModel,
    selectedRegion,
    selectedSnapshot,
    setExpandedKey,
    setQuery,
    updatePokemonStats,
  } = useRegionRosterWorkspace()

  return (
    <Box
      sx={{
        display: 'grid',
        minWidth: 0,
      }}
    >
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
            display: 'grid',
            gap: 1.5,
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
          {selectedSnapshot.kind === 'ideation' && (
            <SnapshotReviewStatus
              ambiguousCount={selectedSnapshot.ambiguousPokemonCount}
              assignedCount={selectedSnapshot.assignedPokemonCount}
              sourceFile={selectedSnapshot.sourceFile}
              unassignedCount={selectedSnapshot.unassignedPokemonCount}
            />
          )}
          <RosterModelStatus
            evolutionViolationCount={evolutionViolationCount}
            moveCount={moveCount}
            onReset={resetRosterModel}
          />
        </Box>

        <Box sx={{ display: 'grid', gap: 1.5, minWidth: 0 }}>
          <RegionSummary
            comfortIsAssessed={selectedSnapshot.kind === 'current'}
            lindaStatsBySlug={effectiveStatsBySlug}
            pokemon={selectedRegion.pokemon}
            regionName={selectedRegion.name}
            selectedRegionId={selectedRegion.regionId}
            style={regionStyle}
          />

          <RosterSearch
            onQueryChange={setQuery}
            query={query}
          />

        <Box
          aria-live="polite"
          sx={{
            alignItems: { xs: 'start', sm: 'center' },
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 0.75,
            justifyContent: 'space-between',
          }}
        >
          <Typography color="text.secondary" variant="body2">
            {query
              ? `${filteredPokemon.length} of ${selectedRegion.pokemon.length} Pokémon match`
              : `${selectedRegion.pokemon.length} Pokémon across ${groups.length} ideal habitats`}
          </Typography>
          {query && (
            <Button
              color="inherit"
              onClick={() => setQuery('')}
              size="small"
              startIcon={<FilterAltOffRoundedIcon />}
              variant="text"
            >
              Clear search
            </Button>
          )}
        </Box>

        {groups.some((group) => group.pokemon.length > 0) ? (
          <Box sx={{ display: 'grid', gap: 1.25 }}>
            {groups.map((group) => (
              <PokemonGroupSection
                activeRegionId={selectedRegion.regionId}
                comfortIsAssessed={selectedSnapshot.kind === 'current'}
                expandedKey={expandedKey}
                group={group}
                key={group.id}
                modeledRegions={modeledRegions}
                pokemonStatsBySlug={effectiveStatsBySlug}
                onToggle={(key) =>
                  setExpandedKey((current) => (current === key ? null : key))
                }
                onUpdatePokemonStats={updatePokemonStats}
                onMovePokemon={(pokemon, regionId) =>
                  movePokemon(pokemon.slug, regionId)
                }
              />
            ))}
          </Box>
        ) : (
          <EmptyRoster onReset={() => setQuery('')} />
        )}
        </Box>
      </Box>
    </Box>
  )
}

function RegionSelector({
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

function SnapshotReviewStatus({
  ambiguousCount,
  assignedCount,
  sourceFile,
  unassignedCount,
}: {
  ambiguousCount: number
  assignedCount: number
  sourceFile: string
  unassignedCount: number
}) {
  return (
    <Box
      component="section"
      sx={{
        backgroundColor: 'oklch(0.97 0.025 88)',
        border: '1px solid oklch(0.82 0.08 84)',
        borderRadius: 1.5,
        display: 'grid',
        gap: 0.75,
        p: 1,
      }}
    >
      <Typography color="text.secondary" component="h2" variant="overline">
        Snapshot coverage
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
        <Chip label={`${assignedCount} assigned`} size="small" />
        <Chip color="warning" label={`${ambiguousCount} ambiguous`} size="small" />
        <Chip label={`${unassignedCount} unassigned`} size="small" variant="outlined" />
      </Box>
      <Typography
        color="text.secondary"
        sx={{ overflowWrap: 'anywhere' }}
        variant="caption"
      >
        {sourceFile}
      </Typography>
    </Box>
  )
}

function RosterModelStatus({
  evolutionViolationCount,
  moveCount,
  onReset,
}: {
  evolutionViolationCount: number
  moveCount: number
  onReset: () => void
}) {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 0.75,
        pt: 0.5,
      }}
    >
      <Typography color="text.secondary" component="h2" variant="overline">
        Evolution constraints
      </Typography>
      <Stack direction="row" spacing={0.75} sx={{ alignItems: 'flex-start' }}>
        <LinkRoundedIcon
          sx={{
            color: evolutionViolationCount > 0 ? 'warning.dark' : 'success.dark',
            fontSize: 17,
            mt: 0.125,
          }}
        />
        <Box sx={{ display: 'grid', gap: 0.125 }}>
          <Typography sx={{ fontWeight: 800 }} variant="caption">
            {evolutionViolationCount > 0
              ? `${evolutionViolationCount} evolution lines split`
              : 'All evolution lines together'}
          </Typography>
          <Typography color="text.secondary" variant="caption">
            {rosterConstraintGraph.nodeCount} nodes · {rosterConstraintGraph.edgeCount} must-link edges
          </Typography>
        </Box>
      </Stack>
      {moveCount > 0 && (
        <Button
          color="inherit"
          onClick={onReset}
          size="small"
          startIcon={<RestartAltRoundedIcon />}
          sx={{ justifySelf: 'start', px: 0.5 }}
          variant="text"
        >
          Reset {moveCount} {moveCount === 1 ? 'move' : 'moves'}
        </Button>
      )}
    </Box>
  )
}

function RegionSummary({
  comfortIsAssessed,
  lindaStatsBySlug,
  pokemon,
  regionName,
  selectedRegionId,
  style,
}: {
  comfortIsAssessed: boolean
  lindaStatsBySlug: Record<string, LindaPokemonStats>
  pokemon: RegionRosterPokemon[]
  regionName: string
  selectedRegionId: string
  style: VisualStyle
}) {
  const counts = getComfortCounts(pokemon, selectedRegionId)
  const movedHereCount = pokemon.filter(
    (entry) => entry.regionId !== selectedRegionId,
  ).length
  const stats = pokemon.map(
    (entry) => lindaStatsBySlug[entry.slug] ?? entry.lindaStats,
  )
  const average = (key: 'likeRating' | 'usefulnessRating') => {
    const ratings = stats.flatMap((entry) =>
      entry[key] === null ? [] : [entry[key]],
    )
    return ratings.length > 0
      ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1)
      : '—'
  }
  const belongsDecided = stats.filter(
    (entry) => entry.belongsInCurrentRegion !== null,
  ).length
  const belongsHere = stats.filter(
    (entry) => entry.belongsInCurrentRegion === true,
  ).length

  return (
    <Box
      component="section"
      sx={{
        alignItems: { xs: 'stretch', lg: 'center' },
        backgroundColor: 'oklch(0.995 0.003 250)',
        border: `1px solid ${style.accent}`,
        borderRadius: 1.5,
        display: 'grid',
        gap: { xs: 1.5, lg: 2.5 },
        gridTemplateColumns: { xs: '1fr', lg: '220px minmax(0, 1fr)' },
        p: { xs: 1.5, md: 2 },
      }}
    >
      <Box>
        <Typography color={style.deep} component="p" variant="overline">
          Selected region
        </Typography>
        <Typography component="h2" variant="h4">
          {regionName}
        </Typography>
        <Typography color="text.secondary" variant="body2">
          {pokemon.length} residents · environment level 10
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gap: 1 }}>
        <ComfortBar
          comfortIsAssessed={comfortIsAssessed}
          large
          pokemon={pokemon}
          regionId={selectedRegionId}
        />
        <Box
          sx={{
            display: 'grid',
            gap: 0.75,
            gridTemplateColumns: {
              xs: 'repeat(3, minmax(0, 1fr))',
              md: 'repeat(6, minmax(0, 1fr))',
            },
          }}
        >
          {comfortLevels.map((level) => (
            <Box key={level} sx={{ alignItems: 'center', display: 'flex', gap: 0.625 }}>
              <Box
                aria-hidden="true"
                sx={{
                  backgroundColor: comfortStyles[level].accent,
                  borderRadius: '50%',
                  flex: '0 0 auto',
                  height: 9,
                  width: 9,
                }}
              />
              <Typography component="strong" sx={{ color: comfortStyles[level].deep }}>
                {counts[level]}
              </Typography>
              <Typography color="text.secondary" noWrap variant="caption">
                {!comfortIsAssessed && level === 'no-home'
                  ? 'Not assessed'
                  : comfortStyles[level].label}
              </Typography>
            </Box>
          ))}
          {movedHereCount > 0 && (
            <Box sx={{ alignItems: 'center', display: 'flex', gap: 0.625 }}>
              <Box
                aria-hidden="true"
                sx={{
                  backgroundColor: 'oklch(0.62 0.025 250)',
                  borderRadius: '50%',
                  flex: '0 0 auto',
                  height: 9,
                  width: 9,
                }}
              />
              <Typography component="strong">{movedHereCount}</Typography>
              <Typography color="text.secondary" noWrap variant="caption">
                Recheck
              </Typography>
            </Box>
          )}
        </Box>
        <Box
          sx={{
            borderTop: '1px solid oklch(0.89 0.018 250)',
            display: 'grid',
            gap: 1,
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            pt: 1,
          }}
        >
          <RegionLindaMetric
            explanation="Linda's personal preference. 1 means not for me and 5 means favorite. Ratings start at 3, while Legendary and Mythical Pokémon start at 5."
            icon={<FavoriteRoundedIcon />}
            label="Avg. like"
            value={`${average('likeRating')}/5`}
          />
          <RegionLindaMetric
            explanation="How useful this Pokémon's skills are to Linda. Scores start empty, except Hype-only Pokémon start at 1 and Hype plus another ability starts at 3."
            icon={<HandymanRoundedIcon />}
            label="Avg. useful"
            value={`${average('usefulnessRating')}/5`}
          />
          <RegionLindaMetric
            explanation="Linda's decision about whether each Pokémon belongs in its current region. Undecided Pokémon are not counted in this total."
            icon={<PlaceRoundedIcon />}
            label="Belongs here"
            value={belongsDecided > 0 ? `${belongsHere}/${belongsDecided}` : 'Not decided'}
          />
        </Box>
      </Box>

      <RegionDistributions pokemon={pokemon} />
    </Box>
  )
}

function RegionDistributions({
  pokemon,
}: {
  pokemon: RegionRosterPokemon[]
}) {
  const abilitySegments = getAbilityDistribution(pokemon)
  const abilityCount = abilitySegments.reduce(
    (total, segment) => total + segment.count,
    0,
  )

  return (
    <Box
      sx={{
        borderTop: '1px solid oklch(0.89 0.018 250)',
        display: 'grid',
        gap: 1.5,
        gridColumn: '1 / -1',
        pt: 1.5,
      }}
    >
      <Typography color="text.secondary" component="h3" variant="overline">
        Region breakdowns
      </Typography>
      <DistributionRow
        description={`${abilityCount} assignments · Pokémon may have more than one`}
        label="Ability types"
        segments={abilitySegments}
      />
      <DistributionRow
        description={`${pokemon.length} Pokémon`}
        label="Favorite food flavors"
        segments={getFlavorDistribution(pokemon)}
      />
      <DistributionRow
        description={`${pokemon.length} Pokémon`}
        label="Ideal habitats"
        segments={getHabitatDistribution(pokemon)}
      />
    </Box>
  )
}

function DistributionRow({
  description,
  label,
  segments,
}: {
  description: string
  label: string
  segments: DistributionSegment[]
}) {
  const accessibleLabel = segments
    .map((segment) => `${segment.label}: ${segment.count}`)
    .join(', ')

  return (
    <Box
      sx={{
        display: 'grid',
        gap: { xs: 0.75, md: 1.5 },
        gridTemplateColumns: { xs: '1fr', md: '160px minmax(0, 1fr)' },
        minWidth: 0,
      }}
    >
      <Box sx={{ alignSelf: 'start', display: 'grid', gap: 0.125 }}>
        <Typography component="h4" sx={{ fontWeight: 850 }} variant="body2">
          {label}
        </Typography>
        <Typography color="text.secondary" variant="caption">
          {description}
        </Typography>
      </Box>
      <Box sx={{ display: 'grid', gap: 0.75, minWidth: 0 }}>
        <Box
          aria-label={`${label}. ${accessibleLabel}`}
          role="img"
          sx={{
            backgroundColor: 'oklch(0.91 0.01 250)',
            borderRadius: 8,
            display: 'flex',
            gap: '2px',
            height: 14,
            overflow: 'hidden',
          }}
        >
          {segments.map((segment) => (
            <Tooltip
              key={segment.id}
              title={`${segment.label}: ${segment.count}`}
            >
              <Box
                sx={{
                  backgroundColor: segment.color,
                  flex: `${segment.count} 1 0`,
                  minWidth: 4,
                }}
              />
            </Tooltip>
          ))}
        </Box>
        <Box
          aria-hidden="true"
          sx={{
            alignItems: 'center',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px 12px',
          }}
        >
          {segments.map((segment) => (
            <Box
              key={segment.id}
              sx={{ alignItems: 'center', display: 'flex', gap: 0.5 }}
            >
              <Box
                sx={{
                  backgroundColor: segment.color,
                  borderRadius: '50%',
                  flex: '0 0 auto',
                  height: 8,
                  width: 8,
                }}
              />
              <Typography component="strong" sx={{ fontWeight: 800 }} variant="caption">
                {segment.count}
              </Typography>
              <Typography color="text.secondary" variant="caption">
                {segment.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}

function RegionLindaMetric({
  explanation,
  icon,
  label,
  value,
}: {
  explanation: string
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <Tooltip arrow placement="top" title={explanation}>
      <Box
        aria-label={`${label}: ${value}. ${explanation}`}
        tabIndex={0}
        sx={{
          alignItems: 'center',
          borderRadius: 1,
          cursor: 'help',
          display: 'grid',
          gap: 0.25,
          gridTemplateColumns: 'auto 1fr',
          outlineOffset: 3,
        }}
      >
        <Box
          aria-hidden="true"
          sx={{ color: 'oklch(0.53 0.13 42)', display: 'flex', gridRow: '1 / 3', '& svg': { fontSize: 18 } }}
        >
          {icon}
        </Box>
        <Typography component="strong" sx={{ fontWeight: 850 }} variant="body2">
          {value}
        </Typography>
        <Typography color="text.secondary" variant="caption">
          {label}
        </Typography>
      </Box>
    </Tooltip>
  )
}

function ComfortBar({
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

function RosterSearch({
  onQueryChange,
  query,
}: {
  onQueryChange: (value: string) => void
  query: string
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <TextField
        aria-label="Search Pokémon in this region"
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search Pokémon, skill, habitat, favorite…"
        size="small"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: query ? (
              <InputAdornment position="end">
                <ButtonBase
                  aria-label="Clear search"
                  onClick={() => onQueryChange('')}
                  sx={{ borderRadius: '50%', p: 0.25 }}
                >
                  <CloseRoundedIcon fontSize="small" />
                </ButtonBase>
              </InputAdornment>
            ) : undefined,
          },
        }}
        sx={{ width: { xs: '100%', md: 340 } }}
        value={query}
      />
    </Box>
  )
}

function PokemonGroupSection({
  activeRegionId,
  comfortIsAssessed,
  expandedKey,
  group,
  modeledRegions,
  onMovePokemon,
  onToggle,
  onUpdatePokemonStats,
  pokemonStatsBySlug,
}: {
  activeRegionId: string
  comfortIsAssessed: boolean
  expandedKey: string | null
  group: PokemonGroup
  modeledRegions: CurrentRegion[]
  onMovePokemon: (pokemon: RegionRosterPokemon, regionId: string) => void
  onToggle: (key: string) => void
  onUpdatePokemonStats: (
    slug: string,
    update: Partial<LindaPokemonStats>,
  ) => void
  pokemonStatsBySlug: Record<string, LindaPokemonStats>
}) {
  const expansionPrefix = `${group.id}:`

  return (
    <Box
      component="section"
      sx={{
        backgroundColor: group.pokemon.length > 0 ? 'oklch(0.995 0.003 250)' : group.soft,
        border: `1px solid ${group.pokemon.length > 0 ? 'oklch(0.86 0.016 250)' : group.accent}`,
        borderRadius: 1.5,
        display: 'grid',
        gap: 1.5,
        minWidth: 0,
        p: { xs: 1.25, md: 1.5 },
      }}
    >
      <Box
        sx={{
          alignItems: 'baseline',
          display: 'flex',
          flexWrap: 'wrap',
          gap: { xs: 0.5, sm: 1 },
        }}
      >
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
          <Box
            aria-hidden="true"
            sx={{
              backgroundColor: group.accent,
              borderRadius: '50%',
              height: 11,
              width: 11,
            }}
          />
          <Typography component="h3" sx={{ color: group.deep }} variant="h6">
            {group.label}
          </Typography>
        </Stack>
        <Typography color="text.secondary" variant="caption">
          {group.pokemon.length} {group.pokemon.length === 1 ? 'Pokémon' : 'Pokémon'}
        </Typography>
        <Typography color={group.deep} sx={{ ml: { sm: 'auto' } }} variant="caption">
          {group.note}
        </Typography>
      </Box>

      {group.pokemon.length > 0 ? (
        <Box
          sx={{
            display: 'grid',
            gap: 1.5,
            gridTemplateColumns: {
              xs: 'minmax(0, 1fr)',
              md: 'repeat(2, minmax(0, 1fr))',
            },
            minWidth: 0,
          }}
        >
          {group.pokemon.map((pokemon) => {
            const cardKey = `${expansionPrefix}${pokemon.key}`
            return (
              <PokemonTile
                activeRegionId={activeRegionId}
                comfortIsAssessed={comfortIsAssessed}
                expanded={expandedKey === cardKey}
                key={pokemon.key}
                lindaStats={pokemonStatsBySlug[pokemon.slug] ?? pokemon.lindaStats}
                modeledRegions={modeledRegions}
                onMove={(regionId) => onMovePokemon(pokemon, regionId)}
                onToggle={() => onToggle(cardKey)}
                onUpdateLindaStats={(update) =>
                  onUpdatePokemonStats(pokemon.slug, {
                    ...(pokemonStatsBySlug[pokemon.slug] ?? pokemon.lindaStats),
                    ...update,
                  })
                }
                pokemon={pokemon}
              />
            )
          })}
        </Box>
      ) : (
        <Typography color="text.secondary" sx={{ alignSelf: 'center', py: 1 }} variant="body2">
          No Pokémon in this group.
        </Typography>
      )}
    </Box>
  )
}

function PokemonTile({
  activeRegionId,
  comfortIsAssessed,
  expanded,
  lindaStats,
  modeledRegions,
  onMove,
  onToggle,
  onUpdateLindaStats,
  pokemon,
}: {
  activeRegionId: string
  comfortIsAssessed: boolean
  expanded: boolean
  lindaStats: LindaPokemonStats
  modeledRegions: CurrentRegion[]
  onMove: (regionId: string) => void
  onToggle: () => void
  onUpdateLindaStats: (update: Partial<LindaPokemonStats>) => void
  pokemon: RegionRosterPokemon
}) {
  const comfortStyle = comfortStyles[pokemon.comfortLevel]
  const evolutionGroup = getEvolutionConstraintGroup(pokemon.slug)
  const movedHere = activeRegionId !== pokemon.regionId
  const skillsLabel =
    pokemon.specialties.length > 0
      ? pokemon.specialties.map((specialty) => specialty.name).join(', ')
      : 'No skills listed'
  const favoritesLabel =
    pokemon.favorites.length > 0
      ? pokemon.favorites.map((favorite) => favorite.name).join(', ')
      : 'No favorites listed'

  return (
    <Box
      component="article"
      sx={{
        alignContent: 'start',
        backgroundColor: 'oklch(0.985 0.006 250)',
        border: `1px solid ${expanded ? comfortStyle.accent : 'oklch(0.88 0.015 250)'}`,
        borderRadius: 1.25,
        display: 'grid',
        minWidth: 0,
        overflow: 'hidden',
        transition: 'border-color 150ms ease-out, transform 150ms ease-out',
        '&:hover': {
          borderColor: comfortStyle.accent,
          transform: 'translateY(-1px)',
        },
      }}
    >
      <ButtonBase
        aria-expanded={expanded}
        onClick={onToggle}
        sx={{
          color: 'text.primary',
          display: 'grid',
          gridTemplateColumns: '64px minmax(0, 1fr) auto',
          justifyItems: 'stretch',
          minHeight: 108,
          p: 0.75,
          textAlign: 'left',
          '&:focus-visible': {
            outline: `3px solid ${comfortStyle.accent}`,
            outlineOffset: -3,
          },
        }}
      >
        <Box
          sx={{
            alignItems: 'center',
            backgroundColor: comfortStyle.soft,
            borderRadius: 1,
            display: 'flex',
            height: 60,
            justifyContent: 'center',
            position: 'relative',
            width: 60,
          }}
        >
          {pokemon.imageUrl ? (
            <Box
              alt=""
              component="img"
              loading="lazy"
              src={pokemon.imageUrl}
              sx={{ height: 56, objectFit: 'contain', width: 56 }}
            />
          ) : (
            <Typography color={comfortStyle.deep} variant="h5">
              {pokemon.name.charAt(0)}
            </Typography>
          )}
          {pokemon.isLegendaryOrMythical && (
            <Tooltip title="Legendary or Mythical Pokémon">
              <StarRoundedIcon
                aria-label="Legendary or Mythical Pokémon"
                sx={{
                  color: 'oklch(0.70 0.17 82)',
                  filter: 'drop-shadow(0 1px 0 oklch(0.98 0.01 80))',
                  fontSize: 18,
                  position: 'absolute',
                  right: 2,
                  top: 2,
                }}
              />
            </Tooltip>
          )}
        </Box>

        <Box sx={{ alignContent: 'center', display: 'grid', gap: 0.5, minWidth: 0, px: 0.75 }}>
          <Typography component="h4" noWrap sx={{ fontWeight: 800 }}>
            {pokemon.name}
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', minWidth: 0 }}>
            <Typography
              component="span"
              noWrap
              sx={{ color: comfortStyle.deep, fontWeight: 750 }}
              variant="caption"
            >
              {pokemon.idealHabitat?.name ?? 'No ideal habitat listed'}
            </Typography>
            <Typography color="text.disabled" component="span" variant="caption">
              ·
            </Typography>
            <Typography color="text.secondary" component="span" noWrap variant="caption">
              {skillsLabel}
            </Typography>
          </Stack>
          <Typography color="text.secondary" noWrap variant="caption">
            <Box component="span" sx={{ color: 'text.primary', fontWeight: 750 }}>
              Favorites:
            </Box>{' '}
            {favoritesLabel}
          </Typography>
        </Box>

        <ExpandMoreRoundedIcon
          sx={{
            alignSelf: 'center',
            color: 'text.secondary',
            fontSize: 20,
            transform: expanded ? 'rotate(180deg)' : 'none',
            transition: 'transform 150ms ease-out',
          }}
        />
      </ButtonBase>

      <Collapse in={expanded}>
        <Box
          sx={{
            borderTop: '1px solid oklch(0.88 0.015 250)',
            display: 'grid',
            gap: 1,
            p: 1,
          }}
        >
          <DetailRow
            icon={<GridViewRoundedIcon />}
            label="Current comfort"
            values={
              movedHere
                ? ['Needs rechecking in-game']
                : [comfortIsAssessed ? comfortStyle.label : 'Not assessed in this ideation']
            }
          />
          <DetailRow
            icon={<LandscapeRoundedIcon />}
            label="Ideal habitat"
            values={pokemon.idealHabitat ? [pokemon.idealHabitat.name] : []}
          />
          <DetailRow
            icon={<WorkspacesRoundedIcon />}
            label="Skills"
            values={pokemon.specialties.map((specialty) => specialty.name)}
          />
          <LindaStatsEditor
            onChange={onUpdateLindaStats}
            pokemonName={pokemon.name}
            stats={lindaStats}
          />
          <RosterMoveControl
            activeRegionId={activeRegionId}
            evolutionGroup={evolutionGroup}
            modeledRegions={modeledRegions}
            onMove={onMove}
            originalRegionName={pokemon.regionName}
            pokemonName={pokemon.name}
          />
          <DetailRow
            icon={<AutoAwesomeRoundedIcon />}
            label="Favorites"
            values={pokemon.favorites.map((favorite) => favorite.name)}
          />
        </Box>
      </Collapse>
    </Box>
  )
}

function LindaStatsEditor({
  onChange,
  pokemonName,
  stats,
}: {
  onChange: (update: Partial<LindaPokemonStats>) => void
  pokemonName: string
  stats: LindaPokemonStats
}) {
  return (
    <Box
      component="section"
      sx={{
        backgroundColor: 'oklch(0.965 0.035 72)',
        border: '1px solid oklch(0.84 0.07 72)',
        borderRadius: 1,
        display: 'grid',
        gap: 1.25,
        p: 1,
      }}
    >
      <Box sx={{ display: 'grid', gap: 0.125 }}>
        <Typography component="h5" sx={{ color: 'oklch(0.38 0.10 52)', fontWeight: 850 }} variant="subtitle2">
          Linda’s take
        </Typography>
        <Typography color="text.secondary" variant="caption">
          Adjust the starting scores for {pokemonName}.
        </Typography>
      </Box>
      <LindaRatingControl
        accent="oklch(0.65 0.16 25)"
        guide="1 not for me · 3 like · 5 favorite"
        icon={<FavoriteRoundedIcon />}
        label="How much I like them"
        onChange={(likeRating) => onChange({ likeRating })}
        value={stats.likeRating}
      />
      <LindaRatingControl
        accent="oklch(0.60 0.13 235)"
        guide="1 niche · 3 handy · 5 essential"
        icon={<HandymanRoundedIcon />}
        label="How useful they are"
        onChange={(usefulnessRating) => onChange({ usefulnessRating })}
        value={stats.usefulnessRating}
      />
      <Box sx={{ display: 'grid', gap: 0.5 }}>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <PlaceRoundedIcon sx={{ color: 'oklch(0.52 0.14 42)', fontSize: 17 }} />
          <Typography component="p" sx={{ fontWeight: 800 }} variant="caption">
            Belongs in this region
          </Typography>
        </Stack>
        <ToggleButtonGroup
          aria-label={`Whether ${pokemonName} belongs in this region`}
          exclusive
          onChange={(_event, next: 'yes' | 'no' | 'undecided' | null) => {
            if (!next) return
            onChange({
              belongsInCurrentRegion:
                next === 'undecided' ? null : next === 'yes',
            })
          }}
          size="small"
          value={
            stats.belongsInCurrentRegion === null
              ? 'undecided'
              : stats.belongsInCurrentRegion
                ? 'yes'
                : 'no'
          }
          sx={{
            '& .MuiToggleButton-root': {
              minHeight: 32,
              px: 1,
              textTransform: 'none',
            },
          }}
        >
          <ToggleButton value="yes">Yes</ToggleButton>
          <ToggleButton value="no">No</ToggleButton>
          <ToggleButton value="undecided">Not decided</ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Box>
  )
}

function LindaRatingControl({
  accent,
  guide,
  icon,
  label,
  onChange,
  value,
}: {
  accent: string
  guide: string
  icon: ReactNode
  label: string
  onChange: (value: LindaPokemonRating) => void
  value: LindaPokemonRating | null
}) {
  const scores: LindaPokemonRating[] = [1, 2, 3, 4, 5]

  return (
    <Box sx={{ display: 'grid', gap: 0.5 }}>
      <Box sx={{ alignItems: 'center', display: 'flex', gap: 0.5, justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <Box sx={{ color: accent, display: 'flex', '& svg': { fontSize: 17 } }}>{icon}</Box>
          <Typography component="p" sx={{ fontWeight: 800 }} variant="caption">
            {label}
          </Typography>
        </Stack>
        <Typography color="text.secondary" variant="caption">
          {value ?? '—'}/5
        </Typography>
      </Box>
      <Box aria-label={`${label}: ${value ?? 'not rated'} out of 5`} role="group" sx={{ display: 'grid', gap: 0.5, gridTemplateColumns: 'repeat(5, 1fr)' }}>
        {scores.map((score) => (
          <ButtonBase
            aria-label={`${score} out of 5`}
            aria-pressed={value === score}
            key={score}
            onClick={() => onChange(score)}
            sx={{
              backgroundColor: value !== null && score <= value ? accent : 'oklch(0.93 0.015 250)',
              border: `1px solid ${value === score ? 'oklch(0.34 0.05 250)' : 'transparent'}`,
              borderRadius: 0.75,
              color: value !== null && score <= value ? 'oklch(0.99 0.003 250)' : 'text.secondary',
              fontSize: '0.72rem',
              fontWeight: 850,
              minHeight: 28,
            }}
          >
            {score}
          </ButtonBase>
        ))}
      </Box>
      <Typography color="text.secondary" variant="caption">
        {guide}
      </Typography>
    </Box>
  )
}

function RosterMoveControl({
  activeRegionId,
  evolutionGroup,
  modeledRegions,
  onMove,
  originalRegionName,
  pokemonName,
}: {
  activeRegionId: string
  evolutionGroup: string[]
  modeledRegions: CurrentRegion[]
  onMove: (regionId: string) => void
  originalRegionName: string
  pokemonName: string
}) {
  const modeledPokemonSlugs = new Set(
    modeledRegions.flatMap((region) =>
      region.pokemon.map((pokemon) => pokemon.slug),
    ),
  )
  const evolutionMembers = evolutionGroup.flatMap((slug) => {
    if (!modeledPokemonSlugs.has(slug)) return []

    const member = allRosterPokemonBySlug.get(slug)
    return member ? [member.name] : []
  })

  return (
    <Box
      component="section"
      sx={{
        backgroundColor: 'oklch(0.955 0.03 250)',
        border: '1px solid oklch(0.80 0.055 250)',
        borderRadius: 1,
        display: 'grid',
        gap: 1,
        p: 1,
      }}
    >
      <Box sx={{ display: 'grid', gap: 0.125 }}>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <AccountTreeRoundedIcon sx={{ color: 'oklch(0.43 0.12 250)', fontSize: 17 }} />
          <Typography component="h5" sx={{ fontWeight: 850 }} variant="subtitle2">
            Roster sandbox
          </Typography>
        </Stack>
        <Typography color="text.secondary" variant="caption">
          Originally in {originalRegionName}. A move resets “belongs here” to not decided,
          and comfort must be rechecked in-game.
        </Typography>
      </Box>
      {evolutionMembers.length > 1 && (
        <Box sx={{ display: 'grid', gap: 0.5 }}>
          <Typography sx={{ color: 'oklch(0.40 0.10 285)', fontWeight: 800 }} variant="caption">
            Must-link constraint · this evolution line moves together
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {evolutionMembers.map((name) => (
              <Chip icon={<LinkRoundedIcon />} key={name} label={name} size="small" variant="outlined" />
            ))}
          </Box>
        </Box>
      )}
      <TextField
        aria-label={`Move ${pokemonName} to another region`}
        fullWidth
        label={evolutionMembers.length > 1 ? 'Move evolution line to' : 'Move Pokémon to'}
        onChange={(event) => onMove(event.target.value)}
        select
        size="small"
        value={activeRegionId}
      >
        {modeledRegions.map((region) => (
          <MenuItem key={region.regionId} value={region.regionId}>
            {region.name} · {region.pokemon.length} Pokémon
          </MenuItem>
        ))}
      </TextField>
    </Box>
  )
}

function DetailRow({
  icon,
  label,
  values,
}: {
  icon: ReactNode
  label: string
  values: string[]
}) {
  return (
    <Box sx={{ display: 'grid', gap: 0.5 }}>
      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
        <Box sx={{ color: 'text.secondary', display: 'flex', '& svg': { fontSize: 16 } }}>
          {icon}
        </Box>
        <Typography color="text.secondary" component="p" variant="caption">
          {label}
        </Typography>
      </Stack>
      {values.length > 0 ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {values.map((value) => (
            <Chip key={value} label={value} size="small" variant="outlined" />
          ))}
        </Box>
      ) : (
        <Typography color="text.secondary" variant="caption">
          Not listed
        </Typography>
      )}
    </Box>
  )
}

function EmptyRoster({ onReset }: { onReset: () => void }) {
  return (
    <Box
      sx={{
        alignItems: 'center',
        border: '1px dashed oklch(0.76 0.03 250)',
        borderRadius: 1.5,
        display: 'grid',
        gap: 1,
        justifyItems: 'center',
        minHeight: 240,
        p: 3,
        textAlign: 'center',
      }}
    >
      <SearchRoundedIcon color="disabled" sx={{ fontSize: 40 }} />
      <Typography component="h3" variant="h6">
        No matching Pokémon
      </Typography>
      <Typography color="text.secondary">
        Try another name, habitat, favorite, or skill.
      </Typography>
      <Button onClick={onReset} startIcon={<FilterAltOffRoundedIcon />}>
        Clear search
      </Button>
    </Box>
  )
}
