import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import HubRoundedIcon from '@mui/icons-material/HubRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Chip from '@mui/material/Chip'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useMemo, useRef, useState } from 'react'
import type { RegionRosterPokemon } from '../../data/currentRegionRoster'
import {
  favoriteCategoriesByItemId,
  favoriteCategoryById,
  type FavoriteCategory,
  type FavoriteItem,
} from '../../data/favoriteCategories'
import {
  getEvolutionLinePregroups,
  getGroupFavoriteOverlaps,
  getSoloHabitatPregroups,
  type EvolutionLinePregroup,
  type FavoriteCategoryOverlap,
  type FavoriteItemOverlap,
  type GroupCompatibilityAnalysis,
  type SharedItemCompatibility,
  type SoloHabitatPregroup,
} from './groupPlannerModel'
import { comfortStyles, type VisualStyle } from './regionRosterConfig'
import {
  AbilityBadge,
  FavoriteItemPicture,
  IdealHabitatBadge,
  PokemonPortrait,
} from './components/PlannerVisuals'
import {
  getAbilitySummaries,
  getIdealHabitatGrouping,
  getIdealHabitatSummaries,
  getResidentNames,
  type IdealHabitatGrouping,
} from './plannerDisplayUtils'

const itemPreviewCount = 12

export function EvolutionPregroupWorkspace({
  pokemon,
  style,
}: {
  pokemon: RegionRosterPokemon[]
  style: VisualStyle
}) {
  const [query, setQuery] = useState('')
  const [expandedFamilyIds, setExpandedFamilyIds] = useState<Set<string>>(
    () => new Set(),
  )
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  )
  const categoryTriggerRef = useRef<HTMLElement | null>(null)
  const useWideCatalogLayout = useMediaQuery('(min-width:1536px)')
  const families = useMemo(() => getEvolutionLinePregroups(pokemon), [pokemon])
  const soloHabitatGroups = useMemo(
    () => getSoloHabitatPregroups(families),
    [families],
  )
  const normalizedQuery = query.trim().toLocaleLowerCase()
  const visibleEvolutionFamilies = useMemo(
    () =>
      families
        .filter(
          (family) =>
            family.pokemon.length > 1 &&
            matchesPokemonQuery(family.pokemon, normalizedQuery),
        )
        .sort(
          (left, right) =>
            right.pokemon.length - left.pokemon.length ||
            getFamilyName(left).localeCompare(getFamilyName(right)),
        ),
    [families, normalizedQuery],
  )
  const visibleSoloHabitatGroups = useMemo(
    () =>
      soloHabitatGroups.filter((group) =>
        matchesPokemonQuery(group.pokemon, normalizedQuery),
      ),
    [normalizedQuery, soloHabitatGroups],
  )
  const visibleSoloResidentCount = visibleSoloHabitatGroups.reduce(
    (total, group) => total + group.pokemon.length,
    0,
  )
  const selectedCategory = selectedCategoryId
    ? favoriteCategoryById.get(selectedCategoryId) ?? null
    : null

  const toggleFamily = (familyId: string) => {
    setExpandedFamilyIds((current) => {
      const next = new Set(current)
      if (next.has(familyId)) next.delete(familyId)
      else next.add(familyId)
      return next
    })
  }
  const inspectCategory = (categoryId: string) => {
    categoryTriggerRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    setSelectedCategoryId(categoryId)
  }
  const closeCategory = () => {
    setSelectedCategoryId(null)
    requestAnimationFrame(() => categoryTriggerRef.current?.focus())
  }

  return (
    <Box sx={{ display: 'grid', gap: 2, minWidth: 0 }}>
      <Box
        component="section"
        sx={{
          alignItems: { xs: 'stretch', md: 'center' },
          backgroundColor: 'oklch(0.985 0.006 225)',
          border: '1px solid oklch(0.84 0.025 225)',
          borderRadius: 1.5,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 1.5,
          justifyContent: 'space-between',
          p: { xs: 1.25, sm: 1.5 },
        }}
      >
        <Box sx={{ display: 'grid', gap: 0.375 }}>
          <Typography component="h2" sx={{ fontWeight: 850 }} variant="h5">
            Evolution starting points
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: '70ch' }} variant="body2">
            Scan portraits, habitats, and abilities in the compact cards. Hover or focus for a favorite-overlap preview, then open a group for every matching category and item.
          </Typography>
          <Stack direction="row" spacing={0.75} sx={{ pt: 0.5 }} useFlexGap>
            <Chip
              label={`${visibleEvolutionFamilies.length} evolution lines`}
              size="small"
            />
            <Chip
              label={`${visibleSoloResidentCount} solo residents · ${visibleSoloHabitatGroups.length} habitat groups`}
              size="small"
            />
          </Stack>
        </Box>
        <TextField
          label="Search families and traits"
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
          sx={{ width: { xs: '100%', md: 320 } }}
          value={query}
        />
      </Box>

      <Box
        sx={{
          alignItems: 'start',
          display: 'grid',
          gap: 2,
          gridTemplateColumns: selectedCategory
            ? { xs: 'minmax(0, 1fr)', xl: 'minmax(0, 1fr) 320px' }
            : 'minmax(0, 1fr)',
          minWidth: 0,
        }}
      >
        {selectedCategory && !useWideCatalogLayout && (
          <CategoryCatalogInspector
            category={selectedCategory}
            key={selectedCategory.favoriteId}
            onClose={closeCategory}
          />
        )}

        <Box sx={{ display: 'grid', gap: 2, minWidth: 0 }}>
          {visibleEvolutionFamilies.length > 0 && (
            <FamilySection
              expandedFamilyIds={expandedFamilyIds}
              families={visibleEvolutionFamilies}
              onInspectCategory={inspectCategory}
              onToggleFamily={toggleFamily}
              style={style}
              subtitle="Evolution families stay together, then sit near families with the same strongest habitat match. Ties appear under Mixed habitats."
              title="Evolution lines by habitat"
            />
          )}

          {visibleSoloHabitatGroups.length > 0 && (
            <SoloHabitatSection
              expandedFamilyIds={expandedFamilyIds}
              groups={visibleSoloHabitatGroups}
              onInspectCategory={inspectCategory}
              onToggleFamily={toggleFamily}
              style={style}
            />
          )}

          {visibleEvolutionFamilies.length === 0 &&
            visibleSoloHabitatGroups.length === 0 && (
            <Typography color="text.secondary" sx={{ py: 3 }} variant="body2">
              No residents or traits match “{query}”.
            </Typography>
          )}
        </Box>

        {selectedCategory && useWideCatalogLayout && (
          <CategoryCatalogInspector
            category={selectedCategory}
            key={selectedCategory.favoriteId}
            onClose={closeCategory}
          />
        )}
      </Box>
    </Box>
  )
}

