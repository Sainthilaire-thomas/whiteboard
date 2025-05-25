"use client";

import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import { Palette as PaletteIcon } from "@mui/icons-material";

interface ColorationToggleProps {
  viewMode: "word" | "paragraph";
  highlightTurnOne?: boolean;
  highlightSpeakers?: boolean;
  onToggleHighlightTurnOne?: () => void;
  onToggleHighlightSpeakers?: () => void;
  size?: "small" | "medium"; // Pour s'adapter au contexte
}

export default function ColorationToggle({
  viewMode,
  highlightTurnOne = false,
  highlightSpeakers = true,
  onToggleHighlightTurnOne,
  onToggleHighlightSpeakers,
  size = "medium",
}: ColorationToggleProps) {
  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (viewMode === "word" && onToggleHighlightTurnOne) {
      onToggleHighlightTurnOne();
    } else if (viewMode === "paragraph" && onToggleHighlightSpeakers) {
      onToggleHighlightSpeakers();
    }
  };

  // Déterminer l'état actif selon le mode
  const isActive = viewMode === "word" ? highlightTurnOne : highlightSpeakers;

  // Déterminer le tooltip selon le mode
  const tooltipText =
    viewMode === "word"
      ? `${
          isActive ? "Désactiver" : "Activer"
        } la coloration des tours de parole`
      : `${isActive ? "Désactiver" : "Activer"} la coloration des locuteurs`;

  // Ne rien afficher si pas de handler disponible
  if (
    (viewMode === "word" && !onToggleHighlightTurnOne) ||
    (viewMode === "paragraph" && !onToggleHighlightSpeakers)
  ) {
    return null;
  }

  return (
    <Tooltip title={tooltipText} placement="bottom">
      <IconButton
        className="header-action"
        onClick={handleClick}
        size={size}
        sx={{
          color: isActive ? "primary.main" : "text.secondary",
          backgroundColor: isActive ? "primary.50" : "transparent",
          "&:hover": {
            backgroundColor: isActive ? "primary.100" : "action.hover",
            color: "primary.main",
          },
          transition: "all 0.2s ease",
        }}
      >
        <PaletteIcon fontSize={size === "small" ? "small" : "medium"} />
      </IconButton>
    </Tooltip>
  );
}
