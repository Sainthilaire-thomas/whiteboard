import React from "react";
import {
  Box,
  Stepper,
  Step,
  StepButton,
  StepLabel,
  Typography,
  MobileStepper,
  Button,
  useMediaQuery,
  Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import CheckIcon from "@mui/icons-material/Check";

/**
 * Composant de navigation entre les étapes du Postit
 * Version épurée avec guidage visuel clair et sans redondance
 */
export const StepNavigation = ({
  steps,
  activeStep,
  isCompleted,
  hasRealSubject,
  navigateToStep,
  handleNext,
  handleBack,
  temporaryEditMode,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const totalSteps = steps.length;

  // Navigation mode mobile épurée
  if (isMobile) {
    return (
      <Box sx={{ mt: 1, mb: 2 }}>
        {/* Titre de l'étape actuelle */}
        <Box sx={{ textAlign: "center", mb: 1 }}>
          <Typography
            variant="subtitle2"
            color={
              activeStep === 0
                ? "primary.main"
                : activeStep === 1
                ? "success.main"
                : "secondary.main"
            }
            fontWeight={500}
          >
            {steps[activeStep].label}
          </Typography>
        </Box>

        {/* Barre de progression */}
        <MobileStepper
          variant="progress"
          steps={totalSteps}
          position="static"
          activeStep={activeStep}
          sx={{
            flexGrow: 1,
            borderRadius: 1,
            "& .MuiLinearProgress-root": {
              height: 4,
              borderRadius: 2,
            },
          }}
          nextButton={
            <Button
              size="small"
              onClick={handleNext}
              disabled={
                activeStep === totalSteps - 1 ||
                (activeStep === 1 && !hasRealSubject)
              }
            >
              {activeStep === totalSteps - 1 ? "Terminer" : "Suivant"}
              <KeyboardArrowRight />
            </Button>
          }
          backButton={
            <Button
              size="small"
              onClick={handleBack}
              disabled={activeStep === 0}
            >
              <KeyboardArrowLeft />
              Retour
            </Button>
          }
        />
      </Box>
    );
  }

  // Navigation mode desktop épurée
  return (
    <Box sx={{ mb: 2 }}>
      {/* Stepper horizontal simplifié */}
      <Stepper
        activeStep={activeStep}
        sx={{
          pt: 1,
          pb: 1,
        }}
      >
        {steps.map((step, index) => (
          <Step
            key={index}
            completed={step.isCompleted}
            sx={{
              "& .MuiStepConnector-line": {
                borderColor: theme.palette.divider,
              },
            }}
          >
            <StepButton
              onClick={() => navigateToStep(index)}
              disabled={!step.isAccessible}
              sx={{
                "&:hover": {
                  backgroundColor: step.isAccessible
                    ? "rgba(0, 0, 0, 0.04)"
                    : "transparent",
                },
                px: 1,
              }}
            >
              <StepLabel
                StepIconComponent={() => (
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      border: `2px solid ${
                        step.isCompleted
                          ? theme.palette.success.main
                          : index === activeStep
                          ? theme.palette.primary.main
                          : theme.palette.grey[400]
                      }`,
                      color: step.isCompleted
                        ? theme.palette.success.main
                        : index === activeStep
                        ? theme.palette.primary.main
                        : theme.palette.grey[600],
                      backgroundColor: "transparent",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {step.isCompleted ? (
                      <CheckIcon fontSize="small" />
                    ) : (
                      <Typography variant="body2" fontWeight={500}>
                        {index + 1}
                      </Typography>
                    )}
                  </Box>
                )}
              >
                <Box sx={{ textAlign: "left" }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: index === activeStep ? 500 : 400,
                      color: step.isCompleted
                        ? theme.palette.success.main
                        : index === activeStep
                        ? theme.palette.primary.main
                        : "text.secondary",
                    }}
                  >
                    {step.label}
                  </Typography>

                  {/* Info additionnelle avec style discret */}
                  {step.additionalInfo && (
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        color: "text.secondary",
                        fontStyle: "italic",
                      }}
                    >
                      {step.additionalInfo}
                    </Typography>
                  )}
                </Box>
              </StepLabel>
            </StepButton>
          </Step>
        ))}
      </Stepper>

      {/* Navigation simplifiée */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          px: 2,
          py: 1,
        }}
      >
        {/* Bouton précédent */}
        <Button
          size="small"
          onClick={handleBack}
          disabled={activeStep === 0}
          sx={{
            visibility: activeStep === 0 ? "hidden" : "visible",
            minWidth: "80px",
          }}
          variant="text"
        >
          <KeyboardArrowLeft />
          Retour
        </Button>

        {/* Indicateur du prochain step */}
        {activeStep < totalSteps - 1 && (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: "flex",
                alignItems: "center",
                fontStyle: "italic",
              }}
            >
              {activeStep === 0
                ? "Ensuite: Critère qualité"
                : "Ensuite: Pratique"}
              <KeyboardArrowRight sx={{ fontSize: 16, ml: 0.5 }} />
            </Typography>
          </Box>
        )}

        {/* Bouton suivant */}
        <Button
          size="small"
          onClick={handleNext}
          disabled={
            activeStep === totalSteps - 1 ||
            (activeStep === 1 && !hasRealSubject)
          }
          sx={{
            visibility: activeStep === totalSteps - 1 ? "hidden" : "visible",
            minWidth: "80px",
          }}
          variant="text"
          color="primary"
        >
          Suivant
          <KeyboardArrowRight />
        </Button>
      </Box>

      <Divider />
    </Box>
  );
};
