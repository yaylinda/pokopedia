import AcUnitRoundedIcon from '@mui/icons-material/AcUnitRounded'
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded'
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded'
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded'
import NatureRoundedIcon from '@mui/icons-material/NatureRounded'
import TerrainRoundedIcon from '@mui/icons-material/TerrainRounded'
import WaterDropRoundedIcon from '@mui/icons-material/WaterDropRounded'

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

const fallbackHabitatVisual = {
  background: 'oklch(0.95 0.025 155)',
  border: 'oklch(0.78 0.055 155)',
  foreground: 'oklch(0.37 0.075 155)',
  Icon: NatureRoundedIcon,
}

export function getHabitatVisual(habitatId?: string | null) {
  return (
    habitatVisuals[habitatId as keyof typeof habitatVisuals] ??
    fallbackHabitatVisual
  )
}
