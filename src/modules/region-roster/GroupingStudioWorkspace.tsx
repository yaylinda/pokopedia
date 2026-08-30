import AddRoundedIcon from '@mui/icons-material/AddRounded'
import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded'
import FolderOpenRoundedIcon from '@mui/icons-material/FolderOpenRounded'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import SaveRoundedIcon from '@mui/icons-material/SaveRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type MouseEvent,
} from 'react'
import type {
  CurrentRegion,
  RegionRosterPokemon,
} from '../../data/currentRegionRoster'
import {
  EvolutionGroupCard,
} from './EvolutionPregroupWorkspace'
import { getEvolutionLinePregroups, type EvolutionLinePregroup } from './groupPlannerModel'
import {
  getBundledGroupingStudioDocument,
  loadGroupingStudioDocument,
  saveGroupingStudioDocument,
} from './groupingStudioApi'
import {
  getGroupingStudioScope,
  getUsefulFamilyAbilitySlugs,
  matchesGroupingStudioQuery,
  normalizeGroupingStudioScope,
  updateGroupingStudioScope,
  usefulAbilitySlugs,
  type GroupingStudioDocument,
  type GroupingStudioNeighborhood,
  type GroupingStudioScope,
  type UsefulAbilitySlug,
} from './groupingStudioModel'
import type { VisualStyle } from './regionRosterConfig'

type StudioFamily = EvolutionLinePregroup & {
  usefulAbilitySlugs: UsefulAbilitySlug[]
}

type SaveStatus = 'error' | 'loading' | 'read-only' | 'saved' | 'saving'

const unassignedDropTarget = 'unassigned'
const familyCardGridColumns =
  'repeat(auto-fit, minmax(min(100%, 310px), 1fr))'

