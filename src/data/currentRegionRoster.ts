import currentRegionRosterJson from '../../data/current-region-roster.json'
import pokemonJson from '../../data/pokemon.json'
import pokemonPreferencesJson from '../../data/pokemon-preferences.json'
import specialtiesJson from '../../data/specialties.json'
import type { LindaPokemonStats } from './types'

type Specialty = {
  slug: string
  name: string
  description?: string
  detailUrl: string
  pictureUrl?: string
  iconUrl?: string
}

type Favorite = {
  sourceOrder: number
  favoriteId: string
  slug: string
  name: string
  kind: string
  detailUrl: string
}

type IdealHabitat = {
  idealHabitatId: string
  slug: string
  name: string
  detailUrl: string
}

type PokemonCatalogEntry = {
  name: string
  slug: string
  pokopiaNumberDisplay: string
  imageUrl: string
  detailUrl: string
  specialties: Specialty[]
}

type PokemonPreference = {
  pokemonSlug: string
  idealHabitat: IdealHabitat
  favorites: Favorite[]
}

export const comfortLevels = [
  'awesome',
  'great',
  'nice',
  'average',
  'iffy',
  'no-home',
] as const

export type ComfortLevel = (typeof comfortLevels)[number]

type CurrentRegionRosterJson = {
  schemaVersion: number
  updatedAt: string
  sourceNote: string
  regions: Record<
    string,
    {
      name: string
      environmentLevel: {
        current: number
        isMax: boolean
      }
      pokemonCount: number
      eventPokemonSlugs: string[]
      comfortLevels: Record<ComfortLevel, string[]>
    }
  >
}

export type RegionRosterPokemon = {
  key: string
  regionId: string
  regionName: string
  comfortLevel: ComfortLevel
  isLegendaryOrMythical: boolean
  slug: string
  name: string
  pokopiaNumberDisplay: string | null
  imageUrl: string | null
  detailUrl: string | null
  idealHabitat: IdealHabitat | null
  favorites: Favorite[]
  specialties: Specialty[]
  lindaStats: LindaPokemonStats
}

export type CurrentRegion = {
  regionId: string
  name: string
  environmentLevel: {
    current: number
    isMax: boolean
  }
  pokemon: RegionRosterPokemon[]
}

const roster = currentRegionRosterJson as CurrentRegionRosterJson
export const legendaryOrMythicalPokemonSlugs = new Set([
  'articuno',
  'zapdos',
  'moltres',
  'mewtwo',
  'raikou',
  'entei',
  'suicune',
  'lugia',
  'ho-oh',
  'kyogre',
  'mew',
  'jirachi',
  'phione',
  'manaphy',
  'volcanion',
])
const pokemonCatalog = pokemonJson as {
  pokemon: PokemonCatalogEntry[]
}
const preferenceCatalog = pokemonPreferencesJson as {
  pokemon: PokemonPreference[]
}
const specialtyCatalog = (specialtiesJson as { specialties: Specialty[] })
  .specialties
const preferenceBySlug = new Map(
  preferenceCatalog.pokemon.map((preference) => [
    preference.pokemonSlug,
    preference,
  ]),
)
const pokemonBySlug = new Map(
  pokemonCatalog.pokemon.map((pokemon) => {
    const preference = preferenceBySlug.get(pokemon.slug)

    return [
      pokemon.slug,
      {
        ...pokemon,
        idealHabitat: preference?.idealHabitat ?? null,
        favorites: preference?.favorites ?? [],
      },
    ]
  }),
)
const specialtyBySlug = new Map(
  specialtyCatalog.map((specialty) => [specialty.slug, specialty]),
)

const scoreUsefulness = (
  specialties: Specialty[],
): LindaPokemonStats['usefulnessRating'] => {
  const hasHype = specialties.some((specialty) => specialty.slug === 'hype')

  if (!hasHype) return null

  return specialties.length === 1 ? 1 : 3
}

const makeDefaultLindaStats = (
  specialties: Specialty[],
  isLegendaryOrMythical: boolean,
): LindaPokemonStats => ({
  // Personal taste cannot be inferred from game data, so start at a friendly neutral.
  likeRating: isLegendaryOrMythical ? 5 : 3,
  usefulnessRating: scoreUsefulness(specialties),
  // This is Linda's call and must never be inferred from placement data.
  belongsInCurrentRegion: null,
})

const makeFavorite = (
  sourceOrder: number,
  slug: string,
  name: string,
  kind: string = 'favorite-category',
): Favorite => ({
  sourceOrder,
  favoriteId: slug,
  slug,
  name,
  kind,
  detailUrl:
    kind === 'flavor'
      ? `https://www.serebii.net/pokemonpokopia/flavors.shtml#${slug.replace('-flavors', '')}`
      : `https://www.serebii.net/pokemonpokopia/favorites/${slug}.shtml`,
})

const supplementalProfiles: Record<
  string,
  {
    name: string
    pokopiaNumberDisplay: string
    imageUrl: string
    detailUrl: string
    idealHabitat: IdealHabitat
    favorites: Favorite[]
    specialtySlugs: string[]
  }
