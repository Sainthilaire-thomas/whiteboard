"use client";

import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Home as HomeIcon,
  CloudSync as SyncIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";

import { ZohoAuthToken, ZohoFile } from "../types/zoho";
import { clientGetFiles } from "../lib/zohoworkdrive/api";
import { getToken, saveToken, isTokenExpired } from "../utils/storage";
import FileList from "./FileList";

// ID du dossier racine de votre Workdrive
const ROOT_FOLDER_ID = "ly5m40e0e2d4ae7604a1fa0f5d42905cb94c9";

interface WorkdriveExplorerProps {
  initialToken?: ZohoAuthToken | null;
}

export default function WorkdriveExplorer({
  initialToken,
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

  // Tester l'API directement
  const handleTestAPI = () => {
    if (token) {
      const tokenParam = encodeURIComponent(JSON.stringify(token));
      window.open(`/api/zoho/test?token=${tokenParam}`, "_blank");
    }
  };

  // Fermer le message d'erreur
  const handleCloseError = () => {
    setError(null);
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
            <IconButton
              color="primary"
              onClick={handleTestAPI}
              title="Tester l'API"
            >
              <SyncIcon />
            </IconButton>
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

      <Container maxWidth="md" sx={{ mt: 2 }}>
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
                onClick={() => {
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

        <FileList
          files={files}
          loading={loading}
          onFolderClick={(folderId) => {
            const selectedFolder = files.find((f) => f.id === folderId);
            handleFolderClick(folderId, selectedFolder?.name);
          }}
        />
      </Container>

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
    </Box>
  );
}
