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
} from "@mui/material";
import {
  ExpandLess,
  ExpandMore,
  Loop as LoopIcon,
  CheckCircleOutline,
  RadioButtonUnchecked,
  PlayCircleOutline,
} from "@mui/icons-material";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import { useCallData } from "@/context/CallDataContext";

type StepStatus = "à faire" | "en cours" | "réalisé";
type PhaseKey = "selection" | "evaluation" | "coaching" | "suivi" | "feedback";

type Phase = {
  label: string;
  key: PhaseKey;
  subSteps?: {
    label: string;
    route?: string;
  }[];
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
  const [openPhase, setOpenPhase] = useState<PhaseKey | null>("selection");
  const [isExpanded, setIsExpanded] = useState(false);
  const { selectedPostit } = useAppContext();
  const { selectedPostitForRolePlay } = useCallData();

  const phases: Phase[] = [
    {
      label: "Sélection",
      key: "selection",
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
      subSteps: [
        { label: "Synthèse", route: "/evaluation?view=synthese" },
        ...(selectedPostit
          ? [{ label: "Passage sélectionné", route: "/evaluation?view=postit" }]
          : []),
      ],
    },
    {
      label: "Coaching",
      key: "coaching",
      subSteps: [
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
    { label: "Suivi", key: "suivi" },
    { label: "Feedback", key: "feedback" },
  ];

  const [stepStatus, setStepStatus] = useState<Record<PhaseKey, StepStatus>>({
    selection: "en cours",
    evaluation: "à faire",
    coaching: "à faire",
    suivi: "à faire",
    feedback: "à faire",
  });

  const handlePhaseClick = (key: PhaseKey) => {
    setOpenPhase((prev) => (prev === key ? null : key));
  };

  const toggleStatus = (key: PhaseKey) => {
    setStepStatus((prev) => ({
      ...prev,
      [key]: nextStatus[prev[key]],
    }));
  };

  const isActiveSubStep = (route?: string): boolean => {
    return !!(route && searchParams?.toString().includes(route.split("?")[1]));
  };

  return (
    <Box
      sx={{
        width: isExpanded ? 280 : 60,
        bgcolor: "background.paper",
        height: "100vh",
        overflowX: "hidden",
        transition: "all 0.4s ease",
        boxShadow: 3,
        borderRight: "1px solid #ddd",
      }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <Box sx={{ p: 2 }}>
        {isExpanded && (
          <Typography variant="h6" color="text.primary" gutterBottom>
            Activité
          </Typography>
        )}

        <List dense>
          {phases.map((phase) => {
            const status = stepStatus[phase.key];
            const isOpen = openPhase === phase.key;

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
                    bgcolor: isOpen ? statusColor[status] : "transparent",
                    transition: "background-color 0.3s",
                  },
                }}
              >
                <Tooltip title={phase.label} placement="right">
                  <ListItemButton
                    onClick={() => handlePhaseClick(phase.key)}
                    sx={{ px: isExpanded ? 2 : 1.5 }}
                  >
                    <ListItemIcon sx={{ color: statusColor[status] }}>
                      {statusIcon[status]}
                    </ListItemIcon>

                    {isExpanded && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          flexGrow: 1,
                        }}
                      >
                        <Typography
                          fontWeight="bold"
                          color="text.primary"
                          sx={{
                            flexShrink: 1,
                            maxWidth: "100px", // limite raisonnable pour ne pas manger tout l'espace
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {phase.label}
                        </Typography>

                        <Chip
                          label={status}
                          size="small"
                          sx={{
                            fontSize: "0.7rem",
                            minWidth: 70,
                            bgcolor: statusColor[status],
                            color: "white",
                            mx: 1,
                          }}
                        />

                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStatus(phase.key);
                          }}
                          size="small"
                          sx={{ color: "text.primary" }}
                        >
                          <LoopIcon fontSize="small" />
                        </IconButton>

                        {phase.subSteps && (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePhaseClick(phase.key);
                            }}
                            sx={{ color: "text.primary" }}
                          >
                            {isOpen ? (
                              <ExpandLess fontSize="small" />
                            ) : (
                              <ExpandMore fontSize="small" />
                            )}
                          </IconButton>
                        )}
                      </Box>
                    )}
                  </ListItemButton>
                </Tooltip>

                {isExpanded && phase.subSteps && (
                  <Collapse in={isOpen} timeout="auto" unmountOnExit>
                    <List dense disablePadding sx={{ pl: 4 }}>
                      {phase.subSteps.map((sub, i) => {
                        const selected = isActiveSubStep(sub.route);
                        return (
                          <ListItemButton
                            key={i}
                            onClick={() => sub.route && router.push(sub.route)}
                            selected={selected}
                            sx={{
                              borderRadius: 1,
                              bgcolor: selected
                                ? "primary.main"
                                : "transparent",
                              color: selected
                                ? "primary.contrastText"
                                : "text.primary",
                              "&:hover": {
                                bgcolor: selected
                                  ? "primary.dark"
                                  : "action.hover",
                              },
                            }}
                          >
                            <ListItemText
                              primary={sub.label}
                              primaryTypographyProps={{
                                fontSize: "0.85rem",
                                fontWeight: 600,
                                color: "inherit",
                              }}
                            />
                          </ListItemButton>
                        );
                      })}
                    </List>
                  </Collapse>
                )}
              </Box>
            );
          })}
        </List>
      </Box>
    </Box>
  );
}
