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
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Tabs,
  Tab,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useSupabase } from "@/context/SupabaseContext";

// Types pour les données Supabase
interface Pratique {
  idpratique: number;
  nompratique: string;
  description: string;
  valeurnumérique: number;
  idcategoriepratique: number;
  fiche_conseiller_json: any;
  fiche_coach_json: any;
  jeuderole: any;
  geste: string;
}

interface Exercice {
  idexercice: number;
  idpratique: number;
  nomexercice: string;
  description: string;
  nudges: any;
}

interface Nudge {
  id: number;
  nudge1: string;
  nudge2: string;
  nudge3: string;
  nudge4: string;
  nudge5: string;
  nudge6: string;
}

// Types pour les étapes
type StepType = "bilan" | "deroulement";
type ViewType = "conseiller" | "coach" | "exercices";

interface EntrainementSuiviProps {
  hideHeader?: boolean;
}

const EntrainementSuivi = ({ hideHeader = false }: EntrainementSuiviProps) => {
  const theme = useTheme();
  const { supabase } = useSupabase(); // Retirer isSupabaseReady
  const [activeStep, setActiveStep] = useState<number>(0);
  const [selectedPratique, setSelectedPratique] = useState<number | null>(null);
  const [selectedView, setSelectedView] = useState<ViewType>("conseiller");

  // États pour les données Supabase
  const [pratiques, setPratiques] = useState<Pratique[]>([]);
  const [exercices, setExercices] = useState<Exercice[]>([]);
  const [loading, setLoading] = useState(false);

  // Configuration des étapes
  const steps = [
    {
      id: "bilan" as StepType,
      label: "Bilan du coaching",
      description: "Analyse des résultats et sélection de pratiques",
    },
    {
      id: "deroulement" as StepType,
      label: "Déroulé de l'entraînement",
      description: "Planification et suivi des exercices",
    },
  ];

  // Chargement des pratiques depuis Supabase
  const loadPratiques = useCallback(async () => {
    if (!supabase) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("pratiques")
        .select("*")
        .order("nompratique");

      if (error) throw error;
      setPratiques(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des pratiques:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Chargement des exercices pour une pratique
  const loadExercices = useCallback(
    async (idpratique: number) => {
      if (!supabase) return;

      try {
        const { data, error } = await supabase
          .from("exercices")
          .select("*")
          .eq("idpratique", idpratique)
          .order("nomexercice");

        if (error) throw error;
        setExercices(data || []);
      } catch (error) {
        console.error("Erreur lors du chargement des exercices:", error);
      }
    },
    [supabase]
  );

  // Chargement initial
  useEffect(() => {
    loadPratiques();
  }, [loadPratiques]);

  // Chargement des exercices quand une pratique est sélectionnée
  useEffect(() => {
    if (selectedPratique) {
      loadExercices(selectedPratique);
    }
  }, [selectedPratique, loadExercices]);

  // Gestion de la navigation
  const handleNext = useCallback(() => {
    setActiveStep((prevActiveStep) =>
      Math.min(prevActiveStep + 1, steps.length - 1)
    );
  }, [steps.length]);

  const handleBack = useCallback(() => {
    setActiveStep((prevActiveStep) => Math.max(prevActiveStep - 1, 0));
  }, []);

  const handleStepClick = useCallback((stepIndex: number) => {
    setActiveStep(stepIndex);
  }, []);

  // Rendu de la fiche conseiller
  const renderFicheConseiller = (pratique: Pratique) => {
    if (!pratique.fiche_conseiller_json) {
      return (
        <Typography variant="body2" color="text.secondary">
          Aucune fiche conseiller disponible pour cette pratique.
        </Typography>
      );
    }

    return (
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary">
            Fiche Flash Conseiller
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            {pratique.nompratique}
          </Typography>
          <Typography variant="body2" paragraph>
            {pratique.description}
          </Typography>

          {/* Rendu dynamique du JSON de la fiche conseiller */}
          <Box sx={{ mt: 2 }}>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                fontSize: "0.875rem",
                backgroundColor: theme.palette.grey[50],
                padding: theme.spacing(2),
                borderRadius: theme.shape.borderRadius,
              }}
            >
              {JSON.stringify(pratique.fiche_conseiller_json, null, 2)}
            </pre>
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Rendu de la fiche coach
  const renderFicheCoach = (pratique: Pratique) => {
    if (!pratique.fiche_coach_json) {
      return (
        <Typography variant="body2" color="text.secondary">
          Aucune fiche coach disponible pour cette pratique.
        </Typography>
      );
    }

    return (
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom color="secondary">
            Fiche Flash Coach
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            {pratique.nompratique}
          </Typography>
          <Typography variant="body2" paragraph>
            {pratique.description}
          </Typography>

          {pratique.geste && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Geste clé :
              </Typography>
              <Chip
                label={pratique.geste}
                color="secondary"
                variant="outlined"
              />
            </Box>
          )}

          {/* Rendu dynamique du JSON de la fiche coach */}
          <Box sx={{ mt: 2 }}>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                fontSize: "0.875rem",
                backgroundColor: theme.palette.grey[50],
                padding: theme.spacing(2),
                borderRadius: theme.shape.borderRadius,
              }}
            >
              {JSON.stringify(pratique.fiche_coach_json, null, 2)}
            </pre>
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Rendu des exercices
  const renderExercices = () => {
    if (exercices.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary">
          Aucun exercice disponible pour cette pratique.
        </Typography>
      );
    }

    return (
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom color="info">
            Exercices d'entraînement
          </Typography>
          <List>
            {exercices.map((exercice, index) => (
              <Box key={exercice.idexercice}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={exercice.nomexercice}
                    secondary={
                      <Box>
                        <Typography variant="body2" paragraph>
                          {exercice.description}
                        </Typography>
                        {exercice.nudges && (
                          <Box sx={{ mt: 1 }}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Nudges d'entraînement :
                            </Typography>
                            <pre
                              style={{
                                whiteSpace: "pre-wrap",
                                fontSize: "0.75rem",
                                backgroundColor:
                                  theme.palette.info.light + "20",
                                padding: theme.spacing(1),
                                borderRadius: theme.shape.borderRadius,
                                marginTop: theme.spacing(0.5),
                              }}
                            >
                              {JSON.stringify(exercice.nudges, null, 2)}
                            </pre>
                          </Box>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                {index < exercices.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        </CardContent>
      </Card>
    );
  };

  // Rendu du contenu selon l'étape active
  const renderStepContent = () => {
    const currentStep = steps[activeStep];

    switch (currentStep.id) {
      case "bilan":
        const selectedPratiqueData = pratiques.find(
          (p) => p.idpratique === selectedPratique
        );

        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Bilan du coaching
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Sélectionnez une pratique pour afficher les ressources associées.
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
                {pratiques.map((pratique) => (
                  <MenuItem
                    key={pratique.idpratique}
                    value={pratique.idpratique}
                  >
                    {pratique.nompratique}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Onglets pour les différentes vues */}
            {selectedPratique && selectedPratiqueData && (
              <Box>
                <Tabs
                  value={selectedView}
                  onChange={(_, newValue) => setSelectedView(newValue)}
                  sx={{ mb: 2 }}
                >
                  <Tab label="Fiche Conseiller" value="conseiller" />
                  <Tab label="Fiche Coach" value="coach" />
                  <Tab label="Exercices" value="exercices" />
                </Tabs>

                {/* Contenu selon la vue sélectionnée */}
                <Box sx={{ mt: 2 }}>
                  {selectedView === "conseiller" &&
                    renderFicheConseiller(selectedPratiqueData)}
                  {selectedView === "coach" &&
                    renderFicheCoach(selectedPratiqueData)}
                  {selectedView === "exercices" && renderExercices()}
                </Box>
              </Box>
            )}

            {/* Message si aucune pratique sélectionnée */}
            {!selectedPratique && !loading && (
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  mt: 2,
                  bgcolor: theme.palette.grey[50],
                  textAlign: "center",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Veuillez sélectionner une pratique pour voir les ressources
                  disponibles.
                </Typography>
              </Paper>
            )}
          </Box>
        );

      case "deroulement":
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Déroulé de l'entraînement
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Cette section permettra de planifier les exercices d'entraînement
              et de suivre les progrès.
            </Typography>
            {/* Contenu du déroulé à développer */}
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mt: 2,
                bgcolor: theme.palette.grey[50],
                textAlign: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Contenu du déroulé en cours de développement...
              </Typography>
            </Paper>
          </Box>
        );

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
            Suivi post-coaching et planification de l'entraînement
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
          {steps.map((step, index) => (
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
          Étape {activeStep + 1} sur {steps.length}
        </Typography>

        <Button
          disabled={activeStep === steps.length - 1}
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
