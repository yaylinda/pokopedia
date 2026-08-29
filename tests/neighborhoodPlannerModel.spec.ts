import { expect, test } from '@playwright/test'
import { createServer, type ViteDevServer } from 'vite'
import type { RegionRosterPokemon } from '../src/data/currentRegionRoster'
import type { NeighborhoodPlan } from '../src/modules/region-roster/neighborhoodPlannerModel'

let server: ViteDevServer
let currentRegionRoster: {
  regions: { regionId: string; pokemon: RegionRosterPokemon[] }[]
}
let getNeighborhoodPlan: (
  pokemon: RegionRosterPokemon[],
) => NeighborhoodPlan

test.beforeAll(async () => {
  server = await createServer({
    appType: 'custom',
    server: { middlewareMode: true },
  })
  const rosterModule = await server.ssrLoadModule(
    '/src/data/currentRegionRoster.ts',
  )
  const neighborhoodModule = await server.ssrLoadModule(
    '/src/modules/region-roster/neighborhoodPlannerModel.ts',
  )

  currentRegionRoster = rosterModule.currentRegionRoster
  getNeighborhoodPlan = neighborhoodModule.getNeighborhoodPlan
})

test.afterAll(async () => {
  await server.close()
})

const makeResident = ({
  abilitySlugs = [],
  habitatId = 'bright',
  likeRating = 3,
  slug,
}: {
  abilitySlugs?: string[]
  habitatId?: string
  likeRating?: RegionRosterPokemon['lindaStats']['likeRating']
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
  idealHabitat: {
    idealHabitatId: habitatId,
    slug: habitatId,
    name: habitatId,
    detailUrl: `https://example.com/habitats/${habitatId}`,
  },
  favorites: [],
  specialties: abilitySlugs.map((abilitySlug) => ({
    slug: abilitySlug,
    name: abilitySlug,
    detailUrl: `https://example.com/abilities/${abilitySlug}`,
  })),
  lindaStats: {
    likeRating,
    usefulnessRating: null,
    belongsInCurrentRegion: null,
  },
})

test('creates garden, balanced service, and far-main neighborhoods', () => {
  const residents = [
    makeResident({ slug: 'test-grower', abilitySlugs: ['grow'] }),
    makeResident({
      slug: 'test-waterer',
      abilitySlugs: ['water'],
      habitatId: 'humid',
    }),
    makeResident({
      slug: 'test-litterer',
      abilitySlugs: ['grow', 'litter'],
      habitatId: 'dry',
    }),
    makeResident({
      slug: 'test-litterer-two',
      abilitySlugs: ['litter'],
      habitatId: 'dark',
    }),
    makeResident({
      slug: 'test-gatherer',
      abilitySlugs: ['gather'],
      habitatId: 'bright',
    }),
    makeResident({
      slug: 'test-low-like',
      habitatId: 'dark',
      likeRating: 2,
    }),
  ]

  const plan = getNeighborhoodPlan(residents)
  const garden = plan.neighborhoods.find(
    (neighborhood) => neighborhood.placement === 'garden',
  )
  const litterNeighborhood = plan.neighborhoods.find(
    (neighborhood) => neighborhood.littererCount > 0,
  )
  const lowLikeNeighborhood = plan.neighborhoods.find((neighborhood) =>
    neighborhood.pokemon.some((resident) => resident.slug === 'test-low-like'),
  )

  expect(garden?.growCount).toBe(2)
  expect(garden?.waterCount).toBe(1)
  expect(plan.litterNeighborhoodCount).toBe(1)
  expect(litterNeighborhood?.purpose).toBe('litter-hub')
  expect(litterNeighborhood?.littererCount).toBe(2)
  expect(litterNeighborhood?.gathererCount).toBe(1)
  expect(litterNeighborhood?.families).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ familyId: 'test-litterer' }),
      expect.objectContaining({ familyId: 'test-litterer-two' }),
      expect.objectContaining({ familyId: 'test-gatherer' }),
    ]),
  )
  expect(lowLikeNeighborhood?.placement).toBe('far-main')
  expect(plan.issues).toHaveLength(0)
})

test('keeps low-like garden specialists beside the plants', () => {
  const plan = getNeighborhoodPlan([
    makeResident({
      slug: 'test-disliked-grower',
      abilitySlugs: ['grow'],
      likeRating: 1,
    }),
  ])

  expect(plan.neighborhoods[0]).toMatchObject({
    placement: 'garden',
    lowPreferencePokemonCount: 1,
    growCount: 1,
  })
})

test('accounts for every regional evo group and exposes impossible gather rules', () => {
  currentRegionRoster.regions.forEach((region) => {
    const plan = getNeighborhoodPlan(region.pokemon)
    const plannedPokemonSlugs = plan.neighborhoods
      .flatMap((neighborhood) => neighborhood.pokemon)
      .map((resident) => resident.slug)
    const uniquePlannedPokemonSlugs = new Set(plannedPokemonSlugs)
    const regionHasGatherer = region.pokemon.some((resident) =>
      resident.specialties.some((ability) => ability.slug === 'gather'),
    )
    const regionLittererCount = region.pokemon.filter((resident) =>
      resident.specialties.some((ability) => ability.slug === 'litter'),
    ).length

    expect(plannedPokemonSlugs).toHaveLength(region.pokemon.length)
    expect(uniquePlannedPokemonSlugs.size).toBe(region.pokemon.length)

    expect(plan.litterNeighborhoodCount).toBe(regionLittererCount > 0 ? 1 : 0)

    const litterNeighborhood = plan.neighborhoods.find(
      (neighborhood) => neighborhood.purpose === 'litter-hub',
    )
    expect(litterNeighborhood?.littererCount ?? 0).toBe(regionLittererCount)

    if (regionLittererCount > 0 && regionHasGatherer) {
      expect(litterNeighborhood?.families).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            abilitySlugs: expect.arrayContaining(['gather']),
          }),
        ]),
      )
    }

    if (!regionHasGatherer && plan.litterNeighborhoodCount > 0) {
      expect(plan.issues).toHaveLength(1)
    }
  })
})
