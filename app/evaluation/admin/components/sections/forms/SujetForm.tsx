// app/evaluation/admin/components/sections/forms/SujetForm.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Grid,
  Alert,
  Paper,
  Divider,
  Switch,
  FormControlLabel,
  Chip,
  Avatar,
  Card,
  CardContent,
  InputAdornment,
  Slider,
  FormHelperText,
} from "@mui/material";
import {
  Assignment,
  Dashboard,
  Category,
  Description,
  TuneOutlined,
  Save,
  Cancel,
  Info,
} from "@mui/icons-material";
import {
  Sujet,
  DomaineQualite,
  CategoriesujetExtended,
  AdminMode,
} from "../../../types/admin";

interface SujetFormProps {
  sujet: Sujet | null;
  domaines: DomaineQualite[];
  categories: CategoriesujetExtended[];
  mode: AdminMode;
  loading?: boolean;
  onSave: (sujetData: Partial<Sujet>) => void;
  onCancel: () => void;
}

export const SujetForm: React.FC<SujetFormProps> = ({
  sujet,
  domaines,
  categories,
  mode,
  loading = false,
  onSave,
  onCancel,
}) => {
  // États du formulaire
  const [formData, setFormData] = useState({
    nomsujet: "",
    description: "",
    iddomaine: "",
    idcategoriesujet: "",
    valeurnumérique: 1,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Initialisation du formulaire
  useEffect(() => {
    if (sujet && mode === "edit") {
      setFormData({
        nomsujet: sujet.nomsujet || "",
        description: sujet.description || "",
        iddomaine: sujet.iddomaine?.toString() || "",
        idcategoriesujet: sujet.idcategoriesujet?.toString() || "",
        valeurnumérique: sujet.valeurnumérique ?? 1,
      });
    } else {
      // Formulaire vide pour la création
      setFormData({
        nomsujet: "",
        description: "",
        iddomaine: "",
        idcategoriesujet: "",
        valeurnumérique: 1,
      });
    }
    setErrors({});
    setTouched({});
  }, [sujet, mode]);

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nomsujet.trim()) {
      newErrors.nomsujet = "Le nom du sujet est obligatoire";
    } else if (formData.nomsujet.length < 3) {
      newErrors.nomsujet = "Le nom doit contenir au moins 3 caractères";
    } else if (formData.nomsujet.length > 200) {
      newErrors.nomsujet = "Le nom ne peut pas dépasser 200 caractères";
    }

    if (!formData.iddomaine) {
      newErrors.iddomaine = "La grille qualité est obligatoire";
    }

    if (formData.description && formData.description.length > 2000) {
      newErrors.description =
        "La description ne peut pas dépasser 2000 caractères";
    }

    if (formData.valeurnumérique < 0 || formData.valeurnumérique > 10) {
      newErrors.valeurnumérique = "La valeur doit être entre 0 et 10";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestion des changements
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));

    // Validation en temps réel pour certains champs
    if (touched[field] && errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateForm();
  };

  // Soumission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const sujetData: Partial<Sujet> = {
      nomsujet: formData.nomsujet.trim(),
      description: formData.description.trim() || undefined,
      iddomaine: parseInt(formData.iddomaine),
      idcategoriesujet: formData.idcategoriesujet
        ? parseInt(formData.idcategoriesujet)
        : undefined,
      valeurnumérique: formData.valeurnumérique,
    };

    onSave(sujetData);
  };

  // Données dérivées
  const selectedDomaine = domaines.find(
    (d) => d.iddomaine.toString() === formData.iddomaine
  );
  const selectedCategorie = categories.find(
    (c) => c.idcategoriesujet.toString() === formData.idcategoriesujet
  );

  // Calculer la validité sans appeler validateForm() dans le rendu
  const isFormValid = useMemo(() => {
    return !!(
      formData.nomsujet.trim() &&
      formData.nomsujet.length >= 3 &&
      formData.nomsujet.length <= 200 &&
      formData.iddomaine &&
      (!formData.description || formData.description.length <= 2000) && // Modifié de 1000 à 2000
      formData.valeurnumérique >= 0 &&
      formData.valeurnumérique <= 10
    );
  }, [formData]);

  const hasChanges = useMemo(() => {
    return (
      mode === "create" ||
      (sujet &&
        (formData.nomsujet !== (sujet.nomsujet || "") ||
          formData.description !== (sujet.description || "") ||
          formData.iddomaine !== (sujet.iddomaine?.toString() || "") ||
          formData.idcategoriesujet !==
            (sujet.idcategoriesujet?.toString() || "") ||
          formData.valeurnumérique !== (sujet.valeurnumérique ?? 1)))
    );
  }, [mode, sujet, formData]);

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {/* En-tête informatif */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Sujet d'évaluation :</strong> Un sujet représente un critère
          d'évaluation spécifique dans une grille qualité. Il peut être
          catégorisé et pondéré selon son importance.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {/* Informations principales */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{ mb: 2, display: "flex", alignItems: "center" }}
            >
              <Assignment sx={{ mr: 1 }} />
              Informations principales
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nom du sujet"
                  value={formData.nomsujet}
                  onChange={(e) => handleChange("nomsujet", e.target.value)}
                  onBlur={() => handleBlur("nomsujet")}
                  error={touched.nomsujet && Boolean(errors.nomsujet)}
                  helperText={touched.nomsujet && errors.nomsujet}
                  required
                  placeholder="Ex: Respect des procédures de sécurité"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Assignment />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description / Lexique / Attendu"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  onBlur={() => handleBlur("description")}
                  error={touched.description && Boolean(errors.description)}
                  helperText={
                    touched.description && errors.description
                      ? errors.description
                      : `${formData.description.length}/2000 caractères - Description détaillée du critère d'évaluation et des attentes`
                  }
                  multiline
                  rows={4}
                  placeholder="Décrivez précisément ce qui est attendu pour ce critère d'évaluation..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment
                        position="start"
                        sx={{ alignSelf: "flex-start", mt: 1 }}
                      >
                        <Description />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Association et catégorisation */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{ mb: 2, display: "flex", alignItems: "center" }}
            >
              <Dashboard sx={{ mr: 1 }} />
              Grille qualité
            </Typography>

            <FormControl
              fullWidth
              error={touched.iddomaine && Boolean(errors.iddomaine)}
              required
            >
              <InputLabel>Sélectionner une grille qualité</InputLabel>
              <Select
                value={formData.iddomaine}
                onChange={(e) => handleChange("iddomaine", e.target.value)}
                onBlur={() => handleBlur("iddomaine")}
                label="Sélectionner une grille qualité"
              >
                <MenuItem value="">
                  <em>Choisir une grille qualité</em>
                </MenuItem>
                {domaines.map((domaine) => (
                  <MenuItem
                    key={domaine.iddomaine}
                    value={domaine.iddomaine.toString()}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Dashboard fontSize="small" />
                      <Box>
                        <Typography variant="body2">
                          {domaine.nomdomaine}
                        </Typography>
                        {domaine.description && (
                          <Typography variant="caption" color="text.secondary">
                            {domaine.description.substring(0, 50)}
                            {domaine.description.length > 50 ? "..." : ""}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {touched.iddomaine && errors.iddomaine && (
                <FormHelperText>{errors.iddomaine}</FormHelperText>
              )}
            </FormControl>

            {selectedDomaine && (
              <Card variant="outlined" sx={{ mt: 2, bgcolor: "primary.50" }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="body2" color="primary.main">
                    <strong>Grille sélectionnée :</strong>{" "}
                    {selectedDomaine.nomdomaine}
                  </Typography>
                  {selectedDomaine.description && (
                    <Typography variant="caption" color="text.secondary">
                      {selectedDomaine.description}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{ mb: 2, display: "flex", alignItems: "center" }}
            >
              <Category sx={{ mr: 1 }} />
              Catégorie (optionnel)
            </Typography>

            <FormControl fullWidth>
              <InputLabel>Sélectionner une catégorie</InputLabel>
              <Select
                value={formData.idcategoriesujet}
                onChange={(e) =>
                  handleChange("idcategoriesujet", e.target.value)
                }
                label="Sélectionner une catégorie"
              >
                <MenuItem value="">
                  <em>Aucune catégorie</em>
                </MenuItem>
                {categories.map((categorie) => (
                  <MenuItem
                    key={categorie.idcategoriesujet}
                    value={categorie.idcategoriesujet.toString()}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {categorie.couleur && (
                        <Avatar
                          sx={{
                            width: 20,
                            height: 20,
                            bgcolor: categorie.couleur,
                          }}
                        >
                          <span />
                        </Avatar>
                      )}
                      <Box>
                        <Typography variant="body2">
                          {categorie.nomcategorie}
                        </Typography>
                        {categorie.description && (
                          <Typography variant="caption" color="text.secondary">
                            {categorie.description.substring(0, 40)}
                            {categorie.description.length > 40 ? "..." : ""}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                La catégorie permet de regrouper et coloriser les sujets
              </FormHelperText>
            </FormControl>

            {selectedCategorie && (
              <Card variant="outlined" sx={{ mt: 2, bgcolor: "secondary.50" }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {selectedCategorie.couleur && (
                      <Avatar
                        sx={{
                          width: 24,
                          height: 24,
                          bgcolor: selectedCategorie.couleur,
                        }}
                      >
                        <span />
                      </Avatar>
                    )}
                    <Box>
                      <Typography variant="body2" color="secondary.main">
                        <strong>Catégorie :</strong>{" "}
                        {selectedCategorie.nomcategorie}
                      </Typography>
                      {selectedCategorie.description && (
                        <Typography variant="caption" color="text.secondary">
                          {selectedCategorie.description}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Paper>
        </Grid>

        {/* Configuration de la valeur */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{ mb: 2, display: "flex", alignItems: "center" }}
            >
              <TuneOutlined sx={{ mr: 1 }} />
              Valeur numérique
            </Typography>

            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={8}>
                <Typography gutterBottom>
                  Valeur par défaut du sujet : {formData.valeurnumérique}
                </Typography>
                <Slider
                  value={formData.valeurnumérique}
                  onChange={(_, value) =>
                    handleChange("valeurnumérique", value as number)
                  }
                  min={0}
                  max={10}
                  step={1}
                  marks={[
                    { value: 0, label: "0" },
                    { value: 1, label: "1" },
                    { value: 5, label: "5" },
                    { value: 10, label: "10" },
                  ]}
                  valueLabelDisplay="auto"
                />
                <FormHelperText>
                  Valeur par défaut : 1 (sujet maîtrisé) • 0 = sujet non
                  maîtrisé
                </FormHelperText>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card
                  variant="outlined"
                  sx={{
                    textAlign: "center",
                    bgcolor:
                      formData.valeurnumérique > 0
                        ? "success.50"
                        : "warning.50",
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h4"
                      color={
                        formData.valeurnumérique > 0
                          ? "success.main"
                          : "warning.main"
                      }
                    >
                      {formData.valeurnumérique}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formData.valeurnumérique > 0
                        ? "Sujet maîtrisé"
                        : "Sujet non maîtrisé"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <Info sx={{ mr: 1, verticalAlign: "middle" }} />
                <strong>À savoir :</strong> Cette valeur par défaut peut être
                modifiée lors de la configuration des pondérations pour chaque
                grille qualité.
              </Typography>
            </Alert>
          </Paper>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Actions */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button onClick={onCancel} disabled={loading} startIcon={<Cancel />}>
          Annuler
        </Button>

        <Button
          type="submit"
          variant="contained"
          disabled={loading || !isFormValid || !hasChanges}
          startIcon={<Save />}
        >
          {loading
            ? "Sauvegarde..."
            : mode === "create"
            ? "Créer le sujet"
            : "Mettre à jour"}
        </Button>
      </Box>

      {/* Aperçu des changements */}
      {mode === "edit" && hasChanges && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Modifications détectées :</strong> N'oubliez pas de
            sauvegarder vos changements.
          </Typography>
        </Alert>
      )}
    </Box>
  );
};
