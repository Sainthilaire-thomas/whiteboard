"use client";

import Link from "next/link";
import { AppBar, Toolbar, Button, Box } from "@mui/material";
import ActivityIndicator from "./ActivityIndicator";
import { useThemeMode } from "./Theme/ThemeProvider";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { IconButton, Tooltip } from "@mui/material";
import AuthStatus from "./AuthStatus";

export default function GlobalNavBar() {
  const { mode, toggleTheme } = useThemeMode();

  return (
    <AppBar position="static">
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button color="inherit" component={Link} href="/">
            Accueil
          </Button>
          <Button color="inherit" component={Link} href="/whiteboard">
            Tableau Blanc
          </Button>
          <Button color="inherit" component={Link} href="/evaluation">
            Évaluation
          </Button>
          <Button color="inherit" component={Link} href="/zohoworkdrive">
            WorkDrive
          </Button>
        </Box>

        <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 2 }}>
          <ActivityIndicator />
          <AuthStatus />
          <Tooltip title="Changer le thème">
            <IconButton onClick={toggleTheme} color="inherit">
              {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
