import { useState, useEffect, useRef } from "react";
import {
  Box,
  IconButton,
  Snackbar,
  SnackbarContent,
  TextField,
  Tooltip,
  Popover,
  Paper,
  Button,
  Typography,
} from "@mui/material";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import { useCallData } from "@/context/CallDataContext";

interface AddPostitButtonProps {
  timestamp: number;
}

const AddPostitButton = ({ timestamp }: AddPostitButtonProps) => {
  const { currentWord, addPostit } = useCallData();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [comment, setComment] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [createdPostitId, setCreatedPostitId] = useState<number | null>(null);
  const textFieldRef = useRef<HTMLInputElement>(null);

  // Ouvrir le popover pour la prise de note rapide
  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    // Reset du commentaire à chaque nouvelle ouverture
    setComment("");
  };

  // Fermer le popover
  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  // Ajouter un postit avec le commentaire
  const handleAddPostit = async () => {
    if (!currentWord) return;

    const wordid = currentWord.wordid ?? 0;
    const wordText = currentWord.text ?? "Post-it";

    try {
      // Ajouter le commentaire directement lors de la création du postit
      const newPostitId = await addPostit(wordid, wordText, timestamp, {
        text: comment.trim(),
      });

      if (typeof newPostitId === "number") {
        setCreatedPostitId(newPostitId);
        setSnackbarOpen(true);
        handleClosePopover();
      }
    } catch (error) {
      console.error("❌ Erreur lors de l'ajout du post-it:", error);
    }
  };

  // Focus sur le champ texte quand le popover s'ouvre
  useEffect(() => {
    if (anchorEl && textFieldRef.current) {
      setTimeout(() => {
        textFieldRef.current?.focus();
      }, 100);
    }
  }, [anchorEl]);

  // Fermer le snackbar après un délai
  useEffect(() => {
    if (snackbarOpen) {
      const timer = setTimeout(() => {
        setSnackbarOpen(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [snackbarOpen]);

  // Gérer la soumission avec Entrée
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddPostit();
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? "postit-comment-popover" : undefined;

  return (
    <Box>
      {/* Bouton d'ajout de post-it */}
      <Tooltip title="Marquer ce passage avec une note">
        <IconButton
          color="primary"
          onClick={handleOpenPopover}
          aria-describedby={id}
          disabled={!currentWord}
        >
          <NoteAddIcon />
        </IconButton>
      </Tooltip>

      {/* Popover pour la prise de note rapide */}
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <Paper sx={{ p: 2, width: 320, maxWidth: "90vw" }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Passage sélectionné:{" "}
            <Typography component="span" fontStyle="italic">
              "{currentWord?.text}"
            </Typography>
          </Typography>

          <TextField
            fullWidth
            variant="outlined"
            size="small"
            label="Note rapide à chaud"
            placeholder="Commentaire sur ce passage..."
            multiline
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={handleKeyDown}
            inputRef={textFieldRef}
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Button
              variant="outlined"
              onClick={handleClosePopover}
              size="small"
            >
              Annuler
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddPostit}
              size="small"
            >
              Ajouter le marqueur
            </Button>
          </Box>
        </Paper>
      </Popover>

      {/* Notification de succès */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <SnackbarContent
          sx={{ bgcolor: "success.main" }}
          message="Passage marqué avec succès"
        />
      </Snackbar>
    </Box>
  );
};

export default AddPostitButton;
