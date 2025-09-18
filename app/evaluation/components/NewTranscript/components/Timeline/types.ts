// app/evaluation/components/NewTranscript/components/Timeline/types.ts

import { TemporalEvent } from "../../types"; // Import depuis les types existants

/**
 * Profil d'affichage de la timeline
 */
export interface TimelineProfile {
  maxRows: number;
  dense: boolean;
  showLabels: boolean;
  minGap?: number;
  pointWidth?: number;
}

/**
 * Couche d'événements sur la timeline
 */
export interface TimelineLayer {
  id: string;
  name: string;
  events: TemporalEvent[];
  height: number;
  color: string;
  visible: boolean;
  interactive: boolean;
  render?: "tag" | "postit" | "default"; // Hint pour le type de rendu
}

/**
 * Métriques de position pour un événement
 */
export interface EventMetrics {
  x: number;
  w: number;
  y: number;
  rowHeight: number;
}

/**
 * Item positionné dans une couche
 */
export interface LayoutItem {
  event: TemporalEvent;
  row: number;
  x: number;
  w: number;
}

/**
 * Résultat du calcul de layout d'une couche
 */
export interface LayerLayout {
  items: LayoutItem[];
  rowsCount: number;
  rowHeight: number;
  rowGap: number;
}

/**
 * Configuration d'événements pour groupement
 */
export interface EventTypeConfig {
  type: string;
  enabled?: boolean;
  visible?: boolean;
  color?: string;
  render?: string;
  height?: number;
}

/**
 * Props pour les composants de marqueurs
 */
export interface MarkerProps {
  event: TemporalEvent;
  metrics: EventMetrics;
  showLabel?: boolean;
  onClick: (event: TemporalEvent) => void;
  onHover?: (event: TemporalEvent) => void;
}

/**
 * Configuration des graduations temporelles
 */
export interface TimeGraduation {
  time: number;
  position: number;
  label: string;
}
