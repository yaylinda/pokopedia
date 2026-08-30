import BoltRoundedIcon from '@mui/icons-material/BoltRounded'
import HubRoundedIcon from '@mui/icons-material/HubRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useMemo, useState } from 'react'
import type { RegionRosterPokemon } from '../../data/currentRegionRoster'
import type {
  FavoriteCategory,
  FavoriteItem,
} from '../../data/favoriteCategories'
import {
  FavoriteItemPicture,
  PokemonPortrait,
} from './components/PlannerVisuals'
import { getHabitatVisual } from './components/plannerHabitatVisuals'
import {
  getEvolutionLinePregroups,
  getGroupFavoriteCategoryCoverage,
  getGroupFlavorCoverage,
  type FavoriteCategoryCoverage,
  type GroupCompatibilityAnalysis,
  type SharedItemCompatibility,
} from './groupPlannerModel'
import {
  getAbilitySummaries,
  getIdealHabitatGrouping,
  getIdealHabitatSummaries,
  getResidentNames,
  type AbilitySummary,
  type IdealHabitatSummary,
  type IdealHabitatGrouping,
} from './plannerDisplayUtils'
import type { VisualStyle } from './regionRosterConfig'

const topItemCount = 5
const categoryIconPreviewCount = 6

export function EvolutionPregroupWorkspace({
  pokemon,
  style,
}: {
  pokemon: RegionRosterPokemon[]
  style: VisualStyle
}) {
  const [query, setQuery] = useState('')
  const normalizedQuery = query.trim().toLocaleLowerCase()
  const cards = useMemo(
    () =>
      getEvolutionLinePregroups(pokemon)
        .filter((family) =>
          matchesPokemonQuery(family.pokemon, normalizedQuery),
        )
        .map(
          (family): PregroupCardData => ({
            compatibility: family.compatibility,
            groupId: family.familyId,
            pokemon: family.pokemon,
          }),
        ),
    [normalizedQuery, pokemon],
  )
  const { habitatCards, mixedCards } = useMemo(
    () => getHabitatCardLayout(cards),
    [cards],
  )

  return (
    <Box sx={{ display: 'grid', gap: 2, minWidth: 0 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: { xs: 'stretch', sm: 'flex-end' },
        }}
      >
        <TextField
          label="Search groups and traits"
          onChange={(event) => setQuery(event.target.value)}
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
          sx={{ width: { xs: '100%', sm: 320 } }}
          value={query}
        />
      </Box>

      {habitatCards.length > 0 && (
        <CardGrid cards={habitatCards} style={style} />
      )}

      {mixedCards.length > 0 && (
        <Box component="section" sx={{ display: 'grid', gap: 1, minWidth: 0 }}>
          <MixedHabitatHeading cardCount={mixedCards.length} />
          <CardGrid cards={mixedCards} style={style} />
        </Box>
      )}

      {cards.length === 0 && (
        <Typography color="text.secondary" sx={{ py: 3 }} variant="body2">
          No residents or traits match “{query}”.
        </Typography>
      )}
    </Box>
  )
}

function CardGrid({
  cards,
  style,
}: {
  cards: PregroupCardData[]
  style: VisualStyle
}) {
  return (
    <Box
      sx={{
        alignItems: 'start',
        display: 'grid',
        gap: 1,
        gridTemplateColumns:
          'repeat(auto-fit, minmax(min(100%, 310px), 1fr))',
        minWidth: 0,
      }}
    >
      {cards.map((card) => (
        <PregroupCard card={card} key={card.groupId} style={style} />
      ))}
    </Box>
  )
}

function MixedHabitatHeading({ cardCount }: { cardCount: number }) {
  return (
    <Box
      component="h3"
      sx={{ alignItems: 'center', display: 'flex', gap: 1, m: 0, minWidth: 0 }}
    >
      <Box
        component="span"
        sx={{
          alignItems: 'center',
          backgroundColor: 'oklch(0.955 0.012 250)',
          border: '1px solid oklch(0.82 0.03 250)',
          borderRadius: 1.25,
          color: 'oklch(0.38 0.055 250)',
          display: 'inline-flex',
          flex: '0 0 auto',
          gap: 0.625,
          minHeight: 34,
          px: 0.75,
        }}
      >
        <HubRoundedIcon sx={{ fontSize: 20 }} />
        <Typography
          component="span"
          sx={{ color: 'inherit', fontWeight: 800 }}
          variant="caption"
        >
          Mixed habitats
        </Typography>
        <Typography
          component="span"
          sx={{ color: 'inherit', fontWeight: 650, opacity: 0.82 }}
          variant="caption"
        >
          {cardCount} {cardCount === 1 ? 'group' : 'groups'}
        </Typography>
      </Box>
      <Box
        aria-hidden="true"
        sx={{ borderTop: '1px solid oklch(0.87 0.018 225)', flex: 1 }}
      />
    </Box>
  )
}

