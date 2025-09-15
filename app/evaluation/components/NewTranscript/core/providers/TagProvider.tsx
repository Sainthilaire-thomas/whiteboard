// app/evaluation/components/NewTranscript/core/providers/TagProvider.ts
import { useMemo } from "react";
import {
  EventProvider,
  TemporalEvent,
  ProviderConfig,
  TimelineLayerConfig,
} from "../../types";

// Types pour les tags (basés sur TaggingDataContext)
type TaggedTurn = {
  id: string;
  tag: string;
  verbatim: string;
  next_turn_verbatim?: string;
  start_time: number;
  end_time: number;
  speaker: string;
  color?: string;
  category?: string;
};

type TagProviderDeps = {
  // Récupération des tags depuis TaggingDataContext ou API
  getTaggedTurns: (callId: string) => Promise<TaggedTurn[]>;

  // CRUD operations (optionnel)
  createTag?: (tag: Omit<TaggedTurn, "id">) => Promise<TaggedTurn>;
  updateTag?: (id: string, updates: Partial<TaggedTurn>) => Promise<void>;
  deleteTag?: (id: string) => Promise<void>;

  // Configuration couleurs
  getTagColor?: (tag: string) => string;
};

export class TagProvider implements EventProvider {
  type = "tag";
  name = "Tags LPL";

  constructor(private deps: TagProviderDeps) {}

  // ---------- EventProvider API

  async fetchEvents(callId: string): Promise<TemporalEvent[]> {
    try {
      const taggedTurns = await this.deps.getTaggedTurns(callId);

      console.log(
        `🏷️ TagProvider: Loaded ${taggedTurns.length} tags for call ${callId}`
      );

      return taggedTurns.map(this.tagToEvent);
    } catch (error) {
      console.error("❌ TagProvider.fetchEvents:", error);
      return [];
    }
  }

  async createEvent(event: Partial<TemporalEvent>): Promise<TemporalEvent> {
    if (!this.deps.createTag) {
      throw new Error("createTag not provided");
    }

    if (!event.startTime || !event.data) {
      throw new Error("startTime and data required for tag creation");
    }

    const tagData: Omit<TaggedTurn, "id"> = {
      tag: event.data.tag || "",
      verbatim: event.data.verbatim || "",
      next_turn_verbatim: event.data.next_turn_verbatim || "",
      start_time: event.startTime,
      end_time: event.endTime || event.startTime + 1,
      speaker: event.metadata?.speaker || "unknown",
      color: event.metadata?.color,
      category: event.metadata?.category,
    };

    const created = await this.deps.createTag(tagData);
    return this.tagToEvent(created);
  }

  async updateEvent(
    id: string,
    updates: Partial<TemporalEvent>
  ): Promise<void> {
    if (!this.deps.updateTag) {
      throw new Error("updateTag not provided");
    }

    const tagUpdates: Partial<TaggedTurn> = {};

    if (updates.startTime !== undefined)
      tagUpdates.start_time = updates.startTime;
    if (updates.endTime !== undefined) tagUpdates.end_time = updates.endTime;
    if (updates.data?.tag !== undefined) tagUpdates.tag = updates.data.tag;
    if (updates.data?.verbatim !== undefined)
      tagUpdates.verbatim = updates.data.verbatim;
    if (updates.metadata?.speaker !== undefined)
      tagUpdates.speaker = updates.metadata.speaker;
    if (updates.metadata?.color !== undefined)
      tagUpdates.color = updates.metadata.color;

    await this.deps.updateTag(id, tagUpdates);
  }

  async deleteEvent(id: string): Promise<void> {
    if (!this.deps.deleteTag) {
      throw new Error("deleteTag not provided");
    }

    await this.deps.deleteTag(id);
  }

  getConfig(): ProviderConfig {
    return {
      name: "Tags LPL",
      description: "Gestion des tags de classification pour TranscriptLPL",
      version: "1.0.0",
      capabilities: [
        "create",
        "read",
        "update",
        "delete",
        "timeline-display",
        "transcript-overlay",
        "search",
        "filter",
      ],
    };
  }

