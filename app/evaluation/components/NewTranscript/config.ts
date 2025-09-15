// app/evaluation/components/NewTranscript/config.ts

import { TranscriptConfig, EventTypeConfig } from "./types";
import { SpeakerType } from "@/utils/SpeakerUtils";

// Configuration par défaut pour le mode évaluation
export const evaluationConfig: TranscriptConfig = {
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
    showControls: false, // Contrôlé par Evaluation.tsx
  },
};

// Configuration pour le mode tagging (TranscriptLPL)
export const taggingConfig: TranscriptConfig = {
  mode: "tagging",
  audioSrc: "",
  displayMode: "word-by-word",
  timelineMode: "compact",
  fontSize: 14,
  theme: "light",
  eventTypes: [
    {
      type: "tag",
      enabled: true,
      visible: true,
      editable: true,
      layer: "primary",
      color: "dynamic", // Couleur basée sur le tag
      priority: 1,
    },
  ],
  interactions: {
    wordClick: true,
    textSelection: true,
    eventEditing: true,
    timelineNavigation: true,
    keyboardShortcuts: true,
  },
  layout: {
    audioPlayerPosition: "top",
    transcriptHeight: "calc(100vh - 250px)",
    timelineHeight: 80,
    showControls: true,
  },
};

// Configuration pour le mode analyse
export const analysisConfig: TranscriptConfig = {
  mode: "analysis",
  audioSrc: "",
  displayMode: "hybrid",
  timelineMode: "detailed",
  fontSize: 14,
  theme: "light",
  eventTypes: [
    {
      type: "postit",
      enabled: true,
      visible: true,
      editable: false,
      layer: "secondary",
      color: "#ff6b6b",
      priority: 2,
    },
    {
      type: "tag",
      enabled: true,
      visible: true,
      editable: false,
      layer: "primary",
      color: "dynamic",
      priority: 1,
    },
    {
      type: "annotation",
      enabled: true,
      visible: true,
      editable: true,
      layer: "tertiary",
      color: "#45b7d1",
      priority: 3,
    },
  ],
  interactions: {
    wordClick: true,
    textSelection: true,
    eventEditing: true,
    timelineNavigation: true,
    keyboardShortcuts: true,
  },
  layout: {
    audioPlayerPosition: "top",
    transcriptHeight: "calc(100vh - 400px)",
    timelineHeight: 160,
    showControls: true,
  },
};

// Configuration pour le mode spectateur
export const spectatorConfig: TranscriptConfig = {
  mode: "spectator",
  audioSrc: "",
  displayMode: "paragraphs",
  timelineMode: "minimal",
  fontSize: 14,
  theme: "light",
  eventTypes: [
    {
      type: "postit",
      enabled: true,
      visible: true,
      editable: false,
      layer: "primary",
      color: "#ff6b6b",
      priority: 2,
    },
    {
      type: "tag",
      enabled: true,
      visible: true,
      editable: false,
      layer: "secondary",
      color: "dynamic",
      priority: 1,
    },
  ],
  interactions: {
    wordClick: false,
    textSelection: false,
    eventEditing: false,
    timelineNavigation: true,
    keyboardShortcuts: false,
    spectatorMode: true,
  },
  layout: {
    audioPlayerPosition: "integrated",
    transcriptHeight: "calc(100vh - 200px)",
    timelineHeight: 60,
    showControls: false,
  },
};

// Fonction pour obtenir la configuration par défaut selon le mode
export const getDefaultConfigForMode = (mode: string): TranscriptConfig => {
  switch (mode) {
    case "evaluation":
      return evaluationConfig;
    case "tagging":
      return taggingConfig;
    case "analysis":
      return analysisConfig;
    case "spectator":
      return spectatorConfig;
    default:
      return evaluationConfig;
  }
};

// Utilitaires de configuration

export const mergeConfigs = (
  baseConfig: TranscriptConfig,
  overrides: Partial<TranscriptConfig>
): TranscriptConfig => {
  return {
    ...baseConfig,
    ...overrides,
    eventTypes: overrides.eventTypes || baseConfig.eventTypes,
    interactions: {
      ...baseConfig.interactions,
      ...overrides.interactions,
    },
    layout: {
      ...baseConfig.layout,
      ...overrides.layout,
    },
  };
};

