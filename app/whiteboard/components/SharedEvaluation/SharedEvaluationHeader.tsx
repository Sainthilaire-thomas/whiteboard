// app/whiteboard/components/SharedEvaluation/SharedEvaluationHeader.tsx
"use client";

import React from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Paper,
  LinearProgress,
  useTheme,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import { SharedEvaluationSession } from "../../hooks/types";
import { SessionStatusDetail } from "./SessionStatusBadge";

interface SharedEvaluationHeaderProps {
  currentSession: SharedEvaluationSession | null;
  activeSessions: SharedEvaluationSession[];
  onBackToWhiteboard: () => void;
  onRefresh: () => Promise<void>;
  isLoading: boolean;
}

export function SharedEvaluationHeader({
  currentSession,
  activeSessions,
  onBackToWhiteboard,
  onRefresh,
  isLoading,
}: SharedEvaluationHeaderProps) {
  const theme = useTheme();

  return (
    <Paper
      sx={{
        borderRadius: 0,
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Informations session courante */}
          <Box sx={{ flex: 1 }}>
            {currentSession ? (
              <Box>
                {/* Titre et coach */}
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}
                >
                  <Typography variant="h4" component="h1" color="text.primary">
                    {currentSession.session_name}
                  </Typography>
                  {activeSessions.length > 1 && (
                    <Chip
                      label={`${activeSessions.length} sessions actives`}
                      color="primary"
                      size="small"
                    />
                  )}
                </Box>

                {/* Détails session */}
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 3, mb: 2 }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <PersonIcon
                      sx={{ fontSize: 18, color: "text.secondary" }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Coach: {currentSession.coach_name || "Chargement..."}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <PhoneIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                    <Typography variant="body2" color="text.secondary">
                      {currentSession.call_title ||
                        `Appel #${currentSession.call_id}`}
                    </Typography>
                  </Box>
                </Box>

                {/* État de la session */}
                <SessionStatusDetail session={currentSession} />
              </Box>
            ) : (
              <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                  Sessions d'évaluation partagées
                </Typography>
                <Typography color="text.secondary">
                  {activeSessions.length} session
                  {activeSessions.length > 1 ? "s" : ""} active
                  {activeSessions.length > 1 ? "s" : ""}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Contrôles */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Bouton actualiser */}
            <IconButton
              onClick={onRefresh}
              disabled={isLoading}
              title="Actualiser les sessions"
              color="primary"
            >
              <RefreshIcon />
            </IconButton>

            {/* Bouton retour */}
            <Button
              onClick={onBackToWhiteboard}
              variant="outlined"
              startIcon={<ArrowBackIcon />}
            >
              Retour au whiteboard
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Barre de progression pour session en cours (si en live) */}
      {currentSession && currentSession.session_mode === "live" && (
        <Box sx={{ px: 3, pb: 2 }}>
          <Box sx={{ pt: 2, borderTop: 1, borderColor: "divider" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
              <Typography
                variant="body2"
                color="error.main"
                sx={{ fontWeight: "bold" }}
              >
                Session en direct
              </Typography>
              <Box sx={{ flex: 1 }}>
                <LinearProgress
                  color="error"
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: "error.light",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 3,
                      animation: "pulse 2s infinite",
                      "@keyframes pulse": {
                        "0%, 100%": { opacity: 1 },
                        "50%": { opacity: 0.7 },
                      },
                    },
                  }}
                />
              </Box>
              <Typography
                variant="body2"
                color="error.main"
                sx={{ fontWeight: "bold" }}
              >
                LIVE
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Paper>
  );
}
