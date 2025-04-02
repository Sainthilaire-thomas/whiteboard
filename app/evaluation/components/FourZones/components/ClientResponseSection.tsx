// components/ClientResponseSection.tsx
import React from "react";
import {
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  Typography,
  Button,
} from "@mui/material";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import { ZONES } from "../constants/zone";
import { ClientResponseSectionProps } from "../types/types";

export const ClientResponseSection: React.FC<ClientResponseSectionProps> = ({
  selectionMode,
  onSelectionModeChange,
  selectedClientText,
  selectedConseillerText,
  fontSize,
  zoneColors,
  hasOriginalPostits,
  onCategorizeClick,
}) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}>
      <FormControl component="fieldset">
        <FormLabel component="legend">
          Sélectionnez dans la transcription:
        </FormLabel>
        <RadioGroup
          row
          value={selectionMode}
          onChange={(e) => onSelectionModeChange(e.target.value)}
        >
          <FormControlLabel
            value="client"
            control={<Radio />}
            label="Ce que dit le client"
          />
          <FormControlLabel
            value="conseiller"
            control={<Radio />}
            label="Ce que répond le conseiller"
          />
        </RadioGroup>
      </FormControl>

      {/* Zone pour le texte client sélectionné */}
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
            Le client dit
          </Typography>
        </Box>
        <Typography fontSize={fontSize}>
          {selectedClientText ||
            "Sélectionnez du texte client depuis la transcription"}
        </Typography>
      </Paper>

      {/* Zone pour le texte conseiller sélectionné */}
      <Paper
        elevation={3}
        sx={{
          p: 2,
          bgcolor: zoneColors[ZONES.CONSEILLER],
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
            Le conseiller répond
          </Typography>
          {selectedConseillerText && !hasOriginalPostits && (
            <Button
              variant="contained"
              size="small"
              startIcon={<CompareArrowsIcon />}
              onClick={() => onCategorizeClick(selectedConseillerText)}
            >
              Catégoriser cette réponse
            </Button>
          )}
        </Box>
        <Typography fontSize={fontSize}>
          {selectedConseillerText ||
            "Sélectionnez la réponse du conseiller depuis la transcription"}
        </Typography>
      </Paper>
    </Box>
  );
};
