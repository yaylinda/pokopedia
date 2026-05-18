import favoriteCategoriesJson from '../../data/favorite-categories.json'
import habitatRequirementsJson from '../../data/habitat-requirements.json'
import habitatSpawnsJson from '../../data/habitat-spawns.json'
import habitatsJson from '../../data/habitats.json'
import idealHabitatsJson from '../../data/ideal-habitats.json'
import itemsJson from '../../data/items.json'
import locationsJson from '../../data/locations.json'
import pokemonJson from '../../data/pokemon.json'
import pokemonPreferencesJson from '../../data/pokemon-preferences.json'
import specialtiesJson from '../../data/specialties.json'

export type Specialty = {
  slug: string
  name: string
  description?: string
  detailUrl: string
  pictureUrl?: string
  iconUrl?: string
}

export type Pokemon = {
  sourceOrder: number
  pokopiaNumber: number
  pokopiaNumberDisplay: string
  pokemonId: number
  pokemonIdDisplay: string
  pokemonFormSlug: string | null
  name: string
  slug: string
  detailUrl: string
  imageUrl: string
  imageFilename: string
  specialties: Specialty[]
}

export type IdealHabitat = {
  idealHabitatId: string
  slug: string
  name: string
  detailUrl: string
  pokemonCount?: number
}

export type Favorite = {
  sourceOrder: number
  favoriteId: string
  slug: string
  name: string
  kind: string
  detailUrl: string
}

export type PokemonPreference = {
  pokemonSlug: string
  pokemonId: number
  pokemonName: string
  idealHabitat: IdealHabitat
  favorites: Favorite[]
}

export type Habitat = {
  habitatId: number
  habitatIdDisplay: string
  name: string
  description: string
  slug: string
  detailUrl: string
  pictureUrl: string
  pictureFilename: string
  pictureAlt: string
}

export type Requirement = {
  sourceOrder: number
  quantity: number | null
  itemId: string
  itemSlug: string
  itemName: string
  detailUrl: string | null
  pictureUrl: string
  isCatalogLinked: boolean
}

export type HabitatRequirementGroup = {
  habitatId: number
  habitatSlug: string
  habitatName: string
  requirements: Requirement[]
}

export type Spawn = {
  sourceOrder: number
  pokemonId: number
  pokemonSlug: string
  pokemonName: string
  pokemonImageUrl: string
  locations: string[]
  rawLocationText: string
  rarity: string
  timeOfDay: string[]
  weather: string[]
}

export type HabitatSpawnGroup = {
  habitatId: number
  habitatSlug: string
  habitatName: string
  spawns: Spawn[]
}

export type Item = {
  itemId: string
  slug: string
  name: string
  description: string
  anchorId: string
  tagId: string | null
  detailUrl: string
  pictureUrl: string
  isRegisteredInCollection: boolean
  rawLocationText: string
}

export type FavoriteCategoryItem = {
  sourceOrder: number
  itemId: string
  itemSlug: string
  itemName: string
  detailUrl: string
  pictureUrl: string
  description: string
  tagId: string | null
  categoryName: string | null
  isCatalogLinked: boolean
}

export type FavoriteCategory = Favorite & {
  sourcePageUrl: string | null
  itemCount: number
  items: FavoriteCategoryItem[]
}

export type Location = {
  locationId: string
  name: string
  slug: string
  detailUrl: string
  pictureUrl: string
}

type PokemonDataset = { count: number; pokemon: Pokemon[] }
type PreferencesDataset = { count: number; pokemon: PokemonPreference[] }
type HabitatsDataset = { count: number; habitats: Habitat[] }
type HabitatRequirementsDataset = {
  count: number
  totalRequirements: number
  habitats: HabitatRequirementGroup[]
}
type HabitatSpawnsDataset = {
  count: number
  totalSpawns: number
  habitats: HabitatSpawnGroup[]
}
type ItemsDataset = { count: number; items: Item[] }
type FavoriteCategoriesDataset = {
  count: number
  favoriteCategories: FavoriteCategory[]
}
type IdealHabitatsDataset = { count: number; idealHabitats: IdealHabitat[] }
type SpecialtiesDataset = { count: number; specialties: Specialty[] }
type LocationsDataset = { count: number; locations: Location[] }

