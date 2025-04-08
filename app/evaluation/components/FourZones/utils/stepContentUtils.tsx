import React, { JSX, useEffect } from "react";
import { useCallData } from "@/context/CallDataContext";
import { Box, Typography, Paper, IconButton } from "@mui/material";
import { PlayArrow } from "@mui/icons-material";
import MicIcon from "@mui/icons-material/Mic";
import DynamicSpeechToTextForFourZones from "../components/DynamicSpeechToTextForFourZones";
import { ZoneLegend } from "../components/ZoneLegend";
import { ClientResponseSection } from "../components/ClientResponseSection";
import { FinalReviewStep } from "../components/FinalReviewStep";
import { PostitType } from "../types/types";
import { ZONES } from "../constants/zone";

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
  renderDropZones: () => JSX.Element;
  addSelectedTextAsPostit: (zone: string) => void;
  mode: string;
  handleOpenZoneMenu?: (
    event: React.MouseEvent<HTMLElement>,
    zone: string
  ) => void;
  postits: PostitType[];
  setPostits: (postits: PostitType[]) => void;
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
}: RenderStepContentParams) => {
  const {
    transcriptSelectionMode,
    setTranscriptSelectionMode,
    clientSelection,
    conseillerSelection,
  } = useCallData();

  // Dans renderStepContent.tsx
  useEffect(() => {
    console.log("Current clientSelection:", clientSelection);
  }, [clientSelection]);

  // Rendu de l'étape 1: Sélection du contexte
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

  // Rendu de l'étape 2: Jeu de rôle
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

  // Rendu de l'étape 3: Suggestions d'amélioration
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

      {/* Guide d'amélioration */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Améliorez les éléments de votre réponse:
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Dans cette étape, vous pouvez améliorer directement le contenu de
          chaque zone. Cliquez sur les éléments pour les modifier ou utilisez
          l'IA pour les optimiser.
        </Typography>
      </Box>

      <ZoneLegend />

      {/* Utiliser les zones de drop avec le mode amélioration activé */}
      {renderDropZones(true)}
    </>
  );

  // Rendu de l'étape 4: Lecture finale
  const renderStep3 = () => (
    <FinalReviewStep
      mode={mode}
      selectedClientText={selectedClientText}
      selectedConseillerText={selectedConseillerText}
    />
  );

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
