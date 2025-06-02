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
import { Entreprise, DomaineQualite, Sujet } from "../types/admin"; // ✅ CORRECTION 1: Ajouter Sujet dans l'import

interface AdminSelectorsProps {
  entreprises: Entreprise[];
  domaines: DomaineQualite[];
  sujets?: Sujet[]; // ✅ CORRECTION 2: Ajouter sujets (optionnel)
  selectedEntreprise: string;
  selectedDomaine: string;
  selectedSujet?: string; // ✅ CORRECTION 3: Ajouter selectedSujet (optionnel)
  loading: boolean;
  onEntrepriseChange: (id: string) => void;
  onDomaineChange: (id: string) => void;
  onSujetChange?: (id: string) => void; // ✅ CORRECTION 4: Ajouter onSujetChange (optionnel)
  showSujetSelector?: boolean; // ✅ CORRECTION 5: Ajouter flag pour afficher/masquer le sélecteur de sujet
}

export const AdminSelectors: React.FC<AdminSelectorsProps> = ({
  entreprises,
  domaines,
  sujets = [], // ✅ CORRECTION 6: Valeur par défaut
  selectedEntreprise,
  selectedDomaine,
  selectedSujet = "", // ✅ CORRECTION 7: Valeur par défaut
  loading,
  onEntrepriseChange,
  onDomaineChange,
  onSujetChange, // ✅ CORRECTION 8: Récupérer la prop
  showSujetSelector = false, // ✅ CORRECTION 9: Valeur par défaut
}) => {
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Business sx={{ mr: 1, color: "secondary.main" }} />
        <Typography variant="h6" sx={{ fontWeight: "medium" }}>
          {/* ✅ CORRECTION 10: Titre dynamique selon le contexte */}
          {showSujetSelector
            ? "Sélection de l'entreprise, grille qualité et sujet"
            : "Sélection de l'entreprise et de la grille qualité"}
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {/* ✅ CORRECTION 11: Ajuster les colonnes selon si on affiche le sélecteur de sujet */}
        <Grid item xs={12} md={showSujetSelector ? 4 : 6}>
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

        <Grid item xs={12} md={showSujetSelector ? 4 : 6}>
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

        {/* ✅ CORRECTION 12: Ajouter le sélecteur de sujet conditionnel */}
        {showSujetSelector && (
          <Grid item xs={12} md={4}>
            <FormControl
              fullWidth
              disabled={!selectedDomaine || sujets.length === 0 || loading}
            >
              <InputLabel>Sujet (Critère)</InputLabel>
              <Select
                value={selectedSujet}
                onChange={(e: SelectChangeEvent) =>
                  onSujetChange?.(e.target.value)
                }
                label="Sujet (Critère)"
              >
                <MenuItem value="">
                  <em>Sélectionnez un sujet</em>
                </MenuItem>
                {sujets.map((sujet) => (
                  <MenuItem
                    key={sujet.idsujet}
                    value={sujet.idsujet.toString()}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                        {sujet.nomsujet}
                      </Typography>
                      {sujet.description && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block" }}
                        >
                          {sujet.description.length > 60
                            ? `${sujet.description.substring(0, 60)}...`
                            : sujet.description}
                        </Typography>
                      )}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}
      </Grid>

      {selectedEntreprise && domaines.length === 0 && !loading && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Aucune grille qualité trouvée pour cette entreprise.
        </Alert>
      )}

      {/* ✅ CORRECTION 13: Alert pour le sélecteur de sujet */}
      {showSujetSelector &&
        selectedDomaine &&
        sujets.length === 0 &&
        !loading && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Aucun sujet trouvé pour cette grille qualité.
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
