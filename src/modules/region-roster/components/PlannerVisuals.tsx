import AcUnitRoundedIcon from '@mui/icons-material/AcUnitRounded'
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded'
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded'
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded'
import NatureRoundedIcon from '@mui/icons-material/NatureRounded'
import TerrainRoundedIcon from '@mui/icons-material/TerrainRounded'
import WaterDropRoundedIcon from '@mui/icons-material/WaterDropRounded'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { RegionRosterPokemon } from '../../../data/currentRegionRoster'
import type { FavoriteItem } from '../../../data/favoriteCategories'

type IdealHabitat = NonNullable<RegionRosterPokemon['idealHabitat']>

const habitatVisuals = {
  bright: {
    background: 'oklch(0.95 0.055 96)',
    border: 'oklch(0.79 0.105 89)',
    foreground: 'oklch(0.39 0.105 72)',
    Icon: LightModeRoundedIcon,
  },
  warm: {
    background: 'oklch(0.95 0.055 48)',
    border: 'oklch(0.78 0.105 43)',
    foreground: 'oklch(0.40 0.13 34)',
    Icon: LocalFireDepartmentRoundedIcon,
  },
  humid: {
    background: 'oklch(0.95 0.045 206)',
    border: 'oklch(0.78 0.085 211)',
    foreground: 'oklch(0.38 0.095 221)',
    Icon: WaterDropRoundedIcon,
  },
  dry: {
    background: 'oklch(0.95 0.045 74)',
    border: 'oklch(0.78 0.085 69)',
    foreground: 'oklch(0.39 0.085 61)',
    Icon: TerrainRoundedIcon,
  },
  dark: {
    background: 'oklch(0.93 0.035 288)',
    border: 'oklch(0.73 0.075 286)',
    foreground: 'oklch(0.34 0.085 286)',
    Icon: DarkModeRoundedIcon,
  },
  cool: {
    background: 'oklch(0.96 0.035 232)',
    border: 'oklch(0.79 0.075 236)',
    foreground: 'oklch(0.39 0.09 242)',
    Icon: AcUnitRoundedIcon,
  },
} as const

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

export function FavoriteItemPicture({ item }: { item: FavoriteItem }) {
  return (
    <Box
      sx={{
        alignItems: 'center',
        backgroundColor: 'oklch(0.96 0.012 82)',
        borderRadius: 0.75,
        display: 'flex',
        flex: '0 0 auto',
        height: 34,
        justifyContent: 'center',
        width: 34,
      }}
    >
      {item.pictureUrl ? (
        <Box
          alt=""
          component="img"
          loading="lazy"
          src={item.pictureUrl}
          sx={{ height: 30, objectFit: 'contain', width: 30 }}
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
  groupSize,
  habitat,
  residentCount,
}: {
  groupSize: number
  habitat: IdealHabitat
  residentCount: number
}) {
  const visual =
    habitatVisuals[habitat.idealHabitatId as keyof typeof habitatVisuals]
  const Icon = visual?.Icon ?? NatureRoundedIcon
  const background = visual?.background ?? 'oklch(0.95 0.025 155)'
  const border = visual?.border ?? 'oklch(0.78 0.055 155)'
  const foreground = visual?.foreground ?? 'oklch(0.37 0.075 155)'

  return (
    <Box
      aria-label={`${habitat.name} ideal habitat, ${residentCount} of ${groupSize} residents`}
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
        {residentCount}/{groupSize}
      </Typography>
    </Box>
  )
}
