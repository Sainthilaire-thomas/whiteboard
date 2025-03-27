"use client";

import { useCallback } from "react";
import { useCallData } from "@/context/CallDataContext";
import { useAppContext } from "@/context/AppContext";
import { Item } from "@/types/types";

/**
 * Hook pour gérer la sélection de sujets dans le Postit
 */
export function useSujetSelection() {
  const { updatePostit, updatePostitToSujetMap, postitToSujetMap } =
    useCallData();
  const { setSelectedPostit, sujetsData, selectedDomain, categoriesSujets } =
    useAppContext();

  // Récupération des sujets de l'activité
  const sujetsDeLActivite = Object.values(postitToSujetMap || {})
    .filter((id) => id !== null)
    .filter((id, index, array) => array.indexOf(id) === index) as number[];

  // Récupération du selectedPostit depuis le contexte
  const { selectedPostit } = useAppContext();

  // Gestionnaire de clic sur un sujet
  const handleSujetClick = useCallback(
    (item: Item) => {
      if (!selectedPostit) return;

      const isCurrentlySelected = selectedPostit.idsujet === item.idsujet;

      // Mise à jour du post-it
      const updatedPostit = isCurrentlySelected
        ? {
            ...selectedPostit,
            sujet: "Non Assigné",
            idsujet: null,
            iddomaine: null,
            pratique: "Non Assigné", // Réinitialiser la pratique si on désélectionne le sujet
          }
        : {
            ...selectedPostit,
            sujet: item.nomsujet,
            idsujet: item.idsujet,
            iddomaine: item.iddomaine,
          };

      setSelectedPostit(updatedPostit);
      updatePostitToSujetMap(updatedPostit.id, updatedPostit.idsujet ?? null);

      // Mise à jour Supabase
      updatePostit(updatedPostit.id, {
        sujet: updatedPostit.sujet,
        idsujet: updatedPostit.idsujet,
        iddomaine: updatedPostit.iddomaine,
        pratique: updatedPostit.pratique,
      });

      return updatedPostit;
    },
    [updatePostitToSujetMap, updatePostit, setSelectedPostit]
  );

  return {
    sujetsData,
    selectedDomain,
    categoriesSujets,
    sujetsDeLActivite,
    handleSujetClick,
  };
}
