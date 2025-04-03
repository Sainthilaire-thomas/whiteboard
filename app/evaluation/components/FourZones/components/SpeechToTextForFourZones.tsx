"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Box,
  Typography,
  Paper,
  IconButton,
  Divider,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  AlertColor,
} from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";

// Import des constantes pour les zones
import { ZONES } from "../constants/zone";
import { generateId, getZoneColors } from "../utils/postitUtils";
import { useThemeMode } from "@/app/components/common/Theme/ThemeProvider";
import { PostitType } from "../types/types";

// Type pour les sélections de texte
interface TextSelection {
  id: string;
  text: string;
  zone: string | null;
}

// Type pour les props du composant
interface SpeechToTextForFourZonesProps {
  onAddPostits: (postits: PostitType[]) => void;
}

const SpeechToTextForFourZones: React.FC<SpeechToTextForFourZonesProps> = ({
  onAddPostits,
}) => {
  const { mode } = useThemeMode();

  // États pour gérer l'enregistrement et la transcription
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcription, setTranscription] = useState<string>("");
  const [selections, setSelections] = useState<TextSelection[]>([]);
  const [currentZone, setCurrentZone] = useState<string>(ZONES.JE_FAIS);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // État pour les notifications
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>("info");

  // Références pour l'enregistrement audio
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Ajout d'une référence pour suivre si une sélection est en cours
  const selectionInProgressRef = useRef<boolean>(false);

  // Obtenir les couleurs des zones en fonction du thème
  const zoneColors = getZoneColors(mode);

  // Titres des zones pour l'affichage
  const zoneTitles: Record<string, string> = {
    [ZONES.JE_FAIS]: "Ce que je fais",
    [ZONES.VOUS_AVEZ_FAIT]: "Ce qu'a fait le client",
    [ZONES.ENTREPRISE_FAIT]: "Ce que fait l'entreprise",
    [ZONES.VOUS_FEREZ]: "Ce que fera le client",
  };

  // État pour la taille de police
  const [fontSize, setFontSize] = useState<number>(14);

  // Vérifier la compatibilité de l'API MediaRecorder
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!navigator.mediaDevices || !window.MediaRecorder) {
      showNotification(
        "Votre navigateur ne supporte pas l'enregistrement audio. Veuillez utiliser Chrome, Firefox ou Edge récent.",
        "error"
      );
    }
  }, []);

  // Afficher une notification
  const showNotification = (message: string, severity: AlertColor) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Démarrer/arrêter l'enregistrement
  const toggleRecording = async () => {
    if (isRecording) {
      // Arrêter l'enregistrement
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      showNotification("Traitement de l'enregistrement...", "info");
    } else {
      try {
        // Demander la permission d'accès au microphone
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        // Créer un nouveau MediaRecorder
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: "audio/webm", // Format compatible avec l'API Whisper
        });

        // Réinitialiser les chunks audio
        audioChunksRef.current = [];

        // Configurer les événements du MediaRecorder
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          // Libérer les pistes audio pour arrêter le microphone
          stream.getTracks().forEach((track) => track.stop());

          // Créer un blob à partir des chunks audio
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/webm",
          });

          // Envoyer l'audio à l'API pour transcription
          await sendAudioForTranscription(audioBlob);
        };

        // Démarrer l'enregistrement
        mediaRecorder.start(1000); // Collecter des chunks toutes les secondes
        mediaRecorderRef.current = mediaRecorder;
        setIsRecording(true);
        showNotification("Enregistrement démarré", "success");
      } catch (error) {
        console.error("Erreur lors de l'accès au microphone:", error);
        showNotification(
          "Impossible d'accéder au microphone. Veuillez vérifier les permissions.",
          "error"
        );
      }
    }
  };

  // Envoyer l'audio au serveur pour transcription via Whisper
  const sendAudioForTranscription = async (audioBlob: Blob) => {
    try {
      setIsProcessing(true);

      // Créer un FormData pour envoyer le fichier audio
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      // Envoyer au point d'API Next.js
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la transcription");
      }

      // Ajouter la transcription reçue
      setTranscription((prev) => {
        const newTranscription = prev
          ? `${prev} ${data.transcription}`
          : data.transcription;
        return newTranscription;
      });

      showNotification("Transcription terminée avec succès", "success");
    } catch (error) {
      console.error("Erreur de transcription:", error);
      showNotification(
        `Erreur lors de la transcription: ${
          error instanceof Error ? error.message : "Erreur inconnue"
        }`,
        "error"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Capturer la sélection de texte - version corrigée
  const handleTextSelection = () => {
    const selection = window.getSelection();

    if (selection && selection.toString().trim().length > 0) {
      const selectedText = selection.toString().trim();

      // Vérifier si cette sélection existe déjà pour éviter les doublons
      const selectionExists = selections.some(
        (existingSelection) => existingSelection.text === selectedText
      );

      if (!selectionExists) {
        // Ajouter la sélection à la liste seulement si elle n'existe pas
        setSelections([
          ...selections,
          {
            id: generateId(),
            text: selectedText,
            zone: null,
          },
        ]);

        // Effacer la sélection pour éviter les sélections accidentelles
        if (selection.removeAllRanges) {
          selection.removeAllRanges();
        }
      }
    }
  };

  // Assigner une sélection à une zone
  const assignToZone = (selectionId: string, zone: string) => {
    // Mettre à jour la sélection avec la zone
    setSelections(
      selections.map((selection) =>
        selection.id === selectionId ? { ...selection, zone } : selection
      )
    );

    showNotification(`Texte assigné à "${zoneTitles[zone]}"`, "success");
  };

  // Fonction pour effacer tout
  const clearAll = () => {
    setTranscription("");
    setSelections([]);
    showNotification("Transcription et sélections effacées", "info");
  };

  // Supprimer une sélection
  const deleteSelection = (id: string) => {
    setSelections(selections.filter((selection) => selection.id !== id));
  };

  // Convertir les sélections en post-its et les envoyer au composant parent
  const convertSelectionsToPostits = () => {
    // Filtrer les sélections qui ont une zone assignée
    const assignedSelections = selections.filter(
      (selection): selection is TextSelection & { zone: string } =>
        selection.zone !== null
    );

    if (assignedSelections.length === 0) {
      showNotification(
        "Aucune sélection avec zone assignée à convertir",
        "warning"
      );
      return;
    }

    // Convertir les sélections en format de post-its
    const newPostits: PostitType[] = assignedSelections.map((selection) => ({
      id: generateId(),
      content: selection.text,
      zone: selection.zone,
      color: zoneColors[selection.zone],
      isOriginal: true,
    }));

    // Appeler la fonction callback avec les nouveaux post-its
    onAddPostits(newPostits);
    showNotification(`${newPostits.length} post-its ajoutés`, "success");

    // Supprimer les sélections converties
    setSelections(selections.filter((selection) => !selection.zone));
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2 }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Assistant de saisie vocale (Whisper API)
      </Typography>

      {/* Section d'enregistrement */}
      <Paper elevation={2} sx={{ p: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="subtitle1">Enregistrer votre réponse</Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant={isRecording ? "contained" : "outlined"}
              color={isRecording ? "error" : "primary"}
              startIcon={isRecording ? <StopIcon /> : <MicIcon />}
              onClick={toggleRecording}
              disabled={isProcessing}
            >
              {isRecording ? "Arrêter" : "Démarrer"}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={clearAll}
              disabled={isProcessing || isRecording}
            >
              Effacer
            </Button>
          </Box>
        </Box>

        {/* Zone de transcription - utiliser uniquement onMouseUp pour la sélection */}
        <Paper
          elevation={1}
          sx={{
            p: 2,
            minHeight: "150px",
            maxHeight: "250px",
            overflow: "auto",
            bgcolor: mode === "dark" ? "background.default" : "#f5f5f5",
            cursor: "text",
            position: "relative",
          }}
          onMouseUp={handleTextSelection} // Garder uniquement cet événement, pas onClick
        >
          {isProcessing && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255, 255, 255, 0.7)",
                zIndex: 1,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <CircularProgress size={40} />
                <Typography sx={{ mt: 2 }}>
                  Transcription en cours...
                </Typography>
              </Box>
            </Box>
          )}

          {transcription ? (
            <Typography
              sx={{ whiteSpace: "pre-wrap", fontSize: `${fontSize}px` }}
            >
              {transcription}
            </Typography>
          ) : (
            <Typography color="text.secondary" sx={{ fontStyle: "italic" }}>
              La transcription de votre parole apparaîtra ici. Cliquez sur
              "Démarrer" pour commencer l'enregistrement.
            </Typography>
          )}
        </Paper>
      </Paper>

      {/* Guide des zones */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
        <Typography variant="body2" fontWeight="medium">
          Zones:
        </Typography>
        <CheckCircleIcon sx={{ color: "#27ae60", fontSize: "small" }} />
        <Typography variant="body2" sx={{ color: "#27ae60" }}>
          Vertes à privilégier
        </Typography>
        <WarningIcon sx={{ color: "#c0392b", fontSize: "small", ml: 1 }} />
        <Typography variant="body2" sx={{ color: "#c0392b" }}>
          Rouge à limiter
        </Typography>
      </Box>

      {/* Sélections de texte */}
      {selections.length > 0 && (
        <Paper elevation={2} sx={{ p: 2, mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Textes sélectionnés
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {selections.map((selection) => (
              <Box
                key={selection.id}
                sx={{
                  p: 1,
                  border: "1px solid #e0e0e0",
                  borderRadius: 1,
                  bgcolor: selection.zone
                    ? `${zoneColors[selection.zone]}80` // Ajout d'une transparence pour meilleure lisibilité
                    : mode === "dark"
                    ? "background.paper"
                    : "white",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                <Typography
                  sx={{
                    fontSize: `${fontSize}px`,
                    color: mode === "dark" ? "white" : "black", // S'assurer que le texte est visible en mode sombre
                  }}
                >
                  "{selection.text}"
                </Typography>

                {selection.zone ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Chip
                      label={zoneTitles[selection.zone]}
                      size="small"
                      color={
                        selection.zone === ZONES.ENTREPRISE_FAIT
                          ? "error"
                          : "success"
                      }
                    />
                    <IconButton
                      size="small"
                      onClick={() => deleteSelection(selection.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {Object.entries(ZONES).map(([key, value]) => (
                      <Chip
                        key={key}
                        label={zoneTitles[value]}
                        onClick={() => assignToZone(selection.id, value)}
                        color={
                          value === ZONES.ENTREPRISE_FAIT ? "error" : "success"
                        }
                        size="small"
                        sx={{ cursor: "pointer" }}
                      />
                    ))}
                    <IconButton
                      size="small"
                      onClick={() => deleteSelection(selection.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Box>
            ))}
          </Box>

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={convertSelectionsToPostits}
            sx={{ mt: 2 }}
            disabled={!selections.some((s) => s.zone)}
            fullWidth
          >
            Ajouter les textes aux zones
          </Button>
        </Paper>
      )}

      {/* Notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SpeechToTextForFourZones;
