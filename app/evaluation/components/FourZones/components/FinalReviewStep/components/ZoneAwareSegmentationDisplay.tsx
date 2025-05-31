// components/FinalReviewStep/ZoneAwareSegmentationDisplay.tsx
import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Chip,
  LinearProgress,
  Collapse,
  Tooltip,
  Button,
  Divider,
  Alert,
} from "@mui/material";
import {
  PlayArrow,
  Stop,
  Download,
  ExpandMore,
  ExpandLess,
  Psychology,
  Speed,
  VolumeUp,
  Info,
} from "@mui/icons-material";

import {
  ZoneAwareTextSegment,
  ZoneComposition,
} from "../../../utils/generateFinalText";

interface ZoneAwareSegmentationDisplayProps {
  composition: ZoneComposition;
  onPlaySegment: (segment: ZoneAwareTextSegment) => void;
  onStopSegment: (segmentId: string) => void;
  onDownloadSegment?: (segment: ZoneAwareTextSegment) => void;
  activeSegmentId?: string | null;
  isLoading?: boolean;
  progress?: number;
  disabled?: boolean;
  mode?: string;
}

export const ZoneAwareSegmentationDisplay: React.FC<
  ZoneAwareSegmentationDisplayProps
> = ({
  composition,
  onPlaySegment,
  onStopSegment,
  onDownloadSegment,
  activeSegmentId,
  isLoading = false,
  progress = 0,
  disabled = false,
  mode = "light",
}) => {
  const [expandedSegments, setExpandedSegments] = useState<Set<string>>(
    new Set()
  );
  const [showStats, setShowStats] = useState(false);

  const toggleSegmentExpansion = (segmentId: string) => {
    const newExpanded = new Set(expandedSegments);
    if (newExpanded.has(segmentId)) {
      newExpanded.delete(segmentId);
    } else {
      newExpanded.add(segmentId);
    }
    setExpandedSegments(newExpanded);
  };

  const handlePlayAll = () => {
    // Pour une lecture séquentielle, on peut commencer par le premier segment
    if (composition.segments.length > 0) {
      onPlaySegment(composition.segments[0]);
    }
  };

  // Tri des segments par ordre de zone
  const sortedSegments = [...composition.segments].sort(
    (a, b) => (a.zoneOrder || 0) - (b.zoneOrder || 0)
  );

  return (
    <Box>
      {/* En-tête avec statistiques */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            🎯 Lecture par zones
          </Typography>

          <Chip
            label={`${composition.stats.totalSegments} zone${
              composition.stats.totalSegments > 1 ? "s" : ""
            }`}
            size="small"
            color="primary"
            variant="outlined"
          />

          {composition.hasReworkedContent && (
            <Chip
              label="Contenu retravaillé"
              size="small"
              color="success"
              variant="filled"
            />
          )}

          <Box sx={{ flexGrow: 1 }} />

          <Tooltip title="Voir les statistiques">
            <IconButton size="small" onClick={() => setShowStats(!showStats)}>
              <Info />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Statistiques détaillées */}
        <Collapse in={showStats}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Composition :</strong>{" "}
              {composition.stats.reworkedSegments} zone(s) retravaillée(s)
              <br />
              <strong>Longueur :</strong> {composition.stats.finalLength}{" "}
              caractères
              {composition.originalText && (
                <>
                  {" • "}
                  <strong>Évolution :</strong>{" "}
                  {composition.stats.finalLength -
                    composition.stats.originalLength >
                  0
                    ? "+"
                    : ""}
                  {composition.stats.finalLength -
                    composition.stats.originalLength}{" "}
                  caractères
                </>
              )}
              <br />
              <strong>Zones utilisées :</strong>{" "}
              {sortedSegments.map((s) => s.zoneName).join(", ")}
            </Typography>
          </Alert>
        </Collapse>

        {/* Actions globales */}
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            startIcon={<PlayArrow />}
            onClick={handlePlayAll}
            disabled={disabled || sortedSegments.length === 0}
            size="small"
          >
            Lire tout en séquence
          </Button>

          {onDownloadSegment && (
            <Button
              variant="outlined"
              startIcon={<Download />}
              disabled={disabled}
              size="small"
            >
              Télécharger tout
            </Button>
          )}
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Liste des segments par zone */}
      {sortedSegments.length === 0 ? (
        <Alert severity="warning">
          Aucune zone avec du contenu retravaillé disponible.
        </Alert>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {sortedSegments.map((segment, index) => {
            const isActive = activeSegmentId === segment.id;
            const isExpanded = expandedSegments.has(segment.id);
            const isLoadingSegment = isLoading && isActive;

            return (
              <Paper
                key={segment.id}
                elevation={isActive ? 4 : 1}
                sx={{
                  border: "2px solid",
                  borderColor: segment.zoneColor || "divider",
                  borderRadius: 2,
                  overflow: "hidden",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    elevation: 3,
                    transform: "translateY(-1px)",
                  },
                }}
              >
                {/* En-tête de segment */}
                <Box
                  sx={{
                    p: 2,
                    bgcolor: segment.zoneColor
                      ? `${segment.zoneColor}15`
                      : "action.hover",
                    borderBottom: "1px solid",
                    borderBottomColor: "divider",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {/* Badge de zone */}
                    <Chip
                      label={`${segment.zoneOrder}. ${segment.zoneName}`}
                      size="medium"
                      sx={{
                        bgcolor: segment.zoneColor,
                        color: "white",
                        fontWeight: "bold",
                        "& .MuiChip-label": {
                          fontSize: "0.875rem",
                        },
                      }}
                    />

                    {/* Indicateurs */}
                    {segment.isFromRework && (
                      <Chip
                        label="Retravaillé"
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    )}

                    {segment.postitIds && segment.postitIds.length > 1 && (
                      <Chip
                        label={`${segment.postitIds.length} post-its`}
                        size="small"
                        variant="outlined"
                      />
                    )}

                    <Box sx={{ flexGrow: 1 }} />

                    {/* Contrôles de lecture */}
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <Tooltip
                        title={
                          isActive && !isLoadingSegment
                            ? "Arrêter"
                            : "Lire ce segment"
                        }
                      >
                        <IconButton
                          size="small"
                          onClick={() =>
                            isActive
                              ? onStopSegment(segment.id)
                              : onPlaySegment(segment)
                          }
                          disabled={disabled || isLoadingSegment}
                          color={isActive ? "secondary" : "primary"}
                          sx={{
                            bgcolor: isActive
                              ? "rgba(156, 39, 176, 0.1)"
                              : "rgba(25, 118, 210, 0.1)",
                          }}
                        >
                          {isActive && !isLoadingSegment ? (
                            <Stop />
                          ) : (
                            <PlayArrow />
                          )}
                        </IconButton>
                      </Tooltip>

                      {onDownloadSegment && (
                        <Tooltip title="Télécharger ce segment">
                          <IconButton
                            size="small"
                            onClick={() => onDownloadSegment(segment)}
                            disabled={disabled}
                          >
                            <Download fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      <Tooltip title={isExpanded ? "Réduire" : "Développer"}>
                        <IconButton
                          size="small"
                          onClick={() => toggleSegmentExpansion(segment.id)}
                        >
                          {isExpanded ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* Barre de progression pour le segment actif */}
                  {isActive && (
                    <Box sx={{ mt: 1 }}>
                      {isLoadingSegment ? (
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <VolumeUp fontSize="small" color="action" />
                          <Typography variant="caption" color="text.secondary">
                            Génération audio...
                          </Typography>
                        </Box>
                      ) : (
                        <LinearProgress
                          variant="determinate"
                          value={progress}
                          sx={{
                            height: 4,
                            borderRadius: 2,
                            bgcolor: "rgba(0,0,0,0.1)",
                            "& .MuiLinearProgress-bar": {
                              bgcolor: segment.zoneColor,
                            },
                          }}
                        />
                      )}
                    </Box>
                  )}
                </Box>

                {/* Contenu du segment */}
                <Collapse in={isExpanded} timeout="auto">
                  <Box sx={{ p: 2 }}>
                    <Typography
                      variant="body1"
                      sx={{
                        lineHeight: 1.6,
                        fontSize: "1rem",
                        color:
                          mode === "dark" ? "text.primary" : "text.primary",
                      }}
                    >
                      {segment.content}
                    </Typography>

                    {/* Métadonnées détaillées */}
                    <Box
                      sx={{
                        mt: 2,
                        pt: 2,
                        borderTop: "1px solid",
                        borderTopColor: "divider",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        <strong>Zone source :</strong> {segment.sourceZone}
                        {segment.postitIds && segment.postitIds.length > 0 && (
                          <>
                            {" • "}
                            <strong>Post-its sources :</strong>{" "}
                            {segment.postitIds.length}
                          </>
                        )}
                        {" • "}
                        <strong>Longueur :</strong> {segment.content.length}{" "}
                        caractères
                        {" • "}
                        <strong>Temps estimé :</strong> ~
                        {Math.round(segment.content.length / 120)}s
                      </Typography>
                    </Box>
                  </Box>
                </Collapse>

                {/* Aperçu compact quand réduit */}
                <Collapse in={!isExpanded} timeout="auto">
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {segment.content}
                    </Typography>
                  </Box>
                </Collapse>
              </Paper>
            );
          })}
        </Box>
      )}

      {/* Résumé en bas */}
      <Box sx={{ mt: 3, p: 2, bgcolor: "action.hover", borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          💡 <strong>Lecture intelligente :</strong> Chaque zone correspond à
          une étape logique de la réponse conseiller. Vous pouvez écouter chaque
          section individuellement ou enchaîner automatiquement.
          {composition.hasReworkedContent && (
            <>
              {" "}
              Le contenu provient des améliorations que vous avez apportées dans
              les zones de travail.
            </>
          )}
        </Typography>
      </Box>
    </Box>
  );
};

export default ZoneAwareSegmentationDisplay;
