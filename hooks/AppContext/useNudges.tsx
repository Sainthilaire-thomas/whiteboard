import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabaseClient";
import { Nudge, UseNudgesResult, NudgeDates } from "@/types/types";

export function useNudges(): UseNudgesResult {
  const [nudges, setNudges] = useState<Nudge[]>([]);
  const [nudgeDates, setNudgeDates] = useState<NudgeDates>({});
  const [nudgesUpdated, setNudgesUpdated] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // 🔄 Fonction pour reformater les données de Supabase
  const formatNudges = (data: any[]): Nudge[] => {
    return data.map((nudge) => ({
      idnudge: nudge.id_nudge,
      idactivite: nudge.id_activite ?? null,
      idpratique: nudge.id_pratique ?? null,
      contenu: [
        nudge.custom_nudge1,
        nudge.custom_nudge2,
        nudge.custom_nudge3,
        nudge.custom_nudge4,
        nudge.custom_nudge5,
        nudge.custom_nudge6,
      ]
        .filter(Boolean)
        .join(" | "), // Fusionne toutes les valeurs non nulles
      datecreation: nudge.datecreation || new Date().toISOString(),
    }));
  };

  // 🔄 Récupération des nudges pour une activité
  const fetchNudgesForActivity = useCallback(async (activityId: number) => {
    if (!activityId) return;

    const { data, error } = await supabaseClient
      .from("custom_nudges")
      .select("*")
      .eq("id_activite", activityId);

    if (error) {
      console.error(
        "Erreur lors de la récupération des nudges :",
        error.message
      );
      return;
    }

    setNudges(formatNudges(data));
    setRefreshKey((prev) => prev + 1);
  }, []);

  // 🔄 Récupération des nudges pour une pratique
  const fetchNudgesForPractice = useCallback(
    async (practiceId: number): Promise<Nudge[]> => {
      if (!practiceId) return [];

      const { data, error } = await supabaseClient
        .from("custom_nudges")
        .select("*")
        .eq("id_pratique", practiceId);

      if (error) {
        console.error(
          "Erreur lors de la récupération des nudges :",
          error.message
        );
        return [];
      }

      const formattedNudges = formatNudges(data);
      setNudges(formattedNudges);
      setRefreshKey((prev) => prev + 1);

      return formattedNudges; // ✅ Maintenant, on retourne bien les données
    },
    []
  );

  // 📅 Mise à jour des dates des nudges
  const updateNudgeDates = useCallback((newDates: NudgeDates) => {
    setNudgeDates(newDates);
    setRefreshKey((prev) => prev + 1);
  }, []);

  // 🔄 Rafraîchir les nudges
  const refreshNudges = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  // ✅ Marquer les nudges comme mis à jour
  const markNudgesAsUpdated = useCallback(() => {
    setNudgesUpdated(true);
  }, []);

  // ❌ Réinitialiser l'état des nudges mis à jour
  const resetNudgesUpdated = useCallback(() => {
    setNudgesUpdated(false);
  }, []);

  // ✅ Fonction pour rafraîchir les nudges
  const refreshNudgesFunction = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // 🔄 Chargement des nudges avec `react-query`
  const { data: fetchedNudges, isLoading } = useQuery<Nudge[]>({
    queryKey: ["nudges", refreshKey],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("custom_nudges")
        .select("*");

      if (error) {
        console.error("Erreur lors du chargement des nudges :", error.message);
        throw new Error(error.message);
      }

      return formatNudges(data);
    },
  });

  // Met automatiquement à jour les nudges si `fetchedNudges` change
  useEffect(() => {
    if (fetchedNudges) {
      setNudges(fetchedNudges);
    }
  }, [fetchedNudges]);

  return {
    nudges,
    nudgeDates,
    isLoading, // ✅ Fix de l'erreur `isLoadingNudges` manquant
    fetchNudgesForActivity,
    fetchNudgesForPractice,
    updateNudgeDates,
    refreshNudges,
    refreshNudgesFunction, // ✅ Assure-toi qu'il est bien inclus ici !
    markNudgesAsUpdated,
    resetNudgesUpdated,
    nudgesUpdated,
  };
}
