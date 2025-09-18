// app/evaluation/components/NewTranscript/components/Timeline/Header/TimelineHeader.tsx

import React from "react";
import { Box, Typography, Chip, IconButton, Tooltip } from "@mui/material";
import { Visibility, VisibilityOff, Info } from "@mui/icons-material";
import { formatTime } from "../utils/time";

interface TimelineHeaderProps {
  totalEvents: number;
  totalLayers: number;
  currentTime: number;
  duration: number;
  layers?: Array<{
    id: string;
    name: string;
    visible: boolean;
    color: string;
    events: any[];
  }>;
  onToggleLayer?: (layerId: string) => void;
  showLayerControls?: boolean;
}

/**
 * En-tête de la timeline avec informations et contrôles optionnels
 */
export function TimelineHeader({
  totalEvents,
  totalLayers,
  currentTime,
  duration,
  layers = [],
  onToggleLayer,
  showLayerControls = false,
}: TimelineHeaderProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 16px",
        backgroundColor: "action.hover",
        borderBottom: "1px solid",
        borderColor: "divider",
        minHeight: 40,
        flexWrap: "wrap",
        gap: 1,
      }}
    >
      {/* Titre et infos principales */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: "bold", fontSize: "0.9rem" }}
        >
          Timeline
        </Typography>

        <Chip
          label={`${totalEvents} événements`}
          size="small"
          color="primary"
          variant="outlined"
        />

        <Chip
          label={`${totalLayers} couches`}
          size="small"
          variant="outlined"
        />
      </Box>

      {/* Contrôles des couches (optionnel) */}
      {showLayerControls && layers.length > 0 && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          {layers.map((layer) => (
            <Tooltip
              key={layer.id}
              title={`${layer.visible ? "Masquer" : "Afficher"} ${layer.name}`}
            >
              <Chip
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: layer.color,
                      }}
                    />
                    {layer.name} ({layer.events.length})
                  </Box>
                }
                size="small"
                variant={layer.visible ? "filled" : "outlined"}
                onClick={() => onToggleLayer?.(layer.id)}
                onDelete={
                  layer.visible ? undefined : () => onToggleLayer?.(layer.id)
                }
                deleteIcon={
                  layer.visible ? (
                    <VisibilityOff sx={{ fontSize: "0.8rem" }} />
                  ) : (
                    <Visibility sx={{ fontSize: "0.8rem" }} />
                  )
                }
                sx={{
                  "& .MuiChip-label": { fontSize: "0.7rem" },
                  opacity: layer.visible ? 1 : 0.6,
                  cursor: "pointer",
                }}
              />
            </Tooltip>
          ))}
        </Box>
      )}

      {/* Temps actuel */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {formatTime(currentTime)} / {formatTime(duration)}
        </Typography>

        <Tooltip title="Informations sur la timeline">
          <IconButton size="small" sx={{ opacity: 0.7 }}>
            <Info sx={{ fontSize: "1rem" }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

/**
 * Version simplifiée du header sans contrôles de couches
 */
export function SimpleTimelineHeader({
  totalEvents,
  currentTime,
  duration,
}: Pick<TimelineHeaderProps, "totalEvents" | "currentTime" | "duration">) {
  return (
    <TimelineHeader
      totalEvents={totalEvents}
      totalLayers={0}
      currentTime={currentTime}
      duration={duration}
      showLayerControls={false}
    />
  );
}
