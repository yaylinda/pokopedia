import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded'
import SaveRoundedIcon from '@mui/icons-material/SaveRounded'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import {
  pokemonBySlug,
  type HouseDraftSummary,
  type HouseMatch,
  type PokemonProfile,
} from '../../../data/pokopia'
import type { SavedHouse } from '../../../data/types'
import { formatNameList, formatter } from '../../../utils/format'

export function HousePlanner({
  draftName,
  draftPokemon,
  draftSummary,
  onDeleteHouse,
  onDraftNameChange,
  onLoadHouse,
  onNewHouse,
  onSaveHouse,
  onToggleDraftPokemon,
  pokemonOptions,
  savedHouses,
  selectedSavedHouseId,
}: {
  draftName: string
  draftPokemon: PokemonProfile[]
  draftSummary: HouseDraftSummary
  onDeleteHouse: (houseId: string) => void
  onDraftNameChange: (name: string) => void
  onLoadHouse: (houseId: string) => void
  onNewHouse: () => void
  onSaveHouse: () => void
  onToggleDraftPokemon: (slug: string) => void
  pokemonOptions: PokemonProfile[]
  savedHouses: SavedHouse[]
  selectedSavedHouseId: string | null
}) {
  const selectedSlugs = new Set(draftPokemon.map((entry) => entry.slug))
  const selectedHouse = savedHouses.find(
    (house) => house.id === selectedSavedHouseId,
  )
  const canSave = draftPokemon.length > 0 && draftName.trim().length > 0

  return (
    <Box
      aria-labelledby="planner-heading"
      component="section"
      id="planner-panel"
      role="tabpanel"
      sx={{ display: 'grid', gap: 2 }}
    >
      <Box
        sx={{
          alignItems: 'start',
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1fr) 360px' },
        }}
      >
        <Stack spacing={2}>
          <Card component="section" aria-labelledby="planner-heading">
            <CardContent sx={{ display: 'grid', gap: 3, p: { xs: 2, md: 3 } }}>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={2}
                sx={{ justifyContent: 'space-between' }}
              >
                <Box>
                  <Typography color="primary" component="p" variant="overline">
                    House builder
                  </Typography>
                  <Typography id="planner-heading" component="h2" variant="h4">
                    Draft a new house
                  </Typography>
                  <Typography color="text.secondary" sx={{ maxWidth: '72ch', mt: 1 }}>
                    Pick up to four Pokemon and compare the ideal habitats and
                    favorites they share.
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Chip
                    color={draftPokemon.length === 4 ? 'primary' : 'default'}
                    label={`${draftPokemon.length}/4 selected`}
                    variant="outlined"
                  />
                  {selectedHouse ? (
                    <Chip label={`Editing ${selectedHouse.name}`} variant="outlined" />
                  ) : null}
                </Stack>
              </Stack>

              <Box
                sx={{
                  alignItems: 'start',
                  display: 'grid',
                  gap: 3,
                  gridTemplateColumns: {
                    xs: '1fr',
                    lg: 'minmax(320px, 0.9fr) minmax(0, 1.1fr)',
                  },
                }}
              >
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="House name"
                    value={draftName}
                    onChange={(event) => onDraftNameChange(event.target.value)}
                    placeholder="warm with mew"
                    size="small"
                  />

                  <DraftSlots
                    draftPokemon={draftPokemon}
                    onToggleDraftPokemon={onToggleDraftPokemon}
                    pokemonOptions={pokemonOptions}
                    selectedSlugs={selectedSlugs}
                  />

                  <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                    <Button
                      disabled={!canSave}
                      onClick={onSaveHouse}
                      startIcon={<SaveRoundedIcon />}
                      type="button"
                      variant="contained"
                    >
                      {selectedHouse ? 'Update house' : 'Save house'}
                    </Button>
                    <Button
                      onClick={onNewHouse}
                      startIcon={<RestartAltRoundedIcon />}
                      type="button"
                      variant="outlined"
                    >
                      New draft
                    </Button>
                  </Stack>
                </Stack>

                <MatchSummary
                  draftPokemon={draftPokemon}
                  draftSummary={draftSummary}
                />
              </Box>
            </CardContent>
          </Card>
        </Stack>

        <SavedHousesPanel
          onDeleteHouse={onDeleteHouse}
          onLoadHouse={onLoadHouse}
          savedHouses={savedHouses}
          selectedSavedHouseId={selectedSavedHouseId}
        />
      </Box>
    </Box>
  )
}

