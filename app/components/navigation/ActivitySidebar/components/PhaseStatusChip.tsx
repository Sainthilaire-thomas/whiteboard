// components/PhaseStatusChip.tsx
import React from "react";
import { Chip, IconButton, Box } from "@mui/material";
import { Loop as LoopIcon } from "@mui/icons-material";
import { StepStatus } from "../types";
import { STATUS_CONFIG, DIMENSIONS, ANIMATIONS } from "../constants";

interface PhaseStatusChipProps {
  status: StepStatus;
  onToggle: () => void;
  disabled?: boolean;
  size?: "small" | "medium";
}

export const PhaseStatusChip: React.FC<PhaseStatusChipProps> = ({
  status,
  onToggle,
  disabled = false,
  size = "small",
}) => {
  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      onToggle();
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <Chip
        label={STATUS_CONFIG.LABELS[status]}
        size={size}
        sx={{
          fontSize:
            size === "small"
              ? DIMENSIONS.CHIP.SMALL.FONT_SIZE
              : DIMENSIONS.CHIP.MEDIUM.FONT_SIZE,
          height:
            size === "small"
              ? DIMENSIONS.CHIP.SMALL.HEIGHT
              : DIMENSIONS.CHIP.MEDIUM.HEIGHT,
          minWidth:
            size === "small"
              ? DIMENSIONS.CHIP.SMALL.MIN_WIDTH
              : DIMENSIONS.CHIP.MEDIUM.MIN_WIDTH,
          bgcolor: STATUS_CONFIG.COLORS[status],
          color: "white",
          "& .MuiChip-label": {
            px: 1,
            fontWeight: 500,
          },
          opacity: disabled ? 0.6 : 1,
        }}
      />

      {!disabled && (
        <IconButton
          onClick={handleToggleClick}
          size="small"
          sx={{
            color: "text.secondary",
            "&:hover": {
              color: STATUS_CONFIG.COLORS[status],
              bgcolor: `${STATUS_CONFIG.COLORS[status]}10`,
            },
            transition: ANIMATIONS.HOVER_TRANSITION,
          }}
        >
          <LoopIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
};
