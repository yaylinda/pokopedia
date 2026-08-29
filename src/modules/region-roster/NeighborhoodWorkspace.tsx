import CleaningServicesRoundedIcon from '@mui/icons-material/CleaningServicesRounded'
import ExploreRoundedIcon from '@mui/icons-material/ExploreRounded'
import LocalFloristRoundedIcon from '@mui/icons-material/LocalFloristRounded'
import LocationCityRoundedIcon from '@mui/icons-material/LocationCityRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useMemo, type ElementType } from 'react'
import type { RegionRosterPokemon } from '../../data/currentRegionRoster'
import {
  AbilityBadge,
  IdealHabitatBadge,
  PokemonPortrait,
} from './components/PlannerVisuals'
import { getHabitatVisual } from './components/plannerHabitatVisuals'
import {
  getNeighborhoodPlan,
  type Neighborhood,
  type NeighborhoodFamily,
  type NeighborhoodPlacement,
} from './neighborhoodPlannerModel'
import {
  getAbilitySummaries,
  getIdealHabitatGrouping,
  getIdealHabitatSummaries,
} from './plannerDisplayUtils'
import type { VisualStyle } from './regionRosterConfig'

const placementOrder: NeighborhoodPlacement[] = [
  'garden',
  'main',
  'far-main',
]
const roleAbilitySlugs = new Set(['grow', 'water', 'litter', 'gather'])

type ZoneVisual = {
  label: string
  note: string
  background: string
  border: string
  foreground: string
  Icon: ElementType
}

export function NeighborhoodWorkspace({
  pokemon,
  style,
}: {
  pokemon: RegionRosterPokemon[]
  style: VisualStyle
}) {
  const plan = useMemo(() => getNeighborhoodPlan(pokemon), [pokemon])

  return (
    <Box sx={{ display: 'grid', gap: 2.5, minWidth: 0 }}>
      <NeighborhoodPlanSummary plan={plan} style={style} />

      {placementOrder.map((placement) => {
        const neighborhoods = plan.neighborhoods.filter(
          (neighborhood) => neighborhood.placement === placement,
        )

        return neighborhoods.length > 0 ? (
          <NeighborhoodZone
            key={placement}
            neighborhoods={neighborhoods}
            placement={placement}
            style={style}
          />
        ) : null
      })}
    </Box>
  )
}

function NeighborhoodPlanSummary({
  plan,
  style,
}: {
  plan: ReturnType<typeof getNeighborhoodPlan>
  style: VisualStyle
}) {
  const balanceLabel =
    plan.litterNeighborhoodCount === 0
      ? 'No litter neighborhoods'
      : plan.balancedLitterNeighborhoodCount === 1
        ? 'One litter neighborhood · Gather covered'
        : 'One litter neighborhood · Gather needed'

  return (
    <Box
      component="section"
      sx={{
        backgroundColor: 'oklch(0.985 0.008 155)',
        border: `1px solid ${style.accent}`,
        borderRadius: 1.5,
        display: 'grid',
        gap: 1.25,
        p: { xs: 1.5, sm: 2 },
      }}
    >
      <Box
        sx={{
          alignItems: { xs: 'start', md: 'center' },
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 1,
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'grid', gap: 0.25 }}>
          <Typography component="h3" sx={{ color: style.deep }} variant="h5">
            Experimental neighborhood map
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ maxWidth: '72ch' }}
            variant="body2"
          >
            Evo groups stay intact. Litter service and garden utility form two
            separate neighborhoods before the remaining habitat-led clusters;
            saved home groups are not changed.
          </Typography>
        </Box>
        <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap' }} useFlexGap>
          <Chip label={`${plan.neighborhoods.length} neighborhoods`} size="small" />
          <Chip label={`${plan.familyCount} evo groups`} size="small" />
          <Chip label={`${plan.pokemonCount} Pokémon`} size="small" />
        </Stack>
      </Box>

      <Box
        sx={{
          alignItems: 'center',
          backgroundColor:
            plan.issues.length === 0
              ? 'oklch(0.95 0.035 155)'
              : 'oklch(0.965 0.04 78)',
          border: `1px solid ${
            plan.issues.length === 0
              ? 'oklch(0.77 0.075 155)'
              : 'oklch(0.78 0.105 72)'
          }`,
          borderRadius: 1.25,
          color:
            plan.issues.length === 0
              ? 'oklch(0.34 0.085 155)'
              : 'oklch(0.38 0.10 66)',
          display: 'flex',
          gap: 0.75,
          px: 1,
          py: 0.75,
        }}
      >
        {plan.issues.length === 0 ? (
          <CleaningServicesRoundedIcon fontSize="small" />
        ) : (
          <WarningAmberRoundedIcon fontSize="small" />
        )}
        <Typography sx={{ color: 'inherit', fontWeight: 800 }} variant="body2">
          {balanceLabel}
        </Typography>
      </Box>

      {plan.issues.map((issue) => (
        <Typography color="text.secondary" key={issue.neighborhoodId} variant="caption">
          {issue.message} Bring a Gather evo group into the region or move its
          littering families before treating this proposal as final.
        </Typography>
      ))}
    </Box>
  )
}

