// components/SubStepItem.tsx
import React from "react";
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Badge,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { SubStep } from "../types";
import { COLORS, DIMENSIONS, ANIMATIONS } from "../constants";

interface SubStepItemProps {
  subStep: SubStep;
  isSelected: boolean;
  isAdminPhase?: boolean;
  onClick: () => void;
}

export const SubStepItem: React.FC<SubStepItemProps> = ({
  subStep,
  isSelected,
  isAdminPhase = false,
  onClick,
}) => {
  const isDisabled = subStep.disabled;

  const getBackgroundColor = () => {
    if (!isSelected) return "transparent";

    if (isAdminPhase) return COLORS.ADMIN;
    if (subStep.isBackAction) return COLORS.BACK_ACTION;
    return "primary.main";
  };

  const getTextColor = () => {
    if (isSelected) return "white";
    if (isDisabled) return "text.disabled";
    if (subStep.isBackAction) return COLORS.BACK_ACTION;
    if (isAdminPhase) return COLORS.ADMIN;
    return "text.primary";
  };

  const getHoverColor = () => {
    if (isDisabled) return "transparent";
    if (isSelected) {
      if (isAdminPhase) return COLORS.ADMIN_HOVER;
      if (subStep.isBackAction) return COLORS.BACK_ACTION_HOVER;
      return "primary.dark";
    }
    return "action.hover";
  };

  return (
    <ListItemButton
      onClick={onClick}
      selected={isSelected}
      disabled={isDisabled}
      sx={{
        borderRadius: 1,
        mx: 0.5,
        bgcolor: getBackgroundColor(),
        color: getTextColor(),
        "&:hover": {
          bgcolor: getHoverColor(),
        },
        opacity: isDisabled ? 0.5 : 1,
        cursor: isDisabled ? "not-allowed" : "pointer",
        transition: ANIMATIONS.HOVER_TRANSITION,
      }}
    >
      <ListItemIcon sx={{ minWidth: DIMENSIONS.ICON.SMALL }}>
        {subStep.isBackAction && (
          <ArrowBack fontSize="small" sx={{ color: "inherit" }} />
        )}
      </ListItemIcon>

      <ListItemText
        primary={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: isSelected ? 600 : 500,
                fontSize: "0.85rem",
                color: "inherit",
                flex: 1,
              }}
            >
              {subStep.label}
            </Typography>

            {subStep.badge && subStep.badge > 0 && (
              <Badge
                badgeContent={subStep.badge}
                color="error"
                sx={{
                  "& .MuiBadge-badge": {
                    fontSize: DIMENSIONS.BADGE.FONT_SIZE,
                    minWidth: DIMENSIONS.BADGE.MIN_WIDTH,
                    height: DIMENSIONS.BADGE.HEIGHT,
                    bgcolor: isSelected
                      ? "rgba(255,255,255,0.9)"
                      : "error.main",
                    color: isSelected ? "error.main" : "white",
                  },
                }}
              />
            )}
          </Box>
        }
      />
    </ListItemButton>
  );
};
