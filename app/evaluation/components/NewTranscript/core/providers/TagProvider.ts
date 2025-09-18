// app/evaluation/components/NewTranscript/core/providers/TagProvider.ts
// VERSION CORRIGÉE - Sans refresh automatique pour éviter double fetch

import {
  EventProvider,
  TemporalEvent,
  ProviderConfig,
  TimelineLayerConfig,
} from "../../types";
import { END_EPS } from "../utils/time";
// Types locaux pour éviter les erreurs d'import
interface TaggedTurn {
  id: string;
  call_id: string;
  start_time: number;
  end_time: number;
  tag: string;
  verbatim?: string;
  next_turn_verbatim?: string;
  next_turn_tag?: string;
  speaker?: string;
  color?: string;
  annotations?: any[];
}

interface NewTag {
  call_id: string;
  start_time: number;
  end_time: number;
  tag: string;
  verbatim?: string;
  next_turn_verbatim?: string;
  next_turn_tag?: string;
  speaker?: string;
}

interface Tag {
  id: string;
  label?: string;
  tag?: string;
  color?: string;
  family?: string;
  originespeaker?: string;
  description?: string;
  icon?: string;
}

type TagProviderDeps = {
  // Données depuis TaggingDataContext (lecture seule)
  getTaggedTurns: (callId: string) => TaggedTurn[];
  getTags: () => Tag[];

  // CRUD operations depuis TaggingDataContext
  createTag?: (tag: NewTag) => Promise<TaggedTurn | null>;
  updateTag?: (id: number, updates: Partial<NewTag>) => Promise<void>;
  deleteTag?: (id: number) => Promise<void>;

  // SUPPRIMÉ: refreshTags pour éviter double fetch
  // refreshTags?: (callId: string) => Promise<void>;
};

export class TagProvider implements EventProvider {
  type = "tag";
  name = "Tags LPL (Réel)";

  constructor(private deps: TagProviderDeps) {}

  // ---------- EventProvider API

  async fetchEvents(callId: string): Promise<TemporalEvent[]> {
    try {
      console.log(`TagProvider: Lecture événements pour appel ${callId}`);

      // ✅ CORRECTION : Récupérer les données AVANT de les utiliser dans console.log
      const taggedTurns = this.deps.getTaggedTurns(callId);
      const tags = this.deps.getTags();

      // MAINTENANT on peut faire le debug avec les données disponibles
      console.log(
        `🔍 TaggedTurns reçus:`,
        taggedTurns.map((turn) => ({
          id: turn.id,
          tag: turn.tag,
          start_time: turn.start_time,
        }))
      );

      console.log(`TagProvider: ${taggedTurns.length} tagged turns trouvés`);
      console.log(
        `TagProvider: ${tags.length} définitions de tags disponibles`
      );

      if (taggedTurns.length === 0) {
        console.log(`TagProvider: Aucun tag trouvé pour l'appel ${callId}`);
        return [];
      }

      // Convertir en TemporalEvent[] - maintenant 'tags' est défini
      const events = taggedTurns.map((turn) =>
        this.taggedTurnToEvent(turn, tags)
      );

      console.log(
        `TagProvider: ${events.length} événements temporels créés:`,
        events.map((e) => ({
          id: e.id,
          tag: e.data.tag,
          startTime: e.startTime,
          color: e.metadata.color,
        }))
      );

      return events;
    } catch (error) {
      console.error("TagProvider.fetchEvents erreur:", error);
      return [];
    }
  }

  async createEvent(event: Partial<TemporalEvent>): Promise<TemporalEvent> {
    if (!this.deps.createTag) {
      throw new Error("createTag non fourni");
    }

    if (!event.startTime || !event.data) {
      throw new Error("startTime et data requis pour création tag");
    }

    // Construire le NewTag depuis l'événement
    const newTag: NewTag = {
      call_id: event.data.call_id || "",
      start_time: event.startTime,
      end_time: event.endTime || event.startTime + 1,
      tag: event.data.tag || "",
      verbatim: event.data.verbatim || "",
      next_turn_verbatim: event.data.next_turn_verbatim || "",
      speaker: event.metadata?.speaker || event.data.speaker || "unknown",
      next_turn_tag: event.data.next_turn_tag || "",
    };

    console.log(`TagProvider: Création nouveau tag:`, newTag);

    const created = await this.deps.createTag(newTag);
    if (!created) {
      throw new Error("Échec création tag");
    }

    // Le TaggingDataContext se charge de mettre à jour son état
    // Pas besoin de refresh explicite ici

    // Convertir le TaggedTurn créé en TemporalEvent
    const tags = this.deps.getTags();
    return this.taggedTurnToEvent(created, tags);
  }

