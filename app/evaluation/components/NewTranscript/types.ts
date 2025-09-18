// app/evaluation/components/NewTranscript/types.ts

export interface NewTranscriptProps {
  callId: string;
  config?: Partial<TranscriptConfig>;

  // Props de compatibilité (temporaires)
  hideHeader?: boolean;
  highlightTurnOne?: boolean;
  transcriptSelectionMode?: string;
  isSpectatorMode?: boolean;
  highlightedWordIndex?: number;
  viewMode?: "word" | "paragraph";
}

export interface TranscriptConfig {
  mode: "evaluation" | "tagging" | "analysis" | "spectator";
  audioSrc: string;
  displayMode: "word-by-word" | "paragraphs" | "hybrid" | "turns" | "compact"; // ✅ Ajout "turns" et "compact"
  timelineMode: "minimal" | "hidden" | "compact" | "detailed" | "impact";
  eventTypes: EventTypeConfig[];
  interactions: InteractionConfig;
  layout: LayoutConfig;
  fontSize: number;
  theme: "light" | "dark" | "auto";
}

export interface EventTypeConfig {
  type: string;
  enabled: boolean;
  visible: boolean;
  editable?: boolean;
  layer?: string;
  color?: string;
  priority?: number;
}

export interface InteractionConfig {
  wordClick: boolean;
  textSelection: boolean;
  eventEditing: boolean;
  timelineNavigation: boolean;
  keyboardShortcuts: boolean;
  highlightTurns?: boolean;
  selectionMode?: string;
  spectatorMode?: boolean;
}

export interface LayoutConfig {
  audioPlayerPosition: "top" | "bottom" | "floating" | "integrated";
  transcriptHeight: string;
  timelineHeight: number;
  showControls: boolean;
}

// Système d'événements temporels
export interface TemporalEvent {
  id: string;
  type: "tag" | "postit" | "annotation" | "custom";
  startTime: number;
  endTime?: number;
  data: any; // Données spécifiques au type
  metadata: EventMetadata;
}

export interface EventMetadata {
  color?: string;
  priority: number;
  category?: string;
  speaker?: string;
  interactive: boolean;
}

// Providers d'événements
export interface EventProvider {
  type: string;
  name: string;

