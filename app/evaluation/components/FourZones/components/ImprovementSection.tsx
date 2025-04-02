// components/ImprovementSection.tsx
import React, { useState } from "react";
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
  Divider,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Alert,
} from "@mui/material";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import { ZONES } from "../constants/zone";

interface ImprovementSectionProps {
  selectedClientText: string;
  originalConseillerText: string;
  onAddSuggestion: (zone: string, content: string) => void;
  fontSize: number;
  zoneColors: Record<string, string>;
}

export const ImprovementSection: React.FC<ImprovementSectionProps> = ({
  selectedClientText,
  originalConseillerText,
  onAddSuggestion,
  fontSize,
  zoneColors,
}) => {
  const [newSuggestion, setNewSuggestion] = useState<string>("");
  const [selectedZone, setSelectedZone] = useState<string>(ZONES.JE_FAIS);
  const [showGuide, setShowGuide] = useState<boolean>(true);

  // Exemples de suggestions pré-définies (à remplacer par l'IA)
  const suggestionTemplates = [
    {
      zone: ZONES.JE_FAIS,
      text: "Je comprends votre préoccupation concernant...",
    },
    {
      zone: ZONES.VOUS_AVEZ_FAIT,
      text: "Vous avez bien fait de nous signaler ce problème...",
    },
    {
      zone: ZONES.VOUS_FEREZ,
      text: "Vous pourrez vérifier que tout fonctionne correctement en...",
    },
  ];

  const handleAddSuggestion = () => {
    if (newSuggestion.trim()) {
      onAddSuggestion(selectedZone, newSuggestion);
      setNewSuggestion("");
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}>
      {/* Situation client (toujours visible) */}
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

      {/* Réponse originale du conseiller */}
      {originalConseillerText && (
        <Paper
          elevation={2}
          sx={{
            p: 2,
            bgcolor: zoneColors[ZONES.CONSEILLER],
            minHeight: "60px",
            borderLeft: "4px solid #ffa726", // Orange pour indiquer l'original
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
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="subtitle2" fontWeight="bold">
                Réponse originale du conseiller
              </Typography>
              <Chip
                size="small"
                label="Original"
                color="warning"
                sx={{ ml: 1 }}
              />
            </Box>
          </Box>
          <Typography fontSize={fontSize}>{originalConseillerText}</Typography>
        </Paper>
      )}

      {/* Guide pour améliorer les réponses */}
      {showGuide && (
        <Alert
          severity="info"
          onClose={() => setShowGuide(false)}
          sx={{ mb: 1 }}
          icon={<TipsAndUpdatesIcon />}
        >
          <Typography variant="subtitle2">
            Conseils pour améliorer la réponse:
          </Typography>
          <ul style={{ margin: "8px 0", paddingLeft: "24px" }}>
            <li>
              Privilégiez les zones vertes (ce que fait/a fait/fera le client)
            </li>
            <li>
              Limitez les explications sur ce que fait l'entreprise (zone rouge)
            </li>
            <li>Soyez concis et orientés solutions</li>
            <li>Personnalisez votre réponse au contexte du client</li>
          </ul>
        </Alert>
      )}

      {/* Zone de création de suggestions */}
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Créer une meilleure réponse:
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          placeholder="Proposez une meilleure façon de répondre à cette situation..."
          value={newSuggestion}
          onChange={(e) => setNewSuggestion(e.target.value)}
          sx={{ mb: 2 }}
        />

        <FormControl component="fieldset" sx={{ mb: 2 }}>
          <FormLabel component="legend">
            Catégoriser cette suggestion dans:
          </FormLabel>
          <RadioGroup
            row
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
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

        <Button
          variant="contained"
          color="primary"
          onClick={handleAddSuggestion}
          disabled={!newSuggestion.trim()}
          startIcon={<AddCircleOutlineIcon />}
          fullWidth
        >
          Ajouter cette suggestion
        </Button>
      </Paper>

      {/* Templates de suggestions (sera remplacé par l'IA) */}
      <Paper elevation={2} sx={{ p: 2 }}>
        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
          Exemples de formulations améliorées:
        </Typography>
        <Grid container spacing={2}>
          {suggestionTemplates.map((template, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  bgcolor: zoneColors[template.zone],
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" fontSize={fontSize} gutterBottom>
                    {template.text}
                  </Typography>
                </CardContent>
                <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
                  <Button
                    size="small"
                    onClick={() => {
                      setNewSuggestion(template.text);
                      setSelectedZone(template.zone);
                    }}
                    startIcon={<CompareArrowsIcon />}
                  >
                    Utiliser
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: 1,
            textAlign: "center",
            fontStyle: "italic",
          }}
        >
          Prochainement: Suggestions intelligentes générées par IA
        </Typography>
      </Paper>
    </Box>
  );
};
