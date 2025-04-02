// components/SortablePostit.tsx
import React from "react";
import { Card, CardContent, Box, Typography, IconButton } from "@mui/material";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { SortablePostitProps } from "../types/types";

export const SortablePostit: React.FC<SortablePostitProps> = ({
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
