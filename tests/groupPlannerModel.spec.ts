import { expect, test } from '@playwright/test'
import { createServer, type ViteDevServer } from 'vite'
import type { RegionRosterPokemon } from '../src/data/currentRegionRoster'
import type { FavoriteCategory } from '../src/data/favoriteCategories'
import type {
  EvolutionLinePregroup,
  GroupCompatibilityAnalysis,
} from '../src/modules/region-roster/groupPlannerModel'

let server: ViteDevServer
let createRegionRosterPokemon: (options: {
  regionId: string
  regionName: string
  slug: string
}) => RegionRosterPokemon
let currentRegionRoster: {
  regions: { pokemon: RegionRosterPokemon[] }[]
}
let favoriteCategories: FavoriteCategory[]
let favoriteCategoriesByItemId: Map<string, FavoriteCategory[]>
let favoriteCategoryById: Map<string, FavoriteCategory>
let getEvolutionLinePregroups: (
  pokemon: RegionRosterPokemon[],
) => EvolutionLinePregroup[]
let getGroupCompatibilityAnalysis: (
  pokemon: RegionRosterPokemon[],
) => GroupCompatibilityAnalysis

test.beforeAll(async () => {
  server = await createServer({
    appType: 'custom',
    server: { middlewareMode: true },
  })
  const rosterModule = await server.ssrLoadModule(
    '/src/data/currentRegionRoster.ts',
  )
  const categoryModule = await server.ssrLoadModule(
    '/src/data/favoriteCategories.ts',
  )
  const modelModule = await server.ssrLoadModule(
    '/src/modules/region-roster/groupPlannerModel.ts',
  )

  createRegionRosterPokemon = rosterModule.createRegionRosterPokemon
  currentRegionRoster = rosterModule.currentRegionRoster
  favoriteCategories = categoryModule.favoriteCategories
  favoriteCategoriesByItemId = categoryModule.favoriteCategoriesByItemId
  favoriteCategoryById = categoryModule.favoriteCategoryById
  getEvolutionLinePregroups = modelModule.getEvolutionLinePregroups
  getGroupCompatibilityAnalysis = modelModule.getGroupCompatibilityAnalysis
})

test.afterAll(async () => {
  await server.close()
})

const makeResident = ({
  abilitySlugs = [],
  favoriteIds = [],
  habitatId = null,
  slug,
}: {
  abilitySlugs?: string[]
  favoriteIds?: string[]
  habitatId?: string | null
  slug: string
}): RegionRosterPokemon => ({
  key: `test:${slug}`,
  regionId: 'test',
  regionName: 'Test region',
  comfortLevel: 'nice',
  isLegendaryOrMythical: false,
  slug,
  name: slug,
  sourceOrder: null,
  pokopiaNumberDisplay: null,
  imageUrl: null,
  detailUrl: null,
  idealHabitat: habitatId
    ? {
        idealHabitatId: habitatId,
        slug: habitatId,
        name: habitatId,
        detailUrl: `https://example.com/habitats/${habitatId}`,
      }
    : null,
  favorites: favoriteIds.map((favoriteId, index) => {
    const category = favoriteCategoryById.get(favoriteId)
    if (!category) throw new Error(`Unknown test favorite: ${favoriteId}`)
    return {
      sourceOrder: index + 1,
      favoriteId,
      slug: category.slug,
      name: category.name,
      kind: category.kind,
      detailUrl: category.detailUrl ?? `https://example.com/favorites/${favoriteId}`,
    }
  }),
  specialties: abilitySlugs.map((abilitySlug) => ({
    slug: abilitySlug,
    name: abilitySlug,
    detailUrl: `https://example.com/abilities/${abilitySlug}`,
  })),
  lindaStats: {
    likeRating: 3,
    usefulnessRating: null,
    belongsInCurrentRegion: null,
  },
})

test('keeps relatives together when their middle stage is absent', () => {
  const residents = ['horsea', 'kingdra'].map((slug) =>
    createRegionRosterPokemon({
      regionId: 'test',
      regionName: 'Test region',
      slug,
    }),
  )

  const families = getEvolutionLinePregroups(residents)

  expect(families).toHaveLength(1)
  expect(families[0].pokemon.map((pokemon) => pokemon.slug)).toEqual([
    'horsea',
    'kingdra',
  ])
  expect(families[0].canonicalPokemonSlugs).toContain('seadra')
})

