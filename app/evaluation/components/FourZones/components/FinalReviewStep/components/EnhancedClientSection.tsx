// components/FinalReviewStep/EnhancedClientSection.tsx
import React from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  LinearProgress,
  Divider,
  Chip,
} from "@mui/material";
import {
  PlayArrow,
  Stop,
  Download,
  VolumeUp,
  MicNone,
} from "@mui/icons-material";

interface EnhancedClientSectionProps {
  text: string;
  // Props TTS
  isPlaying?: boolean;
  isLoading?: boolean;
  progress?: number;
  onPlayTTS: () => void;
  onStop: () => void;
  onDownload: () => void;
  // Props Audio Original
  audioSrc?: string | null;
  clientSelection?: {
    startTime?: number;
    endTime?: number;
  };
  onPlayOriginal?: () => void;
  // Style
  mode?: string;
}

/**
 * Section client enrichie avec double option de lecture :
 * - Synthèse TTS du texte
 * - Audio original de l'enregistrement
 */
export const EnhancedClientSection: React.FC<EnhancedClientSectionProps> = ({
  text,
  isPlaying = false,
  isLoading = false,
  progress = 0,
  onPlayTTS,
  onStop,
  onDownload,
  audioSrc,
  clientSelection,
  onPlayOriginal,
  mode = "light",
}) => {
  const hasOriginalAudio = audioSrc && clientSelection?.startTime !== undefined;

  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        mb: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      {/* En-tête avec titre */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: "bold", flexGrow: 1 }}
        >
          Message client
        </Typography>

        {/* Indicateur de disponibilité audio */}
        {hasOriginalAudio && (
          <Chip
            label="Audio disponible"
            size="small"
            color="info"
            variant="outlined"
            icon={<MicNone />}
          />
        )}
      </Box>

      {/* Barre de progression si lecture active */}
      {isPlaying && (
        <Box sx={{ mb: 2 }}>
          {isLoading ? (
            <LinearProgress variant="indeterminate" sx={{ height: 2 }} />
          ) : (
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 4, borderRadius: 2 }}
            />
          )}
        </Box>
      )}

      {/* Texte du message client */}
      <Typography
        variant="body1"
        sx={{
          lineHeight: 1.6,
          mb: 2,
          fontSize: "1rem",
          color: mode === "dark" ? "text.primary" : "text.primary",
        }}
      >
        {text}
      </Typography>

      <Divider sx={{ my: 2 }} />

      {/* Contrôles de lecture */}
      <Box
        sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}
      >
        {/* Lecture TTS */}
        <Button
          size="small"
          startIcon={isPlaying ? <Stop /> : <VolumeUp />}
          onClick={isPlaying ? onStop : onPlayTTS}
          disabled={isLoading}
          variant={isPlaying ? "contained" : "outlined"}
          color={isPlaying ? "secondary" : "primary"}
          sx={{ minWidth: 120 }}
        >
          {isLoading
            ? "Génération..."
            : isPlaying
            ? "Arrêter TTS"
            : "🔊 Lire (TTS)"}
        </Button>

        {/* Lecture Audio Original */}
        {hasOriginalAudio && onPlayOriginal && (
          <Button
            size="small"
            startIcon={<PlayArrow />}
            onClick={onPlayOriginal}
            variant="outlined"
            color="info"
            sx={{ minWidth: 140 }}
          >
            🎵 Audio original
          </Button>
        )}

        {/* Téléchargement */}
        <Button
          size="small"
          startIcon={<Download />}
          onClick={onDownload}
          disabled={isLoading}
          variant="outlined"
          sx={{ minWidth: 100 }}
        >
          MP3
        </Button>

        {/* Informations sur l'audio original */}
        {hasOriginalAudio && (
          <Box
            sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1 }}
          >
            <Typography variant="caption" color="text.secondary">
              Segment : {clientSelection?.startTime?.toFixed(1)}s -{" "}
              {clientSelection?.endTime?.toFixed(1)}s
              {clientSelection?.endTime && clientSelection?.startTime && (
                <>
                  {" "}
                  (durée:{" "}
                  {(
                    clientSelection.endTime - clientSelection.startTime
                  ).toFixed(1)}
                  s)
                </>
              )}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Note explicative */}
      {hasOriginalAudio ? (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 1 }}
        >
          💡 Comparez la synthèse TTS avec l'enregistrement original du client
        </Typography>
      ) : (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 1 }}
        >
          💡 Écoutez la synthèse vocale du message client
        </Typography>
      )}
    </Paper>
  );
};

export default EnhancedClientSection;
