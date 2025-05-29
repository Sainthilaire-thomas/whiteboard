"use client";

import { useState, useEffect, useMemo } from "react";
import { useCallData } from "@/context/CallDataContext";
import { useAppContext } from "@/context/AppContext";

/**
 * Hook principal pour gérer l'état et la logique du composant Postit
 * @returns Objet contenant l'état et les fonctions pour gérer le composant Postit
 */
export function usePostit() {
  // Hooks de contexte
  const {
    idCallActivite,
    selectedPostit, // ← CHANGÉ de contexte
    setSelectedPostit, // ← CHANGÉ de contexte
  } = useCallData();

  // États locaux
  const [showTabs, setShowTabs] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [readyToDisplayGrids, setReadyToDisplayGrids] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  console.log("isCompleted", isCompleted);

  // État pour suivre si un changement a été effectué dans une étape
  const [stepChanges, setStepChanges] = useState({
    0: false, // Étape contexte
    1: false, // Étape sujet
    2: false, // Étape pratique
    3: false, // Étape synthèse (nouvelle)
  });

  // Initialisation de l'affichage des grilles
  useEffect(() => {
    const timeout = setTimeout(() => setReadyToDisplayGrids(true), 0);
    return () => clearTimeout(timeout);
  }, []);

  // Gestion de l'état du postit et des étapes
  useEffect(() => {
    if (selectedPostit) {
      // Déterminer si le postit a un sujet réel
      const hasRealSubject =
        selectedPostit.idsujet !== null && selectedPostit.idsujet !== undefined;

      // Déterminer si le postit a une pratique réelle (utiliser idpratique comme référence principale)
      const hasRealPractice =
        selectedPostit.idpratique !== null &&
        selectedPostit.idpratique !== undefined &&
        selectedPostit.idpratique > 0; // Supposant que les IDs valides sont > 0

      // Déterminer si le postit est complet
      const isFullyAssigned = hasRealSubject && hasRealPractice;
      setIsCompleted(isFullyAssigned);

      // Déterminer l'étape initiale en fonction des assignations réelles
      let initialStep = 0;

      if (hasRealPractice && hasRealSubject) {
        initialStep = 3; // Si complet, afficher la synthèse (étape 3) au lieu de l'étape 2
      } else if (hasRealSubject) {
        initialStep = 2; // Sujet assigné mais pas de pratique -> aller à l'étape pratique
      } else {
        initialStep = 0; // Rien n'est assigné -> démarrer à l'étape contexte
      }

      // Vérifier si une étape initiale est spécifiée dans le postit (pour le TimeLineAudio)
      if (selectedPostit.initialStep !== undefined) {
        initialStep = selectedPostit.initialStep;
      }

      // Appliquer l'étape initiale
      setActiveStep(initialStep);

      // Réinitialiser l'état des changements entre postits
      setStepChanges({
        0: false,
        1: false,
        2: false,
        3: false,
      });
    }
  }, [selectedPostit?.id]); // Seulement quand l'ID change = nouveau postit

  // Navigation entre les étapes
  const handleNext = () => {
    if (activeStep === 1 && !selectedPostit?.idsujet) {
      alert("Veuillez sélectionner un sujet avant de continuer.");
      return;
    }

    // Marquer cette étape comme ayant été visitée/modifiée
    setStepChanges((prev) => ({
      ...prev,
      [activeStep]: true,
    }));

    // Si nous sommes à l'étape 2 et que le postit est complété, passer à l'étape synthèse
    if (activeStep === 2 && isCompleted) {
      setActiveStep(3); // Aller directement à la synthèse
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  /**
   * Navigation directe vers une étape spécifique
   * @param step Numéro de l'étape vers laquelle naviguer
   * @param skipAccessCheck Option pour ignorer la vérification d'accessibilité (pour les modifications directes)
   */
  const navigateToStep = (step, skipAccessCheck = false) => {
    if (skipAccessCheck || canAccessStep(step)) {
      setActiveStep(step);
    }
  };

  /**
   * Vérifie si une étape est accessible en fonction de l'état actuel
   * @param step Numéro de l'étape à vérifier
   * @returns Booléen indiquant si l'étape est accessible
   */
  const canAccessStep = (step) => {
    // Étape 0 (contexte) : toujours accessible
    if (step === 0) return true;

    // Étape 1 (sujet) : accessible après avoir vu l'étape 0
    if (step === 1)
      return (
        stepChanges[0] ||
        (selectedPostit?.idsujet !== null &&
          selectedPostit?.idsujet !== undefined)
      );

    // Étape 2 (pratique) : accessible uniquement si un sujet est sélectionné
    if (step === 2)
      return (
        selectedPostit?.idsujet !== null &&
        selectedPostit?.idsujet !== undefined
      );

    // Étape 3 (synthèse) : accessible uniquement si le postit est complété
    if (step === 3) return isCompleted;

    return false;
  };

  // Vérification si le sujet est réel
  const hasRealSubject =
    selectedPostit &&
    selectedPostit.idsujet !== null &&
    selectedPostit.idsujet !== undefined;

  // Vérification si la pratique est réelle (utiliser idpratique comme référence principale)
  const hasRealPractice =
    selectedPostit &&
    selectedPostit.idpratique !== null &&
    selectedPostit.idpratique !== undefined &&
    selectedPostit.idpratique > 0; // Supposant que les IDs valides sont > 0

  // Liste des étapes avec leur état d'accessibilité et de complétion
  const steps = useMemo(
    () => [
      {
        id: 0,
        label: "Contexte du passage",
        icon: "🟢",
        isAccessible: canAccessStep(0),
        isCompleted: stepChanges[0] || activeStep > 0,
        additionalInfo: selectedPostit?.text ? "Commentaire ajouté" : null,
      },
      {
        id: 1,
        label: "Critère qualité en défaut",
        icon: "🧭",
        isAccessible: canAccessStep(1),
        isCompleted: hasRealSubject,
        additionalInfo: selectedPostit?.sujet || null,
      },
      {
        id: 2,
        label: "Pratique d'amélioration",
        icon: "🛠️",
        isAccessible: canAccessStep(2),
        isCompleted: hasRealPractice,
        additionalInfo: hasRealPractice ? selectedPostit?.pratique : null,
      },
      {
        id: 3,
        label: "Synthèse",
        icon: "✓",
        isAccessible: canAccessStep(3),
        isCompleted: isCompleted,
        additionalInfo: null,
      },
    ],
    [
      activeStep,
      stepChanges,
      hasRealSubject,
      hasRealPractice,
      isCompleted,
      selectedPostit,
    ]
  );

  return {
    selectedPostit,
    idCallActivite,
    showTabs,
    setShowTabs,
    isCompleted,
    readyToDisplayGrids,
    activeStep,
    setActiveStep,
    steps,
    hasRealSubject,
    hasRealPractice,
    handleNext,
    handleBack,
    navigateToStep,
    canAccessStep,
    stepChanges,
  };
}
