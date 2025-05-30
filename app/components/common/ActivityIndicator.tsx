"use client";

import { useState, useEffect } from "react";
import {
  Box,
  IconButton,
  Tooltip,
  Popover,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Paper,
  useTheme,
} from "@mui/material";
import {
  CheckCircle,
  Error,
  WarningAmber,
  Business,
  Call,
  Person,
  Assignment,
  School,
  PlayArrow,
  TrendingUp,
  NavigateBefore,
  NavigateNext,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import { useCallData } from "@/context/CallDataContext";
import { useConseiller } from "@/context/ConseillerContext";
import { supabaseClient } from "@/lib/supabaseClient";

const ActivityIndicator = () => {
  const theme = useTheme();
  const router = useRouter();
  const { selectedEntreprise } = useAppContext();
  const { selectedCall, idCallActivite } = useCallData();
  const { selectedConseiller, conseillers } = useConseiller();

  const [currentPhase, setCurrentPhase] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const conseiller = selectedConseiller
    ? conseillers.find((c) => c.idconseiller === selectedConseiller.id)
    : null;

  // Configuration des phases adaptée au thème
  const phaseConfig = [
    {
      key: "evaluation",
      label: "Évaluation",
      icon: <School fontSize="small" />,
      shortLabel: "Eval",
    },
    {
      key: "coaching",
      label: "Coaching",
      icon: <PlayArrow fontSize="small" />,
      shortLabel: "Coach",
    },
    {
      key: "suivi",
      label: "Suivi",
      icon: <TrendingUp fontSize="small" />,
      shortLabel: "Suivi",
    },
  ];

  // Récupérer la phase actuelle
  useEffect(() => {
    if (!idCallActivite) {
      setCurrentPhase(null);
      return;
    }

    const fetchCurrentPhase = async () => {
      const { data, error } = await supabaseClient
        .from("activitesconseillers")
        .select("nature")
        .eq("idactivite", idCallActivite)
        .single();

      if (error) {
        console.error("❌ Erreur récupération de la phase :", error);
        setCurrentPhase(null);
        return;
      }

      setCurrentPhase(data?.nature || null);
    };

    fetchCurrentPhase();
  }, [idCallActivite]);

  // Changer la phase
  const changePhase = async (direction: "next" | "prev") => {
    if (!idCallActivite || !currentPhase) return;

    const currentIndex = phaseConfig.findIndex((p) => p.key === currentPhase);
    if (currentIndex === -1) return;

    let newIndex = currentIndex;
    if (direction === "next" && currentIndex < phaseConfig.length - 1) {
      newIndex = currentIndex + 1;
    } else if (direction === "prev" && currentIndex > 0) {
      newIndex = currentIndex - 1;
    }

    if (newIndex !== currentIndex) {
      const newPhase = phaseConfig[newIndex].key;
      const { error } = await supabaseClient
        .from("activitesconseillers")
        .update({ nature: newPhase })
        .eq("idactivite", idCallActivite);

      if (!error) {
        setCurrentPhase(newPhase);
      }
    }
  };

  // État des prérequis
  const getPrerequisiteStatus = () => {
    return [
      {
        key: "entreprise",
        icon: <Business fontSize="small" />,
        value: selectedEntreprise,
        label: "Entreprise",
        status: selectedEntreprise ? "success" : "error",
      },
      {
        key: "appel",
        icon: <Call fontSize="small" />,
        value: selectedCall,
        label: "Appel",
        status: selectedCall ? "success" : "error",
      },
      {
        key: "conseiller",
        icon: <Person fontSize="small" />,
        value: selectedConseiller,
        label: "Conseiller",
        status: selectedConseiller ? "success" : "error",
      },
      {
        key: "activite",
        icon: <Assignment fontSize="small" />,
        value: idCallActivite,
        label: "Activité",
        status: idCallActivite ? "success" : "warning",
      },
    ];
  };

  // Calcul du pourcentage de progression
  const getProgressPercentage = () => {
    if (!currentPhase) return 0;
    const currentIndex = phaseConfig.findIndex((p) => p.key === currentPhase);
    return ((currentIndex + 1) / phaseConfig.length) * 100;
  };

  const currentPhaseConfig = phaseConfig.find((p) => p.key === currentPhase);
  const prerequisites = getPrerequisiteStatus();
  const allPrerequisitesMet = prerequisites.every(
    (p) => p.status === "success"
  );
  const currentStepNumber = currentPhase
    ? phaseConfig.findIndex((p) => p.key === currentPhase) + 1
    : 0;

  const handleOpen = (event: React.MouseEvent<HTMLElement>, item: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  // Couleurs qui respectent le thème
  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return theme.palette.success.main;
      case "warning":
        return theme.palette.warning.main;
      case "error":
        return theme.palette.error.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  return (
    <Paper
      elevation={2}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 2,
        py: 1,
        bgcolor: theme.palette.background.paper,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        minWidth: 400,
        maxWidth: 500,
      }}
    >
      {/* Section Prérequis - Style sobre */}
      <Box sx={{ display: "flex", gap: 0.5 }}>
        {prerequisites.map((prereq) => (
          <Tooltip
            key={prereq.key}
            title={`${prereq.label}: ${
              prereq.value ? "Configuré" : "Manquant"
            }`}
            arrow
          >
            <IconButton
              size="small"
              onClick={(e) => handleOpen(e, prereq.key)}
              sx={{
                color: getStatusColor(prereq.status),
                "&:hover": {
                  bgcolor: theme.palette.action.hover,
                },
              }}
            >
              {prereq.icon}
            </IconButton>
          </Tooltip>
        ))}
      </Box>

      {/* Séparateur */}
      <Box
        sx={{
          width: 1,
          height: 32,
          bgcolor: theme.palette.divider,
        }}
      />

      {/* Section Phase Actuelle */}
      {currentPhaseConfig ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}>
          {/* Chip de phase actuelle */}
          <Chip
            icon={currentPhaseConfig.icon}
            label={currentPhaseConfig.shortLabel}
            size="small"
            color="primary"
            variant={theme.palette.mode === "dark" ? "outlined" : "filled"}
            sx={{
              fontWeight: 600,
              "& .MuiChip-icon": {
                fontSize: "1rem",
              },
            }}
          />

          {/* Barre de progression discrète */}
          <Box sx={{ flex: 1, minWidth: 100 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 0.5,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: "0.7rem",
                }}
              >
                Étape {currentStepNumber}/{phaseConfig.length}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: "0.7rem",
                  fontWeight: 600,
                }}
              >
                {Math.round(getProgressPercentage())}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={getProgressPercentage()}
              sx={{
                height: 4,
                borderRadius: 2,
                bgcolor: theme.palette.action.hover,
                "& .MuiLinearProgress-bar": {
                  borderRadius: 2,
                  bgcolor: theme.palette.primary.main,
                },
              }}
            />
          </Box>

          {/* Contrôles de navigation sobres */}
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={() => changePhase("prev")}
              disabled={
                phaseConfig.findIndex((p) => p.key === currentPhase) === 0
              }
              sx={{
                color: theme.palette.text.secondary,
                "&:hover": {
                  bgcolor: theme.palette.action.hover,
                  color: theme.palette.text.primary,
                },
                "&:disabled": {
                  color: theme.palette.action.disabled,
                },
              }}
            >
              <NavigateBefore fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => changePhase("next")}
              disabled={
                phaseConfig.findIndex((p) => p.key === currentPhase) ===
                phaseConfig.length - 1
              }
              sx={{
                color: theme.palette.text.secondary,
                "&:hover": {
                  bgcolor: theme.palette.action.hover,
                  color: theme.palette.text.primary,
                },
                "&:disabled": {
                  color: theme.palette.action.disabled,
                },
              }}
            >
              <NavigateNext fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      ) : (
        <Box sx={{ flex: 1, textAlign: "center", py: 0.5 }}>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: "0.8rem",
            }}
          >
            {allPrerequisitesMet ? "Prêt à démarrer" : "Configuration requise"}
          </Typography>
          {allPrerequisitesMet && !currentPhase && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => setCurrentPhase("evaluation")}
              sx={{
                mt: 0.5,
                fontSize: "0.7rem",
                minHeight: 28,
              }}
            >
              Démarrer
            </Button>
          )}
        </Box>
      )}

      {/* Popover sobre et cohérent */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{
          "& .MuiPaper-root": {
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        <Box sx={{ p: 2.5, minWidth: 280 }}>
          {selectedItem === "entreprise" && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                Entreprise
              </Typography>
              <Typography
                variant="body2"
                sx={{ mb: 2, color: theme.palette.text.secondary }}
              >
                {selectedEntreprise
                  ? `Sélectionnée : ${selectedEntreprise}`
                  : "Aucune entreprise sélectionnée"}
              </Typography>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  router.push("/");
                  handleClose();
                }}
              >
                Modifier l'entreprise
              </Button>
            </>
          )}
          {selectedItem === "appel" && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                Appel
              </Typography>
              <Typography
                variant="body2"
                sx={{ mb: 2, color: theme.palette.text.secondary }}
              >
                {selectedCall
                  ? `Fichier : ${selectedCall.filename}`
                  : "Aucun appel sélectionné"}
              </Typography>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  router.push("/evaluation");
                  handleClose();
                }}
              >
                Sélectionner un appel
              </Button>
            </>
          )}
          {selectedItem === "conseiller" && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                Conseiller
              </Typography>
              <Typography
                variant="body2"
                sx={{ mb: 2, color: theme.palette.text.secondary }}
              >
                {conseiller
                  ? `${conseiller.nom} ${conseiller.prenom}`
                  : "Aucun conseiller sélectionné"}
              </Typography>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  router.push("/evaluation");
                  handleClose();
                }}
              >
                Changer de conseiller
              </Button>
            </>
          )}
          {selectedItem === "activite" && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                Activité
              </Typography>
              <Typography
                variant="body2"
                sx={{ mb: 2, color: theme.palette.text.secondary }}
              >
                {idCallActivite
                  ? `ID : ${idCallActivite}`
                  : "Aucune activité créée"}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: theme.palette.text.disabled }}
              >
                L'activité est créée automatiquement lors du premier passage.
              </Typography>
            </>
          )}
        </Box>
      </Popover>
    </Paper>
  );
};

export default ActivityIndicator;
