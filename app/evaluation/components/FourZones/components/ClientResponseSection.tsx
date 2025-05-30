import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
  Card,
  CardContent,
  Fade,
  Alert,
  TextField,
  InputAdornment,
  useTheme,
} from "@mui/material";
import {
  Person,
  HeadsetMic,
  CheckCircle,
  Edit,
  ContentCopy,
  PlayArrow,
  ArrowForward,
  Clear,
  Save,
  Refresh,
} from "@mui/icons-material";
import { ClientResponseSectionProps } from "../types/types";
import { useCallData } from "@/context/CallDataContext";

export const ClientResponseSection: React.FC<ClientResponseSectionProps> = ({
  selectionMode,
  onSelectionModeChange,
  selectedClientText,
  selectedConseillerText,
  fontSize,
  zoneColors,
  hasOriginalPostits,
  onCategorizeClick,
  setSelectedClientText,
  setSelectedConseillerText,
}) => {
  const theme = useTheme();
  const { clientSelection, conseillerSelection } = useCallData();

  // États pour l'édition
  const [isClientEditing, setIsClientEditing] = useState(false);
  const [isConseillerEditing, setIsConseillerEditing] = useState(false);
  const [clientTextInput, setClientTextInput] = useState(selectedClientText);
  const [conseillerTextInput, setConseillerTextInput] = useState(
    selectedConseillerText
  );

  // États pour le workflow
  const isClientComplete =
    !!selectedClientText && selectedClientText.trim().length > 0;
  const isConseillerComplete =
    !!selectedConseillerText && selectedConseillerText.trim().length > 0;
  const progress = isClientComplete ? (isConseillerComplete ? 100 : 50) : 0;

  // Synchroniser les inputs avec les props
  useEffect(() => {
    setClientTextInput(selectedClientText);
  }, [selectedClientText]);

  useEffect(() => {
    setConseillerTextInput(selectedConseillerText);
  }, [selectedConseillerText]);

  // Fonctions d'édition
  const handleClientEdit = () => {
    setIsClientEditing(true);
    onSelectionModeChange("client");
  };

  const handleConseillerEdit = () => {
    setIsConseillerEditing(true);
    onSelectionModeChange("conseiller");
  };

  const saveClientEdit = () => {
    setSelectedClientText(clientTextInput);
    setIsClientEditing(false);
  };

  const saveConseillerEdit = () => {
    setSelectedConseillerText(conseillerTextInput);
    setIsConseillerEditing(false);
  };

  const cancelClientEdit = () => {
    setClientTextInput(selectedClientText);
    setIsClientEditing(false);
  };

  const cancelConseillerEdit = () => {
    setConseillerTextInput(selectedConseillerText);
    setIsConseillerEditing(false);
  };

  // Fonctions de sélection
  const handleClientSelection = () => {
    onSelectionModeChange("client");
  };

  const handleConseillerSelection = () => {
    onSelectionModeChange("conseiller");
  };

  const applyClientSelection = () => {
    if (clientSelection) {
      setSelectedClientText(clientSelection.text);
    }
  };

  const applyConseillerSelection = () => {
    if (conseillerSelection) {
      setSelectedConseillerText(conseillerSelection.text);
    }
  };

  const clearClientSelection = () => {
    setSelectedClientText("");
    setClientTextInput("");
  };

  const clearConseillerSelection = () => {
    setSelectedConseillerText("");
    setConseillerTextInput("");
  };

  // Copier dans le presse-papier
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Couleurs adaptées au thème
  const getBackgroundColor = (isActive: boolean, isComplete: boolean) => {
    if (isComplete) return theme.palette.success.main + "15";
    if (isActive) return theme.palette.primary.main + "15";
    return theme.palette.background.paper;
  };

  const getTextBackgroundColor = () => {
    return theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, 0.05)"
      : "rgba(0, 0, 0, 0.02)";
  };

  return (
    <Box sx={{ mb: 3 }}>
      {/* Header avec progression */}
      <Card sx={{ mb: 2, bgcolor: "primary.50" }}>
        <CardContent sx={{ pb: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: "primary.main", fontWeight: 600 }}
            >
              🎯 Sélection du dialogue à améliorer
            </Typography>
            <Chip
              label={`${progress}% terminé`}
              color={progress === 100 ? "success" : "primary"}
              size="small"
            />
          </Box>

          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.1)"
                  : "primary.100",
              "& .MuiLinearProgress-bar": {
                borderRadius: 3,
              },
            }}
          />

          <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
            Sélectionnez le dialogue client/conseiller à travailler
          </Typography>
        </CardContent>
      </Card>

      {/* Layout côte à côte */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
        {/* Colonne Client */}
        <Paper
          elevation={selectionMode === "client" ? 4 : 1}
          sx={{
            p: 2,
            border: selectionMode === "client" ? "2px solid" : "1px solid",
            borderColor:
              selectionMode === "client" ? "primary.main" : "divider",
            bgcolor: getBackgroundColor(
              selectionMode === "client",
              isClientComplete
            ),
            cursor: "pointer",
            transition: "all 0.3s ease",
            "&:hover": { elevation: 3 },
          }}
          onClick={handleClientSelection}
        >
          {/* Header Client */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  bgcolor: isClientComplete
                    ? "success.main"
                    : selectionMode === "client"
                    ? "primary.main"
                    : "grey.400",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                }}
              >
                {isClientComplete ? <CheckCircle /> : <Person />}
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Client
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {isClientComplete
                    ? "✓ Sélectionné"
                    : "Cliquez pour sélectionner"}
                </Typography>
              </Box>
            </Box>

            {/* Actions Client */}
            <Box sx={{ display: "flex", gap: 0.5 }}>
              {selectedClientText && !isClientEditing && (
                <>
                  <Tooltip title="Copier">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(selectedClientText);
                      }}
                    >
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Modifier">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClientEdit();
                      }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Effacer">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearClientSelection();
                      }}
                    >
                      <Clear fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Box>
          </Box>

          {/* Contenu Client */}
          {isClientEditing ? (
            <Box onClick={(e) => e.stopPropagation()}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                value={clientTextInput}
                onChange={(e) => setClientTextInput(e.target.value)}
                placeholder="Saisissez ou collez le texte du client..."
                sx={{ mb: 1 }}
                InputProps={{
                  sx: { fontSize },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={saveClientEdit}>
                        <Save fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={cancelClientEdit}>
                        <Clear fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          ) : (
            <Box
              sx={{
                p: 2,
                minHeight: "100px",
                bgcolor: getTextBackgroundColor(),
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              {selectedClientText ? (
                <Typography
                  sx={{
                    fontSize: `${fontSize}px`,
                    fontStyle: "italic",
                    color: "text.primary",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  "{selectedClientText}"
                </Typography>
              ) : (
                <Typography
                  sx={{
                    color: "text.secondary",
                    fontStyle: "italic",
                    textAlign: "center",
                    mt: 2,
                  }}
                >
                  {selectionMode === "client"
                    ? "👆 Sélectionnez du texte dans la transcription"
                    : "Cliquez ici puis sélectionnez dans la transcription"}
                </Typography>
              )}
            </Box>
          )}

          {/* Sélection disponible Client */}
          {!isClientEditing &&
            clientSelection &&
            clientSelection.text !== selectedClientText && (
              <Alert
                severity="info"
                sx={{ mt: 2 }}
                action={
                  <Button
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      applyClientSelection();
                    }}
                  >
                    Utiliser
                  </Button>
                }
              >
                <Typography variant="body2">
                  <strong>Nouvelle sélection:</strong> "
                  {clientSelection.text.substring(0, 60)}..."
                </Typography>
              </Alert>
            )}
        </Paper>

        {/* Colonne Conseiller */}
        <Paper
          elevation={selectionMode === "conseiller" ? 4 : 1}
          sx={{
            p: 2,
            border: selectionMode === "conseiller" ? "2px solid" : "1px solid",
            borderColor:
              selectionMode === "conseiller" ? "secondary.main" : "divider",
            bgcolor: getBackgroundColor(
              selectionMode === "conseiller",
              isConseillerComplete
            ),
            cursor: "pointer",
            transition: "all 0.3s ease",
            "&:hover": { elevation: 3 },
          }}
          onClick={handleConseillerSelection}
        >
          {/* Header Conseiller */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  bgcolor: isConseillerComplete
                    ? "success.main"
                    : selectionMode === "conseiller"
                    ? "secondary.main"
                    : "grey.400",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                }}
              >
                {isConseillerComplete ? <CheckCircle /> : <HeadsetMic />}
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Conseiller
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {isConseillerComplete
                    ? "✓ Sélectionné"
                    : "Cliquez pour sélectionner"}
                </Typography>
              </Box>
            </Box>

            {/* Actions Conseiller */}
            <Box sx={{ display: "flex", gap: 0.5 }}>
              {selectedConseillerText &&
                !isConseillerEditing &&
                !hasOriginalPostits && (
                  <Button
                    variant="contained"
                    size="small"
                    color="secondary"
                    startIcon={<PlayArrow />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onCategorizeClick(selectedConseillerText);
                    }}
                    sx={{ mr: 1 }}
                  >
                    Catégoriser
                  </Button>
                )}

              {selectedConseillerText && !isConseillerEditing && (
                <>
                  <Tooltip title="Copier">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(selectedConseillerText);
                      }}
                    >
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Modifier">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConseillerEdit();
                      }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Effacer">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearConseillerSelection();
                      }}
                    >
                      <Clear fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Box>
          </Box>

          {/* Contenu Conseiller */}
          {isConseillerEditing ? (
            <Box onClick={(e) => e.stopPropagation()}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                value={conseillerTextInput}
                onChange={(e) => setConseillerTextInput(e.target.value)}
                placeholder="Saisissez ou collez le texte du conseiller..."
                sx={{ mb: 1 }}
                InputProps={{
                  sx: { fontSize },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={saveConseillerEdit}>
                        <Save fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={cancelConseillerEdit}>
                        <Clear fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          ) : (
            <Box
              sx={{
                p: 2,
                minHeight: "100px",
                bgcolor: getTextBackgroundColor(),
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              {selectedConseillerText ? (
                <Typography
                  sx={{
                    fontSize: `${fontSize}px`,
                    fontStyle: "italic",
                    color: "text.primary",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  "{selectedConseillerText}"
                </Typography>
              ) : (
                <Typography
                  sx={{
                    color: "text.secondary",
                    fontStyle: "italic",
                    textAlign: "center",
                    mt: 2,
                  }}
                >
                  {selectionMode === "conseiller"
                    ? "👆 Sélectionnez du texte dans la transcription"
                    : "Cliquez ici puis sélectionnez dans la transcription"}
                </Typography>
              )}
            </Box>
          )}

          {/* Sélection disponible Conseiller */}
          {!isConseillerEditing &&
            conseillerSelection &&
            conseillerSelection.text !== selectedConseillerText && (
              <Alert
                severity="info"
                sx={{ mt: 2 }}
                action={
                  <Button
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      applyConseillerSelection();
                    }}
                  >
                    Utiliser
                  </Button>
                }
              >
                <Typography variant="body2">
                  <strong>Nouvelle sélection:</strong> "
                  {conseillerSelection.text.substring(0, 60)}..."
                </Typography>
              </Alert>
            )}
        </Paper>
      </Box>

      {/* Message de succès */}
      {isClientComplete && isConseillerComplete && (
        <Fade in={true}>
          <Alert severity="success" sx={{ mt: 2 }} icon={<CheckCircle />}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              🎉 Parfait ! Dialogue sélectionné
            </Typography>
            <Typography variant="body2">
              Vous pouvez maintenant passer au jeu de rôle pour améliorer cette
              interaction.
            </Typography>
          </Alert>
        </Fade>
      )}
    </Box>
  );
};
