// app/evaluation/components/NewTranscript/components/Timeline/utils/grouping.ts

import { TemporalEvent } from "../../types";
import { TimelineLayer, EventTypeConfig } from "../types";

/**
 * Groupe les événements par type en couches timeline
 * Fonction pure et testable
 */
export function groupEventsByLayer(
  events: TemporalEvent[],
  eventTypes?: EventTypeConfig[]
): TimelineLayer[] {
  if (events.length === 0) return [];

  const layers: Record<string, TimelineLayer> = {};

  // Si pas de configuration eventTypes, créer des couches par défaut
  if (!eventTypes || eventTypes.length === 0) {
    console.log("🔍 No eventTypes configured, creating default layers");

    // Grouper par type d'événement
    const eventsByType = events.reduce(
      (acc, event) => {
        if (!acc[event.type]) acc[event.type] = [];
        acc[event.type].push(event);
        return acc;
      },
      {} as Record<string, TemporalEvent[]>
    );

    // Créer une couche pour chaque type
    Object.entries(eventsByType).forEach(([type, typeEvents]) => {
      layers[type] = createDefaultLayer(type, typeEvents);
    });

    return Object.values(layers);
  }

  // Traitement avec eventTypes configurés
  eventTypes.forEach((eventType) => {
    console.log(`🔍 Processing eventType:`, eventType);

    // Skip si désactivé ou invisible
    if (!eventType.enabled || !eventType.visible) {
      console.log(
        `🔍 Skipping disabled/invisible eventType: ${eventType.type}`
      );
      return;
    }

    // Filtrer les événements du type correspondant
    const layerEvents = events.filter((event) => event.type === eventType.type);

    console.log(
      `🔍 Found ${layerEvents.length} events for type ${eventType.type}`
    );

    // Créer la couche si des événements existent
    if (layerEvents.length > 0) {
      layers[eventType.type] = createConfiguredLayer(eventType, layerEvents);
    }
  });

  // Fallback : si aucune couche créée mais qu'il y a des événements
  if (Object.keys(layers).length === 0 && events.length > 0) {
    console.log(
      "🔍 No layers created from config, falling back to auto-detection"
    );

    const eventsByType = events.reduce(
      (acc, event) => {
        if (!acc[event.type]) acc[event.type] = [];
        acc[event.type].push(event);
        return acc;
      },
      {} as Record<string, TemporalEvent[]>
    );

    Object.entries(eventsByType).forEach(([type, typeEvents]) => {
      layers[type] = createDefaultLayer(type, typeEvents);
    });
  }

  const result = Object.values(layers);
  console.log("🔍 groupEventsByLayer - Output:", result);
  return result;
}

/**
 * Crée une couche par défaut pour un type d'événement
 */
function createDefaultLayer(
  type: string,
  events: TemporalEvent[]
): TimelineLayer {
  const defaultColors: Record<string, string> = {
    tag: "#2196f3",
    postit: "#ff6b6b",
    annotation: "#4caf50",
    selection: "#ff9800",
  };

  return {
    id: type,
    name: type.charAt(0).toUpperCase() + type.slice(1) + "s",
    events,
    height: type === "postit" ? 24 : 20,
    color: defaultColors[type] || "#6b7280",
    visible: true,
    interactive: true,
    render: type as any, // Cast pour compatibilité
  };
}

/**
 * Crée une couche configurée selon eventType
 */
function createConfiguredLayer(
  eventType: EventTypeConfig,
  events: TemporalEvent[]
): TimelineLayer {
  return {
    id: eventType.type,
    name:
      eventType.type.charAt(0).toUpperCase() + eventType.type.slice(1) + "s",
    events,
    height: eventType.height || (eventType.type === "postit" ? 24 : 20),
    color: eventType.color || "#2196f3",
    visible: true,
    interactive: true,
    render: eventType.render as any,
  };
}

/**
 * Filtre les couches visibles
 */
export function getVisibleLayers(layers: TimelineLayer[]): TimelineLayer[] {
  return layers.filter((layer) => layer.visible && layer.events.length > 0);
}

/**
 * Calcule la hauteur totale nécessaire pour les couches
 */
export function calculateTotalLayersHeight(layers: TimelineLayer[]): number {
  return layers.reduce((total, layer) => {
    if (!layer.visible) return total;
    return total + layer.height + 8; // +8 pour margin bottom
  }, 0);
}
