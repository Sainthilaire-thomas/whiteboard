// 📜 app/evaluation/layout.tsx
"use client";

import { Box } from "@mui/material";
import ActivitySidebar from "../components/navigation/ActivitySidebar";

export default function EvaluationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* 🎯 ActivitySidebar - Navigation du processus d'évaluation */}
      <ActivitySidebar />

      {/* 📄 Contenu des pages du module évaluation */}
      <Box
        sx={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
