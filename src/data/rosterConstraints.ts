import rosterConstraintsJson from '../../data/roster-constraints.json'
import pokemonJson from '../../data/pokemon.json'
import { currentRegionRoster } from './currentRegionRoster'

export type RosterConstraintEdge = {
  source: string
  target: string
}

type RosterConstraintsData = {
  schemaVersion: number
  generatedAt: string
  source: string
  constraints: {
    id: string
    label: string
    strength: 'must'
    edges: RosterConstraintEdge[]
  }[]
}

const data = rosterConstraintsJson as RosterConstraintsData
const pokemonCatalog = pokemonJson as {
  pokemon: {
    pokemonId: number
    slug: string
  }[]
}
const rosterSlugs = new Set(
  currentRegionRoster.regions.flatMap((region) =>
    region.pokemon.map((pokemon) => pokemon.slug),
  ),
)

export const evolutionConstraint = {
  ...data.constraints[0],
  edges: data.constraints[0].edges.filter(
    (edge) => rosterSlugs.has(edge.source) && rosterSlugs.has(edge.target),
  ),
}

const canonicalAdjacency = new Map<string, Set<string>>()

const ensureCanonicalNode = (slug: string) => {
  if (!canonicalAdjacency.has(slug)) canonicalAdjacency.set(slug, new Set())
}

const connectCanonicalNodes = (source: string, target: string) => {
  ensureCanonicalNode(source)
  ensureCanonicalNode(target)
  canonicalAdjacency.get(source)!.add(target)
  canonicalAdjacency.get(target)!.add(source)
}

for (const pokemon of pokemonCatalog.pokemon) ensureCanonicalNode(pokemon.slug)

for (const edge of data.constraints[0].edges) {
  connectCanonicalNodes(edge.source, edge.target)
}

const slugsByPokemonId = new Map<number, string[]>()

for (const pokemon of pokemonCatalog.pokemon) {
  const slugs = slugsByPokemonId.get(pokemon.pokemonId) ?? []
  slugs.push(pokemon.slug)
  slugsByPokemonId.set(pokemon.pokemonId, slugs)
}

for (const slugs of slugsByPokemonId.values()) {
  const [firstSlug, ...formSlugs] = slugs
  if (!firstSlug) continue
  for (const formSlug of formSlugs) connectCanonicalNodes(firstSlug, formSlug)
}

const canonicalComponentBySlug = new Map<string, string[]>()
const canonicalVisited = new Set<string>()
const canonicalEvolutionLines: string[][] = []

for (const slug of canonicalAdjacency.keys()) {
  if (canonicalVisited.has(slug)) continue

  const component: string[] = []
  const pending = [slug]

  while (pending.length > 0) {
    const current = pending.pop()!
    if (canonicalVisited.has(current)) continue
    canonicalVisited.add(current)
    component.push(current)
    pending.push(...(canonicalAdjacency.get(current) ?? []))
  }

  component.sort((left, right) => left.localeCompare(right))
  canonicalEvolutionLines.push(component)
  for (const memberSlug of component) {
    canonicalComponentBySlug.set(memberSlug, component)
  }
}

canonicalEvolutionLines.sort((left, right) =>
  left[0].localeCompare(right[0]),
)

/**
 * Complete, unordered evolution families for the checked-in Pokemon catalog.
 * Families are resolved before any current-roster or region filtering, so an
 * absent middle stage does not split its present relatives into two groups.
 */
export { canonicalEvolutionLines }

export const getCanonicalEvolutionLine = (slug: string) =>
  canonicalComponentBySlug.get(slug) ?? [slug]

const adjacency = new Map<string, Set<string>>()

for (const edge of evolutionConstraint.edges) {
  const sourceNeighbors = adjacency.get(edge.source) ?? new Set<string>()
  sourceNeighbors.add(edge.target)
  adjacency.set(edge.source, sourceNeighbors)

  const targetNeighbors = adjacency.get(edge.target) ?? new Set<string>()
  targetNeighbors.add(edge.source)
  adjacency.set(edge.target, targetNeighbors)
}

const componentBySlug = new Map<string, string[]>()
const visited = new Set<string>()

for (const slug of adjacency.keys()) {
  if (visited.has(slug)) continue

  const component: string[] = []
  const pending = [slug]

  while (pending.length > 0) {
    const current = pending.pop()!
    if (visited.has(current)) continue
    visited.add(current)
    component.push(current)
    pending.push(...(adjacency.get(current) ?? []))
  }

  component.sort()
  for (const memberSlug of component) componentBySlug.set(memberSlug, component)
}

export const getEvolutionConstraintGroup = (slug: string) =>
  componentBySlug.get(slug) ?? [slug]

export const evolutionConstraintGroups = Array.from(
  new Map(
    [...componentBySlug.values()].map((component) => [component.join(':'), component]),
  ).values(),
)

export const rosterConstraintGraph = {
  nodeCount: rosterSlugs.size,
  edgeCount: evolutionConstraint.edges.length,
  connectedEvolutionLines: evolutionConstraintGroups.length,
}
