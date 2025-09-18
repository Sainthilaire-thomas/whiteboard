import React from "react";
import { Box, Typography, Chip } from "@mui/material";
import { AdjacentPair, ImpactMetrics } from "../hooks/useImpactAnalysis";
import { ImpactLane } from "./ImpactLane";
import { ImpactWave } from "./ImpactWave";

interface ImpactTimelineProps {
  adjacentPairs: AdjacentPair[];
  metrics: ImpactMetrics;
  width: number;
  duration: number;
  onEventClick: (turn: any) => void;
}

export const ImpactTimeline: React.FC<ImpactTimelineProps> = ({
  adjacentPairs,
  metrics,
  width,
  duration,
  onEventClick,
}) => {
  // Séparer les paires par type de réaction client
  const positivePairs = adjacentPairs.filter(
    (p) => p.clientReaction === "positive"
  );
  const negativePairs = adjacentPairs.filter(
    (p) => p.clientReaction === "negative"
  );
  const neutralPairs = adjacentPairs.filter(
    (p) => p.clientReaction === "neutral"
  );

  console.log("📊 IMPACT TIMELINE (BARS):", {
    total: adjacentPairs.length,
    positive: positivePairs.length,
    negative: negativePairs.length,
    neutral: neutralPairs.length,
    efficiency: metrics.efficiencyRate,
    avgGap: metrics.avgTimeDelta.toFixed(1) + "s",
  });

  return (
    <Box
      sx={{
        position: "relative",
        height: 180, // Hauteur fixe pour le mode impact avec barres
        backgroundColor: "background.paper",
      }}
    >
      {/* Header avec métriques améliorées */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          p: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
          flexWrap: "wrap",
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: "bold", color: "primary.main" }}
        >
          🎯 Timeline Impact
        </Typography>

        <Chip
          label={`${metrics.efficiencyRate}% efficace`}
          color={
            metrics.efficiencyRate > 70
              ? "success"
              : metrics.efficiencyRate > 50
                ? "warning"
                : "error"
          }
          size="small"
          sx={{ fontWeight: "bold" }}
        />

        <Chip
          label={`${metrics.totalPairs} interactions`}
          variant="outlined"
          size="small"
        />

        {metrics.totalPairs > 0 && (
          <>
            <Chip
              label={`✅ ${positivePairs.length}`}
              size="small"
              sx={{
                backgroundColor: "rgba(18, 217, 194, 0.2)",
                color: "#12d9c2",
                fontWeight: "bold",
              }}
            />
            <Chip
              label={`❌ ${negativePairs.length}`}
              size="small"
              sx={{
                backgroundColor: "rgba(226, 51, 13, 0.2)",
                color: "#e2330d",
                fontWeight: "bold",
              }}
            />

            {/* Nouveau : temps moyen entre interactions */}
            <Chip
              label={`⏱️ ${metrics.avgTimeDelta.toFixed(1)}s moy.`}
              variant="outlined"
              size="small"
              sx={{
                fontSize: "0.7rem",
                color: "text.secondary",
              }}
            />
          </>
        )}
      </Box>

      {/* Zone principale de la timeline - Hauteur ajustée pour barres */}
      <Box sx={{ position: "relative", height: 140, mt: 1 }}>
        {/* Ligne haute : réactions positives */}
        <ImpactLane
          level="positive"
          y={25} // Ajusté pour barres plus hautes
          pairs={positivePairs}
          width={width}
          duration={duration}
          onEventClick={onEventClick}
          backgroundColor="rgba(18, 217, 194, 0.08)"
          label="✅ Positives"
        />

        {/* Ligne centrale : conseillers + réactions neutres */}
        <ImpactLane
          level="central"
          y={70} // Position centrale ajustée
          pairs={adjacentPairs} // Tous les conseillers + neutres
          width={width}
          duration={duration}
          onEventClick={onEventClick}
          backgroundColor="rgba(108, 117, 125, 0.03)"
          showAllConseillers={true}
          label="📊 Stratégies"
        />

        {/* Ligne basse : réactions négatives */}
        <ImpactLane
          level="negative"
          y={115} // Ajusté pour barres plus hautes
          pairs={negativePairs}
          width={width}
          duration={duration}
          onEventClick={onEventClick}
          backgroundColor="rgba(226, 51, 13, 0.08)"
          label="❌ Négatives"
        />

        {/* Ondes d'impact - Z-index ajusté */}
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 16, // Aligné avec les lanes
            width: width - 32,
            height: "100%",
            pointerEvents: "none",
            zIndex: 5, // Sous les barres mais visible
          }}
        >
          {adjacentPairs.map((pair) => (
            <ImpactWave
              key={pair.id}
              pair={pair}
              width={width - 32}
              duration={duration}
            />
          ))}
        </svg>

        {/* Légende améliorée avec icônes */}
        <Box
          sx={{
            position: "absolute",
            left: 2,
            top: 10,
            fontSize: "9px",
            color: "text.secondary",
            backgroundColor: "rgba(255,255,255,0.9)",
            padding: "4px 6px",
            borderRadius: "4px",
            border: "1px solid rgba(0,0,0,0.1)",
          }}
        >
          <Typography
            variant="caption"
            sx={{ display: "block", fontSize: "9px", mb: 0.5 }}
          >
            😊 Client +
          </Typography>
          <Typography
            variant="caption"
            sx={{ display: "block", fontSize: "9px", mb: 0.5 }}
          >
            🎯 Conseiller
          </Typography>
          <Typography
            variant="caption"
            sx={{ display: "block", fontSize: "9px" }}
          >
            😞 Client -
          </Typography>
        </Box>

        {/* Indicateur de performance globale */}
        {metrics.totalPairs > 0 && (
          <Box
            sx={{
              position: "absolute",
              right: 2,
              top: 10,
              textAlign: "right",
              fontSize: "8px",
              color: "text.secondary",
              backgroundColor: "rgba(255,255,255,0.9)",
              padding: "4px 6px",
              borderRadius: "4px",
              border: "1px solid rgba(0,0,0,0.1)",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                display: "block",
                fontSize: "10px",
                fontWeight: "bold",
                color:
                  metrics.efficiencyRate > 70
                    ? "#28a745"
                    : metrics.efficiencyRate > 50
                      ? "#ffc107"
                      : "#dc3545",
              }}
            >
              {metrics.efficiencyRate}%
            </Typography>
            <Typography
              variant="caption"
              sx={{ display: "block", fontSize: "8px" }}
            >
              efficacité
            </Typography>
          </Box>
        )}
      </Box>

      {/* Message si pas de données - Version améliorée */}
      {adjacentPairs.length === 0 && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            color: "text.secondary",
            backgroundColor: "rgba(255,255,255,0.9)",
            padding: "20px",
            borderRadius: "8px",
            border: "2px dashed rgba(0,0,0,0.1)",
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
            📭 Aucune interaction conseiller → client détectée
          </Typography>
          <Typography variant="caption">
            Vérifiez que les tours de parole sont correctement taggés
          </Typography>
          <Typography
            variant="caption"
            sx={{ display: "block", mt: 0.5, fontStyle: "italic" }}
          >
            Les barres temporelles montreront la durée réelle des interventions
          </Typography>
        </Box>
      )}
    </Box>
  );
};