function FamilySection({
  expandedFamilyIds,
  families,
  onInspectCategory,
  onToggleFamily,
  style,
  subtitle,
  title,
}: {
  expandedFamilyIds: Set<string>
  families: EvolutionLinePregroup[]
  onInspectCategory: (categoryId: string) => void
  onToggleFamily: (familyId: string) => void
  style: VisualStyle
  subtitle?: string
  title: string
}) {
  const cards = families.map((family): PregroupCardData => {
    const absentRelativeCount = Math.max(
      0,
      family.canonicalPokemonSlugs.length - family.pokemon.length,
    )

    return {
      compatibility: family.compatibility,
      groupId: family.familyId,
      pokemon: family.pokemon,
      subtitle: family.isCompleteFamily
        ? 'Complete line in this region'
        : `${absentRelativeCount} relative${absentRelativeCount === 1 ? '' : 's'} elsewhere`,
      title: getFamilyName(family),
    }
  })

  return (
    <PregroupSection
      cards={cards}
      expandedGroupIds={expandedFamilyIds}
      onInspectCategory={onInspectCategory}
      onToggleGroup={onToggleFamily}
      style={style}
      subtitle={subtitle}
      title={title}
    />
  )
}

function SoloHabitatSection({
  expandedFamilyIds,
  groups,
  onInspectCategory,
  onToggleFamily,
  style,
}: {
  expandedFamilyIds: Set<string>
  groups: SoloHabitatPregroup[]
  onInspectCategory: (categoryId: string) => void
  onToggleFamily: (familyId: string) => void
  style: VisualStyle
}) {
  const cards = groups.map((group): PregroupCardData => ({
    compatibility: group.compatibility,
    groupId: group.groupId,
    pokemon: group.pokemon,
    subtitle:
      group.pokemon.length === 1
        ? 'Only solo resident with this ideal habitat'
        : group.cohortCount > 1
          ? `Habitat group ${group.cohortIndex} of ${group.cohortCount}`
          : 'Grouped from solo residents by ideal habitat',
    title: group.pokemon.map((resident) => resident.name).join(' · '),
  }))

  return (
    <PregroupSection
      cards={cards}
      expandedGroupIds={expandedFamilyIds}
      onInspectCategory={onInspectCategory}
      onToggleGroup={onToggleFamily}
      style={style}
      subtitle="Residents without a roster-relative are combined by ideal habitat, with up to four residents per group."
      title="Solo habitat groups"
    />
  )
}

