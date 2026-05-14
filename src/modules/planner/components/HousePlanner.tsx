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
import type { ReactNode } from 'react'
import {
  pokemonBySlug,
  type HouseDraftSummary,
  type PokemonProfile,
} from '../../../data/pokopia'
import type { SavedHouse } from '../../../data/types'
import { formatNameList, formatter } from '../../../utils/format'

export type PlannerRosterMode = 'all' | 'owned'

export function HousePlanner({
  draftName,
  draftPokemon,
  draftSummary,
  houseSearchQuery,
  onDeleteHouse,
  onDraftNameChange,
  onHouseSearchQueryChange,
  onLoadHouse,
  onNewHouse,
  onRosterModeChange,
  onSaveHouse,
  onToggleDraftPokemon,
  ownedSet,
  pokemonOptions,
  plannerRosterMode,
  savedHouses,
  selectedSavedHouseId,
}: {
  draftName: string
  draftPokemon: PokemonProfile[]
  draftSummary: HouseDraftSummary
  houseSearchQuery: string
  onDeleteHouse: (houseId: string) => void
  onDraftNameChange: (name: string) => void
  onHouseSearchQueryChange: (query: string) => void
  onLoadHouse: (houseId: string) => void
  onNewHouse: () => void
  onRosterModeChange: (mode: PlannerRosterMode) => void
  onSaveHouse: () => void
  onToggleDraftPokemon: (slug: string) => void
  ownedSet: Set<string>
  pokemonOptions: PokemonProfile[]
  plannerRosterMode: PlannerRosterMode
  savedHouses: SavedHouse[]
  selectedSavedHouseId: string | null
}) {
  const selectedSlugs = new Set(draftPokemon.map((entry) => entry.slug))
  const hasDraftPokemon = draftPokemon.length > 0
  const canSave = hasDraftPokemon && draftName.trim().length > 0
  const selectedHouse = savedHouses.find(
    (house) => house.id === selectedSavedHouseId,
  )

  return (
    <Box
      aria-labelledby="planner-heading"
      component="section"
      id="planner-panel"
      role="tabpanel"
      sx={{ display: 'grid', gap: 2 }}
    >
      <Card component="header">
        <CardContent
          sx={{
            alignItems: 'end',
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(280px, 0.9fr) minmax(360px, 1.1fr)' },
            p: { xs: 2, md: 3 },
          }}
        >
          <Box>
            <Typography color="primary" component="p" variant="overline">
              House builder
            </Typography>
            <Typography id="planner-heading" component="h2" variant="h4">
              Build a house
            </Typography>
            <Typography color="text.secondary" sx={{ maxWidth: '70ch', mt: 1 }}>
              Name a house, choose up to four Pokemon, and check which ideal
              habitats and favorites line up for the group.
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gap: 1.5 }}>
            <TextField
              fullWidth
              label="House name"
              value={draftName}
              onChange={(event) => onDraftNameChange(event.target.value)}
              placeholder="warm with mew"
              size="small"
            />
            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
              <Button
                disabled={!canSave}
                onClick={onSaveHouse}
                type="button"
                variant="contained"
              >
                {selectedHouse ? 'Update house' : 'Save house'}
              </Button>
              <Button onClick={onNewHouse} type="button" variant="outlined">
                New draft
              </Button>
            </Stack>
            {selectedHouse ? (
              <Typography color="text.secondary" variant="body2">
                Editing {selectedHouse.name}
              </Typography>
            ) : null}
          </Box>
        </CardContent>
      </Card>

      <Box
        sx={{
          alignItems: 'start',
          display: 'grid',
          gap: 2,
          gridTemplateAreas: {
            xs: '"draft" "matches" "roster" "saved"',
            md: '"draft roster" "matches roster" "saved saved"',
            xl: '"draft roster matches" "saved roster matches"',
          },
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, minmax(0, 1fr))',
            xl: 'minmax(260px, 0.9fr) minmax(340px, 1.15fr) minmax(300px, 1fr)',
          },
        }}
      >
        <DraftPanel
          draftPokemon={draftPokemon}
          onToggleDraftPokemon={onToggleDraftPokemon}
        />

        <RosterPanel
          houseSearchQuery={houseSearchQuery}
          onHouseSearchQueryChange={onHouseSearchQueryChange}
          onRosterModeChange={onRosterModeChange}
          onToggleDraftPokemon={onToggleDraftPokemon}
          ownedSet={ownedSet}
          plannerRosterMode={plannerRosterMode}
          pokemonOptions={pokemonOptions}
          selectedSlugs={selectedSlugs}
        />

        <HouseMatchPanel
          draftPokemon={draftPokemon}
          draftSummary={draftSummary}
        />

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

