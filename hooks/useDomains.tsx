import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabaseClient";
import {
  Domaine,
  Sujet,
  CategorieSujet,
  UseDomainsResult,
} from "@/types/types";

export function useDomains(): UseDomainsResult {
  const [selectedDomain, setSelectedDomain] = useState<string>("");

  // 🔹 Récupération des domaines
  const {
    data: domains = [],
    isLoading: isLoadingDomains,
    isError: isErrorDomains,
    refetch: fetchDomains,
  } = useQuery<Domaine[]>({
    queryKey: ["domains"],
    queryFn: async () => {
      const { data, error } = await supabaseClient.from("domaines").select("*");
      if (error) {
        console.error(
          "Erreur lors de la récupération des domaines :",
          error.message
        );
        throw new Error(error.message);
      }
      return data ?? [];
    },
  });

  // 🔹 Récupération des sujets liés au domaine sélectionné
  const { data: sujets = [], isLoading: isLoadingSujets } = useQuery<Sujet[]>({
    queryKey: ["sujets", selectedDomain],
    queryFn: async () => {
      if (!selectedDomain) return [];
      const { data, error } = await supabaseClient
        .from("sujets")
        .select("*")
        .eq("iddomaine", selectedDomain)
        .order("idsujet", { ascending: true });

      if (error) {
        console.error(
          "Erreur lors de la récupération des sujets :",
          error.message
        );
        throw new Error(error.message);
      }

      return data ?? [];
    },
    enabled: !!selectedDomain,
  });

  // 🔹 Récupération des catégories de sujets
  const { data: categoriesSujets = [], isLoading: isLoadingCategoriesSujets } =
    useQuery<CategorieSujet[]>({
      queryKey: ["categoriesSujets"],
      queryFn: async () => {
        const { data, error } = await supabaseClient
          .from("categoriessujets")
          .select("*");
        if (error) {
          console.error(
            "Erreur lors de la récupération des catégories de sujets :",
            error.message
          );
          throw new Error(error.message);
        }

        return data ?? [];
      },
    });

  // 🏷️ Création d'un mapping entre ID domaine et nom
  const domainNames = useMemo(() => {
    return domains.reduce<Record<number, string>>((acc, domaine) => {
      acc[domaine.iddomaine] = domaine.nomdomaine;
      return acc;
    }, {});
  }, [domains]);

  // ✅ SIMPLIFICATION : Garder la logique existante pour l'instant
  // La synchronisation avec filteredDomains se fera dans AppContext
  useEffect(() => {
    if (
      domains.length > 0 &&
      (!selectedDomain ||
        !domains.some((d) => d.iddomaine.toString() === selectedDomain))
    ) {
      setSelectedDomain(domains[0].iddomaine.toString());
    }
  }, [domains, selectedDomain]);

  // ✅ DEBUG POUR IDENTIFIER L'ORIGINE
  useEffect(() => {
    console.log("🔍 DEBUG useDomains - Initialisation:", {
      selectedDomain,
      type: typeof selectedDomain,
      source: "useDomains hook",
    });
  }, []);

  // ✅ DEBUG QUAND selectedDomain CHANGE
  useEffect(() => {
    console.log("🔍 DEBUG useDomains - selectedDomain changed:", {
      newValue: selectedDomain,
      type: typeof selectedDomain,
      timestamp: new Date().toISOString(),
    });
  }, [selectedDomain]);

  // 🎯 Alias pour `setSelectedDomain` avec debug
  const selectDomain = (domainId: string) => {
    console.log("🔍 selectDomain called with:", domainId);
    setSelectedDomain(domainId);
  };

  // ✅ Encapsulation de `fetchDomains` pour le typage correct
  const refetchDomains = async (): Promise<void> => {
    await fetchDomains();
  };

  return {
    domains,
    isLoadingDomains,
    isErrorDomains,
    domainNames,
    fetchDomains: refetchDomains,
    sujets,
    isLoadingSujets,
    categoriesSujets,
    isLoadingCategoriesSujets,
    selectedDomain,
    setSelectedDomain,
    selectDomain,
    sujetsData: sujets,
  };
}
