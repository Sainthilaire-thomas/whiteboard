// 📁 app/evaluation/components/UnifiedHeader/shared/ContextualActions.tsx
"use client";

import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import { Save as SaveIcon } from "@mui/icons-material";

interface ContextualActionsProps {
  view: string | null;
  onSave: () => void;
}

export default function ContextualActions({
  view,
  onSave,
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

      {/* Ici on pourrait ajouter d'autres actions selon le view */}
      {/* {view === "postit" && (...)} */}
      {/* {view === "roleplay" && (...)} */}
    </>
  );
}
