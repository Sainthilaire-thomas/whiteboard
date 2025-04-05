import React from "react";
import { Box, Typography } from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

/**
 * Composant pour afficher la légende des zones
 */
export const ZoneLegend: React.FC = () => {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography
        variant="caption"
        sx={{ display: "flex", alignItems: "center" }}
      >
        <WarningIcon sx={{ color: "#c0392b", mr: 0.5, fontSize: "small" }} />
        Zone rouge: à limiter &nbsp;&nbsp;
        <CheckCircleIcon
          sx={{ color: "#27ae60", mr: 0.5, fontSize: "small" }}
        />
        Zones vertes: à privilégier
      </Typography>
    </Box>
  );
};

export default ZoneLegend;
