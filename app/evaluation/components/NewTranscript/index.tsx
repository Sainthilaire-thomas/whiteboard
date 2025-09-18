// app/evaluation/components/NewTranscript/index.tsx
// VERSION FINALE CORRIGÉE - Avec synchronisation forcée des tags

import React, {
  useMemo,
  useCallback,
  useEffect,
  useState,
  useRef,
} from "react";
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
import { createRealTagProvider } from "./core/providers/TagProvider";
import { useCallData } from "@/context/CallDataContext";
import { useTaggingData } from "@/context/TaggingDataContext";
import { useAudio } from "@/context/AudioContext";

// Import SpeakerUtils pour la correction
import { getSpeakerType, getSpeakerDisplayName } from "@/utils/SpeakerUtils";

// Import des zones
import HeaderZone from "./components/HeaderZone";
import TimelineZone from "./components/Timeline";
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
    console.warn("Aucune transcription disponible");
    return [];
  }

  try {
    const converted = transcription.words.map((word: any, index: number) => {
      const turnValue = word.turn || "unknown";
      const speakerType = getSpeakerType(turnValue);
      const speakerName = getSpeakerDisplayName(speakerType);

      return {
        id: word.id || index,
        text: word.word || word.text || "",
        start_time: word.startTime || word.start_time || 0,
        end_time: word.endTime || word.end_time || 0,
        speaker: speakerName,
        turn: turnValue,
        confidence: word.confidence || 1,
      };
    });

    return converted;
  } catch (error) {
    console.error("Erreur conversion transcription:", error);
    return [];
  }
};

