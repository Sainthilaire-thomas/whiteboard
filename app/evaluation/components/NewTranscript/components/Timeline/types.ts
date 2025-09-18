// app/evaluation/components/NewTranscript/components/Timeline/types.ts

import { TemporalEvent } from "../../types"; // Import depuis les types existants

/**
 * Profil d'affichage de la timeline
 */
export interface TimelineProfile {
  maxRows: number;
  dense: boolean;
  showLabels: boolean;
  showGraduations: boolean;
  eventGap: number;
  minEventWidth: number;
  rowHeight: number;

  // ✅ NOUVEAU : Configuration spécifique au mode impact
  impactSpecific?: {
    showMetrics: boolean;
    showCoherenceIndicators: boolean;
    showImpactWaves: boolean;
    waveOpacity: number;
    coherentWaveColor: string;
    incoherentWaveColor: string;
    neutralWaveColor: string;
  };
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
  id: string;
  name: string;
  color: string;
  icon?: string;
  visible: boolean;
  priority: number;
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

/**
 * Types spécifiques au mode Impact
 */

/**
 * Paire d'événements adjacents conseiller → client
 */
export interface AdjacentPair {
  id: string;
  conseiller: TemporalEvent;
  client: TemporalEvent;
  conseillerStrategy: "positive" | "negative" | "neutral";
  clientReaction: "positive" | "negative" | "neutral";
  isCoherent: boolean;
  timeDelta: number;
}

/**
 * Métriques d'efficacité des interactions
 */
export interface ImpactMetrics {
  totalPairs: number;
  positiveImpacts: number;
  negativeImpacts: number;
  neutralImpacts: number;
  coherentImpacts: number;
  efficiencyRate: number; // Pourcentage d'impacts cohérents
  avgTimeDelta: number;
}

/**
 * Props communes pour les markers Impact
 */
export interface ImpactMarkerBaseProps {
  x: number;
  y: number;
  onClick: (event: TemporalEvent) => void;
  onHover?: (event: TemporalEvent) => void;
  event: TemporalEvent;
}

/**
 * Props spécifiques aux markers conseiller
 */
export interface ConseillerMarkerProps extends ImpactMarkerBaseProps {
  strategy: "positive" | "negative" | "neutral";
}

/**
 * Props spécifiques aux markers client
 */
export interface ClientMarkerProps extends ImpactMarkerBaseProps {
  reaction: "positive" | "negative" | "neutral";
  isCoherent?: boolean;
}

/**
 * Props pour les ondes d'impact
 */
export interface ImpactWaveProps {
  pair: AdjacentPair;
  width: number;
  duration: number;
}

export type ConseillerStrategy = "positive" | "negative" | "neutral";
export type ClientReaction = "positive" | "negative" | "neutral";
export type ImpactLevel = "positive" | "central" | "negative";
