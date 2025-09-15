// app/evaluation/components/NewTranscript/components/TimelineZone/index.tsx

import React, {
  useMemo,
  useCallback,
  useState,
  useRef,
  useEffect,
} from "react";
import { Box, Slider, Typography, Tooltip, Paper, Chip } from "@mui/material";
import { TimelineZoneProps, TemporalEvent, TimelineLayer } from "../../types";

// Utilitaires pour la timeline
const timelineUtils = {
  // Convertir temps en position X
  timeToPosition: (time: number, duration: number, width: number) => {
    if (duration <= 0) return 0;
    return Math.max(0, Math.min(width, (time / duration) * width));
  },

  // Convertir position X en temps
  positionToTime: (position: number, width: number, duration: number) => {
    if (width <= 0) return 0;
    return Math.max(0, Math.min(duration, (position / width) * duration));
  },

  // Grouper les événements par couches
  groupEventsByLayer: (events: TemporalEvent[], eventTypes: any[]) => {
    const layers: Record<string, TimelineLayer> = {};

    // Créer une couche par défaut si aucun type configuré
    if (!eventTypes || eventTypes.length === 0) {
      const defaultEvents = events.filter((e) => e.type === "postit");
      if (defaultEvents.length > 0) {
        layers["postit"] = {
          id: "postit",
          name: "Post-its",
          events: defaultEvents,
          height: 24,
          color: "#ff6b6b",
          visible: true,
          interactive: true,
        };
      }
      return Object.values(layers);
    }

    eventTypes.forEach((eventType) => {
      if (!eventType.enabled || !eventType.visible) return;

      const layerEvents = events.filter(
        (event) => event.type === eventType.type
      );

      if (layerEvents.length > 0) {
        layers[eventType.type] = {
          id: eventType.type,
          name:
            eventType.type.charAt(0).toUpperCase() + eventType.type.slice(1),
          events: layerEvents,
          height: eventType.type === "postit" ? 24 : 20,
          color: eventType.color || "#2196f3",
          visible: true,
          interactive: true,
        };
      }
    });

    return Object.values(layers);
  },

  // Calculer hauteur totale de la timeline
  getTotalHeight: (layers: TimelineLayer[], mode: string) => {
    const headerHeight = 40;
    const progressBarHeight = 50;
    const layerHeight = layers.reduce(
      (total, layer) => total + (layer.visible ? layer.height + 8 : 0),
      0
    );

    switch (mode) {
      case "minimal":
        return 40;
      case "compact":
        return headerHeight + progressBarHeight + Math.min(layerHeight, 80);
      case "detailed":
        return headerHeight + progressBarHeight + layerHeight + 20;
      case "expanded":
        return headerHeight + progressBarHeight + layerHeight + 60;
      default:
        return headerHeight + progressBarHeight + layerHeight;
    }
  },

  formatTime: (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  },
};

// Sous-composant pour afficher un événement sur la timeline
interface TimelineEventMarkerProps {
  event: TemporalEvent;
  duration: number;
  width: number;
  height: number;
  color: string;
  onClick: (event: TemporalEvent) => void;
  onHover?: (event: TemporalEvent) => void;
}

