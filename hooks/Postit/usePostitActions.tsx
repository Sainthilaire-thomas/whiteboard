"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabaseClient";
import { useCallData } from "@/context/CallDataContext";
import { useAppContext } from "@/context/AppContext";

/**
 * Hook pour gérer les actions sur un Postit (sauvegarde, suppression, fermeture)
 */
export function usePostitActions() {
  const router = useRouter();

  const {
    deletePostit,
    updatePostit,
    postitToSujetMap,
    postitToPratiqueMap,
    idCallActivite,
  } = useCallData();

  const {
    selectedPostit,
    setSelectedPostit,
    pratiques,
    syncSujetsForActiviteFromMap,
    syncPratiquesForActiviteFromMap,
  } = useAppContext();

  // Sauvegarde d'un postit
  const handleSave = useCallback(async () => {
    if (!selectedPostit) return;

    await updatePostit(selectedPostit.id, {
      text: selectedPostit.text,
      sujet: selectedPostit.sujet,
      idsujet: selectedPostit.idsujet,
      iddomaine: selectedPostit.iddomaine,
      pratique: selectedPostit.pratique,
    });

    // Synchronisation
    if (idCallActivite) {
      await syncSujetsForActiviteFromMap(postitToSujetMap, idCallActivite);
      await syncPratiquesForActiviteFromMap(
        postitToPratiqueMap,
        idCallActivite,
        pratiques
      );
    }

    // On retourne une promesse pour permettre au composant de savoir quand la sauvegarde est terminée
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setSelectedPostit(null);
        resolve();
      }, 1500);
    });
  }, [
    selectedPostit,
    updatePostit,
    idCallActivite,
    syncSujetsForActiviteFromMap,
    postitToSujetMap,
    syncPratiquesForActiviteFromMap,
    postitToPratiqueMap,
    pratiques,
    setSelectedPostit,
  ]);

  // Suppression d'un postit
  const handleDelete = useCallback(async () => {
    if (!selectedPostit?.id) return;

    try {
      const { data: otherPostits } = await supabaseClient
        .from("postit")
        .select("id")
        .eq("idsujet", selectedPostit.idsujet)
        .neq("id", selectedPostit.id);

      if (!otherPostits || otherPostits.length === 0) {
        await supabaseClient
          .from("activitesconseillers_sujets")
          .delete()
          .match({
            idactivite: idCallActivite,
            idsujet: selectedPostit.idsujet,
          });
      }

      await deletePostit(selectedPostit.id);
      setSelectedPostit(null);
    } catch (error) {
      console.error("❌ Erreur lors de la suppression:", error);
    }
  }, [selectedPostit, idCallActivite, deletePostit, setSelectedPostit]);

  // Fermeture du postit
  const handleClosePostit = useCallback(() => {
    if (idCallActivite) {
      syncSujetsForActiviteFromMap(postitToSujetMap, idCallActivite);
      syncPratiquesForActiviteFromMap(
        postitToPratiqueMap,
        idCallActivite,
        pratiques
      );
    }
    setSelectedPostit(null);
    router.push("/evaluation?view=synthese");
  }, [
    idCallActivite,
    syncSujetsForActiviteFromMap,
    postitToSujetMap,
    syncPratiquesForActiviteFromMap,
    postitToPratiqueMap,
    pratiques,
    setSelectedPostit,
    router,
  ]);

  return {
    handleSave,
    handleDelete,
    handleClosePostit,
  };
}
