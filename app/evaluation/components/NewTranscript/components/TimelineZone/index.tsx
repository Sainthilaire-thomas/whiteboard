// app/evaluation/components/NewTranscript/components/TimelineZone/index.tsx

import React, {
  useMemo,
  useCallback,
  useState,
  useRef,
  useEffect,
} from "react";
import { Box, Slider, Typography, Tooltip, Paper } from "@mui/material";
import { TimelineZoneProps, TemporalEvent, TimelineLayer } from "../../types";

// Utilitaires pour la timeline
const timelineUtils = {
  // Convertir temps en position X
  timeToPosition: (time: number, duration: number, width: number) => {
    return (time / duration) * width;
  },

  // Convertir position X en temps
  positionToTime: (position: number, width: number, duration: number) => {
    return (position / width) * duration;
  },

  // Grouper les événements par couches
  groupEventsByLayer: (events: TemporalEvent[], eventTypes: any[]) => {
    const layers: Record<string, TimelineLayer> = {};

    eventTypes.forEach((eventType) => {
      if (!eventType.enabled || !eventType.visible) return;

      const layerEvents = events.filter(
        (event) => event.type === eventType.type
      );

      layers[eventType.type] = {
        id: eventType.type,
        name: eventType.type.charAt(0).toUpperCase() + eventType.type.slice(1),
        events: layerEvents,
        height: eventType.type === "postit" ? 20 : 15,
        color: eventType.color || "#2196f3",
        visible: true,
        interactive: true,
      };
    });

    return Object.values(layers);
  },

  // Calculer hauteur totale de la timeline
  getTotalHeight: (layers: TimelineLayer[], mode: string) => {
    const baseHeight = 40; // Pour la barre de progression
    const layerHeight = layers.reduce(
      (total, layer) => total + (layer.visible ? layer.height + 4 : 0),
      0
    );

    switch (mode) {
      case "minimal":
        return 30;
      case "compact":
        return baseHeight + Math.min(layerHeight, 60);
      case "detailed":
        return baseHeight + layerHeight;
      case "expanded":
        return baseHeight + layerHeight + 40; // Plus d'espace
      default:
        return baseHeight + layerHeight;
    }
  },
};

// Sous-composant pour afficher un événement sur la timeline
interface TimelineEventMarkerProps {
  event: TemporalEvent;
  duration: number;
  width: number;
  height: number;
  color: string;
  shape: "rectangle" | "circle" | "diamond";
  onClick: (event: TemporalEvent) => void;
  onHover?: (event: TemporalEvent) => void;
}

const TimelineEventMarker: React.FC<TimelineEventMarkerProps> = ({
  event,
  duration,
  width,
  height,
  color,
  shape,
  onClick,
  onHover,
}) => {
  const startX = timelineUtils.timeToPosition(event.startTime, duration, width);
  const endX = event.endTime
    ? timelineUtils.timeToPosition(event.endTime, duration, width)
    : startX + 8; // Largeur par défaut pour événements ponctuels

  const eventWidth = Math.max(endX - startX, 4); // Largeur minimale

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onClick(event);
    },
    [event, onClick]
  );

  const handleMouseEnter = useCallback(() => {
    onHover?.(event);
  }, [event, onHover]);

  const getEventStyle = () => {
    const baseStyle = {
      position: "absolute" as const,
      left: startX,
      width: eventWidth,
      height: height - 2,
      backgroundColor: event.metadata.color || color,
      cursor: "pointer",
      zIndex: 10,
      transition: "transform 0.2s ease",
    };

    switch (shape) {
      case "circle":
        return {
          ...baseStyle,
          borderRadius: "50%",
          width: Math.max(height - 2, 8),
          height: height - 2,
        };
      case "diamond":
        return {
          ...baseStyle,
          clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
          width: Math.max(height - 2, 8),
          height: height - 2,
        };
      case "rectangle":
      default:
        return {
          ...baseStyle,
          borderRadius: 2,
        };
    }
  };

  return (
    <Tooltip
      title={
        <Box>
          <Typography variant="subtitle2">
            {event.data.text || event.data.tag || "Événement"}
          </Typography>
          <Typography variant="caption">
            {new Date(event.startTime * 1000).toLocaleTimeString()}
            {event.endTime &&
              ` - ${new Date(event.endTime * 1000).toLocaleTimeString()}`}
          </Typography>
          {event.metadata.category && (
            <Typography variant="caption" sx={{ display: "block" }}>
              {event.metadata.category}
            </Typography>
          )}
        </Box>
      }
      arrow
      placement="top"
    >
      <Box
        sx={{
          ...getEventStyle(),
          "&:hover": {
            transform: "scale(1.1)",
            zIndex: 20,
            boxShadow: 2,
          },
        }}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
      />
    </Tooltip>
  );
};

