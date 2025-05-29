import { useState, useEffect, useCallback, useRef } from "react";

// Utilitaires pour déterminer l'état du postit
const hasValidSubject = (postit: any) => {
  return (
    postit?.idsujet !== null &&
    postit?.idsujet !== undefined &&
    postit?.idsujet > 0
  );
};

const hasValidPractice = (postit: any) => {
  return (
    postit?.idpratique !== null &&
    postit?.idpratique !== undefined &&
    postit?.idpratique > 0
  );
};

const determineInitialStep = (postit: any) => {
  if (!postit) return 0;

  const hasSubject = hasValidSubject(postit);
  const hasPractice = hasValidPractice(postit);

  // Logique de navigation intelligente
  if (hasSubject && hasPractice) {
    // Postit complet → aller directement à la synthèse
    return 3;
  } else if (hasSubject && !hasPractice) {
    // Sujet choisi mais pas de pratique → aller au step pratique
    return 2;
  } else if (!hasSubject) {
    // Pas de sujet → aller au step sujet
    return 1;
  }

  // Cas par défaut → étape contexte
  return 0;
};

export function usePostitNavigation(selectedPostit: any) {
  const [activeStep, setActiveStep] = useState(0);
  const [temporaryEditMode, setTemporaryEditMode] = useState(false);

  // ✅ NOUVEAU : Référence pour suivre si c'est une navigation manuelle
  const isManualNavigation = useRef(false);
  const previousPostitId = useRef(null);

  // ✅ NAVIGATION INTELLIGENTE : Seulement lors du changement de postit
  useEffect(() => {
    const currentPostitId = selectedPostit?.id;

    // Seulement si c'est un nouveau postit (pas le même qu'avant)
    if (currentPostitId !== previousPostitId.current) {
      if (selectedPostit) {
        const smartStep = determineInitialStep(selectedPostit);
        console.log("🧠 Navigation intelligente (nouveau postit):", {
          postitId: selectedPostit.id,
          hasSubject: hasValidSubject(selectedPostit),
          hasPractice: hasValidPractice(selectedPostit),
          recommendedStep: smartStep,
        });

        setActiveStep(smartStep);
      } else {
        setActiveStep(0);
      }

      previousPostitId.current = currentPostitId;
      isManualNavigation.current = false; // Reset le flag de navigation manuelle
    }
  }, [selectedPostit?.id]);

  // ✅ NAVIGATION AUTOMATIQUE : Seulement si pas de navigation manuelle récente
  useEffect(() => {
    if (!selectedPostit || isManualNavigation.current) return;

    const hasSubject = hasValidSubject(selectedPostit);
    const hasPractice = hasValidPractice(selectedPostit);

    // Auto-navigation seulement dans certains cas précis
    if (hasSubject && !hasPractice && activeStep === 1) {
      console.log("🎯 Sujet sélectionné → navigation vers pratique");
      setTimeout(() => setActiveStep(2), 300); // Petit délai pour éviter les conflits
    } else if (hasSubject && hasPractice && activeStep === 2) {
      console.log("🎯 Pratique sélectionnée → navigation vers synthèse");
      setTimeout(() => setActiveStep(3), 300);
    }
  }, [selectedPostit?.idsujet, selectedPostit?.idpratique, activeStep]);

  const isCompleted =
    selectedPostit &&
    hasValidSubject(selectedPostit) &&
    hasValidPractice(selectedPostit);

  const handleNext = useCallback(() => {
    isManualNavigation.current = true; // ✅ Marquer comme navigation manuelle
    setActiveStep((prev) => Math.min(prev + 1, 3));
  }, []);

  const handleBack = useCallback(() => {
    isManualNavigation.current = true; // ✅ Marquer comme navigation manuelle
    setActiveStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleStepClick = useCallback((stepIndex: number) => {
    isManualNavigation.current = true; // ✅ Marquer comme navigation manuelle
    setActiveStep(stepIndex);

    // Reset le flag après un délai pour permettre la future auto-navigation
    setTimeout(() => {
      isManualNavigation.current = false;
    }, 2000);
  }, []);

  const isStepAccessible = useCallback(
    (stepIndex: number) => {
      if (!selectedPostit) return stepIndex === 0;

      const hasSubject = hasValidSubject(selectedPostit);

      switch (stepIndex) {
        case 0: // Contexte - toujours accessible
          return true;
        case 1: // Sujet - toujours accessible
          return true;
        case 2: // Pratique - accessible si on a un sujet
          return hasSubject;
        case 3: // Synthèse - accessible si on a un sujet
          return hasSubject;
        default:
          return false;
      }
    },
    [selectedPostit]
  );

  return {
    activeStep,
    setActiveStep,
    temporaryEditMode,
    setTemporaryEditMode,
    isCompleted,
    handleNext,
    handleBack,
    handleStepClick,
    isStepAccessible,
  };
}
