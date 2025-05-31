// FinalReviewStep.tsx - Version mise à jour avec système de drag & drop
import React, { useState, useMemo, useEffect } from "react";
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
  Edit, // ✅ AJOUT pour le bouton d'édition
} from "@mui/icons-material";

// Hooks et composants existants
import { useTTS, type TTSSettings } from "./hooks/useTTS";
import { TextSegment } from "./components/TextSegment";
import { TTSStudioPanel } from "./TTSStudioPanel";

// ✅ NOUVEAU : Import du modal d'édition
import { EditTextModal } from "./components/EditTextModal";

// Import du contexte audio
import { useAudio } from "@/context/AudioContext";

// Types pour les extensions
import type { RoleVoiceSettings } from "./extensions/VoiceByRole";
import type { ConversationalSettings } from "./extensions/ConversationalAgent";
import type { TextSegment as TextSegmentType } from "./extensions/SmartTextSegmentation";

// Imports pour les zones
import {
  generateZoneAwareComposition,
  createOriginalComposition,
  hasImprovedContent,
  generateIndividualPostitsComposition, // ✅ NOUVEAU
  generateCustomOrderPostitsComposition, // ✅ NOUVEAU
  ZoneComposition,
  ZoneAwareTextSegment,
} from "../../utils/generateFinalText";

// Import des composants existants
import EnhancedClientSection from "./components/EnhancedClientSection";
import EnrichedTextDisplay from "./components/EnrichedTextDisplay";

interface FinalReviewStepProps {
  mode: string;
  selectedClientText: string;
  selectedConseillerText: string;
  improvedConseillerText?: string;
  postits: PostitType[];
  zoneColors: Record<string, string>;
  // Props pour l'audio original
  audioSrc?: string | null;
  clientSelection?: {
    startTime?: number;
    endTime?: number;
  };
  play?: () => void;
  pause?: () => void;
  seekTo?: (time: number) => void;
}

/**
 * Composant principal pour l'étape finale avec studio TTS complet
 * ✅ Version mise à jour avec éditeur drag & drop
 */
