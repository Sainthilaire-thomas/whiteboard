"use client";
import { useCallback, useEffect } from "react";
import { useCallData } from "@/context/CallDataContext";
import { useAppContext } from "@/context/AppContext";
import { Postit as PostitTypes } from "@/types/types";

/**
 * Hook pour gérer la sélection de pratiques dans le Postit
 */
export function usePratiqueSelection() {
  const { updatePostit, postitToPratiqueMap } = useCallData();

  // Un seul appel à useAppContext pour récupérer toutes les valeurs nécessaires
  const { setSelectedPostit, categoriesPratiques, pratiques, selectedPostit } =
    useAppContext();

  // Récupération des pratiques de l'activité
  const pratiquesDeLActivite = Object.values(postitToPratiqueMap || {})
    .filter((p) => !!p)
    .filter((p, index, array) => array.indexOf(p) === index) as string[];

  // Gestionnaire de clic sur une pratique
  const handlePratiqueClick = useCallback(
    (practice: any) => {
      if (!selectedPostit) return;

      const isCurrentlySelected =
        selectedPostit.pratique === practice.nompratique;

      const updatedPostit = {
        ...selectedPostit,
        pratique: isCurrentlySelected ? "Non Assigné" : practice.nompratique,
      } as PostitTypes;

      setSelectedPostit(updatedPostit);
      updatePostit(selectedPostit.id, {
        pratique: updatedPostit.pratique,
      });

      return updatedPostit;
    },
    [updatePostit, setSelectedPostit, selectedPostit]
  );

  // Réinitialiser la pratique lorsqu'un nouveau Postit est sélectionné
  useEffect(() => {
    if (selectedPostit && !selectedPostit.pratique) {
      // Si un nouveau postit est sélectionné et n'a pas déjà une pratique assignée,
      // s'assurer que la pratique est bien initialisée à "Non Assigné"
      setSelectedPostit({
        ...selectedPostit,
        pratique: "Non Assigné",
      });
    }
  }, [selectedPostit?.id]); // Dépendance à l'ID pour détecter les changements de postit

  return {
    categoriesPratiques,
    pratiques,
    pratiquesDeLActivite,
    handlePratiqueClick,
  };
}
