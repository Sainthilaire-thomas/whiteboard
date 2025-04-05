import React from "react";
import { Box, Typography, IconButton, Paper } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeDownIcon from "@mui/icons-material/VolumeDown";
import VolumeMuteIcon from "@mui/icons-material/VolumeMute";
import TimeLineAudio, { TimelineMarker } from "./TimeLineAudio";
import { useAudio } from "@/context/AudioContext";

// Format time (seconds -> mm:ss)
const formatTime = (timeInSeconds: number): string => {
  if (isNaN(timeInSeconds)) return "0:00";
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

interface AudioPlayerProps {
  compact?: boolean; // Compact mode for limited space
  showVolume?: boolean; // Show volume controls
  markers?: TimelineMarker[]; // Optional markers (post-its)
  onMarkerClick?: (id: number) => void; // Callback for marker clicks
}

/**
 * AudioPlayer - Audio playback controls with integrated timeline
 *
 * This component now uses the TimeLineAudio component for the timeline
 * functionality, removing duplication while maintaining all features.
 */
const AudioPlayer: React.FC<AudioPlayerProps> = ({
  compact = false,
  showVolume = true,
  markers = [],
  onMarkerClick,
}) => {
  const {
    isPlaying,
    play,
    pause,
    seekTo,
    setVolume,
    currentTime,
    duration,
    audioSrc,
  } = useAudio();

  const [volumeLevel, setVolumeLevel] = React.useState<number>(1);
  const [prevVolume, setPrevVolume] = React.useState<number>(1);

  // Handle marker click - either use provided callback or handle internally
  const handleMarkerClick = (id: number) => {
    if (onMarkerClick) {
      onMarkerClick(id);
    } else {
      // Find marker by ID and seek to its time
      const marker = markers.find((m) => m.id === id);
      if (marker) {
        seekTo(marker.time);
      }
    }
  };

  // Toggle mute/unmute
  const toggleMute = () => {
    if (volumeLevel > 0) {
      setPrevVolume(volumeLevel);
      setVolumeLevel(0);
      setVolume(0);
    } else {
      setVolumeLevel(prevVolume);
      setVolume(prevVolume);
    }
  };

  // Get appropriate volume icon
  const getVolumeIcon = () => {
    if (volumeLevel === 0) return <VolumeMuteIcon />;
    if (volumeLevel < 0.5) return <VolumeDownIcon />;
    return <VolumeUpIcon />;
  };

  // Handle volume change
  const handleVolumeChange = (_: Event, newValue: number | number[]) => {
    const newVolume = newValue as number;
    setVolumeLevel(newVolume);
    setVolume(newVolume);
  };

  // If no audio source, display nothing or a message
  if (!audioSrc) {
    return compact ? null : (
      <Typography variant="body2" color="text.secondary">
        No audio available.
      </Typography>
    );
  }

  return (
    <Paper
      elevation={compact ? 0 : 1}
      sx={{
        p: compact ? 1 : 2,
        my: 1,
        width: "100%",
        borderRadius: compact ? 0 : 1,
      }}
    >
      {/* Timeline with markers - using TimeLineAudio component */}
      <TimeLineAudio
        duration={duration || 100}
        currentTime={currentTime || 0}
        markers={markers}
        onSeek={seekTo}
      />

      {/* Controls and time display */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mt: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {/* Play/Pause button */}
          <IconButton
            onClick={isPlaying ? pause : play}
            color="primary"
            aria-label={isPlaying ? "Pause" : "Play"}
            size={compact ? "small" : "medium"}
          >
            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>

          {/* Time display */}
          <Typography variant={compact ? "caption" : "body2"} sx={{ mx: 1 }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </Typography>
        </Box>

        {/* Volume controls (optional) */}
        {showVolume && (
          <Box sx={{ display: "flex", alignItems: "center", width: "30%" }}>
            <IconButton
              onClick={toggleMute}
              size={compact ? "small" : "medium"}
              aria-label="Volume"
            >
              {getVolumeIcon()}
            </IconButton>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volumeLevel}
              onChange={(e) => {
                const newVolume = parseFloat(e.target.value);
                setVolumeLevel(newVolume);
                setVolume(newVolume);
              }}
              style={{
                width: "100%",
                margin: "0 8px",
              }}
            />
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default AudioPlayer;
