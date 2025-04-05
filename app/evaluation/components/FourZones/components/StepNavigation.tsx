import React from "react";
import { Button, Paper, Typography, Box } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

interface StepNavigationProps {
  activeStep: number;
  stepsLength: number;
  handleBack: () => void;
  handleNext: () => void;
  canProceedToNextStep: boolean;
  mode: string;
}

/**
 * Composant pour la navigation entre les étapes
 */
export const StepNavigation: React.FC<StepNavigationProps> = ({
  activeStep,
  stepsLength,
  handleBack,
  handleNext,
  canProceedToNextStep,
  mode,
}) => {
  return (
    <Paper
      elevation={1}
      sx={{
        display: "flex",
        justifyContent: "space-between",
        p: 1.5,
        mt: 1,
        bgcolor: mode === "dark" ? "background.paper" : "#ffffff",
        borderRadius: 1,
      }}
    >
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        disabled={activeStep === 0}
      >
        Précédent
      </Button>

      <Typography variant="body2">
        Étape {activeStep + 1} sur {stepsLength}
      </Typography>

      <Button
        variant="contained"
        endIcon={<ArrowForwardIcon />}
        onClick={handleNext}
        disabled={activeStep === stepsLength - 1 || !canProceedToNextStep}
      >
        Suivant
      </Button>
    </Paper>
  );
};

export default StepNavigation;