function PregroupCard({
  card,
  style,
}: {
  card: PregroupCardData
  style: VisualStyle
}) {
  const grouping = useMemo(
    () => getIdealHabitatGrouping(card.pokemon),
    [card.pokemon],
  )
  const habitatSummaries = useMemo(
    () => getIdealHabitatSummaries(card.pokemon),
    [card.pokemon],
  )
  const abilitySummaries = useMemo(
    () => getAbilitySummaries(card.pokemon),
    [card.pokemon],
  )
  const favoriteCategories = useMemo(
    () => getGroupFavoriteCategoryCoverage(card.pokemon),
    [card.pokemon],
  )
  const flavorCoverage = useMemo(
    () => getGroupFlavorCoverage(card.pokemon),
    [card.pokemon],
  )
  const topItems = card.compatibility.topItems.slice(0, topItemCount)
  const visual = getHabitatVisual(grouping.habitat?.idealHabitatId)
  const residentNames = card.pokemon.map((resident) => resident.name).join(', ')

  return (
    <Box
      aria-label={`${residentNames} group`}
      component="article"
      sx={{
        backgroundColor: 'oklch(0.995 0.003 225)',
        border: `2px solid ${
          grouping.groupingId === 'mixed'
            ? 'oklch(0.76 0.035 250)'
            : visual.border
        }`,
        borderRadius: 1.5,
        minHeight: 220,
        minWidth: 0,
        overflow: 'hidden',
        transition: 'border-color 140ms ease-out, transform 140ms ease-out',
        '&:hover': { transform: 'translateY(-1px)' },
        '&:focus-within': {
          outline: `3px solid ${style.accent}`,
          outlineOffset: 2,
        },
      }}
    >
        <Box
          sx={{
            alignItems: 'center',
            backgroundColor:
              grouping.groupingId === 'mixed'
                ? 'oklch(0.945 0.018 250)'
                : visual.background,
            borderBottom: `1px solid ${
              grouping.groupingId === 'mixed'
                ? 'oklch(0.76 0.035 250)'
                : visual.border
            }`,
            color:
              grouping.groupingId === 'mixed'
                ? 'oklch(0.34 0.055 250)'
                : visual.foreground,
            display: 'grid',
            gap: 0.75,
            gridTemplateColumns: 'minmax(0, 1fr) auto',
            minHeight: 42,
            px: 1,
            py: 0.5,
          }}
        >
          <HabitatHeader
            grouping={grouping}
            pokemon={card.pokemon}
            summaries={habitatSummaries}
          />
          <AbilityHeader pokemon={card.pokemon} summaries={abilitySummaries} />
        </Box>

        <Box sx={{ display: 'grid', gap: 1.125, p: 1.25 }}>
          <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }} useFlexGap>
            {card.pokemon.map((resident) => (
              <PokemonPortrait key={resident.slug} pokemon={resident} size={52} />
            ))}
          </Stack>

          {flavorCoverage.length > 0 && (
            <FavoriteFlavorSection
              flavors={flavorCoverage}
              pokemon={card.pokemon}
            />
          )}

          <Box sx={{ alignSelf: 'end', display: 'grid', gap: 0.5 }}>
            <Typography color="text.secondary" sx={{ fontWeight: 750 }} variant="caption">
              {getTopItemsHeading(topItems.length)}
            </Typography>
            {topItems.length > 0 ? (
              <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap' }} useFlexGap>
                {topItems.map((entry) => (
                  <ScoredItemPreview entry={entry} key={entry.item.itemId} />
                ))}
              </Stack>
            ) : (
              <Typography color="text.secondary" variant="caption">
                No cataloged favorites
              </Typography>
            )}
          </Box>

          <Tooltip
            arrow
            disableInteractive={false}
            enterDelay={250}
            leaveDelay={200}
            placement="right"
            slotProps={{
              arrow: { sx: { color: 'oklch(0.985 0.006 82)' } },
              tooltip: {
                sx: {
                  backgroundColor: 'oklch(0.985 0.006 82)',
                  border: '1px solid oklch(0.80 0.045 82)',
                  boxShadow: '0 12px 32px oklch(0.30 0.025 225 / 0.18)',
                  color: 'oklch(0.25 0.025 225)',
                  maxWidth: 440,
                  p: 1.25,
                },
              },
            }}
            title={
              <GroupCardPopup
                categories={favoriteCategories}
                pokemon={card.pokemon}
                topItems={topItems}
              />
            }
          >
            <Typography
              aria-label={`Favorite details for ${residentNames}`}
              color="text.secondary"
              component="span"
              sx={{
                borderBottom: '1px dotted currentColor',
                cursor: 'help',
                justifySelf: 'start',
                outlineOffset: 3,
              }}
              tabIndex={0}
              variant="caption"
            >
              Hover for favorite details
            </Typography>
          </Tooltip>
        </Box>
      </Box>
  )
}

