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
import { useThemeMode } from "./ThemeProvider"; // 🔹 Importation du mode dark/light

// ✅ Définition du type des props
interface AvatarSelectorProps {
  onSelect: (avatarId: number | null) => void;
  onClose: () => void;
}

export default function AvatarSelector({
  onSelect,
  onClose,
}: AvatarSelectorProps) {
  const [avatars, setAvatars] = useState<
    { idavatar: number; url: string; nom: string }[]
  >([]);
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme(); // 🎨 Récupération du thème actuel
  const { toggleTheme } = useThemeMode(); // 🌗 Gestion du mode sombre

  useEffect(() => {
    const fetchAvatars = async () => {
      console.log("🔍 Récupération des avatars...");
      const { data, error } = await supabaseClient
        .from("avatars")
        .select("*")
        .eq("anonyme", true);

      if (error) {
        console.error("❌ Erreur lors de la récupération des avatars :", error);
      } else {
        console.log("✅ Avatars récupérés :", data);
        setAvatars(data || []);
      }
      setLoading(false);
    };

    fetchAvatars();
  }, []);

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
          {avatars.map((avatar) => (
            <Grid item key={avatar.idavatar}>
              <Avatar
                src={avatar.url}
                alt={avatar.nom}
                sx={{
                  width: 64,
                  height: 64,
                  cursor: "pointer",
                  border:
                    selectedAvatar === avatar.idavatar
                      ? `3px solid ${theme.palette.primary.main}`
                      : "none",
                  transition: "0.2s",
                  "&:hover": {
                    transform: "scale(1.1)",
                    boxShadow: `0px 0px 10px ${theme.palette.primary.light}`,
                  },
                }}
                onClick={() => setSelectedAvatar(avatar.idavatar)}
              />
              <Typography variant="caption">{avatar.nom}</Typography>
            </Grid>
          ))}
        </Grid>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          if (selectedAvatar !== null) {
            onSelect(selectedAvatar);
          }
        }}
        disabled={selectedAvatar === null}
        sx={{ mt: 2 }}
      >
        Valider
      </Button>
    </Box>
  );
}
