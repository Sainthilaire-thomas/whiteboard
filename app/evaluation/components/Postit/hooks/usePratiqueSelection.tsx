"use client";

import { useCallback } from "react";
import { useCallData } from "@/context/CallDataContext"; // ← Récupération de selectedPostit ici
import { useAppContext } from "@/context/AppContext"; // ← Plus de selectedPostit ici
import { Postit as PostitTypes } from "@/types/types";

export function usePratiqueSelection() {
  // 🔄 CHANGEMENT : selectedPostit vient maintenant de CallDataContext
  const {
    updatePostit,
    updatePostitToPratiqueMap,
    postitToPratiqueMap,
    selectedPostit, // ← DÉPLACÉ depuis AppContext
    setSelectedPostit, // ← DÉPLACÉ depuis AppContext
  } = useCallData();

  // 🔄 CHANGEMENT : AppContext ne fournit plus selectedPostit
  const {
    categoriesPratiques,
    pratiques,
    // selectedPostit SUPPRIMÉ ← Plus dans AppContext
    // setSelectedPostit SUPPRIMÉ ← Plus dans AppContext
  } = useAppContext();

  // Récupération des pratiques de l'activité basée sur les IDs
  const pratiquesDeLActivite = Object.values(postitToPratiqueMap || {})
    .filter((id) => id !== null && id !== undefined)
    .map((id) => {
      // Convertir string vers number si nécessaire
      const numericId = typeof id === "string" ? parseInt(id, 10) : id;
      return isNaN(numericId) ? null : numericId;
    })
    .filter((id): id is number => id !== null)
    .filter((id, index, array) => array.indexOf(id) === index);

  // GESTIONNAIRE DE CLIC - Logique identique mais contexte changé
  const handlePratiqueClick = useCallback(
    (practice: any) => {
      console.log("🎯 handlePratiqueClick - CallDataContext version");
      console.log("practice:", practice);
      console.log("selectedPostit:", selectedPostit);

      if (!selectedPostit) {
        console.error("❌ Pas de postit sélectionné");
        return;
      }

      // Vérifier si cette pratique est actuellement sélectionnée
      const isCurrentlySelected =
        selectedPostit.idpratique === practice.idpratique;

      console.log("🎯 isCurrentlySelected:", isCurrentlySelected);

      // LOGIQUE IDENTIQUE À AVANT
      const updatedPostit = isCurrentlySelected
        ? {
            // DÉSÉLECTION : réinitialiser la pratique
            ...selectedPostit,
            pratique: "Non Assigné",
            idpratique: null,
          }
        : {
            // SÉLECTION : assigner la nouvelle pratique
            ...selectedPostit,
            pratique: practice.nompratique,
            idpratique: practice.idpratique,
          };

      console.log("🎯 updatedPostit calculé:", updatedPostit);

      // 1. Mise à jour de l'état local (maintenant dans CallDataContext)
      setSelectedPostit(updatedPostit);
      console.log("✅ setSelectedPostit appelé (CallDataContext)");

      // 2. Mise à jour de la map
      updatePostitToPratiqueMap(
        updatedPostit.id.toString(), // ✅ Convertir en string
        updatedPostit.idpratique?.toString() ?? null // ✅ Convertir en string ou null
      );
      console.log("✅ updatePostitToPratiqueMap appelé");

      // 3. Mise à jour Supabase
      updatePostit(updatedPostit.id, {
        pratique: updatedPostit.pratique,
        idpratique: updatedPostit.idpratique,
      });
      console.log("✅ updatePostit appelé");

      return updatedPostit;
    },
    [updatePostitToPratiqueMap, updatePostit, setSelectedPostit, selectedPostit]
  );

  // Helper pour vérifier si une pratique est valide
  const hasValidPractice = useCallback((postit: PostitTypes) => {
    return (
      postit.idpratique !== null &&
      postit.idpratique !== undefined &&
      postit.idpratique > 0
    );
  }, []);

  // Fonction pour obtenir une pratique par son ID
  const getPratiqueById = useCallback(
    (id: number) => {
      return pratiques?.find((p) => p.idpratique === id);
    },
    [pratiques]
  );

  // Fonction pour vérifier si une pratique est sélectionnée pour le postit actuel
  const isPratiqueSelected = useCallback(
    (pratiqueId: number) => {
      return selectedPostit?.idpratique === pratiqueId;
    },
    [selectedPostit?.idpratique]
  );

  return {
    categoriesPratiques,
    pratiques,
    pratiquesDeLActivite,
    handlePratiqueClick,
    hasValidPractice,
    getPratiqueById,
    isPratiqueSelected,
  };
}
