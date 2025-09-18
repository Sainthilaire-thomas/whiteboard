// app/evaluation/components/NewTranscript/components/Timeline/Layers/TimelineLayer.tsx

import React from "react";
import { Box, Typography } from "@mui/material";
import { TemporalEvent } from "../../../types";
import {
  TimelineLayer as TLayer,
  TimelineProfile,
  EventMetrics,
} from "../types";
import { useLayerLayout } from "../hooks/useLayerLayout";

interface TimelineLayerProps {
  layer: TLayer;
  width: number;
  duration: number;
  profile: TimelineProfile;
  renderEvent: (event: TemporalEvent, metrics: EventMetrics) => React.ReactNode;
}

/**
 * Composant pour afficher une couche d'événements avec layout anti-collision
 */
export function TimelineLayer({
  layer,
  width,
  duration,
  profile,
  renderEvent,
}: TimelineLayerProps) {
  // Ne rien afficher si la couche est invisible ou vide
  if (!layer.visible || layer.events.length === 0) {
    return null;
  }

  // Calculer le layout avec l'algorithme anti-collision
  const { items, rowsCount, rowHeight, rowGap } = useLayerLayout({
    events: layer.events,
    width,
    duration,
    profile,
  });

  // Calculer la hauteur dynamique basée sur le nombre de rangées
  const dynamicHeight = Math.max(
    layer.height,
    6 + rowsCount * (rowHeight + rowGap)
  );

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: dynamicHeight,
        backgroundColor: `${layer.color}15`,
        borderRadius: 1,
        marginBottom: 1.5,
        border: `1px solid ${layer.color}30`,
      }}
    >
      {/* Label de la couche */}
      <Typography
        variant="caption"
        sx={{
          position: "absolute",
          left: 8,
          top: 4,
          fontSize: "0.75rem",
          color: layer.color,
          fontWeight: "bold",
          zIndex: 5,
          backgroundColor: "rgba(255,255,255,0.88)",
          padding: "1px 6px",
          borderRadius: "2px",
          border: `1px solid ${layer.color}30`,
        }}
      >
        {layer.name} ({layer.events.length})
      </Typography>

      {/* Événements positionnés */}
      {items.map(({ event, row, x, w }, index) => {
        const metrics: EventMetrics = {
          x,
          w,
          y: 4 + row * (rowHeight + rowGap),
          rowHeight: rowHeight + 4, // +4 pour marge interne
        };

        return (
          <Box
            key={`${event.id}-${index}`}
            sx={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none", // Le marker gère ses propres events
            }}
          >
            {renderEvent(event, metrics)}
          </Box>
        );
      })}

      {/* Indicateur de dépassement si trop d'événements */}
      {layer.events.length > items.length && (
        <Box
          sx={{
            position: "absolute",
            right: 8,
            top: 4,
            backgroundColor: "warning.main",
            color: "warning.contrastText",
            padding: "2px 6px",
            borderRadius: "999px",
            fontSize: "0.7rem",
            fontWeight: "bold",
            zIndex: 10,
          }}
        >
          +{layer.events.length - items.length}
        </Box>
      )}
    </Box>
  );
}

/**
 * Composant wrapper pour gérer les couches multiples
 */
interface MultiLayerProps {
  layers: TLayer[];
  width: number;
  duration: number;
  profile: TimelineProfile;
  renderEvent: (event: TemporalEvent, metrics: EventMetrics) => React.ReactNode;
}

export function MultiLayer({
  layers,
  width,
  duration,
  profile,
  renderEvent,
}: MultiLayerProps) {
  const visibleLayers = layers.filter(
    (layer) => layer.visible && layer.events.length > 0
  );

  if (visibleLayers.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 60,
          color: "text.secondary",
          fontStyle: "italic",
          backgroundColor: "action.hover",
          borderRadius: 1,
          border: "1px dashed",
          borderColor: "divider",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="body2">Aucun événement à afficher</Typography>
          <Typography variant="caption">
            Les post-its et annotations apparaîtront ici
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <>
      {visibleLayers.map((layer) => (
        <TimelineLayer
          key={layer.id}
          layer={layer}
          width={width}
          duration={duration}
          profile={profile}
          renderEvent={renderEvent}
        />
      ))}
    </>
  );
}

export default TimelineLayer;
