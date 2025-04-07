import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  TextField,
  IconButton,
  Tooltip,
  Chip,
  InputAdornment,
} from "@mui/material";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PersonIcon from "@mui/icons-material/Person";
import HeadsetMicIcon from "@mui/icons-material/HeadsetMic";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { ZONES } from "../constants/zone";
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
  setSelectedClientText, // <- Recevoir explicitement
  setSelectedConseillerText, // <- Recevoir explicitement
}) => {
  const [clientTextInput, setClientTextInput] = useState(selectedClientText);
  const [conseillerTextInput, setConseillerTextInput] = useState(
    selectedConseillerText
  );
  const [isClientEditing, setIsClientEditing] = useState(false);
  const [isConseillerEditing, setIsConseillerEditing] = useState(false);
  const { clientSelection, conseillerSelection } = useCallData();

  // Synchroniser les états locaux avec les props
  useEffect(() => {
    setClientTextInput(selectedClientText);
  }, [selectedClientText]);

  useEffect(() => {
    setConseillerTextInput(selectedConseillerText);
  }, [selectedConseillerText]);

  // Fonction pour copier le texte dans le presse-papier
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Gérer les modifications directes des textes
  const handleClientTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClientTextInput(e.target.value);
  };

  const handleConseillerTextChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConseillerTextInput(e.target.value);
  };

  // Appliquer les modifications manuelles
  const applyClientText = () => {
    if (clientTextInput.trim() !== "") {
      setSelectedClientText(clientTextInput);
    }
    setIsClientEditing(false);
  };

  const applyConseillerText = () => {
    if (conseillerTextInput.trim() !== "") {
      setSelectedConseillerText(conseillerTextInput);
    }
    setIsConseillerEditing(false);
  };

  // Logique pour appliquer les sélections
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
  // Fonction pour activer le mode client
  const activateClientMode = () => {
    onSelectionModeChange("client");
  };

  // Fonction pour activer le mode conseiller
  const activateConseillerMode = () => {
    onSelectionModeChange("conseiller");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}>
      <Box sx={{ mb: 1, display: "flex", justifyContent: "center" }}>
        <Chip
          label={
            selectionMode === "client"
              ? "Sélection: Parole client"
              : "Sélection: Réponse conseiller"
          }
          color={selectionMode === "client" ? "primary" : "secondary"}
          icon={
            selectionMode === "client" ? <PersonIcon /> : <HeadsetMicIcon />
          }
          variant="outlined"
        />
      </Box>

      <Typography
        variant="body2"
        sx={{ textAlign: "center", mb: 2, fontStyle: "italic" }}
      >
        Cliquez sur une zone pour la sélectionner, puis surlignez le texte dans
        la transcription
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Zone pour le texte client sélectionné */}
        <Paper
          elevation={3}
          sx={{
            p: 2,
            bgcolor: zoneColors[ZONES.CLIENT],
            minHeight: "60px",
            borderRadius: "8px",
            position: "relative",
            transition: "all 0.2s ease",
            transform: selectionMode === "client" ? "scale(1.02)" : "scale(1)",
            border: selectionMode === "client" ? "2px solid" : "none",
            borderColor: "primary.main",
            cursor: "pointer",
            "&:hover": {
              boxShadow: 6,
            },
          }}
          onClick={activateClientMode}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PersonIcon
                color={selectionMode === "client" ? "primary" : "inherit"}
              />
              <Typography variant="subtitle1" fontWeight="bold">
                Le client dit:
              </Typography>
            </Box>

            <Box>
              {selectedClientText && (
                <Tooltip title="Copier le texte">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(selectedClientText);
                    }}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip
                title={isClientEditing ? "Appliquer" : "Modifier directement"}
              >
                <IconButton
                  size="small"
                  color={isClientEditing ? "primary" : "default"}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isClientEditing) {
                      applyClientText();
                    } else {
                      setIsClientEditing(true);
                      activateClientMode();
                    }
                  }}
                >
                  {isClientEditing ? (
                    <CheckCircleIcon fontSize="small" />
                  ) : (
                    <EditIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Divider sx={{ mb: 1 }} />

          {isClientEditing ? (
            <TextField
              fullWidth
              multiline
              variant="outlined"
              value={clientTextInput}
              onChange={handleClientTextChange}
              placeholder="Saisissez ou collez ici ce que dit le client..."
              autoFocus
              minRows={2}
              onClick={(e) => e.stopPropagation()}
              InputProps={{
                sx: { fontSize },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsClientEditing(false);
                      }}
                      edge="end"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          ) : (
            <Box
              sx={{
                p: 1.5,
                bgcolor: "rgba(255,255,255,0.7)",
                borderRadius: 1,
                minHeight: "60px",
              }}
            >
              <Typography fontSize={fontSize} sx={{ whiteSpace: "pre-wrap" }}>
                {selectedClientText || (
                  <span style={{ fontStyle: "italic", opacity: 0.7 }}>
                    Cliquez ici puis sélectionnez du texte dans la transcription
                  </span>
                )}
              </Typography>
            </Box>
          )}

          {/* Ajout: Affichage de la sélection client disponible */}
          {!isClientEditing &&
            clientSelection &&
            clientSelection.text !== selectedClientText && (
              <Box
                sx={{
                  mt: 1,
                  p: 1.5,
                  bgcolor: "rgba(25, 118, 210, 0.1)",
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "primary.light",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 1,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <Typography
                  variant="body2"
                  fontSize={fontSize - 1}
                  sx={{ flex: 1 }}
                >
                  <b>Sélection disponible:</b>{" "}
                  {clientSelection.text.length > 50
                    ? `${clientSelection.text.substring(0, 50)}...`
                    : clientSelection.text}
                </Typography>
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    applyClientSelection();
                  }}
                >
                  Appliquer
                </Button>
              </Box>
            )}
        </Paper>

        {/* Flèche indiquant le flux de conversation */}
        <Box sx={{ display: "flex", justifyContent: "center", my: -1 }}>
          <ArrowRightAltIcon
            sx={{ transform: "rotate(90deg)", fontSize: 30, opacity: 0.6 }}
          />
        </Box>

        {/* Zone pour le texte conseiller sélectionné */}
        <Paper
          elevation={3}
          sx={{
            p: 2,
            bgcolor: zoneColors[ZONES.CONSEILLER],
            minHeight: "60px",
            borderRadius: "8px",
            position: "relative",
            transition: "all 0.2s ease",
            transform:
              selectionMode === "conseiller" ? "scale(1.02)" : "scale(1)",
            border: selectionMode === "conseiller" ? "2px solid" : "none",
            borderColor: "secondary.main",
            cursor: "pointer",
            "&:hover": {
              boxShadow: 6,
            },
          }}
          onClick={activateConseillerMode}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <HeadsetMicIcon
                color={selectionMode === "conseiller" ? "secondary" : "inherit"}
              />
              <Typography variant="subtitle1" fontWeight="bold">
                Le conseiller répond:
              </Typography>
            </Box>

            <Box>
              {selectedConseillerText && !hasOriginalPostits && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<CompareArrowsIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onCategorizeClick(selectedConseillerText);
                  }}
                  sx={{ mr: 1 }}
                >
                  Catégoriser
                </Button>
              )}

              {selectedConseillerText && (
                <Tooltip title="Copier le texte">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(selectedConseillerText);
                    }}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              <Tooltip
                title={
                  isConseillerEditing ? "Appliquer" : "Modifier directement"
                }
              >
                <IconButton
                  size="small"
                  color={isConseillerEditing ? "secondary" : "default"}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isConseillerEditing) {
                      applyConseillerText();
                    } else {
                      setIsConseillerEditing(true);
                      activateConseillerMode();
                    }
                  }}
                >
                  {isConseillerEditing ? (
                    <CheckCircleIcon fontSize="small" />
                  ) : (
                    <EditIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Divider sx={{ mb: 1 }} />

          {isConseillerEditing ? (
            <TextField
              fullWidth
              multiline
              variant="outlined"
              value={conseillerTextInput}
              onChange={handleConseillerTextChange}
              placeholder="Saisissez ou collez ici ce que répond le conseiller..."
              autoFocus
              minRows={2}
              onClick={(e) => e.stopPropagation()}
              InputProps={{
                sx: { fontSize },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsConseillerEditing(false);
                      }}
                      edge="end"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          ) : (
            <Box
              sx={{
                p: 1.5,
                bgcolor: "rgba(255,255,255,0.7)",
                borderRadius: 1,
                minHeight: "60px",
              }}
            >
              <Typography fontSize={fontSize} sx={{ whiteSpace: "pre-wrap" }}>
                {selectedConseillerText || (
                  <span style={{ fontStyle: "italic", opacity: 0.7 }}>
                    Cliquez ici puis sélectionnez du texte dans la transcription
                  </span>
                )}
              </Typography>
            </Box>
          )}

          {/* Ajout: Affichage de la sélection conseiller disponible */}
          {!isConseillerEditing &&
            conseillerSelection &&
            conseillerSelection.text !== selectedConseillerText && (
              <Box
                sx={{
                  mt: 1,
                  p: 1.5,
                  bgcolor: "rgba(156, 39, 176, 0.1)",
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "secondary.light",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 1,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <Typography
                  variant="body2"
                  fontSize={fontSize - 1}
                  sx={{ flex: 1 }}
                >
                  <b>Sélection disponible:</b>{" "}
                  {conseillerSelection.text.length > 50
                    ? `${conseillerSelection.text.substring(0, 50)}...`
                    : conseillerSelection.text}
                </Typography>
                <Button
                  size="small"
                  variant="contained"
                  color="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    applyConseillerSelection();
                  }}
                >
                  Appliquer
                </Button>
              </Box>
            )}

          {selectedConseillerText && !hasOriginalPostits && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mt: 2,
                p: 1,
                bgcolor: "rgba(0,0,0,0.03)",
                borderRadius: 1,
                border: "1px dashed",
                borderColor: "divider",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Cliquez sur "Catégoriser" pour passer à l'étape suivante
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};
