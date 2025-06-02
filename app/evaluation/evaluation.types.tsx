/**
 * Interface pour une entreprise
 */ // evaluation.types.ts - Types AUTONOMES pour le composant Evaluation
// Indépendant de @types/types.tsx

import { RefObject } from "react";

// 🎯 TYPES AUTONOMES POUR EVALUATION

/**
 * Interface pour un appel - Compatible avec le système existant
 */
export interface CallActivityRelation {
  activityid: number;
  activitesconseillers: { nature: string }[];
}

export interface Call {
  audiourl: string | null;
  callid: number;
  filename: string;
  description?: string;
  filepath?: string;
  callactivityrelation: CallActivityRelation[]; // ✅ Propriété requise ajoutée
}

/**
 * Interface pour un post-it
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
  pratique: string;
  idpratique?: number | null;
  timestamp: number;
  idactivite?: number | null;
}

/**
 * Interface pour un mot de transcription
 */
export interface Word {
  wordid: number;
  text: string;
  startTime: number;
  endTime: number;
  timestamp?: number;
  turn?: "turn1" | "turn2";
}

/**
 * Interface pour un domaine
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
 * Interface pour les statistiques retournées par getPostitStatistics
 */
export interface StatsData {
  totalPostits: number;
  uniqueSujets: number;
  uniquePratiques: number;
  postitsBySujet?: Record<string, number>;
  postitsByPratique?: Record<string, number>;
  averageRating?: number;
  completionRate?: number;
  [key: string]: any; // Pour flexibilité avec les autres propriétés
}
export interface Entreprise {
  id: number;
  nom: string;
  identreprise: number;
  nomentreprise: string;
}

/**
 * Props de base pour le composant Evaluation
 */
export interface EvaluationProps {
  darkMode: boolean;
  setDarkMode: (mode: boolean) => void;
}

/**
 * Interfaces pour les hooks/contextes utilisés par Evaluation
 */
export interface UseAuth0Result {
  user: any;
  isAuthenticated: boolean;
}

export interface UseCallDataResult {
  selectedCall: Call | null;
  currentWord: Word | null;
  fetchTranscription: (callId: number) => Promise<void>;
  calls: Call[];
  selectCall: (call: Call) => void;
  selectedPostitForRolePlay: Postit | null;
  transcriptSelectionMode: "client" | "conseiller" | null;
  isLoadingRolePlay: boolean;
  selectedPostit: Postit | null;
  setSelectedPostit: (postit: Postit | null) => void;
  appelPostits: Postit[];
}

export interface UseAudioResult {
  audioRef: RefObject<HTMLAudioElement>;
  setAudioSrc: (src: string | null) => void;
}

export interface UseAppContextResult {
  resetSelectedState: () => void;
  entreprises: Entreprise[];
  isLoadingEntreprises: boolean;
  errorEntreprises: any;
  selectedEntreprise: number | null;
  setSelectedEntreprise: (id: number | null) => void;
  selectedDomain: Domain | string | null;
  selectDomain: (domain: string) => void;
}

export interface UseFilteredDomainsResult {
  filteredDomains: Domain[];
}

/**
 * Modes d'affichage pour la gestion des panneaux
 */
export type DisplayMode =
  | "normal"
  | "transcript-fullwidth"
  | "context-fullwidth";

/**
 * Modes de vue pour la transcription
 */
export type ViewMode = "word" | "paragraph";

/**
 * Types de vues contextuelles disponibles
 */
export type ContextView =
  | "selection"
  | "synthese"
  | "postit"
  | "roleplay"
  | "entrainement";

/**
 * Configuration d'un panneau contextuel
 */
export interface ContextPanel {
  component: React.ReactNode;
  width: number | string;
}

/**
 * Map des panneaux contextuels disponibles
 */
export type ContextPanelsMap = Record<ContextView, ContextPanel>;

/**
 * Statistiques d'évaluation calculées à partir des post-its
 * Compatible avec l'interface attendue par UnifiedHeader
 */
export interface EvaluationStats {
  totalPostits: number;
  uniqueSujets: number; // ✅ Propriété requise ajoutée
  uniquePratiques: number; // ✅ Propriété requise ajoutée
  postitsBySujet?: Record<string, number>; // Optionnel pour compatibilité étendue
  postitsByPratique?: Record<string, number>; // Optionnel pour compatibilité étendue
  averageRating?: number;
  completionRate?: number;
  lastUpdated?: string;
}

/**
 * Props pour le composant UnifiedHeader
 */
export interface UnifiedHeaderProps {
  // 📝 Transcription props
  shouldShowTranscript: boolean;
  displayMode: DisplayMode;
  selectedCall: Call | null;
  evaluationStats: EvaluationStats | null;
  viewMode: ViewMode;
  currentWord: Word | null;
  hasRightPanel: boolean;
  shouldShowContext: boolean;
  highlightTurnOne: boolean;
  highlightSpeakers: boolean;

  // 🎬 Actions transcription
  onToggleViewMode: () => void;
  onRefreshTranscription: () => void;
  onAddPostit: () => void;
  onSetTranscriptFullWidth: () => void;
  onToggleRightPanel: () => void;
  onToggleHighlightTurnOne: () => void;
  onToggleHighlightSpeakers: () => void;

  // 🗂️ Contextual props
  view: string | null;
  filteredDomains: Domain[];
  selectedDomain: string; // String plutôt que Domain pour compatibilité
  contextPanels: ContextPanelsMap;