  async updateEvent(
    id: string,
    updates: Partial<TemporalEvent>
  ): Promise<void> {
    if (!this.deps.updateTag) {
      throw new Error("updateTag non fourni");
    }

    const tagId = Number(id);
    if (Number.isNaN(tagId)) {
      throw new Error(`ID tag invalide: ${id}`);
    }

    // Construire les updates depuis l'événement
    const tagUpdates: Partial<NewTag> = {};

    if (updates.startTime !== undefined)
      tagUpdates.start_time = updates.startTime;
    if (updates.endTime !== undefined) tagUpdates.end_time = updates.endTime;
    if (updates.data?.tag !== undefined) tagUpdates.tag = updates.data.tag;
    if (updates.data?.verbatim !== undefined)
      tagUpdates.verbatim = updates.data.verbatim;
    if (updates.data?.next_turn_verbatim !== undefined)
      tagUpdates.next_turn_verbatim = updates.data.next_turn_verbatim;
    if (updates.metadata?.speaker !== undefined)
      tagUpdates.speaker = updates.metadata.speaker;

    console.log(`TagProvider: Mise à jour tag ${tagId}:`, tagUpdates);

    await this.deps.updateTag(tagId, tagUpdates);

    // Le TaggingDataContext se charge de mettre à jour son état
  }

  async deleteEvent(id: string): Promise<void> {
    if (!this.deps.deleteTag) {
      throw new Error("deleteTag non fourni");
    }

    const tagId = Number(id);
    if (Number.isNaN(tagId)) {
      throw new Error(`ID tag invalide: ${id}`);
    }

    console.log(`TagProvider: Suppression tag ${tagId}`);

    await this.deps.deleteTag(tagId);

    // Le TaggingDataContext se charge de mettre à jour son état
  }

  getConfig(): ProviderConfig {
    return {
      name: "Tags LPL (Réel)",
      description:
        "Gestion des tags réels depuis TaggingDataContext + Supabase",
      version: "2.1.0", // Version corrigée
      capabilities: [
        "create",
        "read",
        "update",
        "delete",
        "timeline-display",
        "transcript-overlay",
        "context-sync", // Nouvelle capacité: sync avec contexte
      ],
    };
  }

  getTimelineConfig(): TimelineLayerConfig {
    return {
      layer: "tags-real",
      height: 28,
      color: "dynamic", // Couleur depuis lpltag
      shape: "rectangle",
      showLabel: true,
      interactive: true,
    };
  }

  // ---------- Utils privées

  private taggedTurnToEvent = (
    turn: TaggedTurn,
    tags: Tag[]
  ): TemporalEvent => {
    const tagDef = tags.find((t) => t.label === turn.tag);
    const color = turn.color || tagDef?.color || "#2196f3";

    // 👇 NEW: calcule un start "au bord" de fin de tour
    const anchoredStart = Math.max(
      (turn.end_time ?? turn.start_time) - END_EPS,
      turn.start_time
    );

    return {
      id: String(turn.id),
      type: "tag",
      // 👇 NEW: on affiche le tag comme un "point" ancré à la fin du tour
      startTime: anchoredStart,
      endTime: undefined, // 👈 NEW: point sans durée côté rendu
      data: {
        tag: turn.tag,
        verbatim: turn.verbatim,
        speaker: turn.speaker,
        call_id: turn.call_id,
        annotations: turn.annotations || [],
        originalTaggedTurn: turn, // on garde la ligne brute en référence
      },
      metadata: {
        color,
        priority: 1,
        category: turn.tag, // Affichage = tag du tour courant uniquement
        speaker: turn.speaker,
        scope: "turnEnd", // 👈 NEW: utile si tu veux filtrer au rendu
        interactive: true,
        ...(tagDef?.family && { family: tagDef.family }),
        ...(tagDef?.originespeaker && {
          originespeaker: tagDef.originespeaker,
        }),
        ...(tagDef?.description && { description: tagDef.description }),
        ...(tagDef?.icon && { icon: tagDef.icon }),
      },
    };
  };
}

// ---------- Factory pour créer le TagProvider réel - VERSION CORRIGÉE

export const createRealTagProvider = (
  // Récupération des données depuis TaggingDataContext
  getTaggedTurns: (callId: string) => TaggedTurn[],
  getTags: () => Tag[],

  // CRUD operations
  createTag?: (tag: NewTag) => Promise<TaggedTurn | null>,
  updateTag?: (id: number, updates: Partial<NewTag>) => Promise<void>,
  deleteTag?: (id: number) => Promise<void>

  // SUPPRIMÉ: refreshTags pour éviter double fetch
  // refreshTags?: (callId: string) => Promise<void>
): TagProvider => {
  const deps: TagProviderDeps = {
    getTaggedTurns: (callId: string) => {
      const turns = getTaggedTurns(callId);
      console.log(
        `createRealTagProvider: ${turns.length} turns récupérés pour appel ${callId}`
      );
      return turns;
    },

    getTags: () => {
      const tags = getTags();
      console.log(
        `createRealTagProvider: ${tags.length} définitions de tags récupérées`
      );
      return tags;
    },

    createTag,
    updateTag,
    deleteTag,

    // SUPPRIMÉ: refreshTags
  };

  console.log(
    "createRealTagProvider: TagProvider créé sans refresh automatique"
  );

  return new TagProvider(deps);
};

// ---------- Hook pour utiliser le TagProvider réel dans NewTranscript

export const useRealTagProvider = (callId: string) => {
  console.log(`useRealTagProvider: Préparation pour appel ${callId}`);

  return {
    createProvider: createRealTagProvider,
    isReady: !!callId && callId !== "undefined" && callId !== "null",
  };
};
