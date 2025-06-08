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
import type { SuggestionSectionProps } from "./SuggestionSection.types";

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
      {/* Section du texte client sélectionné */}
      <Paper
        elevation={3}
        sx={{
          p: 2,
          bgcolor: zoneColors[ZONES.CLIENT] || "#f5f5f5",
          minHeight: "60px",
          borderRadius: 2,
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
          <Typography variant="subtitle2" fontWeight="bold" color="primary">
            Situation: Le client dit
          </Typography>
        </Box>
        <Typography
          fontSize={fontSize}
          fontWeight="bold"
          sx={{
            fontStyle: selectedClientText ? "normal" : "italic",
            opacity: selectedClientText ? 1 : 0.7,
          }}
        >
          {selectedClientText ||
            "Vous devez d'abord sélectionner un verbatim client dans l'onglet Analyse"}
        </Typography>
      </Paper>

      {/* Section d'ajout de suggestion */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          alignItems: "center",
          flexWrap: { xs: "wrap", sm: "nowrap" },
        }}
      >
        <TextField
          fullWidth
          size="small"
          label="Suggestion de réponse du conseiller"
          placeholder="Entrez une suggestion de réponse..."
          value={newPostitContent}
          onChange={(e) => onNewPostitContentChange(e.target.value)}
          variant="outlined"
          multiline
          maxRows={3}
          sx={{
            minWidth: { xs: "100%", sm: "300px" },
          }}
        />
        <Button
          variant="contained"
          onClick={onAddPostit}
          disabled={!newPostitContent.trim() || !currentZone}
          sx={{
            minWidth: "100px",
            height: "fit-content",
          }}
        >
          Ajouter
        </Button>
      </Box>

      {/* Section de catégorisation */}
      <FormControl component="fieldset">
        <FormLabel
          component="legend"
          sx={{
            fontWeight: "bold",
            color: "text.primary",
            mb: 1,
          }}
        >
          Catégoriser cette suggestion dans:
        </FormLabel>
        <RadioGroup
          row
          value={currentZone}
          onChange={(e) => onCurrentZoneChange(e.target.value)}
          sx={{
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <FormControlLabel
            value={ZONES.VOUS_AVEZ_FAIT}
            control={<Radio size="small" />}
            label="Ce qu'a fait le client"
            sx={{
              ".MuiFormControlLabel-label": {
                color: "#27ae60",
                fontWeight: "bold",
                fontSize: "0.9rem",
              },
              margin: "0 8px 8px 0",
            }}
          />
          <FormControlLabel
            value={ZONES.JE_FAIS}
            control={<Radio size="small" />}
            label="Ce que je fais"
            sx={{
              ".MuiFormControlLabel-label": {
                color: "#27ae60",
                fontWeight: "bold",
                fontSize: "0.9rem",
              },
              margin: "0 8px 8px 0",
            }}
          />
          <FormControlLabel
            value={ZONES.ENTREPRISE_FAIT}
            control={<Radio size="small" />}
            label="Ce que fait l'entreprise"
            sx={{
              ".MuiFormControlLabel-label": {
                color: "#c0392b",
                fontWeight: "bold",
                fontSize: "0.9rem",
              },
              margin: "0 8px 8px 0",
            }}
          />
          <FormControlLabel
            value={ZONES.VOUS_FEREZ}
            control={<Radio size="small" />}
            label="Ce que fera le client"
            sx={{
              ".MuiFormControlLabel-label": {
                color: "#27ae60",
                fontWeight: "bold",
                fontSize: "0.9rem",
              },
              margin: "0 8px 8px 0",
            }}
          />
        </RadioGroup>
      </FormControl>

      {/* Message d'aide si aucune zone n'est sélectionnée */}
      {!currentZone && (
        <Typography
          variant="caption"
          color="warning.main"
          sx={{ fontStyle: "italic" }}
        >
          Veuillez sélectionner une catégorie avant d'ajouter la suggestion
        </Typography>
      )}
    </Box>
  );
};
