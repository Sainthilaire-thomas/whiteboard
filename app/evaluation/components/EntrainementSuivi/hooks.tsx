import { useState, useCallback, useEffect } from "react";
import { useSupabase } from "@/context/SupabaseContext";
import {
  Pratique,
  Exercice,
  CustomNudges,
  TrainingPlan,
  PlanningNudge,
} from "./types";

interface CategoriePratique {
  idcategoriepratique: number;
  nomcategorie: string;
  couleur: string;
}

export const useEntrainementData = () => {
  const { supabase } = useSupabase();
  const [pratiques, setPratiques] = useState<Pratique[]>([]);
  const [exercices, setExercices] = useState<Exercice[]>([]);
  const [categoriesPratiques, setCategoriesPratiques] = useState<
    CategoriePratique[]
  >([]);
  const [customNudges, setCustomNudges] = useState<CustomNudges | null>(null);
  const [trainingPlan, setTrainingPlan] = useState<TrainingPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Chargement des catégories de pratiques
  const loadCategoriesPratiques = useCallback(async () => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from("categoriespratiques")
        .select("*");

      if (error) throw error;
      setCategoriesPratiques(data || []);
    } catch (error) {
      console.error(
        "Erreur lors du chargement des catégories de pratiques:",
        error
      );
    }
  }, [supabase]);

  // Chargement des pratiques avec jointure des couleurs
  const loadPratiques = useCallback(async () => {
    if (!supabase) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("pratiques")
        .select(
          `
          *,
          categoriespratiques!inner(
            nomcategorie,
            couleur
          )
        `
        )
        .order("nompratique");

      if (error) throw error;

      // Enrichir les pratiques avec les couleurs de catégories
      const pratiquesEnrichies =
        data?.map((pratique: any) => ({
          ...pratique,
          categoryColor: pratique.categoriespratiques?.couleur || "#3f51b5",
          categoryName:
            pratique.categoriespratiques?.nomcategorie || "Non catégorisé",
        })) || [];

      setPratiques(pratiquesEnrichies);
    } catch (error) {
      console.error("Erreur lors du chargement des pratiques:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Chargement des exercices pour une pratique
  const loadExercices = useCallback(
    async (idpratique: number) => {
      if (!supabase) return;

      try {
        const { data, error } = await supabase
          .from("exercices")
          .select("*")
          .eq("idpratique", idpratique)
          .order("nomexercice");

        if (error) throw error;
        setExercices(data || []);
      } catch (error) {
        console.error("Erreur lors du chargement des exercices:", error);
      }
    },
    [supabase]
  );

  // Chargement des nudges personnalisés pour une pratique
  const loadCustomNudges = useCallback(
    async (idpratique: number, idActivite?: number) => {
      if (!supabase) return;

      try {
        let query = supabase
          .from("custom_nudges")
          .select("*")
          .eq("id_pratique", idpratique);

        if (idActivite) {
          query = query.eq("id_activite", idActivite);
        }

        const { data, error } = await query.single();

        if (error && error.code !== "PGRST116") {
          // PGRST116 = no rows returned
          throw error;
        }

        setCustomNudges(data || null);
      } catch (error) {
        console.error(
          "Erreur lors du chargement des nudges personnalisés:",
          error
        );
        setCustomNudges(null);
      }
    },
    [supabase]
  );

  // Sauvegarde des nudges personnalisés
  const saveCustomNudges = useCallback(
    async (nudgesData: Partial<CustomNudges>) => {
      if (!supabase) return false;

      setSaving(true);
      try {
        if (customNudges?.id) {
          // Mise à jour
          const { error } = await supabase
            .from("custom_nudges")
            .update(nudgesData)
            .eq("id", customNudges.id);

          if (error) throw error;

          setCustomNudges((prev) => (prev ? { ...prev, ...nudgesData } : null));
        } else {
          // Création
          const { data, error } = await supabase
            .from("custom_nudges")
            .insert(nudgesData)
            .select()
            .single();

          if (error) throw error;
          setCustomNudges(data);
        }

        return true;
      } catch (error) {
        console.error(
          "Erreur lors de la sauvegarde des nudges personnalisés:",
          error
        );
        return false;
      } finally {
        setSaving(false);
      }
    },
    [supabase, customNudges]
  );

  // Génération du planning d'entraînement
  const generateTrainingPlan = useCallback(
    (
      nudges: string[],
      durationDays: number,
      startDate: Date = new Date()
    ): TrainingPlan => {
      const validNudges = nudges.filter((nudge) => nudge && nudge.trim());
      const daysPerNudge = Math.floor(durationDays / validNudges.length);
      const extraDays = durationDays % validNudges.length;

      const planningNudges: PlanningNudge[] = [];
      let currentDate = new Date(startDate);

      validNudges.forEach((nudge, index) => {
        const days = daysPerNudge + (index < extraDays ? 1 : 0);
        const startDay = new Date(currentDate);
        const endDay = new Date(currentDate);
        endDay.setDate(endDay.getDate() + days - 1);

        planningNudges.push({
          nudgeNumber: index + 1,
          content: nudge,
          startDate: startDay,
          endDate: endDay,
          dayRange: `Jour ${
            Math.floor(
              (startDay.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
            ) + 1
          }-${
            Math.floor(
              (endDay.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
            ) + 1
          }`,
        });

        currentDate.setDate(currentDate.getDate() + days);
      });

      const plan: TrainingPlan = {
        totalDuration: durationDays,
        nudges: planningNudges,
        startDate,
      };

      setTrainingPlan(plan);
      return plan;
    },
    []
  );

  // Chargement initial
  useEffect(() => {
    const loadInitialData = async () => {
      await loadCategoriesPratiques();
      await loadPratiques();
    };
    loadInitialData();
  }, [loadCategoriesPratiques, loadPratiques]);

  return {
    pratiques,
    exercices,
    categoriesPratiques,
    customNudges,
    trainingPlan,
    loading,
    saving,
    loadExercices,
    loadCustomNudges,
    saveCustomNudges,
    generateTrainingPlan,
    getPratiqueById: (id: number) => pratiques.find((p) => p.idpratique === id),
    getCategoryColor: (idcategoriepratique: number) => {
      const category = categoriesPratiques.find(
        (c) => c.idcategoriepratique === idcategoriepratique
      );
      return category?.couleur || "#3f51b5";
    },
    // Grouper les pratiques par catégorie dans un ordre spécifique
    getPratiquesGroupedByCategory: () => {
      // Ordre des catégories selon votre demande
      const categoryOrder = [
        "Savoir Faire",
        "Savoir Etre",
        "Situations Difficiles",
        "Rebond",
      ];

      const grouped = categoriesPratiques
        .map((category) => ({
          ...category,
          pratiques: pratiques.filter(
            (p) => p.idcategoriepratique === category.idcategoriepratique
          ),
        }))
        .filter((group) => group.pratiques.length > 0)
        .sort((a, b) => {
          const indexA = categoryOrder.findIndex(
            (cat) =>
              a.nomcategorie.toLowerCase().includes(cat.toLowerCase()) ||
              cat.toLowerCase().includes(a.nomcategorie.toLowerCase())
          );
          const indexB = categoryOrder.findIndex(
            (cat) =>
              b.nomcategorie.toLowerCase().includes(cat.toLowerCase()) ||
              cat.toLowerCase().includes(b.nomcategorie.toLowerCase())
          );

          // Si pas trouvé dans l'ordre défini, mettre à la fin
          if (indexA === -1 && indexB === -1) return 0;
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;

          return indexA - indexB;
        });

      return grouped;
    },
  };
};
