// app/evaluation/admin/components/sections/forms/GrilleQualiteForm.tsx
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
} from "@mui/material";
import { Save, Cancel, Dashboard, Info, Business } from "@mui/icons-material";
import { DomaineQualite, AdminMode } from "../../../types/admin";

interface GrilleQualiteFormProps {
  grille?: DomaineQualite | null;
  mode: AdminMode;
  loading?: boolean;
  onSave: (data: Partial<DomaineQualite>) => void;
  onCancel: () => void;
}

interface FormData {
  nomdomaine: string;
  description: string;
}

interface FormErrors {
  nomdomaine?: string;
  description?: string;
}

// Templates de grilles prédéfinies
const TEMPLATES_GRILLES = [
  {
    nom: "Grille ESCDA",
    description: "Grille d'évaluation standardisée ESCDA pour centres d'appels",
  },
  {
    nom: "Grille La Poste",
    description:
      "Grille qualité spécifique aux services postaux et logistiques",
  },
  {
    nom: "Grille Téléphone",
    description:
      "Grille d'évaluation pour services de téléphonie et support client",
  },
  {
    nom: "Grille Bancaire",
    description: "Grille qualité adaptée aux services bancaires et financiers",
  },
  {
    nom: "Grille Assurance",
    description: "Grille d'évaluation pour secteur des assurances",
  },
];

export const GrilleQualiteForm: React.FC<GrilleQualiteFormProps> = ({
  grille,
  mode,
  loading = false,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<FormData>({
    nomdomaine: "",
    description: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  // Initialiser le formulaire
  useEffect(() => {
    if (grille && mode === "edit") {
      setFormData({
        nomdomaine: grille.nomdomaine || "",
        description: grille.description || "",
      });
    } else {
      // Reset pour création
      setFormData({
        nomdomaine: "",
        description: "",
      });
    }
    setErrors({});
    setSelectedTemplate("");
  }, [grille, mode]);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.nomdomaine.trim()) {
      newErrors.nomdomaine = "Le nom de la grille est requis";
    } else if (formData.nomdomaine.trim().length < 3) {
      newErrors.nomdomaine = "Le nom doit contenir au moins 3 caractères";
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description =
        "La description ne peut pas dépasser 500 caractères";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestion des changements
  const handleChange =
    (field: keyof FormData) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  // Appliquer un template
  const handleApplyTemplate = (templateNom: string) => {
    const template = TEMPLATES_GRILLES.find((t) => t.nom === templateNom);
    if (template) {
      setFormData({
        nomdomaine: template.nom,
        description: template.description,
      });
      setSelectedTemplate(templateNom);
      // Clear errors
      setErrors({});
    }
  };

  // Gestion de la soumission
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (validateForm()) {
      // Nettoyer les données avant envoi
      const cleanData: Partial<DomaineQualite> = {
        nomdomaine: formData.nomdomaine.trim(),
        description: formData.description.trim() || undefined,
      };

      onSave(cleanData);
    }
  };

  const isReadOnly = mode === "view";
  const title =
    mode === "create"
      ? "Nouvelle grille qualité"
      : mode === "edit"
      ? "Modifier la grille qualité"
      : "Détails de la grille qualité";

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        {/* Templates (uniquement en création) */}
        {mode === "create" && (
          <Grid item xs={12}>
            <Card
              sx={{
                bgcolor: "primary.50",
                border: "1px solid",
                borderColor: "primary.200",
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  <Dashboard sx={{ mr: 1, verticalAlign: "middle" }} />
                  Templates de grilles prédéfinies
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Utilisez un template pour créer rapidement une grille basée
                  sur des standards existants :
                </Typography>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                  {TEMPLATES_GRILLES.map((template) => (
                    <Chip
                      key={template.nom}
                      label={template.nom}
                      onClick={() => handleApplyTemplate(template.nom)}
                      color={
                        selectedTemplate === template.nom
                          ? "primary"
                          : "default"
                      }
                      variant={
                        selectedTemplate === template.nom
                          ? "filled"
                          : "outlined"
                      }
                      clickable
                    />
                  ))}
                </Box>

                {selectedTemplate && (
                  <Alert severity="success" sx={{ mt: 1 }}>
                    Template "{selectedTemplate}" appliqué ! Vous pouvez
                    maintenant personnaliser les champs.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Informations générales */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Info sx={{ mr: 1, verticalAlign: "middle" }} />
                Informations de la grille
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Nom de la grille qualité"
                    value={formData.nomdomaine}
                    onChange={handleChange("nomdomaine")}
                    error={!!errors.nomdomaine}
                    helperText={
                      errors.nomdomaine ||
                      'Ex: "Grille ESCDA", "Grille La Poste"'
                    }
                    disabled={isReadOnly || loading}
                    InputProps={{
                      startAdornment: (
                        <Dashboard sx={{ mr: 1, color: "text.secondary" }} />
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Description"
                    value={formData.description}
                    onChange={handleChange("description")}
                    error={!!errors.description}
                    helperText={
                      errors.description ||
                      `Description détaillée de la grille et de son usage (${formData.description.length}/500 caractères)`
                    }
                    disabled={isReadOnly || loading}
                    placeholder="Décrivez l'objectif, le contexte d'usage et les spécificités de cette grille qualité..."
                  />
                </Grid>

                {mode === "edit" && grille?.created_at && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Date de création"
                      value={new Date(grille.created_at).toLocaleDateString(
                        "fr-FR"
                      )}
                      disabled
                      variant="filled"
                    />
                  </Grid>
                )}

                {mode === "edit" && grille?.iddomaine && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Identifiant"
                      value={`ID: ${grille.iddomaine}`}
                      disabled
                      variant="filled"
                    />
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Informations contextuelles */}
        <Grid item xs={12}>
          {mode === "create" && (
            <Alert severity="info" icon={<Business />}>
              <Typography variant="body2">
                <strong>Après création :</strong> Vous pourrez ajouter des
                catégories et des sujets à cette grille, puis l'associer aux
                entreprises qui l'utiliseront.
              </Typography>
            </Alert>
          )}

          {mode === "edit" && (
            <Alert severity="warning">
              <Typography variant="body2">
                <strong>Modification :</strong> Les changements affecteront
                toutes les entreprises utilisant cette grille qualité.
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