function NeighborhoodZone({
  neighborhoods,
  placement,
  style,
}: {
  neighborhoods: Neighborhood[]
  placement: NeighborhoodPlacement
  style: VisualStyle
}) {
  const visual = getZoneVisual(placement, style)
  const ZoneIcon = visual.Icon

  return (
    <Box
      component="section"
      sx={{
        alignItems: 'start',
        display: 'grid',
        gap: { xs: 1.25, lg: 2 },
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: '180px minmax(0, 1fr)' },
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          alignItems: 'start',
          color: visual.foreground,
          display: 'grid',
          gap: 0.5,
          gridTemplateColumns: { xs: '32px minmax(0, 1fr)', lg: '1fr' },
        }}
      >
        <Box
          sx={{
            alignItems: 'center',
            backgroundColor: visual.background,
            border: `1px solid ${visual.border}`,
            borderRadius: 1,
            display: 'flex',
            height: 32,
            justifyContent: 'center',
            width: 32,
          }}
        >
          <ZoneIcon sx={{ fontSize: 20 }} />
        </Box>
        <Box sx={{ display: 'grid', gap: 0.25 }}>
          <Typography component="h3" sx={{ color: 'inherit', fontWeight: 850 }} variant="h6">
            {visual.label}
          </Typography>
          <Typography color="text.secondary" variant="caption">
            {visual.note}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          alignItems: 'start',
          display: 'grid',
          gap: 1.25,
          gridTemplateColumns:
            'repeat(auto-fit, minmax(min(100%, 390px), 1fr))',
          minWidth: 0,
        }}
      >
        {neighborhoods.map((neighborhood) => (
          <NeighborhoodCard
            key={neighborhood.neighborhoodId}
            neighborhood={neighborhood}
            style={style}
            zoneVisual={visual}
          />
        ))}
      </Box>
    </Box>
  )
}

