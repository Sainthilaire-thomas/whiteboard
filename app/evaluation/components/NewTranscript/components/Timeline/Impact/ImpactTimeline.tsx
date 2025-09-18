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
  onEventClick: (event: any) => void;
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

  console.log("📊 IMPACT TIMELINE:", {
    total: adjacentPairs.length,
    positive: positivePairs.length,
    negative: negativePairs.length,
    neutral: neutralPairs.length,
    efficiency: metrics.efficiencyRate,
  });

  return (
    <Box
      sx={{
        position: "relative",
        height: 140,
        backgroundColor: "background.paper",
      }}
    >
      {/* Header avec métriques */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          p: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: "bold", color: "primary.main" }}
        >
          Timeline Impact
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
          </>
        )}
      </Box>

      {/* Zone principale de la timeline */}
      <Box sx={{ position: "relative", height: 100, mt: 1 }}>
        {/* Ligne haute : réactions positives */}
        <ImpactLane
          level="positive"
          y={10}
          pairs={positivePairs}
          width={width}
          duration={duration}
          onEventClick={onEventClick}
          backgroundColor="rgba(18, 217, 194, 0.08)"
          label="Réactions Positives"
        />

        {/* Ligne centrale : conseillers + réactions neutres */}
        <ImpactLane
          level="central"
          y={45}
          pairs={adjacentPairs} // Tous les conseillers + neutres
          width={width}
          duration={duration}
          onEventClick={onEventClick}
          backgroundColor="rgba(108, 117, 125, 0.03)"
          showAllConseillers={true}
          label="Stratégies Conseiller"
        />

        {/* Ligne basse : réactions négatives */}
        <ImpactLane
          level="negative"
          y={80}
          pairs={negativePairs}
          width={width}
          duration={duration}
          onEventClick={onEventClick}
          backgroundColor="rgba(226, 51, 13, 0.08)"
          label="Réactions Négatives"
        />

        {/* Ondes d'impact */}
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 1,
          }}
        >
          {adjacentPairs.map((pair) => (
            <ImpactWave
              key={pair.id}
              pair={pair}
              width={width}
              duration={duration}
            />
          ))}
        </svg>

        {/* Labels des niveaux */}
        <Box
          sx={{
            position: "absolute",
            left: 4,
            top: 0,
            fontSize: "10px",
            color: "text.secondary",
          }}
        >
          <Typography variant="caption" sx={{ display: "block", mb: 3.5 }}>
            + Client
          </Typography>
          <Typography variant="caption" sx={{ display: "block", mb: 3.5 }}>
            ≈ Conseil
          </Typography>
          <Typography variant="caption" sx={{ display: "block" }}>
            - Client
          </Typography>
        </Box>
      </Box>

      {/* Message si pas de données */}
      {adjacentPairs.length === 0 && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            color: "text.secondary",
          }}
        >
          <Typography variant="body2">
            Aucune interaction conseiller → client détectée
          </Typography>
          <Typography variant="caption">
            Vérifiez que les tags sont correctement assignés
          </Typography>
        </Box>
      )}
    </Box>
  );
};
