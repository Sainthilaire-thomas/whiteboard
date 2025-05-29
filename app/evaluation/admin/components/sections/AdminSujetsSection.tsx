// app/evaluation/admin/components/sections/AdminSujetsSection.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge,
} from "@mui/material";
import {
  Assignment,
  Edit,
  Delete,
  Search,
  DateRange,
  Visibility,
  Dashboard,
  Category,
  Business,
  TuneOutlined,
} from "@mui/icons-material";
import { AdminToolbar } from "../AdminToolbar";
import { SujetForm } from "./forms/SujetForm";
import {
  Sujet,
  DomaineQualite,
  CategoriesujetExtended,
  AdminMode,
} from "../../types/admin";
import { AdminDataService } from "../../services/adminDataService";

interface AdminSujetsSectionProps {
  loading?: boolean;
  saving?: boolean;
  onError: (error: string) => void;
  onSuccess: (message: string) => void;
}

interface SujetAvecDetails extends Sujet {
  nomdomaine?: string;
  nomcategorie?: string;
  couleurcategorie?: string;
}

export const AdminSujetsSection: React.FC<AdminSujetsSectionProps> = ({
  loading: externalLoading = false,
  saving: externalSaving = false,
  onError,
  onSuccess,
}) => {
  // États locaux
  const [sujets, setSujets] = useState<SujetAvecDetails[]>([]);
  const [domaines, setDomaines] = useState<DomaineQualite[]>([]);
  const [categories, setCategories] = useState<CategoriesujetExtended[]>([]);
  const [selectedSujets, setSelectedSujets] = useState<number[]>([]);
  const [currentSujet, setCurrentSujet] = useState<Sujet | null>(null);
  const [mode, setMode] = useState<AdminMode>("view");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [selectedDomaineFilter, setSelectedDomaineFilter] =
    useState<string>("");
  const [selectedCategorieFilter, setSelectedCategorieFilter] =
    useState<string>("");
  const [dependenciesInfo, setDependenciesInfo] = useState<{
    [key: number]: number;
  }>({});
  const [confirmationText, setConfirmationText] = useState("");
  // Service de données
  const dataService = new AdminDataService();

  // Chargement initial
  useEffect(() => {
    Promise.all([loadSujets(), loadDomaines(), loadCategories()]);
  }, []);

  // Fonctions de chargement
  const loadSujets = async () => {
    try {
      setLoading(true);
      const data = await dataService.loadAllSujets();
      // Enrichir les données avec les noms des domaines et catégories
      const sujetsEnrichis = await Promise.all(
        data.map(async (sujet) => {
          // Charger le nom du domaine
          const domaines = await dataService.loadAllDomainesQualite();
          const domaine = domaines.find((d) => d.iddomaine === sujet.iddomaine);

          // Charger le nom de la catégorie
          const categories = await dataService.loadCategories();
          const categorie = categories.find(
            (c) => c.idcategoriesujet === sujet.idcategoriesujet
          );

          return {
            ...sujet,
            nomdomaine: domaine?.nomdomaine,
            nomcategorie: categorie?.nomcategorie,
            couleurcategorie: categorie?.couleur,
          };
        })
      );
      setSujets(sujetsEnrichis);
    } catch (error) {
      console.error("Erreur lors du chargement des sujets:", error);
      onError("Erreur lors du chargement des sujets");
    } finally {
      setLoading(false);
    }
  };

  const loadDomaines = async () => {
    try {
      const data = await dataService.loadAllDomainesQualite();
      setDomaines(data);
    } catch (error) {
      console.error("Erreur lors du chargement des domaines:", error);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await dataService.loadCategories();
      setCategories(data);
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error);
    }
  };

  // Ajouter cette méthode après loadCategories
  const checkDependenciesForSujets = async (sujetIds: number[]) => {
    try {
      const dependencies = await dataService.checkMultipleSujetsDependencies(
        sujetIds
      );
      setDependenciesInfo(dependencies);
    } catch (error) {
      console.error("Erreur lors de la vérification des dépendances:", error);
      onError("Erreur lors de la vérification des dépendances");
    }
  };

  // Filtrage des sujets
  const filteredAndSortedSujets = useMemo(() => {
    // D'abord filtrer
    const filtered = sujets.filter((sujet) => {
      const matchesSearch =
        sujet.nomsujet.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sujet.description &&
          sujet.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesDomaine =
        !selectedDomaineFilter ||
        sujet.iddomaine.toString() === selectedDomaineFilter;

      const matchesCategorie =
        !selectedCategorieFilter ||
        sujet.idcategoriesujet?.toString() === selectedCategorieFilter;

      return matchesSearch && matchesDomaine && matchesCategorie;
    });

    // Puis trier par Grille Qualité puis par Catégories
    return filtered.sort((a, b) => {
      // 1. Tri par nom de grille qualité (domaine)
      const domaineA = a.nomdomaine || `Domaine ${a.iddomaine}`;
      const domaineB = b.nomdomaine || `Domaine ${b.iddomaine}`;
      const domaineComparison = domaineA.localeCompare(domaineB, "fr", {
        sensitivity: "base",
      });

      if (domaineComparison !== 0) {
        return domaineComparison;
      }

      // 2. Si même grille, tri par catégorie (les non catégorisés à la fin)
      const categorieA = a.nomcategorie || "zzz_Non catégorisé";
      const categorieB = b.nomcategorie || "zzz_Non catégorisé";
      const categorieComparison = categorieA.localeCompare(categorieB, "fr", {
        sensitivity: "base",
      });

      if (categorieComparison !== 0) {
        return categorieComparison;
      }

      // 3. Si même grille et même catégorie, tri par nom du sujet
      return a.nomsujet.localeCompare(b.nomsujet, "fr", {
        sensitivity: "base",
      });
    });
  }, [sujets, searchTerm, selectedDomaineFilter, selectedCategorieFilter]);

  // Pagination
  const paginatedSujets = filteredAndSortedSujets.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Gestion des actions
  const handleCreate = () => {
    setCurrentSujet(null);
    setMode("create");
    setFormDialogOpen(true);
  };

  const handleEdit = (sujet: Sujet) => {
    setCurrentSujet(sujet);
    setMode("edit");
    setFormDialogOpen(true);
  };

  const handleDelete = async () => {
    if (selectedSujets.length > 0) {
      // Vérifier les dépendances avant d'ouvrir le dialog
      await checkDependenciesForSujets(selectedSujets);
      setDeleteDialogOpen(true);
    }
  };

  const confirmDelete = async () => {
    try {
      setSaving(true);
      for (const id of selectedSujets) {
        await dataService.deleteSujet(id);
      }
      await loadSujets();
      setSelectedSujets([]);
      setDeleteDialogOpen(false);
      onSuccess(`${selectedSujets.length} sujet(s) supprimé(s) avec succès`);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      onError("Erreur lors de la suppression des sujets");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (sujetData: Partial<Sujet>) => {
    try {
      setSaving(true);

      if (mode === "create") {
        await dataService.createSujet(sujetData);
        onSuccess("Sujet créé avec succès");
      } else if (mode === "edit" && currentSujet) {
        await dataService.updateSujet(currentSujet.idsujet, sujetData);
        onSuccess("Sujet mis à jour avec succès");
      }

      await loadSujets();
      setFormDialogOpen(false);
      setCurrentSujet(null);
      setMode("view");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      onError("Erreur lors de la sauvegarde du sujet");
    } finally {
      setSaving(false);
    }
  };

  // Gestion de la sélection
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedSujets(paginatedSujets.map((s) => s.idsujet));
    } else {
      setSelectedSujets([]);
    }
  };

  const handleSelectOne = (id: number) => {
    setSelectedSujets((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id]
    );
  };

  const isSelected = (id: number) => selectedSujets.includes(id);
  const isAllSelected =
    paginatedSujets.length > 0 &&
    paginatedSujets.every((s) => selectedSujets.includes(s.idsujet));
  const isIndeterminate =
    selectedSujets.length > 0 && selectedSujets.length < paginatedSujets.length;

  // Statistiques
  const sujetsActifs = sujets.filter((s) => s.valeurnumérique > 0).length;
  const sujetsParDomaine = domaines
    .map((d) => ({
      domaine: d,
      count: sujets.filter((s) => s.iddomaine === d.iddomaine).length,
    }))
    .filter((item) => item.count > 0);

  return (
    <Paper sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <AdminToolbar
        mode={mode}
        title="Gestion des sujets"
        subtitle={`${sujets.length} sujet(s) • ${sujetsActifs} actif(s)`}
        loading={loading || externalLoading}
        saving={saving || externalSaving}
        canCreate={true}
        canEdit={selectedSujets.length === 1}
        canDelete={selectedSujets.length > 0}
        hasSelection={selectedSujets.length > 0}
        onModeChange={setMode}
        onCreate={handleCreate}
        onEdit={() => {
          const sujet = sujets.find((s) => s.idsujet === selectedSujets[0]);
          if (sujet) handleEdit(sujet);
        }}
        onDelete={handleDelete}
        onRefresh={loadSujets}
      />

      <Box sx={{ p: 3, flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Filtres et recherche */}
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          <TextField
            placeholder="Rechercher par nom ou description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Grille qualité</InputLabel>
            <Select
              value={selectedDomaineFilter}
              onChange={(e) => setSelectedDomaineFilter(e.target.value)}
              label="Grille qualité"
            >
              <MenuItem value="">Toutes les grilles</MenuItem>
              {domaines.map((domaine) => (
                <MenuItem
                  key={domaine.iddomaine}
                  value={domaine.iddomaine.toString()}
                >
                  {domaine.nomdomaine}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Catégorie</InputLabel>
            <Select
              value={selectedCategorieFilter}
              onChange={(e) => setSelectedCategorieFilter(e.target.value)}
              label="Catégorie"
            >
              <MenuItem value="">Toutes les catégories</MenuItem>
              {categories.map((categorie) => (
                <MenuItem
                  key={categorie.idcategoriesujet}
                  value={categorie.idcategoriesujet.toString()}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {categorie.couleur && (
                      <Avatar
                        sx={{
                          width: 16,
                          height: 16,
                          bgcolor: categorie.couleur,
                        }}
                      >
                        <span />
                      </Avatar>
                    )}
                    {categorie.nomcategorie}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Statistiques rapides */}
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          <Chip
            icon={<Assignment />}
            label={`${sujets.length} sujets`}
            color="primary"
            variant="outlined"
          />
          <Chip
            icon={<TuneOutlined />}
            label={`${sujetsActifs} actifs`}
            color="success"
            variant="outlined"
          />
          <Chip
            icon={<Dashboard />}
            label={`${sujetsParDomaine.length} grilles utilisées`}
            color="info"
            variant="outlined"
          />
        </Box>

        {/* Répartition par grilles */}
        <Card sx={{ mb: 3, bgcolor: "background.default" }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              <Dashboard sx={{ mr: 1, verticalAlign: "middle" }} />
              Répartition par grilles qualité
            </Typography>
            <Grid container spacing={2}>
              {sujetsParDomaine.map(({ domaine, count }) => (
                <Grid item key={domaine.iddomaine}>
                  <Chip
                    label={`${domaine.nomdomaine}: ${count}`}
                    size="small"
                    variant="outlined"
                    color="secondary"
                  />
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Tableau des sujets */}
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
                <TableCell>Sujet</TableCell>
                <TableCell>Grille qualité</TableCell>
                <TableCell>Catégorie</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="center">Valeur</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedSujets.map((sujet, index) => {
                const prevSujet = index > 0 ? paginatedSujets[index - 1] : null;
                const isNewDomaine =
                  !prevSujet || prevSujet.iddomaine !== sujet.iddomaine;
                const isNewCategorie =
                  !prevSujet ||
                  prevSujet.iddomaine !== sujet.iddomaine ||
                  prevSujet.idcategoriesujet !== sujet.idcategoriesujet;

                return (
                  <React.Fragment key={sujet.idsujet}>
                    {/* Séparateur de grille qualité */}
                    {isNewDomaine && index > 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          sx={{
                            backgroundColor: "primary.50",
                            borderTop: "2px solid",
                            borderColor: "primary.main",
                            py: 0.5,
                          }}
                        >
                          {/* Ligne de séparation avec le nom de la grille */}
                        </TableCell>
                      </TableRow>
                    )}

                    {/* Indicateur de nouvelle catégorie */}
                    {isNewCategorie && !isNewDomaine && index > 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          sx={{
                            backgroundColor: "secondary.50",
                            py: 0.2,
                            borderTop: "1px dashed",
                            borderColor: "secondary.main",
                          }}
                        >
                          {/* Ligne de séparation pour la catégorie */}
                        </TableCell>
                      </TableRow>
                    )}

                    <TableRow
                      hover
                      selected={isSelected(sujet.idsujet)}
                      sx={{
                        // Léger effet visuel pour les nouveaux groupes
                        ...(isNewDomaine && {
                          "& td": {
                            borderTop: "2px solid",
                            borderColor: "primary.200",
                          },
                        }),
                        ...(!isNewDomaine &&
                          isNewCategorie && {
                            "& td": {
                              borderTop: "1px dashed",
                              borderColor: "secondary.200",
                            },
                          }),
                      }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isSelected(sujet.idsujet)}
                          onChange={() => handleSelectOne(sujet.idsujet)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {sujet.nomsujet}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {sujet.idsujet}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            sujet.nomdomaine || `Domaine ${sujet.iddomaine}`
                          }
                          size="small"
                          color="primary"
                          variant={isNewDomaine ? "filled" : "outlined"}
                        />
                      </TableCell>
                      <TableCell>
                        {sujet.nomcategorie ? (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            {sujet.couleurcategorie && (
                              <Avatar
                                sx={{
                                  width: 16,
                                  height: 16,
                                  bgcolor: sujet.couleurcategorie,
                                }}
                              >
                                <span />
                              </Avatar>
                            )}
                            <Typography variant="body2">
                              {sujet.nomcategorie}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Non catégorisé
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {sujet.description ? (
                          <Typography variant="body2" sx={{ maxWidth: 300 }}>
                            {sujet.description.length > 80
                              ? `${sujet.description.substring(0, 80)}...`
                              : sujet.description}
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
                        <Chip
                          label={sujet.valeurnumérique}
                          size="small"
                          color={
                            sujet.valeurnumérique > 0 ? "success" : "default"
                          }
                          variant={
                            sujet.valeurnumérique > 0 ? "filled" : "outlined"
                          }
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Modifier">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(sujet)}
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
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          component="div"
          count={filteredAndSortedSujets.length}
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
          setCurrentSujet(null);
          setMode("view");
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {mode === "create" ? "Créer un sujet" : "Modifier le sujet"}
        </DialogTitle>
        <DialogContent>
          <SujetForm
            sujet={currentSujet}
            domaines={domaines}
            categories={categories}
            mode={mode}
            loading={saving}
            onSave={handleSave}
            onCancel={() => {
              setFormDialogOpen(false);
              setCurrentSujet(null);
              setMode("view");
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Delete color="error" />
            Confirmer la suppression
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              <strong>⚠️ Action irréversible !</strong>
            </Typography>
            <Typography variant="body2">
              La suppression de {selectedSujets.length} sujet(s) entraînera
              automatiquement :
            </Typography>
          </Alert>

          {/* Détail des suppressions par sujet */}
          <Box sx={{ mb: 2 }}>
            {selectedSujets.map((sujetId) => {
              const sujet = sujets.find((s) => s.idsujet === sujetId);
              const dependenciesCount = dependenciesInfo[sujetId] || 0;

              return (
                <Card
                  key={sujetId}
                  variant="outlined"
                  sx={{ mb: 1, bgcolor: "error.50" }}
                >
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography
                      variant="body2"
                      fontWeight="medium"
                      color="error.main"
                    >
                      📋 {sujet?.nomsujet}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      Grille: {sujet?.nomdomaine || `ID ${sujet?.iddomaine}`}
                    </Typography>

                    {dependenciesCount > 0 && (
                      <Alert severity="warning" sx={{ mt: 1, py: 0.5 }}>
                        <Typography variant="caption">
                          🗑️ <strong>{dependenciesCount}</strong> activité(s) de
                          conseiller(s) seront supprimées
                        </Typography>
                      </Alert>
                    )}

                    {dependenciesCount === 0 && (
                      <Typography
                        variant="caption"
                        color="success.main"
                        sx={{ mt: 1, display: "block" }}
                      >
                        ✅ Aucune dépendance - Suppression sécurisée
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </Box>

          {/* Résumé total */}
          {Object.values(dependenciesInfo).some((count) => count > 0) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Total des suppressions :</strong>
              </Typography>
              <ul style={{ margin: "4px 0", paddingLeft: "20px" }}>
                <li>{selectedSujets.length} sujet(s) d'évaluation</li>
                <li>
                  {Object.values(dependenciesInfo).reduce((a, b) => a + b, 0)}{" "}
                  activité(s) de conseiller(s)
                </li>
                <li>Toutes les pondérations associées</li>
              </ul>
            </Alert>
          )}

          <Typography variant="body2" sx={{ mt: 2 }}>
            Tapez <strong>SUPPRIMER</strong> pour confirmer cette action :
          </Typography>

          <TextField
            fullWidth
            placeholder="Tapez SUPPRIMER pour confirmer"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            sx={{ mt: 1 }}
            error={
              confirmationText.length > 0 && confirmationText !== "SUPPRIMER"
            }
            helperText={
              confirmationText.length > 0 && confirmationText !== "SUPPRIMER"
                ? "Veuillez taper exactement SUPPRIMER"
                : ""
            }
          />
        </DialogContent>

        <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setConfirmationText("");
              setDependenciesInfo({});
            }}
            disabled={saving}
          >
            Annuler
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={saving || confirmationText !== "SUPPRIMER"}
            startIcon={saving ? undefined : <Delete />}
          >
            {saving ? "Suppression en cours..." : "Supprimer définitivement"}
          </Button>
        </Box>
      </Dialog>
    </Paper>
  );
};
