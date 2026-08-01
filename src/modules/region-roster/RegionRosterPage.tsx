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
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  comfortLevels,
  currentRegionRoster,
  type ComfortLevel,
  type CurrentRegion,
  type RegionRosterPokemon,
} from '../../data/currentRegionRoster'
import {
  evolutionConstraintGroups,
  getEvolutionConstraintGroup,
  rosterConstraintGraph,
} from '../../data/rosterConstraints'
import type {
  LindaPokemonRating,
  LindaPokemonStats,
} from '../../data/types'
import { useUserData } from '../../data/userDataContext'

type VisualStyle = {
  accent: string
  deep: string
  soft: string
}

type PokemonGroup = VisualStyle & {
  id: string
  label: string
  pokemon: RegionRosterPokemon[]
  note: string
}

const regionStyles: Record<string, VisualStyle> = {
  'palette-town': {
    accent: 'oklch(0.72 0.16 82)',
    deep: 'oklch(0.42 0.11 76)',
    soft: 'oklch(0.95 0.06 88)',
  },
  'sparkling-skylands': {
    accent: 'oklch(0.63 0.13 285)',
    deep: 'oklch(0.40 0.12 285)',
    soft: 'oklch(0.94 0.04 285)',
  },
  'withered-wastelands': {
    accent: 'oklch(0.67 0.13 135)',
    deep: 'oklch(0.40 0.10 135)',
    soft: 'oklch(0.94 0.05 135)',
  },
  'bleak-beach': {
    accent: 'oklch(0.68 0.11 190)',
    deep: 'oklch(0.41 0.09 190)',
    soft: 'oklch(0.94 0.04 190)',
  },
  'rocky-ridges': {
    accent: 'oklch(0.64 0.16 38)',
    deep: 'oklch(0.40 0.12 38)',
    soft: 'oklch(0.94 0.05 38)',
  },
}

const comfortStyles: Record<
  ComfortLevel,
  VisualStyle & { label: string; note: string }
> = {
  awesome: {
    label: 'Awesome',
    note: 'Thriving here',
    accent: 'oklch(0.62 0.15 145)',
    deep: 'oklch(0.37 0.10 145)',
    soft: 'oklch(0.94 0.05 145)',
  },
  great: {
    label: 'Great',
    note: 'Very comfortable',
    accent: 'oklch(0.65 0.12 187)',
    deep: 'oklch(0.39 0.08 187)',
    soft: 'oklch(0.94 0.04 187)',
  },
  nice: {
    label: 'Nice',
    note: 'Comfortable',
    accent: 'oklch(0.65 0.13 250)',
    deep: 'oklch(0.40 0.10 250)',
    soft: 'oklch(0.94 0.04 250)',
  },
  average: {
    label: 'Average',
    note: 'Doing okay',
    accent: 'oklch(0.73 0.15 85)',
    deep: 'oklch(0.43 0.10 78)',
    soft: 'oklch(0.95 0.05 88)',
  },
  iffy: {
    label: 'Iffy',
    note: 'Needs attention',
    accent: 'oklch(0.66 0.17 45)',
    deep: 'oklch(0.40 0.13 40)',
    soft: 'oklch(0.94 0.05 45)',
  },
  'no-home': {
    label: 'No home',
    note: 'Not settled yet',
    accent: 'oklch(0.57 0.05 22)',
    deep: 'oklch(0.36 0.04 22)',
    soft: 'oklch(0.94 0.02 22)',
  },
}

const habitatStyles: Record<string, VisualStyle> = {
  Bright: {
    accent: 'oklch(0.76 0.16 90)',
    deep: 'oklch(0.44 0.11 80)',
    soft: 'oklch(0.96 0.06 94)',
  },
  Cool: {
    accent: 'oklch(0.68 0.13 250)',
    deep: 'oklch(0.41 0.10 250)',
    soft: 'oklch(0.95 0.04 250)',
  },
  Dark: {
    accent: 'oklch(0.56 0.10 300)',
    deep: 'oklch(0.35 0.08 300)',
    soft: 'oklch(0.93 0.04 300)',
  },
  Dry: {
    accent: 'oklch(0.67 0.14 55)',
    deep: 'oklch(0.40 0.11 50)',
    soft: 'oklch(0.94 0.05 55)',
  },
  Humid: {
    accent: 'oklch(0.64 0.13 165)',
    deep: 'oklch(0.38 0.09 165)',
    soft: 'oklch(0.94 0.04 165)',
  },
  Warm: {
    accent: 'oklch(0.67 0.17 28)',
    deep: 'oklch(0.40 0.13 28)',
    soft: 'oklch(0.94 0.05 28)',
  },
}

