"use client";

import { useState } from "react";
import { useZoho } from "@/context/ZohoContext";
import AuthButton from "./AuthButton";
import FolderTreeView from "./FolderTreeView";
import { fetchWorkDriveTree } from "./WorkDriveUtils";
import {
  Modal,
  Box,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import { FileNode } from "@/app/whiteboard/components/CoachingFourZone/types";

export interface AudioListProps {
  onFileSelect: (file: FileNode, type: "audio" | "transcription") => void;
}

const AudioList = ({ onFileSelect }: AudioListProps) => {
  const { accessToken } = useZoho();
  const [modalOpen, setModalOpen] = useState(false);
  const [lastFetchDate, setLastFetchDate] = useState(
    localStorage.getItem("lastFetchDate") || "Jamais"
  );
  const [loading, setLoading] = useState(false);
  const [isAccessTokenExpired, setIsAccessTokenExpired] = useState(false);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  const handleFetchTree = async () => {
    setLoading(true);

    if (!accessToken) {
      console.warn("⚠️ AccessToken manquant. Veuillez vous authentifier.");
      setIsAccessTokenExpired(true);
      setLoading(false);
      return;
    }

    try {
      const rootFolderId = "ly5m40e0e2d4ae7604a1fa0f5d42905cb94c9";
      await fetchWorkDriveTree(rootFolderId, accessToken);
      const currentDate = new Date().toLocaleString();
      setLastFetchDate(currentDate);
      localStorage.setItem("lastFetchDate", currentDate);
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération de l'arborescence :",
        error
      );
      setIsAccessTokenExpired(true);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (
    file: FileNode,
    type: "audio" | "transcription"
  ) => {
    const safeFile: FileNode = {
      id: file.id,
      name: file.name || "Fichier sans nom",
      type: file.type ?? "file", // ✅ Assurez-vous que le type est toujours défini
      mimeType: file.mimeType,
      size: file.size,
      children: file.children ?? [], // ✅ Valeur par défaut
    };

    onFileSelect(safeFile, type); // ✅ Passe un objet FileNode conforme
  };

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        📂 Fichiers Audio
      </Typography>

      {isAccessTokenExpired && (
        <Typography variant="caption" color="error">
          🚫 Token expiré. Veuillez vous reconnecter.
        </Typography>
      )}

      <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        <AuthButton onSuccess={() => setIsAccessTokenExpired(false)} />
        <Button
          variant="contained"
          color="primary"
          onClick={handleFetchTree}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "🔄 Rafraîchir"}
        </Button>
        <Typography variant="caption">
          🕒 Dernier rafraîchissement : {lastFetchDate}
        </Typography>
        <Button variant="outlined" color="secondary" onClick={handleOpenModal}>
          📁 Voir l'arborescence
        </Button>
      </Box>

      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6">📂 Arborescence des Dossiers</Typography>
          <FolderTreeView onFileSelect={handleFileSelect} />
        </Box>
      </Modal>
    </div>
  );
};

export default AudioList;
