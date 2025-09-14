// app/whiteboard/components/SharedEvaluation/SynchronizedTranscript.tsx
// Version mise à jour avec useSpectatorTranscriptions intégré

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  RadioButtonChecked as LiveIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";

import { useRealtimeEvaluationSync } from "../../hooks/useRealtimeEvaluationSync";
// ✅ AJOUT: Import du hook dédié mode spectateur
import { useSpectatorTranscriptions } from "../../hooks/useSpectatorTranscriptions";

// Imports des composants Transcript existants
import Transcript from "../../../evaluation/components/EvaluationTranscript/Transcript";
import TranscriptAlternative from "../../../evaluation/components/EvaluationTranscript/TranscriptAlternative";

interface SynchronizedTranscriptProps {
  sessionId: string;
  callId: number;
}

export function SynchronizedTranscript({
  sessionId,
  callId,
}: SynchronizedTranscriptProps) {
  // ✅ Hook Realtime pour recevoir synchronisation
  const {
    currentWordIndex,
    currentParagraphIndex,
    viewMode,
    highlightTurnOne,
    highlightSpeakers,
    sessionMode,
    isConnected,
    connectionError,
    lastSyncTime,
  } = useRealtimeEvaluationSync(sessionId);

  // ✅ NOUVEAU: Hook dédié pour charger la transcription en mode spectateur
  const {
    transcription,
    fetchTranscription,
    isLoading: transcriptionLoading,
    error: transcriptionError,
  } = useSpectatorTranscriptions();

  // État local pour l'interface
  const [transcriptView, setTranscriptView] = useState<
    "standard" | "alternative"
  >("standard");

  // ✅ NOUVEAU: Charger la transcription quand callId change
  useEffect(() => {
    if (callId) {
      console.log(
        "🔄 SynchronizedTranscript: Loading transcription for callId:",
        callId
      );
      fetchTranscription(callId);
    }
  }, [callId, fetchTranscription]);

  // Debug logging amélioré
  useEffect(() => {
    console.log("🔄 SynchronizedTranscript sync state:", {
      sessionId: sessionId?.slice(0, 8) + "...",
      callId,
      currentWordIndex,
      currentParagraphIndex,
      viewMode,
      isConnected,
      lastSyncTime,
      hasTranscription: !!transcription,
      transcriptionWordsCount: transcription?.words?.length || 0,
      transcriptionLoading,
      transcriptionError,
    });
  }, [
    sessionId,
    callId,
    currentWordIndex,
    currentParagraphIndex,
    viewMode,
    isConnected,
    lastSyncTime,
    transcription,
    transcriptionLoading,
    transcriptionError,
  ]);

  // ✅ Gestion des erreurs combinées
  const hasError = connectionError || transcriptionError;
  const errorMessage = connectionError || transcriptionError;

  if (hasError) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
        }}
      >
        <Paper sx={{ p: 4, maxWidth: 500, textAlign: "center" }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {connectionError
                ? "Erreur de connexion temps réel"
                : "Erreur de transcription"}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {errorMessage}
            </Typography>
            <Button
              variant="contained"
              color="error"
              onClick={() => window.location.reload()}
              startIcon={<RefreshIcon />}
            >
              Recharger la page
            </Button>
          </Alert>
        </Paper>
      </Box>
    );
  }

  // ✅ Loading state pour transcription
  if (transcriptionLoading && !transcription) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Chargement de la transcription...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* ✅ Header avec indicateurs de synchronisation Material-UI */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: "info.lighter",
          borderBottom: 1,
          borderColor: "info.light",
          p: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            {/* Indicateur connexion */}
            <Chip
              icon={
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    bgcolor: isConnected ? "success.main" : "error.main",
                    borderRadius: "50%",
                    animation: isConnected ? "pulse 2s infinite" : "none",
                    "@keyframes pulse": {
                      "0%, 100%": { opacity: 1 },
                      "50%": { opacity: 0.5 },
                    },
                  }}
                />
              }
              label={
                isConnected ? "Synchronisé avec le coach" : "Connexion perdue"
              }
              color={isConnected ? "success" : "error"}
              variant="outlined"
              size="small"
            />

            {/* Mode d'affichage */}
            <Chip
              icon={<ViewIcon />}
              label={viewMode === "word" ? "Mot par mot" : "Par paragraphe"}
              color="primary"
              variant="filled"
              size="small"
            />

            {/* Position actuelle */}
            {isConnected && (
              <Typography
                variant="body2"
                color="primary.main"
                fontWeight="medium"
              >
                Position:{" "}
                {viewMode === "word"
                  ? `Mot ${currentWordIndex}`
                  : `Paragraphe ${currentParagraphIndex}`}
              </Typography>
            )}
          </Box>

          {/* Switch vue transcription */}
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              onClick={() => setTranscriptView("standard")}
              variant={transcriptView === "standard" ? "contained" : "outlined"}
              size="small"
              color="primary"
            >
              Standard
            </Button>
            <Button
              onClick={() => setTranscriptView("alternative")}
              variant={
                transcriptView === "alternative" ? "contained" : "outlined"
              }
              size="small"
              color="primary"
            >
              Alternative
            </Button>
          </Box>
        </Box>

        {/* Dernière synchronisation avec info transcription */}
        {lastSyncTime && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 1 }}
          >
            Dernière synchronisation: {lastSyncTime.toLocaleTimeString()}
            {transcription && (
              <span> • {transcription.words.length} mots chargés</span>
            )}
          </Typography>
        )}
      </Paper>

      {/* ✅ Zone transcription synchronisée */}
      <Box sx={{ flex: 1, overflow: "hidden" }}>
        {transcriptView === "standard" ? (
          <Transcript
            callId={callId}
            // ✅ Props mode spectateur
            isSpectatorMode={true}
            highlightedWordIndex={currentWordIndex}
            highlightedParagraphIndex={currentParagraphIndex}
            highlightTurnOne={highlightTurnOne}
            highlightSpeakers={highlightSpeakers}
            viewMode={viewMode}
            // ✅ NOUVEAU: Passer la transcription en prop
            transcription={transcription}
          />
        ) : (
          <TranscriptAlternative
            callId={callId}
            // ✅ Props mode spectateur
            isSpectatorMode={true}
            highlightedWordIndex={currentWordIndex}
            highlightedParagraphIndex={currentParagraphIndex}
            highlightTurnOne={highlightTurnOne}
            highlightSpeakers={highlightSpeakers}
            viewMode={viewMode}
            // ✅ NOUVEAU: Passer la transcription en prop
            transcription={transcription}
          />
        )}
      </Box>
    </Box>
  );
}