export type PokemonProfile = Pokemon & {
  idealHabitat: IdealHabitat | null
  favorites: Favorite[]
}

export type PokemonSpawnRecord = Spawn & {
  habitatId: number
  habitatName: string
  habitatPictureUrl?: string
  habitatSlug: string
}

export type HousePlan = {
  key: string
  score: number
  pokemon: PokemonProfile[]
  primaryIdealHabitat: string
  idealHabitatCount: number
  sharedFavorites: { favoriteId: string; name: string; count: number }[]
  favoriteCoverage: number
  explanation: string
}

export type HouseMatch = {
  id: string
  name: string
  count: number
  pokemon: PokemonProfile[]
}

export type HouseBestItem = {
  item: FavoriteCategoryItem
  favoriteCategories: Pick<HouseMatch, 'id' | 'name' | 'count'>[]
  totalFavoritePokemon: number
}

export type HouseDraftSummary = {
  idealHabitats: HouseMatch[]
  sharedFavorites: HouseMatch[]
  bestItems: HouseBestItem[]
  favoriteCoverage: number
}

const pokemonDataset = pokemonJson as PokemonDataset
const preferencesDataset = pokemonPreferencesJson as PreferencesDataset
const habitatsDataset = habitatsJson as HabitatsDataset
const requirementsDataset = habitatRequirementsJson as HabitatRequirementsDataset
const spawnsDataset = habitatSpawnsJson as HabitatSpawnsDataset
const itemsDataset = itemsJson as ItemsDataset
const favoriteCategoriesDataset =
  favoriteCategoriesJson as FavoriteCategoriesDataset
const idealHabitatsDataset = idealHabitatsJson as IdealHabitatsDataset
const specialtiesDataset = specialtiesJson as SpecialtiesDataset
const locationsDataset = locationsJson as LocationsDataset

export const pokemon = pokemonDataset.pokemon
export const pokemonPreferences = preferencesDataset.pokemon
export const habitats = habitatsDataset.habitats
export const habitatRequirements = requirementsDataset.habitats
export const habitatSpawns = spawnsDataset.habitats
export const items = itemsDataset.items
export const favoriteCategories = favoriteCategoriesDataset.favoriteCategories
export const idealHabitats = idealHabitatsDataset.idealHabitats
export const specialties = specialtiesDataset.specialties
export const locations = locationsDataset.locations

export const datasetStats = {
  pokemon: pokemonDataset.count,
  habitats: habitatsDataset.count,
  requirements: requirementsDataset.totalRequirements,
  spawns: spawnsDataset.totalSpawns,
  items: itemsDataset.count,
  favorites: favoriteCategoriesDataset.count,
  idealHabitats: idealHabitatsDataset.count,
  specialties: specialtiesDataset.count,
  locations: locationsDataset.count,
}

const preferencesBySlug = new Map(
  pokemonPreferences.map((entry) => [entry.pokemonSlug, entry]),
)

export const habitatsById = new Map(
  habitats.map((habitat) => [habitat.habitatId, habitat]),
)

export const requirementsByHabitatId = new Map(
  habitatRequirements.map((group) => [group.habitatId, group]),
)

export const spawnsByHabitatId = new Map(
  habitatSpawns.map((group) => [group.habitatId, group]),
)

export const favoriteCategoryById = new Map(
  favoriteCategories.map((favorite) => [favorite.favoriteId, favorite]),
)

export const pokemonProfiles: PokemonProfile[] = pokemon.map((entry) => {
  const preferences = preferencesBySlug.get(entry.slug)

  return {
    ...entry,
    idealHabitat: preferences?.idealHabitat ?? null,
    favorites: preferences?.favorites ?? [],
  }
})

export const pokemonBySlug = new Map(
  pokemonProfiles.map((entry) => [entry.slug, entry]),
)

