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
} from "@mui/icons-material";
import { AdminSection } from "../types/admin";

interface AdminNavigationProps {
  currentSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
  counters?: {
    entreprises?: number;
    domaines?: number;
    categories?: number;
    sujets?: number;
  };
}

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
                {counters[section.key] !== undefined && (
                  <Badge
                    badgeContent={counters[section.key]}
                    color="primary"
                    showZero
                  />
                )}
              </Box>
            }
          />
        ))}
      </Tabs>
    </Paper>
  );
};