function PregroupSection({
  cards,
  expandedGroupIds,
  onInspectCategory,
  onToggleGroup,
  style,
  subtitle,
  title,
}: {
  cards: PregroupCardData[]
  expandedGroupIds: Set<string>
  onInspectCategory: (categoryId: string) => void
  onToggleGroup: (groupId: string) => void
  style: VisualStyle
  subtitle?: string
  title: string
}) {
  const clusters = getHabitatCardClusters(cards)

  return (
    <Box component="section" sx={{ display: 'grid', gap: 1.5, minWidth: 0 }}>
      <Box sx={{ display: 'grid', gap: 0.25 }}>
        <Typography component="h3" sx={{ fontWeight: 850 }} variant="h6">
          {title}
        </Typography>
        {subtitle && (
          <Typography color="text.secondary" variant="caption">
            {subtitle}
          </Typography>
        )}
      </Box>
      <Box sx={{ display: 'grid', gap: 2, minWidth: 0 }}>
        {clusters.map((cluster) => (
          <Box
            key={cluster.grouping.groupingId}
            sx={{ display: 'grid', gap: 1, minWidth: 0 }}
          >
            <HabitatClusterHeading
              cardCount={cluster.cards.length}
              grouping={cluster.grouping}
            />
            <Box
              sx={{
                alignItems: 'start',
                display: 'grid',
                gap: 1,
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(min(100%, 330px), 1fr))',
                minWidth: 0,
              }}
            >
              {cluster.cards.map((card) => (
                <PregroupCard
                  card={card}
                  expanded={expandedGroupIds.has(card.groupId)}
                  key={card.groupId}
                  onInspectCategory={onInspectCategory}
                  onToggle={() => onToggleGroup(card.groupId)}
                  style={style}
                />
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

function HabitatClusterHeading({
  cardCount,
  grouping,
}: {
  cardCount: number
  grouping: IdealHabitatGrouping
}) {
  const detail = `${cardCount} ${cardCount === 1 ? 'group' : 'groups'}`

  return (
    <Box
      component="h4"
      sx={{ alignItems: 'center', display: 'flex', gap: 1, m: 0, minWidth: 0 }}
    >
      {grouping.habitat ? (
        <IdealHabitatBadge detail={detail} habitat={grouping.habitat} />
      ) : (
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
            {grouping.label}
          </Typography>
          <Typography
            component="span"
            sx={{ color: 'inherit', fontWeight: 650, opacity: 0.82 }}
            variant="caption"
          >
            {detail}
          </Typography>
        </Box>
      )}
      <Box
        aria-hidden="true"
        sx={{ borderTop: '1px solid oklch(0.87 0.018 225)', flex: 1 }}
      />
    </Box>
  )
}

function PregroupCard({
  card,
  expanded,
  onInspectCategory,
  onToggle,
  style,
}: {
  card: PregroupCardData
  expanded: boolean
  onInspectCategory: (categoryId: string) => void
  onToggle: () => void
  style: VisualStyle
}) {
  const pokemonBySlug = useMemo(
    () => new Map(card.pokemon.map((resident) => [resident.slug, resident])),
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
  const favoriteOverlaps = useMemo(
    () => getGroupFavoriteOverlaps(card.pokemon),
    [card.pokemon],
  )

  return (
    <Box
      component="article"
      sx={{
        backgroundColor: 'oklch(0.995 0.003 225)',
        border: '1px solid oklch(0.84 0.022 225)',
        borderRadius: 1.5,
        gridColumn: expanded ? '1 / -1' : 'auto',
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      <Tooltip
        arrow
        disableFocusListener={expanded}
        disableHoverListener={expanded}
        enterDelay={450}
        placement="right"
        slotProps={{
          arrow: {
            sx: { color: 'oklch(0.985 0.006 82)' },
          },
          tooltip: {
            sx: {
              backgroundColor: 'oklch(0.985 0.006 82)',
              border: '1px solid oklch(0.80 0.045 82)',
              boxShadow: '0 12px 32px oklch(0.30 0.025 225 / 0.18)',
              color: 'oklch(0.25 0.025 225)',
              maxWidth: 380,
              p: 1.25,
            },
          },
        }}
        title={
          <FavoriteOverlapPreview
            groupSize={card.pokemon.length}
            overlaps={favoriteOverlaps}
          />
        }
      >
        <ButtonBase
          aria-expanded={expanded}
          onClick={onToggle}
          sx={{
            alignItems: 'stretch',
            backgroundColor: expanded ? style.soft : 'oklch(0.975 0.009 225)',
            display: 'grid',
            gap: 1,
            minHeight: 236,
            p: 1.25,
            textAlign: 'left',
            transition: 'background-color 140ms ease-out, transform 140ms ease-out',
            width: '100%',
            '&:hover': {
              backgroundColor: expanded
                ? style.soft
                : 'oklch(0.955 0.016 225)',
              transform: 'translateY(-1px)',
            },
            '&:active': { transform: 'translateY(0)' },
            '&:focus-visible': {
              outline: `3px solid ${style.accent}`,
              outlineOffset: -3,
            },
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              component="h5"
              sx={{
                display: '-webkit-box',
                fontWeight: 850,
                overflow: 'hidden',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 2,
              }}
            >
              {card.title}
            </Typography>
            <Typography color="text.secondary" variant="caption">
              {card.subtitle}
            </Typography>
          </Box>
          <Stack
            direction="row"
            spacing={0.5}
            sx={{ flexWrap: 'wrap' }}
            useFlexGap
          >
            {card.pokemon.map((resident) => (
              <PokemonPortrait key={resident.slug} pokemon={resident} size={50} />
            ))}
          </Stack>
          {habitatSummaries.length > 0 && (
            <Box sx={{ display: 'grid', gap: 0.25 }}>
              <Typography
                color="text.secondary"
                sx={{ fontWeight: 750 }}
                variant="caption"
              >
                Ideal habitats
              </Typography>
              <Stack
                direction="row"
                spacing={0.5}
                sx={{ flexWrap: 'wrap' }}
                useFlexGap
              >
                {habitatSummaries.map((summary) => (
                  <IdealHabitatBadge
                    groupSize={card.pokemon.length}
                    habitat={summary.habitat}
                    key={summary.habitat.idealHabitatId}
                    residentCount={summary.residentCount}
                  />
                ))}
              </Stack>
            </Box>
          )}
          {abilitySummaries.length > 0 && (
            <Box sx={{ display: 'grid', gap: 0.25 }}>
              <Typography
                color="text.secondary"
                sx={{ fontWeight: 750 }}
                variant="caption"
              >
                Abilities
              </Typography>
              <Stack
                direction="row"
                spacing={0.5}
                sx={{ flexWrap: 'wrap' }}
                useFlexGap
              >
                {abilitySummaries.map((summary) => (
                  <AbilityBadge
                    ability={summary.ability}
                    groupSize={card.pokemon.length}
                    key={summary.ability.slug}
                    residentCount={summary.residentCount}
                  />
                ))}
              </Stack>
            </Box>
          )}
          <Box
            sx={{
              alignItems: 'center',
              alignSelf: 'end',
              display: 'flex',
              gap: 0.5,
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <Typography color="text.secondary" variant="caption">
              Favorite overlap · hover or open
            </Typography>
            <ExpandMoreRoundedIcon
              sx={{
                color: 'text.secondary',
                transform: expanded ? 'rotate(180deg)' : 'none',
                transition: 'transform 150ms ease-out',
              }}
            />
          </Box>
        </ButtonBase>
      </Tooltip>

      <Collapse in={expanded} unmountOnExit>
        <Box
          sx={{
            borderTop: '1px solid oklch(0.87 0.018 225)',
            display: 'grid',
            gap: 2,
            p: { xs: 1.25, sm: 1.5 },
          }}
        >
          <FavoriteOverlapDetails
            groupSize={card.pokemon.length}
            onInspectCategory={onInspectCategory}
            overlaps={favoriteOverlaps}
            pokemonBySlug={pokemonBySlug}
          />

          {card.compatibility.multiCategoryOverlapItems.length > 0 && (
            <SharedItemList
              description="These items connect multiple favorite categories represented across the group."
              groupSize={card.pokemon.length}
              items={card.compatibility.multiCategoryOverlapItems}
              pokemonBySlug={pokemonBySlug}
              title="Multi-category overlap items"
            />
          )}

          <Box
            component="details"
            sx={{ borderTop: '1px solid oklch(0.87 0.018 225)', pt: 1 }}
          >
            <Typography
              component="summary"
              sx={{
                cursor: 'pointer',
                fontWeight: 850,
                minHeight: 44,
                py: 1,
              }}
              variant="subtitle2"
            >
              Individual resident details
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gap: 1,
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
                pt: 1,
              }}
            >
              {card.pokemon.map((resident) => (
                <PokemonTraitPanel
                  key={resident.slug}
                  onInspectCategory={onInspectCategory}
                  pokemon={resident}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </Collapse>
    </Box>
  )
}

type PregroupCardData = {
  compatibility: GroupCompatibilityAnalysis
  groupId: string
  pokemon: RegionRosterPokemon[]
  subtitle: string
  title: string
}

function FavoriteOverlapPreview({
  groupSize,
  overlaps,
}: {
  groupSize: number
  overlaps: FavoriteCategoryOverlap[]
}) {
  const visibleOverlaps = overlaps.slice(0, 4)

  return (
    <Box sx={{ display: 'grid', gap: 0.75, minWidth: 260 }}>
      <Box sx={{ display: 'grid', gap: 0.125 }}>
        <Typography sx={{ fontWeight: 850 }} variant="subtitle2">
          Favorite overlap
        </Typography>
        <Typography color="text.secondary" variant="caption">
          Shared by at least two residents
        </Typography>
      </Box>

      {groupSize < 2 ? (
        <Typography color="text.secondary" variant="body2">
          Favorite overlap starts when a group has two residents.
        </Typography>
      ) : visibleOverlaps.length === 0 ? (
        <Typography color="text.secondary" variant="body2">
          No favorite categories are shared by two residents.
        </Typography>
      ) : (
        visibleOverlaps.map((overlap) => (
          <Box
            key={overlap.category.favoriteId}
            sx={{
              borderTop: '1px solid oklch(0.88 0.024 82)',
              display: 'grid',
              gap: 0.125,
              pt: 0.625,
            }}
          >
            <Box
              sx={{
                alignItems: 'baseline',
                display: 'flex',
                gap: 0.75,
                justifyContent: 'space-between',
              }}
            >
              <Typography sx={{ fontWeight: 800 }} variant="body2">
                {overlap.category.name}
              </Typography>
              <Typography color="text.secondary" variant="caption">
                {overlap.residentCount}/{groupSize}
              </Typography>
            </Box>
            <Typography color="text.secondary" variant="caption">
              {overlap.items.length > 0
                ? `${overlap.items
                    .slice(0, 3)
                    .map((entry) => entry.item.itemName)
                    .join(', ')}${overlap.items.length > 3 ? ` +${overlap.items.length - 3}` : ''}`
                : 'No exact cataloged items overlap'}
            </Typography>
          </Box>
        ))
      )}

      {overlaps.length > visibleOverlaps.length && (
        <Typography color="text.secondary" variant="caption">
          +{overlaps.length - visibleOverlaps.length} more shared categories
        </Typography>
      )}
      <Typography sx={{ fontWeight: 750 }} variant="caption">
        Click to open the full overlap.
      </Typography>
    </Box>
  )
}

function FavoriteOverlapDetails({
  groupSize,
  onInspectCategory,
  overlaps,
  pokemonBySlug,
}: {
  groupSize: number
  onInspectCategory: (categoryId: string) => void
  overlaps: FavoriteCategoryOverlap[]
  pokemonBySlug: Map<string, RegionRosterPokemon>
}) {
  return (
    <Box sx={{ display: 'grid', gap: 1 }}>
      <Box sx={{ display: 'grid', gap: 0.125 }}>
        <Typography component="h6" sx={{ fontWeight: 850 }} variant="subtitle1">
          Favorite item overlap
        </Typography>
        <Typography color="text.secondary" variant="caption">
          Categories shared by two or more residents, with the exact items those
          category preferences put in common.
        </Typography>
      </Box>

      {groupSize < 2 ? (
        <Typography color="text.secondary" variant="body2">
          Add another resident to compare favorite categories and items.
        </Typography>
      ) : overlaps.length === 0 ? (
        <Typography color="text.secondary" variant="body2">
          This group has no favorite categories shared by two residents.
        </Typography>
      ) : (
        <Box sx={{ display: 'grid' }}>
          {overlaps.map((overlap) => (
            <FavoriteOverlapCategory
              groupSize={groupSize}
              key={overlap.category.favoriteId}
              onInspect={() => onInspectCategory(overlap.category.favoriteId)}
              overlap={overlap}
              pokemonBySlug={pokemonBySlug}
            />
          ))}
        </Box>
      )}
    </Box>
  )
}

function FavoriteOverlapCategory({
  groupSize,
  onInspect,
  overlap,
  pokemonBySlug,
}: {
  groupSize: number
  onInspect: () => void
  overlap: FavoriteCategoryOverlap
  pokemonBySlug: Map<string, RegionRosterPokemon>
}) {
  const [showAll, setShowAll] = useState(false)
  const visibleItems = showAll
    ? overlap.items
    : overlap.items.slice(0, itemPreviewCount)

  return (
    <Box
      component="section"
      sx={{
        borderTop: '1px solid oklch(0.87 0.018 225)',
        display: 'grid',
        gap: 0.75,
        py: 1.25,
      }}
    >
      <Box
        sx={{
          alignItems: { xs: 'start', sm: 'center' },
          display: 'grid',
          gap: 0.75,
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'minmax(0, 1fr) auto' },
        }}
      >
        <Box sx={{ display: 'grid', gap: 0.125, minWidth: 0 }}>
          <Box sx={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            <Typography component="h6" sx={{ fontWeight: 850 }} variant="subtitle2">
              {overlap.category.name}
            </Typography>
            <Chip
              color={overlap.residentCount === groupSize ? 'secondary' : 'default'}
              label={`${overlap.residentCount}/${groupSize} residents`}
              size="small"
              variant={overlap.residentCount === groupSize ? 'filled' : 'outlined'}
            />
          </Box>
          <Typography color="text.secondary" variant="caption">
            {getResidentNames(overlap.residentSlugs, pokemonBySlug)}
          </Typography>
        </Box>
        <Button
          color="inherit"
          onClick={onInspect}
          size="small"
          sx={{ justifySelf: { xs: 'start', sm: 'end' }, minHeight: 44, px: 1.25 }}
          variant="outlined"
        >
          Browse all {overlap.category.itemCount} items
        </Button>
      </Box>

      {visibleItems.length > 0 ? (
        <Box
          sx={{
            display: 'grid',
            gap: 0.75,
            gridTemplateColumns:
              'repeat(auto-fit, minmax(min(100%, 210px), 1fr))',
          }}
        >
          {visibleItems.map((entry) => (
            <FavoriteOverlapItem
              entry={entry}
              groupSize={groupSize}
              key={entry.item.itemId}
              pokemonBySlug={pokemonBySlug}
            />
          ))}
        </Box>
      ) : (
        <Typography color="text.secondary" variant="body2">
          The category is shared, but no exact cataloged items overlap.
        </Typography>
      )}

      {overlap.items.length > itemPreviewCount && (
        <Button
          color="inherit"
          onClick={() => setShowAll((current) => !current)}
          size="small"
          sx={{ justifySelf: 'start', minHeight: 44, px: 1.5 }}
          variant="text"
        >
          {showAll ? 'Show fewer' : `Show all ${overlap.items.length} overlapping items`}
        </Button>
      )}
    </Box>
  )
}

function FavoriteOverlapItem({
  entry,
  groupSize,
  pokemonBySlug,
}: {
  entry: FavoriteItemOverlap
  groupSize: number
  pokemonBySlug: Map<string, RegionRosterPokemon>
}) {
  return (
    <Box
      sx={{
        alignItems: 'start',
        display: 'grid',
        gap: 0.625,
        gridTemplateColumns: '36px minmax(0, 1fr) auto',
        minHeight: 56,
        py: 0.5,
      }}
    >
      <FavoriteItemPicture item={entry.item} />
      <Box sx={{ display: 'grid', gap: 0.125, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 750 }} variant="body2">
          {entry.item.itemName}
        </Typography>
        <Typography color="text.secondary" variant="caption">
          {getResidentNames(entry.residentSlugs, pokemonBySlug)}
        </Typography>
      </Box>
      <Chip
        color={entry.residentCount === groupSize ? 'secondary' : 'default'}
        label={`${entry.residentCount}/${groupSize}`}
        size="small"
      />
    </Box>
  )
}

type HabitatCardCluster = {
  grouping: IdealHabitatGrouping
  cards: PregroupCardData[]
}

function getHabitatCardClusters(cards: PregroupCardData[]): HabitatCardCluster[] {
  const clustersById = new Map<string, HabitatCardCluster>()

  cards.forEach((card) => {
    const grouping = getIdealHabitatGrouping(card.pokemon)
    const cluster = clustersById.get(grouping.groupingId) ?? {
      grouping,
      cards: [],
    }
    cluster.cards.push(card)
    clustersById.set(grouping.groupingId, cluster)
  })

  return Array.from(clustersById.values())
    .map((cluster) => ({
      ...cluster,
      cards: cluster.cards.sort(
        (left, right) =>
          right.pokemon.length - left.pokemon.length ||
          left.title.localeCompare(right.title),
      ),
    }))
    .sort(
      (left, right) =>
        left.grouping.sortOrder - right.grouping.sortOrder ||
        left.grouping.label.localeCompare(right.grouping.label),
    )
}

function PokemonTraitPanel({
  onInspectCategory,
  pokemon,
}: {
  onInspectCategory: (categoryId: string) => void
  pokemon: RegionRosterPokemon
}) {
  const itemCategories = pokemon.favorites.flatMap((favorite) => {
    const category = favoriteCategoryById.get(favorite.favoriteId)
    return category && category.kind !== 'flavor' && category.kind !== 'none'
      ? [category]
      : []
  })
  const flavors = pokemon.favorites.flatMap((favorite) => {
    const category = favoriteCategoryById.get(favorite.favoriteId)
    return category?.kind === 'flavor' ? [category] : []
  })
  const comfort = comfortStyles[pokemon.comfortLevel]

  return (
    <Box
      sx={{
        backgroundColor: 'oklch(0.98 0.008 225)',
        display: 'grid',
        gap: 1,
        minWidth: 0,
        p: 1,
      }}
    >
      <Box
        sx={{
          alignItems: 'center',
          display: 'grid',
          gap: 0.75,
          gridTemplateColumns: '52px minmax(0, 1fr)',
        }}
      >
        <PokemonPortrait pokemon={pokemon} size={50} />
        <Box sx={{ minWidth: 0 }}>
          <Typography component="h6" sx={{ fontWeight: 850 }}>
            {pokemon.name}
          </Typography>
          <Typography sx={{ color: comfort.deep }} variant="caption">
            {comfort.label} in this region
          </Typography>
        </Box>
      </Box>
      <TraitLine
        label="Ideal habitat"
        values={[pokemon.idealHabitat?.name ?? 'No ideal habitat listed']}
      />
      <TraitLine
        label="Abilities"
        values={pokemon.specialties.length > 0
          ? pokemon.specialties.map((ability) => ability.name)
          : ['No abilities listed']}
      />
      <TraitCategoryLine
        categories={itemCategories}
        emptyLabel="No favorite categories listed"
        label="Favorite item categories"
        onInspect={onInspectCategory}
      />
      <TraitCategoryLine
        categories={flavors}
        emptyLabel="No food flavor listed"
        label="Favorite food flavor"
        onInspect={onInspectCategory}
      />
    </Box>
  )
}

function TraitLine({ label, values }: { label: string; values: string[] }) {
  return (
    <Box sx={{ display: 'grid', gap: 0.25 }}>
      <Typography color="text.secondary" variant="caption">
        {label}
      </Typography>
      <Typography variant="body2">{values.join(', ')}</Typography>
    </Box>
  )
}

function TraitCategoryLine({
  categories,
  emptyLabel,
  label,
  onInspect,
}: {
  categories: FavoriteCategory[]
  emptyLabel: string
  label: string
  onInspect: (categoryId: string) => void
}) {
  return (
    <Box sx={{ display: 'grid', gap: 0.375 }}>
      <Typography color="text.secondary" variant="caption">
        {label}
      </Typography>
      {categories.length > 0 ? (
        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }} useFlexGap>
          {categories.map((category) => (
            <Button
              color="inherit"
              key={category.favoriteId}
              onClick={() => onInspect(category.favoriteId)}
              size="small"
              sx={{ minHeight: 44, px: 0.75, py: 0.25 }}
              variant="outlined"
            >
              {category.name} · {category.itemCount}
            </Button>
          ))}
        </Stack>
      ) : (
        <Typography color="text.secondary" variant="body2">
          {emptyLabel}
        </Typography>
      )}
    </Box>
  )
}

function SharedItemList({
  description,
  groupSize,
  items,
  pokemonBySlug,
  title,
}: {
  description: string
  groupSize: number
  items: SharedItemCompatibility[]
  pokemonBySlug: Map<string, RegionRosterPokemon>
  title: string
}) {
  const [showAll, setShowAll] = useState(false)
  const visibleItems = showAll ? items : items.slice(0, itemPreviewCount)

  return (
    <Box sx={{ display: 'grid', gap: 0.75 }}>
      <Box sx={{ display: 'grid', gap: 0.125 }}>
        <Typography component="h6" sx={{ fontWeight: 850 }} variant="subtitle2">
          {title} · {items.length}
        </Typography>
        <Typography color="text.secondary" variant="caption">
          {description}
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'grid',
          gap: 0.75,
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
        }}
      >
        {visibleItems.map((entry) => (
          <SharedItemRow
            entry={entry}
            groupSize={groupSize}
            key={entry.item.itemId}
            pokemonBySlug={pokemonBySlug}
          />
        ))}
      </Box>
      {items.length > itemPreviewCount && (
        <Button
          color="inherit"
          onClick={() => setShowAll((current) => !current)}
          size="small"
          sx={{ justifySelf: 'start', minHeight: 44, px: 1.5 }}
          variant="text"
        >
          {showAll ? 'Show fewer' : `Show all ${items.length} items`}
        </Button>
      )}
    </Box>
  )
}

function SharedItemRow({
  entry,
  groupSize,
  pokemonBySlug,
}: {
  entry: SharedItemCompatibility
  groupSize: number
  pokemonBySlug: Map<string, RegionRosterPokemon>
}) {
  const categoryPath = entry.contributingCategories
    .map(
      (contribution) =>
        `${contribution.category.name} (${getResidentNames(contribution.residentSlugs, pokemonBySlug)})`,
    )
    .join(' + ')
  const catalogCategoryCount =
    favoriteCategoriesByItemId.get(entry.item.itemId)?.length ?? 0

  return (
    <Box
      sx={{
        alignItems: 'start',
        border: '1px solid oklch(0.87 0.018 225)',
        borderRadius: 1,
        display: 'grid',
        gap: 0.75,
        gridTemplateColumns: '36px minmax(0, 1fr) auto',
        minHeight: 72,
        p: 0.75,
      }}
    >
      <FavoriteItemPicture item={entry.item} />
      <Box sx={{ display: 'grid', gap: 0.125, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 750 }} variant="body2">
          {entry.item.itemName}
        </Typography>
        {entry.item.description && (
          <Typography color="text.secondary" variant="caption">
            {entry.item.description}
          </Typography>
        )}
        <Typography color="text.secondary" variant="caption">
          {categoryPath}
          {catalogCategoryCount > 1
            ? ` · ${catalogCategoryCount} categories total`
            : ''}
        </Typography>
      </Box>
      <Chip
        color={entry.sharedByAll ? 'secondary' : 'default'}
        label={`${entry.residentCount}/${groupSize}`}
        size="small"
      />
    </Box>
  )
}

function CategoryCatalogInspector({
  category,
  onClose,
}: {
  category: FavoriteCategory
  onClose: () => void
}) {
  const [searchState, setSearchState] = useState({
    categoryId: category.favoriteId,
    query: '',
  })
  const query =
    searchState.categoryId === category.favoriteId ? searchState.query : ''
  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase()
    if (!normalizedQuery) return category.items
    return category.items.filter((item) =>
      [item.itemName, item.description]
        .filter(Boolean)
        .some((value) => value!.toLocaleLowerCase().includes(normalizedQuery)),
    )
  }, [category.items, query])

  return (
    <Box
      component="aside"
      aria-labelledby="favorite-category-inspector-heading"
      sx={{
        alignSelf: 'start',
        backgroundColor: 'oklch(0.99 0.004 82)',
        border: '1px solid oklch(0.83 0.03 82)',
        borderRadius: 1.5,
        display: 'grid',
        gap: 1,
        boxShadow: { xs: '0 10px 28px oklch(0.32 0.03 225 / 0.14)', xl: 'none' },
        maxHeight: { xs: 'min(60vh, 520px)', xl: 'calc(100vh - 112px)' },
        minWidth: 0,
        overflow: 'hidden',
        position: 'sticky',
        top: { xs: 72, xl: 88 },
        zIndex: 'var(--z-sticky)',
      }}
    >
      <Box
        sx={{
          alignItems: 'start',
          display: 'grid',
          gap: 0.75,
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          px: 1.25,
          pt: 1.25,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            component="h3"
            id="favorite-category-inspector-heading"
            sx={{ fontWeight: 850 }}
            variant="h6"
          >
            {category.name}
          </Typography>
          <Typography color="text.secondary" variant="caption">
            {category.itemCount} cataloged {category.itemCount === 1 ? 'item' : 'items'}
          </Typography>
        </Box>
        <IconButton
          aria-label="Close item catalog"
          onClick={onClose}
          size="small"
          sx={{ minHeight: 44, minWidth: 44 }}
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </Box>
      <TextField
        autoFocus
        label={`Search ${category.name}`}
        onChange={(event) =>
          setSearchState({
            categoryId: category.favoriteId,
            query: event.target.value,
          })
        }
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
        sx={{ mx: 1.25 }}
        value={query}
      />
      <Box
        aria-label={`${category.name} items`}
        sx={{
          display: 'grid',
          gap: 0.5,
          maxHeight: { xs: 420, xl: 'none' },
          overflowY: 'auto',
          px: 1.25,
          pb: 1.25,
          scrollbarWidth: 'thin',
        }}
      >
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <CategoryItemRow item={item} key={item.itemId} />
          ))
        ) : (
          <Typography color="text.secondary" sx={{ py: 1 }} variant="body2">
            {category.items.length === 0
              ? 'No cataloged items are available for this category yet.'
              : `No items match “${query}”.`}
          </Typography>
        )}
      </Box>
    </Box>
  )
}

function CategoryItemRow({ item }: { item: FavoriteItem }) {
  const itemCategories = favoriteCategoriesByItemId.get(item.itemId) ?? []
  const categoryCount = itemCategories.length

  return (
    <Box
      sx={{
        alignItems: 'start',
        borderBottom: '1px solid oklch(0.90 0.014 82)',
        display: 'grid',
        gap: 0.75,
        gridTemplateColumns: '36px minmax(0, 1fr) auto',
        minHeight: 48,
        py: 0.5,
      }}
    >
      <FavoriteItemPicture item={item} />
      <Box sx={{ display: 'grid', gap: 0.125, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 750 }} variant="body2">
          {item.itemName}
        </Typography>
        {item.description && (
          <Typography color="text.secondary" variant="caption">
            {item.description}
          </Typography>
        )}
        {categoryCount > 1 && (
          <Typography color="text.secondary" variant="caption">
            Cataloged in {itemCategories.map((category) => category.name).join(', ')}
          </Typography>
        )}
      </Box>
      {categoryCount > 1 && (
        <Chip label={`${categoryCount} categories`} size="small" variant="outlined" />
      )}
    </Box>
  )
}

function getFamilyName(family: EvolutionLinePregroup) {
  if (family.pokemon.length === 1) return family.pokemon[0].name
  return family.pokemon.map((resident) => resident.name).join(' · ')
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
