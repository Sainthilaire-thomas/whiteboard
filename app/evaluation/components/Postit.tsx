"use client";

import { useState, memo } from "react";
import {
  Box,
  Typography,
  Button,
  DialogContent,
  DialogTitle,
  Modal,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  IconButton,
  StepButton,
  MobileStepper,
  useMediaQuery,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import EditIcon from "@mui/icons-material/Edit";
import { useTheme, alpha } from "@mui/material/styles";
import { useFilteredDomains } from "@/hooks/AppContext/useFilteredDomains";
import { useAppContext } from "@/context/AppContext";
import { columnConfigSujets, columnConfigPratiques } from "@/config/gridConfig";

// Hooks personnalisés pour le Postit
import {
  usePostit,
  useSujetSelection,
  usePratiqueSelection,
  usePostitActions,
  useStyles,
} from "@/hooks/Postit";

// Composants pour chaque étape du stepper
import { ContexteStep } from "./PostitSteps/ContexteStep";
import { SujetStep } from "./PostitSteps/SujetStep";
import { PratiqueStep } from "./PostitSteps/PratiqueStep";
import { SummaryPanel } from "./PostitSteps/SummaryPanel";
import { StatusBadge } from "./PostitSteps/StatusBadge";

// Types - AJOUT DE HIDEHEADER
interface PostitProps {
  inline?: boolean;
  hideHeader?: boolean; // Nouvelle prop pour masquer l'en-tête
}

// Composant principal
const Postit: React.FC<PostitProps> = memo(
  ({ inline = false, hideHeader = false }) => {
    // Utilisation des hooks personnalisés
    const {
      selectedPostit,
      showTabs,
      setShowTabs,
      isCompleted,
      activeStep,
      setActiveStep,
      hasRealSubject,
      handleNext,
      handleBack,
    } = usePostit();

    const { selectedEntreprise } = useAppContext();
    const { filteredDomains } = useFilteredDomains(selectedEntreprise);
    const { theme, styles, stepBoxStyle } = useStyles();
    const { selectedDomain, selectDomain } = useAppContext();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [temporaryEditMode, setTemporaryEditMode] = useState(false);

    const {
      handleSujetClick,
      sujetsDeLActivite,
      categoriesSujets,
      sujetsData,
    } = useSujetSelection();
    const {
      handlePratiqueClick,
      pratiquesDeLActivite,
      categoriesPratiques,
      pratiques,
    } = usePratiqueSelection();
    const { handleSave, handleDelete, handleClosePostit } = usePostitActions();

    // Nombre total d'étapes
    const totalSteps = 4;

    // Retour anticipé si pas de postit sélectionné
    if (!selectedPostit) return null;

    // Setters communs
    const { setSelectedPostit } = useAppContext();

    // Vérifie si une étape est accessible
    const isStepAccessible = (step: number) => {
      if (step === 0) return true;
      if (step === 1) return true;
      if (step === 2) return selectedPostit.idsujet;
      if (step === 3) return isCompleted;
      return false;
    };

    // Gestion du clic sur un bouton d'étape pour la navigation non-linéaire
    const handleStepClick = (step: number) => {
      if (isStepAccessible(step)) {
        setActiveStep(step);

        // Si le postit est complété, activer le mode édition temporaire
        if (isCompleted) {
          setTemporaryEditMode(true);
        }
      }
    };

    // Création des étapes avec leur titre et contenu
    const steps = [
      {
        label: "Contexte du passage",
        icon: "🟢",
        content: (
          <ContexteStep
            selectedPostit={selectedPostit}
            setSelectedPostit={setSelectedPostit}
            selectedDomain={selectedDomain}
            showTabs={showTabs}
            setShowTabs={setShowTabs}
            filteredDomains={filteredDomains}
            selectDomain={selectDomain}
            theme={theme}
            stepBoxStyle={stepBoxStyle}
            styles={styles}
          />
        ),
        completed: activeStep > 0,
        optional: false,
      },
      {
        label: "Critère qualité",
        icon: "🧭",
        content: (
          <SujetStep
            selectedPostit={selectedPostit}
            categoriesSujets={categoriesSujets}
            sujetsData={sujetsData}
            columnConfigSujets={columnConfigSujets}
            sujetsDeLActivite={sujetsDeLActivite}
            handleSujetClick={handleSujetClick}
            stepBoxStyle={stepBoxStyle}
          />
        ),
        completed: activeStep > 1 && selectedPostit.idsujet,
        additionalInfo:
          selectedPostit.idsujet && activeStep !== 1
            ? selectedPostit.sujet
            : null,
        optional: false,
      },
      {
        label: "Pratique d'amélioration",
        icon: "🛠️",
        content: (
          <PratiqueStep
            selectedPostit={selectedPostit}
            categoriesPratiques={categoriesPratiques}
            pratiques={pratiques}
            columnConfigPratiques={columnConfigPratiques}
            pratiquesDeLActivite={pratiquesDeLActivite}
            handlePratiqueClick={handlePratiqueClick}
            stepBoxStyle={stepBoxStyle}
          />
        ),
        completed:
          activeStep === 2 &&
          selectedPostit.pratique &&
          selectedPostit.pratique !== "Non Assigné",
        additionalInfo:
          selectedPostit.pratique &&
          selectedPostit.pratique !== "Non Assigné" &&
          activeStep !== 2
            ? selectedPostit.pratique
            : null,
        optional: false,
      },
      {
        label: "Synthèse",
        icon: "✓",
        content: (
          <SummaryPanel
            selectedPostit={selectedPostit}
            theme={theme}
            stepBoxStyle={stepBoxStyle}
          />
        ),
        completed: isCompleted,
        additionalInfo: null,
        optional: false,
      },
    ];

    // Mode de navigation mobile
    const renderMobileStepper = () => (
      <Box sx={{ mt: 2, mb: 2 }}>
        {/* Indicateur d'étape actuelle */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 1,
              borderRadius: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
            }}
          >
            <Typography
              variant="body2"
              component="span"
              sx={{
                display: "flex",
                alignItems: "center",
                fontWeight: 500,
                color: theme.palette.primary.main,
              }}
            >
              <Box component="span" sx={{ mr: 1, fontSize: "1.1rem" }}>
                {steps[activeStep].icon}
              </Box>
              {steps[activeStep].label}
            </Typography>
          </Box>
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
              height: 6,
              borderRadius: 3,
            },
          }}
          nextButton={
            <Button
              size="small"
              onClick={handleNext}
              disabled={
                activeStep === 2 ||
                (activeStep === 1 && !selectedPostit.idsujet)
              }
              sx={{
                bgcolor:
                  activeStep === totalSteps - 1
                    ? alpha(theme.palette.success.main, 0.1)
                    : alpha(theme.palette.primary.main, 0.1),
                "&:hover": {
                  bgcolor:
                    activeStep === totalSteps - 1
                      ? alpha(theme.palette.success.main, 0.2)
                      : alpha(theme.palette.primary.main, 0.2),
                },
              }}
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
              sx={{
                bgcolor: alpha(theme.palette.grey[500], 0.1),
                "&:hover": {
                  bgcolor: alpha(theme.palette.grey[500], 0.2),
                },
              }}
            >
              <KeyboardArrowLeft />
              Retour
            </Button>
          }
        />

        {/* Étapes en petit */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 1,
          }}
        >
          {steps.map((step, index) => (
            <Box
              key={index}
              onClick={() => isStepAccessible(index) && handleStepClick(index)}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                opacity: isStepAccessible(index) ? 1 : 0.6,
                cursor: isStepAccessible(index) ? "pointer" : "not-allowed",
                flex: 1,
                p: 0.5,
                borderRadius: 1,
                transition: "all 0.2s",
                bgcolor:
                  index === activeStep
                    ? alpha(theme.palette.primary.main, 0.1)
                    : "transparent",
                "&:hover": {
                  bgcolor: isStepAccessible(index)
                    ? alpha(theme.palette.primary.main, 0.05)
                    : "transparent",
                },
              }}
            >
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.75rem",
                  background: step.completed
                    ? theme.palette.success.main
                    : index === activeStep
                    ? theme.palette.primary.main
                    : alpha(theme.palette.grey[500], 0.2),
                  color:
                    step.completed || index === activeStep
                      ? "#fff"
                      : theme.palette.text.primary,
                  mb: 0.5,
                }}
              >
                {step.completed ? (
                  <CheckCircleIcon sx={{ fontSize: 14 }} />
                ) : (
                  index + 1
                )}
              </Box>
              <Typography
                variant="caption"
                sx={{
                  fontSize: "0.65rem",
                  textAlign: "center",
                  display: "-webkit-box",
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  lineHeight: 1.2,
                }}
              >
                {step.label.split(" ")[0]}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    );

    // Interface de navigation horizontale pour les étapes
    const renderHorizontalStepper = () => (
      <Box sx={{ mb: 3 }}>
        <Stepper
          nonLinear
          activeStep={activeStep}
          sx={{
            pt: 1,
            pb: 0.5,
          }}
        >
          {steps.map((step, index) => (
            <Step key={index} completed={step.completed}>
              <StepButton
                onClick={() => handleStepClick(index)}
                disabled={!isStepAccessible(index)}
                sx={{
                  opacity: isStepAccessible(index) ? 1 : 0.6,
                  transition: "all 0.3s",
                  "&:hover": {
                    bgcolor: isStepAccessible(index)
                      ? alpha(theme.palette.primary.main, 0.05)
                      : "transparent",
                  },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: index === activeStep ? 600 : 400,
                    color:
                      index === activeStep
                        ? theme.palette.primary.main
                        : theme.palette.text.primary,
                  }}
                >
                  {step.label}
                </Typography>

                {step.additionalInfo && (
                  <Typography
                    component="span"
                    variant="caption"
                    color="primary.main"
                    sx={{
                      display: "inline-block",
                      maxWidth: "100px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      mt: 0.5,
                    }}
                  >
                    {step.additionalInfo}
                  </Typography>
                )}
              </StepButton>
            </Step>
          ))}
        </Stepper>
      </Box>
    );

    // RENDU CONDITIONNEL SELON HIDEHEADER (comme dans SyntheseEvaluation)
    if (hideHeader) {
      return (
        <Box sx={{ p: { xs: 1, md: 2 } }}>
          {/* VERSION SANS EN-TÊTE - Juste la navigation et le contenu */}

          {/* Alerte de statut si complété (sans en-tête) */}
          {isCompleted && (
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Ce passage a été affecté au critère{" "}
                <strong>{selectedPostit.sujet}</strong> avec la pratique{" "}
                <strong>{selectedPostit.pratique}</strong> à améliorer.
              </Typography>
            </Alert>
          )}

          {/* Navigation horizontale pour les étapes (desktop) */}
          {!isMobile && renderHorizontalStepper()}

          {/* Navigation mobile pour les étapes */}
          {isMobile && renderMobileStepper()}

          {/* Contenu de l'étape actuelle */}
          <Box sx={{ px: 1, py: 1 }}>
            {activeStep === 3 ? (
              <SummaryPanel
                selectedPostit={selectedPostit}
                theme={theme}
                stepBoxStyle={stepBoxStyle}
                onClose={handleClosePostit}
                onEdit={(step) => handleStepClick(step)}
                hideActionButtons={true}
              />
            ) : (
              steps[activeStep].content
            )}
          </Box>

          {/* Navigation unifiée avec actions contextuelles */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: 2,
              borderTop: "1px solid rgba(0,0,0,0.1)",
              pt: 2,
            }}
          >
            {/* Partie gauche : actions secondaires */}
            <Box>
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={activeStep === 0}
                size="small"
                sx={{ mr: 1 }}
              >
                Précédent
              </Button>

              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={handleDelete}
              >
                Supprimer
              </Button>
            </Box>

            {/* Partie droite : action principale */}
            <Box>
              {activeStep < 3 && (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={activeStep === 1 && !selectedPostit.idsujet}
                  color="primary"
                  size="small"
                >
                  {activeStep === 2 ? "Finaliser" : "Suivant"}
                </Button>
              )}

              {activeStep === 3 && (
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  onClick={handleClosePostit}
                  startIcon={<CheckCircleIcon />}
                >
                  Terminer
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      );
    }

    // VERSION ORIGINALE AVEC EN-TÊTE (pour rétrocompatibilité)
    // Contenu du modal/inline component
    const content = (
      <>
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 1,
          }}
        >
          <Typography variant="h6" component="div">
            📝 Évaluation du passage
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <StatusBadge
              isCompleted={isCompleted}
              hasSubject={hasRealSubject}
            />
            <Button
              onClick={() => setSelectedPostit(null)}
              variant="outlined"
              color="inherit"
              size="small"
              sx={{ ml: 1 }}
            >
              Fermer
            </Button>
          </Box>
        </DialogTitle>

        {isCompleted && (
          <Alert severity="success" sx={{ mx: 3, mb: 2 }}>
            <Typography variant="body2">
              Ce passage a été affecté au critère{" "}
              <strong>{selectedPostit.sujet}</strong> avec la pratique{" "}
              <strong>{selectedPostit.pratique}</strong> à améliorer.
            </Typography>
          </Alert>
        )}

        <DialogContent sx={{ display: "flex", flexDirection: "column" }}>
          {/* Navigation horizontale pour les étapes (desktop) */}
          {!isMobile && renderHorizontalStepper()}

          {/* Navigation mobile pour les étapes */}
          {isMobile && renderMobileStepper()}

          {/* Contenu de l'étape actuelle */}
          <Box sx={{ px: 1, py: 1 }}>
            {activeStep === 3 ? (
              <SummaryPanel
                selectedPostit={selectedPostit}
                theme={theme}
                stepBoxStyle={stepBoxStyle}
                onClose={handleClosePostit}
                onEdit={(step) => handleStepClick(step)}
                hideActionButtons={true}
              />
            ) : (
              steps[activeStep].content
            )}
          </Box>

          {/* Navigation unifiée avec actions contextuelles */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: 2,
              borderTop: "1px solid rgba(0,0,0,0.1)",
              pt: 2,
            }}
          >
            <Box>
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={activeStep === 0}
                size="small"
                sx={{ mr: 1 }}
              >
                Précédent
              </Button>

              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={handleDelete}
              >
                Supprimer
              </Button>
            </Box>

            <Box>
              {activeStep < 3 && (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={activeStep === 1 && !selectedPostit.idsujet}
                  color="primary"
                  size="small"
                >
                  {activeStep === 2 ? "Finaliser" : "Suivant"}
                </Button>
              )}

              {activeStep === 3 && (
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  onClick={handleClosePostit}
                  startIcon={<CheckCircleIcon />}
                >
                  Terminer
                </Button>
              )}
            </Box>
          </Box>
        </DialogContent>
      </>
    );

    // Rendu final (inline ou modal)
    if (inline) {
      return (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
            p: 2,
            boxSizing: "border-box",
          }}
        >
          {content}
        </Box>
      );
    }

    return (
      <Modal
        open={!!selectedPostit}
        onClose={handleClosePostit}
        sx={styles.modalBackground}
      >
        <Box sx={styles.modalWrapper} onClick={handleClosePostit}>
          <Box sx={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
            {content}
          </Box>
        </Box>
      </Modal>
    );
  }
);

Postit.displayName = "Postit";

export default Postit;