function NeighborhoodCard({
  neighborhood,
  style,
  zoneVisual,
}: {
  neighborhood: Neighborhood
  style: VisualStyle
  zoneVisual: ZoneVisual
}) {
  const habitatVisual = getHabitatVisual(
    neighborhood.habitatGrouping.habitat?.idealHabitatId,
  )
  const roleAbilities = getAbilitySummaries(neighborhood.pokemon).filter(
    (summary) => roleAbilitySlugs.has(summary.ability.slug),
  )
  const primaryHabitatCount = neighborhood.habitatGrouping.habitat
    ? (getIdealHabitatSummaries(neighborhood.pokemon).find(
        (summary) =>
          summary.habitat.idealHabitatId ===
          neighborhood.habitatGrouping.habitat?.idealHabitatId,
      )?.residentCount ?? 0)
    : null
  const litterNeedsGatherer =
    neighborhood.littererCount > 0 && neighborhood.gathererCount === 0
  const synergyNotes = getSynergyNotes(neighborhood, primaryHabitatCount)

  return (
    <Box
      component="article"
      sx={{
        backgroundColor: 'oklch(0.995 0.003 155)',
        border: `2px solid ${
          litterNeedsGatherer ? 'oklch(0.72 0.12 60)' : habitatVisual.border
        }`,
        borderRadius: 1.5,
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          backgroundColor: habitatVisual.background,
          borderBottom: `1px solid ${habitatVisual.border}`,
          display: 'grid',
          gap: 0.875,
          p: 1.25,
        }}
      >
        <Box
          sx={{
            alignItems: 'start',
            display: 'flex',
            gap: 1,
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'grid', gap: 0.25, minWidth: 0 }}>
            <Typography
              component="h4"
              sx={{ color: habitatVisual.foreground, fontWeight: 850 }}
              variant="h6"
            >
              {neighborhood.name}
            </Typography>
            <Typography sx={{ color: habitatVisual.foreground, opacity: 0.82 }} variant="caption">
              {neighborhood.families.length} evo groups · {neighborhood.pokemon.length}{' '}
              Pokémon
            </Typography>
          </Box>
          <Chip
            label={zoneVisual.label}
            size="small"
            sx={{
              backgroundColor: zoneVisual.background,
              border: `1px solid ${zoneVisual.border}`,
              color: zoneVisual.foreground,
              flex: '0 0 auto',
            }}
          />
        </Box>

        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }} useFlexGap>
          {neighborhood.habitatGrouping.habitat && primaryHabitatCount !== null && (
            <IdealHabitatBadge
              groupSize={neighborhood.pokemon.length}
              habitat={neighborhood.habitatGrouping.habitat}
              residentCount={primaryHabitatCount}
            />
          )}
          {roleAbilities.map((summary) => (
            <AbilityBadge
              ability={summary.ability}
              groupSize={neighborhood.pokemon.length}
              key={summary.ability.slug}
              residentCount={summary.residentCount}
            />
          ))}
        </Stack>
      </Box>

      <Box sx={{ display: 'grid', gap: 1.25, p: 1.25 }}>
        <Box sx={{ display: 'grid', gap: 0.375 }}>
          <Typography sx={{ color: style.deep, fontWeight: 850 }} variant="caption">
            Why this cluster works
          </Typography>
          {synergyNotes.map((note) => (
            <Typography color="text.secondary" key={note} variant="body2">
              {note}
            </Typography>
          ))}
        </Box>

        {litterNeedsGatherer && (
          <Box
            sx={{
              alignItems: 'center',
              backgroundColor: 'oklch(0.965 0.04 78)',
              border: '1px solid oklch(0.78 0.105 72)',
              borderRadius: 1,
              color: 'oklch(0.38 0.10 66)',
              display: 'flex',
              gap: 0.625,
              px: 0.875,
              py: 0.75,
            }}
          >
            <WarningAmberRoundedIcon fontSize="small" />
            <Typography sx={{ color: 'inherit', fontWeight: 800 }} variant="caption">
              Needs a Gather evo group
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'grid', gap: 0.25 }}>
          <Typography sx={{ fontWeight: 850 }} variant="caption">
            Evo groups
          </Typography>
          {neighborhood.families.map((family) => (
            <NeighborhoodFamilyRow family={family} key={family.familyId} />
          ))}
        </Box>
      </Box>
    </Box>
  )
}

function NeighborhoodFamilyRow({ family }: { family: NeighborhoodFamily }) {
  const grouping = getIdealHabitatGrouping(family.pokemon)

  return (
    <Box
      sx={{
        alignItems: 'center',
        borderTop: '1px solid oklch(0.88 0.018 155)',
        display: 'grid',
        gap: 0.75,
        gridTemplateColumns: {
          xs: 'minmax(0, 1fr)',
          sm: 'minmax(0, 1fr) auto',
        },
        minWidth: 0,
        py: 0.75,
      }}
    >
      <Box
        sx={{
          alignItems: 'center',
          display: 'grid',
          gap: 0.75,
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            sm: 'auto minmax(0, 1fr)',
          },
          minWidth: 0,
        }}
      >
        <Stack
          direction="row"
          spacing={0.25}
          sx={{ flexWrap: 'wrap' }}
          useFlexGap
        >
          {family.pokemon.map((resident) => (
            <PokemonPortrait key={resident.slug} pokemon={resident} size={36} />
          ))}
        </Stack>
        <Typography sx={{ fontWeight: 800, minWidth: 0 }} variant="body2">
          {family.pokemon.map((resident) => resident.name).join(', ')}
        </Typography>
      </Box>
      <Stack direction="row" spacing={0.375} sx={{ flexWrap: 'wrap', justifyContent: 'flex-end' }} useFlexGap>
        <Chip label={grouping.label} size="small" variant="outlined" />
        {family.isLowPreference && (
          <Chip
              label="Like 1–2"
            size="small"
            sx={{
              backgroundColor: 'oklch(0.95 0.025 50)',
              color: 'oklch(0.40 0.07 45)',
            }}
          />
        )}
      </Stack>
    </Box>
  )
}

