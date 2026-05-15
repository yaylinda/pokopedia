import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useUserData } from '../../../data/userDataContext'
import {
  favoriteCategoryById,
  idealHabitats,
  pokemonProfiles,
  spawnRecordsByPokemonSlug,
} from '../../../data/pokopia'
import { normalizeSearch } from '../../../utils/format'
import type { OwnedFilter } from '../components/PokemonExplorer'

const getPokemonSlugFromParam = (pokemonId: string | null) => {
  if (!pokemonId) {
    return null
  }

  return (
    pokemonProfiles.find(
      (entry) =>
        String(entry.pokemonId) === pokemonId ||
        entry.pokemonIdDisplay === pokemonId ||
        entry.slug === pokemonId,
    )?.slug ?? null
  )
}

export function usePokedexState() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { ownedSet, toggleOwned } = useUserData()
  const [pokemonQuery, setPokemonQuery] = useState('')
  const [idealFilter, setIdealFilter] = useState('all')
  const [ownedFilter, setOwnedFilter] = useState<OwnedFilter>('all')
  const selectedPokemonSlug =
    getPokemonSlugFromParam(searchParams.get('pokemonId')) ??
    pokemonProfiles[0]?.slug ??
    ''
  const hasSelectedPokemonParam = searchParams.has('pokemonId')
  const [isIndexExpanded, setIsIndexExpanded] = useState(false)
  const isIndexCollapsed = hasSelectedPokemonParam && !isIndexExpanded

  const filteredPokemon = useMemo(() => {
    const query = normalizeSearch(pokemonQuery)

    return pokemonProfiles.filter((entry) => {
      const matchesQuery =
        !query ||
        entry.name.toLowerCase().includes(query) ||
        entry.pokopiaNumberDisplay.toLowerCase().includes(query) ||
        entry.specialties.some((specialty) =>
          specialty.name.toLowerCase().includes(query),
        ) ||
        entry.favorites.some((favorite) =>
          favorite.name.toLowerCase().includes(query),
        )
      const matchesIdeal =
        idealFilter === 'all' ||
        entry.idealHabitat?.idealHabitatId === idealFilter
      const matchesOwned =
        ownedFilter === 'all' ||
        (ownedFilter === 'owned' && ownedSet.has(entry.slug)) ||
        (ownedFilter === 'missing' && !ownedSet.has(entry.slug))

      return matchesQuery && matchesIdeal && matchesOwned
    })
  }, [idealFilter, ownedFilter, ownedSet, pokemonQuery])

  const selectedPokemon =
    pokemonProfiles.find((entry) => entry.slug === selectedPokemonSlug) ??
    filteredPokemon[0] ??
    pokemonProfiles[0]
  const selectedPokemonSpawns =
    spawnRecordsByPokemonSlug.get(selectedPokemon.slug) ?? []
  const selectedFavoriteDetails = selectedPokemon.favorites.map((favorite) => {
    const category = favoriteCategoryById.get(favorite.favoriteId)

    return {
      ...favorite,
      itemCount: category?.itemCount ?? 0,
      items: category?.items ?? [],
    }
  })

  const selectPokemon = (slug: string) => {
    const pokemonId =
      pokemonProfiles.find((entry) => entry.slug === slug)?.pokemonId ?? slug

    setSearchParams({ pokemonId: String(pokemonId) })
    setIsIndexExpanded(false)
  }

  return {
    filteredPokemon,
    idealFilter,
    idealHabitats,
    isIndexCollapsed,
    ownedFilter,
    ownedSet,
    pokemonQuery,
    selectedFavoriteDetails,
    selectedPokemon,
    selectedPokemonSpawns,
    selectPokemon,
    setIdealFilter,
    setOwnedFilter,
    setPokemonQuery,
    toggleIndex: () => setIsIndexExpanded((isExpanded) => !isExpanded),
    toggleOwned,
  }
}
