"use client";

import { Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { Entreprise } from "@/types/types";

interface EntrepriseSelectionProps {
  entreprises: Entreprise[]; // Utilisation du type Entreprise
  selectedEntreprise: number | null;
  setSelectedEntreprise: (id: number | null) => void;
}

export default function EntrepriseSelection({
  entreprises,
  selectedEntreprise,
  setSelectedEntreprise,
}: EntrepriseSelectionProps) {
  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Entreprise</InputLabel>
        <Select
          value={selectedEntreprise || ""}
          onChange={(event) =>
            setSelectedEntreprise(
              event.target.value ? Number(event.target.value) : null
            )
          }
          label="Entreprise"
        >
          <MenuItem value="">Aucune Sélection</MenuItem>
          {entreprises.map((entreprise) => (
            <MenuItem key={entreprise.id} value={entreprise.id}>
              {entreprise.nom}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
