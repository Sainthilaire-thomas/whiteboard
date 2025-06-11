// app/whiteboard/components/SharedEvaluation/SessionStatusBadge.tsx
"use client";

import React from "react";
import { Box, Chip, Typography, useTheme } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { SharedEvaluationSession } from "../../hooks/types";

interface SessionStatusBadgeProps {
  mode: SharedEvaluationSession["session_mode"];
  className?: string;
}

export function SessionStatusBadge({
  mode,
  className = "",
}: SessionStatusBadgeProps) {
  const theme = useTheme();

  const getStatusConfig = (mode: SharedEvaluationSession["session_mode"]) => {
    switch (mode) {
      case "live":
        return {
          label: "En direct",
          color: "error" as const,
          icon: "🔴",
          animated: true,
        };
      case "paused":
        return {
          label: "En pause",
          color: "warning" as const,
          icon: "⏸️",
          animated: false,
        };
      case "ended":
        return {
          label: "Terminée",
          color: "default" as const,
          icon: "⏹️",
          animated: false,
        };
      default:
        return {
          label: "Inconnu",
          color: "default" as const,
          icon: "❓",
          animated: false,
        };
    }
  };

  const config = getStatusConfig(mode);

  return (
    <Chip
      label={
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Indicateur visuel animé pour "live" */}
          <Box
            sx={{ position: "relative", display: "flex", alignItems: "center" }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor:
                  config.color === "error"
                    ? "error.main"
                    : config.color === "warning"
                      ? "warning.main"
                      : "grey.500",
                ...(config.animated && {
                  animation: "pulse 2s infinite",
                  "@keyframes pulse": {
                    "0%, 100%": { opacity: 1 },
                    "50%": { opacity: 0.5 },
                  },
                }),
              }}
            />
            {config.animated && (
              <Box
                sx={{
                  position: "absolute",
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: "error.main",
                  animation: "ping 2s infinite",
                  "@keyframes ping": {
                    "0%": { transform: "scale(1)", opacity: 1 },
                    "75%, 100%": { transform: "scale(2)", opacity: 0 },
                  },
                }}
              />
            )}
          </Box>
          <Typography variant="body2" component="span">
            {config.label}
          </Typography>
          <Typography variant="body2" component="span" sx={{ opacity: 0.7 }}>
            {config.icon}
          </Typography>
        </Box>
      }
      color={config.color}
      variant="outlined"
      className={className}
    />
  );
}

// Composant utilitaire pour afficher l'état avec plus de détails
interface SessionStatusDetailProps {
  session: SharedEvaluationSession;
  showTimestamp?: boolean;
  className?: string;
}

export function SessionStatusDetail({
  session,
  showTimestamp = true,
  className = "",
}: SessionStatusDetailProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box
      className={className}
      sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}
    >
      <SessionStatusBadge mode={session.session_mode} />

      <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
        {/* Position audio */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <AccessTimeIcon sx={{ fontSize: 16, color: "text.secondary" }} />
          <Typography variant="body2" color="text.secondary">
            {formatTime(session.audio_position)}
          </Typography>
        </Box>

        {/* Timestamp de création */}
        {showTimestamp && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <CalendarTodayIcon sx={{ fontSize: 16, color: "text.secondary" }} />
            <Typography variant="body2" color="text.secondary">
              Créée {formatDateTime(session.created_at)}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
