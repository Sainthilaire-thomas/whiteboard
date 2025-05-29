// app/evaluation/admin/components/sections/AdminCategoriesSection.tsx
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
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import {
  Category,
  Edit,
  Delete,
  Search,
  DateRange,
  Visibility,
  Palette,
  Sort,
  ToggleOn,
  ToggleOff,
  ExpandMore,
  ViewList,
  ViewModule,
  Dashboard,
} from "@mui/icons-material";
import { AdminToolbar } from "../AdminToolbar";
import { CategorieForm } from "./forms/CategorieForm";
import { CategoriesujetExtended, AdminMode } from "../../types/admin";
import { AdminDataService } from "../../services/adminDataService";

interface AdminCategoriesSectionProps {
  loading?: boolean;
  saving?: boolean;
  onError: (error: string) => void;
  onSuccess: (message: string) => void;
}

export const AdminCategoriesSection: React.FC<AdminCategoriesSectionProps> = ({
  loading: externalLoading = false,
  saving: externalSaving = false,
  onError,
  onSuccess,
}) => {
  // États locaux
  const [categories, setCategories] = useState<CategoriesujetExtended[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [currentCategorie, setCurrentCategorie] =
    useState<CategoriesujetExtended | null>(null);
  const [mode, setMode] = useState<AdminMode>("view");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "grouped">("grouped");
  const [selectedDomaineFilter, setSelectedDomaineFilter] =
    useState<string>("");

  // Service de données
  const dataService = new AdminDataService();

  // Chargement initial
  useEffect(() => {
    loadCategories();
  }, []);

  // Fonctions de chargement
  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await dataService.loadCategoriesWithDomaines();
      setCategories(data);
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error);
      onError("Erreur lors du chargement des catégories");
    } finally {
      setLoading(false);
    }
  };

  // Filtrage des catégories
  const filteredCategories = categories.filter(
    (categorie) =>
      categorie.nomcategorie.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (categorie.description &&
        categorie.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination
  const paginatedCategories = filteredCategories.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Gestion des actions
  const handleCreate = () => {
    setCurrentCategorie(null);
    setMode("create");
    setFormDialogOpen(true);
  };

  const handleEdit = (categorie: CategoriesujetExtended) => {
    setCurrentCategorie(categorie);
    setMode("edit");
    setFormDialogOpen(true);
  };

  const handleDelete = () => {
    if (selectedCategories.length > 0) {
      setDeleteDialogOpen(true);
    }
  };

  const confirmDelete = async () => {
    try {
      setSaving(true);
      for (const id of selectedCategories) {
        await dataService.deleteCategorie(id);
      }
      await loadCategories();
      setSelectedCategories([]);
      setDeleteDialogOpen(false);
      onSuccess(
        `${selectedCategories.length} catégorie(s) supprimée(s) avec succès`
      );
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      onError("Erreur lors de la suppression des catégories");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (categorieData: Partial<CategoriesujetExtended>) => {
    try {
      setSaving(true);

      if (mode === "create") {
        await dataService.createCategorie(categorieData);
        onSuccess("Catégorie créée avec succès");
      } else if (mode === "edit" && currentCategorie) {
        await dataService.updateCategorie(
          currentCategorie.idcategoriesujet,
          categorieData
        );
        onSuccess("Catégorie mise à jour avec succès");
      }

      await loadCategories();
      setFormDialogOpen(false);
      setCurrentCategorie(null);
      setMode("view");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      onError("Erreur lors de la sauvegarde de la catégorie");
    } finally {
      setSaving(false);
    }
  };

  // Toggle actif/inactif - Fonction supprimée car le champ n'existe pas
  // const handleToggleActif = async (categorie: CategoriesujetExtended) => {
  //   // Cette fonction n'est plus utilisée
  // };

  // Gestion de la sélection
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedCategories(paginatedCategories.map((c) => c.idcategoriesujet));
    } else {
      setSelectedCategories([]);
    }
  };

  const handleSelectOne = (id: number) => {
    setSelectedCategories((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id]
    );
  };

  const isSelected = (id: number) => selectedCategories.includes(id);
  const isAllSelected =
    paginatedCategories.length > 0 &&
    paginatedCategories.every((c) =>
      selectedCategories.includes(c.idcategoriesujet)
    );
  const isIndeterminate =
    selectedCategories.length > 0 &&
    selectedCategories.length < paginatedCategories.length;

  // Statistiques
  const categoriesAvecCouleur = categories.filter((c) => c.couleur).length;
  const totalDomaines = categories.reduce(
    (sum, cat) => sum + (cat.nombreDomaines || 0),
    0
  );

  // Obtenir tous les domaines uniques
  const tousLesDomaines = Array.from(
    new Map(
      categories
        .flatMap((cat) => cat.domaines || [])
        .map((dom) => [dom.iddomaine, dom])
    ).values()
  );

  // Regroupement par domaine pour la vue groupée
  const categoriesParDomaine = tousLesDomaines
    .map((domaine) => ({
      domaine,
      categories: categories.filter((cat) =>
        cat.domaines?.some((d) => d.iddomaine === domaine.iddomaine)
      ),
    }))
    .filter((group) => group.categories.length > 0);

  // Catégories non utilisées
  const categoriesNonUtilisees = categories.filter(
    (cat) => !cat.domaines || cat.domaines.length === 0
  );

  return (
    <Paper sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <AdminToolbar
        mode={mode}
        title="Gestion des catégories"
        subtitle={`${categories.length} catégorie(s) • ${totalDomaines} usage(s) dans les grilles`}
        loading={loading || externalLoading}
        saving={saving || externalSaving}
        canCreate={true}
        canEdit={selectedCategories.length === 1}
        canDelete={selectedCategories.length > 0}
        hasSelection={selectedCategories.length > 0}
        onModeChange={setMode}
        onCreate={handleCreate}
        onEdit={() => {
          const categorie = categories.find(
            (c) => c.idcategoriesujet === selectedCategories[0]
          );
          if (categorie) handleEdit(categorie);
        }}
        onDelete={handleDelete}
        onRefresh={loadCategories}
      />

      <Box sx={{ p: 3, flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Contrôles de vue et filtres */}
        <Box sx={{ display: "flex", gap: 2, mb: 3, alignItems: "center" }}>
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
            <InputLabel>Filtre par grille</InputLabel>
            <Select
              value={selectedDomaineFilter}
              onChange={(e) => setSelectedDomaineFilter(e.target.value)}
              label="Filtre par grille"
            >
              <MenuItem value="">Toutes les grilles</MenuItem>
              {tousLesDomaines.map((domaine) => (
                <MenuItem
                  key={domaine.iddomaine}
                  value={domaine.iddomaine.toString()}
                >
                  {domaine.nomdomaine}
                </MenuItem>
              ))}
              <MenuItem value="unused">Catégories non utilisées</MenuItem>
            </Select>
          </FormControl>

          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, newMode) => newMode && setViewMode(newMode)}
            size="small"
          >
            <ToggleButton value="grouped">
              <ViewModule sx={{ mr: 1 }} />
              Groupé
            </ToggleButton>
            <ToggleButton value="table">
              <ViewList sx={{ mr: 1 }} />
              Tableau
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Statistiques rapides */}
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <Chip
            icon={<Category />}
            label={`${categories.length} catégories`}
            color="primary"
            variant="outlined"
          />
          <Chip
            icon={<Palette />}
            label={`${categoriesAvecCouleur} avec couleur`}
            color="secondary"
            variant="outlined"
          />
          <Chip
            icon={<Dashboard />}
            label={`${totalDomaines} usages`}
            color="info"
            variant="outlined"
          />
        </Box>

        {/* Exemples de catégories */}
        <Card sx={{ mb: 3, bgcolor: "background.default" }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              <Category sx={{ mr: 1, verticalAlign: "middle" }} />
              Exemples de catégories courantes
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Les catégories structurent et colorisent les critères d'évaluation
              dans les grilles :
            </Typography>
            <Grid container spacing={1}>
              {[
                { nom: "MH Procédures", couleur: "#1976d2" },
                { nom: "Sécurisation", couleur: "#d32f2f" },
                { nom: "Communication", couleur: "#388e3c" },
                { nom: "Technique", couleur: "#f57c00" },
                { nom: "Qualité Service", couleur: "#7b1fa2" },
              ].map((exemple) => (
                <Grid item key={exemple.nom}>
                  <Chip
                    label={exemple.nom}
                    size="small"
                    sx={{
                      bgcolor: exemple.couleur,
                      color: "white",
                      "&:hover": { bgcolor: exemple.couleur },
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Affichage conditionnel selon le mode de vue */}
        {viewMode === "grouped" ? (
          /* Vue groupée par domaine */
          <Box sx={{ flexGrow: 1 }}>
            {categoriesParDomaine
              .filter(
                (group) =>
                  !selectedDomaineFilter ||
                  group.domaine.iddomaine.toString() === selectedDomaineFilter
              )
              .map((group) => (
                <Accordion
                  key={group.domaine.iddomaine}
                  defaultExpanded
                  sx={{ mb: 2 }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        width: "100%",
                      }}
                    >
                      <Dashboard color="primary" />
                      <Typography variant="h6" sx={{ fontWeight: "medium" }}>
                        {group.domaine.nomdomaine}
                      </Typography>
                      <Chip
                        label={`${group.categories.length} catégorie(s)`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      {group.categories
                        .filter(
                          (cat) =>
                            cat.nomcategorie
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                            (cat.description &&
                              cat.description
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase()))
                        )
                        .map((categorie) => (
                          <Grid
                            item
                            xs={12}
                            sm={6}
                            md={4}
                            key={categorie.idcategoriesujet}
                          >
                            <Card
                              variant="outlined"
                              sx={{
                                height: "100%",
                                cursor: "pointer",
                                "&:hover": { boxShadow: 2 },
                                borderLeft: categorie.couleur
                                  ? `4px solid ${categorie.couleur}`
                                  : undefined,
                              }}
                              onClick={() => handleEdit(categorie)}
                            >
                              <CardContent sx={{ p: 2 }}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    mb: 1,
                                  }}
                                >
                                  {categorie.couleur && (
                                    <Avatar
                                      sx={{
                                        width: 24,
                                        height: 24,
                                        bgcolor: categorie.couleur,
                                      }}
                                    >
                                      <span />
                                    </Avatar>
                                  )}
                                  <Typography
                                    variant="h6"
                                    sx={{
                                      fontSize: "1rem",
                                      fontWeight: "medium",
                                    }}
                                  >
                                    {categorie.nomcategorie}
                                  </Typography>
                                </Box>

                                {categorie.description && (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mb: 1, fontSize: "0.875rem" }}
                                  >
                                    {categorie.description.length > 100
                                      ? `${categorie.description.substring(
                                          0,
                                          100
                                        )}...`
                                      : categorie.description}
                                  </Typography>
                                )}

                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mt: 2,
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    ID: {categorie.idcategoriesujet}
                                  </Typography>
                                  <Box sx={{ display: "flex", gap: 0.5 }}>
                                    <Tooltip title="Modifier">
                                      <IconButton
                                        size="small"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEdit(categorie);
                                        }}
                                      >
                                        <Edit fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Voir détails">
                                      <IconButton size="small">
                                        <Visibility fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}

            {/* Catégories non utilisées */}
            {categoriesNonUtilisees.length > 0 &&
              (!selectedDomaineFilter ||
                selectedDomaineFilter === "unused") && (
                <Accordion sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        width: "100%",
                      }}
                    >
                      <Category color="warning" />
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: "medium", color: "warning.main" }}
                      >
                        Catégories non utilisées
                      </Typography>
                      <Chip
                        label={`${categoriesNonUtilisees.length} catégorie(s)`}
                        size="small"
                        color="warning"
                        variant="outlined"
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      {categoriesNonUtilisees
                        .filter(
                          (cat) =>
                            cat.nomcategorie
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                            (cat.description &&
                              cat.description
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase()))
                        )
                        .map((categorie) => (
                          <Grid
                            item
                            xs={12}
                            sm={6}
                            md={4}
                            key={categorie.idcategoriesujet}
                          >
                            <Card
                              variant="outlined"
                              sx={{
                                height: "100%",
                                cursor: "pointer",
                                "&:hover": { boxShadow: 2 },
                                borderLeft: categorie.couleur
                                  ? `4px solid ${categorie.couleur}`
                                  : undefined,
                                opacity: 0.7,
                              }}
                              onClick={() => handleEdit(categorie)}
                            >
                              <CardContent sx={{ p: 2 }}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    mb: 1,
                                  }}
                                >
                                  {categorie.couleur && (
                                    <Avatar
                                      sx={{
                                        width: 24,
                                        height: 24,
                                        bgcolor: categorie.couleur,
                                      }}
                                    >
                                      <span />
                                    </Avatar>
                                  )}
                                  <Typography
                                    variant="h6"
                                    sx={{
                                      fontSize: "1rem",
                                      fontWeight: "medium",
                                    }}
                                  >
                                    {categorie.nomcategorie}
                                  </Typography>
                                </Box>

                                {categorie.description && (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mb: 1, fontSize: "0.875rem" }}
                                  >
                                    {categorie.description.length > 100
                                      ? `${categorie.description.substring(
                                          0,
                                          100
                                        )}...`
                                      : categorie.description}
                                  </Typography>
                                )}

                                <Typography
                                  variant="caption"
                                  color="warning.main"
                                  sx={{ fontStyle: "italic" }}
                                >
                                  Non utilisée dans les grilles
                                </Typography>

                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mt: 2,
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    ID: {categorie.idcategoriesujet}
                                  </Typography>
                                  <Box sx={{ display: "flex", gap: 0.5 }}>
                                    <Tooltip title="Modifier">
                                      <IconButton
                                        size="small"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEdit(categorie);
                                        }}
                                      >
                                        <Edit fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Voir détails">
                                      <IconButton size="small">
                                        <Visibility fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              )}
          </Box>
        ) : (
          /* Vue tableau classique */
          <>
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
                    <TableCell>Catégorie</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Grilles qualité</TableCell>
                    <TableCell align="center">Couleur</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedCategories.map((categorie) => (
                    <TableRow
                      key={categorie.idcategoriesujet}
                      hover
                      selected={isSelected(categorie.idcategoriesujet)}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isSelected(categorie.idcategoriesujet)}
                          onChange={() =>
                            handleSelectOne(categorie.idcategoriesujet)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          {categorie.couleur && (
                            <Avatar
                              sx={{
                                width: 24,
                                height: 24,
                                bgcolor: categorie.couleur,
                              }}
                            >
                              <span />
                            </Avatar>
                          )}
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {categorie.nomcategorie}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              ID: {categorie.idcategoriesujet}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {categorie.description ? (
                          <Typography variant="body2" sx={{ maxWidth: 300 }}>
                            {categorie.description.length > 80
                              ? `${categorie.description.substring(0, 80)}...`
                              : categorie.description}
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
                      <TableCell>
                        {categorie.domaines && categorie.domaines.length > 0 ? (
                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                          >
                            {categorie.domaines.slice(0, 3).map((domaine) => (
                              <Chip
                                key={domaine.iddomaine}
                                label={domaine.nomdomaine}
                                size="small"
                                variant="outlined"
                                color="primary"
                                sx={{ fontSize: "0.7rem" }}
                              />
                            ))}
                            {categorie.domaines.length > 3 && (
                              <Chip
                                label={`+${
                                  categorie.domaines.length - 3
                                } autres`}
                                size="small"
                                variant="outlined"
                                color="default"
                                sx={{ fontSize: "0.7rem" }}
                              />
                            )}
                          </Box>
                        ) : (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            fontStyle="italic"
                          >
                            Non utilisée
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {categorie.couleur ? (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 1,
                            }}
                          >
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                bgcolor: categorie.couleur,
                                border: "2px solid",
                                borderColor: "divider",
                              }}
                            >
                              <span />
                            </Avatar>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {categorie.couleur}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Aucune
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Modifier">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(categorie)}
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

            {/* Pagination pour vue tableau */}
            <TablePagination
              component="div"
              count={filteredCategories.length}
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
          </>
        )}
      </Box>

      {/* Dialog de formulaire */}
      <Dialog
        open={formDialogOpen}
        onClose={() => {
          setFormDialogOpen(false);
          setCurrentCategorie(null);
          setMode("view");
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {mode === "create" ? "Créer une catégorie" : "Modifier la catégorie"}
        </DialogTitle>
        <DialogContent>
          <CategorieForm
            categorie={currentCategorie}
            mode={mode}
            loading={saving}
            onSave={handleSave}
            onCancel={() => {
              setFormDialogOpen(false);
              setCurrentCategorie(null);
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
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography>
              <strong>Attention !</strong> Supprimer une catégorie supprimera
              également :
            </Typography>
            <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
              <li>Tous les sujets associés à cette catégorie</li>
              <li>Toutes les pondérations de ces sujets</li>
            </ul>
          </Alert>
          <Typography>
            Êtes-vous sûr de vouloir supprimer {selectedCategories.length}{" "}
            catégorie(s) ? Cette action est irréversible.
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
