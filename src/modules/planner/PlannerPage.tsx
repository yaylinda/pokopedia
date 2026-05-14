import { HousePlanner } from './components/HousePlanner'
import { useHousePlannerState } from './hooks/useHousePlannerState'

export function PlannerPage() {
  const state = useHousePlannerState()

  return (
    <HousePlanner
      draftName={state.draftName}
      draftPokemon={state.draftPokemon}
      draftSummary={state.draftSummary}
      onDeleteHouse={state.deleteSavedHouse}
      onDraftNameChange={state.setHouseDraftName}
      onLoadHouse={state.loadHouse}
      onNewHouse={state.clearHouseDraft}
      onSaveHouse={state.saveDraft}
      onToggleDraftPokemon={state.toggleDraftPokemon}
      pokemonOptions={state.pokemonOptions}
      savedHouses={state.savedHouses}
      selectedSavedHouseId={state.selectedSavedHouseId}
    />
  )
}
