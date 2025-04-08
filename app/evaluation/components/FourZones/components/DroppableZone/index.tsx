// components/DroppableZone/index.tsx
import React, { useState, useEffect, useRef } from "react";
import { Paper, Box, Typography, IconButton } from "@mui/material";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import AddIcon from "@mui/icons-material/Add";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { SortablePostit } from "../SortablePostit";
import { DroppableZoneProps } from "../../types/types";
import { NewPostitForm } from "./NewPostitForm";
import { ImprovedPostit } from "./ImprovedPostit";
import { AiMenu } from "./AiMenu";

export const DroppableZone: React.FC<DroppableZoneProps> = ({
  id,
  title,
  backgroundColor,
  postits,
  fontSize,
  onEdit,
  onDelete,
  onAddClick,
  isEntrepriseZone = false,
  improvementMode = false,
}) => {
  const [isCreatingPostit, setIsCreatingPostit] = useState<boolean>(false);
  const [newPostitText, setNewPostitText] = useState<string>(
    "Que dites-vous ici ?"
  );

  // États pour le menu d'amélioration IA
  const [aiMenuAnchorEl, setAiMenuAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [selectedPostitForAI, setSelectedPostitForAI] =
    useState<PostitType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Gestion de l'ajout de post-it
  const handleAddClick = () => {
    setIsCreatingPostit(true);
  };

  const handleNewPostitSubmit = (text: string) => {
    if (text.trim() && text !== "Que dites-vous ici ?") {
      onAddClick(id, text);
    }
    setIsCreatingPostit(false);
    setNewPostitText("Que dites-vous ici ?");
  };

  const handleNewPostitCancel = () => {
    setIsCreatingPostit(false);
    setNewPostitText("Que dites-vous ici ?");
  };

  // Gestion du menu d'amélioration IA
  const handleOpenAiMenu = (
    e: React.MouseEvent<HTMLElement>,
    postit: PostitType
  ) => {
    e.stopPropagation();
    setAiMenuAnchorEl(e.currentTarget);
    setSelectedPostitForAI(postit);
  };

  const handleCloseAiMenu = () => {
    setAiMenuAnchorEl(null);
    setSelectedPostitForAI(null);
  };

  // État pour la suggestion d'IA
  const [postitWithSuggestion, setPostitWithSuggestion] = useState<
    string | null
  >(null);
  const [suggestedContent, setSuggestedContent] = useState<string>("");
  const [originalContent, setOriginalContent] = useState<string>("");

  // Fonction pour recevoir les suggestions d'IA
  const handleSuggestImprovement = (
    id: string,
    content: string,
    original: string
  ) => {
    setPostitWithSuggestion(id);
    setSuggestedContent(content);
    setOriginalContent(original);
  };

  // Ajout des fonctions manquantes pour accepter/rejeter les suggestions
  const handleAcceptSuggestion = () => {
    if (postitWithSuggestion && suggestedContent) {
      onEdit(postitWithSuggestion, suggestedContent);
      // Réinitialiser
      setPostitWithSuggestion(null);
      setSuggestedContent("");
      setOriginalContent("");
    }
  };

  const handleRejectSuggestion = () => {
    // Réinitialiser
    setPostitWithSuggestion(null);
    setSuggestedContent("");
    setOriginalContent("");
  };

  // Référence à cette fonction pour les ImprovedPostits
  const improvedPostitRefs = useRef<Record<string, any>>({});

  // Mettre à jour les références quand les postits changent
  useEffect(() => {
    // Mise à jour des références
  }, [postits]);

  // Quand une suggestion est prête, la passer au composant post-it correspondant
  useEffect(() => {
    if (postitWithSuggestion && suggestedContent) {
      const postitRef = improvedPostitRefs.current[postitWithSuggestion];
      if (postitRef && postitRef.handleSuggestImprovement) {
        postitRef.handleSuggestImprovement(
          postitWithSuggestion,
          suggestedContent,
          originalContent
        );

        // Réinitialiser
        setPostitWithSuggestion(null);
        setSuggestedContent("");
        setOriginalContent("");
      }
    }
  }, [postitWithSuggestion, suggestedContent, originalContent]);

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
      {/* En-tête de zone */}
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
            {title} {improvementMode && "(Mode amélioration)"}
          </Typography>
        </Box>
        <IconButton size="small" onClick={handleAddClick}>
          <AddIcon />
        </IconButton>
      </Box>

      {/* Contenu de la zone */}
      <Box sx={{ overflowY: "auto", flex: 1 }}>
        {postits.length === 0 ? (
          <Typography
            variant="body2"
            sx={{
              fontStyle: "italic",
              opacity: 0.7,
              textAlign: "center",
              p: 2,
            }}
          >
            Aucun élément. Cliquez sur + pour ajouter.
          </Typography>
        ) : improvementMode ? (
          // Mode amélioration
          postits.map((postit) => (
            <ImprovedPostit
              key={postit.id}
              postit={postit}
              fontSize={fontSize}
              onEdit={onEdit}
              onDelete={onDelete}
              onAiMenu={handleOpenAiMenu}
              isLoading={isLoading}
              // Prop pour afficher une suggestion
              showSuggestion={postitWithSuggestion === postit.id}
              suggestedContent={suggestedContent}
              originalContent={originalContent}
              onAcceptSuggestion={handleAcceptSuggestion}
              onRejectSuggestion={handleRejectSuggestion}
            />
          ))
        ) : (
          // Mode normal
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
          </SortableContext>
        )}

        {/* Formulaire de création de post-it */}
        {isCreatingPostit && (
          <NewPostitForm
            initialText={newPostitText}
            backgroundColor={backgroundColor}
            fontSize={fontSize}
            onSubmit={handleNewPostitSubmit}
            onCancel={handleNewPostitCancel}
          />
        )}
      </Box>

      {/* Menu d'amélioration IA */}
      {improvementMode && (
        <AiMenu
          anchorEl={aiMenuAnchorEl}
          postit={selectedPostitForAI}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          onClose={handleCloseAiMenu}
          onSuggestImprovement={handleSuggestImprovement}
        />
      )}
    </Paper>
  );
};
