// app/whiteboard/components/SharedEvaluation/SharedEvaluationContent.tsx
"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  Collapse,
  Grid,
  useTheme,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import PauseIcon from "@mui/icons-material/Pause";
import StopIcon from "@mui/icons-material/Stop";
import BarChartIcon from "@mui/icons-material/BarChart";
import { SharedEvaluationSession } from "../../hooks/types";

// ✅ AJOUTER cet import
import { SynchronizedTranscript } from "./SynchronizedTranscript";

interface SharedEvaluationContentProps {
  session: SharedEvaluationSession;
  onRefresh: () => Promise<void>;
}

export function SharedEvaluationContent({
  session,
  onRefresh,
}: SharedEvaluationContentProps) {
  const theme = useTheme();
  const [showDetails, setShowDetails] = useState(false);

  // ... toutes vos fonctions formatTime, formatDateTime, getStatusIcon, getStatusMessage inchangées ...

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("fr-FR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (mode: string) => {
    switch (mode) {
      case "live":
        return <VideoCallIcon sx={{ fontSize: 64, color: "primary.main" }} />;
      case "paused":
        return <PauseIcon sx={{ fontSize: 64, color: "warning.main" }} />;
      default:
        return <StopIcon sx={{ fontSize: 64, color: "text.secondary" }} />;
    }
  };

  const getStatusMessage = (mode: string) => {
    switch (mode) {
      case "live":
        return "Le coach partage actuellement l'évaluation de cet appel en temps réel.";
      case "paused":
        return "La session est en pause. L'évaluation reprendra bientôt.";
      default:
        return "La session d'évaluation est terminée.";
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: "auto",
        p: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ✅ Section header condensée pour faire place à la transcription */}
      <Paper
        sx={{ p: 2, textAlign: "center", mb: 2, bgcolor: "background.paper" }}
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
          {/* Statut principal */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ fontSize: 32 }}>
              {session.session_mode === "live"
                ? "🔴"
                : session.session_mode === "paused"
                  ? "⏸️"
                  : "⏹️"}
            </Box>
            <Box>
              <Typography variant="h6" sx={{ mb: 0 }}>
                {session.session_name}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                {getStatusMessage(session.session_mode)}
              </Typography>
            </Box>
          </Box>

          {/* Métriques compactes */}
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Paper
              variant="outlined"
              sx={{ p: 1, minWidth: 80, textAlign: "center" }}
            >
              <Typography variant="h6" color="primary.main">
                {formatTime(session.audio_position)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Position
              </Typography>
            </Paper>
            <Paper
              variant="outlined"
              sx={{ p: 1, minWidth: 80, textAlign: "center" }}
            >
              <Typography variant="h6" color="primary.main">
                #{session.call_id}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Appel
              </Typography>
            </Paper>
          </Box>

          {/* Actions */}
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              onClick={() => setShowDetails(!showDetails)}
              endIcon={showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              variant="outlined"
              size="small"
            >
              Détails
            </Button>
            <Button
              variant="outlined"
              onClick={onRefresh}
              startIcon={<RefreshIcon />}
              size="small"
            >
              Actualiser
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* ✅ Détails étendus - INCHANGÉ mais collapsible */}
      <Collapse in={showDetails}>
        <Paper sx={{ p: 2, mb: 2, bgcolor: "background.paper" }}>
          <Typography variant="h6" gutterBottom>
            Détails de la session
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ fontWeight: "medium" }}
              >
                Informations générales
              </Typography>
              <Box sx={{ space: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 0.5,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    ID Session:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}
                  >
                    {session.id.slice(0, 8)}...
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 0.5,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Coach:
                  </Typography>
                  <Typography variant="body2">
                    {session.coach_name || "Chargement..."}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 0.5,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Appel:
                  </Typography>
                  <Typography variant="body2">
                    {session.call_title || `Appel #${session.call_id}`}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 0.5,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Créée le:
                  </Typography>
                  <Typography variant="body2">
                    {formatDateTime(session.created_at)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ fontWeight: "medium" }}
              >
                Paramètres d'objectivité
              </Typography>
              <Box sx={{ space: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 0.5,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Tops participants visibles:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: "medium",
                      color: session.show_participant_tops
                        ? "success.main"
                        : "error.main",
                    }}
                  >
                    {session.show_participant_tops ? "Oui" : "Non"}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 0.5,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Affichage temps réel:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: "medium",
                      color: session.show_tops_realtime
                        ? "success.main"
                        : "error.main",
                    }}
                  >
                    {session.show_tops_realtime ? "Oui" : "Non"}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 0.5,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Mode anonyme:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: "medium",
                      color: session.anonymous_mode
                        ? "success.main"
                        : "error.main",
                    }}
                  >
                    {session.anonymous_mode ? "Oui" : "Non"}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Collapse>

      {/* ✅ REMPLACER toute la zone placeholder par SynchronizedTranscript */}
      <Paper
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          bgcolor: "background.paper",
          mb: 2,
        }}
      >
        {/* Header Phase 3 */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            🎉 Phase 3 - Transcription Synchronisée Temps Réel
          </Typography>
          <Alert severity="success" sx={{ mb: 0 }}>
            <Typography variant="body2">
              <strong>Nouveau !</strong> Vous pouvez maintenant voir la
              transcription synchronisée avec le coach en temps réel. Le
              highlighting et l'auto-scroll suivent la navigation du coach
              instantanément.
            </Typography>
          </Alert>
        </Box>

        {/* Zone transcription temps réel */}
        <Box sx={{ flex: 1, overflow: "hidden" }}>
          <SynchronizedTranscript
            sessionId={session.id}
            callId={session.call_id}
          />
        </Box>
      </Paper>

      {/* ✅ Footer actions - Phase 4/5 aperçu */}
      <Paper sx={{ p: 2, bgcolor: "background.paper" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Prochaines fonctionnalités
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Button disabled variant="outlined" size="small" color="warning">
                ⭐ Toper (Phase 4)
              </Button>
              <Button disabled variant="outlined" size="small" color="info">
                💬 Commenter (Phase 4)
              </Button>
              <Button disabled variant="outlined" size="small" color="success">
                🎯 Critères (Phase 4)
              </Button>
              <Button
                disabled
                variant="outlined"
                size="small"
                startIcon={<BarChartIcon />}
              >
                Statistiques (Phase 5)
              </Button>
            </Box>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary">
              Session active • Synchronisation temps réel ✅
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
