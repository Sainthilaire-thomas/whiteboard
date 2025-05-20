import React from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import BuildIcon from "@mui/icons-material/Build";
import CommentIcon from "@mui/icons-material/Comment";

interface SummaryPanelProps {
  selectedPostit: any;
  theme?: any;
  stepBoxStyle?: any;
  onClose: () => void;
  onEdit?: (step: number) => void;
}

export const SummaryPanel: React.FC<SummaryPanelProps> = ({
  selectedPostit,
  theme: propTheme,
  stepBoxStyle,
  onClose,
  onEdit = () => {},
  hideActionButtons = false,
}) => {
  // Utiliser le hook useTheme si theme n'est pas passé en prop
  const defaultTheme = useTheme();
  const theme = propTheme || defaultTheme;

  // Définir les données pour chaque section - réordonné
  const sections = [];

  // Ajouter d'abord le commentaire à chaud s'il existe
  if (selectedPostit.text && selectedPostit.text.trim() !== "") {
    sections.push({
      id: "comment",
      title: "Commentaire à chaud",
      icon: <CommentIcon fontSize="small" />,
      value: selectedPostit.text,
      color: theme.palette.info.main,
      bgColor: theme.palette.info.light,
      editStep: 0,
      fullWidth: true,
    });
  }

  // Ajouter les critères qualité et pratique
  sections.push({
    id: "sujet",
    title: "Critère qualité",
    icon: <MenuBookIcon fontSize="small" />,
    value: selectedPostit.sujet || "Non assigné",
    color: theme.palette.error.main,
    bgColor: theme.palette.error.light,
    editStep: 1,
    fullWidth: false,
  });

  sections.push({
    id: "pratique",
    title: "Pratique à améliorer",
    icon: <BuildIcon fontSize="small" />,
    value: selectedPostit.pratique || "Non assignée",
    color: theme.palette.success.main,
    bgColor: theme.palette.success.light,
    editStep: 2,
    fullWidth: false,
  });

  // Ajouter le passage à la fin
  sections.push({
    id: "passage",
    title: "Passage sélectionné",
    icon: <FormatQuoteIcon fontSize="small" />,
    value: selectedPostit.word || "N/A",
    color: theme.palette.primary.main,
    bgColor: theme.palette.primary.light,
    textStyle: { fontStyle: "italic" },
    editStep: 0,
    fullWidth: true,
  });

  return (
    <Paper
      elevation={1}
      sx={{
        borderRadius: 1,
        overflow: "hidden",
        mt: 1,
        mb: 1,
      }}
    >
      {/* En-tête avec titre */}
      <Box
        sx={{
          px: 1.5,
          py: 1,
          bgcolor: theme.palette.success.main,
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            display: "flex",
            alignItems: "center",
            fontWeight: 500,
            fontSize: "0.95rem",
          }}
        >
          <CheckCircleIcon sx={{ mr: 1, fontSize: "1rem" }} />
          Synthèse de l'affectation
        </Typography>
      </Box>

      {/* Contenu principal */}
      <Box sx={{ p: 1 }}>
        <Grid container spacing={1}>
          {sections.map((section) => (
            <Grid
              item
              xs={12}
              sm={section.fullWidth ? 12 : 6}
              key={section.id}
              // Assurer que les sections critère et pratique sont côte à côte
              order={
                section.id === "passage" ? 3 : section.id === "comment" ? 1 : 2
              }
            >
              <Card
                variant="outlined"
                sx={{
                  height: "100%",
                  borderColor: section.color,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    boxShadow: `0 0 4px ${section.color}40`,
                  },
                }}
              >
                <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 0.5,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: section.color,
                          color: "white",
                          mr: 1,
                        }}
                      >
                        {section.icon}
                      </Box>
                      <Typography
                        variant="body2"
                        color={section.color}
                        fontWeight={600}
                      >
                        {section.title}
                      </Typography>
                    </Box>

                    <Tooltip title={`Modifier ${section.title.toLowerCase()}`}>
                      <IconButton
                        size="small"
                        onClick={() => onEdit(section.editStep)}
                        sx={{
                          color: section.color,
                          padding: 0.5,
                          "&:hover": {
                            bgcolor: `${section.color}10`,
                          },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Divider sx={{ my: 0.5 }} />

                  <Typography
                    variant="body2"
                    sx={{
                      pl: 0.5,
                      ...(section.textStyle || {}),
                      wordBreak: "break-word",
                      maxHeight: "60px", // Hauteur uniforme
                      overflow: "auto",
                    }}
                  >
                    {section.id === "passage"
                      ? `« ${section.value} »`
                      : section.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Boutons d'action */}
        {!hideActionButtons && (
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mt: 1.5 }}
          >
            <Button
              variant="outlined"
              onClick={() => onEdit(0)}
              startIcon={<EditIcon />}
              size="small"
            >
              Modifier
            </Button>

            <Button
              variant="contained"
              color="success"
              onClick={onClose}
              startIcon={<CheckCircleIcon />}
              size="small"
            >
              Valider
            </Button>
          </Box>
        )}
      </Box>
    </Paper>
  );
};
