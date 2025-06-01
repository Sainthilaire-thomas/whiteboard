"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Tabs,
  Tab,
  TextField,
  Grid,
  Chip,
  ListSubheader,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Alert,
  Slider,
  Tooltip,
} from "@mui/material";
import {
  ArrowForward,
  Edit as EditIcon,
  Save as SaveIcon,
  ExpandMore as ExpandMoreIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import TrainingPath from "./TrainingPath";
import { useEntrainementData } from "./hooks";
import {
  STEPS,
  getNextStep,
  getPreviousStep,
  formatJsonForDisplay,
} from "./utils";
import { EntrainementSuiviProps, ViewType, CustomNudges } from "./types";

const EntrainementSuivi = ({ hideHeader = false }: EntrainementSuiviProps) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState<number>(0);
  const [selectedPratique, setSelectedPratique] = useState<number | null>(null);
  const [trainingDuration, setTrainingDuration] = useState<number>(21); // 21 jours par défaut
  const [editingNudges, setEditingNudges] = useState<{ [key: number]: string }>(
    {}
  );
  const [editMode, setEditMode] = useState<{ [key: number]: boolean }>({});
  const [resourcesExpanded, setResourcesExpanded] = useState(false);
  const [selectedResourceView, setSelectedResourceView] = useState<
    "coach" | "conseiller" | null
  >(null);

  // Hook personnalisé pour les données
  const {
    pratiques,
    exercices,
    customNudges,
    trainingPlan,
    loading,
    saving,
    loadExercices,
    loadCustomNudges,
    saveCustomNudges,
    generateTrainingPlan,
    getPratiqueById,
    getPratiquesGroupedByCategory,
  } = useEntrainementData();

  // Utilitaire pour assombrir une couleur
  const darkenColor = (hex: string, amount: number) => {
    if (!hex || !hex.startsWith("#")) return "#666666";

    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);

    r = Math.max(0, r - amount * 1.5);
    g = Math.max(0, g - amount * 1.5);
    b = Math.max(0, b - amount * 1.5);

    return `rgb(${r}, ${g}, ${b})`;
  };

  // Style pour les zones colorées
  const getZoneStyle = (index: number, baseColor: string) => ({
    backgroundColor: darkenColor(baseColor, index * 10),
    color: "white",
    padding: "8px 12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "0.5rem",
    borderRadius: "4px",
    fontSize: "0.85rem",
  });

  // Rendu de la fiche conseiller compacte
  const renderFicheConseiller = (pratique: any) => {
    const ficheData = pratique.fiche_conseiller_json;
    if (!ficheData)
      return (
        <Typography variant="body2">
          Aucune fiche conseiller disponible
        </Typography>
      );

    const categoryColor = pratique.categoryColor || "#3f51b5";

    return (
      <Paper
        sx={{
          p: 2,
          maxHeight: 500,
          overflow: "auto",
          border: `2px solid ${categoryColor}30`,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              backgroundColor: categoryColor,
              color: "white",
              padding: "8px 12px",
              borderRadius: "4px",
              fontSize: "1rem",
            }}
          >
            📝 Fiche Flash Conseiller
          </Typography>
          <IconButton
            size="small"
            onClick={() => setSelectedResourceView(null)}
            sx={{ color: "text.secondary" }}
          >
            ✕
          </IconButton>
        </Box>

        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{ fontWeight: "bold" }}
        >
          {ficheData.titre || pratique.nompratique}
        </Typography>

        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Thématique: {ficheData.thematique || pratique.nompratique}
        </Typography>

        {/* Zones avec tooltip pour le contenu complet */}
        {ficheData.zones &&
          ficheData.zones.map((zone: any, index: number) => {
            const zoneContent = zone.contenu || zone;
            const isLong = zoneContent.length > 50;

            return (
              <Tooltip
                key={index}
                title={isLong ? zoneContent : ""}
                placement="top"
                arrow
              >
                <Box sx={getZoneStyle(index, categoryColor)}>
                  <ArrowForward fontSize="small" />
                  <Typography
                    variant="body2"
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      cursor: isLong ? "help" : "default",
                    }}
                  >
                    {zoneContent}
                  </Typography>
                </Box>
              </Tooltip>
            );
          })}

        {/* Paragraphes détaillés */}
        {ficheData.paragraphes &&
          ficheData.paragraphes.map((paragraphe: any, idx: number) => (
            <Box key={idx} sx={{ mt: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: "bold", color: categoryColor }}
              >
                {paragraphe.titre}
              </Typography>
              <Typography variant="body2" paragraph sx={{ mt: 0.5 }}>
                {paragraphe.contenu}
              </Typography>
            </Box>
          ))}

        {ficheData.aRetenir && (
          <Box
            sx={{
              bgcolor: categoryColor,
              p: 2,
              color: "white",
              borderRadius: "4px",
              mt: 2,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <ArrowForward fontSize="small" />À Retenir:
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, fontStyle: "italic" }}>
              {ficheData.aRetenir}
            </Typography>
          </Box>
        )}
      </Paper>
    );
  };

  // Rendu de la fiche coach compacte
  const renderFicheCoach = (pratique: any) => {
    const ficheData = pratique.fiche_coach_json;
    if (!ficheData)
      return (
        <Typography variant="body2">Aucune fiche coach disponible</Typography>
      );

    const categoryColor = pratique.categoryColor || "#f50057";

    return (
      <Paper
        sx={{
          p: 2,
          maxHeight: 500,
          overflow: "auto",
          border: `2px solid ${categoryColor}30`,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              backgroundColor: categoryColor,
              color: "white",
              padding: "8px 12px",
              borderRadius: "4px",
              fontSize: "1rem",
            }}
          >
            📋 Fiche Flash Coach
          </Typography>
          <IconButton
            size="small"
            onClick={() => setSelectedResourceView(null)}
            sx={{ color: "text.secondary" }}
          >
            ✕
          </IconButton>
        </Box>

        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{ fontWeight: "bold" }}
        >
          {ficheData.titre || pratique.nompratique}
        </Typography>

        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Thématique: {ficheData.thematique || pratique.nompratique}
        </Typography>

        {pratique.geste && (
          <Chip
            label={`Geste clé: ${pratique.geste}`}
            size="small"
            color="secondary"
            sx={{ mb: 2 }}
          />
        )}

        {/* Zones avec tooltip pour le contenu complet */}
        {ficheData.zones &&
          ficheData.zones.map((zone: any, index: number) => {
            const zoneContent = zone.contenu || zone;
            const isLong = zoneContent.length > 50;

            return (
              <Tooltip
                key={index}
                title={isLong ? zoneContent : ""}
                placement="top"
                arrow
              >
                <Box sx={getZoneStyle(index, categoryColor)}>
                  <ArrowForward fontSize="small" />
                  <Typography
                    variant="body2"
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      cursor: isLong ? "help" : "default",
                    }}
                  >
                    {zoneContent}
                  </Typography>
                </Box>
              </Tooltip>
            );
          })}

        {/* Paragraphes détaillés */}
        {ficheData.paragraphes &&
          ficheData.paragraphes.map((paragraphe: any, idx: number) => (
            <Box key={idx} sx={{ mt: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: "bold", color: categoryColor }}
              >
                {paragraphe.titre}
              </Typography>
              <Typography variant="body2" paragraph sx={{ mt: 0.5 }}>
                {paragraphe.contenu}
              </Typography>
            </Box>
          ))}

        {ficheData.aRetenir && (
          <Box
            sx={{
              bgcolor: categoryColor,
              p: 2,
              color: "white",
              borderRadius: "4px",
              mt: 2,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <ArrowForward fontSize="small" />À Retenir:
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, fontStyle: "italic" }}>
              {ficheData.aRetenir}
            </Typography>
          </Box>
        )}
      </Paper>
    );
  };

  // Chargement des données quand une pratique est sélectionnée
  useEffect(() => {
    if (selectedPratique) {
      loadExercices(selectedPratique);
      loadCustomNudges(selectedPratique);
    }
  }, [selectedPratique, loadExercices, loadCustomNudges]);

  // Génération automatique du planning quand les nudges changent
  useEffect(() => {
    if (selectedPratique && (customNudges || exercices.length > 0)) {
      const nudgesArray = customNudges
        ? [
            customNudges.custom_nudge1,
            customNudges.custom_nudge2,
            customNudges.custom_nudge3,
            customNudges.custom_nudge4,
            customNudges.custom_nudge5,
            customNudges.custom_nudge6,
          ].filter(Boolean)
        : [];

      if (nudgesArray.length === 0 && exercices.length > 0) {
        // Utiliser les nudges par défaut du premier exercice
        const defaultExercice = exercices[0];
        if (defaultExercice.nudges) {
          const defaultNudges = Object.values(defaultExercice.nudges).filter(
            Boolean
          ) as string[];
          generateTrainingPlan(defaultNudges, trainingDuration);
        }
      } else if (nudgesArray.length > 0) {
        generateTrainingPlan(nudgesArray, trainingDuration);
      }
    }
  }, [
    customNudges,
    exercices,
    trainingDuration,
    selectedPratique,
    generateTrainingPlan,
  ]);

  // Gestion de la navigation
  const handleNext = useCallback(() => {
    setActiveStep((prevActiveStep) =>
      getNextStep(prevActiveStep, STEPS.length)
    );
  }, []);

  const handleBack = useCallback(() => {
    setActiveStep((prevActiveStep) => getPreviousStep(prevActiveStep));
  }, []);

  const handleStepClick = useCallback((stepIndex: number) => {
    setActiveStep(stepIndex);
  }, []);

  // Gestion de l'édition des nudges
  const handleEditNudge = (nudgeIndex: number, currentValue: string) => {
    setEditingNudges((prev) => ({ ...prev, [nudgeIndex]: currentValue }));
    setEditMode((prev) => ({ ...prev, [nudgeIndex]: true }));
  };

  const handleSaveNudge = async (nudgeIndex: number) => {
    const newValue = editingNudges[nudgeIndex];
    if (!newValue || !selectedPratique) return;

    const nudgeKey = `custom_nudge${nudgeIndex}` as keyof CustomNudges;
    const updatedData: Partial<CustomNudges> = {
      id_pratique: selectedPratique,
      [nudgeKey]: newValue,
    };

    const success = await saveCustomNudges(updatedData);
    if (success) {
      setEditMode((prev) => ({ ...prev, [nudgeIndex]: false }));
    }
  };

  const handleCancelEdit = (nudgeIndex: number) => {
    setEditMode((prev) => ({ ...prev, [nudgeIndex]: false }));
    setEditingNudges((prev) => {
      const newState = { ...prev };
      delete newState[nudgeIndex];
      return newState;
    });
  };

  // Obtenir les nudges actuels (personnalisés ou par défaut)
  const getCurrentNudges = () => {
    if (customNudges) {
      return [
        customNudges.custom_nudge1,
        customNudges.custom_nudge2,
        customNudges.custom_nudge3,
        customNudges.custom_nudge4,
        customNudges.custom_nudge5,
        customNudges.custom_nudge6,
      ]
        .map((nudge, index) => ({ index: index + 1, content: nudge || "" }))
        .filter((nudge) => nudge.content);
    }

    if (exercices.length > 0 && exercices[0].nudges) {
      const defaultNudges = Object.values(exercices[0].nudges).filter(
        Boolean
      ) as string[];
      return defaultNudges.map((nudge, index) => ({
        index: index + 1,
        content: nudge,
      }));
    }

    return [];
  };

  // Rendu des fiches ressources (maintenant inutile, on garde pour compatibilité)
  const renderResourcesFiches = (pratique: any) => {
    return null; // Les ressources sont maintenant affichées en haut avec les chips
  };

  // Rendu de l'étape Bilan (Split-view)
  const renderBilanStep = () => {
    const selectedPratiqueData = getPratiqueById(selectedPratique || 0);
    const currentNudges = getCurrentNudges();

    return (
      <Grid container spacing={3} sx={{ height: "calc(100vh - 300px)" }}>
        {/* Colonne de gauche : Édition */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: "100%", overflow: "auto" }}>
            <Typography variant="h6" gutterBottom>
              💡 Édition des Nudges d'Entraînement
            </Typography>

            {/* Sélecteur de pratique */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Sélectionner une pratique</InputLabel>
              <Select
                value={selectedPratique || ""}
                label="Sélectionner une pratique"
                onChange={(e) => setSelectedPratique(Number(e.target.value))}
                disabled={loading}
              >
                {getPratiquesGroupedByCategory().map((category) => [
                  <ListSubheader
                    key={`header-${category.idcategoriepratique}`}
                    sx={{
                      backgroundColor: category.couleur + "20",
                      color: category.couleur,
                      fontWeight: "bold",
                      fontSize: "0.9rem",
                      lineHeight: "2.5",
                    }}
                  >
                    {category.nomcategorie}
                  </ListSubheader>,
                  ...category.pratiques.map((pratique) => (
                    <MenuItem
                      key={pratique.idpratique}
                      value={pratique.idpratique}
                      sx={{ pl: 4 }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            backgroundColor:
                              pratique.categoryColor || "#3f51b5",
                          }}
                        />
                        {pratique.nompratique}
                      </Box>
                    </MenuItem>
                  )),
                ])}
              </Select>
            </FormControl>

            {/* Édition des nudges */}
            {selectedPratique && (
              <Box>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    {selectedPratiqueData?.nompratique}
                  </Typography>
                  <Chip
                    label={selectedPratiqueData?.categoryName}
                    size="small"
                    sx={{
                      backgroundColor:
                        selectedPratiqueData?.categoryColor + "20",
                    }}
                  />
                </Box>

                {/* Boutons ressources en haut */}
                {selectedPratiqueData &&
                  (selectedPratiqueData.fiche_coach_json ||
                    selectedPratiqueData.fiche_conseiller_json) && (
                    <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                      {selectedPratiqueData.fiche_coach_json && (
                        <Chip
                          label="📋 Fiche Coach"
                          variant={
                            selectedResourceView === "coach"
                              ? "filled"
                              : "outlined"
                          }
                          color="secondary"
                          size="small"
                          clickable
                          onClick={() =>
                            setSelectedResourceView(
                              selectedResourceView === "coach" ? null : "coach"
                            )
                          }
                          onDelete={
                            selectedResourceView === "coach"
                              ? () => setSelectedResourceView(null)
                              : undefined
                          }
                        />
                      )}
                      {selectedPratiqueData.fiche_conseiller_json && (
                        <Chip
                          label="📝 Fiche Conseiller"
                          variant={
                            selectedResourceView === "conseiller"
                              ? "filled"
                              : "outlined"
                          }
                          color="primary"
                          size="small"
                          clickable
                          onClick={() =>
                            setSelectedResourceView(
                              selectedResourceView === "conseiller"
                                ? null
                                : "conseiller"
                            )
                          }
                          onDelete={
                            selectedResourceView === "conseiller"
                              ? () => setSelectedResourceView(null)
                              : undefined
                          }
                        />
                      )}
                    </Box>
                  )}

                {/* Affichage de la fiche sélectionnée */}
                {selectedResourceView === "coach" && selectedPratiqueData && (
                  <Box sx={{ mb: 2 }}>
                    {renderFicheCoach(selectedPratiqueData)}
                  </Box>
                )}
                {selectedResourceView === "conseiller" &&
                  selectedPratiqueData && (
                    <Box sx={{ mb: 2 }}>
                      {renderFicheConseiller(selectedPratiqueData)}
                    </Box>
                  )}

                {/* Nudges */}

                {currentNudges.map((nudge) => (
                  <Card key={nudge.index} variant="outlined" sx={{ mb: 1.5 }}>
                    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 1,
                        }}
                      >
                        <Chip
                          label={nudge.index}
                          size="small"
                          color="primary"
                          sx={{ mt: 0.5, minWidth: 28, height: 24 }}
                        />

                        <Box sx={{ flex: 1 }}>
                          {editMode[nudge.index] ? (
                            <TextField
                              fullWidth
                              multiline
                              rows={2}
                              value={
                                editingNudges[nudge.index] || nudge.content
                              }
                              onChange={(e) =>
                                setEditingNudges((prev) => ({
                                  ...prev,
                                  [nudge.index]: e.target.value,
                                }))
                              }
                              variant="outlined"
                              size="small"
                              sx={{
                                "& .MuiInputBase-root": { fontSize: "0.9rem" },
                              }}
                            />
                          ) : (
                            <Typography
                              variant="body2"
                              sx={{ minHeight: 32, lineHeight: 1.4 }}
                            >
                              {nudge.content}
                            </Typography>
                          )}
                        </Box>

                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          {editMode[nudge.index] ? (
                            <>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleSaveNudge(nudge.index)}
                                disabled={saving}
                                sx={{ p: 0.5 }}
                              >
                                {saving ? (
                                  <CircularProgress size={14} />
                                ) : (
                                  <SaveIcon fontSize="small" />
                                )}
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleCancelEdit(nudge.index)}
                                sx={{ p: 0.5 }}
                              >
                                <Typography variant="body2">✕</Typography>
                              </IconButton>
                            </>
                          ) : (
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleEditNudge(nudge.index, nudge.content)
                              }
                              sx={{ p: 0.5 }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}

                {customNudges && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    ✅ Nudges personnalisés sauvegardés
                  </Alert>
                )}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Colonne de droite : Aperçu Planning */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: "100%", overflow: "auto" }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <ScheduleIcon color="info" />
              📅 Aperçu Planning d'Entraînement
            </Typography>

            {/* Contrôle de durée */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Durée : <strong>{trainingDuration} jours</strong>
              </Typography>
              <Slider
                value={trainingDuration}
                onChange={(_, value) => setTrainingDuration(value as number)}
                min={7}
                max={90}
                step={7}
                marks={[
                  { value: 7, label: "1s" },
                  { value: 21, label: "3s" },
                  { value: 30, label: "1m" },
                  { value: 60, label: "2m" },
                ]}
                size="small"
                sx={{ mt: 1 }}
              />
            </Box>

            {/* Planning généré */}
            {trainingPlan && trainingPlan.nudges.length > 0 ? (
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  gutterBottom
                  display="block"
                >
                  Du {trainingPlan.startDate.toLocaleDateString("fr-FR")} au{" "}
                  {new Date(
                    trainingPlan.startDate.getTime() +
                      (trainingPlan.totalDuration - 1) * 24 * 60 * 60 * 1000
                  ).toLocaleDateString("fr-FR")}
                </Typography>

                {trainingPlan.nudges.map((planningNudge, index) => (
                  <Card key={index} variant="outlined" sx={{ mb: 1.5 }}>
                    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 2,
                        }}
                      >
                        <Box sx={{ minWidth: 80 }}>
                          <Chip
                            label={`Nudge ${planningNudge.nudgeNumber}`}
                            color="info"
                            size="small"
                            sx={{ mb: 0.5 }}
                          />
                          <Typography variant="caption" display="block">
                            {planningNudge.dayRange}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            sx={{ fontSize: "0.7rem" }}
                          >
                            {planningNudge.startDate.toLocaleDateString(
                              "fr-FR"
                            )}{" "}
                            -{" "}
                            {planningNudge.endDate.toLocaleDateString("fr-FR")}
                          </Typography>
                        </Box>

                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
                            {planningNudge.content}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              <Alert severity="info">
                Sélectionnez une pratique pour voir le planning d'entraînement
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>
    );
  };

  // Rendu de l'étape Déroulé
  const renderDeroulementStep = () => {
    const selectedPratiqueData = getPratiqueById(selectedPratique || 0);

    return (
      <Box sx={{ p: 2, height: "calc(100vh - 280px)", overflow: "auto" }}>
        {trainingPlan && trainingPlan.nudges.length > 0 ? (
          <Box>
            {/* Composant de visualisation du parcours */}
            <TrainingPath
              trainingPlan={trainingPlan}
              categoryColor={selectedPratiqueData?.categoryColor || "#3f51b5"}
            />

            {/* Résumé compact */}
            <Paper
              sx={{
                p: 1.5,
                mb: 2,
                bgcolor: "success.light",
                color: "success.contrastText",
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                ✅ Plan d'entraînement de {trainingPlan.totalDuration} jours
              </Typography>
              <Typography variant="body2">
                Du {trainingPlan.startDate.toLocaleDateString("fr-FR")} au{" "}
                {new Date(
                  trainingPlan.startDate.getTime() +
                    (trainingPlan.totalDuration - 1) * 24 * 60 * 60 * 1000
                ).toLocaleDateString("fr-FR")}
              </Typography>
            </Paper>

            {/* Grid compact des nudges */}
            <Grid container spacing={1.5}>
              {trainingPlan.nudges.map((planningNudge, index) => (
                <Grid item xs={12} md={6} lg={4} key={index}>
                  <Card variant="outlined" sx={{ height: "100%" }}>
                    <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          mb: 1,
                        }}
                      >
                        <Chip
                          label={`S${Math.ceil(planningNudge.nudgeNumber / 2)}`}
                          color="primary"
                          size="small"
                          sx={{ fontSize: "0.7rem", height: 20 }}
                        />
                        <Chip
                          label={planningNudge.dayRange}
                          variant="outlined"
                          size="small"
                          sx={{ fontSize: "0.7rem", height: 20 }}
                        />
                      </Box>

                      <Typography
                        variant="subtitle2"
                        gutterBottom
                        sx={{ fontWeight: "bold" }}
                      >
                        Nudge {planningNudge.nudgeNumber}
                      </Typography>

                      <Typography
                        variant="body2"
                        paragraph
                        sx={{
                          fontSize: "0.85rem",
                          lineHeight: 1.3,
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {planningNudge.content}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: "0.7rem" }}
                      >
                        📅{" "}
                        {planningNudge.startDate.toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                        })}{" "}
                        →{" "}
                        {planningNudge.endDate.toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Actions compactes */}
            <Box
              sx={{
                mt: 2,
                display: "flex",
                gap: 1,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <Button variant="contained" color="primary" size="small">
                💾 Enregistrer
              </Button>
              <Button variant="outlined" color="secondary" size="small">
                📤 Export PDF
              </Button>
              <Button variant="outlined" color="info" size="small">
                📧 Email
              </Button>
            </Box>
          </Box>
        ) : (
          <Alert severity="warning">
            Aucun planning disponible. Retournez à l'étape précédente pour
            configurer votre entraînement.
          </Alert>
        )}
      </Box>
    );
  };

  // Rendu du contenu selon l'étape active
  const renderStepContent = () => {
    const currentStep = STEPS[activeStep];

    switch (currentStep.id) {
      case "bilan":
        return renderBilanStep();
      case "deroulement":
        return renderDeroulementStep();
      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      {/* Header optionnel */}
      {!hideHeader && (
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
          <Typography variant="h5" component="h1">
            Entraînement et Suivi
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Préparation et planification de l'entraînement post-coaching
          </Typography>
        </Box>
      )}

      {/* Stepper horizontal */}
      <Box sx={{ p: 2 }}>
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          sx={{
            "& .MuiStepLabel-root": {
              cursor: "pointer",
            },
          }}
        >
          {STEPS.map((step, index) => (
            <Step key={step.id}>
              <StepLabel
                onClick={() => handleStepClick(index)}
                sx={{
                  "& .MuiStepLabel-labelContainer": {
                    cursor: "pointer",
                  },
                }}
              >
                <Typography variant="subtitle2">{step.label}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {step.description}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Contenu de l'étape active */}
      <Box sx={{ flex: 1, overflow: "auto" }}>{renderStepContent()}</Box>

      {/* Navigation */}
      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: "divider",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          variant="outlined"
        >
          Précédent
        </Button>

        <Typography variant="body2" color="text.secondary">
          Étape {activeStep + 1} sur {STEPS.length}
        </Typography>

        <Button
          disabled={activeStep === STEPS.length - 1}
          onClick={handleNext}
          variant="contained"
        >
          Suivant
        </Button>
      </Box>
    </Box>
  );
};

export default EntrainementSuivi;
