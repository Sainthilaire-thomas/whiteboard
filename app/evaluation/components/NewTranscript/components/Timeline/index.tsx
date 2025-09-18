// app/evaluation/components/NewTranscript/components/Timeline/index.tsx
// VERSION REFACTORISÉE - Nettoyée et corrigée

import React, { useRef, useState, useCallback } from "react";
import { Box, Paper } from "@mui/material";
import { TemporalEvent } from "../../types";
import { TimelineProfile, EventTypeConfig } from "./types";
import { getProfile } from "./profiles";
import { useElementWidth } from "./hooks/useResizeObserver"; // ✅ Hook créé
import { useTimelineSync } from "./hooks/useTimelineSync";
import { useImpactAnalysis } from "./hooks/useImpactAnalysis"; // ← NOUVEAU
import { useTaggingData } from "@/context/TaggingDataContext";
// Import des composants refactorisés
import { TimelineHeader } from "./Header/TimelineHeader";
import { ProgressBar } from "./Progress/ProgressBar";
import { TimelineCursor } from "./Progress/TimelineCursor";
import { LayerStack } from "./Layers/LayerStack";
import { TimelineLayer } from "./Layers/TimelineLayer";
import { TagMarker } from "./Layers/markers/TagMarker";
import { PostitMarker } from "./Layers/markers/PostitMarker";
import { EventMarker } from "./Layers/EventMarker";
import { ImpactTimeline } from "./Impact/ImpactTimeline";
import { TranscriptConfig } from "../../types";

interface TimelineZoneProps {
  events: TemporalEvent[];
  currentTime: number;
  duration: number;
  config: {
    timelineMode: string;
    eventTypes?: any[]; // ← Utiliser any[] pour éviter le conflit
    layout?: {
      showControls?: boolean;
    };
  };
  onEventClick: (event: TemporalEvent) => void;
  onTimelineClick: (time: number) => void;
}

/**
 * TimelineZone refactorisée - Version propre
 */
