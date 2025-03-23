"use client";

import { Box } from "@mui/material";
import EntrepriseSelection from "./EntrepriseSelection";
import CallSelection from "./CallSelection";

export default function SelectionEntrepriseEtAppel() {
  return (
    <Box sx={{ p: 2 }}>
      <EntrepriseSelection />
      <CallSelection />
    </Box>
  );
}
