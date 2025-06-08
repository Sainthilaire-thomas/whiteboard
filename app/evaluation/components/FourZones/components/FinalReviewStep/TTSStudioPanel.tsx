// TTSStudioPanel.tsx - Version enrichie avec support des zones ET prosodie
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
  TheaterComedy, // ✅ NOUVEAU ICON pour prosodie
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

// ✅ NOUVEAU : Import pour la prosodie
import { ProsodieControls } from "./extensions/ProsodieControls";

// Imports pour les zones (existants)
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

  // Props pour les zones (existantes)
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
  // Props zones (existantes)
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

  // Gestion du callback pour les segments de zone (existant)
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

  // ✅ NOUVEAU : Détection des fonctionnalités prosodie actives
  const hasProsodieFeatures =
    basicSettings.tone !== "professionnel" ||
    basicSettings.textEnhancement !== "aucun" ||
    basicSettings.autoDetectContext === true;

  // Comptage des fonctionnalités actives ✅ ENRICHI
  const activeFeatures = [
    roleVoiceSettings.enabled && "Voix par rôle",
    conversationalSettings.enabled && "Agent conversationnel",
    segments.length > 1 && "Découpage intelligent",
    zoneComposition?.hasReworkedContent && "Zones retravaillées",
    hasProsodieFeatures && "Prosodie avancée", // ✅ NOUVEAU
  ].filter(Boolean);

  // Déterminer quel type de découpage afficher (existant)
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
      {/* En-tête du studio (existant) */}
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

        {/* Aperçu des fonctionnalités actives ✅ ENRICHI */}
        {activeFeatures.length > 0 && !isCollapsed && (
          <Box sx={{ mt: 1, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
            {activeFeatures.map((feature, index) => (
              <Chip
                key={index}
                label={feature}
                size="small"
                color={
                  feature === "Zones retravaillées"
                    ? "secondary"
                    : feature === "Prosodie avancée"
                      ? "warning" // ✅ NOUVEAU : Couleur spéciale pour prosodie
                      : "primary"
                }
                variant="filled"
                sx={{ fontSize: "11px" }}
              />
            ))}
          </Box>
        )}
      </Box>

      <Collapse in={!isCollapsed}>
        {/* Onglets de navigation ✅ ENRICHI avec Prosodie */}
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
            {/* ✅ NOUVEAU : Onglet Prosodie */}
            <Tab
              icon={<TheaterComedy />}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  Prosodie
                  {hasProsodieFeatures && (
                    <Chip
                      label="ON"
                      size="small"
                      color="warning"
                      sx={{ fontSize: "9px", height: "16px" }}
                    />
                  )}
                </Box>
              }
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

        {/* Contenu des onglets ✅ ENRICHI */}
        <Box sx={{ p: 2 }}>
          {/* Onglet 1: Paramètres de base (existant) */}
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
                      voice: "shimmer",
                      speed: 0.8,
                      tone: "empathique",
                      textEnhancement: "contextuel",
                      autoDetectContext: false, // ✅ CORRECTION : ne pas forcer à true
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
                <button
                  onClick={() =>
                    onBasicSettingsChange({
                      ...basicSettings,
                      voice: "nova",
                      speed: 1.1,
                      tone: "enthousiaste", // ✅ AJOUTER
                      textEnhancement: "emotionnel", // ✅ AJOUTER
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
                      tone: "empathique", // ✅ AJOUTER
                      textEnhancement: "contextuel", // ✅ AJOUTER
                      autoDetectContext: true, // ✅ AJOUTER
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

          {/* Onglet 2: Voix par rôle (existant) */}
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

          {/* ✅ NOUVEAU : Onglet 3: Prosodie */}
          <TabPanel value={activeTab} index={2}>
            <ProsodieControls
              settings={basicSettings}
              onChange={onBasicSettingsChange}
              disabled={disabled}
              selectedText={text} // Pour l'analyse contextuelle
            />
          </TabPanel>

          {/* Onglet 4: Agent conversationnel (décalé) */}
          <TabPanel value={activeTab} index={3}>
            <ConversationalAgentExtension
              settings={conversationalSettings}
              onChange={onConversationalChange}
              disabled={disabled}
            />
          </TabPanel>

          {/* Onglet 5: Découpage intelligent (décalé) */}
          <TabPanel value={activeTab} index={4}>
            {hasZoneComposition ? (
              // Affichage enrichi par zones (existant)
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

        {/* Résumé de configuration ✅ ENRICHI avec prosodie */}
        <Divider />
        <Box sx={{ p: 2, bgcolor: "action.hover" }}>
          <Typography variant="caption" color="text.secondary">
            <strong>Configuration actuelle:</strong> Voix {basicSettings.voice}{" "}
            • Vitesse {basicSettings.speed}x • Qualité {basicSettings.model}
            {basicSettings.tone &&
              basicSettings.tone !== "professionnel" &&
              ` • Ton ${basicSettings.tone}`}
            {basicSettings.textEnhancement !== "aucun" &&
              ` • Enhancement ${basicSettings.textEnhancement}`}
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