const TimelineEventMarker: React.FC<TimelineEventMarkerProps> = ({
  event,
  duration,
  width,
  height,
  color,
  onClick,
  onHover,
}) => {
  const startX = timelineUtils.timeToPosition(event.startTime, duration, width);
  const endX = event.endTime
    ? timelineUtils.timeToPosition(event.endTime, duration, width)
    : startX + 12; // Largeur par défaut pour événements ponctuels

  const eventWidth = Math.max(endX - startX, 8); // Largeur minimale visible

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

  const getEventText = () => {
    return (
      event.data?.text ||
      event.data?.sujet ||
      event.metadata?.category ||
      "Événement"
    );
  };

  return (
    <Tooltip
      title={
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
            {getEventText()}
          </Typography>
          <Typography variant="caption">
            {timelineUtils.formatTime(event.startTime)}
            {event.endTime && ` - ${timelineUtils.formatTime(event.endTime)}`}
          </Typography>
          {event.metadata?.category && (
            <Typography variant="caption" sx={{ display: "block" }}>
              Catégorie: {event.metadata.category}
            </Typography>
          )}
          {event.metadata?.speaker && (
            <Typography variant="caption" sx={{ display: "block" }}>
              {event.metadata.speaker}
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
          left: startX,
          top: 2,
          width: eventWidth,
          height: height - 4,
          backgroundColor: event.metadata?.color || color,
          border: `1px solid ${event.metadata?.color || color}`,
          borderRadius: event.type === "postit" ? "50%" : "4px",
          cursor: "pointer",
          zIndex: 10,
          transition: "all 0.2s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.7rem",
          color: "white",
          fontWeight: "bold",
          textShadow: "0 1px 2px rgba(0,0,0,0.5)",
          "&:hover": {
            transform: "scale(1.1)",
            zIndex: 20,
            boxShadow: 2,
          },
        }}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
      >
        {event.type === "postit" ? "📝" : "🏷️"}
      </Box>
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
        backgroundColor: `${layer.color}15`, // Couleur de fond très légère
        borderRadius: 1,
        marginBottom: 1,
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
          backgroundColor: "rgba(255,255,255,0.9)",
          padding: "1px 4px",
          borderRadius: "2px",
        }}
      >
        {layer.name} ({layer.events.length})
      </Typography>

      {/* Événements */}
      {layer.events.map((event, index) => (
        <TimelineEventMarker
          key={`${event.id}-${index}`}
          event={event}
          duration={duration}
          width={width}
          height={layer.height}
          color={layer.color}
          onClick={onEventClick}
          onHover={onEventHover}
        />
      ))}
    </Box>
  );
};

// Curseur temporel
interface TimelineCursorProps {
  currentTime: number;
  duration: number;
  height: number;
  width: number;
}

const TimelineCursor: React.FC<TimelineCursorProps> = ({
  currentTime,
  duration,
  height,
  width,
}) => {
  const position = timelineUtils.timeToPosition(currentTime, duration, width);

  return (
    <Box
      sx={{
        position: "absolute",
        left: position,
        top: 0,
        width: 3,
        height: height,
        backgroundColor: "error.main",
        zIndex: 30,
        pointerEvents: "none",
        transition: "left 0.1s ease-out",
        boxShadow: "0 0 4px rgba(244, 67, 54, 0.5)",
      }}
    >
      {/* Indicateur en haut */}
      <Box
        sx={{
          position: "absolute",
          top: -6,
          left: -8,
          width: 16,
          height: 16,
          backgroundColor: "error.main",
          borderRadius: "50%",
          border: "2px solid white",
          boxShadow: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.6rem",
          color: "white",
        }}
      >
        ▶
      </Box>
    </Box>
  );
};

