import React from "react";
import { Box, Tooltip, Typography } from "@mui/material";
import { TaggedTurn } from "@/context/TaggingDataContext";
import { formatTime } from "../utils/time";

interface TurnBarMarkerProps {
  turn: TaggedTurn;
  strategy?: "positive" | "negative" | "neutral";
  reaction?: "positive" | "negative" | "neutral";
  x: number;
  width: number;
  y: number;
  height?: number;
  onClick: (turn: TaggedTurn) => void;
  onHover?: (turn: TaggedTurn) => void;
  isCoherent?: boolean;
}

export const TurnBarMarker: React.FC<TurnBarMarkerProps> = ({
  turn,
  strategy,
  reaction,
  x,
  width,
  y,
  height = 26,
  onClick,
  onHover,
  isCoherent,
}) => {
  // Configuration selon le type de marker
  const getMarkerConfig = () => {
    // Marker conseiller (stratégie)
    if (strategy) {
      switch (strategy) {
        case "positive":
          return {
            backgroundColor: "#28a745",
            borderColor: "#1e7e34",
            textColor: "white",
            icon: "↗",
            gradient: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
          };
        case "negative":
          return {
            backgroundColor: "#dc3545",
            borderColor: "#c82333",
            textColor: "white",
            icon: "↘",
            gradient: "linear-gradient(135deg, #dc3545 0%, #e74c3c 100%)",
          };
        default:
          return {
            backgroundColor: "#6c757d",
            borderColor: "#5a6268",
            textColor: "white",
            icon: "→",
            gradient: "linear-gradient(135deg, #6c757d 0%, #adb5bd 100%)",
          };
      }
    }

    // Marker client (réaction)
    if (reaction) {
      const coherenceColor = isCoherent ? "#28a745" : "#ffc107";

      switch (reaction) {
        case "positive":
          return {
            backgroundColor: "#12d9c2",
            borderColor: coherenceColor,
            textColor: "white",
            icon: "😊",
            gradient: "linear-gradient(135deg, #12d9c2 0%, #17a2b8 100%)",
          };
        case "negative":
          return {
            backgroundColor: "#e2330d",
            borderColor: coherenceColor,
            textColor: "white",
            icon: "😞",
            gradient: "linear-gradient(135deg, #e2330d 0%, #dc3545 100%)",
          };
        default:
          return {
            backgroundColor: "#6c757d",
            borderColor: "#6c757d",
            textColor: "white",
            icon: "😐",
            gradient: "linear-gradient(135deg, #6c757d 0%, #adb5bd 100%)",
          };
      }
    }

    // Fallback
    return {
      backgroundColor: "#2196f3",
      borderColor: "#1976d2",
      textColor: "white",
      icon: "•",
      gradient: "linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)",
    };
  };

  const config = getMarkerConfig();
  const duration = turn.end_time - turn.start_time;

  // Largeur minimale pour les tours très courts
  const minWidth = 4;
  const actualWidth = Math.max(width, minWidth);

  // Décider si on affiche le label selon la largeur
  const showLabel = actualWidth >= 60;
  const showIcon = actualWidth >= 20;

  // ✅ CORRECTION: Utiliser turn.tag au lieu de turn.tags?.[0]?.tag
  const labelText = turn.tag || turn.speaker || "Tour";
  const truncatedLabel =
    labelText.length > 12 ? labelText.slice(0, 12) + "…" : labelText;

  return (
    <Tooltip
      title={
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 0.5 }}>
            {config.icon} {labelText}
            {strategy && ` • STRATÉGIE ${strategy.toUpperCase()}`}
            {reaction && ` • RÉACTION ${reaction.toUpperCase()}`}
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
            ⏱️ {formatTime(turn.start_time)} - {formatTime(turn.end_time)}
            <Box component="span" sx={{ ml: 1, fontWeight: "bold" }}>
              ({duration.toFixed(1)}s)
            </Box>
          </Typography>

          <Typography variant="caption" sx={{ display: "block", mt: 0.5 }}>
            🎤 {turn.speaker}
          </Typography>

          {turn.verbatim && (
            <Typography
              variant="caption"
              sx={{
                display: "block",
                fontStyle: "italic",
                maxWidth: "250px",
                mt: 0.5,
                p: 0.5,
                backgroundColor: "rgba(0,0,0,0.1)",
                borderRadius: "4px",
              }}
            >
              "
              {turn.verbatim.length > 80
                ? turn.verbatim.substring(0, 80) + "..."
                : turn.verbatim}
              "
            </Typography>
          )}

          {strategy && (
            <Typography
              variant="caption"
              sx={{ display: "block", color: config.backgroundColor, mt: 0.5 }}
            >
              {strategy === "positive"
                ? "🎯 Impact positif attendu"
                : strategy === "negative"
                  ? "⚠️ Risque impact négatif"
                  : "➖ Impact neutre"}
            </Typography>
          )}

          {reaction && isCoherent !== undefined && (
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
      enterDelay={200}
    >
      <Box
        sx={{
          position: "absolute",
          left: x,
          top: y,
          width: actualWidth,
          height: height - 4,
          cursor: "pointer",
          zIndex: 15,
          transition: "all 0.2s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            zIndex: 25,
            filter: "brightness(1.1)",
          },
        }}
        onClick={(e) => {
          e.stopPropagation();
          console.log(
            "📊 TURN BAR CLICK:",
            labelText,
            strategy || reaction,
            `${duration.toFixed(1)}s`
          );
          onClick(turn);
        }}
        onMouseEnter={() => onHover?.(turn)}
      >
        {/* Barre principale avec gradient */}
        <Box
          sx={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            background: config.gradient,
            borderRadius: "6px",
            border: `2px solid ${config.borderColor}`,
            boxShadow: `0 2px 8px ${config.backgroundColor}40, inset 0 1px 0 rgba(255,255,255,0.2)`,
            overflow: "hidden",
          }}
        >
          {/* Effet de brillance */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "50%",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 100%)",
              borderRadius: "4px 4px 0 0",
            }}
          />
        </Box>

        {/* Label du tag si largeur suffisante */}
        {showLabel && (
          <Box
            sx={{
              position: "absolute",
              top: 2,
              left: "50%",
              transform: "translateX(-50%)",
              maxWidth: actualWidth - 8,
              px: 1,
              height: 16,
              lineHeight: "16px",
              fontSize: "0.7rem",
              fontWeight: 600,
              color: config.textColor,
              backgroundColor: `${config.backgroundColor}dd`,
              border: `1px solid ${config.borderColor}`,
              borderRadius: "8px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              textAlign: "center",
              textShadow: "0 1px 2px rgba(0,0,0,0.3)",
            }}
          >
            {truncatedLabel}
          </Box>
        )}

        {/* Icône si pas de label mais largeur suffisante */}
        {!showLabel && showIcon && (
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: "0.8rem",
              color: config.textColor,
              textShadow: "0 1px 2px rgba(0,0,0,0.5)",
              fontWeight: "bold",
            }}
          >
            {config.icon}
          </Box>
        )}

        {/* Indicateur de cohérence pour les réactions */}
        {reaction && isCoherent !== undefined && (
          <Box
            sx={{
              position: "absolute",
              top: -2,
              right: -2,
              width: 8,
              height: 8,
              backgroundColor: isCoherent ? "#28a745" : "#ffc107",
              borderRadius: "50%",
              border: "1px solid white",
              boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
              zIndex: 1,
            }}
          />
        )}

        {/* Barre de focus au survol */}
        <Box
          sx={{
            position: "absolute",
            left: -2,
            top: -2,
            width: "calc(100% + 4px)",
            height: "calc(100% + 4px)",
            borderRadius: "8px",
            border: `2px solid ${config.backgroundColor}`,
            opacity: 0,
            transition: "opacity 0.15s ease",
            ".MuiBox-root:hover &": { opacity: 0.8 },
          }}
        />
      </Box>
    </Tooltip>
  );
};
