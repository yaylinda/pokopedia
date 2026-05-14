import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import type { Habitat, Requirement, Spawn } from '../../../data/pokopia'
import { formatNameList, formatter } from '../../../utils/format'

export function HabitatExplorer({
  filteredHabitats,
  habitatQuery,
  isIndexCollapsed,
  onHabitatQueryChange,
  onIndexToggle,
  onSelectHabitat,
  onSelectPokemon,
  selectedHabitat,
  selectedHabitatRequirements,
  selectedHabitatSpawns,
}: {
  filteredHabitats: Habitat[]
  habitatQuery: string
  isIndexCollapsed: boolean
  onHabitatQueryChange: (query: string) => void
  onIndexToggle: () => void
  onSelectHabitat: (habitatId: number) => void
  onSelectPokemon: (slug: string) => void
  selectedHabitat: Habitat
  selectedHabitatRequirements: Requirement[]
  selectedHabitatSpawns: Spawn[]
}) {
  return (
    <Box
      aria-labelledby="habitats-heading"
      component="section"
      id="habitats-panel"
      role="tabpanel"
      sx={{
        alignItems: 'start',
        display: 'grid',
        gap: 2,
        gridTemplateColumns: { xs: '1fr', lg: 'minmax(280px, 360px) minmax(0, 1fr)' },
      }}
    >
      <Card
        aria-label="Habitat list"
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
                Habitat atlas
              </Typography>
              <Typography id="habitats-heading" component="h2" variant="h4">
                {formatter.format(filteredHabitats.length)} habitats
              </Typography>
            </Box>
            <Button
              aria-controls="habitat-index-body"
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
            id="habitat-index-body"
            sx={{
              display: { xs: isIndexCollapsed ? 'none' : 'grid', lg: 'grid' },
              gap: 2,
            }}
          >
            <TextField
              fullWidth
              label="Search habitat, component, spawn"
              value={habitatQuery}
              onChange={(event) => onHabitatQueryChange(event.target.value)}
              placeholder="Tall grass, tree, Scyther..."
              size="small"
            />

            <Stack
              role="list"
              spacing={1}
              sx={{
                maxHeight: { xs: 420, lg: 'min(62vh, 720px)' },
                overflow: 'auto',
                pr: 0.5,
              }}
            >
            {filteredHabitats.length > 0 ? (
              filteredHabitats.map((habitat) => (
                <ButtonBase
                  key={habitat.habitatId}
                  onClick={() => onSelectHabitat(habitat.habitatId)}
                  role="listitem"
                  sx={{
                    alignItems: 'center',
                    backgroundColor:
                      habitat.habitatId === selectedHabitat.habitatId
                        ? 'primary.light'
                        : 'transparent',
                    display: 'grid',
                    gap: 1,
                    gridTemplateColumns: '58px minmax(0, 1fr)',
                    justifyContent: 'stretch',
                    minWidth: 0,
                    p: 1,
                    textAlign: 'left',
                    width: '100%',
                  }}
                >
                  <Box component="img" src={habitat.pictureUrl} alt="" sx={{ width: 58, height: 44, objectFit: 'contain' }} />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography component="strong" noWrap>
                      {habitat.name}
                    </Typography>
                    <Typography color="text.secondary" component="small" variant="caption">
                      {habitat.habitatIdDisplay}
                    </Typography>
                  </Box>
                </ButtonBase>
              ))
            ) : (
              <Typography color="text.secondary">No habitats match that search.</Typography>
            )}
            </Stack>
          </Box>
        </CardContent>
      </Card>

      <Card component="article">
        <CardContent sx={{ display: 'grid', gap: 4, p: { xs: 2, md: 3 } }}>
          <Box
            sx={{
              alignItems: 'center',
              display: 'grid',
              gap: 3,
              gridTemplateColumns: { xs: '1fr', md: '220px minmax(0, 1fr)' },
            }}
          >
            <Box sx={{ display: 'grid', maxWidth: '100%', placeItems: 'center', width: 220 }}>
              <Box component="img" src={selectedHabitat.pictureUrl} alt="" sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography color="primary" component="p" variant="overline">
                {selectedHabitat.habitatIdDisplay}
              </Typography>
              <Typography component="h2" variant="h3" sx={{ mb: 1 }}>
                {selectedHabitat.name}
              </Typography>
              <Typography color="text.secondary" sx={{ maxWidth: '72ch', mb: 2 }}>
                {selectedHabitat.description}
              </Typography>
              <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                <Chip color="primary" label={`${formatter.format(selectedHabitatRequirements.length)} components`} />
                <Chip
                  label={`${formatter.format(selectedHabitatSpawns.length)} spawn rules`}
                  variant="outlined"
                />
              </Stack>
            </Box>
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
                Components
              </Typography>
              {selectedHabitatRequirements.length > 0 ? (
                <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
                  {selectedHabitatRequirements.map((requirement) => (
                    <Box
                      key={`${requirement.itemId}-${requirement.sourceOrder}`}
                      sx={{
                        alignItems: 'center',
                        display: 'grid',
                        gap: 1,
                        gridTemplateColumns: '42px minmax(0, 1fr)',
                        minWidth: 0,
                        p: 1,
                      }}
                    >
                      <Box component="img" src={requirement.pictureUrl} alt="" sx={{ width: 42, height: 42, objectFit: 'contain' }} />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography component="strong" noWrap>
                          {requirement.itemName}
                        </Typography>
                        <Typography color="text.secondary" component="small" variant="caption">
                          {requirement.quantity === null
                            ? 'As needed'
                            : `Quantity ${formatter.format(requirement.quantity)}`}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary">No normalized components found.</Typography>
              )}
            </Box>

            <Box component="section" sx={{ display: 'grid', gap: 1.5, minWidth: 0 }}>
              <Typography component="h3" variant="h5">
                Spawns
              </Typography>
              {selectedHabitatSpawns.length > 0 ? (
                <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
                  {selectedHabitatSpawns.slice(0, 24).map((spawn) => (
                    <ButtonBase
                      key={`${spawn.pokemonSlug}-${spawn.sourceOrder}`}
                      onClick={() => onSelectPokemon(spawn.pokemonSlug)}
                      sx={{
                        alignItems: 'center',
                        display: 'grid',
                        gap: 1,
                        gridTemplateColumns: '42px minmax(0, 1fr)',
                        justifyContent: 'stretch',
                        minWidth: 0,
                        p: 1,
                        textAlign: 'left',
                        width: '100%',
                      }}
                    >
                      <Box component="img" src={spawn.pokemonImageUrl} alt="" sx={{ width: 42, height: 42, objectFit: 'contain' }} />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography component="strong" noWrap>
                          {spawn.pokemonName}
                        </Typography>
                        <Typography color="text.secondary" component="small" variant="caption">
                          {spawn.rarity} / {formatNameList(spawn.timeOfDay)}
                        </Typography>
                      </Box>
                    </ButtonBase>
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary">No normalized spawn rules found.</Typography>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
