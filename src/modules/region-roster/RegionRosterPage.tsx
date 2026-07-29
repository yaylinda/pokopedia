import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import FilterAltOffRoundedIcon from '@mui/icons-material/FilterAltOffRounded'
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded'
import LandscapeRoundedIcon from '@mui/icons-material/LandscapeRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import WorkspacesRoundedIcon from '@mui/icons-material/WorkspacesRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Chip from '@mui/material/Chip'
import Collapse from '@mui/material/Collapse'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useMemo, useState, type MouseEvent, type ReactNode } from 'react'
import {
  comfortLevels,
  currentRegionRoster,
  type ComfortLevel,
  type RegionRosterPokemon,
} from '../../data/currentRegionRoster'

type GroupMode = 'comfort' | 'habitat' | 'favorite'

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

const favoritePalette: VisualStyle[] = [
  {
    accent: 'oklch(0.64 0.15 250)',
    deep: 'oklch(0.39 0.11 250)',
    soft: 'oklch(0.95 0.04 250)',
  },
  {
    accent: 'oklch(0.68 0.15 340)',
    deep: 'oklch(0.41 0.11 340)',
    soft: 'oklch(0.95 0.04 340)',
  },
  {
    accent: 'oklch(0.68 0.14 165)',
    deep: 'oklch(0.40 0.10 165)',
    soft: 'oklch(0.95 0.04 165)',
  },
  {
    accent: 'oklch(0.72 0.16 82)',
    deep: 'oklch(0.43 0.11 78)',
    soft: 'oklch(0.96 0.05 86)',
  },
]

const habitatOrder = ['Bright', 'Warm', 'Cool', 'Humid', 'Dry', 'Dark']

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})

const formatRosterDate = (value: string) =>
  dateFormatter.format(new Date(`${value}T00:00:00Z`))

const getComfortCounts = (pokemon: RegionRosterPokemon[]) =>
  Object.fromEntries(
    comfortLevels.map((level) => [
      level,
      pokemon.filter((entry) => entry.comfortLevel === level).length,
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
  const [selectedRegionId, setSelectedRegionId] = useState(
    currentRegionRoster.regions[0].regionId,
  )
  const [groupMode, setGroupMode] = useState<GroupMode>('comfort')
  const [query, setQuery] = useState('')
  const [expandedKey, setExpandedKey] = useState<string | null>(null)

  const selectedRegion =
    currentRegionRoster.regions.find(
      (region) => region.regionId === selectedRegionId,
    ) ?? currentRegionRoster.regions[0]
  const regionStyle = regionStyles[selectedRegion.regionId]
  const filteredPokemon = useMemo(
    () => selectedRegion.pokemon.filter((pokemon) => matchesQuery(pokemon, query)),
    [query, selectedRegion],
  )
  const groups = useMemo(
    () => buildGroups(filteredPokemon, groupMode),
    [filteredPokemon, groupMode],
  )

  const chooseRegion = (regionId: string) => {
    setSelectedRegionId(regionId)
    setExpandedKey(null)
  }

  const changeGroupMode = (_event: MouseEvent<HTMLElement>, next: GroupMode | null) => {
    if (!next) return
    setGroupMode(next)
    setExpandedKey(null)
  }

  return (
    <Box
      aria-labelledby="region-roster-heading"
      component="section"
      id="region-roster-panel"
      role="tabpanel"
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

      <RegionSelector
        onChoose={chooseRegion}
        selectedRegionId={selectedRegion.regionId}
      />

      <RegionSummary
        pokemon={selectedRegion.pokemon}
        regionName={selectedRegion.name}
        style={regionStyle}
      />

      <Box sx={{ display: 'grid', gap: 1.5 }}>
        <ViewControls
          groupMode={groupMode}
          onGroupModeChange={changeGroupMode}
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
              : groupMode === 'favorite'
                ? `${selectedRegion.pokemon.length} Pokémon across ${groups.length} favorite groups · Pokémon may appear more than once`
                : `${selectedRegion.pokemon.length} Pokémon across ${groups.length} groups`}
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
                expandedKey={expandedKey}
                group={group}
                groupMode={groupMode}
                key={group.id}
                onToggle={(key) =>
                  setExpandedKey((current) => (current === key ? null : key))
                }
              />
            ))}
          </Box>
        ) : (
          <EmptyRoster onReset={() => setQuery('')} />
        )}
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
        <Typography color="text.secondary" sx={{ maxWidth: '64ch' }}>
          Pick a region, then reorganize its residents by comfort, ideal habitat,
          or favorite things.
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
  selectedRegionId,
}: {
  onChoose: (regionId: string) => void
  selectedRegionId: string
}) {
  return (
    <Box
      aria-label="Choose a region"
      component="nav"
      sx={{
        display: 'grid',
        gap: 1,
        gridTemplateColumns: {
          xs: 'repeat(5, minmax(158px, 1fr))',
          lg: 'repeat(5, minmax(0, 1fr))',
        },
        mx: { xs: -1.5, sm: -2, md: 0 },
        overflowX: 'auto',
        px: { xs: 1.5, sm: 2, md: 0 },
        pb: 0.5,
        scrollbarWidth: 'thin',
      }}
    >
      {currentRegionRoster.regions.map((region) => {
        const style = regionStyles[region.regionId]
        const selected = selectedRegionId === region.regionId

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
              gap: 1,
              justifyItems: 'stretch',
              minHeight: 88,
              p: 1.25,
              textAlign: 'left',
              transition: 'transform 150ms ease-out, border-color 150ms ease-out',
              '&:hover': {
                borderColor: style.accent,
                transform: 'translateY(-2px)',
              },
              '&:focus-visible': {
                outline: `3px solid ${style.accent}`,
                outlineOffset: 2,
              },
            }}
          >
            <Box sx={{ alignItems: 'start', display: 'flex', gap: 1, justifyContent: 'space-between' }}>
              <Typography component="span" sx={{ fontWeight: 800 }}>
                {region.name}
              </Typography>
              <Typography component="strong" variant="h6">
                {region.pokemon.length}
              </Typography>
            </Box>
            <ComfortBar pokemon={region.pokemon} />
          </ButtonBase>
        )
      })}
    </Box>
  )
}