function DraftSlots({
  draftPokemon,
  onToggleDraftPokemon,
  pokemonOptions,
  selectedSlugs,
}: {
  draftPokemon: PokemonProfile[]
  onToggleDraftPokemon: (slug: string) => void
  pokemonOptions: PokemonProfile[]
  selectedSlugs: Set<string>
}) {
  const availableOptions = pokemonOptions.filter(
    (entry) => !selectedSlugs.has(entry.slug),
  )

  return (
    <Box
      aria-label="Pokemon selected for this house"
      sx={{
        display: 'grid',
        gap: 1,
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
      }}
    >
      {Array.from({ length: 4 }).map((_, index) => {
        const entry = draftPokemon[index]

        return entry ? (
          <Card key={entry.slug} variant="outlined">
            <CardActionArea
              aria-label={`Remove ${entry.name} from this house`}
              onClick={() => onToggleDraftPokemon(entry.slug)}
            >
              <CardContent
                sx={{
                  alignItems: 'center',
                  display: 'grid',
                  gap: 1.5,
                  gridTemplateColumns: '64px minmax(0, 1fr)',
                  minHeight: 118,
                }}
              >
                <Box
                  component="img"
                  src={entry.imageUrl}
                  alt=""
                  sx={{ height: 64, objectFit: 'contain', width: 64 }}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography component="strong" noWrap>
                    {entry.name}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    {entry.idealHabitat?.name ?? 'No ideal'} ideal
                  </Typography>
                  <Typography color="text.secondary" variant="caption">
                    Click to remove
                  </Typography>
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        ) : (
          <Card key={`empty-${index}`} variant="outlined">
            <CardContent
              sx={{
                alignItems: 'center',
                display: 'grid',
                minHeight: 118,
              }}
            >
              <Autocomplete
                autoHighlight
                fullWidth
                getOptionLabel={(option) => option.name}
                noOptionsText="No Pokemon left"
                onChange={(_, option) => {
                  if (option) {
                    onToggleDraftPokemon(option.slug)
                  }
                }}
                openOnFocus
                options={availableOptions}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Open spot"
                    placeholder="Choose Pokemon"
                    size="small"
                  />
                )}
                renderOption={({ key, ...props }, option) => (
                  <Box
                    component="li"
                    key={key}
                    {...props}
                    sx={{ alignItems: 'center', display: 'flex', gap: 1 }}
                  >
                    <Box
                      component="img"
                      src={option.imageUrl}
                      alt=""
                      sx={{ height: 32, objectFit: 'contain', width: 32 }}
                    />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography component="strong" noWrap>
                        {option.name}
                      </Typography>
                      <Typography color="text.secondary" variant="caption">
                        {option.idealHabitat?.name ?? 'No ideal'} ideal
                      </Typography>
                    </Box>
                  </Box>
                )}
                value={null}
              />
            </CardContent>
          </Card>
        )
      })}
    </Box>
  )
}

