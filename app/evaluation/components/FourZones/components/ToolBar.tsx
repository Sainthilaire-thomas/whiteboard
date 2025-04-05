import React from "react";
import { Button, Paper, Typography, Box } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

/**
 * Composant pour la barre d'outils supérieure
 */
export const ToolBar = ({
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
      }}
    >
      <Typography variant="h6" fontWeight="bold">
        {title}
      </Typography>
      <Box>
        <Button
          variant="outlined"
          size="small"
          startIcon={<RemoveIcon />}
          onClick={decreaseFontSize}
          sx={{ mr: 1 }}
        >
          A-
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={increaseFontSize}
          sx={{ mr: 2 }}
        >
          A+
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={onSave}
          disabled={isLoading}
        >
          Sauvegarder
        </Button>
      </Box>
    </Paper>
  );
};
