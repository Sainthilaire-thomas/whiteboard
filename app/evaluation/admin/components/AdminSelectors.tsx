// app/evaluation/admin/components/AdminSelectors.tsx
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
  SelectChangeEvent,
  Alert,
  Grid,
  CircularProgress,
} from "@mui/material";
import { Business } from "@mui/icons-material";
import { Entreprise, DomaineQualite } from "../types/admin";

interface AdminSelectorsProps {
  entreprises: Entreprise[];
  domaines: DomaineQualite[];
  selectedEntreprise: string;
  selectedDomaine: string;
  loading: boolean;
  onEntrepriseChange: (id: string) => void;
  onDomaineChange: (id: string) => void;
}

export const AdminSelectors: React.FC<AdminSelectorsProps> = ({
  entreprises,
  domaines,
  selectedEntreprise,
  selectedDomaine,
  loading,
  onEntrepriseChange,
  onDomaineChange,
}) => {
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Business sx={{ mr: 1, color: "secondary.main" }} />
        <Typography variant="h6" sx={{ fontWeight: "medium" }}>
          Sélection de l'entreprise et de la grille qualité
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Entreprise</InputLabel>
            <Select
              value={selectedEntreprise}
              onChange={(e: SelectChangeEvent) =>
                onEntrepriseChange(e.target.value)
              }
              label="Entreprise"
              disabled={loading}
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
            disabled={!selectedEntreprise || domaines.length === 0 || loading}
          >
            <InputLabel>Grille qualité</InputLabel>
            <Select
              value={selectedDomaine}
              onChange={(e: SelectChangeEvent) =>
                onDomaineChange(e.target.value)
              }
              label="Grille qualité"
            >
              <MenuItem value="">
                <em>Sélectionnez une grille qualité</em>
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
          Aucune grille qualité trouvée pour cette entreprise.
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
          <CircularProgress />
        </Box>
      )}
    </Paper>
  );
};