  // 🎯 Actions contextuelles
  onDomainChange: (event: any) => void;
  onSave: () => void;
  onSetContextFullWidth: () => void;
  onClosePanel: () => void;
  onNavigateToSynthese: () => void;

  // 🎮 FourZones props
  fontSize: number;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  speechToTextVisible: boolean;
  toggleSpeechToText: () => void;
  isLoadingRolePlay: boolean;
  selectedPostitForRolePlay: Postit | null;
}

/**
 * Props pour le composant EvaluationTranscript
 */
export interface EvaluationTranscriptProps {
  showRightPanel: boolean;
  toggleRightPanel: () => void;
  hasRightPanel: boolean;
  displayMode: DisplayMode;
  setTranscriptFullWidth: () => void;
  setContextFullWidth: () => void;
  viewMode: ViewMode;
  hideHeader: boolean;
  highlightTurnOne: boolean;
  highlightSpeakers: boolean;
  transcriptSelectionMode?: "client" | "conseiller" | null; // Optionnel pour gérer null
}

/**
 * Props étendues pour le composant Evaluation principal
 */
export interface EvaluationComponentProps extends EvaluationProps {
  // Ajout de props spécifiques si nécessaire
  initialView?: ContextView;
  defaultDisplayMode?: DisplayMode;
  enableAutoSave?: boolean;
  autoSaveInterval?: number;
}

/**
 * Configuration pour la gestion des polices
 */
export interface FontSizeConfig {
  min: number;
  max: number;
  default: number;
  step: number;
}

/**
 * État interne du composant Evaluation
 */
export interface EvaluationState {
  displayMode: DisplayMode;
  viewMode: ViewMode;
  highlightTurnOne: boolean;
  highlightSpeakers: boolean;
  fontSize: number;
  speechToTextVisible: boolean;
}

/**
 * Actions disponibles pour la gestion de l'état Evaluation
 */
export interface EvaluationActions {
  setDisplayMode: (mode: DisplayMode) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleHighlightTurnOne: () => void;
  toggleHighlightSpeakers: () => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  toggleSpeechToText: () => void;
  setTranscriptFullWidth: () => void;
  setContextFullWidth: () => void;
  toggleRightPanel: () => void;
}

/**
 * Configuration par défaut pour l'Evaluation
 */
export const EVALUATION_DEFAULTS: {
  displayMode: DisplayMode;
  viewMode: ViewMode;
  fontSize: FontSizeConfig;
  highlightSettings: {
    turnOne: boolean;
    speakers: boolean;
  };
} = {
  displayMode: "normal",
  viewMode: "word",
  fontSize: {
    min: 10,
    max: 24,
    default: 14,
    step: 1,
  },
  highlightSettings: {
    turnOne: false,
    speakers: true,
  },
};

/**
 * Hook personnalisé pour la gestion de l'état Evaluation
 */
export interface UseEvaluationStateResult {
  state: EvaluationState;
  actions: EvaluationActions;
  contextPanels: ContextPanelsMap;
  shouldShowTranscript: boolean;
  shouldShowContext: boolean;
  hasRightPanel: boolean;
}

/**
 * Configuration de navigation pour les vues
 */
export interface NavigationConfig {
  defaultView: ContextView;
  allowedTransitions: Record<ContextView, ContextView[]>;
  requiresSelectedCall: ContextView[];
  requiresSelectedPostit: ContextView[];
}

/**
 * Props pour ActivitySidebar - Interface pour résoudre l'erreur de type
 */
export interface ActivitySidebarProps {
  entreprises: Entreprise[];
  selectedEntreprise: number | null;
  setSelectedEntreprise: (id: number | null) => void;
  calls: Call[];
  selectCall: (call: Call) => void;
  selectedCall: Call | null;
}

/**
 * Helpers pour la validation des types dans Evaluation
 */
export const EvaluationHelpers = {
  /**
   * Convertit la logique complexe shouldShowContext en boolean
   */
  validateShouldShowContext: (
    displayMode: DisplayMode,
    view: string | null,
    contextPanels: ContextPanelsMap,
    selectedPostit: Postit | null
  ): boolean => {
    return (
      displayMode !== "transcript-fullwidth" &&
      Boolean((view && contextPanels[view as ContextView]) || selectedPostit)
    );
  },

  /**
   * Assure que selectedDomain est un string
   */
  validateSelectedDomain: (domain: Domain | string | null): string => {
    if (typeof domain === "string") return domain;
    if (domain && typeof domain === "object" && "iddomaine" in domain) {
      return String(domain.iddomaine);
    }
    return "";
  },

  /**
   * Valide transcriptSelectionMode pour EvaluationTranscript
   */
  validateTranscriptSelectionMode: (
    mode: "client" | "conseiller" | null
  ): "client" | "conseiller" | undefined => {
    return mode === null ? undefined : mode;
  },

  /**
   * Convertit un Call externe vers le type Call local
   */
  convertExternalCall: (externalCall: any): Call => {
    return {
      audiourl: externalCall.audiourl || null,
      callid: externalCall.callid,
      filename: externalCall.filename,
      description: externalCall.description,
      filepath: externalCall.filepath,
      callactivityrelation: externalCall.callactivityrelation || [],
    };
  },

  /**
   * Convertit une liste de Call externes vers des Call locaux
   */
  convertExternalCalls: (externalCalls: any[]): Call[] => {
    return externalCalls.map(EvaluationHelpers.convertExternalCall);
  },
};
