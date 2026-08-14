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
  type CompatibilityCoverage,
  type EvolutionLinePregroup,
  type GroupCompatibilityAnalysis,
  type SharedItemCompatibility,
} from './groupPlannerModel'
import { comfortStyles, type VisualStyle } from './regionRosterConfig'
import {
  FavoriteItemPicture,
  IdealHabitatBadge,
  PokemonPortrait,
} from './components/PlannerVisuals'
import {
  getIdealHabitatSummaries,
  getResidentNames,
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
  const normalizedQuery = query.trim().toLocaleLowerCase()
  const visibleFamilies = useMemo(
    () =>
      families
        .filter(
          (family) =>
            !normalizedQuery ||
            family.pokemon.some((resident) =>
              [
                resident.name,
                resident.idealHabitat?.name,
                ...resident.specialties.map((ability) => ability.name),
                ...resident.favorites.map((favorite) => favorite.name),
              ]
                .filter(Boolean)
                .some((value) =>
                  value!.toLocaleLowerCase().includes(normalizedQuery),
                ),
            ),
        )
        .sort(
          (left, right) =>
            right.pokemon.length - left.pokemon.length ||
            getFamilyName(left).localeCompare(getFamilyName(right)),
        ),
    [families, normalizedQuery],
  )
  const multiMemberFamilies = visibleFamilies.filter(
    (family) => family.pokemon.length > 1,
  )
  const singletons = visibleFamilies.filter(
    (family) => family.pokemon.length === 1,
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
            These families are derived from the roster, not saved homes. Open a family to compare every resident and inspect its item catalogs.
          </Typography>
          <Stack direction="row" spacing={0.75} sx={{ pt: 0.5 }} useFlexGap>
            <Chip label={`${multiMemberFamilies.length} shared lines`} size="small" />
            <Chip label={`${singletons.length} solo residents`} size="small" />
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
          {multiMemberFamilies.length > 0 && (
            <FamilySection
              expandedFamilyIds={expandedFamilyIds}
              families={multiMemberFamilies}
              onInspectCategory={inspectCategory}
              onToggleFamily={toggleFamily}
              style={style}
              title="Roster evolution lines"
            />
          )}

          {singletons.length > 0 && (
            <FamilySection
              expandedFamilyIds={expandedFamilyIds}
              families={singletons}
              onInspectCategory={inspectCategory}
              onToggleFamily={toggleFamily}
              style={style}
              subtitle="No other member of the evolution family currently lives in this region."
              title="Solo residents"
            />
          )}

          {visibleFamilies.length === 0 && (
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
  return (
    <Box component="section" sx={{ display: 'grid', gap: 1.25, minWidth: 0 }}>
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
      <Box sx={{ display: 'grid', gap: 1.25, minWidth: 0 }}>
        {families.map((family) => (
          <EvolutionFamilyCard
            expanded={expandedFamilyIds.has(family.familyId)}
            family={family}
            key={family.familyId}
            onInspectCategory={onInspectCategory}
            onToggle={() => onToggleFamily(family.familyId)}
            style={style}
          />
        ))}
      </Box>
    </Box>
  )
}

function EvolutionFamilyCard({
  expanded,
  family,
  onInspectCategory,
  onToggle,
  style,
}: {
  expanded: boolean
  family: EvolutionLinePregroup
  onInspectCategory: (categoryId: string) => void
  onToggle: () => void
  style: VisualStyle
}) {
  const pokemonBySlug = useMemo(
    () => new Map(family.pokemon.map((resident) => [resident.slug, resident])),
    [family.pokemon],
  )
  const absentRelativeCount = Math.max(
    0,
    family.canonicalPokemonSlugs.length - family.pokemon.length,
  )
  const habitatSummaries = useMemo(
    () => getIdealHabitatSummaries(family.pokemon),
    [family.pokemon],
  )

  return (
    <Box
      component="article"
      sx={{
        backgroundColor: 'oklch(0.995 0.003 225)',
        border: '1px solid oklch(0.84 0.022 225)',
        borderRadius: 1.5,
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      <ButtonBase
        aria-expanded={expanded}
        onClick={onToggle}
        sx={{
          alignItems: 'center',
          backgroundColor: expanded ? style.soft : 'oklch(0.975 0.009 225)',
          display: 'grid',
          gap: 1,
          gridTemplateColumns: { xs: 'minmax(0, 1fr) auto', md: 'minmax(220px, 0.8fr) minmax(260px, 1.2fr) auto' },
          justifyItems: 'start',
          minHeight: 72,
          px: { xs: 1.25, sm: 1.5 },
          py: 1,
          textAlign: 'left',
          width: '100%',
          '&:focus-visible': {
            outline: `3px solid ${style.accent}`,
            outlineOffset: -3,
          },
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography component="h4" sx={{ fontWeight: 850 }}>
            {getFamilyName(family)}
          </Typography>
          <Typography color="text.secondary" variant="caption">
            {family.pokemon.length === 1
              ? absentRelativeCount > 0
                ? `${absentRelativeCount} relative${absentRelativeCount === 1 ? '' : 's'} elsewhere`
                : 'No known evolutions'
              : family.isCompleteFamily
                ? 'Complete line in this region'
                : `${absentRelativeCount} relative${absentRelativeCount === 1 ? '' : 's'} elsewhere`}
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'grid',
            gap: 0.625,
            gridColumn: { xs: '1 / -1', md: 'auto' },
            minWidth: 0,
          }}
        >
          <Stack
            direction="row"
            spacing={0.5}
            sx={{ flexWrap: 'wrap' }}
            useFlexGap
          >
            {family.pokemon.map((resident) => (
              <Tooltip key={resident.slug} title={resident.name}>
                <Box>
                  <PokemonPortrait pokemon={resident} size={46} />
                </Box>
              </Tooltip>
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
                    groupSize={family.pokemon.length}
                    habitat={summary.habitat}
                    key={summary.habitat.idealHabitatId}
                    residentCount={summary.residentCount}
                  />
                ))}
              </Stack>
            </Box>
          )}
        </Box>
        <ExpandMoreRoundedIcon
          sx={{
            color: 'text.secondary',
            transform: expanded ? 'rotate(180deg)' : 'none',
            transition: 'transform 150ms ease-out',
          }}
        />
      </ButtonBase>

      {family.pokemon.length > 1 && (
        <CommonGroundSummary
          analysis={family.compatibility}
          groupSize={family.pokemon.length}
          onInspectCategory={onInspectCategory}
          pokemonBySlug={pokemonBySlug}
        />
      )}

      <Collapse in={expanded} unmountOnExit>
        <Box
          sx={{
            borderTop: '1px solid oklch(0.87 0.018 225)',
            display: 'grid',
            gap: 2,
            p: { xs: 1.25, sm: 1.5 },
          }}
        >
          <Box sx={{ display: 'grid', gap: 1 }}>
            <Typography component="h5" sx={{ fontWeight: 850 }} variant="subtitle2">
              Resident comparison
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gap: 1,
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
              }}
            >
              {family.pokemon.map((resident) => (
                <PokemonTraitPanel
                  key={resident.slug}
                  onInspectCategory={onInspectCategory}
                  pokemon={resident}
                />
              ))}
            </Box>
          </Box>

          {family.pokemon.length > 1 && (
            <SharedItemSections
              analysis={family.compatibility}
              groupSize={family.pokemon.length}
              pokemonBySlug={pokemonBySlug}
            />
          )}
        </Box>
      </Collapse>
    </Box>
  )
}

function CommonGroundSummary({
  analysis,
  groupSize,
  onInspectCategory,
  pokemonBySlug,
}: {
  analysis: GroupCompatibilityAnalysis
  groupSize: number
  onInspectCategory: (categoryId: string) => void
  pokemonBySlug: Map<string, RegionRosterPokemon>
}) {
  const commonRows: {
    label: string
    values: CoverageValue[]
  }[] = [
    {
      label: 'Habitat',
      values: analysis.habitats.map((entry) => ({
        coverage: entry,
        id: entry.habitat.idealHabitatId,
        label: entry.habitat.name,
      })),
    },
    {
      label: 'Abilities',
      values: analysis.abilities.map((entry) => ({
        coverage: entry,
        id: entry.ability.slug,
        label: entry.ability.name,
      })),
    },
    {
      label: 'Favorite categories',
      values: analysis.itemCategories.map((entry) => ({
        categoryId: entry.category.favoriteId,
        coverage: entry,
        id: entry.category.favoriteId,
        label: entry.category.name,
      })),
    },
    {
      label: 'Food flavor',
      values: analysis.flavors.map((entry) => ({
        categoryId: entry.favorite.favoriteId,
        coverage: entry,
        id: entry.favorite.favoriteId,
        label: entry.favorite.name.replace(/ flavors$/i, ''),
      })),
    },
  ]

  return (
    <Box
      aria-label="Family common ground"
      sx={{
        backgroundColor: 'oklch(0.985 0.006 155)',
        borderTop: '1px solid oklch(0.87 0.018 225)',
        display: 'grid',
        gap: 0.75,
        p: { xs: 1, sm: 1.25 },
      }}
    >
      <Box sx={{ alignItems: 'center', display: 'flex', gap: 0.75 }}>
        <HubRoundedIcon color="primary" sx={{ fontSize: 18 }} />
        <Typography sx={{ fontWeight: 850 }} variant="caption">
          Common ground
        </Typography>
        <Typography color="text.secondary" variant="caption">
          2+ residents
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'grid',
          gap: 0.75,
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        }}
      >
        {commonRows.map((row) => (
          <Box key={row.label} sx={{ display: 'grid', gap: 0.375, minWidth: 0 }}>
            <Typography color="text.secondary" variant="caption">
              {row.label}
            </Typography>
            <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }} useFlexGap>
              {row.values.length > 0 ? (
                row.values.map((value) => (
                  <Box key={value.id} sx={{ display: 'grid', gap: 0.125 }}>
                    <Chip
                      clickable={Boolean(value.categoryId)}
                      color={value.coverage.sharedByAll ? 'primary' : 'default'}
                      label={`${value.label} ${value.coverage.residentCount}/${groupSize}`}
                      onClick={
                        value.categoryId
                          ? () => onInspectCategory(value.categoryId!)
                          : undefined
                      }
                      size="small"
                      sx={{ justifySelf: 'start', minHeight: 44 }}
                      variant={value.coverage.sharedByAll ? 'filled' : 'outlined'}
                    />
                    <Typography color="text.secondary" variant="caption">
                      {getResidentNames(
                        value.coverage.residentSlugs,
                        pokemonBySlug,
                      )}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography color="text.secondary" variant="caption">
                  No overlap
                </Typography>
              )}
            </Stack>
          </Box>
        ))}
      </Box>
      {(analysis.directSharedItems.length > 0 ||
        analysis.multiCategoryOverlapItems.length > 0) && (
        <Typography color="text.secondary" variant="caption">
          {analysis.directSharedItems.length} directly shared items ·{' '}
          {analysis.multiCategoryOverlapItems.length} multi-category overlaps
        </Typography>
      )}
    </Box>
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

function SharedItemSections({
  analysis,
  groupSize,
  pokemonBySlug,
}: {
  analysis: GroupCompatibilityAnalysis
  groupSize: number
  pokemonBySlug: Map<string, RegionRosterPokemon>
}) {
  const bridgeItemIds = new Set(
    analysis.multiCategoryOverlapItems.map((entry) => entry.item.itemId),
  )
  const directOnlyItems = analysis.directSharedItems.filter(
    (entry) => !bridgeItemIds.has(entry.item.itemId),
  )

  if (
    analysis.multiCategoryOverlapItems.length === 0 &&
    directOnlyItems.length === 0
  ) {
    return (
      <Typography color="text.secondary" variant="body2">
        This family has no cataloged favorite items shared by two residents.
      </Typography>
    )
  }

  return (
    <Box sx={{ display: 'grid', gap: 1.5 }}>
      {analysis.multiCategoryOverlapItems.length > 0 && (
        <SharedItemList
          description="These items belong to multiple favorite categories represented across the family."
          groupSize={groupSize}
          items={analysis.multiCategoryOverlapItems}
          pokemonBySlug={pokemonBySlug}
          title="Multi-category overlap items"
        />
      )}
      {directOnlyItems.length > 0 && (
        <SharedItemList
          description="Residents reach these items through at least one category they share directly."
          groupSize={groupSize}
          items={directOnlyItems}
          pokemonBySlug={pokemonBySlug}
          title="Other shared items"
        />
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
        <Typography component="h5" sx={{ fontWeight: 850 }} variant="subtitle2">
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

type CoverageValue = {
  categoryId?: string
  coverage: CompatibilityCoverage
  id: string
  label: string
}
