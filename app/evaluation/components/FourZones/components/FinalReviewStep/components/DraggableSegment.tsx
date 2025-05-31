// components/FinalReviewStep/components/DraggableSegment.tsx
import React from "react";
import { Box, Typography, Chip, IconButton, useTheme } from "@mui/material";
import { DragIndicator, Close } from "@mui/icons-material";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { EditableSubSegment } from "../types/editableText";

interface DraggableSegmentProps {
  segment: EditableSubSegment;
  onRemove?: (segmentId: string) => void;
  isDragDisabled?: boolean;
}

export const DraggableSegment: React.FC<DraggableSegmentProps> = ({
  segment,
  onRemove,
  isDragDisabled = false,
}) => {
  // ✅ NOUVEAU: Hook pour le thème (dark mode)
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id: segment.id,
    disabled: isDragDisabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        p: 1.5,
        mb: 1,
        borderRadius: 1,
        border: "1px solid",
        borderColor: isOver ? "primary.main" : "grey.300",
        // ✅ CORRIGÉ: Background adaptatif au thème
        backgroundColor: isDragging
          ? isDarkMode
            ? "grey.800"
            : "grey.100"
          : isDarkMode
          ? "grey.900"
          : "white",
        cursor: isDragDisabled ? "default" : "move",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          borderColor: isDragDisabled ? "grey.300" : "primary.light",
          backgroundColor: isDragDisabled
            ? isDarkMode
              ? "grey.900"
              : "white"
            : isDarkMode
            ? "grey.800"
            : "grey.50",
        },
        // Indicateur visuel quand on survole pendant le drag
        ...(isOver && {
          borderWidth: 2,
          backgroundColor: isDarkMode ? "primary.900" : "primary.50",
        }),
      }}
      {...attributes}
    >
      {/* Icône de glissement */}
      {!isDragDisabled && (
        <Box
          {...listeners}
          sx={{
            display: "flex",
            alignItems: "center",
            cursor: "grab",
            "&:active": { cursor: "grabbing" },
            "&:hover": { color: "primary.main" },
          }}
        >
          <DragIndicator
            sx={{
              color: isDarkMode ? "grey.500" : "grey.400",
            }}
          />
        </Box>
      )}

      {/* Indicateur de zone avec meilleur contraste */}
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          backgroundColor: segment.zoneColor,
          flexShrink: 0,
          // ✅ NOUVEAU: Border pour meilleur contraste en dark mode
          border: isDarkMode ? "1px solid rgba(255,255,255,0.3)" : "none",
        }}
      />

      {/* Contenu du segment */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body1"
          sx={{
            wordBreak: "break-word",
            lineHeight: 1.4,
            // ✅ CORRIGÉ: Couleur de texte adaptative
            color: isDarkMode ? "grey.100" : "text.primary",
          }}
        >
          {segment.content}
        </Typography>

        {/* Métadonnées avec couleurs adaptatives */}
        <Box sx={{ display: "flex", gap: 0.5, mt: 0.5, flexWrap: "wrap" }}>
          <Chip
            label={segment.zoneName}
            size="small"
            variant="outlined"
            sx={{
              fontSize: "0.7rem",
              height: 20,
              borderColor: segment.zoneColor,
              color: segment.zoneColor,
              // ✅ NOUVEAU: Background pour meilleure lisibilité en dark mode
              backgroundColor: isDarkMode
                ? `${segment.zoneColor}15`
                : "transparent",
            }}
          />
          <Chip
            label={`Post-it #${segment.originalPostitId}`}
            size="small"
            variant="outlined"
            sx={{
              fontSize: "0.7rem",
              height: 20,
              color: isDarkMode ? "grey.400" : "grey.600",
              borderColor: isDarkMode ? "grey.600" : "grey.400",
            }}
          />
          <Chip
            label={`Position: ${segment.order + 1}`}
            size="small"
            variant="outlined"
            sx={{
              fontSize: "0.7rem",
              height: 20,
              color: isDarkMode ? "grey.400" : "grey.600",
              borderColor: isDarkMode ? "grey.600" : "grey.400",
            }}
          />
        </Box>
      </Box>

      {/* Bouton de suppression avec couleurs adaptatives */}
      {onRemove && (
        <IconButton
          size="small"
          onClick={() => onRemove(segment.id)}
          sx={{
            color: isDarkMode ? "grey.500" : "grey.400",
            "&:hover": {
              color: "error.main",
              backgroundColor: isDarkMode ? "error.900" : "error.50",
            },
          }}
        >
          <Close fontSize="small" />
        </IconButton>
      )}

      {/* Indicateur de drop actif avec couleurs adaptatives */}
      {isOver && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            border: "2px dashed",
            borderColor: "primary.main",
            borderRadius: 1,
            pointerEvents: "none",
            opacity: 0.7,
            backgroundColor: isDarkMode
              ? "rgba(144, 202, 249, 0.08)"
              : "rgba(25, 118, 210, 0.08)",
          }}
        />
      )}
    </Box>
  );
};
