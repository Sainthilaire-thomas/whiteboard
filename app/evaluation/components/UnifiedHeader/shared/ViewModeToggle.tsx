"use client";

import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import {
  FormatAlignLeft as FormatAlignLeftIcon,
  TextFormat as TextFormatIcon,
} from "@mui/icons-material";

interface ViewModeToggleProps {
  viewMode: "word" | "paragraph";
  onToggle: () => void;
  size?: "small" | "medium"; // Pour s'adapter au contexte
}

export default function ViewModeToggle({
  viewMode,
  onToggle,
  size = "medium",
}: ViewModeToggleProps) {
  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onToggle();
  };

  const tooltipText =
    viewMode === "word"
      ? "Passer à la vue par paragraphe"
      : "Passer à la vue par mot";

  const currentModeText = viewMode === "word" ? "par mot" : "par paragraphe";

  return (
    <Tooltip
      title={`${tooltipText} (actuellement ${currentModeText})`}
      placement="bottom"
    >
      <IconButton
        className="header-action"
        size={size}
        onClick={handleClick}
        sx={{
          bgcolor: "primary.50",
          color: "primary.main",
          "&:hover": {
            bgcolor: "primary.100",
            transform: "scale(1.05)", // Petit effet de zoom au hover
          },
          transition: "all 0.2s ease",
        }}
      >
        {viewMode === "word" ? (
          <FormatAlignLeftIcon
            fontSize={size === "small" ? "small" : "medium"}
          />
        ) : (
          <TextFormatIcon fontSize={size === "small" ? "small" : "medium"} />
        )}
      </IconButton>
    </Tooltip>
  );
}
