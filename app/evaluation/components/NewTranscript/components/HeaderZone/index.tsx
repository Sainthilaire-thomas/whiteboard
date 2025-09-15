// app/evaluation/components/NewTranscript/components/HeaderZone/index.tsx

import React, { useCallback, useState } from "react";
import {
  Box,
  IconButton,
  Typography,
  Slider,
  Select,
  MenuItem,
  FormControl,
  Tooltip,
  ButtonGroup,
  Button,
  Chip,
} from "@mui/material";
import {
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeDown,
  VolumeMute,
  Settings,
  GetApp,
  Share,
  TextFields,
  ViewModule,
  ViewList,
  Fullscreen,
  FullscreenExit,
  LightMode,
  DarkMode,
} from "@mui/icons-material";
import { useAudio } from "@/context/AudioContext";
import { useCallData } from "@/context/CallDataContext";

import { HeaderZoneProps } from "../../types";

// Sous-composants
interface CallInfoProps {
  filename?: string;
  callId: string;
  duration: string;
  status?: string;
}

const CallInfo: React.FC<CallInfoProps> = ({
  filename,
  callId,
  duration,
  status,
}) => (
  <Box sx={{ display: "flex", flexDirection: "column", minWidth: 200 }}>
    <Typography
      variant="subtitle1"
      sx={{ fontWeight: "bold", fontSize: "0.9rem" }}
    >
      {filename || `Appel ${callId}`}
    </Typography>
    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
      <Typography variant="caption" color="text.secondary">
        {callId}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        •
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {duration}
      </Typography>
      {status && (
        <Chip
          label={status}
          size="small"
          color={status === "completed" ? "success" : "info"}
          sx={{ height: 18, fontSize: "0.7rem" }}
        />
      )}
    </Box>
  </Box>
);

interface AudioControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
}

const AudioControls: React.FC<AudioControlsProps> = ({
  isPlaying,
  currentTime,
  duration,
  volume,
  onPlay,
  onPause,
  onSeek,
  onVolumeChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const handleSeekChange = useCallback(
    (event: Event, newValue: number | number[]) => {
      const time = newValue as number;
      onSeek(time);
    },
    [onSeek]
  );

  const handleSeekStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleSeekEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleVolumeToggle = useCallback(() => {
    if (isMuted) {
      setIsMuted(false);
      onVolumeChange(previousVolume);
    } else {
      setPreviousVolume(volume);
      setIsMuted(true);
      onVolumeChange(0);
    }
  }, [isMuted, volume, previousVolume, onVolumeChange]);

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeMute />;
    if (volume < 0.5) return <VolumeDown />;
    return <VolumeUp />;
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minWidth: 300,
        gap: 1,
      }}
    >
      {/* Contrôles principaux */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {/* Play/Pause */}
        <Tooltip title={isPlaying ? "Pause" : "Lecture"}>
          <IconButton
            onClick={isPlaying ? onPause : onPlay}
            size="large"
            sx={{
              backgroundColor: "primary.main",
              color: "white",
              "&:hover": {
                backgroundColor: "primary.dark",
              },
            }}
          >
            {isPlaying ? <Pause /> : <PlayArrow />}
          </IconButton>
        </Tooltip>

        {/* Time display */}
        <Typography variant="body2" sx={{ minWidth: 100, textAlign: "center" }}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </Typography>

        {/* Volume controls */}
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 120 }}
        >
          <Tooltip title={isMuted ? "Activer le son" : "Couper le son"}>
            <IconButton size="small" onClick={handleVolumeToggle}>
              {getVolumeIcon()}
            </IconButton>
          </Tooltip>
          <Slider
            value={isMuted ? 0 : volume}
            onChange={(event, newValue) => {
              const vol = newValue as number;
              onVolumeChange(vol);
              if (vol > 0 && isMuted) {
                setIsMuted(false);
              }
            }}
            min={0}
            max={1}
            step={0.1}
            size="small"
            sx={{ width: 80 }}
          />
        </Box>
      </Box>

      {/* Progress bar */}
      <Box sx={{ width: "100%", px: 1 }}>
        <Slider
          value={isDragging ? undefined : currentTime}
          onChange={handleSeekChange}
          onMouseDown={handleSeekStart}
          onMouseUp={handleSeekEnd}
          min={0}
          max={duration}
          step={0.1}
          sx={{
            "& .MuiSlider-thumb": {
              width: 12,
              height: 12,
            },
            "& .MuiSlider-rail": {
              opacity: 0.3,
            },
          }}
        />
      </Box>
    </Box>
  );
};

interface ViewControlsProps {
  displayMode: "word-by-word" | "paragraphs" | "hybrid";
  fontSize: number;
  theme: "light" | "dark" | "auto";
  isFullscreen: boolean;
  onDisplayModeChange: (mode: "word-by-word" | "paragraphs" | "hybrid") => void;
  onFontSizeChange: (size: number) => void;
  onThemeChange: (theme: "light" | "dark" | "auto") => void;
  onFullscreenToggle: () => void;
}

