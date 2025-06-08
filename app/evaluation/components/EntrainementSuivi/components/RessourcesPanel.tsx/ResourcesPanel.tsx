import React from "react";
import { Box, Chip } from "@mui/material";
import FicheConseiller from "./FicheConseiller";
import FicheCoach from "./FicheCoach";
import {
  ResourcesPanelProps,
  FicheCoachPratique,
  FicheConseillerPratique,
} from "../../types";

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

  // Fonction helper pour créer une pratique avec fiche coach
  const createCoachPratique = (): FicheCoachPratique | null => {
    if (!pratique.fiche_coach_json) return null;
    return {
      nompratique: pratique.nompratique,
      fiche_coach_json: pratique.fiche_coach_json,
      geste: pratique.geste,
      categoryColor: pratique.categoryColor,
    };
  };

  // Fonction helper pour créer une pratique avec fiche conseiller
  const createConseillerPratique = (): FicheConseillerPratique | null => {
    if (!pratique.fiche_conseiller_json) return null;
    return {
      nompratique: pratique.nompratique,
      fiche_conseiller_json: pratique.fiche_conseiller_json,
      categoryColor: pratique.categoryColor,
    };
  };

  const coachPratique = createCoachPratique();
  const conseillerPratique = createConseillerPratique();

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
              onViewChange?.(selectedView === "coach" ? null : "coach")
            }
            onDelete={
              selectedView === "coach" ? () => onViewChange?.(null) : undefined
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
              onViewChange?.(
                selectedView === "conseiller" ? null : "conseiller"
              )
            }
            onDelete={
              selectedView === "conseiller"
                ? () => onViewChange?.(null)
                : undefined
            }
          />
        )}
      </Box>

      {/* Affichage de la fiche sélectionnée */}
      {selectedView === "coach" && coachPratique && (
        <FicheCoach
          pratique={coachPratique}
          onClose={() => onViewChange?.(null)}
        />
      )}

      {selectedView === "conseiller" && conseillerPratique && (
        <FicheConseiller
          pratique={conseillerPratique}
          onClose={() => onViewChange?.(null)}
        />
      )}
    </Box>
  );
};

export default ResourcesPanel;
