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
import { FinalReviewStep } from "./components/FinalReviewStep";
import { ZoneLegend } from "./components/ZoneLegend";

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
    // fontSize,
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

  // AJOUT: Écouter les événements de sélection de texte (important !)
  useEffect(() => {
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
  }, [selectionMode]);

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
          gridTemplateRows: "1fr 1fr",
          gap: 1,
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
        overflow: "hidden", // Important pour que sticky fonctionne
      }}
    >
      {/* Stepper fixe en haut */}
      <Box
        sx={{
          flexShrink: 0, // Ne se réduit pas
          backgroundColor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
          p: 2,
          px: 2,
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <StepperHeader steps={steps} activeStep={activeStep} mode={mode} />
      </Box>

      {/* Contenu scrollable */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto", // Permet le scroll
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
          toggleSpeechToText,
          addPostitsFromSpeech,
          showNotification,
          renderDropZones,
          addSelectedTextAsPostit,
          mode,
          handleOpenZoneMenu,
          postits,
          setPostits,
        })}
      </Box>

      {/* Navigation fixe en bas */}
      <Box
        sx={{
          flexShrink: 0, // Ne se réduit pas
          backgroundColor: "background.paper",
          borderTop: "1px solid",
          borderColor: "divider",
          p: 2,
          boxShadow: "0 -2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <StepNavigation
          activeStep={activeStep}
          stepsLength={steps.length}
          handleBack={handleBack}
          handleNext={handleNext}
          canProceedToNextStep={canProceedToNextStep()}
          mode={mode}
        />
      </Box>

      {/* Menu contextuel pour l'ajout à une zone */}
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

      {/* Boîte de dialogue pour modifier un post-it */}
      <EditPostitDialog
        open={isEditDialogOpen}
        content={editPostitContent}
        onContentChange={setEditPostitContent}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={savePostitEdit}
      />

      {/* Boîte de dialogue pour catégoriser le texte du conseiller */}
      <CategoryDialog
        open={showCategoryDialog}
        text={textToCategorizze}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onClose={() => setShowCategoryDialog(false)}
        onSave={handleAddCategorizedText}
      />

      {/* Notification */}
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
