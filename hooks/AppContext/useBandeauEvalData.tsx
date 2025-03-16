import { useAppContext } from "@/context/AppContext";
import { useFilteredDomains } from "@/hooks/AppContext/useFilteredDomains";
import { useSelectedPratique } from "@/hooks/AppContext/useSelectedPratique";

export function useBandeauEvalData(selectedEntreprise: number | null) {
  const {
    selectedDomain,
    selectDomain,
    isLoadingDomains,
    categoriesPratiques,
    pratiques,
    categoriesSujets,
    sujetsData,
    nudges,
  } = useAppContext();

  const { filteredDomains } = useFilteredDomains(selectedEntreprise);
  const { selectedPratique, handlePratiqueClick } = useSelectedPratique();

  return {
    selectedDomain,
    selectDomain,
    isLoadingDomains,
    categoriesPratiques,
    pratiques,
    categoriesSujets,
    sujetsData,
    nudges,
    filteredDomains,
    selectedPratique,
    handlePratiqueClick,
  };
}
