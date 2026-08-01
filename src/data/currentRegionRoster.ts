import currentRegionRosterJson from '../../data/current-region-roster.json'
import pokemonJson from '../../data/pokemon.json'
import pokemonPreferencesJson from '../../data/pokemon-preferences.json'
import specialtiesJson from '../../data/specialties.json'
import type {
  LindaPokemonRating,
  LindaPokemonStats,
} from './types'

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
  isLegendary: boolean
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

const specialtyUsefulness: Record<string, LindaPokemonRating> = {
  appraise: 5,
  build: 4,
  bulldoze: 4,
  burn: 3,
  chop: 3,
  collect: 5,
  crush: 3,
  dj: 2,
  dreamisland: 5,
  eat: 2,
  engineer: 5,
  explode: 3,
  fly: 4,
  gather: 4,
  gatherhoney: 4,
  generate: 4,
  grow: 4,
  hype: 1,
  illuminate: 5,
  litter: 4,
  paint: 5,
  party: 5,
  rarify: 5,
  recycle: 4,
  search: 3,
  storage: 5,
  teleport: 5,
  trade: 3,
  transform: 2,
  water: 4,
  yawn: 2,
}

const scoreUsefulness = (specialties: Specialty[]): LindaPokemonRating => {
  const strongestSkill = Math.max(
    1,
    ...specialties.map((specialty) => specialtyUsefulness[specialty.slug] ?? 3),
  )

  return Math.min(
    5,
    strongestSkill + (specialties.length > 1 ? 1 : 0),
  ) as LindaPokemonRating
}

const makeDefaultLindaStats = (
  specialties: Specialty[],
): LindaPokemonStats => ({
  // Personal taste cannot be inferred from game data, so start at a friendly neutral.
  likeRating: 3,
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

export const currentRegions: CurrentRegion[] = Object.entries(roster.regions).map(
  ([regionId, region]) => ({
    regionId,
    name: region.name,
    environmentLevel: region.environmentLevel,
    pokemon: comfortLevels.flatMap((comfortLevel) =>
      region.comfortLevels[comfortLevel]
        // Ditto represents the player in the captured screenshots, not a resident.
        .filter((slug) => slug !== 'ditto')
        .map((slug) => {
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

          return {
            key: `${regionId}:${slug}`,
            regionId,
            regionName: region.name,
            comfortLevel,
            // The captured field name reflects the original screenshot pass;
            // in the game, the star marks a legendary Pokemon.
            isLegendary: region.eventPokemonSlugs.includes(slug),
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
            lindaStats: makeDefaultLindaStats(specialties),
          }
        }),
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
