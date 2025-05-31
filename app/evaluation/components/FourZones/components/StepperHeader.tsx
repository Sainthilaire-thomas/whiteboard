// StepperHeader.tsx - Version cliquable simplifiée
import React from "react";
import { Stepper, Step, StepLabel, Paper } from "@mui/material";

interface StepperHeaderProps {
  steps: string[];
  activeStep: number;
  mode: string;
  onStepClick: (step: number) => void;
  canNavigateToStep: (step: number) => boolean;
}

export const StepperHeader: React.FC<StepperHeaderProps> = ({
  steps,
  activeStep,
  mode,
  onStepClick,
  canNavigateToStep,
}) => {
  return (
    <Stepper
      activeStep={activeStep}
      sx={{
        p: 2,
        bgcolor: mode === "dark" ? "background.paper" : "#ffffff",
        borderRadius: 1,
      }}
    >
      {steps.map((label, index) => {
        const canNavigate = canNavigateToStep(index);

        return (
          <Step key={label}>
            <StepLabel
              onClick={() => canNavigate && onStepClick(index)}
              sx={{
                cursor: canNavigate ? "pointer" : "not-allowed",
                opacity: canNavigate ? 1 : 0.6,
                "&:hover": {
                  backgroundColor: canNavigate
                    ? "rgba(25, 118, 210, 0.08)"
                    : "transparent",
                  borderRadius: 1,
                },
                "& .MuiStepLabel-label": {
                  fontSize: "0.875rem",
                  fontWeight: index === activeStep ? 600 : 400,
                  color: canNavigate
                    ? index === activeStep
                      ? "primary.main"
                      : "text.primary"
                    : "text.disabled",
                },
                p: 1,
                borderRadius: 1,
                transition: "all 0.2s ease-in-out",
              }}
            >
              {label}
            </StepLabel>
          </Step>
        );
      })}
    </Stepper>
  );
};