function BuilderPanel({
  area,
  children,
  labelledBy,
}: {
  area: string
  children: ReactNode
  labelledBy: string
}) {
  return (
    <Card component="section" aria-labelledby={labelledBy} sx={{ gridArea: area }}>
      <CardContent sx={{ display: 'grid', gap: 2, p: { xs: 2, md: 2.5 } }}>
        {children}
      </CardContent>
    </Card>
  )
}

function DraftPanel({
  draftPokemon,
  onToggleDraftPokemon,
}: {
  draftPokemon: PokemonProfile[]
  onToggleDraftPokemon: (slug: string) => void
}) {
  return (
    <BuilderPanel area="draft" labelledBy="draft-heading">
      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
      >
        <Box>
          <Typography color="primary" component="p" variant="overline">
            Draft
          </Typography>
          <Typography id="draft-heading" component="h3" variant="h5">
            Pokemon in this house
          </Typography>
        </Box>
        <Chip label={`${draftPokemon.length}/4`} variant="outlined" />
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gap: 1,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
        }}
      >
        {Array.from({ length: 4 }).map((_, index) => {
          const entry = draftPokemon[index]

          return entry ? (
            <ButtonBase
              aria-label={`Remove ${entry.name} from this house`}
              key={entry.slug}
              onClick={() => onToggleDraftPokemon(entry.slug)}
              sx={{
                alignItems: 'center',
                display: 'grid',
                gap: 1,
                gridTemplateColumns: '52px minmax(0, 1fr)',
                justifyContent: 'stretch',
                minHeight: 88,
                minWidth: 0,
                p: 1,
                textAlign: 'left',
                width: '100%',
              }}
            >
              <Box component="img" src={entry.imageUrl} alt="" sx={{ width: 52, height: 52, objectFit: 'contain' }} />
              <Box sx={{ minWidth: 0 }}>
                <Typography component="strong" noWrap>
                  {entry.name}
                </Typography>
                <Typography color="text.secondary" component="small" variant="caption">
                  {entry.idealHabitat?.name ?? 'No ideal'} ideal
                </Typography>
              </Box>
            </ButtonBase>
          ) : (
            <Box
              key={`empty-${index}`}
              sx={{
                alignItems: 'center',
                color: 'text.secondary',
                display: 'grid',
                justifyItems: 'center',
                minHeight: 88,
                p: 1,
              }}
            >
              Open spot
            </Box>
          )
        })}
      </Box>
    </BuilderPanel>
  )
}

