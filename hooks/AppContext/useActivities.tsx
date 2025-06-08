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

        // 🛠️ Conversion explicite vers le type CategoriePratique[]
        return (data ?? []).map((category) => ({
          id: category.idcategoriepratique,
          name: category.nomcategorie,
          couleur: category.couleur,
        })) as CategoriePratique[];
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
          `idpratique, nompratique, description, jeuderole, idcategoriepratique, geste`
        )
        .order("idpratique", { ascending: true });

      if (error) {
        console.error(
          "Erreur lors de la récupération des pratiques :",
          error.message
        );
        throw new Error(error.message);
      }

      // ✅ Fix: Create proper Pratique objects with all required properties from Item interface
      return (data ?? []).map((pratique) => ({
        // Properties from Item interface (required by Pratique extends Item)
        idsujet: 0, // Default value - adjust based on your business logic
        valeurnumérique: 0, // Default value - adjust based on your business logic
        idpratique: pratique.idpratique,
        nompratique: pratique.nompratique,
        nomsujet: "", // Default value - adjust based on your business logic
        iddomaine: 0, // Default value - adjust based on your business logic
        idcategoriesujet: 0, // Default value - adjust based on your business logic
        idcategoriepratique: pratique.idcategoriepratique,
        categoriespratiques: {
          id: pratique.idcategoriepratique,
          name: "", // You might want to join with categories table to get this
          couleur: "",
        },

        // Pratique-specific properties
        description: pratique.description,
        jeuderole: pratique.jeuderole,
        geste: pratique.geste,
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
    categoriesPratiques,
    fetchReviewsForPractice,
    reviews,
    averageRating,
  };
}
