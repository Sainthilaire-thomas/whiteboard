// app/evaluation/components/NewTranscript/components/Timeline/Progress/ProgressBar.tsx

import React, { useCallback, useMemo, useRef } from "react";
import { Box, Typography } from "@mui/material";
import { timeToPosition, positionToTime, formatTime } from "../utils/time";

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onTimelineClick: (time: number) => void;
  height?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentTime,
  duration,
  onTimelineClick,
  height = 50,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickTime = positionToTime(clickX, rect.width, duration);

      onTimelineClick(Math.max(0, Math.min(clickTime, duration)));
    },
    [duration, onTimelineClick]
  );

  // Générer les graduations
  const graduations = useMemo(() => {
    if (duration <= 0) return [];

    const intervals = Math.min(Math.floor(duration / 30), 10); // Une graduation toutes les 30s, max 10
    const step = duration / (intervals || 1);

    return Array.from({ length: intervals + 1 }, (_, i) => {
      const time = i * step;
      return {
        time,
        position: (time / duration) * 100,
        label: formatTime(time),
      };
    });
  }, [duration]);

  return (
    <Box
      ref={containerRef}
      sx={{
        height,
        width: "100%",
        position: "relative",
        cursor: "pointer",
        backgroundColor: "action.hover",
        borderRadius: 2,
        display: "flex",
        alignItems: "center",
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
      }}
      onClick={handleClick}
    >
      {/* Barre de progression */}
      <Box
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          height: "100%",
          width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
          backgroundColor: "primary.main",
          opacity: 0.3,
          transition: "width 0.1s ease-out",
        }}
      />

      {/* Graduations temporelles */}
      {graduations.map((grad, index) => (
        <Box
          key={index}
          sx={{
            position: "absolute",
            left: `${grad.position}%`,
            top: 0,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
            pointerEvents: "none",
          }}
        >
          {/* Ligne de graduation */}
          <Box
            sx={{
              width: 1,
              height: 8,
              backgroundColor: "text.secondary",
              opacity: 0.5,
            }}
          />

          {/* Label de temps */}
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.7rem",
              color: "text.secondary",
              backgroundColor: "background.paper",
              padding: "1px 4px",
              borderRadius: "2px",
              transform: "translateX(-50%)",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            {grad.label}
          </Typography>

          {/* Ligne de graduation en bas */}
          <Box
            sx={{
              width: 1,
              height: 8,
              backgroundColor: "text.secondary",
              opacity: 0.5,
            }}
          />
        </Box>
      ))}

      {/* Temps actuel affiché au centre */}
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "primary.main",
          color: "primary.contrastText",
          padding: "4px 8px",
          borderRadius: 1,
          fontSize: "0.8rem",
          fontWeight: "bold",
          pointerEvents: "none",
        }}
      >
        {formatTime(currentTime)} / {formatTime(duration)}
      </Box>
    </Box>
  );
};
