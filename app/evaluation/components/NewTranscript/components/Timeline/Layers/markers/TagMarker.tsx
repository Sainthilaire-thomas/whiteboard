// app/evaluation/components/NewTranscript/components/Timeline/Layers/markers/TagMarker.tsx

import React from "react";
import { Box, Tooltip, Typography } from "@mui/material";
import { TemporalEvent } from "../../../../types";
import { EventMetrics } from "../../types";
import { formatTime } from "../../utils/time";

interface TagMarkerProps {
  event: TemporalEvent;
  metrics: EventMetrics;
  showLabel?: boolean;
  onClick: (event: TemporalEvent) => void;
  onHover?: (event: TemporalEvent) => void;
}

/**
 * Marker spécialisé pour les tags
 * Affiche une barre verticale avec une pilule contenant le nom du tag
 */
export function TagMarker({
  event,
  metrics,
  showLabel = true,
  onClick,
  onHover,
}: TagMarkerProps) {
  const { x, w, y, rowHeight } = metrics;
  const isPoint = !event.endTime;
  const backgroundColor = event.metadata?.color || "#1976d2";
  const tagLabel = event.metadata?.category || event.data?.tag || "Tag";

  return (
    <Tooltip
      title={
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
            {tagLabel}
          </Typography>
          <Typography variant="caption">
            {formatTime(event.startTime)}
            {event.endTime && ` - ${formatTime(event.endTime)}`}
          </Typography>
          {event.metadata?.speaker && (
            <Typography variant="caption" sx={{ display: "block" }}>
              Locuteur: {event.metadata.speaker}
            </Typography>
          )}
          {event.data?.verbatim && (
            <Typography
              variant="caption"
              sx={{
                display: "block",
                fontStyle: "italic",
                maxWidth: 250,
                mt: 0.5,
              }}
            >
              "{event.data.verbatim}"
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
          left: x,
          top: y,
          width: w,
          height: rowHeight - 4,
          cursor: "pointer",
          zIndex: 12,
          transition: "transform 0.12s ease",
          "&:hover": {
            transform: "translateY(-1px)",
            zIndex: 20,
          },
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick(event);
        }}
        onMouseEnter={() => onHover?.(event)}
      >
        {/* Barre verticale pour les points, rectangle pour les plages */}
        <Box
          sx={{
            position: "absolute",
            left: isPoint ? w / 2 - 1 : 0,
            top: 0,
            width: isPoint ? 2 : w,
            height: "100%",
            backgroundColor,
            opacity: isPoint ? 0.9 : 0.6,
            borderRadius: isPoint ? 1 : 4,
            boxShadow: `0 0 4px ${backgroundColor}40`,
          }}
        />

        {/* Pilule avec le nom du tag */}
        {showLabel && w >= 38 && (
          <Box
            sx={{
              position: "absolute",
              top: 2,
              left: "50%",
              transform: "translateX(-50%)",
              maxWidth: Math.max(38, w - 6),
              px: 1.5,
              height: 18,
              lineHeight: "18px",
              fontSize: "0.7rem",
              fontWeight: 600,
              color: "#fff",
              backgroundColor,
              border: `1px solid ${backgroundColor}`,
              borderRadius: "999px",
              boxShadow: `inset 0 0 0 1px rgba(255,255,255,.2), 0 2px 4px rgba(0,0,0,.3)`,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              textAlign: "center",
            }}
          >
            {tagLabel}
          </Box>
        )}

        {/* Indicateur de tag (icône T dans un cercle) */}
        <Box
          sx={{
            position: "absolute",
            top: -3,
            right: isPoint ? -6 : -3,
            width: 12,
            height: 12,
            backgroundColor,
            borderRadius: "50%",
            border: "2px solid white",
            fontSize: "0.6rem",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            boxShadow: `0 1px 3px rgba(0,0,0,.3)`,
          }}
        >
          T
        </Box>

        {/* Barre de focus au survol */}
        <Box
          sx={{
            position: "absolute",
            left: isPoint ? w / 2 - 2 : -1,
            top: -1,
            width: isPoint ? 4 : w + 2,
            height: "calc(100% + 2px)",
            backgroundColor: "transparent",
            border: `2px solid ${backgroundColor}`,
            borderRadius: isPoint ? 2 : 6,
            opacity: 0,
            transition: "opacity 0.15s ease",
            ".MuiBox-root:hover &": { opacity: 1 },
          }}
        />
      </Box>
    </Tooltip>
  );
}
