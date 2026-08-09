import {
  allAvailableRosterPokemon,
  comfortLevels,
  type ComfortLevel,
  type RegionRosterPokemon,
} from '../../data/currentRegionRoster'

export type VisualStyle = {
  accent: string
  deep: string
  soft: string
}

export type PokemonGroup = VisualStyle & {
  id: string
  label: string
  pokemon: RegionRosterPokemon[]
  note: string
}

export type DistributionSegment = {
  id: string
  label: string
  count: number
  color: string
}

export const regionStyles: Record<string, VisualStyle> = {
  'palette-town': {
    accent: 'oklch(0.72 0.16 82)',
    deep: 'oklch(0.42 0.11 76)',
    soft: 'oklch(0.95 0.06 88)',
  },
  'sparkling-skylands': {
    accent: 'oklch(0.63 0.13 285)',
    deep: 'oklch(0.40 0.12 285)',
    soft: 'oklch(0.94 0.04 285)',
  },
  'withered-wastelands': {
    accent: 'oklch(0.67 0.13 135)',
    deep: 'oklch(0.40 0.10 135)',
    soft: 'oklch(0.94 0.05 135)',
  },
  'bleak-beach': {
    accent: 'oklch(0.68 0.11 190)',
    deep: 'oklch(0.41 0.09 190)',
    soft: 'oklch(0.94 0.04 190)',
  },
  'rocky-ridges': {
    accent: 'oklch(0.64 0.16 38)',
    deep: 'oklch(0.40 0.12 38)',
    soft: 'oklch(0.94 0.05 38)',
  },
  'bubbly-basin': {
    accent: 'oklch(0.68 0.13 225)',
    deep: 'oklch(0.40 0.10 225)',
    soft: 'oklch(0.94 0.05 225)',
  },
}

export const comfortStyles: Record<
  ComfortLevel,
  VisualStyle & { label: string; note: string }
> = {
  awesome: {
    label: 'Awesome',
    note: 'Thriving here',
    accent: 'oklch(0.62 0.15 145)',
    deep: 'oklch(0.37 0.10 145)',
    soft: 'oklch(0.94 0.05 145)',
  },
  great: {
    label: 'Great',
    note: 'Very comfortable',
    accent: 'oklch(0.65 0.12 187)',
    deep: 'oklch(0.39 0.08 187)',
    soft: 'oklch(0.94 0.04 187)',
  },
  nice: {
    label: 'Nice',
    note: 'Comfortable',
    accent: 'oklch(0.65 0.13 250)',
    deep: 'oklch(0.40 0.10 250)',
    soft: 'oklch(0.94 0.04 250)',
  },
  average: {
    label: 'Average',
    note: 'Doing okay',
    accent: 'oklch(0.73 0.15 85)',
    deep: 'oklch(0.43 0.10 78)',
    soft: 'oklch(0.95 0.05 88)',
  },
  iffy: {
    label: 'Iffy',
    note: 'Needs attention',
    accent: 'oklch(0.66 0.17 45)',
    deep: 'oklch(0.40 0.13 40)',
    soft: 'oklch(0.94 0.05 45)',
  },
  'no-home': {
    label: 'No home',
    note: 'Not settled yet',
    accent: 'oklch(0.57 0.05 22)',
    deep: 'oklch(0.36 0.04 22)',
    soft: 'oklch(0.94 0.02 22)',
  },
}

const habitatStyles: Record<string, VisualStyle> = {
  Bright: {
    accent: 'oklch(0.76 0.16 90)',
    deep: 'oklch(0.44 0.11 80)',
    soft: 'oklch(0.96 0.06 94)',
  },
  Cool: {
    accent: 'oklch(0.68 0.13 250)',
    deep: 'oklch(0.41 0.10 250)',
    soft: 'oklch(0.95 0.04 250)',
  },
  Dark: {
    accent: 'oklch(0.56 0.10 300)',
    deep: 'oklch(0.35 0.08 300)',
    soft: 'oklch(0.93 0.04 300)',
  },
  Dry: {
    accent: 'oklch(0.67 0.14 55)',
    deep: 'oklch(0.40 0.11 50)',
    soft: 'oklch(0.94 0.05 55)',
  },
  Humid: {
    accent: 'oklch(0.64 0.13 165)',
    deep: 'oklch(0.38 0.09 165)',
    soft: 'oklch(0.94 0.04 165)',
  },
  Warm: {
    accent: 'oklch(0.67 0.17 28)',
    deep: 'oklch(0.40 0.13 28)',
    soft: 'oklch(0.94 0.05 28)',
  },
}

const habitatOrder = ['Bright', 'Warm', 'Cool', 'Humid', 'Dry', 'Dark']