function HabitatHeader({
  grouping,
  pokemon,
  summaries,
}: {
  grouping: IdealHabitatGrouping
  pokemon: RegionRosterPokemon[]
  summaries: IdealHabitatSummary[]
}) {
  const pokemonBySlug = new Map(
    pokemon.map((resident) => [resident.slug, resident]),
  )

  return (
    <Box
      sx={{
        alignItems: 'center',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 0.375,
        minWidth: 0,
      }}
    >
      {summaries.length > 0 ? (
        summaries.map((summary) => {
          const habitatVisual = getHabitatVisual(
            summary.habitat.idealHabitatId,
          )
          const Icon = habitatVisual.Icon
          const residentSlugs = pokemon
            .filter(
              (resident) =>
                resident.idealHabitat?.idealHabitatId ===
                summary.habitat.idealHabitatId,
            )
            .map((resident) => resident.slug)
          const names = getResidentNames(residentSlugs, pokemonBySlug)

          return (
            <Tooltip
              arrow
              key={summary.habitat.idealHabitatId}
              placement="top"
              title={
                <Box sx={{ display: 'grid', gap: 0.125 }}>
                  <Typography sx={{ fontWeight: 850 }} variant="caption">
                    {summary.habitat.name} habitat
                  </Typography>
                  <Typography variant="caption">{names}</Typography>
                </Box>
              }
            >
              <Box
                aria-label={`${summary.habitat.name} habitat: ${names}`}
                component="span"
                sx={{
                  alignItems: 'center',
                  backgroundColor: 'oklch(0.995 0.003 225 / 0.62)',
                  border: '1px solid currentColor',
                  borderRadius: '50%',
                  display: 'inline-flex',
                  flex: '0 0 auto',
                  height: 28,
                  justifyContent: 'center',
                  outlineOffset: 2,
                  width: 28,
                }}
                tabIndex={0}
              >
                <Icon sx={{ fontSize: 18 }} />
              </Box>
            </Tooltip>
          )
        })
      ) : (
        <HubRoundedIcon sx={{ fontSize: 20 }} />
      )}
      <Typography
        component="span"
        sx={{
          color: 'inherit',
          fontWeight: 850,
          ml: 0.25,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        variant="caption"
      >
        {grouping.label}
      </Typography>
    </Box>
  )
}

function AbilityHeader({
  pokemon,
  summaries,
}: {
  pokemon: RegionRosterPokemon[]
  summaries: AbilitySummary[]
}) {
  if (summaries.length === 0) return null

  return (
    <Stack
      direction="row"
      spacing={0.375}
      sx={{
        flexWrap: 'nowrap',
        justifyContent: 'flex-end',
        justifySelf: 'end',
        minWidth: 0,
      }}
      useFlexGap
    >
      {summaries.map((summary) => {
        const matchingPokemon = pokemon.filter((resident) =>
          resident.specialties.some(
            (ability) => ability.slug === summary.ability.slug,
          ),
        )
        const names = matchingPokemon
          .map((resident) => resident.name)
          .join(', ')
        const iconUrl = summary.ability.pictureUrl ?? summary.ability.iconUrl

        return (
          <Tooltip
            arrow
            key={summary.ability.slug}
            placement="top"
            title={
              <Box sx={{ display: 'grid', gap: 0.125 }}>
                <Typography sx={{ fontWeight: 850 }} variant="caption">
                  {summary.ability.name}
                </Typography>
                <Typography variant="caption">{names}</Typography>
              </Box>
            }
          >
            <Box
              aria-label={`${summary.ability.name}: ${names}`}
              component="span"
              sx={{
                alignItems: 'center',
                backgroundColor: 'oklch(0.995 0.003 225 / 0.74)',
                border: '1px solid currentColor',
                borderRadius: 1,
                display: 'inline-flex',
                flex: '0 0 auto',
                height: 28,
                justifyContent: 'center',
                outlineOffset: 2,
                width: 28,
              }}
              tabIndex={0}
            >
              {iconUrl ? (
                <Box
                  alt=""
                  component="img"
                  loading="lazy"
                  src={iconUrl}
                  sx={{ height: 21, objectFit: 'contain', width: 21 }}
                />
              ) : (
                <BoltRoundedIcon sx={{ fontSize: 19 }} />
              )}
            </Box>
          </Tooltip>
        )
      })}
    </Stack>
  )
}

function FavoriteFlavorSection({
  flavors,
  pokemon,
}: {
  flavors: FavoriteCategoryCoverage[]
  pokemon: RegionRosterPokemon[]
}) {
  return (
    <Box sx={{ display: 'grid', gap: 0.5 }}>
      <Typography color="text.secondary" sx={{ fontWeight: 750 }} variant="caption">
        Favorite flavors
      </Typography>
      <Box sx={{ display: 'grid', gap: 0.625 }}>
        {flavors.map((coverage) => (
          <FavoriteFlavorPreview
            coverage={coverage}
            key={coverage.category.favoriteId}
            pokemon={pokemon}
          />
        ))}
      </Box>
    </Box>
  )
}

function FavoriteFlavorPreview({
  coverage,
  pokemon,
}: {
  coverage: FavoriteCategoryCoverage
  pokemon: RegionRosterPokemon[]
}) {
  const visibleItems = coverage.category.items.slice(0, categoryIconPreviewCount)
  const hiddenItemCount = Math.max(
    0,
    coverage.category.items.length - visibleItems.length,
  )
  const pokemonBySlug = new Map(
    pokemon.map((resident) => [resident.slug, resident]),
  )
  const names = getResidentNames(coverage.residentSlugs, pokemonBySlug)

  return (
    <Tooltip
      arrow
      disableInteractive={false}
      enterDelay={200}
      leaveDelay={150}
      placement="right"
      slotProps={{
        tooltip: {
          sx: {
            backgroundColor: 'oklch(0.99 0.004 82)',
            border: '1px solid oklch(0.80 0.045 82)',
            boxShadow: '0 12px 32px oklch(0.30 0.025 225 / 0.18)',
            color: 'oklch(0.25 0.025 225)',
            maxWidth: 520,
            p: 1.25,
          },
        },
      }}
      title={
        <Box sx={{ display: 'grid', gap: 0.75, minWidth: 300 }}>
          <Box sx={{ display: 'grid', gap: 0.125 }}>
            <Typography sx={{ fontWeight: 850 }} variant="subtitle2">
              {coverage.category.name}
            </Typography>
            <Typography color="text.secondary" variant="caption">
              Preferred by {names}
            </Typography>
          </Box>
          <CategoryItemsGrid category={coverage.category} />
        </Box>
      }
    >
      <Box
        aria-label={`${coverage.category.name}, preferred by ${names}: ${coverage.category.items
          .map((item) => item.itemName)
          .join(', ')}`}
        component="span"
        sx={{
          alignItems: 'center',
          backgroundColor: 'oklch(0.975 0.018 82)',
          border: '1px solid oklch(0.86 0.035 82)',
          borderRadius: 1,
          display: 'grid',
          gap: 0.625,
          gridTemplateColumns: 'auto minmax(0, 1fr)',
          minWidth: 0,
          outlineOffset: 3,
          px: 0.625,
          py: 0.5,
        }}
        tabIndex={0}
      >
        <Typography
          component="span"
          sx={{ color: 'oklch(0.36 0.055 68)', fontWeight: 850 }}
          variant="caption"
        >
          {coverage.category.name.replace(/ flavors$/i, '')}
        </Typography>
        <Stack
          direction="row"
          spacing={0.375}
          sx={{ alignItems: 'center', flexWrap: 'wrap', minWidth: 0 }}
          useFlexGap
        >
          {visibleItems.map((item) => (
            <FavoriteItemPicture item={item} key={item.itemId} size={26} />
          ))}
          {hiddenItemCount > 0 && (
            <Typography color="text.secondary" variant="caption">
              +{hiddenItemCount}
            </Typography>
          )}
        </Stack>
      </Box>
    </Tooltip>
  )
}

function ScoredItemPreview({ entry }: { entry: SharedItemCompatibility }) {
  return (
    <Box
      aria-label={`${entry.item.itemName}, score ${entry.score}`}
      sx={{
        alignItems: 'center',
        display: 'inline-grid',
        gap: 0.5,
        justifyItems: 'center',
        maxWidth: 112,
      }}
    >
      <Box sx={{ display: 'inline-flex', position: 'relative' }}>
        <FavoriteItemPicture item={entry.item} size={32} />
        <Box
          component="span"
          sx={{
            alignItems: 'center',
            backgroundColor: 'oklch(0.34 0.075 155)',
            border: '2px solid oklch(0.995 0.003 225)',
            borderRadius: '50%',
            bottom: -5,
            color: 'oklch(0.98 0.01 155)',
            display: 'inline-flex',
            fontSize: '0.625rem',
            fontVariantNumeric: 'tabular-nums',
            fontWeight: 850,
            height: 19,
            justifyContent: 'center',
            lineHeight: 1,
            position: 'absolute',
            right: -5,
            width: 19,
          }}
        >
          {entry.score}
        </Box>
      </Box>
      <ItemCategoryBadges compact entry={entry} />
    </Box>
  )
}

function GroupCardPopup({
  categories,
  pokemon,
  topItems,
}: {
  categories: FavoriteCategoryCoverage[]
  pokemon: RegionRosterPokemon[]
  topItems: SharedItemCompatibility[]
}) {
  const pokemonBySlug = new Map(
    pokemon.map((resident) => [resident.slug, resident]),
  )

  return (
    <Box sx={{ display: 'grid', gap: 1.25, minWidth: 320 }}>
      <Box sx={{ display: 'grid', gap: 0.25 }}>
        <Typography sx={{ fontWeight: 850 }} variant="subtitle2">
          Pokémon in this group
        </Typography>
        <Typography color="text.secondary" variant="caption">
          {pokemon.map((resident) => resident.name).join(', ')}
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gap: 0.625 }}>
        <Box sx={{ display: 'grid', gap: 0.125 }}>
          <Typography sx={{ fontWeight: 850 }} variant="subtitle2">
            {getTopItemsHeading(topItems.length)}
          </Typography>
          <Typography color="text.secondary" variant="caption">
            One point per resident/category match
          </Typography>
        </Box>
        {topItems.length > 0 ? (
          topItems.map((entry) => (
            <TopItemRow
              entry={entry}
              key={entry.item.itemId}
              pokemonBySlug={pokemonBySlug}
            />
          ))
        ) : (
          <Typography color="text.secondary" variant="body2">
            No cataloged favorite items are available for this group.
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'grid', gap: 0.5 }}>
        <Box sx={{ display: 'grid', gap: 0.125 }}>
          <Typography sx={{ fontWeight: 850 }} variant="subtitle2">
            Favorite categories
          </Typography>
          <Typography color="text.secondary" variant="caption">
            Hover a category name to see every item in it.
          </Typography>
        </Box>
        {categories.length > 0 ? (
          categories.map((coverage) => (
            <FavoriteCategoryPreview
              coverage={coverage}
              key={coverage.category.favoriteId}
              pokemonBySlug={pokemonBySlug}
            />
          ))
        ) : (
          <Typography color="text.secondary" variant="body2">
            No favorite item categories are listed for this group.
          </Typography>
        )}
      </Box>
    </Box>
  )
}

