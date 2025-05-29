// hooks/usePhaseNavigation.ts
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PhaseKey, StepStatus, SubStep } from "../types";
import { useCallData } from "@/context/CallDataContext";
import { STATUS_CONFIG, ROUTES, VIEWS, COLORS } from "../constants";
import { useActivityPhases } from "./useActivityPhases";

export const usePhaseNavigation = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view");

  const [openPhase, setOpenPhase] = useState<PhaseKey | null>(null);
  const { selectedPostitForRolePlay } = useCallData();

  // 🆕 Utiliser le hook pour les phases persistées
  const {
    phases: stepStatus,
    togglePhase,
    startPhase,
    completePhase,
    isLoading: isPhasesLoading,
    error: phasesError,
  } = useActivityPhases();

  // Auto-expansion de la phase active
  useEffect(() => {
    if (currentView) {
      let targetPhase: PhaseKey | null = null;

      switch (currentView) {
        case VIEWS.SYNTHESE:
        case VIEWS.POSTIT:
          targetPhase = "evaluation";
          break;
        case VIEWS.ROLEPLAY:
          targetPhase = "coaching";
          break;
        case VIEWS.SELECTION:
          targetPhase = "selection";
          break;
        default:
          break;
      }

      if (targetPhase) {
        setOpenPhase(targetPhase);
      }
    }
  }, [currentView]);

  // 🆕 Démarrage automatique des phases selon la navigation
  useEffect(() => {
    // Démarrer automatiquement l'évaluation si on est sur la synthèse
    if (currentView === VIEWS.SYNTHESE && stepStatus.evaluation === "à faire") {
      startPhase("evaluation", "Analyse des passages d'appel");
    }

    // Démarrer automatiquement le coaching si on entre en jeu de rôle
    if (currentView === VIEWS.ROLEPLAY && stepStatus.coaching === "à faire") {
      startPhase("coaching", "Simulation et amélioration des pratiques");
    }
  }, [currentView, stepStatus, startPhase]);

  // Gestion des événements
  const handlePhaseClick = useCallback((key: PhaseKey) => {
    setOpenPhase((prev) => (prev === key ? null : key));
  }, []);

  // 🆕 Toggle avec sauvegarde
  const toggleStatus = useCallback(
    (key: PhaseKey) => {
      togglePhase(key);
    },
    [togglePhase]
  );

  const handleSubStepClick = useCallback(
    (subStep: SubStep) => {
      if (subStep.disabled) return;
      if (subStep.route) {
        router.push(subStep.route);
      }
    },
    [router]
  );

  // Détection de l'état actif
  const isActiveSubStep = useCallback(
    (route?: string): boolean => {
      if (!route) return false;

      if (route === "/evaluation/admin") {
        return window.location.pathname === "/evaluation/admin";
      }

      return !!searchParams?.toString().includes(route.split("?")[1]);
    },
    [searchParams]
  );

  const isActivePhase = useCallback(
    (phaseKey: PhaseKey): boolean => {
      switch (phaseKey) {
        case "selection":
          return currentView === "selection";
        case "evaluation":
          return currentView === "synthese" || currentView === "postit";
        case "coaching":
          return currentView === "roleplay";
        default:
          return false;
      }
    },
    [currentView]
  );

  // Navigation rapide
  const getQuickNavigation = useCallback(() => {
    if (currentView === VIEWS.ROLEPLAY) {
      return [
        {
          label: "Synthèse",
          route: ROUTES.EVALUATION.SYNTHESE,
          color: COLORS.BACK_ACTION,
        },
      ];
    }
    return [];
  }, [currentView]);

  // 🆕 Actions spécialisées pour les phases
  const completeEvaluation = useCallback(
    (commentaires?: string) => {
      completePhase("evaluation", commentaires);
    },
    [completePhase]
  );

  const completeCoaching = useCallback(
    (commentaires?: string) => {
      completePhase("coaching", commentaires);
    },
    [completePhase]
  );

  return {
    currentView,
    openPhase,
    stepStatus,
    isPhasesLoading,
    phasesError,
    handlePhaseClick,
    toggleStatus,
    handleSubStepClick,
    isActiveSubStep,
    isActivePhase,
    getQuickNavigation,
    // 🆕 Actions spécialisées
    startPhase,
    completeEvaluation,
    completeCoaching,
  };
};
