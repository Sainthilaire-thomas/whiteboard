// components/FinalReviewStep/EnrichedTextDisplay.tsx
import React from "react";
import { Box, Typography, Tooltip, Chip } from "@mui/material";
import {
  ZoneComposition,
  ZoneAwareTextSegment,
} from "../../../utils/generateFinalText";

interface EnrichedTextDisplayProps {
  composition: ZoneComposition;
  fontSize?: number;
  mode?: string;
  showZoneIndicators?: boolean; // Pour activer/désactiver l'affichage enrichi
}

/**
 * Composant d'affichage discret du texte conseiller avec indicateurs de zones
 * Affiche le texte de manière naturelle avec des indicateurs visuels subtils
 */
export const EnrichedTextDisplay: React.FC<EnrichedTextDisplayProps> = ({
  composition,
  fontSize = 16,
  mode = "light",
  showZoneIndicators = true,
}) => {
  // Si pas de composition enrichie ou indicateurs désactivés, affichage simple
  if (!composition.hasReworkedContent || !showZoneIndicators) {
    return (
      <Typography
        fontSize={fontSize}
        sx={{
          lineHeight: 1.8,
          color: mode === "dark" ? "text.primary" : "text.primary",
        }}
      >
        {composition.fullText}
      </Typography>
    );
  }

  // Tri des segments par ordre de zone
  const sortedSegments = [...composition.segments].sort(
    (a, b) => (a.zoneOrder || 0) - (b.zoneOrder || 0)
  );

  return (
    <Box>
      {/* Affichage segment par segment avec indicateurs discrets */}
      {sortedSegments.map((segment, index) => (
        <Box key={segment.id} sx={{ display: "inline" }}>
          <Tooltip
            title={
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: "bold", mb: 0.5 }}
                >
                  {segment.zoneOrder}. {segment.zoneName}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {segment.content}
                </Typography>
                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                  <Chip
                    label={segment.isFromRework ? "Retravaillé" : "Original"}
                    size="small"
                    color={segment.isFromRework ? "success" : "default"}
                    variant="outlined"
                  />
                  {segment.postitIds && segment.postitIds.length > 0 && (
                    <Chip
                      label={`${segment.postitIds.length} post-it(s)`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Box>
            }
            placement="top"
            arrow
            componentsProps={{
              tooltip: {
                sx: {
                  maxWidth: 300,
                  bgcolor: "rgba(0,0,0,0.9)",
                  color: "white",
                },
              },
            }}
          >
            <Box
              component="span"
              sx={{
                position: "relative",
                display: "inline",

                // Soulignement discret avec la couleur de zone
                borderBottom: `1px solid ${segment.zoneColor}`,
                borderBottomStyle: "dotted", // Style pointillé pour plus de discrétion

                // Arrière-plan très subtil au survol
                "&:hover": {
                  backgroundColor: segment.zoneColor
                    ? `${segment.zoneColor}08`
                    : "transparent",
                  borderBottomStyle: "solid", // Devient solide au survol
                  borderBottomWidth: "2px",
                  cursor: "help",
                },

                // Transition douce
                transition: "all 0.2s ease-in-out",
              }}
            >
              <Typography
                component="span"
                fontSize={fontSize}
                sx={{
                  lineHeight: 1.8,
                  color: mode === "dark" ? "text.primary" : "text.primary",
                }}
              >
                {segment.content}
              </Typography>
            </Box>
          </Tooltip>

          {/* Espacement naturel entre les segments */}
          {index < sortedSegments.length - 1 && (
            <Typography component="span" fontSize={fontSize}>
              {segment.content.endsWith(".") ? " " : ". "}
            </Typography>
          )}
        </Box>
      ))}

      {/* Légende très discrète avec % de proactivité */}
      <Box
        sx={{
          mt: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 2,
          opacity: 0.7,
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontSize: "0.75rem" }}
        >
          💡 Survolez pour voir l'origine
          {/* ✅ Condition simplifiée pour debug */}
          {composition.stats?.proactivityPercentage !== undefined &&
            composition.stats.proactivityPercentage >= 0 && (
              <> • {composition.stats.proactivityPercentage}% de proactivité</>
            )}
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {sortedSegments.map((segment) => (
            <Tooltip
              key={segment.id}
              title={`${segment.zoneName}${
                segment.sourceZone === "ENTREPRISE_FAIT"
                  ? " (contexte)"
                  : " (proactif)"
              }`}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  backgroundColor: segment.zoneColor,
                  borderRadius: "50%",
                  cursor: "help",
                  opacity: 0.8,
                }}
              />
            </Tooltip>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default EnrichedTextDisplay;
