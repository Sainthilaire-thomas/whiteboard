"use client";

import React, { useState } from "react";
import { Box, Typography, List, Divider, Chip } from "@mui/material";
import { useRouter } from "next/navigation";

// Import des hooks personnalisés
import { usePhaseData } from "./hooks/usePhaseData";
import { usePhaseNavigation } from "./hooks/usePhaseNavigation";
import { useActivityStats } from "./hooks/useActivityStats";

// Import des composants
import { PhaseItem } from "./components/PhaseItem";
import { NavigationBreadcrumb } from "./components/NavigationBreadcrump";

// Import des constantes
import { DIMENSIONS, ANIMATIONS, COLORS, SHADOWS, LABELS } from "./constants";

export default function ActivitySidebar() {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  // Hooks personnalisés
  const navigation = usePhaseNavigation();
  const {
    currentView,
    openPhase,
    stepStatus,
    handlePhaseClick,
    toggleStatus,
    handleSubStepClick,
    isActiveSubStep,
    isActivePhase,
    getQuickNavigation,
  } = navigation;

  const { normalPhases, adminPhases } = usePhaseData(currentView);
  const { stats } = useActivityStats();

  // Gestion de la navigation rapide
  const quickNavItems = getQuickNavigation();
  const handleQuickNavigation = (route: string) => {
    router.push(route);
  };

  // Rendu des phases
  const renderPhaseList = (phases: typeof normalPhases) =>
    phases.map((phase) => (
      <PhaseItem
        key={phase.key}
        phase={phase}
        status={stepStatus[phase.key]}
        isOpen={openPhase === phase.key}
        isActive={isActivePhase(phase.key)}
        isExpanded={isExpanded}
        onPhaseClick={() => handlePhaseClick(phase.key)}
        onStatusToggle={() => toggleStatus(phase.key)}
        onSubStepClick={handleSubStepClick}
        isActiveSubStep={isActiveSubStep}
      />
    ));

  return (
    <Box
      sx={{
        width: isExpanded
          ? DIMENSIONS.SIDEBAR.EXPANDED
          : DIMENSIONS.SIDEBAR.COLLAPSED,
        bgcolor: "background.paper",
        height: "100vh",
        overflowX: "hidden",
        overflowY: "auto",
        transition: ANIMATIONS.SIDEBAR_TRANSITION,
        boxShadow: SHADOWS.SIDEBAR,
        borderRight: "1px solid",
        borderColor: "divider",
        position: "relative",
      }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* En-tête */}
      <Box sx={{ p: 2, pb: 1 }}>
        {isExpanded && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              {LABELS.SIDEBAR.TITLE}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {LABELS.SIDEBAR.SUBTITLE}
            </Typography>

            {/* Statistiques rapides */}
            {stats.total > 0 && (
              <Box sx={{ mt: 1, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                <Chip
                  size="small"
                  label={`${stats.total} ${LABELS.STATS.PASSAGES}`}
                  sx={{ fontSize: "0.7rem" }}
                />
                {stats.withIssues > 0 && (
                  <Chip
                    size="small"
                    label={`${stats.withIssues} ${LABELS.STATS.A_TRAITER}`}
                    color="warning"
                    sx={{ fontSize: "0.7rem" }}
                  />
                )}
              </Box>
            )}
          </Box>
        )}

        {/* Liste des phases principales */}
        <List dense sx={{ "& > *": { mb: 0.5 } }}>
          {renderPhaseList(normalPhases)}

          {/* Divider avec style pour l'admin */}
          {isExpanded && (
            <Box sx={{ my: 2, mx: 1 }}>
              <Divider>
                <Chip
                  label={LABELS.NAVIGATION.ADMIN_SECTION}
                  size="small"
                  sx={{
                    fontSize: "0.7rem",
                    bgcolor: COLORS.ADMIN_BACKGROUND,
                    color: COLORS.ADMIN,
                  }}
                />
              </Divider>
            </Box>
          )}

          {/* Phases admin */}
          {renderPhaseList(adminPhases)}
        </List>
      </Box>

      {/* Navigation rapide contextuelle */}
      <NavigationBreadcrumb
        quickNavItems={quickNavItems}
        onNavigate={handleQuickNavigation}
        isVisible={isExpanded}
      />
    </Box>
  );
}