// Composant principal NewTranscript - VERSION FINALE CORRIGÉE
export const NewTranscript: React.FC<NewTranscriptProps> = ({
  callId,
  config: userConfig,
  hideHeader = false,
  highlightTurnOne,
  transcriptSelectionMode,
  isSpectatorMode,
  highlightedWordIndex,
  viewMode,
  ...legacyProps
}) => {
  // Refs pour éviter les boucles
  const providersRegisteredRef = useRef(false);
  const lastCallIdRef = useRef<string | null>(null);

  // Contextes
  const { appelPostits, addPostit, updatePostit, deletePostit, transcription } =
    useCallData();

  const {
    selectedTaggingCall,
    taggedTurns,
    tags,
    addTag,
    deleteTurnTag,
    fetchTaggedTurns,
  } = useTaggingData();

  const { currentTime, duration, seekTo } = useAudio();

  // DEBUG CRITIQUE - Ajout immédiat pour vérifier la synchronisation
  console.log("🔍 NOUVELLE VERSION DEBUG SYNC:", {
    newTranscriptCallId: callId,
    selectedTaggingCallId: selectedTaggingCall?.callid,
    taggedTurnsInContext: taggedTurns.length,
    tagsDefinitions: tags.length,
    areCallIdsSynced: callId === selectedTaggingCall?.callid,
  });

  // SYNCHRONISATION FORCÉE - Si pas synchronisé, charger les tags
  useEffect(() => {
    if (!callId || callId === "undefined" || callId === "null") return;

    // Si l'appel n'est pas le même que celui du contexte de tagging
    if (selectedTaggingCall?.callid !== callId) {
      console.log(
        `🔄 SYNC FORCÉE - CallId désynchronisé, force le chargement: ${callId}`
      );

      // Forcer le fetch des tags pour ce callId
      if (fetchTaggedTurns) {
        fetchTaggedTurns(callId)
          .then(() => {
            console.log(`✅ SYNC FORCÉE - Tags chargés pour callId ${callId}`);
          })
          .catch((err) => {
            console.error(`❌ SYNC FORCÉE - Erreur chargement tags:`, err);
          });
      } else {
        console.error("❌ SYNC FORCÉE - fetchTaggedTurns non disponible");
      }
    } else {
      console.log(`✅ SYNC OK - CallIds synchronisés: ${callId}`);
    }
  }, [callId, selectedTaggingCall?.callid, fetchTaggedTurns]);

  // Configuration STABLE
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
    userConfig?.mode,
    userConfig?.audioSrc,
    viewMode,
    transcriptSelectionMode,
    isSpectatorMode,
    highlightTurnOne,
  ]);

  const [dynamicConfig, setDynamicConfig] = useState<TranscriptConfig>(config);

  // Event Manager STABLE
  const { eventManager, events, loading, error, refetch } = useEventManager(
    callId,
    dynamicConfig
  );

  // PostitProvider STABLE
  const postitProvider = useMemo(() => {
    console.log("Création PostitProvider (une seule fois)");

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
          turn: w.turn,
        }));
      },
      createPostit: addPostit
        ? async (p) => {
            await addPostit(p.wordid || 0, p.word || "", p.timestamp || 0);
            // Retourner un objet compatible avec PostitProvider
            return {
              id: Date.now(), // ID temporaire
              callid: Number(callId) || 0,
              wordid: p.wordid || 0,
              word: p.word || "",
              text: p.text || "",
              sujet: p.sujet || "Autre",
              timestamp: p.timestamp || 0,
              pratique: p.pratique || "",
            };
          }
        : undefined,
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
  }, []);

  // TagProvider STABLE - Maintenant avec les données synchronisées
  const realTagProvider = useMemo(() => {
    console.log("Création TagProvider (une seule fois)");

    return createRealTagProvider(
      // Lecture depuis le contexte (synchronisé par useEffect)
      (targetCallId: string) => {
        const currentTaggedTurns = taggedTurns || [];
        const filtered = currentTaggedTurns.filter(
          (turn) => String(turn.call_id) === String(targetCallId)
        );
        console.log(
          `getTaggedTurns(${targetCallId}): ${filtered.length} turns trouvés`
        );
        return filtered;
      },

      () => {
        const currentTags = tags || [];
        console.log(`getTags(): ${currentTags.length} définitions de tags`);
        return currentTags;
      },

      // CRUD operations
      addTag
        ? async (newTag) => {
            console.log("Création tag via TaggingDataContext:", newTag);
            return await addTag(newTag);
          }
        : undefined,

      undefined, // updateTag

      deleteTurnTag
        ? async (id) => {
            console.log("Suppression tag via TaggingDataContext:", id);
            await deleteTurnTag(String(id));
          }
        : undefined
    );
  }, [taggedTurns, tags, addTag, deleteTurnTag]); // Dépendances ajoutées pour re-créer quand les données changent

  // Enregistrement des providers - VERSION CORRIGÉE
  useEffect(() => {
    if (!eventManager) {
      console.log("EventManager pas encore prêt");
      return;
    }

    // VALIDATION STRICTE du callId
    if (
      !callId ||
      callId === "undefined" ||
      callId === "null" ||
      !callId.trim()
    ) {
      console.log(
        "CallId invalide, pas d'enregistrement de providers:",
        callId
      );
      // Reset si callId devient invalide
      if (providersRegisteredRef.current) {
        eventManager.destroy();
        providersRegisteredRef.current = false;
      }
      return;
    }

    // Éviter re-enregistrement pour le même callId ET même mode
    const registrationKey = `${callId}-${dynamicConfig.mode}`;
    if (
      providersRegisteredRef.current &&
      lastCallIdRef.current === registrationKey
    ) {
      console.log("Providers déjà enregistrés pour ce callId+mode");
      return;
    }

    console.log(
      `Enregistrement providers pour callId: ${callId}, mode: ${dynamicConfig.mode}`
    );

    // Nettoyer les anciens providers
    eventManager.destroy();

    // Enregistrer selon le mode
    if (dynamicConfig.mode === "evaluation") {
      eventManager.registerProvider(postitProvider);
      console.log("PostitProvider enregistré (mode evaluation)");
    } else if (dynamicConfig.mode === "tagging") {
      eventManager.registerProvider(realTagProvider);
      console.log("TagProvider enregistré (mode tagging)");
    } else if (dynamicConfig.mode === "analysis") {
      eventManager.registerProvider(postitProvider);
      eventManager.registerProvider(realTagProvider);
      console.log("PostitProvider + TagProvider enregistrés (mode analysis)");
    } else if (dynamicConfig.mode === "spectator") {
      eventManager.registerProvider(postitProvider);
      eventManager.registerProvider(realTagProvider);
      console.log("Providers enregistrés (mode spectator)");
    }

    // Marquer comme enregistré
    providersRegisteredRef.current = true;
    lastCallIdRef.current = registrationKey;

    // Charger les événements avec un délai pour permettre la synchronisation
    console.log("Chargement événements après enregistrement providers...");

    // Petit délai pour permettre à la synchronisation forcée de se terminer
    setTimeout(() => {
      refetch()
        .then(() => {
          console.log("Événements chargés avec succès");
        })
        .catch((err) => {
          console.error("Erreur chargement événements:", err);
        });
    }, 100);

    // Cleanup
    return () => {
      console.log("Nettoyage enregistrement providers");
      providersRegisteredRef.current = false;
    };
  }, [
    eventManager,
    callId,
    dynamicConfig.mode,
    postitProvider,
    realTagProvider,
    refetch,
  ]);

  // Reset providers quand callId change
  useEffect(() => {
    const newKey = `${callId}-${dynamicConfig.mode}`;
    if (lastCallIdRef.current !== newKey) {
      console.log(`CallId/Mode changé: ${lastCallIdRef.current} → ${newKey}`);
      providersRegisteredRef.current = false; // Forcer re-enregistrement
    }
  }, [callId, dynamicConfig.mode]);

  // Transcription conversion STABLE
  const realTranscription = useMemo(() => {
    return convertTranscriptionToWords(transcription);
  }, [transcription]);

  // Synchronisation transcript-audio
  const { currentWordIndex, currentTurnStats } = useTranscriptSync(
    realTranscription,
    currentTime
  );

  // Handlers des interactions
  const handleEventClick = useCallback(
    (event: TemporalEvent) => {
      console.log("Événement cliqué:", event);
      seekTo(event.startTime);
    },
    [seekTo]
  );

  const handleWordClick = useCallback(
    (word: Word) => {
      console.log("Mot cliqué:", word);
      seekTo(word.start_time);
    },
    [seekTo]
  );

  const handleTextSelection = useCallback((selection: TextSelection) => {
    console.log("Texte sélectionné:", selection);
  }, []);

  const handleTimelineClick = useCallback(
    (time: number) => {
      console.log("Timeline cliquée au temps:", time);
      seekTo(time);
    },
    [seekTo]
  );

  const handleConfigChange = useCallback(
    (newConfig: Partial<TranscriptConfig>) => {
      console.log("Changement config:", newConfig);
      setDynamicConfig((prev) => ({ ...prev, ...newConfig }));

      // Si le mode change, forcer re-enregistrement des providers
      if (newConfig.mode && newConfig.mode !== dynamicConfig.mode) {
        providersRegisteredRef.current = false;
      }
    },
    [dynamicConfig.mode]
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

  // VALIDATION: Pas d'affichage si callId invalide
  if (!callId || callId === "undefined" || callId === "null") {
    return (
      <Alert severity="info" sx={{ margin: 2 }}>
        <Box sx={{ fontWeight: "bold" }}>Aucun appel sélectionné</Box>
        <Box>Veuillez sélectionner un appel pour utiliser NewTranscript</Box>
      </Alert>
    );
  }

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
      {/* Zone Header */}
      {!hideHeader && (
        <HeaderZone
          callId={callId}
          config={dynamicConfig}
          audioSrc={dynamicConfig.audioSrc}
          onConfigChange={handleConfigChange}
        />
      )}

      {/* Zone Timeline */}
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

      {/* Zone Transcript */}
      <TranscriptZone
        transcription={realTranscription}
        events={events}
        config={dynamicConfig}
        currentWordIndex={currentWordIndex}
        onWordClick={handleWordClick}
        onTextSelection={handleTextSelection}
        onEventClick={handleEventClick}
      />

      {/* Zone Controls */}
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
            <span>Mode: {dynamicConfig.mode}</span>
            {currentTurnStats && (
              <span>
                {currentTurnStats.speaker} •
                {Math.round(currentTurnStats.progress * 100)}% du tour
              </span>
            )}
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <span>
              Post-its: {events.filter((e) => e.type === "postit").length}
            </span>
            <span>Tags: {events.filter((e) => e.type === "tag").length}</span>
            <span>Total: {events.length} événements</span>
          </Box>
        </Box>
      )}

      {/* Debug Panel amélioré */}
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
            color: "white",
            borderRadius: 1,
            fontSize: "0.7rem",
            maxWidth: 350,
            zIndex: 9999,
            backdropFilter: "blur(10px)",
          }}
        >
          <div>🚀 NewTranscript FINAL - CallId: {callId || "NONE"}</div>
          <div>Mode: {dynamicConfig.mode}</div>
          <div>Events: {events.length}</div>
          <div>Providers: {providersRegisteredRef.current ? "✅" : "❌"}</div>
          <div>TaggedTurns: {taggedTurns.length}</div>
          <div>Tags definitions: {tags.length}</div>
          <div>
            Sync: {callId === selectedTaggingCall?.callid ? "✅" : "❌"}
          </div>
        </Box>
      )}
    </Box>
  );
};

export default NewTranscript;
