// extensions/SmartTextSegmentation.tsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Paper,
  Divider,
  LinearProgress,
  Tooltip,
  ButtonGroup,
} from "@mui/material";
import {
  AutoFixHigh,
  PlayArrow,
  Stop,
  Edit,
  Merge,
  CallSplit,
  Save,
  Refresh,
} from "@mui/icons-material";

export interface TextSegment {
  id: string;
  content: string;
  type: "sentence" | "paragraph" | "section" | "custom";
  isSelected: boolean;
  audioUrl?: string;
  isPlaying?: boolean;
  duration?: number;
}

interface SmartSegmentationProps {
  text: string;
  onSegmentsChange: (segments: TextSegment[]) => void;
  onPlaySegment: (segment: TextSegment) => void;
  onStopSegment: (segmentId: string) => void;
  disabled?: boolean;
}

// Utilitaires de segmentation
const segmentBySentences = (text: string): TextSegment[] => {
  const sentences = text.match(/[^\.!?]+[\.!?]+/g) || [text];
  return sentences.map((sentence, index) => ({
    id: `sentence-${index}`,
    content: sentence.trim(),
    type: "sentence",
    isSelected: false,
  }));
};

const segmentByParagraphs = (text: string): TextSegment[] => {
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim());
  return paragraphs.map((paragraph, index) => ({
    id: `paragraph-${index}`,
    content: paragraph.trim(),
    type: "paragraph",
    isSelected: false,
  }));
};

