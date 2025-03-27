"use client";

import { useMemo } from "react";
import { alpha, useTheme } from "@mui/material/styles";

/**
 * Hook pour gérer les styles du composant Postit
 */
export function useStyles() {
  const theme = useTheme();

  // Styles constants
  const styles = {
    modalBackground: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    modalWrapper: {
      width: "100vw",
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContainer: {
      width: "80%",
      maxHeight: "90vh",
      bgcolor: "background.paper",
      boxShadow: 24,
      p: 4,
      borderRadius: 2,
      overflow: "auto",
    },
    domainSelection: {
      position: "relative",
      width: "100%",
      overflowX: "auto",
      backgroundColor: "rgba(138, 137, 137, 0.7)",
      padding: "10px",
      borderRadius: "8px",
    },
    passageBox: {
      p: 2,
      mb: 2,
    },
  };

  // Styles who depend on theme
  const stepBoxStyle = useMemo(
    () => ({
      bgcolor: alpha(
        theme.palette.grey[100],
        theme.palette.mode === "dark" ? 0.05 : 1
      ),
      borderRadius: 2,
      border: "1px solid",
      borderColor: theme.palette.divider,
      boxShadow: 1,
      p: 2,
      mb: 2,
    }),
    [theme]
  );

  return {
    theme,
    styles,
    stepBoxStyle,
  };
}
