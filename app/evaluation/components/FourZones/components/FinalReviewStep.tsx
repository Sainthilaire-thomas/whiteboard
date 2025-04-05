import React from "react";
import { Box, Typography, Paper, Button, Divider } from "@mui/material";

interface FinalReviewStepProps {
  mode: string;
  selectedClientText: string;
  selectedConseillerText: string;
}

/**
 * Composant pour l'étape finale de lecture
 */
export const FinalReviewStep: React.FC<FinalReviewStepProps> = ({
  mode,
  selectedClientText,
  selectedConseillerText,
}) => {
  return (
    <Box sx={{ p: 3, textAlign: "center" }}>
      <Typography variant="h6" gutterBottom>
        Lecture finale de la réponse
      </Typography>

      <Typography variant="body1" paragraph>
        Cette section permet de revoir l'échange complet entre le client et le
        conseiller.
      </Typography>

      <Paper
        elevation={2}
        sx={{
          p: 3,
          mt: 2,
          mb: 2,
          minHeight: "300px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "stretch",
          bgcolor:
            mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
          textAlign: "left",
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            color="text.secondary"
          >
            Message du client:
          </Typography>
          <Paper
            elevation={1}
            sx={{
              p: 2,
              mb: 2,
              bgcolor: mode === "dark" ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.03)",
            }}
          >
            <Typography variant="body1">
              {selectedClientText || "Aucun texte client sélectionné."}
            </Typography>
          </Paper>

          <Typography
            variant="subtitle1"
            fontWeight="bold"
            color="text.secondary"
          >
            Réponse du conseiller:
          </Typography>
          <Paper
            elevation={1}
            sx={{
              p: 2,
              bgcolor: mode === "dark" ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.03)",
            }}
          >
            <Typography variant="body1">
              {selectedConseillerText || "Aucune réponse conseiller rédigée."}
            </Typography>
          </Paper>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Vous pouvez faire lire cette réponse à haute voix pour évaluer sa
            fluidité et son impact.
          </Typography>
          <Button variant="outlined" sx={{ mt: 2 }} disabled>
            Lire à haute voix
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default FinalReviewStep;
