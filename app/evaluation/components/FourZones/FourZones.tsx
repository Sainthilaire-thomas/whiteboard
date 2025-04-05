"use client";

import React, { useState, useEffect } from "react";
import { useCallData } from "@/context/CallDataContext";
import { useAudio } from "@/context/AudioContext";
import {
  Button,
  Box,
  Typography,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
  AlertColor,
  Stepper,
  Step,
  StepLabel,
  Paper,
  IconButton,
} from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import AddIcon from "@mui/icons-material/Add";
import { PlayArrow } from "@mui/icons-material";
import RemoveIcon from "@mui/icons-material/Remove";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useThemeMode } from "@/app/components/common/Theme/ThemeProvider";

// Import des composants factorisés
import { DroppableZone } from "./components/DroppableZone";
import { ClientResponseSection } from "./components/ClientResponseSection";
import { ImprovementSection } from "./components/ImprovementSection";
import {
  EditPostitDialog,
  CategoryDialog,
} from "./components/DialogComponents";
import DynamicSpeechToTextForFourZones from "./components/DynamicSpeechToTextForFourZones";

// Import des types, constantes et utilitaires
import { ZONES } from "./constants/zone";
import { generateId, getZoneColors } from "./utils/postitUtils";
import {
  PostitType,
  ExtendedRolePlayData,
  CallDataContextType,
} from "./types/types";

// Import dnd-kit
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

