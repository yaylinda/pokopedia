import BoltRoundedIcon from '@mui/icons-material/BoltRounded'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { RegionRosterPokemon } from '../../../data/currentRegionRoster'
import type { FavoriteItem } from '../../../data/favoriteCategories'
import { getHabitatVisual } from './plannerHabitatVisuals'

type IdealHabitat = NonNullable<RegionRosterPokemon['idealHabitat']>

export function PokemonPortrait({
  pokemon,
  size,
}: {
  pokemon: RegionRosterPokemon
  size: number
}) {
  return (
    <Box
      sx={{
        alignItems: 'center',
        backgroundColor: 'oklch(0.95 0.02 155)',
        borderRadius: 1,
        display: 'flex',
        flex: '0 0 auto',
        height: size,
        justifyContent: 'center',
        width: size,
      }}
    >
      {pokemon.imageUrl ? (
        <Box
          alt=""
          component="img"
          loading="lazy"
          src={pokemon.imageUrl}
          sx={{ height: size - 4, objectFit: 'contain', width: size - 4 }}
        />
      ) : (
        <Typography sx={{ fontWeight: 850 }}>{pokemon.name.charAt(0)}</Typography>
      )}
    </Box>
  )
}

export function FavoriteItemPicture({
  item,
  size = 34,
}: {
  item: FavoriteItem
  size?: number
}) {
  return (
    <Box
      sx={{
        alignItems: 'center',
        backgroundColor: 'oklch(0.96 0.012 82)',
        borderRadius: 0.75,
        display: 'flex',
        flex: '0 0 auto',
        height: size,
        justifyContent: 'center',
        width: size,
      }}
    >
      {item.pictureUrl ? (
        <Box
          alt=""
          component="img"
          loading="lazy"
          src={item.pictureUrl}
          sx={{ height: size - 4, objectFit: 'contain', width: size - 4 }}
        />
      ) : (
        <Typography sx={{ fontWeight: 850 }} variant="caption">
          {item.itemName.charAt(0)}
        </Typography>
      )}
    </Box>
  )
}

export function IdealHabitatBadge({
  detail,
  groupSize,
  habitat,
  residentCount,
}: {
  detail?: string
  groupSize?: number
  habitat: IdealHabitat
  residentCount?: number
}) {
  const visual = getHabitatVisual(habitat.idealHabitatId)
  const Icon = visual.Icon
  const background = visual.background
  const border = visual.border
  const foreground = visual.foreground
  const metadata = detail ?? `${residentCount ?? 0}/${groupSize ?? 0}`

  return (
    <Box
      aria-label={`${habitat.name} ideal habitat, ${metadata}`}
      component="span"
      sx={{
        alignItems: 'center',
        backgroundColor: background,
        border: `1px solid ${border}`,
        borderRadius: 1.25,
        color: foreground,
        display: 'inline-flex',
        flex: '0 0 auto',
        gap: 0.625,
        minHeight: 34,
        px: 0.625,
        py: 0.375,
      }}
    >
      <Box
        component="span"
        sx={{
          alignItems: 'center',
          display: 'inline-flex',
          height: 24,
          justifyContent: 'center',
          width: 24,
        }}
      >
        <Icon sx={{ fontSize: 20 }} />
      </Box>
      <Typography
        component="span"
        sx={{ color: 'inherit', fontWeight: 800, lineHeight: 1.1 }}
        variant="caption"
      >
        {habitat.name}
      </Typography>
      <Typography
        component="span"
        sx={{
          color: 'inherit',
          fontVariantNumeric: 'tabular-nums',
          fontWeight: 650,
          lineHeight: 1.1,
          opacity: 0.82,
        }}
        variant="caption"
      >
        {metadata}
      </Typography>
    </Box>
  )
}

export function AbilityBadge({
  ability,
  groupSize,
  residentCount,
}: {
  ability: RegionRosterPokemon['specialties'][number]
  groupSize: number
  residentCount: number
}) {
  const sharedByAll = groupSize > 0 && residentCount === groupSize
  const background = sharedByAll
    ? 'oklch(0.94 0.04 155)'
    : 'oklch(0.96 0.018 285)'
  const border = sharedByAll
    ? 'oklch(0.76 0.08 155)'
    : 'oklch(0.82 0.045 285)'
  const foreground = sharedByAll
    ? 'oklch(0.34 0.085 155)'
    : 'oklch(0.38 0.075 285)'

  return (
    <Box
      aria-label={`${ability.name} ability, ${residentCount} of ${groupSize} residents`}
      component="span"
      sx={{
        alignItems: 'center',
        backgroundColor: background,
        border: `1px solid ${border}`,
        borderRadius: 1.25,
        color: foreground,
        display: 'inline-flex',
        flex: '0 0 auto',
        gap: 0.625,
        minHeight: 34,
        px: 0.625,
        py: 0.375,
      }}
    >
      <Box
        component="span"
        sx={{
          alignItems: 'center',
          display: 'inline-flex',
          height: 24,
          justifyContent: 'center',
          width: 24,
        }}
      >
        {ability.pictureUrl ?? ability.iconUrl ? (
          <Box
            alt=""
            component="img"
            loading="lazy"
            src={ability.pictureUrl ?? ability.iconUrl}
            sx={{ height: 22, objectFit: 'contain', width: 22 }}
          />
        ) : (
          <BoltRoundedIcon sx={{ fontSize: 20 }} />
        )}
      </Box>
      <Typography
        component="span"
        sx={{ color: 'inherit', fontWeight: 800, lineHeight: 1.1 }}
        variant="caption"
      >
        {ability.name}
      </Typography>
      <Typography
        component="span"
        sx={{
          color: 'inherit',
          fontVariantNumeric: 'tabular-nums',
          fontWeight: 650,
          lineHeight: 1.1,
          opacity: 0.82,
        }}
        variant="caption"
      >
        {residentCount}/{groupSize}
      </Typography>
    </Box>
  )
}
