import React, { useState, useEffect } from "react";
import {
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import { improveTextWithAI } from "../../utils/aiUtils";
import { PostitType } from "../../types/types";

interface AiMenuProps {
  anchorEl: HTMLElement | null;
  postit: PostitType | null;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onClose: () => void;
  onSuggestImprovement: (
    id: string,
    content: string,
    originalContent: string
  ) => void;
}

export const AiMenu: React.FC<AiMenuProps> = ({
  anchorEl,
  postit,
  isLoading,
  setIsLoading,
  onClose,
  onSuggestImprovement,
}) => {
  const [showCustomPromptDialog, setShowCustomPromptDialog] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [processingCustomPrompt, setProcessingCustomPrompt] = useState(false);
  // Stocker le postit sélectionné localement pour ne pas le perdre quand le menu se ferme
  const [selectedPostit, setSelectedPostit] = useState<PostitType | null>(null);

  // Mettre à jour le postit local quand il change dans les props
  useEffect(() => {
    if (postit) {
      setSelectedPostit(postit);
    }
  }, [postit]);

  const handleAiImprovement = async (improvementType: string) => {
    if (!postit) {
      console.error("Aucun post-it sélectionné");
      return;
    }

    // Sauvegarder le postit sélectionné pour l'utiliser plus tard
    setSelectedPostit(postit);

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
        // Pour le prompt personnalisé, on ouvre la boîte de dialogue
        setShowCustomPromptDialog(true);
        onClose(); // On ferme le menu, mais on garde le postit sélectionné
        return;
      default:
        prompt =
          "Améliore cette phrase pour une meilleure communication client.";
    }

    setIsLoading(true);
    try {
      console.log(`Amélioration avec prompt: "${prompt}"`);
      console.log(`Contenu original: "${postit.content}"`);
      const improvedContent = await improveTextWithAI(postit.content, prompt);
      console.log(`Contenu amélioré: "${improvedContent}"`);

      onSuggestImprovement(postit.id, improvedContent, postit.content);
    } catch (error) {
      console.error("Erreur lors de l'amélioration du texte:", error);
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  const handleCustomPromptSubmit = async () => {
    if (!selectedPostit) {
      console.error("Aucun post-it sélectionné pour le prompt personnalisé");
      alert("Aucun post-it sélectionné. Veuillez réessayer.");
      setShowCustomPromptDialog(false);
      return;
    }

    if (!customPrompt.trim()) {
      console.error("Le prompt personnalisé est vide");
      return;
    }

    console.log("Démarrage de l'amélioration avec prompt personnalisé");
    console.log("Post-it sélectionné:", selectedPostit);
    setProcessingCustomPrompt(true);
    setIsLoading(true);

    try {
      console.log(`Prompt personnalisé: "${customPrompt}"`);
      console.log(`Contenu original: "${selectedPostit.content}"`);

      const improvedContent = await improveTextWithAI(
        selectedPostit.content,
        customPrompt
      );
      console.log(
        `Contenu amélioré avec prompt personnalisé: "${improvedContent}"`
      );

      // Fermer la boîte de dialogue
      setShowCustomPromptDialog(false);

      // Appeler la fonction de callback avec le postit sauvegardé localement
      onSuggestImprovement(
        selectedPostit.id,
        improvedContent,
        selectedPostit.content
      );
    } catch (error) {
      console.error(
        "Erreur lors de l'amélioration du texte avec prompt personnalisé:",
        error
      );
      alert(
        "Une erreur s'est produite lors de l'amélioration du texte. Veuillez réessayer."
      );
    } finally {
      setProcessingCustomPrompt(false);
      setIsLoading(false);
      setCustomPrompt("");
    }
  };

  // Réinitialiser l'état quand la boîte de dialogue est fermée sans soumettre
  const handleCloseCustomPromptDialog = () => {
    if (!processingCustomPrompt) {
      setShowCustomPromptDialog(false);
      setCustomPrompt("");
    }
  };

  return (
    <>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={onClose}>
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

      {/* Boîte de dialogue pour le prompt personnalisé */}
      <Dialog
        open={showCustomPromptDialog}
        onClose={handleCloseCustomPromptDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Prompt personnalisé pour l'IA</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="custom-prompt"
            label="Donnez vos instructions à l'IA"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Exemple: Réécris ce texte dans un style plus motivant et dynamique."
            variant="outlined"
            disabled={processingCustomPrompt}
          />
          {selectedPostit && (
            <div
              style={{ marginTop: "10px", fontSize: "0.9rem", color: "#666" }}
            >
              <strong>Texte à améliorer :</strong>{" "}
              {selectedPostit.content.length > 100
                ? `${selectedPostit.content.substring(0, 100)}...`
                : selectedPostit.content}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseCustomPromptDialog}
            color="error"
            disabled={processingCustomPrompt}
          >
            Annuler
          </Button>
          <Button
            onClick={handleCustomPromptSubmit}
            color="primary"
            disabled={
              !customPrompt.trim() || processingCustomPrompt || !selectedPostit
            }
            startIcon={
              processingCustomPrompt ? <CircularProgress size={20} /> : null
            }
          >
            {processingCustomPrompt ? "Traitement..." : "Appliquer"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
