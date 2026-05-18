import AcUnitRoundedIcon from '@mui/icons-material/AcUnitRounded'
import BedtimeRoundedIcon from '@mui/icons-material/BedtimeRounded'
import CatchingPokemonRoundedIcon from '@mui/icons-material/CatchingPokemonRounded'
import ForestRoundedIcon from '@mui/icons-material/ForestRounded'
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded'
import TerrainRoundedIcon from '@mui/icons-material/TerrainRounded'
import WaterDropRoundedIcon from '@mui/icons-material/WaterDropRounded'
import WbSunnyRoundedIcon from '@mui/icons-material/WbSunnyRounded'
import type { ReactElement, ReactNode } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { FavoriteItemsAccordion } from '../../../components/FavoriteItemsAccordion'
import type { FavoriteWithItems } from '../../../components/favoriteItems'
import type {
  IdealHabitat,
  PokemonProfile,
  PokemonSpawnRecord,
  Specialty,
} from '../../../data/pokopia'
import { formatter } from '../../../utils/format'

export type OwnedFilter = 'all' | 'missing' | 'owned'

type FavoriteDetail = PokemonProfile['favorites'][number] & FavoriteWithItems

export function PokemonExplorer({
  favoriteDetails,
  filteredPokemon,
  idealFilter,
  idealHabitats,
  isIndexCollapsed,
  isSelectedOwned,
  onIdealFilterChange,
  onIndexToggle,
  onOwnedFilterChange,
  onPokemonQueryChange,
  onSelectPokemon,
  onSpecialtyFilterChange,
  onToggleOwned,
  ownedFilter,
  ownedSet,
  pokemonQuery,
  selectedPokemon,
  selectedPokemonSpawns,
  specialties,
  specialtyFilter,
}: {
  favoriteDetails: FavoriteDetail[]
  filteredPokemon: PokemonProfile[]
  idealFilter: string
  idealHabitats: IdealHabitat[]
  isIndexCollapsed: boolean
  isSelectedOwned: boolean
  onIdealFilterChange: (filter: string) => void
  onIndexToggle: () => void
  onOwnedFilterChange: (filter: OwnedFilter) => void
  onPokemonQueryChange: (query: string) => void
  onSelectPokemon: (slug: string) => void
  onSpecialtyFilterChange: (filter: string) => void
  onToggleOwned: (slug: string) => void
  ownedFilter: OwnedFilter
  ownedSet: Set<string>
  pokemonQuery: string
  selectedPokemon: PokemonProfile
  selectedPokemonSpawns: PokemonSpawnRecord[]
  specialties: Specialty[]
  specialtyFilter: string
}) {
  return (
    <Box
      aria-labelledby="pokemon-heading"
      component="section"
      id="pokemon-panel"
      role="tabpanel"
      sx={{
        alignItems: 'start',
        display: 'grid',
        gap: 2,
        gridTemplateColumns: { xs: '1fr', lg: 'minmax(280px, 360px) minmax(0, 1fr)' },
      }}
    >
      <Card
        aria-label="Pokemon list"
        component="aside"
        sx={{
          position: { xs: 'static', lg: 'sticky' },
          top: 84,
          maxHeight: { xs: 'none', lg: 'calc(100vh - 32px)' },
          overflow: 'auto',
        }}
      >
        <CardContent sx={{ display: 'grid', gap: 2, p: { xs: 2, md: 2.5 } }}>
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
          >
            <Box>
              <Typography color="primary" component="p" variant="overline">
                Pokédex
              </Typography>
              <Typography id="pokemon-heading" component="h2" variant="h4">
                {formatter.format(filteredPokemon.length)} entries
              </Typography>
            </Box>
            <Button
              aria-controls="pokemon-index-body"
              aria-expanded={!isIndexCollapsed}
              onClick={onIndexToggle}
              size="small"
              type="button"
              variant="outlined"
              sx={{ display: { xs: 'inline-flex', lg: 'none' }, maxWidth: '44vw' }}
            >
              {isIndexCollapsed ? 'Browse' : 'Hide'}
            </Button>
          </Stack>

          <Box
            id="pokemon-index-body"
            sx={{
              display: { xs: isIndexCollapsed ? 'none' : 'grid', lg: 'grid' },
              gap: 2,
            }}
          >
            <TextField
              fullWidth
              label="Search Pokemon, specialty, favorite"
              value={pokemonQuery}
              onChange={(event) => onPokemonQueryChange(event.target.value)}
              placeholder="Bulbasaur, Grow, soft stuff..."
              size="small"
            />

            <Box
              sx={{
                display: 'grid',
                gap: 1.5,
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(3, minmax(0, 1fr))',
                },
              }}
            >
              <TextField
                label="Ideal"
                select
                size="small"
                value={idealFilter}
                onChange={(event) => onIdealFilterChange(event.target.value)}
              >
                <MenuItem value="all">All ideals</MenuItem>
                {idealHabitats.map((habitat) => (
                  <MenuItem
                    key={habitat.idealHabitatId}
                    value={habitat.idealHabitatId}
                  >
                    {habitat.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Specialty"
                select
                size="small"
                value={specialtyFilter}
                onChange={(event) =>
                  onSpecialtyFilterChange(event.target.value)
                }
              >
                <MenuItem value="all">All specialties</MenuItem>
                {specialties.map((specialty) => (
                  <MenuItem key={specialty.slug} value={specialty.slug}>
                    {specialty.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Tracker"
                select
                size="small"
                value={ownedFilter}
                onChange={(event) =>
                  onOwnedFilterChange(event.target.value as OwnedFilter)
                }
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="owned">Owned</MenuItem>
                <MenuItem value="missing">Missing</MenuItem>
              </TextField>
            </Box>

            <Stack
              role="list"
              spacing={1}
              sx={{
                maxHeight: { xs: 420, lg: 'min(62vh, 720px)' },
                overflow: 'auto',
                pr: 0.5,
              }}
            >
              {filteredPokemon.length > 0 ? (
                filteredPokemon.map((entry) => (
                  <PokemonListButton
                    entry={entry}
                    isOwned={ownedSet.has(entry.slug)}
                    isSelected={entry.slug === selectedPokemon.slug}
                    key={entry.slug}
                    onSelect={() => onSelectPokemon(entry.slug)}
                    onToggleOwned={() => onToggleOwned(entry.slug)}
                  />
                ))
              ) : (
                <Typography color="text.secondary">
                  No Pokemon match those filters.
                </Typography>
              )}
            </Stack>
          </Box>
        </CardContent>
      </Card>

      <PokemonProfilePanel
        entry={selectedPokemon}
        favoriteDetails={favoriteDetails}
        isOwned={isSelectedOwned}
        onToggleOwned={() => onToggleOwned(selectedPokemon.slug)}
        spawns={selectedPokemonSpawns}
      />
    </Box>
  )
}

function PokemonListButton({
  entry,
  isOwned,
  isSelected,
  onSelect,
  onToggleOwned,
}: {
  entry: PokemonProfile
  isOwned: boolean
  isSelected: boolean
  onSelect: () => void
  onToggleOwned: () => void
}) {
  return (
    <Box
      role="listitem"
      sx={{
        display: 'grid',
        gap: 1,
        gridTemplateColumns: 'minmax(0, 1fr) 36px',
      }}
    >
      <ButtonBase
        onClick={onSelect}
        sx={{
          alignItems: 'center',
          backgroundColor: isSelected ? 'rgba(47, 115, 90, 0.13)' : 'transparent',
          border: 1,
          borderColor: isSelected ? 'primary.main' : 'transparent',
          borderRadius: 2,
          display: 'grid',
          gap: 1,
          gridTemplateColumns: '44px minmax(0, 1fr)',
          justifyContent: 'stretch',
          minWidth: 0,
          p: 1,
          textAlign: 'left',
          width: '100%',
        }}
      >
        <Box
          component="img"
          src={entry.imageUrl}
          alt=""
          sx={{ height: 42, objectFit: 'contain', width: 42 }}
        />
        <Box sx={{ display: 'grid', gap: 0.25, minWidth: 0 }}>
          <Typography component="strong" noWrap sx={{ display: 'block' }}>
            {entry.name}
          </Typography>
          <Typography color="text.secondary" component="small" variant="caption">
            {entry.pokopiaNumberDisplay} /{' '}
            {entry.idealHabitat?.name ?? 'No ideal'}
          </Typography>
        </Box>
      </ButtonBase>
      <Tooltip title={isOwned ? 'In collection' : 'Still missing'}>
        <IconButton
          aria-label={isOwned ? `Set ${entry.name} as missing` : `Add ${entry.name} to collection`}
          aria-pressed={isOwned}
          color={isOwned ? 'secondary' : 'default'}
          onClick={onToggleOwned}
          size="small"
          sx={{
            alignSelf: 'center',
            backgroundColor: isOwned ? 'secondary.light' : 'transparent',
            justifySelf: 'center',
          }}
        >
          <CatchingPokemonRoundedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  )
}

function PokemonProfilePanel({
  entry,
  favoriteDetails,
  isOwned,
  onToggleOwned,
  spawns,
}: {
  entry: PokemonProfile
  favoriteDetails: FavoriteDetail[]
  isOwned: boolean
  onToggleOwned: () => void
  spawns: PokemonSpawnRecord[]
}) {
  return (
    <Card component="article">
      <CardContent sx={{ display: 'grid', gap: 3, p: { xs: 2, md: 3 } }}>
        <Box
          sx={{
            alignItems: 'center',
            display: 'grid',
            gap: { xs: 2, md: 3 },
            gridTemplateColumns: {
              xs: '1fr',
              sm: '112px minmax(0, 1fr)',
              md: '128px minmax(0, 1fr) auto',
            },
          }}
        >
          <Box
            sx={{
              alignSelf: 'start',
              background:
                'radial-gradient(circle at 50% 42%, rgba(216, 239, 230, 0.95), rgba(251, 252, 248, 0) 68%)',
              display: 'grid',
              height: { xs: 104, md: 128 },
              placeItems: 'center',
              width: { xs: 104, md: 128 },
            }}
          >
            <Box
              component="img"
              src={entry.imageUrl}
              alt=""
              sx={{
                height: { xs: 92, md: 112 },
                objectFit: 'contain',
                width: { xs: 92, md: 112 },
              }}
            />
          </Box>
          <Box sx={{ display: 'grid', gap: 1.25, minWidth: 0 }}>
            <Typography color="primary" component="p" variant="overline">
              {entry.pokopiaNumberDisplay}
            </Typography>
            <Typography
              component="h2"
              variant="h2"
              sx={{
                fontSize: { xs: '2.45rem', md: '3.2rem' },
                lineHeight: 0.92,
              }}
            >
              {entry.name}
            </Typography>
            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
              {entry.idealHabitat ? (
                <IdealHabitatPill
                  habitat={entry.idealHabitat}
                  label={`${entry.idealHabitat.name} ideal`}
                />
              ) : null}
              {entry.specialties.map((specialty) => (
                <DataPill
                  iconSrc={specialty.pictureUrl ?? specialty.iconUrl}
                  key={specialty.slug}
                  label={specialty.name}
                />
              ))}
            </Stack>
            <SpawnSummary spawns={spawns} />
          </Box>
          <Button
            color={isOwned ? 'secondary' : 'primary'}
            startIcon={<CatchingPokemonRoundedIcon />}
            type="button"
            onClick={onToggleOwned}
            variant={isOwned ? 'contained' : 'outlined'}
            sx={{
              justifySelf: { xs: 'start', sm: 'end' },
              whiteSpace: 'nowrap',
            }}
          >
            {isOwned ? 'In collection' : 'Need to find'}
          </Button>
        </Box>

        <Box component="section" sx={{ display: 'grid', gap: 1.5, minWidth: 0 }}>
          <Typography component="h3" variant="h5">
            Favorites
          </Typography>
          <Box sx={{ display: 'grid', gap: 1 }}>
            {favoriteDetails.map((favorite) => (
              <FavoriteItemsAccordion
                favorite={favorite}
                key={favorite.favoriteId}
              />
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

function SpawnSummary({ spawns }: { spawns: PokemonSpawnRecord[] }) {
  if (spawns.length === 0) {
    return (
      <Typography color="text.secondary" variant="caption">
        No normalized spawn rule found.
      </Typography>
    )
  }

  return (
    <Stack
      direction="row"
      sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.75 }}
    >
      <Typography color="text.secondary" component="span" variant="caption">
        Appears in
      </Typography>
      {spawns.slice(0, 4).map((spawn) => (
        <DataPill
          iconSrc={spawn.habitatPictureUrl}
          key={`${spawn.habitatId}-${spawn.sourceOrder}`}
          label={`${spawn.habitatName} · ${spawn.rarity}`}
        />
      ))}
      {spawns.length > 4 ? (
        <Chip
          label={`+${formatter.format(spawns.length - 4)} more`}
          size="small"
          variant="outlined"
        />
      ) : null}
    </Stack>
  )
}

function IdealHabitatPill({
  habitat,
  label = habitat.name,
}: {
  habitat: IdealHabitat
  label?: string
}) {
  return (
    <DataPill
      icon={getIdealHabitatIcon(habitat.idealHabitatId)}
      label={label}
      tone={getIdealHabitatTone(habitat.idealHabitatId)}
    />
  )
}

function DataPill({
  icon,
  iconSrc,
  label,
  tone,
}: {
  icon?: ReactElement
  iconSrc?: string
  label: ReactNode
  tone?: PillTone
}) {
  return (
    <Box
      component="span"
      sx={{
        alignItems: 'center',
        backgroundColor: tone?.backgroundColor ?? 'rgba(251, 252, 248, 0.74)',
        border: 1,
        borderColor: tone?.borderColor ?? 'divider',
        borderRadius: 999,
        color: tone?.color ?? 'text.primary',
        display: 'inline-flex',
        gap: 0.65,
        maxWidth: '100%',
        minHeight: 30,
        px: 0.85,
        py: 0.35,
      }}
    >
      {iconSrc ? (
        <Box
          alt=""
          component="img"
          src={iconSrc}
          sx={{
            flex: '0 0 auto',
            height: 20,
            objectFit: 'contain',
            width: 20,
          }}
        />
      ) : icon ? (
        <Box
          component="span"
          sx={{
            alignItems: 'center',
            display: 'inline-flex',
            flex: '0 0 auto',
            fontSize: 18,
            lineHeight: 0,
          }}
        >
          {icon}
        </Box>
      ) : null}
      <Typography
        component="span"
        noWrap
        variant="caption"
        sx={{ fontWeight: 800, minWidth: 0 }}
      >
        {label}
      </Typography>
    </Box>
  )
}

type PillTone = {
  backgroundColor: string
  borderColor: string
  color: string
}

function getIdealHabitatTone(idealHabitatId: string): PillTone {
  switch (idealHabitatId) {
    case 'bright':
      return {
        backgroundColor: '#fff1bf',
        borderColor: '#e4bd4d',
        color: '#4d3e05',
      }
    case 'warm':
      return {
        backgroundColor: '#ffe2ce',
        borderColor: '#df8a52',
        color: '#61330e',
      }
    case 'humid':
      return {
        backgroundColor: '#d9f0ec',
        borderColor: '#79b9ad',
        color: '#124c45',
      }
    case 'dry':
      return {
        backgroundColor: '#eee5d1',
        borderColor: '#bfa76d',
        color: '#4a3c1d',
      }
    case 'dark':
      return {
        backgroundColor: '#d9d6e7',
        borderColor: '#81799b',
        color: '#29243d',
      }
    case 'cool':
      return {
        backgroundColor: '#dcecf7',
        borderColor: '#82add0',
        color: '#173c58',
      }
    default:
      return {
        backgroundColor: '#e4eee9',
        borderColor: '#aebfb8',
        color: '#17302d',
      }
  }
}

function getIdealHabitatIcon(idealHabitatId: string) {
  switch (idealHabitatId) {
    case 'bright':
      return <WbSunnyRoundedIcon fontSize="inherit" />
    case 'warm':
      return <LocalFireDepartmentRoundedIcon fontSize="inherit" />
    case 'humid':
      return <WaterDropRoundedIcon fontSize="inherit" />
    case 'dry':
      return <TerrainRoundedIcon fontSize="inherit" />
    case 'dark':
      return <BedtimeRoundedIcon fontSize="inherit" />
    case 'cool':
      return <AcUnitRoundedIcon fontSize="inherit" />
    default:
      return <ForestRoundedIcon fontSize="inherit" />
  }
}
