// app/evaluation/admin/components/sections/forms/CategorieForm.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  Alert,
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  Switch,
  FormControlLabel,
  Slider,
} from "@mui/material";
import {
  Save,
  Cancel,
  Category,
  Palette,
  Sort,
  Info,
  ColorLens,
} from "@mui/icons-material";
import { CategoriesujetExtended, AdminMode } from "../../../types/admin";

interface CategorieFormProps {
  categorie?: CategoriesujetExtended | null;
  mode: AdminMode;
  loading?: boolean;
  onSave: (data: Partial<CategoriesujetExtended>) => void;
  onCancel: () => void;
}

interface FormData {
  nomcategorie: string;
  description: string;
  couleur: string;
}

interface FormErrors {
  nomcategorie?: string;
  description?: string;
  couleur?: string;
}

// Couleurs prédéfinies avec noms
const COULEURS_PREDEFINED = [
  { nom: "Bleu", hex: "#1976d2", usage: "Procédures, Standards" },
  { nom: "Rouge", hex: "#d32f2f", usage: "Sécurité, Urgence" },
  { nom: "Vert", hex: "#388e3c", usage: "Communication, OK" },
  { nom: "Orange", hex: "#f57c00", usage: "Technique, Attention" },
  { nom: "Violet", hex: "#7b1fa2", usage: "Qualité, Premium" },
  { nom: "Teal", hex: "#00796b", usage: "Process, Workflow" },
  { nom: "Indigo", hex: "#303f9f", usage: "Administration" },
  { nom: "Rose", hex: "#c2185b", usage: "Spécial, Important" },
];