const FourZones: React.FC = () => {
  const { mode } = useThemeMode();
  const callDataContext = useCallData();
  const {
    selectedCall,
    selectedPostitForRolePlay,
    rolePlayData,
    saveRolePlayData,
    isLoadingRolePlay,
  } = callDataContext as unknown as CallDataContextType;
  const { audioSrc, play, seekTo } = useAudio();

  // État pour les étapes
  const [activeStep, setActiveStep] = useState<number>(0);
  const steps = [
    "Sélection du contexte",
    "Jeu de rôle",
    "Suggestions d'amélioration",
    "Lecture finale",
  ];

  // États pour les post-its et textes
  const [selectedClientText, setSelectedClientText] = useState<string>("");
  const [selectedConseillerText, setSelectedConseillerText] =
    useState<string>("");
  const [postits, setPostits] = useState<PostitType[]>([]);
  const [newPostitContent, setNewPostitContent] = useState<string>("");
  const [currentZone, setCurrentZone] = useState<string>(ZONES.JE_FAIS);

  // État pour le mode de sélection
  const [selectionMode, setSelectionMode] = useState<string>("client");

  // États pour les dialogues
  const [showCategoryDialog, setShowCategoryDialog] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [textToCategorizze, setTextToCategorizze] = useState<string>("");
  const [editPostitId, setEditPostitId] = useState<string | null>(null);
  const [editPostitContent, setEditPostitContent] = useState<string>("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);

  // État pour le menu contextuel
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [targetZone, setTargetZone] = useState<string>("");

  // Etat pour la reconnaissance vocale
  const [speechToTextVisible, setSpeechToTextVisible] = useState(false);

  // Add a handler to toggle the speech-to-text component
  const toggleSpeechToText = () => {
    setSpeechToTextVisible((prev) => !prev);
  };

  // État pour les notifications
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>("info");

  // État pour le drag and drop
  const [activeId, setActiveId] = useState<string | null>(null);

  // État pour la taille de la police
  const [fontSize, setFontSize] = useState<number>(14);

  // Configurer les sensors pour dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Obtenir les couleurs des zones en fonction du thème
  const zoneColors = getZoneColors(mode);

  // Initialiser avec les données existantes
  useEffect(() => {
    if (
      rolePlayData &&
      rolePlayData.postits &&
      rolePlayData.postits.length > 0
    ) {
      setPostits(rolePlayData.postits);
      if (rolePlayData.clientText) {
        setSelectedClientText(rolePlayData.clientText);
      }
      if (rolePlayData.conseillerText) {
        setSelectedConseillerText(rolePlayData.conseillerText);
      }
    } else if (selectedPostitForRolePlay?.text) {
      setSelectedClientText(selectedPostitForRolePlay.text);
    }
  }, [rolePlayData, selectedPostitForRolePlay]);

  // Écouter les événements de sélection de texte
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

  // Gestionnaires de taille de police
  const increaseFontSize = () =>
    setFontSize((current) => Math.min(current + 1, 24));
  const decreaseFontSize = () =>
    setFontSize((current) => Math.max(current - 1, 10));

  // Navigation entre les étapes
  const handleNext = () => {
    setActiveStep((prevActiveStep) =>
      Math.min(prevActiveStep + 1, steps.length - 1)
    );
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => Math.max(prevActiveStep - 1, 0));
  };

  // Vérifier si on peut passer à l'étape suivante
  const canProceedToNextStep = () => {
    switch (activeStep) {
      case 0:
        // Nécessite au moins un texte client et une réponse conseiller
        return (
          selectedClientText.trim() !== "" &&
          selectedConseillerText.trim() !== ""
        );
      case 1:
        // Nécessite au moins un post-it dans n'importe quelle zone
        return postits.length > 0;
      case 2:
        // Peut toujours passer à l'étape de lecture
        return true;
      default:
        return false;
    }
  };

  // Fonctions pour gérer les post-its
  const addPostitToZone = (zone: string, content: string) => {
    const newPostit: PostitType = {
      id: generateId(),
      content,
      zone,
      color: zoneColors[zone],
      isOriginal: false,
    };

    setPostits([...postits, newPostit]);
    setSnackbarMessage(`Post-it ajouté dans "${zone}"`);
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  const addCategorizedText = () => {
    if (textToCategorizze.trim() === "" || !selectedCategory) return;

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

    // Aller automatiquement à l'étape de jeu de rôle après catégorisation
    if (activeStep === 0) {
      handleNext();
    }
  };

  const addSelectedTextAsPostit = (zone: string) => {
    if (newPostitContent.trim() === "") return;

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
  };

  const deletePostit = (id: string) => {
    setPostits(postits.filter((postit) => postit.id !== id));
  };

  const openEditDialog = (id: string, content: string) => {
    setEditPostitId(id);
    setEditPostitContent(content);
    setIsEditDialogOpen(true);
  };

  const savePostitEdit = () => {
    if (editPostitId && editPostitContent.trim() !== "") {
      setPostits(
        postits.map((postit) =>
          postit.id === editPostitId
            ? { ...postit, content: editPostitContent }
            : postit
        )
      );
    }
    setIsEditDialogOpen(false);
    setEditPostitId(null);
    setEditPostitContent("");
  };

  //fonction pour ajouter postit depuis la reconnaissance vocale
  const addPostitsFromSpeech = (newPostits: PostitType[]) => {
    setPostits([...postits, ...newPostits]);
  };

  // Gestionnaires pour drag and drop
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);

    if (!over) return;

    if (active.id !== over.id) {
      setPostits((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    if (
      over.data.current?.type === "zone" &&
      active.data.current?.type !== "zone"
    ) {
      const zoneId = over.id as string;
      const postitId = active.id as string;

      const postitIndex = postits.findIndex((p) => p.id === postitId);
      if (postitIndex === -1) return;

      if (postits[postitIndex].zone !== zoneId) {
        const updatedPostits = [...postits];
        updatedPostits[postitIndex] = {
          ...updatedPostits[postitIndex],
          zone: zoneId,
          color: zoneColors[zoneId],
        };

        setPostits(updatedPostits);
      }
    }
  };

  // Gestionnaires pour le menu contextuel
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

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Sauvegarder le jeu de rôle
  const saveRolePlay = async () => {
    if (selectedCall?.callid && selectedPostitForRolePlay?.id) {
      const rolePlayDataToSave: ExtendedRolePlayData = {
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

        setSnackbarMessage("Jeu de rôle sauvegardé avec succès");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      } catch (error) {
        console.error("Erreur lors de la sauvegarde du jeu de rôle:", error);
        setSnackbarMessage("Erreur lors de la sauvegarde du jeu de rôle");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } else {
      setSnackbarMessage("Impossible de sauvegarder: informations manquantes");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
    }
  };

  // Filtrer les post-its par zone
  const getPostitsByZone = (zone: string) => {
    return postits.filter((postit) => postit.zone === zone);
  };

  // Trouver le post-it actif
  const activePostit = activeId ? postits.find((p) => p.id === activeId) : null;

  // Vérification pour l'affichage du bouton de catégorisation
  const hasOriginalPostits = postits.some((p) => p.isOriginal);

  // Rendu des zones de drop
  const renderDropZones = () => (
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
          minHeight: "400px", // Hauteur minimale pour les zones
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
        />
        {/* Zone "Ce qu'a fait le client" (VERT) */}
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
        />

        {/* Zone "Ce que fait l'entreprise" (ROUGE) */}
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
        />

        {/* Zone "Ce que fera le client" (VERT) */}
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

  // Légende des zones
  const renderZoneLegend = () => (
    <Box sx={{ mb: 2 }}>
      <Typography
        variant="caption"
        sx={{ display: "flex", alignItems: "center" }}
      >
        <WarningIcon sx={{ color: "#c0392b", mr: 0.5, fontSize: "small" }} />
        Zone rouge: à limiter &nbsp;&nbsp;
        <CheckCircleIcon
          sx={{ color: "#27ae60", mr: 0.5, fontSize: "small" }}
        />
        Zones vertes: à privilégier
      </Typography>
    </Box>
  );

  // Rendu du contenu en fonction de l'étape active
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        // Étape 1: Sélection du contexte
        return (
          <>
            <ClientResponseSection
              selectionMode={selectionMode}
              onSelectionModeChange={setSelectionMode}
              selectedClientText={selectedClientText}
              selectedConseillerText={selectedConseillerText}
              fontSize={fontSize}
              zoneColors={zoneColors}
              hasOriginalPostits={hasOriginalPostits}
              onCategorizeClick={(text) => {
                setTextToCategorizze(text);
                setShowCategoryDialog(true);
              }}
              setSelectedClientText={setSelectedClientText}
              setSelectedConseillerText={setSelectedConseillerText}
            />
          </>
        );
      case 1:
        // Étape 2: Jeu de rôle
        return (
          <>
            <Box sx={{ mb: 1 }}>
              <Paper
                elevation={1}
                sx={{
                  p: 1,
                  bgcolor: "background.paper",
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Le client dit:</strong> {selectedClientText}
                    </Typography>
                    {selectedClientText && (
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => {
                          if (audioSrc) {
                            // Commencer à 0 pour l'instant
                            seekTo(0);
                            play();
                          }
                        }}
                        title="Écouter le passage"
                      >
                        <PlayArrow fontSize="small" />
                      </IconButton>
                    )}
                  </Box>

                  {/* Bouton pour déclencher l'enregistrement vocal */}
                  <IconButton
                    color="primary"
                    onClick={toggleSpeechToText}
                    sx={{
                      ml: 1,
                      bgcolor: speechToTextVisible
                        ? "rgba(25, 118, 210, 0.1)"
                        : "transparent",
                      "&:hover": {
                        bgcolor: "rgba(25, 118, 210, 0.2)",
                      },
                    }}
                    title="Enregistrer la réponse du conseiller"
                  >
                    <MicIcon />
                  </IconButton>
                </Box>

                {/* Composant de reconnaissance vocale contextuel */}
                {speechToTextVisible && (
                  <Box
                    sx={{
                      mt: 1,
                      p: 1,
                      bgcolor: "rgba(0,0,0,0.03)",
                      borderRadius: 1,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ display: "block", mb: 1 }}
                    >
                      Enregistrez votre réponse en tant que conseiller:
                    </Typography>
                    <DynamicSpeechToTextForFourZones
                      onAddPostits={addPostitsFromSpeech}
                      isContextual={true} // Pass a prop to indicate contextual mode
                    />
                  </Box>
                )}
              </Paper>
            </Box>

            {renderZoneLegend()}
            {renderDropZones()}

            <Box sx={{ mt: 2 }}>
              <DynamicSpeechToTextForFourZones
                onAddPostits={addPostitsFromSpeech}
              />
            </Box>
          </>
        );
      case 2:
        // Étape 3: Suggestions d'amélioration
        return (
          <>
            <ImprovementSection
              selectedClientText={selectedClientText}
              newPostitContent={newPostitContent}
              onNewPostitContentChange={setNewPostitContent}
              currentZone={currentZone}
              onCurrentZoneChange={setCurrentZone}
              onAddPostit={() => {
                if (!currentZone) {
                  setSnackbarMessage("Veuillez sélectionner une zone");
                  setSnackbarSeverity("warning");
                  setSnackbarOpen(true);
                  return;
                }
                addSelectedTextAsPostit(currentZone);
              }}
              fontSize={fontSize}
              zoneColors={zoneColors}
            />

            {renderZoneLegend()}
            {renderDropZones()}
          </>
        );
      case 3:
        // Étape 4: Lecture finale
        return (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="h6" gutterBottom>
              Lecture finale de la réponse
            </Typography>
            <Typography variant="body1" paragraph>
              Cette section permettra de lire en text-to-speech le résultat
              final du jeu de rôle.
            </Typography>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                mt: 2,
                mb: 2,
                minHeight: "300px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                bgcolor:
                  mode === "dark"
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.02)",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Le contenu de lecture finale sera implémenté dans cette section.
              </Typography>
              <Button variant="outlined" sx={{ mt: 2 }} disabled>
                Lire à haute voix
              </Button>
            </Paper>
          </Box>
        );
      default:
        return <Typography>Étape inconnue</Typography>;
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        gap: "12px",
      }}
    >
      {/* Barre d'outils supérieure */}
      <Paper
        elevation={1}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 1.5,
          bgcolor: mode === "dark" ? "background.default" : "#f5f5f5",
          borderRadius: 1,
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          {selectedPostitForRolePlay
            ? `Jeu de rôle: ${selectedPostitForRolePlay.pratique || "Passage"}`
            : "Jeu de rôle avec 4 zones"}
        </Typography>
        <Box>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RemoveIcon />}
            onClick={decreaseFontSize}
            sx={{ mr: 1 }}
          >
            A-
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={increaseFontSize}
            sx={{ mr: 2 }}
          >
            A+
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={saveRolePlay}
            disabled={isLoadingRolePlay}
          >
            Sauvegarder
          </Button>
        </Box>
      </Paper>

      {/* Stepper pour suivre la progression */}
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

      {/* Contenu principal basé sur l'étape active */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          p: 1,
        }}
      >
        {renderStepContent()}
      </Box>

      {/* Barre de navigation entre les étapes */}
      <Paper
        elevation={1}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          p: 1.5,
          mt: 1,
          bgcolor: mode === "dark" ? "background.paper" : "#ffffff",
          borderRadius: 1,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          disabled={activeStep === 0}
        >
          Précédent
        </Button>

        <Typography variant="body2">
          Étape {activeStep + 1} sur {steps.length}
        </Typography>

        <Button
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          onClick={handleNext}
          disabled={activeStep === steps.length - 1 || !canProceedToNextStep()}
        >
          Suivant
        </Button>
      </Paper>

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
            setSnackbarMessage(
              `Zone "${targetZone}" définie comme zone par défaut pour les nouveaux post-its`
            );
            setSnackbarSeverity("info");
            setSnackbarOpen(true);
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
        onSave={addCategorizedText}
      />

      {/* Notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FourZones;
