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
  AlertColor,
} from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";

// Import des constantes et utilitaires de l'application existante
const ZONES = {
  JE_FAIS: "JE_FAIS",
  VOUS_AVEZ_FAIT: "VOUS_AVEZ_FAIT",
  ENTREPRISE_FAIT: "ENTREPRISE_FAIT",
  VOUS_FEREZ: "VOUS_FEREZ",
};

// Fonction pour générer un ID unique (reprise de votre utilitaire)
const generateId = () =>
  `postit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

// Définition des couleurs des zones selon le thème clair
const zoneColors = {
  [ZONES.JE_FAIS]: "#aed581", // Vert clair
  [ZONES.VOUS_AVEZ_FAIT]: "#81c784", // Vert moyen
  [ZONES.ENTREPRISE_FAIT]: "#ef9a9a", // Rouge clair
  [ZONES.VOUS_FEREZ]: "#a5d6a7", // Vert pâle
};

// Titres des zones pour l'affichage
const zoneTitles = {
  [ZONES.JE_FAIS]: "Ce que je fais",
  [ZONES.VOUS_AVEZ_FAIT]: "Ce qu'a fait le client",
  [ZONES.ENTREPRISE_FAIT]: "Ce que fait l'entreprise",
  [ZONES.VOUS_FEREZ]: "Ce que fera le client",
};

const SpeechToTextForFourZones = ({ onAddPostits }) => {
  // États pour gérer l'enregistrement et la transcription
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [selections, setSelections] = useState([]);
  const [currentZone, setCurrentZone] = useState(ZONES.JE_FAIS);

  // État pour les notifications
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");

  // Référence pour le SpeechRecognition
  const recognitionRef = useRef(null);

  // État pour la taille de police
  const [fontSize, setFontSize] = useState(14);

  // Configuration de la reconnaissance vocale
  useEffect(() => {
    // Vérifier si la reconnaissance vocale est supportée par le navigateur
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      showNotification(
        "La reconnaissance vocale n'est pas supportée par votre navigateur. Essayez Chrome ou Edge.",
        "error"
      );
      return;
    }

    // Initialiser la reconnaissance vocale
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();

    // Configuration
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "fr-FR"; // Langue française par défaut

    // Gérer les résultats de la reconnaissance
    recognitionRef.current.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = transcription;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += " " + transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscription(finalTranscript + interimTranscript);
    };

    // Gérer les erreurs
    recognitionRef.current.onerror = (event) => {
      console.error("Erreur de reconnaissance vocale:", event.error);
      showNotification(
        `Erreur de reconnaissance vocale: ${event.error}`,
        "error"
      );
    };

    return () => {
      // Nettoyage
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [transcription]);

  // Afficher une notification
  const showNotification = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Démarrer/arrêter l'enregistrement
  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current.stop();
      showNotification("Enregistrement arrêté", "info");
    } else {
      recognitionRef.current.start();
      showNotification("Enregistrement démarré", "success");
    }
    setIsRecording(!isRecording);
  };

  // Capturer la sélection de texte
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const selectedText = selection.toString().trim();

      // Ajouter la sélection à la liste
      setSelections([
        ...selections,
        {
          id: generateId(),
          text: selectedText,
          zone: null,
        },
      ]);
    }
  };

  // Assigner une sélection à une zone
  const assignToZone = (selectionId, zone) => {
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
  const deleteSelection = (id) => {
    setSelections(selections.filter((selection) => selection.id !== id));
  };

  // Convertir les sélections en post-its et les envoyer au composant parent
  const convertSelectionsToPostits = () => {
    // Filtrer les sélections qui ont une zone assignée
    const assignedSelections = selections.filter((selection) => selection.zone);

    if (assignedSelections.length === 0) {
      showNotification(
        "Aucune sélection avec zone assignée à convertir",
        "warning"
      );
      return;
    }

    // Convertir les sélections en format de post-its
    const newPostits = assignedSelections.map((selection) => ({
      id: generateId(),
      content: selection.text,
      zone: selection.zone,
      color: zoneColors[selection.zone],
      isOriginal: true,
    }));

    // Appeler la fonction callback avec les nouveaux post-its
    if (typeof onAddPostits === "function") {
      onAddPostits(newPostits);
      showNotification(`${newPostits.length} post-its ajoutés`, "success");

      // Supprimer les sélections converties
      setSelections(selections.filter((selection) => !selection.zone));
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2 }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Assistant de saisie vocale
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
            >
              {isRecording ? "Arrêter" : "Démarrer"}
            </Button>
            <Button variant="outlined" color="secondary" onClick={clearAll}>
              Effacer
            </Button>
          </Box>
        </Box>

        {/* Zone de transcription */}
        <Paper
          elevation={1}
          sx={{
            p: 2,
            minHeight: "150px",
            maxHeight: "250px",
            overflow: "auto",
            bgcolor: "#f5f5f5",
            cursor: "text",
          }}
          onClick={handleTextSelection}
          onMouseUp={handleTextSelection}
        >
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
                    ? zoneColors[selection.zone]
                    : "white",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                <Typography sx={{ fontSize: `${fontSize}px` }}>
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
