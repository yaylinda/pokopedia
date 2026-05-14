import { HousePlanner } from './components/HousePlanner'
import { useHousePlannerState } from './hooks/useHousePlannerState'

export function PlannerPage() {
  const state = useHousePlannerState()

  return (
    <HousePlanner
      draftName={state.draftName}
      draftPokemon={state.draftPokemon}
      draftSummary={state.draftSummary}
      houseSearchQuery={state.houseSearchQuery}
      onDeleteHouse={state.deleteSavedHouse}
      onDraftNameChange={state.setHouseDraftName}
      onHouseSearchQueryChange={state.setHouseSearchQuery}
      onLoadHouse={state.loadHouse}
      onNewHouse={state.clearHouseDraft}
      onRosterModeChange={state.setPlannerRosterMode}
      onSaveHouse={state.saveDraft}
      onToggleDraftPokemon={state.toggleDraftPokemon}
      ownedSet={state.ownedSet}
      plannerRosterMode={state.plannerRosterMode}
      pokemonOptions={state.pokemonOptions}
      savedHouses={state.savedHouses}
      selectedSavedHouseId={state.selectedSavedHouseId}
    />
  )
}
