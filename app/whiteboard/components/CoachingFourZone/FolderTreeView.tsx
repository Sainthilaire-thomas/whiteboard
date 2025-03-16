"use client";

import { useEffect, useState } from "react";
import { SimpleTreeView } from "@mui/x-tree-view";
import { TreeItem } from "@mui/x-tree-view";
import { Box, Typography } from "@mui/material";

// ✅ Types pour les fichiers et les nœuds de l'arborescence
import { FileNode } from "./types";

// ✅ Formats de fichiers supportés
const supportedAudioFormats = [".mp3", ".ogg", ".wav"];
const transcriptionFormat = ".json";

// ✅ Typage des props
interface FolderTreeViewProps {
  onFileSelect: (file: FileNode, type: "audio" | "transcription") => void;
}

const FolderTreeView = ({ onFileSelect }: FolderTreeViewProps) => {
  const [treeData, setTreeData] = useState<FileNode[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<{
    audio: FileNode | null;
    transcription: FileNode | null;
  }>({
    audio: null,
    transcription: null,
  });

  // ✅ Ajoute des IDs uniques aux nœuds pour éviter les collisions
  const existingIds = new Set<string>();
  const addUniqueIds = (node: any, parentId = ""): FileNode => {
    const originalId = node.id ?? `${parentId}-${node.name}`;
    let uniqueId = originalId;

    while (existingIds.has(uniqueId)) {
      uniqueId = `${originalId}-${Math.random().toString(36).substring(2, 6)}`;
    }

    existingIds.add(uniqueId);

    const children = Array.isArray(node.children)
      ? node.children.map((child: any) => addUniqueIds(child, uniqueId))
      : [];

    return { ...node, id: uniqueId, originalId, children };
  };

  // ✅ Charge les données du localStorage
  useEffect(() => {
    const dataFromStorage = localStorage.getItem("workdriveTree");

    if (dataFromStorage) {
      try {
        const parsedData = JSON.parse(dataFromStorage);
        const structuredData = [addUniqueIds(parsedData)];
        setTreeData(structuredData);
      } catch (error) {
        console.error("❌ Erreur de parsing JSON :", error);
      }
    }
  }, []);

  // ✅ Gestion des clics sur les fichiers
  const handleFileClick = (file: FileNode) => {
    const isAudio = supportedAudioFormats.some((format) =>
      file.name.toLowerCase().endsWith(format)
    );
    const isTranscription = file.name
      .toLowerCase()
      .endsWith(transcriptionFormat);

    if (isAudio) {
      setSelectedFiles((prev) => ({ ...prev, audio: file }));
      onFileSelect(file, "audio");
    } else if (isTranscription) {
      setSelectedFiles((prev) => ({ ...prev, transcription: file }));
      onFileSelect(file, "transcription");
    }
  };

  // ✅ Fonction récursive pour afficher l'arborescence
  const renderTree = (nodes: FileNode[]) =>
    nodes.map((node) => (
      <TreeItem
        key={node.id}
        itemId={node.id}
        label={
          <Typography
            sx={{
              fontWeight:
                selectedFiles.audio?.id === node.id ||
                selectedFiles.transcription?.id === node.id
                  ? "bold"
                  : "normal",
              color:
                selectedFiles.audio?.id === node.id
                  ? "primary.main"
                  : selectedFiles.transcription?.id === node.id
                  ? "secondary.main"
                  : "inherit",
            }}
          >
            {node.name}
          </Typography>
        }
        onClick={() => handleFileClick(node)}
      >
        {node.children && node.children.length > 0 && renderTree(node.children)}
      </TreeItem>
    ));

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        📂 Arborescence des Dossiers
      </Typography>
      <Box
        sx={{
          maxHeight: "500px",
          overflowY: "auto",
          border: "1px solid #ddd",
          padding: "8px",
          borderRadius: "4px",
        }}
      >
        {treeData.length > 0 ? (
          <SimpleTreeView aria-label="arborescence des dossiers">
            {renderTree(treeData)}
          </SimpleTreeView>
        ) : (
          <Typography variant="body2">📭 Aucune donnée disponible</Typography>
        )}
      </Box>

      {/* ✅ Affichage des fichiers sélectionnés */}
      <Box sx={{ marginTop: 2 }}>
        {selectedFiles.audio && (
          <Typography>
            <strong>Fichier audio sélectionné :</strong>{" "}
            {selectedFiles.audio.name}
          </Typography>
        )}
        {selectedFiles.transcription && (
          <Typography>
            <strong>Fichier transcription sélectionné :</strong>{" "}
            {selectedFiles.transcription.name}
          </Typography>
        )}
      </Box>
    </div>
  );
};

export default FolderTreeView;
