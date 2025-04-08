// components/ImprovementSection.tsx
import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import { improveTextWithAI } from "../utils/aiUtils";
import { ZONES } from "../constants/zone";
import { ImprovementSectionProps, PostitType } from "../types/types";

export const ImprovementSection: React.FC<ImprovementSectionProps> = ({
  selectedClientText,
  postits = [],
  onAddSuggestion,
  onEditPostit,
  onDeletePostit,
  fontSize,
  zoneColors,
}) => {
  const [newSuggestion, setNewSuggestion] = useState<string>("");
  const [selectedZone, setSelectedZone] = useState<string>(ZONES.JE_FAIS);
  const [showGuide, setShowGuide] = useState<boolean>(true);
  const [editingPostitId, setEditingPostitId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<string>("");

  // État pour le menu d'amélioration IA
  const [aiMenuAnchorEl, setAiMenuAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [selectedPostitForAI, setSelectedPostitForAI] =
    useState<PostitType | null>(null);
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [showAiPromptInput, setShowAiPromptInput] = useState<boolean>(false);

  // Obtenir les postits par zone
  const getPostitsByZone = (zone: string) => {
    return (postits || []).filter((postit) => postit.zone === zone);
  };

  // Gérer l'ajout d'une nouvelle suggestion
  const handleAddSuggestion = () => {
    if (newSuggestion.trim()) {
      onAddSuggestion(selectedZone, newSuggestion);
      setNewSuggestion("");
    }
  };

  // Gérer l'édition d'un post-it
  const startEditing = (postit: PostitType) => {
    setEditingPostitId(postit.id);
    setEditedContent(postit.content);
  };

  const saveEdit = (id: string) => {
    if (editedContent.trim()) {
      onEditPostit(id, editedContent);
    }
    setEditingPostitId(null);
    setEditedContent("");
  };

  // Gérer le menu d'amélioration IA
  const openAiMenu = (
    event: React.MouseEvent<HTMLElement>,
    postit: PostitType
  ) => {
    setAiMenuAnchorEl(event.currentTarget);
    setSelectedPostitForAI(postit);
  };

  const closeAiMenu = () => {
    setAiMenuAnchorEl(null);
    setSelectedPostitForAI(null);
    setShowAiPromptInput(false);
  };

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleAiImprovement = async (improvementType: string) => {
    let prompt = "";

    switch (improvementType) {
      case "simpler":
        prompt =
          "Simplifie cette phrase pour la rendre plus claire et directe, tout en gardant le même sens.";
        break;
      case "formal":
        prompt =
          "Reformule cette phrase dans un style plus formel et professionnel.";
        break;
      case "empathetic":
        prompt =
          "Réécris cette phrase avec plus d'empathie et de compréhension envers le client.";
        break;
      case "concise":
        prompt =
          "Rends cette phrase plus concise en conservant l'idée principale.";
        break;
      case "bullets":
        prompt =
          "Transforme ce texte en liste à puces avec une idée par point.";
        break;
      case "custom":
        setShowAiPromptInput(true);
        return;
      default:
        prompt =
          "Améliore cette phrase pour une meilleure communication client.";
    }

    if (selectedPostitForAI) {
      setIsLoading(true);
      try {
        const improvedContent = await improveTextWithAI(
          selectedPostitForAI.content,
          prompt
        );
        onEditPostit(selectedPostitForAI.id, improvedContent);
      } catch (error) {
        console.error("Erreur lors de l'amélioration du texte:", error);
        // Afficher une notification d'erreur
      } finally {
        setIsLoading(false);
        closeAiMenu();
      }
    }
  };

  const submitCustomPrompt = async () => {
    if (aiPrompt.trim() && selectedPostitForAI) {
      setIsLoading(true);
      try {
        const improvedContent = await improveTextWithAI(
          selectedPostitForAI.content,
          aiPrompt
        );
        onEditPostit(selectedPostitForAI.id, improvedContent);
        setAiPrompt("");
      } catch (error) {
        console.error("Erreur lors de l'amélioration du texte:", error);
        // Afficher une notification d'erreur
      } finally {
        setIsLoading(false);
        closeAiMenu();
      }
    }
  };

  // Rendu d'un post-it individuel
  const renderPostit = (postit: PostitType) => (
    <Card
      key={postit.id}
      sx={{
        mb: 2,
        bgcolor: zoneColors[postit.zone],
        position: "relative",
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: 3,
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardContent>
        {editingPostitId === postit.id ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              autoFocus
            />
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 1,
                mt: 1,
              }}
            >
              <Button
                size="small"
                onClick={() => setEditingPostitId(null)}
                variant="outlined"
              >
                Annuler
              </Button>
              <Button
                size="small"
                onClick={() => saveEdit(postit.id)}
                variant="contained"
              >
                Enregistrer
              </Button>
            </Box>
          </Box>
        ) : (
          <>
            <Typography fontSize={fontSize}>{postit.content}</Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 1,
                mt: 2,
              }}
            >
              <IconButton
                size="small"
                onClick={() => startEditing(postit)}
                title="Modifier manuellement"
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={(e) => openAiMenu(e, postit)}
                title="Améliorer avec l'IA"
              >
                <AutoFixHighIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => onDeletePostit(postit.id)}
                title="Supprimer"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );

  // Rendu d'une section de zone avec ses post-its
  const renderZoneSection = (zone: string, title: string) => {
    const zonePostits = getPostitsByZone(zone);

    return (
      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            bgcolor: zoneColors[zone],
            borderTopLeftRadius: "4px",
            borderTopRightRadius: "4px",
          }}
        >
          <Typography fontWeight="bold">
            {title} ({zonePostits.length})
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 2 }}>
          {zonePostits.length > 0 ? (
            zonePostits.map((postit) => renderPostit(postit))
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontStyle: "italic" }}
            >
              Aucun élément dans cette zone. Ajoutez-en un ci-dessous.
            </Typography>
          )}

          <Button
            variant="outlined"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => {
              setSelectedZone(zone);
              document
                .getElementById("new-suggestion-section")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            sx={{ mt: 2 }}
          >
            Ajouter à cette zone
          </Button>
        </AccordionDetails>
      </Accordion>
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}>
      {/* Situation client (toujours visible) */}
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

      {/* Guide pour améliorer les réponses */}
      {showGuide && (
        <Alert
          severity="info"
          onClose={() => setShowGuide(false)}
          sx={{ mb: 1 }}
          icon={<TipsAndUpdatesIcon />}
        >
          <Typography variant="subtitle2">
            Conseils pour améliorer la réponse:
          </Typography>
          <ul style={{ margin: "8px 0", paddingLeft: "24px" }}>
            <li>
              Privilégiez les zones vertes (ce que fait/a fait/fera le client)
            </li>
            <li>
              Limitez les explications sur ce que fait l'entreprise (zone rouge)
            </li>
            <li>Soyez concis et orientés solutions</li>
            <li>Personnalisez votre réponse au contexte du client</li>
          </ul>
        </Alert>
      )}

      {/* Sections de zones avec post-its */}
      <Typography variant="h6" gutterBottom>
        Éléments de réponse par zone
      </Typography>

      {renderZoneSection(ZONES.VOUS_AVEZ_FAIT, "Ce que le client a fait")}
      {renderZoneSection(ZONES.JE_FAIS, "Ce que je fais")}
      {renderZoneSection(ZONES.ENTREPRISE_FAIT, "Ce que fait l'entreprise")}
      {renderZoneSection(ZONES.VOUS_FEREZ, "Ce que fera le client")}

      {/* Zone d'ajout de suggestion */}
      <Paper elevation={3} sx={{ p: 2, mt: 2 }} id="new-suggestion-section">
        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Ajouter un nouvel élément:
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          placeholder="Proposez un nouvel élément pour améliorer la réponse..."
          value={newSuggestion}
          onChange={(e) => setNewSuggestion(e.target.value)}
          sx={{ mb: 2 }}
        />

        <FormControl component="fieldset" sx={{ mb: 2 }}>
          <FormLabel component="legend">Ajouter dans la zone:</FormLabel>
          <RadioGroup
            row
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
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

        <Button
          variant="contained"
          color="primary"
          onClick={handleAddSuggestion}
          disabled={!newSuggestion.trim()}
          startIcon={<AddCircleOutlineIcon />}
          fullWidth
        >
          Ajouter cet élément
        </Button>
      </Paper>

      {/* Menu d'amélioration IA */}
      <Menu
        anchorEl={aiMenuAnchorEl}
        open={Boolean(aiMenuAnchorEl)}
        onClose={closeAiMenu}
      >
        <MenuItem
          onClick={() => handleAiImprovement("simpler")}
          disabled={isLoading}
        >
          {isLoading ? "Amélioration en cours..." : "Simplifier le langage"}
        </MenuItem>
        <MenuItem
          onClick={() => handleAiImprovement("formal")}
          disabled={isLoading}
        >
          {isLoading ? "Amélioration en cours..." : "Style plus formel"}
        </MenuItem>
        <MenuItem
          onClick={() => handleAiImprovement("empathetic")}
          disabled={isLoading}
        >
          {isLoading ? "Amélioration en cours..." : "Ajouter de l'empathie"}
        </MenuItem>
        <MenuItem
          onClick={() => handleAiImprovement("concise")}
          disabled={isLoading}
        >
          {isLoading ? "Amélioration en cours..." : "Rendre plus concis"}
        </MenuItem>
        <MenuItem
          onClick={() => handleAiImprovement("bullets")}
          disabled={isLoading}
        >
          {isLoading ? "Amélioration en cours..." : "Transformer en points"}
        </MenuItem>
        <MenuItem
          onClick={() => handleAiImprovement("custom")}
          disabled={isLoading}
        >
          {isLoading ? "Amélioration en cours..." : "Prompt personnalisé..."}
        </MenuItem>
      </Menu>

      {/* Boîte de dialogue pour prompt personnalisé */}
      {showAiPromptInput && (
        <Paper
          sx={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            p: 3,
            width: "80%",
            maxWidth: 500,
            zIndex: 9999,
            boxShadow: 24,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Prompt personnalisé
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Entrez votre instruction pour l'IA..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button onClick={closeAiMenu} variant="outlined">
              Annuler
            </Button>
            <Button
              onClick={submitCustomPrompt}
              variant="contained"
              disabled={!aiPrompt.trim() || isLoading}
            >
              {isLoading ? "Traitement..." : "Appliquer"}
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};
