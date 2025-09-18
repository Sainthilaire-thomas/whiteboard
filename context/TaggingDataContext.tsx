"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { supabaseClient } from "@/lib/supabaseClient";

// --- Types exportés pour TagProvider ---
export interface Call {
  callid: string;
  audiourl?: string;
  [key: string]: any;
}

export interface Word {
  id: string;
  transcriptid: string;
  startTime: number;
  endTime: number;
  word: string;
}

export interface Postit {
  id: string;
  callid: string;
  text: string;
}

export interface Tag {
  id: string;
  label?: string;
  tag?: string;
  color?: string;
  family?: string;
  originespeaker?: string;
  description?: string;
  icon?: string;
}

export interface TaggedTurn {
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

export interface NewTag {
  call_id: string;
  start_time: number;
  end_time: number;
  tag: string;
  verbatim?: string;
  next_turn_verbatim?: string;
  next_turn_tag?: string;
  speaker?: string;
}

interface TaggingDataContextType {
  taggingCalls: Call[];
  setTaggingCalls: React.Dispatch<React.SetStateAction<Call[]>>;
  selectedTaggingCall: Call | null;
  selectTaggingCall: (call: Call) => void;
  callId: string | undefined;
  taggingTranscription: Word[];
  fetchTaggingTranscription: (callId: string) => Promise<void>;
  taggingPostits: Postit[];
  audioSrc: string | null;
  setAudioSrc: (src: string | null) => void;
  playerRef: React.RefObject<HTMLAudioElement | null>;
  playAudioAtTimestamp: (timestamp: number) => void;
  updateCurrentWord: (word: Word) => void;
  currentWord: Word | null;
  taggedTurns: TaggedTurn[];
  fetchTaggedTurns: (callId: string) => Promise<void>;
  addTag: (newTag: Partial<TaggedTurn>) => Promise<TaggedTurn | null>;
  deleteTurnTag: (id: string) => Promise<void>;
  tags: Tag[];
  setTags: (tags: Tag[]) => void;
}

const TaggingDataContext = createContext<TaggingDataContextType | undefined>(
  undefined
);

export const useTaggingData = (): TaggingDataContextType => {
  const context = useContext(TaggingDataContext);
  if (!context) {
    throw new Error("useTaggingData must be used within a TaggingDataProvider");
  }
  return context;
};

interface TaggingDataProviderProps {
  children: ReactNode;
}

export const TaggingDataProvider = ({ children }: TaggingDataProviderProps) => {
  const [taggingCalls, setTaggingCalls] = useState<Call[]>([]);
  const [selectedTaggingCall, setSelectedTaggingCall] = useState<Call | null>(
    null
  );
  const [taggingTranscription, setTaggingTranscription] = useState<Word[]>([]);
  const [taggingPostits, setTaggingPostits] = useState<Postit[]>([]);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const playerRef = useRef<HTMLAudioElement | null>(null);

  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [taggedTurns, setTaggedTurns] = useState<TaggedTurn[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const updateCurrentWord = (word: Word) => setCurrentWord(word);

  // SEUL useEffect : charger les définitions de tags (pas les données d'appel)
  useEffect(() => {
    const fetchTags = async () => {
      console.log("🏷️ CONTEXTE: Chargement des définitions de tags...");
      try {
        const { data, error } = await supabaseClient.from("lpltag").select("*");
        if (error) {
          console.error(
            "❌ CONTEXTE: Erreur de récupération des définitions de tags:",
            {
              message: error.message || "Erreur inconnue",
              details: error.details || "Aucun détail",
              code: error.code || "Aucun code",
            }
          );
        } else {
          console.log(
            `✅ CONTEXTE: ${data?.length || 0} définitions de tags chargées`
          );
          setTags(data ?? []);
        }
      } catch (exception) {
        console.error(
          "❌ CONTEXTE: Exception lors du chargement des tags:",
          exception
        );
      }
    };

    fetchTags();
    console.log(
      "🚀 CONTEXTE: TaggingDataProvider initialisé - prêt pour sélection d'appel"
    );
  }, []); // Pas de dépendances, exécuté une seule fois

  // Fonctions de fetch (inchangées mais avec validation)
  const fetchTaggingTranscription = useCallback(async (callId: string) => {
    if (!callId) {
      console.warn(
        "⚠️ CONTEXTE: callId manquant pour fetchTaggingTranscription"
      );
      setTaggingTranscription([]);
      return;
    }

    console.log(`🔄 CONTEXTE: Fetch transcription pour appel ${callId}`);
    const { data: transcriptData, error: transcriptError } =
      await supabaseClient
        .from("transcript")
        .select("transcriptid")
        .eq("callid", callId)
        .single();

    if (transcriptError || !transcriptData?.transcriptid) {
      console.warn("CONTEXTE: Transcript ID introuvable pour l'appel:", callId);
      setTaggingTranscription([]);
      return;
    }

    const { data: wordsData, error: wordsError } = await supabaseClient
      .from("word")
      .select("*")
      .eq("transcriptid", transcriptData.transcriptid)
      .order("startTime", { ascending: true });

    if (wordsError) {
      console.error("CONTEXTE: Erreur de récupération des mots:", wordsError);
      setTaggingTranscription([]);
    } else {
      console.log(`✅ CONTEXTE: ${wordsData?.length || 0} mots chargés`);
      setTaggingTranscription(wordsData ?? []);
    }
  }, []);

  const fetchTaggingPostits = useCallback(async (callId: string) => {
    if (!callId) {
      console.warn("⚠️ CONTEXTE: callId manquant pour fetchTaggingPostits");
      setTaggingPostits([]);
      return;
    }

    console.log(`🔄 CONTEXTE: Fetch post-its pour appel ${callId}`);
    const { data, error } = await supabaseClient
      .from("postit")
      .select("*")
      .eq("callid", callId);

    if (error) {
      console.error("CONTEXTE: Erreur de récupération des post-its:", error);
      setTaggingPostits([]);
    } else {
      console.log(`✅ CONTEXTE: ${data?.length || 0} post-its chargés`);
      setTaggingPostits(data ?? []);
    }
  }, []);

  const fetchTaggedTurns = useCallback(
    async (callId: string) => {
      // VALIDATION STRICTE
      if (!callId || typeof callId !== "string") {
        console.warn(
          `⚠️ CONTEXTE: callId invalide pour fetchTaggedTurns: ${callId}`
        );
        setTaggedTurns([]);
        return;
      }

      console.log(`🏷️ CONTEXTE: Fetch tagged turns pour appel ${callId}`);
      console.log(`🏷️ CONTEXTE: Tags disponibles: ${tags.length}`);

      try {
        const { data: turnsData, error } = await supabaseClient
          .from("turntagged")
          .select(
            `
            id,
            call_id,
            start_time,
            end_time,
            tag,
            verbatim,
            next_turn_verbatim,
            next_turn_tag,
            speaker
          `
          )
          .eq("call_id", callId);

        if (error) {
          console.error(
            "❌ CONTEXTE: Erreur de récupération des tagged turns:",
            {
              message: error.message || "Erreur inconnue",
              details: error.details || "Aucun détail",
              hint: error.hint || "Aucun indice",
              code: error.code || "Aucun code",
              callId: callId,
            }
          );
          setTaggedTurns([]);
          return;
        }

        console.log(
          `🏷️ CONTEXTE: ${turnsData?.length || 0} tagged turns trouvés`
        );

        const enrichedTags = (turnsData ?? []).map((turn) => {
          const matchingTag = tags.find(
            (t) => t.label === turn.tag || t.tag === turn.tag
          );

          return {
            ...turn,
            color: matchingTag?.color ?? "#2196f3",
          };
        });

        console.log(
          `✅ CONTEXTE: ${enrichedTags.length} tagged turns enrichis`
        );
        setTaggedTurns(enrichedTags);
      } catch (error) {
        console.error("❌ CONTEXTE: Exception fetchTaggedTurns:", {
          error,
          callId,
          message: error instanceof Error ? error.message : "Erreur inconnue",
        });
        setTaggedTurns([]);
      }
    },
    [tags]
  );

  // FONCTION CRITIQUE : selectTaggingCall - point d'entrée unique pour charger les données
  const selectTaggingCall = useCallback(
    (call: Call) => {
      console.log(`🎯 CONTEXTE: === SÉLECTION APPEL: ${call.callid} ===`);

      if (!call || !call.callid) {
        console.warn("⚠️ CONTEXTE: Appel invalide:", call);
        return;
      }

      setSelectedTaggingCall(call);

      // CHARGEMENT CONDITIONNEL : seulement si un appel valide est fourni
      console.log(
        `🔄 CONTEXTE: Chargement des données pour appel ${call.callid}`
      );

      Promise.allSettled([
        fetchTaggingTranscription(call.callid),
        fetchTaggingPostits(call.callid),
        fetchTaggedTurns(call.callid),
      ]).then((results) => {
        const successCount = results.filter(
          (r) => r.status === "fulfilled"
        ).length;
        console.log(
          `✅ CONTEXTE: ${successCount}/3 opérations réussies pour ${call.callid}`
        );

        // Log des erreurs sans interrompre l'exécution
        results.forEach((result, index) => {
          if (result.status === "rejected") {
            const operations = ["transcription", "post-its", "tagged turns"];
            console.error(
              `❌ CONTEXTE: Erreur ${operations[index]}:`,
              result.reason
            );
          }
        });
      });

      setAudioSrc(call.audiourl ?? null);
      console.log("🎯 CONTEXTE: === FIN SÉLECTION APPEL ===");
    },
    [fetchTaggingTranscription, fetchTaggingPostits, fetchTaggedTurns]
  );

  // Autres fonctions (inchangées)
  const fetchTaggingCalls = useCallback(async () => {
    const { data, error } = await supabaseClient
      .from("call")
      .select("*")
      .eq("is_tagging_call", true)
      .eq("preparedfortranscript", true);

    if (error) {
      console.error("Erreur lors du fetch des appels:", error);
    } else {
      setTaggingCalls(data ?? []);
    }
  }, []);

  const playAudioAtTimestamp = (timestamp: number) => {
    if (audioSrc && playerRef.current) {
      playerRef.current.currentTime = timestamp;
      playerRef.current.play();
    }
  };

  const addTag = useCallback(
    async (newTag: Partial<TaggedTurn>) => {
      console.log("🏷️ CONTEXTE: Ajout nouveau tag:", newTag);

      const { data, error } = await supabaseClient
        .from("turntagged")
        .insert([newTag])
        .select("*");

      if (error) {
        console.error("❌ CONTEXTE: Erreur ajout tag:", error);
        return null;
      }

      if (data?.length) {
        const matchingTag = tags.find(
          (t) => t.label === data[0].tag || t.tag === data[0].tag
        );
        const enrichedTag = {
          ...data[0],
          color: matchingTag?.color || "#2196f3",
        };

        setTaggedTurns((prev) => [...prev, enrichedTag]);
        console.log("✅ CONTEXTE: Tag ajouté avec succès");
        return enrichedTag;
      }

      return null;
    },
    [tags]
  );

  const deleteTurnTag = useCallback(async (id: string) => {
    console.log(`🗑️ CONTEXTE: Suppression tag: ${id}`);

    const { error } = await supabaseClient
      .from("turntagged")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("❌ CONTEXTE: Erreur suppression tag:", error.message);
    } else {
      setTaggedTurns((prev) => prev.filter((tag) => tag.id !== id));
      console.log("✅ CONTEXTE: Tag supprimé avec succès");
    }
  }, []);

  return (
    <TaggingDataContext.Provider
      value={{
        taggingCalls,
        setTaggingCalls,
        selectedTaggingCall,
        selectTaggingCall, // ← Point d'entrée unique pour charger les données
        callId: selectedTaggingCall?.callid,
        taggingTranscription,
        fetchTaggingTranscription,
        taggingPostits,
        audioSrc,
        setAudioSrc,
        playerRef,
        playAudioAtTimestamp,
        updateCurrentWord,
        currentWord,
        taggedTurns,
        fetchTaggedTurns,
        addTag,
        deleteTurnTag,
        tags,
        setTags,
      }}
    >
      {children}
    </TaggingDataContext.Provider>
  );
};
