// app/evaluation/components/NewTranscript/components/Timeline/hooks/useLayerLayout.ts

import { useMemo } from "react";
import {
  TemporalEvent,
  TimelineProfile,
  LayerLayout,
  LayoutItem,
} from "../types";
import { timeToPosition } from "../utils/time";
import { getRowHeight, getRowGap, getMinEventWidth } from "../profiles";

interface UseLayerLayoutProps {
  events: TemporalEvent[];
  width: number;
  duration: number;
  profile: TimelineProfile;
}

/**
 * Hook pour calculer le layout anti-collision d'une couche d'événements
 * Algorithme greedy : place chaque événement sur la première rangée disponible
 */
export function useLayerLayout({
  events,
  width,
  duration,
  profile,
}: UseLayerLayoutProps): LayerLayout {
  const rowHeight = getRowHeight(profile);
  const rowGap = getRowGap(profile);
  const minGap = profile.minGap || (profile.dense ? 4 : 6);
  const pointWidth = getMinEventWidth(profile);

  return useMemo(() => {
    if (events.length === 0 || duration <= 0 || width <= 0) {
      return { items: [], rowsCount: 1, rowHeight, rowGap };
    }

    // Trier les événements par temps de début
    const sorted = [...events].sort((a, b) => a.startTime - b.startTime);

    // Suivre la position de fin de chaque rangée (en pixels)
    const rowLastEnd: number[] = [];

    const items: LayoutItem[] = sorted.map((event) => {
      // Calculer la position et largeur en pixels
      const startX = timeToPosition(event.startTime, duration, width);
      const endX = event.endTime
        ? timeToPosition(event.endTime, duration, width)
        : startX + pointWidth;
      const eventWidth = Math.max(endX - startX, pointWidth);

      // Trouver la première rangée où l'événement peut être placé
      let targetRow = 0;
      while (
        targetRow < rowLastEnd.length &&
        startX <= rowLastEnd[targetRow] + minGap
      ) {
        targetRow++;
      }

      // Créer une nouvelle rangée si nécessaire
      if (targetRow === rowLastEnd.length) {
        rowLastEnd.push(0);
      }

      // Respecter la limite maxRows (overflow sur la dernière rangée)
      if (targetRow >= profile.maxRows) {
        targetRow = profile.maxRows - 1;
      }

      // Mettre à jour la position de fin de cette rangée
      rowLastEnd[targetRow] = Math.max(
        rowLastEnd[targetRow] || 0,
        startX + eventWidth
      );

      return {
        event,
        row: targetRow,
        x: startX,
        w: eventWidth,
      };
    });

    const rowsCount = Math.min(rowLastEnd.length || 1, profile.maxRows);

    return {
      items,
      rowsCount,
      rowHeight,
      rowGap,
    };
  }, [
    events,
    duration,
    width,
    profile.maxRows,
    minGap,
    pointWidth,
    rowHeight,
    rowGap,
  ]);
}

/**
 * Hook utilitaire pour calculer les métriques d'un événement spécifique
 */
export function useEventMetrics(
  event: TemporalEvent,
  duration: number,
  width: number,
  profile: TimelineProfile
) {
  return useMemo(() => {
    const startX = timeToPosition(event.startTime, duration, width);
    const endX = event.endTime
      ? timeToPosition(event.endTime, duration, width)
      : startX + getMinEventWidth(profile);
    const eventWidth = Math.max(endX - startX, getMinEventWidth(profile));

    return {
      x: startX,
      w: eventWidth,
      isPoint: !event.endTime,
      duration: event.endTime ? event.endTime - event.startTime : 0,
    };
  }, [event, duration, width, profile]);
}

/**
 * Hook pour détecter les chevauchements temporels entre événements
 */
export function useEventOverlaps(events: TemporalEvent[]) {
  return useMemo(() => {
    const overlaps: Map<string, string[]> = new Map();

    events.forEach((event, i) => {
      const eventEnd = event.endTime || event.startTime + 1;
      const overlapping: string[] = [];

      events.forEach((other, j) => {
        if (i === j) return;

        const otherEnd = other.endTime || other.startTime + 1;

        // Vérifier le chevauchement temporel
        const hasOverlap = !(
          eventEnd <= other.startTime || event.startTime >= otherEnd
        );

        if (hasOverlap) {
          overlapping.push(other.id);
        }
      });

      if (overlapping.length > 0) {
        overlaps.set(event.id, overlapping);
      }
    });

    return overlaps;
  }, [events]);
}
