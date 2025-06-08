// app/evaluation/components/UnifiedHeader/unifiedHeader.types.ts

export interface EvaluationStats {
  totalPostits: number;
  uniqueSujets: number;
  uniquePratiques: number;
}

export interface UnifiedHeaderProps {
  // Transcription props
  shouldShowTranscript: boolean;
  displayMode: "normal" | "transcript-fullwidth" | "context-fullwidth";
  selectedCall: { callid: string; description: string } | null;
  viewMode: "word" | "paragraph";
  currentWord: any;
  hasRightPanel: boolean;
  shouldShowContext: boolean;

  highlightTurnOne?: boolean;
  highlightSpeakers?: boolean;

  evaluationStats?: EvaluationStats | null;

  onToggleViewMode: () => void;
  onToggleHighlightTurnOne?: () => void;
  onToggleHighlightSpeakers?: () => void;
  onRefreshTranscription: () => void;
  onAddPostit: () => void;
  onSetTranscriptFullWidth: () => void;
  onToggleRightPanel: () => void;

  // Contextual
  view: string | null;
  filteredDomains: any[];
  selectedDomain: string;
  contextPanels: Record<string, { width: number | string }>;

  onDomainChange: (event: any) => void;
  onSave: () => void;
  onSetContextFullWidth: () => void;
  onClosePanel: () => void;
  onNavigateToSynthese?: () => void;

  fontSize?: number;
  increaseFontSize?: () => void;
  decreaseFontSize?: () => void;
  speechToTextVisible?: boolean;
  toggleSpeechToText?: () => void;
  isLoadingRolePlay?: boolean;
  selectedPostitForRolePlay?: any;
}

export interface ContextualHeaderProps {
  displayMode: "normal" | "transcript-fullwidth" | "context-fullwidth";
  view: string | null;
  filteredDomains: any[];
  selectedDomain: string;
  contextPanels: Record<string, { width: number | string }>;
  onDomainChange: (event: any) => void;
  onSave: () => void;
  onSetContextFullWidth: () => void;
  onClosePanel: () => void;

  fontSize?: number;
  increaseFontSize?: () => void;
  decreaseFontSize?: () => void;
  speechToTextVisible?: boolean;
  toggleSpeechToText?: () => void;
  isLoadingRolePlay?: boolean;
  selectedPostitForRolePlay?: any;

  onNavigateToSynthese?: () => void;

  // ✅ Ajout des props manquantes
  selectedCall?: { callid: string; description: string } | null;
  evaluationStats?: EvaluationStats | null;
}

export interface TranscriptionActionsProps {
  currentWord: any;
  selectedCall: { callid: string; description: string } | null;
  onAddPostit: () => void;
  onRefresh: () => void;
  size?: "small" | "medium"; // ✅ Ajouté ici
}
