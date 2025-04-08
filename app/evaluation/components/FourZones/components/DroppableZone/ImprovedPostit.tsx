// components/DroppableZone/ImprovedPostit.tsx
import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  TextField,
  Button,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import { PostitType } from "../../types/types";

interface ImprovedPostitProps {
  postit: PostitType;
  fontSize: number;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onAiMenu: (e: React.MouseEvent<HTMLElement>, postit: PostitType) => void;
  isLoading: boolean;
}

export const ImprovedPostit: React.FC<ImprovedPostitProps> = ({
  postit,
  fontSize,
  onEdit,
  onDelete,
  onAiMenu,
  isLoading,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(postit.content);

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditContent(postit.content);
  };

  const handleSaveEdit = () => {
    if (editContent.trim()) {
      onEdit(postit.id, editContent);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  return (
    <Card
      sx={{
        mb: 1.5,
        boxShadow: 1,
        backgroundColor: "rgba(88, 86, 86, 0.9)",
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: 3,
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
        {isEditing ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <TextField
              fullWidth
              multiline
              size="small"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              autoFocus
              InputProps={{
                style: { fontSize: `${fontSize}px` },
              }}
            />
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={handleCancelEdit}
              >
                Annuler
              </Button>
              <Button size="small" variant="contained" onClick={handleSaveEdit}>
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
          </>
        )}
      </CardContent>
    </Card>
  );
};
