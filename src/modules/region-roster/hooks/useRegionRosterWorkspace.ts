import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  evolutionConstraintGroups,
  getEvolutionConstraintGroup,
} from '../../../data/rosterConstraints'
import { getRosterSnapshot } from '../../../data/rosterSnapshots'
import { useUserData } from '../../../data/userDataContext'
import {
  buildHabitatGroups,
  matchesRosterQuery,
  regionOrder,
  regionStyles,
} from '../regionRosterConfig'

export function useRegionRosterWorkspace() {
  const {
    pokemonStatsBySlug,
    rosterRegionOverrides,
    setPokemonRosterRegion,
    updatePokemonStats,
  } = useUserData()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedSnapshotId = searchParams.get('snapshot')
  const selectedSnapshot = getRosterSnapshot(requestedSnapshotId)
  const requestedRegionId = searchParams.get('region')
  const selectedRegionId =
    requestedRegionId && regionOrder.includes(requestedRegionId)
      ? requestedRegionId
      : regionOrder[0]
  const [query, setQuery] = useState('')
  const [expandedKey, setExpandedKey] = useState<string | null>(null)
  const snapshotPokemon = useMemo(
    () => selectedSnapshot.regions.flatMap((region) => region.pokemon),
    [selectedSnapshot],
  )
  const snapshotPokemonBySlug = useMemo(
    () => new Map(snapshotPokemon.map((pokemon) => [pokemon.slug, pokemon])),
    [snapshotPokemon],
  )
  const getOverrideKey = useCallback(
    (slug: string) =>
      selectedSnapshot.kind === 'current'
        ? slug
        : `${selectedSnapshot.snapshotId}:${slug}`,
    [selectedSnapshot.kind, selectedSnapshot.snapshotId],
  )

  useEffect(() => {
    const nextSearchParams = new URLSearchParams(searchParams)
    let needsRepair = false

    if (requestedRegionId !== selectedRegionId) {
      nextSearchParams.set('region', selectedRegionId)
      needsRepair = true
    }

    if (
      requestedSnapshotId &&
      requestedSnapshotId !== selectedSnapshot.snapshotId
    ) {
      nextSearchParams.delete('snapshot')
      needsRepair = true
    }

    if (!needsRepair) return

    setSearchParams(nextSearchParams, { replace: true })
  }, [
    requestedRegionId,
    requestedSnapshotId,
    searchParams,
    selectedRegionId,
    selectedSnapshot.snapshotId,
    setSearchParams,
  ])

  const effectiveStatsBySlug = useMemo(
    () =>
      Object.fromEntries(
        snapshotPokemon.map((pokemon) => {
          const savedStats = pokemonStatsBySlug[pokemon.slug]

          return [
            pokemon.slug,
            savedStats
              ? {
                  ...pokemon.lindaStats,
                  ...savedStats,
                  usefulnessRating:
                    savedStats.usefulnessRating ??
                    pokemon.lindaStats.usefulnessRating,
                }
              : pokemon.lindaStats,
          ]
        }),
      ),
    [pokemonStatsBySlug, snapshotPokemon],
  )

  const modeledRegions = useMemo(
    () =>
      regionOrder.flatMap((regionId) => {
        const region = selectedSnapshot.regions.find(
          (entry) => entry.regionId === regionId,
        )

        return region
          ? [
              {
                ...region,
                pokemon: snapshotPokemon.filter(
                  (pokemon) =>
                    (rosterRegionOverrides[getOverrideKey(pokemon.slug)] ??
                      pokemon.regionId) ===
                    region.regionId,
                ),
              },
            ]
          : []
      }),
    [getOverrideKey, rosterRegionOverrides, selectedSnapshot, snapshotPokemon],
  )

  const evolutionViolationCount = useMemo(
    () =>
      evolutionConstraintGroups.filter(
        (group) =>
          new Set(
            group.flatMap((slug) => {
              const pokemon = snapshotPokemonBySlug.get(slug)

              return pokemon
                ? [
                    rosterRegionOverrides[getOverrideKey(slug)] ??
                      pokemon.regionId,
                  ]
                : []
            }),
          ).size > 1,
      ).length,
    [getOverrideKey, rosterRegionOverrides, snapshotPokemonBySlug],
  )

  const selectedRegion =
    modeledRegions.find((region) => region.regionId === selectedRegionId) ??
    modeledRegions[0]
  const regionStyle = regionStyles[selectedRegion.regionId]
  const filteredPokemon = useMemo(
    () =>
      selectedRegion.pokemon.filter((pokemon) =>
        matchesRosterQuery(pokemon, query),
      ),
    [query, selectedRegion],
  )
  const groups = useMemo(
    () => buildHabitatGroups(filteredPokemon),
    [filteredPokemon],
  )

  const chooseRegion = (regionId: string) => {
    const nextSearchParams = new URLSearchParams(searchParams)
    nextSearchParams.set('region', regionId)
    setSearchParams(nextSearchParams)
    setExpandedKey(null)
  }

  const movePokemon = (pokemonSlug: string, regionId: string) => {
    getEvolutionConstraintGroup(pokemonSlug).forEach((slug) => {
      const member = snapshotPokemonBySlug.get(slug)

      if (!member) return

      setPokemonRosterRegion(
        getOverrideKey(slug),
        regionId === member.regionId ? null : regionId,
      )
      updatePokemonStats(slug, {
        ...(effectiveStatsBySlug[slug] ?? member.lindaStats),
        belongsInCurrentRegion: null,
      })
    })
  }

  const snapshotOverrideKeys = Object.keys(rosterRegionOverrides).filter(
    (key) =>
      selectedSnapshot.kind === 'current'
        ? snapshotPokemonBySlug.has(key)
        : key.startsWith(`${selectedSnapshot.snapshotId}:`),
  )
  const resetSelectedRosterModel = () => {
    snapshotOverrideKeys.forEach((key) => setPokemonRosterRegion(key, null))
  }

  return {
    chooseRegion,
    effectiveStatsBySlug,
    evolutionViolationCount,
    expandedKey,
    filteredPokemon,
    groups,
    modeledRegions,
    moveCount: snapshotOverrideKeys.length,
    movePokemon,
    query,
    regionStyle,
    resetRosterModel: resetSelectedRosterModel,
    selectedRegion,
    selectedSnapshot,
    setExpandedKey,
    setQuery,
    updatePokemonStats,
  }
}
