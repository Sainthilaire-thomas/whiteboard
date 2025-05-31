// components/FinalReviewStep/components/EditableTextComposer.tsx
// ✅ CORRIGER tous les imports au début du fichier

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Alert,
  Divider,
  useTheme,
} from "@mui/material";
import { Preview, Visibility, RestoreOutlined } from "@mui/icons-material";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from "@dnd-kit/modifiers";

import { DraggableSegment } from "./DraggableSegment";

// ✅ NOUVEAUX IMPORTS - Tout depuis generateFinalText
import {
  EditableComposition,
  EditableSubSegment,
  convertFromZoneComposition, // ✅ Nouvelle fonction
  ZoneComposition,
} from "../../../utils/generateFinalText";

import { PostitType } from "../../../types/types";

interface EditableTextComposerProps {
  composition: ZoneComposition;
  originalPostits: PostitType[];
  onSegmentReorder: (reorderedSegments: EditableSubSegment[]) => void;
  onPreviewChange?: (previewText: string) => void;
}

export const EditableTextComposer: React.FC<EditableTextComposerProps> = ({
  composition,
  originalPostits,
  onSegmentReorder,
  onPreviewChange,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const [editableComp, setEditableComp] = useState<EditableComposition | null>(
    null
  );
  const [previewMode, setPreviewMode] = useState(false);
  const [previewText, setPreviewText] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // ✅ CORRIGÉ: useEffect avec la nouvelle fonction
  useEffect(() => {
    if (composition) {
      console.log("🔍 Conversion de la composition:", composition);
      const editable = convertFromZoneComposition(composition);
      setEditableComp(editable);
      updatePreview(editable.flatSegments);

      console.log(
        "🔍 Segments créés depuis ZoneComposition:",
        editable.flatSegments.map((s) => ({
          id: s.id,
          content: s.content.substring(0, 50) + "...",
          zone: s.zoneName,
          originalId: s.originalPostitId,
        }))
      );
    }
  }, [composition]); // ✅ Plus besoin de originalPostits

  const updatePreview = useCallback(
    (segments: EditableSubSegment[]) => {
      const text = segments.map((seg) => seg.content).join(". ") + ".";

      setPreviewText(text);
      onPreviewChange?.(text);
    },
    [onPreviewChange]
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!editableComp || !over || active.id === over.id) {
      return;
    }

    const oldIndex = editableComp.flatSegments.findIndex(
      (segment) => segment.id === active.id
    );
    const newIndex = editableComp.flatSegments.findIndex(
      (segment) => segment.id === over.id
    );

    if (oldIndex !== -1 && newIndex !== -1) {
      const newSegments = arrayMove(
        editableComp.flatSegments,
        oldIndex,
        newIndex
      );

      const reorderedSegments = newSegments.map((seg, index) => ({
        ...seg,
        order: index,
      }));

      const newEditableComp = {
        ...editableComp,
        flatSegments: reorderedSegments,
        hasChanges: true,
      };

      setEditableComp(newEditableComp);
      updatePreview(reorderedSegments);
      onSegmentReorder(reorderedSegments);

      console.log(
        "📦 Nouveau ordre:",
        reorderedSegments.map((s) => ({
          postitId: s.originalPostitId,
          content: s.content.substring(0, 30) + "...",
          order: s.order,
        }))
      );
    }
  };

  const removeSegment = useCallback(
    (segmentId: string) => {
      if (!editableComp) return;

      const newSegments = editableComp.flatSegments
        .filter((seg) => seg.id !== segmentId)
        .map((seg, index) => ({ ...seg, order: index }));

      const newEditableComp = {
        ...editableComp,
        flatSegments: newSegments,
        hasChanges: true,
      };

      setEditableComp(newEditableComp);
      updatePreview(newSegments);
      onSegmentReorder(newSegments);
    },
    [editableComp, onSegmentReorder, updatePreview]
  );

  // ✅ CORRIGÉ: resetOrder sans originalPostits
  const resetOrder = useCallback(() => {
    if (composition) {
      const originalEditable = convertFromZoneComposition(composition);
      setEditableComp({ ...originalEditable, hasChanges: false });
      updatePreview(originalEditable.flatSegments);
      onSegmentReorder(originalEditable.flatSegments);
    }
  }, [composition, onSegmentReorder, updatePreview]);

  if (!editableComp) {
    return <Alert severity="info">Chargement de l'éditeur...</Alert>;
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography
            variant="h6"
            component="h3"
            sx={{ color: isDarkMode ? "grey.100" : "text.primary" }}
          >
            Édition des post-its ({editableComp.flatSegments.length} segments)
          </Typography>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Preview />}
              onClick={() => setPreviewMode(!previewMode)}
            >
              {previewMode ? "Édition" : "Aperçu"}
            </Button>

            {editableComp.hasChanges && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<RestoreOutlined />}
                onClick={resetOrder}
                color="warning"
              >
                Restaurer
              </Button>
            )}
          </Box>
        </Box>

        {editableComp.hasChanges && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Vous avez modifié l'ordre des post-its. Cliquez sur "Appliquer" pour
            sauvegarder.
          </Alert>
        )}

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ color: isDarkMode ? "grey.400" : "text.secondary" }}
        >
          Glissez-déposez les <strong>post-its individuels</strong> pour
          réorganiser le texte final. Chaque segment correspond à un post-it
          retravaillé.
        </Typography>
      </Box>

      {!previewMode ? (
        <Box>
          <Typography
            variant="subtitle2"
            sx={{
              mb: 2,
              color: isDarkMode ? "grey.300" : "text.secondary",
            }}
          >
            🎯 Post-its éditables (glisser-déposer pour réorganiser) :
          </Typography>

          <Box sx={{ maxHeight: 400, overflowY: "auto", pr: 1 }}>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            >
              <SortableContext
                items={editableComp.flatSegments.map((seg) => seg.id)}
                strategy={verticalListSortingStrategy}
              >
                {editableComp.flatSegments.map((segment) => (
                  <DraggableSegment
                    key={segment.id}
                    segment={segment}
                    onRemove={removeSegment}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </Box>

          {editableComp.flatSegments.length === 0 && (
            <Alert severity="warning">
              Aucun post-it retravaillé disponible pour l'édition.
            </Alert>
          )}
        </Box>
      ) : (
        <Box>
          <Typography
            variant="subtitle2"
            sx={{
              mb: 2,
              color: isDarkMode ? "grey.300" : "text.secondary",
            }}
          >
            📖 Aperçu du texte final :
          </Typography>

          <Box
            sx={{
              p: 2,
              bgcolor: isDarkMode ? "grey.800" : "grey.50",
              borderRadius: 1,
              border: "1px solid",
              borderColor: isDarkMode ? "grey.700" : "grey.200",
            }}
          >
            <Typography
              variant="body1"
              sx={{
                lineHeight: 1.6,
                fontSize: "1.1rem",
                fontStyle: previewText ? "normal" : "italic",
                color: previewText
                  ? isDarkMode
                    ? "grey.100"
                    : "text.primary"
                  : isDarkMode
                  ? "grey.500"
                  : "text.secondary",
              }}
            >
              {previewText || "Aucun contenu à afficher"}
            </Typography>
          </Box>

          <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Typography
              variant="caption"
              color={isDarkMode ? "grey.400" : "text.secondary"}
            >
              📊 Longueur: {previewText.length} caractères
            </Typography>
            <Typography
              variant="caption"
              color={isDarkMode ? "grey.400" : "text.secondary"}
            >
              📝 Post-its: {editableComp.flatSegments.length}
            </Typography>
            <Typography
              variant="caption"
              color={isDarkMode ? "grey.400" : "text.secondary"}
            >
              🎨 Zones:{" "}
              {new Set(editableComp.flatSegments.map((s) => s.sourceZone)).size}
            </Typography>
          </Box>
        </Box>
      )}

      <Divider sx={{ my: 3 }} />

      <Box>
        <Typography
          variant="subtitle2"
          sx={{
            mb: 1,
            color: isDarkMode ? "grey.300" : "text.primary",
          }}
        >
          Légende des zones :
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {Array.from(
            new Set(editableComp.flatSegments.map((s) => s.sourceZone))
          ).map((sourceZone, index) => {
            const segment = editableComp.flatSegments.find(
              (s) => s.sourceZone === sourceZone
            );
            if (!segment) return null;

            return (
              <Box
                key={`legend-${sourceZone}-${index}`}
                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
              >
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: segment.zoneColor,
                    border: isDarkMode
                      ? "1px solid rgba(255,255,255,0.3)"
                      : "none",
                  }}
                />
                <Typography
                  variant="caption"
                  color={isDarkMode ? "grey.400" : "text.secondary"}
                >
                  {segment.zoneName}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};
