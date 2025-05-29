"use client";

import { useCallback, useMemo } from "react";
import { useCallData } from "@/context/CallDataContext";
import { useAppContext } from "@/context/AppContext";
import { Item } from "@/types/types";

/**
 * Hook pour gérer la sélection de sujets dans le Postit
 */
export function useSujetSelection() {
  const {
    updatePostit,
    updatePostitToSujetMap,
    postitToSujetMap,
    selectedPostit,
    setSelectedPostit,
  } = useCallData();

  const { sujetsData, selectedDomain, categoriesSujets, filteredDomains } =
    useAppContext();

  // 🔍 DEBUG
  console.log("🔍 useSujetSelection - État:", {
    selectedDomain,
    selectedDomainType: typeof selectedDomain,
    sujetsDataLength: sujetsData?.length,
    categoriesSujetsLength: categoriesSujets?.length,
    filteredDomainsLength: filteredDomains?.length,
    sampleSujet: sujetsData?.[0],
  });

  // Filtrer les sujets selon le domaine sélectionné
  const filteredSujetsData = useMemo(() => {
    if (!selectedDomain || !sujetsData) {
      console.log("🔍 No selectedDomain or sujetsData, returning all");
      return sujetsData || [];
    }

    const domainId = parseInt(selectedDomain);
    console.log("🔍 Filtering with domainId:", domainId);

    const filtered = sujetsData.filter((sujet) => {
      const matches = sujet.iddomaine === domainId;
      if (matches) {
        console.log(
          "🔍 Sujet matches:",
          sujet.nomsujet,
          "domaine:",
          sujet.iddomaine
        );
      }
      return matches;
    });

    console.log("🔍 Filtered sujets:", {
      originalCount: sujetsData.length,
      filteredCount: filtered.length,
      filtered: filtered.map((s) => ({ nom: s.nomsujet, id: s.idsujet })),
    });

    return filtered;
  }, [sujetsData, selectedDomain]);

  // Pour les catégories, on garde toutes
  const filteredCategoriesSujets = useMemo(() => {
    return categoriesSujets || [];
  }, [categoriesSujets]);

  // Récupération des sujets de l'activité (filtrés par domaine)
  const sujetsDeLActivite = useMemo(() => {
    const allSujetIds = Object.values(postitToSujetMap || {})
      .filter((id) => id !== null)
      .filter((id, index, array) => array.indexOf(id) === index) as number[];

    console.log("🔍 All sujet IDs from postitToSujetMap:", allSujetIds);

    if (!selectedDomain) {
      console.log("🔍 No selectedDomain, returning all sujet IDs");
      return allSujetIds;
    }

    const domainSujetIds = filteredSujetsData.map((sujet) => sujet.idsujet);
    console.log("🔍 Domain sujet IDs:", domainSujetIds);

    const result = allSujetIds.filter((sujetId) =>
      domainSujetIds.includes(sujetId)
    );
    console.log("🔍 Final sujetsDeLActivite:", result);

    return result;
  }, [postitToSujetMap, filteredSujetsData, selectedDomain]);

  // Helper pour vérifier si un sujet est valide
  const hasValidSubject = useCallback((postit: any) => {
    return (
      postit?.idsujet !== null &&
      postit?.idsujet !== undefined &&
      postit?.idsujet > 0
    );
  }, []);

  // Gestionnaire de clic sur un sujet
  const handleSujetClick = useCallback(
    (item: Item) => {
      console.log("🔍 handleSujetClick called with:", item);

      if (!selectedPostit || !selectedDomain) {
        console.log("🔍 No selectedPostit or selectedDomain");
        return;
      }

      const isCurrentlySelected = selectedPostit.idsujet === item.idsujet;

      const updatedPostit = isCurrentlySelected
        ? {
            ...selectedPostit,
            sujet: "Non Assigné",
            idsujet: null,
            iddomaine: null,
            pratique: "Non Assigné",
            idpratique: null,
          }
        : {
            ...selectedPostit,
            sujet: item.nomsujet,
            idsujet: item.idsujet,
            iddomaine: parseInt(selectedDomain),
          };

      console.log("🔍 Updated postit:", updatedPostit);

      setSelectedPostit(updatedPostit);
      updatePostitToSujetMap(updatedPostit.id, updatedPostit.idsujet ?? null);

      updatePostit(updatedPostit.id, {
        sujet: updatedPostit.sujet,
        idsujet: updatedPostit.idsujet,
        iddomaine: updatedPostit.iddomaine,
        pratique: updatedPostit.pratique,
        idpratique: updatedPostit.idpratique,
      });

      return updatedPostit;
    },
    [
      updatePostitToSujetMap,
      updatePostit,
      setSelectedPostit,
      selectedPostit,
      selectedDomain,
    ]
  );

  // Fonction pour obtenir un sujet par son ID
  const getSujetById = useCallback(
    (id: number) => {
      return filteredSujetsData?.find((s) => s.idsujet === id);
    },
    [filteredSujetsData]
  );

  // Fonction pour vérifier si un sujet est sélectionné
  const isSujetSelected = useCallback(
    (sujetId: number) => {
      return selectedPostit?.idsujet === sujetId;
    },
    [selectedPostit?.idsujet]
  );

  // Fonction pour obtenir les sujets du domaine sélectionné
  const getSujetsForDomain = useCallback(
    (domainId: number) => {
      return sujetsData?.filter((s) => s.iddomaine === domainId) || [];
    },
    [sujetsData]
  );

  return {
    sujetsData: filteredSujetsData,
    selectedDomain,
    categoriesSujets: filteredCategoriesSujets,
    sujetsDeLActivite,
    handleSujetClick,
    hasValidSubject,
    getSujetById,
    isSujetSelected,
    getSujetsForDomain,
  };
}