export function GroupingStudioWorkspace({
  onChooseRegion,
  onClose,
  pokemon,
  regionId,
  regions,
  snapshotId,
  style,
}: {
  onChooseRegion: (regionId: string) => void
  onClose: () => void
  pokemon: RegionRosterPokemon[]
  regionId: string
  regions: CurrentRegion[]
  snapshotId: string
  style: VisualStyle
}) {
  const [document, setDocument] = useState<GroupingStudioDocument>(
    getBundledGroupingStudioDocument,
  )
  const documentRef = useRef(document)
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve())
  const saveGenerationRef = useRef(0)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('loading')
  const [saveError, setSaveError] = useState('')
  const [writable, setWritable] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedSkill, setSelectedSkill] = useState<UsefulAbilitySlug | null>(null)
  const [newNeighborhoodName, setNewNeighborhoodName] = useState('')
  const [draggedFamilyId, setDraggedFamilyId] = useState<string | null>(null)
  const [dropTargetId, setDropTargetId] = useState<string | null>(null)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let active = true

    void loadGroupingStudioDocument().then((result) => {
      if (!active) return
      documentRef.current = result.document
      setDocument(result.document)
      setWritable(result.writable)
      setSaveStatus(result.writable ? 'saved' : 'read-only')
    })

    return () => {
      active = false
    }
  }, [])

  const families = useMemo<StudioFamily[]>(
    () =>
      getEvolutionLinePregroups(pokemon).map((family) => ({
        ...family,
        usefulAbilitySlugs: getUsefulFamilyAbilitySlugs(family.pokemon),
      })),
    [pokemon],
  )
  const familyById = useMemo(
    () => new Map(families.map((family) => [family.familyId, family])),
    [families],
  )
  const validFamilyIds = useMemo(
    () => new Set(families.map((family) => family.familyId)),
    [families],
  )
  const scope = useMemo(
    () =>
      normalizeGroupingStudioScope(
        getGroupingStudioScope(document, snapshotId, regionId),
        validFamilyIds,
      ),
    [document, regionId, snapshotId, validFamilyIds],
  )
  const assignedFamilyIds = useMemo(
    () =>
      new Set(
        scope.neighborhoods.flatMap((neighborhood) => neighborhood.familyIds),
      ),
    [scope.neighborhoods],
  )
  const unassignedFamilies = useMemo(
    () => families.filter((family) => !assignedFamilyIds.has(family.familyId)),
    [assignedFamilyIds, families],
  )
  const normalizedQuery = query.trim().toLocaleLowerCase()
  const matchingUnassignedFamilies = useMemo(
    () =>
      unassignedFamilies.filter(
        (family) =>
          matchesGroupingStudioQuery(family.pokemon, normalizedQuery) &&
          (!selectedSkill || family.usefulAbilitySlugs.includes(selectedSkill)),
      ),
    [normalizedQuery, selectedSkill, unassignedFamilies],
  )
  const usefulUnassignedFamilies = matchingUnassignedFamilies.filter(
    (family) => family.usefulAbilitySlugs.length > 0,
  )
  const otherUnassignedFamilies = matchingUnassignedFamilies.filter(
    (family) => family.usefulAbilitySlugs.length === 0,
  )
  const assignedCount = families.length - unassignedFamilies.length
  const abilityNameBySlug = useMemo(
    () =>
      new Map(
        pokemon.flatMap((resident) =>
          resident.specialties.map((ability) => [ability.slug, ability.name] as const),
        ),
      ),
    [pokemon],
  )

  const queueSave = useCallback((nextDocument: GroupingStudioDocument) => {
    const generation = saveGenerationRef.current + 1
    saveGenerationRef.current = generation
    setSaveError('')
    setSaveStatus('saving')

    const pendingSave = saveQueueRef.current
      .catch(() => undefined)
      .then(() => saveGroupingStudioDocument(nextDocument))

    saveQueueRef.current = pendingSave
    void pendingSave
      .then(() => {
        if (saveGenerationRef.current === generation) setSaveStatus('saved')
      })
      .catch((error: unknown) => {
        if (saveGenerationRef.current !== generation) return
        setSaveStatus('error')
        setSaveError(
          error instanceof Error ? error.message : 'The studio file could not be saved.',
        )
      })
  }, [])

  const mutateScope = useCallback(
    (mutate: (currentScope: GroupingStudioScope) => GroupingStudioScope) => {
      if (!writable) return

      const currentScope = normalizeGroupingStudioScope(
        getGroupingStudioScope(documentRef.current, snapshotId, regionId),
        validFamilyIds,
      )
      const nextDocument = updateGroupingStudioScope(
        documentRef.current,
        mutate(currentScope),
      )
      documentRef.current = nextDocument
      setDocument(nextDocument)
      queueSave(nextDocument)
    },
    [queueSave, regionId, snapshotId, validFamilyIds, writable],
  )

  const createNeighborhood = () => {
    const name = newNeighborhoodName.trim()
    if (!name) return

    mutateScope((currentScope) => ({
      ...currentScope,
      neighborhoods: [
        ...currentScope.neighborhoods,
        {
          neighborhoodId: `neighborhood-${crypto.randomUUID()}`,
          name,
          familyIds: [],
        },
      ],
    }))
    setNewNeighborhoodName('')
    setNotice(`${name} created`)
  }

  const renameNeighborhood = (neighborhoodId: string, name: string) => {
    const trimmedName = name.trim()
    if (!trimmedName) return

    mutateScope((currentScope) => ({
      ...currentScope,
      neighborhoods: currentScope.neighborhoods.map((neighborhood) =>
        neighborhood.neighborhoodId === neighborhoodId
          ? { ...neighborhood, name: trimmedName }
          : neighborhood,
      ),
    }))
  }

  const deleteNeighborhood = (neighborhoodId: string) => {
    const neighborhood = scope.neighborhoods.find(
      (candidate) => candidate.neighborhoodId === neighborhoodId,
    )
    if (!neighborhood) return

    mutateScope((currentScope) => ({
      ...currentScope,
      neighborhoods: currentScope.neighborhoods.filter(
        (candidate) => candidate.neighborhoodId !== neighborhoodId,
      ),
    }))
    setNotice(
      `${neighborhood.name} deleted · ${neighborhood.familyIds.length} ${
        neighborhood.familyIds.length === 1 ? 'group returned' : 'groups returned'
      } to Unassigned`,
    )
  }

  const moveFamily = useCallback(
    (familyId: string, targetNeighborhoodId: string | null) => {
      if (!validFamilyIds.has(familyId)) return

      mutateScope((currentScope) => ({
        ...currentScope,
        neighborhoods: currentScope.neighborhoods.map((neighborhood) => {
          const familyIds = neighborhood.familyIds.filter(
            (candidate) => candidate !== familyId,
          )
          return neighborhood.neighborhoodId === targetNeighborhoodId
            ? { ...neighborhood, familyIds: [...familyIds, familyId] }
            : { ...neighborhood, familyIds }
        }),
      }))
    },
    [mutateScope, validFamilyIds],
  )

  const finishDrop = (
    event: DragEvent<HTMLElement>,
    targetNeighborhoodId: string | null,
  ) => {
    if (!writable) return
    event.preventDefault()
    const familyId =
      draggedFamilyId || event.dataTransfer.getData('text/grouping-studio-family')
    if (familyId) moveFamily(familyId, targetNeighborhoodId)
    setDraggedFamilyId(null)
    setDropTargetId(null)
  }

  const startDragging = (
    event: DragEvent<HTMLElement>,
    familyId: string,
  ) => {
    if (!writable) {
      event.preventDefault()
      return
    }
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/grouping-studio-family', familyId)
    event.dataTransfer.setData('text/plain', familyId)
    setDraggedFamilyId(familyId)
  }

  const dragOverTarget = (
    event: DragEvent<HTMLElement>,
    targetId: string,
  ) => {
    if (!writable) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setDropTargetId(targetId)
  }

  const leaveDropTarget = (event: DragEvent<HTMLElement>, targetId: string) => {
    const nextTarget = event.relatedTarget
    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) return
    setDropTargetId((current) => (current === targetId ? null : current))
  }

  const resetDragging = () => {
    setDraggedFamilyId(null)
    setDropTargetId(null)
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateRows: 'auto minmax(0, 1fr)',
        height: '100dvh',
        minHeight: 0,
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      <StudioToolbar
        assignedCount={assignedCount}
        familyCount={families.length}
        neighborhoodCount={scope.neighborhoods.length}
        onChooseRegion={onChooseRegion}
        onClose={onClose}
        regionId={regionId}
        regions={regions}
        saveError={saveError}
        saveStatus={saveStatus}
        style={style}
        unassignedCount={unassignedFamilies.length}
      />

      <Box
        component="main"
        sx={{
          display: 'grid',
          gridTemplateColumns: 'minmax(360px, 0.9fr) minmax(520px, 1.35fr)',
          minHeight: 0,
          minWidth: 0,
          overflowX: 'auto',
          overflowY: 'hidden',
        }}
      >
        <Box
          component="section"
          onDragLeave={(event) => leaveDropTarget(event, unassignedDropTarget)}
          onDragOver={(event) => dragOverTarget(event, unassignedDropTarget)}
          onDrop={(event) => finishDrop(event, null)}
          sx={{
            backgroundColor:
              dropTargetId === unassignedDropTarget
                ? 'oklch(0.955 0.035 245)'
                : 'oklch(0.985 0.007 245)',
            borderRight: `1px solid ${
              dropTargetId === unassignedDropTarget
                ? style.accent
                : 'oklch(0.82 0.025 225)'
            }`,
            display: 'grid',
            gridTemplateRows: 'auto minmax(0, 1fr)',
            minHeight: 0,
            minWidth: 360,
            transition: 'background-color 140ms ease-out, border-color 140ms ease-out',
          }}
        >
          <Box
            sx={{
              backgroundColor: 'oklch(0.975 0.009 245)',
              borderBottom: '1px solid oklch(0.84 0.022 245)',
              p: 1.5,
            }}
          >
            <UnassignedHeader
              abilityNameBySlug={abilityNameBySlug}
              onQueryChange={setQuery}
              onSkillChange={setSelectedSkill}
              query={query}
              selectedSkill={selectedSkill}
              unassignedFamilies={unassignedFamilies}
            />
          </Box>

          <Box
            sx={{
              display: 'grid',
              gap: 2,
              minHeight: 0,
              overflowY: 'auto',
              overscrollBehavior: 'contain',
              p: 1.5,
              scrollbarGutter: 'stable',
            }}
          >
            {usefulUnassignedFamilies.length > 0 && (
              <FamilySection
                description="These groups have at least one skill worth planning around."
                families={usefulUnassignedFamilies}
                heading="Useful to place"
                locationId={null}
                neighborhoods={scope.neighborhoods}
                onDragEnd={resetDragging}
                onDragStart={startDragging}
                onMove={moveFamily}
                style={style}
                writable={writable}
              />
            )}

            {otherUnassignedFamilies.length > 0 && !selectedSkill && (
              <FamilySection
                description="No priority utility skill. These can stay parked until you care about them."
                families={otherUnassignedFamilies}
                heading="Okay to leave unassigned"
                locationId={null}
                neighborhoods={scope.neighborhoods}
                onDragEnd={resetDragging}
                onDragStart={startDragging}
                onMove={moveFamily}
                style={style}
                writable={writable}
              />
            )}

            {matchingUnassignedFamilies.length === 0 && (
              <Box sx={{ display: 'grid', gap: 0.5, justifyItems: 'start', py: 2 }}>
                <Inventory2OutlinedIcon sx={{ color: 'text.secondary' }} />
                <Typography sx={{ fontWeight: 850 }} variant="body2">
                  No unassigned groups match this view
                </Typography>
                <Typography color="text.secondary" variant="caption">
                  Clear the search or skill filter, or move a group back from a neighborhood.
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        <Box
          component="section"
          sx={{
            backgroundColor: 'oklch(0.99 0.004 155)',
            display: 'grid',
            gridTemplateRows: 'auto minmax(0, 1fr)',
            minHeight: 0,
            minWidth: 520,
          }}
        >
          <Box
            sx={{
              backgroundColor: 'oklch(0.975 0.012 155)',
              borderBottom: '1px solid oklch(0.82 0.035 155)',
              display: 'grid',
              gap: 1,
              p: 1.5,
            }}
          >
            <Box
              sx={{
                alignItems: 'baseline',
                display: 'flex',
                gap: 1,
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'grid', gap: 0.125 }}>
                <Typography component="h2" sx={{ fontWeight: 900 }} variant="h5">
                  Neighborhoods
                </Typography>
                <Typography color="text.secondary" variant="caption">
                  No capacity limit while you are ideating
                </Typography>
              </Box>
              <Chip
                label={`${scope.neighborhoods.length} total`}
                size="small"
                variant="outlined"
              />
            </Box>
            <CreateNeighborhoodForm
              name={newNeighborhoodName}
              onCreate={createNeighborhood}
              onNameChange={setNewNeighborhoodName}
              writable={writable}
            />
          </Box>

          <Box
            sx={{
              minHeight: 0,
              overflowY: 'auto',
              overscrollBehavior: 'contain',
              p: 1.5,
              scrollbarGutter: 'stable',
            }}
          >
            {scope.neighborhoods.length > 0 ? (
              <Box
                sx={{
                  alignItems: 'start',
                  display: 'grid',
                  gap: 1.5,
                  gridTemplateColumns: 'minmax(0, 1fr)',
                  minWidth: 0,
                }}
              >
                {scope.neighborhoods.map((neighborhood) => (
                  <NeighborhoodCanvas
                    dropActive={dropTargetId === neighborhood.neighborhoodId}
                    dragging={Boolean(draggedFamilyId)}
                    families={neighborhood.familyIds.flatMap((familyId) => {
                      const family = familyById.get(familyId)
                      return family ? [family] : []
                    })}
                    key={neighborhood.neighborhoodId}
                    neighborhood={neighborhood}
                    neighborhoods={scope.neighborhoods}
                    onDelete={() => deleteNeighborhood(neighborhood.neighborhoodId)}
                    onDragEnd={resetDragging}
                    onDragLeave={(event) =>
                      leaveDropTarget(event, neighborhood.neighborhoodId)
                    }
                    onDragOver={(event) =>
                      dragOverTarget(event, neighborhood.neighborhoodId)
                    }
                    onDragStart={startDragging}
                    onDrop={(event) =>
                      finishDrop(event, neighborhood.neighborhoodId)
                    }
                    onMove={moveFamily}
                    onRename={(name) =>
                      renameNeighborhood(neighborhood.neighborhoodId, name)
                    }
                    style={style}
                    writable={writable}
                  />
                ))}
              </Box>
            ) : (
              <Box
                sx={{
                  alignItems: 'center',
                  border: '1px dashed oklch(0.72 0.055 155)',
                  borderRadius: 1.5,
                  display: 'flex',
                  gap: 1,
                  justifyContent: 'space-between',
                  p: 2,
                }}
              >
                <Box sx={{ display: 'grid', gap: 0.25 }}>
                  <Typography sx={{ fontWeight: 850 }} variant="body2">
                    No neighborhoods yet
                  </Typography>
                  <Typography color="text.secondary" variant="caption">
                    Name one above, then move your first useful evolution group into it.
                  </Typography>
                </Box>
                <FolderOpenRoundedIcon sx={{ color: style.deep }} />
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      <Snackbar
        autoHideDuration={4000}
        message={notice}
        onClose={() => setNotice('')}
        open={Boolean(notice)}
      />
    </Box>
  )
}

function StudioToolbar({
  assignedCount,
  familyCount,
  neighborhoodCount,
  onChooseRegion,
  onClose,
  regionId,
  regions,
  saveError,
  saveStatus,
  style,
  unassignedCount,
}: {
  assignedCount: number
  familyCount: number
  neighborhoodCount: number
  onChooseRegion: (regionId: string) => void
  onClose: () => void
  regionId: string
  regions: CurrentRegion[]
  saveError: string
  saveStatus: SaveStatus
  style: VisualStyle
  unassignedCount: number
}) {
  return (
    <Box
      component="header"
      sx={{
        backgroundColor: style.soft,
        borderBottom: `1px solid ${style.accent}`,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
        minHeight: 64,
        px: { xs: 1, sm: 1.5 },
        py: 1,
      }}
    >
      <Tooltip title="Close grouping studio">
        <IconButton
          aria-label="Close grouping studio"
          onClick={onClose}
          sx={{ alignSelf: 'center', minHeight: 44, minWidth: 44 }}
        >
          <CloseRoundedIcon />
        </IconButton>
      </Tooltip>
      <Box
        sx={{
          alignSelf: 'center',
          display: 'flex',
          flex: '1 1 280px',
          gap: 1,
          minWidth: 0,
        }}
      >
        <Box sx={{ display: 'grid', gap: 0.125, minWidth: 0 }}>
          <Typography
            component="h1"
            id="grouping-studio-title"
            noWrap
            sx={{ color: style.deep, fontWeight: 900 }}
            variant="h5"
          >
            Grouping studio
          </Typography>
          <Typography noWrap sx={{ color: style.deep }} variant="caption">
            Evolution groups and neighborhoods, side by side
          </Typography>
        </Box>
      </Box>
      <TextField
        label="Region"
        onChange={(event) => onChooseRegion(event.target.value)}
        select
        size="small"
        sx={{ minWidth: 210 }}
        value={regionId}
      >
        {regions.map((region) => (
          <MenuItem key={region.regionId} value={region.regionId}>
            {region.name}
          </MenuItem>
        ))}
      </TextField>
      <Stack
        direction="row"
        spacing={0.5}
        sx={{ alignItems: 'center', flexWrap: 'wrap' }}
        useFlexGap
      >
        <Chip label={`${neighborhoodCount} neighborhoods`} size="small" />
        <Chip label={`${assignedCount}/${familyCount} placed`} size="small" />
        <Chip label={`${unassignedCount} unassigned`} size="small" />
      </Stack>
      <Box sx={{ alignSelf: 'center' }}>
        <SaveStatusIndicator error={saveError} status={saveStatus} />
      </Box>
    </Box>
  )
}

function CreateNeighborhoodForm({
  name,
  onCreate,
  onNameChange,
  writable,
}: {
  name: string
  onCreate: () => void
  onNameChange: (name: string) => void
  writable: boolean
}) {
  return (
    <Box
      component="form"
      onSubmit={(event) => {
        event.preventDefault()
        onCreate()
      }}
      sx={{ alignItems: 'center', display: 'flex', gap: 1 }}
    >
      <TextField
        disabled={!writable}
        fullWidth
        label="New neighborhood name"
        onChange={(event) => onNameChange(event.target.value)}
        size="small"
        value={name}
      />
      <Button
        disabled={!writable || !name.trim()}
        startIcon={<AddRoundedIcon />}
        sx={{ flex: '0 0 auto', minHeight: 40 }}
        type="submit"
        variant="contained"
      >
        Create
      </Button>
    </Box>
  )
}

function SaveStatusIndicator({
  error,
  status,
}: {
  error: string
  status: SaveStatus
}) {
  const content =
    status === 'loading' ? {
      icon: <CircularProgress size={16} />,
      label: 'Opening studio file…',
    } : status === 'saving' ? {
      icon: <SaveRoundedIcon fontSize="small" />,
      label: 'Saving JSON…',
    } : status === 'error' ? {
      icon: <WarningAmberRoundedIcon fontSize="small" />,
      label: 'JSON save failed',
    } : status === 'read-only' ? {
      icon: <FolderOpenRoundedIcon fontSize="small" />,
      label: 'Committed JSON · read-only here',
    } : {
      icon: <CheckCircleRoundedIcon fontSize="small" />,
      label: 'Saved to JSON',
    }

  return (
    <Tooltip
      title={
        error ||
        (status === 'read-only'
          ? 'Run the local Vite app to edit data/grouping-studio.json.'
          : 'data/grouping-studio.json')
      }
    >
      <Chip
        icon={content.icon}
        label={content.label}
        size="small"
        sx={{
          backgroundColor:
            status === 'error'
              ? 'oklch(0.95 0.045 30)'
              : 'oklch(0.975 0.012 155)',
          color:
            status === 'error'
              ? 'oklch(0.38 0.11 30)'
              : 'oklch(0.34 0.065 155)',
          fontWeight: 800,
        }}
      />
    </Tooltip>
  )
}

function UnassignedHeader({
  abilityNameBySlug,
  onQueryChange,
  onSkillChange,
  query,
  selectedSkill,
  unassignedFamilies,
}: {
  abilityNameBySlug: Map<string, string>
  onQueryChange: (query: string) => void
  onSkillChange: (skill: UsefulAbilitySlug | null) => void
  query: string
  selectedSkill: UsefulAbilitySlug | null
  unassignedFamilies: StudioFamily[]
}) {
  return (
    <Box sx={{ display: 'grid', gap: 1 }}>
      <Box
        sx={{
          display: 'grid',
          gap: 0.75,
        }}
      >
        <Box sx={{ display: 'grid', gap: 0.25 }}>
          <Typography component="h2" sx={{ fontWeight: 900 }} variant="h5">
            Unassigned
          </Typography>
          <Typography color="text.secondary" variant="caption">
            Your working pool—not a backlog you need to finish.
          </Typography>
        </Box>
        <TextField
          label="Search unassigned groups"
          onChange={(event) => onQueryChange(event.target.value)}
          size="small"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          fullWidth
          value={query}
        />
      </Box>
      <Stack direction="row" spacing={0.625} sx={{ flexWrap: 'wrap' }} useFlexGap>
        <Chip
          clickable
          color={selectedSkill === null ? 'primary' : 'default'}
          label={`All · ${unassignedFamilies.length}`}
          onClick={() => onSkillChange(null)}
          size="small"
          variant={selectedSkill === null ? 'filled' : 'outlined'}
        />
        {usefulAbilitySlugs.map((skill) => {
          const count = unassignedFamilies.filter((family) =>
            family.usefulAbilitySlugs.includes(skill),
          ).length
          if (count === 0) return null
          const selected = selectedSkill === skill

          return (
            <Chip
              clickable
              color={selected ? 'primary' : 'default'}
              key={skill}
              label={`${abilityNameBySlug.get(skill) ?? titleFromSlug(skill)} · ${count}`}
              onClick={() => onSkillChange(selected ? null : skill)}
              size="small"
              variant={selected ? 'filled' : 'outlined'}
            />
          )
        })}
      </Stack>
    </Box>
  )
}

function FamilySection({
  description,
  families,
  heading,
  locationId,
  neighborhoods,
  onDragEnd,
  onDragStart,
  onMove,
  style,
  writable,
}: {
  description: string
  families: StudioFamily[]
  heading: string
  locationId: string | null
  neighborhoods: GroupingStudioNeighborhood[]
  onDragEnd: () => void
  onDragStart: (event: DragEvent<HTMLElement>, familyId: string) => void
  onMove: (familyId: string, neighborhoodId: string | null) => void
  style: VisualStyle
  writable: boolean
}) {
  return (
    <Box sx={{ display: 'grid', gap: 1, minWidth: 0 }}>
      <Box sx={{ display: 'grid', gap: 0.125 }}>
        <Typography component="h3" sx={{ fontWeight: 850 }} variant="subtitle1">
          {heading} · {families.length}
        </Typography>
        <Typography color="text.secondary" variant="caption">
          {description}
        </Typography>
      </Box>
      <Box
        sx={{
          alignItems: 'start',
          display: 'grid',
          gap: 1,
          gridTemplateColumns: familyCardGridColumns,
          minWidth: 0,
        }}
      >
        {families.map((family) => (
          <StudioFamilyCard
            family={family}
            key={family.familyId}
            locationId={locationId}
            neighborhoods={neighborhoods}
            onDragEnd={onDragEnd}
            onDragStart={onDragStart}
            onMove={onMove}
            style={style}
            writable={writable}
          />
        ))}
      </Box>
    </Box>
  )
}

function StudioFamilyCard({
  family,
  locationId,
  neighborhoods,
  onDragEnd,
  onDragStart,
  onMove,
  style,
  writable,
}: {
  family: StudioFamily
  locationId: string | null
  neighborhoods: GroupingStudioNeighborhood[]
  onDragEnd: () => void
  onDragStart: (event: DragEvent<HTMLElement>, familyId: string) => void
  onMove: (familyId: string, neighborhoodId: string | null) => void
  style: VisualStyle
  writable: boolean
}) {
  return (
    <EvolutionGroupCard
      actions={
        <MoveFamilyMenu
          disabled={!writable}
          family={family}
          locationId={locationId}
          neighborhoods={neighborhoods}
          onMove={onMove}
        />
      }
      card={{
        compatibility: family.compatibility,
        groupId: family.familyId,
        pokemon: family.pokemon,
      }}
      draggable={writable}
      onDragEnd={onDragEnd}
      onDragStart={(event) => onDragStart(event, family.familyId)}
      style={style}
    />
  )
}

function MoveFamilyMenu({
  disabled,
  family,
  locationId,
  neighborhoods,
  onMove,
}: {
  disabled: boolean
  family: StudioFamily
  locationId: string | null
  neighborhoods: GroupingStudioNeighborhood[]
  onMove: (familyId: string, neighborhoodId: string | null) => void
}) {
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null)
  const residentNames = family.pokemon.map((resident) => resident.name).join(', ')

  const chooseTarget = (targetId: string | null) => {
    setAnchorElement(null)
    if (targetId !== locationId) onMove(family.familyId, targetId)
  }

  return (
    <>
      <Tooltip title={`Move ${residentNames}`}>
        <span>
          <IconButton
            aria-label={`Move ${residentNames}`}
            color="inherit"
            disabled={disabled}
            onClick={(event: MouseEvent<HTMLButtonElement>) =>
              setAnchorElement(event.currentTarget)
            }
            size="small"
            sx={{ minHeight: 36, minWidth: 36 }}
          >
            <ArrowDropDownRoundedIcon />
          </IconButton>
        </span>
      </Tooltip>
      <Menu
        anchorEl={anchorElement}
        onClose={() => setAnchorElement(null)}
        open={Boolean(anchorElement)}
      >
        <MenuItem disabled={locationId === null} onClick={() => chooseTarget(null)}>
          Unassigned
        </MenuItem>
        {neighborhoods.map((neighborhood) => (
          <MenuItem
            disabled={locationId === neighborhood.neighborhoodId}
            key={neighborhood.neighborhoodId}
            onClick={() => chooseTarget(neighborhood.neighborhoodId)}
          >
            {neighborhood.name}
          </MenuItem>
        ))}
        {neighborhoods.length === 0 && (
          <MenuItem disabled>Create a neighborhood first</MenuItem>
        )}
      </Menu>
    </>
  )
}

function NeighborhoodCanvas({
  dragging,
  dropActive,
  families,
  neighborhood,
  neighborhoods,
  onDelete,
  onDragEnd,
  onDragLeave,
  onDragOver,
  onDragStart,
  onDrop,
  onMove,
  onRename,
  style,
  writable,
}: {
  dragging: boolean
  dropActive: boolean
  families: StudioFamily[]
  neighborhood: GroupingStudioNeighborhood
  neighborhoods: GroupingStudioNeighborhood[]
  onDelete: () => void
  onDragEnd: () => void
  onDragLeave: (event: DragEvent<HTMLElement>) => void
  onDragOver: (event: DragEvent<HTMLElement>) => void
  onDragStart: (event: DragEvent<HTMLElement>, familyId: string) => void
  onDrop: (event: DragEvent<HTMLElement>) => void
  onMove: (familyId: string, neighborhoodId: string | null) => void
  onRename: (name: string) => void
  style: VisualStyle
  writable: boolean
}) {
  const [name, setName] = useState(neighborhood.name)
  const pokemonCount = families.reduce(
    (total, family) => total + family.pokemon.length,
    0,
  )
  const usefulSkills = usefulAbilitySlugs.filter((skill) =>
    families.some((family) => family.usefulAbilitySlugs.includes(skill)),
  )

  return (
    <Box
      component="article"
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      sx={{
        backgroundColor: dropActive
          ? 'oklch(0.95 0.04 155)'
          : 'oklch(0.99 0.005 155)',
        border: `${dragging ? '2px dashed' : '1px solid'} ${
          dropActive ? style.accent : 'oklch(0.82 0.035 155)'
        }`,
        borderRadius: 1.5,
        display: 'grid',
        gap: 1.25,
        minWidth: 0,
        p: 1.25,
        transition: 'background-color 140ms ease-out, border-color 140ms ease-out',
      }}
    >
      <Box sx={{ alignItems: 'start', display: 'grid', gap: 1, gridTemplateColumns: 'minmax(0, 1fr) auto' }}>
        <TextField
          disabled={!writable}
          label="Neighborhood name"
          onBlur={() => {
            if (name.trim()) onRename(name)
            else setName(neighborhood.name)
          }}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.currentTarget.blur()
          }}
          size="small"
          value={name}
        />
        <Tooltip title={`Delete ${neighborhood.name}`}>
          <span>
            <IconButton
              aria-label={`Delete ${neighborhood.name}`}
              disabled={!writable}
              onClick={onDelete}
              sx={{ minHeight: 44, minWidth: 44 }}
            >
              <DeleteOutlineRoundedIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }} useFlexGap>
        <Chip label={`${families.length} evo groups`} size="small" />
        <Chip label={`${pokemonCount} Pokémon`} size="small" />
        {usefulSkills.map((skill) => (
          <Chip key={skill} label={titleFromSlug(skill)} size="small" variant="outlined" />
        ))}
      </Stack>

      {families.length > 0 ? (
        <Box
          sx={{
            alignItems: 'start',
            display: 'grid',
            gap: 1,
            gridTemplateColumns: familyCardGridColumns,
            minWidth: 0,
          }}
        >
          {families.map((family) => (
            <StudioFamilyCard
              family={family}
              key={family.familyId}
              locationId={neighborhood.neighborhoodId}
              neighborhoods={neighborhoods}
              onDragEnd={onDragEnd}
              onDragStart={onDragStart}
              onMove={onMove}
              style={style}
              writable={writable}
            />
          ))}
        </Box>
      ) : (
        <Box
          sx={{
            alignItems: 'center',
            border: '1px dashed oklch(0.72 0.055 155)',
            borderRadius: 1.25,
            display: 'grid',
            gap: 0.375,
            justifyItems: 'center',
            minHeight: 128,
            p: 2,
            textAlign: 'center',
          }}
        >
          <DragIndicatorRoundedIcon sx={{ color: style.deep }} />
          <Typography sx={{ fontWeight: 850 }} variant="body2">
            Drop an evolution group here
          </Typography>
          <Typography color="text.secondary" variant="caption">
            You can also use a card’s Move menu.
          </Typography>
        </Box>
      )}
    </Box>
  )
}

const titleFromSlug = (slug: string) =>
  slug.replace(/[-_]/g, ' ').replace(/\b\w/g, (letter) => letter.toLocaleUpperCase())
