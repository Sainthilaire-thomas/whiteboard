"use client";

import React from "react";
import { Box, Divider, IconButton, Tooltip } from "@mui/material";
import { Assessment } from "@mui/icons-material";
import TitleSection from "./shared/TitleSection";
import DomainSelector from "./shared/DomainSelector";
import ContextualActions from "./shared/ContextualActions";
import DisplayActions from "./shared/DisplayActions";
import { ContextualHeaderProps } from "./unifiedHeader.types";

export default function ContextualHeader({
  displayMode,
  view,
  filteredDomains,
  selectedDomain,
  contextPanels,
  onDomainChange,
  onSave,
  onSetContextFullWidth,
  onClosePanel,
  fontSize,
  increaseFontSize,
  decreaseFontSize,
  speechToTextVisible,
  toggleSpeechToText,
  isLoadingRolePlay,
  selectedPostitForRolePlay,
  onNavigateToSynthese,
}: ContextualHeaderProps) {
  const getViewConfig = (view: string | null) => {
    switch (view) {
      case "selection":
        return { title: "Sélection", color: "info.main" };
      case "synthese":
        return { title: "Synthèse d'évaluation", color: "secondary.main" };
      case "postit":
        return { title: "Détail Post-it", color: "warning.main" };
      case "roleplay":
        return {
          title: selectedPostitForRolePlay
            ? `Jeu de rôle: ${selectedPostitForRolePlay.pratique || "Passage"}`
            : "Simulation de coaching",
          color: "success.main",
        };
      default:
        return { title: "Panneau", color: "grey.main" };
    }
  };

  const viewConfig = getViewConfig(view);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 3,
        py: 1.5,
        bgcolor: "background.default",
        minWidth: 0,
      }}
    >
      {/* Titre et contexte */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 0 }}>
        <TitleSection title={viewConfig.title} accentColor={viewConfig.color} />

        {/* Sélecteur de domaine pour la synthèse et postit */}
        {(view === "synthese" || view === "postit") &&
          filteredDomains.length > 0 && (
            <DomainSelector
              domains={filteredDomains}
              selectedDomain={selectedDomain}
              onChange={onDomainChange}
            />
          )}
      </Box>

      {/* Actions */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {/* ✅ NOUVEAU : Bouton Synthèse (affiché seulement si pas déjà sur la synthèse) */}
        {view !== "synthese" && onNavigateToSynthese && (
          <>
            <Tooltip title="Voir la synthèse d'évaluation">
              <IconButton
                onClick={onNavigateToSynthese}
                size="small"
                sx={{
                  color: "secondary.main",
                  "&:hover": {
                    bgcolor: "secondary.light",
                    color: "white",
                  },
                }}
              >
                <Assessment />
              </IconButton>
            </Tooltip>
            <Divider
              orientation="vertical"
              flexItem
              sx={{ mx: 1, height: 24 }}
            />
          </>
        )}

        <ContextualActions
          view={view}
          onSave={onSave}
          fontSize={fontSize}
          increaseFontSize={increaseFontSize}
          decreaseFontSize={decreaseFontSize}
          speechToTextVisible={speechToTextVisible}
          toggleSpeechToText={toggleSpeechToText}
          isLoadingRolePlay={isLoadingRolePlay}
          selectedPostitForRolePlay={selectedPostitForRolePlay}
        />

        <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 24 }} />

        <DisplayActions
          displayMode={displayMode}
          onSetContextFullWidth={onSetContextFullWidth}
          onClosePanel={onClosePanel}
          type="contextual"
        />
      </Box>
    </Box>
  );
}
