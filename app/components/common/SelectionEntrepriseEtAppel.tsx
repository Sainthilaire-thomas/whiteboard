"use client";

import { Box } from "@mui/material";
import EntrepriseSelection from "./EntrepriseSelection";
import CallSelection from "./CallSelection";
import { useAppContext } from "@/context/AppContext";

export default function SelectionEntrepriseEtAppel() {
  const { selectedEntreprise } = useAppContext(); // ✅ récupérée ici

  return (
    <Box sx={{ p: 2 }}>
      <EntrepriseSelection />
      <CallSelection selectedEntreprise={selectedEntreprise} />{" "}
      {/* ✅ passage explicite */}
    </Box>
  );
}
