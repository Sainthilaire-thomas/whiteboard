// app/evaluation/components/NewTranscript/components/Timeline/Progress/TimelineCursor.tsx

import React from "react";
import { Box } from "@mui/material";
import { timeToPosition } from "../utils/time";

interface TimelineCursorProps {
  currentTime: number;
  duration: number;
  height: number;
  width: number;
}

export const TimelineCursor: React.FC<TimelineCursorProps> = ({
  currentTime,
  duration,
  height,
  width,
}) => {
  const position = timeToPosition(currentTime, duration, width);

  return (
    <Box
      sx={{
        position: "absolute",
        left: position,
        top: 0,
        width: 3,
        height: height,
        backgroundColor: "error.main",
        zIndex: 30,
        pointerEvents: "none",
        transition: "left 0.1s ease-out",
        boxShadow: "0 0 4px rgba(244, 67, 54, 0.5)",
      }}
    >
      {/* Indicateur en haut */}
      <Box
        sx={{
          position: "absolute",
          top: -6,
          left: -8,
          width: 16,
          height: 16,
          backgroundColor: "error.main",
          borderRadius: "50%",
          border: "2px solid white",
          boxShadow: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.6rem",
          color: "white",
        }}
      >
        ▶
      </Box>
    </Box>
  );
};
