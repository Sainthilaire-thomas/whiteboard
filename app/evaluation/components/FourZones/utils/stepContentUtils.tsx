// utils/stepContentUtils.js - Version adaptée avec TTS
import React, { useEffect } from "react";
import { useCallData } from "@/context/CallDataContext";
import { Box, Typography, Paper, IconButton, Button } from "@mui/material";
import { PlayArrow, RecordVoiceOver } from "@mui/icons-material";
import MicIcon from "@mui/icons-material/Mic";
import DynamicSpeechToTextForFourZones from "../components/DynamicSpeechToTextForFourZones";
import { ZoneLegend } from "../components/ZoneLegend";
import { ClientResponseSection } from "../components/ClientResponseSection";
import FinalReviewStep from "../components/FinalReviewStep/FinalReviewStep";
import { PostitType } from "../types/types";
import { ZONES } from "../constants/zone";
import {
  generateFinalConseillerText,
  hasImprovedContent,
} from "./generateFinalText";

/**
 * Type pour les paramètres de renderStepContent
 */
interface RenderStepContentParams {
  activeStep: number;
  selectionMode: string;
  setSelectionMode: (mode: string) => void;
  selectedClientText: string;
  selectedConseillerText: string;
  fontSize: number;
  zoneColors: Record<string, string>;
  hasOriginalPostits: boolean;
  setSelectedClientText: (text: string) => void;
  setSelectedConseillerText: (text: string) => void;
  newPostitContent: string;
  setNewPostitContent: (content: string) => void;
  currentZone: string;
  setCurrentZone: (zone: string) => void;
  setTextToCategorizze: (text: string) => void;
  setShowCategoryDialog: (show: boolean) => void;
  audioSrc: string | null;
  seekTo: (time: number) => void;
  play: () => void;
  speechToTextVisible: boolean;
  toggleSpeechToText: () => void;
  addPostitsFromSpeech: (postits: PostitType[]) => void;
  showNotification: (message: string, severity?: string) => void;
  renderDropZones: (improvementMode?: boolean) => JSX.Element;
  addSelectedTextAsPostit: (zone: string) => void;
  mode: string;
  handleOpenZoneMenu?: (
    event: React.MouseEvent<HTMLElement>,
    zone: string
  ) => void;
  postits: PostitType[];
  setPostits: (postits: PostitType[]) => void;
  // Nouvelles props TTS
  ttsStudioVisible?: boolean;
  toggleTTSStudio?: () => void;
}

/**
 * Fonction utilitaire pour le rendu du contenu en fonction de l'étape active
 */
