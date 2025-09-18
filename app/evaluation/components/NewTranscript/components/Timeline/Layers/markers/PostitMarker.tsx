// app/evaluation/components/NewTranscript/components/Timeline/Layers/markers/PostitMarker.tsx

import React from "react";
import { Box, Tooltip, Typography } from "@mui/material";
import { TemporalEvent } from "../../../../types";
import { EventMetrics } from "../../types";
import { formatTime } from "../../utils/time";

interface PostitMarkerProps {
  event: TemporalEvent;
  metrics: EventMetrics;
  showLabel?: boolean;
  onClick: (event: TemporalEvent) => void;
  onHover?: (event: TemporalEvent) => void;
}

/**
 * Marker spécialisé pour les post-its
 * Affiche un rond/ovale avec icône post-it et couleur selon le sujet
 */
export function PostitMarker({
  event,
  metrics,
  showLabel = true,
  onClick,
  onHover,
}: PostitMarkerProps) {
  const { x, w, y, rowHeight } = metrics;
  const backgroundColor = event.metadata?.color || "#ff6b6b";
  const sujet = event.data?.sujet || "Autre";
  const text = event.data?.text || "";
  const word = event.data?.word || "";

  // Les post-its sont généralement ponctuels (pas de durée)
  const isPoint = !event.endTime || event.endTime === event.startTime;
  const markerWidth = isPoint ? Math.min(w, 24) : w;

  return (
    <Tooltip
      title={
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
            Post-it • {sujet}
          </Typography>
          <Typography variant="caption">
            {formatTime(event.startTime)}
          </Typography>
          {event.metadata?.speaker && (
            <Typography variant="caption" sx={{ display: "block" }}>
              Locuteur: {event.metadata.speaker}
            </Typography>
          )}
          {word && (
            <Typography
              variant="caption"
              sx={{ display: "block", fontWeight: "bold" }}
            >
              Mot: "{word}"
            </Typography>
          )}
          {text && (
            <Typography
              variant="caption"
              sx={{
                display: "block",
                fontStyle: "italic",
                maxWidth: 250,
                mt: 0.5,
              }}
            >
              "{text}"
            </Typography>
          )}
          {event.data?.pratique && (
            <Typography variant="caption" sx={{ display: "block" }}>
              Pratique: {event.data.pratique}
            </Typography>
          )}
        </Box>
      }
      arrow
      placement="top"
    >
      <Box
        sx={{
          position: "absolute",
          left: x + (w - markerWidth) / 2, // Centrer si c'est un point
          top: y,
          width: markerWidth,
          height: rowHeight - 4,
          cursor: "pointer",
          zIndex: 12,
          transition: "transform 0.12s ease",
          "&:hover": {
            transform: "scale(1.1) translateY(-1px)",
            zIndex: 20,
          },
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick(event);
        }}
        onMouseEnter={() => onHover?.(event)}
      >
        {/* Forme principale - ovale/cercle pour les post-its */}
        <Box
          sx={{
            position: "absolute",
            left: 0,
            top: "50%",
            transform: "translateY(-50%)",
            width: isPoint ? rowHeight - 4 : markerWidth,
            height: rowHeight - 6,
            backgroundColor,
            borderRadius: isPoint ? "50%" : "12px",
            border: `2px solid ${backgroundColor}dd`,
            boxShadow: `0 2px 8px ${backgroundColor}40, inset 0 1px 0 rgba(255,255,255,0.3)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Icône post-it */}
          <Box
            sx={{
              fontSize: isPoint ? "0.7rem" : "0.8rem",
              color: "white",
              fontWeight: "bold",
              textShadow: "0 1px 2px rgba(0,0,0,0.3)",
            }}
          >
            📝
          </Box>
        </Box>

        {/* Label du sujet si assez de place */}
        {showLabel && !isPoint && w >= 50 && (
          <Box
            sx={{
              position: "absolute",
              top: -2,
              left: "50%",
              transform: "translateX(-50%)",
              maxWidth: w - 8,
              px: 1,
              height: 16,
              lineHeight: "16px",
              fontSize: "0.65rem",
              fontWeight: 600,
              color: "white",
              backgroundColor: `${backgroundColor}ee`,
              border: `1px solid ${backgroundColor}`,
              borderRadius: "8px",
              boxShadow: "0 1px 4px rgba(0,0,0,.2)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              textAlign: "center",
            }}
          >
            {sujet}
          </Box>
        )}

        {/* Petit indicateur de sujet en coin */}
        <Box
          sx={{
            position: "absolute",
            top: -1,
            right: -1,
            width: 8,
            height: 8,
            backgroundColor: `${backgroundColor}cc`,
            borderRadius: "50%",
            border: "1px solid white",
            fontSize: "0.4rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
          }}
        >
          P
        </Box>

        {/* Effet de survol */}
        <Box
          sx={{
            position: "absolute",
            left: -2,
            top: -2,
            width: "calc(100% + 4px)",
            height: "calc(100% + 4px)",
            borderRadius: isPoint ? "50%" : "14px",
            border: `2px solid ${backgroundColor}`,
            opacity: 0,
            transition: "opacity 0.15s ease",
            ".MuiBox-root:hover &": { opacity: 0.6 },
          }}
        />
      </Box>
    </Tooltip>
  );
}
