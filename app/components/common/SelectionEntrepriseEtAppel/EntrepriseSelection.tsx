"use client";

import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";
import { useAppContext } from "@/context/AppContext";

export default function EntrepriseSelection() {
  const {
    entreprises,
    selectedEntreprise,
    setSelectedEntreprise,
    isLoadingEntreprises,
    errorEntreprises,
  } = useAppContext();

  if (isLoadingEntreprises) {
    return <Typography>Chargement des entreprises...</Typography>;
  }

  if (errorEntreprises) {
    return (
      <Typography color="error">
        Erreur de chargement : {errorEntreprises.message}
      </Typography>
    );
  }

  if (!entreprises || entreprises.length === 0) {
    return <Typography>Aucune entreprise disponible</Typography>;
  }

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Entreprise</InputLabel>
        <Select
          value={selectedEntreprise ?? ""}
          onChange={(event) =>
            setSelectedEntreprise(
              event.target.value ? Number(event.target.value) : null
            )
          }
          label="Entreprise"
        >
          <MenuItem value="">Aucune sélection</MenuItem>
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
