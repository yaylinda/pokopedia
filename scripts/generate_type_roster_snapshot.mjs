import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const pokemonCatalogPath = path.join(projectRoot, 'data/pokemon.json')
const currentRosterPath = path.join(projectRoot, 'data/current-region-roster.json')
const snapshotDirectory = path.join(projectRoot, 'data/roster-snapshots')

const TYPE_DATA_URL =
  'https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/pokemon_types.csv'
const TYPE_NAMES_URL =
  'https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/types.csv'
const SPECIES_DATA_URL =
  'https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/pokemon_species.csv'

const regionDefinitions = {
  'withered-wastelands': { name: 'Withered Wastelands' },
  'bleak-beach': { name: 'Bleak Beach' },
  'rocky-ridges': { name: 'Rocky Ridges' },
  'sparkling-skylands': { name: 'Sparkling Skylands' },
  'palette-town': { name: 'Palette Town' },
}

const typeRules = [
  {
    id: 'grass-to-withered-wastelands',
    type: 'grass',
    regionId: 'withered-wastelands',
  },
  {
    id: 'water-to-bleak-beach',
    type: 'water',
    regionId: 'bleak-beach',
  },
  {
    id: 'fire-to-rocky-ridges',
    type: 'fire',
    regionId: 'rocky-ridges',
  },
  {
    id: 'rock-to-rocky-ridges',
    type: 'rock',
    regionId: 'rocky-ridges',
  },
]

const eeveelutionSlugs = new Set([
  'vaporeon',
  'jolteon',
  'flareon',
  'espeon',
  'umbreon',
  'leafeon',
  'glaceon',
  'sylveon',
])

const fossilPokemonSlugs = new Set([
  'omanyte',
  'omastar',
  'kabuto',
  'kabutops',
  'aerodactyl',
  'lileep',
  'cradily',
  'anorith',
  'armaldo',
  'cranidos',
  'rampardos',
  'shieldon',
  'bastiodon',
  'tirtouga',
  'carracosta',
  'archen',
  'archeops',
  'tyrunt',
  'tyrantrum',
  'amaura',
  'aurorus',
  'dracozolt',
  'arctozolt',
  'dracovish',
  'arctovish',
])

const supplementalPokemon = [
  { name: 'Sableye', pokemonId: 302, slug: 'sableye' },
  { name: 'Jirachi', pokemonId: 385, slug: 'jirachi' },
]

const typeOverrides = {
  paldeanwooper: ['poison', 'ground'],
}

const parseCsv = (text) => {
  const [headerLine, ...lines] = text.trim().split(/\r?\n/)
  const headers = headerLine.split(',')

  return lines.map((line) =>
    Object.fromEntries(line.split(',').map((value, index) => [headers[index], value])),
  )
}

const fetchCsv = async (url) => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
  }

  return parseCsv(await response.text())
}

const capturedAt = new Date().toISOString()
const filenameTimestamp = capturedAt.replaceAll(':', '-').replace(/\.\d{3}Z$/, 'Z')
const pokemonCatalog = JSON.parse(fs.readFileSync(pokemonCatalogPath, 'utf8'))
const currentRoster = JSON.parse(fs.readFileSync(currentRosterPath, 'utf8'))

const [pokemonTypes, typeNames, speciesData] = await Promise.all([
  fetchCsv(TYPE_DATA_URL),
  fetchCsv(TYPE_NAMES_URL),
  fetchCsv(SPECIES_DATA_URL),
])

const typeNameById = new Map(
  typeNames.map((entry) => [Number(entry.id), entry.identifier]),
)
const typesByPokemonId = new Map()

for (const entry of pokemonTypes) {
  const pokemonId = Number(entry.pokemon_id)
  const typeName = typeNameById.get(Number(entry.type_id))

  if (!typeName) continue

  const current = typesByPokemonId.get(pokemonId) ?? []
  current.push({ slot: Number(entry.slot), type: typeName })
  typesByPokemonId.set(pokemonId, current)
}

