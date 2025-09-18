import React from "react";
import { Box, Tooltip, Typography } from "@mui/material";
import { TemporalEvent } from "../../../../types";
import { formatTime } from "../../utils/time";

interface ConseillerMarkerProps {
  event: TemporalEvent;
  strategy: "positive" | "negative" | "neutral";
  x: number;
  y: number;
  onClick: (event: TemporalEvent) => void;
}

export const ConseillerMarker: React.FC<ConseillerMarkerProps> = ({
  event,
  strategy,
  x,
  y,
  onClick,
}) => {
  const getMarkerStyle = () => {
    const baseStyle = {
      position: "absolute" as const,
      left: x - 6,
      top: y - 6,
      width: 12,
      height: 12,
      cursor: "pointer",
      transition: "all 0.2s ease",
      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      zIndex: 10,
    };

    switch (strategy) {
      case "positive":
        return {
          ...baseStyle,
          backgroundColor: "#28a745",
          clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)", // Triangle vers haut
          "&:hover": {
            transform: "scale(1.4) translateY(-1px)",
            boxShadow: "0 3px 8px rgba(40, 167, 69, 0.4)",
          },
        };
      case "negative":
        return {
          ...baseStyle,
          backgroundColor: "#dc3545",
          clipPath: "polygon(0% 0%, 100% 0%, 50% 100%)", // Triangle vers bas
          "&:hover": {
            transform: "scale(1.4) translateY(1px)",
            boxShadow: "0 3px 8px rgba(220, 53, 69, 0.4)",
          },
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: "#6c757d",
          borderRadius: "2px", // Carré
          "&:hover": {
            transform: "scale(1.3)",
            boxShadow: "0 3px 8px rgba(108, 117, 125, 0.4)",
          },
        };
    }
  };

  const getStrategyIcon = () => {
    switch (strategy) {
      case "positive":
        return "↗";
      case "negative":
        return "↘";
      default:
        return "→";
    }
  };

  const getStrategyColor = () => {
    switch (strategy) {
      case "positive":
        return "#28a745";
      case "negative":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  return (
    <Tooltip
      title={
        <Box>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: "bold", color: getStrategyColor() }}
          >
            {getStrategyIcon()} {event.data?.tag} • {strategy.toUpperCase()}
          </Typography>
          <Typography variant="caption" sx={{ display: "block" }}>
            ⏱️ {formatTime(event.startTime)}
          </Typography>
          {event.data?.verbatim && (
            <Typography
              variant="caption"
              sx={{
                display: "block",
                fontStyle: "italic",
                maxWidth: "200px",
                mt: 0.5,
              }}
            >
              "
              {event.data.verbatim.length > 60
                ? event.data.verbatim.substring(0, 60) + "..."
                : event.data.verbatim}
              "
            </Typography>
          )}
          <Typography
            variant="caption"
            sx={{
              display: "block",
              color: "text.secondary",
              mt: 0.5,
            }}
          >
            Stratégie:{" "}
            {strategy === "positive"
              ? "Impact positif attendu"
              : strategy === "negative"
                ? "Risque impact négatif"
                : "Impact neutre"}
          </Typography>
        </Box>
      }
      arrow
      placement="top"
      enterDelay={300}
    >
      <Box
        sx={getMarkerStyle()}
        onClick={(e) => {
          e.stopPropagation();
          console.log("🎯 CONSEILLER CLICK:", event.data?.tag, strategy);
          onClick(event);
        }}
      />
    </Tooltip>
  );
};
