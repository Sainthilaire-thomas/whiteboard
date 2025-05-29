import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Fade,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Chip,
  Stack,
} from "@mui/material";
import {
  CheckCircle,
  RadioButtonUnchecked,
  ChangeCircle,
} from "@mui/icons-material";
import { Postit } from "@/types/types";
import { Item } from "@/types/types";
import GridContainerSujetsEval from "../GridContainerSujetsEval";

// Type pour la pondération
interface PonderationSujet {
  id_ponderation: number;
  idsujet: number;
  conforme: number;
  partiellement_conforme: number;
  non_conforme: number;
  permet_partiellement_conforme: boolean;
}

// Type pour le choix de conformité
type ConformiteChoice = "conforme" | "partiellement_conforme" | "non_conforme";

interface SujetStepProps {
  selectedPostit: Postit;
  categoriesSujets: any[];
  sujetsData: any[];
  columnConfigSujets: any;
  sujetsDeLActivite: number[];
  handleSujetClick: (item: Item) => void;
  stepBoxStyle: any;
  onBack: () => void;
  onNext: () => void;
  ponderationsSujets?: PonderationSujet[]; // Nouvelle prop pour les pondérations
}

export const SujetStep: React.FC<SujetStepProps> = ({
  selectedPostit,
  categoriesSujets,
  sujetsData,
  columnConfigSujets,
  sujetsDeLActivite,
  handleSujetClick,
  stepBoxStyle,
  ponderationsSujets = [],
}) => {
  const [conformiteChoice, setConformiteChoice] =
    useState<ConformiteChoice>("non_conforme");
  const [selectedSujetPonderation, setSelectedSujetPonderation] =
    useState<PonderationSujet | null>(null);

  // Effet pour récupérer la pondération du sujet sélectionné
  useEffect(() => {
    if (selectedPostit.idsujet) {
      const ponderation = ponderationsSujets.find(
        (p) => p.idsujet === selectedPostit.idsujet
      );
      setSelectedSujetPonderation(ponderation || null);

      // Reset du choix de conformité quand on change de sujet
      setConformiteChoice("non_conforme");
    }
  }, [selectedPostit.idsujet, ponderationsSujets]);

  // Fonction pour gérer le clic sur un sujet
  const handleEnhancedSujetClick = (item: Item) => {
    handleSujetClick(item);
  };

  // Fonction pour gérer le changement de conformité
  const handleConformiteChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConformiteChoice(event.target.value as ConformiteChoice);
  };

  // Obtenir les points selon le choix de conformité
  const getPointsForChoice = (choice: ConformiteChoice): number => {
    if (!selectedSujetPonderation) return 0;

    switch (choice) {
      case "conforme":
        return selectedSujetPonderation.conforme;
      case "partiellement_conforme":
        return selectedSujetPonderation.partiellement_conforme;
      case "non_conforme":
        return selectedSujetPonderation.non_conforme;
      default:
        return 0;
    }
  };

  // Fonction pour obtenir la couleur du chip selon les points
  const getChipColor = (points: number) => {
    if (points > 0) return "success";
    if (points === 0) return "warning";
    return "error";
  };

  // Fonction pour obtenir l'icône selon le choix
  const getChoiceIcon = (choice: ConformiteChoice) => {
    switch (choice) {
      case "conforme":
        return <CheckCircle sx={{ fontSize: 16, color: "success.main" }} />;
      case "partiellement_conforme":
        return <ChangeCircle sx={{ fontSize: 16, color: "warning.main" }} />;
      case "non_conforme":
        return (
          <RadioButtonUnchecked sx={{ fontSize: 16, color: "error.main" }} />
        );
    }
  };

  return (
    <Box sx={stepBoxStyle}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Sélectionnez le critère qualité en défaut dans la grille ci-dessous.
      </Typography>

      <GridContainerSujetsEval
        categories={categoriesSujets}
        items={sujetsData}
        columnConfig={columnConfigSujets}
        handleSujetClick={handleEnhancedSujetClick}
        sujetsDeLActivite={sujetsDeLActivite}
      />

      {selectedPostit.idsujet && (
        <Fade in timeout={500}>
          <Box sx={{ mt: 3 }}>
            <Card elevation={2} sx={{ backgroundColor: "background.paper" }}>
              <CardContent>
                <Typography
                  variant="h6"
                  color="primary.main"
                  sx={{ mb: 2, fontWeight: 600 }}
                >
                  Sujet sélectionné: {selectedPostit.sujet}
                </Typography>

                {selectedSujetPonderation && (
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      Choisissez le niveau de conformité pour ce sujet :
                    </Typography>

                    <FormControl component="fieldset" sx={{ width: "100%" }}>
                      <RadioGroup
                        value={conformiteChoice}
                        onChange={handleConformiteChange}
                        sx={{ gap: 1 }}
                      >
                        {/* Option Conforme */}
                        <Card
                          variant="outlined"
                          sx={{
                            p: 1,
                            backgroundColor:
                              conformiteChoice === "conforme"
                                ? "success.light"
                                : "transparent",
                            borderColor:
                              conformiteChoice === "conforme"
                                ? "success.main"
                                : "divider",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              borderColor: "success.main",
                              backgroundColor: "success.light",
                            },
                          }}
                          onClick={() => setConformiteChoice("conforme")}
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            <FormControlLabel
                              value="conforme"
                              control={<Radio size="small" />}
                              label={
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  spacing={1}
                                >
                                  {getChoiceIcon("conforme")}
                                  <Typography variant="body2" fontWeight={500}>
                                    Conforme
                                  </Typography>
                                </Stack>
                              }
                              sx={{ margin: 0, flex: 1 }}
                            />
                            <Chip
                              label={`${selectedSujetPonderation.conforme} pts`}
                              size="small"
                              color={getChipColor(
                                selectedSujetPonderation.conforme
                              )}
                              variant="filled"
                            />
                          </Stack>
                        </Card>

                        {/* Option Partiellement Conforme - uniquement si autorisé */}
                        {selectedSujetPonderation.permet_partiellement_conforme && (
                          <Card
                            variant="outlined"
                            sx={{
                              p: 1,
                              backgroundColor:
                                conformiteChoice === "partiellement_conforme"
                                  ? "warning.light"
                                  : "transparent",
                              borderColor:
                                conformiteChoice === "partiellement_conforme"
                                  ? "warning.main"
                                  : "divider",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                              "&:hover": {
                                borderColor: "warning.main",
                                backgroundColor: "warning.light",
                              },
                            }}
                            onClick={() =>
                              setConformiteChoice("partiellement_conforme")
                            }
                          >
                            <Stack
                              direction="row"
                              alignItems="center"
                              justifyContent="space-between"
                            >
                              <FormControlLabel
                                value="partiellement_conforme"
                                control={<Radio size="small" />}
                                label={
                                  <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={1}
                                  >
                                    {getChoiceIcon("partiellement_conforme")}
                                    <Typography
                                      variant="body2"
                                      fontWeight={500}
                                    >
                                      Partiellement conforme
                                    </Typography>
                                  </Stack>
                                }
                                sx={{ margin: 0, flex: 1 }}
                              />
                              <Chip
                                label={`${selectedSujetPonderation.partiellement_conforme} pts`}
                                size="small"
                                color={getChipColor(
                                  selectedSujetPonderation.partiellement_conforme
                                )}
                                variant="filled"
                              />
                            </Stack>
                          </Card>
                        )}

                        {/* Option Non Conforme */}
                        <Card
                          variant="outlined"
                          sx={{
                            p: 1,
                            backgroundColor:
                              conformiteChoice === "non_conforme"
                                ? "error.light"
                                : "transparent",
                            borderColor:
                              conformiteChoice === "non_conforme"
                                ? "error.main"
                                : "divider",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              borderColor: "error.main",
                              backgroundColor: "error.light",
                            },
                          }}
                          onClick={() => setConformiteChoice("non_conforme")}
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            <FormControlLabel
                              value="non_conforme"
                              control={<Radio size="small" />}
                              label={
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  spacing={1}
                                >
                                  {getChoiceIcon("non_conforme")}
                                  <Typography variant="body2" fontWeight={500}>
                                    Non conforme
                                  </Typography>
                                </Stack>
                              }
                              sx={{ margin: 0, flex: 1 }}
                            />
                            <Chip
                              label={`${selectedSujetPonderation.non_conforme} pts`}
                              size="small"
                              color={getChipColor(
                                selectedSujetPonderation.non_conforme
                              )}
                              variant="filled"
                            />
                          </Stack>
                        </Card>
                      </RadioGroup>
                    </FormControl>

                    {/* Résumé du choix actuel */}
                    <Box
                      sx={{
                        mt: 2,
                        p: 2,
                        backgroundColor: "action.hover",
                        borderRadius: 1,
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Typography variant="body2" color="text.secondary">
                          Points attribués avec ce choix :
                        </Typography>
                        <Chip
                          label={`${getPointsForChoice(
                            conformiteChoice
                          )} points`}
                          color={getChipColor(
                            getPointsForChoice(conformiteChoice)
                          )}
                          variant="filled"
                          sx={{ fontWeight: 600 }}
                        />
                      </Stack>
                    </Box>
                  </Box>
                )}

                {!selectedSujetPonderation && (
                  <Typography variant="body2" color="warning.main">
                    Aucune pondération trouvée pour ce sujet.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Box>
        </Fade>
      )}
    </Box>
  );
};
