"use client";

import React, { useState, useEffect } from "react";
import { useCallData } from "@/context/CallDataContext";
import { useAudio } from "@/context/AudioContext";
import {
  Box,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
  Typography,
  AlertColor,
} from "@mui/material";
import { useThemeMode } from "@/app/components/common/Theme/ThemeProvider";

// Import dnd-kit avec tous les composants nécessaires
import {
  DndContext,
  DragOverlay,
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
  closestCorners,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";

// Import des composants factorisés
import { DroppableZone } from "./components/DroppableZone/";
import { ClientResponseSection } from "./components/ClientResponseSection";

import {
  EditPostitDialog,
  CategoryDialog,
} from "./components/DialogComponents";
import DynamicSpeechToTextForFourZones from "./components/DynamicSpeechToTextForFourZones";
import { ToolBar } from "./components/ToolBar";
import { StepperHeader } from "./components/StepperHeader";
import { StepNavigation } from "./components/StepNavigation";
import { FinalReviewStep } from "./components/FinalReviewStep/FinalReviewStep";
import { ZoneLegend } from "./components/ZoneLegend";
import {
  generateFinalConseillerText,
  hasImprovedContent,
} from "./utils/generateFinalText";

// Import des hooks personnalisés
import { usePostits } from "./hooks/usePostits";
import { useDragAndDrop } from "./hooks/useDragAndDrop";
import { useStepNavigation } from "./hooks/useStepNavigation";
import { useNotifications } from "./hooks/useNotifications";

// Import des types, constantes et utilitaires
import { ZONES } from "./constants/zone";
import { generateId, getZoneColors } from "./utils/postitUtils";
import { saveRolePlayData } from "./utils/rolePlayUtils";
import { renderStepContent } from "./utils/stepContentUtils";
import { CallDataContextType, PostitType } from "./types/types";

const steps = [
  "Sélection du contexte",
  "Jeu de rôle",
  "Suggestions d'amélioration",
  "Lecture finale",
];

interface FourZonesProps {
  fontSize?: number;
  speechToTextVisible?: boolean;
  toggleSpeechToText?: () => void;
  increaseFontSize?: () => void;
  decreaseFontSize?: () => void;
}

const FourZones: React.FC<FourZonesProps> = ({
  fontSize = 14,
  speechToTextVisible = false,
  toggleSpeechToText,
  increaseFontSize,
  decreaseFontSize,
}) => {
  const { mode } = useThemeMode();
  const callDataContext = useCallData();
  const {
    selectedCall,
    selectedPostitForRolePlay,
    rolePlayData,
    saveRolePlayData,
    isLoadingRolePlay,
    setTranscriptSelectionMode,
  } = callDataContext as unknown as CallDataContextType;

  const { audioSrc, play, seekTo } = useAudio();

  // État pour le mode de sélection
  const [selectionMode, setSelectionMode] = useState<string>("client");

  // État pour le menu contextuel
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [targetZone, setTargetZone] = useState<string>("");

  // État pour la catégorisation
  const [showCategoryDialog, setShowCategoryDialog] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [textToCategorizze, setTextToCategorizze] = useState<string>("");

  // État pour la zone courante
  const [currentZone, setCurrentZone] = useState<string>(ZONES.JE_FAIS);

  // Obtenir les couleurs des zones en fonction du thème
  const zoneColors = getZoneColors(mode);

  // Utiliser les hooks personnalisés
  const postitState = usePostits({
    zoneColors,
    rolePlayData,
    selectedPostitForRolePlay,
  });

  const {
    postits,
    setPostits,
    selectedClientText,
    setSelectedClientText,
    selectedConseillerText,
    setSelectedConseillerText,
    editPostitId,
    editPostitContent,
    setEditPostitContent,
    isEditDialogOpen,
    setIsEditDialogOpen,
    newPostitContent,
    setNewPostitContent,
    addPostitToZone,
    addCategorizedText,
    deletePostit,
    openEditDialog,
    savePostitEdit,
    addPostitsFromSpeech,
    getPostitsByZone,
    hasOriginalPostits,
    updatePostitContent,
  } = postitState;

  const dragDropState = useDragAndDrop({
    postits,
    setPostits,
    zoneColors,
  });

  const {
    activeId,
    activePostit,
    sensors,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
  } = dragDropState;

  const stepNavigationState = useStepNavigation({
    steps,
    postitsState: postitState,
  });

  const {
    activeStep,
    setActiveStep,
    handleNext,
    handleBack,
    canProceedToNextStep,
  } = stepNavigationState;

  const notificationState = useNotifications();

  const {
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
    showNotification,
    handleSnackbarClose,
  } = notificationState;

  // NOUVEAU: Calculer le texte final retravaillé
  const improvedConseillerText = React.useMemo(() => {
    if (hasImprovedContent(postits)) {
      return generateFinalConseillerText(postits);
    }
    return null;
  }, [postits]);

  // NOUVELLE FONCTION: Gérer la navigation via le stepper
  const canNavigateToStep = (targetStep: number) => {
    // Navigation libre - l'utilisateur peut aller partout
    return targetStep >= 0 && targetStep < steps.length;
  };

  // Fonction pour gérer la navigation avec guidage intelligent
  const handleStepClick = (targetStep: number) => {
    if (canNavigateToStep(targetStep)) {
      setActiveStep(targetStep);

      // Guidage contextuel intelligent (sans bloquer)
      if (targetStep > 0 && !hasOriginalPostits) {
        showNotification(
          `💡 Astuce: Pour tirer le meilleur parti de cette étape, commencez par catégoriser du contenu à l'étape 1`,
          "info"
        );
      }

      // Messages d'aide spécifiques par étape
      switch (targetStep) {
        case 0:
          if (postits.length > 0) {
            showNotification(
              "✅ Vous avez déjà du contenu catégorisé",
              "success"
            );
          }
          break;
        case 1:
          if (!hasOriginalPostits) {
            showNotification(
              "ℹ️ Catégorisez d'abord du contenu pour commencer le jeu de rôle",
              "info"
            );
          }
          break;
        case 2:
          if (!hasOriginalPostits) {
            showNotification(
              "ℹ️ Cette étape vous permettra d'améliorer vos réponses une fois que vous aurez du contenu",
              "info"
            );
          }
          break;
        case 3:
          if (!hasOriginalPostits) {
            showNotification(
              "ℹ️ Ici vous pourrez réviser votre travail final",
              "info"
            );
          }
          break;
      }
    }
  };

  // AJOUT: Écouter les événements de sélection de texte (important !)
  useEffect(() => {
    console.log("activeStep:", activeStep);

    if (activeStep !== 0) return;
    const handleTextSelection = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        const selectedText = selection.toString().trim();

        if (selectionMode === "client") {
          setSelectedClientText(selectedText);
        } else if (selectionMode === "conseiller") {
          setSelectedConseillerText(selectedText);
          setTextToCategorizze(selectedText);
          setShowCategoryDialog(true);
        }
      }
    };

    document.addEventListener("mouseup", handleTextSelection);
    return () => document.removeEventListener("mouseup", handleTextSelection);
  }, [selectionMode, activeStep]);

  // Gérer le menu contextuel
  const handleOpenZoneMenu = (
    event: React.MouseEvent<HTMLElement>,
    zone: string
  ) => {
    setMenuAnchorEl(event.currentTarget);
    setTargetZone(zone);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setTargetZone("");
  };

  //synchronisation selection text Transcript
  const handleSelectionModeChange = (mode: string) => {
    setSelectionMode(mode);

    // Convertir le mode en type pour transcriptSelectionMode
    if (mode === "client" || mode === "conseiller") {
      setTranscriptSelectionMode(mode);
    } else {
      setTranscriptSelectionMode(null);
    }
  };
  // Gérer la catégorisation
  const handleAddCategorizedText = () => {
    if (textToCategorizze.trim() === "" || !selectedCategory) {
      showNotification("Veuillez sélectionner une catégorie", "warning");
      return;
    }

    const newPostit: PostitType = {
      id: generateId(),
      content: textToCategorizze,
      zone: selectedCategory,
      color: zoneColors[selectedCategory],
      isOriginal: true, // Marquer comme réponse originale
    };

    setPostits([...postits, newPostit]);
    setShowCategoryDialog(false);
    setTextToCategorizze("");
    setSelectedCategory("");
    showNotification(
      `Post-it catégorisé dans "${selectedCategory}"`,
      "success"
    );

    // Aller automatiquement à l'étape de jeu de rôle après catégorisation
    if (activeStep === 0) {
      handleNext();
    }
  };

  // Ajouter un postit manuellement depuis le contenu du texte
  const addSelectedTextAsPostit = (zone: string) => {
    if (newPostitContent.trim() === "") {
      showNotification(
        "Le contenu du post-it ne peut pas être vide",
        "warning"
      );
      return;
    }

    const newPostit: PostitType = {
      id: generateId(),
      content: newPostitContent,
      zone,
      color: zoneColors[zone],
      isOriginal: false,
    };

    setPostits([...postits, newPostit]);
    setNewPostitContent("");
    handleMenuClose();
    showNotification(`Post-it ajouté dans "${zone}"`, "success");
  };

  // Sauvegarder le jeu de rôle
  const handleSaveRolePlay = async () => {
    if (selectedCall?.callid && selectedPostitForRolePlay?.id) {
      const rolePlayDataToSave = {
        callId: selectedCall.callid,
        postits: postits,
        clientText: selectedClientText,
        conseillerText: selectedConseillerText,
        date: new Date().toISOString(),
      };

      try {
        await saveRolePlayData(
          rolePlayDataToSave,
          selectedPostitForRolePlay.id
        );

        showNotification("Jeu de rôle sauvegardé avec succès", "success");
      } catch (error) {
        console.error("Erreur lors de la sauvegarde du jeu de rôle:", error);
        showNotification(
          "Erreur lors de la sauvegarde du jeu de rôle",
          "error"
        );
      }
    } else {
      showNotification(
        "Impossible de sauvegarder: informations manquantes",
        "warning"
      );
    }
  };

  // Rendu des zones de drop
  const renderDropZones = (improvementMode = false) => (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "auto auto",
          alignItems: "start",
          gap: 0.5,
          flex: 1,
          minHeight: "400px",
        }}
      >
        {/* Zone "Ce que je fais" (VERT) */}
        <DroppableZone
          id={ZONES.JE_FAIS}
          title="Ce que je fais"
          backgroundColor={zoneColors[ZONES.JE_FAIS]}
          postits={getPostitsByZone(ZONES.JE_FAIS)}
          fontSize={fontSize}
          onEdit={openEditDialog}
          onDelete={deletePostit}
          onAddClick={(zone, content) =>
            addPostitToZone(ZONES.JE_FAIS, content)
          }
          improvementMode={improvementMode} // Nouveau prop pour indiquer le mode
          updatePostitContent={updatePostitContent}
        />

        {/* Autres zones avec le même pattern */}
        <DroppableZone
          id={ZONES.VOUS_AVEZ_FAIT}
          title="Ce qu'a fait le client"
          backgroundColor={zoneColors[ZONES.VOUS_AVEZ_FAIT]}
          postits={getPostitsByZone(ZONES.VOUS_AVEZ_FAIT)}
          fontSize={fontSize}
          onEdit={openEditDialog}
          onDelete={deletePostit}
          onAddClick={(zone, content) =>
            addPostitToZone(ZONES.VOUS_AVEZ_FAIT, content)
          }
          improvementMode={improvementMode}
          updatePostitContent={updatePostitContent}
        />

        <DroppableZone
          id={ZONES.ENTREPRISE_FAIT}
          title="Ce que fait l'entreprise"
          backgroundColor={zoneColors[ZONES.ENTREPRISE_FAIT]}
          postits={getPostitsByZone(ZONES.ENTREPRISE_FAIT)}
          fontSize={fontSize}
          onEdit={openEditDialog}
          onDelete={deletePostit}
          onAddClick={(zone, content) =>
            addPostitToZone(ZONES.ENTREPRISE_FAIT, content)
          }
          isEntrepriseZone={true}
          improvementMode={improvementMode}
          updatePostitContent={updatePostitContent}
        />

        <DroppableZone
          id={ZONES.VOUS_FEREZ}
          title="Ce que fera le client"
          backgroundColor={zoneColors[ZONES.VOUS_FEREZ]}
          postits={getPostitsByZone(ZONES.VOUS_FEREZ)}
          fontSize={fontSize}
          onEdit={openEditDialog}
          onDelete={deletePostit}
          onAddClick={(zone, content) =>
            addPostitToZone(ZONES.VOUS_FEREZ, content)
          }
          improvementMode={improvementMode}
          updatePostitContent={updatePostitContent}
        />
      </Box>

      {/* DragOverlay pour afficher le post-it en cours de déplacement */}
      <DragOverlay>
        {activePostit ? (
          <Box
            sx={{
              mb: 1,
              bgcolor: activePostit.color,
              fontSize: fontSize,
              width: "250px",
              opacity: 0.8,
              p: 1,
              borderRadius: 1,
              boxShadow: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "flex-start" }}>
              <Typography sx={{ flex: 1, fontSize: `${fontSize}px` }}>
                {activePostit.content}
              </Typography>
            </Box>
          </Box>
        ) : null}
      </DragOverlay>
    </DndContext>
  );

  // Rendu principal
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Stepper interactif fixe en haut */}
      <Box
        sx={{
          flexShrink: 0,
          backgroundColor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <StepperHeader
          steps={steps}
          activeStep={activeStep}
          mode={mode}
          onStepClick={handleStepClick}
          canNavigateToStep={canNavigateToStep}
        />
      </Box>

      {/* Contenu scrollable - prend tout l'espace disponible */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          p: 1,
        }}
      >
        {renderStepContent({
          activeStep,
          selectionMode,
          setSelectionMode: handleSelectionModeChange,
          selectedClientText,
          selectedConseillerText,
          fontSize,
          zoneColors,
          hasOriginalPostits,
          setSelectedClientText,
          setSelectedConseillerText,
          newPostitContent,
          setNewPostitContent,
          currentZone,
          setCurrentZone,
          setTextToCategorizze,
          setShowCategoryDialog,
          audioSrc,
          seekTo,
          play,
          speechToTextVisible,
          toggleSpeechToText: toggleSpeechToText || (() => {}),
          addPostitsFromSpeech,
          showNotification: (message: string, severity?: string) => {
            const alertSeverity = (severity as AlertColor) || "info";
            showNotification(message, alertSeverity);
          },
          renderDropZones,
          addSelectedTextAsPostit,
          mode,
          handleOpenZoneMenu,
          postits,
          setPostits,
        })}
      </Box>

      {/* Autres composants (dialogs, menu, snackbar) restent identiques */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            setCurrentZone(targetZone);
            handleMenuClose();
            showNotification(
              `Zone "${targetZone}" définie comme zone par défaut pour les nouveaux post-its`,
              "info"
            );
          }}
        >
          Définir comme zone par défaut
        </MenuItem>
      </Menu>

      <EditPostitDialog
        open={isEditDialogOpen}
        content={editPostitContent}
        onContentChange={setEditPostitContent}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={savePostitEdit}
      />

      <CategoryDialog
        open={showCategoryDialog}
        text={textToCategorizze}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onClose={() => setShowCategoryDialog(false)}
        onSave={handleAddCategorizedText}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity as AlertColor}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FourZones;
