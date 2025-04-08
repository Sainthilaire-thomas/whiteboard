// components/DroppableZone.tsx
import React, { useState, useRef } from "react";
import {
  Paper,
  Box,
  Typography,
  IconButton,
  Card,
  CardContent,
  TextField,
} from "@mui/material";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import AddIcon from "@mui/icons-material/Add";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { SortablePostit } from "./SortablePostit";
import { DroppableZoneProps } from "../types/types";

export const DroppableZone: React.FC<DroppableZoneProps> = ({
  id,
  title,
  backgroundColor,
  postits,
  fontSize,
  onEdit,
  onDelete,
  onAddClick,
  isEntrepriseZone = false,
}) => {
  const [isCreatingPostit, setIsCreatingPostit] = useState<boolean>(false);
  const [newPostitText, setNewPostitText] = useState<string>(
    "Que dites-vous ici ?"
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddClick = () => {
    setIsCreatingPostit(true);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 50);
  };

  const handleInputBlur = () => {
    if (newPostitText.trim() && newPostitText !== "Que dites-vous ici ?") {
      onAddClick(id, newPostitText);
    }
    setIsCreatingPostit(false);
    setNewPostitText("Que dites-vous ici ?");
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (newPostitText.trim() && newPostitText !== "Que dites-vous ici ?") {
        onAddClick(id, newPostitText);
      }
      setIsCreatingPostit(false);
      setNewPostitText("Que dites-vous ici ?");
    } else if (e.key === "Escape") {
      setIsCreatingPostit(false);
      setNewPostitText("Que dites-vous ici ?");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPostitText(e.target.value);
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (newPostitText === "Que dites-vous ici ?") {
      e.target.select();
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 1,
        bgcolor: backgroundColor,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        position: "relative",
        borderLeft: isEntrepriseZone
          ? "4px solid #c0392b"
          : "4px solid #27ae60",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {isEntrepriseZone ? (
            <WarningIcon sx={{ color: "#c0392b", mr: 1 }} fontSize="small" />
          ) : (
            <CheckCircleIcon
              sx={{ color: "#27ae60", mr: 1 }}
              fontSize="small"
            />
          )}
          <Typography variant="subtitle2" fontWeight="bold">
            {title}
          </Typography>
        </Box>
        <IconButton size="small" onClick={handleAddClick}>
          <AddIcon />
        </IconButton>
      </Box>
      <Box sx={{ overflowY: "auto", flex: 1 }}>
        <SortableContext
          items={postits.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          {postits.map((postit) => (
            <SortablePostit
              key={postit.id}
              postit={postit}
              fontSize={fontSize}
              onEdit={onEdit}
              onDelete={onDelete}
              isOriginal={postit.isOriginal}
            />
          ))}
          {isCreatingPostit && (
            <Card style={{ marginBottom: "8px", backgroundColor }}>
              <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
                <TextField
                  fullWidth
                  multiline
                  variant="standard"
                  inputRef={inputRef}
                  value={newPostitText}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  onKeyDown={handleInputKeyDown}
                  onFocus={handleInputFocus}
                  autoFocus
                  InputProps={{
                    style: { fontSize: `${fontSize}px` },
                  }}
                  sx={{
                    "& .MuiInput-underline:before": {
                      borderBottomColor: "transparent",
                    },
                    "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
                      borderBottomColor: "rgba(0, 0, 0, 0.42)",
                    },
                  }}
                />
              </CardContent>
            </Card>
          )}
        </SortableContext>
      </Box>
    </Paper>
  );
};
