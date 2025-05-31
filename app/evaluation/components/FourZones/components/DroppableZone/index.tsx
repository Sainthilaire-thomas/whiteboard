import React, { useState } from "react";
import {
  Paper,
  Box,
  Typography,
  IconButton,
  Divider,
  Chip,
  Collapse,
  Tooltip,
} from "@mui/material";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import AddIcon from "@mui/icons-material/Add";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HistoryIcon from "@mui/icons-material/History";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { SortablePostit } from "../SortablePostit";
import { DroppableZoneProps, PostitType } from "../../types/types";
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
  updatePostitContent,
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

  // États pour les suggestions d'IA
  const [postitWithSuggestion, setPostitWithSuggestion] = useState<
    string | null
  >(null);
  const [suggestedContent, setSuggestedContent] = useState<string>("");
  const [originalContent, setOriginalContent] = useState<string>("");

  // NOUVEAU : État pour l'affichage des sections
  const [showOriginalSection, setShowOriginalSection] = useState<boolean>(true);
  const [showImprovedSection, setShowImprovedSection] = useState<boolean>(true);

  // Séparer les post-its originaux et retravaillés
  const originalPostits = postits.filter((postit) => postit.isOriginal);
  const improvedPostits = postits.filter((postit) => !postit.isOriginal);

  // Compter les éléments
  const originalCount = originalPostits.length;
  const improvedCount = improvedPostits.length;
  const totalCount = originalCount + improvedCount;

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

  // Fonctions pour les suggestions d'IA
  const handleSuggestImprovement = (
    id: string,
    content: string,
    original: string
  ) => {
    setPostitWithSuggestion(id);
    setSuggestedContent(content);
    setOriginalContent(original);
  };

  const getEditFunction = () => {
    return updatePostitContent || onEdit;
  };

  const handleAcceptSuggestion = () => {
    if (postitWithSuggestion && suggestedContent) {
      const editFunction = updatePostitContent || onEdit;
      editFunction(postitWithSuggestion, suggestedContent);
      setPostitWithSuggestion(null);
      setSuggestedContent("");
      setOriginalContent("");
    }
  };

  const handleRejectSuggestion = () => {
    setPostitWithSuggestion(null);
    setSuggestedContent("");
    setOriginalContent("");
  };

  const handleDirectEdit = (id: string, content: string) => {
    if (updatePostitContent) {
      updatePostitContent(id, content);
    } else {
      onEdit(id, content);
    }
  };

  // Rendu d'une section de post-its
  const renderPostitsSection = (
    sectionPostits: PostitType[],
    isOriginalSection: boolean,
    sectionTitle: string,
    sectionIcon: React.ReactNode,
    isExpanded: boolean,
    onToggleExpand: () => void
  ) => {
    if (sectionPostits.length === 0) return null;

    return (
      <Box sx={{ mb: 2 }}>
        {/* En-tête de section */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 0.5,
            backgroundColor: isOriginalSection
              ? "rgba(0, 0, 0, 0.04)"
              : "rgba(25, 118, 210, 0.08)",
            borderRadius: 1,
            cursor: "pointer",
            "&:hover": {
              backgroundColor: isOriginalSection
                ? "rgba(0, 0, 0, 0.08)"
                : "rgba(25, 118, 210, 0.12)",
            },
          }}
          onClick={onToggleExpand}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {sectionIcon}
            <Typography
              variant="caption"
              sx={{
                fontWeight: "bold",
                color: isOriginalSection ? "text.secondary" : "primary.main",
                ml: 0.5,
              }}
            >
              {sectionTitle}
            </Typography>
            <Chip
              label={sectionPostits.length}
              size="small"
              sx={{
                ml: 1,
                height: 16,
                fontSize: "0.7rem",
                backgroundColor: isOriginalSection
                  ? "rgba(0, 0, 0, 0.12)"
                  : "rgba(25, 118, 210, 0.2)",
                color: isOriginalSection ? "text.secondary" : "primary.main",
              }}
            />
          </Box>
          {isExpanded ? (
            <ExpandLessIcon fontSize="small" />
          ) : (
            <ExpandMoreIcon fontSize="small" />
          )}
        </Box>

        {/* Contenu de la section */}
        <Collapse in={isExpanded}>
          <Box sx={{ mt: 1 }}>
            {improvementMode ? (
              // Mode amélioration
              sectionPostits.map((postit) => (
                <ImprovedPostit
                  key={postit.id}
                  postit={postit}
                  fontSize={fontSize}
                  onEdit={getEditFunction()}
                  onDelete={onDelete}
                  onAiMenu={handleOpenAiMenu}
                  isLoading={isLoading}
                  showSuggestion={postitWithSuggestion === postit.id}
                  suggestedContent={
                    postitWithSuggestion === postit.id ? suggestedContent : ""
                  }
                  originalContent={
                    postitWithSuggestion === postit.id ? originalContent : ""
                  }
                  onAcceptSuggestion={handleAcceptSuggestion}
                  onRejectSuggestion={handleRejectSuggestion}
                />
              ))
            ) : (
              // Mode normal avec drag & drop
              <SortableContext
                items={sectionPostits.map((p) => p.id)}
                strategy={verticalListSortingStrategy}
              >
                {sectionPostits.map((postit) => (
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
          </Box>
        </Collapse>
      </Box>
    );
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
      {/* En-tête de zone */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 0.5,
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
          {totalCount > 0 && (
            <Chip
              label={`${totalCount} élément${totalCount > 1 ? "s" : ""}`}
              size="small"
              sx={{ ml: 1, height: 18, fontSize: "0.7rem" }}
            />
          )}
        </Box>
        <Tooltip title="Ajouter un post-it">
          <IconButton size="small" onClick={handleAddClick}>
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Contenu de la zone */}
      <Box sx={{ overflowY: "auto", flex: 1 }}>
        {totalCount === 0 ? (
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
        ) : (
          <>
            {/* Section des textes originaux */}
            {renderPostitsSection(
              originalPostits,
              true,
              "Textes originaux",
              <HistoryIcon sx={{ fontSize: 14, color: "text.secondary" }} />,
              showOriginalSection,
              () => setShowOriginalSection(!showOriginalSection)
            )}

            {/* Séparateur si les deux sections existent */}
            {originalCount > 0 &&
              improvedCount > 0 &&
              showOriginalSection &&
              showImprovedSection && <Divider sx={{ my: 1, opacity: 0.5 }} />}

            {/* Section des textes retravaillés */}
            {renderPostitsSection(
              improvedPostits,
              false,
              "Textes retravaillés",
              <EditIcon sx={{ fontSize: 14, color: "primary.main" }} />,
              showImprovedSection,
              () => setShowImprovedSection(!showImprovedSection)
            )}
          </>
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