const segmentByLogicalSections = (text: string): TextSegment[] => {
  // Segmentation intelligente basée sur les marqueurs logiques
  const patterns = [
    /(?:^|\n)(?:Premièrement|D'abord|Tout d'abord|En premier lieu)/i,
    /(?:^|\n)(?:Deuxièmement|Ensuite|Puis|Par ailleurs)/i,
    /(?:^|\n)(?:Troisièmement|Enfin|Pour finir|En conclusion)/i,
    /(?:^|\n)(?:Cependant|Néanmoins|Toutefois|Malgré)/i,
    /(?:^|\n)(?:En effet|Par exemple|Notamment|C'est pourquoi)/i,
  ];

  let segments: TextSegment[] = [];
  let currentText = text;
  let segmentIndex = 0;

  // Si pas de marqueurs logiques, segmenter par phrases longues
  if (!patterns.some((pattern) => pattern.test(text))) {
    return segmentBySentences(text);
  }

  // Segmentation intelligente (simplifié pour l'exemple)
  const parts = text.split(/\n\s*\n/);
  return parts.map((part, index) => ({
    id: `section-${index}`,
    content: part.trim(),
    type: "section",
    isSelected: false,
  }));
};

export const SmartTextSegmentationExtension: React.FC<
  SmartSegmentationProps
> = ({
  text,
  onSegmentsChange,
  onPlaySegment,
  onStopSegment,
  disabled = false,
}) => {
  const [segments, setSegments] = useState<TextSegment[]>([]);
  const [segmentationType, setSegmentationType] = useState<
    "sentences" | "paragraphs" | "logical"
  >("sentences");
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  // Initialisation des segments
  useEffect(() => {
    if (!text.trim()) return;

    let newSegments: TextSegment[] = [];

    switch (segmentationType) {
      case "sentences":
        newSegments = segmentBySentences(text);
        break;
      case "paragraphs":
        newSegments = segmentByParagraphs(text);
        break;
      case "logical":
        newSegments = segmentByLogicalSections(text);
        break;
    }

    setSegments(newSegments);
    onSegmentsChange(newSegments);
  }, [text, segmentationType]);

  // Gestion de l'édition
  const handleEditStart = (segment: TextSegment) => {
    setIsEditing(segment.id);
    setEditContent(segment.content);
  };

  const handleEditSave = () => {
    if (!isEditing) return;

    const updatedSegments = segments.map((segment) =>
      segment.id === isEditing
        ? { ...segment, content: editContent, audioUrl: undefined } // Reset audio cache
        : segment
    );

    setSegments(updatedSegments);
    onSegmentsChange(updatedSegments);
    setIsEditing(null);
  };

  const handleEditCancel = () => {
    setIsEditing(null);
    setEditContent("");
  };

  // Fusion de segments
  const mergeSegments = (segment1Id: string, segment2Id: string) => {
    const index1 = segments.findIndex((s) => s.id === segment1Id);
    const index2 = segments.findIndex((s) => s.id === segment2Id);

    if (index1 === -1 || index2 === -1 || Math.abs(index1 - index2) !== 1)
      return;

    const [firstIndex, secondIndex] =
      index1 < index2 ? [index1, index2] : [index2, index1];
    const mergedContent =
      segments[firstIndex].content + " " + segments[secondIndex].content;

    const updatedSegments = [
      ...segments.slice(0, firstIndex),
      {
        ...segments[firstIndex],
        content: mergedContent,
        type: "custom" as const,
        audioUrl: undefined,
      },
      ...segments.slice(secondIndex + 1),
    ];

    setSegments(updatedSegments);
    onSegmentsChange(updatedSegments);
  };

  // Division d'un segment
  const splitSegment = (segmentId: string, splitPoint: number) => {
    const segmentIndex = segments.findIndex((s) => s.id === segmentId);
    if (segmentIndex === -1) return;

    const segment = segments[segmentIndex];
    const part1 = segment.content.substring(0, splitPoint).trim();
    const part2 = segment.content.substring(splitPoint).trim();

    if (!part1 || !part2) return;

    const updatedSegments = [
      ...segments.slice(0, segmentIndex),
      {
        ...segment,
        content: part1,
        id: `${segment.id}-1`,
        audioUrl: undefined,
      },
      {
        ...segment,
        content: part2,
        id: `${segment.id}-2`,
        audioUrl: undefined,
      },
      ...segments.slice(segmentIndex + 1),
    ];

    setSegments(updatedSegments);
    onSegmentsChange(updatedSegments);
  };

  const getSegmentTypeColor = (type: TextSegment["type"]) => {
    switch (type) {
      case "sentence":
        return "primary";
      case "paragraph":
        return "secondary";
      case "section":
        return "success";
      case "custom":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "bold" }}>
        ✂️ Découpage intelligent du texte
      </Typography>

      {/* Méthodes de segmentation */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Méthode de découpage
        </Typography>
        <ButtonGroup variant="outlined" size="small">
          <Button
            variant={
              segmentationType === "sentences" ? "contained" : "outlined"
            }
            onClick={() => setSegmentationType("sentences")}
            disabled={disabled}
          >
            Par phrases
          </Button>
          <Button
            variant={
              segmentationType === "paragraphs" ? "contained" : "outlined"
            }
            onClick={() => setSegmentationType("paragraphs")}
            disabled={disabled}
          >
            Par paragraphes
          </Button>
          <Button
            variant={segmentationType === "logical" ? "contained" : "outlined"}
            onClick={() => setSegmentationType("logical")}
            disabled={disabled}
            startIcon={<AutoFixHigh />}
          >
            Intelligent
          </Button>
        </ButtonGroup>
      </Box>

      {/* Statistiques */}
      <Box sx={{ mb: 2, p: 2, bgcolor: "action.hover", borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          📊 {segments.length} segments • ~
          {Math.round(text.length / segments.length)} caractères/segment moyen •
          Temps estimé: ~{Math.round(segments.length * 3)}s
        </Typography>
      </Box>

      {/* Liste des segments */}
      <Box sx={{ maxHeight: 400, overflow: "auto" }}>
        {segments.map((segment, index) => (
          <Paper
            key={segment.id}
            elevation={1}
            sx={{
              p: 2,
              mb: 1,
              border: segment.isSelected
                ? "2px solid primary.main"
                : "1px solid",
              borderColor: segment.isSelected ? "primary.main" : "divider",
              bgcolor: segment.isPlaying
                ? "action.selected"
                : "background.paper",
            }}
          >
            {/* En-tête du segment */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Chip
                label={`${index + 1}`}
                size="small"
                color={getSegmentTypeColor(segment.type)}
                sx={{ mr: 1, minWidth: 32 }}
              />

              <Chip
                label={segment.type}
                size="small"
                variant="outlined"
                sx={{ mr: 1 }}
              />

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ flexGrow: 1 }}
              >
                {segment.content.length} caractères
              </Typography>

              {/* Actions du segment */}
              <Box sx={{ display: "flex", gap: 0.5 }}>
                {isEditing === segment.id ? (
                  <>
                    <IconButton
                      size="small"
                      onClick={handleEditSave}
                      color="primary"
                    >
                      <Save fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={handleEditCancel}>
                      <Stop fontSize="small" />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <Tooltip title="Modifier">
                      <IconButton
                        size="small"
                        onClick={() => handleEditStart(segment)}
                        disabled={disabled}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Lire ce segment">
                      <IconButton
                        size="small"
                        onClick={() => onPlaySegment(segment)}
                        disabled={disabled}
                        color="primary"
                      >
                        <PlayArrow fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    {index > 0 && (
                      <Tooltip title="Fusionner avec le précédent">
                        <IconButton
                          size="small"
                          onClick={() =>
                            mergeSegments(segments[index - 1].id, segment.id)
                          }
                          disabled={disabled}
                        >
                          <Merge fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </>
                )}
              </Box>
            </Box>

            {/* Contenu du segment */}
            {isEditing === segment.id ? (
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                style={{
                  width: "100%",
                  minHeight: "60px",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontFamily: "inherit",
                  fontSize: "14px",
                }}
                autoFocus
              />
            ) : (
              <Typography variant="body2">{segment.content}</Typography>
            )}

            {/* Barre de progression si en lecture */}
            {segment.isPlaying && <LinearProgress sx={{ mt: 1 }} />}
          </Paper>
        ))}
      </Box>

      {/* Actions globales */}
      <Box
        sx={{
          mt: 2,
          display: "flex",
          gap: 1,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <Button
          variant="contained"
          startIcon={<PlayArrow />}
          onClick={() => {
            // Lire tous les segments en séquence
            segments.forEach((segment, index) => {
              setTimeout(() => onPlaySegment(segment), index * 100);
            });
          }}
          disabled={disabled || segments.length === 0}
          size="small"
        >
          Lire tout en séquence
        </Button>

        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => {
            // Regénérer les segments
            setSegmentationType(segmentationType);
          }}
          disabled={disabled}
          size="small"
        >
          Regénérer
        </Button>
      </Box>

      {/* Guide d'utilisation */}
      <Box sx={{ mt: 2, p: 2, bgcolor: "info.50", borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom color="info.main">
          💡 Guide d'utilisation
        </Typography>
        <Typography variant="caption" color="info.dark">
          • <strong>Par phrases</strong>: Idéal pour tester la prononciation
          détaillée
          <br />• <strong>Par paragraphes</strong>: Bon équilibre pour
          l'évaluation globale
          <br />• <strong>Intelligent</strong>: Découpe selon la logique du
          discours
          <br />
          <br />
          Cliquez sur ✏️ pour modifier, ▶️ pour écouter, ou ⚡ pour fusionner
          des segments adjacents.
        </Typography>
      </Box>
    </Box>
  );
};
