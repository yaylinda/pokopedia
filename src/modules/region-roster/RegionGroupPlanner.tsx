import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded'
import HomeWorkRoundedIcon from '@mui/icons-material/HomeWorkRounded'
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Chip from '@mui/material/Chip'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useMemo, useState } from 'react'
import type { RegionRosterPokemon } from '../../data/currentRegionRoster'
import type { FavoriteItem } from '../../data/favoriteCategories'
import type { RosterGroup } from '../../data/types'
import { useUserData } from '../../data/userDataContext'
import { RegionSelector } from './components/RegionSelector'
import {
  getGroupFavoriteOverlaps,
  getRosterGroupScopeKey,
  makeRosterGroup,
  type FavoriteCategoryOverlap,
  type FavoriteItemOverlap,
} from './groupPlannerModel'
import { useRegionRosterWorkspace } from './hooks/useRegionRosterWorkspace'
import {
  matchesRosterQuery,
  type VisualStyle,
} from './regionRosterConfig'

const emptyGroups: RosterGroup[] = []
const previewItemCount = 12

type UndoState = {
  groups: RosterGroup[]
  message: string
  scopeKey: string
}

export function RegionGroupPlanner() {
  const {
    chooseRegion,
    modeledRegions,
    regionStyle,
    selectedRegion,
    selectedSnapshot,
  } = useRegionRosterWorkspace()
  const {
    rosterGroupsByScope,
    setRosterGroups,
  } = useUserData()
  const scopeKey = getRosterGroupScopeKey(
    selectedSnapshot.snapshotId,
    selectedRegion.regionId,
  )
  const storedGroups = rosterGroupsByScope[scopeKey] ?? emptyGroups
  const availablePokemonBySlug = useMemo(
    () => new Map(selectedRegion.pokemon.map((pokemon) => [pokemon.slug, pokemon])),
    [selectedRegion.pokemon],
  )
  const groups = useMemo(() => {
    const assignedSlugs = new Set<string>()

    return storedGroups.map((group) => ({
      ...group,
      pokemonSlugs: group.pokemonSlugs
        .filter((slug) => availablePokemonBySlug.has(slug))
        .filter((slug) => {
          if (assignedSlugs.has(slug)) return false
          assignedSlugs.add(slug)
          return true
        })
        .slice(0, 4),
    }))
  }, [availablePokemonBySlug, storedGroups])
  const assignedPokemonSlugs = useMemo(
    () => new Set(groups.flatMap((group) => group.pokemonSlugs)),
    [groups],
  )
  const ungroupedPokemon = useMemo(
    () =>
      selectedRegion.pokemon.filter(
        (pokemon) => !assignedPokemonSlugs.has(pokemon.slug),
      ),
    [assignedPokemonSlugs, selectedRegion.pokemon],
  )
  const [requestedActiveGroupId, setRequestedActiveGroupId] = useState<string | null>(null)
  const [searchState, setSearchState] = useState({ query: '', scopeKey })
  const [undoState, setUndoState] = useState<UndoState | null>(null)
  const activeGroup =
    groups.find((group) => group.groupId === requestedActiveGroupId) ??
    groups[0] ??
    null
  const activeGroupId = activeGroup?.groupId ?? null
  const activeGroupIsFull = (activeGroup?.pokemonSlugs.length ?? 0) >= 4
  const query = searchState.scopeKey === scopeKey ? searchState.query : ''
  const setQuery = (nextQuery: string) =>
    setSearchState({ query: nextQuery, scopeKey })
  const filteredUngroupedPokemon = useMemo(
    () =>
      ungroupedPokemon.filter((pokemon) => matchesRosterQuery(pokemon, query)),
    [query, ungroupedPokemon],
  )

  const addGroup = () => {
    const nextGroup = makeRosterGroup(groups)
    setRosterGroups(scopeKey, [...groups, nextGroup])
    setRequestedActiveGroupId(nextGroup.groupId)
  }

  const renameGroup = (groupId: string, name: string) => {
    setRosterGroups(
      scopeKey,
      groups.map((group) =>
        group.groupId === groupId ? { ...group, name } : group,
      ),
    )
  }

  const finishRenamingGroup = (groupId: string) => {
    const group = groups.find((entry) => entry.groupId === groupId)
    if (!group || group.name.trim()) return

    const groupNumber = groups.findIndex((entry) => entry.groupId === groupId) + 1
    renameGroup(groupId, `Group ${groupNumber}`)
  }

  const assignPokemon = (pokemonSlug: string, targetGroupId: string | null) => {
    let didAssign = targetGroupId === null
    const nextGroups = groups.map((group) => {
      const pokemonSlugs = group.pokemonSlugs.filter(
        (slug) => slug !== pokemonSlug,
      )

      if (group.groupId !== targetGroupId || pokemonSlugs.length >= 4) {
        return { ...group, pokemonSlugs }
      }

      didAssign = true
      return { ...group, pokemonSlugs: [...pokemonSlugs, pokemonSlug] }
    })

    if (didAssign) {
      setRosterGroups(scopeKey, nextGroups)
    }
  }

  const deleteGroup = (groupId: string) => {
    const group = groups.find((entry) => entry.groupId === groupId)
    if (!group) return

    setUndoState({
      groups,
      message: `${group.name || 'Group'} deleted`,
      scopeKey,
    })
    setRosterGroups(
      scopeKey,
      groups.filter((entry) => entry.groupId !== groupId),
    )
  }

  const clearGroups = () => {
    if (groups.length === 0) return

    setUndoState({ groups, message: 'Region groups cleared', scopeKey })
    setRosterGroups(scopeKey, [])
  }

  const undoLastChange = () => {
    if (!undoState) return

    setRosterGroups(undoState.scopeKey, undoState.groups)
    setUndoState(null)
  }

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

      <Box sx={{ display: 'grid', gap: 2, minWidth: 0 }}>
        <PlannerHeader
          groupedCount={assignedPokemonSlugs.size}
          groupCount={groups.length}
          onAddGroup={addGroup}
          onClearGroups={clearGroups}
          regionName={selectedRegion.name}
          style={regionStyle}
          ungroupedCount={ungroupedPokemon.length}
        />

        {groups.length === 0 && (
          <Box
            component="section"
            sx={{
              alignItems: { xs: 'start', sm: 'center' },
              backgroundColor: 'oklch(0.98 0.01 82)',
              border: '1px dashed oklch(0.76 0.08 82)',
              borderRadius: 1.5,
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 1.5,
              justifyContent: 'space-between',
              p: 2,
            }}
          >
            <Box sx={{ display: 'grid', gap: 0.375 }}>
              <Typography component="h3" sx={{ fontWeight: 850 }} variant="h6">
                Start a house group
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Add a group, then choose up to four residents from the ungrouped pool.
              </Typography>
            </Box>
            <Button onClick={addGroup} startIcon={<AddRoundedIcon />} variant="contained">
              Add first group
            </Button>
          </Box>
        )}

        <UngroupedPokemonPool
          activeGroup={activeGroup}
          activeGroupIsFull={activeGroupIsFull}
          filteredPokemon={filteredUngroupedPokemon}
          onAssign={(pokemonSlug) => assignPokemon(pokemonSlug, activeGroupId)}
          onQueryChange={setQuery}
          query={query}
          totalCount={ungroupedPokemon.length}
        />

        {groups.length > 0 && (
          <Box
            component="section"
            sx={{ display: 'grid', gap: 1.25, minWidth: 0 }}
          >
            <Box sx={{ alignItems: 'baseline', display: 'flex', gap: 1, justifyContent: 'space-between' }}>
              <Typography component="h2" sx={{ fontWeight: 850 }} variant="h5">
                Saved groups
              </Typography>
              <Typography color="text.secondary" variant="caption">
                Select a group to add residents
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'grid',
                gap: 1.5,
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
                minWidth: 0,
              }}
            >
              {groups.map((group) => (
                <RosterGroupCard
                  active={group.groupId === activeGroupId}
                  allGroups={groups}
                  group={group}
                  key={group.groupId}
                  onAssignPokemon={assignPokemon}
                  onDelete={() => deleteGroup(group.groupId)}
                  onFinishRenaming={() => finishRenamingGroup(group.groupId)}
                  onRename={(name) => renameGroup(group.groupId, name)}
                  onSelect={() => setRequestedActiveGroupId(group.groupId)}
                  pokemonBySlug={availablePokemonBySlug}
                  style={regionStyle}
                />
              ))}
            </Box>
          </Box>
        )}
      </Box>

      <Snackbar
        action={(
          <Button color="inherit" onClick={undoLastChange} size="small">
            Undo
          </Button>
        )}
        autoHideDuration={5000}
        message={undoState?.message}
        onClose={() => setUndoState(null)}
        open={Boolean(undoState)}
      />
    </Box>
  )
}

