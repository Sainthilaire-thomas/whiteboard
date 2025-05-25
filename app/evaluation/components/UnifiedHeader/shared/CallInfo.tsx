"use client";

import React from "react";
import { Box, Typography, Tooltip } from "@mui/material";

interface CallInfoProps {
  call:
    | {
        callid: string | number;
        description?: string;
      }
    | null
    | undefined;
  compact?: boolean; // Pour s'adapter au contexte
}

export default function CallInfo({ call, compact = false }: CallInfoProps) {
  // Vérification de sécurité
  if (!call || (!call.callid && call.callid !== 0)) {
    return null;
  }

  const description = call.description || "Sans description";
  const shouldShowTooltip = description.length > (compact ? 15 : 30);

  return (
    <Tooltip
      title={shouldShowTooltip ? description : ""}
      placement="bottom"
      arrow
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: compact ? 0.5 : 1,
          minWidth: 0,
          overflow: "hidden",
          cursor: shouldShowTooltip ? "help" : "default",
        }}
      >
        <Typography
          variant={compact ? "caption" : "body2"}
          color="text.secondary"
          sx={{
            fontWeight: "500",
            flexShrink: 0, // Empêche la compression du numéro d'appel
          }}
        >
          Appel #{String(call.callid)}
        </Typography>

        <Box
          sx={{
            width: compact ? 3 : 4,
            height: compact ? 3 : 4,
            borderRadius: "50%",
            bgcolor: "text.disabled",
            flexShrink: 0,
          }}
        />

        <Typography
          variant={compact ? "caption" : "body2"}
          color="text.secondary"
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: compact ? "100px" : "200px",
            fontSize: compact ? "0.7rem" : undefined,
          }}
        >
          {description}
        </Typography>
      </Box>
    </Tooltip>
  );
}
