import React from "react";
import { Stepper, Step, StepLabel, Paper } from "@mui/material";

/**
 * Composant pour l'en-tête des étapes
 */
export const StepperHeader = ({ steps, activeStep, mode }) => {
  return (
    <Stepper
      activeStep={activeStep}
      sx={{
        p: 1,
        bgcolor: mode === "dark" ? "background.paper" : "#ffffff",
        borderRadius: 1,
      }}
    >
      {steps.map((label) => (
        <Step key={label}>
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
};
