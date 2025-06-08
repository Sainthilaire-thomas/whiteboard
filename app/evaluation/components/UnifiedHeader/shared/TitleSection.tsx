// 📁 app/evaluation/components/UnifiedHeader/shared/TitleSection.tsx
"use client";

import React from "react";
import { Box, Typography } from "@mui/material";

interface TitleSectionProps {
  title: string;
  accentColor: string;
  compact?: boolean;
}

export default function TitleSection({
  title,
  accentColor,
  compact = false,
}: TitleSectionProps) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box
        sx={{
          width: 4,
          height: compact ? 16 : 24, // taille réduite si compact
          bgcolor: accentColor,
          borderRadius: 2,
        }}
      />
      <Typography
        variant={compact ? "subtitle2" : "h6"}
        sx={{
          fontWeight: compact ? 500 : 600,
          color: "text.primary",
          fontSize: compact ? "0.9rem" : "1.1rem",
        }}
      >
        {title}
      </Typography>
    </Box>
  );
}
