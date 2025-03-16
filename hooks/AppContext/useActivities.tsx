import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabaseClient";
import {
  Pratique,
  Avis,
  CategoriePratique,
  UseActivitiesResult,
} from "@/types/types";

export function useActivities(): UseActivitiesResult {
  const [reviews, setReviews] = useState<Avis[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);

  // 📌 Récupération des catégories de pratiques
  const { data: categoriesPratiques = [], isLoading: isLoadingCategories } =
    useQuery<CategoriePratique[]>({
      queryKey: ["categoriesPratiques"],
      queryFn: async () => {
        const { data, error } = await supabaseClient
          .from("categoriespratiques")
          .select("idcategoriepratique, nomcategorie, couleur");

        if (error) {
          console.error(
            "Erreur lors de la récupération des catégories de pratiques :",
            error.message
          );
          throw new Error(error.message);
        }

        // ✅ On mappe les données pour qu'elles correspondent au type `CategoriePratique`
        return (data ?? []).map((category) => ({
          id: category.idcategoriepratique, // ✅ Correction : `id`
          name: category.nomcategorie, // ✅ Correction : `name`
          couleur: category.couleur, // ✅ La couleur est bien présente
        })) as CategoriePratique[]; // 🔥 Assure la conformité avec `CategoriePratique`
      },
    });

  // 📌 Récupération des pratiques
  const { data: pratiques = [], isLoading: isLoadingPratiques } = useQuery<
    Pratique[]
  >({
    queryKey: ["pratiques"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("pratiques")
        .select(
          `idpratique, nompratique, description, jeuderole, idcategoriepratique`
        )
        .order("idpratique", { ascending: true });

      if (error) {
        console.error(
          "Erreur lors de la récupération des pratiques :",
          error.message
        );
        throw new Error(error.message);
      }

      return (data ?? []).map((pratique) => ({
        idpratique: pratique.idpratique,
        nompratique: pratique.nompratique,
        description: pratique.description,
        jeuderole: pratique.jeuderole,
        idcategoriepratique: pratique.idcategoriepratique,
      })) as Pratique[];
    },
  });

  // 📌 Fetch des avis pour une pratique
  const fetchReviewsForPractice = useCallback(async (idpratique: number) => {
    const { data, error } = await supabaseClient
      .from("avisexercicesnudges")
      .select("avis, userlike")
      .eq("idpratique", idpratique);

    if (error) {
      console.error("Erreur lors de la récupération des avis :", error.message);
      return;
    }

    setReviews(data as Avis[]);

    const average = data?.length
      ? data.reduce((acc: number, curr: Avis) => acc + curr.userlike, 0) /
        data.length
      : 0;

    setAverageRating(average);
  }, []);

  return {
    pratiques,
    isLoadingPratiques,
    categoriesPratiques, // ✅ Retourne bien les catégories conformes à `CategoriePratique`
    isLoadingCategories,
    fetchReviewsForPractice,
    reviews,
    averageRating,
  };
}