function TopItemRow({
  entry,
  pokemonBySlug,
}: {
  entry: SharedItemCompatibility
  pokemonBySlug: Map<string, RegionRosterPokemon>
}) {
  return (
    <Box
      sx={{
        alignItems: 'center',
        borderTop: '1px solid oklch(0.88 0.024 82)',
        display: 'grid',
        gap: 0.75,
        gridTemplateColumns: '30px minmax(0, 1fr) auto',
        pt: 0.625,
      }}
    >
      <FavoriteItemPicture item={entry.item} size={28} />
      <Box sx={{ display: 'grid', gap: 0.125, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 800 }} variant="body2">
          {entry.item.itemName}
        </Typography>
        <ItemCategoryBadges entry={entry} />
        <Typography color="text.secondary" variant="caption">
          For {getResidentNames(entry.residentSlugs, pokemonBySlug)}
        </Typography>
      </Box>
      <Chip label={`${entry.score} pts`} size="small" />
    </Box>
  )
}

function ItemCategoryBadges({
  compact = false,
  entry,
}: {
  compact?: boolean
  entry: SharedItemCompatibility
}) {
  const visibleCategories = compact
    ? entry.contributingCategories.slice(0, 1)
    : entry.contributingCategories
  const hiddenCategoryCount =
    entry.contributingCategories.length - visibleCategories.length

  return (
    <Stack
      direction="row"
      spacing={0.375}
      sx={{ flexWrap: 'wrap', minWidth: 0 }}
      useFlexGap
    >
      {visibleCategories.map(({ category }) => (
        <Chip
          key={category.favoriteId}
          label={category.name}
          size="small"
          title={category.name}
          variant="outlined"
          sx={{
            backgroundColor: 'oklch(0.97 0.018 82)',
            borderColor: 'oklch(0.80 0.045 82)',
            color: 'oklch(0.36 0.055 68)',
            fontSize: '0.65rem',
            fontWeight: 750,
            height: 20,
            maxWidth: compact ? 96 : 160,
            '& .MuiChip-label': {
              overflow: 'hidden',
              px: 0.625,
              textOverflow: 'ellipsis',
            },
          }}
        />
      ))}
      {hiddenCategoryCount > 0 && (
        <Chip
          aria-label={`${hiddenCategoryCount} more contributing ${
            hiddenCategoryCount === 1 ? 'category' : 'categories'
          }`}
          label={`+${hiddenCategoryCount}`}
          size="small"
          sx={{
            backgroundColor: 'oklch(0.94 0.025 82)',
            color: 'oklch(0.36 0.055 68)',
            fontSize: '0.65rem',
            fontWeight: 850,
            height: 20,
            '& .MuiChip-label': { px: 0.625 },
          }}
        />
      )}
    </Stack>
  )
}

