import { expect, test } from '@playwright/test'
import { createServer, type ViteDevServer } from 'vite'
import type { RegionRosterPokemon } from '../src/data/currentRegionRoster'
import type {
  GroupingStudioDocument,
  GroupingStudioScope,
  UsefulAbilitySlug,
} from '../src/modules/region-roster/groupingStudioModel'

let server: ViteDevServer
let getUsefulFamilyAbilitySlugs: (
  pokemon: RegionRosterPokemon[],
) => UsefulAbilitySlug[]
let normalizeGroupingStudioScope: (
  scope: GroupingStudioScope,
  validFamilyIds: Set<string>,
) => GroupingStudioScope
let parseGroupingStudioDocument: (value: unknown) => GroupingStudioDocument

test.beforeAll(async () => {
  server = await createServer({
    appType: 'custom',
    server: { middlewareMode: true },
  })
  const model = await server.ssrLoadModule(
    '/src/modules/region-roster/groupingStudioModel.ts',
  )

  getUsefulFamilyAbilitySlugs = model.getUsefulFamilyAbilitySlugs
  normalizeGroupingStudioScope = model.normalizeGroupingStudioScope
  parseGroupingStudioDocument = model.parseGroupingStudioDocument
})

test.afterAll(async () => {
  await server.close()
})

const makeResident = (abilitySlugs: string[]): RegionRosterPokemon => ({
  key: 'test:resident',
  regionId: 'test-region',
  regionName: 'Test region',
  comfortLevel: 'nice',
  isLegendaryOrMythical: false,
  slug: 'resident',
  name: 'Resident',
  sourceOrder: null,
  pokopiaNumberDisplay: null,
  imageUrl: null,
  detailUrl: null,
  idealHabitat: null,
  favorites: [],
  specialties: abilitySlugs.map((slug) => ({
    slug,
    name: slug,
    detailUrl: `https://example.com/specialties/${slug}`,
  })),
  lindaStats: {
    likeRating: 3,
    usefulnessRating: null,
    belongsInCurrentRegion: null,
  },
})

test('recognizes only the eight priority utility skills in display order', () => {
  expect(
    getUsefulFamilyAbilitySlugs([
      makeResident([
        'water',
        'recycle',
        'gatherhoney',
        'grow',
        'litter',
        'crush',
        'chop',
        'burn',
        'gather',
        'scrub',
      ]),
    ]),
  ).toEqual([
    'grow',
    'litter',
    'crush',
    'chop',
    'burn',
    'gather',
    'scrub',
    'recycle',
  ])
})

test('parses file data without assigning one family twice', () => {
  const document = parseGroupingStudioDocument({
    schemaVersion: 1,
    updatedAt: '2026-08-30T01:00:00.000Z',
    scopes: {
      'snapshot-a:region-a': {
        snapshotId: 'snapshot-a',
        regionId: 'region-a',
        neighborhoods: [
          {
            neighborhoodId: 'garden',
            name: 'Garden',
            familyIds: ['bulbasaur', 'oddish', 'bulbasaur'],
          },
          {
            neighborhoodId: 'workyard',
            name: 'Workyard',
            familyIds: ['oddish', 'machop'],
          },
        ],
      },
    },
  })

  expect(document.scopes['snapshot-a:region-a'].neighborhoods).toEqual([
    {
      neighborhoodId: 'garden',
      name: 'Garden',
      familyIds: ['bulbasaur', 'oddish'],
    },
    {
      neighborhoodId: 'workyard',
      name: 'Workyard',
      familyIds: ['machop'],
    },
  ])
})

test('drops stale family ids while preserving empty neighborhoods', () => {
  const scope = normalizeGroupingStudioScope(
    {
      snapshotId: 'snapshot-a',
      regionId: 'region-a',
      neighborhoods: [
        {
          neighborhoodId: 'garden',
          name: 'Garden',
          familyIds: ['bulbasaur', 'stale-family'],
        },
        {
          neighborhoodId: 'workyard',
          name: 'Workyard',
          familyIds: [],
        },
      ],
    },
    new Set(['bulbasaur']),
  )

  expect(scope.neighborhoods).toEqual([
    {
      neighborhoodId: 'garden',
      name: 'Garden',
      familyIds: ['bulbasaur'],
    },
    {
      neighborhoodId: 'workyard',
      name: 'Workyard',
      familyIds: [],
    },
  ])
})
