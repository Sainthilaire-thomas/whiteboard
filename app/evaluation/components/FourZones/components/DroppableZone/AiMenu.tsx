// components/DroppableZone/AiMenu.tsx
import React from "react";
import { Menu, MenuItem } from "@mui/material";
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
  const handleAiImprovement = async (improvementType: string) => {
    if (!postit) return;

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
      default:
        prompt =
          "Améliore cette phrase pour une meilleure communication client.";
    }

    setIsLoading(true);
    try {
      const improvedContent = await improveTextWithAI(postit.content, prompt);
      onSuggestImprovement(postit.id, improvedContent, postit.content);
    } catch (error) {
      console.error("Erreur lors de l'amélioration du texte:", error);
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  return (
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
    </Menu>
  );
};