// Sous-composant pour une couche d'événements
interface TimelineLayerComponentProps {
  layer: TimelineLayer;
  duration: number;
  width: number;
  onEventClick: (event: TemporalEvent) => void;
  onEventHover?: (event: TemporalEvent) => void;
}

const TimelineLayerComponent: React.FC<TimelineLayerComponentProps> = ({
  layer,
  duration,
  width,
  onEventClick,
  onEventHover,
}) => {
  if (!layer.visible || layer.events.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: layer.height,
        backgroundColor: layer.color + "15", // Couleur de fond très légère
        borderRadius: 1,
        marginBottom: 0.5,
      }}
    >
      {/* Label de la couche */}
      <Typography
        variant="caption"
        sx={{
          position: "absolute",
          left: 4,
          top: 2,
          fontSize: "0.7rem",
          color: "text.secondary",
          zIndex: 5,
        }}
      >
        {layer.name} ({layer.events.length})
      </Typography>

      {/* Événements */}
      {layer.events.map((event) => (
        <TimelineEventMarker
          key={event.id}
          event={event}
          duration={duration}
          width={width}
          height={layer.height}
          color={layer.color}
          shape={event.type === "postit" ? "circle" : "rectangle"}
          onClick={onEventClick}
          onHover={onEventHover}
        />
      ))}
    </Box>
  );
};

// Curseur temporel
interface TimelineCursorProps {
  position: number; // Position en %
  visible: boolean;
  height: number;
}

const TimelineCursor: React.FC<TimelineCursorProps> = ({
  position,
  visible,
  height,
}) => {
  if (!visible) return null;

  return (
    <Box
      sx={{
        position: "absolute",
        left: `${position}%`,
        top: 0,
        width: 2,
        height: height,
        backgroundColor: "error.main",
        zIndex: 30,
        pointerEvents: "none",
        transition: "left 0.1s ease-out",
      }}
    >
      {/* Indicateur en haut */}
      <Box
        sx={{
          position: "absolute",
          top: -8,
          left: -6,
          width: 14,
          height: 14,
          backgroundColor: "error.main",
          borderRadius: "50%",
          border: "2px solid white",
          boxShadow: 1,
        }}
      />
    </Box>
  );
};

