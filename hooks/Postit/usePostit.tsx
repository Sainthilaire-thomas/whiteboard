"use client";

import { useState, useEffect } from "react";
import { useCallData } from "@/context/CallDataContext";
import { useAppContext } from "@/context/AppContext";

/**
 * Hook principal pour gérer l'état et la logique du composant Postit
 */
export function usePostit() {
  // Hooks de contexte
  const { idCallActivite } = useCallData();
  const { selectedPostit } = useAppContext();

  // États locaux
  const [showTabs, setShowTabs] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [readyToDisplayGrids, setReadyToDisplayGrids] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Initialisation de l'affichage des grilles
  useEffect(() => {
    const timeout = setTimeout(() => setReadyToDisplayGrids(true), 0);
    return () => clearTimeout(timeout);
  }, []);

  // Gestion de l'état du postit et des étapes
  useEffect(() => {
    if (selectedPostit) {
      // Déterminer si le postit a un sujet réel
      const hasRealSubject = selectedPostit.idsujet !== null;

      // Déterminer si le postit a une pratique réelle (pas "Non Assigné")
      const hasRealPractice =
        selectedPostit.pratique &&
        selectedPostit.pratique !== "Non Assigné" &&
        selectedPostit.pratique !== "Non assigné";

      // Déterminer si le postit est complet
      const isFullyAssigned = hasRealSubject && hasRealPractice;
      setIsCompleted(isFullyAssigned);

      // Déterminer l'étape initiale en fonction des assignations réelles
      let initialStep = 0;

      if (hasRealPractice && hasRealSubject) {
        initialStep = 2; // Déjà tout assigné
      } else if (hasRealSubject) {
        initialStep = 1; // Sujet assigné mais pas de pratique
      }

      // Appliquer l'étape initiale
      setActiveStep(initialStep);
    }
  }, [selectedPostit]);

  // Navigation entre les étapes
  const handleNext = () => {
    if (activeStep === 1 && !selectedPostit?.idsujet) {
      alert("Veuillez sélectionner un sujet avant de continuer.");
      return;
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Vérification si le sujet est réel
  const hasRealSubject = selectedPostit && selectedPostit.idsujet !== null;

  // Vérification si la pratique est réelle
  const hasRealPractice =
    selectedPostit &&
    selectedPostit.pratique &&
    selectedPostit.pratique !== "Non Assigné" &&
    selectedPostit.pratique !== "Non assigné";

  return {
    selectedPostit,
    idCallActivite,
    showTabs,
    setShowTabs,
    isCompleted,
    readyToDisplayGrids,
    activeStep,
    hasRealSubject,
    hasRealPractice,
    handleNext,
    handleBack,
  };
}
