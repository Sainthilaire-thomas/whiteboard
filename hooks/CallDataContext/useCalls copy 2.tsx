"use client";

import { useState, useCallback } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { Call, UseCallsResult } from "@/types/types";

export function useCalls(): UseCallsResult {
  const [calls, setCalls] = useState<Call[]>([]);
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [idCallActivite, setIdCallActivite] = useState<number | null>(null);
  const [isLoadingCalls, setIsLoadingCalls] = useState<boolean>(false);
  const [isLoadingActivity, setIsLoadingActivity] = useState<boolean>(false);

  // ✅ Récupération des appels pour une entreprise (avec activités)
  const fetchCalls = useCallback(async (identreprise: number) => {
    if (!identreprise) {
      console.warn("⚠️ Aucun identreprise fourni !");
      return;
    }

    setIsLoadingCalls(true);

    // Étape 1: Récupérer les callid associés à l'entreprise
    const { data: callIdsData, error: callIdsError } = await supabaseClient
      .from("entreprise_call")
      .select("callid")
      .eq("identreprise", identreprise);

    if (callIdsError) {
      console.error(
        "❌ Erreur lors de la récupération des callid:",
        callIdsError
      );
      setIsLoadingCalls(false);
      return;
    }

    const callIds = callIdsData.map((row: { callid: number }) => row.callid);

    if (callIds.length === 0) {
      console.warn("⚠️ Aucun appel trouvé pour cette entreprise.");
      setCalls([]);
      setIsLoadingCalls(false);
      return;
    }

    // Étape 2: Récupérer les appels avec leurs activités associées

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
      console.error("❌ Erreur lors de la récupération des appels:", error);
    } else {
      const formattedData: Call[] = data.map((call: any) => ({
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
        callactivityrelation: call.callactivityrelation
          ? call.callactivityrelation.map((relation: any) => ({
              activityid: relation.activityid,
              activitesconseillers: relation.activitesconseillers
                ? Array.isArray(relation.activitesconseillers)
                  ? relation.activitesconseillers.map((act: any) => ({
                      idactivite: act.idactivite,
                      nature: act.nature,
                    }))
                  : [
                      {
                        idactivite: relation.activitesconseillers.idactivite,
                        nature: relation.activitesconseillers.nature,
                      },
                    ]
                : [],
            }))
          : [],
      }));

      setCalls(formattedData);
    }

    setIsLoadingCalls(false);
  }, []);

  // ✅ Création d'une activité et association à un appel (si aucune n’existe)

  const createActivityForCall = useCallback(
    async (callId: number, activityType: string, idConseiller: number) => {
      setIsLoadingActivity(true);

      try {
        const dateNow = new Date().toISOString();

        // 📝 Insérer une nouvelle activité avec `idconseiller`
        const { data: activityData, error: errorActivity } =
          await supabaseClient
            .from("activitesconseillers")
            .insert([
              {
                dateactivite: dateNow,
                statut: "ouvert",
                nature: activityType, // ✅ Type de l’activité
                idconseiller: idConseiller, // ✅ Ajout du conseiller sélectionné
              },
            ])
            .select()
            .single();

        if (errorActivity) {
          console.error(
            "❌ Erreur lors de l'insertion dans activitesconseillers :",
            errorActivity
          );
          throw errorActivity;
        }

        if (!activityData) {
          console.error(
            "⚠️ L'insertion de l'activité a retourné une valeur vide."
          );
          return;
        }

        const activityId = activityData.idactivite;

        setIdCallActivite(activityId);

        // 🔗 Associer l’appel à l’activité
        const { error: errorRelation } = await supabaseClient
          .from("callactivityrelation")
          .insert([{ callid: callId, activityid: activityId }]);

        if (errorRelation) {
          console.error(
            "❌ Erreur lors de l'association de l'appel à l'activité:",
            errorRelation
          );
          throw errorRelation;
        }

        // 🔄 Rafraîchir les appels
        fetchCalls(selectedCall?.callid ?? 0);
      } catch (error) {
        console.error("❌ Erreur lors de la création de l’activité :", error);
      } finally {
        setIsLoadingActivity(false);
      }
    },
    [fetchCalls, selectedCall]
  );

  // ✅ Sélection d'un appel
  const selectCall = useCallback((call: Call) => {
    console.log(`🎯 Sélection de l'appel ${call.callid}`);
    setSelectedCall(call);
  }, []);

  return {
    calls,
    fetchCalls,
    selectedCall,
    selectCall,
    setSelectedCall,
    idCallActivite,
    createActivityForCall,
    isLoadingCalls,
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
        console.error("❌ Erreur lors de l'archivage de l'appel:", error);
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
        console.error("❌ Erreur lors de la suppression de l'appel:", error);
      }
    },
    createAudioUrlWithToken: async (filepath: string) => {
      if (!filepath) return null;
      try {
        const { data, error } = await supabaseClient.storage
          .from("Calls")
          .createSignedUrl(filepath, 60);
        if (error) {
          console.error(
            "❌ Erreur lors de la génération de l'URL signée:",
            error
          );
          return null;
        }
        return data?.signedUrl ?? null;
      } catch (error) {
        console.error("❌ Erreur lors de la création de l'URL signée:", error);
        return null;
      }
    },
  };
}