function FavoriteCategoryPreview({
  coverage,
  pokemonBySlug,
}: {
  coverage: FavoriteCategoryCoverage
  pokemonBySlug: Map<string, RegionRosterPokemon>
}) {
  const visibleItems = coverage.category.items.slice(0, categoryIconPreviewCount)
  const hiddenItemCount = Math.max(
    0,
    coverage.category.items.length - visibleItems.length,
  )

  return (
    <Box
      sx={{
        borderTop: '1px solid oklch(0.88 0.024 82)',
        display: 'grid',
        gap: 0.5,
        pt: 0.625,
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gap: 0.25,
        }}
      >
        <Tooltip
          arrow
          disableInteractive={false}
          enterDelay={200}
          leaveDelay={150}
          placement="right"
          slotProps={{
            tooltip: {
              sx: {
                backgroundColor: 'oklch(0.99 0.004 82)',
                border: '1px solid oklch(0.80 0.045 82)',
                boxShadow: '0 12px 32px oklch(0.30 0.025 225 / 0.18)',
                color: 'oklch(0.25 0.025 225)',
                maxWidth: 520,
                p: 1.25,
              },
            },
          }}
          title={<CategoryItemsPopup category={coverage.category} />}
        >
          <Typography
            component="span"
            tabIndex={0}
            sx={{
              borderBottom: '1px dotted currentColor',
              cursor: 'help',
              fontWeight: 800,
              justifySelf: 'start',
              outlineOffset: 3,
            }}
            variant="body2"
          >
            {coverage.category.name}
          </Typography>
        </Tooltip>
        <Typography color="text.secondary" variant="caption">
          For {getResidentNames(coverage.residentSlugs, pokemonBySlug)}
        </Typography>
      </Box>

      {visibleItems.length > 0 ? (
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }} useFlexGap>
          {visibleItems.map((item) => (
            <FavoriteItemPicture item={item} key={item.itemId} size={26} />
          ))}
          {hiddenItemCount > 0 && (
            <Typography color="text.secondary" variant="caption">
              +{hiddenItemCount}
            </Typography>
          )}
        </Stack>
      ) : (
        <Typography color="text.secondary" variant="caption">
          No cataloged items
        </Typography>
      )}
    </Box>
  )
}

