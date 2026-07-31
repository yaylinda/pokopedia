import rosterConstraintsJson from '../../data/roster-constraints.json'
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
