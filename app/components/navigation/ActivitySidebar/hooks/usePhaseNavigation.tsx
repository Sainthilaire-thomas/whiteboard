// hooks/usePhaseNavigation.ts - VERSION TEMPS RÉEL
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PhaseKey, StepStatus, SubStep } from "../types";
import { useCallData } from "@/context/CallDataContext";
import { useAppContext } from "@/context/AppContext";
import { useConseiller } from "@/context/ConseillerContext";
import { STATUS_CONFIG, ROUTES, VIEWS, COLORS } from "../constants";
import { useActivityPhases } from "./useActivityPhases";

export const usePhaseNavigation = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view");

  const [openPhase, setOpenPhase] = useState<PhaseKey | null>(null);

  // 🎯 Récupération des contextes métier (comme ActivityIndicator)
  const { selectedCall, idCallActivite, selectedPostitForRolePlay } =
    useCallData();
  const { selectedEntreprise } = useAppContext();
  const { selectedConseiller } = useConseiller();

  // 🚀 État temps réel - réagit instantanément
  const [realtimeStatus, setRealtimeStatus] = useState<
    Record<PhaseKey, StepStatus>
  >({
    selection: "à faire",
    evaluation: "à faire",
    coaching: "à faire",
    suivi: "à faire",
    feedback: "à faire",
    admin: "à faire",
    entrainement: "à faire",
  });

  // Hook de persistance (utilisé en arrière-plan seulement)
  const {
    phases: dbPhases,
    savePhase,
    isLoading: isPhasesLoading,
    error: phasesError,
  } = useActivityPhases();

  // Ref pour éviter les doublons de sauvegarde
  const saveQueueRef = useRef<Map<PhaseKey, NodeJS.Timeout>>(new Map());

  // 🎯 Logique de validation des prérequis (inspirée d'ActivityIndicator)
  const getPhaseAvailability = useCallback(() => {
    return {
      selection: {
        available: true, // Toujours disponible
        completed: !!(selectedEntreprise && selectedConseiller),
        requirements: "Entreprise et conseiller",
      },
      evaluation: {
        available: !!(
          selectedEntreprise &&
          selectedConseiller &&
          selectedCall &&
          idCallActivite
        ),
        completed: false, // À déterminer selon la logique métier
        requirements: "Entreprise, conseiller, appel et activité créée",
      },
      coaching: {
        available: !!(
          selectedEntreprise &&
          selectedConseiller &&
          selectedCall &&
          idCallActivite &&
          selectedPostitForRolePlay
        ),
        completed: false,
        requirements: "Évaluation + post-it sélectionné",
      },
      entrainement: {
        available: !!(
          selectedEntreprise &&
          selectedConseiller &&
          selectedCall &&
          idCallActivite
        ),
        completed: false,
        requirements: "Entreprise, conseiller et appel sélectionnés",
      },
      suivi: {
        available: false, // À implémenter
        completed: false,
        requirements: "Coaching terminé",
      },
      feedback: {
        available: false, // À implémenter
        completed: false,
        requirements: "Suivi terminé",
      },
      admin: {
        available: !!selectedConseiller, // Admin disponible si conseiller connecté
        completed: false,
        requirements: "Conseiller connecté",
      },
    };
  }, [
    selectedEntreprise,
    selectedConseiller,
    selectedCall,
    idCallActivite,
    selectedPostitForRolePlay,
  ]);

  // 🎯 État intelligent basé sur les prérequis
  const getSmartPhaseStatus = useCallback(
    (phaseKey: PhaseKey): StepStatus => {
      const availability = getPhaseAvailability();
      const phaseInfo = availability[phaseKey];

      // Si les prérequis ne sont pas remplis → "à faire" (gris)
      if (!phaseInfo.available) {
        return "à faire";
      }

      // Si on est sur la vue correspondante et que les prérequis sont OK → "en cours" (bleu)
      const isActiveView =
        (phaseKey === "selection" && currentView === "selection") ||
        (phaseKey === "evaluation" &&
          (currentView === "synthese" || currentView === "postit")) ||
        (phaseKey === "coaching" && currentView === "roleplay");
      phaseKey === "entrainement" && currentView === "entrainement";

      if (isActiveView) {
        return "en cours";
      }

      // Si les prérequis sont remplis mais pas actif → "réalisé" ou "à faire" selon logique métier
      if (phaseInfo.completed) {
        return "réalisé";
      }

      // Par défaut, si disponible mais pas actif
      return realtimeStatus[phaseKey];
    },
    [currentView, getPhaseAvailability, realtimeStatus]
  );

  // 🎯 État intelligent qui combine logique temps réel + prérequis
  const smartStatus = useCallback(() => {
    const smart: Record<PhaseKey, StepStatus> = {} as Record<
      PhaseKey,
      StepStatus
    >;

    (Object.keys(realtimeStatus) as PhaseKey[]).forEach((phaseKey) => {
      smart[phaseKey] = getSmartPhaseStatus(phaseKey);
    });

    return smart;
  }, [realtimeStatus, getSmartPhaseStatus]);

  // 🔄 Synchronisation initiale depuis la DB (une seule fois)
  useEffect(() => {
    if (!isPhasesLoading && dbPhases) {
      console.log("📥 Synchronisation initiale depuis la DB:", dbPhases);
      setRealtimeStatus(dbPhases);
    }
  }, [isPhasesLoading, dbPhases]);

  // 🚀 Sauvegarde différée en arrière-plan (optimistic UI)
  const saveInBackground = useCallback(
    (
      phaseKey: PhaseKey,
      newStatus: StepStatus,
      options?: { commentaires?: string; objectifs?: string }
    ) => {
      // Annuler la sauvegarde précédente si elle existe
      const existingTimeout = saveQueueRef.current.get(phaseKey);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Programmer une nouvelle sauvegarde après 500ms
      const timeout = setTimeout(async () => {
        try {
          console.log(
            `💾 Sauvegarde en arrière-plan: ${phaseKey} → ${newStatus}`
          );
          await savePhase(phaseKey, newStatus, options);
          console.log(`✅ Sauvegarde réussie: ${phaseKey}`);
        } catch (error) {
          console.warn(`⚠️ Sauvegarde échouée pour ${phaseKey}:`, error);
          // TODO: Ajouter retry logic ou notification d'erreur
        } finally {
          saveQueueRef.current.delete(phaseKey);
        }
      }, 500);

      saveQueueRef.current.set(phaseKey, timeout);
    },
    [savePhase]
  );

  // 🎯 Fonction utilitaire pour obtenir le prochain statut
  const getNextStatus = useCallback((currentStatus: StepStatus): StepStatus => {
    return STATUS_CONFIG.TRANSITIONS[currentStatus] || "à faire";
  }, []);

  // ⚡ Auto-démarrage intelligent basé sur les prérequis
  useEffect(() => {
    const availability = getPhaseAvailability();

    console.log("🔍 Navigation + Prérequis:", {
      currentView,
      availability: {
        selection: availability.selection.available,
        evaluation: availability.evaluation.available,
        coaching: availability.coaching.available,
      },
      contexts: {
        selectedEntreprise: !!selectedEntreprise,
        selectedConseiller: !!selectedConseiller,
        selectedCall: !!selectedCall,
        idCallActivite: !!idCallActivite,
        selectedPostitForRolePlay: !!selectedPostitForRolePlay,
      },
    });

    let hasChanges = false;
    const newStatus = { ...realtimeStatus };

    // Auto-démarrage de l'évaluation - SEULEMENT si tous les prérequis sont OK
    if (
      (currentView === VIEWS.SYNTHESE || currentView === VIEWS.POSTIT) &&
      availability.evaluation.available &&
      realtimeStatus.evaluation === "à faire"
    ) {
      console.log(
        "🚀 Auto-démarrage: Évaluation → en cours (prérequis validés)"
      );
      newStatus.evaluation = "en cours";
      hasChanges = true;

      saveInBackground("evaluation", "en cours", {
        objectifs: "Analyse des passages d'appel",
      });
    }

    // Auto-démarrage du coaching - SEULEMENT si tous les prérequis sont OK
    if (
      currentView === VIEWS.ROLEPLAY &&
      availability.coaching.available &&
      realtimeStatus.coaching === "à faire"
    ) {
      console.log("🚀 Auto-démarrage: Coaching → en cours (prérequis validés)");
      newStatus.coaching = "en cours";
      hasChanges = true;

      saveInBackground("coaching", "en cours", {
        objectifs: "Simulation et amélioration des pratiques",
      });
    }

    // Auto-démarrage de l'entraînement - BLOC AJOUTÉ
    if (
      currentView === VIEWS.ENTRAINEMENT &&
      availability.entrainement.available &&
      realtimeStatus.entrainement === "à faire"
    ) {
      console.log(
        "🚀 Auto-démarrage: Entraînement → en cours (prérequis validés)"
      );
      newStatus.entrainement = "en cours";
      hasChanges = true;

      saveInBackground("entrainement", "en cours", {
        objectifs: "Suivi post-coaching et amélioration continue",
      });
    }

    // Pause automatique si les prérequis ne sont plus remplis
    if (
      (currentView === VIEWS.SYNTHESE || currentView === VIEWS.POSTIT) &&
      !availability.evaluation.available &&
      realtimeStatus.evaluation === "en cours"
    ) {
      console.log(
        `⏸️ Pause évaluation: prérequis manquants (${availability.evaluation.requirements})`
      );
      newStatus.evaluation = "à faire";
      hasChanges = true;
    }

    if (
      currentView === VIEWS.ROLEPLAY &&
      !availability.coaching.available &&
      realtimeStatus.coaching === "en cours"
    ) {
      console.log(
        `⏸️ Pause coaching: prérequis manquants (${availability.coaching.requirements})`
      );
      newStatus.coaching = "à faire";
      hasChanges = true;
    }

    if (
      currentView === VIEWS.ENTRAINEMENT &&
      !availability.entrainement.available &&
      realtimeStatus.entrainement === "en cours"
    ) {
      console.log(
        `⏸️ Pause entraînement: prérequis manquants (${availability.entrainement.requirements})`
      );
      newStatus.entrainement = "à faire";
      hasChanges = true;
    }

    if (hasChanges) {
      setRealtimeStatus(newStatus);
    }
  }, [
    currentView,
    realtimeStatus,
    getPhaseAvailability,
    selectedEntreprise,
    selectedConseiller,
    selectedCall,
    idCallActivite,
    selectedPostitForRolePlay,
    saveInBackground,
  ]);

  // 🎨 Auto-expansion de la phase active
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
        case VIEWS.ENTRAINEMENT: // ← LIGNE AJOUTÉE
          targetPhase = "entrainement"; // ← LIGNE AJOUTÉE
          break;
        default:
          break;
      }

      if (targetPhase) {
        setOpenPhase(targetPhase);
      }
    }
  }, [currentView]);

  // 🖱️ Gestion des événements
  const handlePhaseClick = useCallback((key: PhaseKey) => {
    setOpenPhase((prev) => (prev === key ? null : key));
  }, []);

  // ⚡ Toggle instantané avec sauvegarde en arrière-plan
  const toggleStatus = useCallback(
    (key: PhaseKey) => {
      if (key === "admin") return; // Admin non modifiable

      const currentStatus = realtimeStatus[key];
      const nextStatus = getNextStatus(currentStatus);

      console.log(
        `🔄 Toggle instantané: ${key} (${currentStatus} → ${nextStatus})`
      );

      // 1. Mettre à jour l'UI immédiatement
      setRealtimeStatus((prev) => ({
        ...prev,
        [key]: nextStatus,
      }));

      // 2. Sauvegarder en arrière-plan
      saveInBackground(key, nextStatus);
    },
    [realtimeStatus, getNextStatus, saveInBackground]
  );

  // 🎯 Actions spécialisées avec optimistic UI
  const startPhase = useCallback(
    (phaseKey: PhaseKey, objectifs?: string) => {
      console.log(`▶️ Démarrage instantané: ${phaseKey}`);

      // Mise à jour immédiate
      setRealtimeStatus((prev) => ({
        ...prev,
        [phaseKey]: "en cours",
      }));

      // Sauvegarde en arrière-plan
      saveInBackground(phaseKey, "en cours", { objectifs });
    },
    [saveInBackground]
  );

  const completePhase = useCallback(
    (phaseKey: PhaseKey, commentaires?: string) => {
      console.log(`✅ Completion instantanée: ${phaseKey}`);

      // Mise à jour immédiate
      setRealtimeStatus((prev) => ({
        ...prev,
        [phaseKey]: "réalisé",
      }));

      // Sauvegarde en arrière-plan
      saveInBackground(phaseKey, "réalisé", { commentaires });
    },
    [saveInBackground]
  );

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

  const completeEntrainement = useCallback(
    (commentaires?: string) => {
      completePhase("entrainement", commentaires);
    },
    [completePhase]
  );

  // 🧭 Gestion des sous-étapes
  const handleSubStepClick = useCallback(
    (subStep: SubStep) => {
      if (subStep.disabled) return;
      if (subStep.route) {
        router.push(subStep.route);
      }
    },
    [router]
  );

  // 🎯 Détection de l'état actif
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
        case "entrainement": // ← LIGNE AJOUTÉE
          return currentView === "entrainement";
        default:
          return false;
      }
    },
    [currentView]
  );

  // 🚀 Navigation rapide
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
    if (currentView === VIEWS.ENTRAINEMENT) {
      return [
        {
          label: "Synthèse",
          route: ROUTES.EVALUATION.SYNTHESE,
          color: COLORS.BACK_ACTION,
        },
        ...(selectedPostitForRolePlay
          ? [
              {
                label: "Coaching",
                route: ROUTES.EVALUATION.ROLEPLAY,
                color: COLORS.BACK_ACTION,
              },
            ]
          : []),
      ];
    }
    return [];
  }, [currentView]);

  // 🧹 Cleanup des timeouts au démontage
  useEffect(() => {
    return () => {
      saveQueueRef.current.forEach((timeout) => clearTimeout(timeout));
      saveQueueRef.current.clear();
    };
  }, []);

  return {
    currentView,
    openPhase,
    stepStatus: smartStatus(), // ⚡ État intelligent au lieu de l'état brut
    isPhasesLoading: false,
    phasesError,
    handlePhaseClick,
    toggleStatus,
    handleSubStepClick,
    isActiveSubStep,
    isActivePhase,
    getQuickNavigation,
    // Actions spécialisées
    startPhase,
    completeEvaluation,
    completeCoaching,
    completePhase,
    // 🆕 Nouvelles informations sur les prérequis
    getPhaseAvailability,
    //info sur l'entrainement
    completeEntrainement,
  };
};