export const renderStepContent = ({
  activeStep,
  selectionMode,
  setSelectionMode,
  selectedClientText,
  selectedConseillerText,
  fontSize,
  zoneColors,
  hasOriginalPostits,
  setSelectedClientText,
  setSelectedConseillerText,
  newPostitContent,
  setNewPostitContent,
  currentZone,
  setCurrentZone,
  setTextToCategorizze,
  setShowCategoryDialog,
  audioSrc,
  seekTo,
  play,
  speechToTextVisible,
  toggleSpeechToText,
  addPostitsFromSpeech,
  showNotification,
  renderDropZones,
  addSelectedTextAsPostit,
  mode,
  handleOpenZoneMenu,
  postits,
  setPostits,
  ttsStudioVisible,
  toggleTTSStudio,
}: RenderStepContentParams) => {
  const {
    transcriptSelectionMode,
    setTranscriptSelectionMode,
    clientSelection,
    conseillerSelection,
  } = useCallData();

  // ✅ Calculer le texte retravaillé
  const improvedConseillerText = hasImprovedContent(postits)
    ? generateFinalConseillerText(postits)
    : null;

  // Debug logs
  useEffect(() => {
    console.log("📊 Debug renderStepContent - Step:", activeStep);
    console.log("- postits:", postits);
    console.log("- improvedConseillerText:", improvedConseillerText);
  }, [activeStep, postits, improvedConseillerText]);

  // Rendu de l'étape 0: Sélection du contexte (INCHANGÉ)
  const renderStep0 = () => (
    <>
      <ClientResponseSection
        selectionMode={selectionMode}
        onSelectionModeChange={setSelectionMode}
        selectedClientText={selectedClientText}
        selectedConseillerText={selectedConseillerText}
        fontSize={fontSize}
        zoneColors={zoneColors}
        hasOriginalPostits={hasOriginalPostits}
        onCategorizeClick={(text) => {
          setTextToCategorizze(text);
          setShowCategoryDialog(true);
        }}
        setSelectedClientText={setSelectedClientText}
        setSelectedConseillerText={setSelectedConseillerText}
      />
    </>
  );

  // Rendu de l'étape 1: Jeu de rôle (INCHANGÉ)
  const renderStep1 = () => (
    <>
      <Box sx={{ mb: 1 }}>
        <Paper
          elevation={1}
          sx={{
            p: 1,
            bgcolor: "background.paper",
            borderRadius: 1,
            mb: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Le client dit:</strong> {selectedClientText}
              </Typography>
              {selectedClientText && audioSrc && (
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => {
                    console.log("clientSelection:", clientSelection);
                    if (clientSelection && clientSelection.startTime) {
                      console.log("Seeking to:", clientSelection.startTime);
                      seekTo(clientSelection.startTime);
                    } else {
                      console.log("No startTime available, seeking to 0");
                      seekTo(0);
                    }
                    play();
                  }}
                  title="Écouter le passage"
                >
                  <PlayArrow fontSize="small" />
                </IconButton>
              )}
            </Box>

            {/* Bouton pour déclencher l'enregistrement vocal */}
            <IconButton
              color="primary"
              onClick={toggleSpeechToText}
              sx={{
                ml: 1,
                bgcolor: speechToTextVisible
                  ? "rgba(25, 118, 210, 0.1)"
                  : "transparent",
                "&:hover": {
                  bgcolor: "rgba(25, 118, 210, 0.2)",
                },
              }}
              title="Enregistrer la réponse du conseiller"
            >
              <MicIcon />
            </IconButton>
          </Box>

          {/* Composant de reconnaissance vocale contextuel */}
          {speechToTextVisible && (
            <Box
              sx={{
                mt: 1,
                p: 1,
                bgcolor: "rgba(0,0,0,0.03)",
                borderRadius: 1,
              }}
            >
              <Typography variant="caption" sx={{ display: "block", mb: 1 }}>
                Enregistrez votre réponse en tant que conseiller:
              </Typography>
              <DynamicSpeechToTextForFourZones
                onAddPostits={addPostitsFromSpeech}
                isContextual={true}
              />
            </Box>
          )}
        </Paper>
      </Box>

      <ZoneLegend />
      {renderDropZones()}
    </>
  );

  // Rendu de l'étape 2: Suggestions d'amélioration AVEC TTS
  const renderStep2 = () => (
    <>
      {/* Section client qui reste visible */}
      <Paper
        elevation={3}
        sx={{
          p: 2,
          bgcolor: zoneColors[ZONES.CLIENT],
          minHeight: "60px",
          mb: 3,
        }}
      >
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          Situation: Le client dit
        </Typography>
        <Typography fontSize={fontSize} fontWeight="bold">
          {selectedClientText}
        </Typography>
      </Paper>

      {/* Barre d'outils avec bouton TTS */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 0.5, // ⭐ RÉDUIT de 2 à 0.5
          p: 0.75, // ⭐ RÉDUIT de 2 à 0.75
          backgroundColor: "background.paper",
          borderRadius: 1,
          boxShadow: 1,
          minHeight: "36px", // ⭐ HAUTEUR FIXE MINIMALE
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: "bold",
            fontSize: "0.8rem",
          }}
        >
          Améliorez vos réponses • IA disponible
        </Typography>

        {toggleTTSStudio && (
          <Button
            variant={ttsStudioVisible ? "contained" : "outlined"}
            startIcon={<RecordVoiceOver sx={{ fontSize: 16 }} />}
            onClick={toggleTTSStudio}
            size="small"
            sx={{ fontSize: "0.75rem", py: 0.25 }}
          >
            TTS
          </Button>
        )}
      </Box>

      <ZoneLegend />

      {/* Zones d'amélioration avec hauteur adaptative */}
      <Box
        sx={{
          // Ajuster la hauteur si TTS Studio visible
          maxHeight: ttsStudioVisible ? "50vh" : "none",
          overflow: ttsStudioVisible ? "auto" : "visible",
        }}
      >
        {renderDropZones(true)}
      </Box>
    </>
  );

  // Rendu de l'étape 3: Lecture finale (INCHANGÉ)
  const renderStep3 = () => {
    console.log("🎙️ Rendu FinalReviewStep avec:");
    console.log("- selectedConseillerText:", selectedConseillerText);
    console.log("- improvedConseillerText:", improvedConseillerText);

    return (
      <FinalReviewStep
        mode={mode}
        selectedClientText={selectedClientText}
        selectedConseillerText={selectedConseillerText}
        improvedConseillerText={improvedConseillerText}
      />
    );
  };

  // Sélectionner le rendu en fonction de l'étape active
  switch (activeStep) {
    case 0:
      return renderStep0();
    case 1:
      return renderStep1();
    case 2:
      return renderStep2();
    case 3:
      return renderStep3();
    default:
      return <Typography>Étape inconnue</Typography>;
  }
};