const speciesById = new Map(
  speciesData.map((entry) => [Number(entry.id), entry]),
)
const currentRosterSlugs = new Set(
  Object.values(currentRoster.regions).flatMap((region) =>
    Object.values(region.comfortLevels).flat(),
  ),
)
const catalogSlugs = new Set(pokemonCatalog.pokemon.map((pokemon) => pokemon.slug))
const supplementalResidents = supplementalPokemon.filter(
  (pokemon) => currentRosterSlugs.has(pokemon.slug) && !catalogSlugs.has(pokemon.slug),
)
const eligiblePokemon = [...pokemonCatalog.pokemon, ...supplementalResidents]
  .filter((pokemon) => pokemon.slug !== 'ditto')
  .map((pokemon, index) => {
    const species = speciesById.get(pokemon.pokemonId)
    const types =
      typeOverrides[pokemon.slug] ??
      (typesByPokemonId.get(pokemon.pokemonId) ?? [])
        .sort((left, right) => left.slot - right.slot)
        .map((entry) => entry.type)

    if (types.length === 0) {
      throw new Error(`No type data found for ${pokemon.name} (${pokemon.slug})`)
    }

    return {
      sourceOrder: pokemon.sourceOrder ?? index + 1,
      pokemonId: pokemon.pokemonId,
      name: pokemon.name,
      slug: pokemon.slug,
      types,
      classifications: [
        species?.is_legendary === '1' ? 'legendary' : null,
        species?.is_mythical === '1' ? 'mythical' : null,
        eeveelutionSlugs.has(pokemon.slug) ? 'eeveelution' : null,
        fossilPokemonSlugs.has(pokemon.slug) ? 'fossil' : null,
      ].filter(Boolean),
    }
  })

const regions = Object.fromEntries(
  Object.entries(regionDefinitions).map(([regionId, region]) => [
    regionId,
    { ...region, pokemonCount: 0, pokemon: [] },
  ]),
)
const ambiguousPokemon = []
const unassignedPokemon = []

for (const pokemon of eligiblePokemon) {
  const isLegendary = pokemon.classifications.includes('legendary')
  const isMythical = pokemon.classifications.includes('mythical')
  const isEeveelution = pokemon.classifications.includes('eeveelution')
  const isFossil = pokemon.classifications.includes('fossil')
  const matchedRules = typeRules
    .filter((rule) => pokemon.types.includes(rule.type))
    .map((rule) => ({ id: rule.id, regionId: rule.regionId }))

  if (isFossil) {
    matchedRules.push({ id: 'fossil-to-rocky-ridges', regionId: 'rocky-ridges' })
  }

  if (isLegendary || isEeveelution) {
    const appliedRuleId = isLegendary
      ? 'legendary-override-to-palette-town'
      : 'eeveelution-override-to-palette-town'
    regions['palette-town'].pokemon.push({
      ...pokemon,
      matchedRuleIds: [appliedRuleId, ...matchedRules.map((rule) => rule.id)],
      assignedByRuleId: appliedRuleId,
    })
    continue
  }

  if (pokemon.slug === 'eevee') {
    ambiguousPokemon.push({
      ...pokemon,
      matchedRuleIds: matchedRules.map((rule) => rule.id),
      candidateRegionIds: ['palette-town'],
      ambiguity: 'Eevee is the base species of the Eeveelution group, but is not itself an Eeveelution.',
      decisionNeeded: 'Confirm whether the Eeveelution override should include Eevee.',
    })
    continue
  }

  if (isMythical) {
    ambiguousPokemon.push({
      ...pokemon,
      matchedRuleIds: matchedRules.map((rule) => rule.id),
      candidateRegionIds: Array.from(
        new Set(['palette-town', ...matchedRules.map((rule) => rule.regionId)]),
      ),
      ambiguity: 'The rule names Legendary Pokémon, while the source classifies this Pokémon as Mythical.',
      decisionNeeded: 'Confirm whether the Legendary override should also include Mythical Pokémon.',
    })
    continue
  }

  const candidateRegionIds = Array.from(
    new Set(matchedRules.map((rule) => rule.regionId)),
  )

  if (candidateRegionIds.length === 1) {
    const regionId = candidateRegionIds[0]
    regions[regionId].pokemon.push({
      ...pokemon,
      matchedRuleIds: matchedRules.map((rule) => rule.id),
      assignedByRuleId: matchedRules[0].id,
    })
  } else if (candidateRegionIds.length > 1) {
    ambiguousPokemon.push({
      ...pokemon,
      matchedRuleIds: matchedRules.map((rule) => rule.id),
      candidateRegionIds,
      ambiguity: 'Multiple non-override rules point to different regions.',
      decisionNeeded: 'Choose one of the candidate regions or add an override rule.',
    })
  } else {
    unassignedPokemon.push({
      ...pokemon,
      matchedRuleIds: [],
      reason: 'No supplied assignment rule matches this Pokémon.',
    })
  }
}

for (const region of Object.values(regions)) {
  region.pokemon.sort((left, right) => left.sourceOrder - right.sourceOrder)
  region.pokemonCount = region.pokemon.length
}

ambiguousPokemon.sort((left, right) => left.sourceOrder - right.sourceOrder)
unassignedPokemon.sort((left, right) => left.sourceOrder - right.sourceOrder)

