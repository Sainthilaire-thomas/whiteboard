import React, { useState, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  IconButton,
  LinearProgress,
  Alert,
  FormControl,
  Select,
  MenuItem,
  Slider,
  CircularProgress,
} from "@mui/material";
import {
  PlayArrow,
  Stop,
  VolumeUp,
  Settings,
  Download,
} from "@mui/icons-material";

interface FinalReviewStepProps {
  mode: string;
  selectedClientText: string;
  selectedConseillerText: string;
}

interface TTSSettings {
  voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
  speed: number;
  model: "tts-1" | "tts-1-hd" | "gpt-4o-mini-tts";
  tone?: "professionnel" | "chaleureux" | "enthousiaste" | "calme" | "confiant";
}

// Descriptions des voix OpenAI
const VOICE_DESCRIPTIONS = {
  alloy: "Alloy - Voix équilibrée et naturelle",
  echo: "Echo - Voix masculine claire",
  fable: "Fable - Voix expressive britannique",
  onyx: "Onyx - Voix masculine profonde",
  nova: "Nova - Voix féminine jeune",
  shimmer: "Shimmer - Voix féminine douce",
};

/**
 * Hook pour OpenAI TTS
 */
const useOpenAITTS = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const generateSpeech = useCallback(
    async (text: string, settings: TTSSettings): Promise<string | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: text.trim(),
            voice: settings.voice,
            speed: settings.speed,
            model: settings.model,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        return audioUrl;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erreur inconnue";
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const playAudio = useCallback((audioUrl: string) => {
    // Arrêter l'audio en cours si il y en a un
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onloadstart = () => {
      setIsPlaying(true);
      setProgress(0);
    };

    audio.ontimeupdate = () => {
      if (audio.duration) {
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        setProgress(progressPercent);
      }
    };

    audio.onended = () => {
      setIsPlaying(false);
      setProgress(100);
      setTimeout(() => setProgress(0), 1000);
      URL.revokeObjectURL(audioUrl);
    };

    audio.onerror = () => {
      setIsPlaying(false);
      setProgress(0);
      setError("Erreur lors de la lecture audio");
      URL.revokeObjectURL(audioUrl);
    };

    audio.play().catch((err) => {
      setError("Impossible de jouer l'audio: " + err.message);
      setIsPlaying(false);
      setProgress(0);
    });
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    setIsPlaying(false);
    setProgress(0);
  }, []);

  const speak = useCallback(
    async (text: string, settings: TTSSettings) => {
      if (isPlaying) {
        stopAudio();
        return;
      }

      if (!text.trim()) {
        setError("Aucun texte à lire");
        return;
      }

      const audioUrl = await generateSpeech(text, settings);
      if (audioUrl) {
        playAudio(audioUrl);
      }
    },
    [generateSpeech, playAudio, stopAudio, isPlaying]
  );

  // Nettoyage à la destruction du composant
  React.useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  return {
    speak,
    stopAudio,
    isLoading,
    isPlaying,
    error,
    progress,
    generateSpeech,
    setError,
  };
};

/**
 * Composant pour l'étape finale avec OpenAI TTS
 */