function CategoryItemsPopup({ category }: { category: FavoriteCategory }) {
  return (
    <Box sx={{ display: 'grid', gap: 0.75, minWidth: 300 }}>
      <Box sx={{ display: 'grid', gap: 0.125 }}>
        <Typography sx={{ fontWeight: 850 }} variant="subtitle2">
          {category.name}
        </Typography>
        <Typography color="text.secondary" variant="caption">
          {category.itemCount} cataloged {category.itemCount === 1 ? 'item' : 'items'}
        </Typography>
      </Box>
      <CategoryItemsGrid category={category} />
    </Box>
  )
}

function CategoryItemsGrid({ category }: { category: FavoriteCategory }) {
  if (category.items.length === 0) {
    return (
      <Typography color="text.secondary" variant="body2">
        No cataloged items are available for this category yet.
      </Typography>
    )
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 0.5,
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        maxHeight: 360,
        overflowY: 'auto',
        pr: 0.5,
        scrollbarWidth: 'thin',
      }}
    >
      {category.items.map((item) => (
        <CategoryItem item={item} key={item.itemId} />
      ))}
    </Box>
  )
}

function CategoryItem({ item }: { item: FavoriteItem }) {
  return (
    <Box
      sx={{
        alignItems: 'center',
        display: 'grid',
        gap: 0.625,
        gridTemplateColumns: '30px minmax(0, 1fr)',
        minHeight: 38,
      }}
    >
      <FavoriteItemPicture item={item} size={28} />
      <Typography sx={{ fontWeight: 750 }} variant="body2">
        {item.itemName}
      </Typography>
    </Box>
  )
}

