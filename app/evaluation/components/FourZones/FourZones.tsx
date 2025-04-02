"use client";

import React, { useState, useEffect, useRef } from "react";
import { useCallData } from "@/context/CallDataContext";
import {
  Button,
  Card,
  CardContent,
  TextField,
  IconButton,
  Paper,
  Box,
  Typography,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Tabs,
  Tab,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useThemeMode } from "@/app/components/common/Theme/ThemeProvider";
import { RolePlayPostit, RolePlayData } from "@/types/types";
import { supabaseClient } from "@/lib/supabaseClient";
// Importations @dnd-kit
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
  UniqueIdentifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Définition des types pour les 5 zones
const ZONES = {
  CLIENT: "client",
  CONSEILLER: "conseiller", // Zone pour la réponse réelle du conseiller
  VOUS_AVEZ_FAIT: "vousAvezFait", // Ce qu'a fait le client - VERT
  JE_FAIS: "jeFais", // Ce que je fais - VERT
  ENTREPRISE_FAIT: "entrepriseFait", // Ce que fait l'entreprise - ROUGE
  VOUS_FEREZ: "vousFerez", // Ce que fera le client - VERT
};

// Composant pour un post-it sortable
const SortablePostit = ({
  postit,
  fontSize,
  onEdit,
  onDelete,
  isOriginal = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: postit.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    marginBottom: "8px",
    backgroundColor: postit.color,
    fontSize: fontSize,
    border: isOriginal ? "2px dashed #666" : "none", // Marquer les post-its originaux
  };

  return (
    <Card ref={setNodeRef} style={style}>
      <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
        <Box sx={{ display: "flex", alignItems: "flex-start" }}>
          <Box {...attributes} {...listeners} sx={{ mr: 1, cursor: "grab" }}>
            <DragIndicatorIcon fontSize="small" />
          </Box>
          <Typography
            sx={{
              flex: 1,
              fontSize: `${fontSize}px`,
              fontWeight: isOriginal ? "bold" : "normal", // Mise en évidence des post-its originaux
            }}
          >
            {postit.content}
            {isOriginal && (
              <Typography
                variant="caption"
                display="block"
                sx={{ mt: 0.5, fontStyle: "italic" }}
              >
                (Réponse originale)
              </Typography>
            )}
          </Typography>
          <Box>
            <IconButton
              size="small"
              onClick={() => onEdit(postit.id, postit.content)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => onDelete(postit.id)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// Composant pour une zone qui peut contenir des post-its
const DroppableZone = ({
  id,
  title,
  backgroundColor,
  postits,
  fontSize,
  onEdit,
  onDelete,
  onAddClick,
  isEntrepriseZone = false,
}) => {
  const [isCreatingPostit, setIsCreatingPostit] = useState(false);
  const [newPostitText, setNewPostitText] = useState("Que dites-vous ici ?");
  const inputRef = useRef(null);

  const handleAddClick = () => {
    setIsCreatingPostit(true);
    // Utiliser setTimeout pour permettre au DOM de se mettre à jour avant de focus
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select(); // Sélectionne tout le texte par défaut
      }
    }, 50);
  };

  const handleInputBlur = () => {
    if (newPostitText.trim() && newPostitText !== "Que dites-vous ici ?") {
      // Créer le post-it si le texte n'est pas vide et différent du placeholder
      onAddClick(id, newPostitText);
    }
    setIsCreatingPostit(false);
    setNewPostitText("Que dites-vous ici ?");
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      if (newPostitText.trim() && newPostitText !== "Que dites-vous ici ?") {
        // Créer le post-it si le texte n'est pas vide et différent du placeholder
        onAddClick(id, newPostitText);
      }
      setIsCreatingPostit(false);
      setNewPostitText("Que dites-vous ici ?");
    } else if (e.key === "Escape") {
      setIsCreatingPostit(false);
      setNewPostitText("Que dites-vous ici ?");
    }
  };

  const handleInputChange = (e) => {
    setNewPostitText(e.target.value);
  };

  const handleInputFocus = (e) => {
    if (newPostitText === "Que dites-vous ici ?") {
      e.target.select();
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 1,
        bgcolor: backgroundColor,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        position: "relative",
        borderLeft: isEntrepriseZone
          ? "4px solid #c0392b"
          : "4px solid #27ae60",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {isEntrepriseZone ? (
            <WarningIcon sx={{ color: "#c0392b", mr: 1 }} fontSize="small" />
          ) : (
            <CheckCircleIcon
              sx={{ color: "#27ae60", mr: 1 }}
              fontSize="small"
            />
          )}
          <Typography variant="subtitle2" fontWeight="bold">
            {title}
          </Typography>
        </Box>
        <IconButton size="small" onClick={handleAddClick}>
          <AddIcon />
        </IconButton>
      </Box>
      <Box sx={{ overflowY: "auto", flex: 1 }}>
        <SortableContext
          items={postits.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          {postits.map((postit) => (
            <SortablePostit
              key={postit.id}
              postit={postit}
              fontSize={fontSize}
              onEdit={onEdit}
              onDelete={onDelete}
              isOriginal={postit.isOriginal}
            />
          ))}
          {isCreatingPostit && (
            <Card style={{ marginBottom: "8px", backgroundColor }}>
              <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
                <TextField
                  fullWidth
                  multiline
                  variant="standard"
                  inputRef={inputRef}
                  value={newPostitText}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  onKeyDown={handleInputKeyDown}
                  onFocus={handleInputFocus}
                  autoFocus
                  InputProps={{
                    style: { fontSize: `${fontSize}px` },
                  }}
                  sx={{
                    "& .MuiInput-underline:before": {
                      borderBottomColor: "transparent",
                    },
                    "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
                      borderBottomColor: "rgba(0, 0, 0, 0.42)",
                    },
                  }}
                />
              </CardContent>
            </Card>
          )}
        </SortableContext>
      </Box>
    </Paper>
  );
};

