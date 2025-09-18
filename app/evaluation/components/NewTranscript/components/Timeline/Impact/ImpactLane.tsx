import React from "react";
import { Box } from "@mui/material";
import { AdjacentPair } from "../hooks/useImpactAnalysis";
import { timeToPosition } from "../utils/time";
import { ConseillerMarker } from "../Layers/markers/ConseillerMarker";
import { ClientMarker } from "../Layers/markers/ClientMarker";

interface ImpactLaneProps {
  level: "positive" | "central" | "negative";
  y: number;
  pairs: AdjacentPair[];
  width: number;
  duration: number;
  onEventClick: (event: any) => void;
  backgroundColor?: string;
  showAllConseillers?: boolean;
  label?: string;
}

export const ImpactLane: React.FC<ImpactLaneProps> = ({
  level,
  y,
  pairs,
  width,
  duration,
  onEventClick,
  backgroundColor = "transparent",
  showAllConseillers = false,
  label,
}) => {
  // Éviter les doublons de conseillers sur la ligne centrale
  const uniqueConseillers = showAllConseillers
    ? pairs.reduce((acc, pair) => {
        if (!acc.some((p) => p.conseiller.id === pair.conseiller.id)) {
          acc.push(pair);
        }
        return acc;
      }, [] as AdjacentPair[])
    : [];

  return (
    <Box
      sx={{
        position: "absolute",
        top: y - 8,
        left: 16,
        width: width - 32,
        height: 16,
        backgroundColor,
        borderRadius: 1,
        border: level !== "central" ? "1px solid rgba(0,0,0,0.05)" : "none",
      }}
    >
      {/* Afficher les événements conseiller (seulement sur ligne centrale) */}
      {(level === "central" || showAllConseillers) &&
        uniqueConseillers.map((pair) => {
          const x = timeToPosition(
            pair.conseiller.startTime,
            duration,
            width - 32
          );
          return (
            <ConseillerMarker
              key={`conseiller-${pair.conseiller.id}`}
              event={pair.conseiller}
              strategy={pair.conseillerStrategy}
              x={x}
              y={8}
              onClick={onEventClick}
            />
          );
        })}

      {/* Afficher les réactions client selon le niveau */}
      {pairs.map((pair) => {
        // Sur ligne centrale, ne montrer que les réactions neutres
        if (level === "central" && pair.clientReaction !== "neutral")
          return null;
        // Sur lignes haut/bas, ne montrer que les réactions correspondantes
        if (level === "positive" && pair.clientReaction !== "positive")
          return null;
        if (level === "negative" && pair.clientReaction !== "negative")
          return null;

        const x = timeToPosition(pair.client.startTime, duration, width - 32);
        return (
          <ClientMarker
            key={`client-${pair.client.id}`}
            event={pair.client}
            reaction={pair.clientReaction}
            x={x}
            y={8}
            onClick={onEventClick}
            isCoherent={pair.isCoherent}
          />
        );
      })}

      {/* Indicateur de nombre d'événements si plus de 0 */}
      {pairs.length > 0 && level !== "central" && (
        <Box
          sx={{
            position: "absolute",
            right: -12,
            top: "50%",
            transform: "translateY(-50%)",
            backgroundColor: level === "positive" ? "#12d9c2" : "#e2330d",
            color: "white",
            borderRadius: "50%",
            width: 16,
            height: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "10px",
            fontWeight: "bold",
          }}
        >
          {pairs.length}
        </Box>
      )}
    </Box>
  );
};
