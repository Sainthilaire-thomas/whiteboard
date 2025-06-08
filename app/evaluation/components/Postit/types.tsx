// postit/types.tsx - Types centralisés pour tous les composants du répertoire Postit
import React from "react";
import { Theme } from "@mui/material/styles";

// ===== TYPES DE BASE =====

/**
 * Type principal pour un Postit
 */
export interface Postit {
  id: number;
  callid: number;
  wordid: number;
  word: string;
  text: string;
  iddomaine: number | null;
  sujet: string;
  idsujet: number | null;
  pratique: string | null;
  idpratique?: number | null;
  timestamp: number;
  idactivite?: number | null;

  // Propriétés UI optionnelles
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  zIndex?: number;
  couleur?: string;

  // Propriétés de gestion optionnelles
  dateCreation?: Date | string;
  dateModification?: Date | string;
  createdBy?: string;
  isArchived?: boolean;
  priority?: "low" | "medium" | "high";
  tags?: string[];
}

/**
 * Version étendue avec propriétés pour la navigation/interface
 */
export interface PostitExtended extends Postit {
  initialStep?: number;
  currentStep?: number;
  isEditing?: boolean;
  hasUnsavedChanges?: boolean;
  validationErrors?: string[];

  // Données liées pour l'interface
  selectedDomain?: string | null;
  availableDomains?: Domain[];
  selectedCategories?: number[];
}

// ===== TYPES MÉTIER =====

/**
 * Domaine d'activité
 */
export interface Domain {
  iddomaine: number;
  nomdomaine: string;
  description?: string;
  color?: string;
  isActive?: boolean;
  order?: number;
}

/**
 * Sujet
 */
export interface Subject {
  idsujet: number;
  nomsujet: string;
  description?: string;
  idcategoriesujet?: number;
  iddomaine: number;
  isActive?: boolean;
  order?: number;
}

/**
 * Pratique
 */
export interface Practice {
  idpratique: number;
  nompratique: string;
  description?: string;
  jeuderole?: string;
  idcategoriepratique: number;
  isActive?: boolean;
  order?: number;
  difficulty?: "beginner" | "intermediate" | "advanced";
}

/**
 * Catégorie pour sujets
 */
export interface CategorySubject {
  idcategoriesujet: number;
  nomcategorie: string;
  couleur: string;
  isActive?: boolean;
  order?: number;
}

/**
 * Catégorie pour pratiques
 */
export interface CategoryPractice {
  idcategoriepratique: number;
  nomcategorie: string;
  couleur: string;
  isActive?: boolean;
  order?: number;
}

// ===== TYPES DE CONFIGURATION =====

/**
 * Configuration des colonnes pour l'affichage
 */
export interface ColumnConfig {
  field: string;
  headerName: string;
  width?: number;
  flex?: number;
  sortable?: boolean;
  filterable?: boolean;
  renderCell?: (params: any) => React.ReactNode;
}

/**
 * Configuration de navigation par étapes - interface Step manquante
 */
export interface Step {
  label: string;
  icon: string;
  content: React.ReactNode;
  completed: boolean;
  additionalInfo?: string | null;
  optional: boolean;
}

/**
 * Configuration de navigation par étapes
 */
export interface NavigationStep {
  id: number;
  label: string;
  icon: string;
  description?: string;
  isOptional?: boolean;
  isCompleted?: boolean;
  isAccessible?: boolean;
  content?: React.ReactNode;
  additionalInfo?: string;
}

// ===== TYPES POUR LES CONTEXTES =====
// Note: Ces types sont définis ici pour référence, mais utilisez les types
// officiels de vos contextes pour éviter les conflits

// ===== PROPS DES COMPOSANTS =====

/**
 * Props du composant principal Postit
 */