export function TimelineZone({
  events,
  currentTime,
  duration,
  config,
  onEventClick,
  onTimelineClick,
}: TimelineZoneProps) {
  // Refs et state locaux
  const timelineRef = useRef<HTMLDivElement>(null);
  const width = useElementWidth(timelineRef); // ✅ Utilise le vrai hook
  const [hoveredEvent, setHoveredEvent] = useState<TemporalEvent | null>(null);
  const [layerVisibility, setLayerVisibility] = useState<
    Record<string, boolean>
  >({});

  // Profil d'affichage selon le mode
  const profile: TimelineProfile = getProfile(config.timelineMode);

  // Synchronisation avec l'audio
  const syncData = useTimelineSync(events, currentTime);
  const { tags } = useTaggingData();
  // Analyse d'impact si mode impact
  const impactAnalysis = useImpactAnalysis(
    config.timelineMode === "impact" ? events : [],
    tags
  );
  console.log("🎯 TIMELINE ZONE:", {
    mode: config.timelineMode,
    events: events.length,
    tags: tags.length,
    impactPairs: impactAnalysis.adjacentPairs.length,
  });
  // Handlers
  const handleEventClick = useCallback(
    (event: TemporalEvent) => {
      console.log("Timeline event clicked:", event);
      onEventClick(event);
    },
    [onEventClick]
  );

  const handleEventHover = useCallback((event: TemporalEvent) => {
    setHoveredEvent(event);
  }, []);

  const handleTimelineClick = useCallback(
    (time: number) => {
      console.log("Timeline clicked at:", time);
      onTimelineClick(time);
    },
    [onTimelineClick]
  );

  const handleToggleLayer = useCallback((layerId: string) => {
    setLayerVisibility((prev) => ({
      ...prev,
      [layerId]: !prev[layerId],
    }));
  }, []);

  // Factory pour créer le bon type de marker
  const renderEvent = useCallback(
    (event: TemporalEvent, metrics: any) => {
      const commonProps = {
        event,
        metrics,
        onClick: handleEventClick,
        onHover: handleEventHover,
        showLabel: profile.showLabels,
      };

      switch (event.type) {
        case "tag":
          return <TagMarker {...commonProps} />;
        case "postit":
          return <PostitMarker {...commonProps} />;
        default:
          return <EventMarker {...commonProps} />;
      }
    },
    [handleEventClick, handleEventHover, profile.showLabels]
  );

  // Calculer la hauteur totale
  const calculateTotalHeight = useCallback(() => {
    const headerHeight = 40;
    const progressHeight = 50;
    const layerBaseHeight = 60;

    switch (config.timelineMode) {
      case "minimal":
        return 40;
      case "compact":
        return headerHeight + progressHeight + Math.min(layerBaseHeight, 80);
      case "detailed":
        return headerHeight + progressHeight + layerBaseHeight * 2;
      case "expanded":
        return headerHeight + progressHeight + layerBaseHeight * 3;
      case "impact": // ← AJOUTER CETTE LIGNE
        return 180;
      default:
        return headerHeight + progressHeight + layerBaseHeight;
    }
  }, [config.timelineMode]);

  const totalHeight = calculateTotalHeight();

  // Mode impact - rendu spécialisé
  if (config.timelineMode === "impact") {
    return (
      <Paper
        ref={timelineRef}
        sx={{
          height: 180, // Fixe pour le mode impact
          borderBottom: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
          position: "relative",
          overflow: "hidden",
        }}
        elevation={0}
      >
        <ImpactTimeline
          adjacentPairs={impactAnalysis.adjacentPairs}
          metrics={impactAnalysis.metrics}
          width={width - 32}
          duration={duration}
          onEventClick={handleEventClick}
        />

        {/* Curseur temporel global pour mode impact */}
        {duration > 0 && width > 0 && (
          <TimelineCursor
            currentTime={currentTime}
            duration={duration}
            height={180}
            width={width - 32}
          />
        )}

        {/* Zone cliquable pour navigation temporelle */}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 16,
            right: 16,
            height: 20,
            cursor: "pointer",
            zIndex: 5,
          }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const time = (x / (width - 32)) * duration;
            handleTimelineClick(time);
          }}
        />
      </Paper>
    );
  }
  // Mode minimal - juste la barre de progression
  if (config.timelineMode === "minimal") {
    return (
      <Box
        ref={timelineRef}
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

  // Mode caché
  if (config.timelineMode === "hidden") {
    return null;
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
      {/* En-tête */}
      <TimelineHeader
        totalEvents={events.length}
        totalLayers={config.eventTypes?.length || 0}
        currentTime={currentTime}
        duration={duration}
        showLayerControls={config.timelineMode === "expanded"}
        onToggleLayer={handleToggleLayer}
      />

      {/* Barre de progression */}
      <Box sx={{ padding: "8px 16px" }}>
        <ProgressBar
          currentTime={currentTime}
          duration={duration}
          onTimelineClick={handleTimelineClick}
        />
      </Box>

      {/* Couches d'événements */}
      <Box sx={{ padding: "8px 16px", position: "relative" }}>
        <LayerStack events={events} eventTypes={config.eventTypes}>
          {(layer) => (
            <TimelineLayer
              key={layer.id}
              layer={{ ...layer, visible: layerVisibility[layer.id] !== false }}
              width={width - 32}
              duration={duration}
              profile={profile}
              renderEvent={renderEvent}
            />
          )}
        </LayerStack>
      </Box>

      {/* Curseur temporel global */}
      {duration > 0 && width > 0 && (
        <TimelineCursor
          currentTime={currentTime}
          duration={duration}
          height={totalHeight}
          width={width - 32}
        />
      )}

      {/* Zone de debug (développement) */}
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
            zIndex: 50,
          }}
        >
          {events.length}E • {width}px • {profile.maxRows}R •{" "}
          {config.timelineMode}
          {syncData.hasActiveEvents &&
            ` • ${syncData.activeEvents.length} actifs`}
        </Box>
      )}

      {/* Contrôles en bas (si demandés) */}
      {config.layout?.showControls && (
        <Box
          sx={{
            height: 30,
            borderTop: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            fontSize: "0.75rem",
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
          }}
        >
          <Box>
            Mode: {config.timelineMode} • Profile:{" "}
            {profile.dense ? "Dense" : "Normal"}
            {syncData.nextEvent && (
              <span>
                {" "}
                • Suivant: {Math.round(syncData.timeUntilNext || 0)}s
              </span>
            )}
          </Box>
          <Box>
            {Object.entries(
              events.reduce(
                (acc, e) => {
                  acc[e.type] = (acc[e.type] || 0) + 1;
                  return acc;
                },
                {} as Record<string, number>
              )
            ).map(([type, count]) => (
              <span key={type} style={{ marginLeft: 8 }}>
                {type}: {count}
              </span>
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
}

export default TimelineZone;
