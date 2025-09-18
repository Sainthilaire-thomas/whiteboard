import React, { useMemo } from "react";
import { TemporalEvent } from "../../../types";
import { TimelineLayer as TimelineLayerType, EventTypeConfig } from "../types"; // Renommer le type
import { groupEventsByLayer } from "../utils/grouping";

interface LayerStackProps {
  events: TemporalEvent[];
  eventTypes?: EventTypeConfig[];
  children: (layer: TimelineLayerType) => React.ReactNode; // Utiliser le type renommé
}

export function LayerStack({ events, eventTypes, children }: LayerStackProps) {
  const layers = useMemo(() => {
    console.log("LayerStack: Grouping events into layers", {
      eventsCount: events.length,
      eventTypesCount: eventTypes?.length || 0,
    });

    return groupEventsByLayer(events, eventTypes);
  }, [events, eventTypes]);

  console.log("LayerStack: Rendering", layers.length, "layers");

  return <>{layers.map((layer) => children(layer))}</>;
}

export function useEventLayers(
  events: TemporalEvent[],
  eventTypes?: EventTypeConfig[]
) {
  return useMemo(() => {
    return groupEventsByLayer(events, eventTypes);
  }, [events, eventTypes]);
}
