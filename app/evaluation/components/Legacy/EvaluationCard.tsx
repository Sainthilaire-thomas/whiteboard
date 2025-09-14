"use client";
import { Box, Typography, Button, IconButton } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { Postit, CategorieSujet, CategoriePratique } from "@/types/types";

interface EvaluationCardProps {
  postit: Postit;
  onPlay: (timestamp: number) => void;
  sujetColor?: string;
  pratiqueColor?: string;
}

const EvaluationCard = ({
  postit,
  onPlay,
  sujetColor = "#2196f3", // Bleu par défaut
  pratiqueColor = "#ff9800", // Orange par défaut
}: EvaluationCardProps) => {
  return (
    <Box
      sx={{
        backgroundColor: "#1c1c1c",
        borderRadius: 2,
        p: 2,
        mb: 2,
        boxShadow: 2,
        maxWidth: "100%",
      }}
    >
      {/* Titre + bouton audio */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="subtitle2" fontWeight="bold">
          Passage analysé
        </Typography>
        <IconButton
          onClick={() => onPlay(postit.timestamp)}
          size="small"
          sx={{ color: "white" }}
        >
          <PlayArrowIcon />
          <Typography variant="caption" sx={{ ml: 0.5 }}>
            {new Date(postit.timestamp * 1000).toISOString().substr(14, 5)}
          </Typography>
        </IconButton>
      </Box>

      {/* Contenu du passage */}
      <Typography variant="body2" sx={{ mt: 1, mb: 1.5 }}>
        {postit.word}
      </Typography>

      {/* Sujet concerné */}
      {postit.sujet && (
        <Box
          sx={{
            display: "inline-block",
            backgroundColor: sujetColor,
            color: "white",
            borderRadius: 1,
            px: 1,
            py: 0.3,
            fontSize: "0.75rem",
            mr: 1,
          }}
        >
          {postit.sujet}
        </Box>
      )}

      {/* Pratique à travailler */}
      {postit.pratique && (
        <Box
          sx={{
            display: "inline-block",
            backgroundColor: pratiqueColor,
            color: "white",
            borderRadius: 1,
            px: 1,
            py: 0.3,
            fontSize: "0.75rem",
            mt: 0.5,
          }}
        >
          {postit.pratique}
        </Box>
      )}

      {/* Commentaire */}
      {postit.text && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          <strong>Commentaire :</strong> {postit.text}
        </Typography>
      )}

      {/* Bouton jeu de rôle */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
        <Button size="small" variant="outlined" color="primary">
          Rejouer en jeu de rôle
        </Button>
      </Box>
    </Box>
  );
};

export default EvaluationCard;
