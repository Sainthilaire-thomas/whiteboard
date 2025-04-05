import { useState } from "react";

/**
 * Hook personnalisé pour gérer la navigation entre les étapes
 * @param {Object} params Paramètres du hook
 * @param {Array} params.steps Liste des étapes
 * @param {Object} params.postitsState État des post-its pour vérifier les conditions
 * @returns {Object} État et fonctions pour la navigation
 */
export const useStepNavigation = ({ steps, postitsState }) => {
  const [activeStep, setActiveStep] = useState(0);

  const { postits, selectedClientText, selectedConseillerText } = postitsState;

  // Navigation vers l'étape suivante
  const handleNext = () => {
    setActiveStep((prevActiveStep) =>
      Math.min(prevActiveStep + 1, steps.length - 1)
    );
  };

  // Navigation vers l'étape précédente
  const handleBack = () => {
    setActiveStep((prevActiveStep) => Math.max(prevActiveStep - 1, 0));
  };

  // Vérifier si on peut passer à l'étape suivante
  const canProceedToNextStep = () => {
    switch (activeStep) {
      case 0:
        // Nécessite au moins un texte client et une réponse conseiller
        return (
          selectedClientText.trim() !== "" &&
          selectedConseillerText.trim() !== ""
        );
      case 1:
        // Nécessite au moins un post-it dans n'importe quelle zone
        return postits.length > 0;
      case 2:
        // Peut toujours passer à l'étape de lecture
        return true;
      default:
        return false;
    }
  };

  return {
    activeStep,
    setActiveStep,
    handleNext,
    handleBack,
    canProceedToNextStep,
  };
};