export const spawnRecordsByPokemonSlug = habitatSpawns.reduce(
  (records, habitat) => {
    habitat.spawns.forEach((spawn) => {
      const existing = records.get(spawn.pokemonSlug) ?? []

      existing.push({
        ...spawn,
        habitatId: habitat.habitatId,
        habitatName: habitat.habitatName,
        habitatPictureUrl: habitatsById.get(habitat.habitatId)?.pictureUrl,
        habitatSlug: habitat.habitatSlug,
      })

      records.set(spawn.pokemonSlug, existing)
    })

    return records
  },
  new Map<string, PokemonSpawnRecord[]>(),
)

const favoriteIdsFor = (entry: PokemonProfile) =>
  entry.favorites
    .filter((favorite) => favorite.kind !== 'none')
    .map((favorite) => favorite.favoriteId)

const sharedFavoriteCount = (a: PokemonProfile, b: PokemonProfile) => {
  const aFavorites = new Set(favoriteIdsFor(a))

  return favoriteIdsFor(b).filter((favoriteId) => aFavorites.has(favoriteId))
    .length
}

const pairCompatibility = (a: PokemonProfile, b: PokemonProfile) => {
  const sameHabitat =
    a.idealHabitat?.idealHabitatId &&
    a.idealHabitat.idealHabitatId === b.idealHabitat?.idealHabitatId

  return (sameHabitat ? 18 : 0) + sharedFavoriteCount(a, b) * 7
}

const combinations = <T>(itemsToCombine: T[], size: number): T[][] => {
  if (size === 0) {
    return [[]]
  }

  if (itemsToCombine.length < size) {
    return []
  }

  const [first, ...rest] = itemsToCombine
  const withFirst = combinations(rest, size - 1).map((combo) => [
    first,
    ...combo,
  ])
  const withoutFirst = combinations(rest, size)

  return [...withFirst, ...withoutFirst]
}

const summarizeBestItems = (sharedFavorites: HouseMatch[]): HouseBestItem[] => {
  const itemMatches = new Map<string, HouseBestItem>()

  sharedFavorites.forEach((favorite) => {
    const favoriteCategory = favoriteCategoryById.get(favorite.id)
    const seenInCategory = new Set<string>()

    favoriteCategory?.items.forEach((item) => {
      if (seenInCategory.has(item.itemId)) {
        return
      }

      seenInCategory.add(item.itemId)

      const existing = itemMatches.get(item.itemId) ?? {
        item,
        favoriteCategories: [],
        totalFavoritePokemon: 0,
      }

      existing.favoriteCategories.push({
        id: favorite.id,
        name: favorite.name,
        count: favorite.count,
      })
      existing.totalFavoritePokemon += favorite.count
      itemMatches.set(item.itemId, existing)
    })
  })

  return [...itemMatches.values()]
    .filter((item) => item.favoriteCategories.length > 1)
    .sort(
      (a, b) =>
        b.favoriteCategories.length - a.favoriteCategories.length ||
        b.totalFavoritePokemon - a.totalFavoritePokemon ||
        a.item.itemName.localeCompare(b.item.itemName),
    )
}

