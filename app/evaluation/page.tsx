"use client";
// 📜 app/evaluation/page.tsx
import { Typography, Box } from "@mui/material";
import EvaluationClient from "./EvaluationClient"; // ✅ Utilisation d'un composant client
import { useThemeMode } from "../components/common/Theme/ThemeProvider"; // ✅ Import du theme

export default function Page() {
  const { mode, toggleTheme } = useThemeMode(); // ✅ Récupérer le mode depuis ThemeProvider

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", height: "100vh", gap: 0 }}
    >
      {/* ✅ Transmettre darkMode et setDarkMode à EvaluationClient */}
      <EvaluationClient darkMode={mode === "dark"} setDarkMode={toggleTheme} />
    </Box>
  );
}
