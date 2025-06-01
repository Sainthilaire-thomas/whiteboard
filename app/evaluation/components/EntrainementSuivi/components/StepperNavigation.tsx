import React from "react";
import { Box, Stepper, Step, StepLabel, Typography } from "@mui/material";
import { Step as StepType } from "../types";

interface StepperNavigationProps {
  steps: StepType[];
  activeStep: number;
  onStepClick: (stepIndex: number) => void;
}

const StepperNavigation: React.FC<StepperNavigationProps> = ({
  steps,
  activeStep,
  onStepClick,
}) => {
  return (
    <Box sx={{ p: 2 }}>
      <Stepper
        activeStep={activeStep}
        alternativeLabel
        sx={{
          "& .MuiStepLabel-root": {
            cursor: "pointer",
          },
        }}
      >
        {steps.map((step, index) => (
          <Step key={step.id}>
            <StepLabel
              onClick={() => onStepClick(index)}
              sx={{
                "& .MuiStepLabel-labelContainer": {
                  cursor: "pointer",
                },
              }}
            >
              <Typography variant="subtitle2">{step.label}</Typography>
              <Typography variant="caption" color="text.secondary">
                {step.description}
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Indicateur d'étape plus compact */}
      <Box sx={{ textAlign: "center", mt: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Étape {activeStep + 1} sur {steps.length}
        </Typography>
      </Box>
    </Box>
  );
};

export default StepperNavigation;
