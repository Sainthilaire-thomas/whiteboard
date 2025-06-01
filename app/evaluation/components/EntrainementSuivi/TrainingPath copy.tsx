import React from "react";
import { Box, Typography, Chip, Paper, Tooltip } from "@mui/material";
import { TrainingPlan } from "./types";

interface TrainingPathProps {
  trainingPlan: TrainingPlan;
  categoryColor?: string;
}

const TrainingPath: React.FC<TrainingPathProps> = ({
  trainingPlan,
  categoryColor = "#3f51b5",
}) => {
  const { nudges, totalDuration, startDate } = trainingPlan;

  if (!nudges || nudges.length === 0) {
    return null;
  }

  // Calcul des positions pour le chemin (plus compact)
  const pathWidth = 700;
  const pathHeight = 180;
  const stepWidth = pathWidth / (nudges.length + 1);

  // Générer le chemin SVG sinueux
  const generatePath = () => {
    let path = `M 50 ${pathHeight / 2}`;

    nudges.forEach((_, index) => {
      const x = 50 + (index + 1) * stepWidth;
      const y = pathHeight / 2 + Math.sin(index * 0.5) * 20; // Effet sinueux réduit

      if (index === 0) {
        path += ` L ${x} ${y}`;
      } else {
        const prevX = 50 + index * stepWidth;
        const prevY = pathHeight / 2 + Math.sin((index - 1) * 0.5) * 20;
        const cpX = (prevX + x) / 2;
        path += ` Q ${cpX} ${prevY} ${x} ${y}`;
      }
    });

    return path;
  };

  // Points de passage pour chaque nudge
  const getNodePosition = (index: number) => {
    const x = 50 + (index + 1) * stepWidth;
    const y = pathHeight / 2 + Math.sin(index * 0.5) * 20;
    return { x, y };
  };

  return (
    <Paper sx={{ p: 2, mb: 2, bgcolor: "background.default" }}>
      <Typography
        variant="subtitle1"
        gutterBottom
        sx={{ textAlign: "center", mb: 1 }}
      >
        🗺️ Parcours d'Entraînement ({totalDuration} jours)
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
        <svg
          width={pathWidth + 100}
          height={pathHeight + 60}
          viewBox={`0 0 ${pathWidth + 100} ${pathHeight + 60}`}
        >
          {/* Dégradé pour le chemin */}
          <defs>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={categoryColor} stopOpacity="0.3" />
              <stop offset="100%" stopColor={categoryColor} stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Chemin principal */}
          <path
            d={generatePath()}
            stroke="url(#pathGradient)"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />

          {/* Point de départ */}
          <g transform={`translate(50, ${pathHeight / 2})`}>
            <circle r="12" fill="#4caf50" stroke="white" strokeWidth="2" />
            <text
              x="0"
              y="4"
              textAnchor="middle"
              fill="white"
              fontSize="12"
              fontWeight="bold"
            >
              🏁
            </text>
          </g>

          {/* Points de passage pour chaque nudge */}
          {nudges.map((nudge, index) => {
            const { x, y } = getNodePosition(index);
            const isLast = index === nudges.length - 1;

            return (
              <g key={index} transform={`translate(${x}, ${y})`}>
                {/* Cercle principal */}
                <circle
                  r="16"
                  fill={isLast ? "#ff9800" : categoryColor}
                  stroke="white"
                  strokeWidth="2"
                />

                {/* Numéro du nudge */}
                <text
                  x="0"
                  y="4"
                  textAnchor="middle"
                  fill="white"
                  fontSize="12"
                  fontWeight="bold"
                >
                  {isLast ? "🏆" : nudge.nudgeNumber}
                </text>

                {/* Label avec dates */}
                <text
                  x="0"
                  y="32"
                  textAnchor="middle"
                  fill={categoryColor}
                  fontSize="10"
                  fontWeight="bold"
                >
                  {nudge.dayRange}
                </text>

                <text x="0" y="44" textAnchor="middle" fill="gray" fontSize="8">
                  {nudge.startDate.toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                  })}{" "}
                  -{" "}
                  {nudge.endDate.toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                  })}
                </text>
              </g>
            );
          })}

          {/* Semaines en arrière-plan */}
          {Array.from(
            { length: Math.ceil(totalDuration / 7) },
            (_, weekIndex) => {
              const weekX =
                50 +
                (weekIndex + 0.5) * (pathWidth / Math.ceil(totalDuration / 7));
              return (
                <g key={weekIndex}>
                  <line
                    x1={weekX}
                    y1="10"
                    x2={weekX}
                    y2={pathHeight + 30}
                    stroke="#e0e0e0"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                  />
                  <text
                    x={weekX}
                    y="8"
                    textAnchor="middle"
                    fill="gray"
                    fontSize="9"
                    fontWeight="bold"
                  >
                    S{weekIndex + 1}
                  </text>
                </g>
              );
            }
          )}
        </svg>
      </Box>

      {/* Légende compacte */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 0.5,
          justifyContent: "center",
          mb: 1,
        }}
      >
        {nudges.map((nudge, index) => (
          <Tooltip
            key={index}
            title={
              <Box>
                <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                  Nudge {nudge.nudgeNumber}: {nudge.dayRange}
                </Typography>
                <Typography
                  variant="caption"
                  display="block"
                  color="text.secondary"
                >
                  {nudge.startDate.toLocaleDateString("fr-FR")} →{" "}
                  {nudge.endDate.toLocaleDateString("fr-FR")}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ mt: 0.5, display: "block" }}
                >
                  {nudge.content}
                </Typography>
              </Box>
            }
            arrow
            placement="top"
          >
            <Chip
              label={`${nudge.nudgeNumber}. ${nudge.dayRange}`}
              size="small"
              sx={{
                backgroundColor: categoryColor + "20",
                color: categoryColor,
                cursor: "help",
                fontSize: "0.7rem",
                height: 20,
              }}
            />
          </Tooltip>
        ))}
      </Box>

      {/* Statistiques compactes */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-around",
          textAlign: "center",
        }}
      >
        <Box>
          <Typography variant="subtitle2" color="primary">
            {totalDuration}
          </Typography>
          <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>
            Jours
          </Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2" color="secondary">
            {nudges.length}
          </Typography>
          <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>
            Étapes
          </Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2" color="info.main">
            {Math.ceil(totalDuration / 7)}
          </Typography>
          <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>
            Semaines
          </Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2" color="success.main">
            {Math.round(totalDuration / nudges.length)}
          </Typography>
          <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>
            J/étape
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default TrainingPath;
