"use client";

import { useState, useCallback, useEffect } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { useCallData } from "@/context/CallDataContext";
import { useAppContext } from "@/context/AppContext";

export function useCallActivity() {
  const { selectedCall, fetchCalls } = useCallData();
  const [idCallActivite, setIdCallActivite] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { selectedEntreprise } = useAppContext();
  // ✅ Récupérer l'activité associée à un appel
  const fetchActivitiesForCall = useCallback(async (callId: number) => {
    if (!callId) return;

    const { data, error } = await supabaseClient
      .from("callactivityrelation")
      .select("activityid")
      .eq("callid", callId);

    if (error) {
      console.error("❌ Erreur récupération activités :", error);
      return;
    }

    setIdCallActivite(data.length > 0 ? data[0].activityid : null);
  }, []);

  const getActivityIdFromCallId = useCallback(async (callId: number) => {
    if (!callId) return null;

    const { data, error } = await supabaseClient
      .from("callactivityrelation")
      .select("activityid")
      .eq("callid", callId)
      .single();

    if (error) {
      console.error("❌ Erreur récupération idactivite depuis callid :", error);
      return null;
    }

    return data.activityid;
  }, []);

  useEffect(() => {
    if (selectedCall && !idCallActivite) {
      fetchActivitiesForCall(selectedCall.callid);
    }
  }, [selectedCall, idCallActivite, fetchActivitiesForCall]);

  // ✅ Créer une nouvelle activité et l'associer à un appel
  const createActivityForCall = useCallback(
    async (
      callId: number,
      activityType: "evaluation" | "coaching",
      idConseiller: number
    ) => {
      setIsLoading(true);

      try {
        const { data: activityData, error: errorActivity } =
          await supabaseClient
            .from("activitesconseillers")
            .insert([
              {
                dateactivite: new Date().toISOString(),
                statut: "ouvert",
                nature: activityType,
                idconseiller: idConseiller,
              },
            ])
            .select()
            .single();

        if (errorActivity) throw errorActivity;
        const activityId = activityData.idactivite;
        setIdCallActivite(activityId);

        await supabaseClient
          .from("callactivityrelation")
          .insert({ callid: callId, activityid: activityId });
      } catch (error) {
        console.error("❌ Erreur création activité :", error);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // ✅ Supprimer une activité et sa relation avec l'appel
  const removeActivityForCall = async (callId: number) => {
    try {
      // Étape 1 : Trouver l'ID de l'activité associée via `callactivityrelation`
      const { data: relations, error: errorRelations } = await supabaseClient
        .from("callactivityrelation")
        .select("activityid")
        .eq("callid", callId);

      if (errorRelations) {
        console.error("❌ Erreur récupération des relations :", errorRelations);
        return;
      }

      if (!relations || relations.length === 0) {
        console.warn("⚠️ Aucune activité associée trouvée pour cet appel.");
        return;
      }

      const activityId = relations[0].activityid; // Supposons une seule activité associée

      // Étape 2 : Supprimer l’entrée dans `callactivityrelation`
      const { error: deleteRelationError } = await supabaseClient
        .from("callactivityrelation")
        .delete()
        .eq("callid", callId);

      if (deleteRelationError) {
        console.error(
          "❌ Erreur suppression dans `callactivityrelation` :",
          deleteRelationError
        );
        return;
      }

      // Étape 3 : Vérifier si l'activité est encore utilisée par d'autres appels
      const { data: remainingRelations, error: errorRemainingRelations } =
        await supabaseClient
          .from("callactivityrelation")
          .select("callid")
          .eq("activityid", activityId);

      if (errorRemainingRelations) {
        console.error(
          "❌ Erreur vérification des relations restantes :",
          errorRemainingRelations
        );
        return;
      }

      // Si l'activité n'est plus associée à aucun appel, la supprimer
      if (remainingRelations.length === 0) {
        const { error: deleteActivityError } = await supabaseClient
          .from("activitesconseillers")
          .delete()
          .eq("idactivite", activityId);

        if (deleteActivityError) {
          console.error(
            `❌ Erreur suppression de l'activité ${activityId} :`,
            deleteActivityError
          );
        } else {
          console.log(`✅ Activité ${activityId} supprimée.`);
        }
      } else {
        console.log(
          `ℹ️ L'activité ${activityId} est encore utilisée par d'autres appels et n'a pas été supprimée.`
        );
      }

      // 🔄 Rafraîchir les appels après la suppression
      await fetchCalls(selectedEntreprise ?? 0);
    } catch (error) {
      console.error("❌ Erreur dans `removeActivityForCall` :", error);
    }
  };

  return {
    idCallActivite,
    fetchActivitiesForCall,
    createActivityForCall,
    removeActivityForCall,
    isLoading,
    getActivityIdFromCallId,
  };
}