export const scoreHousePlan = (group: PokemonProfile[]): HousePlan => {
  const idealCounts = new Map<string, number>()
  const favoriteCounts = new Map<string, { name: string; count: number }>()
  let pairScore = 0

  group.forEach((entry, index) => {
    if (entry.idealHabitat) {
      idealCounts.set(
        entry.idealHabitat.name,
        (idealCounts.get(entry.idealHabitat.name) ?? 0) + 1,
      )
    }

    entry.favorites
      .filter((favorite) => favorite.kind !== 'none')
      .forEach((favorite) => {
        const existing = favoriteCounts.get(favorite.favoriteId)

        favoriteCounts.set(favorite.favoriteId, {
          name: favorite.name,
          count: (existing?.count ?? 0) + 1,
        })
      })

    group.slice(index + 1).forEach((other) => {
      pairScore += pairCompatibility(entry, other)
    })
  })

  const idealEntries = [...idealCounts.entries()].sort((a, b) => b[1] - a[1])
  const sharedFavorites = [...favoriteCounts.entries()]
    .map(([favoriteId, value]) => ({ favoriteId, ...value }))
    .filter((favorite) => favorite.count > 1)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))

  const primaryIdealHabitat = idealEntries[0]?.[0] ?? 'Mixed'
  const idealHabitatCount = idealEntries[0]?.[1] ?? 0
  const favoriteCoverage = favoriteCounts.size
  const sizeBonus = group.length * 9
  const sharedFavoriteBonus = sharedFavorites.reduce(
    (total, favorite) => total + favorite.count * 4,
    0,
  )
  const score = pairScore + sizeBonus + sharedFavoriteBonus + favoriteCoverage
  const key = group
    .map((entry) => entry.slug)
    .sort()
    .join('|')

  const explanation =
    sharedFavorites.length > 0
      ? `${idealHabitatCount}/${group.length} prefer ${primaryIdealHabitat}; strongest shared favorites are ${sharedFavorites
          .slice(0, 3)
          .map((favorite) => favorite.name)
          .join(', ')}.`
      : `${idealHabitatCount}/${group.length} prefer ${primaryIdealHabitat}; this is more habitat-aligned than favorite-overlap driven.`

  return {
    key,
    score,
    pokemon: group,
    primaryIdealHabitat,
    idealHabitatCount,
    sharedFavorites,
    favoriteCoverage,
    explanation,
  }
}

export const summarizeHouseDraft = (
  group: PokemonProfile[],
): HouseDraftSummary => {
  const idealHabitatMatches = new Map<string, HouseMatch>()
  const favoriteMatches = new Map<string, HouseMatch>()

  group.forEach((entry) => {
    if (entry.idealHabitat) {
      const existing = idealHabitatMatches.get(entry.idealHabitat.idealHabitatId)

      idealHabitatMatches.set(entry.idealHabitat.idealHabitatId, {
        id: entry.idealHabitat.idealHabitatId,
        name: entry.idealHabitat.name,
        count: (existing?.count ?? 0) + 1,
        pokemon: [...(existing?.pokemon ?? []), entry],
      })
    }

    entry.favorites
      .filter((favorite) => favorite.kind !== 'none')
      .forEach((favorite) => {
        const existing = favoriteMatches.get(favorite.favoriteId)

        favoriteMatches.set(favorite.favoriteId, {
          id: favorite.favoriteId,
          name: favorite.name,
          count: (existing?.count ?? 0) + 1,
          pokemon: [...(existing?.pokemon ?? []), entry],
        })
      })
  })

  const byMatchStrength = (a: HouseMatch, b: HouseMatch) =>
    b.count - a.count || a.name.localeCompare(b.name)
  const sharedFavorites = [...favoriteMatches.values()]
    .filter((favorite) => favorite.count > 1)
    .sort(byMatchStrength)

  return {
    idealHabitats: [...idealHabitatMatches.values()].sort(byMatchStrength),
    sharedFavorites,
    bestItems: summarizeBestItems(sharedFavorites),
    favoriteCoverage: favoriteMatches.size,
  }
}

export const generateHousePlans = (
  candidates: PokemonProfile[],
  limit = 10,
): HousePlan[] => {
  const seen = new Set<string>()
  const plans: HousePlan[] = []

  candidates.forEach((seed) => {
    const partners = candidates
      .filter((entry) => entry.slug !== seed.slug)
      .sort((a, b) => pairCompatibility(seed, b) - pairCompatibility(seed, a))
      .slice(0, 18)

    ;[1, 2, 3].forEach((partnerCount) => {
      combinations(partners, partnerCount).forEach((partnerGroup) => {
        const plan = scoreHousePlan([seed, ...partnerGroup])

        if (!seen.has(plan.key)) {
          seen.add(plan.key)
          plans.push(plan)
        }
      })
    })
  })

  return plans
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.pokemon.length - a.pokemon.length ||
        a.key.localeCompare(b.key),
    )
    .slice(0, limit)
}
