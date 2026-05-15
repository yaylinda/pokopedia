import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded'
import InterestsRoundedIcon from '@mui/icons-material/InterestsRounded'
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded'
import SaveRoundedIcon from '@mui/icons-material/SaveRounded'
import WbSunnyRoundedIcon from '@mui/icons-material/WbSunnyRounded'
import type { ReactNode } from 'react'
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
import { FavoriteItemChip } from '../../../components/FavoriteItemsAccordion'
import {
  pokemonBySlug,
  type HouseBestItem,
  type HouseDraftSummary,
  type HouseMatch,
  type PokemonProfile,
} from '../../../data/pokopia'
import type { SavedHouse } from '../../../data/types'
import { formatNameList } from '../../../utils/format'

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
    <Stack spacing={1.5}>
      {draftPokemon.length > 0 ? (
        <>
          <BestItemsSection bestItems={draftSummary.bestItems} />
          <CompactOverlapSummary draftSummary={draftSummary} />
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

function CompactOverlapSummary({
  draftSummary,
}: {
  draftSummary: HouseDraftSummary
}) {
  return (
    <Box sx={{ display: 'grid', gap: 1 }}>
      <CompactMatchRow
        empty="No ideal habitat data found."
        icon={<WbSunnyRoundedIcon fontSize="small" />}
        matches={draftSummary.idealHabitats}
        title="Ideal habitats"
      />
      <CompactMatchRow
        empty="Add another Pokemon to reveal shared favorites."
        icon={<FavoriteRoundedIcon fontSize="small" />}
        matches={draftSummary.sharedFavorites}
        title="Shared favorites"
      />
    </Box>
  )
}

function CompactMatchRow({
  empty,
  icon,
  matches,
  title,
}: {
  empty: string
  icon: ReactNode
  matches: HouseMatch[]
  title: string
}) {
  return (
    <Box
      sx={{
        alignItems: 'start',
        display: 'grid',
        gap: 1,
        gridTemplateColumns: { xs: '1fr', sm: '140px minmax(0, 1fr)' },
      }}
    >
      <Stack
        direction="row"
        spacing={0.75}
        sx={{ alignItems: 'center', color: 'text.secondary', minHeight: 28 }}
      >
        {icon}
        <Typography component="h4" variant="subtitle2">
          {title}
        </Typography>
      </Stack>
      {matches.length > 0 ? (
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
          {matches.map((match) => (
            <Chip
              key={match.id}
              label={`${match.name} ${match.count}/4`}
              size="small"
              variant="outlined"
            />
          ))}
        </Stack>
      ) : (
        <Typography color="text.secondary" variant="body2">
          {empty}
        </Typography>
      )}
    </Box>
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

function BestItemsSection({ bestItems }: { bestItems: HouseBestItem[] }) {
  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
        <InterestsRoundedIcon color="primary" fontSize="small" />
        <Typography component="h3" variant="h5">
          Best items
        </Typography>
      </Stack>
      {bestItems.length > 0 ? (
        <Box
          sx={{
            display: 'grid',
            gap: 0.75,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
            },
            m: 0,
            p: 0,
          }}
        >
          {bestItems.map((bestItem) => (
            <BestItemCard bestItem={bestItem} key={bestItem.item.itemId} />
          ))}
        </Box>
      ) : (
        <Typography color="text.secondary">
          No item appears in multiple shared favorites yet.
        </Typography>
      )}
    </Stack>
  )
}

function BestItemCard({ bestItem }: { bestItem: HouseBestItem }) {
  return (
    <Box
      sx={{
        alignItems: 'center',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        display: 'grid',
        gap: 1,
        gridTemplateColumns: 'minmax(0, auto) minmax(0, 1fr)',
        minHeight: 38,
        minWidth: 0,
        px: 1,
        py: 0.75,
      }}
    >
      <FavoriteItemChip component="div" item={bestItem.item} />
      <Typography color="text.secondary" noWrap variant="caption">
        {formatNameList(bestItem.favoriteCategories.map((entry) => entry.name))}
      </Typography>
    </Box>
  )
}
