import { useState, useEffect } from "react";
import {
  Box,
  IconButton,
  Snackbar,
  SnackbarContent,
  TextField,
  Tooltip,
} from "@mui/material";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import EditIcon from "@mui/icons-material/Edit";
import { useCallData } from "@/context/CallDataContext";

const AddPostitButton = () => {
  const { currentWord, addPostit, updatePostit } = useCallData();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [comment, setComment] = useState("");
  const [lastPostitId, setLastPostitId] = useState<number | null>(null);

  /** 🔹 Ajout d'un Post-it */
  const handleAddPostit = async () => {
    if (!currentWord) return;

    const wordid = currentWord.wordid ?? 0;
    const wordText = currentWord.text ?? "Post-it";
    const timestamp = currentWord.startTime ?? 0;

    try {
      const newPostitId = await addPostit(wordid, wordText, timestamp);
      console.log("🔹 ID du post-it ajouté:", newPostitId);

      if (typeof newPostitId === "number") {
        setLastPostitId(newPostitId);
        setSnackbarOpen(true);
        setShowInput(false);
        setComment("");
      }
    } catch (error) {
      console.error("❌ Erreur lors de l'ajout du post-it:", error);
    }
  };

  /** 🔹 Ouverture du champ de commentaire */
  const handleEditComment = () => {
    setShowInput(true);
    setSnackbarOpen(true);
  };

  /** 🔹 Sauvegarde du commentaire */
  const handleSaveComment = async () => {
    if (!lastPostitId || !comment.trim()) return;

    try {
      console.log("📝 Mise à jour du Post-it ID:", lastPostitId);
      await updatePostit(lastPostitId, { text: comment });
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour du post-it:", error);
    } finally {
      handleCloseSnackbar();
    }
  };

  /** 🔹 Fermeture du Snackbar */
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setShowInput(false);
  };

  /** 🔹 Ferme automatiquement le Snackbar après 5 secondes (si pas de saisie) */
  useEffect(() => {
    if (snackbarOpen && !showInput) {
      const timer = setTimeout(() => {
        handleCloseSnackbar();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [snackbarOpen, showInput]);

  return (
    <Box>
      {/* Bouton d'ajout de post-it */}
      <Tooltip title="Ajouter un post-it">
        <IconButton color="primary" onClick={handleAddPostit}>
          <NoteAddIcon />
        </IconButton>
      </Tooltip>

      {/* Snackbar affiché après l'ajout du post-it */}
      <Snackbar open={snackbarOpen} onClose={handleCloseSnackbar}>
        <SnackbarContent
          message={
            showInput ? (
              <TextField
                size="small"
                variant="outlined"
                placeholder="Ajouter un commentaire..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onBlur={handleSaveComment}
                onKeyDown={(e) => e.key === "Enter" && handleSaveComment()}
                autoFocus
                sx={{
                  width: 220,
                  bgcolor: "background.paper",
                  border: "1px solid #ccc",
                  borderRadius: 1,
                  p: 1,
                }}
              />
            ) : (
              "Post-it ajouté"
            )
          }
          action={
            !showInput && (
              <Tooltip title="Ajouter un commentaire">
                <IconButton color="secondary" onClick={handleEditComment}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
            )
          }
        />
      </Snackbar>
    </Box>
  );
};

export default AddPostitButton;
