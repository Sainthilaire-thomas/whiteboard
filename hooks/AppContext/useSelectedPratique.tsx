import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Pratique } from "@/types/types";

export function useSelectedPratique() {
  const [selectedPratique, setSelectedPratique] = useState<Pratique | null>(
    null
  );
  const { fetchNudgesForPractice } = useAppContext();

  const handlePratiqueClick = (pratique: Pratique) => {
    setSelectedPratique(pratique);
    fetchNudgesForPractice(pratique.idpratique);
  };

  return { selectedPratique, handlePratiqueClick };
}
