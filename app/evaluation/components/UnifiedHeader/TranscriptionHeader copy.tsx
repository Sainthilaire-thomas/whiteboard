// 📁 app/evaluation/components/UnifiedHeader/TranscriptionHeader.tsx
"use client";

import React from "react";
import { Box } from "@mui/material";
import TitleSection from "./shared/TitleSection";
import CallInfo from "./shared/CallInfo";
import ViewModeToggle from "./shared/ViewModeToggle";
import TranscriptionActions from "./shared/TranscriptionActions";
import ColorationToggle from "./shared/ColorationToggle";
import DisplayActions from "./shared/DisplayActions";
import { Divider } from "@mui/material";

interface TranscriptionHeaderProps {
  displayMode: "normal" | "transcript-fullwidth" | "context-fullwidth";
  shouldShowContext: boolean;
  selectedCall: any;
  viewMode: "word" | "paragraph";
  currentWord: any;
  hasRightPanel: boolean;
  highlightTurnOne?: boolean;
  highlightSpeakers?: boolean;
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
  return (
    <Box
      sx={{
        flex: displayMode === "transcript-fullwidth" ? 1 : 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 3,
        py: 1.5,
        borderRight: shouldShowContext ? "2px solid" : "none",
        borderColor: "primary.main",
        bgcolor: shouldShowContext ? "primary.50" : "background.paper",
        transition: "all 0.2s ease",
      }}
    >
      {/* Titre et contexte */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 0 }}>
        <TitleSection title="Transcription" accentColor="primary.main" />
        {selectedCall && <CallInfo call={selectedCall} />}
      </Box>

      {/* Actions */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <ViewModeToggle viewMode={viewMode} onToggle={onToggleViewMode} />
        <ColorationToggle
          viewMode={viewMode}
          highlightTurnOne={highlightTurnOne}
          highlightSpeakers={highlightSpeakers}
          onToggleHighlightTurnOne={onToggleHighlightTurnOne}
          onToggleHighlightSpeakers={onToggleHighlightSpeakers}
        />
        <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 24 }} />

        <TranscriptionActions
          currentWord={currentWord}
          selectedCall={selectedCall}
          onAddPostit={onAddPostit}
          onRefresh={onRefreshTranscription}
        />

        <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 24 }} />

        <DisplayActions
          displayMode={displayMode}
          hasRightPanel={hasRightPanel}
          shouldShowContext={shouldShowContext}
          onSetTranscriptFullWidth={onSetTranscriptFullWidth}
          onToggleRightPanel={onToggleRightPanel}
          type="transcription"
        />
      </Box>
    </Box>
  );
}
