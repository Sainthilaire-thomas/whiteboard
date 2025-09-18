import React from "react";
import { AdjacentPair } from "../hooks/useImpactAnalysis";
import { timeToPosition } from "../utils/time";

interface ImpactWaveProps {
  pair: AdjacentPair;
  width: number;
  duration: number;
}

export const ImpactWave: React.FC<ImpactWaveProps> = ({
  pair,
  width,
  duration,
}) => {
  const conseillerX = timeToPosition(
    pair.conseiller.startTime,
    duration,
    width
  );
  const clientX = timeToPosition(pair.client.startTime, duration, width);

  // Déterminer Y de destination selon réaction client
  const sourceY = 45 + 8; // Ligne centrale + offset
  const targetY =
    pair.clientReaction === "positive"
      ? 10 + 8 // Ligne haute + offset
      : pair.clientReaction === "negative"
        ? 80 + 8 // Ligne basse + offset
        : 45 + 8; // Reste sur ligne centrale si neutre

  // Couleur selon stratégie conseiller
  const getWaveColor = () => {
    switch (pair.conseillerStrategy) {
      case "positive":
        return "#28a745";
      case "negative":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  // Opacité selon cohérence
  const opacity = pair.isCoherent ? 0.8 : 0.4;

  // Style de ligne (solide si cohérent, pointillé si incohérent)
  const strokeDasharray = pair.isCoherent ? "none" : "3,2";

  // Ne pas dessiner de courbe si même position Y (réaction neutre)
  if (sourceY === targetY) {
    return null;
  }

  // Calculer la courbe de Bézier
  const midX = (conseillerX + clientX) / 2;
  const controlY =
    sourceY + (targetY - sourceY) * 0.5 + (targetY > sourceY ? -15 : 15);

  return (
    <>
      {/* Courbe principale */}
      <path
        d={`M ${conseillerX} ${sourceY} Q ${midX} ${controlY} ${clientX} ${targetY}`}
        stroke={getWaveColor()}
        strokeWidth="1.5"
        fill="none"
        opacity={opacity}
        strokeDasharray={strokeDasharray}
        style={{
          filter: pair.isCoherent
            ? "drop-shadow(0 1px 2px rgba(0,0,0,0.1))"
            : "none",
        }}
      />

      {/* Flèche à la fin pour indiquer la direction */}
      <polygon
        points={`${clientX - 2},${targetY - 2} ${clientX + 2},${targetY - 2} ${clientX},${targetY + 2}`}
        fill={getWaveColor()}
        opacity={opacity}
      />

      {/* Indicateur de temps delta si assez de place */}
      {pair.timeDelta > 5 && Math.abs(clientX - conseillerX) > 30 && (
        <text
          x={midX}
          y={controlY - 5}
          fontSize="9"
          fill={getWaveColor()}
          textAnchor="middle"
          opacity={0.7}
          style={{ pointerEvents: "none" }}
        >
          {Math.round(pair.timeDelta)}s
        </text>
      )}
    </>
  );
};
