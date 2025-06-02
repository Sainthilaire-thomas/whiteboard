"use client";

import { useState, useEffect, useMemo } from "react";
import { useCallData } from "@/context/CallDataContext";
import { useAppContext } from "@/context/AppContext";

// ✅ Import des types autonomes
import { PostitExtended, NavigationStep } from "../types";

/**
 * Hook principal pour gérer l'état et la logique du composant Postit
 * @returns Objet contenant l'état et les fonctions pour gérer le composant Postit
 */
export function usePostit() {
  // Hooks de contexte
  const {
    idCallActivite,
    selectedPostit, // ← Sera casté vers PostitExtended
    setSelectedPostit,
  } = useCallData();

  // ✅ Cast vers PostitExtended (type autonome)
  const extendedPostit = selectedPostit as PostitExtended;

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
    3: false, // Étape synthèse
  });

  // Initialisation de l'affichage des grilles
  useEffect(() => {
    const timeout = setTimeout(() => setReadyToDisplayGrids(true), 0);
    return () => clearTimeout(timeout);
  }, []);

  // Gestion de l'état du postit et des étapes
  useEffect(() => {
    if (extendedPostit) {
      // Déterminer si le postit a un sujet réel
      const hasRealSubject =
        extendedPostit.idsujet !== null && extendedPostit.idsujet !== undefined;

      // ✅ Vérification de pratique via idpratique (si disponible) ou pratique
      const hasRealPractice = extendedPostit.idpratique
        ? extendedPostit.idpratique !== null &&
          extendedPostit.idpratique !== undefined &&
          extendedPostit.idpratique > 0
        : extendedPostit.pratique !== null &&
          extendedPostit.pratique !== undefined &&
          extendedPostit.pratique.trim() !== "";

      // Déterminer si le postit est complet
      const isFullyAssigned = hasRealSubject && hasRealPractice;
      setIsCompleted(isFullyAssigned);

      // Déterminer l'étape initiale en fonction des assignations réelles
      let initialStep = 0;

      if (hasRealPractice && hasRealSubject) {
        initialStep = 3;
      } else if (hasRealSubject) {
        initialStep = 2;
      } else {
        initialStep = 0;
      }

      // ✅ Utilise initialStep du type autonome
      if (extendedPostit.initialStep !== undefined) {
        initialStep = extendedPostit.initialStep;
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
  }, [extendedPostit?.id]);

  // Navigation entre les étapes
  const handleNext = () => {
    if (activeStep === 1 && !extendedPostit?.idsujet) {
      alert("Veuillez sélectionner un sujet avant de continuer.");
      return;
    }

    setStepChanges((prev) => ({
      ...prev,
      [activeStep]: true,
    }));

    if (activeStep === 2 && isCompleted) {
      setActiveStep(3);
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const navigateToStep = (step: number, skipAccessCheck = false) => {
    if (skipAccessCheck || canAccessStep(step)) {
      setActiveStep(step);
    }
  };

  const canAccessStep = (step: number): boolean => {
    if (step === 0) return true;

    if (step === 1)
      return (
        stepChanges[0] ||
        (extendedPostit?.idsujet !== null &&
          extendedPostit?.idsujet !== undefined)
      );

    if (step === 2)
      return (
        extendedPostit?.idsujet !== null &&
        extendedPostit?.idsujet !== undefined
      );

    if (step === 3) return isCompleted;

    return false;
  };

  // Vérification si le sujet est réel
  const hasRealSubject =
    extendedPostit &&
    extendedPostit.idsujet !== null &&
    extendedPostit.idsujet !== undefined;

  // ✅ Vérification flexible de la pratique
  const hasRealPractice =
    extendedPostit &&
    (extendedPostit.idpratique
      ? extendedPostit.idpratique !== null &&
        extendedPostit.idpratique !== undefined &&
        extendedPostit.idpratique > 0
      : extendedPostit.pratique !== null &&
        extendedPostit.pratique !== undefined &&
        extendedPostit.pratique.trim() !== "");

  // ✅ Liste des étapes typée avec NavigationStep
  const steps: NavigationStep[] = useMemo(
    () => [
      {
        id: 0,
        label: "Contexte du passage",
        icon: "🟢",
        description: "Ajouter du contexte au passage sélectionné",
        isAccessible: canAccessStep(0),
        isCompleted: stepChanges[0] || activeStep > 0,
        isOptional: false,
      },
      {
        id: 1,
        label: "Critère qualité en défaut",
        icon: "🧭",
        description: "Sélectionner le critère qualité concerné",
        isAccessible: canAccessStep(1),
        isCompleted: hasRealSubject,
        isOptional: false,
      },
      {
        id: 2,
        label: "Pratique d'amélioration",
        icon: "🛠️",
        description: "Choisir la pratique recommandée",
        isAccessible: canAccessStep(2),
        isCompleted: hasRealPractice,
        isOptional: false,
      },
      {
        id: 3,
        label: "Synthèse",
        icon: "✓",
        description: "Révision et validation des choix",
        isAccessible: canAccessStep(3),
        isCompleted: isCompleted,
        isOptional: false,
      },
    ],
    [
      activeStep,
      stepChanges,
      hasRealSubject,
      hasRealPractice,
      isCompleted,
      extendedPostit,
    ]
  );

  // ✅ Fonction utilitaire pour mettre à jour le postit avec conversion
  const updatePostit = (updates: Partial<PostitExtended>) => {
    if (extendedPostit) {
      const updatedPostit = { ...extendedPostit, ...updates };
      // Conversion vers le type attendu par le contexte si nécessaire
      setSelectedPostit(updatedPostit as any); // Cast temporaire pour compatibilité
    }
  };

  // ✅ Fonction pour marquer une étape comme modifiée
  const markStepAsChanged = (stepIndex: number) => {
    setStepChanges((prev) => ({
      ...prev,
      [stepIndex]: true,
    }));
  };

  return {
    // État du postit
    selectedPostit: extendedPostit,
    updatePostit,

    // État de l'activité
    idCallActivite,

    // État de l'UI
    showTabs,
    setShowTabs,
    isCompleted,
    readyToDisplayGrids,

    // Navigation
    activeStep,
    setActiveStep,
    steps,
    handleNext,
    handleBack,
    navigateToStep,
    canAccessStep,

    // État des étapes
    stepChanges,
    markStepAsChanged,

    // Validations
    hasRealSubject,
    hasRealPractice,
  };
}
