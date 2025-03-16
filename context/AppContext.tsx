"use client";

import {
  createContext,
  useContext,
  useState,
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

// 📌 Définition du type pour AppContext
import { AppContextType, Nudge, UseNudgesResult } from "@/types/types";

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
export const RawAppProvider = ({ children }: { children: ReactNode }) => {
  // 📦 Hooks custom
  const activités = useActivities();
  const domaines = useDomains();

  const nudges = useNudges();
  const ui = useUI();
  const auth = useAuth();
  const sélections = useSelection();
  const { entreprises, isLoading, error } = useEntreprises();

  // 🗂️ États globaux
  const [idActivite, setIdActivite] = useState<number | null>(null);
  const [idPratique, setIdPratique] = useState<number | null>(null);
  const [selectedEntreprise, setSelectedEntreprise] = useState<number | null>(
    null
  );
  const [refreshKey, setRefreshKey] = useState<number>(0);

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
        selectedSujet: sélections.selectedSujet,
        handleSelectSujet: sélections.handleSelectSujet,
        sujetsForActivite: sélections.sujetsForActivite,
        fetchSujetsForActivite: sélections.fetchSujetsForActivite,
        subjectPracticeRelations: sélections.subjectPracticeRelations,
        toggleSujet: sélections.toggleSujet,
        selectedPratique: sélections.selectedPratique,
        handleSelectPratique: sélections.handleSelectPratique,
        highlightedPractices: sélections.highlightedPractices,
        calculateHighlightedPractices: sélections.calculateHighlightedPractices,
        resetSelectedState: sélections.resetSelectedState,
        avatarTexts: sélections.avatarTexts,
        updateAvatarText: sélections.updateAvatarText,
        selectedPostitIds: sélections.selectedPostitIds,
        setSelectedPostitIds: sélections.setSelectedPostitIds,

        // Authentification
        user: auth.user,
        isLoading: auth.isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

const queryClient = new QueryClient();
export const AppProvider = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <RawAppProvider>{children}</RawAppProvider>
  </QueryClientProvider>
);
