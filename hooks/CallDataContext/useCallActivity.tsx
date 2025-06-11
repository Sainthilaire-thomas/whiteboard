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
  const [error, setError] = useState<string | null>(null);

  const fetchActivitiesForCall = useCallback(async (callId: number) => {
    // ✅ Validation d'entrée
    if (!callId || callId <= 0) {
      console.log(
        "ℹ️ DEBUG useCallActivity: callId invalide pour fetchActivitiesForCall"
      );
      setIdCallActivite(null);
      return;
    }

    try {
      console.log(
        "🔍 DEBUG useCallActivity: fetchActivitiesForCall pour callId:",
        callId
      );

      const { data, error } = await supabaseClient
        .from("callactivityrelation")
        .select("activityid")
        .eq("callid", callId);

      if (error) {
        console.error("❌ Erreur récupération activités:", {
          error: error.message,
          code: error.code,
          callId,
        });
        setError(`Erreur récupération activités: ${error.message}`);
        return;
      }

      const activityId = data?.[0]?.activityid ?? null;
      console.log("✅ DEBUG useCallActivity: activité trouvée:", {
        callId,
        activityId,
        totalFound: data?.length || 0,
      });

      setIdCallActivite(activityId);
      setError(null);
    } catch (err: any) {
      console.error("❌ Erreur fetchActivitiesForCall:", {
        error: err.message || err,
        callId,
      });
      setError(`Erreur inattendue: ${err.message || err}`);
      setIdCallActivite(null);
    }
  }, []);

  const getActivityIdFromCallId = useCallback(async (callId: number) => {
    // ✅ Validation d'entrée robuste
    if (!callId || callId === null || callId === undefined || callId <= 0) {
      console.log(
        "ℹ️ DEBUG useCallActivity: callId invalide pour getActivityIdFromCallId:",
        callId
      );
      return null;
    }

    try {
      console.log(
        "🔍 DEBUG useCallActivity: getActivityIdFromCallId pour callId:",
        callId
      );

      const { data, error } = await supabaseClient
        .from("callactivityrelation")
        .select("activityid")
        .eq("callid", callId)
        .single();

      if (error) {
        // ✅ Gestion spécifique de l'erreur "pas trouvé"
        if (error.code === "PGRST116") {
          console.log(
            "ℹ️ DEBUG useCallActivity: Aucune activité trouvée pour callId:",
            callId
          );
          return null;
        } else {
          console.error("❌ Erreur récupération idactivite:", {
            error: error.message,
            code: error.code,
            callId,
          });
          // ✅ Ne pas throw, retourner null pour éviter de casser l'interface
          return null;
        }
      }

      if (!data || data.activityid === null || data.activityid === undefined) {
        console.log(
          "ℹ️ DEBUG useCallActivity: Pas d'activityid pour callId:",
          callId
        );
        return null;
      }

      console.log("✅ DEBUG useCallActivity: activityid trouvé:", {
        callId,
        activityid: data.activityid,
      });

      return data.activityid;
    } catch (err: any) {
      console.error("❌ Erreur getActivityIdFromCallId:", {
        error: err.message || err,
        callId,
        stack: err.stack,
      });

      // ✅ Ne pas throw l'erreur, retourner null pour éviter de casser l'interface
      return null;
    }
  }, []);

  // ✅ Effect avec gestion d'erreur et cleanup
  useEffect(() => {
    let isCancelled = false;

    const loadActivity = async () => {
      if (!selectedCall?.callid) {
        console.log(
          "ℹ️ DEBUG useCallActivity: Pas de selectedCall, reset idCallActivite"
        );
        setIdCallActivite(null);
        setError(null);
        return;
      }

      // ✅ Ne charger que si on n'a pas déjà l'activité
      if (idCallActivite) {
        console.log(
          "ℹ️ DEBUG useCallActivity: idCallActivite déjà défini, skip"
        );
        return;
      }

      try {
        console.log(
          "🔍 DEBUG useCallActivity: Chargement activité pour:",
          selectedCall.callid
        );
        await fetchActivitiesForCall(selectedCall.callid);
      } catch (err: any) {
        if (!isCancelled) {
          console.error("❌ Erreur dans loadActivity:", err);
          setError(err.message || "Erreur lors du chargement de l'activité");
        }
      }
    };

    loadActivity();

    // ✅ Cleanup pour éviter les race conditions
    return () => {
      isCancelled = true;
    };
  }, [selectedCall?.callid, idCallActivite, fetchActivitiesForCall]);

  // ✅ Reset quand selectedCall change
  useEffect(() => {
    if (!selectedCall?.callid) {
      console.log(
        "🔄 DEBUG useCallActivity: selectedCall reset, clearing idCallActivite"
      );
      setIdCallActivite(null);
      setError(null);
    }
  }, [selectedCall?.callid]);

  const createActivityForCall = useCallback(
    async (
      callId: number,
      activityType: "evaluation" | "coaching",
      idConseiller: number
    ) => {
      // ✅ Validation d'entrée
      if (!callId || callId <= 0) {
        console.error("❌ callId invalide pour createActivityForCall:", callId);
        setError("ID d'appel invalide");
        return;
      }

      if (!idConseiller || idConseiller <= 0) {
        console.error(
          "❌ idConseiller invalide pour createActivityForCall:",
          idConseiller
        );
        setError("ID conseiller invalide");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log("🔍 DEBUG useCallActivity: Création activité:", {
          callId,
          activityType,
          idConseiller,
        });

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

        if (errorActivity) {
          console.error("❌ Erreur création activité:", errorActivity);
          throw new Error(`Erreur création activité: ${errorActivity.message}`);
        }

        const activityId = activityData.idactivite;
        console.log("✅ DEBUG useCallActivity: Activité créée:", {
          activityId,
          callId,
        });

        // Créer la relation
        const { error: relationError } = await supabaseClient
          .from("callactivityrelation")
          .insert({ callid: callId, activityid: activityId });

        if (relationError) {
          console.error("❌ Erreur création relation:", relationError);
          throw new Error(`Erreur création relation: ${relationError.message}`);
        }

        setIdCallActivite(activityId);
        console.log(
          "✅ DEBUG useCallActivity: Activité et relation créées avec succès"
        );
      } catch (error: any) {
        console.error("❌ Erreur création activité:", error);
        setError(error.message || "Erreur lors de la création de l'activité");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const removeActivityForCall = useCallback(
    async (callId: number) => {
      // ✅ Validation d'entrée
      if (!callId || callId <= 0) {
        console.error("❌ callId invalide pour removeActivityForCall:", callId);
        setError("ID d'appel invalide");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log(
          "🔍 DEBUG useCallActivity: Suppression activité pour callId:",
          callId
        );

        const { data: relations, error: relationsError } = await supabaseClient
          .from("callactivityrelation")
          .select("activityid")
          .eq("callid", callId);

        if (relationsError) {
          console.error("❌ Erreur récupération relations:", relationsError);
          throw new Error(
            `Erreur récupération relations: ${relationsError.message}`
          );
        }

        const activityId = relations?.[0]?.activityid;
        if (!activityId) {
          console.log(
            "ℹ️ DEBUG useCallActivity: Pas d'activité à supprimer pour callId:",
            callId
          );
          return;
        }

        // Supprimer la relation
        const { error: deleteRelationError } = await supabaseClient
          .from("callactivityrelation")
          .delete()
          .eq("callid", callId);

        if (deleteRelationError) {
          console.error("❌ Erreur suppression relation:", deleteRelationError);
          throw new Error(
            `Erreur suppression relation: ${deleteRelationError.message}`
          );
        }

        // Vérifier s'il reste d'autres relations pour cette activité
        const { data: remainingRelations, error: remainingError } =
          await supabaseClient
            .from("callactivityrelation")
            .select("callid")
            .eq("activityid", activityId);

        if (remainingError) {
          console.error(
            "❌ Erreur vérification relations restantes:",
            remainingError
          );
          throw new Error(
            `Erreur vérification relations: ${remainingError.message}`
          );
        }

        // Si plus de relations, supprimer l'activité
        if ((remainingRelations?.length ?? 0) === 0) {
          const { error: deleteActivityError } = await supabaseClient
            .from("activitesconseillers")
            .delete()
            .eq("idactivite", activityId);

          if (deleteActivityError) {
            console.error(
              "❌ Erreur suppression activité:",
              deleteActivityError
            );
            throw new Error(
              `Erreur suppression activité: ${deleteActivityError.message}`
            );
          }

          console.log(
            "✅ DEBUG useCallActivity: Activité supprimée:",
            activityId
          );
        }

        setIdCallActivite(null);

        // Rafraîchir les appels si entreprise sélectionnée
        if (selectedEntreprise) {
          await fetchCalls(selectedEntreprise);
        }

        console.log(
          "✅ DEBUG useCallActivity: Suppression activité terminée avec succès"
        );
      } catch (error: any) {
        console.error("❌ Erreur suppression activité:", error);
        setError(
          error.message || "Erreur lors de la suppression de l'activité"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [fetchCalls, selectedEntreprise]
  );

  // ✅ Fonction pour clear l'erreur manuellement
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  console.log("🔍 DEBUG useCallActivity render:", {
    selectedCallId: selectedCall?.callid,
    idCallActivite,
    isLoading,
    hasError: !!error,
  });

  return {
    idCallActivite,
    fetchActivitiesForCall,
    createActivityForCall,
    removeActivityForCall,
    isLoading,
    getActivityIdFromCallId,
    error, // ✅ Exposer l'erreur
    clearError, // ✅ Fonction pour clear l'erreur
  };
}
