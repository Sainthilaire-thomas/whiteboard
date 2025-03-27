"use client";
import { useState } from "react";
import { Box, Drawer, Tabs, Tab } from "@mui/material";
import HistoriqueEvaluation from "./HistoriqueEvaluation";
import SyntheseEvaluation from "./SyntheseEvaluation.old";
import { EvaluationDrawerProps } from "@/types/types";

export default function EvaluationDrawer({
  isRightDrawerOpen,
  setIsRightDrawerOpen,
  darkMode,
  setDarkMode,
}: EvaluationDrawerProps) {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabClick = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <Drawer
      anchor="right"
      open={isRightDrawerOpen}
      onClose={() => setIsRightDrawerOpen(false)}
      PaperProps={{ sx: { width: "60%", paddingTop: "96px" } }}
    >
      <Box sx={{ p: 2 }}>
        <Tabs value={tabIndex} onChange={handleTabClick}>
          <Tab label="Synthèse" />
          <Tab label="Historique" />
        </Tabs>
        {tabIndex === 0 && (
          <SyntheseEvaluation darkMode={darkMode} setDarkMode={setDarkMode} />
        )}
        {tabIndex === 1 && <HistoriqueEvaluation />}
      </Box>
    </Drawer>
  );
}
