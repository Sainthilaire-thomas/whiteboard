// app/evaluation/components/ShareEvaluationButton/ShareEvaluationButton.tsx
// Version avec gestion de l'état d'initialisation pour la récupération automatique

import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Typography,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Share as ShareIcon,
  Stop as StopIcon,
  Group as GroupIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { useEvaluationSharing } from "./useEvaluationSharing";
import { useEvaluationSharingState } from "@/context/SharedEvaluationContext";
import type { ShareEvaluationButtonProps, ShareModalProps } from "./types";

// Composant Dialog de conflit amélioré avec Context (inchangé)
const ConflictDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  conflictingSessionName?: string | null;
  activeSessionCallId?: number | null;
}> = ({
  open,
  onClose,
  onConfirm,
  isLoading,
  conflictingSessionName,
  activeSessionCallId,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={isLoading}
      aria-labelledby="conflict-dialog-title"
    >
      <DialogTitle id="conflict-dialog-title">
        <Box display="flex" alignItems="center" gap={1}>
          <WarningIcon color="warning" />
          <Typography variant="h6">Session déjà active</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body1" gutterBottom>
            <strong>Une session est déjà active :</strong>
          </Typography>
          <Typography variant="body2" sx={{ ml: 2 }}>
            • Session : "{conflictingSessionName}"
          </Typography>
          <Typography variant="body2" sx={{ ml: 2 }}>
            • Appel : #{activeSessionCallId}
          </Typography>
        </Alert>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Vous ne pouvez avoir qu'une seule session de partage active à la fois.
        </Typography>

        <Box sx={{ p: 2, bgcolor: "action.hover", borderRadius: 1 }}>
          <Typography variant="body2">
            <strong>Actions possibles :</strong>
          </Typography>
          <Typography variant="body2" component="ul" sx={{ mt: 1, pl: 2 }}>
            <li>Arrêter la session actuelle et créer une nouvelle</li>
            <li>Aller à la session active depuis le whiteboard</li>
            <li>Annuler et continuer avec la session actuelle</li>
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isLoading} color="inherit">
          Annuler
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isLoading}
          color="warning"
          variant="contained"
          startIcon={isLoading ? <CircularProgress size={16} /> : <StopIcon />}
        >
          {isLoading ? "Arrêt en cours..." : "Arrêter et remplacer"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Composant Modal de partage (inchangé)
const ShareModal: React.FC<ShareModalProps> = ({
  open,
  onClose,
  onConfirm,
  isLoading,
}) => {
  const [sessionName, setSessionName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionName.trim()) {
      onConfirm(sessionName.trim());
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setSessionName("");
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={isLoading}
      aria-labelledby="share-dialog-title"
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle id="share-dialog-title">
          <Box display="flex" alignItems="center" gap={1}>
            <GroupIcon color="primary" />
            <Typography variant="h6">Partager l'évaluation</Typography>
          </Box>
        </DialogTitle>

        <DialogContent>
          <TextField
            autoFocus
            margin="normal"
            label="Nom de la session"
            placeholder="ex: Analyse appel client - Session 1"
            fullWidth
            variant="outlined"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            required
            sx={{ mb: 2 }}
          />

          <Alert severity="info" sx={{ mt: 1 }}>
            Les participants pourront voir la transcription et toper les
            passages intéressants en temps réel.
          </Alert>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={isLoading} color="inherit">
            Annuler
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading || !sessionName.trim()}
            startIcon={
              isLoading ? <CircularProgress size={16} /> : <ShareIcon />
            }
          >
            {isLoading ? "Création..." : "Démarrer le partage"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

// Composant principal intégré avec récupération automatique
export const ShareEvaluationButton: React.FC<ShareEvaluationButtonProps> = ({
  callId,
  sx = {},
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [pendingSessionName, setPendingSessionName] = useState<string>("");

  // ✅ Hook existant avec récupération automatique
  const {
    isSharing,
    isLoading,
    error,
    currentSession,
    startSharing,
    stopSharing,
    checkActiveSessionsForCoach, // ✅ NOUVEAU : Fonction de récupération exposée
  } = useEvaluationSharing(callId);

  // ✅ Hook Context pour détection conflits et sync
  const {
    hasConflictingSession,
    conflictingSessionName,
    activeSessionCallId,
    syncSessionCreated,
    syncSessionStopped,
  } = useEvaluationSharingState();

  // Debug logging
  console.log("🔍 ShareEvaluationButton state:", {
    callId,
    isSharing,
    hasConflictingSession,
    conflictingSessionName,
    activeSessionCallId,
    hasCurrentSession: !!currentSession,
  });

  // ✅ handleStartSharing avec sync Context (inchangé)
  const handleStartSharing = async (sessionName: string) => {
    try {
      console.log("🚀 Démarrage partage avec sync Context:", {
        sessionName,
        callId,
      });

      // Utiliser le hook existant pour créer la session
      await startSharing(sessionName);

      // La synchronisation avec le Context est déjà gérée dans useEvaluationSharing
      setShowModal(false);
      setPendingSessionName("");
    } catch (err: any) {
      console.error("❌ Erreur création session:", err);

      // Gestion des conflits (logique existante)
      if (
        err.message?.includes("session de partage est déjà active") ||
        err.message?.includes("409") ||
        err.message?.includes("Conflict")
      ) {
        console.log("🔍 Conflit détecté, affichage du dialog");
        setPendingSessionName(sessionName);
        setShowConflictDialog(true);
        setShowModal(false);
      }
    }
  };

  // ✅ handleStopSharing avec sync Context (inchangé)
  const handleStopSharing = async () => {
    if (
      confirm(
        "Êtes-vous sûr de vouloir arrêter le partage ? Les participants ne pourront plus suivre l'évaluation."
      )
    ) {
      try {
        console.log("🛑 Arrêt partage avec sync Context");

        await stopSharing();

        // La synchronisation avec le Context est déjà gérée dans useEvaluationSharing
      } catch (err) {
        console.error("❌ Erreur arrêt session:", err);
      }
    }
  };

  // Gestion remplacement session en conflit
  const handleReplaceSession = async () => {
    try {
      console.log("🔄 Remplacement session en conflit");

      // D'abord arrêter (le hook existant gère l'arrêt de toute session active)
      await stopSharing();

      // Puis créer la nouvelle session
      if (pendingSessionName) {
        await handleStartSharing(pendingSessionName);
      }

      setShowConflictDialog(false);
      setPendingSessionName("");
    } catch (err: any) {
      console.error("❌ Erreur lors du remplacement:", err);
    }
  };

  const handleCloseConflictDialog = () => {
    setShowConflictDialog(false);
    setPendingSessionName("");
  };

  // ✅ NOUVEAU : État de chargement initial pour la récupération automatique
  const isInitializing = isLoading && !currentSession && !error;

  // ✅ NOUVEAU : Affichage de l'état d'initialisation
  if (isInitializing) {
    return (
      <Box display="flex" alignItems="center" gap={1} sx={sx}>
        <CircularProgress size={16} />
        <Typography variant="body2" color="text.secondary">
          Vérification des sessions actives...
        </Typography>
      </Box>
    );
  }

  // ✅ Affichage de conflit si session active sur autre appel
  if (hasConflictingSession && !isSharing) {
    return (
      <Box sx={sx}>
        <Alert severity="warning" sx={{ mb: 1 }}>
          <Typography variant="body2">
            <strong>Session active :</strong> "{conflictingSessionName}" sur
            Appel #{activeSessionCallId}
          </Typography>
        </Alert>
        <Button
          onClick={() => setShowModal(true)}
          variant="outlined"
          color="warning"
          startIcon={<ShareIcon />}
          size="small"
          disabled={isLoading}
        >
          Arrêter et partager cet appel
        </Button>
      </Box>
    );
  }

  // État "Partage actif" (inchangé)
  if (isSharing) {
    return (
      <Box display="flex" alignItems="center" gap={1} sx={sx}>
        <Chip
          icon={
            <Box
              component="div"
              sx={{
                width: 8,
                height: 8,
                bgcolor: "success.main",
                borderRadius: "50%",
                animation: "pulse 2s infinite",
                "@keyframes pulse": {
                  "0%, 100%": { opacity: 1 },
                  "50%": { opacity: 0.5 },
                },
              }}
            />
          }
          label={`Partage actif: ${currentSession?.session_name || "Session"}`}
          color="success"
          variant="outlined"
          size="small"
        />
        <IconButton
          onClick={handleStopSharing}
          disabled={isLoading}
          color="error"
          size="small"
          title="Arrêter le partage"
        >
          <StopIcon />
        </IconButton>
      </Box>
    );
  }

  // État "Prêt à partager" (amélioré)
  return (
    <Box sx={{ position: "relative", ...sx }}>
      <Button
        onClick={() => setShowModal(true)}
        disabled={isLoading || !callId} // ✅ NOUVEAU : Désactiver si pas de callId
        variant="outlined"
        startIcon={<ShareIcon />}
        size="small"
        title={
          !callId
            ? "Sélectionnez un appel pour partager"
            : "Partager l'évaluation avec les participants"
        }
      >
        Partager
      </Button>

      {/* Affichage d'erreur (inchangé) */}
      {error && (
        <Alert
          severity="error"
          sx={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            mt: 1,
            zIndex: 1000,
          }}
        >
          {error}
        </Alert>
      )}

      {/* Modal de création de session */}
      <ShareModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleStartSharing}
        isLoading={isLoading}
      />

      {/* Dialog de gestion des conflits */}
      <ConflictDialog
        open={showConflictDialog}
        onClose={handleCloseConflictDialog}
        onConfirm={handleReplaceSession}
        isLoading={isLoading}
        conflictingSessionName={conflictingSessionName}
        activeSessionCallId={activeSessionCallId}
      />
    </Box>
  );
};