function getSynergyNotes(
  neighborhood: Neighborhood,
  primaryHabitatCount: number | null,
) {
  const notes: string[] = []
  const gatherFamilyCount = neighborhood.families.filter((family) =>
    family.abilitySlugs.includes('gather'),
  ).length

  if (neighborhood.purpose === 'litter-hub') {
    notes.push(
      `All ${neighborhood.littererCount} regional litterer${
        neighborhood.littererCount === 1 ? '' : 's'
      } share this one service neighborhood.`,
    )
  }

  if (
    neighborhood.purpose !== 'litter-hub' &&
    neighborhood.waterCount > 0 &&
    neighborhood.growCount > 0
  ) {
    notes.push('Water and Grow families share one garden-side cluster.')
  } else if (
    neighborhood.purpose !== 'litter-hub' &&
    (neighborhood.waterCount > 0 || neighborhood.growCount > 0)
  ) {
    notes.push('Garden utility keeps this evo group beside crops and plants.')
  } else if (
    neighborhood.purpose === 'litter-hub' &&
    (neighborhood.waterCount > 0 || neighborhood.growCount > 0)
  ) {
    notes.push(
      'Water/Grow specialists in this neighborhood stay with their littering evo groups.',
    )
  }

  if (neighborhood.littererCount > 0 && neighborhood.gathererCount > 0) {
    notes.push(
      `${gatherFamilyCount} Gather evo ${
        gatherFamilyCount === 1 ? 'group balances' : 'groups balance'
      } ${neighborhood.littererCount} litterer${
        neighborhood.littererCount === 1 ? '' : 's'
      }.`,
    )
  }

  if (primaryHabitatCount !== null && neighborhood.habitatGrouping.habitat) {
    notes.push(
      `${primaryHabitatCount}/${neighborhood.pokemon.length} residents prefer ${neighborhood.habitatGrouping.label.toLocaleLowerCase()} terrain.`,
    )
  }

  if (neighborhood.topFavoriteCategories.length > 0) {
    notes.push(
      `Aesthetic cues: ${neighborhood.topFavoriteCategories
        .map((coverage) => coverage.category.name)
        .join(', ')}.`,
    )
  }

  if (
    neighborhood.placement === 'far-main' &&
    neighborhood.lowPreferencePokemonCount > 0
  ) {
    notes.push(
      `${neighborhood.lowPreferencePokemonCount} Like 1–2 Pokémon are placed farther from the main center.`,
    )
  } else if (
    neighborhood.placement === 'garden' &&
    neighborhood.lowPreferencePokemonCount > 0
  ) {
    notes.push(
      `${neighborhood.lowPreferencePokemonCount} Like 1–2 Pokémon stay garden-side because Water/Grow utility takes priority.`,
    )
  }

  return notes.length > 0 ? notes : ['These evo groups share the closest available habitat fit.']
}

function getZoneVisual(
  placement: NeighborhoodPlacement,
  style: VisualStyle,
): ZoneVisual {
  if (placement === 'garden') {
    return {
      label: 'Garden edge',
      note: 'Water and Grow beside crops and plants',
      background: 'oklch(0.95 0.055 135)',
      border: 'oklch(0.75 0.105 135)',
      foreground: 'oklch(0.36 0.10 135)',
      Icon: LocalFloristRoundedIcon,
    }
  }

  if (placement === 'far-main') {
    return {
      label: 'Far main area',
      note: 'Lower-like families farther from the center',
      background: 'oklch(0.95 0.025 58)',
      border: 'oklch(0.76 0.07 58)',
      foreground: 'oklch(0.39 0.075 52)',
      Icon: ExploreRoundedIcon,
    }
  }

  return {
    label: 'Main area',
    note: 'Everyday clusters led by terrain and aesthetics',
    background: style.soft,
    border: style.accent,
    foreground: style.deep,
    Icon: LocationCityRoundedIcon,
  }
}