const ViewControls: React.FC<ViewControlsProps> = ({
  displayMode,
  fontSize,
  theme,
  isFullscreen,
  onDisplayModeChange,
  onFontSizeChange,
  onThemeChange,
  onFullscreenToggle,
}) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
    {/* Display Mode */}
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <Select
        value={displayMode}
        onChange={(e) => onDisplayModeChange(e.target.value as any)}
        displayEmpty
        sx={{ fontSize: "0.8rem" }}
      >
        <MenuItem value="word-by-word">
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TextFields fontSize="small" />
            Mot par mot
          </Box>
        </MenuItem>
        <MenuItem value="paragraphs">
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ViewList fontSize="small" />
            Paragraphes
          </Box>
        </MenuItem>
        <MenuItem value="hybrid">
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ViewModule fontSize="small" />
            Hybride
          </Box>
        </MenuItem>
      </Select>
    </FormControl>

    {/* Font Size */}
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Typography variant="caption">A</Typography>
      <Slider
        value={fontSize}
        onChange={(event, newValue) => onFontSizeChange(newValue as number)}
        min={10}
        max={24}
        step={1}
        sx={{ width: 60 }}
        size="small"
      />
      <Typography variant="body1">A</Typography>
    </Box>

    {/* Theme toggle */}
    <Tooltip title="Changer le thème">
      <IconButton
        size="small"
        onClick={() => onThemeChange(theme === "light" ? "dark" : "light")}
      >
        {theme === "light" ? <DarkMode /> : <LightMode />}
      </IconButton>
    </Tooltip>

    {/* Fullscreen */}
    <Tooltip title={isFullscreen ? "Quitter plein écran" : "Plein écran"}>
      <IconButton size="small" onClick={onFullscreenToggle}>
        {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
      </IconButton>
    </Tooltip>
  </Box>
);

interface ActionsProps {
  onExport: () => void;
  onShare: () => void;
  onSettings: () => void;
}

const Actions: React.FC<ActionsProps> = ({ onExport, onShare, onSettings }) => (
  <Box sx={{ display: "flex", gap: 1 }}>
    <ButtonGroup size="small" variant="outlined">
      <Tooltip title="Exporter">
        <Button onClick={onExport} startIcon={<GetApp />}>
          Export
        </Button>
      </Tooltip>
      <Tooltip title="Partager">
        <Button onClick={onShare} startIcon={<Share />}>
          Partager
        </Button>
      </Tooltip>
      <Tooltip title="Paramètres">
        <Button onClick={onSettings} startIcon={<Settings />}>
          Réglages
        </Button>
      </Tooltip>
    </ButtonGroup>
  </Box>
);

// Composant principal HeaderZone
export const HeaderZone: React.FC<HeaderZoneProps> = ({
  callId,
  config,
  audioSrc,
  onConfigChange,
}) => {
  // États locaux
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Hooks pour les données réelles
  const { selectedCall } = useCallData();
  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    play,
    pause,
    seekTo,
    setVolume,
  } = useAudio();

  // Handlers avec les vraies fonctions audio
  const handlePlay = useCallback(() => {
    play();
    console.log("🎵 Play audio");
  }, [play]);

  const handlePause = useCallback(() => {
    pause();
    console.log("⏸️ Pause audio");
  }, [pause]);

  const handleSeek = useCallback(
    (time: number) => {
      seekTo(time);
      console.log("⏰ Seek to:", time);
    },
    [seekTo]
  );

  const handleVolumeChange = useCallback(
    (newVolume: number) => {
      setVolume(newVolume);
      console.log("🔊 Volume change:", newVolume);
    },
    [setVolume]
  );

  const handleFullscreenToggle = useCallback(() => {
    setIsFullscreen((prev) => !prev);
    // TODO: Logique fullscreen réelle
    console.log("📺 Fullscreen toggle:", !isFullscreen);
  }, [isFullscreen]);

  const handleExport = useCallback(() => {
    console.log("📤 Export transcript");
    // TODO: Logique export
  }, []);

  const handleShare = useCallback(() => {
    console.log("🔗 Share transcript");
    // TODO: Logique partage
  }, []);

  const handleSettings = useCallback(() => {
    console.log("⚙️ Open settings");
    // TODO: Ouvrir panneau settings
  }, []);

  const formatDuration = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;

    if (hours > 0) {
      return `${hours}h${remainingMins.toString().padStart(2, "0")}`;
    }
    return `${remainingMins}:${Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0")}`;
  }, []);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "1fr 2fr",
          md: "1fr 2fr 1fr",
          lg: "1fr 2fr 1fr 1fr",
        },
        gap: 2,
        padding: "12px 24px",
        borderBottom: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
        alignItems: "center",
        minHeight: 80,
      }}
    >
      {/* Call Info */}
      <CallInfo
        filename={selectedCall?.filename || `Call_${callId}`}
        callId={callId}
        duration={formatDuration(duration)}
        status="active"
      />

      {/* Audio Controls */}
      <AudioControls
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        onPlay={handlePlay}
        onPause={handlePause}
        onSeek={handleSeek}
        onVolumeChange={handleVolumeChange}
      />

      {/* View Controls */}
      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <ViewControls
          displayMode={config.displayMode}
          fontSize={config.fontSize}
          theme={config.theme}
          isFullscreen={isFullscreen}
          onDisplayModeChange={(mode) => onConfigChange({ displayMode: mode })}
          onFontSizeChange={(size) => onConfigChange({ fontSize: size })}
          onThemeChange={(theme) => onConfigChange({ theme })}
          onFullscreenToggle={handleFullscreenToggle}
        />
      </Box>

      {/* Actions */}
      <Box sx={{ display: { xs: "none", lg: "block" } }}>
        <Actions
          onExport={handleExport}
          onShare={handleShare}
          onSettings={handleSettings}
        />
      </Box>

      {/* Mobile responsive menu */}
      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          justifyContent: "flex-end",
          gridColumn: "1 / -1",
        }}
      >
        <Tooltip title="Plus d'options">
          <IconButton size="small">
            <Settings />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default HeaderZone;
