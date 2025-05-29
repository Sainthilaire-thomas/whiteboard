// app/evaluation/admin/components/sections/AdminPonderationSection.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Alert,
  Chip,
  TextField,
  Switch,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from "@mui/material";
import { Category, Info } from "@mui/icons-material";
import {
  Sujet,
  PonderationSujet,
  CategoriesujetExtended,
} from "../../types/admin";
import { AdminToolbar } from "../AdminToolbar";

interface AdminPonderationSectionProps {
  sujets: Sujet[];
  ponderations: PonderationSujet[];
  categories: CategoriesujetExtended[];
  domaineNom?: string;
  loading?: boolean;
  saving?: boolean;
  onPonderationChange: (
    idsujet: number,
    field: keyof PonderationSujet,
    value: number | boolean
  ) => void;
  onSave: () => void;
  onRefresh: () => void;
}

export const AdminPonderationSection: React.FC<
  AdminPonderationSectionProps
> = ({
  sujets,
  ponderations,
  categories,
  domaineNom,
  loading = false,
  saving = false,
  onPonderationChange,
  onSave,
  onRefresh,
}) => {
  const [localPonderations, setLocalPonderations] =
    useState<PonderationSujet[]>(ponderations);

  useEffect(() => {
    setLocalPonderations(ponderations);
  }, [ponderations]);

  // Fonction pour obtenir la pondération d'un sujet
  const getPonderationForSujet = (idsujet: number): PonderationSujet => {
    const ponderation = localPonderations.find((p) => p.idsujet === idsujet);
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

  // Fonction pour mettre à jour une pondération localement
  const handlePonderationChange = (
    idsujet: number,
    field: keyof PonderationSujet,
    value: number | boolean
  ) => {
    setLocalPonderations((prev) => {
      const existing = prev.find((p) => p.idsujet === idsujet);

      if (existing) {
        const updated = prev.map((p) =>
          p.idsujet === idsujet ? { ...p, [field]: value } : p
        );
        return updated;
      } else {
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

    // Propager le changement vers le parent
    onPonderationChange(idsujet, field, value);
  };

  // Grouper les sujets par catégorie
  const sujetsByCategory = categories
    .filter((cat) =>
      sujets.some((s) => s.idcategoriesujet === cat.idcategoriesujet)
    )
    .map((cat) => ({
      ...cat,
      sujets: sujets.filter((s) => s.idcategoriesujet === cat.idcategoriesujet),
    }))
    .filter((cat) => cat.sujets.length > 0);

  if (sujets.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="info">
          Sélectionnez une entreprise et un domaine pour configurer les
          pondérations.
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 0 }}>
      <AdminToolbar
        mode="edit"
        title="Configuration des pondérations"
        subtitle={domaineNom ? `Domaine: ${domaineNom}` : undefined}
        loading={loading}
        saving={saving}
        canCreate={false}
        canEdit={false}
        canDelete={false}
        onModeChange={() => {}}
        onSave={onSave}
        onRefresh={onRefresh}
      />

      <Box sx={{ p: 3 }}>
        <Alert severity="info" icon={<Info />} sx={{ mb: 3 }}>
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

        {domaineNom && (
          <Box sx={{ mb: 3 }}>
            <Chip
              label={`Domaine: ${domaineNom}`}
              color="primary"
              variant="outlined"
            />
          </Box>
        )}

        {sujetsByCategory.length === 0 ? (
          <Alert severity="info">Aucun critère trouvé pour ce domaine.</Alert>
        ) : (
          sujetsByCategory.map((category) => (
            <Box key={category.idcategoriesujet} sx={{ mb: 4 }}>
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
                      const ponderation = getPonderationForSujet(sujet.idsujet);
                      return (
                        <TableRow key={sujet.idsujet} hover>
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
                                  sx={{ display: "block", mt: 0.5 }}
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
                                handlePonderationChange(
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
                                handlePonderationChange(
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
                                handlePonderationChange(
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
                                handlePonderationChange(
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
      </Box>
    </Paper>
  );
};
