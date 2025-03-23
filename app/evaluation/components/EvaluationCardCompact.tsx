import { Box, Typography, Paper, Chip, IconButton } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { Postit } from "@/types/types";

interface EvaluationCardCompactProps {
  postit: Postit;
  couleurSujet?: string;
  couleurPratique?: string;
  onReplay?: (timestamp: number) => void;
}

export default function EvaluationCardCompact({
  postit,
  couleurSujet = "#1976d2", // par défaut bleu
  couleurPratique = "#ff9800", // par défaut orange
  onReplay,
}: EvaluationCardCompactProps) {
  const { word, text, timestamp, sujet, pratique } = postit;

  const formattedTime = new Date(timestamp * 1000).toISOString().substr(11, 8);

  return (
    <Paper
      sx={{
        p: 2,
        m: 1,
        width: "100%",
        maxWidth: 500,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 1,
        borderRadius: 2,
        backgroundColor: "background.default",
        boxShadow: 3,
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle2" fontWeight={600} color="primary">
          Passage analysé
        </Typography>
        <Chip
          icon={<PlayArrowIcon />}
          label={formattedTime}
          color="secondary"
          onClick={() => onReplay && onReplay(timestamp)}
        />
      </Box>

      <Typography variant="body2" fontStyle="italic">
        {word}
      </Typography>

      <Box display="flex" gap={1} flexWrap="wrap">
        {sujet && (
          <Chip
            label={sujet}
            sx={{ backgroundColor: couleurSujet, color: "white" }}
            size="small"
          />
        )}
        {pratique && (
          <Chip
            label={pratique}
            sx={{ backgroundColor: couleurPratique, color: "white" }}
            size="small"
          />
        )}
      </Box>

      {text && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          {text}
        </Typography>
      )}
    </Paper>
  );
}
