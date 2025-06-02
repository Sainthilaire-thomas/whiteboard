import React from "react";
import { Box, Chip } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import NewReleasesIcon from "@mui/icons-material/NewReleases";

interface StatusBadgeProps {
  isCompleted: boolean;
  hasSubject: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  isCompleted,
  hasSubject,
}) => {
  if (isCompleted) {
    return (
      <Box sx={{ ml: "auto" }}>
        <Chip
          icon={<CheckCircleIcon />}
          label="Complet"
          color="success"
          variant="outlined"
          size="small"
        />
      </Box>
    );
  }

  if (hasSubject) {
    return (
      <Box sx={{ ml: "auto" }}>
        <Chip
          icon={<PendingIcon />}
          label="En cours"
          color="warning"
          variant="outlined"
          size="small"
        />
      </Box>
    );
  }

  return (
    <Box sx={{ ml: "auto" }}>
      <Chip
        icon={<PendingIcon />}
        label="Non affecté"
        color="default"
        variant="outlined"
        size="small"
      />
    </Box>
  );
};
