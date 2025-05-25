"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import {
  Save,
  Refresh,
  AdminPanelSettings,
  Business,
  Category,
  TuneOutlined,
  Info,
} from "@mui/icons-material";
import { useAppContext } from "@/context/AppContext";
import { useSupabase } from "@/context/SupabaseContext";

// Types basés sur la vraie structure
interface PonderationSujet {
  id_ponderation?: number;
  idsujet: number;
  conforme: number;
  partiellement_conforme: number;
  non_conforme: number;
  permet_partiellement_conforme: boolean;
}

interface Entreprise {
  identreprise: number;
  nomentreprise: string;
  logo?: string;
  domaine?: string;
  created_at?: string;
}

interface Domaine {
  iddomaine: number;
  nomdomaine: string;
}

interface EntrepriseDomaine {
  identreprise: number;
  iddomaine: number;
}

interface Sujet {
  idsujet: number;
  nomsujet: string;
  description?: string;
  valeurnumérique?: number;
  idcategoriesujet: number;
  iddomaine: number;
}

const AdminPonderationPage: React.FC = () => {
  const { supabase } = useSupabase();
  const { categoriesSujets } = useAppContext();

  // États
  const [selectedEntreprise, setSelectedEntreprise] = useState<string>("");
  const [selectedDomaine, setSelectedDomaine] = useState<string>("");
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [domaines, setDomaines] = useState<Domaine[]>([]);
  const [sujets, setSujets] = useState<Sujet[]>([]);
  const [ponderations, setPonderations] = useState<PonderationSujet[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Charger les entreprises au montage
  useEffect(() => {
    loadEntreprises();
  }, []);

  // Charger les données quand une entreprise est sélectionnée
  useEffect(() => {
    if (selectedEntreprise) {
      loadDomainesForEntreprise(parseInt(selectedEntreprise));
    } else {
      // Reset des sélections
      setSelectedDomaine("");
      setDomaines([]);
      setSujets([]);
      setPonderations([]);
    }
  }, [selectedEntreprise]);

  // Charger les sujets quand un domaine est sélectionné
  useEffect(() => {
    if (selectedEntreprise && selectedDomaine) {
      loadSujetsForDomaine(parseInt(selectedDomaine));
    } else {
      setSujets([]);
      setPonderations([]);
    }
  }, [selectedDomaine]);

  // Fonction pour charger les entreprises
  const loadEntreprises = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("entreprises")
        .select("identreprise, nomentreprise, logo, domaine")
        .order("nomentreprise");

      if (error) throw error;
      setEntreprises(data || []);
    } catch (err) {
      setError("Erreur lors du chargement des entreprises");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour charger les domaines d'une entreprise
  const loadDomainesForEntreprise = async (entrepriseId: number) => {
    try {
      setLoading(true);
      setError("");
      setSelectedDomaine(""); // Reset de la sélection de domaine

      // Charger les domaines liés à cette entreprise via la table de liaison
      const { data: entrepriseDomainesData, error: entrepriseDomainesError } =
        await supabase
          .from("entreprise_domaines")
          .select("iddomaine")
          .eq("identreprise", entrepriseId);

      if (entrepriseDomainesError) throw entrepriseDomainesError;

      const domaineIds = (entrepriseDomainesData || []).map(
        (ed) => ed.iddomaine
      );

      if (domaineIds.length > 0) {
        // Charger les informations des domaines
        const { data: domainesData, error: domainesError } = await supabase
          .from("domaines")
          .select("iddomaine, nomdomaine")
          .in("iddomaine", domaineIds)
          .order("nomdomaine");

        if (domainesError) throw domainesError;
        setDomaines(domainesData || []);
      } else {
        setDomaines([]);
      }
    } catch (err) {
      setError("Erreur lors du chargement des domaines");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour charger les sujets d'un domaine
  const loadSujetsForDomaine = async (domaineId: number) => {
    try {
      setLoading(true);
      setError("");

      // Charger les sujets pour ce domaine
      const { data: sujetsData, error: sujetsError } = await supabase
        .from("sujets")
        .select(
          "idsujet, nomsujet, description, valeurnumérique, idcategoriesujet, iddomaine"
        )
        .eq("iddomaine", domaineId)
        .order("nomsujet");

      if (sujetsError) throw sujetsError;
      setSujets(sujetsData || []);

      // Charger les pondérations existantes pour ces sujets
      const sujetIds = (sujetsData || []).map((s) => s.idsujet);
      if (sujetIds.length > 0) {
        const { data: ponderationsData, error: ponderationsError } =
          await supabase
            .from("ponderation_sujets")
            .select("*")
            .in("idsujet", sujetIds);

        if (ponderationsError) throw ponderationsError;
        setPonderations(ponderationsData || []);
      } else {
        setPonderations([]);
      }
    } catch (err) {
      setError("Erreur lors du chargement des sujets du domaine");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour obtenir la pondération d'un sujet
  const getPonderationForSujet = (idsujet: number): PonderationSujet => {
    const ponderation = ponderations.find((p) => p.idsujet === idsujet);
    return (
      ponderation || {
        idsujet,
        conforme: 3,
        partiellement_conforme: 1,
        non_conforme: 0,
        permet_partiellement_conforme: true,
      }
    );
  };

  // Fonction pour mettre à jour une pondération
  const updatePonderation = (
    idsujet: number,
    field: keyof PonderationSujet,
    value: number | boolean
  ) => {
    setPonderations((prev) => {
      const existing = prev.find((p) => p.idsujet === idsujet);

      if (existing) {
        // Mettre à jour l'existant
        return prev.map((p) =>
          p.idsujet === idsujet ? { ...p, [field]: value } : p
        );
      } else {
        // Ajouter nouveau avec les valeurs par défaut
        const newPonderation: PonderationSujet = {
          idsujet,
          conforme: 3,
          partiellement_conforme: 1,
          non_conforme: 0,
          permet_partiellement_conforme: true,
          [field]: value,
        };
        return [...prev, newPonderation];
      }
    });
  };

  // Fonction pour sauvegarder les pondérations
  const savePonderations = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const { error } = await supabase.from("ponderation_sujets").upsert(
        ponderations.map((p) => ({
          idsujet: p.idsujet,
          conforme: p.conforme,
          partiellement_conforme: p.partiellement_conforme,
          non_conforme: p.non_conforme,
          permet_partiellement_conforme: p.permet_partiellement_conforme,
        })),
        {
          onConflict: ["idsujet"],
        }
      );

      if (error) throw error;
      setSuccess("Pondérations sauvegardées avec succès !");

      // Rafraîchir les données
      await loadSujetsForDomaine(parseInt(selectedDomaine));
    } catch (err) {
      setError("Erreur lors de la sauvegarde");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Grouper les sujets par catégorie pour le domaine sélectionné
  const sujetsByCategory = selectedDomaine
    ? categoriesSujets
        .filter((cat) =>
          sujets.some((s) => s.idcategoriesujet === cat.idcategoriesujet)
        )
        .map((cat) => ({
          ...cat,
          sujets: sujets.filter(
            (s) => s.idcategoriesujet === cat.idcategoriesujet
          ),
        }))
        .filter((cat) => cat.sujets.length > 0)
    : [];

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <AdminPanelSettings sx={{ mr: 2, color: "primary.main" }} />
          <Typography
            variant="h4"
            sx={{ fontWeight: "bold", color: "primary.main" }}
          >
            Administration - Pondération des Sujets
          </Typography>
        </Box>

        <Alert severity="info" icon={<Info />} sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Système de notation :</strong> Configurez les points
            attribués selon le niveau de conformité.
            <br />• <strong>Conforme</strong> : Points max (recommandé: 3-5
            points)
            <br />• <strong>Partiellement conforme</strong> : Points
            intermédiaires (recommandé: 1-2 points)
            <br />• <strong>Non conforme</strong> : Aucun point (par défaut: 0
            point)
          </Typography>
        </Alert>

        <Typography variant="body1" color="text.secondary">
          Ces pondérations déterminent le calcul du score global de qualité
          selon le niveau de conformité observé.
        </Typography>
      </Paper>

      {/* Sélection d'entreprise et de domaine */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Business sx={{ mr: 1, color: "secondary.main" }} />
          <Typography variant="h6" sx={{ fontWeight: "medium" }}>
            Sélection de l'entreprise et du domaine
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Entreprise</InputLabel>
              <Select
                value={selectedEntreprise}
                onChange={(e: SelectChangeEvent) =>
                  setSelectedEntreprise(e.target.value)
                }
                label="Entreprise"
              >
                <MenuItem value="">
                  <em>Sélectionnez une entreprise</em>
                </MenuItem>
                {entreprises.map((entreprise) => (
                  <MenuItem
                    key={entreprise.identreprise}
                    value={entreprise.identreprise.toString()}
                  >
                    {entreprise.nomentreprise}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl
              fullWidth
              disabled={!selectedEntreprise || domaines.length === 0}
            >
              <InputLabel>Domaine</InputLabel>
              <Select
                value={selectedDomaine}
                onChange={(e: SelectChangeEvent) =>
                  setSelectedDomaine(e.target.value)
                }
                label="Domaine"
              >
                <MenuItem value="">
                  <em>Sélectionnez un domaine</em>
                </MenuItem>
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
          </Grid>
        </Grid>

        {selectedEntreprise && domaines.length === 0 && !loading && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Aucun domaine trouvé pour cette entreprise.
          </Alert>
        )}

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <CircularProgress />
          </Box>
        )}
      </Paper>

      {/* Messages d'état */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Configuration des pondérations */}
      {selectedEntreprise && selectedDomaine && !loading && (
        <Paper sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <TuneOutlined sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="h6" sx={{ fontWeight: "medium" }}>
                Configuration des pondérations
              </Typography>
              <Chip
                label={
                  domaines.find(
                    (d) => d.iddomaine === parseInt(selectedDomaine)
                  )?.nomdomaine || ""
                }
                color="primary"
                sx={{ ml: 2 }}
              />
            </Box>

            <Box>
              <Tooltip title="Rafraîchir les données">
                <IconButton
                  onClick={() =>
                    loadSujetsForDomaine(parseInt(selectedDomaine))
                  }
                  disabled={loading}
                >
                  <Refresh />
                </IconButton>
              </Tooltip>

              <Button
                variant="contained"
                startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                onClick={savePonderations}
                disabled={saving}
                sx={{ ml: 1 }}
              >
                {saving ? "Sauvegarde..." : "Sauvegarder"}
              </Button>
            </Box>
          </Box>

          {sujetsByCategory.length === 0 ? (
            <Alert severity="info">Aucun critère trouvé pour ce domaine.</Alert>
          ) : (
            sujetsByCategory.map((category) => (
              <Box key={category.idcategoriesujet} sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    fontWeight: "medium",
                    color: category.couleur || "text.primary",
                    borderLeft: `4px solid ${category.couleur || "#ccc"}`,
                    pl: 2,
                  }}
                >
                  <Category sx={{ mr: 1, verticalAlign: "middle" }} />
                  {category.nomcategorie}
                </Typography>

                {/* Table des pondérations pour cette catégorie */}
                <Box sx={{ overflowX: "auto" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <strong>Critère</strong>
                        </TableCell>
                        <TableCell align="center">
                          <strong>Conforme</strong>
                        </TableCell>
                        <TableCell align="center">
                          <strong>Partiellement</strong>
                        </TableCell>
                        <TableCell align="center">
                          <strong>Non conforme</strong>
                        </TableCell>
                        <TableCell align="center">
                          <strong>Autoriser "Partiellement"</strong>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {category.sujets.map((sujet) => {
                        const ponderation = getPonderationForSujet(
                          sujet.idsujet
                        );
                        return (
                          <TableRow key={sujet.idsujet}>
                            <TableCell>
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: "medium" }}
                                >
                                  {sujet.nomsujet}
                                </Typography>
                                {sujet.description && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {sujet.description}
                                  </Typography>
                                )}
                                <Chip
                                  label={`ID: ${sujet.idsujet}`}
                                  size="small"
                                  sx={{ mt: 0.5, fontSize: "0.7rem" }}
                                />
                              </Box>
                            </TableCell>

                            <TableCell align="center">
                              <TextField
                                type="number"
                                size="small"
                                inputProps={{ min: 0, max: 10, step: 1 }}
                                value={ponderation.conforme}
                                onChange={(e) =>
                                  updatePonderation(
                                    sujet.idsujet,
                                    "conforme",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                sx={{ width: 80 }}
                              />
                            </TableCell>

                            <TableCell align="center">
                              <TextField
                                type="number"
                                size="small"
                                inputProps={{ min: 0, max: 10, step: 1 }}
                                value={ponderation.partiellement_conforme}
                                onChange={(e) =>
                                  updatePonderation(
                                    sujet.idsujet,
                                    "partiellement_conforme",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                sx={{ width: 80 }}
                                disabled={
                                  !ponderation.permet_partiellement_conforme
                                }
                              />
                            </TableCell>

                            <TableCell align="center">
                              <TextField
                                type="number"
                                size="small"
                                inputProps={{ min: 0, max: 10, step: 1 }}
                                value={ponderation.non_conforme}
                                onChange={(e) =>
                                  updatePonderation(
                                    sujet.idsujet,
                                    "non_conforme",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                sx={{ width: 80 }}
                              />
                            </TableCell>

                            <TableCell align="center">
                              <Switch
                                checked={
                                  ponderation.permet_partiellement_conforme
                                }
                                onChange={(e) =>
                                  updatePonderation(
                                    sujet.idsujet,
                                    "permet_partiellement_conforme",
                                    e.target.checked
                                  )
                                }
                                color="primary"
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Box>
              </Box>
            ))
          )}
        </Paper>
      )}
    </Box>
  );
};

export default AdminPonderationPage;