function MatchSummary({
  draftPokemon,
  draftSummary,
}: {
  draftPokemon: PokemonProfile[]
  draftSummary: HouseDraftSummary
}) {
  return (
    <Stack spacing={2}>
      <Box>
        <Typography color="primary" component="p" variant="overline">
          Live matches
        </Typography>
        <Typography component="h3" variant="h5">
          Habitat and favorite overlap
        </Typography>
      </Box>

      {draftPokemon.length > 0 ? (
        <>
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
            <Chip
              label={`${formatter.format(draftSummary.favoriteCoverage)} favorite categories`}
              variant="outlined"
            />
            <Chip
              label={`${formatter.format(draftSummary.sharedFavorites.length)} shared favorites`}
              variant="outlined"
            />
          </Stack>
          <MatchSection
            empty="No ideal habitat data found."
            matches={draftSummary.idealHabitats}
            title="Ideal habitats"
          />
          <MatchSection
            empty="Add another Pokemon to reveal overlapping favorites."
            matches={draftSummary.sharedFavorites}
            title="Shared favorites"
          />
        </>
      ) : (
        <Typography color="text.secondary">
          Choose Pokemon from an open spot to see which habitats and favorites
          line up.
        </Typography>
      )}
    </Stack>
  )
}

function SavedHousesPanel({
  onDeleteHouse,
  onLoadHouse,
  savedHouses,
  selectedSavedHouseId,
}: {
  onDeleteHouse: (houseId: string) => void
  onLoadHouse: (houseId: string) => void
  savedHouses: SavedHouse[]
  selectedSavedHouseId: string | null
}) {
  return (
    <Card
      component="aside"
      sx={{ position: { xs: 'static', xl: 'sticky' }, top: 72 }}
    >
      <CardContent sx={{ display: 'grid', gap: 2, p: { xs: 2, md: 3 } }}>
        <Box>
          <Typography color="primary" component="p" variant="overline">
            Saved
          </Typography>
          <Typography component="h3" variant="h5">
            Built houses
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Revisit saved drafts without making them the main workspace.
          </Typography>
        </Box>

        {savedHouses.length > 0 ? (
          <List dense disablePadding>
            {savedHouses.map((house, index) => (
              <Box key={house.id}>
                {index > 0 ? <Divider component="li" /> : null}
                <ListItem
                  disablePadding
                  secondaryAction={
                    <Tooltip title={`Delete ${house.name}`}>
                      <IconButton
                        aria-label={`Delete ${house.name}`}
                        edge="end"
                        onClick={() => onDeleteHouse(house.id)}
                      >
                        <DeleteOutlineRoundedIcon />
                      </IconButton>
                    </Tooltip>
                  }
                >
                  <ListItemButton
                    onClick={() => onLoadHouse(house.id)}
                    selected={house.id === selectedSavedHouseId}
                    sx={{ pr: 6 }}
                  >
                    <ListItemText
                      primary={house.name}
                      secondary={formatNameList(
                        house.pokemonSlugs.map(
                          (slug) => pokemonBySlug.get(slug)?.name ?? slug,
                        ),
                      )}
                      slotProps={{
                        primary: { noWrap: true },
                        secondary: { noWrap: true },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              </Box>
            ))}
          </List>
        ) : (
          <Typography color="text.secondary">
            Saved houses will appear here after you name and save a draft.
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}

function MatchSection({
  empty,
  matches,
  title,
}: {
  empty: string
  matches: HouseMatch[]
  title: string
}) {
  return (
    <Stack spacing={1}>
      <Typography component="h4" variant="h6">
        {title}
      </Typography>
      {matches.length > 0 ? (
        <Stack spacing={1}>
          {matches.map((match) => (
            <MatchRow key={match.id} match={match} />
          ))}
        </Stack>
      ) : (
        <Typography color="text.secondary">{empty}</Typography>
      )}
    </Stack>
  )
}

function MatchRow({ match }: { match: HouseMatch }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 0.5,
        gridTemplateColumns: 'minmax(0, 1fr) auto',
      }}
    >
      <Typography component="strong" noWrap>
        {match.name}
      </Typography>
      <Chip label={`${match.count}/4`} size="small" variant="outlined" />
      <Typography color="text.secondary" sx={{ gridColumn: '1 / -1' }} variant="body2">
        {formatNameList(match.pokemon.map((entry) => entry.name))}
      </Typography>
    </Box>
  )
}
