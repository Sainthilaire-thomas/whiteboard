import { useState } from "react";
import { AlertColor } from "@mui/material";

/**
 * Hook personnalisé pour gérer les notifications
 * @returns {Object} État et fonctions pour les notifications
 */
export const useNotifications = () => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");

  // Afficher une notification
  const showNotification = (message, severity = "info") => {
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