const habitatOrder = ['Bright', 'Warm', 'Cool', 'Humid', 'Dry', 'Dark']
const regionOrder = [
  'withered-wastelands',
  'bleak-beach',
  'rocky-ridges',
  'sparkling-skylands',
  'palette-town',
]

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})

const formatRosterDate = (value: string) =>
  dateFormatter.format(new Date(`${value}T00:00:00Z`))

const allRosterPokemon = currentRegionRoster.regions.flatMap(
  (region) => region.pokemon,
)
const allRosterPokemonBySlug = new Map(
  allRosterPokemon.map((pokemon) => [pokemon.slug, pokemon]),
)

const getComfortCounts = (
  pokemon: RegionRosterPokemon[],
  regionId?: string,
) =>
  Object.fromEntries(
    comfortLevels.map((level) => [
      level,
      pokemon.filter(
        (entry) =>
          entry.comfortLevel === level &&
          (!regionId || entry.regionId === regionId),
      ).length,
    ]),
  ) as Record<ComfortLevel, number>

const matchesQuery = (pokemon: RegionRosterPokemon, query: string) => {
  const normalizedQuery = query.trim().toLocaleLowerCase()

  if (!normalizedQuery) return true

  return [
    pokemon.name,
    pokemon.regionName,
    pokemon.idealHabitat?.name,
    comfortStyles[pokemon.comfortLevel].label,
    ...pokemon.favorites.map((favorite) => favorite.name),
    ...pokemon.specialties.map((specialty) => specialty.name),
  ]
    .filter(Boolean)
    .join(' ')
    .toLocaleLowerCase()
    .includes(normalizedQuery)
}

