"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Divider,
  Grid,
  IconButton,
  Button,
  Chip,
  Card,
  CardContent,
  CardActions,
  Tabs,
  Tab,
  Alert,
  Tooltip,
} from "@mui/material";
import {
  Save,
  PlayArrow,
  FilterList,
  AssessmentOutlined,
  PsychologyOutlined,
  BarChart,
} from "@mui/icons-material";
import { useCallData } from "@/context/CallDataContext";
import { useAppContext } from "@/context/AppContext";
import { useSupabase } from "@/context/SupabaseContext";
import SimplifiedGridContainerSujets from "./SimplifiedGridContainerSujets";
import SimplifiedGridContainerPratiques from "./SimplifiedGridContainerPratiques";
import EvaluationCardCompact from "./EvaluationCardCompact";
import { columnConfigSujets } from "@/config/gridConfig";

export default function SyntheseEvaluation() {
  const { selectedCall, appelPostits } = useCallData();
  const { supabase } = useSupabase();
  const {
    categoriesPratiques,
    pratiques,
    categoriesSujets,
    sujetsData,
    selectedDomain,
  } = useAppContext();

  const [activeTab, setActiveTab] = useState(0);
  const [selectedPostit, setSelectedPostit] = useState(null);
  const [selectedSujet, setSelectedSujet] = useState(null);
  const [selectedPratique, setSelectedPratique] = useState(null);
  const [filteredView, setFilteredView] = useState("all"); // 'all', 'bySubject', 'byPractice'

  // Fonction utilitaire pour récupérer le nom du domaine
  const getDomainName = (iddomaine) => {
    const domaine = categoriesSujets.find(
      (cat) => cat.idcategoriesujet === iddomaine
    );
    return domaine ? domaine.nomcategorie : "Non défini";
  };

  // Filtrage des post-its liés à l'appel
  const filteredPostits = appelPostits.filter(
    (postit) => postit.sujet || postit.pratique
  );

  // Statistiques
  const getStatistics = () => {
    const totalPostits = filteredPostits.length;
    const uniqueSujets = [
      ...new Set(filteredPostits.map((p) => p.sujet).filter(Boolean)),
    ];
    const uniquePratiques = [
      ...new Set(filteredPostits.map((p) => p.pratique).filter(Boolean)),
    ];

    return {
      totalPostits,
      uniqueSujets: uniqueSujets.length,
      uniquePratiques: uniquePratiques.length,
      sujetsDetails: uniqueSujets.map((sujet) => ({
        name: sujet,
        count: filteredPostits.filter((p) => p.sujet === sujet).length,
      })),
      pratiquesDetails: uniquePratiques.map((pratique) => ({
        name: pratique,
        count: filteredPostits.filter((p) => p.pratique === pratique).length,
      })),
    };
  };

  const stats = getStatistics();

  // Grouper les postits par sujet ou pratique pour l'affichage
  const groupedPostits = {
    bySujet: Object.entries(
      filteredPostits.reduce((acc, postit) => {
        if (postit.sujet) {
          if (!acc[postit.sujet]) acc[postit.sujet] = [];
          acc[postit.sujet].push(postit);
        }
        return acc;
      }, {})
    ),
    byPratique: Object.entries(
      filteredPostits.reduce((acc, postit) => {
        if (postit.pratique) {
          if (!acc[postit.pratique]) acc[postit.pratique] = [];
          acc[postit.pratique].push(postit);
        }
        return acc;
      }, {})
    ),
  };

  const [selectedMotif, setSelectedMotif] = useState(null);
  const [formState, setFormState] = useState({
    avancement_formation: false,
    avancement_lieu: false,
    avancement_date: false,
    avancement_financement: false,
    promotion_reseau: false,
    commentaire: "",
    action_client: "",
  });

  const motifs = [
    "STAGIAIRE__ABSENCE",
    "INFORMATION_COLLECTIVE",
    "FORMATION__CONTENU",
    "FORMATION__LIEU",
    "POST_FORMATION",
    "FORMATION__EXISTE",
  ];

  // Gestion des changements du formulaire
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Sauvegarde des données en base
  const handleSave = async () => {
    if (!selectedCall) {
      alert("Aucun appel sélectionné");
      return;
    }

    try {
      const { error } = await supabase.from("motifs_afpa").upsert(
        [
          {
            ...formState,
            callid: selectedCall.callid,
            motifs: selectedMotif,
          },
        ],
        { onConflict: ["callid"] }
      );

      if (error) throw error;
      alert("Motif mis à jour avec succès !");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde :", error);
    }
  };

  // Gestion de la sélection d'un postit pour coaching
  const handleSelectForCoaching = (postit) => {
    setSelectedPostit(postit);
    // Ici, vous pourriez déclencher la navigation vers le module de coaching
    console.log("Selected for coaching:", postit);
  };

  // Filtrage des postits en fonction du sujet ou de la pratique sélectionnée
  const getFilteredPostits = () => {
    if (filteredView === "bySubject" && selectedSujet) {
      return filteredPostits.filter((p) => p.sujet === selectedSujet);
    } else if (filteredView === "byPractice" && selectedPratique) {
      return filteredPostits.filter((p) => p.pratique === selectedPratique);
    }
    return filteredPostits;
  };

  const displayedPostits = getFilteredPostits();

  if (!selectedCall) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6">Aucun appel sélectionné</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2, position: "relative" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography
            variant="h4"
            sx={{ fontWeight: "bold", color: "primary.main" }}
          >
            Synthèse d'évaluation
          </Typography>
          <Tooltip title="Sauvegarder les informations">
            <IconButton
              color="primary"
              onClick={handleSave}
              sx={{
                bgcolor: "primary.light",
                color: "white",
                "&:hover": { bgcolor: "primary.main" },
              }}
            >
              <Save />
            </IconButton>
          </Tooltip>
        </Box>

        <Typography variant="h6" sx={{ mb: 2 }}>
          Appel #{selectedCall.callid} :{" "}
          <span style={{ fontStyle: "italic" }}>
            {selectedCall.description}
          </span>
        </Typography>

        {stats.totalPostits > 0 ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            <strong>{stats.totalPostits} passages</strong> ont été évalués,
            concernant <strong>{stats.uniqueSujets} critères</strong> et
            suggérant <strong>{stats.uniquePratiques} pratiques</strong>{" "}
            d'amélioration.
          </Alert>
        ) : (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Aucun passage n'a encore été évalué pour cet appel.
          </Alert>
        )}
      </Paper>

      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        sx={{
          mb: 3,
          "& .MuiTab-root": {
            fontWeight: "bold",
            fontSize: "0.95rem",
          },
        }}
        variant="fullWidth"
      >
        <Tab icon={<BarChart />} label="SYNTHÈSE" iconPosition="start" />
        <Tab
          icon={<AssessmentOutlined />}
          label="CRITÈRES QUALITÉ"
          iconPosition="start"
        />
        <Tab
          icon={<PsychologyOutlined />}
          label="SIMULATION COACHING"
          iconPosition="start"
        />
      </Tabs>

      {/* ONGLET SYNTHÈSE */}
      {activeTab === 0 && (
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography
            variant="h5"
            sx={{ mb: 2, color: "text.primary", fontWeight: "medium" }}
          >
            Chemin client
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Motif de l'appel</InputLabel>
                <Select
                  value={selectedMotif || ""}
                  onChange={(e) => setSelectedMotif(e.target.value)}
                  label="Motif de l'appel"
                >
                  {motifs.map((motif) => (
                    <MenuItem key={motif} value={motif}>
                      {motif.replace(/_/g, " ")}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Commentaire sur l'appel"
                name="commentaire"
                value={formState.commentaire}
                onChange={handleInputChange}
                multiline
                rows={3}
                fullWidth
                placeholder="Saisissez vos observations générales sur cet appel..."
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4 }}>
            <Typography
              variant="h5"
              sx={{ mb: 2, color: "text.primary", fontWeight: "medium" }}
            >
              Vue d'ensemble des évaluations
            </Typography>

            <Grid container spacing={3}>
              {/* STATISTIQUES DES SUJETS */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: "100%", borderLeft: "4px solid #3f51b5" }}>
                  <CardContent>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Critères qualité identifiés
                    </Typography>
                    {stats.sujetsDetails.map((sujet) => (
                      <Chip
                        key={sujet.name}
                        label={`${sujet.name} (${sujet.count})`}
                        sx={{ m: 0.5 }}
                        color="primary"
                        variant="outlined"
                        onClick={() => {
                          setSelectedSujet(sujet.name);
                          setFilteredView("bySubject");
                          setActiveTab(2);
                        }}
                      />
                    ))}
                  </CardContent>
                </Card>
              </Grid>

              {/* STATISTIQUES DES PRATIQUES */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: "100%", borderLeft: "4px solid #f50057" }}>
                  <CardContent>
                    <Typography variant="h6" color="secondary" gutterBottom>
                      Pratiques à renforcer
                    </Typography>
                    {stats.pratiquesDetails.map((pratique) => (
                      <Chip
                        key={pratique.name}
                        label={`${pratique.name} (${pratique.count})`}
                        sx={{ m: 0.5 }}
                        color="secondary"
                        variant="outlined"
                        onClick={() => {
                          setSelectedPratique(pratique.name);
                          setFilteredView("byPractice");
                          setActiveTab(2);
                        }}
                      />
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      )}

      {/* ONGLET CRITÈRES QUALITÉ */}
      {activeTab === 1 && (
        <>
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography
              variant="h5"
              sx={{ mb: 2, color: "text.primary", fontWeight: "medium" }}
            >
              Critères qualité
            </Typography>
            {selectedDomain && (
              <SimplifiedGridContainerSujets
                categories={categoriesSujets || []}
                items={sujetsData}
                columnConfig={columnConfigSujets}
              />
            )}
          </Paper>

          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography
              variant="h5"
              sx={{ mb: 2, color: "text.primary", fontWeight: "medium" }}
            >
              Pratiques à renforcer
            </Typography>
            <SimplifiedGridContainerPratiques
              categories={categoriesPratiques || []}
              items={pratiques || []}
              columnConfig={{
                categoryIdKey: "idcategoriepratique",
                categoryNameKey: "nomcategorie",
                itemIdKey: "idpratique",
                itemNameKey: "nompratique",
              }}
            />
          </Paper>
        </>
      )}

      {/* ONGLET SIMULATION COACHING */}
      {activeTab === 2 && (
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography
              variant="h5"
              sx={{ color: "text.primary", fontWeight: "medium" }}
            >
              Passages à travailler
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center" }}>
              <FilterList sx={{ mr: 1 }} />
              <FormControl sx={{ minWidth: 200 }}>
                <Select
                  size="small"
                  value={filteredView}
                  onChange={(e) => setFilteredView(e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="all">Tous les passages</MenuItem>
                  <MenuItem value="bySubject">Par critère qualité</MenuItem>
                  <MenuItem value="byPractice">Par pratique</MenuItem>
                </Select>
              </FormControl>

              {filteredView === "bySubject" && (
                <FormControl sx={{ ml: 1, minWidth: 200 }}>
                  <Select
                    size="small"
                    value={selectedSujet || ""}
                    onChange={(e) => setSelectedSujet(e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="">Choisir un critère</MenuItem>
                    {stats.sujetsDetails.map((sujet) => (
                      <MenuItem key={sujet.name} value={sujet.name}>
                        {sujet.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {filteredView === "byPractice" && (
                <FormControl sx={{ ml: 1, minWidth: 200 }}>
                  <Select
                    size="small"
                    value={selectedPratique || ""}
                    onChange={(e) => setSelectedPratique(e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="">Choisir une pratique</MenuItem>
                    {stats.pratiquesDetails.map((pratique) => (
                      <MenuItem key={pratique.name} value={pratique.name}>
                        {pratique.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Alert severity="info" icon={<PsychologyOutlined />}>
              Sélectionnez un passage pour le travailler en simulation de
              coaching
            </Alert>
          </Box>

          <Grid container spacing={2}>
            {displayedPostits.length > 0 ? (
              displayedPostits.map((postit) => {
                // Trouver la couleur du sujet via idcategoriesujet
                const sujet = sujetsData.find(
                  (s) => s.idsujet === postit.idsujet
                );
                const couleurSujet = categoriesSujets.find(
                  (cat) => cat.idcategoriesujet === sujet?.idcategoriesujet
                )?.couleur;

                const pratique = pratiques.find(
                  (p) => p.nompratique === postit.pratique
                );
                const couleurPratique = categoriesPratiques.find(
                  (cat) => cat.id === pratique?.idcategoriepratique
                )?.couleur;

                return (
                  <Grid item xs={12} sm={6} lg={4} key={postit.id}>
                    <Card
                      sx={{
                        position: "relative",
                        height: "100%",
                        transition: "all 0.2s",
                        "&:hover": {
                          transform: "translateY(-5px)",
                          boxShadow: 6,
                        },
                      }}
                    >
                      <CardContent>
                        <EvaluationCardCompact
                          postit={postit}
                          couleurSujet={couleurSujet}
                          couleurPratique={couleurPratique}
                          onReplay={(ts) => console.log("🔁 Rejouer à", ts)}
                        />
                      </CardContent>
                      <CardActions sx={{ justifyContent: "center", pb: 2 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<PlayArrow />}
                          onClick={() => handleSelectForCoaching(postit)}
                          sx={{ width: "80%", borderRadius: 4 }}
                        >
                          Simuler le coaching
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })
            ) : (
              <Grid item xs={12}>
                <Alert severity="warning">
                  Aucun passage ne correspond aux critères sélectionnés.
                </Alert>
              </Grid>
            )}
          </Grid>
        </Paper>
      )}
    </Box>
  );
}
