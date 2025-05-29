"use client";

import { useCallback, useEffect } from "react";
import { useCallData } from "@/context/CallDataContext";
import { useAppContext } from "@/context/AppContext";
import { Postit as PostitTypes } from "@/types/types";

/**
 * Hook pour gérer la sélection de pratiques dans le Postit
 * Version adaptative qui gère différentes structures d'objets pratique
 */
export function usePratiqueSelection() {
  const { updatePostit, postitToPratiqueMap, updatePostitToPratiqueMap } =
    useCallData();

  const { setSelectedPostit, categoriesPratiques, pratiques, selectedPostit } =
    useAppContext();

  // Récupération des pratiques de l'activité basée sur les IDs
  const pratiquesDeLActivite = Object.values(postitToPratiqueMap || {})
    .filter((id) => id !== null && id !== undefined)
    .filter((id, index, array) => array.indexOf(id) === index) as number[];

  // Helper pour extraire l'ID de la pratique (adaptatif)
  const extractPratiqueId = useCallback((practice: any): number | null => {
    // Tester différentes possibilités de noms de propriétés
    const possibleIdFields = [
      "idpratique", // Structure Supabase standard
      "id", // Structure générique
      "pratique_id", // Structure alternative
      "pk", // Primary key alternative
      "key", // Autre alternative
    ];

    for (const field of possibleIdFields) {
      if (practice[field] !== undefined && practice[field] !== null) {
        const id = parseInt(practice[field]);
        if (!isNaN(id) && id > 0) {
          console.log(`✅ ID pratique trouvé via ${field}:`, id);
          return id;
        }
      }
    }

    console.error("❌ Aucun ID pratique valide trouvé dans:", practice);
    return null;
  }, []);

  // Helper pour extraire le nom de la pratique (adaptatif)
  const extractPratiqueNom = useCallback((practice: any): string | null => {
    // Tester différentes possibilités de noms de propriétés
    const possibleNameFields = [
      "nompratique", // Structure Supabase standard
      "nom", // Structure générique
      "name", // Structure anglaise
      "libelle", // Structure française
      "titre", // Alternative
      "label", // Alternative anglaise
    ];

    for (const field of possibleNameFields) {
      if (practice[field] && typeof practice[field] === "string") {
        console.log(`✅ Nom pratique trouvé via ${field}:`, practice[field]);
        return practice[field];
      }
    }

    console.error("❌ Aucun nom pratique valide trouvé dans:", practice);
    return null;
  }, []);

  // Helper pour vérifier si une pratique est valide
  const hasValidPractice = useCallback((postit: PostitTypes) => {
    return (
      postit.idpratique !== null &&
      postit.idpratique !== undefined &&
      postit.idpratique > 0
    );
  }, []);

  // Gestionnaire de clic sur une pratique - VERSION ADAPTATIVE
  const handlePratiqueClick = useCallback(
    (practice: any) => {
      console.log("🎯 === CLICK PRATIQUE DEBUG ===");
      console.log("Practice reçu:", practice);
      console.log("Selected postit:", selectedPostit);

      if (!selectedPostit) {
        console.error("❌ Pas de postit sélectionné");
        return;
      }

      // Extraction adaptative des données
      const pratiqueId = extractPratiqueId(practice);
      const pratiqueNom = extractPratiqueNom(practice);

      console.log("Extraction résultats:", { pratiqueId, pratiqueNom });

      if (!pratiqueId) {
        console.error("❌ Impossible d'extraire l'ID de la pratique");
        console.log("Structure disponible:", Object.keys(practice));
        return;
      }

      if (!pratiqueNom) {
        console.error("❌ Impossible d'extraire le nom de la pratique");
        return;
      }

      // Vérifier si cette pratique est actuellement sélectionnée
      const isCurrentlySelected = selectedPostit.idpratique === pratiqueId;
      console.log("Est actuellement sélectionnée?", isCurrentlySelected);

      const updatedPostit = {
        ...selectedPostit,
        pratique: isCurrentlySelected ? "Non Assigné" : pratiqueNom,
        idpratique: isCurrentlySelected ? null : pratiqueId,
      } as PostitTypes;

      console.log("Postit mis à jour:", {
        avant: {
          pratique: selectedPostit.pratique,
          idpratique: selectedPostit.idpratique,
        },
        après: {
          pratique: updatedPostit.pratique,
          idpratique: updatedPostit.idpratique,
        },
      });

      // Mise à jour de l'état local
      setSelectedPostit(updatedPostit);
      console.log("✅ État local mis à jour");

      // Mise à jour de la map pratique
      if (updatePostitToPratiqueMap) {
        updatePostitToPratiqueMap(selectedPostit.id, updatedPostit.idpratique);
        console.log("✅ Map pratique mis à jour");
      } else {
        console.warn("⚠️ updatePostitToPratiqueMap non disponible");
      }

      // Sauvegarde en base
      const dataToSave = {
        pratique: updatedPostit.pratique,
        idpratique: updatedPostit.idpratique,
      };

      console.log("💾 Sauvegarde en cours:", {
        postit_id: selectedPostit.id,
        data: dataToSave,
      });

      updatePostit(selectedPostit.id, dataToSave);
      console.log("=== FIN CLICK PRATIQUE ===");

      return updatedPostit;
    },
    [
      updatePostit,
      setSelectedPostit,
      selectedPostit,
      updatePostitToPratiqueMap,
      extractPratiqueId,
      extractPratiqueNom,
    ]
  );

  // Réinitialiser la pratique lorsqu'un nouveau Postit est sélectionné
  useEffect(() => {
    if (
      selectedPostit &&
      !selectedPostit.pratique &&
      !selectedPostit.idpratique
    ) {
      setSelectedPostit({
        ...selectedPostit,
        pratique: "Non Assigné",
        idpratique: null,
      });
    }
  }, [selectedPostit?.id, setSelectedPostit]);

  // Fonction pour obtenir une pratique par son ID
  const getPratiqueById = useCallback(
    (id: number) => {
      return pratiques?.find((p) => extractPratiqueId(p) === id);
    },
    [pratiques, extractPratiqueId]
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
