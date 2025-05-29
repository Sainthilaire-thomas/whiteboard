"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  SetStateAction,
} from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useActivities } from "@/hooks/AppContext/useActivities";
import { useDomains } from "@/hooks/useDomains";
import { useNudges } from "@/hooks/AppContext/useNudges";
import { useUI } from "@/hooks/AppContext/useUI";
import { useAuth } from "@/hooks/AppContext/useAuth";
import { useSelection } from "@/hooks/AppContext/useSelection";
import { useEntreprises } from "@/hooks/AppContext/useEntreprises";
// ❌ SUPPRIMÉ : import { useFilteredDomains } from "@/hooks/AppContext/useFilteredDomains";
import { useCallData } from "@/context/CallDataContext";
import { CallDataProvider } from "@/context/CallDataContext";
import { supabaseClient } from "@/lib/supabaseClient"; // ✅ Import direct de Supabase
import { useQuery } from "@tanstack/react-query"; // ✅ Import de useQuery

// 📌 Définition du type pour AppContext
import {
  AppContextType,
  Nudge,
  UseNudgesResult,
  Postit as PostitType,
  Domaine,
} from "@/types/types";

// 📌 Création du contexte
const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

// 📌 Provider principal
interface RawAppProviderProps {
  children: ReactNode;
  selectedEntreprise: number | null;
  setSelectedEntreprise: (id: number | null) => void;
}

export const RawAppProvider = ({
  children,
  selectedEntreprise,
  setSelectedEntreprise,
}: RawAppProviderProps) => {
  // 📦 Hooks custom
  const activités = useActivities();

  // ✅ SOLUTION : Intégrer directement la logique de filtrage des domaines
  const { data: filteredDomains = [] } = useQuery<Domaine[]>({
    queryKey: ["filteredDomains", selectedEntreprise],
    queryFn: async () => {
      if (selectedEntreprise) {
        const { data, error } = await supabaseClient
          .from("entreprise_domaines")
          .select(
            `
            iddomaine,
            domaines:iddomaine (
              iddomaine,
              nomdomaine,
              description
            )
          `
          )
          .eq("identreprise", selectedEntreprise);

        if (error) {
          console.error(
            "Erreur lors de la récupération des domaines filtrés",
            error
          );
          return [];
        }

        // Extraire les domaines de la jointure
        return data.map((entry: any) => entry.domaines).filter(Boolean);
      } else {
        // Domaines par défaut si pas d'entreprise sélectionnée
        const { data, error } = await supabaseClient
          .from("domaines")
          .select("*")
          .in("nomdomaine", ["escda", "satisfaction"]);

        if (error) {
          console.error(
            "Erreur lors de la récupération des domaines par défaut",
            error
          );
          return [];
        }

        return data || [];
      }
    },
    enabled: true, // Toujours activé
  });

  // ✅ Hook useDomains avec les domaines filtrés
  const domaines = useDomains();

  // ✅ SYNCHRONISATION : S'assurer que selectedDomain est valide pour l'entreprise
  useEffect(() => {
    if (filteredDomains && filteredDomains.length > 0) {
      const isCurrentDomainValid =
        domaines.selectedDomain &&
        filteredDomains.some(
          (d: Domaine) => d.iddomaine.toString() === domaines.selectedDomain
        );

      if (!domaines.selectedDomain || !isCurrentDomainValid) {
        const firstAvailableDomain = filteredDomains[0].iddomaine.toString();
        console.log(
          "🔍 AppContext - Auto-selecting domain for enterprise:",
          firstAvailableDomain
        );
        domaines.selectDomain(firstAvailableDomain);
      }
    }
  }, [filteredDomains, domaines.selectedDomain, domaines.selectDomain]);

  const nudges = useNudges();
  const ui = useUI();
  const auth = useAuth();

  const { entreprises, isLoading, error } = useEntreprises();

  const { idCallActivite, selectedCall } = useCallData();
  const selectedCallId = selectedCall?.callid ?? null;
  const selection = useSelection(null, selectedCallId, idCallActivite);

  // 🗂️ États globaux
  const [idActivite, setIdActivite] = useState<number | null>(null);
  const [idPratique, setIdPratique] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // ✅ DEBUG pour voir la correspondance
  useEffect(() => {
    console.log("🔍 AppContext - Filtered domains:", {
      selectedEntreprise,
      filteredDomainsCount: filteredDomains?.length,
      selectedDomain: domaines.selectedDomain,
      filteredDomains: filteredDomains?.map((d: Domaine) => ({
        id: d.iddomaine,
        nom: d.nomdomaine,
      })),
    });
  }, [selectedEntreprise, filteredDomains, domaines.selectedDomain]);

  return (
    <AppContext.Provider
      value={{
        // Activités et Avis
        pratiques: activités.pratiques || [],
        isLoadingPratiques: activités.isLoadingPratiques,
        fetchReviewsForPractice: activités.fetchReviewsForPractice,
        reviews: activités.reviews || [],
        averageRating: activités.averageRating,
        categoriesPratiques: activités.categoriesPratiques || [],

        // Domaines et Sujets
        domains: domaines.domains || [],
        selectedDomain: domaines.selectedDomain,
        selectDomain: domaines.selectDomain,
        sujetsData: domaines.sujetsData || [],
        categoriesSujets: domaines.categoriesSujets || [],

        isLoadingDomains: domaines.isLoadingDomains,
        isLoadingSujets: domaines.isLoadingSujets,
        isLoadingCategoriesSujets: domaines.isLoadingCategoriesSujets,

        // ✅ Exposer filteredDomains dans le contexte
        filteredDomains: filteredDomains || [],

        // Nudges
        nudges: nudges.nudges || [],
        setNudges: function (value: SetStateAction<Nudge[]>) {
          throw new Error("Function not implemented.");
        },
        fetchNudgesForPractice: nudges.fetchNudgesForPractice,
        fetchNudgesForActivity: nudges.fetchNudgesForActivity,
        refreshNudgesFunction: nudges.refreshNudgesFunction,
        refreshNudges: nudges.refreshNudges,
        updateNudgeDates: nudges.updateNudgeDates,
        nudgeDates: nudges.nudgeDates,
        nudgesUpdated: nudges.nudgesUpdated,
        markNudgesAsUpdated: nudges.markNudgesAsUpdated,
        resetNudgesUpdated: nudges.resetNudgesUpdated,

        // UI et Navigation
        drawerOpen: ui.drawerOpen,
        toggleDrawer: ui.toggleDrawer,
        drawerContent: ui.drawerContent,
        setDrawerContent: ui.setDrawerContent,
        handleOpenDrawerWithContent: ui.handleOpenDrawerWithContent,
        handleOpenDrawerWithData: ui.handleOpenDrawerWithData,

        // Entreprises
        entreprises,
        isLoadingEntreprises: isLoading,
        errorEntreprises: error,

        // États globaux
        idActivite,
        setIdActivite,
        idPratique,
        setIdPratique,
        selectedEntreprise,
        setSelectedEntreprise,
        refreshKey,
        setRefreshKey,

        // Sélections (via useSelection)
        ...selection,

        // Authentification
        user: auth.user,
        isLoading: auth.isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