test('keeps forms together and never truncates large evolution families', () => {
  const frillishResidents = [
    'frillishmaleform',
    'frillishfemaleform',
    'jellicentmaleform',
    'jellicentfemaleform',
  ].map((slug) =>
    createRegionRosterPokemon({
      regionId: 'test',
      regionName: 'Test region',
      slug,
    }),
  )
  const eeveeResidents = [
    'eevee',
    'vaporeon',
    'jolteon',
    'flareon',
    'espeon',
    'umbreon',
    'leafeon',
    'glaceon',
    'sylveon',
  ].map((slug) =>
    createRegionRosterPokemon({
      regionId: 'test',
      regionName: 'Test region',
      slug,
    }),
  )

  expect(getEvolutionLinePregroups(frillishResidents)[0].pokemon).toHaveLength(4)
  expect(getEvolutionLinePregroups(eeveeResidents)[0].pokemon).toHaveLength(9)
})

test('separates common traits and deduplicates multi-category item coverage', () => {
  const multiCategoryEntry = Array.from(
    favoriteCategoriesByItemId.entries(),
  ).find(
    ([, categories]) =>
      categories.filter((category) => category.kind === 'favorite-category')
        .length >= 2,
  )
  const flavor = favoriteCategories.find(
    (category) => category.kind === 'flavor',
  )
  if (!multiCategoryEntry || !flavor) {
    throw new Error('Expected multi-category item and flavor fixtures')
  }
  const [itemId, allItemCategories] = multiCategoryEntry
  const [firstCategory, secondCategory] = allItemCategories.filter(
    (category) => category.kind === 'favorite-category',
  )
  const residents = [
    makeResident({
      slug: 'resident-a',
      abilitySlugs: ['water'],
      favoriteIds: [firstCategory.favoriteId, flavor.favoriteId],
      habitatId: 'humid',
    }),
    makeResident({
      slug: 'resident-b',
      abilitySlugs: ['water'],
      favoriteIds: [secondCategory.favoriteId, flavor.favoriteId],
      habitatId: 'humid',
    }),
  ]

  const analysis = getGroupCompatibilityAnalysis(residents)
  const overlapItem = analysis.multiCategoryOverlapItems.find(
    (entry) => entry.item.itemId === itemId,
  )

  expect(analysis.abilities[0]).toMatchObject({
    residentCount: 2,
    sharedByAll: true,
  })
  expect(analysis.habitats[0]).toMatchObject({
    residentCount: 2,
    sharedByAll: true,
  })
  expect(analysis.flavors[0].favorite.favoriteId).toBe(flavor.favoriteId)
  expect(analysis.itemCategories).toHaveLength(0)
  expect(overlapItem).toMatchObject({ residentCount: 2, sharedByAll: true })
  expect(overlapItem?.residentSlugs).toEqual(['resident-a', 'resident-b'])
})

test('retains direct and multi-category labels when the same residents share both categories', () => {
  const multiCategoryEntry = Array.from(
    favoriteCategoriesByItemId.entries(),
  ).find(
    ([, categories]) =>
      categories.filter((category) => category.kind === 'favorite-category')
        .length >= 2,
  )
  if (!multiCategoryEntry) throw new Error('Expected multi-category item fixture')
  const [itemId, allItemCategories] = multiCategoryEntry
  const favoriteIds = allItemCategories
    .filter((category) => category.kind === 'favorite-category')
    .slice(0, 2)
    .map((category) => category.favoriteId)
  const analysis = getGroupCompatibilityAnalysis([
    makeResident({ slug: 'resident-a', favoriteIds }),
    makeResident({ slug: 'resident-b', favoriteIds }),
  ])

  expect(
    analysis.directSharedItems.some((entry) => entry.item.itemId === itemId),
  ).toBe(true)
  expect(
    analysis.multiCategoryOverlapItems.some(
      (entry) => entry.item.itemId === itemId,
    ),
  ).toBe(true)
})

test('continues to exclude Ditto from every processed region roster', () => {
  expect(
    currentRegionRoster.regions.some((region) =>
      region.pokemon.some((pokemon) => pokemon.slug === 'ditto'),
    ),
  ).toBe(false)
})