export const FinalReviewStep: React.FC<FinalReviewStepProps> = ({
  mode,
  selectedClientText,
  selectedConseillerText,
}) => {
  const {
    speak,
    stopAudio,
    isLoading,
    isPlaying,
    error,
    progress,
    generateSpeech,
    setError,
  } = useOpenAITTS();

  const [settings, setSettings] = useState<TTSSettings>({
    voice: "alloy",
    speed: 1.0,
    model: "tts-1",
    tone: "professionnel",
  });

  const [showSettings, setShowSettings] = useState(false);

  const handleSpeak = async () => {
    if (isPlaying) {
      stopAudio();
      return;
    }

    const fullText = `Message du client: ${selectedClientText}. 
                     Réponse du conseiller: ${selectedConseillerText}`;

    await speak(fullText, settings);
  };

  const handleSpeakConseillerOnly = async () => {
    if (isPlaying) {
      stopAudio();
      return;
    }

    await speak(selectedConseillerText, settings);
  };

  const handleDownloadAudio = async () => {
    if (!selectedConseillerText.trim()) return;

    const audioUrl = await generateSpeech(selectedConseillerText, settings);
    if (audioUrl) {
      const link = document.createElement("a");
      link.href = audioUrl;
      link.download = "reponse_conseiller.mp3";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(audioUrl), 1000);
    }
  };

  const canSpeak = selectedClientText || selectedConseillerText;

  return (
    <Box sx={{ p: 3, textAlign: "center" }}>
      <Typography variant="h6" gutterBottom>
        Lecture finale de la réponse
      </Typography>

      <Typography variant="body1" paragraph>
        Cette section permet de revoir l'échange complet et d'écouter la réponse
        avec une voix de haute qualité pour évaluer sa fluidité et son impact.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper
        elevation={2}
        sx={{
          p: 3,
          mt: 2,
          mb: 2,
          minHeight: "300px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "stretch",
          bgcolor:
            mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
          textAlign: "left",
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              color="text.secondary"
              sx={{ flexGrow: 1 }}
            >
              Message du client:
            </Typography>
          </Box>
          <Paper
            elevation={1}
            sx={{
              p: 2,
              mb: 2,
              bgcolor: mode === "dark" ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.03)",
            }}
          >
            <Typography variant="body1">
              {selectedClientText || "Aucun texte client sélectionné."}
            </Typography>
          </Paper>

          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              color="text.secondary"
              sx={{ flexGrow: 1 }}
            >
              Réponse du conseiller:
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              {selectedConseillerText && (
                <>
                  <IconButton
                    size="small"
                    onClick={handleSpeakConseillerOnly}
                    disabled={isLoading}
                    color="primary"
                    title="Lire uniquement la réponse du conseiller"
                  >
                    {isLoading ? <CircularProgress size={20} /> : <VolumeUp />}
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={handleDownloadAudio}
                    disabled={isLoading}
                    color="primary"
                    title="Télécharger l'audio de la réponse"
                  >
                    <Download />
                  </IconButton>
                </>
              )}
            </Box>
          </Box>
          <Paper
            elevation={1}
            sx={{
              p: 2,
              bgcolor: mode === "dark" ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.03)",
            }}
          >
            <Typography variant="body1">
              {selectedConseillerText || "Aucune réponse conseiller rédigée."}
            </Typography>
          </Paper>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Barre de progression */}
        {(isLoading || isPlaying) && (
          <Box sx={{ mb: 2 }}>
            {isLoading ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="caption" color="text.secondary">
                  Génération de l'audio...
                </Typography>
              </Box>
            ) : (
              <>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{ height: 6, borderRadius: 3 }}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Lecture en cours... {Math.round(progress)}%
                </Typography>
              </>
            )}
          </Box>
        )}

        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Écoutez la réponse avec une voix IA de haute qualité pour évaluer sa
            fluidité et son impact.
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="contained"
              startIcon={
                isLoading ? (
                  <CircularProgress size={20} />
                ) : isPlaying ? (
                  <Stop />
                ) : (
                  <PlayArrow />
                )
              }
              onClick={handleSpeak}
              disabled={!canSpeak || isLoading}
              color={isPlaying ? "secondary" : "primary"}
              size="large"
            >
              {isLoading
                ? "Génération..."
                : isPlaying
                ? "Arrêter"
                : "Lire l'échange complet"}
            </Button>

            <IconButton
              onClick={() => setShowSettings(!showSettings)}
              title="Paramètres vocaux"
              color="primary"
            >
              <Settings />
            </IconButton>
          </Box>

          {/* Paramètres OpenAI TTS */}
          {showSettings && (
            <Paper sx={{ p: 3, mt: 2, textAlign: "left" }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Paramètres vocaux OpenAI
              </Typography>

              {/* Sélection du ton (nouveau modèle uniquement) */}
              {settings.model === "gpt-4o-mini-tts" && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Ton de la voix
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={settings.tone || "professionnel"}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          tone: e.target.value as TTSSettings["tone"],
                        }))
                      }
                    >
                      <MenuItem value="professionnel">
                        Professionnel et courtois
                      </MenuItem>
                      <MenuItem value="chaleureux">
                        Chaleureux et bienveillant
                      </MenuItem>
                      <MenuItem value="enthousiaste">
                        Enthousiaste et dynamique
                      </MenuItem>
                      <MenuItem value="calme">Calme et rassurant</MenuItem>
                      <MenuItem value="confiant">Confiant et assertif</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              )}

              {/* Sélection du modèle */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Qualité audio
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={settings.model}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        model: e.target.value as TTSSettings["model"],
                      }))
                    }
                  >
                    <MenuItem value="tts-1">Standard (plus rapide)</MenuItem>
                    <MenuItem value="tts-1-hd">HD (meilleure qualité)</MenuItem>
                    <MenuItem value="gpt-4o-mini-tts">
                      Nouveau - Contrôle du ton ✨
                    </MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Sélection de la voix */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Voix
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={settings.voice}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        voice: e.target.value as TTSSettings["voice"],
                      }))
                    }
                  >
                    {Object.entries(VOICE_DESCRIPTIONS).map(
                      ([voice, description]) => (
                        <MenuItem key={voice} value={voice}>
                          {description}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
              </Box>

              {/* Vitesse */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Vitesse: {settings.speed}x
                </Typography>
                <Slider
                  value={settings.speed}
                  onChange={(_, value) =>
                    setSettings((prev) => ({
                      ...prev,
                      speed: value as number,
                    }))
                  }
                  min={0.25}
                  max={4.0}
                  step={0.25}
                  marks={[
                    { value: 0.5, label: "0.5x" },
                    { value: 1, label: "1x" },
                    { value: 2, label: "2x" },
                    { value: 4, label: "4x" },
                  ]}
                  valueLabelDisplay="auto"
                />
              </Box>

              <Typography variant="caption" color="text.secondary">
                💡 La voix "Alloy" et "Nova" sont particulièrement adaptées pour
                le français professionnel.
              </Typography>
            </Paper>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default FinalReviewStep;
