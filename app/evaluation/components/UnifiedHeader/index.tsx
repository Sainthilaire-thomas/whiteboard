// 📁 app/evaluation/components/UnifiedHeader/index.tsx
"use client";

import React from "react";
import { Box } from "@mui/material";
import TranscriptionHeader from "./TranscriptionHeader";
import ContextualHeader from "./ContextualHeader";

interface UnifiedHeaderProps {
  // Transcription props
  shouldShowTranscript: boolean;
  displayMode: "normal" | "transcript-fullwidth" | "context-fullwidth";
  selectedCall: any;
  viewMode: "word" | "paragraph";
  currentWord: any;
  hasRightPanel: boolean;
  shouldShowContext: boolean;

  // NOUVELLES PROPS pour la coloration
  highlightTurnOne?: boolean;
  highlightSpeakers?: boolean;

  // Actions transcription
  onToggleViewMode: () => void;
  onToggleHighlightTurnOne?: () => void; // NOUVELLE ACTION
  onToggleHighlightSpeakers?: () => void; // NOUVELLE ACTION
  onRefreshTranscription: () => void;
  onAddPostit: () => void;
  onSetTranscriptFullWidth: () => void;
  onToggleRightPanel: () => void;

  // Contextual props
  view: string | null;
  filteredDomains: any[];
  selectedDomain: string;
  contextPanels: Record<string, { width: number | string }>;

  // Actions contextuelles
  onDomainChange: (event: any) => void;
  onSave: () => void;
  onSetContextFullWidth: () => void;
  onClosePanel: () => void;
}

export default function UnifiedHeader({
  shouldShowTranscript,
  displayMode,
  selectedCall,
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
}: UnifiedHeaderProps) {
  return (
    <Box
      sx={{
        display: "flex",
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        minHeight: 64,
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        position: "sticky", // AJOUT
        top: 0, // AJOUT
        zIndex: 100, // AJOUT
      }}
    >
      {/* VOLET TRANSCRIPTION */}
      {shouldShowTranscript && (
        <TranscriptionHeader
          displayMode={displayMode}
          shouldShowContext={shouldShowContext}
          selectedCall={selectedCall}
          viewMode={viewMode}
          currentWord={currentWord}
          hasRightPanel={hasRightPanel}
          // NOUVELLES PROPS de coloration
          highlightTurnOne={highlightTurnOne}
          highlightSpeakers={highlightSpeakers}
          // Actions
          onToggleViewMode={onToggleViewMode}
          onToggleHighlightTurnOne={onToggleHighlightTurnOne}
          onToggleHighlightSpeakers={onToggleHighlightSpeakers}
          onRefreshTranscription={onRefreshTranscription}
          onAddPostit={onAddPostit}
          onSetTranscriptFullWidth={onSetTranscriptFullWidth}
          onToggleRightPanel={onToggleRightPanel}
        />
      )}

      {/* VOLET CONTEXTUEL */}
      {shouldShowContext && (
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
        />
      )}
    </Box>
  );
}
