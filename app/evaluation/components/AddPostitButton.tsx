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
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleAddPostit = async () => {
    if (!currentWord) return;

    const wordid = currentWord.wordid ?? 0;
    const wordText = currentWord.text ?? "Post-it";
    const timestamp = currentWord.startTime ?? 0;

    const newPostitId = await addPostit(wordid, wordText, timestamp);

    console.log("🔹 ID du post-it ajouté:", newPostitId);

    if (typeof newPostitId === "number") {
      setLastPostitId(newPostitId);
      setSnackbarOpen(true);
      setShowInput(false);
      setComment("");

      // ⏳ Timeout pour masquer le Snackbar
      const id = setTimeout(() => {
        if (!showInput) setSnackbarOpen(false);
      }, 5000);
      setTimeoutId(id);
    } else {
      console.error("❌ Erreur lors de l'ajout du post-it.");
    }
  };

  const handleEditComment = () => {
    setShowInput(true);
    setSnackbarOpen(true); // Assure que le Snackbar reste ouvert
    if (timeoutId) clearTimeout(timeoutId);
  };

  const handleSaveComment = async () => {
    console.log("📝 Tentative de mise à jour avec ID:", lastPostitId);
    if (lastPostitId && comment.trim() !== "") {
      await updatePostit(lastPostitId, { text: comment });
    }

    setSnackbarOpen(false);
    setShowInput(false);
  };

  return (
    <Box>
      {/* Bouton d'ajout de post-it */}
      <Tooltip title="Ajouter un post-it">
        <IconButton color="primary" onClick={handleAddPostit}>
          <NoteAddIcon />
        </IconButton>
      </Tooltip>

      {/* Snackbar affiché après l'ajout du post-it */}
      <Snackbar open={snackbarOpen} onClose={() => setSnackbarOpen(false)}>
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
                onKeyPress={(e) => {
                  if (e.key === "Enter") handleSaveComment();
                }}
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