const unassignedTypes = Array.from(
  new Set(unassignedPokemon.flatMap((pokemon) => pokemon.types)),
).sort()
const unassignedGroups = unassignedTypes.map((type) => {
  const pokemon = unassignedPokemon.filter((entry) => entry.types.includes(type))

  return {
    groupBy: 'elemental-type',
    value: type,
    pokemonCount: pokemon.length,
    pokemonSlugs: pokemon.map((entry) => entry.slug),
  }
})
const assignedCount = Object.values(regions).reduce(
  (total, region) => total + region.pokemonCount,
  0,
)

const snapshot = {
  schemaVersion: 1,
  snapshotId: `type-rules-${filenameTimestamp}`,
  capturedAt,
  title: 'Type-based roster ideation',
  sourceNote: 'Complete immutable roster snapshot generated from Linda’s stated placement rules. No prior roster placements were carried forward.',
  sourceData: {
    pokemonCatalog: 'data/pokemon.json',
    supplementalResidentsFrom: 'data/current-region-roster.json',
    typeData: TYPE_DATA_URL,
    typeNames: TYPE_NAMES_URL,
    legendaryAndMythicalData: SPECIES_DATA_URL,
    fossilClassification: 'Canonical revived Fossil Pokémon and their evolutions.',
    excludedFromResidentUniverse: [
      {
        slug: 'ditto',
        reason: 'Ditto represents the player avatar in the captured roster rather than a resident Pokémon.',
      },
    ],
  },
  assignmentPolicy: {
    precedence: [
      'Legendary and Eeveelution overrides',
      'Single-destination type or fossil rules',
      'Ambiguous review',
      'Unassigned review',
    ],
    dualTypePolicy: 'Assign when all matching rules agree on one region; otherwise place the Pokémon in ambiguousPokemon.',
    mythicalPolicy: 'Do not silently treat Mythical as Legendary; place Mythical Pokémon in ambiguousPokemon for confirmation.',
  },
  rules: [
    {
      id: 'legendary-override-to-palette-town',
      priority: 100,
      kind: 'override',
      description: 'All Legendary Pokémon go to Palette Town.',
      regionId: 'palette-town',
    },
    {
      id: 'eeveelution-override-to-palette-town',
      priority: 100,
      kind: 'override',
      description: 'All eight evolved forms of Eevee go to Palette Town.',
      regionId: 'palette-town',
    },
    {
      id: 'grass-to-withered-wastelands',
      priority: 10,
      kind: 'type',
      description: 'All Grass-type Pokémon go to Withered Wastelands.',
      regionId: 'withered-wastelands',
    },
    {
      id: 'water-to-bleak-beach',
      priority: 10,
      kind: 'type',
      description: 'All Water-type Pokémon go to Bleak Beach.',
      regionId: 'bleak-beach',
    },
    {
      id: 'fire-to-rocky-ridges',
      priority: 10,
      kind: 'type',
      description: 'All Fire-type Pokémon go to Rocky Ridges.',
      regionId: 'rocky-ridges',
    },
    {
      id: 'rock-to-rocky-ridges',
      priority: 10,
      kind: 'type',
      description: 'All Rock-type Pokémon go to Rocky Ridges.',
      regionId: 'rocky-ridges',
    },
    {
      id: 'fossil-to-rocky-ridges',
      priority: 10,
      kind: 'group',
      description: 'All Fossil Pokémon go to Rocky Ridges.',
      regionId: 'rocky-ridges',
    },
  ],
  summary: {
    eligiblePokemonCount: eligiblePokemon.length,
    assignedPokemonCount: assignedCount,
    ambiguousPokemonCount: ambiguousPokemon.length,
    unassignedPokemonCount: unassignedPokemon.length,
    regionCounts: Object.fromEntries(
      Object.entries(regions).map(([regionId, region]) => [
        regionId,
        region.pokemonCount,
      ]),
    ),
  },
  regions,
  unresolved: {
    ambiguousPokemon,
    unassignedPokemon,
    unassignedGroups,
    unassignedGroupNote: 'Pokémon with two types appear in both relevant type groups.',
  },
  validation: {
    everyEligiblePokemonAccountedFor:
      assignedCount + ambiguousPokemon.length + unassignedPokemon.length ===
      eligiblePokemon.length,
    duplicateAssignedSlugs: Object.values(regions)
      .flatMap((region) => region.pokemon.map((pokemon) => pokemon.slug))
      .filter((slug, index, slugs) => slugs.indexOf(slug) !== index),
  },
}

fs.mkdirSync(snapshotDirectory, { recursive: true })
const outputPath = path.join(snapshotDirectory, `${filenameTimestamp}.json`)
fs.writeFileSync(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`)
console.log(path.relative(projectRoot, outputPath))
