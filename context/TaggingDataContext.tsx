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

// --- Types ---
interface Call {
  callid: string;
  audiourl?: string;
  [key: string]: any;
}

interface Word {
  id: string;
  transcriptid: string;
  startTime: number;
  endTime: number;
  word: string;
}

interface Postit {
  id: string;
  callid: string;
  text: string;
}

interface Tag {
  id: string;
  tag: string;
  color?: string;
}

interface TaggedTurn {
  id: string;
  call_id: string;
  start_time: number;
  end_time: number;
  tag: string;
  next_turn_verbatim?: string;
  color?: string;
}

interface TaggingDataContextType {
  taggingCalls: Call[];
  setTaggingCalls: React.Dispatch<React.SetStateAction<Call[]>>; // ✅ Ajouté
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

  useEffect(() => {
    const fetchTags = async () => {
      const { data, error } = await supabaseClient.from("lpltag").select("*");
      if (error) {
        console.error("Erreur de récupération des tags:", error.message);
      } else {
        setTags(data ?? []);
      }
    };
    fetchTags();
  }, []);

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

  const fetchTaggingTranscription = useCallback(async (callId: string) => {
    const { data: transcriptData, error: transcriptError } =
      await supabaseClient
        .from("transcript")
        .select("transcriptid")
        .eq("callid", callId)
        .single();

    if (transcriptError || !transcriptData?.transcriptid) {
      console.warn("Transcript ID introuvable pour l'appel:", callId);
      setTaggingTranscription([]);
      return;
    }

    const { data: wordsData, error: wordsError } = await supabaseClient
      .from("word")
      .select("*")
      .eq("transcriptid", transcriptData.transcriptid)
      .order("startTime", { ascending: true });

    if (wordsError) {
      console.error("Erreur de récupération des mots:", wordsError);
    } else {
      setTaggingTranscription(wordsData ?? []);
    }
  }, []);

  const fetchTaggingPostits = useCallback(async (callId: string) => {
    const { data, error } = await supabaseClient
      .from("postit")
      .select("*")
      .eq("callid", callId);
    if (error) {
      console.error("Erreur de récupération des post-its:", error);
    } else {
      setTaggingPostits(data ?? []);
    }
  }, []);

  const selectTaggingCall = useCallback(
    (call: Call) => {
      setSelectedTaggingCall(call);
      if (call.callid) {
        fetchTaggingTranscription(call.callid);
        fetchTaggingPostits(call.callid);
        setAudioSrc(call.audiourl ?? null);
      }
    },
    [fetchTaggingTranscription, fetchTaggingPostits]
  );

  const playAudioAtTimestamp = (timestamp: number) => {
    if (audioSrc && playerRef.current) {
      playerRef.current.currentTime = timestamp;
      playerRef.current.play();
    }
  };

  const fetchTaggedTurns = useCallback(
    async (callId: string) => {
      const { data: turnsData, error } = await supabaseClient
        .from("turntagged")
        .select(
          `
        id,
        call_id,
        start_time,
        end_time,
        tag,
        next_turn_verbatim
      `
        )
        .eq("call_id", callId);

      if (error) {
        console.error("Erreur de récupération des tags:", error);
        return;
      }

      const enrichedTags = (turnsData ?? []).map((turn) => {
        const matchingTag = tags.find((t) => t.tag === turn.tag); // Match sur le label
        return {
          ...turn,
          color: matchingTag?.color ?? "transparent", // ✅ Ajoute la couleur correspondante
        };
      });

      setTaggedTurns(enrichedTags); // ✅ Met à jour le state avec les couleurs enrichies
    },
    [tags]
  );

  const addTag = useCallback(async (newTag: Partial<TaggedTurn>) => {
    const { data, error } = await supabaseClient
      .from("turntagged")
      .insert([newTag])
      .select(
        "id, call_id, start_time, end_time, tag, next_turn_verbatim, lpltag(color)"
      );

    if (error) {
      console.error("Erreur lors de l'ajout du tag:", error);
      return null;
    }

    if (data?.length) {
      const enrichedTag = {
        ...data[0],
        color: data[0].lpltag[0]?.color || "transparent",
      };
      setTaggedTurns((prev) => [...prev, enrichedTag]);
      return enrichedTag;
    }

    return null;
  }, []);

  const deleteTurnTag = useCallback(async (id: string) => {
    const { error } = await supabaseClient
      .from("turntagged")
      .delete()
      .eq("id", id);
    if (error) {
      console.error("Erreur lors de la suppression du tag:", error.message);
    } else {
      setTaggedTurns((prev) => prev.filter((tag) => tag.id !== id));
    }
  }, []);

  return (
    <TaggingDataContext.Provider
      value={{
        taggingCalls,
        setTaggingCalls,
        selectedTaggingCall,
        selectTaggingCall,
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
