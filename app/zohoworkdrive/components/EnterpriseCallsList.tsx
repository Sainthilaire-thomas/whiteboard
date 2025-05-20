"use client";

import React, { useState } from "react";
import { useCallData } from "@/context/CallDataContext";
import {
  Box,
  Typography,
  IconButton,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  Paper,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import AudioFileIcon from "@mui/icons-material/AudioFile";
import { removeCallUpload } from "../lib/removeCallUpload";

interface EnterpriseCallsListProps {
  entrepriseId: number | null;
}

export default function EnterpriseCallsList({
  entrepriseId,
}: EnterpriseCallsListProps) {
  const { calls, fetchCalls, isLoadingCalls, selectCall } = useCallData();
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    callId: null,
    filePath: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Gestionnaire pour sélectionner un appel
  const handleSelectCall = (callId) => {
    const call = calls.find((c) => c.callid === callId);
    if (call) {
      selectCall(call);
    }
  };

  // Gestionnaire pour supprimer un appel
  const handleDeleteCall = async () => {
    if (!confirmDelete.callId) return;

    try {
      setIsSubmitting(true);
      await removeCallUpload(confirmDelete.callId, confirmDelete.filePath);

      // Rafraîchir la liste des appels
      if (entrepriseId) {
        fetchCalls(entrepriseId);
      }

      setSuccessMessage("Appel supprimé avec succès");
    } catch (error) {
      setError(`Erreur lors de la suppression: ${error.message}`);
    } finally {
      setIsSubmitting(false);
      setConfirmDelete({ open: false, callId: null, filePath: null });
    }
  };

  // Fermer le message de succès
  const handleCloseSuccess = () => {
    setSuccessMessage(null);
  };

  // Fermer le message d'erreur
  const handleCloseError = () => {
    setError(null);
  };

  // Définir les colonnes de la grille
  const columns = [
    { field: "filename", headerName: "Nom", flex: 1 },
    { field: "description", headerName: "Description", flex: 2 },
    {
      field: "upload",
      headerName: "Audio",
      renderCell: (params) => (params.value ? "✓" : "✗"),
      width: 80,
    },
    {
      field: "preparedfortranscript",
      headerName: "Transcription",
      renderCell: (params) => (params.value ? "✓" : "✗"),
      width: 120,
    },
    {
      field: "action",
      headerName: "Actions",
      width: 120,
      renderCell: (params) => (
        <Box>
          <IconButton
            color="primary"
            onClick={() => handleSelectCall(params.row.callid)}
            title="Écouter"
          >
            <AudioFileIcon />
          </IconButton>
          <IconButton
            color="error"
            onClick={() =>
              setConfirmDelete({
                open: true,
                callId: params.row.callid,
                filePath: params.row.filepath,
              })
            }
            title="Supprimer"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Appels de l'entreprise
      </Typography>

      {isLoadingCalls ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      ) : calls && calls.length > 0 ? (
        <div style={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={calls}
            columns={columns}
            getRowId={(row) => row.callid}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 25]}
            disableSelectionOnClick
          />
        </div>
      ) : (
        <Typography color="textSecondary" sx={{ p: 2 }}>
          Aucun appel trouvé pour cette entreprise.
        </Typography>
      )}

      {/* Dialogue de confirmation de suppression */}
      <Dialog
        open={confirmDelete.open}
        onClose={() =>
          setConfirmDelete({ open: false, callId: null, filePath: null })
        }
      >
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer cet appel ? Cette action
            supprimera l'audio et la transcription associés.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setConfirmDelete({ open: false, callId: null, filePath: null })
            }
          >
            Annuler
          </Button>
          <Button
            onClick={handleDeleteCall}
            color="error"
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : "Supprimer"}
          </Button>
        </DialogActions>
      </Dialog>

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
    </Paper>
  );
}
