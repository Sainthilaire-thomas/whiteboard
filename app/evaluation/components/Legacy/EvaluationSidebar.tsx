// 📜 components/evaluation/EvaluationSidebar.tsx
"use client";

import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useAppContext } from "@/context/AppContext";

export default function EvaluationSidebar() {
  const {
    selectedEntreprise,
    setSelectedEntreprise,
    entreprises,
    isLoadingEntreprises,
  } = useAppContext();

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Entreprise</InputLabel>
        <Select
          value={selectedEntreprise || ""}
          onChange={(event) =>
            setSelectedEntreprise(Number(event.target.value))
          }
          label="Entreprise"
        >
          <MenuItem value="">Aucune Sélection</MenuItem>
        </Select>
      </FormControl>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Évaluation d'appel</Typography>
        </AccordionSummary>
        <AccordionDetails>{/* Contenu de l'upload */}</AccordionDetails>
      </Accordion>
    </Box>
  );
}
