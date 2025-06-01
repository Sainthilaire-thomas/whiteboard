import { Step, StepType } from "./types";

// Configuration des étapes
export const STEPS: Step[] = [
  {
    id: "bilan" as StepType,
    label: "Bilan du coaching",
    description: "Analyse des résultats et sélection de pratiques",
  },
  {
    id: "deroulement" as StepType,
    label: "Déroulé de l'entraînement",
    description: "Planification et suivi des exercices",
  },
];

// Utilitaires pour la navigation
export const getNextStep = (currentStep: number, maxSteps: number): number => {
  return Math.min(currentStep + 1, maxSteps - 1);
};

export const getPreviousStep = (currentStep: number): number => {
  return Math.max(currentStep - 1, 0);
};

// Formatage des données JSON pour l'affichage
export const formatJsonForDisplay = (jsonData: any): string => {
  if (!jsonData) return "Aucune donnée disponible";
  return JSON.stringify(jsonData, null, 2);
};
