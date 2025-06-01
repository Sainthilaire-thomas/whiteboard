// NudgeEditCard.tsx - Version corrigée

import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Card,
  CardContent,
  Chip,
  IconButton,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Alert,
  Collapse,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  AutoAwesome as AIIcon,
  Psychology as PsychologyIcon,
  TrendingUp as TrendingUpIcon,
  EmojiObjects as IdeaIcon,
  CheckCircle as CheckIcon,
  Close as CloseIcon,
  Create as CreateIcon,
} from "@mui/icons-material";

interface NudgeData {
  index: number;
  content: string;
}

interface NudgeEditCardProps {
  nudge: NudgeData;
  editMode: boolean;
  editingContent?: string;
  onEdit: (index: number, content: string) => void;
  onSave: (index: number) => void;
  onCancel: (index: number) => void;
  onContentChange: (index: number, content: string) => void;
  saving: boolean;
  // Nouvelles props pour l'IA
  onAISuggestion?: (nudgeIndex: number, prompt: string) => void;
  onCustomPrompt?: (nudgeIndex: number) => void;
  aiSuggestion?: string | null;
  aiLoading?: boolean;
  aiError?: string | null;
  showAISuggestion?: boolean;
  onAcceptAI?: (nudgeIndex: number) => void;
  onRejectAI?: (nudgeIndex: number) => void;
}

// Prompts prédéfinis
const AI_PROMPTS = [
  {
    id: "motivational",
    label: "Rendre plus motivant",
    icon: <TrendingUpIcon fontSize="small" />,
    prompt:
      "Réécris ce nudge d'entraînement de manière plus motivante et engageante, en utilisant un langage positif et énergique qui donne envie d'agir. Garde la même longueur.",
  },
  {
    id: "psychological",
    label: "Approche psychologique",
    icon: <PsychologyIcon fontSize="small" />,
    prompt:
      "Améliore ce nudge d'entraînement en utilisant des principes de psychologie comportementale pour maximiser l'adhésion et la motivation à long terme.",
  },
  {
    id: "actionable",
    label: "Plus actionnable",
    icon: <CheckIcon fontSize="small" />,
    prompt:
      "Reformule ce nudge d'entraînement pour le rendre plus concret et actionnable, avec des étapes claires et des objectifs précis.",
  },
  {
    id: "creative",
    label: "Plus créatif",
    icon: <IdeaIcon fontSize="small" />,
    prompt:
      "Réinvente ce nudge d'entraînement de manière créative et originale, en utilisant des métaphores ou des approches innovantes tout en gardant l'objectif pédagogique.",
  },
];

const NudgeEditCard: React.FC<NudgeEditCardProps> = ({
  nudge,
  editMode,
  editingContent,
  onEdit,
  onSave,
  onCancel,
  onContentChange,
  saving,
  onAISuggestion,
  onCustomPrompt,
  aiSuggestion,
  aiLoading,
  aiError,
  showAISuggestion,
  onAcceptAI,
  onRejectAI,
}) => {
  // États locaux
  const [aiMenuAnchor, setAiMenuAnchor] = useState<null | HTMLElement>(null);

  // Gérer les suggestions IA
  const handleAISuggestion = (promptConfig: (typeof AI_PROMPTS)[0]) => {
    setAiMenuAnchor(null);

    if (onAISuggestion) {
      onAISuggestion(nudge.index, promptConfig.prompt);
    }
  };

  // Gérer le prompt personnalisé
  const handleCustomPrompt = () => {
    setAiMenuAnchor(null);

    if (onCustomPrompt) {
      onCustomPrompt(nudge.index);
    }
  };

  return (
    <Card variant="outlined" sx={{ mb: 1.5 }}>
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
          <Chip
            label={nudge.index}
            size="small"
            color="primary"
            sx={{ mt: 0.5, minWidth: 28, height: 24 }}
          />

          <Box sx={{ flex: 1 }}>
            {editMode ? (
              <>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  value={editingContent || nudge.content}
                  onChange={(e) => onContentChange(nudge.index, e.target.value)}
                  variant="outlined"
                  size="small"
                  sx={{ "& .MuiInputBase-root": { fontSize: "0.9rem" } }}
                />

                {/* Suggestion IA */}
                <Collapse in={showAISuggestion}>
                  <Box
                    sx={{ mt: 2, p: 2, bgcolor: "info.light", borderRadius: 1 }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <AIIcon color="info" fontSize="small" />
                      <Typography variant="subtitle2" color="info.dark">
                        Suggestion IA
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{ mb: 2, fontStyle: "italic" }}
                    >
                      {aiSuggestion}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => onAcceptAI?.(nudge.index)}
                        sx={{ bgcolor: "success.light" }}
                      >
                        <CheckIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onRejectAI?.(nudge.index)}
                        sx={{ bgcolor: "error.light" }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Collapse>

                {/* Erreur IA */}
                {aiError && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {aiError}
                  </Alert>
                )}
              </>
            ) : (
              <Typography
                variant="body2"
                sx={{ minHeight: 32, lineHeight: 1.4 }}
              >
                {nudge.content}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: "flex", gap: 0.5 }}>
            {editMode ? (
              <>
                {/* Bouton IA - seulement en mode édition */}
                <Tooltip title="Suggestions IA">
                  <IconButton
                    size="small"
                    onClick={(e) => setAiMenuAnchor(e.currentTarget)}
                    disabled={aiLoading || (!editingContent && !nudge.content)}
                    sx={{ p: 0.5 }}
                  >
                    {aiLoading ? (
                      <CircularProgress size={14} />
                    ) : (
                      <AIIcon fontSize="small" color="info" />
                    )}
                  </IconButton>
                </Tooltip>

                {/* Menu des suggestions IA */}
                <Menu
                  anchorEl={aiMenuAnchor}
                  open={Boolean(aiMenuAnchor)}
                  onClose={() => setAiMenuAnchor(null)}
                  PaperProps={{
                    sx: { minWidth: 250 },
                  }}
                >
                  <MenuItem disabled sx={{ opacity: 1 }}>
                    <Typography variant="subtitle2" color="primary">
                      🤖 Améliorations IA
                    </Typography>
                  </MenuItem>
                  {AI_PROMPTS.map((promptConfig) => (
                    <MenuItem
                      key={promptConfig.id}
                      onClick={() => handleAISuggestion(promptConfig)}
                    >
                      <ListItemIcon>{promptConfig.icon}</ListItemIcon>
                      <ListItemText primary={promptConfig.label} />
                    </MenuItem>
                  ))}
                  <MenuItem onClick={handleCustomPrompt}>
                    <ListItemIcon>
                      <CreateIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Prompt personnalisé" />
                  </MenuItem>
                </Menu>

                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => onSave(nudge.index)}
                  disabled={saving}
                  sx={{ p: 0.5 }}
                >
                  {saving ? (
                    <CircularProgress size={14} />
                  ) : (
                    <SaveIcon fontSize="small" />
                  )}
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => onCancel(nudge.index)}
                  sx={{ p: 0.5 }}
                >
                  <Typography variant="body2">✕</Typography>
                </IconButton>
              </>
            ) : (
              <IconButton
                size="small"
                onClick={() => onEdit(nudge.index, nudge.content)}
                sx={{ p: 0.5 }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default NudgeEditCard;
