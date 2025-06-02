"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Alert,
  Slider,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import {
  Create as CreateIcon,
  AutoAwesome as AIIcon,
} from "@mui/icons-material";

import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import { useEntrainementData } from "./hooks";
import { STEPS } from "./utils";
import { EntrainementSuiviProps, CustomNudges, ThemeType } from "./types";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

// Import des composants factorisés
import StepperNavigation from "./components/StepperNavigation";
import PratiqueSelectorSection from "./components/PratiqueSelectorSection";
import NudgeEditCard from "./components/NudgeEditCard";
import TrainingPath from "./components/TrainingPath";
import ResourcesPanel from "./components/RessourcesPanel.tsx";

const EntrainementSuivi = ({ hideHeader = false }: EntrainementSuiviProps) => {
  // États du composant
  const [activeStep, setActiveStep] = useState<number>(0);
  const [selectedPratique, setSelectedPratique] = useState<number | null>(null);
  const [trainingDuration, setTrainingDuration] = useState<number>(21);
  const [editingNudges, setEditingNudges] = useState<{ [key: number]: string }>(
    {}
  );
  const [editMode, setEditMode] = useState<{ [key: number]: boolean }>({});
  const [selectedResourceView, setSelectedResourceView] = useState<
    "coach" | "conseiller" | null
  >(null);
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>("default");

  const [aiStates, setAiStates] = useState<{
    [key: number]: {
      suggestion: string | null;
      loading: boolean;
      error: string | null;
      showSuggestion: boolean;
    };
  }>({});

  const [customPromptDialog, setCustomPromptDialog] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [currentNudgeIndex, setCurrentNudgeIndex] = useState<number | null>(
    null
  );

  // fonction d'envoi mail
  // Fonction pour envoyer l'email
  const handleSendEmail = async () => {
    if (!emailAddress || !trainingPlan) {
      setEmailError("Veuillez saisir une adresse email valide");
      return;
    }

    // Validation email côté client
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress)) {
      setEmailError("Format d'email invalide");
      return;
    }

    setEmailSending(true);
    setEmailError(null);
    setEmailSuccess(null);

    try {
      let pdfBase64 = null;

      // Générer le PDF si demandé
      if (includePDF) {
        const element = document.querySelector(
          '[data-testid="training-path"]'
        ) as HTMLElement;

        if (element) {
          const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
          });

          // Créer PDF en base64
          const pdf = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4",
          });

          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          const canvasWidth = canvas.width;
          const canvasHeight = canvas.height;

          // Calculer le ratio pour adapter l'image
          const ratio = Math.min(
            ((pdfWidth / canvasWidth) * 72) / 96,
            ((pdfHeight / canvasHeight) * 72) / 96
          );
          const imgWidth = (canvasWidth * ratio * 96) / 72;
          const imgHeight = (canvasHeight * ratio * 96) / 72;

          // Centrer l'image
          const x = (pdfWidth - imgWidth) / 2;
          const y = (pdfHeight - imgHeight) / 2;

          const imgData = canvas.toDataURL("image/png");
          pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);

          // Ajouter des informations textuelles
          pdf.setFontSize(16);
          pdf.text("Plan d'Entraînement", 20, 20);

          if (trainingPlan) {
            pdf.setFontSize(12);
            pdf.text(`Durée: ${trainingPlan.totalDuration} jours`, 20, 30);
            pdf.text(`Nombre d'étapes: ${trainingPlan.nudges.length}`, 20, 40);
            pdf.text(
              `Du ${trainingPlan.startDate.toLocaleDateString("fr-FR")} au ${new Date(
                trainingPlan.startDate.getTime() +
                  (trainingPlan.totalDuration - 1) * 24 * 60 * 60 * 1000
              ).toLocaleDateString("fr-FR")}`,
              20,
              50
            );
          }

          pdfBase64 = pdf.output("datauristring").split(",")[1];
        }
      }

      // Appel de l'API
      const response = await fetch("/api/send-training-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailAddress,
          trainingPlan,
          theme: selectedTheme,
          pdfBase64,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de l'envoi");
      }

      setEmailSuccess("Email envoyé avec succès ! 📧");

      // Fermer le dialog après 2 secondes
      setTimeout(() => {
        setEmailDialogOpen(false);
        setEmailAddress("");
        setEmailSuccess(null);
        setEmailError(null);
      }, 2000);
    } catch (error) {
      console.error("Erreur envoi email:", error);
      setEmailError(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'envoi de l'email"
      );
    } finally {
      setEmailSending(false);
    }
  };

  // fonction d'export pdf
  // Ajoutez ces états dans le composant EntrainementSuivi
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [includePDF, setIncludePDF] = useState(true);

  const handleExportPDF = async () => {
    try {
      // Trouver l'élément contenant le parcours d'entraînement
      const element = document.querySelector(
        '[data-testid="training-path"]'
      ) as HTMLElement;

      if (!element) {
        alert("Impossible de trouver le contenu à exporter");
        return;
      }

      // Créer un canvas à partir de l'élément
      const canvas = await html2canvas(element, {
        scale: 2, // Haute qualité
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      // Créer le PDF
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Dimensions du PDF (A4 paysage)
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Dimensions du canvas
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      // Calculer le ratio pour adapter l'image
      const ratio = Math.min(
        ((pdfWidth / canvasWidth) * 72) / 96,
        ((pdfHeight / canvasHeight) * 72) / 96
      );
      const imgWidth = (canvasWidth * ratio * 96) / 72;
      const imgHeight = (canvasHeight * ratio * 96) / 72;

      // Centrer l'image
      const x = (pdfWidth - imgWidth) / 2;
      const y = (pdfHeight - imgHeight) / 2;

      // Ajouter l'image au PDF
      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);

      // Ajouter des informations textuelles
      pdf.setFontSize(16);
      pdf.text("Plan d'Entraînement", 20, 20);

      if (trainingPlan) {
        pdf.setFontSize(12);
        pdf.text(`Durée: ${trainingPlan.totalDuration} jours`, 20, 30);
        pdf.text(`Nombre d'étapes: ${trainingPlan.nudges.length}`, 20, 40);
        pdf.text(
          `Du ${trainingPlan.startDate.toLocaleDateString(
            "fr-FR"
          )} au ${new Date(
            trainingPlan.startDate.getTime() +
              (trainingPlan.totalDuration - 1) * 24 * 60 * 60 * 1000
          ).toLocaleDateString("fr-FR")}`,
          20,
          50
        );
      }

      // Sauvegarder le PDF
      const fileName = `plan-entrainement-${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Erreur lors de l'export PDF:", error);
      alert("Erreur lors de l'export PDF. Veuillez réessayer.");
    }
  };

  // Hook personnalisé pour les données
  const {
    customNudges,
    trainingPlan,
    exercices,
    loading,
    saving,
    loadExercices,
    loadCustomNudges,
    saveCustomNudges,
    generateTrainingPlan,
    getPratiqueById,
    getPratiquesGroupedByCategory,
  } = useEntrainementData();

  // Chargement des données quand une pratique est sélectionnée
  useEffect(() => {
    if (selectedPratique) {
      loadExercices(selectedPratique);
      loadCustomNudges(selectedPratique);
    }
  }, [selectedPratique, loadExercices, loadCustomNudges]);

  // Génération automatique du planning quand les nudges changent
  useEffect(() => {
    if (selectedPratique && (customNudges || exercices.length > 0)) {
      const nudgesArray = customNudges
        ? [
            customNudges.custom_nudge1,
            customNudges.custom_nudge2,
            customNudges.custom_nudge3,
            customNudges.custom_nudge4,
            customNudges.custom_nudge5,
            customNudges.custom_nudge6,
          ].filter(Boolean)
        : [];

      if (nudgesArray.length === 0 && exercices.length > 0) {
        const defaultExercice = exercices[0];
        if (defaultExercice.nudges) {
          const defaultNudges = Object.values(defaultExercice.nudges).filter(
            Boolean
          ) as string[];
          generateTrainingPlan(defaultNudges, trainingDuration);
        }
      } else if (nudgesArray.length > 0) {
        generateTrainingPlan(nudgesArray, trainingDuration);
      }
    }
  }, [
    customNudges,
    exercices,
    trainingDuration,
    selectedPratique,
    generateTrainingPlan,
  ]);

  // Gestion de la navigation par stepper
  const handleStepClick = useCallback((stepIndex: number) => {
    setActiveStep(stepIndex);
  }, []);

  // Gestion de l'édition des nudges
  const handleEditNudge = (nudgeIndex: number, currentValue: string) => {
    setEditingNudges((prev) => ({ ...prev, [nudgeIndex]: currentValue }));
    setEditMode((prev) => ({ ...prev, [nudgeIndex]: true }));
  };

  const handleSaveNudge = async (nudgeIndex: number) => {
    const newValue = editingNudges[nudgeIndex];
    if (!newValue || !selectedPratique) return;

    // 🔧 Construire l'objet complet avec TOUS les nudges
    const completeNudgesData: Partial<CustomNudges> = {
      id_pratique: selectedPratique,
    };

    // 📋 Récupérer les nudges originaux (recommandations initiales)
    const originalNudges =
      exercices.length > 0 && exercices[0].nudges
        ? (Object.values(exercices[0].nudges).filter(Boolean) as string[])
        : [];

    // 🔄 Remplir tous les custom_nudges (1 à 6)
    for (let i = 1; i <= 6; i++) {
      const nudgeKey = `custom_nudge${i}` as keyof CustomNudges;

      if (i === nudgeIndex) {
        // 📝 Le nudge actuellement modifié
        completeNudgesData[nudgeKey] = newValue;
      } else if (customNudges && customNudges[nudgeKey]) {
        // 💾 Nudge déjà personnalisé existant
        completeNudgesData[nudgeKey] = customNudges[nudgeKey];
      } else if (editingNudges[i]) {
        // ✏️ Nudge en cours d'édition (pas encore sauvegardé)
        completeNudgesData[nudgeKey] = editingNudges[i];
      } else if (originalNudges[i - 1]) {
        // 🎯 Nudge original (recommandation initiale)
        completeNudgesData[nudgeKey] = originalNudges[i - 1];
      }
      // Si aucune de ces conditions, le nudge reste undefined (pas de valeur)
    }

    // 📅 Optionnel : Ajouter les dates si nécessaire
    // Si vous voulez gérer les dates automatiquement :
    /*
  const currentDate = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
  for (let i = 1; i <= 6; i++) {
    const dateKey = `custom_nudge${i}_date` as keyof CustomNudges;
    if (completeNudgesData[`custom_nudge${i}` as keyof CustomNudges]) {
      // Si le nudge existe, ajouter la date seulement si pas déjà définie
      if (!customNudges?.[dateKey]) {
        completeNudgesData[dateKey] = currentDate;
      }
    }
  }
  */

    console.log("💾 Sauvegarde des nudges:", completeNudgesData);

    // 💾 Sauvegarder TOUS les nudges
    const success = await saveCustomNudges(completeNudgesData);

    if (success) {
      setEditMode((prev) => ({ ...prev, [nudgeIndex]: false }));

      // 🧹 Nettoyer le state d'édition pour ce nudge
      setEditingNudges((prev) => {
        const newState = { ...prev };
        delete newState[nudgeIndex];
        return newState;
      });

      console.log("✅ Nudge sauvegardé avec succès");
    } else {
      console.error("❌ Erreur lors de la sauvegarde");
    }
  };

  const handleCancelEdit = (nudgeIndex: number) => {
    setEditMode((prev) => ({ ...prev, [nudgeIndex]: false }));
    setEditingNudges((prev) => {
      const newState = { ...prev };
      delete newState[nudgeIndex];
      return newState;
    });
  };

  const handleNudgeContentChange = (nudgeIndex: number, content: string) => {
    setEditingNudges((prev) => ({ ...prev, [nudgeIndex]: content }));
  };

  // Obtenir les nudges actuels (personnalisés ou par défaut)
  const getCurrentNudges = () => {
    if (customNudges) {
      return [
        customNudges.custom_nudge1,
        customNudges.custom_nudge2,
        customNudges.custom_nudge3,
        customNudges.custom_nudge4,
        customNudges.custom_nudge5,
        customNudges.custom_nudge6,
      ]
        .map((nudge, index) => ({ index: index + 1, content: nudge || "" }))
        .filter((nudge) => nudge.content);
    }

    if (exercices.length > 0 && exercices[0].nudges) {
      const defaultNudges = Object.values(exercices[0].nudges).filter(
        Boolean
      ) as string[];
      return defaultNudges.map((nudge, index) => ({
        index: index + 1,
        content: nudge,
      }));
    }

    return [];
  };

  const handleAISuggestion = async (nudgeIndex: number, prompt: string) => {
    setAiStates((prev) => ({
      ...prev,
      [nudgeIndex]: {
        suggestion: null,
        loading: true,
        error: null,
        showSuggestion: false,
      },
    }));

    try {
      const currentContent =
        editingNudges[nudgeIndex] ||
        getCurrentNudges().find((n) => n.index === nudgeIndex)?.content ||
        "";

      const response = await fetch("/api/ai/improve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: currentContent,
          prompt: prompt,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'appel à l'IA");
      }

      const { improvedText } = await response.json();

      setAiStates((prev) => ({
        ...prev,
        [nudgeIndex]: {
          suggestion: improvedText,
          loading: false,
          error: null,
          showSuggestion: true,
        },
      }));
    } catch (error) {
      console.error("Erreur IA:", error);
      setAiStates((prev) => ({
        ...prev,
        [nudgeIndex]: {
          suggestion: null,
          loading: false,
          error: "Erreur lors de la génération de suggestions",
          showSuggestion: false,
        },
      }));
    }
  };

  const handleCustomPrompt = (nudgeIndex: number) => {
    setCurrentNudgeIndex(nudgeIndex);
    setCustomPromptDialog(true);
  };

  const executeCustomPrompt = async () => {
    if (!customPrompt.trim() || currentNudgeIndex === null) {
      return;
    }

    setCustomPromptDialog(false);
    await handleAISuggestion(currentNudgeIndex, customPrompt);
    setCustomPrompt("");
    setCurrentNudgeIndex(null);
  };

  const handleAcceptAI = (nudgeIndex: number) => {
    const suggestion = aiStates[nudgeIndex]?.suggestion;
    if (suggestion) {
      handleNudgeContentChange(nudgeIndex, suggestion);
      setAiStates((prev) => ({
        ...prev,
        [nudgeIndex]: {
          ...prev[nudgeIndex],
          showSuggestion: false,
          suggestion: null,
        },
      }));
    }
  };

  const handleRejectAI = (nudgeIndex: number) => {
    setAiStates((prev) => ({
      ...prev,
      [nudgeIndex]: {
        ...prev[nudgeIndex],
        showSuggestion: false,
        suggestion: null,
      },
    }));
  };

  // Rendu de l'étape Bilan (Split-view)
  const renderBilanStep = () => {
    const selectedPratiqueData = getPratiqueById(selectedPratique || 0);
    const currentNudges = getCurrentNudges();

    return (
      <Grid container spacing={3} sx={{ height: "calc(100vh - 300px)" }}>
        {/* Colonne de gauche : Édition */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: "100%", overflow: "auto" }}>
            <PratiqueSelectorSection
              pratiquesGrouped={getPratiquesGroupedByCategory()}
              selectedPratique={selectedPratique}
              onPratiqueChange={setSelectedPratique}
              loading={loading}
              selectedPratiqueData={selectedPratiqueData}
            />

            {/* Panel des ressources */}
            <ResourcesPanel
              pratique={selectedPratiqueData}
              selectedView={selectedResourceView}
              onViewChange={setSelectedResourceView}
            />

            {/* Nudges */}
            {selectedPratique &&
              currentNudges.map((nudge) => (
                <NudgeEditCard
                  key={nudge.index}
                  nudge={nudge}
                  editMode={editMode[nudge.index] || false}
                  editingContent={editingNudges[nudge.index]}
                  onEdit={handleEditNudge}
                  onSave={handleSaveNudge}
                  onCancel={handleCancelEdit}
                  onContentChange={handleNudgeContentChange}
                  saving={saving}
                  // Props IA
                  onAISuggestion={handleAISuggestion}
                  onCustomPrompt={handleCustomPrompt}
                  aiSuggestion={aiStates[nudge.index]?.suggestion}
                  aiLoading={aiStates[nudge.index]?.loading}
                  aiError={aiStates[nudge.index]?.error}
                  showAISuggestion={aiStates[nudge.index]?.showSuggestion}
                  onAcceptAI={handleAcceptAI}
                  onRejectAI={handleRejectAI}
                />
              ))}

            {customNudges && (
              <Alert severity="success" sx={{ mt: 2 }}>
                ✅ Nudges personnalisés sauvegardés
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Colonne de droite : Aperçu Planning */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: "100%", overflow: "auto" }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <ScheduleIcon color="info" />
              📅 Aperçu Planning d'Entraînement
            </Typography>

            {/* Contrôle de durée */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Durée : <strong>{trainingDuration} jours</strong>
              </Typography>
              <Slider
                value={trainingDuration}
                onChange={(_, value) => setTrainingDuration(value as number)}
                min={7}
                max={90}
                step={7}
                marks={[
                  { value: 7, label: "1s" },
                  { value: 21, label: "3s" },
                  { value: 30, label: "1m" },
                  { value: 60, label: "2m" },
                ]}
                size="small"
                sx={{ mt: 1 }}
              />
            </Box>

            {/* Planning généré */}
            {trainingPlan && trainingPlan.nudges.length > 0 ? (
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  gutterBottom
                  display="block"
                >
                  Du {trainingPlan.startDate.toLocaleDateString("fr-FR")} au{" "}
                  {new Date(
                    trainingPlan.startDate.getTime() +
                      (trainingPlan.totalDuration - 1) * 24 * 60 * 60 * 1000
                  ).toLocaleDateString("fr-FR")}
                </Typography>

                {trainingPlan.nudges.map((planningNudge, index) => (
                  <Card key={index} variant="outlined" sx={{ mb: 1.5 }}>
                    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 2,
                        }}
                      >
                        <Box sx={{ minWidth: 80 }}>
                          <Chip
                            label={`Nudge ${planningNudge.nudgeNumber}`}
                            color="info"
                            size="small"
                            sx={{ mb: 0.5 }}
                          />
                          <Typography variant="caption" display="block">
                            {planningNudge.dayRange}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            sx={{ fontSize: "0.7rem" }}
                          >
                            {planningNudge.startDate.toLocaleDateString(
                              "fr-FR"
                            )}{" "}
                            -{" "}
                            {planningNudge.endDate.toLocaleDateString("fr-FR")}
                          </Typography>
                        </Box>

                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
                            {planningNudge.content}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              <Alert severity="info">
                Sélectionnez une pratique pour voir le planning d'entraînement
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>
    );
  };

  // Rendu de l'étape Déroulé
  const renderDeroulementStep = () => {
    const selectedPratiqueData = getPratiqueById(selectedPratique || 0);

    return (
      <Box sx={{ p: 2, height: "calc(100vh - 280px)", overflow: "auto" }}>
        {trainingPlan && trainingPlan.nudges.length > 0 ? (
          <Box>
            {/* Composant de visualisation du parcours */}
            <div data-testid="training-path">
              <TrainingPath
                trainingPlan={trainingPlan}
                categoryColor={selectedPratiqueData?.categoryColor || "#3f51b5"}
                theme={selectedTheme}
                onThemeChange={setSelectedTheme}
                showThemeSelector={true}
              />
            </div>

            {/* Résumé compact */}
            <Paper
              sx={{
                p: 1.5,
                mb: 2,
                bgcolor: "success.light",
                color: "success.contrastText",
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                ✅ Plan d'entraînement de {trainingPlan.totalDuration} jours
              </Typography>
              <Typography variant="body2">
                Du {trainingPlan.startDate.toLocaleDateString("fr-FR")} au{" "}
                {new Date(
                  trainingPlan.startDate.getTime() +
                    (trainingPlan.totalDuration - 1) * 24 * 60 * 60 * 1000
                ).toLocaleDateString("fr-FR")}
              </Typography>
            </Paper>

            {/* Grid compact des nudges */}
            <Grid container spacing={1.5}>
              {trainingPlan.nudges.map((planningNudge, index) => (
                <Grid item xs={12} md={6} lg={4} key={index}>
                  <Card variant="outlined" sx={{ height: "100%" }}>
                    <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          mb: 1,
                        }}
                      >
                        <Chip
                          label={`S${Math.ceil(planningNudge.nudgeNumber / 2)}`}
                          color="primary"
                          size="small"
                          sx={{ fontSize: "0.7rem", height: 20 }}
                        />
                        <Chip
                          label={planningNudge.dayRange}
                          variant="outlined"
                          size="small"
                          sx={{ fontSize: "0.7rem", height: 20 }}
                        />
                      </Box>

                      <Typography
                        variant="subtitle2"
                        gutterBottom
                        sx={{ fontWeight: "bold" }}
                      >
                        Nudge {planningNudge.nudgeNumber}
                      </Typography>

                      <Typography
                        variant="body2"
                        paragraph
                        sx={{
                          fontSize: "0.85rem",
                          lineHeight: 1.3,
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {planningNudge.content}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: "0.7rem" }}
                      >
                        📅{" "}
                        {planningNudge.startDate.toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                        })}{" "}
                        →{" "}
                        {planningNudge.endDate.toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Actions compactes */}
            <Box
              sx={{
                mt: 2,
                display: "flex",
                gap: 1,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <Button variant="contained" color="primary" size="small">
                💾 Enregistrer
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                onClick={handleExportPDF}
                disabled={!trainingPlan || trainingPlan.nudges.length === 0}
              >
                📤 Export PDF
              </Button>
              <Button
                variant="outlined"
                color="info"
                size="small"
                onClick={() => setEmailDialogOpen(true)}
                disabled={!trainingPlan || trainingPlan.nudges.length === 0}
              >
                📧 Email
              </Button>
            </Box>
          </Box>
        ) : (
          <Alert severity="warning">
            Aucun planning disponible. Retournez à l'étape précédente pour
            configurer votre entraînement.
          </Alert>
        )}
      </Box>
    );
  };

  // Rendu du contenu selon l'étape active
  const renderStepContent = () => {
    const currentStep = STEPS[activeStep];

    switch (currentStep.id) {
      case "bilan":
        return renderBilanStep();
      case "deroulement":
        return renderDeroulementStep();
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
            Préparation et planification de l'entraînement post-coaching
          </Typography>
        </Box>
      )}
      {/* Navigation Stepper */}
      <StepperNavigation
        steps={STEPS}
        activeStep={activeStep}
        onStepClick={handleStepClick}
      />
      {/* Contenu de l'étape active */}
      <Box sx={{ flex: 1, overflow: "auto" }}>{renderStepContent()}</Box>
      {/* ========== PLACEZ LE DIALOG ICI ========== */}
      <Dialog
        open={emailDialogOpen}
        onClose={() => !emailSending && setEmailDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>📧 Envoyer le plan par email</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Adresse email"
            type="email"
            fullWidth
            variant="outlined"
            value={emailAddress}
            onChange={(e) => {
              setEmailAddress(e.target.value);
              setEmailError(null); // Clear error on change
            }}
            placeholder="exemple@email.com"
            sx={{ mt: 2 }}
            disabled={emailSending}
            error={!!emailError}
            helperText={emailError}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={includePDF}
                onChange={(e) => setIncludePDF(e.target.checked)}
                disabled={emailSending}
              />
            }
            label="Inclure la visualisation en PDF"
            sx={{ mt: 2 }}
          />

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: "block" }}
          >
            Le plan d'entraînement sera envoyé avec tous les détails des étapes.
            {includePDF && " Un PDF avec la visualisation sera joint."}
          </Typography>

          {emailSuccess && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {emailSuccess}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setEmailDialogOpen(false)}
            disabled={emailSending}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSendEmail}
            variant="contained"
            disabled={emailSending || !emailAddress.trim()}
            startIcon={emailSending ? <CircularProgress size={16} /> : null}
          >
            {emailSending ? "Envoi..." : "Envoyer"}
          </Button>
        </DialogActions>
      </Dialog>
      {/* ========== FIN DU DIALOG ========== */}
      <Dialog
        open={customPromptDialog}
        onClose={() => setCustomPromptDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CreateIcon color="primary" />
            Prompt personnalisé
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Décrivez comment vous souhaitez améliorer ce nudge. Soyez précis sur
            le style, le ton ou l'approche souhaitée.
          </Typography>

          {/* Affichage du texte original pour contexte - Adapté au thème */}
          {currentNudgeIndex &&
            getCurrentNudges().find((n) => n.index === currentNudgeIndex) && (
              <Box
                sx={{
                  mb: 2,
                  p: 2,
                  bgcolor: (theme) =>
                    theme.palette.mode === "dark" ? "grey.800" : "grey.100",
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: (theme) =>
                    theme.palette.mode === "dark" ? "grey.600" : "grey.300",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: "bold",
                    mb: 1,
                    color: "text.primary",
                  }}
                >
                  📝 Texte original :
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontStyle: "italic",
                    color: "text.secondary",
                    lineHeight: 1.5,
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark" ? "grey.900" : "white",
                    p: 1.5,
                    borderRadius: 0.5,
                    border: "1px solid",
                    borderColor: (theme) =>
                      theme.palette.mode === "dark" ? "grey.700" : "grey.200",
                  }}
                >
                  "
                  {
                    getCurrentNudges().find(
                      (n) => n.index === currentNudgeIndex
                    )?.content
                  }
                  "
                </Typography>
              </Box>
            )}

          <TextField
            autoFocus
            fullWidth
            multiline
            rows={4}
            label="Votre instruction personnalisée"
            placeholder="Exemple : Réécris ce nudge en utilisant le storytelling et des exemples concrets pour rendre l'apprentissage plus mémorable..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            variant="outlined"
            sx={{
              mt: 1,
              "& .MuiInputBase-root": {
                minHeight: "120px",
              },
            }}
          />

          {/* Zone de conseils avec adaptation au thème */}
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: (theme) =>
                theme.palette.mode === "dark"
                  ? "success.dark"
                  : "success.light",
              borderRadius: 1,
              border: "1px solid",
              borderColor: "success.main",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: "bold",
                color: (theme) =>
                  theme.palette.mode === "dark"
                    ? "success.light"
                    : "success.dark",
              }}
            >
              💡 Conseils pour un prompt efficace :
            </Typography>
            <Typography
              variant="caption"
              display="block"
              sx={{
                mt: 0.5,
                color: (theme) =>
                  theme.palette.mode === "dark"
                    ? "success.light"
                    : "success.dark",
                lineHeight: 1.4,
              }}
            >
              • <strong>Ton :</strong> Précisez le style souhaité
              (professionnel, décontracté, motivant, bienveillant...)
              <br />• <strong>Technique :</strong> Mentionnez des approches
              spécifiques (storytelling, exemples concrets, métaphores, liste
              d'actions...)
              <br />• <strong>Public :</strong> Adaptez selon votre audience
              (débutants, experts, seniors, jeunes...)
              <br />• <strong>Format :</strong> Spécifiez la structure voulue
              (paragraphe, points, question-réponse...)
            </Typography>
          </Box>

          {/* Exemples de prompts pour inspiration */}
          <Box sx={{ mt: 2 }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: "bold",
                color: "text.primary",
                mb: 1,
                display: "block",
              }}
            >
              ✨ Exemples d'instructions :
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {[
                "Transforme ce nudge en histoire courte avec un personnage qui vit la situation",
                "Réécris sous forme de checklist actionnable avec des émojis pour chaque étape",
                "Adapte le ton pour un public senior avec plus de bienveillance et d'explications",
                "Utilise des métaphores sportives pour motiver et dynamiser le message",
              ].map((example, index) => (
                <Typography
                  key={index}
                  variant="caption"
                  sx={{
                    color: (theme) =>
                      theme.palette.mode === "dark"
                        ? "primary.light"
                        : "primary.main",
                    cursor: "pointer",
                    "&:hover": {
                      textDecoration: "underline",
                      color: (theme) =>
                        theme.palette.mode === "dark"
                          ? "primary.main"
                          : "primary.dark",
                    },
                    fontSize: "0.75rem",
                    fontStyle: "italic",
                  }}
                  onClick={() => setCustomPrompt(example)}
                >
                  "{example}"
                </Typography>
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={() => setCustomPromptDialog(false)}>Annuler</Button>
          <Button
            onClick={executeCustomPrompt}
            variant="contained"
            disabled={!customPrompt.trim()}
            startIcon={<AIIcon />}
          >
            Générer
          </Button>
        </DialogActions>
      </Dialog>
    </Box> // ← Fermeture de la Box principale
  );
};

export default EntrainementSuivi;