function PlannerHeader({
  groupedCount,
  groupCount,
  onAddGroup,
  onClearGroups,
  regionName,
  style,
  ungroupedCount,
}: {
  groupedCount: number
  groupCount: number
  onAddGroup: () => void
  onClearGroups: () => void
  regionName: string
  style: VisualStyle
  ungroupedCount: number
}) {
  return (
    <Box
      component="section"
      sx={{
        backgroundColor: style.soft,
        border: `1px solid ${style.accent}`,
        borderRadius: 1.5,
        display: 'grid',
        gap: 1.5,
        p: { xs: 1.5, sm: 2 },
      }}
    >
      <Box
        sx={{
          alignItems: { xs: 'start', sm: 'center' },
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1.5,
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'grid', gap: 0.375 }}>
          <Typography component="h2" sx={{ color: style.deep }} variant="h4">
            {regionName} group planner
          </Typography>
          <Typography sx={{ color: style.deep, maxWidth: '68ch' }} variant="body2">
            Try housemates together and compare the favorite categories and exact items they share.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }} useFlexGap>
          <Button onClick={onAddGroup} startIcon={<AddRoundedIcon />} variant="contained">
            Add group
          </Button>
          <Button
            color="inherit"
            disabled={groupCount === 0}
            onClick={onClearGroups}
            startIcon={<RestartAltRoundedIcon />}
            variant="outlined"
          >
            Clear groups
          </Button>
        </Stack>
      </Box>
      <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap' }} useFlexGap>
        <Chip label={`${groupCount} ${groupCount === 1 ? 'group' : 'groups'}`} size="small" />
        <Chip label={`${groupedCount} grouped`} size="small" />
        <Chip label={`${ungroupedCount} ungrouped`} size="small" />
      </Stack>
    </Box>
  )
}