  // Méthodes obligatoires
  fetchEvents: (callId: string) => Promise<TemporalEvent[]>;
  createEvent: (event: Partial<TemporalEvent>) => Promise<TemporalEvent>;
  updateEvent: (id: string, updates: Partial<TemporalEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;

  // Configuration
  getConfig: () => ProviderConfig;
  getTimelineConfig: () => TimelineLayerConfig;
}

export interface ProviderConfig {
  name: string;
  description: string;
  version: string;
  capabilities: string[];
}

export interface TimelineLayerConfig {
  layer: string;
  height: number;
  color: string | "dynamic";
  shape: "rectangle" | "circle" | "diamond";
  showLabel: boolean;
  interactive?: boolean;
}

// Timeline
export interface TimelineLayer {
  id: string;
  name: string;
  events: TemporalEvent[];
  height: number;
  color: string;
  visible: boolean;
  interactive: boolean;
}

export interface TimelineMarker {
  id: string;
  time: number;
  label: string;
  color: string;
  type?: string;
}

// Transcription - VERSION CORRIGÉE
export interface Word {
  id: number;
  text: string;
  start_time: number;
  end_time: number;
  speaker?: string; // "Conseiller" | "Client" | "Inconnu" (calculé depuis turn)
  turn?: string; // ✅ AJOUT : Valeur originale du champ turn (turn1, turn2, etc.)
  confidence?: number;
}

export interface TextSelection {
  startWordIndex: number;
  endWordIndex: number;
  selectedText: string;
  startTime: number;
  endTime: number;
}

// Configuration par défaut
export const defaultTranscriptConfig: TranscriptConfig = {
  mode: "evaluation",
  audioSrc: "",
  displayMode: "paragraphs",
  timelineMode: "detailed",
  fontSize: 14,
  theme: "light",
  eventTypes: [
    {
      type: "postit",
      enabled: true,
      visible: true,
      editable: true,
      layer: "primary",
      color: "#ff6b6b",
      priority: 2,
    },
  ],
  interactions: {
    wordClick: true,
    textSelection: false,
    eventEditing: true,
    timelineNavigation: true,
    keyboardShortcuts: true,
  },
  layout: {
    audioPlayerPosition: "integrated",
    transcriptHeight: "calc(100vh - 300px)",
    timelineHeight: 120,
    showControls: true,
  },
};

// Types de migration des composants existants
export type LegacyTranscriptMode = "word-by-word" | "paragraphs" | "turns"; // ✅ Ajout "turns"
export type LegacyPostit = {
  id: number;
  timestamp: number;
  text: string;
  sujet: string;
  pratique: string;
  word?: Word;
  wordid?: number;
};

export type LegacyTimelineMarker = {
  id: string;
  time: number;
  label: string;
  color: string;
};

// Utilitaires de conversion - VERSION CORRIGÉE
export const convertLegacyToConfig = (legacyProps: {
  viewMode?: "word" | "paragraph" | "turns";
  transcriptSelectionMode?: string;
  isSpectatorMode?: boolean;
  highlightTurnOne?: boolean;
}): Partial<TranscriptConfig> => {
  let displayMode: TranscriptConfig["displayMode"];

  switch (legacyProps.viewMode) {
    case "word":
      displayMode = "word-by-word";
      break;
    case "paragraph":
      displayMode = "paragraphs";
      break;
    case "turns":
      displayMode = "turns";
      break;
    default:
      displayMode = "paragraphs";
  }

  return {
    displayMode,
    interactions: {
      wordClick: true,
      textSelection: !!legacyProps.transcriptSelectionMode,
      eventEditing: !legacyProps.isSpectatorMode,
      timelineNavigation: true,
      keyboardShortcuts: true,
      highlightTurns: legacyProps.highlightTurnOne,
      selectionMode: legacyProps.transcriptSelectionMode,
      spectatorMode: legacyProps.isSpectatorMode,
    },
  };
};

// Forward declaration pour éviter les imports circulaires
export interface EventManagerInterface {
  registerProvider(provider: EventProvider): void;
  loadEvents(): Promise<TemporalEvent[]>;
  getEvents(): TemporalEvent[];
  getEventsInRange(startTime: number, endTime: number): TemporalEvent[];
  getEventsAtTime(time: number): TemporalEvent[];
  createEvent(event: Partial<TemporalEvent>): Promise<TemporalEvent | null>;
  updateEvent(id: string, updates: Partial<TemporalEvent>): Promise<boolean>;
  deleteEvent(id: string): Promise<boolean>;
  subscribe(callback: (events: TemporalEvent[]) => void): () => void;
}

// Hooks utilitaires
export interface UseEventManagerReturn {
  eventManager: EventManagerInterface;
  events: TemporalEvent[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// Types pour les zones
export interface HeaderZoneProps {
  callId: string;
  config: TranscriptConfig;
  audioSrc: string;
  onConfigChange: (config: Partial<TranscriptConfig>) => void;
}

export interface TimelineZoneProps {
  events: TemporalEvent[];
  currentTime: number;
  duration: number;
  config: TranscriptConfig;
  onEventClick: (event: TemporalEvent) => void;
  onTimelineClick: (time: number) => void;
}

export interface TranscriptZoneProps {
  transcription: Word[];
  events: TemporalEvent[];
  config: TranscriptConfig;
  currentWordIndex: number;
  onWordClick: (word: Word) => void;
  onTextSelection: (selection: TextSelection) => void;
  onEventClick: (event: TemporalEvent) => void;
}

export interface ControlsZoneProps {
  config: TranscriptConfig;
  events: TemporalEvent[];
  onConfigChange: (config: Partial<TranscriptConfig>) => void;
}

// ✅ AJOUT : Props spécifiques pour TurnsView
export interface TurnsViewProps {
  transcription: Word[];
  events: TemporalEvent[];
  fontSize: number;
  speakerColors: Record<string, string>;
  showTimestamps?: boolean;
  onWordClick: (word: Word) => void;
  onEventClick: (event: TemporalEvent) => void;
}

// Configuration d'export
export interface ExportConfig {
  format: "pdf" | "docx" | "json" | "csv";
  includeEvents: boolean;
  includeTimestamps: boolean;
  eventTypes: string[];
}
