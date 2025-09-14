import React from "react";
import { Box, Typography, styled, Theme, SxProps } from "@mui/material";

// Types pour les props du composant
interface ProgressionProps {
  steps: string[];
  activeStep: number;
  onStepChange?: (step: number) => void;
  sx?: SxProps<Theme>;
}

// Style pour le conteneur de progression
const CustomProgression = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  marginBottom: theme.spacing(2),
  position: "relative",
}));

// Style pour chaque étape
const ProgressStep = styled(Box, {
  shouldForwardProp: (prop) => prop !== "status",
})<{ status?: "inactive" | "active" | "completed" }>(({ theme, status }) => ({
  flex: 1,
  textAlign: "center",
  position: "relative",
  padding: theme.spacing(1),
  cursor: status !== "completed" ? "pointer" : "default",
  "&::before": {
    content: '""',
    position: "absolute",
    width: 30,
    height: 30,
    borderRadius: "50%",
    top: -15,
    left: "calc(50% - 15px)",
    backgroundColor:
      status === "completed"
        ? theme.palette.success.main
        : status === "active"
        ? theme.palette.primary.main
        : theme.palette.grey[300],
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  "&:hover::before": {
    transform: status !== "completed" ? "scale(1.1)" : "none",
  },
  "&::after": {
    content: '""',
    position: "absolute",
    height: 3,
    width: "100%",
    backgroundColor: theme.palette.grey[300],
    top: -3,
    left: "-50%",
    zIndex: -1,
  },
  "&:first-of-type::after": {
    display: "none",
  },
}));

// Composant de Progression
const Progression: React.FC<ProgressionProps> = ({
  steps,
  activeStep,
  onStepChange,
  sx,
}) => {
  const handleStepClick = (index: number) => {
    // Permettre de revenir en arrière uniquement si l'étape est déjà passée
    if (index < activeStep && onStepChange) {
      onStepChange(index);
    }
  };

  return (
    <CustomProgression sx={sx}>
      {steps.map((label, index) => (
        <ProgressStep
          key={label}
          status={
            index < activeStep
              ? "completed"
              : index === activeStep
              ? "active"
              : "inactive"
          }
          onClick={() => handleStepClick(index)}
        >
          <Typography
            variant="caption"
            sx={{
              position: "absolute",
              bottom: -20,
              left: "50%",
              transform: "translateX(-50%)",
              color:
                index < activeStep
                  ? "success.main"
                  : index === activeStep
                  ? "primary.main"
                  : "text.secondary",
            }}
          >
            {label}
          </Typography>
        </ProgressStep>
      ))}
    </CustomProgression>
  );
};

export default Progression;