// Barre de progression principale
interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onTimelineClick: (time: number) => void;
  height?: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  currentTime,
  duration,
  onTimelineClick,
  height = 40,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickTime = timelineUtils.positionToTime(
        clickX,
        rect.width,
        duration
      );

      onTimelineClick(Math.max(0, Math.min(clickTime, duration)));
    },
    [duration, onTimelineClick]
  );

  return (
    <Box
      ref={containerRef}
      sx={{
        height,
        width: "100%",
        position: "relative",
        cursor: "pointer",
        backgroundColor: "action.hover",
        borderRadius: 1,
        display: "flex",
        alignItems: "center",
        padding: "0 8px",
      }}
      onClick={handleClick}
    >
      {/* Barre de progression */}
      <Box
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          height: "100%",
          width: `${(currentTime / duration) * 100}%`,
          backgroundColor: "primary.main",
          borderRadius: 1,
          opacity: 0.3,
        }}
      />

      {/* Graduations temporelles */}
      <Box
        sx={{
          position: "absolute",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          padding: "0 8px",
          pointerEvents: "none",
        }}
      >
        {Array.from({ length: 6 }, (_, i) => {
          const time = (duration / 5) * i;
          const minutes = Math.floor(time / 60);
          const seconds = Math.floor(time % 60);
          return (
            <Typography
              key={i}
              variant="caption"
              sx={{
                fontSize: "0.7rem",
                color: "text.secondary",
                backgroundColor: "background.paper",
                padding: "1px 4px",
                borderRadius: "2px",
              }}
            >
              {minutes}:{seconds.toString().padStart(2, "0")}
            </Typography>
          );
        })}
      </Box>
    </Box>
  );
};

// Composant principal TimelineZone
export const TimelineZone: React.FC<TimelineZoneProps> = ({
  events,
  currentTime,
  duration,
  config,
  onEventClick,
  onTimelineClick,
}) => {
  const [hoveredEvent, setHoveredEvent] = useState<TemporalEvent | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [timelineWidth, setTimelineWidth] = useState(800);

  // Calculer les couches d'événements
  const eventLayers = useMemo(() => {
    return timelineUtils.groupEventsByLayer(events, config.eventTypes);
  }, [events, config.eventTypes]);

  // Calculer la hauteur totale
  const totalHeight = useMemo(() => {
    return timelineUtils.getTotalHeight(eventLayers, config.timelineMode);
  }, [eventLayers, config.timelineMode]);

  // Calculer la position du curseur
  const cursorPosition = useMemo(() => {
    return duration > 0 ? (currentTime / duration) * 100 : 0;
  }, [currentTime, duration]);

  // Observer les changements de taille
  useEffect(() => {
    const observeResize = () => {
      if (timelineRef.current) {
        setTimelineWidth(timelineRef.current.offsetWidth);
      }
    };

    observeResize();
    window.addEventListener("resize", observeResize);
    return () => window.removeEventListener("resize", observeResize);
  }, []);

  // Handler pour les clics sur les événements
  const handleEventClick = useCallback(
    (event: TemporalEvent) => {
      console.log("📍 Timeline event clicked:", event);
      onEventClick(event);
    },
    [onEventClick]
  );

  // Handler pour le hover des événements
  const handleEventHover = useCallback((event: TemporalEvent) => {
    setHoveredEvent(event);
  }, []);

  // Handler pour les clics sur la timeline
  const handleTimelineClick = useCallback(
    (time: number) => {
      console.log("⏰ Timeline clicked at:", time);
      onTimelineClick(time);
    },
    [onTimelineClick]
  );

  // Ne pas afficher si mode hidden
  if (config.timelineMode === "hidden") {
    return null;
  }

  // Mode minimal - juste la barre de progression
  if (config.timelineMode === "minimal") {
    return (
      <Box
        sx={{
          height: 30,
          padding: "4px 8px",
          borderBottom: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
          position: "relative",
        }}
      >
        <ProgressBar
          currentTime={currentTime}
          duration={duration}
          onTimelineClick={handleTimelineClick}
          height={22}
        />
        <TimelineCursor position={cursorPosition} visible={true} height={22} />
      </Box>
    );
  }

  return (
    <Paper
      ref={timelineRef}
      sx={{
        height: totalHeight,
        borderBottom: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
        position: "relative",
        overflow: "hidden",
      }}
      elevation={0}
    >
      {/* En-tête avec info */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "4px 12px",
          backgroundColor: "action.hover",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: "bold" }}>
          Timeline ({events.length} événements)
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Typography variant="caption" color="text.secondary">
            {new Date(currentTime * 1000).toLocaleTimeString()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            / {new Date(duration * 1000).toLocaleTimeString()}
          </Typography>
        </Box>
      </Box>

      {/* Barre de progression principale */}
      <Box sx={{ padding: "8px", paddingBottom: 0 }}>
        <ProgressBar
          currentTime={currentTime}
          duration={duration}
          onTimelineClick={handleTimelineClick}
        />
      </Box>

      {/* Couches d'événements */}
      <Box
        sx={{
          padding: "8px",
          paddingTop: "4px",
          position: "relative",
        }}
      >
        {eventLayers.map((layer) => (
          <TimelineLayerComponent
            key={layer.id}
            layer={layer}
            duration={duration}
            width={timelineWidth - 16} // Padding compensation
            onEventClick={handleEventClick}
            onEventHover={handleEventHover}
          />
        ))}

        {/* Message si aucun événement */}
        {eventLayers.length === 0 && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 40,
              color: "text.secondary",
              fontStyle: "italic",
            }}
          >
            Aucun événement à afficher
          </Box>
        )}
      </Box>

      {/* Curseur temporel global */}
      <TimelineCursor
        position={cursorPosition}
        visible={duration > 0}
        height={totalHeight}
      />

      {/* Info événement survolé */}
      {hoveredEvent && config.timelineMode === "detailed" && (
        <Paper
          sx={{
            position: "absolute",
            bottom: 8,
            right: 8,
            padding: 1,
            backgroundColor: "background.default",
            border: "1px solid",
            borderColor: "background.paper",
            maxWidth: 200,
            zIndex: 40,
          }}
          elevation={3}
        >
          <Typography variant="subtitle2" sx={{ fontSize: "0.8rem" }}>
            {hoveredEvent.data.text || hoveredEvent.data.tag || "Événement"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {hoveredEvent.metadata.category} • {hoveredEvent.metadata.speaker}
          </Typography>
          <Typography
            variant="caption"
            sx={{ display: "block" }}
            color="text.secondary"
          >
            {new Date(hoveredEvent.startTime * 1000).toLocaleTimeString()}
          </Typography>
        </Paper>
      )}

      {/* Indicateurs de performance (dev) */}
      {process.env.NODE_ENV === "development" && (
        <Box
          sx={{
            position: "absolute",
            top: 2,
            right: 2,
            fontSize: "0.6rem",
            color: "text.disabled",
            backgroundColor: "action.hover",
            padding: "1px 4px",
            borderRadius: "2px",
          }}
        >
          {eventLayers.length}L • {events.length}E • {Math.round(timelineWidth)}
          px
        </Box>
      )}
    </Paper>
  );
};