function RegionSummary({
  pokemon,
  regionName,
  style,
}: {
  pokemon: RegionRosterPokemon[]
  regionName: string
  style: VisualStyle
}) {
  const counts = getComfortCounts(pokemon)

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
        <ComfortBar large pokemon={pokemon} />
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
        </Box>
      </Box>
    </Box>
  )
}

function ComfortBar({
  large = false,
  pokemon,
}: {
  large?: boolean
  pokemon: RegionRosterPokemon[]
}) {
  const counts = getComfortCounts(pokemon)
  const label = comfortLevels
    .map((level) => `${comfortStyles[level].label}: ${counts[level]}`)
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
    </Box>
  )
}

function ViewControls({
  groupMode,
  onGroupModeChange,
  onQueryChange,
  query,
}: {
  groupMode: GroupMode
  onGroupModeChange: (
    event: MouseEvent<HTMLElement>,
    next: GroupMode | null,
  ) => void
  onQueryChange: (value: string) => void
  query: string
}) {
  return (
    <Box
      sx={{
        alignItems: { xs: 'stretch', md: 'center' },
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 1,
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ display: 'grid', gap: 0.5 }}>
        <Typography color="text.secondary" component="p" variant="caption">
          GROUP POKÉMON BY
        </Typography>
        <ToggleButtonGroup
          aria-label="Group Pokémon by"
          exclusive
          onChange={onGroupModeChange}
          size="small"
          value={groupMode}
          sx={{
            backgroundColor: 'oklch(0.99 0.004 250)',
            '& .MuiToggleButton-root': {
              borderColor: 'oklch(0.84 0.02 250)',
              gap: 0.75,
              minHeight: 40,
              px: { xs: 1.25, sm: 1.75 },
            },
            '& .Mui-selected': {
              backgroundColor: 'oklch(0.90 0.06 250) !important',
              color: 'oklch(0.35 0.13 250)',
            },
          }}
        >
          <ToggleButton value="comfort">
            <GridViewRoundedIcon fontSize="small" /> Comfort
          </ToggleButton>
          <ToggleButton value="habitat">
            <LandscapeRoundedIcon fontSize="small" /> Ideal habitat
          </ToggleButton>
          <ToggleButton value="favorite">
            <CategoryRoundedIcon fontSize="small" /> Favorite items
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

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
        sx={{ minWidth: { md: 340 } }}
        value={query}
      />
    </Box>
  )
}

