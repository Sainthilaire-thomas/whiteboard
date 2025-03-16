import Link from "next/link";
import { AppBar, Toolbar, Button, Typography, Box } from "@mui/material";
import ActivityIndicator from "./ActivityIndicator"; // ✅ Import du composant indicateur

export default function GlobalNavBar() {
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
        </Box>

        {/* ✅ ActivityIndicator bien intégré à droite */}
        <Box sx={{ ml: "auto", display: "flex", alignItems: "center" }}>
          <ActivityIndicator />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
