"use client";

import React, { useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  DialogContent,
  DialogTitle,
  Modal,
  Alert,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

// Importations des types
import { PostitProps } from "./types";

// Importations des hooks
import { usePostitStyles } from "./hooks/usePostitStyles";
import { usePostitNavigation } from "./hooks/usePostitNavigation";
import { usePostitActions } from "./hooks/usePostitActions";
import { useSujetSelection } from "./hooks/useSujetSelection";
import { usePratiqueSelection } from "./hooks/usePratiqueSelection";

// Importations des composants d'étapes
import { ContexteStep } from "./PostitSteps/ContexteStep";
import { SujetStep } from "./PostitSteps/SujetStep";
import { PratiqueStep } from "./PostitSteps/PratiqueStep";
import { SummaryPanel } from "./PostitSteps/SummaryPanel";
import { StatusBadge } from "./PostitSteps/StatusBadge";
import { StepNavigation } from "./PostitSteps/StepNavigation";

// Importations des utilitaires et constantes
import { createPostItSteps } from "./constants";
import { hasValidSubject, hasValidPractice } from "./utils";

// Contextes
import { useAppContext } from "@/context/AppContext";
import { useCallData } from "@/context/CallDataContext";
import { columnConfigSujets, columnConfigPratiques } from "@/config/gridConfig";

const Postit: React.FC<PostitProps> = ({
  inline = false,
  hideHeader = false,
}) => {
  // Récupération du selectedPostit en premier
  const { selectedPostit, setSelectedPostit } = useCallData();

  // Retour anticipé si pas de postit sélectionné
  if (!selectedPostit) return null;

  // Hooks personnalisés
  const { theme, styles, stepBoxStyle, isMobile } = usePostitStyles();
  const {
    activeStep,
    setActiveStep,
    temporaryEditMode,
    setTemporaryEditMode,
    isCompleted,
    handleNext,
    handleBack,
    handleStepClick,
    isStepAccessible,
  } = usePostitNavigation(selectedPostit);
  const { handleClosePostit, handleDelete } = usePostitActions();

  // Contextes
  const { selectedEntreprise, selectedDomain, selectDomain, filteredDomains } =
    useAppContext();

  // Hooks de sélection
  const { handleSujetClick, sujetsDeLActivite, categoriesSujets, sujetsData } =
    useSujetSelection();
  const {
    handlePratiqueClick,
    pratiquesDeLActivite,
    categoriesPratiques,
    pratiques,
  } = usePratiqueSelection();

  // Configuration des composants pour les étapes
  const componentsProps = {
    selectedPostit,
    setSelectedPostit,
    selectedDomain,
    filteredDomains,
    selectDomain,
    theme,
    stepBoxStyle,
    styles,
    categoriesSujets,
    sujetsData,
    columnConfigSujets,
    sujetsDeLActivite,
    handleSujetClick,
    categoriesPratiques,
    pratiques,
    columnConfigPratiques,
    pratiquesDeLActivite,
    handlePratiqueClick,
  };

  // Création dynamique des étapes
  const steps = createPostItSteps(
    selectedPostit,
    activeStep,
    isCompleted,
    hasValidSubject,
    componentsProps
  );

  // Configuration des étapes pour la navigation
  const navigationSteps = steps.map((step, index) => ({
    label: step.label,
    icon: step.icon,
    isAccessible: isStepAccessible(index),
    isCompleted: step.completed,
    additionalInfo: step.additionalInfo,
  }));

  // Rendu du contenu
  const content = (
    <>
      {/* En-tête */}
      {!hideHeader && (
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
              hasSubject={hasValidSubject(selectedPostit)}
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
      )}

      {/* Alerte de complétion */}
      {isCompleted && (
        <Alert severity="success" sx={{ mx: 3, mb: 2 }}>
          <Typography variant="body2">
            Ce passage a été affecté au critère{" "}
            <strong>{selectedPostit.sujet}</strong> avec la pratique{" "}
            <strong>{selectedPostit.pratique}</strong> à améliorer.
          </Typography>
        </Alert>
      )}

      {/* Navigation des étapes */}
      <StepNavigation
        steps={navigationSteps}
        activeStep={activeStep}
        isCompleted={isCompleted}
        hasRealSubject={hasValidSubject(selectedPostit)}
        navigateToStep={handleStepClick}
        handleNext={handleNext}
        handleBack={handleBack}
        temporaryEditMode={temporaryEditMode}
      />

      {/* Contenu principal */}
      <DialogContent sx={{ display: "flex", flexDirection: "column" }}>
        {/* Navigation et contenu de l'étape */}
        <Box sx={{ px: 1, py: 1 }}>{steps[activeStep].content}</Box>
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
};

Postit.displayName = "Postit";

export default Postit;
