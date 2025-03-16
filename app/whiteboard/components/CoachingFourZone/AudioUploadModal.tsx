import { useState, ChangeEvent } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  CircularProgress,
} from "@mui/material";

// Interface pour typer les props
interface AudioUploadModalProps {
  open: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
}

const AudioUploadModal: React.FC<AudioUploadModalProps> = ({
  open,
  onClose,
  onUpload,
}) => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length) {
      setAudioFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!audioFile) {
      console.error("❌ Aucun fichier audio sélectionné");
      return;
    }

    setIsUploading(true);
    try {
      await onUpload(audioFile);
    } catch (error) {
      console.error(
        "❌ Erreur lors du téléchargement :",
        (error as Error).message
      );
    } finally {
      setIsUploading(false);
      onClose();
    }
  };

  const handleModalClose = () => {
    onClose();

    // Remet le focus sur un bouton spécifique après fermeture
    const focusButton = document.getElementById("focusButtonAfterModal");
    if (focusButton) focusButton.focus();
  };

  return (
    <Dialog open={open} onClose={handleModalClose}>
      <DialogTitle>Associer un fichier audio</DialogTitle>
      <DialogContent>
        <TextField
          type="file"
          inputProps={{ accept: "audio/*" }}
          onChange={handleFileChange}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleModalClose} disabled={isUploading}>
          Annuler
        </Button>
        <Button onClick={handleUpload} disabled={!audioFile || isUploading}>
          {isUploading ? <CircularProgress size={24} /> : "Charger"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AudioUploadModal;
