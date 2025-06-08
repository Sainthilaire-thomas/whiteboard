// extensions/ProsodieControls.tsx - Version adaptée Dark Mode avec corrections TypeScript

import React from "react";
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Switch,
  FormControlLabel,
  Chip,
  Divider,
  Alert,
  Button,
  useTheme,
} from "@mui/material";
import { RestartAlt } from "@mui/icons-material";
import { TTSSettings } from "../hooks/useTTS";

interface ProsodieControlsProps {
  settings: TTSSettings;
  onChange: (settings: TTSSettings) => void;
  disabled?: boolean;
  selectedText?: string;
}

// ✅ AJOUT : Types pour une meilleure sécurité
type ToneValue =
  | "professionnel"
  | "empathique"
  | "explication"
  | "resolution_probleme"
  | "instructions"
  | "calme"
  | "confiant";
type ContextKey =
  | "probleme"
  | "explication"
  | "procedure"
  | "emotion"
  | "urgence"
  | "technique"
  | "general";

const TONE_OPTIONS = [
  {
    value: "professionnel" as ToneValue,
    label: "🏢 Professionnel",
    description: "Ton courtois et structuré",
    contexts: ["general", "presentation"],
  },
  {
    value: "empathique" as ToneValue,
    label: "🤝 Empathique",
    description: "Compréhensif et bienveillant",
    contexts: ["probleme", "emotion"],
  },
  {
    value: "explication" as ToneValue,
    label: "📚 Pédagogique",
    description: "Clair et structuré pour expliquer",
    contexts: ["technique", "procedure"],
  },
  {
    value: "resolution_probleme" as ToneValue,
    label: "🔧 Solution",
    description: "Dynamique et orienté action",
    contexts: ["probleme", "urgence"],
  },
  {
    value: "instructions" as ToneValue,
    label: "📋 Directif",
    description: "Clair et précis pour les étapes",
    contexts: ["procedure", "action"],
  },
  {
    value: "calme" as ToneValue,
    label: "😌 Apaisant",
    description: "Rassurant et posé",
    contexts: ["stress", "urgence"],
  },
  {
    value: "confiant" as ToneValue,
    label: "💪 Confiant",
    description: "Assuré et déterminé",
    contexts: ["decision", "validation"],
  },
];

const ENHANCEMENT_OPTIONS = [
  {
    value: "aucun",
    label: "Aucun",
    description: "Texte original sans modification",
  },
  {
    value: "contextuel",
    label: "Contextuel",
    description: "Adapte automatiquement selon le contenu",
  },
  {
    value: "emotionnel",
    label: "Émotionnel",
    description: "Renforce l'expression émotionnelle",
  },
];

