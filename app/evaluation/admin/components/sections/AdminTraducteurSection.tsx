// app/evaluation/admin/components/sections/AdminTraducteurSection.tsx
"use client";

import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Rating,
  IconButton,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Card,
  CardContent,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  SwapHoriz as SwapHorizIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import {
  AdminTraducteurSectionProps, // ✅ Import de l'interface complète
} from "../../types/admin";

export const AdminTraducteurSection: React.FC<AdminTraducteurSectionProps> = ({
  sujets,
  pratiques,
  sujetsPratiques,
  categoriesPratiques,
  categoriesSujets, // ✅ Maintenant disponible dans l'interface
  selectedSujet,
  loading,
  saving,
  onSujetChange,
  onAddPratique,
  onUpdateImportance,
  onRemovePratique,
  onSave,
  onRefresh,
}) => {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [selectedPratique, setSelectedPratique] = useState<string>("");
  const [selectedImportance, setSelectedImportance] = useState<number>(3);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Obtenir le sujet sélectionné
  const currentSujet = useMemo(() => {
    return selectedSujet
      ? sujets.find((s) => s.idsujet === parseInt(selectedSujet))
      : null;
  }, [selectedSujet, sujets]);

  // Pratiques liées au sujet sélectionné
  const linkedPratiques = useMemo(() => {
    if (!selectedSujet) return [];
    const sujetId = parseInt(selectedSujet);
    return sujetsPratiques
      .filter((sp) => sp.idsujet === sujetId)
      .map((sp) => ({
        ...pratiques.find((p) => p.idpratique === sp.idpratique),
        importance: sp.importance,
        sujetPratiqueId: `${sp.idsujet}-${sp.idpratique}`,
      }))
      .filter(Boolean);
  }, [selectedSujet, sujetsPratiques, pratiques]);

  // Pratiques disponibles (non encore liées)
  const availablePratiques = useMemo(() => {
    if (!selectedSujet) return pratiques;
    const sujetId = parseInt(selectedSujet);
    const linkedIds = sujetsPratiques
      .filter((sp) => sp.idsujet === sujetId)
      .map((sp) => sp.idpratique);
    return pratiques.filter((p) => !linkedIds.includes(p.idpratique));
  }, [selectedSujet, sujetsPratiques, pratiques]);

  // Grouper les pratiques par catégorie
  const pratiquesGroupedByCategory = useMemo(() => {
    const grouped = linkedPratiques.reduce(
      (acc, pratique) => {
        const categoryId = pratique.idcategoriepratique || 0;
        const category = categoriesPratiques.find(
          (c) => c.idcategoriepratique === categoryId
        );
        const categoryName = category?.nomcategorie || "Sans catégorie";

        if (!acc[categoryName]) {
          acc[categoryName] = {
            category,
            pratiques: [],
          };
        }
        acc[categoryName].pratiques.push(pratique);
        return acc;
      },
      {} as Record<string, { category?: any; pratiques: any[] }> // ✅ Type any pour éviter les conflits
    );

    // Trier les pratiques par importance dans chaque catégorie
    Object.values(grouped).forEach((group) => {
      group.pratiques.sort((a, b) => b.importance - a.importance);
    });

    return grouped;
  }, [linkedPratiques, categoriesPratiques]);

  const handleAddPratique = () => {
    if (!selectedSujet || !selectedPratique) return;

    const sujetId = parseInt(selectedSujet);
    const pratiqueId = parseInt(selectedPratique);

    onAddPratique(sujetId, pratiqueId, selectedImportance);

    // Reset form et fermer dialog
    setSelectedPratique("");
    setSelectedImportance(3);
    setOpenAddDialog(false);
  };

  const handleImportanceChange = (
    idpratique: number,
    newImportance: number
  ) => {
    if (!selectedSujet) return;
    const sujetId = parseInt(selectedSujet);
    onUpdateImportance(sujetId, idpratique, newImportance);
  };

  const handleRemovePratique = (idpratique: number) => {
    if (!selectedSujet) return;
    const sujetId = parseInt(selectedSujet);
    onRemovePratique(sujetId, idpratique);
  };

  const getImportanceColor = (importance: number) => {
    if (importance >= 4) return "error";
    if (importance >= 3) return "warning";
    return "info";
  };

  const getImportanceLabel = (importance: number) => {
    switch (importance) {
      case 5:
        return "Critique";
      case 4:
        return "Très important";
      case 3:
        return "Important";
      case 2:
        return "Modéré";
      case 1:
        return "Faible";
      default:
        return "Non défini";
    }
  };

  if (!selectedSujet) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="info">
          Veuillez sélectionner un sujet pour gérer ses pratiques associées.
        </Alert>
      </Paper>
    );
  }

  return (
    <Box>
      {/* En-tête */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <SwapHorizIcon sx={{ mr: 2, color: "primary.main" }} />
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              Traducteur Sujets ↔ Pratiques
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant={viewMode === "table" ? "contained" : "outlined"}
              size="small"
              onClick={() => setViewMode("table")}
            >
              Tableau
            </Button>
            <Button
              variant={viewMode === "cards" ? "contained" : "outlined"}
              size="small"
              onClick={() => setViewMode("cards")}
            >
              Cartes
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={onRefresh}
              disabled={loading}
            >
              Actualiser
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={onSave}
              disabled={saving}
            >
              Sauvegarder
            </Button>
          </Box>
        </Box>

        {currentSujet && (
          <Box>
            {/* Catégorie du sujet */}
            {currentSujet.idcategoriesujet && (
              <Box sx={{ mb: 2 }}>
                {(() => {
                  const categorieSujet = categoriesSujets.find(
                    (
                      cat: any // ✅ Type any explicite pour éviter l'erreur
                    ) => cat.idcategoriesujet === currentSujet.idcategoriesujet
                  );

                  return (
                    <Box>
                      <Chip
                        label={
                          categorieSujet
                            ? `Catégorie: ${categorieSujet.nomcategorie}`
                            : `Catégorie: ${currentSujet.idcategoriesujet}`
                        }
                        size="small"
                        color="secondary"
                        variant="outlined"
                        sx={{
                          fontWeight: "bold",
                          backgroundColor:
                            categorieSujet?.couleur || "transparent",
                          color: categorieSujet?.couleur ? "white" : "inherit",
                          border: categorieSujet?.couleur
                            ? "none"
                            : "1px solid",
                        }}
                      />

                      {/* Description de la catégorie */}
                      {categorieSujet?.description && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            mt: 0.5,
                            display: "block",
                            fontStyle: "italic",
                          }}
                        >
                          {categorieSujet.description}
                        </Typography>
                      )}
                    </Box>
                  );
                })()}
              </Box>
            )}

            <Typography variant="h6" color="primary">
              {currentSujet.nomsujet}
            </Typography>

            {/* Description du sujet */}
            {currentSujet.description && (
              <Typography
                variant="body1"
                color="text.primary"
                sx={{ mt: 1, mb: 1 }}
              >
                {currentSujet.description}
              </Typography>
            )}

            <Chip
              label={`${linkedPratiques.length} pratique(s) associée(s)`}
              color="primary"
              variant="outlined"
              sx={{ mt: 1 }}
            />
          </Box>
        )}
      </Paper>

      {/* Actions */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenAddDialog(true)}
          disabled={availablePratiques.length === 0}
        >
          Associer une pratique
        </Button>
        {availablePratiques.length === 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ ml: 2, display: "inline" }}
          >
            Toutes les pratiques sont déjà associées
          </Typography>
        )}
      </Paper>

      {/* Contenu principal */}
      {viewMode === "table" ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Pratique</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Catégorie</TableCell>
                <TableCell>Importance</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {linkedPratiques.map((pratique: any) => {
                // ✅ Type any pour éviter les conflits
                const category = categoriesPratiques.find(
                  (c) => c.idcategoriepratique === pratique.idcategoriepratique
                );

                return (
                  <TableRow key={pratique.idpratique}>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {pratique.nompratique}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {pratique.description || "Aucune description"}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      {category && (
                        <Chip
                          label={category.nomcategorie}
                          size="small"
                          sx={{
                            backgroundColor: category.couleur || "#e0e0e0",
                            color: "white",
                          }}
                        />
                      )}
                    </TableCell>

                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Rating
                          value={pratique.importance}
                          max={5}
                          onChange={(_, newValue) => {
                            if (newValue) {
                              handleImportanceChange(
                                pratique.idpratique,
                                newValue
                              );
                            }
                          }}
                        />
                        <Chip
                          label={getImportanceLabel(pratique.importance)}
                          size="small"
                          color={getImportanceColor(pratique.importance)}
                        />
                      </Box>
                    </TableCell>

                    <TableCell>
                      <IconButton
                        color="error"
                        onClick={() =>
                          handleRemovePratique(pratique.idpratique)
                        }
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box>
          {Object.entries(pratiquesGroupedByCategory).map(
            ([categoryName, group]) => (
              <Accordion key={categoryName} defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography variant="h6">{categoryName}</Typography>
                    <Chip
                      label={`${group.pratiques.length} pratique(s)`}
                      size="small"
                      color="primary"
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {group.pratiques.map(
                      (
                        pratique: any // ✅ Type any
                      ) => (
                        <Grid
                          item
                          xs={12}
                          md={6}
                          lg={4}
                          key={pratique.idpratique}
                        >
                          <Card>
                            <CardContent>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "flex-start",
                                }}
                              >
                                <Typography variant="h6" component="h3">
                                  {pratique.nompratique}
                                </Typography>
                                <IconButton
                                  color="error"
                                  onClick={() =>
                                    handleRemovePratique(pratique.idpratique)
                                  }
                                  size="small"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>

                              {pratique.description && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ mt: 1 }}
                                >
                                  {pratique.description}
                                </Typography>
                              )}

                              <Box sx={{ mt: 2 }}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                  Importance:
                                </Typography>
                                <Rating
                                  value={pratique.importance}
                                  max={5}
                                  onChange={(_, newValue) => {
                                    if (newValue) {
                                      handleImportanceChange(
                                        pratique.idpratique,
                                        newValue
                                      );
                                    }
                                  }}
                                />
                                <Chip
                                  label={getImportanceLabel(
                                    pratique.importance
                                  )}
                                  size="small"
                                  color={getImportanceColor(
                                    pratique.importance
                                  )}
                                  sx={{ ml: 1 }}
                                />
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      )
                    )}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            )
          )}
        </Box>
      )}

      {/* Dialog d'ajout */}
      <Dialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Associer une pratique</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {/* Groupement par catégories */}
            <Typography variant="h6" sx={{ mb: 2 }}>
              Sélectionner une pratique par catégorie :
            </Typography>

            <Box sx={{ maxHeight: 400, overflowY: "auto", mb: 3 }}>
              {Object.entries(
                availablePratiques.reduce(
                  (acc, pratique) => {
                    const categoryId = pratique.idcategoriepratique || 0;
                    const category = categoriesPratiques.find(
                      (c) => c.idcategoriepratique === categoryId
                    );
                    const categoryName =
                      category?.nomcategorie || "Sans catégorie";

                    if (!acc[categoryName]) {
                      acc[categoryName] = {
                        category,
                        pratiques: [],
                      };
                    }
                    acc[categoryName].pratiques.push(pratique);
                    return acc;
                  },
                  {} as Record<
                    string,
                    { category?: any; pratiques: any[] } // ✅ Type any
                  >
                )
              ).map(([categoryName, group]) => (
                <Accordion key={categoryName} sx={{ mb: 1 }}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      backgroundColor:
                        group.category?.couleur || "action.hover",
                      color: group.category?.couleur ? "white" : "text.primary",
                      "&:hover": {
                        backgroundColor: group.category?.couleur
                          ? `${group.category.couleur}dd`
                          : "action.selected",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        width: "100%",
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "bold" }}
                      >
                        {categoryName}
                      </Typography>
                      <Chip
                        label={`${group.pratiques.length} pratique(s)`}
                        size="small"
                        sx={{
                          backgroundColor: group.category?.couleur
                            ? "rgba(255,255,255,0.2)"
                            : "primary.main",
                          color: group.category?.couleur
                            ? "white"
                            : "primary.contrastText",
                        }}
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={1}>
                      {group.pratiques.map(
                        (
                          pratique: any // ✅ Type any
                        ) => (
                          <Grid item xs={12} key={pratique.idpratique}>
                            <Paper
                              elevation={
                                selectedPratique ===
                                pratique.idpratique.toString()
                                  ? 3
                                  : 1
                              }
                              sx={{
                                p: 2,
                                cursor: "pointer",
                                border:
                                  selectedPratique ===
                                  pratique.idpratique.toString()
                                    ? `2px solid ${group.category?.couleur || "primary.main"}`
                                    : "1px solid",
                                borderColor:
                                  selectedPratique ===
                                  pratique.idpratique.toString()
                                    ? group.category?.couleur || "primary.main"
                                    : "divider",
                                backgroundColor:
                                  selectedPratique ===
                                  pratique.idpratique.toString()
                                    ? "action.selected"
                                    : "background.paper",
                                "&:hover": {
                                  backgroundColor: "action.hover",
                                  borderColor:
                                    group.category?.couleur || "primary.main",
                                },
                              }}
                              onClick={() =>
                                setSelectedPratique(
                                  pratique.idpratique.toString()
                                )
                              }
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  mb: 1,
                                }}
                              >
                                <Typography
                                  variant="subtitle2"
                                  sx={{ fontWeight: "bold" }}
                                >
                                  {pratique.nompratique}
                                </Typography>
                                {/* ✅ Condition sécurisée pour valeurnumérique */}
                                {pratique.valeurnumérique !== undefined &&
                                  pratique.valeurnumérique === 0 && (
                                    <Chip
                                      label="À coacher"
                                      size="small"
                                      color="warning"
                                      variant="outlined"
                                    />
                                  )}
                              </Box>
                              {pratique.description && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {pratique.description.length > 150
                                    ? `${pratique.description.substring(0, 150)}...`
                                    : pratique.description}
                                </Typography>
                              )}
                              {/* ✅ Condition sécurisée pour geste */}
                              {pratique.geste && (
                                <Typography
                                  variant="caption"
                                  color="primary"
                                  sx={{ mt: 1, display: "block" }}
                                >
                                  Geste: {pratique.geste.substring(0, 100)}...
                                </Typography>
                              )}
                            </Paper>
                          </Grid>
                        )
                      )}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>

            {selectedPratique && (
              <Box
                sx={{
                  p: 2,
                  backgroundColor: "action.selected",
                  borderRadius: 1,
                  mb: 2,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                  Pratique sélectionnée:{" "}
                  {
                    availablePratiques.find(
                      (p) => p.idpratique.toString() === selectedPratique
                    )?.nompratique
                  }
                </Typography>
              </Box>
            )}

            <Box>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Niveau d'importance (1-5):
              </Typography>
              <Rating
                value={selectedImportance}
                max={5}
                onChange={(_, newValue) => {
                  if (newValue) setSelectedImportance(newValue);
                }}
              />
              <Chip
                label={getImportanceLabel(selectedImportance)}
                size="small"
                color={getImportanceColor(selectedImportance)}
                sx={{ ml: 2 }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Annuler</Button>
          <Button
            onClick={handleAddPratique}
            variant="contained"
            disabled={!selectedPratique}
          >
            Associer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
