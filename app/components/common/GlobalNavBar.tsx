import Link from "next/link";
import { AppBar, Toolbar, Button, Typography, Box } from "@mui/material";
import ActivityIndicator from "./ActivityIndicator"; // ✅ Import du composant indicateur
import { useThemeMode } from "./Theme/ThemeProvider";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { IconButton, Tooltip } from "@mui/material";

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

        {/* ✅ ActivityIndicator bien intégré à droite */}
        <Box sx={{ ml: "auto", display: "flex", alignItems: "center" }}>
          <ActivityIndicator />
        </Box>
        <Tooltip title="Changer le thème">
          <IconButton onClick={toggleTheme} color="inherit">
            {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}
