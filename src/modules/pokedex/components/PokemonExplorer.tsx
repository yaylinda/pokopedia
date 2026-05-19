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
  onPokemonQueryChange,
  onSelectPokemon,
  onSpecialtyFilterChange,
  onToggleOwned,
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
  onPokemonQueryChange: (query: string) => void
  onSelectPokemon: (slug: string) => void
  onSpecialtyFilterChange: (filter: string) => void
  onToggleOwned: (slug: string) => void
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
                  sm: 'repeat(2, minmax(0, 1fr))',
                },
              }}
            >
              <TextField
                label="Ideal habitat"
                select
                size="small"
                value={idealFilter}
                onChange={(event) => onIdealFilterChange(event.target.value)}
              >
                <MenuItem value="all">All ideal habitats</MenuItem>
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
            </Box>

            <Stack
              role="list"
              spacing={1}
              sx={{
                '&::-webkit-scrollbar': { display: 'none' },
                maxHeight: { xs: 420, lg: 'min(62vh, 720px)' },
                overflow: 'auto',
                pr: 0.5,
                scrollbarWidth: 'none',
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
          {entry.specialties.length > 0 ? (
            <Stack
              direction="row"
              sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.5, mt: 0.25 }}
            >
              {entry.specialties.slice(0, 2).map((specialty) => (
                <Box
                  component="span"
                  key={specialty.slug}
                  sx={{
                    alignItems: 'center',
                    color: 'primary.dark',
                    display: 'inline-flex',
                    gap: 0.35,
                    minWidth: 0,
                  }}
                >
                  {specialty.pictureUrl || specialty.iconUrl ? (
                    <Box
                      alt=""
                      component="img"
                      src={specialty.pictureUrl ?? specialty.iconUrl}
                      sx={{
                        flex: '0 0 auto',
                        height: 15,
                        objectFit: 'contain',
                        width: 15,
                      }}
                    />
                  ) : null}
                  <Typography component="span" noWrap variant="caption">
                    {specialty.name}
                  </Typography>
                </Box>
              ))}
            </Stack>
          ) : null}
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
            alignItems: 'start',
            display: 'grid',
            gap: { xs: 2, md: 2.5 },
            gridTemplateColumns: {
              xs: '1fr',
              sm: '104px minmax(0, 1fr)',
              md: '116px minmax(0, 1fr) auto',
            },
          }}
        >
          <Box
            sx={{
              alignSelf: 'start',
              background:
                'radial-gradient(circle at 50% 42%, rgba(216, 239, 230, 0.95), rgba(251, 252, 248, 0) 68%)',
              display: 'grid',
              height: { xs: 104, md: 116 },
              placeItems: 'center',
              width: { xs: 104, md: 116 },
            }}
          >
            <Box
              component="img"
              src={entry.imageUrl}
              alt=""
              sx={{
                height: { xs: 92, md: 104 },
                objectFit: 'contain',
                width: { xs: 92, md: 104 },
              }}
            />
          </Box>
          <Box sx={{ display: 'grid', gap: 1.5, minWidth: 0 }}>
            <Box sx={{ display: 'grid', gap: 0.5, minWidth: 0 }}>
              <Typography color="primary" component="p" variant="overline">
                {entry.pokopiaNumberDisplay}
              </Typography>
              <Typography
                component="h2"
                variant="h2"
                sx={{
                  fontSize: { xs: '2.25rem', md: '2.9rem' },
                  lineHeight: 0.95,
                }}
              >
                {entry.name}
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gap: 1.5,
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'minmax(130px, 0.7fr) minmax(160px, 0.8fr) minmax(220px, 1.2fr)',
                },
              }}
            >
              <MetadataGroup label="Specialties">
                {entry.specialties.map((specialty) => (
                  <DataPill
                    iconSrc={specialty.pictureUrl ?? specialty.iconUrl}
                    key={specialty.slug}
                    label={specialty.name}
                  />
                ))}
              </MetadataGroup>
              <MetadataGroup label="Ideal habitat">
                {entry.idealHabitat ? (
                  <IdealHabitatPill
                    habitat={entry.idealHabitat}
                    label={entry.idealHabitat.name}
                  />
                ) : null}
              </MetadataGroup>
              <SpawnSummary spawns={spawns} />
            </Box>
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

function MetadataGroup({
  children,
  label,
}: {
  children: ReactNode
  label: string
}) {
  return (
    <Box sx={{ alignContent: 'start', display: 'grid', gap: 0.65, minWidth: 0 }}>
      <Typography
        color="text.secondary"
        component="span"
        variant="caption"
        sx={{ fontWeight: 700 }}
      >
        {label}
      </Typography>
      <Stack
        direction="row"
        sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.65 }}
      >
        {children}
      </Stack>
    </Box>
  )
}

function SpawnSummary({ spawns }: { spawns: PokemonSpawnRecord[] }) {
  if (spawns.length === 0) {
    return (
      <MetadataGroup label="Appears in">
        <DataPill label="No normalized spawn rule found" />
      </MetadataGroup>
    )
  }

  return (
    <MetadataGroup label="Appears in">
      {spawns.slice(0, 4).map((spawn) => (
        <DataPill
          iconSrc={spawn.habitatPictureUrl}
          key={`${spawn.habitatId}-${spawn.sourceOrder}`}
          label={spawn.habitatName}
          meta={spawn.rarity}
        />
      ))}
      {spawns.length > 4 ? (
        <DataPill label={`+${formatter.format(spawns.length - 4)} more`} />
      ) : null}
    </MetadataGroup>
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
  meta,
  tone,
}: {
  icon?: ReactElement
  iconSrc?: string
  label: string
  meta?: string
  tone?: PillTone
}) {
  return (
    <Box
      component="span"
      sx={{
        alignItems: 'center',
        backgroundColor: 'rgba(251, 252, 248, 0.66)',
        border: 1,
        borderColor: tone?.borderColor ?? 'divider',
        borderRadius: 999,
        color: 'text.primary',
        display: 'inline-flex',
        flex: '0 0 auto',
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
            color: tone?.color ?? 'text.secondary',
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
        sx={{ fontWeight: 700, minWidth: 0 }}
      >
        {label}
      </Typography>
      {meta ? (
        <Typography
          color="text.secondary"
          component="span"
          noWrap
          variant="caption"
          sx={{ fontWeight: 500, minWidth: 0 }}
        >
          · {meta}
        </Typography>
      ) : null}
    </Box>
  )
}

type PillTone = {
  borderColor: string
  color: string
}

function getIdealHabitatTone(idealHabitatId: string): PillTone {
  switch (idealHabitatId) {
    case 'bright':
      return {
        borderColor: '#e4bd4d',
        color: '#7d6204',
      }
    case 'warm':
      return {
        borderColor: '#df8a52',
        color: '#9b4d16',
      }
    case 'humid':
      return {
        borderColor: '#79b9ad',
        color: '#1d7166',
      }
    case 'dry':
      return {
        borderColor: '#bfa76d',
        color: '#7a6127',
      }
    case 'dark':
      return {
        borderColor: '#81799b',
        color: '#4c426d',
      }
    case 'cool':
      return {
        borderColor: '#82add0',
        color: '#2b678e',
      }
    default:
      return {
        borderColor: '#aebfb8',
        color: '#2f735a',
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
