import React from "react";
import { Box, Typography } from "@mui/material";
import { Postit } from "@/types/types";
import { Item } from "@/types/types";
import GridContainerSujetsEval from "../GridContainerSujetsEval";

interface SujetStepProps {
  selectedPostit: Postit;
  selectedDomain: string; // Le domaine sélectionné (string ID)
  categoriesSujets: any[];
  sujetsData: any[]; // Déjà filtrés par le hook
  columnConfigSujets: any;
  sujetsDeLActivite: number[];
  handleSujetClick: (item: Item) => void;
  stepBoxStyle: any;
}

export const SujetStep: React.FC<SujetStepProps> = ({
  selectedPostit,
  selectedDomain,
  categoriesSujets,
  sujetsData, // Déjà filtrés dans useSujetSelection
  columnConfigSujets,
  sujetsDeLActivite,
  handleSujetClick,
  stepBoxStyle,
}) => {
  // Plus besoin de filtrer ici, les données arrivent déjà filtrées

  return (
    <Box sx={stepBoxStyle}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Sélectionnez le critère qualité en défaut dans la grille ci-dessous.
        {selectedDomain && (
          <Typography component="span" sx={{ fontWeight: 500, ml: 1 }}>
            (Domaine ID: {selectedDomain})
          </Typography>
        )}
      </Typography>

      <GridContainerSujetsEval
        categories={categoriesSujets}
        items={sujetsData}
        columnConfig={columnConfigSujets}
        handleSujetClick={handleSujetClick}
        sujetsDeLActivite={sujetsDeLActivite}
      />

      {selectedPostit.idsujet && (
        <Typography
          variant="body2"
          color="primary.main"
          sx={{ mt: 2, fontWeight: 500 }}
        >
          Vous avez sélectionné: <strong>{selectedPostit.sujet}</strong>
        </Typography>
      )}
    </Box>
  );
};
