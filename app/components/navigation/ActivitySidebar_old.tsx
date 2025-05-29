"use client";

import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Badge,
} from "@mui/material";
import {
  ExpandLess,
  ExpandMore,
  Loop as LoopIcon,
  CheckCircleOutline,
  RadioButtonUnchecked,
  PlayCircleOutline,
  AdminPanelSettings,
  ArrowBack,
  Assessment,
  Psychology,
  Business,
  Timeline,
  Feedback,
} from "@mui/icons-material";
import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import { useCallData } from "@/context/CallDataContext";

type StepStatus = "à faire" | "en cours" | "réalisé";
type PhaseKey =
  | "selection"
  | "evaluation"
  | "coaching"
  | "suivi"
  | "feedback"
  | "admin";

type SubStep = {
  label: string;
  route?: string;
  isBackAction?: boolean;
  badge?: number;
  disabled?: boolean;
};

type Phase = {
  label: string;
  key: PhaseKey;
  icon: JSX.Element;
  subSteps?: SubStep[];
  isAdmin?: boolean;
  description?: string;
};

const nextStatus: Record<StepStatus, StepStatus> = {
  "à faire": "en cours",
  "en cours": "réalisé",
  réalisé: "à faire",
};

const statusColor: Record<StepStatus, string> = {
  "à faire": "grey",
  "en cours": "#1976d2",
  réalisé: "#2e7d32",
};

const statusIcon: Record<StepStatus, JSX.Element> = {
  "à faire": <RadioButtonUnchecked />,
  "en cours": <PlayCircleOutline />,
  réalisé: <CheckCircleOutline />,
};

