// app/evaluation/components/NewTranscript/components/Timeline/profiles.ts

import { TimelineProfile } from "./types";

/**
 * Profils d'affichage de la timeline selon le mode
 */
export const profiles: Record<string, TimelineProfile> = {
  minimal: {
    maxRows: 1,
    dense: true,
    showLabels: false,
    minGap: 2,
    pointWidth: 8,
  },
  compact: {
    maxRows: 1,
    dense: true,
    showLabels: false,
    minGap: 4,
    pointWidth: 10,
  },
  detailed: {
    maxRows: 4,
    dense: false,
    showLabels: true,
    minGap: 6,
    pointWidth: 14,
  },
  expanded: {
    maxRows: 6,
    dense: false,
    showLabels: true,
    minGap: 8,
    pointWidth: 16,
  },
};

/**
 * Récupère un profil par nom avec fallback
 */
export const getProfile = (mode: string): TimelineProfile => {
  return profiles[mode] ?? profiles.detailed;
};

/**
 * Calcule la hauteur de rangée selon le profil
 */
export const getRowHeight = (profile: TimelineProfile): number => {
  return profile.dense ? 16 : 24;
};

/**
 * Calcule l'espacement entre rangées selon le profil
 */
export const getRowGap = (profile: TimelineProfile): number => {
  return profile.dense ? 2 : 4;
};

/**
 * Calcule la largeur minimale d'un événement selon le profil
 */
export const getMinEventWidth = (profile: TimelineProfile): number => {
  return profile.pointWidth || (profile.dense ? 10 : 14);
};
