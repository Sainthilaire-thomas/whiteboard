import React, { useState } from "react";
import { Box, IconButton, Slider, Typography, Stack } from "@mui/material";
import { useAudioPlayer } from "../../../context/AudioProvider";

interface AudioControlProps {
  showTimeline?: boolean;
  showTitle?: boolean;
  showVolume?: boolean;
  compact?: boolean;
  title?: string;
}

const formatTime = (time: number): string => {
  if (!time) return "00:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

const AudioControl: React.FC<AudioControlProps> = ({
  showTimeline = true,
  showTitle = true,
  showVolume = true,
  compact = false,
  title = "Lecture audio",
}) => {
  const {
    isPlaying,
    play,
    pause,
    setTime,
    duration,
    currentTime,
    volume,
    setVolume,
    muted,
    toggleMute,
    audioSrc,
  } = useAudioPlayer();

  const [isDragging, setIsDragging] = useState(false);

  if (!audioSrc) {
    return null;
  }

  const handleTimeChange = (_: Event, newValue: number | number[]) => {
    setTime(newValue as number);
  };

  const handleVolumeChange = (_: Event, newValue: number | number[]) => {
    setVolume(newValue as number);
  };

  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "rgba(245, 245, 245, 0.95)",
        borderRadius: 1,
        p: compact ? 1 : 2,
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      {showTitle && (
        <Typography
          variant={compact ? "body2" : "body1"}
          fontWeight="medium"
          mb={1}
        >
          {title}
        </Typography>
      )}

      <Stack direction="row" spacing={2} alignItems="center">
        <IconButton
          onClick={isPlaying ? pause : play}
          size={compact ? "small" : "medium"}
        >
          {isPlaying ? "⏸️" : "▶️"}
        </IconButton>

        {showTimeline && (
          <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant={compact ? "caption" : "body2"}>
              {formatTime(currentTime)}
            </Typography>

            <Slider
              size={compact ? "small" : "medium"}
              min={0}
              max={duration || 100}
              value={currentTime || 0}
              onChange={handleTimeChange}
              sx={{ mx: 1 }}
            />

            <Typography variant={compact ? "caption" : "body2"}>
              {formatTime(duration)}
            </Typography>
          </Box>
        )}

        {showVolume && (
          <Box
            sx={{
              width: compact ? 60 : 100,
              display: "flex",
              alignItems: "center",
            }}
          >
            <IconButton
              onClick={toggleMute}
              size={compact ? "small" : "medium"}
            >
              {muted ? "🔇" : volume < 0.1 ? "🔈" : volume < 0.5 ? "🔉" : "🔊"}
            </IconButton>
            <Slider
              size="small"
              min={0}
              max={1}
              step={0.01}
              value={muted ? 0 : volume}
              onChange={handleVolumeChange}
            />
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default AudioControl;
