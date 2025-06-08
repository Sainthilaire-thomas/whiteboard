"use client";

import React from "react";
import { IconButton, Tooltip, Box, Divider, Typography } from "@mui/material";
import {
  Save as SaveIcon,
  TextIncrease,
  TextDecrease,
  Mic,
  MicOff,
} from "@mui/icons-material";

interface ContextualActionsProps {
  view: string | null;
  onSave: () => void;
  // Nouvelles props pour FourZones
  fontSize?: number;
  increaseFontSize?: () => void;
  decreaseFontSize?: () => void;
  speechToTextVisible?: boolean;
  toggleSpeechToText?: () => void;
  isLoadingRolePlay?: boolean;
  selectedPostitForRolePlay?: any;
}

export default function ContextualActions({
  view,
  onSave,
  fontSize,
  increaseFontSize,
  decreaseFontSize,
  speechToTextVisible,
  toggleSpeechToText,
  isLoadingRolePlay,
  selectedPostitForRolePlay,
}: ContextualActionsProps) {
  return (
    <>
      {/* Actions spécifiques selon le module */}
      {view === "synthese" && (
        <Tooltip title="Sauvegarder l'évaluation">
          <IconButton
            size="small"
            onClick={onSave}
            sx={{
              bgcolor: "success.50",
              color: "success.main",
              "&:hover": { bgcolor: "success.100" },
            }}
          >
            <SaveIcon />
          </IconButton>
        </Tooltip>
      )}

      {/* Actions pour le jeu de rôle */}
      {view === "roleplay" && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Contrôles de taille de police */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Tooltip title="Diminuer la taille du texte">
              <IconButton
                size="small"
                onClick={decreaseFontSize}
                disabled={fontSize ? fontSize <= 10 : false}
                sx={{
                  bgcolor: "grey.50",
                  color: "grey.600",
                  "&:hover": { bgcolor: "grey.100" },
                }}
              >
                <TextDecrease fontSize="small" />
              </IconButton>
            </Tooltip>

            <Typography
              variant="caption"
              sx={{
                minWidth: 24,
                textAlign: "center",
                fontSize: "0.75rem",
                fontWeight: 500,
              }}
            >
              {fontSize}
            </Typography>

            <Tooltip title="Augmenter la taille du texte">
              <IconButton
                size="small"
                onClick={increaseFontSize}
                disabled={fontSize ? fontSize >= 24 : false}
                sx={{
                  bgcolor: "grey.50",
                  color: "grey.600",
                  "&:hover": { bgcolor: "grey.100" },
                }}
              >
                <TextIncrease fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <Divider
            orientation="vertical"
            flexItem
            sx={{ height: 24, mx: 0.5 }}
          />

          {/* Reconnaissance vocale */}
          <Tooltip
            title={
              speechToTextVisible
                ? "Masquer reconnaissance vocale"
                : "Afficher reconnaissance vocale"
            }
          >
            <IconButton
              size="small"
              onClick={toggleSpeechToText}
              sx={{
                bgcolor: speechToTextVisible ? "primary.50" : "grey.50",
                color: speechToTextVisible ? "primary.main" : "grey.600",
                "&:hover": {
                  bgcolor: speechToTextVisible ? "primary.100" : "grey.100",
                },
              }}
            >
              {speechToTextVisible ? (
                <Mic fontSize="small" />
              ) : (
                <MicOff fontSize="small" />
              )}
            </IconButton>
          </Tooltip>

          <Divider
            orientation="vertical"
            flexItem
            sx={{ height: 24, mx: 0.5 }}
          />

          {/* Bouton sauvegarder */}
          <Tooltip title="Sauvegarder le jeu de rôle">
            <IconButton
              size="small"
              onClick={onSave}
              disabled={Boolean(isLoadingRolePlay)}
              sx={{
                bgcolor: "success.50",
                color: "success.main",
                "&:hover": { bgcolor: "success.100" },
                "&:disabled": {
                  bgcolor: "grey.100",
                  color: "grey.400",
                },
              }}
            >
              <SaveIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* Ici on pourrait ajouter d'autres actions selon le view */}
      {/* {view === "postit" && (...)} */}
    </>
  );
}