const FourZones = () => {
  const { mode } = useThemeMode();
  const {
    selectedCall,
    selectedPostitForRolePlay,
    rolePlayData,
    saveRolePlayData,
    fetchRolePlayData,
    zoneTexts,
    selectTextForZone,
    isLoadingRolePlay,
  } = useCallData();

  // États pour les post-its et le texte sélectionné
  const [selectedClientText, setSelectedClientText] = useState("");
  const [selectedConseillerText, setSelectedConseillerText] = useState("");
  const [postits, setPostits] = useState([]);
  const [newPostitContent, setNewPostitContent] = useState("");
  const [currentZone, setCurrentZone] = useState(ZONES.JE_FAIS);

  // État pour le mode de sélection (client ou conseiller)
  const [selectionMode, setSelectionMode] = useState("client");

  // État pour l'interface de catégorisation
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [textToCategorizze, setTextToCategorizze] = useState("");

  // États pour la modification de post-it
  const [editPostitId, setEditPostitId] = useState(null);
  const [editPostitContent, setEditPostitContent] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // État pour le menu contextuel de la zone
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [targetZone, setTargetZone] = useState("");

  // État pour les notifications
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");

  // État pour le drag and drop
  const [activeId, setActiveId] = useState(null);

  // État pour la taille de la police
  const [fontSize, setFontSize] = useState(14);

  // État pour les onglets (Analyse/Jeu de rôle)
  const [tabValue, setTabValue] = useState(0);

  // Configurer les sensors pour dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Couleurs des zones basées sur le thème et la sémantique
  const zoneColors =
    mode === "dark"
      ? {
          // Zone client et conseiller (neutres)
          [ZONES.CLIENT]: "#2c3e50", // Bleu foncé pour le mode sombre
          [ZONES.CONSEILLER]: "#34495e", // Gris-bleu foncé pour le mode sombre

          // Zones vertes (recommandées)
          [ZONES.VOUS_AVEZ_FAIT]: "#27ae60", // Vert foncé pour le mode sombre
          [ZONES.JE_FAIS]: "#2ecc71", // Vert moyen pour le mode sombre
          [ZONES.VOUS_FEREZ]: "#16a085", // Vert-bleu pour le mode sombre

          // Zone rouge (à limiter)
          [ZONES.ENTREPRISE_FAIT]: "#c0392b", // Rouge foncé pour le mode sombre
        }
      : {
          // Zone client et conseiller (neutres)
          [ZONES.CLIENT]: "#d7e4f4", // Bleu clair pour le mode clair
          [ZONES.CONSEILLER]: "#e0e7ed", // Gris-bleu clair pour le mode clair

          // Zones vertes (recommandées)
          [ZONES.VOUS_AVEZ_FAIT]: "#d4efdf", // Vert très clair pour le mode clair
          [ZONES.JE_FAIS]: "#abebc6", // Vert clair pour le mode clair
          [ZONES.VOUS_FEREZ]: "#a2d9ce", // Vert-bleu clair pour le mode clair

          // Zone rouge (à limiter)
          [ZONES.ENTREPRISE_FAIT]: "#f5b7b1", // Rouge clair pour le mode clair
        };

  // Initialiser avec les données existantes ou le post-it sélectionné
  useEffect(() => {
    if (
      rolePlayData &&
      rolePlayData.postits &&
      rolePlayData.postits.length > 0
    ) {
      // Charger les données de jeu de rôle existantes
      setPostits(rolePlayData.postits);

      // Si un texte client existe, le définir
      if (rolePlayData.clientText) {
        setSelectedClientText(rolePlayData.clientText);
      }

      // Si un texte conseiller existe, le définir
      if (rolePlayData.conseillerText) {
        setSelectedConseillerText(rolePlayData.conseillerText);
      }
    } else if (selectedPostitForRolePlay) {
      // Si aucune donnée existante, mais qu'un post-it est sélectionné, l'utiliser
      if (selectedPostitForRolePlay.text) {
        setSelectedClientText(selectedPostitForRolePlay.text || "");
      }
    }
  }, [rolePlayData, selectedPostitForRolePlay]);

  // Écouter les événements de sélection de texte
  useEffect(() => {
    const handleTextSelection = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        const selectedText = selection.toString().trim();

        // Si on est en mode sélection client
        if (selectionMode === "client") {
          setSelectedClientText(selectedText);
        }
        // Si on est en mode sélection conseiller, ouvrir la boîte de dialogue pour catégoriser
        else if (selectionMode === "conseiller") {
          setSelectedConseillerText(selectedText);
          setTextToCategorizze(selectedText);
          setShowCategoryDialog(true);
        }
      }
    };

    document.addEventListener("mouseup", handleTextSelection);
    return () => document.removeEventListener("mouseup", handleTextSelection);
  }, [selectionMode, selectTextForZone]);

  // Générer un ID unique
  const generateId = () =>
    `postit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Gère l'augmentation de la taille de la police
  const increaseFontSize = () =>
    setFontSize((currentSize) => Math.min(currentSize + 1, 24));

  // Gère la diminution de la taille de la police
  const decreaseFontSize = () =>
    setFontSize((currentSize) => Math.max(currentSize - 1, 10));

  // Ajouter un nouveau post-it
  const addPostit = () => {
    if (newPostitContent.trim() === "") return;

    const newPostit = {
      id: generateId(),
      content: newPostitContent,
      zone: currentZone,
      color: zoneColors[currentZone],
      isOriginal: false,
    };

    setPostits([...postits, newPostit]);
    setNewPostitContent("");
  };

  const addPostitToZone = (zone, content) => {
    const newPostit = {
      id: generateId(),
      content: content,
      zone: zone,
      color: zoneColors[zone],
      isOriginal: false,
    };

    setPostits([...postits, newPostit]);

    // On peut aussi afficher une notification de confirmation
    setSnackbarMessage(`Post-it ajouté dans "${zone}"`);
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  // Ajouter le texte conseiller catégorisé
  const addCategorizedText = () => {
    if (textToCategorizze.trim() === "" || !selectedCategory) return;

    const newPostit = {
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

  // Ajouter le texte sélectionné comme post-it suggestion
  const addSelectedTextAsPostit = (zone) => {
    if (newPostitContent.trim() === "") return;

    const newPostit = {
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

  // Supprimer un post-it
  const deletePostit = (id) => {
    setPostits(postits.filter((postit) => postit.id !== id));
  };

  // Ouvrir la boîte de dialogue de modification
  const openEditDialog = (id, content) => {
    setEditPostitId(id);
    setEditPostitContent(content);
    setIsEditDialogOpen(true);
  };

  // Enregistrer les modifications de post-it
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

  // Gérer le début du drag
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  // Gérer la fin du drag
  const handleDragEnd = (event) => {
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

  // Gérer le survol de drag pour changer de zone
  const handleDragOver = (event) => {
    const { active, over } = event;

    if (!over) return;

    // Logique pour changer de zone si nécessaire
    if (
      over.data.current?.type === "zone" &&
      active.data.current?.type !== "zone"
    ) {
      const zoneId = over.id;
      const postitId = active.id;

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

  // Ouvrir le menu contextuel pour l'ajout à une zone
  const handleOpenZoneMenu = (event, zone) => {
    setMenuAnchorEl(event.currentTarget);
    setTargetZone(zone);
  };

  // Fermer le menu contextuel
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setTargetZone("");
  };

  // Changer d'onglet
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Fermer la notification
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Sauvegarder l'ensemble du jeu de rôle
  const saveRolePlay = async () => {
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
  const getPostitsByZone = (zone) => {
    return postits.filter((postit) => postit.zone === zone);
  };

  // Trouver le post-it actif
  const activePostit = activeId ? postits.find((p) => p.id === activeId) : null;

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
          bgcolor: "#f5f5f5",
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
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}>
          <FormControl component="fieldset">
            <FormLabel component="legend">
              Sélectionnez dans la transcription:
            </FormLabel>
            <RadioGroup
              row
              value={selectionMode}
              onChange={(e) => setSelectionMode(e.target.value)}
            >
              <FormControlLabel
                value="client"
                control={<Radio />}
                label="Ce que dit le client"
              />
              <FormControlLabel
                value="conseiller"
                control={<Radio />}
                label="Ce que répond le conseiller"
              />
            </RadioGroup>
          </FormControl>

          {/* Zone pour le texte client sélectionné */}
          <Paper
            elevation={3}
            sx={{
              p: 2,
              bgcolor: zoneColors[ZONES.CLIENT],
              minHeight: "60px",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography variant="subtitle2" fontWeight="bold">
                Le client dit
              </Typography>
            </Box>
            <Typography fontSize={fontSize}>
              {selectedClientText ||
                "Sélectionnez du texte client depuis la transcription"}
            </Typography>
          </Paper>

          {/* Zone pour le texte conseiller sélectionné */}
          <Paper
            elevation={3}
            sx={{
              p: 2,
              bgcolor: zoneColors[ZONES.CONSEILLER],
              minHeight: "60px",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography variant="subtitle2" fontWeight="bold">
                Le conseiller répond
              </Typography>
              {selectedConseillerText && !postits.some((p) => p.isOriginal) && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<CompareArrowsIcon />}
                  onClick={() => {
                    setTextToCategorizze(selectedConseillerText);
                    setShowCategoryDialog(true);
                  }}
                >
                  Catégoriser cette réponse
                </Button>
              )}
            </Box>
            <Typography fontSize={fontSize}>
              {selectedConseillerText ||
                "Sélectionnez la réponse du conseiller depuis la transcription"}
            </Typography>
          </Paper>
        </Box>
      )}

      {/* Zone pour les suggestions (visible dans le second onglet) */}
      {tabValue === 1 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              bgcolor: zoneColors[ZONES.CLIENT],
              minHeight: "60px",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography variant="subtitle2" fontWeight="bold">
                Situation: Le client dit
              </Typography>
            </Box>
            <Typography fontSize={fontSize} fontWeight="bold">
              {selectedClientText ||
                "Vous devez d'abord sélectionner un verbatim client dans l'onglet Analyse"}
            </Typography>
          </Paper>

          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <TextField
              fullWidth
              size="small"
              label="Suggestion de réponse du conseiller"
              placeholder="Entrez une suggestion de réponse..."
              value={newPostitContent}
              onChange={(e) => setNewPostitContent(e.target.value)}
              variant="outlined"
            />
            <Button
              variant="contained"
              onClick={() => {
                if (!currentZone) {
                  setSnackbarMessage("Veuillez sélectionner une zone");
                  setSnackbarSeverity("warning");
                  setSnackbarOpen(true);
                  return;
                }
                addSelectedTextAsPostit(currentZone);
              }}
              disabled={newPostitContent.trim() === ""}
            >
              Ajouter
            </Button>
          </Box>

          <FormControl component="fieldset">
            <FormLabel component="legend">
              Catégoriser cette suggestion dans:
            </FormLabel>
            <RadioGroup
              row
              value={currentZone}
              onChange={(e) => setCurrentZone(e.target.value)}
            >
              <FormControlLabel
                value={ZONES.VOUS_AVEZ_FAIT}
                control={<Radio />}
                label="Ce qu'a fait le client"
                sx={{
                  ".MuiFormControlLabel-label": {
                    color: "#27ae60",
                    fontWeight: "bold",
                  },
                }}
              />
              <FormControlLabel
                value={ZONES.JE_FAIS}
                control={<Radio />}
                label="Ce que je fais"
                sx={{
                  ".MuiFormControlLabel-label": {
                    color: "#27ae60",
                    fontWeight: "bold",
                  },
                }}
              />
              <FormControlLabel
                value={ZONES.ENTREPRISE_FAIT}
                control={<Radio />}
                label="Ce que fait l'entreprise"
                sx={{
                  ".MuiFormControlLabel-label": {
                    color: "#c0392b",
                    fontWeight: "bold",
                  },
                }}
              />
              <FormControlLabel
                value={ZONES.VOUS_FEREZ}
                control={<Radio />}
                label="Ce que fera le client"
                sx={{
                  ".MuiFormControlLabel-label": {
                    color: "#27ae60",
                    fontWeight: "bold",
                  },
                }}
              />
            </RadioGroup>
          </FormControl>
        </Box>
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
            <Card
              sx={{
                mb: 1,
                bgcolor: activePostit.color,
                fontSize: fontSize,
                width: "250px",
                opacity: 0.8,
              }}
            >
              <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
                <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                  <Box sx={{ mr: 1 }}>
                    <DragIndicatorIcon fontSize="small" />
                  </Box>
                  <Typography sx={{ flex: 1, fontSize: `${fontSize}px` }}>
                    {activePostit.content}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
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
      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
      >
        <DialogTitle>Modifier le post-it</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            multiline
            rows={3}
            value={editPostitContent}
            onChange={(e) => setEditPostitContent(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>Annuler</Button>
          <Button onClick={savePostitEdit}>Enregistrer</Button>
        </DialogActions>
      </Dialog>

      {/* Boîte de dialogue pour catégoriser le texte du conseiller */}
      <Dialog
        open={showCategoryDialog}
        onClose={() => setShowCategoryDialog(false)}
      >
        <DialogTitle>Catégoriser la réponse du conseiller</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Dans quelle catégorie placez-vous cette réponse?
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, fontStyle: "italic" }}>
            "{textToCategorizze}"
          </Typography>
          <FormControl component="fieldset">
            <RadioGroup
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <FormControlLabel
                value={ZONES.VOUS_AVEZ_FAIT}
                control={<Radio />}
                label="Ce qu'a fait le client"
                sx={{
                  ".MuiFormControlLabel-label": {
                    color: "#27ae60",
                  },
                }}
              />
              <FormControlLabel
                value={ZONES.JE_FAIS}
                control={<Radio />}
                label="Ce que je fais"
                sx={{
                  ".MuiFormControlLabel-label": {
                    color: "#27ae60",
                  },
                }}
              />
              <FormControlLabel
                value={ZONES.ENTREPRISE_FAIT}
                control={<Radio />}
                label="Ce que fait l'entreprise"
                sx={{
                  ".MuiFormControlLabel-label": {
                    color: "#c0392b",
                  },
                }}
              />
              <FormControlLabel
                value={ZONES.VOUS_FEREZ}
                control={<Radio />}
                label="Ce que fera le client"
                sx={{
                  ".MuiFormControlLabel-label": {
                    color: "#27ae60",
                  },
                }}
              />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCategoryDialog(false)}>Annuler</Button>
          <Button onClick={addCategorizedText} disabled={!selectedCategory}>
            Catégoriser
          </Button>
        </DialogActions>
      </Dialog>

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
