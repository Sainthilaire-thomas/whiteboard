"use client";

import React from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import TitleSection from "./shared/TitleSection";
import CallInfo from "./shared/CallInfo";
import ViewModeToggle from "./shared/ViewModeToggle";
import ColorationToggle from "./shared/ColorationToggle";
import TranscriptionActions from "./shared/TranscriptionActions";
import { ShareEvaluationButton } from "../ShareEvaluationButton";
import DisplayActions from "./shared/DisplayActions";
import { Divider } from "@mui/material";

interface TranscriptionHeaderProps {
  displayMode: "normal" | "transcript-fullwidth" | "context-fullwidth";
  shouldShowContext: boolean;
  selectedCall: any;
  viewMode: "word" | "paragraph";
  currentWord: any;
  hasRightPanel: boolean;

  // Props pour la coloration
  highlightTurnOne?: boolean;
  highlightSpeakers?: boolean;

  // Actions
  onToggleViewMode: () => void;
  onToggleHighlightTurnOne?: () => void;
  onToggleHighlightSpeakers?: () => void;
  onRefreshTranscription: () => void;
  onAddPostit: () => void;
  onSetTranscriptFullWidth: () => void;
  onToggleRightPanel: () => void;
}

export default function TranscriptionHeader({
  displayMode,
  shouldShowContext,
  selectedCall,
  viewMode,
  currentWord,
  hasRightPanel,
  highlightTurnOne = false,
  highlightSpeakers = true,
  onToggleViewMode,
  onToggleHighlightTurnOne,
  onToggleHighlightSpeakers,
  onRefreshTranscription,
  onAddPostit,
  onSetTranscriptFullWidth,
  onToggleRightPanel,
}: TranscriptionHeaderProps) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("lg")); // < 1200px
  const isVerySmallScreen = useMediaQuery(theme.breakpoints.down("md")); // < 900px

  // 🔧 Gestion sécurisée du callId
  const callId =
    selectedCall?.callid || selectedCall?.id || selectedCall?.call_id;

  // Debug log pour comprendre la structure de selectedCall
  console.log("🔍 DEBUG TranscriptionHeader:", {
    selectedCall: selectedCall,
    callId: callId,
    hasSelectedCall: !!selectedCall,
    selectedCallKeys: selectedCall ? Object.keys(selectedCall) : [],
  });

  return (
    <Box
      sx={{
        flex: displayMode === "transcript-fullwidth" ? 1 : 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: shouldShowContext ? 1.5 : 3, // Réduire le padding quand les deux panels sont affichés
        py: 1.5,
        borderRight: shouldShowContext ? "2px solid" : "none",
        borderColor: "primary.main",
        bgcolor: shouldShowContext ? "primary.50" : "background.paper",
        transition: "all 0.2s ease",
        minWidth: 0, // Permet la compression
        overflow: "hidden", // Évite le débordement
      }}
    >
      {/* Section titre - compressible */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: shouldShowContext ? 1 : 2,
          minWidth: 0,
          flex: shouldShowContext ? "0 1 auto" : "0 0 auto", // Permet la compression quand nécessaire
          maxWidth: shouldShowContext ? "200px" : "none", // Limite la largeur quand les deux panels sont visibles
        }}
      >
        <TitleSection
          title="Transcription"
          accentColor="primary.main"
          compact={shouldShowContext} // Passer un prop pour un mode compact
        />
        {selectedCall && !isVerySmallScreen && (
          <CallInfo call={selectedCall} compact={shouldShowContext} />
        )}
      </Box>

      {/* Section actions - adaptative */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: shouldShowContext ? 0.5 : 1,
          flexShrink: 0, // Les actions ne se compriment pas
        }}
      >
        {/* Groupe 1: Contrôles de vue */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <ViewModeToggle
            viewMode={viewMode}
            onToggle={onToggleViewMode}
            size={shouldShowContext ? "small" : "medium"}
          />

          {!isSmallScreen && (
            <ColorationToggle
              viewMode={viewMode}
              highlightTurnOne={highlightTurnOne}
              highlightSpeakers={highlightSpeakers}
              onToggleHighlightTurnOne={onToggleHighlightTurnOne}
              onToggleHighlightSpeakers={onToggleHighlightSpeakers}
              size={shouldShowContext ? "small" : "medium"} // S'adapte au contexte
            />
          )}
        </Box>

        <Divider
          orientation="vertical"
          flexItem
          sx={{
            mx: shouldShowContext ? 0.5 : 1,
            height: shouldShowContext ? 20 : 24,
          }}
        />

        {/* Groupe 2: Actions transcription */}
        {!isVerySmallScreen && (
          <>
            <TranscriptionActions
              currentWord={currentWord}
              selectedCall={selectedCall}
              onAddPostit={onAddPostit}
              onRefresh={onRefreshTranscription}
              size={shouldShowContext ? "small" : "medium"}
            />

            {/* 🔧 N'afficher le bouton de partage que si callId est disponible */}
            {callId && (
              <ShareEvaluationButton callId={callId} sx={{ ml: "auto" }} />
            )}

            <Divider
              orientation="vertical"
              flexItem
              sx={{
                mx: shouldShowContext ? 0.5 : 1,
                height: shouldShowContext ? 20 : 24,
              }}
            />
          </>
        )}

        {/* Groupe 3: Actions d'affichage - toujours visibles */}
        <DisplayActions
          displayMode={displayMode}
          hasRightPanel={hasRightPanel}
          shouldShowContext={shouldShowContext}
          onSetTranscriptFullWidth={onSetTranscriptFullWidth}
          type="transcription"
          size={shouldShowContext ? "small" : "medium"}
        />
      </Box>
    </Box>
  );
}
