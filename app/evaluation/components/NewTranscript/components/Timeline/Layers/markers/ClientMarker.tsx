import React from "react";
import { Box, Tooltip, Typography } from "@mui/material";
import { TemporalEvent } from "../../../../types";
import { formatTime } from "../../utils/time";

interface ClientMarkerProps {
  event: TemporalEvent;
  reaction: "positive" | "negative" | "neutral";
  x: number;
  y: number;
  onClick: (event: TemporalEvent) => void;
  isCoherent?: boolean;
}

export const ClientMarker: React.FC<ClientMarkerProps> = ({
  event,
  reaction,
  x,
  y,
  onClick,
  isCoherent,
}) => {
  const getMarkerConfig = () => {
    switch (reaction) {
      case "positive":
        return {
          backgroundColor: "#12d9c2",
          emoji: "😊",
          color: "white",
          borderColor: isCoherent ? "#28a745" : "#ffc107",
        };
      case "negative":
        return {
          backgroundColor: "#e2330d",
          emoji: "😞",
          color: "white",
          borderColor: isCoherent ? "#dc3545" : "#ffc107",
        };
      default:
        return {
          backgroundColor: "#6c757d",
          emoji: "😐",
          color: "white",
          borderColor: "#6c757d",
        };
    }
  };

  const config = getMarkerConfig();

  return (
    <Tooltip
      title={
        <Box>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: "bold",
              color: config.backgroundColor,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            {config.emoji} {event.data?.tag} • RÉACTION {reaction.toUpperCase()}
            {isCoherent !== undefined && (
              <Box
                component="span"
                sx={{
                  ml: 1,
                  px: 0.5,
                  py: 0.1,
                  fontSize: "10px",
                  borderRadius: "4px",
                  backgroundColor: isCoherent ? "#d4edda" : "#fff3cd",
                  color: isCoherent ? "#155724" : "#856404",
                  fontWeight: "bold",
                }}
              >
                {isCoherent ? "✅ COHÉRENT" : "⚠️ INCOHÉRENT"}
              </Box>
            )}
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
            {reaction === "positive"
              ? "🎯 Réaction positive du client"
              : reaction === "negative"
                ? "⚠️ Réaction négative du client"
                : "➖ Réaction neutre du client"}
          </Typography>
          {isCoherent !== undefined && (
            <Typography
              variant="caption"
              sx={{
                display: "block",
                color: isCoherent ? "#28a745" : "#ffc107",
                fontWeight: "bold",
                mt: 0.5,
              }}
            >
              {isCoherent
                ? "Cette réaction correspond à la stratégie utilisée"
                : "Cette réaction ne correspond pas à la stratégie utilisée"}
            </Typography>
          )}
        </Box>
      }
      arrow
      placement="top"
      enterDelay={300}
    >
      <Box
        sx={{
          position: "absolute",
          left: x - 8,
          top: y - 8,
          width: 16,
          height: 16,
          borderRadius: "50%",
          backgroundColor: config.backgroundColor,
          border: `2px solid ${config.borderColor}`,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "8px",
          color: config.color,
          boxShadow:
            isCoherent === false
              ? "0 0 8px rgba(255, 193, 7, 0.6)"
              : "0 2px 4px rgba(0,0,0,0.2)",
          transition: "all 0.2s ease",
          zIndex: 15,
          "&:hover": {
            transform: "scale(1.4)",
            boxShadow:
              isCoherent === false
                ? "0 0 12px rgba(255, 193, 7, 0.8)"
                : "0 4px 12px rgba(0,0,0,0.3)",
            zIndex: 25,
          },
        }}
        onClick={(e) => {
          e.stopPropagation();
          console.log(
            "👥 CLIENT CLICK:",
            event.data?.tag,
            reaction,
            isCoherent ? "cohérent" : "incohérent"
          );
          onClick(event);
        }}
      >
        {config.emoji}
      </Box>
    </Tooltip>
  );
};
