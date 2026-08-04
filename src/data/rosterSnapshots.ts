import {
  createRegionRosterPokemon,
  currentRegionRoster,
  type CurrentRegion,
} from './currentRegionRoster'

const regionDefinitions = [
  { regionId: 'withered-wastelands', name: 'Withered Wastelands' },
  { regionId: 'bleak-beach', name: 'Bleak Beach' },
  { regionId: 'rocky-ridges', name: 'Rocky Ridges' },
  { regionId: 'sparkling-skylands', name: 'Sparkling Skylands' },
  { regionId: 'palette-town', name: 'Palette Town' },
]

type SnapshotPokemon = {
  slug: string
  name: string
  types: string[]
}

type RosterSnapshotJson = {
  snapshotId: string
  capturedAt: string
  title: string
  sourceNote: string
  summary: {
    eligiblePokemonCount: number
    assignedPokemonCount: number
    ambiguousPokemonCount: number
    unassignedPokemonCount: number
  }
  regions: Record<
    string,
    {
      name: string
      pokemon: SnapshotPokemon[]
    }
  >
  unresolved: {
    ambiguousPokemon: SnapshotPokemon[]
    unassignedPokemon: SnapshotPokemon[]
  }
}

export type RosterSnapshot = {
  snapshotId: string
  capturedAt: string
  title: string
  sourceFile: string
  sourceNote: string
  kind: 'current' | 'ideation'
  regions: CurrentRegion[]
  eligiblePokemonCount: number
  assignedPokemonCount: number
  ambiguousPokemonCount: number
  unassignedPokemonCount: number
}

const timestampedSnapshotModules = import.meta.glob(
  '../../data/roster-snapshots/*.json',
  { eager: true, import: 'default' },
) as Record<string, RosterSnapshotJson>

const currentSnapshot: RosterSnapshot = {
  snapshotId: 'current-region-roster',
  capturedAt: `${currentRegionRoster.updatedAt}T00:00:00Z`,
  title: 'Current in-game roster',
  sourceFile: 'data/current-region-roster.json',
  sourceNote: currentRegionRoster.sourceNote,
  kind: 'current',
  regions: currentRegionRoster.regions,
  eligiblePokemonCount: currentRegionRoster.uniquePokemonCount,
  assignedPokemonCount: currentRegionRoster.uniquePokemonCount,
  ambiguousPokemonCount: 0,
  unassignedPokemonCount: 0,
}

const timestampedSnapshots = Object.entries(timestampedSnapshotModules)
  .map(([sourcePath, snapshot]): RosterSnapshot => ({
    snapshotId: snapshot.snapshotId,
    capturedAt: snapshot.capturedAt,
    title: snapshot.title,
    sourceFile: sourcePath.replace('../../', ''),
    sourceNote: snapshot.sourceNote,
    kind: 'ideation',
    regions: regionDefinitions.map(({ regionId, name }) => ({
      regionId,
      name: snapshot.regions[regionId]?.name ?? name,
      environmentLevel: { current: 10, isMax: true },
      pokemon: (snapshot.regions[regionId]?.pokemon ?? []).map((pokemon) =>
        createRegionRosterPokemon({
          regionId,
          regionName: snapshot.regions[regionId]?.name ?? name,
          slug: pokemon.slug,
        }),
      ),
    })),
    eligiblePokemonCount: snapshot.summary.eligiblePokemonCount,
    assignedPokemonCount: snapshot.summary.assignedPokemonCount,
    ambiguousPokemonCount: snapshot.summary.ambiguousPokemonCount,
    unassignedPokemonCount: snapshot.summary.unassignedPokemonCount,
  }))
  .sort((left, right) => right.capturedAt.localeCompare(left.capturedAt))

export const rosterSnapshots = [currentSnapshot, ...timestampedSnapshots]

export const getRosterSnapshot = (snapshotId: string | null) =>
  rosterSnapshots.find((snapshot) => snapshot.snapshotId === snapshotId) ??
  currentSnapshot
