"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  IconButton,
  Drawer,
  Button,
  AppBar,
  Toolbar,
  Avatar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { supabaseClient } from "@lib/supabaseClient";
import { useRouter } from "next/navigation";

import { useCoach } from "@/hooks/useCoach";
import NewCallUploader from "./NewCallUploader";
import Transcript from "./Transcript";
import { useThemeMode } from "./ThemeProvider"; // ✅ Gestion du dark/light mode
import AvatarSelector from "./AvatarSelector";
import { useConnectedAvatars } from "@/hooks/useConnectedAvatars";
import { useSession } from "@/hooks/useSession";

export default function Whiteboard() {
  const [participantAvatar, setParticipantAvatar] = useState<number | null>(
    null
  );
  const { connectedAvatars, setConnectedAvatars } = useConnectedAvatars();

  const [pseudo, setPseudo] = useState("Participant");

  const { coach, isCoach, handleLogout } = useCoach();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const router = useRouter();
  const { mode, toggleTheme } = useThemeMode();
  const [comments, setComments] = useState<string[]>([]); // ✅ Ajout du state pour les commentaires

  const {
    isAvatarSelected,
    setIsAvatarSelected,
    leaveSession,
    closeAllSessions,
  } = useSession(participantAvatar, setParticipantAvatar);

  useEffect(() => {
    const checkExistingSession = async () => {
      const savedAvatar = localStorage.getItem("participantAvatar");
      if (!savedAvatar) return;

      const avatarId = parseInt(savedAvatar);
      const { data, error } = await supabaseClient
        .schema("whiteboard")
        .from("sessions")
        .select("idavatar, url")
        .eq("idavatar", avatarId)
        .single();

      if (!error && data) {
        setParticipantAvatar(avatarId);
        setIsAvatarSelected(true);
      } else {
        console.warn("🚫 Aucune session existante trouvée.");
        setIsAvatarSelected(false);
      }
    };

    checkExistingSession();
  }, []);

  const handleAvatarSelect = async (avatarId: number | null) => {
    if (avatarId === null) return;

    // Vérifie si l'avatar est déjà utilisé dans une session active
    const { data: existingSession } = await supabaseClient
      .schema("whiteboard")
      .from("sessions")
      .select("idavatar")
      .eq("idavatar", avatarId)
      .maybeSingle();

    if (existingSession) {
      alert("⚠️ Cet avatar est déjà utilisé par un autre participant !");
      return;
    }

    setParticipantAvatar(avatarId);
    localStorage.setItem("participantAvatar", avatarId.toString());

    const { data, error } = await supabaseClient
      .from("avatars")
      .select("nom, url")
      .eq("idavatar", avatarId)
      .single();

    if (!error && data) {
      // Ajout de la session
      await supabaseClient.schema("whiteboard").from("sessions").insert({
        idavatar: avatarId,
        nom: data.nom,
        url: data.url,
      });

      setConnectedAvatars((prev) => [...prev, { id: avatarId, url: data.url }]);
      setIsAvatarSelected(true);
    } else {
      console.error("❌ Erreur lors de la récupération de l'avatar :", error);
    }
  };

  const handleSkipAvatar = () => {
    setIsAvatarSelected(true); // ✅ On considère que l'utilisateur peut accéder au Whiteboard sans avatar
  };

  const handleCallUploaded = useCallback(() => {
    setTranscript("Texte de la transcription générée...");
  }, []);

  const renderedAvatars = useMemo(
    () =>
      connectedAvatars.map((avatar) => (
        <Avatar
          key={avatar.id}
          src={avatar.url}
          sx={{ width: 40, height: 40 }}
        />
      )),
    [connectedAvatars]
  );
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* ✅ AppBar avec menu et mode dark/light */}
      <AppBar position="static">
        <Toolbar>
          {/* 🔹 Icône "Se connecter (Coach)" à gauche */}
          {!isCoach && (
            <IconButton color="inherit" onClick={() => router.push("/login")}>
              <LoginIcon />
            </IconButton>
          )}

          {isCoach && (
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setIsDrawerOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Tableau Blanc
          </Typography>

          {/* 🔹 Affichage des avatars des participants connectés */}
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            {renderedAvatars}

            {/* 🔹 Bouton de changement de thème */}
            <IconButton color="inherit" onClick={toggleTheme}>
              {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>

            {/* 🔹 Icône pour quitter la session */}
            <IconButton color="error" onClick={leaveSession}>
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* ✅ Drawer pour uploader un appel (visible uniquement par le coach) */}
      {isCoach && (
        <Drawer
          anchor="left"
          open={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        >
          <Box sx={{ width: 300, p: 2 }}>
            <Typography variant="h6">Uploader un appel</Typography>
            <NewCallUploader onUpload={handleCallUploaded} />
          </Box>
        </Drawer>
      )}

      {/* ✅ Zone principale */}
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {transcript ? (
          <Transcript
            transcript={transcript}
            addComment={(text: string) => {
              setComments((prev: string[]) => [...prev, text]); // ✅ Ajout du callback pour les commentaires
            }}
          />
        ) : (
          <Typography variant="body1" color="text.secondary">
            Aucun appel chargé.
          </Typography>
        )}
      </Box>

      {/* ✅ Bouton de déconnexion pour le coach */}
      {isCoach && (
        <Box sx={{ position: "absolute", bottom: 16, right: 16 }}>
          <Button variant="contained" color="secondary" onClick={handleLogout}>
            Se déconnecter
          </Button>
          <Button variant="contained" color="error" onClick={closeAllSessions}>
            Fermer toutes les sessions
          </Button>
        </Box>
      )}

      {!isCoach && !isAvatarSelected && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            bgcolor: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1300,
          }}
        >
          <Box sx={{ p: 3, borderRadius: 2 }}>
            <AvatarSelector
              connectedAvatars={connectedAvatars}
              onSelect={handleAvatarSelect}
              onClose={handleSkipAvatar}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}
