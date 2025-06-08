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
    selectedPostit,
    setSelectedPostit,
    // ✅ Ces méthodes sont maintenant dans AppContext via useSelection
  } = useCallData();

  const {
    pratiques,
    // ✅ Ces méthodes sont exposées via useSelection dans AppContext
    syncSujetsForActiviteFromMap,
    syncPratiquesForActiviteFromMap,
  } = useAppContext();

  // Helper pour vérifier si un postit est complet
  const isPostitComplete = useCallback((postit: any) => {
    return (
      postit?.idsujet !== null &&
      postit?.idsujet !== undefined &&
      postit?.idpratique !== null &&
      postit?.idpratique !== undefined &&
      postit?.idpratique > 0
    );
  }, []);

  // Sauvegarde d'un postit
  const handleSave = useCallback(async () => {
    if (!selectedPostit) return;

    // Validation avant sauvegarde
    if (!isPostitComplete(selectedPostit)) {
      console.warn("⚠️ Postit incomplet - sauvegarde partielle");
    }

    await updatePostit(selectedPostit.id, {
      text: selectedPostit.text,
      sujet: selectedPostit.sujet,
      idsujet: selectedPostit.idsujet,
      iddomaine: selectedPostit.iddomaine,
      pratique: selectedPostit.pratique,
      idpratique: selectedPostit.idpratique,
    });

    // Synchronisation - maintenant disponible via AppContext
    if (idCallActivite) {
      await syncSujetsForActiviteFromMap(postitToSujetMap, idCallActivite);
      await syncPratiquesForActiviteFromMap(
        postitToPratiqueMap, // ✅ Plus besoin de cast - les types correspondent maintenant
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
    isPostitComplete,
  ]);

  // Suppression d'un postit
  const handleDelete = useCallback(async () => {
    if (!selectedPostit?.id) return;

    try {
      // Vérifier s'il y a d'autres postits avec le même sujet
      const { data: otherPostitsWithSujet } = await supabaseClient
        .from("postit")
        .select("id")
        .eq("idsujet", selectedPostit.idsujet)
        .neq("id", selectedPostit.id);

      // Vérifier s'il y a d'autres postits avec la même pratique
      const { data: otherPostitsWithPratique } = await supabaseClient
        .from("postit")
        .select("id")
        .eq("idpratique", selectedPostit.idpratique)
        .neq("id", selectedPostit.id);

      // Supprimer la liaison sujet si c'était le dernier postit avec ce sujet
      if (
        selectedPostit.idsujet &&
        (!otherPostitsWithSujet || otherPostitsWithSujet.length === 0)
      ) {
        await supabaseClient
          .from("activitesconseillers_sujets")
          .delete()
          .match({
            idactivite: idCallActivite,
            idsujet: selectedPostit.idsujet,
          });
      }

      // Supprimer la liaison pratique si c'était le dernier postit avec cette pratique
      if (
        selectedPostit.idpratique &&
        (!otherPostitsWithPratique || otherPostitsWithPratique.length === 0)
      ) {
        try {
          await supabaseClient
            .from("activitesconseillers_pratiques")
            .delete()
            .match({
              idactivite: idCallActivite,
              idpratique: selectedPostit.idpratique,
            });
        } catch (error) {
          // Si la table n'existe pas encore, ignorer l'erreur
          console.warn(
            "⚠️ Table activitesconseillers_pratiques non trouvée:",
            error
          );
        }
      }

      await deletePostit(selectedPostit.id);
      setSelectedPostit(null);
    } catch (error) {
      console.error("❌ Erreur lors de la suppression:", error);
      throw error; // ✅ Relancer l'erreur pour que le composant puisse la gérer
    }
  }, [selectedPostit, idCallActivite, deletePostit, setSelectedPostit]);

  // Fermeture du postit
  const handleClosePostit = useCallback(() => {
    // Synchronisation - maintenant disponible via AppContext
    if (idCallActivite) {
      syncSujetsForActiviteFromMap(postitToSujetMap, idCallActivite);
      syncPratiquesForActiviteFromMap(
        postitToPratiqueMap, // ✅ Plus besoin de cast - les types correspondent maintenant
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
    isPostitComplete, // Export de la fonction helper
  };
}
