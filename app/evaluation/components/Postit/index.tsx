"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  DialogContent,
  DialogTitle,
  Modal,
  Alert,
  IconButton,
  Dialog,
  DialogActions,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";

// Importations des types - on garde uniquement les types nécessaires
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

  // État pour la confirmation de suppression
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  // Contextes - on utilise directement sans cast
  const appContext = useAppContext();
  const { selectedEntreprise, selectedDomain, selectDomain } = appContext;

  // ✅ Gestion sûre de filteredDomains
  const filteredDomains = (appContext as any)?.filteredDomains || [];

  // Hooks de sélection
  const { handleSujetClick, sujetsDeLActivite, categoriesSujets, sujetsData } =
    useSujetSelection();
  const {
    handlePratiqueClick,
    pratiquesDeLActivite,
    categoriesPratiques,
    pratiques,
  } = usePratiqueSelection();

  // ✅ Configuration des composants pour les étapes - sans typage strict
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

  // ✅ Création dynamique des étapes - on utilise la fonction telle qu'elle existe
  const steps = createPostItSteps(
    selectedPostit,
    activeStep,
    isCompleted,
    hasValidSubject,
    componentsProps
  );

  // Configuration des étapes pour la navigation
  const navigationSteps = steps.map((step: any, index: number) => ({
    label: step.label,
    icon: step.icon,
    isAccessible: isStepAccessible(index),
    isCompleted: step.completed,
    additionalInfo: step.additionalInfo,
  }));

  // Gestion de la suppression avec confirmation
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await handleDelete(); // ✅ Pas d'argument - la fonction utilise selectedPostit du contexte
      setShowDeleteConfirm(false);
      // setSelectedPostit(null) est déjà géré dans handleDelete
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      // Vous pouvez ajouter une notification d'erreur ici
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

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

            {/* Bouton de suppression */}
            <IconButton
              onClick={handleDeleteClick}
              color="error"
              size="small"
              sx={{ ml: 1 }}
              title="Supprimer ce post-it"
            >
              <DeleteIcon />
            </IconButton>

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
        onDelete={handleDeleteClick}
      />

      {/* Contenu principal */}
      <DialogContent sx={{ display: "flex", flexDirection: "column" }}>
        {/* Navigation et contenu de l'étape */}
        <Box sx={{ px: 1, py: 1 }}>{steps[activeStep].content}</Box>
      </DialogContent>

      {/* Dialog de confirmation de suppression */}
      <Dialog
        open={showDeleteConfirm}
        onClose={handleCancelDelete}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "grey.900",
            color: "white",
          },
        }}
      >
        <DialogTitle sx={{ color: "white" }}>
          Confirmer la suppression
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "grey.300" }}>
            Êtes-vous sûr de vouloir supprimer ce post-it ? Cette action est
            irréversible.
          </Typography>
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: "grey.800",
              borderRadius: 1,
              border: "1px solid",
              borderColor: "grey.700",
            }}
          >
            <Typography variant="body2" sx={{ color: "grey.400" }}>
              <strong style={{ color: "white" }}>Contenu :</strong>{" "}
              {selectedPostit.text}
            </Typography>
            {selectedPostit.sujet && (
              <Typography variant="body2" sx={{ color: "grey.400", mt: 1 }}>
                <strong style={{ color: "white" }}>Sujet :</strong>{" "}
                {selectedPostit.sujet}
              </Typography>
            )}
            {selectedPostit.pratique && (
              <Typography variant="body2" sx={{ color: "grey.400", mt: 1 }}>
                <strong style={{ color: "white" }}>Pratique :</strong>{" "}
                {selectedPostit.pratique}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions
          sx={{ borderTop: "1px solid", borderColor: "grey.700", pt: 2 }}
        >
          <Button
            onClick={handleCancelDelete}
            sx={{
              color: "grey.300",
              "&:hover": {
                bgcolor: "grey.800",
              },
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
            sx={{
              bgcolor: "error.main",
              "&:hover": {
                bgcolor: "error.dark",
              },
            }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
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
