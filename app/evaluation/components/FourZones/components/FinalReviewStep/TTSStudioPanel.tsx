// TTSStudioPanel.tsx - Version enrichie avec support des zones
import React, { useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  Chip,
  Alert,
  Collapse,
  IconButton,
} from "@mui/material";
import {
  Tune,
  Psychology,
  ContentCut,
  CompareArrows,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";

// Import des extensions
import { TTSControls } from "./components/TTSControls";
import {
  VoiceByRoleExtension,
  type RoleVoiceSettings,
} from "./extensions/VoiceByRole";
import {
  ConversationalAgentExtension,
  type ConversationalSettings,
} from "./extensions/ConversationalAgent";
import {
  SmartTextSegmentationExtension,
  type TextSegment,
} from "./extensions/SmartTextSegmentation";
import { TTSSettings } from "./hooks/useTTS";

// ✅ NOUVEAUX IMPORTS pour les zones
import {
  ZoneComposition,
  ZoneAwareTextSegment,
} from "../../utils/generateFinalText";
import ZoneAwareSegmentationDisplay from "./components/ZoneAwareSegmentationDisplay";

interface TTSStudioPanelProps {
  // Paramètres de base
  basicSettings: TTSSettings;
  onBasicSettingsChange: (settings: TTSSettings) => void;

  // Extensions
  roleVoiceSettings: RoleVoiceSettings;
  onRoleVoiceChange: (settings: RoleVoiceSettings) => void;

  conversationalSettings: ConversationalSettings;
  onConversationalChange: (settings: ConversationalSettings) => void;

  // Texte et segments
  text: string;
  segments: TextSegment[];
  onSegmentsChange: (segments: TextSegment[]) => void;
  onPlaySegment: (segment: TextSegment) => void;
  onStopSegment: (segmentId: string) => void;

  // ✅ NOUVELLES PROPS pour les zones
  zoneComposition?: ZoneComposition;
  onPlayZoneSegment?: (segment: ZoneAwareTextSegment) => void;
  onDownloadZoneSegment?: (segment: ZoneAwareTextSegment) => void;
  activeSegmentId?: string | null;
  isLoading?: boolean;
  progress?: number;

  // État
  disabled?: boolean;
  mode?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({
  children,
  value,
  index,
  ...other
}) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`studio-tabpanel-${index}`}
      aria-labelledby={`studio-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

export const TTSStudioPanel: React.FC<TTSStudioPanelProps> = ({
  basicSettings,
  onBasicSettingsChange,
  roleVoiceSettings,
  onRoleVoiceChange,
  conversationalSettings,
  onConversationalChange,
  text,
  segments,
  onSegmentsChange,
  onPlaySegment,
  onStopSegment,
  // ✅ NOUVELLES PROPS
  zoneComposition,
  onPlayZoneSegment,
  onDownloadZoneSegment,
  activeSegmentId,
  isLoading = false,
  progress = 0,
  // Props existantes
  disabled = false,
  mode = "light",
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // ✅ Gestion du callback pour les segments de zone
  const handlePlayZoneSegment = (segment: ZoneAwareTextSegment) => {
    if (onPlayZoneSegment) {
      onPlayZoneSegment(segment);
    }
  };

  const handleStopZoneSegment = (segmentId: string) => {
    if (onStopSegment) {
      onStopSegment(segmentId);
    }
  };

  // Comptage des fonctionnalités actives
  const activeFeatures = [
    roleVoiceSettings.enabled && "Voix par rôle",
    conversationalSettings.enabled && "Agent conversationnel",
    segments.length > 1 && "Découpage intelligent",
    zoneComposition?.hasReworkedContent && "Zones retravaillées", // ✅ NOUVEAU
  ].filter(Boolean);

  // ✅ Déterminer quel type de découpage afficher
  const hasZoneComposition =
    zoneComposition && zoneComposition.segments.length > 0;
  const hasStandardSegments = segments.length > 1;
  const hasTextContent = text.trim().length > 0;

  return (
    <Paper
      elevation={2}
      sx={{
        bgcolor: mode === "dark" ? "grey.900" : "background.paper",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      {/* En-tête du studio */}
      <Box sx={{ p: 2, pb: 0 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              🎙️ Studio TTS
            </Typography>
            {activeFeatures.length > 0 && (
              <Chip
                label={`${activeFeatures.length} actif${
                  activeFeatures.length > 1 ? "s" : ""
                }`}
                size="small"
                color="success"
                variant="outlined"
              />
            )}
          </Box>

          <IconButton onClick={() => setIsCollapsed(!isCollapsed)} size="small">
            {isCollapsed ? <ExpandMore /> : <ExpandLess />}
          </IconButton>
        </Box>

        {/* Aperçu des fonctionnalités actives */}
        {activeFeatures.length > 0 && !isCollapsed && (
          <Box sx={{ mt: 1, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
            {activeFeatures.map((feature, index) => (
              <Chip
                key={index}
                label={feature}
                size="small"
                color={
                  feature === "Zones retravaillées" ? "secondary" : "primary"
                }
                variant="filled"
                sx={{ fontSize: "11px" }}
              />
            ))}
          </Box>
        )}
      </Box>

      <Collapse in={!isCollapsed}>
        {/* Onglets de navigation */}
        <Box sx={{ px: 2 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ minHeight: 40 }}
          >
            <Tab
              icon={<Tune />}
              label="Paramètres"
              sx={{ minHeight: 40, py: 1 }}
            />
            <Tab
              icon={<Psychology />}
              label="Voix & Rôles"
              sx={{ minHeight: 40, py: 1 }}
            />
            <Tab
              icon={<Psychology />}
              label="IA Conversationnelle"
              sx={{ minHeight: 40, py: 1 }}
            />
            <Tab
              icon={<ContentCut />}
              label={hasZoneComposition ? "Découpage par zones" : "Découpage"}
              sx={{ minHeight: 40, py: 1 }}
            />
          </Tabs>
        </Box>

        <Divider />

        {/* Contenu des onglets */}
        <Box sx={{ p: 2 }}>
          {/* Onglet 1: Paramètres de base */}
          <TabPanel value={activeTab} index={0}>
            <TTSControls
              settings={basicSettings}
              onChange={onBasicSettingsChange}
              disabled={disabled}
              compact={true}
            />

            <Box sx={{ mt: 2, p: 2, bgcolor: "action.hover", borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                ⚡ Paramètres rapides
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <button
                  onClick={() =>
                    onBasicSettingsChange({
                      ...basicSettings,
                      voice: "alloy",
                      speed: 0.9,
                    })
                  }
                  style={{
                    padding: "4px 8px",
                    borderRadius: "12px",
                    border: "1px solid #ddd",
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                  disabled={disabled}
                >
                  🏢 Professionnel
                </button>
                <button
                  onClick={() =>
                    onBasicSettingsChange({
                      ...basicSettings,
                      voice: "nova",
                      speed: 1.1,
                    })
                  }
                  style={{
                    padding: "4px 8px",
                    borderRadius: "12px",
                    border: "1px solid #ddd",
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                  disabled={disabled}
                >
                  ⚡ Dynamique
                </button>
                <button
                  onClick={() =>
                    onBasicSettingsChange({
                      ...basicSettings,
                      voice: "shimmer",
                      speed: 0.8,
                    })
                  }
                  style={{
                    padding: "4px 8px",
                    borderRadius: "12px",
                    border: "1px solid #ddd",
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                  disabled={disabled}
                >
                  💝 Empathique
                </button>
              </Box>
            </Box>
          </TabPanel>

          {/* Onglet 2: Voix par rôle */}
          <TabPanel value={activeTab} index={1}>
            <FormControlLabel
              control={
                <Switch
                  checked={roleVoiceSettings.enabled}
                  onChange={(e) =>
                    onRoleVoiceChange({
                      ...roleVoiceSettings,
                      enabled: e.target.checked,
                    })
                  }
                  disabled={disabled}
                />
              }
              label="Activer les voix différenciées"
              sx={{ mb: 2 }}
            />

            {roleVoiceSettings.enabled ? (
              <VoiceByRoleExtension
                settings={roleVoiceSettings}
                onChange={onRoleVoiceChange}
                disabled={disabled}
              />
            ) : (
              <Alert severity="info">
                <Typography variant="body2">
                  Activez cette fonctionnalité pour utiliser des voix
                  différentes pour le client et le conseiller, améliorant ainsi
                  la distinction lors de l'écoute de l'échange complet.
                </Typography>
              </Alert>
            )}
          </TabPanel>

          {/* Onglet 3: Agent conversationnel */}
          <TabPanel value={activeTab} index={2}>
            <ConversationalAgentExtension
              settings={conversationalSettings}
              onChange={onConversationalChange}
              disabled={disabled}
            />
          </TabPanel>

          {/* Onglet 4: Découpage intelligent ✅ MODIFIÉ */}
          <TabPanel value={activeTab} index={3}>
            {hasZoneComposition ? (
              // ✅ NOUVEAU : Affichage enrichi par zones
              <>
                <Box
                  sx={{
                    mb: 2,
                    p: 2,
                    bgcolor: "success.light",
                    borderRadius: 1,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    color="success.dark"
                    gutterBottom
                  >
                    ✨ Mode zones enrichies activé
                  </Typography>
                  <Typography variant="body2" color="success.dark">
                    Le texte provient de vos améliorations dans les zones de
                    travail. Vous pouvez écouter chaque zone individuellement.
                  </Typography>
                </Box>

                <ZoneAwareSegmentationDisplay
                  composition={zoneComposition}
                  onPlaySegment={handlePlayZoneSegment}
                  onStopSegment={handleStopZoneSegment}
                  onDownloadSegment={onDownloadZoneSegment}
                  activeSegmentId={activeSegmentId}
                  isLoading={isLoading}
                  progress={progress}
                  disabled={disabled}
                  mode={mode}
                />
              </>
            ) : hasTextContent ? (
              // Affichage standard existant
              <>
                {hasStandardSegments && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      Découpage automatique du texte. Pour un contrôle plus fin,
                      utilisez les zones de travail dans l'étape précédente.
                    </Typography>
                  </Alert>
                )}

                <SmartTextSegmentationExtension
                  text={text}
                  onSegmentsChange={onSegmentsChange}
                  onPlaySegment={onPlaySegment}
                  onStopSegment={onStopSegment}
                  disabled={disabled}
                />
              </>
            ) : (
              // Aucun contenu
              <Alert severity="warning">
                <Typography variant="body2">
                  Aucun texte disponible pour le découpage. Assurez-vous qu'il y
                  a du contenu à analyser ou utilisez les zones de travail pour
                  créer une composition enrichie.
                </Typography>
              </Alert>
            )}
          </TabPanel>
        </Box>

        {/* Résumé de configuration ✅ ENRICHI */}
        <Divider />
        <Box sx={{ p: 2, bgcolor: "action.hover" }}>
          <Typography variant="caption" color="text.secondary">
            <strong>Configuration actuelle:</strong> Voix {basicSettings.voice}{" "}
            • Vitesse {basicSettings.speed}x • Qualité {basicSettings.model}
            {roleVoiceSettings.enabled && " • Voix différenciées"}
            {conversationalSettings.enabled &&
              ` • IA ${conversationalSettings.style}`}
            {hasZoneComposition &&
              ` • ${zoneComposition.segments.length} zones enrichies`}
            {!hasZoneComposition &&
              segments.length > 1 &&
              ` • ${segments.length} segments standards`}
          </Typography>
        </Box>
      </Collapse>
    </Paper>
  );
};
