// hooks/useActivityPhases.ts
import { useState, useEffect, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { supabaseClient } from "@/lib/supabaseClient";
import { PhaseKey, StepStatus } from "../types";

export const useActivityPhases = () => {
  const { user } = useAuth0();
  const [phases, setPhases] = useState<Record<PhaseKey, StepStatus>>({
    selection: "réalisé",
    evaluation: "à faire",
    coaching: "à faire",
    suivi: "à faire",
    feedback: "à faire",
    admin: "à faire",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les phases depuis la DB
  const loadPhases = useCallback(async () => {
    if (!user?.sub) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabaseClient
        .from("activitesconseillers")
        .select(
          "sidebar_phase, sidebar_statut, sidebar_objectifs, sidebar_commentaires"
        )
        .eq("idconseiller", user.sub)
        .not("sidebar_phase", "is", null)
        .order("sidebar_date_modif", { ascending: false });

      if (error) throw error;

      // Transformer les données DB en état des phases
      const phasesFromDB: Record<PhaseKey, StepStatus> = { ...phases };

      data?.forEach((activity) => {
        if (activity.sidebar_phase && activity.sidebar_statut) {
          phasesFromDB[activity.sidebar_phase as PhaseKey] =
            activity.sidebar_statut as StepStatus;
        }
      });

      setPhases(phasesFromDB);
    } catch (err) {
      console.error("Erreur lors du chargement des phases:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  }, [user?.sub]);

  // Sauvegarder une phase
  const savePhase = useCallback(
    async (
      phaseKey: PhaseKey,
      newStatus: StepStatus,
      options?: {
        commentaires?: string;
        objectifs?: string;
      }
    ) => {
      if (!user?.sub) return;

      try {
        const updateData = {
          idconseiller: user.sub,
          sidebar_phase: phaseKey,
          sidebar_statut: newStatus,
          sidebar_objectifs: options?.objectifs,
          sidebar_commentaires: options?.commentaires,
        };

        // Vérifier si un enregistrement existe déjà pour cette phase
        const { data: existing } = await supabaseClient
          .from("activitesconseillers")
          .select("idactivite")
          .eq("idconseiller", user.sub)
          .eq("sidebar_phase", phaseKey)
          .single();

        let result;
        if (existing) {
          // Mettre à jour l'enregistrement existant
          result = await supabaseClient
            .from("activitesconseillers")
            .update(updateData)
            .eq("idactivite", existing.idactivite);
        } else {
          // Créer un nouvel enregistrement
          result = await supabaseClient.from("activitesconseillers").insert({
            ...updateData,
            dateactivite: new Date().toISOString(),
          });
        }

        if (result.error) throw result.error;

        // Mettre à jour l'état local
        setPhases((prev) => ({
          ...prev,
          [phaseKey]: newStatus,
        }));
      } catch (err) {
        console.error("Erreur lors de la sauvegarde de la phase:", err);
        setError(err instanceof Error ? err.message : "Erreur de sauvegarde");
      }
    },
    [user?.sub]
  );

  // Toggle d'une phase (pour compatibilité avec l'existant)
  const togglePhase = useCallback(
    (phaseKey: PhaseKey) => {
      if (phaseKey === "admin") return;

      const currentStatus = phases[phaseKey];
      const nextStatus: StepStatus =
        currentStatus === "à faire"
          ? "en cours"
          : currentStatus === "en cours"
          ? "réalisé"
          : "à faire";

      savePhase(phaseKey, nextStatus);
    },
    [phases, savePhase]
  );

  // Démarrer une phase
  const startPhase = useCallback(
    (phaseKey: PhaseKey, objectifs?: string) => {
      savePhase(phaseKey, "en cours", { objectifs });
    },
    [savePhase]
  );

  // Terminer une phase
  const completePhase = useCallback(
    (phaseKey: PhaseKey, commentaires?: string) => {
      savePhase(phaseKey, "réalisé", { commentaires });
    },
    [savePhase]
  );

  // Obtenir les détails d'une phase
  const getPhaseDetails = useCallback(
    async (phaseKey: PhaseKey) => {
      if (!user?.sub) return null;

      try {
        const { data, error } = await supabaseClient
          .from("activitesconseillers")
          .select(
            "sidebar_phase, sidebar_statut, sidebar_objectifs, sidebar_commentaires, sidebar_date_modif"
          )
          .eq("idconseiller", user.sub)
          .eq("sidebar_phase", phaseKey)
          .single();

        if (error && error.code !== "PGRST116") throw error;
        return data;
      } catch (err) {
        console.error("Erreur lors de la récupération des détails:", err);
        return null;
      }
    },
    [user?.sub]
  );

  // Charger les phases au montage
  useEffect(() => {
    loadPhases();
  }, [loadPhases]);

  return {
    phases,
    isLoading,
    error,
    loadPhases,
    savePhase,
    togglePhase,
    startPhase,
    completePhase,
    getPhaseDetails,
  };
};
