"use client";

import { useState, useCallback } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { Call, UseCallsResult } from "@/types/types";

export function useCalls(): UseCallsResult {
  const [calls, setCalls] = useState<Call[]>([]);
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [isLoadingCalls, setIsLoadingCalls] = useState(false);

  // ✅ Nouvelles propriétés ajoutées pour corriger l'erreur TypeScript
  const [idCallActivite, setIdCallActivite] = useState<number | null>(null);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);

  // 🔁 Récupération des appels pour une entreprise (avec activités)
  const fetchCalls = useCallback(async (identreprise: number) => {
    if (!identreprise) {
      console.warn("⚠️ Aucun identreprise fourni !");
      return;
    }

    setIsLoadingCalls(true);

    const { data: callIdsData, error: callIdsError } = await supabaseClient
      .from("entreprise_call")
      .select("callid")
      .eq("identreprise", identreprise);

    if (callIdsError) {
      console.error("❌ Erreur récupération callid:", callIdsError);
      setIsLoadingCalls(false);
      return;
    }

    const callIds = callIdsData.map((row) => row.callid);

    if (callIds.length === 0) {
      setCalls([]);
      setIsLoadingCalls(false);
      return;
    }

    const { data, error } = await supabaseClient
      .from("call")
      .select(
        `
        callid,
        filename,
        audiourl,
        filepath,
        description,
        upload,
        archived,
        is_tagging_call,
        origine,
        preparedfortranscript,
        status,
        duree,
        callactivityrelation(
          activityid,
          activitesconseillers(idactivite, nature)
        )
      `
      )
      .in("callid", callIds);

    if (error) {
      console.error("❌ Erreur récupération appels:", error);
    } else {
      const formattedCalls: Call[] = data.map((call: any) => ({
        callid: call.callid,
        filename: call.filename,
        audiourl: call.audiourl,
        filepath: call.filepath,
        description: call.description,
        upload: call.upload,
        archived: call.archived,
        is_tagging_call: call.is_tagging_call,
        origine: call.origine,
        preparedfortranscript: call.preparedfortranscript,
        status: call.status,
        duree: call.duree,
        callactivityrelation:
          call.callactivityrelation?.map((rel: any) => ({
            activityid: rel.activityid,
            activitesconseillers: Array.isArray(rel.activitesconseillers)
              ? rel.activitesconseillers.map((act: any) => ({
                  idactivite: act.idactivite,
                  nature: act.nature,
                }))
              : [],
          })) ?? [],
      }));

      setCalls(formattedCalls);
    }

    setIsLoadingCalls(false);
  }, []);

  // ✅ Sélection d'un appel
  const selectCall = useCallback((call: Call) => {
    setSelectedCall(call);
  }, []);

  // ✅ Nouvelle fonction pour créer une activité pour un appel
  const createActivityForCall = useCallback(
    async (
      callId: number,
      activityType: "evaluation" | "coaching",
      idConseiller: number
    ) => {
      setIsLoadingActivity(true);
      try {
        // Créer d'abord l'activité
        const { data: activityData, error: activityError } =
          await supabaseClient
            .from("activitesconseillers")
            .insert({
              nature: activityType,
              idconseiller: idConseiller,
              datecreation: new Date().toISOString(),
            })
            .select("idactivite")
            .single();

        if (activityError) {
          console.error("❌ Erreur création activité:", activityError);
          throw activityError;
        }

        const activityId = activityData.idactivite;

        // Associer l'activité à l'appel
        const { error: relationError } = await supabaseClient
          .from("callactivityrelation")
          .insert({
            callid: callId,
            activityid: activityId,
          });

        if (relationError) {
          console.error("❌ Erreur association call-activity:", relationError);
          throw relationError;
        }

        setIdCallActivite(activityId);
        console.log("✅ Activité créée et associée avec succès:", activityId);
      } catch (error) {
        console.error("❌ Erreur lors de la création de l'activité:", error);
      } finally {
        setIsLoadingActivity(false);
      }
    },
    []
  );

  return {
    calls,
    fetchCalls,
    selectedCall,
    selectCall,
    setSelectedCall,
    isLoadingCalls,

    // ✅ Nouvelles propriétés ajoutées
    idCallActivite,
    createActivityForCall,
    isLoadingActivity,

    archiveCall: async (callId: number) => {
      try {
        const { error } = await supabaseClient
          .from("call")
          .update({ archived: true })
          .eq("callid", callId);
        if (error) throw error;

        setCalls((prev) =>
          prev.map((call) =>
            call.callid === callId ? { ...call, archived: true } : call
          )
        );
      } catch (error) {
        console.error("❌ Erreur archivage appel :", error);
      }
    },

    deleteCall: async (callId: number) => {
      try {
        const { error } = await supabaseClient
          .from("call")
          .delete()
          .eq("callid", callId);
        if (error) throw error;

        setCalls((prev) => prev.filter((call) => call.callid !== callId));
      } catch (error) {
        console.error("❌ Erreur suppression appel :", error);
      }
    },

    createAudioUrlWithToken: async (filepath: string) => {
      if (!filepath) return null;
      try {
        const { data, error } = await supabaseClient.storage
          .from("Calls")
          .createSignedUrl(filepath, 60);
        if (error) throw error;

        return data?.signedUrl ?? null;
      } catch (error) {
        console.error("❌ Erreur URL signée audio :", error);
        return null;
      }
    },
  };
}
