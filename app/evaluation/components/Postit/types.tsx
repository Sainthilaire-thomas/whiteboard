// Types étendus pour le composant Postit

import React from "react";
import { Theme } from "@mui/material/styles";
import { Postit as BasePostit } from "@/types/types";

// Postit étendu avec des propriétés spécifiques
export interface Postit extends BasePostit {
  idpratique?: number | null;
  pratique?: string | null;
  initialStep?: number;
}

// Configuration des props pour le composant Postit principal
export interface PostitProps {
  inline?: boolean;
  hideHeader?: boolean;
}

// Configuration d'une étape de navigation
export interface Step {
  label: string;
  icon: string;
  content: React.ReactNode;
  completed: boolean;
  additionalInfo?: string | null;
  optional: boolean;
}

// Props partagées pour les composants d'étapes
export interface BaseStepProps {
  selectedPostit: Postit;
  theme?: Theme;
  stepBoxStyle?: React.CSSProperties;
}

// Props pour l'étape de contexte
export interface ContexteStepProps extends BaseStepProps {
  setSelectedPostit: (postit: Postit) => void;
  selectedDomain: string | null;
  filteredDomains: any[];
  showTabs?: boolean;
  setShowTabs?: (show: boolean) => void;
  selectDomain?: (domainId: string) => void;
}

// Props pour l'étape de sélection de sujet
export interface SujetStepProps extends BaseStepProps {
  categoriesSujets: any[];
  sujetsData: any[];
  columnConfigSujets: any;
  sujetsDeLActivite: number[];
  handleSujetClick: (item: any) => void;
}

// Props pour l'étape de sélection de pratique
export interface PratiqueStepProps extends BaseStepProps {
  categoriesPratiques: any[];
  pratiques: any[];
  columnConfigPratiques: any;
  pratiquesDeLActivite: number[];
  handlePratiqueClick: (practice: any) => void;
}

// Configuration des styles
export interface PostitStyles {
  theme: Theme;
  isMobile: boolean;
  styles: {
    modalBackground: React.CSSProperties;
    modalWrapper: React.CSSProperties;
    modalContainer: React.CSSProperties;
    stepBox: React.CSSProperties;
    stepper: React.CSSProperties;
    stepperMobile: React.CSSProperties;
  };
  stepBoxStyle: React.CSSProperties;
}

// Résultat de validation d'un postit
export interface PostitValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Statut de complétion d'un postit
export interface PostitCompletionStatus {
  hasValidSubject: boolean;
  hasValidPractice: boolean;
  isComplete: boolean;
  completionPercentage: number;
}

// Configuration de navigation
export interface PostitNavigationConfig {
  activeStep: number;
  totalSteps: number;
  isCompleted: boolean;
  hasRealSubject: boolean;
}

// Événements possibles dans le cycle de vie d'un postit
export type PostitEvent =
  | { type: "SUBJECT_SELECTED"; payload: any }
  | { type: "PRACTICE_SELECTED"; payload: any }
  | { type: "CONTEXT_ADDED"; payload: string }
  | { type: "STEP_CHANGED"; payload: number };

// Options de navigation
export interface NavigationOptions {
  skipValidation?: boolean;
  forceNavigation?: boolean;
}

// Export des types principaux
export type {
  BasePostit,
  PostitProps,
  Step,
  BaseStepProps,
  ContexteStepProps,
  SujetStepProps,
  PratiqueStepProps,
};
