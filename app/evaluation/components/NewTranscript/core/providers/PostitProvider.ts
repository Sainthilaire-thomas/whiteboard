// app/evaluation/components/NewTranscript/core/providers/PostitProvider.ts
import {
  EventProvider,
  TemporalEvent,
  ProviderConfig,
  TimelineLayerConfig,
  LegacyPostit as LegacyPostitFromTypes, // peut avoir word: Word
} from "../../types";

type WordLite = {
  id: number;
  text: string;
  start_time: number;
  end_time: number;
  speaker?: string;
};

// Le provider accepte maintenant *aussi* des post-its simples (word: string)
type SimplePostit = {
  id: number;
  callid: number;
  wordid: number;
  word: string; // 👈 string (CallDataContext)
  text: string;
  sujet: string;
  pratique?: string;
  timestamp: number;
  idsujet?: number | null;
  idpratique?: number | null;
  iddomaine?: number | null;
  idactivite?: number | null;
};

// Tolerate LegacyPostit OR SimplePostit as input
type AnyIncomingPostit = LegacyPostitFromTypes | SimplePostit;

// Forme normalisée interne (word: string)
type NormalizedPostit = SimplePostit;

type Deps = {
  // Données
  getAppelPostits: (callId: string) => Promise<AnyIncomingPostit[]>;

  // Mots (optionnel, pour déduire speaker)
  getWordsForCall?: (callId: string) => Promise<WordLite[]>;

  // CRUD (retours souples: id, postit, etc.)
  createPostit?: (
    p: Omit<SimplePostit, "id">
  ) => Promise<SimplePostit | LegacyPostitFromTypes | number | null>;

  updatePostit?: (id: number, updates: Partial<SimplePostit>) => Promise<void>;

  deletePostit?: (id: number) => Promise<void>;

  // Optionnel: couleurs
  getColorForSujet?: (sujet: string) => string;
};

export class PostitProvider implements EventProvider {
  type = "postit";
  name = "Post-its Évaluation";

  constructor(private deps: Deps) {}

  // ---------- EventProvider API

  async fetchEvents(callId: string): Promise<TemporalEvent[]> {
    try {
      const [incoming, words] = await Promise.all([
        this.deps.getAppelPostits(callId),
        this.deps.getWordsForCall
          ? this.deps.getWordsForCall(callId)
          : Promise.resolve([]),
      ]);

      const normalized = incoming.map(this.normalizePostit);
      return normalized.map((p) =>
        this.postitToEvent(p, this.getSpeakerFromTimestamp(p.timestamp, words))
      );
    } catch (e) {
      console.error("❌ PostitProvider.fetchEvents:", e);
      return [];
    }
  }

  async createEvent(event: Partial<TemporalEvent>): Promise<TemporalEvent> {
    if (!this.deps.createPostit) throw new Error("createPostit non fourni");
    if (event.startTime == null || !event.data) {
      throw new Error("startTime et data requis");
    }

    // On fabrique un SimplePostit minimal
    const payload: Omit<SimplePostit, "id"> = {
      callid: (event.data as any)?.callid ?? 0,
      wordid: event.data.wordid ?? 0,
      word: (event.data as any).word ?? event.data.text ?? "",
      text: event.data.text ?? "",
      sujet: (event.data as any).sujet ?? "Autre",
      pratique: (event.data as any).pratique ?? "",
      timestamp: event.startTime,
      idsujet: (event.data as any).idsujet ?? null,
      idpratique: (event.data as any).idpratique ?? null,
      iddomaine: (event.metadata as any)?.iddomaine ?? null,
      idactivite: (event.metadata as any)?.idactivite ?? null,
    };

    const created = await this.deps.createPostit(payload);

    // Tolérer différents formats de retour
    let createdNormalized: NormalizedPostit | null = null;
    if (created && typeof created === "object") {
      createdNormalized = this.normalizePostit(created as AnyIncomingPostit);
    } else if (typeof created === "number") {
      createdNormalized = { id: created, ...payload } as NormalizedPostit;
    }

    if (!createdNormalized) {
      throw new Error("createPostit a renvoyé une valeur inattendue.");
    }

    return this.postitToEvent(createdNormalized);
  }

