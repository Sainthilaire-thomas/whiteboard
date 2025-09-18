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
    console.log("🔍 groupEventsByLayer - Input:", {
      eventsCount: events.length,
      eventTypesCount: eventTypes?.length || 0,
      events: events.map((e) => ({ type: e.type, id: e.id })),
      eventTypes: eventTypes,
    });

    const layers: Record<string, TimelineLayer> = {};

    // ✅ MODIFICATION: Créer des couches pour TOUS les types d'événements présents
    // même si eventTypes n'est pas configuré
    if (!eventTypes || eventTypes.length === 0) {
      console.log("🔍 No eventTypes configured, creating default layers");

      // Grouper par type d'événement
      const eventsByType = events.reduce(
        (acc, event) => {
          if (!acc[event.type]) acc[event.type] = [];
          acc[event.type].push(event);
          return acc;
        },
        {} as Record<string, TemporalEvent[]>
      );

      Object.entries(eventsByType).forEach(([type, typeEvents]) => {
        layers[type] = {
          id: type,
          name: type.charAt(0).toUpperCase() + type.slice(1) + "s",
          events: typeEvents,
          height: type === "postit" ? 24 : 20,
          color: type === "postit" ? "#ff6b6b" : "#2196f3",
          visible: true,
          interactive: true,
        };
        console.log(
          `🔍 Created default layer for ${type}: ${typeEvents.length} events`
        );
      });

      return Object.values(layers);
    }

    // ✅ MODIFICATION: Traitement amélioré avec eventTypes configurés
    eventTypes.forEach((eventType) => {
      console.log(`🔍 Processing eventType:`, eventType);

      if (!eventType.enabled || !eventType.visible) {
        console.log(
          `🔍 Skipping disabled/invisible eventType: ${eventType.type}`
        );
        return;
      }

      const layerEvents = events.filter(
        (event) => event.type === eventType.type
      );

      console.log(
        `🔍 Found ${layerEvents.length} events for type ${eventType.type}`
      );

      if (layerEvents.length > 0) {
        layers[eventType.type] = {
          id: eventType.type,
          name:
            eventType.type.charAt(0).toUpperCase() +
            eventType.type.slice(1) +
            "s",
          events: layerEvents,
          height: eventType.type === "postit" ? 24 : 20,
          color: eventType.color || "#2196f3",
          visible: true,
          interactive: true,
        };
        console.log(`🔍 Created configured layer for ${eventType.type}`);
      }
    });

    // ✅ AJOUT: Si aucune couche n'a été créée mais qu'il y a des événements,
    // créer des couches par défaut pour tous les types présents
    if (Object.keys(layers).length === 0 && events.length > 0) {
      console.log(
        "🔍 No layers created from config, falling back to auto-detection"
      );

      const eventsByType = events.reduce(
        (acc, event) => {
          if (!acc[event.type]) acc[event.type] = [];
          acc[event.type].push(event);
          return acc;
        },
        {} as Record<string, TemporalEvent[]>
      );

      Object.entries(eventsByType).forEach(([type, typeEvents]) => {
        layers[type] = {
          id: type,
          name: type.charAt(0).toUpperCase() + type.slice(1) + "s",
          events: typeEvents,
          height: 24,
          color:
            type === "tag"
              ? "#2196f3"
              : type === "postit"
                ? "#ff6b6b"
                : "#6b7280",
          visible: true,
          interactive: true,
        };
        console.log(
          `🔍 Auto-created layer for ${type}: ${typeEvents.length} events`
        );
      });
    }

    const result = Object.values(layers);
    console.log("🔍 groupEventsByLayer - Output:", result);
    return result;
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
// --- TimelineEventMarker (remplacement complet)
interface TimelineEventMarkerProps {
  event: TemporalEvent;
  duration: number;
  width: number;
  height: number;
  color: string;
  onClick: (event: TemporalEvent) => void;
  onHover?: (event: TemporalEvent) => void;
  y?: number;
  showLabel?: boolean;
  labelMaxChars?: number;
}

