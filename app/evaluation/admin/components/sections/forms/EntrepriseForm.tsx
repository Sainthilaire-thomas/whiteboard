// app/evaluation/admin/components/sections/forms/EntrepriseForm.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Typography,
  IconButton,
  Alert,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import {
  Save,
  Cancel,
  Business,
  PhotoCamera,
  Delete,
} from "@mui/icons-material";
import { Entreprise, AdminMode } from "../../../types/admin";

interface EntrepriseFormProps {
  entreprise?: Entreprise | null;
  mode: AdminMode;
  loading?: boolean;
  onSave: (data: Partial<Entreprise>) => void;
  onCancel: () => void;
}

interface FormData {
  nomentreprise: string;
  domaine: string;
  logo: string;
}

interface FormErrors {
  nomentreprise?: string;
  domaine?: string;
  logo?: string;
}

// Domaines internet prédéfinis (à adapter selon vos besoins)
const DOMAINES_INTERNET_EXAMPLES = [
  "sonear.com",
  "laposte.fr",
  "escda.fr",
  "example.com",
  "autre...",
];

export const EntrepriseForm: React.FC<EntrepriseFormProps> = ({
  entreprise,
  mode,
  loading = false,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<FormData>({
    nomentreprise: "",
    domaine: "",
    logo: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [logoPreview, setLogoPreview] = useState<string>("");

  // Initialiser le formulaire
  useEffect(() => {
    if (entreprise && mode === "edit") {
      setFormData({
        nomentreprise: entreprise.nomentreprise || "",
        domaine: entreprise.domaine || "",
        logo: entreprise.logo || "",
      });
      setLogoPreview(entreprise.logo || "");
    } else {
      // Reset pour création
      setFormData({
        nomentreprise: "",
        domaine: "",
        logo: "",
      });
      setLogoPreview("");
    }
    setErrors({});
  }, [entreprise, mode]);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.nomentreprise.trim()) {
      newErrors.nomentreprise = "Le nom de l'entreprise est requis";
    } else if (formData.nomentreprise.trim().length < 2) {
      newErrors.nomentreprise = "Le nom doit contenir au moins 2 caractères";
    }

    if (formData.logo && !isValidUrl(formData.logo)) {
      newErrors.logo = "L'URL du logo n'est pas valide";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Gestion des changements
  const handleChange =
    (field: keyof FormData) =>
    (
      event:
        | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        | { target: { value: string } }
    ) => {
      const value = event.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }

      // Update logo preview
      if (field === "logo") {
        setLogoPreview(value);
      }
    };

  // Gestion de la soumission
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (validateForm()) {
      // Nettoyer les données avant envoi
      const cleanData: Partial<Entreprise> = {
        nomentreprise: formData.nomentreprise.trim(),
        domaine: formData.domaine.trim() || undefined,
        logo: formData.logo.trim() || undefined,
      };

      onSave(cleanData);
    }
  };

  // Supprimer le logo
  const handleRemoveLogo = () => {
    setFormData((prev) => ({ ...prev, logo: "" }));
    setLogoPreview("");
  };

  const isReadOnly = mode === "view";
  const title =
    mode === "create"
      ? "Nouvelle entreprise"
      : mode === "edit"
      ? "Modifier l'entreprise"
      : "Détails de l'entreprise";

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        {/* Section Logo */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h6" gutterBottom>
                Logo de l'entreprise
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Avatar
                  src={logoPreview}
                  alt="Logo entreprise"
                  sx={{
                    width: 120,
                    height: 120,
                    mx: "auto",
                    mb: 2,
                    border: "2px dashed",
                    borderColor: "divider",
                  }}
                >
                  <Business sx={{ fontSize: 60 }} />
                </Avatar>

                {logoPreview && !isReadOnly && (
                  <IconButton
                    color="error"
                    size="small"
                    onClick={handleRemoveLogo}
                    sx={{ position: "absolute", mt: -15, ml: 8 }}
                  >
                    <Delete />
                  </IconButton>
                )}
              </Box>

              {!isReadOnly && (
                <TextField
                  fullWidth
                  label="URL du logo"
                  value={formData.logo}
                  onChange={handleChange("logo")}
                  error={!!errors.logo}
                  helperText={
                    errors.logo || "URL de l'image du logo (optionnel)"
                  }
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <PhotoCamera sx={{ mr: 1, color: "text.secondary" }} />
                    ),
                  }}
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Section Informations */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Informations générales
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Nom de l'entreprise"
                    value={formData.nomentreprise}
                    onChange={handleChange("nomentreprise")}
                    error={!!errors.nomentreprise}
                    helperText={errors.nomentreprise}
                    disabled={isReadOnly || loading}
                    InputProps={{
                      startAdornment: (
                        <Business sx={{ mr: 1, color: "text.secondary" }} />
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Domaine internet</InputLabel>
                    <Select
                      value={formData.domaine}
                      onChange={handleChange("domaine")}
                      label="Domaine internet"
                      disabled={isReadOnly || loading}
                    >
                      <MenuItem value="">
                        <em>Sélectionnez un domaine</em>
                      </MenuItem>
                      {DOMAINES_INTERNET_EXAMPLES.map((domaine) => (
                        <MenuItem key={domaine} value={domaine}>
                          {domaine}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5, display: "block" }}
                  >
                    Domaine internet de l'entreprise (ex: sonear.com)
                  </Typography>
                </Grid>

                {mode === "edit" && entreprise?.created_at && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Date de création"
                      value={new Date(entreprise.created_at).toLocaleDateString(
                        "fr-FR"
                      )}
                      disabled
                      variant="filled"
                    />
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Messages d'information */}
        <Grid item xs={12}>
          {mode === "create" && (
            <Alert severity="info">
              Après création, vous pourrez associer cette entreprise à des
              domaines d'évaluation.
            </Alert>
          )}

          {mode === "edit" && (
            <Alert severity="warning">
              La modification du nom de l'entreprise peut affecter les
              évaluations existantes.
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
