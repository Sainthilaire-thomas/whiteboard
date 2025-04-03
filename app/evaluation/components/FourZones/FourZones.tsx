"use client";

import React, { useState, useEffect } from "react";
import { useCallData } from "@/context/CallDataContext";
import {
  Button,
  Box,
  Typography,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
  AlertColor,
  Tabs,
  Tab,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
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
  // Utilisez un cast explicite pour résoudre le conflit
  const callDataContext = useCallData();
  const {
    selectedCall,
    selectedPostitForRolePlay,
    rolePlayData,
    saveRolePlayData,
    isLoadingRolePlay,
  } = callDataContext as unknown as CallDataContextType;

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

  // État pour les notifications
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>("info");

  // État pour le drag and drop
  const [activeId, setActiveId] = useState<string | null>(null);

  // État pour la taille de la police et les onglets
  const [fontSize, setFontSize] = useState<number>(14);
  const [tabValue, setTabValue] = useState<number>(0);

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
  // Dans FourZones.tsx
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

  // Gestionnaires pour le menu et les onglets
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        gap: "8px",
      }}
    >
      {/* Barre d'outils supérieure */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 1,
          bgcolor: mode === "dark" ? "background.default" : "#f5f5f5",
          borderRadius: 1,
        }}
      >
        <Typography variant="subtitle1" fontWeight="bold">
          {selectedPostitForRolePlay
            ? `Jeu de rôle: ${selectedPostitForRolePlay.pratique || "Passage"}`
            : "Jeu de rôle avec 5 zones"}
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
          >
            A+
          </Button>
        </Box>
      </Box>

      {/* Onglets pour naviguer entre analyse et jeu de rôle */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab label="Analyse de l'existant" />
          <Tab label="Jeu de rôle et suggestions" />
        </Tabs>
      </Box>

      {/* Panel de sélection du texte (visible dans le premier onglet) */}
      {tabValue === 0 && (
        <>
          {" "}
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
          />
          <DynamicSpeechToTextForFourZones
            onAddPostits={addPostitsFromSpeech}
          />
        </>
      )}

      {/* Zone pour les suggestions (visible dans le second onglet) */}
      {tabValue === 1 && (
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
      )}

      <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 2 }}>
        Construction de la réponse améliorée:
      </Typography>
      <Typography
        variant="caption"
        sx={{ mb: 1, display: "flex", alignItems: "center" }}
      >
        <WarningIcon sx={{ color: "#c0392b", mr: 0.5, fontSize: "small" }} />
        Zone rouge: à limiter &nbsp;&nbsp;
        <CheckCircleIcon
          sx={{ color: "#27ae60", mr: 0.5, fontSize: "small" }}
        />
        Zones vertes: à privilégier
      </Typography>

      {/* DndContext pour les zones */}
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

      {/* Bouton de sauvegarde */}
      <Button
        variant="contained"
        color="primary"
        onClick={saveRolePlay}
        disabled={isLoadingRolePlay}
        sx={{ mt: 2 }}
        fullWidth
      >
        Sauvegarder le jeu de rôle
      </Button>

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
    </div>
  );
};

export default FourZones;
