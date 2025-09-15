// app/evaluation/components/NewTranscript/index.tsx

import React, { useMemo, useCallback, useEffect, useState } from "react";
import { Box, CircularProgress, Alert } from "@mui/material";

import {
  NewTranscriptProps,
  TranscriptConfig,
  defaultTranscriptConfig,
  convertLegacyToConfig,
  TemporalEvent,
  Word,
  TextSelection,
} from "./types";

import { useEventManager } from "./core/EventManager";
import { PostitProvider } from "./core/providers/PostitProvider";
import { useCallData } from "@/context/CallDataContext";
import { useAudio } from "@/context/AudioContext";

// Import des zones
import HeaderZone from "./components/HeaderZone";
import TimelineZone from "./components/TimelineZone";
import TranscriptZone, {
  useTranscriptSync,
  useTranscriptNavigation,
} from "./components/TranscriptZone";

// Composant de chargement
const TranscriptSkeleton: React.FC = () => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
      flexDirection: "column",
      gap: 2,
    }}
  >
    <CircularProgress />
    <Box>Chargement du transcript...</Box>
  </Box>
);

// Fonction pour convertir les transcriptions au format Word[]
const convertTranscriptionToWords = (transcription: any): Word[] => {
  if (!transcription || !transcription.words) {
    console.warn("⚠️ Aucune transcription disponible");
    return [];
  }

  try {
    return transcription.words.map((word: any, index: number) => ({
      id: word.id || index,
      text: word.word || word.text || "",
      start_time: word.startTime || word.start_time || 0,
      end_time: word.endTime || word.end_time || 0,
      speaker: word.speaker || "Unknown",
      confidence: word.confidence || 1,
    }));
  } catch (error) {
    console.error("❌ Erreur conversion transcription:", error);
    return [];
  }
};

