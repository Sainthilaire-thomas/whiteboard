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
  convertToZoneComposition,
  convertToEditableComposition,
  generateCustomOrderComposition,
  EditableSubSegment,
} from "../types/editableText";
import { ZoneComposition } from "../../../utils/generateFinalText";
import { PostitType } from "../../../types/types"; // Ajustez le chemin

interface EditTextModalProps {
  open: boolean;
  composition: ZoneComposition | null;
  originalPostits: PostitType[]; // ✅ NOUVEAU: Post-its originaux
  onClose: () => void;
  onSave: (newComposition: ZoneComposition) => void;
}

export const EditTextModal: React.FC<EditTextModalProps> = ({
  open,
  composition,
  originalPostits, // ✅ NOUVEAU
  onClose,
  onSave,
}) => {
  // ✅ NOUVEAU: Hook pour le thème
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const [workingComposition, setWorkingComposition] =
    useState<ZoneComposition | null>(null);
  const [previewComposition, setPreviewComposition] =
    useState<ZoneComposition | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showFinalPreview, setShowFinalPreview] = useState(false);
  const [previewText, setPreviewText] = useState("");

  // Initialiser la composition de travail à l'ouverture
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

  // ✅ CORRIGÉ: Gérer la réorganisation des segments de post-its
  const handleSegmentReorder = (reorderedSegments: EditableSubSegment[]) => {
    if (!workingComposition || !originalPostits) return;

    try {
      // ✅ NOUVEAU : Créer l'ordre personnalisé pour la nouvelle fonction
      const customOrder = reorderedSegments.map((segment) => ({
        id: segment.originalPostitId,
        content: segment.content,
        zone: segment.sourceZone,
      }));

      console.log("🔄 Nouvel ordre des post-its:", customOrder);

      // ✅ NOUVEAU : Utiliser la nouvelle fonction qui respecte l'ordre personnalisé
      const newComposition = generateCustomOrderComposition(
        originalPostits,
        customOrder,
        zoneColors, // Il faut récupérer zoneColors du parent
        workingComposition.originalText
      );

      setPreviewComposition(newComposition);
      setHasChanges(true);

      console.log("💾 Nouvelle composition avec ordre personnalisé:", {
        originalSegments: workingComposition.segments.length,
        newSegments: newComposition.segments.length,
        newOrder: newComposition.segments.map((s) => s.zoneName),
      });
    } catch (error) {
      console.error("❌ Erreur lors de la réorganisation:", error);
    }
  };

  // Gérer le changement de prévisualisation
  const handlePreviewChange = (newPreviewText: string) => {
    setPreviewText(newPreviewText);
  };

  // Sauvegarder les modifications
  const handleSave = () => {
    if (previewComposition && hasChanges) {
      console.log("💾 Sauvegarde de la composition modifiée");
      onSave(previewComposition);
    } else if (workingComposition) {
      console.log("💾 Sauvegarde de la composition inchangée");
      onSave(workingComposition);
    }
  };

  // Gérer l'annulation avec confirmation si nécessaire
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

  // Réinitialiser à l'original
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
          // ✅ NOUVEAU: Style adaptatif au thème
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
        {/* Instructions avec style adaptatif */}
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

        {/* Boutons de vue avec style adaptatif */}
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

        {/* Contenu principal */}
        <Box sx={{ flex: 1, overflow: "hidden" }}>
          {!showFinalPreview ? (
            // Mode édition
            workingComposition &&
            originalPostits && (
              <Box sx={{ height: "100%", overflow: "auto" }}>
                <EditableTextComposer
                  composition={workingComposition}
                  originalPostits={originalPostits} // ✅ NOUVEAU: Passer les post-its
                  onSegmentReorder={handleSegmentReorder}
                  onPreviewChange={handlePreviewChange}
                />
              </Box>
            )
          ) : (
            // Mode aperçu final
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
                      mode={isDarkMode ? "dark" : "light"} // ✅ NOUVEAU: Passer le mode
                    />
                  </Box>

                  {/* Statistiques de comparaison avec style adaptatif */}
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
