"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Avatar,
  Button,
  Typography,
  Grid,
  CircularProgress,
  useTheme,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { supabaseClient } from "@lib/supabaseClient";
import { useThemeMode } from "../../../components/common/Theme/ThemeProvider";

interface AvatarSelectorProps {
  connectedAvatars: { id: number; url: string }[];
  onSelect: (avatarId: number | null) => void;
  onClose: () => void;
}

export default function AvatarSelector({
  connectedAvatars,
  onSelect,
  onClose,
}: AvatarSelectorProps) {
  const [avatars, setAvatars] = useState<
    { idavatar: number; url: string; nom: string }[]
  >([]);
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const { toggleTheme } = useThemeMode();

  useEffect(() => {
    const fetchAvatars = async () => {
      const { data, error } = await supabaseClient
        .from("avatars")
        .select("*")
        .eq("anonyme", true);

      if (error) {
        console.error("❌ Erreur lors de la récupération des avatars :", error);
      } else {
        setAvatars(data || []);
      }
      setLoading(false);
    };

    fetchAvatars();
  }, []);

  const handleAvatarClick = (avatarId: number, isUsed: boolean) => {
    if (!isUsed) {
      setSelectedAvatar(avatarId); // ✅ Sélectionne l'avatar si disponible
    }
  };

  const handleValidate = () => {
    if (selectedAvatar !== null) {
      onSelect(selectedAvatar); // ✅ Déclenche la sélection validée
    }
  };

  return (
    <Box
      textAlign="center"
      sx={{
        bgcolor: theme.palette.background.default,
        color: theme.palette.text.primary,
        p: 3,
        borderRadius: 2,
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{ position: "absolute", top: 8, right: 8 }}
      >
        <CloseIcon />
      </IconButton>
      <Typography variant="h6" gutterBottom>
        Choisissez un avatar :
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={2} justifyContent="center">
          {avatars.map((avatar) => {
            const isUsed = connectedAvatars.some(
              (a) => a.id === avatar.idavatar
            );

            return (
              <Grid item key={`avatar-${avatar.idavatar}`}>
                <Avatar
                  src={avatar.url}
                  alt={avatar.nom}
                  sx={{
                    width: 64,
                    height: 64,
                    opacity: isUsed ? 0.4 : 1,
                    cursor: isUsed ? "not-allowed" : "pointer",
                    border:
                      selectedAvatar === avatar.idavatar
                        ? "2px solid #1976d2"
                        : "none",
                    transition: "all 0.2s ease",
                  }}
                  onClick={() => handleAvatarClick(avatar.idavatar, isUsed)}
                />
                <Typography variant="caption">{avatar.nom}</Typography>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={handleValidate}
        disabled={selectedAvatar === null}
        sx={{ mt: 2 }}
      >
        Valider
      </Button>
    </Box>
  );
}
