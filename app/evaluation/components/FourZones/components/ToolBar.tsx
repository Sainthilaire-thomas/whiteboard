import React from "react";
import {
  Button,
  Paper,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import SaveIcon from "@mui/icons-material/Save";
import type { ToolBarProps } from "./ToolBar.types";

/**
 * Composant pour la barre d'outils supérieure
 */
export const ToolBar: React.FC<ToolBarProps> = ({
  title,
  fontSize,
  increaseFontSize,
  decreaseFontSize,
  onSave,
  isLoading,
  mode,
}) => {
  return (
    <Paper
      elevation={1}
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        p: 1.5,
        bgcolor: mode === "dark" ? "background.default" : "#f5f5f5",
        borderRadius: 1,
        transition: "background-color 0.2s ease",
      }}
    >
      {/* Section titre */}
      <Typography
        variant="h6"
        fontWeight="bold"
        sx={{
          color: mode === "dark" ? "text.primary" : "text.primary",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: { xs: "150px", sm: "300px", md: "none" },
        }}
      >
        {title}
      </Typography>

      {/* Section actions */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {/* Contrôles de police */}
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RemoveIcon />}
            onClick={decreaseFontSize}
            disabled={isLoading}
            title="Diminuer la taille de police"
            sx={{
              minWidth: { xs: "auto", sm: "auto" },
              px: { xs: 1, sm: 1.5 },
            }}
          >
            <Box
              component="span"
              sx={{ display: { xs: "none", sm: "inline" } }}
            >
              A-
            </Box>
          </Button>

          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={increaseFontSize}
            disabled={isLoading}
            title="Augmenter la taille de police"
            sx={{
              minWidth: { xs: "auto", sm: "auto" },
              px: { xs: 1, sm: 1.5 },
            }}
          >
            <Box
              component="span"
              sx={{ display: { xs: "none", sm: "inline" } }}
            >
              A+
            </Box>
          </Button>
        </Box>

        {/* Indicateur de taille de police */}
        <Typography
          variant="caption"
          sx={{
            mx: 1,
            minWidth: "30px",
            textAlign: "center",
            display: { xs: "none", sm: "block" },
          }}
        >
          {fontSize}px
        </Typography>

        {/* Bouton de sauvegarde */}
        <Button
          variant="contained"
          color="primary"
          onClick={onSave}
          disabled={isLoading}
          startIcon={
            isLoading ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <SaveIcon />
            )
          }
          sx={{
            minWidth: { xs: "auto", sm: "120px" },
            px: { xs: 1.5, sm: 2 },
          }}
        >
          <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
            {isLoading ? "Sauvegarde..." : "Sauvegarder"}
          </Box>
          <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
            {isLoading ? "..." : "Save"}
          </Box>
        </Button>
      </Box>
    </Paper>
  );
};
