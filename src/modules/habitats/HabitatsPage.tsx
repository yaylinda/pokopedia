import { HabitatExplorer } from './components/HabitatExplorer'
import { useHabitatsState } from './hooks/useHabitatsState'

export function HabitatsPage() {
  const state = useHabitatsState()

  return (
    <HabitatExplorer
      filteredHabitats={state.filteredHabitats}
      habitatQuery={state.habitatQuery}
      isIndexCollapsed={state.isIndexCollapsed}
      onHabitatQueryChange={state.setHabitatQuery}
      onIndexToggle={state.toggleIndex}
      onSelectHabitat={state.selectHabitat}
      onSelectPokemon={state.selectPokemon}
      selectedHabitat={state.selectedHabitat}
      selectedHabitatRequirements={state.selectedHabitatRequirements}
      selectedHabitatSpawns={state.selectedHabitatSpawns}
    />
  )
}