export interface PostitComponentProps {
  postit?: Postit;
  inline?: boolean;
  hideHeader?: boolean;
  onSave?: (postit: Postit) => void;
  onCancel?: () => void;
  onDelete?: (postitId: number) => void;
  readOnly?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Props de base partagées par toutes les étapes
 */
export interface PostitBaseStepProps {
  selectedPostit: PostitExtended;
  theme?: Theme;
  stepBoxStyle?: React.CSSProperties;
  onUpdatePostit?: (updates: Partial<PostitExtended>) => void;
  readOnly?: boolean;
}

/**
 * Props pour l'étape de contexte - CORRECTED
 */
export interface ContexteStepProps extends PostitBaseStepProps {
  setSelectedPostit: (postit: PostitExtended) => void;
  selectedDomain: string | null;
  filteredDomains: Domain[];
  selectDomain: (domainId: string) => void; // Made required since it's being used
  onDomainChange?: (domain: Domain | null) => void;
}

/**
 * Props pour l'étape de sélection de sujet - CORRECTED
 */
export interface SujetStepProps extends PostitBaseStepProps {
  selectedDomain?: string | null; // Made optional since it might not always be needed
  categoriesSujets: CategorySubject[];
  sujetsData: Subject[];
  columnConfigSujets: ColumnConfig[];
  sujetsDeLActivite: number[];
  handleSujetClick: (subject: Subject) => void;
  selectedSubjectId?: number | null;
  onSubjectSelect?: (subject: Subject) => void;
  // Removed onBack and onNext as they were causing errors
}

/**
 * Props pour l'étape de sélection de pratique - CORRECTED
 */
export interface PratiqueStepProps extends PostitBaseStepProps {
  categoriesPratiques: CategoryPractice[];
  pratiques: Practice[];
  columnConfigPratiques: ColumnConfig[];
  pratiquesDeLActivite: number[];
  handlePratiqueClick: (practice: Practice) => void;
  selectedPracticeId?: number | null;
  onPracticeSelect?: (practice: Practice) => void;
  // Removed selectedDomain, onBack and onSave as they were causing errors
}

/**
 * Props pour le composant StatusBadge
 */
export interface StatusBadgeProps {
  isCompleted: boolean;
  hasSubject: boolean;
  size?: "small" | "medium" | "large";
  showText?: boolean;
}

/**
 * Props pour le composant StepNavigation
 */
export interface StepNavigationProps {
  steps: Array<{
    label: string;
    icon: string;
    isAccessible: boolean;
    isCompleted: boolean;
    additionalInfo?: string;
  }>;
  activeStep: number;
  isCompleted: boolean;
  hasRealSubject: boolean;
  navigateToStep: (stepIndex: number) => void;
  handleNext: () => void;
  handleBack: () => void;
  temporaryEditMode: boolean;
  onDelete: () => void;
}

/**
 * Props pour le composant SummaryPanel - CORRECTED
 */
export interface SummaryPanelProps extends PostitBaseStepProps {
  onEdit?: () => void;
  onClose?: () => void; // Added back as it might be needed
  // Removed duplicate theme and stepBoxStyle as they're in base props
}

// ===== TYPES POUR LES HOOKS =====

/**
 * Valeur de retour du hook usePostitStyles
 */
export interface UsePostitStylesReturn {
  theme: Theme;
  styles: {
    modalBackground: React.CSSProperties;
    modalWrapper: React.CSSProperties;
    modalContainer: React.CSSProperties;
    stepBox: React.CSSProperties;
    stepper: React.CSSProperties;
    stepperMobile: React.CSSProperties;
    content: React.CSSProperties;
    header: React.CSSProperties;
    footer: React.CSSProperties;
  };
  stepBoxStyle: React.CSSProperties;
  isMobile: boolean;
}

/**
 * Valeur de retour du hook usePostitNavigation
 */
export interface UsePostitNavigationReturn {
  activeStep: number;
  setActiveStep: (step: number) => void;
  temporaryEditMode: boolean;
  setTemporaryEditMode: (mode: boolean) => void;
  isCompleted: boolean;
  handleNext: () => void;
  handleBack: () => void;
  handleStepClick: (stepIndex: number) => void;
  isStepAccessible: (stepIndex: number) => boolean;
}

/**
 * Valeur de retour du hook usePostitActions
 */
export interface UsePostitActionsReturn {
  handleClosePostit: () => void;
  handleDelete: (postitId: number) => Promise<void>;
  handleSave: (postit: Postit) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Valeur de retour du hook useSujetSelection
 */
export interface UseSujetSelectionReturn {
  handleSujetClick: (subject: Subject) => void;
  sujetsDeLActivite: number[];
  categoriesSujets: CategorySubject[];
  sujetsData: Subject[];
  selectedSubjectId: number | null;
  isLoading: boolean;
}

/**
 * Valeur de retour du hook usePratiqueSelection
 */
export interface UsePratiqueSelectionReturn {
  handlePratiqueClick: (practice: Practice) => void;
  pratiquesDeLActivite: number[];
  categoriesPratiques: CategoryPractice[];
  pratiques: Practice[];
  selectedPracticeId: number | null;
  isLoading: boolean;
}

// ===== TYPES DE VALIDATION ET ÉTAT =====

/**
 * Résultat de validation
 */
export interface PostitValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fieldErrors: Record<string, string[]>;
}

/**
 * Statut de complétion
 */
export interface PostitCompletionStatus {
  hasValidSubject: boolean;
  hasValidPractice: boolean;
  hasValidContext: boolean;
  isComplete: boolean;
  completionPercentage: number;
  missingFields: string[];
}

/**
 * Configuration de navigation
 */
export interface PostitNavigationConfig {
  activeStep: number;
  totalSteps: number;
  steps: NavigationStep[];
  canGoNext: boolean;
  canGoPrevious: boolean;
  isCompleted: boolean;
}

/**
 * Options de navigation
 */
export interface PostitNavigationOptions {
  skipValidation?: boolean;
  forceNavigation?: boolean;
  saveOnNavigate?: boolean;
  showConfirmDialog?: boolean;
}

/**
 * État de chargement
 */
export interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
  progress?: number;
}

