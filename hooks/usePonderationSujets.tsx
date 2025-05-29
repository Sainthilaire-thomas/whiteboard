// hooks/usePonderationSujets.ts

import { useState, useEffect, useCallback } from "react";
import { useSupabase } from "@/context/SupabaseContext";
import { PonderationSujet, ConformiteChoice } from "@/types/types";

interface UsePonderationSujetsReturn {
  ponderations: PonderationSujet[];
  loading: boolean;
  error: string | null;
  fetchPonderations: () => Promise<void>;
  getPonderationBySujet: (idsujet: number) => PonderationSujet | undefined;
  calculatePoints: (idsujet: number, choice: ConformiteChoice) => number;
  saveConformiteChoice: (params: SaveConformiteParams) => Promise<boolean>;
  refreshPonderations: () => Promise<void>;
}

interface SaveConformiteParams {
  postitId: string | number;
  idsujet: number;
  conformiteChoice: ConformiteChoice;
  pointsAttribues: number;
  userId?: string;
  activiteId?: string | number;
}

export const usePonderationSujets = (): UsePonderationSujetsReturn => {
  const { supabase, isSupabaseReady } = useSupabase();
  const [ponderations, setPonderations] = useState<PonderationSujet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour récupérer les pondérations directement depuis Supabase
  const fetchPonderationsFromSupabase = useCallback(async () => {
    if (!isSupabaseReady) {
      console.warn("Supabase n'est pas encore prêt");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase
        .from("ponderation_sujets")
        .select(
          `
          id_ponderation,
          idsujet,
          conforme,
          partiellement_conforme,
          non_conforme,
          permet_partiellement_conforme
        `
        )
        .order("idsujet", { ascending: true });

      if (supabaseError) {
        throw new Error(`Erreur Supabase: ${supabaseError.message}`);
      }

      if (data) {
        setPonderations(data);
        console.log(`${data.length} pondérations chargées depuis Supabase`);
      } else {
        setPonderations([]);
        console.warn("Aucune pondération trouvée");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue";
      setError(errorMessage);
      console.error("Erreur lors du chargement des pondérations:", err);

      // Données de fallback pour le développement
      console.warn("Utilisation des données de fallback");
      setPonderations([
        {
          id_ponderation: 1,
          idsujet: 123,
          conforme: 10,
          partiellement_conforme: 5,
          non_conforme: 0,
          permet_partiellement_conforme: true,
        },
        {
          id_ponderation: 2,
          idsujet: 124,
          conforme: 15,
          partiellement_conforme: 8,
          non_conforme: -5,
          permet_partiellement_conforme: true,
        },
        {
          id_ponderation: 3,
          idsujet: 125,
          conforme: 20,
          partiellement_conforme: 0,
          non_conforme: -10,
          permet_partiellement_conforme: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [supabase, isSupabaseReady]);

  // Fonction pour récupérer via l'API (alternative)
  const fetchPonderationsFromAPI = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ponderation-sujets", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data: PonderationSujet[] = await response.json();
      setPonderations(data);
      console.log(`${data.length} pondérations chargées depuis l'API`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue";
      setError(errorMessage);
      console.error("Erreur lors du chargement des pondérations via API:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction principale de récupération (utilise Supabase en priorité)
  const fetchPonderations = useCallback(async () => {
    if (isSupabaseReady) {
      await fetchPonderationsFromSupabase();
    } else {
      await fetchPonderationsFromAPI();
    }
  }, [
    isSupabaseReady,
    fetchPonderationsFromSupabase,
    fetchPonderationsFromAPI,
  ]);

  // Fonction pour obtenir une pondération par sujet
  const getPonderationBySujet = useCallback(
    (idsujet: number): PonderationSujet | undefined => {
      return ponderations.find((p) => p.idsujet === idsujet);
    },
    [ponderations]
  );

  // Fonction pour calculer les points selon le choix
  const calculatePoints = useCallback(
    (idsujet: number, choice: ConformiteChoice): number => {
      const ponderation = getPonderationBySujet(idsujet);
      if (!ponderation) return 0;

      switch (choice) {
        case "conforme":
          return ponderation.conforme;
        case "partiellement_conforme":
          return ponderation.partiellement_conforme;
        case "non_conforme":
          return ponderation.non_conforme;
        default:
          return 0;
      }
    },
    [getPonderationBySujet]
  );

  // Fonction pour sauvegarder le choix de conformité
  const saveConformiteChoice = useCallback(
    async (params: SaveConformiteParams): Promise<boolean> => {
      try {
        const response = await fetch("/api/ponderation-sujets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(params),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erreur lors de la sauvegarde");
        }

        const result = await response.json();
        console.log("Choix de conformité sauvegardé:", result);
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erreur inconnue";
        console.error("Erreur lors de la sauvegarde du choix:", errorMessage);
        setError(errorMessage);
        return false;
      }
    },
    []
  );

  // Fonction pour rafraîchir les pondérations
  const refreshPonderations = useCallback(async () => {
    await fetchPonderations();
  }, [fetchPonderations]);

  // Chargement initial
  useEffect(() => {
    fetchPonderations();
  }, [fetchPonderations]);

  // Recharger quand Supabase devient prêt
  useEffect(() => {
    if (isSupabaseReady && ponderations.length === 0) {
      fetchPonderations();
    }
  }, [isSupabaseReady, ponderations.length, fetchPonderations]);

  return {
    ponderations,
    loading,
    error,
    fetchPonderations,
    getPonderationBySujet,
    calculatePoints,
    saveConformiteChoice,
    refreshPonderations,
  };
};
