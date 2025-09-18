// app/evaluation/components/NewTranscript/components/Timeline/utils/turnMetrics.ts

import { TaggedTurn } from "@/context/TaggingDataContext";
import { timeToPosition } from "./time";

export interface TurnMetrics {
  x: number;
  width: number;
  duration: number;
  startTime: number;
  endTime: number;
}

/**
 * Calcule les métriques de position pour un tour de parole
 */
export const calculateTurnMetrics = (
  turn: TaggedTurn,
  duration: number,
  timelineWidth: number
): TurnMetrics => {
  const startTime = turn.start_time;
  const endTime = turn.end_time;
  const turnDuration = endTime - startTime;

  // Calculer les positions X
  const startX = timeToPosition(startTime, duration, timelineWidth);
  const endX = timeToPosition(endTime, duration, timelineWidth);

  // Largeur réelle du tour
  const width = Math.max(endX - startX, 4); // Minimum 4px

  return {
    x: startX,
    width,
    duration: turnDuration,
    startTime,
    endTime,
  };
};

/**
 * Détecte les chevauchements entre tours et calcule les décalages Y nécessaires
 */
export const calculateTurnOverlaps = (
  turns: TaggedTurn[],
  duration: number,
  timelineWidth: number
): Map<string, { yOffset: number; level: number }> => {
  const overlaps = new Map<string, { yOffset: number; level: number }>();

  // Trier les tours par temps de début
  const sortedTurns = [...turns].sort((a, b) => a.start_time - b.start_time);

  // Suivre les niveaux occupés : [endTime, turnId]
  const occupiedLevels: Array<{ endTime: number; turnId: string }> = [];

  sortedTurns.forEach((turn) => {
    // Libérer les niveaux terminés
    const currentTime = turn.start_time;
    occupiedLevels.forEach((level, index) => {
      if (level.endTime <= currentTime) {
        occupiedLevels.splice(index, 1);
      }
    });

    // Trouver le premier niveau libre
    let level = 0;
    while (
      level < occupiedLevels.length &&
      occupiedLevels[level] &&
      occupiedLevels[level].endTime > currentTime
    ) {
      level++;
    }

    // Occuper ce niveau
    if (level < occupiedLevels.length) {
      occupiedLevels[level] = { endTime: turn.end_time, turnId: turn.id };
    } else {
      occupiedLevels.push({ endTime: turn.end_time, turnId: turn.id });
    }

    // Calculer le décalage Y (4px par niveau)
    const yOffset = level * 4;

    overlaps.set(turn.id, { yOffset, level });
  });

  return overlaps;
};

/**
 * Groupe les tours par speaker pour des couleurs cohérentes
 */
export const groupTurnsBySpeaker = (
  turns: TaggedTurn[]
): Map<string, TaggedTurn[]> => {
  const groups = new Map<string, TaggedTurn[]>();

  turns.forEach((turn) => {
    const speaker = turn.speaker || "Inconnu";
    if (!groups.has(speaker)) {
      groups.set(speaker, []);
    }
    groups.get(speaker)!.push(turn);
  });

  return groups;
};

/**
 * Calcule les statistiques d'un ensemble de tours
 */
export const calculateTurnStats = (turns: TaggedTurn[]) => {
  if (turns.length === 0) {
    return {
      totalDuration: 0,
      averageDuration: 0,
      shortestDuration: 0,
      longestDuration: 0,
      totalGaps: 0,
      averageGap: 0,
    };
  }

  const durations = turns.map((turn) => turn.end_time - turn.start_time);
  const sortedTurns = [...turns].sort((a, b) => a.start_time - b.start_time);

  // Calculer les gaps entre tours
  const gaps: number[] = [];
  for (let i = 1; i < sortedTurns.length; i++) {
    const gap = sortedTurns[i].start_time - sortedTurns[i - 1].end_time;
    if (gap > 0) {
      gaps.push(gap);
    }
  }

  return {
    totalDuration: durations.reduce((sum, d) => sum + d, 0),
    averageDuration:
      durations.reduce((sum, d) => sum + d, 0) / durations.length,
    shortestDuration: Math.min(...durations),
    longestDuration: Math.max(...durations),
    totalGaps: gaps.reduce((sum, g) => sum + g, 0),
    averageGap:
      gaps.length > 0 ? gaps.reduce((sum, g) => sum + g, 0) / gaps.length : 0,
  };
};
