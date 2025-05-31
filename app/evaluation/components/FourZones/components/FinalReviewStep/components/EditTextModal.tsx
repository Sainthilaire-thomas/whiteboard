// components/FinalReviewStep/components/EditTextModal.tsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography,
  Alert,
  Divider,
  useTheme,
} from "@mui/material";
import { Close, Save, Preview } from "@mui/icons-material";
import { EditableTextComposer } from "./EditableTextComposer";
import EnrichedTextDisplay from "./EnrichedTextDisplay";

import {
  EditableSubSegment,
  ZoneComposition,
  ZoneAwareTextSegment,
} from "../../../utils/generateFinalText";
import { PostitType } from "../../../types/types";

interface EditTextModalProps {
  open: boolean;
  composition: ZoneComposition | null;
  originalPostits: PostitType[];
  zoneColors: Record<string, string>; // ✅ NOUVEAU : Ajout de zoneColors
  onClose: () => void;
  onSave: (newComposition: ZoneComposition) => void;
}

export const EditTextModal: React.FC<EditTextModalProps> = ({
  open,
  composition,
  originalPostits,
  zoneColors, // ✅ NOUVEAU
  onClose,
  onSave,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const [workingComposition, setWorkingComposition] =
    useState<ZoneComposition | null>(null);
  const [previewComposition, setPreviewComposition] =
    useState<ZoneComposition | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showFinalPreview, setShowFinalPreview] = useState(false);
  const [previewText, setPreviewText] = useState("");

  useEffect(() => {
    if (open && composition) {
      const deepCopy = JSON.parse(JSON.stringify(composition));
      setWorkingComposition(deepCopy);
      setPreviewComposition(deepCopy);
      setHasChanges(false);
      setShowFinalPreview(false);
      setPreviewText(composition.fullText);
    }
  }, [open, composition]);

  // ✅ FONCTION MISE À JOUR : Utiliser la nouvelle logique d'ordre personnalisé
  const handleSegmentReorder = (reorderedSegments: EditableSubSegment[]) => {
    if (!workingComposition) return;

    try {
      console.log(
        "🔄 Réorganisation des segments:",
        reorderedSegments.map((s) => s.content.substring(0, 30))
      );

      // ✅ LOGIQUE SIMPLE : Créer directement une nouvelle composition
      const newSegments: ZoneAwareTextSegment[] = reorderedSegments.map(
        (segment, index) => ({
          id: `reordered-${segment.id}-${index}`,
          content: segment.content,
          type: "zone" as const,
          sourceZone: segment.sourceZone,
          zoneName: segment.zoneName,
          zoneOrder: index + 1, // ✅ Nouvel ordre
          zoneColor: segment.zoneColor,
          isFromRework: true,
          postitIds: [segment.originalPostitId],
        })
      );

      const newFullText =
        reorderedSegments.map((seg) => seg.content).join(". ") + ".";

      const newComposition: ZoneComposition = {
        ...workingComposition,
        segments: newSegments,
        fullText: newFullText,
        stats: {
          ...workingComposition.stats,
          finalLength: newFullText.length,
          totalSegments: newSegments.length,
        },
      };

      console.log("✅ Nouvelle composition créée:", {
        segmentsCount: newSegments.length,
        newText: newFullText.substring(0, 100) + "...",
      });

      setPreviewComposition(newComposition);
      setHasChanges(true);
    } catch (error) {
      console.error("❌ Erreur lors de la réorganisation:", error);
    }
  };

  const handlePreviewChange = (newPreviewText: string) => {
    setPreviewText(newPreviewText);
  };

  const handleSave = () => {
    if (previewComposition && hasChanges) {
      console.log("💾 Sauvegarde de la composition modifiée");
      onSave(previewComposition);
    } else if (workingComposition) {
      console.log("💾 Sauvegarde de la composition inchangée");
      onSave(workingComposition);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      const confirmClose = window.confirm(
        "Vous avez des modifications non sauvegardées. Voulez-vous vraiment fermer sans sauvegarder ?"
      );
      if (confirmClose) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleReset = () => {
    if (composition) {
      const resetConfirm = window.confirm(
        "Voulez-vous vraiment annuler toutes les modifications et revenir au texte original ?"
      );
      if (resetConfirm) {
        const deepCopy = JSON.parse(JSON.stringify(composition));
        setWorkingComposition(deepCopy);
        setPreviewComposition(deepCopy);
        setHasChanges(false);
        setPreviewText(composition.fullText);
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: "90vh",
          maxHeight: "800px",
          bgcolor: isDarkMode ? "grey.900" : "background.paper",
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h6"
            component="h2"
            sx={{ color: isDarkMode ? "grey.100" : "text.primary" }}
          >
            Réorganiser les post-its conseiller
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {hasChanges && (
              <Typography
                variant="caption"
                sx={{
                  color: "warning.main",
                  fontWeight: "medium",
                  mr: 1,
                }}
              >
                • Modifications non sauvegardées
              </Typography>
            )}

            <IconButton
              onClick={handleCancel}
              size="small"
              sx={{ color: isDarkMode ? "grey.400" : "inherit" }}
            >
              <Close />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{ overflow: "hidden", display: "flex", flexDirection: "column" }}
      >
        <Alert
          severity="info"
          sx={{
            mb: 2,
            bgcolor: isDarkMode ? "info.dark" : "info.light",
            color: isDarkMode ? "info.contrastText" : "info.contrastText",
          }}
        >
          <Typography variant="body2">
            <strong>Instructions :</strong> Glissez-déposez les{" "}
            <strong>post-its individuels</strong> pour réorganiser le texte
            final. Chaque segment correspond à un post-it retravaillé que vous
            pouvez déplacer indépendamment.
          </Typography>
        </Alert>

        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          <Button
            variant={!showFinalPreview ? "contained" : "outlined"}
            size="small"
            onClick={() => setShowFinalPreview(false)}
          >
            Édition
          </Button>
          <Button
            variant={showFinalPreview ? "contained" : "outlined"}
            size="small"
            startIcon={<Preview />}
            onClick={() => setShowFinalPreview(true)}
          >
            Aperçu final
          </Button>
        </Box>

        <Box sx={{ flex: 1, overflow: "hidden" }}>
          {!showFinalPreview ? (
            workingComposition &&
            originalPostits && (
              <Box sx={{ height: "100%", overflow: "auto" }}>
                <EditableTextComposer
                  composition={workingComposition}
                  originalPostits={originalPostits}
                  onSegmentReorder={handleSegmentReorder}
                  onPreviewChange={handlePreviewChange}
                />
              </Box>
            )
          ) : (
            <Box sx={{ height: "100%", overflow: "auto" }}>
              {previewComposition ? (
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      mb: 2,
                      fontWeight: "medium",
                      color: isDarkMode ? "grey.100" : "text.primary",
                    }}
                  >
                    Aperçu du texte final avec indicateurs de zones :
                  </Typography>

                  <Box
                    sx={{
                      p: 2,
                      bgcolor: isDarkMode ? "grey.800" : "grey.50",
                      borderRadius: 1,
                      mb: 2,
                      border: "1px solid",
                      borderColor: isDarkMode ? "grey.700" : "grey.200",
                    }}
                  >
                    <EnrichedTextDisplay
                      composition={previewComposition}
                      showZoneIndicators={true}
                      fontSize={16}
                      mode={isDarkMode ? "dark" : "light"}
                    />
                  </Box>

                  {composition && (
                    <Box sx={{ mt: 2 }}>
                      <Divider sx={{ mb: 2 }} />
                      <Typography
                        variant="subtitle2"
                        sx={{
                          mb: 1,
                          color: isDarkMode ? "grey.300" : "text.primary",
                        }}
                      >
                        Comparaison avec l'original :
                      </Typography>
                      <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                        <Typography
                          variant="body2"
                          color={isDarkMode ? "grey.400" : "text.secondary"}
                        >
                          Longueur originale: {composition.fullText.length}{" "}
                          caractères
                        </Typography>
                        <Typography
                          variant="body2"
                          color={isDarkMode ? "grey.400" : "text.secondary"}
                        >
                          Longueur modifiée: {previewText.length} caractères
                        </Typography>
                        <Typography
                          variant="body2"
                          color={
                            previewText.length > composition.fullText.length
                              ? "success.main"
                              : "warning.main"
                          }
                        >
                          Différence:{" "}
                          {previewText.length - composition.fullText.length > 0
                            ? "+"
                            : ""}
                          {previewText.length - composition.fullText.length}{" "}
                          caractères
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              ) : (
                <Alert severity="warning">
                  Aucune prévisualisation disponible
                </Alert>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          gap: 1,
          bgcolor: isDarkMode ? "grey.900" : "background.paper",
        }}
      >
        <Button onClick={handleReset} disabled={!hasChanges} color="warning">
          Réinitialiser
        </Button>

        <Box sx={{ flex: 1 }} />

        <Button onClick={handleCancel} variant="outlined">
          Annuler
        </Button>

        <Button
          onClick={handleSave}
          variant="contained"
          startIcon={<Save />}
          disabled={!workingComposition}
        >
          {hasChanges ? "Appliquer les modifications" : "Fermer"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
