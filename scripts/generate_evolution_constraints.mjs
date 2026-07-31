import { readFile, writeFile } from 'node:fs/promises'

const pokemonDataset = JSON.parse(
  await readFile(new URL('../data/pokemon.json', import.meta.url), 'utf8'),
)
const pokemon = pokemonDataset.pokemon.filter((entry) => entry.slug !== 'ditto')
const slugsBySpeciesId = new Map()

for (const entry of pokemon) {
  const slugs = slugsBySpeciesId.get(entry.pokemonId) ?? []
  slugs.push(entry.slug)
  slugsBySpeciesId.set(entry.pokemonId, slugs)
}

const fetchJson = async (url) => {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`${response.status} ${url}`)
  return response.json()
}

const mapWithConcurrency = async (values, concurrency, mapper) => {
  const results = new Array(values.length)
  let nextIndex = 0

  const worker = async () => {
    while (nextIndex < values.length) {
      const index = nextIndex
      nextIndex += 1
      results[index] = await mapper(values[index])
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker))
  return results
}

const speciesIds = [...slugsBySpeciesId.keys()]
const species = await mapWithConcurrency(speciesIds, 16, (speciesId) =>
  fetchJson(`https://pokeapi.co/api/v2/pokemon-species/${speciesId}`),
)
const evolutionChainUrls = [
  ...new Set(species.map((entry) => entry.evolution_chain.url)),
]
const chains = await mapWithConcurrency(evolutionChainUrls, 12, fetchJson)
const edgeKeys = new Set()
const edges = []

const speciesIdFromUrl = (url) => Number(url.match(/\/(\d+)\/$/)?.[1])

const addEdge = (fromSlug, toSlug) => {
  const [source, target] = [fromSlug, toSlug].sort()
  const key = `${source}:${target}`
  if (edgeKeys.has(key)) return
  edgeKeys.add(key)
  edges.push({ source, target })
}

const visitChain = (node) => {
  const sourceSlugs = slugsBySpeciesId.get(speciesIdFromUrl(node.species.url)) ?? []

  for (const evolution of node.evolves_to) {
    const targetSlugs =
      slugsBySpeciesId.get(speciesIdFromUrl(evolution.species.url)) ?? []

    for (const sourceSlug of sourceSlugs) {
      for (const targetSlug of targetSlugs) addEdge(sourceSlug, targetSlug)
    }

    visitChain(evolution)
  }
}

for (const chain of chains) visitChain(chain.chain)

edges.sort(
  (left, right) =>
    left.source.localeCompare(right.source) || left.target.localeCompare(right.target),
)

const output = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString().slice(0, 10),
  source: 'https://pokeapi.co/api/v2/evolution-chain/',
  constraints: [
    {
      id: 'evolution-lines-together',
      label: 'Keep evolution lines together',
      strength: 'must',
      edges,
    },
  ],
}

await writeFile(
  new URL('../data/roster-constraints.json', import.meta.url),
  `${JSON.stringify(output, null, 2)}\n`,
)

console.log(`Wrote ${edges.length} evolution edges across ${pokemon.length} nodes.`)
