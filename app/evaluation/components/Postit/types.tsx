// postit/types.tsx - Types complètement autonomes pour le composant Postit
import React from "react";
import { Theme } from "@mui/material/styles";

// ===== TYPES DE BASE =====

// Type principal pour un Postit dans ce contexte (aligné avec votre structure globale)
export interface Postit {
  id: number;
  callid: number;
  wordid: number;
  word: string;
  text: string;
  iddomaine: number | null;
  sujet: string; // Sujet en texte
  idsujet: number | null; // ID du sujet
  pratique: string | null; // ✅ CORRIGÉ : Nullable dès la base pour permettre l'état de saisie
  idpratique?: number | null; // ID de la pratique utilisé dans le code
  timestamp: number;
  idactivite?: number | null;

  // Propriétés UI optionnelles pour le composant
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

// Version étendue avec propriétés pour la navigation/interface
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

// Domaine d'activité (aligné avec votre structure)
export interface Domain {
  iddomaine: number;
  nomdomaine: string;
  description?: string;
  color?: string;
  isActive?: boolean;
  order?: number;
}

// Sujet (aligné avec votre structure)
export interface Subject {
  idsujet: number;
  nomsujet: string;
  description?: string;
  idcategoriesujet?: number;
  iddomaine: number;
  isActive?: boolean;
  order?: number;
}

// Pratique (aligné avec votre structure)
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

// Catégorie pour sujets (aligné avec votre structure)
export interface CategorySubject {
  idcategoriesujet: number;
  nomcategorie: string;
  couleur: string;
  isActive?: boolean;
  order?: number;
}

// Catégorie pour pratiques (aligné avec votre structure)
export interface CategoryPractice {
  idcategoriepratique: number;
  nomcategorie: string;
  couleur: string;
  isActive?: boolean;
  order?: number;
}

// ===== TYPES DE CONFIGURATION =====

// Configuration des colonnes pour l'affichage
export interface ColumnConfig {
  field: string;
  headerName: string;
  width?: number;
  flex?: number;
  sortable?: boolean;
  filterable?: boolean;
  renderCell?: (params: any) => React.ReactNode;
}

// Configuration de navigation par étapes
export interface NavigationStep {
  id: number;
  label: string;
  icon: string;
  description?: string;
  isOptional?: boolean;
  isCompleted?: boolean;
  isAccessible?: boolean;
  content?: React.ReactNode;
}

// ===== PROPS DES COMPOSANTS =====

// Props du composant principal Postit
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

// Props de base partagées par toutes les étapes
export interface PostitBaseStepProps {
  selectedPostit: PostitExtended;
  theme?: Theme;
  stepBoxStyle?: React.CSSProperties;
  onUpdatePostit?: (updates: Partial<PostitExtended>) => void;
  readOnly?: boolean;
}

// Props pour l'étape de contexte (aligné avec vos domaines)
export interface PostitContexteStepProps extends PostitBaseStepProps {
  setSelectedPostit: (postit: PostitExtended) => void;
  selectedDomain: string | null;
  filteredDomains: Domain[]; // Utilise le type Domain aligné
  showTabs?: boolean;
  setShowTabs?: (show: boolean) => void;
  selectDomain?: (domainId: string) => void;
  onDomainChange?: (domain: Domain | null) => void;
}

// Props pour l'étape de sélection de sujet (aligné avec vos sujets)
export interface PostitSujetStepProps extends PostitBaseStepProps {
  categoriesSujets: CategorySubject[]; // Utilise le bon type de catégorie
  sujetsData: Subject[]; // Utilise le type Subject aligné
  columnConfigSujets: ColumnConfig[];
  sujetsDeLActivite: number[];
  handleSujetClick: (subject: Subject) => void;
  selectedSubjectId?: number | null;
  onSubjectSelect?: (subject: Subject) => void;
}

// Props pour l'étape de sélection de pratique (aligné avec vos pratiques)
export interface PostitPratiqueStepProps extends PostitBaseStepProps {
  categoriesPratiques: CategoryPractice[]; // Utilise le bon type de catégorie
  pratiques: Practice[]; // Utilise le type Practice aligné
  columnConfigPratiques: ColumnConfig[];
  pratiquesDeLActivite: number[];
  handlePratiqueClick: (practice: Practice) => void;
  selectedPracticeId?: number | null;
  onPracticeSelect?: (practice: Practice) => void;
}

// ===== TYPES DE VALIDATION ET ÉTAT =====

// Résultat de validation
export interface PostitValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fieldErrors: Record<string, string[]>;
}

// Statut de complétion
export interface PostitCompletionStatus {
  hasValidSubject: boolean;
  hasValidPractice: boolean;
  hasValidContext: boolean;
  isComplete: boolean;
  completionPercentage: number;
  missingFields: string[];
}

// Configuration de navigation
export interface PostitNavigationConfig {
  activeStep: number;
  totalSteps: number;
  steps: NavigationStep[];
  canGoNext: boolean;
  canGoPrevious: boolean;
  isCompleted: boolean;
}

// Options de navigation
export interface PostitNavigationOptions {
  skipValidation?: boolean;
  forceNavigation?: boolean;
  saveOnNavigate?: boolean;
  showConfirmDialog?: boolean;
}

// ===== TYPES D'ÉVÉNEMENTS =====

// Événements du cycle de vie du Postit
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

// Callback pour les événements
export type PostitEventHandler = (event: PostitEvent) => void;

// ===== TYPES DE CONFIGURATION DES STYLES =====

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
    content: React.CSSProperties;
    header: React.CSSProperties;
    footer: React.CSSProperties;
  };
  stepBoxStyle: React.CSSProperties;
}

// Configuration des couleurs
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

// ===== TYPES UTILITAIRES =====

// État de chargement
export interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
  progress?: number;
}

// État d'erreur
export interface ErrorState {
  hasError: boolean;
  error?: Error | string;
  errorCode?: string;
  retryable?: boolean;
}

// État complet du composant
export interface PostitState {
  postit: PostitExtended;
  navigation: PostitNavigationConfig;
  validation: PostitValidationResult;
  completion: PostitCompletionStatus;
  loading: LoadingState;
  error: ErrorState;

  // Données de support (alignées avec votre structure)
  domains: Domain[];
  subjects: Subject[];
  practices: Practice[];
  categoriesSubjects: CategorySubject[];
  categoriesPractices: CategoryPractice[];
}

// ===== TYPES HELPERS POUR LA VALIDATION =====

// Type helper pour un Postit avec pratique obligatoire (pour validation finale)
export interface PostitComplete extends Omit<Postit, "pratique"> {
  pratique: string; // Pratique obligatoire pour un postit complet
}

// Type guard pour vérifier si un postit est complet
export function isPostitComplete(postit: Postit): postit is PostitComplete {
  return postit.pratique !== null && postit.pratique.trim() !== "";
}

// ===== EXPORTS PRINCIPAUX =====

// Types les plus utilisés
export type {
  Postit as PostitType,
  PostitExtended as ExtendedPostit,
  PostitComplete as CompletePostit,
  PostitComponentProps as PostitProps,
  PostitEvent as Event,
  PostitEventHandler as EventHandler,
  PostitState as State,
};

// Constantes utiles
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

export const DEFAULT_POSTIT_SIZE = {
  width: 200,
  height: 200,
} as const;

export const NAVIGATION_STEPS = {
  CONTEXT: 0,
  SUBJECT: 1,
  PRACTICE: 2,
  REVIEW: 3,
} as const;
