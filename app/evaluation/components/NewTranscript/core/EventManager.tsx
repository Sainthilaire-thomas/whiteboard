// app/evaluation/components/NewTranscript/core/EventManager.tsx

import { useState, useCallback, useEffect } from "react";
import { TemporalEvent, EventProvider, TranscriptConfig } from "../types";

export class EventManager {
  private providers: Map<string, EventProvider> = new Map();
  private events: TemporalEvent[] = [];
  private listeners: Set<(events: TemporalEvent[]) => void> = new Set();

  constructor(private callId: string) {}

  registerProvider(provider: EventProvider): void {
    this.providers.set(provider.type, provider);
    console.log(`✅ Provider registered: ${provider.name} (${provider.type})`);
  }

  unregisterProvider(type: string): void {
    this.providers.delete(type);
    this.events = this.events.filter((event) => event.type !== type);
    this.notifyListeners();
  }

  async loadEvents(): Promise<TemporalEvent[]> {
    try {
      console.log(`🔄 Loading events for call ${this.callId}...`);

      const eventPromises = Array.from(this.providers.values()).map(
        async (provider) => {
          try {
            const events = await provider.fetchEvents(this.callId);
            console.log(`✅ ${provider.name}: ${events.length} events loaded`);
            return events;
          } catch (error) {
            console.error(
              `❌ Error loading events from ${provider.name}:`,
              error
            );
            return [];
          }
        }
      );

      const eventArrays = await Promise.all(eventPromises);
      this.events = eventArrays
        .flat()
        .sort((a, b) => a.startTime - b.startTime);

      console.log(`✅ Total events loaded: ${this.events.length}`);
      this.notifyListeners();
      return this.events;
    } catch (error) {
      console.error("❌ Error loading events:", error);
      throw error;
    }
  }

  getEvents(): TemporalEvent[] {
    return [...this.events];
  }

  getEventsInRange(startTime: number, endTime: number): TemporalEvent[] {
    return this.events.filter((event) => {
      const eventEnd = event.endTime || event.startTime;
      return event.startTime <= endTime && eventEnd >= startTime;
    });
  }

  getEventsAtTime(time: number): TemporalEvent[] {
    return this.events.filter((event) => {
      const eventEnd = event.endTime || event.startTime + 1; // 1 seconde par défaut si pas d'endTime
      return event.startTime <= time && eventEnd >= time;
    });
  }

  getEventsByType(type: string): TemporalEvent[] {
    return this.events.filter((event) => event.type === type);
  }

  getEventsByCategory(category: string): TemporalEvent[] {
    return this.events.filter((event) => event.metadata.category === category);
  }

  async createEvent(
    event: Partial<TemporalEvent>
  ): Promise<TemporalEvent | null> {
    if (!event.type) {
      console.error("❌ Cannot create event without type");
      return null;
    }

    const provider = this.providers.get(event.type);
    if (!provider) {
      console.error(`❌ No provider registered for type: ${event.type}`);
      return null;
    }

    try {
      const newEvent = await provider.createEvent(event);
      this.events.push(newEvent);
      this.events.sort((a, b) => a.startTime - b.startTime);
      this.notifyListeners();
      return newEvent;
    } catch (error) {
      console.error(`❌ Error creating event with ${provider.name}:`, error);
      return null;
    }
  }

  async updateEvent(
    id: string,
    updates: Partial<TemporalEvent>
  ): Promise<boolean> {
    const eventIndex = this.events.findIndex((e) => e.id === id);
    if (eventIndex === -1) {
      console.error(`❌ Event not found: ${id}`);
      return false;
    }

    const event = this.events[eventIndex];
    const provider = this.providers.get(event.type);
    if (!provider) {
      console.error(`❌ No provider registered for type: ${event.type}`);
      return false;
    }

    try {
      await provider.updateEvent(id, updates);

      // Mise à jour locale
      this.events[eventIndex] = {
        ...event,
        ...updates,
        id: event.id, // Préserver l'ID
        type: event.type, // Préserver le type
      };

      this.events.sort((a, b) => a.startTime - b.startTime);
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error(`❌ Error updating event with ${provider.name}:`, error);
      return false;
    }
  }

  async deleteEvent(id: string): Promise<boolean> {
    const eventIndex = this.events.findIndex((e) => e.id === id);
    if (eventIndex === -1) {
      console.error(`❌ Event not found: ${id}`);
      return false;
    }

    const event = this.events[eventIndex];
    const provider = this.providers.get(event.type);
    if (!provider) {
      console.error(`❌ No provider registered for type: ${event.type}`);
      return false;
    }

    try {
      await provider.deleteEvent(id);
      this.events.splice(eventIndex, 1);
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error(`❌ Error deleting event with ${provider.name}:`, error);
      return false;
    }
  }

  subscribe(callback: (events: TemporalEvent[]) => void): () => void {
    this.listeners.add(callback);

    // Retourne une fonction de désabonnement
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((callback) => {
      try {
        callback([...this.events]);
      } catch (error) {
        console.error("❌ Error in event listener:", error);
      }
    });
  }

  getTimelineConfig(): Map<string, any> {
    const config = new Map();

    this.providers.forEach((provider, type) => {
      try {
        config.set(type, provider.getTimelineConfig());
      } catch (error) {
        console.error(
          `❌ Error getting timeline config from ${provider.name}:`,
          error
        );
      }
    });

    return config;
  }

  destroy(): void {
    this.providers.clear();
    this.events = [];
  }
}

// Hook pour utiliser EventManager
export const useEventManager = (callId: string, config: TranscriptConfig) => {
  const [eventManager] = useState(() => new EventManager(callId));
  const [events, setEvents] = useState<TemporalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Enregistrer les providers basés sur la configuration
  useEffect(() => {
    const registerProviders = async () => {
      try {
        // Nettoyer les providers existants
        eventManager.destroy();

        // Réenregistrer les providers actifs
        config.eventTypes.forEach((eventType) => {
          if (eventType.enabled) {
            // TODO: Créer une factory de providers
            // const provider = createProvider(eventType.type, eventType);
            // eventManager.registerProvider(provider);
          }
        });
      } catch (err) {
        console.error("❌ Error registering providers:", err);
        setError(err as Error);
      }
    };

    registerProviders();
  }, [eventManager, config.eventTypes]);

  // Charger les événements
  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const loadedEvents = await eventManager.loadEvents();
      setEvents(loadedEvents);
    } catch (err) {
      console.error("❌ Error loading events:", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [eventManager]);

  // S'abonner aux changements d'événements
  useEffect(() => {
    const unsubscribe = eventManager.subscribe((newEvents) => {
      setEvents(newEvents);
    });

    return unsubscribe;
  }, [eventManager]);

  // Charger les événements au montage
  useEffect(() => {
    if (callId) {
      loadEvents();
    }
  }, [callId, loadEvents]);

  // Méthodes exposées
  const createEvent = useCallback(
    async (event: Partial<TemporalEvent>) => {
      return await eventManager.createEvent(event);
    },
    [eventManager]
  );

  const updateEvent = useCallback(
    async (id: string, updates: Partial<TemporalEvent>) => {
      return await eventManager.updateEvent(id, updates);
    },
    [eventManager]
  );

  const deleteEvent = useCallback(
    async (id: string) => {
      return await eventManager.deleteEvent(id);
    },
    [eventManager]
  );

  const refetch = useCallback(async () => {
    await loadEvents();
  }, [loadEvents]);

  return {
    eventManager,
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    refetch,
  };
};