// Composant principal NewTranscript
export const NewTranscript: React.FC<NewTranscriptProps> = ({
  callId,
  config: userConfig,

  // Props de compatibilité avec l'ancien système
  hideHeader = false,
  highlightTurnOne,
  transcriptSelectionMode,
  isSpectatorMode,
  highlightedWordIndex,
  viewMode,
  ...legacyProps
}) => {
  const {
    appelPostits,
    addPostit,
    updatePostit,
    deletePostit,
    transcription, // Les vraies données de transcription
    selectedCall,
  } = useCallData();

  const { currentTime, duration, seekTo } = useAudio();

  console.log("🔄 NewTranscript Phase 2 initializing with callId:", callId);
  console.log("📊 Transcription data:", transcription);

  // Configuration finale (merge user config + legacy props + defaults)
  const config = useMemo((): TranscriptConfig => {
    const legacyConfig = convertLegacyToConfig({
      viewMode,
      transcriptSelectionMode,
      isSpectatorMode,
      highlightTurnOne,
    });

    return {
      ...defaultTranscriptConfig,
      ...legacyConfig,
      ...userConfig,
      mode: userConfig?.mode || "evaluation",
      audioSrc: userConfig?.audioSrc || "",
    };
  }, [
    userConfig,
    viewMode,
    transcriptSelectionMode,
    isSpectatorMode,
    highlightTurnOne,
  ]);

  // État pour la configuration dynamique
  const [dynamicConfig, setDynamicConfig] = useState<TranscriptConfig>(config);

  // Event Manager
  const {
    eventManager,
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    refetch,
  } = useEventManager(callId, dynamicConfig);

  const postitProvider = useMemo(() => {
    return new PostitProvider({
      getAppelPostits: async (cid: string) => {
        const n = Number(cid);
        return (appelPostits ?? []).filter((p) => p.callid === n);
      },
      getWordsForCall: async (_cid: string) => {
        const words = transcription?.words ?? [];
        return words.map((w: any) => ({
          id: w.id ?? w.wordid ?? 0,
          text: w.word ?? w.text ?? "",
          start_time: w.startTime ?? w.start_time ?? 0,
          end_time: w.endTime ?? w.end_time ?? 0,
          speaker: w.speaker,
        }));
      },
      createPostit: addPostit ? (p) => addPostit(p as any) : undefined,
      updatePostit: updatePostit
        ? (id, u) => updatePostit(id, u as any)
        : undefined,
      deletePostit: deletePostit ? (id) => deletePostit(id) : undefined,
      getColorForSujet: (s) => {
        const colorMap: Record<string, string> = {
          Accueil: "#4ecdc4",
          Identification: "#4ecdc4",
          Traitement: "#45b7d1",
          Conclusion: "#96ceb4",
          Politesse: "#f7b731",
          Technique: "#5f27cd",
          Commercial: "#00d2d3",
          Autre: "#ff6b6b",
        };
        return colorMap[s] ?? "#ff6b6b";
      },
    });
  }, [appelPostits, transcription, addPostit, updatePostit, deletePostit]);

  // Enregistre le provider dans l'EventManager
  useEffect(() => {
    if (!eventManager) return;
    eventManager.registerProvider(postitProvider);
    refetch();
  }, [eventManager, postitProvider, refetch]);

  // Conversion des vraies transcriptions au format Word[]
  const realTranscription = useMemo(() => {
    return convertTranscriptionToWords(transcription);
  }, [transcription]);

  // Synchronisation transcript-audio avec les vraies données
  const { currentWordIndex, currentTurnStats, progressPercentage } =
    useTranscriptSync(realTranscription, currentTime);

  // Navigation dans le transcript avec vraie fonction seekTo
  const { goToWord, goToNextWord, goToPreviousWord, canGoNext, canGoPrevious } =
    useTranscriptNavigation(realTranscription, currentWordIndex, seekTo);

  // Handlers des interactions
  const handleEventClick = useCallback(
    (event: TemporalEvent) => {
      console.log("📍 Event clicked:", event);
      seekTo(event.startTime);
    },
    [seekTo]
  );

  const handleWordClick = useCallback(
    (word: Word) => {
      console.log("📝 Word clicked:", word);
      seekTo(word.start_time);
    },
    [seekTo]
  );

  const handleTextSelection = useCallback((selection: TextSelection) => {
    console.log("📄 Text selected:", selection);
  }, []);

  const handleTimelineClick = useCallback(
    (time: number) => {
      console.log("⏰ Timeline clicked at time:", time);
      seekTo(time);
    },
    [seekTo]
  );

  const handleConfigChange = useCallback(
    (newConfig: Partial<TranscriptConfig>) => {
      console.log("⚙️ Config change:", newConfig);
      setDynamicConfig((prev) => ({ ...prev, ...newConfig }));
    },
    []
  );

  // Gestion des états d'erreur et chargement
  if (error) {
    return (
      <Alert severity="error" sx={{ margin: 2 }}>
        <Box sx={{ fontWeight: "bold" }}>
          Erreur lors du chargement du transcript
        </Box>
        <Box>{error.message}</Box>
        <Box sx={{ marginTop: 1 }}>
          <button onClick={refetch}>Réessayer</button>
        </Box>
      </Alert>
    );
  }

  if (loading) {
    return <TranscriptSkeleton />;
  }

  if (!callId) {
    return (
      <Alert severity="warning" sx={{ margin: 2 }}>
        CallId requis pour NewTranscript
      </Alert>
    );
  }

  // Si pas de transcription, afficher un message informatif
  if (!realTranscription.length) {
    return (
      <Alert severity="info" sx={{ margin: 2 }}>
        <Box sx={{ fontWeight: "bold" }}>Aucune transcription disponible</Box>
        <Box>
          Sélectionnez un appel avec transcription pour utiliser NewTranscript
        </Box>
      </Alert>
    );
  }

  // Rendu principal
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        backgroundColor: "background.default",
      }}
    >
      {/* Zone Header - Contrôles audio et infos */}
      {!hideHeader && (
        <HeaderZone
          callId={callId}
          config={dynamicConfig}
          audioSrc={dynamicConfig.audioSrc}
          onConfigChange={handleConfigChange}
        />
      )}

      {/* Zone Timeline - Événements temporels */}
      {dynamicConfig.timelineMode !== "hidden" && (
        <TimelineZone
          events={events}
          currentTime={currentTime}
          duration={duration}
          config={dynamicConfig}
          onEventClick={handleEventClick}
          onTimelineClick={handleTimelineClick}
        />
      )}

      {/* Zone Transcript - Texte principal avec vraies données */}
      <TranscriptZone
        transcription={realTranscription}
        events={events}
        config={dynamicConfig}
        currentWordIndex={currentWordIndex}
        onWordClick={handleWordClick}
        onTextSelection={handleTextSelection}
        onEventClick={handleEventClick}
      />

      {/* Zone Controls - Outils bas */}
      {dynamicConfig.layout.showControls && (
        <Box
          sx={{
            height: 50,
            borderTop: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            fontSize: "0.8rem",
          }}
        >
          <Box sx={{ display: "flex", gap: 2 }}>
            <span>🎛️ Controls</span>
            {currentTurnStats && (
              <span>
                {currentTurnStats.speaker} •
                {Math.round(currentTurnStats.progress * 100)}% du tour
              </span>
            )}
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <span>Événements: {events.length}</span>
            <span>Mots: {realTranscription.length}</span>
            <span>Progression: {progressPercentage}%</span>
          </Box>
        </Box>
      )}

      {/* Debug Panel (développement uniquement) */}
      {process.env.NODE_ENV === "development" && (
        <Box
          sx={{
            position: "fixed",
            bottom: 10,
            right: 10,
            padding: 1,
            backgroundColor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.8)",
            color: (theme) =>
              theme.palette.mode === "dark" ? "white" : "white",
            borderRadius: 1,
            fontSize: "0.7rem",
            maxWidth: 350,
            zIndex: 9999,
            backdropFilter: "blur(10px)",
            border: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <div>🚀 NewTranscript Phase 2</div>
          <div>CallId: {callId}</div>
          <div>Current Time: {currentTime.toFixed(1)}s</div>
          <div>
            Current Word:{" "}
            {currentWordIndex >= 0
              ? realTranscription[currentWordIndex]?.text
              : "N/A"}
          </div>
          <div>
            Events: {events.length} | Words: {realTranscription.length}
          </div>
          <div>
            Config: {dynamicConfig.mode} • {dynamicConfig.displayMode}
          </div>
          {currentTurnStats && (
            <div>
              Turn: {currentTurnStats.speaker} (
              {Math.round(currentTurnStats.progress * 100)}%)
            </div>
          )}
          <div>Transcription source: {transcription ? "REAL" : "NONE"}</div>
        </Box>
      )}
    </Box>
  );
};

// Hook utilitaire pour la migration
export const useNewTranscriptMigration = (enabled: boolean = false) => {
  return {
    isEnabled: enabled,
    version: "2.0.0-beta",
    migrationPhase: 2,
    features: {
      eventManager: true,
      postitProvider: true,
      headerZone: true,
      timelineZone: true,
      transcriptZone: true,
      controlsZone: false,
      realTimeSync: true,
      audioIntegration: true, // Maintenant true !
      realTranscriptions: true, // Maintenant true !
    },
  };
};

export default NewTranscript;
