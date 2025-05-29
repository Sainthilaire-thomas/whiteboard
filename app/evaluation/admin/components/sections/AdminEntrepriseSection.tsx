// app/evaluation/admin/components/sections/AdminEntrepriseSection.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Alert,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  TableContainer,
  TablePagination,
  InputAdornment,
  TextField,
} from "@mui/material";
import {
  Business,
  Edit,
  Delete,
  Add,
  Search,
  Domain,
  DateRange,
  Visibility,
} from "@mui/icons-material";
import { AdminToolbar } from "../AdminToolbar";
import { EntrepriseForm } from "./forms/EntrepriseForm";
import { Entreprise, AdminMode } from "../../types/admin";
import { AdminDataService } from "../../services/adminDataService";

interface AdminEntrepriseSectionProps {
  loading?: boolean;
  saving?: boolean;
  onError: (error: string) => void;
  onSuccess: (message: string) => void;
}

export const AdminEntrepriseSection: React.FC<AdminEntrepriseSectionProps> = ({
  loading: externalLoading = false,
  saving: externalSaving = false,
  onError,
  onSuccess,
}) => {
  // États locaux
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [selectedEntreprises, setSelectedEntreprises] = useState<number[]>([]);
  const [currentEntreprise, setCurrentEntreprise] = useState<Entreprise | null>(
    null
  );
  const [mode, setMode] = useState<AdminMode>("view");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);

  // Service de données
  const dataService = new AdminDataService();

  // Chargement initial
  useEffect(() => {
    loadEntreprises();
  }, []);

  // Fonctions de chargement
  const loadEntreprises = async () => {
    try {
      setLoading(true);
      const data = await dataService.loadEntreprises();
      setEntreprises(data);
    } catch (error) {
      console.error("Erreur lors du chargement des entreprises:", error);
      onError("Erreur lors du chargement des entreprises");
    } finally {
      setLoading(false);
    }
  };

  // Filtrage des entreprises
  const filteredEntreprises = entreprises.filter(
    (entreprise) =>
      entreprise.nomentreprise
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (entreprise.domaine &&
        entreprise.domaine.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination
  const paginatedEntreprises = filteredEntreprises.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Gestion des actions
  const handleCreate = () => {
    setCurrentEntreprise(null);
    setMode("create");
    setFormDialogOpen(true);
  };

  const handleEdit = (entreprise: Entreprise) => {
    setCurrentEntreprise(entreprise);
    setMode("edit");
    setFormDialogOpen(true);
  };

  const handleDelete = () => {
    if (selectedEntreprises.length > 0) {
      setDeleteDialogOpen(true);
    }
  };

  const confirmDelete = async () => {
    try {
      setSaving(true);
      for (const id of selectedEntreprises) {
        await dataService.deleteEntreprise(id);
      }
      await loadEntreprises();
      setSelectedEntreprises([]);
      setDeleteDialogOpen(false);
      onSuccess(
        `${selectedEntreprises.length} entreprise(s) supprimée(s) avec succès`
      );
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      onError("Erreur lors de la suppression des entreprises");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (entrepriseData: Partial<Entreprise>) => {
    try {
      setSaving(true);

      if (mode === "create") {
        await dataService.createEntreprise(entrepriseData);
        onSuccess("Entreprise créée avec succès");
      } else if (mode === "edit" && currentEntreprise) {
        await dataService.updateEntreprise(
          currentEntreprise.identreprise,
          entrepriseData
        );
        onSuccess("Entreprise mise à jour avec succès");
      }

      await loadEntreprises();
      setFormDialogOpen(false);
      setCurrentEntreprise(null);
      setMode("view");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      onError("Erreur lors de la sauvegarde de l'entreprise");
    } finally {
      setSaving(false);
    }
  };

  // Gestion de la sélection
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedEntreprises(paginatedEntreprises.map((e) => e.identreprise));
    } else {
      setSelectedEntreprises([]);
    }
  };

  const handleSelectOne = (id: number) => {
    setSelectedEntreprises((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id]
    );
  };

  const isSelected = (id: number) => selectedEntreprises.includes(id);
  const isAllSelected =
    paginatedEntreprises.length > 0 &&
    paginatedEntreprises.every((e) =>
      selectedEntreprises.includes(e.identreprise)
    );
  const isIndeterminate =
    selectedEntreprises.length > 0 &&
    selectedEntreprises.length < paginatedEntreprises.length;

  return (
    <Paper sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <AdminToolbar
        mode={mode}
        title="Gestion des entreprises"
        subtitle={`${entreprises.length} entreprise(s) au total`}
        loading={loading || externalLoading}
        saving={saving || externalSaving}
        canCreate={true}
        canEdit={selectedEntreprises.length === 1}
        canDelete={selectedEntreprises.length > 0}
        hasSelection={selectedEntreprises.length > 0}
        onModeChange={setMode}
        onCreate={handleCreate}
        onEdit={() => {
          const entreprise = entreprises.find(
            (e) => e.identreprise === selectedEntreprises[0]
          );
          if (entreprise) handleEdit(entreprise);
        }}
        onDelete={handleDelete}
        onRefresh={loadEntreprises}
      />

      <Box sx={{ p: 3, flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Barre de recherche */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Rechercher par nom d'entreprise ou domaine internet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: 400 }}
          />
        </Box>

        {/* Statistiques rapides */}
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <Chip
            icon={<Business />}
            label={`${entreprises.length} entreprises`}
            color="primary"
            variant="outlined"
          />
          <Chip
            icon={<Domain />}
            label={`${
              new Set(entreprises.map((e) => e.domaine).filter(Boolean)).size
            } domaines internet`}
            color="secondary"
            variant="outlined"
          />
        </Box>

        {/* Tableau des entreprises */}
        <TableContainer sx={{ flexGrow: 1 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={isIndeterminate}
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>Logo</TableCell>
                <TableCell>Nom de l'entreprise</TableCell>
                <TableCell>Domaine internet</TableCell>
                <TableCell>Date de création</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedEntreprises.map((entreprise) => (
                <TableRow
                  key={entreprise.identreprise}
                  hover
                  selected={isSelected(entreprise.identreprise)}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected(entreprise.identreprise)}
                      onChange={() => handleSelectOne(entreprise.identreprise)}
                    />
                  </TableCell>
                  <TableCell>
                    <Avatar
                      src={entreprise.logo}
                      alt={entreprise.nomentreprise}
                      sx={{ width: 40, height: 40 }}
                    >
                      <Business />
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {entreprise.nomentreprise}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ID: {entreprise.identreprise}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {entreprise.domaine ? (
                      <Chip
                        label={entreprise.domaine}
                        size="small"
                        color="default"
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Non défini
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {entreprise.created_at ? (
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <DateRange
                          sx={{ mr: 1, fontSize: 16, color: "text.secondary" }}
                        />
                        <Typography variant="body2">
                          {new Date(entreprise.created_at).toLocaleDateString(
                            "fr-FR"
                          )}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Inconnue
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Modifier">
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(entreprise)}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Voir les détails">
                      <IconButton size="small">
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          component="div"
          count={filteredEntreprises.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Lignes par page:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`
          }
        />
      </Box>

      {/* Dialog de formulaire */}
      <Dialog
        open={formDialogOpen}
        onClose={() => {
          setFormDialogOpen(false);
          setCurrentEntreprise(null);
          setMode("view");
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {mode === "create" ? "Créer une entreprise" : "Modifier l'entreprise"}
        </DialogTitle>
        <DialogContent>
          <EntrepriseForm
            entreprise={currentEntreprise}
            mode={mode}
            loading={saving}
            onSave={handleSave}
            onCancel={() => {
              setFormDialogOpen(false);
              setCurrentEntreprise(null);
              setMode("view");
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer {selectedEntreprises.length}{" "}
            entreprise(s) ? Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={saving}
          >
            {saving ? "Suppression..." : "Supprimer"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};
