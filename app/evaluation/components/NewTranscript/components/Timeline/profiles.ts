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
    showGraduations: false,
    eventGap: 2, // ← Remplacer minGap par eventGap
    minEventWidth: 8, // ← Remplacer pointWidth par minEventWidth
    rowHeight: 16, // ← Ajouter rowHeight
  },
  compact: {
    maxRows: 1,
    dense: true,
    showLabels: false,
    showGraduations: true,
    eventGap: 4, // ← Remplacer minGap par eventGap
    minEventWidth: 10, // ← Remplacer pointWidth par minEventWidth
    rowHeight: 24, // ← Ajouter rowHeight
  },
  detailed: {
    maxRows: 4,
    dense: false,
    showLabels: true,
    showGraduations: true,
    eventGap: 6, // ← Remplacer minGap par eventGap
    minEventWidth: 14, // ← Remplacer pointWidth par minEventWidth
    rowHeight: 32, // ← Ajouter rowHeight
  },
  expanded: {
    maxRows: 6,
    dense: false,
    showLabels: true,
    showGraduations: true,
    eventGap: 8, // ← Remplacer minGap par eventGap
    minEventWidth: 16, // ← Remplacer pointWidth par minEventWidth
    rowHeight: 36, // ← Ajouter rowHeight
  },
  // Le profil impact reste inchangé car il est correct
  impact: {
    maxRows: 3,
    dense: false,
    showLabels: false,
    showGraduations: true,
    eventGap: 4,
    minEventWidth: 12,
    rowHeight: 40,
    impactSpecific: {
      showMetrics: true,
      showCoherenceIndicators: true,
      showImpactWaves: true,
      waveOpacity: 0.7,
      coherentWaveColor: "#28a745",
      incoherentWaveColor: "#dc3545",
      neutralWaveColor: "#6c757d",
    },
  },
  hidden: {
    maxRows: 0,
    dense: true,
    showLabels: false,
    showGraduations: false,
    eventGap: 0,
    minEventWidth: 0,
    rowHeight: 0,
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
  return profile.minEventWidth || (profile.dense ? 10 : 14); // ← Utiliser minEventWidth au lieu de pointWidth
};
