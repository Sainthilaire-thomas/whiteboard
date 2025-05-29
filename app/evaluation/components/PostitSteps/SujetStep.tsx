import React from "react";
import { Box, Typography, Fade } from "@mui/material";
import { Postit } from "@/types/types";
import { Item } from "@/types/types";
import GridContainerSujetsEval from "../GridContainerSujetsEval";

interface SujetStepProps {
  selectedPostit: Postit;
  categoriesSujets: any[];
  sujetsData: any[];
  columnConfigSujets: any;
  sujetsDeLActivite: number[];
  handleSujetClick: (item: Item) => void;
  stepBoxStyle: any;
}

export const SujetStep: React.FC<SujetStepProps> = ({
  selectedPostit,
  categoriesSujets,
  sujetsData,
  columnConfigSujets,
  sujetsDeLActivite,
  handleSujetClick,
  stepBoxStyle,
}) => {
  return (
    <Box sx={stepBoxStyle}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Sélectionnez le critère qualité en défaut dans la grille ci-dessous.
      </Typography>

      <GridContainerSujetsEval
        categories={categoriesSujets}
        items={sujetsData}
        columnConfig={columnConfigSujets}
        handleSujetClick={handleSujetClick}
        sujetsDeLActivite={sujetsDeLActivite || []}
      />

      {selectedPostit.idsujet && (
        <Fade in timeout={500}>
          <Typography
            variant="body2"
            color="primary.main"
            sx={{ mt: 2, fontWeight: 500 }}
          >
            Vous avez sélectionné: <strong>{selectedPostit.sujet}</strong>
          </Typography>
        </Fade>
      )}
    </Box>
  );
};
