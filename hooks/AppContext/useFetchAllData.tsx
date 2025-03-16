import { useState, useCallback } from "react";
import { supabaseClient } from "@/lib/supabaseClient";

interface FetchAllDataResult {
  idpratique: number;
  fiche_conseiller_json: any;
  fiche_coach_json: any;
  pratiques: {
    nompratique: string;
    description: string;
    jeuderole?: string;
    idcategoriepratique: number;
    categoriespratiques: {
      idcategoriepratique: number;
      nomcategorie: string;
      couleur: string;
    };
  };
}

export function useFetchAllData() {
  const [data, setData] = useState<FetchAllDataResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = useCallback(
    async (idPratique: number, selectedEntrepriseId: number = 6) => {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabaseClient
        .from("entreprise_pratiques")
        .select(
          `
              idpratique,
              fiche_conseiller_json,
              fiche_coach_json,
              pratiques: idpratique!inner(
                nompratique,
                description,
                jeuderole,
                idcategoriepratique,
                categoriespratiques: idcategoriepratique (
                  idcategoriepratique,
                  nomcategorie,
                  couleur
                )
              )
            `
        )
        .eq("identreprise", selectedEntrepriseId)
        .eq("idpratique", idPratique)
        .single(); // 🔴 Assure que Supabase retourne un objet unique

      if (error) {
        setError(error.message);
        console.error(
          "Erreur lors de la récupération des données:",
          error.message
        );
      } else {
        if (data) {
          // ✅ Vérifier si `pratiques` est un tableau et extraire le premier élément
          const formattedPratiques =
            Array.isArray(data.pratiques) && data.pratiques.length > 0
              ? data.pratiques[0]
              : null;

          // ✅ Vérifier si `categoriespratiques` est un tableau et extraire le premier élément
          const formattedCategoriesPratiques =
            formattedPratiques &&
            Array.isArray(formattedPratiques.categoriespratiques) &&
            formattedPratiques.categoriespratiques.length > 0
              ? formattedPratiques.categoriespratiques[0]
              : {
                  idcategoriepratique: 0,
                  nomcategorie: "",
                  couleur: "",
                }; // ⚠️ Valeurs par défaut

          const formattedData: FetchAllDataResult = {
            idpratique: data.idpratique,
            fiche_conseiller_json: data.fiche_conseiller_json,
            fiche_coach_json: data.fiche_coach_json,
            pratiques: formattedPratiques
              ? {
                  ...formattedPratiques,
                  categoriespratiques: formattedCategoriesPratiques, // 🔴 Assurez-vous qu'on garde un objet ici
                }
              : {
                  nompratique: "",
                  description: "",
                  jeuderole: undefined,
                  idcategoriepratique: 0,
                  categoriespratiques: {
                    idcategoriepratique: 0,
                    nomcategorie: "",
                    couleur: "",
                  },
                }, // ⚠️ Valeurs par défaut pour éviter les erreurs
          };

          setData(formattedData);
        }
      }

      setIsLoading(false);
    },
    []
  );

  return { data, fetchAllData, isLoading, error };
}