// Barre de progression principale avec graduations
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
  height = 50,
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

  // Générer les graduations
  const graduations = useMemo(() => {
    const intervals = Math.min(Math.floor(duration / 30), 10); // Une graduation toutes les 30s, max 10
    const step = duration / (intervals || 1);

    return Array.from({ length: intervals + 1 }, (_, i) => {
      const time = i * step;
      return {
        time,
        position: (time / duration) * 100,
        label: timelineUtils.formatTime(time),
      };
    });
  }, [duration]);

  return (
    <Box
      ref={containerRef}
      sx={{
        height,
        width: "100%",
        position: "relative",
        cursor: "pointer",
        backgroundColor: "action.hover",
        borderRadius: 2,
        display: "flex",
        alignItems: "center",
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
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
          width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
          backgroundColor: "primary.main",
          opacity: 0.3,
          transition: "width 0.1s ease-out",
        }}
      />

      {/* Graduations temporelles */}
      {graduations.map((grad, index) => (
        <Box
          key={index}
          sx={{
            position: "absolute",
            left: `${grad.position}%`,
            top: 0,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
            pointerEvents: "none",
          }}
        >
          {/* Ligne de graduation */}
          <Box
            sx={{
              width: 1,
              height: 8,
              backgroundColor: "text.secondary",
              opacity: 0.5,
            }}
          />

          {/* Label de temps */}
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.7rem",
              color: "text.secondary",
              backgroundColor: "background.paper",
              padding: "1px 4px",
              borderRadius: "2px",
              transform: "translateX(-50%)",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            {grad.label}
          </Typography>

          {/* Ligne de graduation en bas */}
          <Box
            sx={{
              width: 1,
              height: 8,
              backgroundColor: "text.secondary",
              opacity: 0.5,
            }}
          />
        </Box>
      ))}

      {/* Temps actuel affiché au centre */}
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "primary.main",
          color: "primary.contrastText",
          padding: "4px 8px",
          borderRadius: 1,
          fontSize: "0.8rem",
          fontWeight: "bold",
          pointerEvents: "none",
        }}
      >
        {timelineUtils.formatTime(currentTime)} /{" "}
        {timelineUtils.formatTime(duration)}
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

  // Observer les changements de taille
  useEffect(() => {
    const observeResize = () => {
      if (timelineRef.current) {
        setTimelineWidth(timelineRef.current.offsetWidth - 32); // Padding compensation
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
          height: 40,
          padding: "4px 16px",
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
          height={32}
        />
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
          padding: "8px 16px",
          backgroundColor: "action.hover",
          borderBottom: "1px solid",
          borderColor: "divider",
          minHeight: 40,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: "bold", fontSize: "0.9rem" }}
        >
          Timeline
        </Typography>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Chip
            label={`${events.length} événements`}
            size="small"
            color="primary"
            variant="outlined"
          />
          <Typography variant="caption" color="text.secondary">
            {timelineUtils.formatTime(currentTime)} /{" "}
            {timelineUtils.formatTime(duration)}
          </Typography>
        </Box>
      </Box>

      {/* Barre de progression principale */}
      <Box sx={{ padding: "8px 16px" }}>
        <ProgressBar
          currentTime={currentTime}
          duration={duration}
          onTimelineClick={handleTimelineClick}
        />
      </Box>

      {/* Couches d'événements */}
      <Box
        sx={{
          padding: "8px 16px",
          position: "relative",
        }}
      >
        {eventLayers.map((layer) => (
          <TimelineLayerComponent
            key={layer.id}
            layer={layer}
            duration={duration}
            width={timelineWidth}
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
              <Typography variant="body2">
                Aucun événement à afficher
              </Typography>
              <Typography variant="caption">
                Les post-its et annotations apparaîtront ici
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* Curseur temporel global */}
      {duration > 0 && (
        <TimelineCursor
          currentTime={currentTime}
          duration={duration}
          height={totalHeight}
          width={timelineWidth}
        />
      )}

      {/* Info événement survolé */}
      {hoveredEvent && config.timelineMode === "detailed" && (
        <Paper
          sx={{
            position: "absolute",
            bottom: 8,
            right: 16,
            padding: 2,
            backgroundColor: "background.default",
            border: "1px solid",
            borderColor: "divider",
            maxWidth: 250,
            zIndex: 40,
          }}
          elevation={3}
        >
          <Typography
            variant="subtitle2"
            sx={{ fontSize: "0.85rem", fontWeight: "bold" }}
          >
            {hoveredEvent.data?.text || hoveredEvent.data?.sujet || "Événement"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {hoveredEvent.metadata?.category} •{" "}
            {timelineUtils.formatTime(hoveredEvent.startTime)}
          </Typography>
          {hoveredEvent.metadata?.speaker && (
            <Typography
              variant="caption"
              sx={{ display: "block" }}
              color="text.secondary"
            >
              {hoveredEvent.metadata.speaker}
            </Typography>
          )}
        </Paper>
      )}

      {/* Indicateurs de performance (dev) */}
      {process.env.NODE_ENV === "development" && (
        <Box
          sx={{
            position: "absolute",
            top: 2,
            left: 2,
            fontSize: "0.6rem",
            color: "text.disabled",
            backgroundColor: "action.hover",
            padding: "1px 4px",
            borderRadius: "2px",
          }}
        >
          {eventLayers.length}L • {events.length}E • {timelineWidth}px
        </Box>
      )}
    </Paper>
  );
};

// Hook utilitaire pour la timeline (inchangé)
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
