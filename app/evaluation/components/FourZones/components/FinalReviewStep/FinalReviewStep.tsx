// FinalReviewStep.tsx - Version complète avec studio TTS intégré
import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Divider,
  Alert,
  Grid,
  Paper,
  LinearProgress,
  Chip,
} from "@mui/material";
import {
  PlayArrow,
  Stop,
  Download,
  Psychology,
  Speed,
} from "@mui/icons-material";

// Hooks et composants
import { useTTS, type TTSSettings } from "./hooks/useTTS";
import { TextSegment } from "./components/TextSegment";
import { TTSStudioPanel } from "./TTSStudioPanel";

// Types pour les extensions
import type { RoleVoiceSettings } from "./extensions/VoiceByRole";
import type { ConversationalSettings } from "./extensions/ConversationalAgent";
import type { TextSegment as TextSegmentType } from "./extensions/SmartTextSegmentation";

interface FinalReviewStepProps {
  mode: string;
  selectedClientText: string;
  selectedConseillerText: string; // Texte initial sélectionné
  improvedConseillerText?: string; // Texte retravaillé dans les 4 zones
}

/**
 * Composant principal pour l'étape finale avec studio TTS complet
 * Intègre toutes les fonctionnalités avancées de synthèse vocale
 */
export const FinalReviewStep: React.FC<FinalReviewStepProps> = ({
  mode,
  selectedClientText,
  selectedConseillerText,
  improvedConseillerText, // Nouveau prop
}) => {
  // ✅ Debug pour vérifier ce qui est reçu
  console.log("🎙️ FinalReviewStep props reçus:");
  console.log("- selectedConseillerText:", selectedConseillerText);
  console.log("- improvedConseillerText:", improvedConseillerText);

  // Hook TTS principal
  const tts = useTTS();

  // Utiliser le texte amélioré s'il existe, sinon le texte original
  const finalConseillerText = improvedConseillerText || selectedConseillerText;

  console.log("- finalConseillerText utilisé:", finalConseillerText);
  console.log("- Texte retravaillé actif:", !!improvedConseillerText);

  // État des paramètres
  const [basicSettings, setBasicSettings] = useState<TTSSettings>({
    voice: "alloy",
    speed: 1.0,
    model: "tts-1",
    textEnhancement: "aucun",
  });

  const [roleVoiceSettings, setRoleVoiceSettings] = useState<RoleVoiceSettings>(
    {
      client: { voice: "nova", speed: 1.0 },
      conseiller: { voice: "onyx", speed: 0.9 },
      enabled: false,
    }
  );

  const [conversationalSettings, setConversationalSettings] =
    useState<ConversationalSettings>({
      enabled: false,
      style: "professional",
      adaptiveness: 30,
      contextAwareness: true,
      emotionalIntelligence: false,
    });

  // État des segments et lecture
  const [activeSegment, setActiveSegment] = useState<string | null>(null);
  const [textSegments, setTextSegments] = useState<TextSegmentType[]>([]);
  const [playMode, setPlayMode] = useState<"simple" | "segmented" | "complete">(
    "simple"
  );

  // Gestion de la lecture simple (par rôle)
  const handlePlayRole = async (role: "client" | "conseiller") => {
    const text = role === "client" ? selectedClientText : finalConseillerText;

    if (activeSegment === role && tts.isPlaying) {
      tts.stopAudio();
      setActiveSegment(null);
      return;
    }

    // Déterminer les paramètres selon le mode
    let effectiveSettings = basicSettings;

    if (roleVoiceSettings.enabled) {
      effectiveSettings = {
        ...basicSettings,
        voice: roleVoiceSettings[role].voice,
        speed: roleVoiceSettings[role].speed,
      };
    }

    setActiveSegment(role);
    await tts.speak(text, effectiveSettings);

    if (!tts.isPlaying) {
      setActiveSegment(null);
    }
  };

  // Lecture de l'échange complet
  const handlePlayComplete = async () => {
    if (tts.isPlaying) {
      tts.stopAudio();
      setActiveSegment(null);
      return;
    }

    let fullText = "";

    if (conversationalSettings.enabled) {
      // Mode conversationnel - utiliser l'API Chat Completions
      fullText = `En tant que ${
        conversationalSettings.style === "professional"
          ? "conseiller professionnel"
          : "assistant empathique"
      }, lisez cette conversation de manière naturelle: Message du client: "${selectedClientText}" Réponse du conseiller: "${finalConseillerText}"`;
    } else {
      // Mode standard
      fullText = `Message du client: ${selectedClientText}. Réponse du conseiller: ${finalConseillerText}`;
    }

    setActiveSegment("complete");
    await tts.speak(fullText, basicSettings);

    if (!tts.isPlaying) {
      setActiveSegment(null);
    }
  };

  // Lecture des segments
  const handlePlaySegment = async (segment: TextSegmentType) => {
    setActiveSegment(segment.id);
    await tts.speak(segment.content, basicSettings);

    if (!tts.isPlaying) {
      setActiveSegment(null);
    }
  };

  const handleStopSegment = (segmentId: string) => {
    if (activeSegment === segmentId) {
      tts.stopAudio();
      setActiveSegment(null);
    }
  };

  // Téléchargement d'audio
  const handleDownloadAudio = async (role: "client" | "conseiller") => {
    const text = role === "client" ? selectedClientText : finalConseillerText;
    if (!text.trim()) return;

    const effectiveSettings = roleVoiceSettings.enabled
      ? {
          ...basicSettings,
          voice: roleVoiceSettings[role].voice,
          speed: roleVoiceSettings[role].speed,
        }
      : basicSettings;

    const audioUrl = await tts.generateSpeech(text, effectiveSettings);
    if (audioUrl) {
      const link = document.createElement("a");
      link.href = audioUrl;
      link.download = `${role}_response_${Date.now()}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(audioUrl), 1000);
    }
  };

  // Vérifications
  const canPlay = selectedClientText.trim() || finalConseillerText.trim();
  const hasAdvancedFeatures =
    roleVoiceSettings.enabled ||
    conversationalSettings.enabled ||
    textSegments.length > 1;

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
          🎙️ Studio de test vocal
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Écoutez et perfectionnez la réponse avec des outils TTS avancés
        </Typography>

        {hasAdvancedFeatures && (
          <Box sx={{ mt: 1, display: "flex", justify: "center", gap: 1 }}>
            {roleVoiceSettings.enabled && (
              <Chip label="Voix différenciées" size="small" color="primary" />
            )}
            {conversationalSettings.enabled && (
              <Chip
                label={`IA ${conversationalSettings.style}`}
                size="small"
                color="secondary"
              />
            )}
            {textSegments.length > 1 && (
              <Chip
                label={`${textSegments.length} segments`}
                size="small"
                color="success"
              />
            )}
          </Box>
        )}
      </Box>

      {/* Alertes */}
      {tts.error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={tts.clearError}>
          {tts.error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Zone principale */}
        <Grid item xs={12} lg={8}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              minHeight: "500px",
              bgcolor:
                mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
            }}
          >
            {/* Segments de texte principaux */}
            <TextSegment
              id="client"
              text={selectedClientText}
              title="Message client"
              role="client"
              isPlaying={activeSegment === "client"}
              isLoading={tts.isLoading && activeSegment === "client"}
              progress={activeSegment === "client" ? tts.progress : 0}
              onPlay={() => handlePlayRole("client")}
              onStop={() => tts.stopAudio()}
              onDownload={() => handleDownloadAudio("client")}
              mode={mode}
              editable={false}
            />

            <TextSegment
              id="conseiller"
              text={finalConseillerText}
              title="Réponse conseiller"
              role="conseiller"
              isPlaying={activeSegment === "conseiller"}
              isLoading={tts.isLoading && activeSegment === "conseiller"}
              progress={activeSegment === "conseiller" ? tts.progress : 0}
              onPlay={() => handlePlayRole("conseiller")}
              onStop={() => tts.stopAudio()}
              onDownload={() => handleDownloadAudio("conseiller")}
              mode={mode}
              editable={false}
            />
            {improvedConseillerText && (
              <>
                <br />• <strong>✨ Texte retravaillé utilisé</strong>
                <br />• Amélioration:{" "}
                {finalConseillerText.length - selectedConseillerText.length > 0
                  ? "+"
                  : ""}
                {finalConseillerText.length - selectedConseillerText.length}{" "}
                caractères
              </>
            )}
            <Divider sx={{ my: 3 }} />

            {/* Actions de lecture globale */}
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h6" gutterBottom>
                Évaluation globale
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Écoutez l'échange complet pour évaluer la fluidité et la
                cohérence de la conversation
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  variant="contained"
                  size="large"
                  startIcon={
                    activeSegment === "complete" && tts.isPlaying ? (
                      <Stop />
                    ) : (
                      <PlayArrow />
                    )
                  }
                  onClick={handlePlayComplete}
                  disabled={
                    !canPlay || (tts.isLoading && activeSegment !== "complete")
                  }
                  color={
                    activeSegment === "complete" && tts.isPlaying
                      ? "secondary"
                      : "primary"
                  }
                  sx={{ minWidth: 200 }}
                >
                  {tts.isLoading && activeSegment === "complete"
                    ? "Génération..."
                    : activeSegment === "complete" && tts.isPlaying
                    ? "Arrêter la lecture"
                    : "🎭 Lire l'échange complet"}
                </Button>

                {conversationalSettings.enabled && (
                  <Button
                    variant="outlined"
                    startIcon={<Psychology />}
                    disabled
                    sx={{ minWidth: 150 }}
                  >
                    Mode IA {conversationalSettings.style}
                  </Button>
                )}
              </Box>

              {/* Indicateurs de progression pour lecture complète */}
              {activeSegment === "complete" && (
                <Box sx={{ mt: 2, maxWidth: 400, mx: "auto" }}>
                  {tts.isLoading ? (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        justifyContent: "center",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Préparation audio avec IA...
                      </Typography>
                    </Box>
                  ) : (
                    <LinearProgress
                      variant="determinate"
                      value={tts.progress}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  )}
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Studio de contrôle */}
        <Grid item xs={12} lg={4}>
          <TTSStudioPanel
            basicSettings={basicSettings}
            onBasicSettingsChange={setBasicSettings}
            roleVoiceSettings={roleVoiceSettings}
            onRoleVoiceChange={setRoleVoiceSettings}
            conversationalSettings={conversationalSettings}
            onConversationalChange={setConversationalSettings}
            text={finalConseillerText} // Utiliser le texte retravaillé pour segmentation
            segments={textSegments}
            onSegmentsChange={setTextSegments}
            onPlaySegment={handlePlaySegment}
            onStopSegment={handleStopSegment}
            disabled={tts.isLoading}
            mode={mode}
          />

          {/* Statistiques et infos */}
          <Paper sx={{ mt: 2, p: 2, bgcolor: "action.hover" }}>
            <Typography variant="subtitle2" gutterBottom>
              📊 Statistiques
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Client: {selectedClientText.length} caractères
              <br />• Conseiller: {selectedConseillerText.length} caractères
              <br />• Temps estimé: ~
              {Math.round(
                (selectedClientText.length + finalConseillerText.length) / 120
              )}
              s<br />• Coût approx: $
              {(
                (selectedClientText.length + finalConseillerText.length) *
                0.000015
              ).toFixed(4)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FinalReviewStep;