function UngroupedPokemonPool({
  activeGroup,
  activeGroupIsFull,
  filteredPokemon,
  onAssign,
  onQueryChange,
  query,
  totalCount,
}: {
  activeGroup: RosterGroup | null
  activeGroupIsFull: boolean
  filteredPokemon: RegionRosterPokemon[]
  onAssign: (pokemonSlug: string) => void
  onQueryChange: (query: string) => void
  query: string
  totalCount: number
}) {
  const destinationLabel = !activeGroup
    ? 'Choose a group before adding residents'
    : activeGroupIsFull
      ? `${activeGroup.name || 'Selected group'} is full`
      : `Adding residents to ${activeGroup.name || 'selected group'}`

  return (
    <Box
      component="section"
      sx={{
        backgroundColor: 'oklch(0.985 0.006 250)',
        border: '1px solid oklch(0.85 0.02 250)',
        borderRadius: 1.5,
        display: 'grid',
        gap: 1.25,
        minWidth: 0,
        p: { xs: 1.25, sm: 1.5 },
      }}
    >
      <Box
        sx={{
          alignItems: { xs: 'start', md: 'center' },
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 1,
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'grid', gap: 0.25 }}>
          <Typography component="h2" sx={{ fontWeight: 850 }} variant="h6">
            Ungrouped Pokémon
          </Typography>
          <Typography color="text.secondary" variant="caption">
            {destinationLabel}
          </Typography>
        </Box>
        <TextField
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          label="Search ungrouped Pokémon"
          onChange={(event) => onQueryChange(event.target.value)}
          size="small"
          sx={{ width: { xs: '100%', md: 300 } }}
          value={query}
        />
      </Box>

      {filteredPokemon.length > 0 ? (
        <Box
          aria-label="Ungrouped Pokémon"
          sx={{
            display: 'grid',
            gap: 0.75,
            gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))',
            maxHeight: 344,
            overflowY: 'auto',
            pr: 0.5,
            scrollbarWidth: 'thin',
          }}
        >
          {filteredPokemon.map((pokemon) => (
            <ButtonBase
              aria-label={
                activeGroup && !activeGroupIsFull
                  ? `Add ${pokemon.name} to ${activeGroup.name}`
                  : `${pokemon.name} cannot be assigned yet`
              }
              disabled={!activeGroup || activeGroupIsFull}
              key={pokemon.key}
              onClick={() => onAssign(pokemon.slug)}
              sx={{
                alignItems: 'center',
                backgroundColor: 'oklch(0.99 0.004 250)',
                border: '1px solid oklch(0.87 0.018 250)',
                borderRadius: 1,
                display: 'grid',
                gap: 0.75,
                gridTemplateColumns: '44px minmax(0, 1fr)',
                minHeight: 58,
                p: 0.75,
                textAlign: 'left',
                transition: 'border-color 140ms ease-out, transform 140ms ease-out',
                '&:hover': {
                  borderColor: 'primary.main',
                  transform: 'translateY(-1px)',
                },
                '&:focus-visible': {
                  outline: '3px solid oklch(0.60 0.12 155)',
                  outlineOffset: 2,
                },
                '&.Mui-disabled': { opacity: 0.58 },
              }}
            >
              <PokemonPortrait pokemon={pokemon} size={42} />
              <Box sx={{ minWidth: 0 }}>
                <Typography component="span" noWrap sx={{ display: 'block', fontWeight: 800 }}>
                  {pokemon.name}
                </Typography>
                <Typography color="text.secondary" component="span" noWrap variant="caption">
                  {pokemon.idealHabitat?.name ?? 'No ideal habitat'}
                </Typography>
              </Box>
            </ButtonBase>
          ))}
        </Box>
      ) : (
        <Typography color="text.secondary" sx={{ py: 1 }} variant="body2">
          {totalCount === 0
            ? 'Every Pokémon in this region is grouped.'
            : `No ungrouped Pokémon match “${query}”.`}
        </Typography>
      )}
    </Box>
  )
}

