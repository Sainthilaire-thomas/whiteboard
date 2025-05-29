// hooks/useHighlightedPractices.ts
import { useState, useEffect, useMemo } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { Postit, RelationSujetPratique } from "@/types/types";

/**
 * Hook spécialisé pour gérer les pratiques mises en évidence
 * selon le sujet sélectionné dans un post-it
 */
export function useHighlightedPractices(selectedPostit: Postit | null) {
  const [subjectPracticeRelations, setSubjectPracticeRelations] = useState<
    RelationSujetPratique[]
  >([]);
  const [loading, setLoading] = useState(false);

  // Charger les relations sujet-pratique une seule fois
  useEffect(() => {
    const fetchRelations = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabaseClient
          .from("sujetspratiques")
          .select("*");

        if (error) {
          console.error(
            "❌ Erreur récupération relations sujet-pratique:",
            error
          );
          return;
        }

        console.log("✅ Relations sujet-pratique chargées:", data?.length);
        setSubjectPracticeRelations(data || []);
      } catch (err) {
        console.error("❌ Erreur lors du chargement des relations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRelations();
  }, []);

  // Calculer les pratiques mises en évidence selon le post-it sélectionné
  const highlightedPractices = useMemo(() => {
    if (!selectedPostit?.idsujet || !subjectPracticeRelations.length) {
      console.log("❌ Pas de sujet sélectionné ou pas de relations");
      return [];
    }

    const relatedPractices = subjectPracticeRelations
      .filter((relation) => relation.idsujet === selectedPostit.idsujet)
      .map((relation) => relation.idpratique);

    console.log(
      `✅ Pratiques mises en évidence pour sujet ${selectedPostit.idsujet}:`,
      relatedPractices
    );

    return relatedPractices;
  }, [selectedPostit?.idsujet, subjectPracticeRelations]);

  return {
    highlightedPractices,
    subjectPracticeRelations,
    loading,
  };
}
