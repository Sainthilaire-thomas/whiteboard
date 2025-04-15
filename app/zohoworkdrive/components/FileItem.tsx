"use client";

import { ZohoFile } from "../types/zoho";
import { FolderIcon, FileIcon, DownloadIcon } from "./Icons";
import { clientGetDownloadUrl } from "../lib/zohoworkdrive/api";
import { useState } from "react";
import { getToken } from "../utils/storage";

interface FileItemProps {
  file: ZohoFile;
  onFolderClick: (folderId: string) => void;
}

// Fonction pour formater la taille du fichier
const formatFileSize = (bytes?: number): string => {
  if (bytes === undefined) return "N/A";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
};

// Fonction pour formater la date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
};

export default function FileItem({ file, onFolderClick }: FileItemProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      setDownloading(true);
      const token = getToken();

      if (!token) {
        throw new Error("No token found, please authenticate");
      }

      const downloadUrl = await clientGetDownloadUrl(token, file.id);

      // Ouvrir l'URL de téléchargement dans un nouvel onglet
      window.open(downloadUrl, "_blank");
    } catch (error) {
      console.error("Download error:", error);
      alert(
        `Failed to download: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setDownloading(false);
    }
  };

  const handleClick = () => {
    if (file.type === "folder") {
      onFolderClick(file.id);
    }
  };

  return (
    <div
      className={`flex items-center p-3 border-b hover:bg-gray-50 ${
        file.type === "folder" ? "cursor-pointer" : ""
      }`}
      onClick={handleClick}
    >
      <div className="flex-shrink-0 mr-3">
        {file.type === "folder" ? <FolderIcon /> : <FileIcon />}
      </div>

      <div className="flex-grow min-w-0">
        <div className="font-medium truncate">{file.name}</div>
        <div className="text-xs text-gray-500">
          {formatDate(file.modifiedTime)}
          {file.size !== undefined && ` • ${formatFileSize(file.size)}`}
        </div>
      </div>

      {file.type === "file" && (
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex-shrink-0 ml-2 p-2 text-blue-500 hover:text-blue-700 rounded"
          aria-label="Download file"
        >
          <DownloadIcon />
        </button>
      )}
    </div>
  );
}
