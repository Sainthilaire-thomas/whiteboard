import React from "react";
import { Box, Chip } from "@mui/material";
import FicheConseiller from "./FicheConseiller";
import FicheCoach from "./FicheCoach";

interface ResourcesPanelProps {
  pratique: {
    nompratique: string;
    fiche_conseiller_json?: any;
    fiche_coach_json?: any;
    geste?: string;
    categoryColor?: string;
  } | null;
  selectedView: "coach" | "conseiller" | null;
  onViewChange: (view: "coach" | "conseiller" | null) => void;
}

const ResourcesPanel: React.FC<ResourcesPanelProps> = ({
  pratique,
  selectedView,
  onViewChange,
}) => {
  if (!pratique) {
    return null;
  }

  const hasCoachFiche = Boolean(pratique.fiche_coach_json);
  const hasConseillerFiche = Boolean(pratique.fiche_conseiller_json);

  if (!hasCoachFiche && !hasConseillerFiche) {
    return null;
  }

  return (
    <Box>
      {/* Boutons de sélection des fiches */}
      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        {hasCoachFiche && (
          <Chip
            label="📋 Fiche Coach"
            variant={selectedView === "coach" ? "filled" : "outlined"}
            color="secondary"
            size="small"
            clickable
            onClick={() =>
              onViewChange(selectedView === "coach" ? null : "coach")
            }
            onDelete={
              selectedView === "coach" ? () => onViewChange(null) : undefined
            }
          />
        )}
        {hasConseillerFiche && (
          <Chip
            label="📝 Fiche Conseiller"
            variant={selectedView === "conseiller" ? "filled" : "outlined"}
            color="primary"
            size="small"
            clickable
            onClick={() =>
              onViewChange(selectedView === "conseiller" ? null : "conseiller")
            }
            onDelete={
              selectedView === "conseiller"
                ? () => onViewChange(null)
                : undefined
            }
          />
        )}
      </Box>

      {/* Affichage de la fiche sélectionnée */}
      {selectedView === "coach" && hasCoachFiche && (
        <FicheCoach pratique={pratique} onClose={() => onViewChange(null)} />
      )}

      {selectedView === "conseiller" && hasConseillerFiche && (
        <FicheConseiller
          pratique={pratique}
          onClose={() => onViewChange(null)}
        />
      )}
    </Box>
  );
};

export default ResourcesPanel;
