import React from "react";
import { Box } from "@mui/material";
import { AdjacentPair } from "../hooks/useImpactAnalysis";
import { calculateTurnMetrics } from "../utils/turnMetrics";
import { TurnBarMarker } from "../Impact/TurnBarMarker";

interface ImpactLaneProps {
  level: "positive" | "central" | "negative";
  y: number;
  pairs: AdjacentPair[];
  width: number;
  duration: number;
  onEventClick: (turn: any) => void;
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
  // Hauteur des barres selon le niveau
  const barHeight = 30; // Augmenté pour les barres temporelles

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
        top: y - barHeight / 2,
        left: 16,
        width: width - 32,
        height: barHeight,
        backgroundColor,
        borderRadius: 1,
        border: level !== "central" ? "1px solid rgba(0,0,0,0.05)" : "none",
      }}
    >
      {/* Afficher les tours conseiller (seulement sur ligne centrale) */}
      {(level === "central" || showAllConseillers) &&
        uniqueConseillers.map((pair) => {
          const metrics = calculateTurnMetrics(
            pair.conseiller,
            duration,
            width - 32
          );

          return (
            <TurnBarMarker
              key={`conseiller-${pair.conseiller.id}`}
              turn={pair.conseiller}
              strategy={pair.conseillerStrategy}
              x={metrics.x}
              width={metrics.width}
              y={barHeight / 2 - 13} // Centrer verticalement
              height={26}
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

        const metrics = calculateTurnMetrics(pair.client, duration, width - 32);

        return (
          <TurnBarMarker
            key={`client-${pair.client.id}`}
            turn={pair.client}
            reaction={pair.clientReaction}
            x={metrics.x}
            width={metrics.width}
            y={barHeight / 2 - 13} // Centrer verticalement
            height={26}
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
            width: 20, // Légèrement plus grand
            height: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "11px",
            fontWeight: "bold",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
        >
          {pairs.length}
        </Box>
      )}

      {/* Label du niveau (optionnel) */}
      {label && (
        <Box
          sx={{
            position: "absolute",
            left: -60,
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: "10px",
            color: "text.secondary",
            fontWeight: "bold",
            writingMode: "vertical-rl",
            textOrientation: "mixed",
          }}
        >
          {label}
        </Box>
      )}
    </Box>
  );
};
