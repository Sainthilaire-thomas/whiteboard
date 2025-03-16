import { useState, useEffect } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { Entreprise } from "@/types/types";

export function useEntreprises() {
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEntreprises = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error } = await supabaseClient
          .from("entreprises")
          .select("*");

        if (error) {
          throw error;
        }

        // ✅ Transformation des données avant de mettre à jour l'état
        const formattedData: Entreprise[] = data.map((entreprise: any) => ({
          id: entreprise.identreprise, // Uniformisation des ID
          nom: entreprise.nomentreprise, // Uniformisation des noms
          identreprise: entreprise.identreprise,
          nomentreprise: entreprise.nomentreprise,
        }));

        setEntreprises(formattedData);
      } catch (err: any) {
        console.error("Erreur lors du chargement des entreprises:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntreprises();
  }, []);

  return { entreprises, isLoading, error };
}
