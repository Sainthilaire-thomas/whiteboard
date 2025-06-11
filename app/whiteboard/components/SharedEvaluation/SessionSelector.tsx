// app/whiteboard/components/SharedEvaluation/SessionSelector.tsx
"use client";

import React from "react";
import { Box, Paper, Typography, Button, Chip, useTheme } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { SharedEvaluationSession } from "../../hooks/types";

interface SessionSelectorProps {
  sessions: SharedEvaluationSession[];
  currentSession: SharedEvaluationSession | null;
  onSelectSession: (sessionId: string) => void;
}

export function SessionSelector({
  sessions,
  currentSession,
  onSelectSession,
}: SessionSelectorProps) {
  const theme = useTheme();

  if (sessions.length <= 1) {
    return null;
  }

  return (
    <Box
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        px: 3,
        py: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: "medium", minWidth: "max-content" }}
        >
          Sessions disponibles :
        </Typography>
        <Box sx={{ display: "flex", gap: 1, overflow: "auto", flex: 1 }}>
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              isSelected={currentSession?.id === session.id}
              onClick={() => onSelectSession(session.id)}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}

interface SessionCardProps {
  session: SharedEvaluationSession;
  isSelected: boolean;
  onClick: () => void;
}

function SessionCard({ session, isSelected, onClick }: SessionCardProps) {
  const theme = useTheme();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatusColor = (mode: string) => {
    switch (mode) {
      case "live":
        return "error";
      case "paused":
        return "warning";
      case "ended":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusLabel = (mode: string) => {
    switch (mode) {
      case "live":
        return "En direct";
      case "paused":
        return "En pause";
      case "ended":
        return "Terminée";
      default:
        return "Inconnu";
    }
  };

  return (
    <Button
      onClick={onClick}
      variant={isSelected ? "contained" : "outlined"}
      sx={{
        p: 2,
        minWidth: 280,
        height: "auto",
        textAlign: "left",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 1,
        position: "relative",
        bgcolor: isSelected ? "primary.main" : "background.paper",
        borderColor: isSelected ? "primary.main" : "divider",
        "&:hover": {
          bgcolor: isSelected ? "primary.dark" : "action.hover",
        },
      }}
    >
      {/* Ligne principale avec titre et statut */}
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: "medium",
            flex: 1,
            color: isSelected ? "inherit" : "text.primary",
          }}
        >
          {session.session_name}
        </Typography>
        <Chip
          size="small"
          label={getStatusLabel(session.session_mode)}
          color={getStatusColor(session.session_mode) as any}
          variant={isSelected ? "filled" : "outlined"}
          sx={{
            fontSize: "0.7rem",
            ...(isSelected && {
              bgcolor: "rgba(255,255,255,0.2)",
              color: "inherit",
            }),
          }}
        />
      </Box>

      {/* Ligne détails */}
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}
      >
        <Typography
          variant="caption"
          sx={{
            color: isSelected ? "rgba(255,255,255,0.8)" : "text.secondary",
          }}
        >
          {session.coach_name || "Coach"}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: isSelected ? "rgba(255,255,255,0.6)" : "text.disabled",
          }}
        >
          •
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: isSelected ? "rgba(255,255,255,0.8)" : "text.secondary",
          }}
        >
          {session.call_title || `Appel #${session.call_id}`}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: isSelected ? "rgba(255,255,255,0.6)" : "text.disabled",
          }}
        >
          •
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: isSelected ? "rgba(255,255,255,0.8)" : "text.secondary",
            fontFamily: "monospace",
          }}
        >
          {formatTime(session.audio_position)}
        </Typography>
      </Box>

      {/* Indicateur de sélection */}
      {isSelected && (
        <CheckCircleIcon
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            fontSize: 16,
            color: "rgba(255,255,255,0.9)",
          }}
        />
      )}
    </Button>
  );
}
