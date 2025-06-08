// hooks/usePhaseData.ts - Ajout de l'étape entraînement

import { useMemo } from "react";
import {
  Business,
  Assessment,
  Psychology,
  Timeline,
  TrendingUp, // NOUVEAU : Icône pour entraînement
  Feedback,
  AdminPanelSettings,
} from "@mui/icons-material";
import { useAppContext } from "@/context/AppContext";
import { useCallData } from "@/context/CallDataContext";
import { StepStatus, PhaseKey, SubStep, Phase } from "../types";
import { ROUTES, VIEWS, LABELS } from "../constants";

export const usePhaseData = (currentView: string | null) => {
  const { selectedPostitForRolePlay, appelPostits, selectedPostit } =
    useCallData();

  // Calculer les statistiques pour les badges
  const evaluationStats = useMemo(() => {
    if (!appelPostits || appelPostits.length === 0) {
      return { total: 0, withIssues: 0 };
    }

    const withIssues = appelPostits.filter((p) => p.sujet || p.pratique).length;
    return { total: appelPostits.length, withIssues };
  }, [appelPostits]);

  // Configuration des phases avec sous-étapes dynamiques
  const phases: Phase[] = useMemo(
    () => [
      {
        key: "selection",
        label: LABELS.PHASES.SELECTION.LABEL,
        icon: <Business />,
        description: LABELS.PHASES.SELECTION.DESCRIPTION,
        route: ROUTES.EVALUATION.SELECTION, // Ajout de la route requise
        subSteps: [
          {
            label: LABELS.SUB_STEPS.SELECTION_ENTREPRISE,
            route: ROUTES.EVALUATION.SELECTION,
          },
        ],
      },
      {
        key: "evaluation",
        label: LABELS.PHASES.EVALUATION.LABEL,
        icon: <Assessment />,
        description: LABELS.PHASES.EVALUATION.DESCRIPTION,
        route: ROUTES.EVALUATION.SYNTHESE, // Ajout de la route requise
        subSteps: [
          {
            label: LABELS.SUB_STEPS.SYNTHESE_GENERALE,
            route: ROUTES.EVALUATION.SYNTHESE,
            badge:
              evaluationStats.withIssues > 0
                ? evaluationStats.withIssues
                : undefined,
          },
          ...(selectedPostit
            ? [
                {
                  label: LABELS.SUB_STEPS.PASSAGE_SELECTIONNE,
                  route: ROUTES.EVALUATION.POSTIT,
                },
              ]
            : []),
        ],
      },
      {
        key: "coaching",
        label: LABELS.PHASES.COACHING.LABEL,
        icon: <Psychology />,
        description: LABELS.PHASES.COACHING.DESCRIPTION,
        route: ROUTES.EVALUATION.SYNTHESE, // Ajout de la route requise
        subSteps: [
          // Action de retour si on est en jeu de rôle
          ...(currentView === VIEWS.ROLEPLAY
            ? [
                {
                  label: LABELS.SUB_STEPS.RETOUR_SYNTHESE,
                  route: ROUTES.EVALUATION.SYNTHESE,
                  isBackAction: true,
                },
              ]
            : []),
          // Lien vers les passages à travailler
          {
            label: LABELS.SUB_STEPS.PASSAGES_TRAVAILLER,
            route: ROUTES.EVALUATION.SYNTHESE,
            badge:
              evaluationStats.withIssues > 0
                ? evaluationStats.withIssues
                : undefined,
            disabled: evaluationStats.withIssues === 0,
          },
          // Jeu de rôle actuel si disponible
          ...(selectedPostitForRolePlay
            ? [
                {
                  label: `${LABELS.SUB_STEPS.JEU_DE_ROLE}: ${
                    selectedPostitForRolePlay.pratique || "Passage"
                  }`,
                  route: ROUTES.EVALUATION.ROLEPLAY,
                },
              ]
            : []),
        ],
      },
      // NOUVEAU : Étape Entraînement
      {
        key: "entrainement",
        label: LABELS.PHASES.ENTRAINEMENT.LABEL,
        icon: <TrendingUp />,
        description: LABELS.PHASES.ENTRAINEMENT.DESCRIPTION,
        route: ROUTES.EVALUATION.ENTRAINEMENT, // Ajout de la route requise
        subSteps: [
          // Action de retour si on est dans l'entraînement
          ...(currentView === VIEWS.ENTRAINEMENT
            ? [
                {
                  label: LABELS.SUB_STEPS.RETOUR_SYNTHESE,
                  route: ROUTES.EVALUATION.SYNTHESE,
                  isBackAction: true,
                },
              ]
            : []),
          {
            label: LABELS.SUB_STEPS.BILAN_COACHING,
            route: ROUTES.EVALUATION.ENTRAINEMENT,
          },
          {
            label: LABELS.SUB_STEPS.DEROULEMENT_ENTRAINEMENT,
            route: ROUTES.EVALUATION.ENTRAINEMENT,
          },
          {
            label: LABELS.SUB_STEPS.SUIVI_PROGRESSION,
            route: ROUTES.EVALUATION.ENTRAINEMENT,
          },
        ],
      },
      {
        key: "suivi",
        label: LABELS.PHASES.SUIVI.LABEL,
        icon: <Timeline />,
        description: LABELS.PHASES.SUIVI.DESCRIPTION,
        route: "/suivi", // Ajout d'une route par défaut
      },
      {
        key: "feedback",
        label: LABELS.PHASES.FEEDBACK.LABEL,
        icon: <Feedback />,
        description: LABELS.PHASES.FEEDBACK.DESCRIPTION,
        route: "/feedback", // Ajout d'une route par défaut
      },
      // Section Admin séparée
      {
        key: "admin",
        label: LABELS.PHASES.ADMIN.LABEL,
        icon: <AdminPanelSettings />,
        adminOnly: true, // Correction : utiliser adminOnly au lieu de isAdmin
        description: LABELS.PHASES.ADMIN.DESCRIPTION,
        route: ROUTES.ADMIN.PONDERATION, // Ajout de la route requise
        subSteps: [
          {
            label: LABELS.SUB_STEPS.PONDERATION_CRITERES,
            route: ROUTES.ADMIN.PONDERATION,
          },
        ],
      },
    ],
    [currentView, selectedPostit, selectedPostitForRolePlay, evaluationStats]
  );

  // Séparer les phases normales et admin
  const normalPhases = useMemo(
    () => phases.filter((p) => !p.adminOnly), // Correction : utiliser adminOnly
    [phases]
  );

  const adminPhases = useMemo(
    () => phases.filter((p) => p.adminOnly), // Correction : utiliser adminOnly
    [phases]
  );

  return {
    phases,
    normalPhases,
    adminPhases,
    evaluationStats,
  };
};
