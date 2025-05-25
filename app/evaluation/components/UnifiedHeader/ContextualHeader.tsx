// 📁 app/evaluation/components/UnifiedHeader/ContextualHeader.tsx
"use client";

import React from "react";
import { Box, Divider } from "@mui/material";
import TitleSection from "./shared/TitleSection";
import DomainSelector from "./shared/DomainSelector";
import ContextualActions from "./shared/ContextualActions";
import DisplayActions from "./shared/DisplayActions";

interface ContextualHeaderProps {
  displayMode: "normal" | "transcript-fullwidth" | "context-fullwidth";
  view: string | null;
  filteredDomains: any[];
  selectedDomain: string;
  contextPanels: Record<string, { width: number | string }>;
  onDomainChange: (event: any) => void;
  onSave: () => void;
  onSetContextFullWidth: () => void;
  onClosePanel: () => void;
}

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
        return { title: "Simulation de coaching", color: "success.main" };
      default:
        return { title: "Panneau", color: "grey.main" };
    }
  };

  const viewConfig = getViewConfig(view);

  return (
    <Box
      sx={{
        width:
          displayMode === "context-fullwidth"
            ? "100%"
            : contextPanels[view!]?.width ?? "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 3,
        py: 1.5,
        bgcolor: "background.default",
        transition: "all 0.2s ease",
      }}
    >
      {/* Titre et contexte */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 0 }}>
        <TitleSection title={viewConfig.title} accentColor={viewConfig.color} />

        {/* Sélecteur de domaine pour la synthèse */}
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
        <ContextualActions view={view} onSave={onSave} />

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
