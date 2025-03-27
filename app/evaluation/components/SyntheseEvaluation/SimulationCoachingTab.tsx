"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Alert,
  Paper,
  Button,
  FormControl,
  Select,
  MenuItem,
  Tooltip,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  PlayArrow,
  InfoOutlined,
  FilterList,
  SortByAlpha,
  AccessTime,
  LightbulbOutlined,
} from "@mui/icons-material";
import { SimulationCoachingTabProps, Postit } from "@/types/evaluation";
import { sortPostits, SortCriteria } from "./utils/filters";
import { formatTimecode, truncateText } from "./utils/formatters";

const SimulationCoachingTab: React.FC<SimulationCoachingTabProps> = ({
  filteredPostits,
  sujetsData,
  categoriesSujets,
  pratiques,
  categoriesPratiques,
}) => {
  console.log("pratiques", pratiques);

  type FilterView = "all" | "bySubject" | "byPractice";

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [filterView, setFilterView] = useState<FilterView>("all");
  const [selectedSujet, setSelectedSujet] = useState("");
  const [selectedPratique, setSelectedPratique] = useState("");
  const [sortBy, setSortBy] = useState<SortCriteria>("timestamp");
  const [showFilters, setShowFilters] = useState(false);

  // Extraire les sujets et pratiques uniques pour les filtres
  const uniqueSujets = [
    ...new Set(filteredPostits.map((p) => p.sujet).filter(Boolean)),
  ] as string[];
  const uniquePratiques = [
    ...new Set(filteredPostits.map((p) => p.pratique).filter(Boolean)),
  ] as string[];

  // Réinitialiser les sélections lors du changement de vue de filtrage
  useEffect(() => {
    if (filterView === "all") {
      setSelectedSujet("");
      setSelectedPratique("");
    }
  }, [filterView]);

  // Filtrer les passages en fonction des sélections
  const getFilteredPostits = (): Postit[] => {
    let filtered = [...filteredPostits];

    if (filterView === "bySubject" && selectedSujet) {
      filtered = filtered.filter((p) => p.sujet === selectedSujet);
    } else if (filterView === "byPractice" && selectedPratique) {
      filtered = filtered.filter((p) => p.pratique === selectedPratique);
    }

    // Trier les résultats
    return sortPostits(filtered, sortBy);
  };

  const displayedPostits = getFilteredPostits();

  // Fonction pour simuler le coaching sur un passage
  const handleSimulateCoaching = (postit: Postit) => {
    console.log("Simuler coaching pour:", postit);
    // Implémenter la logique pour démarrer la simulation
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: "100%",
      }}
    >
      {/* En-tête avec titre et contrôles de filtre */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1.5,
          width: "100%",
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: "medium" }}>
          Passages à travailler
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          {showFilters && (
            <>
              <FormControl size="small" sx={{ mx: 0.5, minWidth: 120 }}>
                <Select
                  value={filterView}
                  onChange={(e) => setFilterView(e.target.value as FilterView)}
                  size="small"
                  displayEmpty
                >
                  <MenuItem value="all">Tous</MenuItem>
                  <MenuItem value="bySubject">Par critère</MenuItem>
                  <MenuItem value="byPractice">Par pratique</MenuItem>
                </Select>
              </FormControl>

              {filterView === "bySubject" && (
                <FormControl size="small" sx={{ mx: 0.5, minWidth: 150 }}>
                  <Select
                    value={selectedSujet}
                    onChange={(e) => setSelectedSujet(e.target.value)}
                    size="small"
                    displayEmpty
                  >
                    <MenuItem value="">Tous les critères</MenuItem>
                    {uniqueSujets.map((sujet) => (
                      <MenuItem key={sujet} value={sujet}>
                        {sujet}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {filterView === "byPractice" && (
                <FormControl size="small" sx={{ mx: 0.5, minWidth: 150 }}>
                  <Select
                    value={selectedPratique}
                    onChange={(e) => setSelectedPratique(e.target.value)}
                    size="small"
                    displayEmpty
                  >
                    <MenuItem value="">Toutes les pratiques</MenuItem>
                    {uniquePratiques.map((pratique) => (
                      <MenuItem key={pratique} value={pratique}>
                        {pratique}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <Tooltip title="Trier par heure">
                <IconButton
                  size="small"
                  color={sortBy === "timestamp" ? "primary" : "default"}
                  onClick={() => setSortBy("timestamp")}
                >
                  <AccessTime fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Trier par nom">
                <IconButton
                  size="small"
                  color={sortBy === "alpha" ? "primary" : "default"}
                  onClick={() => setSortBy("alpha")}
                >
                  <SortByAlpha fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}

          <Tooltip
            title={showFilters ? "Masquer les filtres" : "Afficher les filtres"}
          >
            <IconButton
              size="small"
              onClick={() => setShowFilters(!showFilters)}
              color={showFilters ? "primary" : "default"}
            >
              <FilterList fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Message d'aide */}
      <Alert
        severity="info"
        icon={<InfoOutlined fontSize="small" />}
        variant="outlined"
        sx={{ mb: 1.5, py: 0.5, width: "100%" }}
      >
        <Typography variant="caption">
          Sélectionnez un passage pour le coaching en simulation
        </Typography>
      </Alert>

      {/* Liste des passages avec style inspiré de Slack */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          width: "100%",
          maxWidth: "100%",
          display: "block",
          "& > *": {
            width: "100% !important",
            maxWidth: "100% !important",
            display: "block !important",
          },
        }}
      >
        <style jsx global>{`
          .slack-message-list {
            display: block;
            width: 100%;
            max-width: 100%;
          }
          .slack-message-item {
            display: block;
            width: 100%;
            margin-bottom: 12px;
          }
        `}</style>

        <div className="slack-message-list">
          {displayedPostits.length > 0 ? (
            displayedPostits.map((postit) => {
              // Trouver la couleur du sujet
              const sujet = sujetsData.find(
                (s) => s.idsujet === postit.idsujet
              );
              const couleurSujet =
                categoriesSujets.find(
                  (cat) => cat.idcategoriesujet === sujet?.idcategoriesujet
                )?.couleur || "#607d8b";

              // Trouver la couleur de la pratique
              const pratique = pratiques.find(
                (p) => p.nompratique === postit.pratique
              );
              const couleurPratique =
                categoriesPratiques.find(
                  (cat) => cat.id === pratique?.idcategoriepratique
                )?.couleur || "#9e9e9e";

              return (
                <div key={postit.id} className="slack-message-item">
                  <Paper
                    elevation={1}
                    sx={{
                      borderRadius: 1,
                      overflow: "hidden",
                      position: "relative",
                      transition: "all 0.2s",
                      "&:hover": {
                        boxShadow: 2,
                        bgcolor: "rgba(0, 0, 0, 0.01)",
                      },
                      border: "1px solid",
                      borderColor: "divider",
                      width: "100%",
                      display: "block",
                    }}
                  >
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                      {/* En-tête du passage */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          p: 1,
                          borderBottom: "1px solid",
                          borderColor: "divider",
                          bgcolor: "rgba(0, 0, 0, 0.02)",
                          flexWrap: "wrap",
                        }}
                      >
                        {/* Infos de gauche: Tags */}
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          {postit.sujet && (
                            <Box
                              sx={{
                                px: 1,
                                py: 0.25,
                                borderRadius: 1,
                                bgcolor: `${couleurSujet}20`,
                                color: couleurSujet,
                                fontSize: "0.75rem",
                                fontWeight: "medium",
                              }}
                            >
                              {postit.sujet}
                            </Box>
                          )}

                          {postit.pratique &&
                            postit.pratique !== "Non Assigné" && (
                              <Box
                                sx={{
                                  px: 1,
                                  py: 0.25,
                                  borderRadius: 1,
                                  bgcolor: `${couleurPratique}20`,
                                  color: couleurPratique,
                                  fontSize: "0.75rem",
                                  fontWeight: "medium",
                                }}
                              >
                                {postit.pratique}
                              </Box>
                            )}
                        </Box>

                        {/* Infos de droite: Timecode */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            px: 1,
                            py: 0.25,
                            borderRadius: 1,
                            bgcolor: "rgba(0, 0, 0, 0.05)",
                            ml: 1,
                            flexShrink: 0,
                          }}
                        >
                          <AccessTime
                            fontSize="small"
                            sx={{
                              mr: 0.5,
                              fontSize: "0.875rem",
                              color: "text.secondary",
                            }}
                          />
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: "monospace",
                              fontWeight: "bold",
                              color: "text.secondary",
                            }}
                          >
                            {formatTimecode(postit.timestamp)}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Corps du passage */}
                      <Box sx={{ p: 1.5 }}>
                        <Typography
                          variant="body2"
                          sx={{ color: "text.primary", mb: 1 }}
                        >
                          {truncateText(postit.text, 200)}
                        </Typography>
                        {/* Affichage du geste pratique si disponible */}
                        {postit.pratique && (
                          <Box
                            sx={{
                              mt: 2,
                              mb: 2,
                              p: 1.5,
                              borderRadius: 1,
                              bgcolor: "primary.lighter",
                              borderLeft: "4px solid",
                              borderColor: "primary.main",
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontStyle: "italic",
                                color: "primary.dark",
                                display: "flex",
                                alignItems: "flex-start",
                              }}
                            >
                              <LightbulbOutlined
                                fontSize="small"
                                sx={{ mr: 1, mt: 0.2, color: "primary.main" }}
                              />
                              <span>
                                <strong>Conseil pour cette pratique :</strong>{" "}
                                {/* Récupérer le geste de la pratique */}
                                {pratiques.find(
                                  (p) => p.nompratique === postit.pratique
                                )?.geste ||
                                  "Appliquez les techniques professionnelles adaptées à cette situation."}
                              </span>
                            </Typography>
                          </Box>
                        )}

                        {/* Bouton de simulation */}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            mt: 1,
                          }}
                        >
                          <Button
                            variant="contained"
                            size="small"
                            color="primary"
                            startIcon={<PlayArrow />}
                            onClick={() => handleSimulateCoaching(postit)}
                            sx={{
                              textTransform: "none",
                              fontWeight: "medium",
                            }}
                          >
                            Simuler le coaching
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                </div>
              );
            })
          ) : (
            <Alert severity="warning" sx={{ py: 0.5 }}>
              <Typography variant="caption">
                Aucun passage ne correspond aux critères sélectionnés.
              </Typography>
            </Alert>
          )}
        </div>
      </Box>
    </Box>
  );
};

export default SimulationCoachingTab;
