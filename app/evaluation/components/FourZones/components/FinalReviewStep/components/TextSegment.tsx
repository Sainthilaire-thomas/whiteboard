// components/TextSegment.tsx
import React, { useState } from "react";
import {
  Paper,
  Typography,
  Box,
  IconButton,
  LinearProgress,
  Chip,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  PlayArrow,
  Stop,
  VolumeUp,
  Download,
  Edit,
  Save,
  Cancel,
} from "@mui/icons-material";

interface TextSegmentProps {
  id: string;
  text: string;
  title: string;
  role: "client" | "conseiller";
  isPlaying: boolean;
  isLoading: boolean;
  progress: number;
  onPlay: () => void;
  onStop: () => void;
  onDownload?: () => void;
  editable?: boolean;
  onTextChange?: (newText: string) => void;
  mode?: string;
}

export const TextSegment: React.FC<TextSegmentProps> = ({
  id,
  text,
  title,
  role,
  isPlaying,
  isLoading,
  progress,
  onPlay,
  onStop,
  onDownload,
  editable = false,
  onTextChange,
  mode = "light",
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);

  const handleSaveEdit = () => {
    if (onTextChange) {
      onTextChange(editText);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(text);
    setIsEditing(false);
  };

  const chipColor = role === "client" ? "primary" : "secondary";
  const paperBgColor =
    mode === "dark"
      ? "rgba(0,0,0,0.2)"
      : role === "client"
      ? "rgba(25, 118, 210, 0.04)"
      : "rgba(156, 39, 176, 0.04)";

  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        mb: 2,
        bgcolor: paperBgColor,
        border: isPlaying ? "2px solid" : "1px solid",
        borderColor: isPlaying ? "primary.main" : "divider",
        transition: "all 0.2s ease-in-out",
      }}
    >
      {/* En-tête */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <Chip label={title} color={chipColor} size="small" sx={{ mr: 1 }} />

        <Typography
          variant="subtitle2"
          fontWeight="bold"
          color="text.secondary"
          sx={{ flexGrow: 1 }}
        >
          {role === "client" ? "Message du client" : "Réponse du conseiller"}
        </Typography>

        {/* Actions */}
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {editable && !isEditing && (
            <Tooltip title="Modifier le texte">
              <IconButton size="small" onClick={() => setIsEditing(true)}>
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {isEditing ? (
            <>
              <Tooltip title="Sauvegarder">
                <IconButton
                  size="small"
                  onClick={handleSaveEdit}
                  color="primary"
                >
                  <Save fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Annuler">
                <IconButton size="small" onClick={handleCancelEdit}>
                  <Cancel fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <>
              <Tooltip title={isPlaying ? "Arrêter" : "Lire"}>
                <IconButton
                  size="small"
                  onClick={isPlaying ? onStop : onPlay}
                  disabled={isLoading || !text.trim()}
                  color="primary"
                >
                  {isLoading ? (
                    <CircularProgress size={16} />
                  ) : isPlaying ? (
                    <Stop fontSize="small" />
                  ) : (
                    <VolumeUp fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>

              {onDownload && (
                <Tooltip title="Télécharger l'audio">
                  <IconButton
                    size="small"
                    onClick={onDownload}
                    disabled={isLoading || !text.trim()}
                  >
                    <Download fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </>
          )}
        </Box>
      </Box>

      {/* Contenu */}
      {isEditing ? (
        <textarea
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          style={{
            width: "100%",
            minHeight: "80px",
            padding: "8px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            fontFamily: "inherit",
            fontSize: "14px",
            resize: "vertical",
          }}
          autoFocus
        />
      ) : (
        <Typography variant="body1">
          {text || "Aucun texte disponible."}
        </Typography>
      )}

      {/* Barre de progression */}
      {(isLoading || isPlaying) && (
        <Box sx={{ mt: 2 }}>
          {isLoading ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={16} />
              <Typography variant="caption" color="text.secondary">
                Génération de l'audio...
              </Typography>
            </Box>
          ) : (
            <>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: "action.hover",
                  "& .MuiLinearProgress-bar": {
                    bgcolor:
                      role === "client" ? "primary.main" : "secondary.main",
                  },
                }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Lecture en cours... {Math.round(progress)}%
              </Typography>
            </>
          )}
        </Box>
      )}
    </Paper>
  );
};
