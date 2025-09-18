// app/evaluation/components/NewTranscript/components/Timeline/Layers/EventMarker.tsx

import React from "react";
import { Box, Tooltip, Typography } from "@mui/material";
import { TemporalEvent } from "../../../types";
import { EventMetrics } from "../types";
import { formatTime } from "../utils/time";

interface EventMarkerProps {
  event: TemporalEvent;
  metrics: EventMetrics;
  showLabel?: boolean;
  labelMaxChars?: number;
  onClick: (event: TemporalEvent) => void;
  onHover?: (event: TemporalEvent) => void;
}

/**
 * Composant générique pour afficher un événement sur la timeline
 * Peut être personnalisé via les props ou surchargé par des markers spécialisés
 */
export function EventMarker({
  event,
  metrics,
  showLabel = true,
  labelMaxChars = 18,
  onClick,
  onHover,
}: EventMarkerProps) {
  const { x, w, y, rowHeight } = metrics;
  const isPoint = !event.endTime;
  const backgroundColor = event.metadata?.color || "#2196f3";

  // Déterminer le texte à afficher
  const labelText =
    event.data?.text ||
    event.data?.sujet ||
    event.metadata?.category ||
    "Événement";

  const truncatedLabel =
    labelText.length > labelMaxChars
      ? labelText.slice(0, labelMaxChars - 1) + "…"
      : labelText;

  return (
    <Tooltip
      title={
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
            {labelText}
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
              sx={{ display: "block", fontStyle: "italic" }}
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
        {/* Barre principale (pleine hauteur) */}
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
            border: `1px solid ${backgroundColor}`,
          }}
        />

        {/* Label (pilule) si assez de place */}
        {showLabel && w >= 38 && (
          <Box
            sx={{
              position: "absolute",
              top: 2,
              left: "50%",
              transform: "translateX(-50%)",
              maxWidth: Math.max(38, w - 6),
              px: 1,
              height: 20,
              lineHeight: "20px",
              fontSize: "0.72rem",
              fontWeight: 700,
              color: "#fff",
              backgroundColor,
              border: `1px solid ${backgroundColor}`,
              borderRadius: "999px",
              boxShadow:
                "inset 0 0 0 2px rgba(255,255,255,.18), 0 2px 6px rgba(0,0,0,.35)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {truncatedLabel}
          </Box>
        )}

        {/* Indicateur de type d'événement (coin) */}
        <Box
          sx={{
            position: "absolute",
            top: -2,
            right: isPoint ? -4 : -2,
            width: 8,
            height: 8,
            backgroundColor,
            borderRadius: "50%",
            border: "1px solid white",
            fontSize: "0.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
          }}
        >
          {event.type === "tag" ? "T" : event.type === "postit" ? "P" : "•"}
        </Box>
      </Box>
    </Tooltip>
  );
}

/**
 * Props communes pour tous les markers
 */
export interface BaseMarkerProps {
  event: TemporalEvent;
  metrics: EventMetrics;
  onClick: (event: TemporalEvent) => void;
  onHover?: (event: TemporalEvent) => void;
}

/**
 * Factory pour créer un marker selon le type d'événement
 */
export function createEventMarker(
  event: TemporalEvent,
  metrics: EventMetrics,
  onClick: (event: TemporalEvent) => void,
  onHover?: (event: TemporalEvent) => void
): React.ReactElement {
  const commonProps = { event, metrics, onClick, onHover };

  // Routing selon le type ou le hint de rendu
  switch (event.type) {
    case "tag":
      // Import dynamique pour éviter les dépendances circulaires
      return <EventMarker {...commonProps} showLabel={true} />;
    case "postit":
      return <EventMarker {...commonProps} showLabel={true} />;
    default:
      return <EventMarker {...commonProps} />;
  }
}
