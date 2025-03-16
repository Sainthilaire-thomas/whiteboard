"use client";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import { createContext, useContext, useMemo, useState, useEffect } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";

const ThemeContext = createContext({ mode: "dark", toggleTheme: () => {} });

export function useThemeMode() {
  return useContext(ThemeContext);
}

export default function CustomThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ Détecter si le système est en Dark Mode
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  // ✅ Initialiser le mode en Dark par défaut ou selon le système
  const [mode, setMode] = useState<"light" | "dark">("dark"); // Par défaut en Dark

  // ✅ Mettre à jour le mode si l'utilisateur change les préférences système
  useEffect(() => {
    setMode(prefersDarkMode ? "dark" : "dark"); // Toujours dark par défaut
  }, [prefersDarkMode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
        components: {
          MuiTooltip: {
            styleOverrides: {
              tooltip: {
                backgroundColor: "black", // 🎨 Change la couleur de fond
                color: "white", // 🖋 Change la couleur du texte
                fontSize: "14px", // 🔠 Ajuste la taille du texte
                borderRadius: "4px", // 🔳 Ajoute un arrondi
                padding: "8px",
                maxWidth: "200px", // 📏 Ajuste la largeur max du Tooltip
                textAlign: "center",
              },
              arrow: {
                color: "black", // 🎯 Change aussi la couleur de la flèche du Tooltip
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
