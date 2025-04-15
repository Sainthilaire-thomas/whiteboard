import React from "react";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Description as DocumentIcon,
  TableChart as SpreadsheetIcon,
  Slideshow as PresentationIcon,
} from "@mui/icons-material";
import { ZohoFile } from "../types/zoho";
import { formatFileSize } from "../utils/formatters";

// Fonction pour déterminer l'icône en fonction du type de fichier
const getFileIcon = (file: ZohoFile) => {
  if (file.type === "folder") return <FolderIcon color="primary" />;

  const mimeType = file.mimeType?.toLowerCase() || "";
  const fileName = file.name.toLowerCase();

  if (
    mimeType.includes("image") ||
    fileName.endsWith(".jpg") ||
    fileName.endsWith(".png") ||
    fileName.endsWith(".gif")
  )
    return <ImageIcon color="info" />;

  if (mimeType.includes("pdf") || fileName.endsWith(".pdf"))
    return <PdfIcon color="error" />;

  if (
    mimeType.includes("spreadsheet") ||
    mimeType.includes("excel") ||
    fileName.endsWith(".xlsx") ||
    fileName.endsWith(".xls")
  )
    return <SpreadsheetIcon color="success" />;

  if (
    mimeType.includes("presentation") ||
    mimeType.includes("powerpoint") ||
    fileName.endsWith(".pptx") ||
    fileName.endsWith(".ppt")
  )
    return <PresentationIcon color="warning" />;

  if (
    mimeType.includes("document") ||
    mimeType.includes("word") ||
    fileName.endsWith(".docx") ||
    fileName.endsWith(".doc")
  )
    return <DocumentIcon color="primary" />;

  return <FileIcon color="secondary" />;
};

interface FileListProps {
  files: ZohoFile[];
  loading: boolean;
  onFolderClick: (folderId: string) => void;
}

const FileList: React.FC<FileListProps> = ({
  files,
  loading,
  onFolderClick,
}) => {
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height={200}
      >
        <Typography variant="body1">Chargement des fichiers...</Typography>
      </Box>
    );
  }

  if (files.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height={200}
      >
        <Typography variant="body1">Aucun fichier trouvé</Typography>
      </Box>
    );
  }

  return (
    <List dense>
      {files.map((file) => (
        <ListItem
          key={file.id}
          secondaryAction={
            file.type === "file" ? (
              <Tooltip title="Détails du fichier">
                <IconButton edge="end" aria-label="details">
                  <FileIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : null
          }
          onClick={() => {
            if (file.type === "folder") {
              onFolderClick(file.id);
            }
          }}
          sx={{
            cursor: file.type === "folder" ? "pointer" : "default",
            "&:hover":
              file.type === "folder"
                ? {
                    backgroundColor: "action.hover",
                  }
                : {},
          }}
        >
          <ListItemIcon>{getFileIcon(file)}</ListItemIcon>
          <ListItemText
            primary={
              <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                {file.name}
              </Typography>
            }
            secondary={
              <Typography variant="caption" color="text.secondary">
                {file.type === "folder"
                  ? "Dossier"
                  : `${formatFileSize(file.size)} · ${file.createdTime}`}
              </Typography>
            }
          />
        </ListItem>
      ))}
    </List>
  );
};

export default FileList;
