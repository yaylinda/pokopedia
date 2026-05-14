import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import type {
  IdealHabitat,
  PokemonProfile,
  PokemonSpawnRecord,
} from '../../../data/pokopia'
import { formatNameList, formatter } from '../../../utils/format'

export type OwnedFilter = 'all' | 'missing' | 'owned'

type FavoriteDetail = PokemonProfile['favorites'][number] & {
  itemCount: number
}

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
  onToggleOwned,
  ownedFilter,
  ownedSet,
  pokemonQuery,
  selectedPokemon,
  selectedPokemonSpawns,
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
  onToggleOwned: (slug: string) => void
  ownedFilter: OwnedFilter
  ownedSet: Set<string>
  pokemonQuery: string
  selectedPokemon: PokemonProfile
  selectedPokemonSpawns: PokemonSpawnRecord[]
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
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
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
    <Box role="listitem" sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 36px', gap: 1 }}>
      <ButtonBase
        onClick={onSelect}
        sx={{
          alignItems: 'center',
          backgroundColor: isSelected ? 'primary.light' : 'transparent',
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
        <Box component="img" src={entry.imageUrl} alt="" sx={{ width: 42, height: 42, objectFit: 'contain' }} />
        <Box sx={{ minWidth: 0 }}>
          <Typography component="strong" noWrap>
            {entry.name}
          </Typography>
          <Typography color="text.secondary" component="small" variant="caption">
            {entry.pokopiaNumberDisplay} /{' '}
            {entry.idealHabitat?.name ?? 'No ideal'}
          </Typography>
        </Box>
      </ButtonBase>
      <Button
        aria-label={isOwned ? `Mark ${entry.name} missing` : `Mark ${entry.name} owned`}
        onClick={onToggleOwned}
        type="button"
        variant={isOwned ? 'contained' : 'outlined'}
        sx={{
          minWidth: 34,
          width: 34,
          height: 34,
          alignSelf: 'center',
          borderRadius: '50%',
          p: 0,
        }}
      >
        {isOwned ? '✓' : ''}
      </Button>
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
      <CardContent sx={{ display: 'grid', gap: 4, p: { xs: 2, md: 3 } }}>
        <Box
          sx={{
            alignItems: 'center',
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', md: '136px minmax(0, 1fr) auto' },
          }}
        >
          <Box sx={{ display: 'grid', height: 136, placeItems: 'center', width: 136 }}>
            <Box component="img" src={entry.imageUrl} alt="" sx={{ width: 96, height: 96, objectFit: 'contain' }} />
          </Box>
          <Box sx={{ display: 'grid', gap: 1.5, minWidth: 0 }}>
            <Typography color="primary" component="p" variant="overline">
              {entry.pokopiaNumberDisplay}
            </Typography>
            <Typography component="h2" variant="h2" sx={{ fontSize: { xs: '2.45rem', md: '3.2rem' }, lineHeight: 0.92 }}>
              {entry.name}
            </Typography>
            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
            {entry.idealHabitat ? (
              <Chip color="primary" label={`${entry.idealHabitat.name} ideal`} />
            ) : null}
            {entry.specialties.map((specialty) => (
              <Chip key={specialty.slug} label={specialty.name} variant="outlined" />
            ))}
            </Stack>
          </Box>
          <Button
          color={isOwned ? 'primary' : 'secondary'}
          type="button"
          onClick={onToggleOwned}
          variant="contained"
          sx={{ justifySelf: { xs: 'start', md: 'end' } }}
        >
          {isOwned ? 'Owned ✓' : 'Mark owned'}
          </Button>
        </Box>

        <Box
          sx={{
            alignItems: 'start',
            display: 'grid',
            gap: 4,
            gridTemplateColumns: { xs: '1fr', md: '0.86fr 1.14fr' },
          }}
        >
          <Box component="section" sx={{ display: 'grid', gap: 1.5, minWidth: 0 }}>
            <Typography component="h3" variant="h5">
              Favorites
            </Typography>
            <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
            {favoriteDetails.map((favorite) => (
              <Box
                key={favorite.favoriteId}
                sx={{
                  display: 'grid',
                  gap: 0.25,
                  p: 1.5,
                  minWidth: 0,
                }}
              >
                <Typography component="strong" noWrap>
                  {favorite.name}
                </Typography>
                <Typography color="text.secondary" component="small" variant="caption">
                  {favorite.kind === 'flavor'
                    ? 'Flavor'
                    : `${formatter.format(favorite.itemCount)} items`}
                </Typography>
              </Box>
            ))}
            </Box>
          </Box>

          <Box component="section" sx={{ display: 'grid', gap: 1.5, minWidth: 0 }}>
            <Typography component="h3" variant="h5">
              Where it appears
            </Typography>
          {spawns.length > 0 ? (
            <Stack spacing={1} divider={null}>
              {spawns.slice(0, 8).map((spawn) => (
                <Box
                  key={`${spawn.habitatId}-${spawn.sourceOrder}`}
                  sx={{ display: 'grid', gap: 0.25, py: 1, borderTop: 1, borderColor: 'divider', '&:first-of-type': { borderTop: 0, pt: 0 } }}
                >
                  <Typography component="strong">{spawn.habitatName}</Typography>
                  <Typography color="text.secondary" component="span" variant="caption">
                    {spawn.rarity} / {formatNameList(spawn.timeOfDay)} /{' '}
                    {formatNameList(spawn.weather)}
                  </Typography>
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography color="text.secondary">No normalized spawn rule found.</Typography>
          )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}
