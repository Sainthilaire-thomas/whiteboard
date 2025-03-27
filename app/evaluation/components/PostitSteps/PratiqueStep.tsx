// PostitSteps/PratiqueStep.tsx
import React from "react";
import { Box, Typography, Button, Fade } from "@mui/material";
import { Postit } from "@/types/types";
import GridContainerPratiquesEval from "../GridContainerPratiquesEval";

interface PratiqueStepProps {
  selectedPostit: Postit;
  categoriesPratiques: any[];
  pratiques: any[];
  columnConfigPratiques: any;
  pratiquesDeLActivite: string[];
  handlePratiqueClick: (practice: any) => void;
  stepBoxStyle: any;
  onBack: () => void;
  onSave: () => void;
}

export const PratiqueStep: React.FC<PratiqueStepProps> = ({
  selectedPostit,
  categoriesPratiques,
  pratiques,
  columnConfigPratiques,
  pratiquesDeLActivite,
  handlePratiqueClick,
  stepBoxStyle,
  onBack,
  onSave,
}) => {
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

      {selectedPostit.pratique && selectedPostit.pratique !== "Non Assigné" && (
        <Fade in timeout={500}>
          <Typography
            variant="body2"
            color="success.main"
            sx={{ mt: 2, fontWeight: 500 }}
          >
            ✅ Pratique sélectionnée: <strong>{selectedPostit.pratique}</strong>
          </Typography>
        </Fade>
      )}

      <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
        <Button onClick={onBack} sx={{ mt: 1, mr: 1 }}>
          Retour
        </Button>
        <Button
          variant="contained"
          onClick={onSave}
          sx={{ mt: 1, mr: 1 }}
          color="success"
          disabled={
            !selectedPostit.pratique ||
            selectedPostit.pratique === "Non Assigné"
          }
        >
          Finaliser et enregistrer
        </Button>
      </Box>
    </Box>
  );
};
