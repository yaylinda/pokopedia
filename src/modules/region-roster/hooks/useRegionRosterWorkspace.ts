import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { currentRegionRoster } from '../../../data/currentRegionRoster'
import {
  evolutionConstraintGroups,
  getEvolutionConstraintGroup,
} from '../../../data/rosterConstraints'
import { useUserData } from '../../../data/userDataContext'
import {
  allRosterPokemon,
  allRosterPokemonBySlug,
  buildHabitatGroups,
  matchesRosterQuery,
  regionOrder,
  regionStyles,
} from '../regionRosterConfig'

export function useRegionRosterWorkspace() {
  const {
    pokemonStatsBySlug,
    resetRosterModel,
    rosterRegionOverrides,
    setPokemonRosterRegion,
    updatePokemonStats,
  } = useUserData()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedRegionId = searchParams.get('region')
  const selectedRegionId =
    requestedRegionId && regionOrder.includes(requestedRegionId)
      ? requestedRegionId
      : regionOrder[0]
  const [query, setQuery] = useState('')
  const [expandedKey, setExpandedKey] = useState<string | null>(null)

  useEffect(() => {
    if (requestedRegionId === selectedRegionId) return

    const nextSearchParams = new URLSearchParams(searchParams)
    nextSearchParams.set('region', selectedRegionId)
    setSearchParams(nextSearchParams, { replace: true })
  }, [requestedRegionId, searchParams, selectedRegionId, setSearchParams])

  const effectiveStatsBySlug = useMemo(
    () =>
      Object.fromEntries(
        allRosterPokemon.map((pokemon) => [
          pokemon.slug,
          pokemonStatsBySlug[pokemon.slug] ?? pokemon.lindaStats,
        ]),
      ),
    [pokemonStatsBySlug],
  )

  const modeledRegions = useMemo(
    () =>
      regionOrder.flatMap((regionId) => {
        const region = currentRegionRoster.regions.find(
          (entry) => entry.regionId === regionId,
        )

        return region
          ? [
              {
                ...region,
                pokemon: allRosterPokemon.filter(
                  (pokemon) =>
                    (rosterRegionOverrides[pokemon.slug] ?? pokemon.regionId) ===
                    region.regionId,
                ),
              },
            ]
          : []
      }),
    [rosterRegionOverrides],
  )

  const evolutionViolationCount = useMemo(
    () =>
      evolutionConstraintGroups.filter(
        (group) =>
          new Set(
            group.flatMap((slug) => {
              const pokemon = allRosterPokemonBySlug.get(slug)

              return pokemon
                ? [rosterRegionOverrides[slug] ?? pokemon.regionId]
                : []
            }),
          ).size > 1,
      ).length,
    [rosterRegionOverrides],
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
      const member = allRosterPokemonBySlug.get(slug)

      if (!member) return

      setPokemonRosterRegion(
        slug,
        regionId === member.regionId ? null : regionId,
      )
      updatePokemonStats(slug, {
        ...(effectiveStatsBySlug[slug] ?? member.lindaStats),
        belongsInCurrentRegion: null,
      })
    })
  }

  return {
    chooseRegion,
    effectiveStatsBySlug,
    evolutionViolationCount,
    expandedKey,
    filteredPokemon,
    groups,
    modeledRegions,
    moveCount: Object.keys(rosterRegionOverrides).length,
    movePokemon,
    query,
    regionStyle,
    resetRosterModel,
    selectedRegion,
    setExpandedKey,
    setQuery,
    updatePokemonStats,
  }
}
