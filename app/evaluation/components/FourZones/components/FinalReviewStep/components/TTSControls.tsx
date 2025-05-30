// components/TTSControls.tsx
import React from "react";
import {
  Paper,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Slider,
  Box,
  InputLabel,
  Collapse,
  IconButton,
  Divider,
} from "@mui/material";
import { Settings, ExpandMore, ExpandLess } from "@mui/icons-material";
import { TTSSettings } from "../hooks/useTTS";

interface TTSControlsProps {
  settings: TTSSettings;
  onChange: (settings: TTSSettings) => void;
  disabled?: boolean;
  compact?: boolean;
}

const VOICE_OPTIONS = [
  { value: "alloy", label: "Alloy - Équilibrée et naturelle" },
  { value: "echo", label: "Echo - Masculine claire" },
  { value: "fable", label: "Fable - Expressive britannique" },
  { value: "onyx", label: "Onyx - Masculine profonde" },
  { value: "nova", label: "Nova - Féminine jeune" },
  { value: "shimmer", label: "Shimmer - Féminine douce" },
];

export const TTSControls: React.FC<TTSControlsProps> = ({
  settings,
  onChange,
  disabled = false,
  compact = false,
}) => {
  const [showAdvanced, setShowAdvanced] = React.useState(!compact);

  const handleSettingChange = (key: keyof TTSSettings, value: any) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <Paper
      sx={{
        p: compact ? 2 : 3,
        bgcolor: "background.paper",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Typography variant={compact ? "subtitle1" : "h6"} sx={{ flexGrow: 1 }}>
          Paramètres vocaux
        </Typography>
        {compact && (
          <IconButton
            onClick={() => setShowAdvanced(!showAdvanced)}
            size="small"
          >
            {showAdvanced ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        )}
      </Box>

      {/* Contrôles de base */}
      <Box sx={{ mb: 2 }}>
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Voix</InputLabel>
          <Select
            value={settings.voice}
            onChange={(e) => handleSettingChange("voice", e.target.value)}
            disabled={disabled}
            label="Voix"
          >
            {VOICE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Vitesse: {settings.speed}x
          </Typography>
          <Slider
            value={settings.speed}
            onChange={(_, value) => handleSettingChange("speed", value)}
            min={0.25}
            max={4}
            step={0.25}
            disabled={disabled}
            marks={[
              { value: 0.5, label: "0.5x" },
              { value: 1, label: "1x" },
              { value: 2, label: "2x" },
              { value: 4, label: "4x" },
            ]}
            valueLabelDisplay="auto"
          />
        </Box>
      </Box>

      {/* Contrôles avancés */}
      <Collapse in={showAdvanced}>
        <Divider sx={{ mb: 2 }} />

        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Qualité</InputLabel>
          <Select
            value={settings.model}
            onChange={(e) => handleSettingChange("model", e.target.value)}
            disabled={disabled}
            label="Qualité"
          >
            <MenuItem value="tts-1">Standard (plus rapide)</MenuItem>
            <MenuItem value="tts-1-hd">HD (meilleure qualité)</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel>Style de lecture</InputLabel>
          <Select
            value={settings.textEnhancement || "aucun"}
            onChange={(e) =>
              handleSettingChange("textEnhancement", e.target.value)
            }
            disabled={disabled}
            label="Style de lecture"
          >
            <MenuItem value="aucun">Lecture fidèle du texte</MenuItem>
            <MenuItem value="contextuel">
              Ajouter des pauses naturelles
            </MenuItem>
            <MenuItem value="emotionnel">Lecture expressive</MenuItem>
          </Select>
        </FormControl>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, display: "block" }}
        >
          {settings.textEnhancement === "aucun" &&
            "📖 Le texte sera lu exactement comme écrit"}
          {settings.textEnhancement === "contextuel" &&
            "🎭 Ajout de ponctuation pour une lecture plus naturelle"}
          {settings.textEnhancement === "emotionnel" &&
            "⚠️ Peut ajouter de l'empathie ou modifier légèrement le contenu"}
        </Typography>
      </Collapse>
    </Paper>
  );
};