const flavorStyles: Record<string, VisualStyle> = {
  'sweet-flavors': {
    accent: 'oklch(0.69 0.16 350)',
    deep: 'oklch(0.40 0.12 350)',
    soft: 'oklch(0.95 0.05 350)',
  },
  'spicy-flavors': {
    accent: 'oklch(0.66 0.18 35)',
    deep: 'oklch(0.39 0.13 35)',
    soft: 'oklch(0.95 0.05 35)',
  },
  'sour-flavors': {
    accent: 'oklch(0.75 0.16 115)',
    deep: 'oklch(0.42 0.11 115)',
    soft: 'oklch(0.96 0.05 115)',
  },
  'bitter-flavors': {
    accent: 'oklch(0.58 0.11 305)',
    deep: 'oklch(0.36 0.09 305)',
    soft: 'oklch(0.94 0.04 305)',
  },
  'dry-flavors': {
    accent: 'oklch(0.69 0.10 75)',
    deep: 'oklch(0.41 0.08 75)',
    soft: 'oklch(0.95 0.04 75)',
  },
}

const flavorOrder = [
  'sweet-flavors',
  'spicy-flavors',
  'sour-flavors',
  'bitter-flavors',
  'dry-flavors',
]

export const regionOrder = [
  'withered-wastelands',
  'bleak-beach',
  'rocky-ridges',
  'sparkling-skylands',
  'palette-town',
  'bubbly-basin',
]

export const allRosterPokemon = allAvailableRosterPokemon

export const allRosterPokemonBySlug = new Map(
  allRosterPokemon.map((pokemon) => [pokemon.slug, pokemon]),
)

const abilityOrder = Array.from(
  new Set(
    allRosterPokemon.flatMap((pokemon) =>
      pokemon.specialties.map((specialty) => specialty.name),
    ),
  ),
).sort((left, right) => {
  const count = (name: string) =>
    allRosterPokemon.filter((pokemon) =>
      pokemon.specialties.some((specialty) => specialty.name === name),
    ).length

  return count(right) - count(left) || left.localeCompare(right)
})

const abilityColors = abilityOrder.map((_, index) => {
  const hue = Math.round((index * 137.508 + 18) % 360)
  const lightness = [0.62, 0.68, 0.58][index % 3]
  const chroma = [0.15, 0.12, 0.13][index % 3]

  return `oklch(${lightness} ${chroma} ${hue})`
})

export const getAbilityDistribution = (
  pokemon: RegionRosterPokemon[],
): DistributionSegment[] =>
  abilityOrder.flatMap((abilityName, index) => {
    const count = pokemon.filter((entry) =>
      entry.specialties.some((specialty) => specialty.name === abilityName),
    ).length

    return count > 0
      ? [
          {
            id: abilityName.toLocaleLowerCase().replaceAll(' ', '-'),
            label: abilityName,
            count,
            color: abilityColors[index],
          },
        ]
      : []
  })

export const getFlavorDistribution = (
  pokemon: RegionRosterPokemon[],
): DistributionSegment[] =>
  flavorOrder.flatMap((flavorId) => {
    const favorite = pokemon
      .flatMap((entry) => entry.favorites)
      .find((entry) => entry.favoriteId === flavorId)
    const count = pokemon.filter((entry) =>
      entry.favorites.some((entry) => entry.favoriteId === flavorId),
    ).length

    return count > 0
      ? [
          {
            id: flavorId,
            label: favorite?.name.replace(/ flavors$/i, '') ?? flavorId,
            count,
            color: flavorStyles[flavorId].accent,
          },
        ]
      : []
  })

export const getHabitatDistribution = (
  pokemon: RegionRosterPokemon[],
): DistributionSegment[] =>
  habitatOrder.flatMap((habitatName) => {
    const count = pokemon.filter(
      (entry) => entry.idealHabitat?.name === habitatName,
    ).length

    return count > 0
      ? [
          {
            id: habitatName.toLocaleLowerCase(),
            label: habitatName,
            count,
            color: habitatStyles[habitatName].accent,
          },
        ]
      : []
  })

export const getComfortCounts = (
  pokemon: RegionRosterPokemon[],
  regionId?: string,
) =>
  Object.fromEntries(
    comfortLevels.map((level) => [
      level,
      pokemon.filter(
        (entry) =>
          entry.comfortLevel === level &&
          (!regionId || entry.regionId === regionId),
      ).length,
    ]),
  ) as Record<ComfortLevel, number>

export const matchesRosterQuery = (
  pokemon: RegionRosterPokemon,
  query: string,
) => {
  const normalizedQuery = query.trim().toLocaleLowerCase()

  if (!normalizedQuery) return true

  return [
    pokemon.name,
    pokemon.regionName,
    pokemon.idealHabitat?.name,
    comfortStyles[pokemon.comfortLevel].label,
    ...pokemon.favorites.map((favorite) => favorite.name),
    ...pokemon.specialties.map((specialty) => specialty.name),
  ]
    .filter(Boolean)
    .join(' ')
    .toLocaleLowerCase()
    .includes(normalizedQuery)
}

export function buildHabitatGroups(
  pokemon: RegionRosterPokemon[],
): PokemonGroup[] {
  return habitatOrder.map((habitatName) => {
    const style = habitatStyles[habitatName]

    return {
      id: habitatName.toLocaleLowerCase(),
      label: habitatName,
      note: 'Ideal habitat',
      pokemon: pokemon.filter(
        (entry) => entry.idealHabitat?.name === habitatName,
      ),
      ...style,
    }
  })
}