  async updateEvent(
    id: string,
    updates: Partial<TemporalEvent>
  ): Promise<void> {
    if (!this.deps.updatePostit) throw new Error("updatePostit non fourni");
    const postitId = Number(id);
    if (Number.isNaN(postitId)) throw new Error(`ID invalide: ${id}`);

    const patch: Partial<SimplePostit> = {};
    if (updates.startTime != null) patch.timestamp = updates.startTime;
    if (updates.data) {
      if (updates.data.text != null) patch.text = updates.data.text;
      if ((updates.data as any).sujet != null)
        patch.sujet = (updates.data as any).sujet;
      if ((updates.data as any).pratique != null)
        patch.pratique = (updates.data as any).pratique;
      if ((updates.data as any).word != null)
        patch.word = (updates.data as any).word;
      if (updates.data.wordid != null) patch.wordid = updates.data.wordid;
    }

    await this.deps.updatePostit(postitId, patch);
  }

  async deleteEvent(id: string): Promise<void> {
    if (!this.deps.deletePostit) throw new Error("deletePostit non fourni");
    const postitId = Number(id);
    if (Number.isNaN(postitId)) throw new Error(`ID invalide: ${id}`);
    await this.deps.deletePostit(postitId);
  }

  getConfig(): ProviderConfig {
    return {
      name: "Post-its Évaluation",
      description: "Gestion des post-its d'évaluation des appels",
      version: "1.0.0",
      capabilities: [
        "create",
        "read",
        "update",
        "delete",
        "timeline-display",
        "transcript-overlay",
      ],
    };
  }

  getTimelineConfig(): TimelineLayerConfig {
    return {
      layer: "postits",
      height: 20,
      color: "dynamic",
      shape: "circle",
      showLabel: false,
      interactive: true,
    };
  }

  // ---------- Utils

  private normalizePostit = (p: AnyIncomingPostit): NormalizedPostit => {
    // Si word est un objet 'Word', en extraire le texte ; sinon c’est déjà une string
    const wordText =
      typeof (p as any).word === "object" && (p as any).word !== null
        ? ((p as any).word.text ?? "")
        : ((p as any).word ?? "");

    return {
      id: Number((p as any).id),
      callid: Number((p as any).callid ?? 0),
      wordid: Number((p as any).wordid ?? 0),
      word: String(wordText),
      text: String((p as any).text ?? ""),
      sujet: String((p as any).sujet ?? "Autre"),
      pratique: (p as any).pratique ?? "",
      timestamp: Number((p as any).timestamp ?? 0),
      idsujet: (p as any).idsujet ?? null,
      idpratique: (p as any).idpratique ?? null,
      iddomaine: (p as any).iddomaine ?? null,
      idactivite: (p as any).idactivite ?? null,
    };
  };

  private postitToEvent(p: NormalizedPostit, speaker?: string): TemporalEvent {
    const color =
      this.deps.getColorForSujet?.(p.sujet) ?? this.fallbackSujetColor(p.sujet);

    return {
      id: String(p.id),
      type: "postit",
      startTime: p.timestamp,
      data: {
        text: p.text,
        sujet: p.sujet,
        pratique: p.pratique,
        word: p.word,
        wordid: p.wordid,
        originalPostit: p as any,
      },
      metadata: {
        color,
        priority: 2,
        category: p.sujet,
        speaker,
        interactive: true,
      },
    };
  }

  private fallbackSujetColor(sujet: string): string {
    const map: Record<string, string> = {
      Accueil: "#4ecdc4",
      Identification: "#4ecdc4",
      Traitement: "#45b7d1",
      Conclusion: "#96ceb4",
      Politesse: "#f7b731",
      Technique: "#5f27cd",
      Commercial: "#00d2d3",
      Autre: "#ff6b6b",
    };
    return map[sujet] ?? "#ff6b6b";
  }

  private getSpeakerFromTimestamp(
    timestamp: number,
    words?: WordLite[]
  ): string | undefined {
    if (!words || !words.length) return undefined;
    let closest = words[0];
    let best = Infinity;
    for (const w of words) {
      const mid = (w.start_time + w.end_time) / 2;
      const d = Math.abs(mid - timestamp);
      if (d < best) {
        best = d;
        closest = w;
      }
    }
    return closest.speaker ?? undefined;
  }
}
