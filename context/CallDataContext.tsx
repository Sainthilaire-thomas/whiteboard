"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { useAppContext } from "@/context/AppContext";

// 📚 Imports des hooks
import { useCalls } from "@/hooks/CallDataContext/useCalls";
import { usePostits } from "@/hooks/CallDataContext/usePostits";
import { useTranscriptions } from "@/hooks/CallDataContext/useTranscriptions";
import { useDomains } from "@/hooks/useDomains";
import { useZones } from "@/hooks/CallDataContext/useZones";
import { useCallActivity } from "@/hooks/CallDataContext/useCallActivity";
import { useRolePlay } from "@/hooks/CallDataContext/useRolePlay";

import {
  CallDataContextType,
  Word,
  Postit,
  RolePlayData,
  TextSelection,
} from "@/types/types";

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

  // 💡 C'est ici qu'on va lancer fetchCalls quand selectedEntreprise change
  useEffect(() => {
    if (selectedEntreprise !== null) {
      console.log("📞 Triggering fetchCalls from CallDataProvider");
      fetchCalls(selectedEntreprise);
    }
  }, [selectedEntreprise, fetchCalls]);

  // ✅ Activité liée à un appel
  const {
    idCallActivite,
    fetchActivitiesForCall,
    createActivityForCall,
    removeActivityForCall,
    isLoading,
    getActivityIdFromCallId,
  } = useCallActivity({ selectedCall, fetchCalls, selectedEntreprise });

  // 🗒️ Post-its liés à l'appel sélectionné
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

  // 🟡 NOUVEAU : État pour le postit sélectionné (logiquement lié à l'appel)
  const [selectedPostit, setSelectedPostit] = useState<Postit | null>(null);

  // 🔄 NOUVEAU : Réinitialiser selectedPostit quand on change d'appel
  useEffect(() => {
    if (selectedCall?.callid !== selectedPostit?.callid) {
      console.log("🔄 Changement d'appel - reset selectedPostit");
      setSelectedPostit(null);
    }
  }, [selectedCall?.callid, selectedPostit?.callid]);

  // 🔄 NOUVEAU : Debug pour vérifier la synchronisation
  useEffect(() => {
    if (selectedPostit) {
      console.log("🎯 CallDataContext - selectedPostit changé:", {
        id: selectedPostit.id,
        pratique: selectedPostit.pratique,
        idpratique: selectedPostit.idpratique,
        callid: selectedPostit.callid,
        selectedCallId: selectedCall?.callid,
      });
    }
  }, [selectedPostit, selectedCall?.callid]);

  // 🖋️ Transcription
  const { transcription, fetchTranscription } = useTranscriptions();

  // 🌍 Domaines
  const { domains, domainNames, fetchDomains } = useDomains();

  // 🧠 Zones
  const { zoneTexts, selectTextForZone } = useZones();

  // 🎮 Post-it sélectionné pour le jeu de rôle
  const [selectedPostitForRolePlay, setSelectedPostitForRolePlay] =
    useState<Postit | null>(null);

  // Pour la sélection dans la transcription
  const [transcriptSelectionMode, setTranscriptSelectionMode] = useState<
    "client" | "conseiller" | null
  >(null);
  const [clientSelection, setClientSelection] = useState<TextSelection | null>(
    null
  );
  const [conseillerSelection, setConseillerSelection] =
    useState<TextSelection | null>(null);

  // 🎲 Jeu de rôle
  const {
    rolePlayData,
    saveRolePlayData,
    fetchRolePlayData,
    deleteRolePlayData,
    getRolePlaysByCallId,
    isLoading: isLoadingRolePlay,
    error: rolePlayError,
  } = useRolePlay(
    selectedCall?.callid ?? null,
    selectedPostitForRolePlay?.id ?? null
  );

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

        // 🟡 NOUVEAU : Postit sélectionné
        selectedPostit,
        setSelectedPostit,

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

        // 🗣️ Word tracking
        currentWord,
        updateCurrentWord,

        // 🔄 Activité liée à l'appel
        idCallActivite,
        fetchActivitiesForCall,
        createActivityForCall,
        removeActivityForCall,
        getActivityIdFromCallId,

        // Nouvelles valeurs pour la sélection de texte
        transcriptSelectionMode,
        setTranscriptSelectionMode,
        clientSelection,
        setClientSelection,
        conseillerSelection,
        setConseillerSelection,

        // 🎮 Jeu de rôle coaching
        selectedPostitForRolePlay,
        setSelectedPostitForRolePlay,
        rolePlayData,
        saveRolePlayData,
        fetchRolePlayData,
        deleteRolePlayData,
        getRolePlaysByCallId,
        isLoadingRolePlay,
        rolePlayError,
      }}
    >
      {children}
    </CallDataContext.Provider>
  );
};
