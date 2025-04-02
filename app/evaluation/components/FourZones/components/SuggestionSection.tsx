// components/SuggestionSection.tsx
import React from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { ZONES } from "../constants/zone";
import { SuggestionSectionProps } from "../types/types";

export const SuggestionSection: React.FC<SuggestionSectionProps> = ({
  selectedClientText,
  newPostitContent,
  onNewPostitContentChange,
  currentZone,
  onCurrentZoneChange,
  onAddPostit,
  fontSize,
  zoneColors,
}) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}>
      <Paper
        elevation={3}
        sx={{
          p: 2,
          bgcolor: zoneColors[ZONES.CLIENT],
          minHeight: "60px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography variant="subtitle2" fontWeight="bold">
            Situation: Le client dit
          </Typography>
        </Box>
        <Typography fontSize={fontSize} fontWeight="bold">
          {selectedClientText ||
            "Vous devez d'abord sélectionner un verbatim client dans l'onglet Analyse"}
        </Typography>
      </Paper>

      <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        <TextField
          fullWidth
          size="small"
          label="Suggestion de réponse du conseiller"
          placeholder="Entrez une suggestion de réponse..."
          value={newPostitContent}
          onChange={(e) => onNewPostitContentChange(e.target.value)}
          variant="outlined"
        />
        <Button
          variant="contained"
          onClick={onAddPostit}
          disabled={newPostitContent.trim() === ""}
        >
          Ajouter
        </Button>
      </Box>

      <FormControl component="fieldset">
        <FormLabel component="legend">
          Catégoriser cette suggestion dans:
        </FormLabel>
        <RadioGroup
          row
          value={currentZone}
          onChange={(e) => onCurrentZoneChange(e.target.value)}
        >
          <FormControlLabel
            value={ZONES.VOUS_AVEZ_FAIT}
            control={<Radio />}
            label="Ce qu'a fait le client"
            sx={{
              ".MuiFormControlLabel-label": {
                color: "#27ae60",
                fontWeight: "bold",
              },
            }}
          />
          <FormControlLabel
            value={ZONES.JE_FAIS}
            control={<Radio />}
            label="Ce que je fais"
            sx={{
              ".MuiFormControlLabel-label": {
                color: "#27ae60",
                fontWeight: "bold",
              },
            }}
          />
          <FormControlLabel
            value={ZONES.ENTREPRISE_FAIT}
            control={<Radio />}
            label="Ce que fait l'entreprise"
            sx={{
              ".MuiFormControlLabel-label": {
                color: "#c0392b",
                fontWeight: "bold",
              },
            }}
          />
          <FormControlLabel
            value={ZONES.VOUS_FEREZ}
            control={<Radio />}
            label="Ce que fera le client"
            sx={{
              ".MuiFormControlLabel-label": {
                color: "#27ae60",
                fontWeight: "bold",
              },
            }}
          />
        </RadioGroup>
      </FormControl>
    </Box>
  );
};