type PregroupCardData = {
  compatibility: GroupCompatibilityAnalysis
  groupId: string
  pokemon: RegionRosterPokemon[]
}

type HabitatCard = {
  card: PregroupCardData
  grouping: IdealHabitatGrouping
}

function getHabitatCardLayout(cards: PregroupCardData[]) {
  const orderedCards: HabitatCard[] = cards
    .map((card) => ({
      card,
      grouping: getIdealHabitatGrouping(card.pokemon),
    }))
    .sort(
      (left, right) =>
        left.grouping.sortOrder - right.grouping.sortOrder ||
        right.card.pokemon.length - left.card.pokemon.length ||
        getCardSortName(left.card).localeCompare(getCardSortName(right.card)),
    )

  return {
    habitatCards: orderedCards
      .filter(({ grouping }) => grouping.groupingId !== 'mixed')
      .map(({ card }) => card),
    mixedCards: orderedCards
      .filter(({ grouping }) => grouping.groupingId === 'mixed')
      .map(({ card }) => card),
  }
}

function getCardSortName(card: PregroupCardData) {
  return card.pokemon.map((resident) => resident.name).join(':')
}

function getTopItemsHeading(itemCount: number) {
  const visibleItemCount = Math.min(topItemCount, itemCount)
  if (visibleItemCount === 0) return 'Top items'
  return `Top ${visibleItemCount} ${visibleItemCount === 1 ? 'item' : 'items'}`
}

function matchesPokemonQuery(
  pokemon: RegionRosterPokemon[],
  normalizedQuery: string,
) {
  if (!normalizedQuery) return true

  return pokemon.some((resident) =>
    [
      resident.name,
      resident.idealHabitat?.name,
      ...resident.specialties.map((ability) => ability.name),
      ...resident.favorites.map((favorite) => favorite.name),
    ].some((value) =>
      value?.toLocaleLowerCase().includes(normalizedQuery),
    ),
  )
}
