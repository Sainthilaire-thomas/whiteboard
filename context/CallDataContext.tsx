"use client";

import {
  useState,
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useMemo,
} from "react";

// 📚 Imports des hooks
import { useCalls } from "@/hooks/CallDataContext/useCalls";
import { usePostits } from "@/hooks/CallDataContext/usePostits";
import { useTranscriptions } from "@/hooks/CallDataContext/useTranscriptions";
import { useDomains } from "@/hooks/useDomains";
import { useAudio } from "@/hooks/CallDataContext/useAudio";
import { useZones } from "@/hooks/CallDataContext/useZones";

import { CallDataContextType, Word } from "@/types/types";

// 🔹 Création du contexte CallDataContext
const CallDataContext = createContext<CallDataContextType | undefined>(
  undefined
);

// 🔄 Hook personnalisé pour accéder au contexte CallDataContext
export const useCallData = (): CallDataContextType => {
  const context = useContext(CallDataContext);
  if (!context) {
    throw new Error("useCallData must be used within a CallDataProvider");
  }
  return context;
};

// 🛠️ Provider du contexte CallDataContext
export const CallDataProvider = ({ children }: { children: ReactNode }) => {
  // 📝 Appels
  const { calls, fetchCalls, selectedCall, selectCall, idCallActivite } =
    useCalls();

  // 📌 Post-its
  const {
    allPostits,
    appelPostits,
    fetchAllPostits,
    addPostit,
    updatePostit,
    deletePostit,
  } = usePostits(selectedCall?.callid ?? null);

  // 🖋️ Transcriptions
  const { transcription, fetchTranscription } = useTranscriptions();

  // 🌍 Domaines
  const { domains, domainNames, fetchDomains } = useDomains();

  // 🎧 Audio
  const { audioSrc, setAudioSrc, playAudioAtTimestamp, playerRef } =
    useAudio() as {
      audioSrc: string | null;
      setAudioSrc: (src: string | null) => void;
      playAudioAtTimestamp: (timestamp: number) => void;
      playerRef: React.RefObject<HTMLAudioElement>; // 🔴 Cast ici
    };

  // 📝 Zones de texte
  const { zoneTexts, selectTextForZone } = useZones();

  // 🗣️ Gestion du mot courant
  const [currentWord, setCurrentWord] = useState<Word | null>(null); // Initialisez currentWord à null
  const updateCurrentWord = (word: Word | null) => setCurrentWord(word); // Fonction pour mettre à jour currentWord

  return (
    <CallDataContext.Provider
      value={{
        calls,
        fetchCalls,
        selectedCall,
        selectCall,
        allPostits,
        appelPostits,
        fetchAllPostits,
        addPostit,
        updatePostit,
        deletePostit,
        transcription,
        fetchTranscription,
        domains,
        domainNames,
        fetchDomains,
        audioSrc,
        setAudioSrc,
        playAudioAtTimestamp,
        playerRef,
        zoneTexts,
        selectTextForZone,
        createAudioUrlWithToken: useCalls().createAudioUrlWithToken,
        currentWord, // Ajoutez currentWord au provider
        updateCurrentWord, // Ajoutez updateCurrentWord au provider
        idCallActivite,
      }}
    >
      {children}
    </CallDataContext.Provider>
  );
};
