// app/evaluation/admin/components/AdminNavigation.tsx
"use client";

import React from "react";
import { Box, Paper, Tabs, Tab, Typography, Badge } from "@mui/material";
import {
  Business,
  Category,
  Assignment,
  TuneOutlined,
  Dashboard,
  SwapHoriz, // ✅ CORRECTION 1: Ajouter cette import
} from "@mui/icons-material";
import { AdminSection, AdminNavigationProps } from "../types/admin";

const SECTIONS = [
  {
    key: "entreprises" as AdminSection,
    label: "Entreprises",
    icon: <Business />,
    description: "Gestion des entreprises",
  },
  {
    key: "domaines" as AdminSection,
    label: "Grilles Qualité",
    icon: <Dashboard />,
    description: "Gestion des grilles d'évaluation qualité",
  },
  {
    key: "categories" as AdminSection,
    label: "Catégories",
    icon: <Category />,
    description: "Gestion des catégories de sujets",
  },
  {
    key: "sujets" as AdminSection,
    label: "Sujets",
    icon: <Assignment />,
    description: "Gestion des critères d'évaluation",
  },
  {
    key: "ponderations" as AdminSection,
    label: "Pondérations",
    icon: <TuneOutlined />,
    description: "Configuration des pondérations",
  },
  // ✅ CORRECTION 3: Ajouter cette section complète
  {
    key: "traducteur" as AdminSection,
    label: "Traducteur",
    icon: <SwapHoriz />,
    description: "Associations sujets ↔ pratiques",
  },
];

export const AdminNavigation: React.FC<AdminNavigationProps> = ({
  currentSection,
  onSectionChange,
  counters = {},
}) => {
  const handleChange = (
    _event: React.SyntheticEvent,
    newValue: AdminSection
  ) => {
    onSectionChange(newValue);
  };

  return (
    <Paper sx={{ mb: 3 }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
        <Typography variant="h6" sx={{ fontWeight: "medium" }}>
          Sections d'administration
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {SECTIONS.find((s) => s.key === currentSection)?.description || ""}
        </Typography>
      </Box>

      <Tabs
        value={currentSection}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ px: 2 }}
      >
        {SECTIONS.map((section) => (
          <Tab
            key={section.key}
            value={section.key}
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {section.icon}
                <span>{section.label}</span>
                {/* ✅ CORRECTION 4: Modifier la logique du counter pour traducteur */}
                {(() => {
                  let count;
                  if (section.key === "traducteur") {
                    count = counters.associations;
                  } else {
                    count = counters[section.key];
                  }
                  return count !== undefined ? (
                    <Badge badgeContent={count} color="primary" showZero />
                  ) : null;
                })()}
              </Box>
            }
          />
        ))}
      </Tabs>
    </Paper>
  );
};