// Analyse simple du contexte pour suggestion
const analyzeTextContext = (text: string): ContextKey | null => {
  if (!text) return null;

  const patterns: Record<ContextKey, RegExp> = {
    probleme: /(problème|difficulté|erreur|bug|dysfonctionnement)/i,
    explication: /(donc|ainsi|c'est-à-dire|pour expliquer|voici comment)/i,
    procedure: /(étape|d'abord|ensuite|suivez|procédez)/i,
    emotion: /(désolé|inquiet|préoccupé|frustré|comprends)/i,
    urgence: /(urgent|rapidement|immédiatement|dès que possible)/i,
    technique: /(configuration|paramètre|installation|réglage)/i,
    general: /./i, // Pattern par défaut
  };

  for (const [context, pattern] of Object.entries(patterns)) {
    if (pattern.test(text)) {
      return context as ContextKey;
    }
  }
  return "general";
};

// ✅ CORRECTION : Suggestions de tons selon le contexte avec types stricts
const getSuggestedTones = (context: ContextKey): ToneValue[] => {
  const suggestions: Record<ContextKey, ToneValue[]> = {
    probleme: ["empathique", "resolution_probleme", "calme"],
    explication: ["explication", "professionnel", "calme"],
    procedure: ["instructions", "professionnel", "explication"],
    emotion: ["empathique", "calme", "professionnel"], // ✅ CORRECTION: "chaleureux" n'existe pas dans ToneValue
    urgence: ["resolution_probleme", "confiant", "instructions"],
    technique: ["explication", "professionnel", "instructions"],
    general: ["professionnel", "empathique"],
  };

  return suggestions[context] || suggestions.general;
};

export const ProsodieControls: React.FC<ProsodieControlsProps> = ({
  settings,
  onChange,
  disabled = false,
  selectedText = "",
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const detectedContext = analyzeTextContext(selectedText);
  const suggestedTones = getSuggestedTones(detectedContext || "general");

  // Calcul de l'état de la prosodie
  const isProsodieActive =
    settings.tone !== "professionnel" ||
    settings.textEnhancement !== "aucun" ||
    settings.autoDetectContext === true;

  const handleChange = (key: keyof TTSSettings, value: any) => {
    onChange({
      ...settings,
      [key]: value,
    });
  };

  // Fonction de reset vers les paramètres standard
  const handleResetToStandard = () => {
    onChange({
      ...settings,
      tone: "professionnel",
      textEnhancement: "aucun",
      autoDetectContext: false,
    });
  };

  const isAdvancedModel = settings.model === "gpt-4o-audio";

  return (
    <Box>
      {/* En-tête avec statut et contrôles */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
          🎭 Contrôle de la prosodie
        </Typography>

        {/* Indicateur de statut */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip
            label={isProsodieActive ? "ACTIVÉE" : "STANDARD"}
            size="small"
            color={isProsodieActive ? "warning" : "default"}
            variant={isProsodieActive ? "filled" : "outlined"}
          />

          {/* Bouton de reset vers standard */}
          {isProsodieActive && (
            <Button
              size="small"
              startIcon={<RestartAlt />}
              onClick={handleResetToStandard}
              variant="outlined"
              color="secondary"
              sx={{ minWidth: "auto", px: 1 }}
              title="Retour au mode standard"
            >
              Standard
            </Button>
          )}
        </Box>
      </Box>

      {/* Modèle requis */}
      {!isAdvancedModel && (
        <Alert severity="info" sx={{ mb: 2, fontSize: "0.85rem" }}>
          💡 Utilisez le modèle "GPT-4o Audio" pour un contrôle avancé de la
          prosodie
        </Alert>
      )}

      {/* Détection automatique */}
      <Box sx={{ mb: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={settings.autoDetectContext || false}
              onChange={(e) =>
                handleChange("autoDetectContext", e.target.checked)
              }
              disabled={disabled || !isAdvancedModel}
              size="small"
            />
          }
          label="Détection automatique du contexte"
        />

        {detectedContext && selectedText && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Contexte détecté: <Chip label={detectedContext} size="small" />
            </Typography>
          </Box>
        )}
      </Box>

      {/* Sélection du ton */}
      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel>Ton de voix</InputLabel>
        <Select
          value={settings.tone || "professionnel"}
          onChange={(e) => {
            console.log("🎭 Ton changé:", e.target.value);
            handleChange("tone", e.target.value);
          }}
          disabled={disabled}
          label="Ton de voix"
        >
          {TONE_OPTIONS.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
              sx={{
                bgcolor: suggestedTones.includes(option.value)
                  ? isDarkMode
                    ? "success.dark"
                    : "success.50"
                  : "transparent",
              }}
            >
              <Box>
                <Typography variant="body2">
                  {option.label}
                  {suggestedTones.includes(option.value) && " ⭐"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {option.description}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Suggestions de tons */}
      {detectedContext && suggestedTones.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Tons suggérés pour ce contexte:
          </Typography>
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.5 }}>
            {suggestedTones.slice(0, 3).map((tone: ToneValue) => {
              // ✅ CORRECTION: Type explicite
              const option = TONE_OPTIONS.find((opt) => opt.value === tone);
              return (
                <Chip
                  key={tone}
                  label={option?.label || tone}
                  size="small"
                  onClick={() => handleChange("tone", tone)}
                  color={settings.tone === tone ? "primary" : "default"}
                  variant={settings.tone === tone ? "filled" : "outlined"}
                  sx={{ cursor: "pointer", fontSize: "0.7rem" }}
                  disabled={disabled}
                />
              );
            })}
          </Box>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Enhancement du texte */}
      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel>Amélioration du texte</InputLabel>
        <Select
          value={settings.textEnhancement || "aucun"}
          onChange={(e) => handleChange("textEnhancement", e.target.value)}
          disabled={disabled}
          label="Amélioration du texte"
        >
          {ENHANCEMENT_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              <Box>
                <Typography variant="body2">{option.label}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {option.description}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Aperçu adapté au Dark Mode */}
      <Box
        sx={{
          mt: 2,
          p: 1.5,
          bgcolor: isDarkMode ? "grey.800" : "grey.50",
          borderRadius: 1,
          border: `1px solid ${isDarkMode ? theme.palette.grey[700] : theme.palette.grey[300]}`,
        }}
      >
        <Typography variant="caption" color="text.secondary" gutterBottom>
          Configuration active:
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.5 }}>
          <Chip label={`${settings.voice}`} size="small" variant="outlined" />
          <Chip label={`${settings.speed}x`} size="small" variant="outlined" />
          {settings.tone && (
            <Chip
              label={
                TONE_OPTIONS.find((t) => t.value === settings.tone)?.label ||
                settings.tone
              }
              size="small"
              color="primary"
            />
          )}
          {settings.textEnhancement !== "aucun" && (
            <Chip
              label={`Enhancement: ${settings.textEnhancement}`}
              size="small"
              color="secondary"
            />
          )}
        </Box>
      </Box>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 1, display: "block" }}
      >
        💡 Les contrôles avancés nécessitent le modèle GPT-4o Audio pour un
        rendu optimal
      </Typography>
    </Box>
  );
};
