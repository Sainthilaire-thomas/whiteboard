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
  Chip,
} from "@mui/material";
import {
  PlayArrow,
  InfoOutlined,
  FilterList,
  SortByAlpha,
  AccessTime,
  LightbulbOutlined,
  Clear,
  VisibilityOff,
  Visibility,
} from "@mui/icons-material";
// Import uniquement les types nécessaires depuis les types externes
import { SimulationCoachingTabProps } from "@/types/evaluation";
import { useRouter } from "next/navigation";
import { sortPostits, SortCriteria } from "./utils/filters";
import { formatTimecode, truncateText } from "./utils/formatters";
import { useCallData } from "@/context/CallDataContext";

// Interface mise à jour avec les nouvelles props - en utilisant any pour éviter les conflits
interface SimulationCoachingTabPropsExtended {
  filteredPostits: any[]; // Type flexible pour éviter les conflits
  sujetsData: any[];
  categoriesSujets: any[];
  pratiques: any[];
  categoriesPratiques: any[];
  selectedSujet?: string;
  selectedPratique?: string;
  onClearSelection?: () => void;
}

const SimulationCoachingTab: React.FC<SimulationCoachingTabPropsExtended> = ({
  filteredPostits,
  sujetsData,
  categoriesSujets,
  pratiques,
  categoriesPratiques,
  selectedSujet = "",
  selectedPratique = "",
  onClearSelection,
}) => {
  type FilterView = "all" | "bySubject" | "byPractice";

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const router = useRouter();
  const { setSelectedPostitForRolePlay } = useCallData();

  const [filterView, setFilterView] = useState<FilterView>("all");
  const [internalSelectedSujet, setInternalSelectedSujet] = useState("");
  const [internalSelectedPratique, setInternalSelectedPratique] = useState("");
  const [sortBy, setSortBy] = useState<SortCriteria>("timestamp");
  const [showFilters, setShowFilters] = useState(false);
  const [showAllPassages, setShowAllPassages] = useState(false);

  // Extraire les sujets et pratiques uniques pour les filtres
  const uniqueSujets = [
    ...new Set(filteredPostits.map((p: any) => p.sujet).filter(Boolean)),
  ] as string[];
  const uniquePratiques = [
    ...new Set(filteredPostits.map((p: any) => p.pratique).filter(Boolean)),
  ] as string[];

  // Gérer la sélection automatique quand on arrive depuis la synthèse
  useEffect(() => {
    if (selectedSujet) {
      setFilterView("bySubject");
      setInternalSelectedSujet(selectedSujet);
      setShowAllPassages(false);
    } else if (selectedPratique) {
      setFilterView("byPractice");
      setInternalSelectedPratique(selectedPratique);
      setShowAllPassages(false);
    }
  }, [selectedSujet, selectedPratique]);

  // Réinitialiser les sélections lors du changement de vue de filtrage
  useEffect(() => {
    if (filterView === "all") {
      setInternalSelectedSujet("");
      setInternalSelectedPratique("");
    }
  }, [filterView]);

  // Fonction pour afficher tous les passages
  const handleShowAll = () => {
    setShowAllPassages(true);
    setFilterView("all");
    setInternalSelectedSujet("");
    setInternalSelectedPratique("");
    if (onClearSelection) {
      onClearSelection();
    }
  };

  // Fonction pour effacer la sélection
  const handleClearFilter = () => {
    setShowAllPassages(false);
    setFilterView("all");
    setInternalSelectedSujet("");
    setInternalSelectedPratique("");
    if (onClearSelection) {
      onClearSelection();
    }
  };

  // Filtrer les passages en fonction des sélections
  const getFilteredPostits = (): any[] => {
    let filtered = [...filteredPostits];

    // Debug logs
    console.log("🔍 Debug getFilteredPostits:");
    console.log("selectedSujet:", selectedSujet);
    console.log("selectedPratique:", selectedPratique);
    console.log("showAllPassages:", showAllPassages);
    console.log("filteredPostits.length:", filteredPostits.length);

    // Si on a une sélection depuis la synthèse et qu'on n'affiche pas tout
    if (!showAllPassages) {
      if (selectedSujet) {
        console.log("🎯 Filtrage par sujet:", selectedSujet);
        filtered = filtered.filter((p: any) => p.sujet === selectedSujet);
        console.log("Résultats après filtrage sujet:", filtered.length);
      } else if (selectedPratique) {
        console.log("🎯 Filtrage par pratique:", selectedPratique);
        console.log(
          "Pratiques disponibles:",
          filteredPostits.map((p: any) => p.pratique)
        );
        filtered = filtered.filter((p: any) => p.pratique === selectedPratique);
        console.log("Résultats après filtrage pratique:", filtered.length);
      }
    } else {
      // Sinon, utiliser les filtres internes
      if (filterView === "bySubject" && internalSelectedSujet) {
        filtered = filtered.filter(
          (p: any) => p.sujet === internalSelectedSujet
        );
      } else if (filterView === "byPractice" && internalSelectedPratique) {
        filtered = filtered.filter(
          (p: any) => p.pratique === internalSelectedPratique
        );
      }
    }

    // Trier les résultats
    return sortPostits(filtered, sortBy);
  };

  const displayedPostits = getFilteredPostits();

  // Calculer les statistiques pour le bandeau
  const getFilterStats = () => {
    if (!showAllPassages && (selectedSujet || selectedPratique)) {
      const filterName = selectedSujet || selectedPratique;
      const count = displayedPostits.length;
      const type = selectedSujet ? "critère" : "pratique";
      return { filterName, count, type };
    }
    return null;
  };

  const filterStats = getFilterStats();

  // Fonction pour simuler le coaching sur un passage
  const handleSimulateCoaching = (postit: any) => {
    // Créer un objet compatible avec tous les contextes
    const adaptedPostit = {
      ...postit,
      // S'assurer que les propriétés requises existent
      id: postit.id || postit.idpostit || String(Date.now()),
      callid: postit.callid || 0,
      wordid: postit.wordid || 0,
      word: postit.word || "",
      iddomaine: postit.iddomaine || 0,
      sujet: postit.sujet || "",
      pratique: postit.pratique || "",
    };

    setSelectedPostitForRolePlay(adaptedPostit);
    router.push("/evaluation?view=roleplay");
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
      {/* Bandeau de filtre automatique */}
      {filterStats && !showAllPassages && (
        <Alert
          severity="info"
          sx={{ mb: 2 }}
          action={
            <IconButton
              size="small"
              onClick={handleClearFilter}
              color="inherit"
            >
              <Clear fontSize="small" />
            </IconButton>
          }
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: "medium" }}>
              Filtré sur le {filterStats.type} :
            </Typography>
            <Chip
              label={`${filterStats.filterName} (${filterStats.count} passage${
                filterStats.count > 1 ? "s" : ""
              })`}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
        </Alert>
      )}

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
          {filterStats && !showAllPassages && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              ({displayedPostits.length} sur {filteredPostits.length})
            </Typography>
          )}
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
                    value={internalSelectedSujet}
                    onChange={(e) => setInternalSelectedSujet(e.target.value)}
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
                    value={internalSelectedPratique}
                    onChange={(e) =>
                      setInternalSelectedPratique(e.target.value)
                    }
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
            displayedPostits.map((postit: any) => {
              // Trouver la couleur du sujet
              const sujet = sujetsData.find(
                (s: any) => s.idsujet === postit.idsujet
              );
              const couleurSujet =
                categoriesSujets.find(
                  (cat: any) => cat.idcategoriesujet === sujet?.idcategoriesujet
                )?.couleur || "#607d8b";

              // Trouver la couleur de la pratique
              const pratique = pratiques.find(
                (p: any) => p.nompratique === postit.pratique
              );
              const couleurPratique =
                categoriesPratiques.find(
                  (cat: any) =>
                    cat.id === pratique?.idcategoriepratique ||
                    cat.idcategoriepratique === pratique?.idcategoriepratique
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
                                  (p: any) => p.nompratique === postit.pratique
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

      {/* Bouton flottant pour voir tous les passages (si filtré) */}
      {((filterStats && !showAllPassages) ||
        selectedSujet ||
        selectedPratique) &&
        displayedPostits.length > 0 && (
          <Box
            sx={{
              position: "sticky",
              bottom: 0,
              bgcolor: "background.paper",
              borderTop: "1px solid",
              borderColor: "divider",
              p: 1,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Button
              variant="outlined"
              startIcon={<Visibility />}
              onClick={handleShowAll}
              sx={{ textTransform: "none" }}
            >
              Voir tous les passages ({filteredPostits.length})
            </Button>
          </Box>
        )}
    </Box>
  );
};

export default SimulationCoachingTab;
