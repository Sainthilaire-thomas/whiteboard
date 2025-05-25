"use client";

import React from "react";
import { IconButton, Tooltip } from "@mui/material";

interface DisplayActionsProps {
  displayMode: "normal" | "transcript-fullwidth" | "context-fullwidth";
  onSetTranscriptFullWidth?: () => void;
  onSetContextFullWidth?: () => void;
  onClosePanel?: () => void;
  hasRightPanel?: boolean;
  shouldShowContext?: boolean;
  type: "transcription" | "contextual";
  size?: "small" | "medium";
}

export default function DisplayActions({
  displayMode,
  onSetTranscriptFullWidth,
  onSetContextFullWidth,
  onClosePanel,
  hasRightPanel,
  shouldShowContext,
  type,
  size = "medium",
}: DisplayActionsProps) {
  const isTranscriptFullWidth = displayMode === "transcript-fullwidth";
  const isContextFullWidth = displayMode === "context-fullwidth";

  const handleClick = (callback: () => void) => (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    callback();
  };

  return (
    <>
      {/* Plein écran transcription */}
      {type === "transcription" && onSetTranscriptFullWidth && (
        <Tooltip
          title={
            isTranscriptFullWidth
              ? "Revenir à la vue normale"
              : shouldShowContext
              ? "Masquer le panneau droit"
              : "Transcription plein écran"
          }
          placement="bottom"
        >
          <IconButton
            className="header-action"
            size={size}
            onClick={handleClick(onSetTranscriptFullWidth)}
            sx={{
              bgcolor: isTranscriptFullWidth ? "primary.main" : "transparent",
              color: isTranscriptFullWidth ? "white" : "text.secondary",
              "&:hover": {
                bgcolor: isTranscriptFullWidth
                  ? "primary.dark"
                  : "action.hover",
                transform: "scale(1.05)",
              },
              transition: "all 0.2s ease",
            }}
          >
            <FullScreenIcon />
          </IconButton>
        </Tooltip>
      )}

      {/* Plein écran contextuel */}
      {type === "contextual" && onSetContextFullWidth && (
        <Tooltip
          title={isContextFullWidth ? "Vue normale" : "Panneau plein écran"}
          placement="bottom"
        >
          <IconButton
            className="header-action"
            size={size}
            onClick={handleClick(onSetContextFullWidth)}
            sx={{
              bgcolor: isContextFullWidth ? "secondary.main" : "transparent",
              color: isContextFullWidth ? "white" : "text.secondary",
              "&:hover": {
                bgcolor: isContextFullWidth ? "secondary.dark" : "action.hover",
                transform: "scale(1.05)",
              },
              transition: "all 0.2s ease",
            }}
          >
            <FullScreenIcon />
          </IconButton>
        </Tooltip>
      )}

      {/* Fermer panneau contextuel */}
      {type === "contextual" && onClosePanel && (
        <Tooltip title="Fermer le panneau" placement="bottom">
          <IconButton
            className="header-action"
            size={size}
            onClick={handleClick(onClosePanel)}
            sx={{
              color: "text.secondary",
              "&:hover": {
                bgcolor: "action.hover",
                color: "error.main",
                transform: "scale(1.05)",
              },
              transition: "all 0.2s ease",
            }}
          >
            <CloseIcon />
          </IconButton>
        </Tooltip>
      )}
    </>
  );
}

// Icônes utilitaires (inchangées)
const FullScreenIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
);