// Hook utilitaire pour la timeline
export const useTimelineSync = (
  currentTime: number,
  events: TemporalEvent[]
) => {
  // Trouver les événements actifs au temps actuel
  const activeEvents = useMemo(() => {
    return events.filter((event) => {
      const endTime = event.endTime || event.startTime + 1;
      return event.startTime <= currentTime && endTime >= currentTime;
    });
  }, [currentTime, events]);

  // Trouver le prochain événement
  const nextEvent = useMemo(() => {
    const futureEvents = events.filter(
      (event) => event.startTime > currentTime
    );
    return futureEvents.length > 0
      ? futureEvents.reduce((closest, event) =>
          event.startTime < closest.startTime ? event : closest
        )
      : null;
  }, [currentTime, events]);

  // Trouver l'événement précédent
  const previousEvent = useMemo(() => {
    const pastEvents = events.filter((event) => event.startTime < currentTime);
    return pastEvents.length > 0
      ? pastEvents.reduce((latest, event) =>
          event.startTime > latest.startTime ? event : latest
        )
      : null;
  }, [currentTime, events]);

  return {
    activeEvents,
    nextEvent,
    previousEvent,
    hasActiveEvents: activeEvents.length > 0,
    timeUntilNext: nextEvent ? nextEvent.startTime - currentTime : null,
    timeSincePrevious: previousEvent
      ? currentTime - previousEvent.startTime
      : null,
  };
};

export default TimelineZone;