/**
 * État d'erreur
 */
export interface ErrorState {
  hasError: boolean;
  error?: Error | string;
  errorCode?: string;
  retryable?: boolean;
}

/**
 * État complet du composant
 */
export interface PostitState {
  postit: PostitExtended;
  navigation: PostitNavigationConfig;
  validation: PostitValidationResult;
  completion: PostitCompletionStatus;
  loading: LoadingState;
  error: ErrorState;

  // Données de support
  domains: Domain[];
  subjects: Subject[];
  practices: Practice[];
  categoriesSubjects: CategorySubject[];
  categoriesPractices: CategoryPractice[];
}

// ===== TYPES D'ÉVÉNEMENTS =====

/**
 * Événements du cycle de vie du Postit
 */
export type PostitEvent =
  | { type: "POSTIT_CREATED"; payload: { postit: Postit } }
  | {
      type: "POSTIT_UPDATED";
      payload: { postit: Postit; changes: Partial<Postit> };
    }
  | { type: "POSTIT_DELETED"; payload: { postitId: number } }
  | { type: "SUBJECT_SELECTED"; payload: { subject: Subject } }
  | { type: "PRACTICE_SELECTED"; payload: { practice: Practice } }
  | { type: "DOMAIN_SELECTED"; payload: { domain: Domain } }
  | { type: "CONTEXT_ADDED"; payload: { context: string } }
  | { type: "STEP_CHANGED"; payload: { fromStep: number; toStep: number } }
  | { type: "VALIDATION_FAILED"; payload: { errors: string[] } }
  | { type: "SAVE_REQUESTED"; payload: { postit: Postit } };

/**
 * Callback pour les événements
 */
export type PostitEventHandler = (event: PostitEvent) => void;

// ===== TYPES DE CONFIGURATION DES STYLES =====

/**
 * Configuration des styles
 */
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
    content: React.CSSProperties;
    header: React.CSSProperties;
    footer: React.CSSProperties;
  };
  stepBoxStyle: React.CSSProperties;
}

/**
 * Configuration des couleurs
 */
export interface PostitColorConfig {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
}

// ===== TYPES HELPERS POUR LA VALIDATION =====

/**
 * Type helper pour un Postit avec pratique obligatoire (pour validation finale)
 */
export interface PostitComplete extends Omit<Postit, "pratique"> {
  pratique: string; // Pratique obligatoire pour un postit complet
}

/**
 * Type guard pour vérifier si un postit est complet
 */
export function isPostitComplete(postit: Postit): postit is PostitComplete {
  return postit.pratique !== null && postit.pratique.trim() !== "";
}

/**
 * Type guard pour vérifier si un postit a un sujet valide
 */
export function hasValidSubject(postit: PostitExtended): boolean {
  return (
    postit.sujet !== null &&
    postit.sujet.trim() !== "" &&
    postit.sujet !== "Pas de sujet"
  );
}

/**
 * Type guard pour vérifier si un postit a une pratique valide
 */
export function hasValidPractice(postit: PostitExtended): boolean {
  return postit.pratique !== null && postit.pratique.trim() !== "";
}

// ===== EXPORTS PRINCIPAUX =====

// Aliases pour les types les plus utilisés
export type {
  Postit as PostitType,
  PostitExtended as ExtendedPostit,
  PostitComplete as CompletePostit,
  PostitComponentProps as PostitProps,
  PostitEvent as Event,
  PostitEventHandler as EventHandler,
  PostitState as State,
};

// ===== CONSTANTES =====

/**
 * Couleurs par défaut pour les post-its
 */
export const POSTIT_COLORS = [
  "#FFE066", // Jaune
  "#FF9999", // Rose
  "#99CCFF", // Bleu clair
  "#99FF99", // Vert clair
  "#FFCC99", // Orange clair
  "#CC99FF", // Violet clair
  "#FFFF99", // Jaune clair
  "#FF99CC", // Rose bonbon
] as const;

/**
 * Taille par défaut d'un post-it
 */
export const DEFAULT_POSTIT_SIZE = {
  width: 200,
  height: 200,
} as const;

/**
 * Indices des étapes de navigation
 */
export const NAVIGATION_STEPS = {
  CONTEXT: 0,
  SUBJECT: 1,
  PRACTICE: 2,
  REVIEW: 3,
} as const;

/**
 * États de validation
 */
export const VALIDATION_STATES = {
  VALID: "valid",
  INVALID: "invalid",
  PENDING: "pending",
  WARNING: "warning",
} as const;

/**
 * Types de priorité
 */
export const PRIORITY_LEVELS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
} as const;

/**
 * Niveaux de difficulté
 */
export const DIFFICULTY_LEVELS = {
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced",
} as const;
