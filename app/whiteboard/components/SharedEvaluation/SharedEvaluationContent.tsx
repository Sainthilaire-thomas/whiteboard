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
    <Box sx={{ maxWidth: 1000, mx: "auto", p: 2 }}>
      {/* Statut session principal */}
      <Paper
        sx={{ p: 3, textAlign: "center", mb: 2, bgcolor: "background.paper" }}
      >
        <Box sx={{ mb: 2 }}>{getStatusIcon(session.session_mode)}</Box>

        <Typography variant="h4" gutterBottom>
          Session d'évaluation en cours
        </Typography>

        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {getStatusMessage(session.session_mode)}
        </Typography>

        {/* Métriques clés */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={4}>
            <Paper
              variant="outlined"
              sx={{ p: 2, bgcolor: "background.default" }}
            >
              <Typography variant="h4" color="primary.main">
                {formatTime(session.audio_position)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Position actuelle
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper
              variant="outlined"
              sx={{ p: 2, bgcolor: "background.default" }}
            >
              <Typography variant="h4">
                {session.session_mode === "live"
                  ? "🔴"
                  : session.session_mode === "paused"
                    ? "⏸️"
                    : "⏹️"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                État de la session
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper
              variant="outlined"
              sx={{ p: 2, bgcolor: "background.default" }}
            >
              <Typography variant="h4" color="primary.main">
                #{session.call_id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Appel évalué
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Bouton pour afficher plus de détails */}
        <Button
          onClick={() => setShowDetails(!showDetails)}
          endIcon={showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          variant="text"
        >
          {showDetails ? "Masquer les détails" : "Voir plus de détails"}
        </Button>
      </Paper>

      {/* Détails étendus */}
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

      {/* Zone principale - Placeholder pour Phase 3 */}
      <Paper
        sx={{ p: 3, textAlign: "center", mb: 2, bgcolor: "background.paper" }}
      >
        <Typography variant="h5" gutterBottom>
          Audio et transcription synchronisés
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Cette zone affichera l'audio et la transcription synchronisés avec le
          coach en Phase 3.
        </Typography>

        {/* Aperçu de l'interface future */}
        <Box sx={{ maxWidth: 600, mx: "auto" }}>
          {/* Lecteur audio mockup */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              mb: 1,
              border: "2px dashed",
              borderColor: "divider",
              bgcolor: "background.default",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Lecteur audio synchronisé (Phase 3)
            </Typography>
          </Paper>

          {/* Transcription mockup */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              mb: 1,
              border: "2px dashed",
              borderColor: "divider",
              bgcolor: "background.default",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Transcription synchronisée avec possibilité de "toper" (Phase 3)
            </Typography>
          </Paper>

          {/* Zone d'actions participants mockup */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              border: "2px dashed",
              borderColor: "divider",
              bgcolor: "background.default",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 1,
                mb: 1,
                flexWrap: "wrap",
              }}
            >
              <Button disabled variant="outlined" color="warning" size="small">
                ⭐ Toper ce passage
              </Button>
              <Button disabled variant="outlined" color="info" size="small">
                💬 Ajouter commentaire
              </Button>
              <Button disabled variant="outlined" color="success" size="small">
                🎯 Identifier critère
              </Button>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Actions participants (Phase 4)
            </Typography>
          </Paper>
        </Box>

        {/* Instructions */}
        <Alert severity="info" sx={{ mt: 2, textAlign: "left" }}>
          <Typography variant="subtitle2" gutterBottom>
            🚧 Phase 2 - Affichage basique
          </Typography>
          <Typography variant="body2">
            Vous pouvez voir que la session est active et suivre son état. La
            synchronisation audio/transcription et les interactions participant
            seront disponibles dans les prochaines phases.
          </Typography>
        </Alert>
      </Paper>

      {/* Footer avec actions */}
      <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
        <Button
          variant="outlined"
          onClick={onRefresh}
          startIcon={<RefreshIcon />}
        >
          Actualiser
        </Button>
        <Button disabled variant="outlined" startIcon={<BarChartIcon />}>
          Voir les statistiques (Phase 5)
        </Button>
      </Box>
    </Box>
  );
}
