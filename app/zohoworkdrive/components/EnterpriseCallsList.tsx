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
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import AudioFileIcon from "@mui/icons-material/AudioFile";
import { removeCallUpload } from "../lib/removeCallUpload";

// ✅ Import des types locaux autonomes
import type {
  Call,
  ConfirmDeleteState,
  ApiError,
  EnterpriseCallsListProps,
} from "../types";

export default function EnterpriseCallsList({
  entrepriseId,
}: EnterpriseCallsListProps) {
  const { calls, fetchCalls, isLoadingCalls, selectCall } = useCallData();

  const [confirmDelete, setConfirmDelete] = useState<ConfirmDeleteState>({
    open: false,
    callId: null,
    filePath: null,
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Gestionnaire pour sélectionner un appel
  const handleSelectCall = (callId: number): void => {
    const call = calls.find((c) => c.callid === callId);
    if (call) {
      selectCall(call);
    }
  };

  // Gestionnaire pour supprimer un appel
  const handleDeleteCall = async (): Promise<void> => {
    if (!confirmDelete.callId) return;

    try {
      setIsSubmitting(true);
      await removeCallUpload(confirmDelete.callId, confirmDelete.filePath);

      // Rafraîchir la liste des appels
      if (entrepriseId) {
        fetchCalls(entrepriseId);
      }

      setSuccessMessage("Appel supprimé avec succès");
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(`Erreur lors de la suppression: ${apiError.message}`);
    } finally {
      setIsSubmitting(false);
      setConfirmDelete({ open: false, callId: null, filePath: null });
    }
  };

  // Fermer le message de succès
  const handleCloseSuccess = (): void => {
    setSuccessMessage(null);
  };

  // Fermer le message d'erreur
  const handleCloseError = (): void => {
    setError(null);
  };

  // Définir les colonnes de la grille
  const columns: GridColDef<Call>[] = [
    {
      field: "filename",
      headerName: "Nom",
      flex: 1,
    },
    {
      field: "description",
      headerName: "Description",
      flex: 2,
      // ✅ Gestion du cas où description est undefined
      renderCell: (params: GridRenderCellParams<Call, string>) =>
        params.value || "Pas de description",
    },
    {
      field: "action",
      headerName: "Actions",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<Call>) => (
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
                filePath: params.row.filepath || null,
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
            getRowId={(row: Call) => row.callid}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 5 },
              },
            }}
            pageSizeOptions={[5, 10, 25]}
            disableRowSelectionOnClick
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
