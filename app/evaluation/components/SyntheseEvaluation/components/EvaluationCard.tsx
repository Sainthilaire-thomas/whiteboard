"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Button,
  Chip,
} from "@mui/material";
import { PlayArrow } from "@mui/icons-material";
import { EvaluationCardProps } from "@/types/evaluation";
import { formatTimecode, truncateText } from "../utils/formatters";

const EvaluationCard: React.FC<EvaluationCardProps> = ({
  postit,
  sujetColor = "#607d8b",
  pratiqueColor = "#9e9e9e",
  onSimulate,
}) => {
  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        transition: "all 0.2s",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: 3,
        },
        borderRadius: 2,
        overflow: "hidden",
        height: "100%",
      }}
    >
      {/* Timecode du passage */}
      <Box
        sx={{
          bgcolor: "grey.900",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          p: { xs: 1, sm: 2 },
          minWidth: { xs: "100%", sm: "120px" },
        }}
      >
        <Typography variant="caption" sx={{ mb: 0.5 }}>
          TIMECODE
        </Typography>
        <Typography
          variant="h6"
          sx={{ fontFamily: "monospace", fontWeight: "bold" }}
        >
          {formatTimecode(postit.timestamp)}
        </Typography>
      </Box>

      {/* Contenu principal */}
      <CardContent
        sx={{
          flexGrow: 1,
          p: 2,
          "&:last-child": { pb: 2 },
        }}
      >
        {/* Tags du passage */}
        <Box sx={{ display: "flex", gap: 1, mb: 1, flexWrap: "wrap" }}>
          {postit.sujet && (
            <Chip
              label={postit.sujet}
              size="small"
              sx={{
                bgcolor: `${sujetColor}26`,
                color: sujetColor,
                fontWeight: "medium",
              }}
            />
          )}
          {postit.pratique && postit.pratique !== "Non Assigné" && (
            <Chip
              label={postit.pratique}
              size="small"
              sx={{
                bgcolor: `${pratiqueColor}26`,
                color: pratiqueColor,
                fontWeight: "medium",
              }}
            />
          )}
        </Box>

        {/* Extrait du texte */}
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
          {truncateText(postit.text, 150)}
        </Typography>
      </CardContent>

      {/* Bouton de simulation */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          p: 2,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          startIcon={<PlayArrow />}
          onClick={() => onSimulate(postit)}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: "bold",
          }}
        >
          Simuler
        </Button>
      </Box>
    </Card>
  );
};

export default EvaluationCard;
