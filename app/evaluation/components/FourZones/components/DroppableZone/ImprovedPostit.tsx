import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  TextField,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { PostitType } from "../../types/types";

interface ImprovedPostitProps {
  postit: PostitType;
  fontSize: number;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onAiMenu: (e: React.MouseEvent<HTMLElement>, postit: PostitType) => void;
  isLoading: boolean;
  // Nouvelles props
  showSuggestion?: boolean;
  suggestedContent?: string;
  originalContent?: string;
  onAcceptSuggestion?: () => void;
  onRejectSuggestion?: () => void;
  // Nouvelle prop pour l'édition directe
  directEdit?: boolean;
}

export const ImprovedPostit: React.FC<ImprovedPostitProps> = ({
  postit,
  fontSize,
  onEdit,
  onDelete,
  onAiMenu,
  isLoading,
  // Nouvelles props avec valeurs par défaut
  showSuggestion = false,
  suggestedContent = "",
  originalContent = "",
  onAcceptSuggestion = () => {},
  onRejectSuggestion = () => {},
  // Par défaut, on utilise le mode d'édition standard (avec dialog)
  directEdit = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(postit.content);
  const [editedSuggestion, setEditedSuggestion] = useState(suggestedContent);

  // Update editedSuggestion when suggestedContent changes from props
  React.useEffect(() => {
    setEditedSuggestion(suggestedContent);
  }, [suggestedContent]);

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditContent(postit.content);
  };

  const handleSaveEdit = () => {
    // Appliquer les modifications directement, puis fermer l'éditeur
    onEdit(postit.id, editContent);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleAcceptSuggestion = () => {
    // Appliquer la suggestion directement
    onEdit(postit.id, editedSuggestion);
    onAcceptSuggestion();
  };

  // Rendre le post-it selon l'état
  if (showSuggestion) {
    return (
      <Card
        sx={{
          mb: 1.5,
          boxShadow: 2,
          borderLeft: "3px solid #4caf50",
          transition: "all 0.2s ease",
        }}
      >
        <CardContent sx={{ p: 1.5 }}>
          <Typography variant="caption" color="primary" gutterBottom>
            Suggestion d'amélioration IA
          </Typography>

          <TextField
            fullWidth
            multiline
            value={editedSuggestion}
            onChange={(e) => setEditedSuggestion(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ mb: 1, bgcolor: "rgba(76, 175, 80, 0.05)" }}
            InputProps={{
              style: { fontSize: `${fontSize}px` },
            }}
          />

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Contenu original: {originalContent.substring(0, 40)}
              {originalContent.length > 40 ? "..." : ""}
            </Typography>

            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton
                size="small"
                color="error"
                onClick={onRejectSuggestion}
                title="Annuler"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                color="success"
                onClick={handleAcceptSuggestion}
                title="Appliquer"
              >
                <CheckIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (isEditing) {
    return (
      <Card
        sx={{
          mb: 1.5,
          boxShadow: 2,
          backgroundColor: "rgba(28, 28, 28, 0.9)",
        }}
      >
        <CardContent sx={{ p: 1.5 }}>
          <TextField
            fullWidth
            multiline
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            variant="outlined"
            size="small"
            autoFocus
            InputProps={{
              style: { fontSize: `${fontSize}px` },
            }}
          />

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 1,
              mt: 1,
              opacity: 0.7,
              "&:hover": { opacity: 1 },
            }}
          >
            <IconButton
              size="small"
              color="error"
              onClick={handleCancelEdit}
              title="Annuler"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="success"
              onClick={handleSaveEdit}
              title="Enregistrer"
            >
              <CheckIcon fontSize="small" />
            </IconButton>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        mb: 1.5,
        boxShadow: 1,
        backgroundColor: "rgba(28, 28, 28, 0.9)",
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: 3,
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Typography fontSize={fontSize}>{postit.content}</Typography>
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
            onClick={handleStartEdit}
            title="Modifier manuellement"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => onAiMenu(e, postit)}
            title="Améliorer avec l'IA"
            disabled={isLoading}
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
      </CardContent>
    </Card>
  );
};

// Add display name
ImprovedPostit.displayName = "ImprovedPostit";
