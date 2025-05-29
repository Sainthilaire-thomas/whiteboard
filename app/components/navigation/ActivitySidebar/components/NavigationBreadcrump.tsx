// components/NavigationBreadcrumb.tsx
import React from "react";
import { Box, Typography, Chip } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { LABELS, ANIMATIONS, SHADOWS } from "../constants";

interface QuickNavItem {
  label: string;
  route: string;
  color: string;
}

interface NavigationBreadcrumbProps {
  quickNavItems: QuickNavItem[];
  onNavigate: (route: string) => void;
  isVisible: boolean;
}

export const NavigationBreadcrumb: React.FC<NavigationBreadcrumbProps> = ({
  quickNavItems,
  onNavigate,
  isVisible,
}) => {
  if (!isVisible || quickNavItems.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        p: 2,
        bgcolor: "background.default",
        borderTop: "1px solid",
        borderColor: "divider",
        backdropFilter: "blur(8px)",
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        gutterBottom
        sx={{ display: "block", mb: 1 }}
      >
        {LABELS.NAVIGATION.QUICK_NAV}
      </Typography>

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        {quickNavItems.map((item, index) => (
          <Chip
            key={index}
            size="small"
            icon={<ArrowBack fontSize="small" />}
            label={item.label}
            onClick={() => onNavigate(item.route)}
            sx={{
              cursor: "pointer",
              bgcolor: item.color,
              color: "white",
              fontWeight: 500,
              "&:hover": {
                bgcolor: item.color,
                filter: "brightness(0.9)",
                transform: "translateY(-1px)",
              },
              transition: ANIMATIONS.CHIP_HOVER,
              boxShadow: SHADOWS.CHIP,
            }}
          />
        ))}
      </Box>
    </Box>
  );
};
