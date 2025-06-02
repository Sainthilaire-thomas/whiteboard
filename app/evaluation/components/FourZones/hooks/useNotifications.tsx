import { useState } from "react";
import { AlertColor } from "@mui/material";

// 🔧 CORRECTION: Import du type depuis le fichier types local
import { NotificationState } from "../types/types";

/**
 * Hook personnalisé pour gérer les notifications
 * @returns {NotificationState} État et fonctions pour les notifications
 */
export const useNotifications = (): NotificationState => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>("info");

  // 🔧 CORRECTION: Types explicites pour les paramètres (ligne 14)
  const showNotification = (message: string, severity: AlertColor = "info") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Fermer la notification
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return {
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
    showNotification,
    handleSnackbarClose,
  };
};