export function RegionRosterPage() {
  const {
    pokemonStatsBySlug,
    resetRosterModel,
    rosterRegionOverrides,
    setPokemonRosterRegion,
    updatePokemonStats,
  } = useUserData()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedRegionId = searchParams.get('region')
  const selectedRegionId =
    requestedRegionId && regionOrder.includes(requestedRegionId)
      ? requestedRegionId
      : regionOrder[0]
  const [query, setQuery] = useState('')
  const [expandedKey, setExpandedKey] = useState<string | null>(null)

  useEffect(() => {
    if (requestedRegionId === selectedRegionId) return

    const nextSearchParams = new URLSearchParams(searchParams)
    nextSearchParams.set('region', selectedRegionId)
    setSearchParams(nextSearchParams, { replace: true })
  }, [requestedRegionId, searchParams, selectedRegionId, setSearchParams])

  const effectiveStatsBySlug = useMemo(
    () =>
      Object.fromEntries(
        allRosterPokemon.map((pokemon) => [
          pokemon.slug,
          pokemonStatsBySlug[pokemon.slug] ?? pokemon.lindaStats,
        ]),
      ),
    [pokemonStatsBySlug],
  )
  const modeledRegions = useMemo(
    () =>
      regionOrder.flatMap((regionId) => {
        const region = currentRegionRoster.regions.find(
          (entry) => entry.regionId === regionId,
        )
        return region
          ? [
              {
                ...region,
                pokemon: allRosterPokemon.filter(
                  (pokemon) =>
                    (rosterRegionOverrides[pokemon.slug] ?? pokemon.regionId) ===
                    region.regionId,
                ),
              },
            ]
          : []
      }),
    [rosterRegionOverrides],
  )
  const evolutionViolationCount = useMemo(
    () =>
      evolutionConstraintGroups.filter(
        (group) =>
          new Set(
            group.flatMap((slug) => {
              const pokemon = allRosterPokemonBySlug.get(slug)
              return pokemon
                ? [rosterRegionOverrides[slug] ?? pokemon.regionId]
                : []
            }),
          ).size > 1,
      ).length,
    [rosterRegionOverrides],
  )
  const selectedRegion =
    modeledRegions.find(
      (region) => region.regionId === selectedRegionId,
    ) ?? modeledRegions[0]
  const regionStyle = regionStyles[selectedRegion.regionId]
  const filteredPokemon = useMemo(
    () => selectedRegion.pokemon.filter((pokemon) => matchesQuery(pokemon, query)),
    [query, selectedRegion],
  )
  const groups = useMemo(
    () => buildHabitatGroups(filteredPokemon),
    [filteredPokemon],
  )

  const chooseRegion = (regionId: string) => {
    const nextSearchParams = new URLSearchParams(searchParams)
    nextSearchParams.set('region', regionId)
    setSearchParams(nextSearchParams)
    setExpandedKey(null)
  }

  return (
    <Box
      aria-labelledby="region-roster-heading"
      component="section"
      id="region-roster-panel"
      sx={{
        backgroundColor: 'oklch(0.975 0.008 250)',
        border: '1px solid oklch(0.88 0.015 250)',
        borderRadius: 2,
        display: 'grid',
        gap: { xs: 2, md: 2.5 },
        overflow: 'hidden',
        p: { xs: 1.5, sm: 2, md: 3 },
      }}
    >
      <RosterHeader />

      <Box
        sx={{
          alignItems: 'start',
          display: 'grid',
          gap: { xs: 2, lg: 3 },
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: '232px minmax(0, 1fr)' },
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
            top: { lg: 16 },
          }}
        >
          <RegionSelector
            onChoose={chooseRegion}
            regions={modeledRegions}
            selectedRegionId={selectedRegion.regionId}
          />
          <RosterModelStatus
            evolutionViolationCount={evolutionViolationCount}
            moveCount={Object.keys(rosterRegionOverrides).length}
            onReset={resetRosterModel}
          />
        </Box>

        <Box sx={{ display: 'grid', gap: 1.5, minWidth: 0 }}>
          <RegionSummary
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
                  getEvolutionConstraintGroup(pokemon.slug).forEach((slug) => {
                    const member = allRosterPokemonBySlug.get(slug)
                    if (!member) return
                    setPokemonRosterRegion(
                      slug,
                      regionId === member.regionId ? null : regionId,
                    )
                    updatePokemonStats(slug, {
                      ...(effectiveStatsBySlug[slug] ?? member.lindaStats),
                      belongsInCurrentRegion: null,
                    })
                  })
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

function RosterHeader() {
  return (
    <Box
      sx={{
        alignItems: { xs: 'start', sm: 'end' },
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 1.5,
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ display: 'grid', gap: 0.5 }}>
        <Typography
          color="primary.dark"
          component="p"
          sx={{ fontWeight: 800, letterSpacing: '0.08em' }}
          variant="caption"
        >
          CURRENT ROSTER · UPDATED {formatRosterDate(currentRegionRoster.updatedAt).toLocaleUpperCase()}
        </Typography>
        <Typography component="h1" id="region-roster-heading" variant="h3">
          Pokémon by region
        </Typography>
      </Box>
      <Stack direction="row" spacing={2.5}>
        <HeaderStat label="placements" value={currentRegionRoster.placementCount} />
        <HeaderStat label="Pokémon" value={currentRegionRoster.uniquePokemonCount} />
        <HeaderStat label="regions" value={currentRegionRoster.regions.length} />
      </Stack>
    </Box>
  )
}

function HeaderStat({ label, value }: { label: string; value: number }) {
  return (
    <Box sx={{ display: 'grid', gap: 0.125 }}>
      <Typography component="strong" variant="h5">
        {value}
      </Typography>
      <Typography color="text.secondary" variant="caption">
        {label}
      </Typography>
    </Box>
  )
}

function RegionSelector({
  onChoose,
  regions,
  selectedRegionId,
}: {
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
            xs: 'repeat(5, minmax(172px, 1fr))',
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
            currentRegionRoster.regions.find(
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
              <ComfortBar pokemon={region.pokemon} regionId={region.regionId} />
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
  lindaStatsBySlug,
  pokemon,
  regionName,
  selectedRegionId,
  style,
}: {
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
        <ComfortBar large pokemon={pokemon} regionId={selectedRegionId} />
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
                {comfortStyles[level].label}
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
            explanation="Linda's personal preference. 1 means not for me, 5 means favorite, and new ratings start at 3."
            icon={<FavoriteRoundedIcon />}
            label="Avg. like"
            value={`${average('likeRating')}/5`}
          />
          <RegionLindaMetric
            explanation="How useful this Pokémon's skills are to Linda. 1 means niche and 5 means essential; hype-only Pokémon start at 1."
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
  large = false,
  pokemon,
  regionId,
}: {
  large?: boolean
  pokemon: RegionRosterPokemon[]
  regionId: string
}) {
  const counts = getComfortCounts(pokemon, regionId)
  const movedHereCount = pokemon.filter((entry) => entry.regionId !== regionId).length
  const label = comfortLevels
    .map((level) => `${comfortStyles[level].label}: ${counts[level]}`)
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
          <Tooltip key={level} title={`${comfortStyles[level].label}: ${counts[level]}`}>
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

function buildHabitatGroups(pokemon: RegionRosterPokemon[]): PokemonGroup[] {
  return habitatOrder.map((habitatName) => {
    const style = habitatStyles[habitatName]
    return {
      id: habitatName.toLocaleLowerCase(),
      label: habitatName,
      note: 'Ideal habitat',
      pokemon: pokemon.filter(
        (entry) => entry.idealHabitat?.name === habitatName,
      ),
      ...style,
    }
  })
}

function PokemonGroupSection({
  activeRegionId,
  expandedKey,
  group,
  modeledRegions,
  onMovePokemon,
  onToggle,
  onUpdatePokemonStats,
  pokemonStatsBySlug,
}: {
  activeRegionId: string
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
  expanded,
  lindaStats,
  modeledRegions,
  onMove,
  onToggle,
  onUpdateLindaStats,
  pokemon,
}: {
  activeRegionId: string
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
          {pokemon.isLegendary && (
            <Tooltip title="Legendary Pokémon">
              <StarRoundedIcon
                aria-label="Legendary Pokémon"
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
              {movedHere ? 'Comfort needs recheck' : `${comfortStyle.label} comfort`}
            </Typography>
            <Typography color="text.disabled" component="span" variant="caption">
              ·
            </Typography>
            <Typography color="text.secondary" component="span" noWrap variant="caption">
              {pokemon.specialties.length > 0
                ? `${pokemon.specialties[0].name}${pokemon.specialties.length > 1 ? ` +${pokemon.specialties.length - 1}` : ''}`
                : 'No skill listed'}
            </Typography>
          </Stack>
          <LindaStatsSnapshot
            evolutionGroupSize={evolutionGroup.length}
            movedHere={movedHere}
            stats={lindaStats}
          />
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
            values={movedHere ? ['Needs rechecking in-game'] : [comfortStyle.label]}
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

function LindaStatsSnapshot({
  evolutionGroupSize,
  movedHere,
  stats,
}: {
  evolutionGroupSize: number
  movedHere: boolean
  stats: LindaPokemonStats
}) {
  const belongsLabel =
    stats.belongsInCurrentRegion === null
      ? 'Undecided'
      : stats.belongsInCurrentRegion
        ? 'Belongs'
        : 'Reconsider'

  return (
    <Box
      aria-label={`Linda ratings: like ${stats.likeRating ?? 'not rated'} of 5, usefulness ${stats.usefulnessRating ?? 'not rated'} of 5, region ${belongsLabel}`}
      sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.375 }}
    >
      <LindaMiniMetric
        color="oklch(0.52 0.16 25)"
        icon={<FavoriteRoundedIcon />}
        label={`Like ${stats.likeRating ?? '—'}/5`}
      />
      <LindaMiniMetric
        color="oklch(0.45 0.12 235)"
        icon={<HandymanRoundedIcon />}
        label={`Useful ${stats.usefulnessRating ?? '—'}/5`}
      />
      <LindaMiniMetric
        color={
          stats.belongsInCurrentRegion === null
            ? 'oklch(0.48 0.035 250)'
            : stats.belongsInCurrentRegion
              ? 'oklch(0.42 0.11 145)'
              : 'oklch(0.46 0.14 42)'
        }
        icon={<PlaceRoundedIcon />}
        label={belongsLabel}
      />
      {evolutionGroupSize > 1 && (
        <LindaMiniMetric
          color="oklch(0.42 0.10 285)"
          icon={<LinkRoundedIcon />}
          label={`${evolutionGroupSize} linked`}
        />
      )}
      {movedHere && (
        <LindaMiniMetric
          color="oklch(0.42 0.10 250)"
          icon={<RestartAltRoundedIcon />}
          label="Moved"
        />
      )}
    </Box>
  )
}

function LindaMiniMetric({
  color,
  icon,
  label,
}: {
  color: string
  icon: ReactNode
  label: string
}) {
  return (
    <Box
      sx={{
        alignItems: 'center',
        backgroundColor: 'oklch(0.955 0.012 250)',
        borderRadius: 8,
        color,
        display: 'flex',
        gap: 0.25,
        minHeight: 20,
        px: 0.625,
        '& svg': { fontSize: 12 },
      }}
    >
      {icon}
      <Typography component="span" sx={{ color: 'inherit', fontSize: '0.66rem', fontWeight: 800 }}>
        {label}
      </Typography>
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
  const evolutionMembers = evolutionGroup.flatMap((slug) => {
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
