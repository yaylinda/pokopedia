import { PokemonExplorer } from './components/PokemonExplorer'
import { usePokedexState } from './hooks/usePokedexState'

export function PokedexPage() {
  const state = usePokedexState()

  return (
    <PokemonExplorer
      favoriteDetails={state.selectedFavoriteDetails}
      filteredPokemon={state.filteredPokemon}
      idealFilter={state.idealFilter}
      idealHabitats={state.idealHabitats}
      isIndexCollapsed={state.isIndexCollapsed}
      isSelectedOwned={state.ownedSet.has(state.selectedPokemon.slug)}
      onIdealFilterChange={state.setIdealFilter}
      onIndexToggle={state.toggleIndex}
      onOwnedFilterChange={state.setOwnedFilter}
      onPokemonQueryChange={state.setPokemonQuery}
      onSelectPokemon={state.selectPokemon}
      onSpecialtyFilterChange={state.setSpecialtyFilter}
      onToggleOwned={state.toggleOwned}
      ownedFilter={state.ownedFilter}
      ownedSet={state.ownedSet}
      pokemonQuery={state.pokemonQuery}
      selectedPokemon={state.selectedPokemon}
      selectedPokemonSpawns={state.selectedPokemonSpawns}
      specialties={state.specialties}
      specialtyFilter={state.specialtyFilter}
    />
  )
}