export default function ActivitySidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view");

  const [openPhase, setOpenPhase] = useState<PhaseKey | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const { selectedPostit } = useAppContext();
  const { selectedPostitForRolePlay, appelPostits } = useCallData();

  // Auto-expand de la phase active
  useEffect(() => {
    if (currentView) {
      if (currentView === "synthese" || currentView === "postit") {
        setOpenPhase("evaluation");
      } else if (currentView === "roleplay") {
        setOpenPhase("coaching");
      } else if (currentView === "selection") {
        setOpenPhase("selection");
      }
    }
  }, [currentView]);

  // Calculer les statistiques pour les badges
  const evaluationStats = useMemo(() => {
    if (!appelPostits || appelPostits.length === 0)
      return { total: 0, withIssues: 0 };

    const withIssues = appelPostits.filter((p) => p.sujet || p.pratique).length;
    return { total: appelPostits.length, withIssues };
  }, [appelPostits]);

  const phases: Phase[] = [
    {
      label: "Sélection",
      key: "selection",
      icon: <Business />,
      description: "Entreprise & appel",
      subSteps: [
        {
          label: "Sélection entreprise & appel",
          route: "/evaluation?view=selection",
        },
      ],
    },
    {
      label: "Évaluation",
      key: "evaluation",
      icon: <Assessment />,
      description: "Analyse des passages",
      subSteps: [
        {
          label: "Synthèse générale",
          route: "/evaluation?view=synthese",
          badge:
            evaluationStats.withIssues > 0
              ? evaluationStats.withIssues
              : undefined,
        },
        ...(selectedPostit
          ? [
              {
                label: "Passage sélectionné",
                route: "/evaluation?view=postit",
              },
            ]
          : []),
      ],
    },
    {
      label: "Coaching",
      key: "coaching",
      icon: <Psychology />,
      description: "Jeu de rôle & simulation",
      subSteps: [
        // Action de retour si on est en jeu de rôle
        ...(currentView === "roleplay"
          ? [
              {
                label: "← Retour à la synthèse",
                route: "/evaluation?view=synthese",
                isBackAction: true,
              },
            ]
          : []),
        // Lien vers les passages à travailler
        {
          label: "Passages à travailler",
          route: "/evaluation?view=synthese",
          badge:
            evaluationStats.withIssues > 0
              ? evaluationStats.withIssues
              : undefined,
          disabled: evaluationStats.withIssues === 0,
        },
        // Jeu de rôle actuel si disponible
        ...(selectedPostitForRolePlay
          ? [
              {
                label: `Jeu de rôle: ${
                  selectedPostitForRolePlay.pratique || "Passage"
                }`,
                route: "/evaluation?view=roleplay",
              },
            ]
          : []),
      ],
    },
    {
      label: "Suivi",
      key: "suivi",
      icon: <Timeline />,
      description: "Progression & amélioration",
    },
    {
      label: "Feedback",
      key: "feedback",
      icon: <Feedback />,
      description: "Retours & évaluation",
    },
    // Section Admin séparée
    {
      label: "Administration",
      key: "admin",
      icon: <AdminPanelSettings />,
      isAdmin: true,
      description: "Configuration système",
      subSteps: [
        {
          label: "Pondération des critères",
          route: "/evaluation/admin",
        },
      ],
    },
  ];

  // État dynamique des phases basé sur le contexte
  const [stepStatus, setStepStatus] = useState<Record<PhaseKey, StepStatus>>({
    selection: "réalisé", // Assumé réalisé si on est dans l'évaluation
    evaluation:
      currentView === "synthese" || currentView === "postit"
        ? "en cours"
        : "réalisé",
    coaching: currentView === "roleplay" ? "en cours" : "à faire",
    suivi: "à faire",
    feedback: "à faire",
    admin: "à faire",
  });

  // Mise à jour automatique du statut basé sur la vue actuelle
  useEffect(() => {
    setStepStatus((prev) => ({
      ...prev,
      selection: "réalisé",
      evaluation:
        currentView === "synthese" || currentView === "postit"
          ? "en cours"
          : currentView === "roleplay"
          ? "réalisé"
          : prev.evaluation,
      coaching:
        currentView === "roleplay"
          ? "en cours"
          : selectedPostitForRolePlay
          ? "à faire"
          : prev.coaching,
    }));
  }, [currentView, selectedPostitForRolePlay]);

  const handlePhaseClick = (key: PhaseKey) => {
    setOpenPhase((prev) => (prev === key ? null : key));
  };

  const toggleStatus = (key: PhaseKey) => {
    if (key === "admin") return;

    setStepStatus((prev) => ({
      ...prev,
      [key]: nextStatus[prev[key]],
    }));
  };

  const isActiveSubStep = (route?: string): boolean => {
    if (!route) return false;

    if (route === "/evaluation/admin") {
      return window.location.pathname === "/evaluation/admin";
    }

    return !!searchParams?.toString().includes(route.split("?")[1]);
  };

  const handleSubStepClick = (subStep: SubStep) => {
    if (subStep.disabled) return;
    if (subStep.route) {
      router.push(subStep.route);
    }
  };

  // Séparer les phases normales et admin
  const normalPhases = phases.filter((p) => !p.isAdmin);
  const adminPhases = phases.filter((p) => p.isAdmin);

  const renderSubStep = (
    sub: SubStep,
    index: number,
    isAdminPhase: boolean
  ) => {
    const selected = isActiveSubStep(sub.route);
    const isDisabled = sub.disabled;

    return (
      <ListItemButton
        key={index}
        onClick={() => handleSubStepClick(sub)}
        selected={selected}
        disabled={isDisabled}
        sx={{
          borderRadius: 1,
          mx: 0.5,
          bgcolor: selected
            ? isAdminPhase
              ? "#ff5722"
              : sub.isBackAction
              ? "#f57c00"
              : "primary.main"
            : "transparent",
          color: selected
            ? "white"
            : isDisabled
            ? "text.disabled"
            : sub.isBackAction
            ? "#f57c00"
            : isAdminPhase
            ? "#ff5722"
            : "text.primary",
          "&:hover": {
            bgcolor: isDisabled
              ? "transparent"
              : selected
              ? isAdminPhase
                ? "#e64a19"
                : sub.isBackAction
                ? "#ef6c00"
                : "primary.dark"
              : "action.hover",
          },
          opacity: isDisabled ? 0.5 : 1,
          cursor: isDisabled ? "not-allowed" : "pointer",
        }}
      >
        <ListItemIcon sx={{ minWidth: 32 }}>
          {sub.isBackAction && <ArrowBack fontSize="small" />}
        </ListItemIcon>

        <ListItemText
          primary={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: selected ? 600 : 500,
                  fontSize: "0.85rem",
                  color: "inherit",
                }}
              >
                {sub.label}
              </Typography>
              {sub.badge && sub.badge > 0 && (
                <Badge
                  badgeContent={sub.badge}
                  color="error"
                  sx={{
                    "& .MuiBadge-badge": {
                      fontSize: "0.7rem",
                      minWidth: 16,
                      height: 16,
                    },
                  }}
                />
              )}
            </Box>
          }
        />
      </ListItemButton>
    );
  };

  const renderPhase = (phase: Phase) => {
    const status = stepStatus[phase.key];
    const isOpen = openPhase === phase.key;
    const isAdminPhase = phase.isAdmin;
    const isActive =
      (phase.key === "selection" && currentView === "selection") ||
      (phase.key === "evaluation" &&
        (currentView === "synthese" || currentView === "postit")) ||
      (phase.key === "coaching" && currentView === "roleplay");

    return (
      <Box
        key={phase.key}
        sx={{
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            bgcolor: isActive
              ? isAdminPhase
                ? "#ff5722"
                : statusColor[status]
              : "transparent",
            transition: "all 0.3s",
            borderRadius: "0 2px 2px 0",
          },
        }}
      >
        <Tooltip
          title={isExpanded ? "" : `${phase.label} - ${phase.description}`}
          placement="right"
        >
          <ListItemButton
            onClick={() => handlePhaseClick(phase.key)}
            sx={{
              px: isExpanded ? 2 : 1.5,
              py: 1.5,
              bgcolor: isActive
                ? isAdminPhase
                  ? "rgba(255, 87, 34, 0.1)"
                  : "rgba(25, 118, 210, 0.08)"
                : isAdminPhase
                ? "rgba(255, 87, 34, 0.05)"
                : "transparent",
              borderRadius: 1,
              mx: 0.5,
              transition: "all 0.2s",
              "&:hover": {
                bgcolor: isAdminPhase
                  ? "rgba(255, 87, 34, 0.1)"
                  : "rgba(25, 118, 210, 0.08)",
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: isAdminPhase ? "#ff5722" : statusColor[status],
                minWidth: 40,
              }}
            >
              {isAdminPhase ? <AdminPanelSettings /> : phase.icon}
            </ListItemIcon>

            {isExpanded && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexGrow: 1,
                  minWidth: 0,
                }}
              >
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: isActive ? 700 : 600,
                      color: isAdminPhase ? "#ff5722" : "text.primary",
                      lineHeight: 1.2,
                    }}
                  >
                    {phase.label}
                  </Typography>
                  {phase.description && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        fontSize: "0.7rem",
                        lineHeight: 1,
                      }}
                    >
                      {phase.description}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  {!isAdminPhase && (
                    <Chip
                      label={status}
                      size="small"
                      sx={{
                        fontSize: "0.65rem",
                        height: 20,
                        minWidth: 60,
                        bgcolor: statusColor[status],
                        color: "white",
                        "& .MuiChip-label": {
                          px: 1,
                        },
                      }}
                    />
                  )}

                  {!isAdminPhase && (
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStatus(phase.key);
                      }}
                      size="small"
                      sx={{
                        color: "text.secondary",
                        "&:hover": { color: statusColor[status] },
                      }}
                    >
                      <LoopIcon fontSize="small" />
                    </IconButton>
                  )}

                  {phase.subSteps && (
                    <IconButton
                      size="small"
                      sx={{
                        color: isAdminPhase ? "#ff5722" : "text.secondary",
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                      }}
                    >
                      <ExpandMore fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              </Box>
            )}
          </ListItemButton>
        </Tooltip>

        {isExpanded && phase.subSteps && (
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List dense disablePadding sx={{ pl: 3, pr: 1, pb: 1 }}>
              {phase.subSteps.map((sub, i) =>
                renderSubStep(sub, i, isAdminPhase)
              )}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        width: isExpanded ? 320 : 70,
        bgcolor: "background.paper",
        height: "100vh",
        overflowX: "hidden",
        overflowY: "auto",
        transition: "all 0.3s ease-in-out",
        boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
        borderRight: "1px solid",
        borderColor: "divider",
        position: "relative",
      }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <Box sx={{ p: 2, pb: 1 }}>
        {isExpanded && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Parcours d'évaluation
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Suivez votre progression étape par étape
            </Typography>
          </Box>
        )}

        <List dense sx={{ "& > *": { mb: 0.5 } }}>
          {/* Phases normales */}
          {normalPhases.map(renderPhase)}

          {/* Divider avec style amélioré */}
          {isExpanded && (
            <Box sx={{ my: 2, mx: 1 }}>
              <Divider>
                <Chip
                  label="Administration"
                  size="small"
                  sx={{
                    fontSize: "0.7rem",
                    bgcolor: "rgba(255, 87, 34, 0.1)",
                    color: "#ff5722",
                  }}
                />
              </Divider>
            </Box>
          )}

          {/* Phases admin */}
          {adminPhases.map(renderPhase)}
        </List>
      </Box>

      {/* Navigation rapide en bas */}
      {isExpanded && currentView === "roleplay" && (
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            p: 2,
            bgcolor: "background.default",
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Navigation rapide:
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip
              size="small"
              icon={<ArrowBack fontSize="small" />}
              label="Synthèse"
              onClick={() => router.push("/evaluation?view=synthese")}
              sx={{
                cursor: "pointer",
                bgcolor: "#f57c00",
                color: "white",
                "&:hover": { bgcolor: "#ef6c00" },
              }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}