  getTimelineConfig(): TimelineLayerConfig {
    return {
      layer: "tags",
      height: 24,
      color: "dynamic", // Couleur basée sur le tag
      shape: "rectangle",
      showLabel: true,
      interactive: true,
    };
  }

  // ---------- Utils privées

  private tagToEvent = (tag: TaggedTurn): TemporalEvent => {
    const color =
      this.deps.getTagColor?.(tag.tag) ?? this.getDefaultTagColor(tag.tag);

    return {
      id: tag.id,
      type: "tag",
      startTime: tag.start_time,
      endTime: tag.end_time,
      data: {
        tag: tag.tag,
        verbatim: tag.verbatim,
        next_turn_verbatim: tag.next_turn_verbatim,
        speaker: tag.speaker,
        originalTag: tag,
      },
      metadata: {
        color,
        priority: 1, // Tags prioritaires sur post-its
        category: tag.tag,
        speaker: tag.speaker,
        interactive: true,
      },
    };
  };

  private getDefaultTagColor(tag: string): string {
    // Couleurs par défaut selon le type de tag
    const colorMap: Record<string, string> = {
      // Sentiment
      positif: "#22c55e",
      négatif: "#ef4444",
      neutre: "#6b7280",

      // Sujet
      réclamation: "#dc2626",
      information: "#2563eb",
      vente: "#059669",
      technique: "#7c3aed",

      // Intent
      plainte: "#dc2626",
      question: "#2563eb",
      demande: "#059669",

      // Qualité
      excellent: "#22c55e",
      bon: "#84cc16",
      moyen: "#eab308",
      mauvais: "#ef4444",
    };

    return colorMap[tag.toLowerCase()] ?? "#6b7280"; // Gris par défaut
  }
}

// ---------- Factory pour créer le TagProvider

export const createTagProvider = (
  deps: Partial<TagProviderDeps> = {}
): TagProvider => {
  // Provider avec des données mock pour les tests
  const mockDeps: TagProviderDeps = {
    getTaggedTurns: async (callId: string) => {
      // TODO: Remplacer par vraie intégration TaggingDataContext
      console.log(`🏷️ Mock: Loading tags for call ${callId}`);

      // Tags d'exemple pour demo
      return [
        {
          id: "tag-1",
          tag: "réclamation",
          verbatim: "J'ai un problème avec mon compte",
          start_time: 15,
          end_time: 18,
          speaker: "Client",
          color: "#dc2626",
        },
        {
          id: "tag-2",
          tag: "positif",
          verbatim: "Merci beaucoup pour votre aide",
          start_time: 45,
          end_time: 47,
          speaker: "Client",
          color: "#22c55e",
        },
        {
          id: "tag-3",
          tag: "technique",
          verbatim: "Je vais vérifier les paramètres",
          start_time: 80,
          end_time: 83,
          speaker: "Conseiller",
          color: "#7c3aed",
        },
      ];
    },

    getTagColor: (tag: string) => {
      const colors: Record<string, string> = {
        réclamation: "#dc2626",
        positif: "#22c55e",
        technique: "#7c3aed",
        information: "#2563eb",
      };
      return colors[tag] ?? "#6b7280";
    },

    ...deps, // Override avec les dépendances fournies
  };

  return new TagProvider(mockDeps);
};

// ---------- Hook pour utiliser TagProvider dans NewTranscript

export const useTagProvider = (callId: string) => {
  const tagProvider = useMemo(() => {
    // TODO: Intégrer avec TaggingDataContext
    // const { taggedTurns, addTag, updateTag, deleteTag } = useTaggingData();

    return createTagProvider({
      getTaggedTurns: async (cid: string) => {
        // TODO: Utiliser les vraies données du contexte
        return createTagProvider().fetchEvents(cid) as any;
      },
    });
  }, [callId]);

  return tagProvider;
};