function RosterPanel({
  houseSearchQuery,
  onHouseSearchQueryChange,
  onRosterModeChange,
  onToggleDraftPokemon,
  ownedSet,
  plannerRosterMode,
  pokemonOptions,
  selectedSlugs,
}: {
  houseSearchQuery: string
  onHouseSearchQueryChange: (query: string) => void
  onRosterModeChange: (mode: PlannerRosterMode) => void
  onToggleDraftPokemon: (slug: string) => void
  ownedSet: Set<string>
  plannerRosterMode: PlannerRosterMode
  pokemonOptions: PokemonProfile[]
  selectedSlugs: Set<string>
}) {
  return (
    <BuilderPanel area="roster" labelledBy="roster-heading">
      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
      >
        <Box>
          <Typography color="primary" component="p" variant="overline">
            Roster
          </Typography>
          <Typography id="roster-heading" component="h3" variant="h5">
            {formatter.format(pokemonOptions.length)} candidates
          </Typography>
        </Box>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
        }}
      >
        <TextField
          label="Search"
          value={houseSearchQuery}
          onChange={(event) => onHouseSearchQueryChange(event.target.value)}
          placeholder="Mew, Warm, soft stuff..."
          size="small"
        />
        <TextField
          label="Roster"
          select
          size="small"
          value={plannerRosterMode}
          onChange={(event) =>
            onRosterModeChange(event.target.value as PlannerRosterMode)
          }
        >
          <MenuItem value="all">Full roster</MenuItem>
          <MenuItem value="owned">Owned only</MenuItem>
        </TextField>
      </Box>

      <Stack spacing={1} role="list" sx={{ maxHeight: { xs: 520, xl: 620 }, overflow: 'auto', pr: 0.5 }}>
        {pokemonOptions.length > 0 ? (
          pokemonOptions.map((entry) => {
            const isSelected = selectedSlugs.has(entry.slug)
            const isDisabled = selectedSlugs.size >= 4 && !isSelected

            return (
              <ButtonBase
                disabled={isDisabled}
                key={entry.slug}
                onClick={() => onToggleDraftPokemon(entry.slug)}
                role="listitem"
                sx={{
                  alignItems: 'center',
                  backgroundColor: isSelected
                    ? 'primary.light'
                    : 'transparent',
                  display: 'grid',
                  gap: 1,
                  gridTemplateColumns: { xs: '52px minmax(0, 1fr)', sm: '52px minmax(0, 1fr) auto' },
                  justifyContent: 'stretch',
                  minWidth: 0,
                  opacity: isDisabled ? 0.5 : 1,
                  p: 1,
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                <Box component="img" src={entry.imageUrl} alt="" sx={{ width: 52, height: 52, objectFit: 'contain' }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography component="strong" noWrap>
                    {entry.name}
                  </Typography>
                  <Typography color="text.secondary" component="small" variant="caption">
                    {entry.idealHabitat?.name ?? 'No ideal'} /{' '}
                    {ownedSet.has(entry.slug) ? 'Owned' : 'Planning ahead'}
                  </Typography>
                </Box>
                <Typography
                  color="primary.dark"
                  component="em"
                  sx={{ display: { xs: 'none', sm: 'block' }, fontStyle: 'normal', fontWeight: 900 }}
                  variant="body2"
                >
                  {isSelected ? 'Added' : 'Add'}
                </Typography>
              </ButtonBase>
            )
          })
        ) : (
          <Typography color="text.secondary">No Pokemon match those filters.</Typography>
        )}
      </Stack>
    </BuilderPanel>
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
    <BuilderPanel area="saved" labelledBy="saved-heading">
      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
      >
        <Box>
          <Typography color="primary" component="p" variant="overline">
            Saved
          </Typography>
          <Typography id="saved-heading" component="h3" variant="h5">
            Your houses
          </Typography>
        </Box>
      </Stack>

      <Stack spacing={1}>
        {savedHouses.length > 0 ? (
          savedHouses.map((house) => (
            <Box
              component="article"
              key={house.id}
              sx={{
                backgroundColor:
                  house.id === selectedSavedHouseId
                    ? 'primary.light'
                    : 'transparent',
                display: 'grid',
                gap: 1,
                p: 1.5,
              }}
            >
              <Stack
                direction="row"
                sx={{ gap: 1, justifyContent: 'space-between' }}
              >
                <Typography component="strong" noWrap>
                  {house.name}
                </Typography>
                <Typography color="text.secondary" component="small" variant="caption">
                  {formatter.format(house.pokemonSlugs.length)} Pokemon
                </Typography>
              </Stack>
              <Typography color="text.secondary" variant="body2">
                {formatNameList(
                  house.pokemonSlugs.map(
                    (slug) => pokemonBySlug.get(slug)?.name ?? slug,
                  ),
                )}
              </Typography>
              <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                <Button
                  onClick={() => onLoadHouse(house.id)}
                  size="small"
                  type="button"
                  variant="outlined"
                >
                  Load
                </Button>
                <Button
                  color="secondary"
                  onClick={() => onDeleteHouse(house.id)}
                  size="small"
                  type="button"
                  variant="outlined"
                >
                  Delete
                </Button>
              </Stack>
            </Box>
          ))
        ) : (
          <Typography color="text.secondary">
            Saved houses will appear here after you name and save a draft.
          </Typography>
        )}
      </Stack>
    </BuilderPanel>
  )
}

function HouseMatchPanel({
  draftPokemon,
  draftSummary,
}: {
  draftPokemon: PokemonProfile[]
  draftSummary: HouseDraftSummary
}) {
  return (
    <BuilderPanel area="matches" labelledBy="match-heading">
      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
      >
        <Box>
          <Typography color="primary" component="p" variant="overline">
            Matches
          </Typography>
          <Typography id="match-heading" component="h3" variant="h5">
            Ideal habitats and favorites
          </Typography>
        </Box>
      </Stack>

      {draftPokemon.length > 0 ? (
        <Stack spacing={2}>
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
          <Typography color="text.secondary" variant="body2">
            {formatter.format(draftSummary.favoriteCoverage)} total favorite
            categories across this draft.
          </Typography>
        </Stack>
      ) : (
        <Typography color="text.secondary">
          Choose Pokemon from the roster to see what habitat and favorite
          patterns they share.
        </Typography>
      )}
    </BuilderPanel>
  )
}

function MatchSection({
  empty,
  matches,
  title,
}: {
  empty: string
  matches: HouseDraftSummary['idealHabitats']
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

function MatchRow({
  match,
}: {
  match: HouseDraftSummary['idealHabitats'][number]
}) {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 0.5,
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        p: 1.5,
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
