// app/evaluation/admin/components/sections/AdminGrillesQualiteSection.tsx
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
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Checkbox,
  TableContainer,
  TablePagination,
  InputAdornment,
  TextField,
  Card,
  CardContent,
  Grid,
  Badge,
} from "@mui/material";
import {
  Dashboard,
  Edit,
  Delete,
  Search,
  Business,
  DateRange,
  Visibility,
  Assignment,
  Category,
  Link,
  Group,
} from "@mui/icons-material";
import { AdminToolbar } from "../AdminToolbar";
import { GrilleQualiteForm } from "./forms/GrilleQualiteForm";
import { AssociationGrilleDialog } from "./dialogs/AssociationGrilleDialog";
import { DomaineQualite, Entreprise, AdminMode } from "../../types/admin";
import { AdminDataService } from "../../services/adminDataService";

interface AdminGrillesQualiteSectionProps {
  loading?: boolean;
  saving?: boolean;
  onError: (error: string) => void;
  onSuccess: (message: string) => void;
}

interface GrilleAvecEntreprises extends DomaineQualite {
  entreprises?: Entreprise[];
  nombreEntreprises?: number;
}

export const AdminGrillesQualiteSection: React.FC<
  AdminGrillesQualiteSectionProps
> = ({
  loading: externalLoading = false,
  saving: externalSaving = false,
  onError,
  onSuccess,
}) => {
  // États locaux
  const [grilles, setGrilles] = useState<GrilleAvecEntreprises[]>([]);
  const [selectedGrilles, setSelectedGrilles] = useState<number[]>([]);
  const [currentGrille, setCurrentGrille] = useState<DomaineQualite | null>(
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
  const [associationDialogOpen, setAssociationDialogOpen] = useState(false);
  const [selectedGrilleForAssociation, setSelectedGrilleForAssociation] =
    useState<GrilleAvecEntreprises | null>(null);

  // Service de données
  const dataService = new AdminDataService();

  // Chargement initial
  useEffect(() => {
    loadGrillesAvecEntreprises();
  }, []);

  // Fonctions de chargement
  const loadGrillesAvecEntreprises = async () => {
    try {
      setLoading(true);

      // Charger les grilles
      const grillesData = await dataService.loadAllDomainesQualite();

      // Charger les associations pour chaque grille
      const grillesAvecEntreprises = await Promise.all(
        grillesData.map(async (grille) => {
          try {
            const entreprises =
              await dataService.loadEntreprisesForDomaineQualite(
                grille.iddomaine
              );
            return {
              ...grille,
              entreprises,
              nombreEntreprises: entreprises.length,
            };
          } catch (error) {
            return {
              ...grille,
              entreprises: [],
              nombreEntreprises: 0,
            };
          }
        })
      );

      setGrilles(grillesAvecEntreprises);
    } catch (error) {
      console.error("Erreur lors du chargement des grilles qualité:", error);
      onError("Erreur lors du chargement des grilles qualité");
    } finally {
      setLoading(false);
    }
  };

  // Filtrage des grilles
  const filteredGrilles = grilles.filter(
    (grille) =>
      grille.nomdomaine.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (grille.description &&
        grille.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination
  const paginatedGrilles = filteredGrilles.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Gestion des actions
  const handleCreate = () => {
    setCurrentGrille(null);
    setMode("create");
    setFormDialogOpen(true);
  };

  const handleEdit = (grille: DomaineQualite) => {
    setCurrentGrille(grille);
    setMode("edit");
    setFormDialogOpen(true);
  };

  const handleManageAssociations = (grille: GrilleAvecEntreprises) => {
    setSelectedGrilleForAssociation(grille);
    setAssociationDialogOpen(true);
  };

  const handleDelete = () => {
    if (selectedGrilles.length > 0) {
      setDeleteDialogOpen(true);
    }
  };

  const confirmDelete = async () => {
    try {
      setSaving(true);
      for (const id of selectedGrilles) {
        await dataService.deleteDomaineQualite(id);
      }
      await loadGrillesAvecEntreprises();
      setSelectedGrilles([]);
      setDeleteDialogOpen(false);
      onSuccess(`${selectedGrilles.length} grille(s) supprimée(s) avec succès`);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      onError("Erreur lors de la suppression des grilles qualité");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (grilleData: Partial<DomaineQualite>) => {
    try {
      setSaving(true);

      if (mode === "create") {
        await dataService.createDomaineQualite(grilleData);
        onSuccess("Grille qualité créée avec succès");
      } else if (mode === "edit" && currentGrille) {
        await dataService.updateDomaineQualite(
          currentGrille.iddomaine,
          grilleData
        );
        onSuccess("Grille qualité mise à jour avec succès");
      }

      await loadGrillesAvecEntreprises();
      setFormDialogOpen(false);
      setCurrentGrille(null);
      setMode("view");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      onError("Erreur lors de la sauvegarde de la grille qualité");
    } finally {
      setSaving(false);
    }
  };

  const handleAssociationSaved = () => {
    loadGrillesAvecEntreprises();
    setAssociationDialogOpen(false);
    setSelectedGrilleForAssociation(null);
  };

  // Gestion de la sélection
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedGrilles(paginatedGrilles.map((g) => g.iddomaine));
    } else {
      setSelectedGrilles([]);
    }
  };

  const handleSelectOne = (id: number) => {
    setSelectedGrilles((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id]
    );
  };

  const isSelected = (id: number) => selectedGrilles.includes(id);
  const isAllSelected =
    paginatedGrilles.length > 0 &&
    paginatedGrilles.every((g) => selectedGrilles.includes(g.iddomaine));
  const isIndeterminate =
    selectedGrilles.length > 0 &&
    selectedGrilles.length < paginatedGrilles.length;

  // Statistiques
  const totalEntreprises = grilles.reduce(
    (sum, grille) => sum + (grille.nombreEntreprises || 0),
    0
  );
  const grillesUtilisees = grilles.filter(
    (g) => (g.nombreEntreprises || 0) > 0
  ).length;

  return (
    <Paper sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <AdminToolbar
        mode={mode}
        title="Gestion des grilles qualité"
        subtitle={`${grilles.length} grille(s) • ${totalEntreprises} association(s)`}
        loading={loading || externalLoading}
        saving={saving || externalSaving}
        canCreate={true}
        canEdit={selectedGrilles.length === 1}
        canDelete={selectedGrilles.length > 0}
        hasSelection={selectedGrilles.length > 0}
        onModeChange={setMode}
        onCreate={handleCreate}
        onEdit={() => {
          const grille = grilles.find(
            (g) => g.iddomaine === selectedGrilles[0]
          );
          if (grille) handleEdit(grille);
        }}
        onDelete={handleDelete}
        onRefresh={loadGrillesAvecEntreprises}
      />

      <Box sx={{ p: 3, flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Barre de recherche */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Rechercher par nom de grille ou description..."
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
            icon={<Dashboard />}
            label={`${grilles.length} grilles qualité`}
            color="primary"
            variant="outlined"
          />
          <Chip
            icon={<Group />}
            label={`${totalEntreprises} associations`}
            color="secondary"
            variant="outlined"
          />
          <Chip
            icon={<Assignment />}
            label={`${grillesUtilisees} grilles utilisées`}
            color="success"
            variant="outlined"
          />
        </Box>

        {/* Exemples de grilles connues */}
        <Card sx={{ mb: 3, bgcolor: "background.default" }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              <Category sx={{ mr: 1, verticalAlign: "middle" }} />
              Exemples de grilles qualité référentiels
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Les grilles qualité sont des référentiels d'évaluation partagés
              entre plusieurs entreprises :
            </Typography>
            <Grid container spacing={1}>
              {[
                "Grille ESCDA",
                "Grille La Poste",
                "Grille Téléphone",
                "Grille Standard",
              ].map((exemple) => (
                <Grid item key={exemple}>
                  <Chip
                    label={exemple}
                    size="small"
                    variant="outlined"
                    color="info"
                  />
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Tableau des grilles */}
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
                <TableCell>Nom de la grille</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="center">Entreprises</TableCell>
                <TableCell>Date de création</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedGrilles.map((grille) => (
                <TableRow
                  key={grille.iddomaine}
                  hover
                  selected={isSelected(grille.iddomaine)}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected(grille.iddomaine)}
                      onChange={() => handleSelectOne(grille.iddomaine)}
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {grille.nomdomaine}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {grille.iddomaine}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {grille.description ? (
                      <Typography variant="body2" sx={{ maxWidth: 300 }}>
                        {grille.description.length > 100
                          ? `${grille.description.substring(0, 100)}...`
                          : grille.description}
                      </Typography>
                    ) : (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontStyle="italic"
                      >
                        Aucune description
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Badge
                      badgeContent={grille.nombreEntreprises || 0}
                      color="primary"
                    >
                      <IconButton
                        size="small"
                        onClick={() => handleManageAssociations(grille)}
                        color={
                          (grille.nombreEntreprises || 0) > 0
                            ? "primary"
                            : "default"
                        }
                      >
                        <Business />
                      </IconButton>
                    </Badge>
                    {(grille.nombreEntreprises || 0) > 0 && (
                      <Typography
                        variant="caption"
                        display="block"
                        color="text.secondary"
                      >
                        {grille.nombreEntreprises} entreprise(s)
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {grille.created_at ? (
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <DateRange
                          sx={{ mr: 1, fontSize: 16, color: "text.secondary" }}
                        />
                        <Typography variant="body2">
                          {new Date(grille.created_at).toLocaleDateString(
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
                    <Tooltip title="Gérer les entreprises">
                      <IconButton
                        size="small"
                        onClick={() => handleManageAssociations(grille)}
                        color="primary"
                      >
                        <Link />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Modifier">
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(grille)}
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
          count={filteredGrilles.length}
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
          setCurrentGrille(null);
          setMode("view");
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {mode === "create"
            ? "Créer une grille qualité"
            : "Modifier la grille qualité"}
        </DialogTitle>
        <DialogContent>
          <GrilleQualiteForm
            grille={currentGrille}
            mode={mode}
            loading={saving}
            onSave={handleSave}
            onCancel={() => {
              setFormDialogOpen(false);
              setCurrentGrille(null);
              setMode("view");
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de gestion des associations */}
      <AssociationGrilleDialog
        open={associationDialogOpen}
        grille={selectedGrilleForAssociation}
        onClose={() => {
          setAssociationDialogOpen(false);
          setSelectedGrilleForAssociation(null);
        }}
        onSaved={handleAssociationSaved}
        onError={onError}
        onSuccess={onSuccess}
      />

      {/* Dialog de confirmation de suppression */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography>
              <strong>Attention !</strong> Supprimer une grille qualité
              supprimera également :
            </Typography>
            <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
              <li>Tous les sujets associés à cette grille</li>
              <li>Toutes les pondérations configurées</li>
              <li>Les liaisons avec les entreprises</li>
            </ul>
          </Alert>
          <Typography>
            Êtes-vous sûr de vouloir supprimer {selectedGrilles.length}{" "}
            grille(s) qualité ? Cette action est irréversible.
          </Typography>
        </DialogContent>
        <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={saving}
          >
            {saving ? "Suppression..." : "Supprimer"}
          </Button>
        </Box>
      </Dialog>
    </Paper>
  );
};