export const CategorieForm: React.FC<CategorieFormProps> = ({
  categorie,
  mode,
  loading = false,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<FormData>({
    nomcategorie: "",
    description: "",
    couleur: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedPreset, setSelectedPreset] = useState<string>("");

  // Initialiser le formulaire
  useEffect(() => {
    if (categorie && mode === "edit") {
      setFormData({
        nomcategorie: categorie.nomcategorie || "",
        description: categorie.description || "",
        couleur: categorie.couleur || "",
      });
    } else {
      // Reset pour création
      setFormData({
        nomcategorie: "",
        description: "",
        couleur: "",
      });
    }
    setErrors({});
    setSelectedPreset("");
  }, [categorie, mode]);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.nomcategorie.trim()) {
      newErrors.nomcategorie = "Le nom de la catégorie est requis";
    } else if (formData.nomcategorie.trim().length < 2) {
      newErrors.nomcategorie = "Le nom doit contenir au moins 2 caractères";
    }

    if (formData.couleur && !isValidHexColor(formData.couleur)) {
      newErrors.couleur = "Format de couleur invalide (ex: #1976d2)";
    }

    if (formData.description && formData.description.length > 2000) {
      newErrors.description =
        "La description ne peut pas dépasser 2000 caractères";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidHexColor = (color: string): boolean => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  };

  // Gestion des changements
  const handleChange =
    (field: keyof FormData) =>
    (
      event:
        | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        | { target: { value: any } }
    ) => {
      const value = event.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear error when user starts typing
      if (errors[field as keyof FormErrors]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const handleSwitchChange =
    (field: keyof FormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: event.target.checked }));
    };

  const handleSliderChange =
    (field: keyof FormData) => (_event: Event, value: number | number[]) => {
      setFormData((prev) => ({ ...prev, [field]: value as number }));
    };

  // Appliquer une couleur prédéfinie
  const handleApplyPreset = (couleurHex: string, nom: string) => {
    setFormData((prev) => ({ ...prev, couleur: couleurHex }));
    setSelectedPreset(nom);
    if (errors.couleur) {
      setErrors((prev) => ({ ...prev, couleur: undefined }));
    }
  };

  // Gestion de la soumission
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (validateForm()) {
      // Nettoyer les données avant envoi
      const cleanData: Partial<CategoriesujetExtended> = {
        nomcategorie: formData.nomcategorie.trim(),
        description: formData.description.trim() || undefined,
        couleur: formData.couleur.trim() || undefined,
      };

      onSave(cleanData);
    }
  };

  const isReadOnly = mode === "view";

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        {/* Informations générales */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Info sx={{ mr: 1, verticalAlign: "middle" }} />
                Informations de la catégorie
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Nom de la catégorie"
                    value={formData.nomcategorie}
                    onChange={handleChange("nomcategorie")}
                    error={!!errors.nomcategorie}
                    helperText={
                      errors.nomcategorie ||
                      'Ex: "MH Procédures", "Sécurisation"'
                    }
                    disabled={isReadOnly || loading}
                    InputProps={{
                      startAdornment: (
                        <Category sx={{ mr: 1, color: "text.secondary" }} />
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Description"
                    value={formData.description}
                    onChange={handleChange("description")}
                    error={!!errors.description}
                    helperText={
                      errors.description ||
                      `Description de l'usage de cette catégorie (${formData.description.length}/300 caractères)`
                    }
                    disabled={isReadOnly || loading}
                    placeholder="Décrivez l'objectif et l'usage de cette catégorie dans les grilles qualité..."
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Configuration couleur */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Palette sx={{ mr: 1, verticalAlign: "middle" }} />
                Couleur de la catégorie
              </Typography>

              {/* Prévisualisation */}
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
              >
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: formData.couleur || "#e0e0e0",
                    border: "2px solid",
                    borderColor: "divider",
                  }}
                >
                  <ColorLens />
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    {formData.couleur ? "Couleur définie" : "Aucune couleur"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formData.couleur || "Sélectionnez une couleur"}
                  </Typography>
                </Box>
              </Box>

              {/* Couleur personnalisée */}
              <TextField
                fullWidth
                label="Couleur (hex)"
                value={formData.couleur}
                onChange={handleChange("couleur")}
                error={!!errors.couleur}
                helperText={errors.couleur || "Format: #1976d2"}
                disabled={isReadOnly || loading}
                placeholder="#1976d2"
                sx={{ mb: 2 }}
              />

              {/* Couleurs prédéfinies */}
              {!isReadOnly && (
                <>
                  <Typography variant="body2" gutterBottom>
                    Couleurs suggérées :
                  </Typography>
                  <Grid container spacing={1}>
                    {COULEURS_PREDEFINED.map((couleur) => (
                      <Grid item xs={6} key={couleur.hex}>
                        <Button
                          fullWidth
                          variant="outlined"
                          size="small"
                          onClick={() =>
                            handleApplyPreset(couleur.hex, couleur.nom)
                          }
                          sx={{
                            borderColor: couleur.hex,
                            color: couleur.hex,
                            "&:hover": {
                              borderColor: couleur.hex,
                              bgcolor: `${couleur.hex}20`,
                            },
                            ...(selectedPreset === couleur.nom && {
                              bgcolor: `${couleur.hex}20`,
                              borderWidth: 2,
                            }),
                          }}
                          startIcon={
                            <Avatar
                              sx={{
                                width: 16,
                                height: 16,
                                bgcolor: couleur.hex,
                              }}
                            >
                              <span />
                            </Avatar>
                          }
                        >
                          {couleur.nom}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>

                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="caption">
                      La couleur sera utilisée pour identifier visuellement
                      cette catégorie dans les grilles et rapports.
                    </Typography>
                  </Alert>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Messages contextuels */}
        <Grid item xs={12}>
          {mode === "create" && (
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Après création :</strong> Cette catégorie pourra être
                utilisée pour organiser les sujets dans les grilles qualité.
              </Typography>
            </Alert>
          )}

          {mode === "edit" && (
            <Alert severity="warning">
              <Typography variant="body2">
                <strong>Modification :</strong> Les changements affecteront tous
                les sujets utilisant cette catégorie dans toutes les grilles.
              </Typography>
            </Alert>
          )}
        </Grid>

        {/* Actions */}
        {!isReadOnly && (
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button
                variant="outlined"
                onClick={onCancel}
                disabled={loading}
                startIcon={<Cancel />}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={<Save />}
              >
                {loading ? "Sauvegarde..." : "Sauvegarder"}
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};
