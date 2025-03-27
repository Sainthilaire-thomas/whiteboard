"use client";

import React from "react";
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Card,
  CardContent,
  Chip,
  SelectChangeEvent,
} from "@mui/material";
import { SyntheseTabProps } from "@/types/evaluation";
import { formatMotif } from "./utils/formatters";

const SyntheseTab: React.FC<SyntheseTabProps> = ({
  selectedCall,
  stats,
  selectedMotif,
  setSelectedMotif,
  formState,
  handleInputChange,
  setActiveTab,
  setSelectedSujet,
  setSelectedPratique,
}) => {
  const motifs = [
    "STAGIAIRE__ABSENCE",
    "INFORMATION_COLLECTIVE",
    "FORMATION__CONTENU",
    "FORMATION__LIEU",
    "POST_FORMATION",
    "FORMATION__EXISTE",
  ];

  const handleMotifChange = (event: SelectChangeEvent<string>) => {
    setSelectedMotif(event.target.value);
  };

  const handleSujetClick = (sujet: string) => {
    setSelectedSujet(sujet);
    setActiveTab(2); // Naviguer vers l'onglet de coaching
  };

  const handlePratiqueClick = (pratique: string) => {
    setSelectedPratique(pratique);
    setActiveTab(2); // Naviguer vers l'onglet de coaching
  };

  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="h6"
          sx={{ mb: 2, color: "text.primary", fontWeight: "medium" }}
        >
          Vue d'ensemble des évaluations
        </Typography>

        <Grid container spacing={2}>
          {/* STATISTIQUES DES SUJETS */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: "100%", borderLeft: "4px solid #3f51b5" }}>
              <CardContent>
                <Typography
                  variant="subtitle1"
                  color="primary"
                  gutterBottom
                  fontWeight="medium"
                >
                  Critères qualité identifiés
                </Typography>
                {stats.sujetsDetails.length > 0 ? (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {stats.sujetsDetails.map((sujet) => (
                      <Chip
                        key={sujet.name}
                        label={`${sujet.name} (${sujet.count})`}
                        size="small"
                        color="primary"
                        variant="outlined"
                        onClick={() => handleSujetClick(sujet.name)}
                        sx={{ m: 0.5 }}
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Aucun critère qualité identifié
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* STATISTIQUES DES PRATIQUES */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: "100%", borderLeft: "4px solid #f50057" }}>
              <CardContent>
                <Typography
                  variant="subtitle1"
                  color="secondary"
                  gutterBottom
                  fontWeight="medium"
                >
                  Pratiques à renforcer
                </Typography>
                {stats.pratiquesDetails.length > 0 ? (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {stats.pratiquesDetails.map((pratique) => (
                      <Chip
                        key={pratique.name}
                        label={`${pratique.name} (${pratique.count})`}
                        size="small"
                        color="secondary"
                        variant="outlined"
                        onClick={() => handlePratiqueClick(pratique.name)}
                        sx={{ m: 0.5 }}
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Aucune pratique identifiée
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default SyntheseTab;