> = {
  sableye: {
    name: 'Sableye',
    pokopiaNumberDisplay: 'E-004',
    imageUrl: 'https://www.serebii.net/pokemonpokopia/pokemon/302.png',
    detailUrl: 'https://www.serebii.net/pokemonpokopia/pokedex/sableye.shtml',
    idealHabitat: {
      idealHabitatId: 'dark',
      slug: 'dark',
      name: 'Dark',
      detailUrl:
        'https://www.serebii.net/pokemonpokopia/pokedex/idealhabitat/dark.shtml',
    },
    favorites: [
      makeFavorite(1, 'spookystuff', 'Spooky stuff'),
      makeFavorite(2, 'shinystuff', 'Shiny stuff'),
      makeFavorite(3, 'luxury', 'Luxury'),
      makeFavorite(4, 'lookslikefood', 'Looks like food'),
      makeFavorite(5, 'watchingstuff', 'Watching stuff'),
      makeFavorite(6, 'sour-flavors', 'Sour flavors', 'flavor'),
    ],
    specialtySlugs: ['search'],
  },
  jirachi: {
    name: 'Jirachi',
    pokopiaNumberDisplay: 'E-005',
    imageUrl: 'https://www.serebii.net/pokemonpokopia/pokemon/385.png',
    detailUrl: 'https://www.serebii.net/pokemonpokopia/pokedex/jirachi.shtml',
    idealHabitat: {
      idealHabitatId: 'bright',
      slug: 'bright',
      name: 'Bright',
      detailUrl:
        'https://www.serebii.net/pokemonpokopia/pokedex/idealhabitat/bright.shtml',
    },
    favorites: [
      makeFavorite(1, 'metalstuff', 'Metal stuff'),
      makeFavorite(2, 'strangestuff', 'Strange stuff'),
      makeFavorite(3, 'shinystuff', 'Shiny stuff'),
      makeFavorite(4, 'watchingstuff', 'Watching stuff'),
      makeFavorite(5, 'wobblystuff', 'Wobbly stuff'),
      makeFavorite(6, 'sweet-flavors', 'Sweet flavors', 'flavor'),
    ],
    specialtySlugs: ['litter'],
  },
}

const titleFromSlug = (slug: string) =>
  slug
    .replaceAll('.', '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (character) => character.toLocaleUpperCase())

export const createRegionRosterPokemon = ({
  comfortLevel = 'no-home',
  regionId,
  regionName,
  slug,
}: {
  comfortLevel?: ComfortLevel
  regionId: string
  regionName: string
  slug: string
}): RegionRosterPokemon => {
  const profile = pokemonBySlug.get(slug)
  const supplementalProfile = supplementalProfiles[slug]
  const specialties =
    profile?.specialties.map(
      (specialty) => specialtyBySlug.get(specialty.slug) ?? specialty,
    ) ??
    supplementalProfile?.specialtySlugs.flatMap((specialtySlug) =>
      specialtyBySlug.get(specialtySlug)
        ? [specialtyBySlug.get(specialtySlug)!]
        : [],
    ) ??
    []
  const isLegendaryOrMythical = legendaryOrMythicalPokemonSlugs.has(slug)

  return {
    key: `${regionId}:${slug}`,
    regionId,
    regionName,
    comfortLevel,
    isLegendaryOrMythical,
    slug,
    name: profile?.name ?? supplementalProfile?.name ?? titleFromSlug(slug),
    pokopiaNumberDisplay:
      profile?.pokopiaNumberDisplay ??
      supplementalProfile?.pokopiaNumberDisplay ??
      null,
    imageUrl: profile?.imageUrl ?? supplementalProfile?.imageUrl ?? null,
    detailUrl: profile?.detailUrl ?? supplementalProfile?.detailUrl ?? null,
    idealHabitat:
      profile?.idealHabitat ?? supplementalProfile?.idealHabitat ?? null,
    favorites: profile?.favorites ?? supplementalProfile?.favorites ?? [],
    specialties,
    lindaStats: makeDefaultLindaStats(specialties, isLegendaryOrMythical),
  }
}

export const allAvailableRosterPokemon = [
  ...pokemonCatalog.pokemon.map((pokemon) => pokemon.slug),
  ...Object.keys(supplementalProfiles),
]
  .filter((slug) => slug !== 'ditto')
  .filter((slug, index, slugs) => slugs.indexOf(slug) === index)
  .map((slug) =>
    createRegionRosterPokemon({
      regionId: 'unassigned',
      regionName: 'Unassigned',
      slug,
    }),
  )

export const currentRegions: CurrentRegion[] = Object.entries(roster.regions).map(
  ([regionId, region]) => ({
    regionId,
    name: region.name,
    environmentLevel: region.environmentLevel,
    pokemon: comfortLevels.flatMap((comfortLevel) =>
      region.comfortLevels[comfortLevel]
        // Ditto represents the player in the captured screenshots, not a resident.
        .filter((slug) => slug !== 'ditto')
        .map((slug) =>
          createRegionRosterPokemon({
            comfortLevel,
            regionId,
            regionName: region.name,
            slug,
          }),
        ),
    ),
  }),
)

export const currentRegionRoster = {
  schemaVersion: roster.schemaVersion,
  updatedAt: roster.updatedAt,
  sourceNote: roster.sourceNote,
  regions: currentRegions,
  placementCount: currentRegions.reduce(
    (total, region) => total + region.pokemon.length,
    0,
  ),
  uniquePokemonCount: new Set(
    currentRegions.flatMap((region) => region.pokemon.map((pokemon) => pokemon.slug)),
  ).size,
}