export const FinalReviewStep: React.FC<FinalReviewStepProps> = ({
  mode,
  selectedClientText,
  selectedConseillerText,
  improvedConseillerText,
  postits,
  zoneColors,
  audioSrc,
  clientSelection,
  play,
  pause,
  seekTo,
}) => {
  // Hook TTS principal
  const tts = useTTS();

  // ✅ NOUVEAU : État pour le modal d'édition et la composition
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentComposition, setCurrentComposition] =
    useState<ZoneComposition | null>(null);

  // Génération de la composition enrichie
  const originalZoneComposition = useMemo((): ZoneComposition => {
    if (hasImprovedContent(postits)) {
      // ✅ UTILISER la nouvelle fonction pour post-its individuels
      const result = generateIndividualPostitsComposition(
        postits,
        zoneColors,
        selectedConseillerText
      );
      return result;
    }
    return createOriginalComposition(selectedConseillerText, zoneColors);
  }, [postits, zoneColors, selectedConseillerText]);

  // ✅ NOUVEAU : Utiliser la composition courante (modifiée ou originale)
  const zoneComposition = currentComposition || originalZoneComposition;

  // ✅ NOUVEAU : Synchroniser la composition courante avec l'originale
  useEffect(() => {
    if (!currentComposition) {
      setCurrentComposition(originalZoneComposition);
    }
  }, [originalZoneComposition, currentComposition]);

  // Utiliser le texte de la composition
  const finalConseillerText = zoneComposition.fullText;

  // État des paramètres TTS (existant)
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

  // État des segments et lecture (existant)
  const [activeSegment, setActiveSegment] = useState<string | null>(null);
  const [textSegments, setTextSegments] = useState<TextSegmentType[]>([]);
  const [audioTimer, setAudioTimer] = useState<NodeJS.Timeout | null>(null);
  const { playSegment } = useAudio();

  // ✅ NOUVEAUX : Handlers pour l'édition
  const handleOpenEditor = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditModalOpen(false);
  };

  const handleSaveComposition = (newComposition: ZoneComposition) => {
    console.log("💾 Sauvegarde de la nouvelle composition:", {
      originalSegments: currentComposition?.segments.length || 0,
      newSegments: newComposition.segments.length,
      originalLength: currentComposition?.fullText.length || 0,
      newLength: newComposition.fullText.length,
    });
    setCurrentComposition(newComposition);
    setIsEditModalOpen(false);
  };

  const handleResetToOriginal = () => {
    const confirmReset = window.confirm(
      "Voulez-vous vraiment revenir au texte original et annuler toutes les modifications ?"
    );
    if (confirmReset) {
      setCurrentComposition(originalZoneComposition);
    }
  };

  // Nettoyage du timer au démontage du composant
  useEffect(() => {
    return () => {
      if (audioTimer) {
        clearTimeout(audioTimer);
      }
    };
  }, [audioTimer]);

  // Gestion de la lecture des segments de zone (existant)
  const handlePlayZoneSegment = async (segment: ZoneAwareTextSegment) => {
    if (activeSegment === segment.id && tts.isPlaying) {
      tts.stopAudio();
      setActiveSegment(null);
      return;
    }

    let effectiveSettings = basicSettings;

    if (roleVoiceSettings.enabled) {
      effectiveSettings = {
        ...basicSettings,
        voice: roleVoiceSettings.conseiller.voice,
        speed: roleVoiceSettings.conseiller.speed,
      };
    }

    setActiveSegment(segment.id);
    await tts.speak(segment.content, effectiveSettings);

    if (!tts.isPlaying) {
      setActiveSegment(null);
    }
  };

  // Lecture de l'audio original du client (existant)
  const handlePlayOriginalClient = () => {
    if (
      audioSrc &&
      clientSelection?.startTime !== undefined &&
      clientSelection?.endTime !== undefined
    ) {
      console.log(
        `🎵 Lecture segment client: ${clientSelection.startTime}s → ${clientSelection.endTime}s`
      );
      playSegment(clientSelection.startTime, clientSelection.endTime);
    } else {
      console.warn(
        "⚠️ Audio original non disponible ou temps de fin manquant",
        {
          audioSrc: !!audioSrc,
          startTime: clientSelection?.startTime,
          endTime: clientSelection?.endTime,
        }
      );
    }
  };

  // Téléchargement d'un segment de zone (existant)
  const handleDownloadZoneSegment = async (segment: ZoneAwareTextSegment) => {
    if (!segment.content.trim()) return;

    const effectiveSettings = roleVoiceSettings.enabled
      ? {
          ...basicSettings,
          voice: roleVoiceSettings.conseiller.voice,
          speed: roleVoiceSettings.conseiller.speed,
        }
      : basicSettings;

    const audioUrl = await tts.generateSpeech(
      segment.content,
      effectiveSettings
    );
    if (audioUrl) {
      const link = document.createElement("a");
      link.href = audioUrl;
      link.download = `zone_${segment.sourceZone}_${Date.now()}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(audioUrl), 1000);
    }
  };

  // Gestion de la lecture simple (par rôle) (existant)
  const handlePlayRole = async (role: "client" | "conseiller") => {
    const text = role === "client" ? selectedClientText : finalConseillerText;

    if (activeSegment === role && tts.isPlaying) {
      tts.stopAudio();
      setActiveSegment(null);
      return;
    }

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

  // Lecture de l'échange complet (existant)
  const handlePlayComplete = async () => {
    if (tts.isPlaying) {
      tts.stopAudio();
      setActiveSegment(null);
      return;
    }

    let fullText = "";

    if (conversationalSettings.enabled) {
      fullText = `En tant que ${
        conversationalSettings.style === "professional"
          ? "conseiller professionnel"
          : "assistant empathique"
      }, lisez cette conversation de manière naturelle: Message du client: "${selectedClientText}" Réponse du conseiller: "${finalConseillerText}"`;
    } else {
      fullText = `Message du client: ${selectedClientText}. Réponse du conseiller: ${finalConseillerText}`;
    }

    setActiveSegment("complete");
    await tts.speak(fullText, basicSettings);

    if (!tts.isPlaying) {
      setActiveSegment(null);
    }
  };

  // Lecture des segments standards (existant)
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

  // Téléchargement d'audio (existant)
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

  // Vérifications (existant)
  const canPlay = selectedClientText.trim() || finalConseillerText.trim();
  const hasAdvancedFeatures =
    roleVoiceSettings.enabled ||
    conversationalSettings.enabled ||
    textSegments.length > 1 ||
    zoneComposition.hasReworkedContent;

  // ✅ NOUVEAU : Vérifier si la composition a été modifiée
  const hasModifications =
    currentComposition &&
    currentComposition !== originalZoneComposition &&
    currentComposition.fullText !== originalZoneComposition.fullText;

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête épuré */}
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
          🎙️ Studio de test vocal
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Écoutez et perfectionnez la réponse avec des outils TTS avancés
        </Typography>

        {/* Indicateurs compacts des fonctionnalités actives */}
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
            {zoneComposition.hasReworkedContent && (
              <Chip
                label={`${zoneComposition.segments.length} zones enrichies`}
                size="small"
                color="success"
              />
            )}
            {/* ✅ NOUVEAU : Indicateur de modifications */}
            {hasModifications && (
              <Chip
                label="Texte modifié"
                size="small"
                color="warning"
                variant="outlined"
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

      {/* ✅ NOUVEAU : Alerte de modifications */}
      {hasModifications && (
        <Alert
          severity="info"
          sx={{ mb: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={handleResetToOriginal}
            >
              Restaurer l'original
            </Button>
          }
        >
          Vous avez modifié l'ordre des segments du texte conseiller.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Zone principale épurée */}
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
            {/* Section client enrichie avec TTS + audio original */}
            <EnhancedClientSection
              text={selectedClientText}
              isPlaying={activeSegment === "client"}
              isLoading={tts.isLoading && activeSegment === "client"}
              progress={activeSegment === "client" ? tts.progress : 0}
              onPlayTTS={() => handlePlayRole("client")}
              onStop={() => tts.stopAudio()}
              onDownload={() => handleDownloadAudio("client")}
              audioSrc={audioSrc}
              clientSelection={clientSelection}
              onPlayOriginal={handlePlayOriginalClient}
              mode={mode}
            />

            {/* ✅ Section conseiller MISE À JOUR avec bouton d'édition */}
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
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: "bold", flexGrow: 1 }}
                >
                  Réponse conseiller
                </Typography>

                {/* ✅ NOUVEAUX : Contrôles avec bouton d'édition */}
                <Box sx={{ display: "flex", gap: 1 }}>
                  {/* Bouton d'édition - uniquement si du contenu retravaillé */}
                  {zoneComposition.hasReworkedContent && (
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={handleOpenEditor}
                      variant="outlined"
                      color="secondary"
                    >
                      Réorganiser
                    </Button>
                  )}

                  <Button
                    size="small"
                    startIcon={
                      activeSegment === "conseiller" && tts.isPlaying ? (
                        <Stop />
                      ) : (
                        <PlayArrow />
                      )
                    }
                    onClick={() => handlePlayRole("conseiller")}
                    disabled={tts.isLoading && activeSegment !== "conseiller"}
                    color={
                      activeSegment === "conseiller" && tts.isPlaying
                        ? "secondary"
                        : "primary"
                    }
                  >
                    {activeSegment === "conseiller" && tts.isPlaying
                      ? "Arrêter"
                      : "Lire"}
                  </Button>

                  <Button
                    size="small"
                    startIcon={<Download />}
                    onClick={() => handleDownloadAudio("conseiller")}
                    disabled={tts.isLoading}
                    variant="outlined"
                  >
                    MP3
                  </Button>
                </Box>
              </Box>

              {/* Barre de progression si lecture active */}
              {activeSegment === "conseiller" && tts.isLoading && (
                <Box sx={{ mb: 2 }}>
                  <LinearProgress variant="indeterminate" sx={{ height: 2 }} />
                </Box>
              )}

              {activeSegment === "conseiller" &&
                !tts.isLoading &&
                tts.isPlaying && (
                  <Box sx={{ mb: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={tts.progress}
                      sx={{ height: 4, borderRadius: 2 }}
                    />
                  </Box>
                )}

              {/* Affichage enrichi discret du texte conseiller */}
              <EnrichedTextDisplay
                composition={zoneComposition}
                fontSize={16}
                mode={mode}
                showZoneIndicators={zoneComposition.hasReworkedContent}
              />

              {/* ✅ NOUVEAU : Message d'aide pour l'édition */}
              {zoneComposition.hasReworkedContent && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: "block", fontStyle: "italic" }}
                >
                  💡 Cliquez sur "Réorganiser" pour modifier l'ordre des
                  segments par glisser-déposer
                </Typography>
              )}
            </Paper>

            <Divider sx={{ my: 3 }} />

            {/* Actions de lecture globale (inchangé) */}
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

        {/* Studio de contrôle (inchangé) */}
        <Grid item xs={12} lg={4}>
          <TTSStudioPanel
            basicSettings={basicSettings}
            onBasicSettingsChange={setBasicSettings}
            roleVoiceSettings={roleVoiceSettings}
            onRoleVoiceChange={setRoleVoiceSettings}
            conversationalSettings={conversationalSettings}
            onConversationalChange={setConversationalSettings}
            text={finalConseillerText}
            segments={textSegments}
            onSegmentsChange={setTextSegments}
            onPlaySegment={handlePlaySegment}
            onStopSegment={handleStopSegment}
            zoneComposition={zoneComposition}
            onPlayZoneSegment={handlePlayZoneSegment}
            onDownloadZoneSegment={handleDownloadZoneSegment}
            activeSegmentId={activeSegment}
            isLoading={tts.isLoading}
            progress={tts.progress}
            disabled={tts.isLoading}
            mode={mode}
          />

          {/* Statistiques épurées (inchangé) */}
          <Paper sx={{ mt: 2, p: 2, bgcolor: "action.hover" }}>
            <Typography variant="subtitle2" gutterBottom>
              📊 Statistiques
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Client: {selectedClientText.length} caractères
              <br />• Conseiller: {finalConseillerText.length} caractères
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

      {/* ✅ NOUVEAU : Modal d'édition */}
      <EditTextModal
        open={isEditModalOpen}
        composition={zoneComposition}
        originalPostits={postits}
        zoneColors={zoneColors} // ✅ AJOUTER cette ligne
        onClose={handleCloseEditor}
        onSave={handleSaveComposition}
      />
    </Box>
  );
};

export default FinalReviewStep;
