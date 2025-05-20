"use client";

import React, { useEffect, useState } from "react";
import { useCallData } from "@/context/CallDataContext";
import {
  Container,
  Typography,
  Box,
  Button,
  IconButton,
  Breadcrumbs,
  Link,
  Toolbar,
  AppBar,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Chip,
  Paper,
  Grid,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Home as HomeIcon,
  CloudSync as SyncIcon,
  Logout as LogoutIcon,
  AudioFile as AudioFileIcon,
  Description as DescriptionIcon,
  Folder as FolderIcon,
  CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";

import { ZohoAuthToken, ZohoFile } from "../types/zoho";
import { clientGetFiles } from "../lib/zohoworkdrive/api";
import { getToken, saveToken, isTokenExpired } from "../utils/storage";
import { supabaseClient } from "@/lib/supabaseClient";
import FileList from "./FileList";

// ID du dossier racine de votre Workdrive
const ROOT_FOLDER_ID = "ly5m40e0e2d4ae7604a1fa0f5d42905cb94c9";

interface WorkdriveExplorerProps {
  initialToken?: ZohoAuthToken | null;
  entrepriseId: number | null;
}

export default function WorkdriveExplorer({
  initialToken,
  entrepriseId,
}: WorkdriveExplorerProps) {
  const [token, setToken] = useState<ZohoAuthToken | null>(null);
  const [files, setFiles] = useState<ZohoFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFolder, setCurrentFolder] = useState<string>(ROOT_FOLDER_ID);
  const [folderHistory, setFolderHistory] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<{ id: string; name: string }[]>([
    { id: ROOT_FOLDER_ID, name: "Racine" },
  ]);

  // États pour la sélection d'appel et transcription
  const [selectedAudioFile, setSelectedAudioFile] = useState<ZohoFile | null>(
    null
  );
  const [selectedTranscriptionFile, setSelectedTranscriptionFile] =
    useState<ZohoFile | null>(null);
  const [callName, setCallName] = useState<string>("");
  const [callDescription, setCallDescription] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Utilisation du contexte CallData
  const { fetchCalls } = useCallData();

  // Initialiser le token
  useEffect(() => {
    const storedToken = getToken();

    if (initialToken) {
      console.log("Using initial token");
      saveToken(initialToken);
      setToken(initialToken);
    } else if (storedToken) {
      console.log("Using stored token");
      // Vérifiez si le token est expiré
      if (isTokenExpired(storedToken)) {
        console.log("Token expiré, redirection vers authentification");
        setToken(null);
        setError("Le token est expiré, veuillez vous authentifier à nouveau");
        localStorage.removeItem("zohoToken"); // Supprimer le token expiré
      } else {
        setToken(storedToken);
      }
    } else {
      console.log("Aucun token trouvé");
      setLoading(false);
      setError("Veuillez vous authentifier pour accéder à Zoho WorkDrive");
    }
  }, [initialToken]);

  // Charger les fichiers quand le token ou le dossier change
  useEffect(() => {
    const loadFiles = async () => {
      if (!token) return;

      try {
        setLoading(true);
        setError(null);

        const response = await clientGetFiles(token, currentFolder);
        setFiles(response.data);
      } catch (error) {
        console.error("Error loading files:", error);
        setError(
          `Erreur lors du chargement des fichiers: ${
            error instanceof Error ? error.message : "Erreur inconnue"
          }`
        );
      } finally {
        setLoading(false);
      }
    };

    loadFiles();
  }, [token, currentFolder]);

  // Gestionnaire pour naviguer vers un dossier
  const handleFolderClick = (folderId: string, folderName?: string) => {
    setFolderHistory((prev) => [...prev, currentFolder]);
    setCurrentFolder(folderId);

    // Mise à jour du chemin du dossier
    setFolderPath((prev) => [
      ...prev,
      { id: folderId, name: folderName || "Nouveau dossier" },
    ]);
  };

  // Gestionnaire pour revenir au dossier précédent
  const handleBack = () => {
    if (folderHistory.length > 0) {
      const previousFolder = folderHistory[folderHistory.length - 1];
      setFolderHistory((prev) => prev.slice(0, -1));
      setCurrentFolder(previousFolder);

      // Mise à jour du chemin du dossier
      setFolderPath((prev) => prev.slice(0, -1));
    }
  };

  // Gestionnaire pour revenir au dossier racine
  const handleHome = () => {
    setFolderHistory([]);
    setCurrentFolder(ROOT_FOLDER_ID);
    setFolderPath([{ id: ROOT_FOLDER_ID, name: "Racine" }]);
  };

  // Rediriger vers la page d'authentification si aucun token n'est disponible
  const handleAuthenticate = () => {
    window.location.href = "/api/zoho/auth";
  };

  // Déconnexion
  const handleLogout = () => {
    localStorage.removeItem("zohoToken");
    setToken(null);
    setError("Déconnecté avec succès, veuillez vous authentifier");
  };

  // Fermer le message d'erreur
  const handleCloseError = () => {
    setError(null);
  };

  // Fermer le message de succès
  const handleCloseSuccess = () => {
    setSuccessMessage(null);
  };

  // Vérifier si un fichier est audio
  const isAudioFile = (file: ZohoFile) => {
    const mimeType = file.mimeType?.toLowerCase();
    const name = file.name.toLowerCase();
    return (
      mimeType?.includes("audio") ||
      name.endsWith(".mp3") ||
      name.endsWith(".wav") ||
      name.endsWith(".m4a") ||
      name.endsWith(".ogg")
    );
  };

  // Vérifier si un fichier peut être une transcription
  const isTranscriptionFile = (file: ZohoFile) => {
    const mimeType = file.mimeType?.toLowerCase();
    const name = file.name.toLowerCase();
    return (
      mimeType?.includes("text") ||
      mimeType?.includes("json") ||
      name.endsWith(".txt") ||
      name.endsWith(".json") ||
      name.endsWith(".doc") ||
      name.endsWith(".docx")
    );
  };

  // Gestionnaire pour sélectionner un fichier audio
  const handleSelectAudioFile = (file: ZohoFile) => {
    if (selectedAudioFile?.id === file.id) {
      setSelectedAudioFile(null);
    } else {
      setSelectedAudioFile(file);
      if (!callName) {
        setCallName(file.name);
      }
    }
  };

  // Gestionnaire pour sélectionner un fichier de transcription
  const handleSelectTranscriptionFile = (file: ZohoFile) => {
    if (selectedTranscriptionFile?.id === file.id) {
      setSelectedTranscriptionFile(null);
    } else {
      setSelectedTranscriptionFile(file);
    }
  };

  // Ouvrir la boîte de dialogue pour créer un nouvel appel
  const handleOpenCreateDialog = () => {
    if (!selectedAudioFile) {
      setError(
        "Veuillez sélectionner un fichier audio avant de créer un appel"
      );
      return;
    }
    setOpenDialog(true);
  };

  // Fermer la boîte de dialogue
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Soumettre l'appel
  // Version corrigée de handleSubmitCall
  const handleSubmitCall = async () => {
    if (!entrepriseId) {
      setError("Veuillez sélectionner une entreprise");
      return;
    }

    if (!selectedAudioFile) {
      setError("Veuillez sélectionner un fichier audio");
      return;
    }

    if (!callName.trim()) {
      setError("Veuillez donner un nom à l'appel");
      return;
    }

    try {
      setIsSubmitting(true);

      // Récupérer explicitement la session Supabase
      const {
        data: { session },
      } = await supabaseClient.auth.getSession();

      if (!session) {
        throw new Error(
          "Vous n'êtes pas connecté à Supabase. Veuillez vous reconnecter."
        );
      }

      // Construction des données à envoyer avec le token Supabase
      const callData = {
        entrepriseId,
        audioFileId: selectedAudioFile.id,
        audioFileName: selectedAudioFile.name,
        transcriptionFileId: selectedTranscriptionFile?.id || null,
        transcriptionFileName: selectedTranscriptionFile?.name || null,
        callName: callName,
        callDescription: callDescription,
        // Ajouter le token Supabase
        supabaseAuthToken: session.access_token,
      };

      // Fetch avec seulement le token Zoho (sans credentials:include)
      const response = await fetch("/api/calls/create-from-zoho", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token?.access_token}`,
        },
        body: JSON.stringify(callData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Erreur lors de la création de l'appel"
        );
      }

      const responseData = await response.json();
      console.log("Appel créé avec succès:", responseData);

      // Fermer le dialogue
      setOpenDialog(false);

      // Réinitialiser les valeurs après la création
      setSelectedAudioFile(null);
      setSelectedTranscriptionFile(null);
      setCallName("");
      setCallDescription("");

      // Afficher le message de succès
      setSuccessMessage("Appel créé avec succès");

      // Rafraîchir la liste des appels dans le contexte
      if (entrepriseId) {
        fetchCalls(entrepriseId);
      }
    } catch (error) {
      console.error("Erreur lors de la création de l'appel:", error);
      setError(
        `Erreur lors de la création de l'appel: ${
          error instanceof Error ? error.message : "Erreur inconnue"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gestionnaire de fichier amélioré pour remplacer FileList
  const renderFileItem = (file: ZohoFile) => {
    const isFolder = file.type === "folder";
    const isAudio = isAudioFile(file);
    const isTranscription = isTranscriptionFile(file);

    return (
      <Grid item xs={12} sm={6} md={4} key={file.id}>
        <Paper
          elevation={2}
          sx={{
            p: 2,
            display: "flex",
            flexDirection: "column",
            height: "100%",
            backgroundColor:
              selectedAudioFile?.id === file.id ||
              selectedTranscriptionFile?.id === file.id
                ? "rgba(0, 0, 255, 0.05)"
                : "whitegray",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            {isFolder ? (
              <FolderIcon color="primary" />
            ) : isAudio ? (
              <AudioFileIcon color="secondary" />
            ) : (
              <DescriptionIcon color="action" />
            )}
            <Typography
              variant="subtitle1"
              sx={{
                ml: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flexGrow: 1,
              }}
            >
              {file.name}
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }}></Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            {isFolder ? (
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleFolderClick(file.id, file.name)}
                fullWidth
              >
                Ouvrir
              </Button>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                {isAudio && (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedAudioFile?.id === file.id}
                        onChange={() => handleSelectAudioFile(file)}
                        color="secondary"
                      />
                    }
                    label="Audio"
                  />
                )}
                {isTranscription && (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedTranscriptionFile?.id === file.id}
                        onChange={() => handleSelectTranscriptionFile(file)}
                        color="primary"
                      />
                    }
                    label="Transcription"
                  />
                )}
              </Box>
            )}
          </Box>
        </Paper>
      </Grid>
    );
  };

  if (error && !token) {
    return (
      <Container maxWidth="xs" sx={{ mt: 10, textAlign: "center" }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAuthenticate}
        >
          Se connecter à Zoho WorkDrive
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="transparent" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Zoho WorkDrive Explorer
          </Typography>
          <Box>
            {(selectedAudioFile || selectedTranscriptionFile) && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<CloudUploadIcon />}
                onClick={handleOpenCreateDialog}
                sx={{ mr: 2 }}
              >
                Créer un appel
              </Button>
            )}
            <IconButton
              color="error"
              onClick={handleLogout}
              title="Déconnexion"
            >
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 2,
          }}
        >
          <IconButton
            color="primary"
            onClick={handleBack}
            disabled={folderHistory.length === 0}
            sx={{ mr: 1 }}
          >
            <BackIcon />
          </IconButton>
          <IconButton
            color="primary"
            onClick={handleHome}
            disabled={currentFolder === ROOT_FOLDER_ID}
          >
            <HomeIcon />
          </IconButton>

          <Breadcrumbs sx={{ ml: 2 }}>
            {folderPath.map((folder, index) => (
              <Link
                key={folder.id}
                color="inherit"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (index !== folderPath.length - 1) {
                    setCurrentFolder(folder.id);
                    setFolderPath((prev) => prev.slice(0, index + 1));
                    setFolderHistory((prev) => prev.slice(0, index));
                  }
                }}
                underline={index !== folderPath.length - 1 ? "hover" : "none"}
              >
                {folder.name}
              </Link>
            ))}
          </Breadcrumbs>
        </Box>

        {/* Informations de sélection */}
        {(selectedAudioFile || selectedTranscriptionFile) && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Fichiers sélectionnés:
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {selectedAudioFile && (
                <Chip
                  icon={<AudioFileIcon />}
                  label={`Audio: ${selectedAudioFile.name}`}
                  color="secondary"
                  onDelete={() => setSelectedAudioFile(null)}
                />
              )}
              {selectedTranscriptionFile && (
                <Chip
                  icon={<DescriptionIcon />}
                  label={`Transcription: ${selectedTranscriptionFile.name}`}
                  color="primary"
                  onDelete={() => setSelectedTranscriptionFile(null)}
                />
              )}
            </Box>
          </Paper>
        )}

        {/* Liste des fichiers avec grille */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {files.map(renderFileItem)}
            {files.length === 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, textAlign: "center" }}>
                  <Typography color="textSecondary">
                    Aucun fichier dans ce dossier
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        )}
      </Container>

      {/* Dialogue pour créer un appel */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Créer un nouvel appel</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Cet appel sera associé à l'entreprise sélectionnée.
          </DialogContentText>

          <TextField
            autoFocus
            margin="dense"
            label="Nom de l'appel"
            type="text"
            fullWidth
            variant="outlined"
            value={callName}
            onChange={(e) => setCallName(e.target.value)}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="Description (optionnelle)"
            type="text"
            fullWidth
            variant="outlined"
            value={callDescription}
            onChange={(e) => setCallDescription(e.target.value)}
            multiline
            rows={4}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Annuler
          </Button>
          <Button
            onClick={handleSubmitCall}
            color="primary"
            variant="contained"
            disabled={isSubmitting || !callName.trim()}
          >
            {isSubmitting ? <CircularProgress size={24} /> : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar pour les erreurs */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseError}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>

      {/* Snackbar pour les succès */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSuccess}
          severity="success"
          sx={{ width: "100%" }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
