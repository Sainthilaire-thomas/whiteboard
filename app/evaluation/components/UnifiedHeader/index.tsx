"use client";

import React from "react";
import { Box, Divider } from "@mui/material";
import TranscriptionHeader from "./TranscriptionHeader";
import ContextualHeader from "./ContextualHeader";
import { UnifiedHeaderProps } from "./unifiedHeader.types";

export default function UnifiedHeader({
  shouldShowTranscript,
  displayMode,
  selectedCall,
  evaluationStats, // ✅ Nouvelle prop
  viewMode,
  currentWord,
  hasRightPanel,
  shouldShowContext,
  highlightTurnOne = false,
  highlightSpeakers = true,
  onToggleViewMode,
  onToggleHighlightTurnOne,
  onToggleHighlightSpeakers,
  onRefreshTranscription,
  onAddPostit,
  onSetTranscriptFullWidth,
  onToggleRightPanel,
  view,
  filteredDomains,
  selectedDomain,
  contextPanels,
  onDomainChange,
  onSave,
  onSetContextFullWidth,
  onClosePanel,
  onNavigateToSynthese, // ✅ NOUVELLE PROP
  fontSize,
  increaseFontSize,
  decreaseFontSize,
  speechToTextVisible,
  toggleSpeechToText,
  isLoadingRolePlay,
  selectedPostitForRolePlay,
}: UnifiedHeaderProps) {
  // ✅ Debug logs
  console.log("🔍 UnifiedHeader - Passing to ContextualHeader:", {
    view,
    selectedCall: selectedCall
      ? { callid: selectedCall.callid, description: selectedCall.description }
      : null,
    evaluationStats,
  });

  return (
    <Box
      sx={{
        display: "flex",
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        minHeight: 64,
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      {/* VOLET TRANSCRIPTION */}
      <Box
        sx={{
          flex: 1,
          display: shouldShowTranscript ? "flex" : "none",
        }}
      >
        <TranscriptionHeader
          displayMode={displayMode}
          shouldShowContext={shouldShowContext}
          selectedCall={selectedCall}
          viewMode={viewMode}
          currentWord={currentWord}
          hasRightPanel={hasRightPanel}
          highlightTurnOne={highlightTurnOne}
          highlightSpeakers={highlightSpeakers}
          onToggleViewMode={onToggleViewMode}
          onToggleHighlightTurnOne={onToggleHighlightTurnOne}
          onToggleHighlightSpeakers={onToggleHighlightSpeakers}
          onRefreshTranscription={onRefreshTranscription}
          onAddPostit={onAddPostit}
          onSetTranscriptFullWidth={onSetTranscriptFullWidth}
          onToggleRightPanel={onToggleRightPanel}
        />
      </Box>

      {/* SÉPARATEUR VERTICAL - aligné avec le contenu */}
      {shouldShowTranscript && shouldShowContext && (
        <Divider
          orientation="vertical"
          sx={{
            borderColor: "divider",
            alignSelf: "stretch",
          }}
        />
      )}

      {/* VOLET CONTEXTUEL */}
      {shouldShowContext && (
        <Box
          sx={{
            // FIX: Utiliser la même logique de flex que le contenu
            flex: displayMode === "context-fullwidth" ? 1 : "0 0 55%",
          }}
        >
          <ContextualHeader
            displayMode={displayMode}
            view={view}
            filteredDomains={filteredDomains}
            selectedDomain={selectedDomain}
            contextPanels={contextPanels}
            onDomainChange={onDomainChange}
            onSave={onSave}
            onSetContextFullWidth={onSetContextFullWidth}
            onClosePanel={onClosePanel}
            fontSize={fontSize}
            increaseFontSize={increaseFontSize}
            decreaseFontSize={decreaseFontSize}
            speechToTextVisible={speechToTextVisible}
            toggleSpeechToText={toggleSpeechToText}
            isLoadingRolePlay={isLoadingRolePlay}
            selectedPostitForRolePlay={selectedPostitForRolePlay}
            // ✅ NOUVELLES PROPS pour la synthèse
            selectedCall={selectedCall}
            evaluationStats={evaluationStats}
            onNavigateToSynthese={onNavigateToSynthese}
          />
        </Box>
      )}
    </Box>
  );
}
