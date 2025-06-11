// app/whiteboard/components/SharedEvaluation/SharedEvaluationViewer.tsx
"use client";

import React from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  useTheme,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import { useSharedEvaluation } from "../../hooks";
import { SessionSelector } from "./SessionSelector";
import { SharedEvaluationHeader } from "./SharedEvaluationHeader";
import { SharedEvaluationContent } from "./SharedEvaluationContent";

interface SharedEvaluationViewerProps {
  onBackToWhiteboard: () => void;
  whiteboardId?: string;
}

export function SharedEvaluationViewer({
  onBackToWhiteboard,
  whiteboardId,
}: SharedEvaluationViewerProps) {
  const theme = useTheme();
  const {
    activeSessions,
    currentSession,
    isLoading,
    error,
    refreshSessions,
    selectSession,
    clearCurrentSession,
  } = useSharedEvaluation(whiteboardId);

  // Gestion des états de chargement et d'erreur
  if (isLoading && activeSessions.length === 0) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography color="text.secondary">
            Recherche de sessions actives...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error && activeSessions.length === 0) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
          p: 3,
        }}
      >
        <Paper sx={{ p: 4, maxWidth: 500, textAlign: "center" }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Erreur de connexion
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {error}
            </Typography>
            <Button
              variant="contained"
              color="error"
              onClick={refreshSessions}
              size="small"
            >
              Réessayer
            </Button>
          </Alert>
          <Button
            variant="text"
            onClick={onBackToWhiteboard}
            startIcon={<ArrowBackIcon />}
          >
            Retour au whiteboard
          </Button>
        </Paper>
      </Box>
    );
  }

  // Aucune session active trouvée
  if (activeSessions.length === 0) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
          p: 3,
        }}
      >
        <Paper sx={{ p: 4, maxWidth: 500, textAlign: "center" }}>
          <VideoCallIcon
            sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
          />
          <Typography variant="h5" gutterBottom>
            Aucune session d'évaluation active
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Attendez qu'un coach démarre une session d'évaluation partagée, ou
            actualisez pour vérifier.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Button
              variant="contained"
              onClick={refreshSessions}
              disabled={isLoading}
              startIcon={<RefreshIcon />}
            >
              {isLoading ? "Actualisation..." : "Actualiser"}
            </Button>
            <Button
              variant="outlined"
              onClick={onBackToWhiteboard}
              startIcon={<ArrowBackIcon />}
            >
              Retour
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  // Interface principale avec session(s) active(s)
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
      }}
    >
      {/* Header avec contrôles */}
      <SharedEvaluationHeader
        currentSession={currentSession}
        activeSessions={activeSessions}
        onBackToWhiteboard={onBackToWhiteboard}
        onRefresh={refreshSessions}
        isLoading={isLoading}
      />

      {/* Sélecteur de sessions (si plusieurs) */}
      {activeSessions.length > 1 && (
        <SessionSelector
          sessions={activeSessions}
          currentSession={currentSession}
          onSelectSession={selectSession}
        />
      )}

      {/* Contenu principal */}
      <Box sx={{ flex: 1, overflow: "auto" }}>
        {currentSession ? (
          <SharedEvaluationContent
            session={currentSession}
            onRefresh={refreshSessions}
          />
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              p: 3,
            }}
          >
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Sélectionnez une session pour commencer
              </Typography>
              <Button
                variant="contained"
                onClick={() => selectSession(activeSessions[0].id)}
              >
                Rejoindre "{activeSessions[0].session_name}"
              </Button>
            </Paper>
          </Box>
        )}
      </Box>
    </Box>
  );
}
