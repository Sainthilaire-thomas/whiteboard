// app/evaluation/admin/components/sections/dialogs/AssociationGrilleDialog.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Divider,
  Alert,
  Grid,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";
import {
  Business,
  Delete,
  Add,
  Search,
  Link,
  LinkOff,
  Save,
  Cancel,
  Group,
  CheckCircle,
  RadioButtonUnchecked,
} from "@mui/icons-material";
import { DomaineQualite, Entreprise } from "../../../types/admin";
import { AdminDataService } from "../../../services/adminDataService";

interface AssociationGrilleDialogProps {
  open: boolean;
  grille: DomaineQualite | null;
  onClose: () => void;
  onSaved: () => void;
  onError: (error: string) => void;
  onSuccess: (message: string) => void;
}

export const AssociationGrilleDialog: React.FC<
  AssociationGrilleDialogProps
> = ({ open, grille, onClose, onSaved, onError, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [toutesEntreprises, setToutesEntreprises] = useState<Entreprise[]>([]);
  const [entreprisesAssociees, setEntreprisesAssociees] = useState<
    Entreprise[]
  >([]);
  const [entreprisesSelectionnees, setEntreprisesSelectionnees] = useState<
    Set<number>
  >(new Set());

  const dataService = new AdminDataService();

  // Chargement des données
  useEffect(() => {
    if (open && grille) {
      loadData();
    }
  }, [open, grille]);

  const loadData = async () => {
    if (!grille) return;

    try {
      setLoading(true);

      // Charger toutes les entreprises
      const toutesEntreprisesData = await dataService.loadEntreprises();
      setToutesEntreprises(toutesEntreprisesData);

      // Charger les entreprises associées à cette grille
      const entreprisesAssocieesData =
        await dataService.loadEntreprisesForDomaineQualite(grille.iddomaine);
      setEntreprisesAssociees(entreprisesAssocieesData);

      // Initialiser la sélection avec les entreprises déjà associées
      const idsAssocies = new Set(
        entreprisesAssocieesData.map((e) => e.identreprise)
      );
      setEntreprisesSelectionnees(idsAssocies);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      onError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  // Filtrage des entreprises
  const entreprisesFiltrees = toutesEntreprises.filter((entreprise) =>
    entreprise.nomentreprise.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Gestion de la sélection
  const handleToggleEntreprise = (entrepriseId: number) => {
    setEntreprisesSelectionnees((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(entrepriseId)) {
        newSet.delete(entrepriseId);
      } else {
        newSet.add(entrepriseId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const allIds = new Set(toutesEntreprises.map((e) => e.identreprise));
    setEntreprisesSelectionnees(allIds);
  };

  const handleDeselectAll = () => {
    setEntreprisesSelectionnees(new Set());
  };

  // Sauvegarde des associations
  const handleSave = async () => {
    if (!grille) return;

    try {
      setSaving(true);

      // Entreprises actuellement associées
      const entreprisesActuelles = new Set(
        entreprisesAssociees.map((e) => e.identreprise)
      );

      // Entreprises à associer (nouvelles sélections)
      const entreprisesAAssocier = Array.from(entreprisesSelectionnees).filter(
        (id) => !entreprisesActuelles.has(id)
      );

      // Entreprises à dissocier (déselections)
      const entreprisesADissocier = Array.from(entreprisesActuelles).filter(
        (id) => !entreprisesSelectionnees.has(id)
      );

      // Effectuer les associations
      for (const entrepriseId of entreprisesAAssocier) {
        await dataService.linkEntrepriseToDomaine(
          entrepriseId,
          grille.iddomaine
        );
      }

      // Effectuer les dissociations
      for (const entrepriseId of entreprisesADissocier) {
        await dataService.unlinkEntrepriseFromDomaine(
          entrepriseId,
          grille.iddomaine
        );
      }

      const totalChanges =
        entreprisesAAssocier.length + entreprisesADissocier.length;
      if (totalChanges > 0) {
        onSuccess(
          `${totalChanges} association(s) mise(s) à jour pour la grille "${grille.nomdomaine}"`
        );
      }

      onSaved();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      onError("Erreur lors de la sauvegarde des associations");
    } finally {
      setSaving(false);
    }
  };

  // Statistiques
  const nombreSelectionne = entreprisesSelectionnees.size;
  const nombreInitial = entreprisesAssociees.length;
  const nombreChangements = Math.abs(nombreSelectionne - nombreInitial);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { height: "80vh" } }}
    >
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Link color="primary" />
          <Typography variant="h6">
            Gérer les associations - {grille?.nomdomaine}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Sélectionnez les entreprises qui utiliseront cette grille qualité
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            {/* Statistiques */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={4}>
                <Card sx={{ bgcolor: "primary.50" }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="h6" color="primary">
                      {nombreSelectionne}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Sélectionnées
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={4}>
                <Card sx={{ bgcolor: "info.50" }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="h6" color="info.main">
                      {nombreInitial}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Actuelles
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={4}>
                <Card
                  sx={{
                    bgcolor:
                      nombreChangements > 0 ? "warning.50" : "success.50",
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Typography
                      variant="h6"
                      color={
                        nombreChangements > 0 ? "warning.main" : "success.main"
                      }
                    >
                      {nombreChangements}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Changements
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Recherche et actions */}
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                placeholder="Rechercher une entreprise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              {/* Actions rapides */}
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<CheckCircle />}
                  onClick={handleSelectAll}
                >
                  Tout sélectionner
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<RadioButtonUnchecked />}
                  onClick={handleDeselectAll}
                >
                  Tout désélectionner
                </Button>
              </Box>
            </Box>

            {/* Liste des entreprises */}
            <Box
              sx={{
                maxHeight: 400,
                overflow: "auto",
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
              }}
            >
              {entreprisesFiltrees.length === 0 ? (
                <Box sx={{ p: 3, textAlign: "center" }}>
                  <Typography color="text.secondary">
                    {searchTerm
                      ? "Aucune entreprise trouvée"
                      : "Aucune entreprise disponible"}
                  </Typography>
                </Box>
              ) : (
                <List dense>
                  {entreprisesFiltrees.map((entreprise, index) => {
                    const isSelected = entreprisesSelectionnees.has(
                      entreprise.identreprise
                    );
                    const wasInitiallyAssociated = entreprisesAssociees.some(
                      (e) => e.identreprise === entreprise.identreprise
                    );

                    return (
                      <React.Fragment key={entreprise.identreprise}>
                        <ListItem>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={isSelected}
                                onChange={() =>
                                  handleToggleEntreprise(
                                    entreprise.identreprise
                                  )
                                }
                                color="primary"
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {entreprise.nomentreprise}
                                </Typography>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    mt: 0.5,
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    ID: {entreprise.identreprise}
                                  </Typography>
                                  {entreprise.domaine && (
                                    <Chip
                                      label={entreprise.domaine}
                                      size="small"
                                      variant="outlined"
                                      sx={{ height: 20, fontSize: "0.7rem" }}
                                    />
                                  )}
                                  {wasInitiallyAssociated && (
                                    <Chip
                                      label="Actuellement associée"
                                      size="small"
                                      color="info"
                                      variant="filled"
                                      sx={{ height: 20, fontSize: "0.7rem" }}
                                    />
                                  )}
                                </Box>
                              </Box>
                            }
                            sx={{ width: "100%", m: 0 }}
                          />
                        </ListItem>
                        {index < entreprisesFiltrees.length - 1 && <Divider />}
                      </React.Fragment>
                    );
                  })}
                </List>
              )}
            </Box>

            {/* Résumé des changements */}
            {nombreChangements > 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Changements à appliquer :</strong>
                </Typography>
                <ul style={{ margin: "4px 0", paddingLeft: "20px" }}>
                  {nombreSelectionne > nombreInitial && (
                    <li>
                      {nombreSelectionne - nombreInitial} nouvelle(s)
                      association(s)
                    </li>
                  )}
                  {nombreSelectionne < nombreInitial && (
                    <li>{nombreInitial - nombreSelectionne} dissociation(s)</li>
                  )}
                </ul>
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          <Cancel sx={{ mr: 1 }} />
          Annuler
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving || loading}
          startIcon={saving ? <CircularProgress size={16} /> : <Save />}
        >
          {saving ? "Sauvegarde..." : "Sauvegarder"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
