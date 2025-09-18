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
  // ✅ MODIFICATION PRINCIPALE : Utiliser end_time pour le point de départ
  const conseillerEndX = timeToPosition(
    pair.conseiller.end_time, // ← Changement ici
    duration,
    width
  );

  // ✅ Utiliser start_time pour le point d'arrivée
  const clientStartX = timeToPosition(
    pair.client.start_time, // ← Déjà correct
    duration,
    width
  );

  // Déterminer Y de destination selon réaction client
  const sourceY = 45 + 15; // Ligne centrale + offset (ajusté pour barres)
  const targetY =
    pair.clientReaction === "positive"
      ? 15 + 15 // Ligne haute + offset
      : pair.clientReaction === "negative"
        ? 75 + 15 // Ligne basse + offset
        : 45 + 15; // Reste sur ligne centrale si neutre

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

  // Opacité et style selon cohérence
  const opacity = pair.isCoherent ? 0.8 : 0.5;
  const strokeDasharray = pair.isCoherent ? "none" : "4,3";
  const strokeWidth = pair.isCoherent ? "2" : "1.5";

  // Ne pas dessiner de courbe si même position Y (réaction neutre)
  if (sourceY === targetY) {
    return null;
  }

  // Ne pas dessiner si les positions X sont trop proches
  if (Math.abs(clientStartX - conseillerEndX) < 10) {
    return null;
  }

  // Calculer la courbe de Bézier
  const midX = (conseillerEndX + clientStartX) / 2;
  const controlY =
    sourceY + (targetY - sourceY) * 0.5 + (targetY > sourceY ? -20 : 20);

  // Calculer la largeur du gap pour afficher ou non le temps
  const gapWidth = Math.abs(clientStartX - conseillerEndX);
  const showTimeDelta = pair.timeDelta > 2 && gapWidth > 40; // Plus restrictif

  return (
    <g>
      {/* Courbe principale */}
      <path
        d={`M ${conseillerEndX} ${sourceY} Q ${midX} ${controlY} ${clientStartX} ${targetY}`}
        stroke={getWaveColor()}
        strokeWidth={strokeWidth}
        fill="none"
        opacity={opacity}
        strokeDasharray={strokeDasharray}
        style={{
          filter: pair.isCoherent
            ? "drop-shadow(0 1px 3px rgba(0,0,0,0.15))"
            : "none",
        }}
      />

      {/* Flèche à la fin pour indiquer la direction */}
      <polygon
        points={`${clientStartX - 3},${targetY - 3} ${clientStartX + 3},${targetY - 3} ${clientStartX},${targetY + 3}`}
        fill={getWaveColor()}
        opacity={opacity}
      />

      {/* Point de départ (fin du tour conseiller) */}
      <circle
        cx={conseillerEndX}
        cy={sourceY}
        r="2"
        fill={getWaveColor()}
        opacity={opacity + 0.2}
      />

      {/* Indicateur de temps delta si assez de place */}
      {showTimeDelta && (
        <>
          {/* Fond pour le texte */}
          <rect
            x={midX - 15}
            y={controlY - 8}
            width="30"
            height="16"
            fill="rgba(255,255,255,0.9)"
            stroke={getWaveColor()}
            strokeWidth="1"
            rx="8"
            opacity={0.9}
          />

          {/* Texte du gap temporel */}
          <text
            x={midX}
            y={controlY + 1}
            fontSize="10"
            fill={getWaveColor()}
            textAnchor="middle"
            fontWeight="bold"
            opacity={0.9}
            style={{ pointerEvents: "none" }}
          >
            {pair.timeDelta < 1
              ? `${Math.round(pair.timeDelta * 10) / 10}s`
              : `${Math.round(pair.timeDelta)}s`}
          </text>
        </>
      )}

      {/* Indicateur de cohérence au centre de la courbe */}
      {gapWidth > 30 && (
        <circle
          cx={midX}
          cy={sourceY + (targetY - sourceY) * 0.3}
          r="4"
          fill={pair.isCoherent ? "#28a745" : "#ffc107"}
          stroke="white"
          strokeWidth="1"
          opacity={0.8}
        >
          {/* Animation pulse si incohérent */}
          {!pair.isCoherent && (
            <animate
              attributeName="opacity"
              values="0.4;0.8;0.4"
              dur="2s"
              repeatCount="indefinite"
            />
          )}
        </circle>
      )}
    </g>
  );
};
