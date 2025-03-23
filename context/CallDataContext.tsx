"use client";

import { useState, createContext, useContext, ReactNode } from "react";
import { useAppContext } from "@/context/AppContext";

// 📚 Imports des hooks
import { useCalls } from "@/hooks/CallDataContext/useCalls";
import { usePostits } from "@/hooks/CallDataContext/usePostits";
import { useTranscriptions } from "@/hooks/CallDataContext/useTranscriptions";
import { useDomains } from "@/hooks/useDomains";
import { useAudio } from "@/hooks/CallDataContext/useAudio";
import { useZones } from "@/hooks/CallDataContext/useZones";
import { useCallActivity } from "@/hooks/CallDataContext/useCallActivity";

import { CallDataContextType, Word } from "@/types/types";

interface CallDataProviderProps {
  children: ReactNode;
  selectedEntreprise: number | null;
}

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
export const CallDataProvider = ({
  children,
  selectedEntreprise,
}: CallDataProviderProps) => {
  // 📞 Appels
  const {
    calls,
    fetchCalls,
    selectedCall,
    selectCall,
    setSelectedCall,
    archiveCall,
    deleteCall,
    createAudioUrlWithToken,
    isLoadingCalls,
  } = useCalls();

  // ✅ Activité liée à un appel

  const {
    idCallActivite,
    fetchActivitiesForCall,
    createActivityForCall,
    removeActivityForCall,
    isLoading,
    getActivityIdFromCallId,
  } = useCallActivity({ selectedCall, fetchCalls, selectedEntreprise });

  // 🗒️ Post-its liés à l’appel sélectionné
  const {
    allPostits,
    appelPostits,
    fetchAllPostits,
    addPostit,
    updatePostit,
    deletePostit,
    postitToSujetMap,
    updatePostitToSujetMap,
    postitToPratiqueMap,
    updatePostitToPratiqueMap,
  } = usePostits(selectedCall?.callid ?? null);

  // 🖋️ Transcription
  const { transcription, fetchTranscription } = useTranscriptions();

  // 🌍 Domaines
  const { domains, domainNames, fetchDomains } = useDomains();

  // 🎧 Audio
  const { audioSrc, setAudioSrc, playAudioAtTimestamp, playerRef } =
    useAudio() as {
      audioSrc: string | null;
      setAudioSrc: (src: string | null) => void;
      playAudioAtTimestamp: (timestamp: number) => void;
      playerRef: React.RefObject<HTMLAudioElement>;
    };

  // 🧠 Zones
  const { zoneTexts, selectTextForZone } = useZones();

  // 🗣️ Mot courant
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const updateCurrentWord = (word: Word | null) => setCurrentWord(word);

  return (
    <CallDataContext.Provider
      value={{
        // 📞 Appels
        calls,
        fetchCalls,
        selectedCall,
        selectCall,
        setSelectedCall,
        archiveCall,
        deleteCall,
        createAudioUrlWithToken,
        isLoadingCalls,

        // 🗒️ Post-its
        allPostits,
        appelPostits,
        fetchAllPostits,
        addPostit,
        updatePostit,
        deletePostit,
        postitToSujetMap,
        updatePostitToSujetMap,
        postitToPratiqueMap,
        updatePostitToPratiqueMap,

        // 📚 Transcription
        transcription,
        fetchTranscription,

        // 🧠 Zones
        zoneTexts,
        selectTextForZone,

        // 🌍 Domaines
        domains,
        domainNames,
        fetchDomains,

        // 🎧 Audio
        audioSrc,
        setAudioSrc,
        playAudioAtTimestamp,
        playerRef,

        // 🗣️ Word tracking
        currentWord,
        updateCurrentWord,

        // 🔄 Activité liée à l’appel
        idCallActivite,
        fetchActivitiesForCall,
        createActivityForCall,
        removeActivityForCall,
        getActivityIdFromCallId,
      }}
    >
      {children}
    </CallDataContext.Provider>
  );
};
