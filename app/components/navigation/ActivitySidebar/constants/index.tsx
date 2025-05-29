// constants/index.ts

import { StepStatus } from "../types";

// Configuration des statuts
export const STATUS_CONFIG = {
  TRANSITIONS: {
    "à faire": "en cours",
    "en cours": "réalisé",
    réalisé: "à faire",
  } as Record<StepStatus, StepStatus>,

  COLORS: {
    "à faire": "#9e9e9e",
    "en cours": "#1976d2",
    réalisé: "#2e7d32",
  } as Record<StepStatus, string>,

  LABELS: {
    "à faire": "À faire",
    "en cours": "En cours",
    réalisé: "Terminé",
  } as Record<StepStatus, string>,
};

// Configuration des couleurs spéciales
export const COLORS = {
  ADMIN: "#ff5722",
  ADMIN_HOVER: "#e64a19",
  ADMIN_BACKGROUND: "rgba(255, 87, 34, 0.05)",
  ADMIN_BACKGROUND_HOVER: "rgba(255, 87, 34, 0.1)",

  BACK_ACTION: "#f57c00",
  BACK_ACTION_HOVER: "#ef6c00",

  PRIMARY_BACKGROUND: "rgba(25, 118, 210, 0.08)",

  BORDER_INDICATOR: {
    WIDTH: 4,
    RADIUS: "0 2px 2px 0",
  },
};

// Configuration des dimensions
export const DIMENSIONS = {
  SIDEBAR: {
    COLLAPSED: 70,
    EXPANDED: 320,
  },

  CHIP: {
    SMALL: {
      HEIGHT: 20,
      MIN_WIDTH: 60,
      FONT_SIZE: "0.65rem",
    },
    MEDIUM: {
      HEIGHT: 24,
      MIN_WIDTH: 70,
      FONT_SIZE: "0.75rem",
    },
  },

  BADGE: {
    MIN_WIDTH: 16,
    HEIGHT: 16,
    FONT_SIZE: "0.7rem",
  },

  ICON: {
    MIN_WIDTH: 40,
    SMALL: 32,
  },
};

// Routes et vues
export const ROUTES = {
  EVALUATION: {
    SELECTION: "/evaluation?view=selection",
    SYNTHESE: "/evaluation?view=synthese",
    POSTIT: "/evaluation?view=postit",
    ROLEPLAY: "/evaluation?view=roleplay",
  },

  ADMIN: {
    PONDERATION: "/evaluation/admin",
  },
};

export const VIEWS = {
  SELECTION: "selection",
  SYNTHESE: "synthese",
  POSTIT: "postit",
  ROLEPLAY: "roleplay",
} as const;

// Messages et labels
export const LABELS = {
  SIDEBAR: {
    TITLE: "Parcours d'évaluation",
    SUBTITLE: "Suivez votre progression étape par étape",
  },

  PHASES: {
    SELECTION: {
      LABEL: "Sélection",
      DESCRIPTION: "Entreprise & appel",
    },
    EVALUATION: {
      LABEL: "Évaluation",
      DESCRIPTION: "Analyse des passages",
    },
    COACHING: {
      LABEL: "Coaching",
      DESCRIPTION: "Jeu de rôle & simulation",
    },
    SUIVI: {
      LABEL: "Suivi",
      DESCRIPTION: "Progression & amélioration",
    },
    FEEDBACK: {
      LABEL: "Feedback",
      DESCRIPTION: "Retours & évaluation",
    },
    ADMIN: {
      LABEL: "Administration",
      DESCRIPTION: "Configuration système",
    },
  },

  SUB_STEPS: {
    SELECTION_ENTREPRISE: "Sélection entreprise & appel",
    SYNTHESE_GENERALE: "Synthèse générale",
    PASSAGE_SELECTIONNE: "Passage sélectionné",
    RETOUR_SYNTHESE: "← Retour à la synthèse",
    PASSAGES_TRAVAILLER: "Passages à travailler",
    JEU_DE_ROLE: "Jeu de rôle",
    PONDERATION_CRITERES: "Pondération des critères",
  },

  NAVIGATION: {
    QUICK_NAV: "Navigation rapide :",
    ADMIN_SECTION: "Administration",
  },

  STATS: {
    PASSAGES: "passages",
    A_TRAITER: "à traiter",
  },
};

// Configuration des animations
export const ANIMATIONS = {
  SIDEBAR_TRANSITION: "all 0.3s ease-in-out",
  HOVER_TRANSITION: "all 0.2s",
  EXPAND_TRANSITION: "transform 0.2s",
  CHIP_HOVER: "all 0.2s ease",

  TIMINGS: {
    COLLAPSE: "auto",
  },
};

// Breakpoints et responsive
export const BREAKPOINTS = {
  MOBILE: "sm",
  TABLET: "md",
  DESKTOP: "lg",
};

// Configuration des tooltips
export const TOOLTIP_CONFIG = {
  PLACEMENT: "right" as const,
  DELAY: 300,
};

// Box shadows
export const SHADOWS = {
  SIDEBAR: "2px 0 8px rgba(0,0,0,0.1)",
  CHIP: "0 2px 4px rgba(0,0,0,0.1)",
  HOVER: "0 4px 8px rgba(0,0,0,0.15)",
};