function buildGroups(
  pokemon: RegionRosterPokemon[],
  mode: GroupMode,
): PokemonGroup[] {
  if (mode === 'comfort') {
    return comfortLevels.map((level) => ({
      id: level,
      label: comfortStyles[level].label,
      note: comfortStyles[level].note,
      pokemon: pokemon.filter((entry) => entry.comfortLevel === level),
      accent: comfortStyles[level].accent,
      deep: comfortStyles[level].deep,
      soft: comfortStyles[level].soft,
    }))
  }

  if (mode === 'habitat') {
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

  const favoriteNames = Array.from(
    new Set(
      pokemon.flatMap((entry) => entry.favorites.map((favorite) => favorite.name)),
    ),
  )

  return favoriteNames
    .map((favoriteName, index) => {
      const matchingPokemon = pokemon.filter((entry) =>
        entry.favorites.some((favorite) => favorite.name === favoriteName),
      )
      return {
        id: favoriteName.toLocaleLowerCase().replaceAll(' ', '-'),
        label: favoriteName,
        note: `${matchingPokemon.length} Pokémon like this`,
        pokemon: matchingPokemon,
        ...favoritePalette[index % favoritePalette.length],
      }
    })
    .sort(
      (left, right) =>
        right.pokemon.length - left.pokemon.length ||
        left.label.localeCompare(right.label),
    )
}

function PokemonGroupSection({
  expandedKey,
  group,
  groupMode,
  onToggle,
}: {
  expandedKey: string | null
  group: PokemonGroup
  groupMode: GroupMode
  onToggle: (key: string) => void
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
        gap: { xs: 1, md: 1.5 },
        gridTemplateColumns: { xs: '1fr', md: '150px minmax(0, 1fr)' },
        minWidth: 0,
        p: { xs: 1.25, md: 1.5 },
      }}
    >
      <Box sx={{ alignContent: 'start', display: 'grid', gap: 0.25 }}>
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
        <Typography color={group.deep} variant="caption">
          {group.note}
        </Typography>
      </Box>

      {group.pokemon.length > 0 ? (
        <Box
          sx={{
            display: 'grid',
            gap: 0.75,
            gridTemplateColumns: {
              xs: 'repeat(auto-fill, minmax(190px, 1fr))',
              xl: 'repeat(auto-fill, minmax(210px, 1fr))',
            },
            minWidth: 0,
          }}
        >
          {group.pokemon.map((pokemon) => {
            const cardKey = `${expansionPrefix}${pokemon.key}`
            return (
              <PokemonTile
                expanded={expandedKey === cardKey}
                groupMode={groupMode}
                key={pokemon.key}
                onToggle={() => onToggle(cardKey)}
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
  expanded,
  groupMode,
  onToggle,
  pokemon,
}: {
  expanded: boolean
  groupMode: GroupMode
  onToggle: () => void
  pokemon: RegionRosterPokemon
}) {
  const comfortStyle = comfortStyles[pokemon.comfortLevel]

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
          minHeight: 78,
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

        <Box sx={{ alignContent: 'center', display: 'grid', gap: 0.375, minWidth: 0, px: 0.75 }}>
          <Typography component="h4" noWrap sx={{ fontWeight: 800 }}>
            {pokemon.name}
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', minWidth: 0 }}>
            {groupMode !== 'comfort' && (
              <Typography
                component="span"
                noWrap
                sx={{ color: comfortStyle.deep, fontWeight: 700 }}
                variant="caption"
              >
                {comfortStyle.label}
              </Typography>
            )}
            {groupMode !== 'habitat' && pokemon.idealHabitat && (
              <>
                {groupMode !== 'comfort' && (
                  <Typography color="text.disabled" component="span" variant="caption">
                    ·
                  </Typography>
                )}
                <Typography color="text.secondary" component="span" noWrap variant="caption">
                  {pokemon.idealHabitat.name} habitat
                </Typography>
              </>
            )}
            {groupMode === 'habitat' && pokemon.specialties[0] && (
              <Typography color="text.secondary" component="span" noWrap variant="caption">
                · {pokemon.specialties[0].name}
              </Typography>
            )}
          </Stack>
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
            icon={<LandscapeRoundedIcon />}
            label="Ideal habitat"
            values={pokemon.idealHabitat ? [pokemon.idealHabitat.name] : []}
          />
          <DetailRow
            icon={<WorkspacesRoundedIcon />}
            label="Skills"
            values={pokemon.specialties.map((specialty) => specialty.name)}
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
