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

// Import des zones (Phase 2)
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
    transcription, // optionnel si tu veux détecter le speaker
    selectedCall,
  } = useCallData();
  console.log("🔄 NewTranscript Phase 2 initializing with callId:", callId);

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
      // (optionnel) si tu veux déduire le speaker ; sinon laisse vide
      getWordsForCall: async (_cid: string) => {
        const words = (transcription as any)?.words ?? [];
        // normalisation vers {id,text,start_time,end_time,speaker}
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
    // recharge les events depuis les providers
    refetch();
  }, [eventManager, postitProvider, refetch]);

  // Mock data pour les tests (remplacer par les vrais hooks plus tard)
  const [mockAudioState, setMockAudioState] = useState({
    isPlaying: false,
    currentTime: 15.5,
    duration: 180,
    volume: 0.8,
  });

  const [mockTranscription] = useState<Word[]>([
    {
      id: 1,
      text: "Bonjour",
      start_time: 10.0,
      end_time: 10.5,
      speaker: "Conseiller",
    },
    {
      id: 2,
      text: "Monsieur",
      start_time: 10.6,
      end_time: 11.1,
      speaker: "Conseiller",
    },
    {
      id: 3,
      text: "Martin",
      start_time: 11.2,
      end_time: 11.6,
      speaker: "Conseiller",
    },
    {
      id: 4,
      text: "comment",
      start_time: 11.7,
      end_time: 12.0,
      speaker: "Conseiller",
    },
    {
      id: 5,
      text: "puis-je",
      start_time: 12.1,
      end_time: 12.4,
      speaker: "Conseiller",
    },
    {
      id: 6,
      text: "vous",
      start_time: 12.5,
      end_time: 12.7,
      speaker: "Conseiller",
    },
    {
      id: 7,
      text: "aider",
      start_time: 12.8,
      end_time: 13.2,
      speaker: "Conseiller",
    },
    {
      id: 8,
      text: "aujourd'hui",
      start_time: 13.3,
      end_time: 14.0,
      speaker: "Conseiller",
    },
    {
      id: 9,
      text: "Bonjour",
      start_time: 15.0,
      end_time: 15.4,
      speaker: "Client",
    },
    {
      id: 10,
      text: "j'ai",
      start_time: 15.5,
      end_time: 15.7,
      speaker: "Client",
    },
    { id: 11, text: "un", start_time: 15.8, end_time: 15.9, speaker: "Client" },
    {
      id: 12,
      text: "problème",
      start_time: 16.0,
      end_time: 16.6,
      speaker: "Client",
    },
    {
      id: 13,
      text: "avec",
      start_time: 16.7,
      end_time: 16.9,
      speaker: "Client",
    },
    {
      id: 14,
      text: "mon",
      start_time: 17.0,
      end_time: 17.2,
      speaker: "Client",
    },
    {
      id: 15,
      text: "compte",
      start_time: 17.3,
      end_time: 17.8,
      speaker: "Client",
    },
  ]);

  // Synchronisation transcript-audio
  const { currentWordIndex, currentTurnStats, progressPercentage } =
    useTranscriptSync(mockTranscription, mockAudioState.currentTime);

  // Navigation dans le transcript
  const { goToWord, goToNextWord, goToPreviousWord, canGoNext, canGoPrevious } =
    useTranscriptNavigation(
      mockTranscription,
      currentWordIndex,
      (time: number) => {
        setMockAudioState((prev) => ({ ...prev, currentTime: time }));
        console.log("🎯 Navigate to time:", time);
      }
    );

  // Simulation lecture audio (pour la démo)
  useEffect(() => {
    if (mockAudioState.isPlaying) {
      const interval = setInterval(() => {
        setMockAudioState((prev) => ({
          ...prev,
          currentTime: Math.min(prev.currentTime + 0.1, prev.duration),
        }));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [mockAudioState.isPlaying]);

  // Handlers des interactions
  const handleEventClick = useCallback((event: TemporalEvent) => {
    console.log("📍 Event clicked:", event);
    setMockAudioState((prev) => ({ ...prev, currentTime: event.startTime }));
  }, []);

  const handleWordClick = useCallback((word: Word) => {
    console.log("📝 Word clicked:", word);
    setMockAudioState((prev) => ({ ...prev, currentTime: word.start_time }));
  }, []);

  const handleTextSelection = useCallback((selection: TextSelection) => {
    console.log("📄 Text selected:", selection);
  }, []);

  const handleTimelineClick = useCallback((time: number) => {
    console.log("⏰ Timeline clicked at time:", time);
    setMockAudioState((prev) => ({ ...prev, currentTime: time }));
  }, []);

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
          currentTime={mockAudioState.currentTime}
          duration={mockAudioState.duration}
          config={dynamicConfig}
          onEventClick={handleEventClick}
          onTimelineClick={handleTimelineClick}
        />
      )}

      {/* Zone Transcript - Texte principal */}
      <TranscriptZone
        transcription={mockTranscription}
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
            <span>Mots: {mockTranscription.length}</span>
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
          <div>Current Time: {mockAudioState.currentTime.toFixed(1)}s</div>
          <div>
            Current Word:{" "}
            {currentWordIndex >= 0
              ? mockTranscription[currentWordIndex]?.text
              : "N/A"}
          </div>
          <div>
            Events: {events.length} | Words: {mockTranscription.length}
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
      audioIntegration: false,
    },
  };
};

export default NewTranscript;