export const validateConfig = (
  config: TranscriptConfig
): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  // Validation du mode
  if (
    !["evaluation", "tagging", "analysis", "spectator"].includes(config.mode)
  ) {
    errors.push(`Mode invalide: ${config.mode}`);
  }

  // Validation du displayMode
  if (
    !["word-by-word", "paragraphs", "hybrid", "turns", "compact"].includes(
      config.displayMode
    )
  ) {
    errors.push(`DisplayMode invalide: ${config.displayMode}`);
  }

  // Validation du timelineMode
  if (
    !["compact", "detailed", "minimal", "hidden"].includes(config.timelineMode)
  ) {
    errors.push(`TimelineMode invalide: ${config.timelineMode}`);
  }

  // Validation des eventTypes
  if (!Array.isArray(config.eventTypes) || config.eventTypes.length === 0) {
    errors.push("Au moins un type d'événement doit être configuré");
  }

  // Validation de la structure des eventTypes
  config.eventTypes.forEach((eventType, index) => {
    if (!eventType.type) {
      errors.push(`EventType[${index}]: type manquant`);
    }
    if (typeof eventType.enabled !== "boolean") {
      errors.push(`EventType[${index}]: enabled doit être un boolean`);
    }
    if (typeof eventType.visible !== "boolean") {
      errors.push(`EventType[${index}]: visible doit être un boolean`);
    }
  });

  // Validation fontSize
  if (config.fontSize < 10 || config.fontSize > 24) {
    errors.push("FontSize doit être entre 10 et 24");
  }

  // Validation timelineHeight
  if (config.layout.timelineHeight < 40 || config.layout.timelineHeight > 300) {
    errors.push("TimelineHeight doit être entre 40 et 300px");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Presets de configuration rapide
export const configPresets = {
  // Preset pour évaluation basique
  evaluationBasic: {
    mode: "evaluation" as const,
    displayMode: "paragraphs" as const,
    timelineMode: "compact" as const,
    eventTypes: [
      {
        type: "postit",
        enabled: true,
        visible: true,
        editable: true,
      },
    ],
  },

  // Preset pour évaluation avancée
  evaluationAdvanced: {
    mode: "evaluation" as const,
    displayMode: "hybrid" as const,
    timelineMode: "detailed" as const,
    eventTypes: [
      {
        type: "postit",
        enabled: true,
        visible: true,
        editable: true,
      },
    ],
  },

  // ✅ NOUVEAU : Preset pour mode turns (compatible ancien système)
  evaluationTurns: {
    mode: "evaluation" as const,
    displayMode: "turns" as const,
    timelineMode: "detailed" as const,
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
      textSelection: true,
      eventEditing: true,
      timelineNavigation: true,
      keyboardShortcuts: true,
    },
    layout: {
      audioPlayerPosition: "top" as const,
      showControls: false,
      transcriptHeight: "calc(100vh - 200px)",
      timelineHeight: 120,
    },
  },

  // ✅ PRÉPARATION : Preset pour mode compact (étape 2)
  evaluationCompact: {
    mode: "evaluation" as const,
    displayMode: "compact" as const,
    timelineMode: "detailed" as const, // ✅ CORRECTION: utiliser "detailed" au lieu de "integrated"
    eventTypes: [
      {
        type: "postit",
        enabled: true,
        visible: true,
        editable: true,
      },
    ],
    interactions: {
      wordClick: false, // Pas de clic mot en mode compact
      textSelection: false,
      eventEditing: true,
      timelineNavigation: true,
      keyboardShortcuts: true,
    },
    layout: {
      audioPlayerPosition: "integrated" as const,
      showControls: true, // Stats et contrôles visibles
      transcriptHeight: "calc(100vh - 150px)", // Plus d'espace
      timelineHeight: 60, // Plus petit en mode compact
    },
  },

  // Preset pour tagging LPL
  lplTagging: {
    mode: "tagging" as const,
    displayMode: "word-by-word" as const,
    timelineMode: "detailed" as const,
    eventTypes: [
      {
        type: "tag",
        enabled: true,
        visible: true,
        editable: true,
      },
    ],
  },

  // Preset lecture seule
  readOnly: {
    mode: "spectator" as const,
    displayMode: "paragraphs" as const,
    timelineMode: "minimal" as const,
    interactions: {
      wordClick: false,
      textSelection: false,
      eventEditing: false,
      timelineNavigation: true,
      keyboardShortcuts: false,
    },
  },
};

// Fonction helper pour appliquer un preset
export const applyConfigPreset = (
  preset: keyof typeof configPresets,
  baseConfig?: Partial<TranscriptConfig>
): TranscriptConfig => {
  const presetConfig = configPresets[preset];
  const defaultConfig = getDefaultConfigForMode(presetConfig.mode);

  return mergeConfigs(defaultConfig, {
    ...presetConfig,
    ...baseConfig,
  });
};

// Migration des anciennes props vers nouvelle configuration
export const migrateEvaluationTranscriptProps = (props: {
  hideHeader?: boolean;
  highlightTurnOne?: boolean;
  transcriptSelectionMode?: string;
  isSpectatorMode?: boolean;
  viewMode?: "word" | "paragraph";
}): Partial<TranscriptConfig> => {
  return {
    displayMode: props.viewMode === "word" ? "word-by-word" : "paragraphs",
    interactions: {
      wordClick: true,
      textSelection: !!props.transcriptSelectionMode,
      eventEditing: !props.isSpectatorMode,
      timelineNavigation: true,
      keyboardShortcuts: true,
      highlightTurns: props.highlightTurnOne,
      selectionMode: props.transcriptSelectionMode,
      spectatorMode: props.isSpectatorMode,
    },
    layout: {
      audioPlayerPosition: props.hideHeader ? "integrated" : "top",
      showControls: !props.isSpectatorMode,
      transcriptHeight: "calc(100vh - 300px)",
      timelineHeight: 120,
    },
  };
};

export default {
  evaluationConfig,
  taggingConfig,
  analysisConfig,
  spectatorConfig,
  getDefaultConfigForMode,
  mergeConfigs,
  validateConfig,
  configPresets,
  applyConfigPreset,
  migrateEvaluationTranscriptProps,
};
