// types.ts - Types spécifiques aux hooks Postit
import { Postit } from "@/types/types";
// Interface étendue pour Postit avec idpratique
export interface PostitWithPracticeId extends Postit {
  idpratique?: number | null;
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

// Configuration d'étape pour le stepper
export interface PostitStep {
  id: number;
  label: string;
  icon: string;
  isAccessible: boolean;
  isCompleted: boolean;
  additionalInfo?: string | null;
}

// Contexte des hooks Postit
export interface PostitHookContext {
  selectedPostit: PostitWithPracticeId | null;
  idCallActivite: number | null;
  showTabs: boolean;
  isCompleted: boolean;
  activeStep: number;
  steps: PostitStep[];
}

// Actions disponibles sur un postit
export interface PostitActions {
  handleSave: () => Promise<void>;
  handleDelete: () => Promise<void>;
  handleClosePostit: () => void;
  handleNext: () => void;
  handleBack: () => void;
  navigateToStep: (step: number, skipAccessCheck?: boolean) => void;
}

// Configuration de sélection pour les sujets
export interface SujetSelectionConfig {
  sujetsData: any[];
  categoriesSujets: any[];
  sujetsDeLActivite: number[];
  handleSujetClick: (item: any) => any;
}

// Configuration de sélection pour les pratiques
export interface PratiqueSelectionConfig {
  pratiques: any[];
  categoriesPratiques: any[];
  pratiquesDeLActivite: number[];
  handlePratiqueClick: (practice: any) => any;
}

// État des changements par étape
export interface StepChanges {
  0: boolean; // Contexte
  1: boolean; // Sujet
  2: boolean; // Pratique
  3: boolean; // Synthèse
}

// Props pour les composants d'étapes
export interface StepProps {
  selectedPostit: PostitWithPracticeId;
  theme?: any;
  stepBoxStyle?: any;
}

// Événements de hooks
export type PostitHookEvent =
  | { type: "POSTIT_SELECTED"; payload: PostitWithPracticeId }
  | { type: "POSTIT_UPDATED"; payload: Partial<PostitWithPracticeId> }
  | { type: "STEP_CHANGED"; payload: number }
  | { type: "VALIDATION_RESULT"; payload: PostitValidationResult };

// Options de navigation
export interface NavigationOptions {
  skipValidation?: boolean;
  forceNavigation?: boolean;
  updateHistory?: boolean;
}
