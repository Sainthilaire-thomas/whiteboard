// extensions/VoiceByRole.tsx
import React from "react";
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Divider,
} from "@mui/material";
import { TTSSettings } from "../hooks/useTTS";

export interface RoleVoiceSettings {
  client: {
    voice: TTSSettings["voice"];
    speed: number;
  };
  conseiller: {
    voice: TTSSettings["voice"];
    speed: number;
  };
  enabled: boolean;
}

interface VoiceByRoleProps {
  settings: RoleVoiceSettings;
  onChange: (settings: RoleVoiceSettings) => void;
  disabled?: boolean;
}

const VOICE_OPTIONS = [
  {
    value: "alloy",
    label: "Alloy - Équilibrée",
    personality: "Neutre, professionnelle",
  },
  {
    value: "echo",
    label: "Echo - Masculine",
    personality: "Autoritaire, confiante",
  },
  {
    value: "fable",
    label: "Fable - Britannique",
    personality: "Distinguée, expressive",
  },
  {
    value: "onyx",
    label: "Onyx - Profonde",
    personality: "Rassurante, mature",
  },
  {
    value: "nova",
    label: "Nova - Jeune",
    personality: "Dynamique, accessible",
  },
  {
    value: "shimmer",
    label: "Shimmer - Douce",
    personality: "Chaleureuse, bienveillante",
  },
];

const RECOMMENDED_COMBINATIONS = [
  {
    name: "Coaching Standard",
    client: { voice: "nova" as const, speed: 1.0 },
    conseiller: { voice: "onyx" as const, speed: 0.9 },
  },
  {
    name: "Empathique",
    client: { voice: "shimmer" as const, speed: 1.1 },
    conseiller: { voice: "alloy" as const, speed: 0.9 },
  },
  {
    name: "Professionnel",
    client: { voice: "echo" as const, speed: 1.0 },
    conseiller: { voice: "fable" as const, speed: 0.9 },
  },
];

export const VoiceByRoleExtension: React.FC<VoiceByRoleProps> = ({
  settings,
  onChange,
  disabled = false,
}) => {
  const handleRoleChange = (
    role: "client" | "conseiller",
    key: "voice" | "speed",
    value: any
  ) => {
    onChange({
      ...settings,
      [role]: {
        ...settings[role],
        [key]: value,
      },
    });
  };

  const applyPreset = (preset: (typeof RECOMMENDED_COMBINATIONS)[0]) => {
    onChange({
      ...settings,
      client: preset.client,
      conseiller: preset.conseiller,
    });
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "bold" }}>
        🎭 Voix personnalisées par rôle
      </Typography>

      {/* Presets recommandés */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Combinaisons recommandées
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {RECOMMENDED_COMBINATIONS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              disabled={disabled}
              style={{
                padding: "6px 12px",
                borderRadius: "16px",
                border: "1px solid #ddd",
                background: "transparent",
                cursor: disabled ? "not-allowed" : "pointer",
                fontSize: "12px",
              }}
            >
              {preset.name}
            </button>
          ))}
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Configuration Client */}
      <Box sx={{ mb: 3, p: 2, bgcolor: "primary.50", borderRadius: 1 }}>
        <Typography
          variant="subtitle2"
          gutterBottom
          sx={{ color: "primary.main" }}
        >
          👤 Voix du Client
        </Typography>

        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Voix client</InputLabel>
          <Select
            value={settings.client.voice}
            onChange={(e) =>
              handleRoleChange("client", "voice", e.target.value)
            }
            disabled={disabled}
            label="Voix client"
          >
            {VOICE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Box>
                  <Typography variant="body2">{option.label}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.personality}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography variant="caption">
          Vitesse: {settings.client.speed}x
        </Typography>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={settings.client.speed}
          onChange={(e) =>
            handleRoleChange("client", "speed", parseFloat(e.target.value))
          }
          style={{ width: "100%" }}
          disabled={disabled}
        />
      </Box>

      {/* Configuration Conseiller */}
      <Box sx={{ mb: 2, p: 2, bgcolor: "secondary.50", borderRadius: 1 }}>
        <Typography
          variant="subtitle2"
          gutterBottom
          sx={{ color: "secondary.main" }}
        >
          🎓 Voix du Conseiller
        </Typography>

        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Voix conseiller</InputLabel>
          <Select
            value={settings.conseiller.voice}
            onChange={(e) =>
              handleRoleChange("conseiller", "voice", e.target.value)
            }
            disabled={disabled}
            label="Voix conseiller"
          >
            {VOICE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Box>
                  <Typography variant="body2">{option.label}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.personality}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography variant="caption">
          Vitesse: {settings.conseiller.speed}x
        </Typography>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={settings.conseiller.speed}
          onChange={(e) =>
            handleRoleChange("conseiller", "speed", parseFloat(e.target.value))
          }
          style={{ width: "100%" }}
          disabled={disabled}
        />
      </Box>

      <Typography variant="caption" color="text.secondary">
        💡 Conseil: Utilisez des voix contrastées pour différencier clairement
        les interlocuteurs lors de l'écoute.
      </Typography>
    </Box>
  );
};
