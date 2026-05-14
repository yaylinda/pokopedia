import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  habitats,
  pokemonBySlug,
  requirementsByHabitatId,
  spawnsByHabitatId,
} from '../../../data/pokopia'
import { normalizeSearch } from '../../../utils/format'

const getHabitatIdFromParam = (habitatId: string | null) => {
  if (!habitatId) {
    return null
  }

  const numericId = Number(habitatId)

  return habitats.some((habitat) => habitat.habitatId === numericId)
    ? numericId
    : null
}

export function useHabitatsState() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [habitatQuery, setHabitatQuery] = useState('')
  const selectedHabitatId =
    getHabitatIdFromParam(searchParams.get('habitatId')) ??
    habitats[0]?.habitatId ??
    1
  const hasSelectedHabitatParam = searchParams.has('habitatId')
  const [isIndexExpanded, setIsIndexExpanded] = useState(false)
  const isIndexCollapsed = hasSelectedHabitatParam && !isIndexExpanded

  const filteredHabitats = useMemo(() => {
    const query = normalizeSearch(habitatQuery)

    return habitats.filter((habitat) => {
      const requirements =
        requirementsByHabitatId.get(habitat.habitatId)?.requirements ?? []
      const spawns = spawnsByHabitatId.get(habitat.habitatId)?.spawns ?? []

      return (
        !query ||
        habitat.name.toLowerCase().includes(query) ||
        habitat.description.toLowerCase().includes(query) ||
        requirements.some((requirement) =>
          requirement.itemName.toLowerCase().includes(query),
        ) ||
        spawns.some((spawn) => spawn.pokemonName.toLowerCase().includes(query))
      )
    })
  }, [habitatQuery])

  const selectedHabitat =
    habitats.find((habitat) => habitat.habitatId === selectedHabitatId) ??
    filteredHabitats[0] ??
    habitats[0]
  const selectedHabitatRequirements =
    requirementsByHabitatId.get(selectedHabitat.habitatId)?.requirements ?? []
  const selectedHabitatSpawns =
    spawnsByHabitatId.get(selectedHabitat.habitatId)?.spawns ?? []

  const selectHabitat = (habitatId: number) => {
    setSearchParams({ habitatId: String(habitatId) })
    setIsIndexExpanded(false)
  }

  const selectPokemon = (slug: string) => {
    const pokemonId = pokemonBySlug.get(slug)?.pokemonId

    navigate(`/pokemon${pokemonId ? `?pokemonId=${pokemonId}` : ''}`)
  }

  return {
    filteredHabitats,
    habitatQuery,
    isIndexCollapsed,
    selectHabitat,
    selectPokemon,
    selectedHabitat,
    selectedHabitatRequirements,
    selectedHabitatSpawns,
    setHabitatQuery,
    toggleIndex: () => setIsIndexExpanded((isExpanded) => !isExpanded),
  }
}