const TimelineEventMarker: React.FC<TimelineEventMarkerProps> = ({
  event,
  duration,
  width,
  height,
  color,
  onClick,
  onHover,
  y = 2,
  showLabel = true,
  labelMaxChars = 18,
}) => {
  const startX = timelineUtils.timeToPosition(event.startTime, duration, width);
  const endX = event.endTime
    ? timelineUtils.timeToPosition(event.endTime, duration, width)
    : startX + 12;

  const eventWidth = Math.max(endX - startX, 14);
  const isPoint = !event.endTime;
  const labelText =
    event.data?.text ||
    event.data?.sujet ||
    event.metadata?.category ||
    "Événement";
  const truncated =
    labelText.length > labelMaxChars
      ? labelText.slice(0, labelMaxChars - 1) + "…"
      : labelText;
  const bg = event.metadata?.color || color;

  return (
    <Tooltip
      title={
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
            {labelText}
          </Typography>
          <Typography variant="caption">
            {timelineUtils.formatTime(event.startTime)}
            {event.endTime && ` - ${timelineUtils.formatTime(event.endTime)}`}
          </Typography>
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
          top: y,
          width: eventWidth,
          height: height - 4,
          cursor: "pointer",
          zIndex: 12,
          transition: "transform .12s ease",
          "&:hover": { transform: "translateY(-1px)", zIndex: 20 },
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick(event);
        }}
        onMouseEnter={() => onHover?.(event)}
      >
        {/* Barre (pleine hauteur) */}
        <Box
          sx={{
            position: "absolute",
            left: isPoint ? eventWidth / 2 - 1 : 0,
            top: 0,
            width: isPoint ? 2 : eventWidth,
            height: "100%",
            backgroundColor: bg,
            opacity: isPoint ? 0.9 : 0.6,
            borderRadius: isPoint ? 1 : 4,
          }}
        />
        {/* Pilule label */}
        {showLabel && eventWidth >= 38 && (
          <Box
            sx={{
              position: "absolute",
              top: 2,
              left: "50%",
              transform: "translateX(-50%)",
              maxWidth: Math.max(38, eventWidth - 6),
              px: 1,
              height: 20,
              lineHeight: "20px",
              fontSize: "0.72rem",
              fontWeight: 700,
              color: "#fff",
              backgroundColor: bg,
              border: `1px solid ${bg}`,
              borderRadius: "999px",
              boxShadow:
                "inset 0 0 0 2px rgba(255,255,255,.18), 0 2px 6px rgba(0,0,0,.35)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {truncated}
          </Box>
        )}
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
  if (!layer.visible || layer.events.length === 0) return null;

  const BASE_H = Math.max(layer.height, 22);
  const ROW_H = Math.min(BASE_H - 4, 20);
  const ROW_GAP = 4;
  const MIN_GAP_PX = 6;
  const POINT_W = 14;

  const { items, rowsCount } = useMemo(() => {
    const sorted = [...layer.events].sort((a, b) => a.startTime - b.startTime);
    const rowLastEnd: number[] = []; // px

    const laidOut = sorted.map((ev) => {
      const sx = timelineUtils.timeToPosition(ev.startTime, duration, width);
      const ex = ev.endTime
        ? timelineUtils.timeToPosition(ev.endTime, duration, width)
        : sx + POINT_W;
      const w = Math.max(ex - sx, 14);

      let row = 0;
      while (row < rowLastEnd.length && sx <= rowLastEnd[row] + MIN_GAP_PX) {
        row++;
      }
      if (row === rowLastEnd.length) rowLastEnd.push(0);
      rowLastEnd[row] = sx + w;

      return { ev, row };
    });

    return { items: laidOut, rowsCount: rowLastEnd.length || 1 };
  }, [layer.events, duration, width]);

  const dynamicHeight = Math.max(BASE_H, 6 + rowsCount * (ROW_H + ROW_GAP));

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: dynamicHeight,
        backgroundColor: `${layer.color}15`,
        borderRadius: 1,
        marginBottom: 8,
        border: `1px solid ${layer.color}30`,
      }}
    >
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

      {items.map(({ ev, row }, i) => (
        <TimelineEventMarker
          key={`${ev.id}-${i}`}
          event={ev}
          duration={duration}
          width={width}
          height={ROW_H + 4}
          color={layer.color}
          onClick={onEventClick}
          onHover={onEventHover}
          y={4 + row * (ROW_H + ROW_GAP)}
          showLabel
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

  // ✅ AJOUT: Debug des événements reçus
  useEffect(() => {
    console.log("🔍 TimelineZone - Events received:", {
      totalEvents: events.length,
      eventTypes: events.map((e) => e.type),
      events: events.map((e) => ({
        id: e.id,
        type: e.type,
        startTime: e.startTime,
        endTime: e.endTime,
        category: e.metadata.category,
        color: e.metadata.color,
      })),
    });
  }, [events]);

  // ✅ AJOUT: Debug de la configuration
  useEffect(() => {
    console.log("🔍 TimelineZone - Config:", {
      timelineMode: config.timelineMode,
      eventTypes: config.eventTypes,
      mode: config.mode,
    });
  }, [config]);

  // Calculer les couches d'événements
  const eventLayers = useMemo(() => {
    console.log("🔍 TimelineZone - Calculating event layers...");
    const layers = timelineUtils.groupEventsByLayer(events, config.eventTypes);

    // 🔁 Fallback inconditionnel si aucune couche n'est revenue alors qu'on a des events
    if ((!layers || layers.length === 0) && events.length > 0) {
      console.warn("⚠️ No layers from config; falling back to auto-grouping.");
      const byType = events.reduce(
        (acc, ev) => {
          (acc[ev.type] ||= []).push(ev);
          return acc;
        },
        {} as Record<string, TemporalEvent[]>
      );

      const autoLayers: TimelineLayer[] = Object.entries(byType).map(
        ([type, evs]) => ({
          id: type,
          name: type.charAt(0).toUpperCase() + type.slice(1) + "s",
          events: evs,
          height: type === "postit" ? 24 : 20,
          color:
            type === "tag"
              ? "#1976d2"
              : type === "postit"
                ? "#ff6b6b"
                : "#6b7280",
          visible: true,
          interactive: true,
        })
      );

      console.log("🔁 Fallback layers:", autoLayers);
      return autoLayers;
    }

    console.log("🔍 TimelineZone - Event layers calculated:", layers);
    return layers;
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
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Chip
            label={`${events.length} événements`}
            size="small"
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`${eventLayers.length} couches`}
            size="small"
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