function RosterGroupCard({
  active,
  allGroups,
  group,
  onAssignPokemon,
  onDelete,
  onFinishRenaming,
  onRename,
  onSelect,
  pokemonBySlug,
  style,
}: {
  active: boolean
  allGroups: RosterGroup[]
  group: RosterGroup
  onAssignPokemon: (pokemonSlug: string, groupId: string | null) => void
  onDelete: () => void
  onFinishRenaming: () => void
  onRename: (name: string) => void
  onSelect: () => void
  pokemonBySlug: Map<string, RegionRosterPokemon>
  style: VisualStyle
}) {
  const residents = group.pokemonSlugs.flatMap((slug) => {
    const pokemon = pokemonBySlug.get(slug)
    return pokemon ? [pokemon] : []
  })
  const overlaps = useMemo(
    () => getGroupFavoriteOverlaps(residents),
    [residents],
  )
  const openSlotCount = Math.max(0, 4 - residents.length)

  return (
    <Box
      component="article"
      sx={{
        alignContent: 'start',
        backgroundColor: 'oklch(0.99 0.004 250)',
        border: `1px solid ${active ? style.accent : 'oklch(0.84 0.02 250)'}`,
        borderRadius: 1.5,
        display: 'grid',
        minWidth: 0,
        overflow: 'hidden',
        transition: 'border-color 150ms ease-out, transform 150ms ease-out',
        '&:hover': { transform: 'translateY(-1px)' },
      }}
    >
      <Box
        sx={{
          alignItems: { xs: 'stretch', sm: 'center' },
          backgroundColor: active ? style.soft : 'oklch(0.97 0.009 250)',
          display: 'grid',
          gap: 1,
          gridTemplateColumns: { xs: 'minmax(0, 1fr) auto', sm: 'minmax(180px, 1fr) auto auto' },
          p: 1.25,
        }}
      >
        <TextField
          fullWidth
          label="Group name"
          onBlur={onFinishRenaming}
          onChange={(event) => onRename(event.target.value)}
          size="small"
          value={group.name}
        />
        <Chip label={`${residents.length}/4`} size="small" />
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ gridColumn: { xs: '1 / -1', sm: 'auto' } }}
        >
          <Button
            disabled={residents.length >= 4}
            onClick={onSelect}
            size="small"
            startIcon={<HomeWorkRoundedIcon />}
            variant={active ? 'contained' : 'outlined'}
          >
            {residents.length >= 4 ? 'Group full' : active ? 'Adding here' : 'Add residents here'}
          </Button>
          <Tooltip title={`Delete ${group.name || 'group'}`}>
            <IconButton
              aria-label={`Delete ${group.name || 'group'}`}
              onClick={onDelete}
              size="small"
              sx={{ minHeight: 40, minWidth: 40 }}
            >
              <DeleteOutlineRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      <Box sx={{ display: 'grid', gap: 1, p: 1.25 }}>
        <Typography component="h3" sx={{ fontWeight: 850 }} variant="subtitle2">
          Residents
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gap: 0.75,
            gridTemplateColumns: 'repeat(auto-fit, minmax(148px, 1fr))',
          }}
        >
          {residents.map((pokemon) => (
            <ResidentSlot
              allGroups={allGroups}
              currentGroupId={group.groupId}
              key={pokemon.key}
              onAssign={(targetGroupId) => onAssignPokemon(pokemon.slug, targetGroupId)}
              pokemon={pokemon}
            />
          ))}
          {Array.from({ length: openSlotCount }, (_value, index) => (
            <Box
              aria-label="Open resident slot"
              key={`open-slot-${index}`}
              sx={{
                alignItems: 'center',
                border: '1px dashed oklch(0.76 0.025 250)',
                borderRadius: 1,
                color: 'text.secondary',
                display: 'flex',
                gap: 0.75,
                justifyContent: 'center',
                minHeight: 98,
                p: 1,
              }}
            >
              <AddRoundedIcon fontSize="small" />
              <Typography variant="caption">Open slot</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box
        aria-live="polite"
        sx={{
          borderTop: '1px solid oklch(0.86 0.018 250)',
          display: 'grid',
          gap: 1,
          p: 1.25,
        }}
      >
        <Box sx={{ alignItems: 'baseline', display: 'flex', gap: 1, justifyContent: 'space-between' }}>
          <Typography component="h3" sx={{ fontWeight: 850 }} variant="subtitle2">
            Favorite overlap
          </Typography>
          {residents.length >= 2 && (
            <Typography color="text.secondary" variant="caption">
              Matches liked by 2+ residents
            </Typography>
          )}
        </Box>
        {residents.length < 2 ? (
          <Typography color="text.secondary" variant="body2">
            Add at least two residents to compare their favorites.
          </Typography>
        ) : overlaps.length === 0 ? (
          <Typography color="text.secondary" variant="body2">
            These residents do not share any favorite categories yet.
          </Typography>
        ) : (
          <FavoriteOverlapList
            groupSize={residents.length}
            overlaps={overlaps}
            pokemonBySlug={pokemonBySlug}
          />
        )}
      </Box>
    </Box>
  )
}

function ResidentSlot({
  allGroups,
  currentGroupId,
  onAssign,
  pokemon,
}: {
  allGroups: RosterGroup[]
  currentGroupId: string
  onAssign: (targetGroupId: string | null) => void
  pokemon: RegionRosterPokemon
}) {
  return (
    <Box
      sx={{
        border: '1px solid oklch(0.84 0.025 250)',
        borderRadius: 1,
        display: 'grid',
        gap: 0.75,
        minWidth: 0,
        p: 0.75,
      }}
    >
      <Box sx={{ alignItems: 'center', display: 'grid', gap: 0.75, gridTemplateColumns: '48px minmax(0, 1fr)' }}>
        <PokemonPortrait pokemon={pokemon} size={46} />
        <Box sx={{ minWidth: 0 }}>
          <Typography component="h4" noWrap sx={{ fontWeight: 850 }} variant="body2">
            {pokemon.name}
          </Typography>
          <Typography color="text.secondary" noWrap variant="caption">
            {pokemon.idealHabitat?.name ?? 'No ideal habitat'}
          </Typography>
        </Box>
      </Box>
      <TextField
        fullWidth
        label="Assignment"
        onChange={(event) => onAssign(event.target.value || null)}
        select
        size="small"
        value={currentGroupId}
      >
        <MenuItem value="">Ungrouped</MenuItem>
        {allGroups.map((group) => (
          <MenuItem
            disabled={group.groupId !== currentGroupId && group.pokemonSlugs.length >= 4}
            key={group.groupId}
            value={group.groupId}
          >
            {group.name || 'Untitled group'}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  )
}

function PokemonPortrait({
  pokemon,
  size,
}: {
  pokemon: RegionRosterPokemon
  size: number
}) {
  return (
    <Box
      sx={{
        alignItems: 'center',
        backgroundColor: 'oklch(0.95 0.02 155)',
        borderRadius: 1,
        display: 'flex',
        height: size,
        justifyContent: 'center',
        width: size,
      }}
    >
      {pokemon.imageUrl ? (
        <Box
          alt=""
          component="img"
          loading="lazy"
          src={pokemon.imageUrl}
          sx={{ height: size - 4, objectFit: 'contain', width: size - 4 }}
        />
      ) : (
        <Typography sx={{ fontWeight: 850 }}>{pokemon.name.charAt(0)}</Typography>
      )}
    </Box>
  )
}

function FavoriteOverlapList({
  groupSize,
  overlaps,
  pokemonBySlug,
}: {
  groupSize: number
  overlaps: FavoriteCategoryOverlap[]
  pokemonBySlug: Map<string, RegionRosterPokemon>
}) {
  return (
    <Box sx={{ borderTop: '1px solid oklch(0.86 0.018 250)' }}>
      {overlaps.map((overlap) => (
        <FavoriteCategoryRow
          groupSize={groupSize}
          key={overlap.category.favoriteId}
          overlap={overlap}
          pokemonBySlug={pokemonBySlug}
        />
      ))}
    </Box>
  )
}

function FavoriteCategoryRow({
  groupSize,
  overlap,
  pokemonBySlug,
}: {
  groupSize: number
  overlap: FavoriteCategoryOverlap
  pokemonBySlug: Map<string, RegionRosterPokemon>
}) {
  const [expanded, setExpanded] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const categoryResidentNames = getResidentNames(
    overlap.residentSlugs,
    pokemonBySlug,
  )
  const visibleItems = showAll
    ? overlap.items
    : overlap.items.slice(0, previewItemCount)

  return (
    <Box sx={{ borderBottom: '1px solid oklch(0.86 0.018 250)' }}>
      <ButtonBase
        aria-expanded={expanded}
        onClick={() => setExpanded((current) => !current)}
        sx={{
          alignItems: 'center',
          display: 'grid',
          gap: 0.75,
          gridTemplateColumns: 'auto minmax(0, 1fr) auto auto',
          justifyItems: 'start',
          minHeight: 48,
          px: 0.5,
          py: 0.75,
          textAlign: 'left',
          width: '100%',
          '&:focus-visible': {
            outline: '3px solid oklch(0.60 0.12 155)',
            outlineOffset: -3,
          },
        }}
      >
        <FavoriteRoundedIcon color="secondary" sx={{ fontSize: 18 }} />
        <Box sx={{ minWidth: 0 }}>
          <Typography component="span" noWrap sx={{ display: 'block', fontWeight: 800 }}>
            {overlap.category.name}
          </Typography>
          <Typography color="text.secondary" component="span" variant="caption">
            {overlap.items.length} overlapping {overlap.items.length === 1 ? 'item' : 'items'}
          </Typography>
        </Box>
        <Tooltip title={`Liked by ${categoryResidentNames}`}>
          <Chip
            color={overlap.residentCount === groupSize ? 'secondary' : 'default'}
            label={`${overlap.residentCount}/${groupSize}`}
            size="small"
          />
        </Tooltip>
        <ExpandMoreRoundedIcon
          sx={{
            color: 'text.secondary',
            fontSize: 20,
            transform: expanded ? 'rotate(180deg)' : 'none',
            transition: 'transform 150ms ease-out',
          }}
        />
      </ButtonBase>
      <Collapse in={expanded}>
        <Box sx={{ borderTop: '1px solid oklch(0.90 0.012 250)', display: 'grid', gap: 1, px: 0.5, py: 1 }}>
          {visibleItems.length > 0 ? (
            <Box
              sx={{
                display: 'grid',
                columnGap: 1,
                gridTemplateColumns: 'repeat(auto-fit, minmax(168px, 1fr))',
              }}
            >
              {visibleItems.map((itemOverlap) => (
                <FavoriteItemRow
                  groupSize={groupSize}
                  itemOverlap={itemOverlap}
                  key={itemOverlap.item.itemId}
                  pokemonBySlug={pokemonBySlug}
                />
              ))}
            </Box>
          ) : (
            <Typography color="text.secondary" variant="body2">
              No cataloged items are available for this category yet.
            </Typography>
          )}
          {overlap.items.length > previewItemCount && (
            <Button
              color="inherit"
              onClick={() => setShowAll((current) => !current)}
              size="small"
              sx={{ justifySelf: 'start' }}
              variant="text"
            >
              {showAll ? 'Show fewer' : `Show all ${overlap.items.length} items`}
            </Button>
          )}
        </Box>
      </Collapse>
    </Box>
  )
}

function FavoriteItemRow({
  groupSize,
  itemOverlap,
  pokemonBySlug,
}: {
  groupSize: number
  itemOverlap: FavoriteItemOverlap
  pokemonBySlug: Map<string, RegionRosterPokemon>
}) {
  const residentNames = getResidentNames(
    itemOverlap.residentSlugs,
    pokemonBySlug,
  )

  return (
    <Tooltip title={`${itemOverlap.item.description ?? itemOverlap.item.itemName} · Liked by ${residentNames}`}>
      <Box
        sx={{
          alignItems: 'center',
          borderBottom: '1px solid oklch(0.90 0.012 250)',
          display: 'grid',
          gap: 0.75,
          gridTemplateColumns: '36px minmax(0, 1fr) auto',
          minHeight: 48,
          py: 0.5,
        }}
      >
        <FavoriteItemPicture item={itemOverlap.item} />
        <Typography noWrap variant="body2">
          {itemOverlap.item.itemName}
        </Typography>
        <Typography
          color={itemOverlap.residentCount === groupSize ? 'secondary.dark' : 'text.secondary'}
          sx={{ fontWeight: 850, fontVariantNumeric: 'tabular-nums' }}
          variant="caption"
        >
          {itemOverlap.residentCount}/{groupSize}
        </Typography>
      </Box>
    </Tooltip>
  )
}

function FavoriteItemPicture({ item }: { item: FavoriteItem }) {
  return (
    <Box
      sx={{
        alignItems: 'center',
        backgroundColor: 'oklch(0.96 0.012 82)',
        borderRadius: 0.75,
        display: 'flex',
        height: 34,
        justifyContent: 'center',
        width: 34,
      }}
    >
      {item.pictureUrl ? (
        <Box
          alt=""
          component="img"
          loading="lazy"
          src={item.pictureUrl}
          sx={{ height: 30, objectFit: 'contain', width: 30 }}
        />
      ) : (
        <Typography sx={{ fontWeight: 850 }} variant="caption">
          {item.itemName.charAt(0)}
        </Typography>
      )}
    </Box>
  )
}

function getResidentNames(
  residentSlugs: string[],
  pokemonBySlug: Map<string, RegionRosterPokemon>,
) {
  return residentSlugs
    .map((slug) => pokemonBySlug.get(slug)?.name ?? slug)
    .join(', ')
}
