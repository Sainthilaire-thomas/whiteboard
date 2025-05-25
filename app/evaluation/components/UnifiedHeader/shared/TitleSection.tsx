// 📁 app/evaluation/components/UnifiedHeader/shared/TitleSection.tsx
"use client";

import React from "react";
import { Box, Typography } from "@mui/material";

interface TitleSectionProps {
  title: string;
  accentColor: string;
}

export default function TitleSection({
  title,
  accentColor,
}: TitleSectionProps) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box
        sx={{
          width: 4,
          height: 24,
          bgcolor: accentColor,
          borderRadius: 2,
        }}
      />
      <Typography
        variant="h6"
        sx={{
          fontWeight: "600",
          color: "text.primary",
          fontSize: "1.1rem",
        }}
      >
        {title}
      </Typography>
    </Box>
  );
}
