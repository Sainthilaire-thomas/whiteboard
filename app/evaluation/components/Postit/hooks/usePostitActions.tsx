import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabaseClient";
import { useCallData } from "@/context/CallDataContext";
import { useAppContext } from "@/context/AppContext";
import { isPostitComplete, formatPostitForAPI } from "../utils";

export const usePostitActions = () => {
  const router = useRouter();

  const {
    deletePostit,
    updatePostit,
    postitToSujetMap,
    postitToPratiqueMap,
    idCallActivite,
    selectedPostit,
    setSelectedPostit,
  } = useCallData();

  const {
    pratiques,
    syncSujetsForActiviteFromMap,
    syncPratiquesForActiviteFromMap,
  } = useAppContext();

  // Sauvegarde d'un postit
  const handleSave = useCallback(async () => {
    if (!selectedPostit) return;

    // Validation avant sauvegarde
    if (!isPostitComplete(selectedPostit)) {
      console.warn("⚠️ Postit incomplet - sauvegarde partielle");
    }

    const formattedPostit = formatPostitForAPI(selectedPostit);
    await updatePostit(selectedPostit.id, formattedPostit);

    // Synchronisation
    if (idCallActivite) {
      await syncSujetsForActiviteFromMap(postitToSujetMap, idCallActivite);
      await syncPratiquesForActiviteFromMap(
        postitToPratiqueMap,
        idCallActivite,
        pratiques
      );
    }

    // Fermeture avec délai
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

      // Suppression conditionnelle des liaisons
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

      // Suppression conditionnelle des pratiques
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
          console.warn(
            "⚠️ Table activitesconseillers_pratiques non trouvée:",
            error
          );
        }
      }

      // Suppression du postit
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
    isPostitComplete, // Export de la fonction helper
  };
};
