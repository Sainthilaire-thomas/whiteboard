// app/evaluation/components/NewTranscript/components/Timeline/hooks/useTimelineSync.ts

import { useMemo } from "react";
import { TemporalEvent } from "../../../types";

interface TimelineSyncResult {
  activeEvents: TemporalEvent[];
  nextEvent: TemporalEvent | null;
  previousEvent: TemporalEvent | null;
  hasActiveEvents: boolean;
  timeUntilNext: number | null;
  timeSincePrevious: number | null;
  progressToNext: number;
  currentEventIndex: number;
}

/**
 * Hook pour synchroniser la timeline avec la lecture audio
 * Détermine quels événements sont actifs, suivants, précédents
 */
export function useTimelineSync(
  events: TemporalEvent[],
  currentTime: number
): TimelineSyncResult {
  return useMemo(() => {
    if (events.length === 0) {
      return {
        activeEvents: [],
        nextEvent: null,
        previousEvent: null,
        hasActiveEvents: false,
        timeUntilNext: null,
        timeSincePrevious: null,
        progressToNext: 0,
        currentEventIndex: -1,
      };
    }

    // Trier les événements par temps de début
    const sortedEvents = [...events].sort((a, b) => a.startTime - b.startTime);

    // Trouver les événements actifs au temps actuel
    const activeEvents = sortedEvents.filter((event) => {
      const endTime = event.endTime || event.startTime + 1; // 1 seconde par défaut
      return event.startTime <= currentTime && endTime >= currentTime;
    });

    // Trouver le prochain événement
    const futureEvents = sortedEvents.filter(
      (event) => event.startTime > currentTime
    );
    const nextEvent = futureEvents.length > 0 ? futureEvents[0] : null;

    // Trouver l'événement précédent
    const pastEvents = sortedEvents.filter(
      (event) => event.startTime <= currentTime
    );
    const previousEvent =
      pastEvents.length > 0 ? pastEvents[pastEvents.length - 1] : null;

    // Calculer les temps relatifs
    const timeUntilNext = nextEvent ? nextEvent.startTime - currentTime : null;
    const timeSincePrevious = previousEvent
      ? currentTime - previousEvent.startTime
      : null;

    // Calculer la progression vers le prochain événement
    let progressToNext = 0;
    if (previousEvent && nextEvent) {
      const totalGap = nextEvent.startTime - previousEvent.startTime;
      const elapsed = currentTime - previousEvent.startTime;
      progressToNext = totalGap > 0 ? Math.min(elapsed / totalGap, 1) : 0;
    }

    // Index de l'événement actuel (ou le plus proche)
    const currentEventIndex = previousEvent
      ? sortedEvents.findIndex((e) => e.id === previousEvent.id)
      : -1;

    return {
      activeEvents,
      nextEvent,
      previousEvent,
      hasActiveEvents: activeEvents.length > 0,
      timeUntilNext,
      timeSincePrevious,
      progressToNext,
      currentEventIndex,
    };
  }, [events, currentTime]);
}

/**
 * Hook pour obtenir les événements dans une plage temporelle
 */
export function useEventsInRange(
  events: TemporalEvent[],
  startTime: number,
  endTime: number
): TemporalEvent[] {
  return useMemo(() => {
    return events.filter((event) => {
      const eventEnd = event.endTime || event.startTime + 1;
      // Chevauchement: pas (eventEnd <= startTime || event.startTime >= endTime)
      return !(eventEnd <= startTime || event.startTime >= endTime);
    });
  }, [events, startTime, endTime]);
}

/**
 * Hook pour calculer des statistiques sur les événements
 */
export function useEventStats(events: TemporalEvent[]) {
  return useMemo(() => {
    if (events.length === 0) {
      return {
        total: 0,
        byType: {},
        duration: 0,
        firstEventTime: 0,
        lastEventTime: 0,
        averageGap: 0,
      };
    }

    const sortedByTime = [...events].sort((a, b) => a.startTime - b.startTime);
    const byType = events.reduce(
      (acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const firstEventTime = sortedByTime[0].startTime;
    const lastEvent = sortedByTime[sortedByTime.length - 1];
    const lastEventTime = lastEvent.endTime || lastEvent.startTime;
    const duration = lastEventTime - firstEventTime;

    // Calculer l'écart moyen entre événements
    let totalGaps = 0;
    for (let i = 1; i < sortedByTime.length; i++) {
      totalGaps += sortedByTime[i].startTime - sortedByTime[i - 1].startTime;
    }
    const averageGap =
      sortedByTime.length > 1 ? totalGaps / (sortedByTime.length - 1) : 0;

    return {
      total: events.length,
      byType,
      duration,
      firstEventTime,
      lastEventTime,
      averageGap,
    };
  }, [events]);
}

/**
 * Hook pour détecter des clusters d'événements (zones denses)
 */
export function useEventClusters(
  events: TemporalEvent[],
  clusterThreshold: number = 30 // secondes
) {
  return useMemo(() => {
    if (events.length === 0) return [];

    const sortedEvents = [...events].sort((a, b) => a.startTime - b.startTime);
    const clusters: Array<{
      startTime: number;
      endTime: number;
      events: TemporalEvent[];
      density: number;
    }> = [];

    let currentCluster: TemporalEvent[] = [sortedEvents[0]];
    let clusterStart = sortedEvents[0].startTime;

    for (let i = 1; i < sortedEvents.length; i++) {
      const event = sortedEvents[i];
      const gap = event.startTime - sortedEvents[i - 1].startTime;

      if (gap <= clusterThreshold) {
        // Ajouter à l'amas actuel
        currentCluster.push(event);
      } else {
        // Finaliser l'amas actuel s'il a plus d'un événement
        if (currentCluster.length > 1) {
          const clusterEnd = Math.max(
            ...currentCluster.map((e) => e.endTime || e.startTime)
          );
          const duration = clusterEnd - clusterStart;
          clusters.push({
            startTime: clusterStart,
            endTime: clusterEnd,
            events: [...currentCluster],
            density: currentCluster.length / Math.max(duration, 1),
          });
        }

        // Commencer un nouvel amas
        currentCluster = [event];
        clusterStart = event.startTime;
      }
    }

    // Finaliser le dernier amas
    if (currentCluster.length > 1) {
      const clusterEnd = Math.max(
        ...currentCluster.map((e) => e.endTime || e.startTime)
      );
      const duration = clusterEnd - clusterStart;
      clusters.push({
        startTime: clusterStart,
        endTime: clusterEnd,
        events: [...currentCluster],
        density: currentCluster.length / Math.max(duration, 1),
      });
    }

    return clusters.sort((a, b) => b.density - a.density); // Trier par densité décroissante
  }, [events, clusterThreshold]);
}
