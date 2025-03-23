"use client";

import { useState, useCallback, useEffect } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { Call } from "@/types/types";

interface UseCallActivityProps {
  selectedCall: Call | null;
  fetchCalls: (identreprise: number) => Promise<void>;
  selectedEntreprise: number | null;
}

export function useCallActivity({
  selectedCall,
  fetchCalls,
  selectedEntreprise,
}: UseCallActivityProps) {
  const [idCallActivite, setIdCallActivite] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchActivitiesForCall = useCallback(async (callId: number) => {
    const { data, error } = await supabaseClient
      .from("callactivityrelation")
      .select("activityid")
      .eq("callid", callId);

    if (error) {
      console.error("❌ Erreur récupération activités :", error);
      return;
    }

    setIdCallActivite(data?.[0]?.activityid ?? null);
  }, []);

  const getActivityIdFromCallId = useCallback(async (callId: number) => {
    const { data, error } = await supabaseClient
      .from("callactivityrelation")
      .select("activityid")
      .eq("callid", callId)
      .single();

    if (error) {
      console.error("❌ Erreur récupération idactivite :", error);
      return null;
    }

    return data.activityid;
  }, []);

  useEffect(() => {
    if (selectedCall?.callid && !idCallActivite) {
      fetchActivitiesForCall(selectedCall.callid);
    }
  }, [selectedCall, idCallActivite, fetchActivitiesForCall]);

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

  const removeActivityForCall = useCallback(
    async (callId: number) => {
      try {
        const { data: relations } = await supabaseClient
          .from("callactivityrelation")
          .select("activityid")
          .eq("callid", callId);

        const activityId = relations?.[0]?.activityid;
        if (!activityId) return;

        await supabaseClient
          .from("callactivityrelation")
          .delete()
          .eq("callid", callId);

        const { data: remainingRelations } = await supabaseClient
          .from("callactivityrelation")
          .select("callid")
          .eq("activityid", activityId);

        if ((remainingRelations?.length ?? 0) === 0) {
          await supabaseClient
            .from("activitesconseillers")
            .delete()
            .eq("idactivite", activityId);
        }

        if (selectedEntreprise) {
          await fetchCalls(selectedEntreprise);
        }
      } catch (error) {
        console.error("❌ Erreur suppression activité :", error);
      }
    },
    [fetchCalls, selectedEntreprise]
  );

  return {
    idCallActivite,
    fetchActivitiesForCall,
    createActivityForCall,
    removeActivityForCall,
    isLoading,
    getActivityIdFromCallId,
  };
}
