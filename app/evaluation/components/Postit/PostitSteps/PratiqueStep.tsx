// PostitSteps/PratiqueStep.tsx
import React from "react";
import { Box, Typography, Fade } from "@mui/material";
import { Postit } from "@/types/types";
import { hasValidPractice } from "@/hooks/Postit/utils";
import GridContainerPratiquesEval from "../../GridContainerPratiquesEval";

// Interface corrigée pour correspondre à l'utilisation réelle
interface PratiqueStepProps {
  selectedPostit: Postit;
  categoriesPratiques: any[];
  pratiques: any[];
  columnConfigPratiques: any;
  pratiquesDeLActivite: number[]; // MODIFIÉ : maintenant des IDs
  handlePratiqueClick: (practice: any) => void;
  stepBoxStyle: any;
  theme?: any; // Ajouté comme optionnel
  onBack?: () => void; // Optionnel
  onSave?: () => void; // Optionnel
}

export const PratiqueStep: React.FC<PratiqueStepProps> = ({
  selectedPostit,
  categoriesPratiques,
  pratiques,
  columnConfigPratiques,
  pratiquesDeLActivite,
  handlePratiqueClick,
  stepBoxStyle,
  theme,
  onBack,
  onSave,
}) => {
  // Helper pour vérifier si une pratique est sélectionnée
  const isPratiqueValid = hasValidPractice(selectedPostit);

  return (
    <Box sx={stepBoxStyle}>
      <Typography
        variant="body2"
        color="primary.main"
        sx={{ mb: 2, fontWeight: 500 }}
      >
        Vous avez sélectionné le critère <strong>{selectedPostit.sujet}</strong>
        .
        <br />
        Quelle pratique le conseiller peut-il travailler pour s'améliorer ?
      </Typography>

      <GridContainerPratiquesEval
        categories={categoriesPratiques}
        items={pratiques}
        columnConfig={columnConfigPratiques}
        onPratiqueClick={handlePratiqueClick}
        pratiquesDeLActivite={pratiquesDeLActivite}
      />

      {/* Affichage conditionnel basé sur idpratique */}
      {isPratiqueValid && (
        <Fade in timeout={500}>
          <Box sx={{ mt: 2 }}>
            <Typography
              variant="body2"
              color="success.main"
              sx={{ fontWeight: 500 }}
            >
              ✅ Pratique sélectionnée:{" "}
              <strong>{selectedPostit.pratique}</strong>
            </Typography>

            {/* Affichage debug (à supprimer en production) */}
            {process.env.NODE_ENV === "development" && (
              <Typography
                variant="caption"
                display="block"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                ID: {selectedPostit.idpratique}
              </Typography>
            )}
          </Box>
        </Fade>
      )}

      {/* Message d'encouragement si pas encore sélectionné */}
      {!isPratiqueValid && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 2, fontStyle: "italic" }}
        >
          💡 Sélectionnez une pratique pour continuer
        </Typography>
      )}
    </Box>
  );
};
