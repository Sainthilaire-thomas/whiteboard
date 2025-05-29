// app/evaluation/admin/components/AdminToolbar.tsx
"use client";

import React from "react";
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Chip,
  CircularProgress,
  ButtonGroup,
} from "@mui/material";
import {
  Add,
  Edit,
  Save,
  Cancel,
  Refresh,
  Delete,
  Visibility,
} from "@mui/icons-material";
import { AdminMode } from "../types/admin";

interface AdminToolbarProps {
  mode: AdminMode;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  saving?: boolean;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  hasSelection?: boolean;
  onModeChange: (mode: AdminMode) => void;
  onSave?: () => void;
  onCreate?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onRefresh?: () => void;
  onCancel?: () => void;
}

export const AdminToolbar: React.FC<AdminToolbarProps> = ({
  mode,
  title,
  subtitle,
  loading = false,
  saving = false,
  canCreate = true,
  canEdit = true,
  canDelete = false,
  hasSelection = false,
  onModeChange,
  onSave,
  onCreate,
  onEdit,
  onDelete,
  onRefresh,
  onCancel,
}) => {
  const isEditing = mode === "edit" || mode === "create";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        p: 2,
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        position: "sticky",
        top: 0,
        zIndex: 1,
      }}
    >
      {/* Titre et statut */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {title && (
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <span style={{ fontWeight: "medium" }}>{title}</span>
              <Chip
                label={
                  mode === "view"
                    ? "Lecture"
                    : mode === "edit"
                    ? "Modification"
                    : "Création"
                }
                color={
                  mode === "view"
                    ? "default"
                    : mode === "edit"
                    ? "warning"
                    : "success"
                }
                size="small"
              />
            </Box>
            {subtitle && (
              <Box
                sx={{ color: "text.secondary", fontSize: "0.875rem", mt: 0.5 }}
              >
                {subtitle}
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Actions */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {/* Actions en mode lecture */}
        {mode === "view" && (
          <>
            {onRefresh && (
              <Tooltip title={loading ? "" : "Actualiser"}>
                <span>
                  <IconButton onClick={onRefresh} disabled={loading}>
                    <Refresh />
                  </IconButton>
                </span>
              </Tooltip>
            )}

            <ButtonGroup variant="outlined" size="small">
              {canCreate && onCreate && (
                <Button
                  startIcon={<Add />}
                  onClick={onCreate}
                  disabled={loading}
                >
                  Créer
                </Button>
              )}

              {canEdit && onEdit && (
                <Tooltip
                  title={
                    loading || !hasSelection
                      ? ""
                      : "Modifier l'élément sélectionné"
                  }
                >
                  <span>
                    <Button
                      startIcon={<Edit />}
                      onClick={onEdit}
                      disabled={loading || !hasSelection}
                    >
                      Modifier
                    </Button>
                  </span>
                </Tooltip>
              )}

              {canDelete && onDelete && (
                <Tooltip
                  title={
                    loading || !hasSelection
                      ? ""
                      : "Supprimer les éléments sélectionnés"
                  }
                >
                  <span>
                    <Button
                      startIcon={<Delete />}
                      onClick={onDelete}
                      disabled={loading || !hasSelection}
                      color="error"
                    >
                      Supprimer
                    </Button>
                  </span>
                </Tooltip>
              )}
            </ButtonGroup>
          </>
        )}

        {/* Actions en mode édition/création */}
        {isEditing && (
          <ButtonGroup size="small">
            {onCancel && (
              <Button
                startIcon={<Cancel />}
                onClick={onCancel}
                disabled={saving}
                variant="outlined"
              >
                Annuler
              </Button>
            )}

            {onSave && (
              <Button
                startIcon={saving ? <CircularProgress size={16} /> : <Save />}
                onClick={onSave}
                disabled={saving}
                variant="contained"
              >
                {saving ? "Sauvegarde..." : "Sauvegarder"}
              </Button>
            )}
          </ButtonGroup>
        )}
      </Box>
    </Box>
  );
};
