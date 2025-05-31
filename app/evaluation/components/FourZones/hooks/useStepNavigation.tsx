// hooks/useStepNavigation.ts - Version épurée

import { useState } from "react";

interface UseStepNavigationProps {
  steps: string[];
  postitsState: any; // Remplacez par le type approprié
}

export const useStepNavigation = ({
  steps,
  postitsState,
}: UseStepNavigationProps) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const { hasOriginalPostits } = postitsState;

  // Fonction pour aller à l'étape suivante (gardée pour la navigation automatique)
  const handleNext = () => {
    if (activeStep < steps.length - 1 && canProceedToNextStep()) {
      setActiveStep(activeStep + 1);
    }
  };

  // Fonction pour revenir à l'étape précédente (gardée pour compatibilité)
  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  // Vérifier si on peut procéder à l'étape suivante
  const canProceedToNextStep = () => {
    switch (activeStep) {
      case 0: // Sélection du contexte
        return postitsState.hasOriginalPostits; // hasOriginalPostits est une valeur booléenne
      case 1: // Jeu de rôle
        return postitsState.hasOriginalPostits;
      case 2: // Suggestions d'amélioration
        return postitsState.hasOriginalPostits;
      case 3: // Lecture finale
        return false; // Dernière étape, pas de suivant
      default:
        return false;
    }
  };

  return {
    activeStep,
    setActiveStep, // Exposé pour la navigation directe via stepper
    handleNext, // Gardé pour la navigation automatique
    handleBack, // Gardé pour compatibilité
    canProceedToNextStep,
  };
};
