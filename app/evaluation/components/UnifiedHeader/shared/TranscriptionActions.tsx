// 📁 app/evaluation/components/UnifiedHeader/shared/TranscriptionActions.tsx
"use client";

import React from "react";
import { IconButton, Tooltip, Box } from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";
import { useAudio } from "@/context/AudioContext";
// IMPORT DU COMPOSANT EXISTANT
import AddPostitButton from "./AddPostitButton";
import { TranscriptionActionsProps } from "../unifiedHeader.types";

export default function TranscriptionActions({
  currentWord,
  selectedCall,
  onAddPostit, // Paramètre ignoré maintenant
  onRefresh,
}: TranscriptionActionsProps) {
  const { audioRef } = useAudio();

  return (
    <>
      {/* Ajouter Post-it - UTILISER LE COMPOSANT EXISTANT */}
      {currentWord && selectedCall && (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <AddPostitButton
            timestamp={Math.floor(audioRef.current?.currentTime || 0)}
          />
        </Box>
      )}

      {/* Rafraîchir */}
      <Tooltip title="Rafraîchir la transcription">
        <IconButton
          size="small"
          onClick={onRefresh}
          sx={{
            color: "text.secondary",
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <RefreshIcon />
        </IconButton>
      </Tooltip>
    </>
  );
}
