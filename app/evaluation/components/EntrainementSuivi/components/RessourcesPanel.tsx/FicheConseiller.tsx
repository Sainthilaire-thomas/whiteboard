import React from "react";
import { Box, Typography, Paper, IconButton, Tooltip } from "@mui/material";
import { ArrowForward } from "@mui/icons-material";

interface FicheConseillerProps {
  pratique: {
    nompratique: string;
    fiche_conseiller_json: any;
    categoryColor?: string;
  };
  onClose: () => void;
}

const FicheConseiller: React.FC<FicheConseillerProps> = ({
  pratique,
  onClose,
}) => {
  const ficheData = pratique.fiche_conseiller_json;
  if (!ficheData) {
    return (
      <Typography variant="body2">
        Aucune fiche conseiller disponible
      </Typography>
    );
  }

  const categoryColor = pratique.categoryColor || "#3f51b5";

  // Utilitaire pour assombrir une couleur
  const darkenColor = (hex: string, amount: number) => {
    if (!hex || !hex.startsWith("#")) return "#666666";

    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);

    r = Math.max(0, r - amount * 1.5);
    g = Math.max(0, g - amount * 1.5);
    b = Math.max(0, b - amount * 1.5);

    return `rgb(${r}, ${g}, ${b})`;
  };

  // Style pour les zones colorées
  const getZoneStyle = (index: number) => ({
    backgroundColor: darkenColor(categoryColor, index * 10),
    color: "white",
    padding: "8px 12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "0.5rem",
    borderRadius: "4px",
    fontSize: "0.85rem",
  });

  return (
    <Paper
      sx={{
        p: 2,
        maxHeight: 500,
        overflow: "auto",
        border: `2px solid ${categoryColor}30`,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            backgroundColor: categoryColor,
            color: "white",
            padding: "8px 12px",
            borderRadius: "4px",
            fontSize: "1rem",
          }}
        >
          📝 Fiche Flash Conseiller
        </Typography>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ color: "text.secondary" }}
        >
          ✕
        </IconButton>
      </Box>

      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "bold" }}>
        {ficheData.titre || pratique.nompratique}
      </Typography>

      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Thématique: {ficheData.thematique || pratique.nompratique}
      </Typography>

      {/* Zones avec tooltip pour le contenu complet */}
      {ficheData.zones &&
        ficheData.zones.map((zone: any, index: number) => {
          const zoneContent = zone.contenu || zone;
          const isLong = zoneContent.length > 50;

          return (
            <Tooltip
              key={index}
              title={isLong ? zoneContent : ""}
              placement="top"
              arrow
            >
              <Box sx={getZoneStyle(index)}>
                <ArrowForward fontSize="small" />
                <Typography
                  variant="body2"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    cursor: isLong ? "help" : "default",
                  }}
                >
                  {zoneContent}
                </Typography>
              </Box>
            </Tooltip>
          );
        })}

      {/* Paragraphes détaillés */}
      {ficheData.paragraphes &&
        ficheData.paragraphes.map((paragraphe: any, idx: number) => (
          <Box key={idx} sx={{ mt: 2 }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: "bold", color: categoryColor }}
            >
              {paragraphe.titre}
            </Typography>
            <Typography variant="body2" paragraph sx={{ mt: 0.5 }}>
              {paragraphe.contenu}
            </Typography>
          </Box>
        ))}

      {ficheData.aRetenir && (
        <Box
          sx={{
            bgcolor: categoryColor,
            p: 2,
            color: "white",
            borderRadius: "4px",
            mt: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <ArrowForward fontSize="small" />À Retenir:
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, fontStyle: "italic" }}>
            {ficheData.aRetenir}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default FicheConseiller;
