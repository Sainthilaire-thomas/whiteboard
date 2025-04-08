// components/EnhancedDropZone.tsx
import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  IconButton,
  TextField,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { PostitType } from "../types/types";

interface EnhancedDropZoneProps {
  id: string;
  title: string;
  backgroundColor: string;
  postits: PostitType[];
  fontSize: number;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onAdd: (content: string) => void;
  onAiImprove: (postit: PostitType, promptType: string) => void;
  zoneColors: Record<string, string>;
  isEntrepriseZone?: boolean;
}

export const EnhancedDropZone: React.FC<EnhancedDropZoneProps> = ({
  id,
  title,
  backgroundColor,
  postits,
  fontSize,
  onEdit,
  onDelete,
  onAdd,
  onAiImprove,
  zoneColors,
  isEntrepriseZone = false,
}) => {
  // États pour gérer l'édition et les améliorations
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [aiMenuAnchorEl, setAiMenuAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [selectedPostitForAI, setSelectedPostitForAI] =
    useState<PostitType | null>(null);

  // Fonction pour gérer le début de l'édition
  const handleStartEdit = (postit: PostitType) => {
    setEditingId(postit.id);
    setEditingContent(postit.content);
  };

  // Fonction pour sauvegarder l'édition
  const handleSaveEdit = () => {
    if (editingId && editingContent.trim()) {
      onEdit(editingId, editingContent);
      setEditingId(null);
      setEditingContent("");
    }
  };

  // Fonction pour ouvrir le menu d'amélioration IA
  const handleOpenAiMenu = (
    event: React.MouseEvent<HTMLElement>,
    postit: PostitType
  ) => {
    setAiMenuAnchorEl(event.currentTarget);
    setSelectedPostitForAI(postit);
  };

  // Fonction pour fermer le menu d'amélioration IA
  const handleCloseAiMenu = () => {
    setAiMenuAnchorEl(null);
    setSelectedPostitForAI(null);
  };

  // Fonction pour gérer l'amélioration IA
  const handleAiImprovement = (promptType: string) => {
    if (selectedPostitForAI) {
      onAiImprove(selectedPostitForAI, promptType);
      handleCloseAiMenu();
    }
  };

  // Fonction pour ajouter un nouveau post-it
  const handleAddPostit = () => {
    if (newContent.trim()) {
      onAdd(newContent);
      setNewContent("");
      setAddDialogOpen(false);
    }
  };

  // Configuration dnd-kit pour rendre la zone droppable
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id,
      data: {
        type: "container",
      },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      elevation={3}
      sx={{
        p: 2,
        bgcolor: backgroundColor,
        borderRadius: 1,
        minHeight: "200px",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        border: isEntrepriseZone ? "2px dashed rgba(255,0,0,0.5)" : undefined,
      }}
    >
      {/* Titre de la zone */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid rgba(0,0,0,0.1)",
          pb: 1,
          mb: 1,
        }}
      >
        <Typography variant="subtitle1" fontWeight="bold">
          {title}
        </Typography>
        <IconButton
          size="small"
          onClick={() => setAddDialogOpen(true)}
          title="Ajouter un élément"
          sx={{ backgroundColor: "rgba(255,255,255,0.3)" }}
        >
          <AddCircleIcon />
        </IconButton>
      </Box>

      {/* Liste des post-its */}
      <Box sx={{ overflow: "auto", flex: 1 }}>
        {postits.length === 0 ? (
          <Typography
            variant="body2"
            sx={{
              fontStyle: "italic",
              opacity: 0.7,
              p: 2,
              textAlign: "center",
            }}
          >
            Aucun élément. Cliquez sur + pour ajouter.
          </Typography>
        ) : (
          postits.map((postit) => (
            <Card
              key={postit.id}
              sx={{
                mb: 1.5,
                boxShadow: 1,
                bgcolor: "rgba(255,255,255,0.85)",
                transition: "all 0.2s ease",
                "&:hover": {
                  boxShadow: 3,
                  transform: "translateY(-2px)",
                },
              }}
            >
              <CardContent sx={{ py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}>
                {editingId === postit.id ? (
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <TextField
                      fullWidth
                      multiline
                      size="small"
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      autoFocus
                      sx={{ fontSize }}
                    />
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 1,
                      }}
                    >
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setEditingId(null)}
                      >
                        Annuler
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={handleSaveEdit}
                      >
                        Enregistrer
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <>
                    <Typography fontSize={fontSize} lineHeight={1.4}>
                      {postit.content}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        mt: 1,
                        opacity: 0.7,
                        "&:hover": { opacity: 1 },
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => handleStartEdit(postit)}
                        title="Modifier manuellement"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => handleOpenAiMenu(e, postit)}
                        title="Améliorer avec l'IA"
                      >
                        <AutoFixHighIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => onDelete(postit.id)}
                        title="Supprimer"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </Box>

      {/* Menu d'amélioration IA */}
      <Menu
        anchorEl={aiMenuAnchorEl}
        open={Boolean(aiMenuAnchorEl)}
        onClose={handleCloseAiMenu}
      >
        <MenuItem onClick={() => handleAiImprovement("simpler")}>
          Simplifier le langage
        </MenuItem>
        <MenuItem onClick={() => handleAiImprovement("formal")}>
          Style plus formel
        </MenuItem>
        <MenuItem onClick={() => handleAiImprovement("empathetic")}>
          Ajouter de l'empathie
        </MenuItem>
        <MenuItem onClick={() => handleAiImprovement("concise")}>
          Rendre plus concis
        </MenuItem>
        <MenuItem onClick={() => handleAiImprovement("bullets")}>
          Transformer en points
        </MenuItem>
      </Menu>

      {/* Dialogue pour ajouter un nouveau post-it */}
      <Dialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Ajouter un élément à "{title}"</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            multiline
            rows={4}
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder={`Écrivez ici ce que ${
              id === ZONES.JE_FAIS
                ? "vous faites"
                : id === ZONES.VOUS_AVEZ_FAIT
                ? "le client a fait"
                : id === ZONES.ENTREPRISE_FAIT
                ? "l'entreprise fait"
                : "le client fera"
            }`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Annuler</Button>
          <Button
            onClick={handleAddPostit}
            variant="contained"
            disabled={!newContent.trim()}
          >
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};
