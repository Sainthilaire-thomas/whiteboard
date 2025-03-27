// PostitSteps/SummaryPanel.tsx
import React from "react";
import { Box, Typography, Button, Divider, Fade } from "@mui/material";
import { Theme, alpha } from "@mui/material/styles";
import { Postit } from "@/types/types";

interface SummaryPanelProps {
  selectedPostit: Postit;
  theme: Theme;
  stepBoxStyle: any;
  onClose: () => void;
}

export const SummaryPanel: React.FC<SummaryPanelProps> = ({
  selectedPostit,
  theme,
  stepBoxStyle,
  onClose,
}) => {
  return (
    <Fade in timeout={500}>
      <Box
        sx={{
          ...stepBoxStyle,
          mt: 3,
          backgroundColor: alpha(theme.palette.success.light, 0.1),
        }}
      >
        <Typography variant="subtitle2" color="success.main" gutterBottom>
          ✅ Affectation terminée!
        </Typography>
        <Divider sx={{ my: 1 }} />
        <Typography variant="body2" gutterBottom>
          <strong>Passage:</strong> « {selectedPostit.word} »
        </Typography>
        <Typography variant="body2" gutterBottom>
          <strong>Critère qualité:</strong> {selectedPostit.sujet}
        </Typography>
        <Typography variant="body2" gutterBottom>
          <strong>Pratique à améliorer:</strong> {selectedPostit.pratique}
        </Typography>
        <Typography variant="body2" gutterBottom>
          <strong>Votre commentaire:</strong>{" "}
          {selectedPostit.text || "Aucun commentaire"}
        </Typography>
        <Button
          variant="contained"
          color="success"
          fullWidth
          sx={{ mt: 2 }}
          onClick={onClose}
        >
          Terminer et fermer
        </Button>
      </Box>
    </Fade>
  );
};
