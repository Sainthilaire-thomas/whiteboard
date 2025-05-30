// extensions/ConversationalAgent.tsx
import React, { useState } from "react";
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
  Alert,
  Slider,
} from "@mui/material";

export interface ConversationalSettings {
  enabled: boolean;
  style: "professional" | "empathetic" | "enthusiastic" | "calm" | "confident";
  adaptiveness: number; // 0-100
  contextAwareness: boolean;
  emotionalIntelligence: boolean;
  customInstructions?: string;
}

interface ConversationalAgentProps {
  settings: ConversationalSettings;
  onChange: (settings: ConversationalSettings) => void;
  disabled?: boolean;
}

const STYLE_CONFIGURATIONS = {
  professional: {
    label: "Professionnel",
    description: "Ton courtois et structuré, adapté au conseil clientèle",
    prompt:
      "Adoptez un ton professionnel et courtois, comme un conseiller expérimenté.",
    icon: "🏢",
  },
  empathetic: {
    label: "Empathique",
    description: "Voix chaleureuse avec une compréhension émotionnelle",
    prompt: "Parlez avec empathie et compassion, montrez de la compréhension.",
    icon: "💝",
  },
  enthusiastic: {
    label: "Enthousiaste",
    description: "Énergie positive et motivation communicative",
    prompt: "Exprimez-vous avec enthousiasme et énergie positive.",
    icon: "⚡",
  },
  calm: {
    label: "Apaisant",
    description: "Voix posée et rassurante pour les situations délicates",
    prompt: "Parlez d'un ton calme et rassurant, avec une voix apaisante.",
    icon: "🧘",
  },
  confident: {
    label: "Confiant",
    description: "Assurance et certitude dans les propos",
    prompt:
      "Exprimez-vous avec confidence et assurance, transmettez de la certitude.",
    icon: "💪",
  },
};

export const ConversationalAgentExtension: React.FC<
  ConversationalAgentProps
> = ({ settings, onChange, disabled = false }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSettingChange = (
    key: keyof ConversationalSettings,
    value: any
  ) => {
    onChange({ ...settings, [key]: value });
  };

  const currentStyle = STYLE_CONFIGURATIONS[settings.style];

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "bold" }}>
        🤖 Mode Agent Conversationnel
      </Typography>

      {/* Activation */}
      <FormControlLabel
        control={
          <Switch
            checked={settings.enabled}
            onChange={(e) => handleSettingChange("enabled", e.target.checked)}
            disabled={disabled}
          />
        }
        label="Activer l'amélioration conversationnelle"
        sx={{ mb: 2 }}
      />

      {settings.enabled && (
        <>
          {/* Avertissement */}
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              ⚠️ En mode conversationnel, l'IA peut légèrement adapter le
              contenu pour améliorer la fluidité et l'impact émotionnel.
            </Typography>
          </Alert>

          {/* Style conversationnel */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Style conversationnel</InputLabel>
            <Select
              value={settings.style}
              onChange={(e) => handleSettingChange("style", e.target.value)}
              disabled={disabled}
              label="Style conversationnel"
            >
              {Object.entries(STYLE_CONFIGURATIONS).map(([key, config]) => (
                <MenuItem key={key} value={key}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <span>{config.icon}</span>
                    <Box>
                      <Typography variant="body2">{config.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {config.description}
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Aperçu du style */}
          <Box sx={{ mb: 3, p: 2, bgcolor: "action.hover", borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              {currentStyle.icon} Style sélectionné : {currentStyle.label}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {currentStyle.description}
            </Typography>
            <Chip
              label={`"${currentStyle.prompt}"`}
              size="small"
              variant="outlined"
              sx={{ fontSize: "11px" }}
            />
          </Box>

          {/* Niveau d'adaptation */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Niveau d'adaptation: {settings.adaptiveness}%
            </Typography>
            <Slider
              value={settings.adaptiveness}
              onChange={(_, value) =>
                handleSettingChange("adaptiveness", value)
              }
              min={0}
              max={100}
              step={10}
              disabled={disabled}
              marks={[
                { value: 0, label: "Fidèle" },
                { value: 50, label: "Équilibré" },
                { value: 100, label: "Créatif" },
              ]}
              valueLabelDisplay="auto"
            />
            <Typography variant="caption" color="text.secondary">
              Plus le niveau est élevé, plus l'IA peut adapter le contenu pour
              améliorer l'impact
            </Typography>
          </Box>

          {/* Options avancées */}
          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.contextAwareness}
                  onChange={(e) =>
                    handleSettingChange("contextAwareness", e.target.checked)
                  }
                  disabled={disabled}
                />
              }
              label="Conscience contextuelle"
            />
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              L'IA adapte le ton selon le contexte de la conversation
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.emotionalIntelligence}
                  onChange={(e) =>
                    handleSettingChange(
                      "emotionalIntelligence",
                      e.target.checked
                    )
                  }
                  disabled={disabled}
                />
              }
              label="Intelligence émotionnelle"
            />
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              Détection et adaptation aux émotions dans le texte
            </Typography>
          </Box>

          {/* Instructions personnalisées */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Instructions personnalisées (optionnel)
            </Typography>
            <textarea
              value={settings.customInstructions || ""}
              onChange={(e) =>
                handleSettingChange("customInstructions", e.target.value)
              }
              placeholder="Ex: Mettez l'accent sur la bienveillance et utilisez un vocabulaire simple..."
              disabled={disabled}
              style={{
                width: "100%",
                minHeight: "60px",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontFamily: "inherit",
                fontSize: "14px",
                resize: "vertical",
              }}
            />
            <Typography variant="caption" color="text.secondary">
              Ces instructions seront ajoutées au prompt de l'IA
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
};
