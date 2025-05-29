// components/PhaseItem.tsx
import React from "react";
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  Collapse,
  Tooltip,
  IconButton,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { Phase, StepStatus } from "../types";
import { PhaseStatusChip } from "./PhaseStatusChip";
import { SubStepItem } from "./SubStepItem";
import {
  STATUS_CONFIG,
  COLORS,
  DIMENSIONS,
  ANIMATIONS,
  TOOLTIP_CONFIG,
} from "../constants";

interface PhaseItemProps {
  phase: Phase;
  status: StepStatus;
  isOpen: boolean;
  isActive: boolean;
  isExpanded: boolean;
  onPhaseClick: () => void;
  onStatusToggle: () => void;
  onSubStepClick: (subStep: any) => void;
  isActiveSubStep: (route?: string) => boolean;
}

export const PhaseItem: React.FC<PhaseItemProps> = ({
  phase,
  status,
  isOpen,
  isActive,
  isExpanded,
  onPhaseClick,
  onStatusToggle,
  onSubStepClick,
  isActiveSubStep,
}) => {
  const isAdminPhase = phase.isAdmin;

  return (
    <Box
      sx={{
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: COLORS.BORDER_INDICATOR.WIDTH,
          bgcolor: isActive
            ? isAdminPhase
              ? COLORS.ADMIN
              : STATUS_CONFIG.COLORS[status]
            : "transparent",
          transition: ANIMATIONS.HOVER_TRANSITION,
          borderRadius: COLORS.BORDER_INDICATOR.RADIUS,
        },
      }}
    >
      <Tooltip
        title={isExpanded ? "" : `${phase.label} - ${phase.description}`}
        placement={TOOLTIP_CONFIG.PLACEMENT}
      >
        <ListItemButton
          onClick={onPhaseClick}
          sx={{
            px: isExpanded ? 2 : 1.5,
            py: 1.5,
            bgcolor: isActive
              ? isAdminPhase
                ? COLORS.ADMIN_BACKGROUND_HOVER
                : COLORS.PRIMARY_BACKGROUND
              : isAdminPhase
              ? COLORS.ADMIN_BACKGROUND
              : "transparent",
            borderRadius: 1,
            mx: 0.5,
            transition: ANIMATIONS.HOVER_TRANSITION,
            "&:hover": {
              bgcolor: isAdminPhase
                ? COLORS.ADMIN_BACKGROUND_HOVER
                : COLORS.PRIMARY_BACKGROUND,
            },
          }}
        >
          <ListItemIcon
            sx={{
              color: isAdminPhase ? COLORS.ADMIN : STATUS_CONFIG.COLORS[status],
              minWidth: DIMENSIONS.ICON.MIN_WIDTH,
            }}
          >
            {phase.icon}
          </ListItemIcon>

          {isExpanded && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexGrow: 1,
                minWidth: 0,
              }}
            >
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: isActive ? 700 : 600,
                    color: isAdminPhase ? COLORS.ADMIN : "text.primary",
                    lineHeight: 1.2,
                  }}
                >
                  {phase.label}
                </Typography>
                {phase.description && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      fontSize: "0.7rem",
                      lineHeight: 1,
                    }}
                  >
                    {phase.description}
                  </Typography>
                )}
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {!isAdminPhase && (
                  <PhaseStatusChip status={status} onToggle={onStatusToggle} />
                )}

                {phase.subSteps && (
                  <IconButton
                    size="small"
                    sx={{
                      color: isAdminPhase ? COLORS.ADMIN : "text.secondary",
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: ANIMATIONS.EXPAND_TRANSITION,
                    }}
                  >
                    <ExpandMore fontSize="small" />
                  </IconButton>
                )}
              </Box>
            </Box>
          )}
        </ListItemButton>
      </Tooltip>

      {isExpanded && phase.subSteps && (
        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          <List dense disablePadding sx={{ pl: 3, pr: 1, pb: 1 }}>
            {phase.subSteps.map((subStep, index) => (
              <SubStepItem
                key={index}
                subStep={subStep}
                isSelected={isActiveSubStep(subStep.route)}
                isAdminPhase={isAdminPhase}
                onClick={() => onSubStepClick(subStep)}
              />
            ))}
          </List>
        </Collapse>
      )}
    </Box>
  );
};
