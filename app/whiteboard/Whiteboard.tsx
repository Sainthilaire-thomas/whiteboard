"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  IconButton,
  Drawer,
  AppBar,
  Toolbar,
  Avatar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout"; // Assure-toi que l'import est présent

import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useRouter } from "next/navigation";
import CoachingFourZones from "./components/CoachingFourZone/CoachingFourZones";
import { useCoach } from "@/hooks/whiteboard/useCoach";
import Sondage from "./components/Sondage/Sondage";
import PostIt from "./components/Postits/PostIt";
import BottomNavBar from "./components/Navigation/BottomNavBar";
import { useThemeMode } from "../components/common/Theme/ThemeProvider"; // ✅ Gestion du dark/light mode
import AvatarSelector from "./components/Avatar/AvatarSelector";
import { useConnectedAvatars } from "@/hooks/whiteboard/useConnectedAvatars";
import { useSession } from "@/hooks/whiteboard/useSession";
import { useCurrentView } from "@/hooks/whiteboard/useCurrentView";

export default function Whiteboard() {
  const [participantAvatar, setParticipantAvatar] = useState<number | null>(
    null
  );
  const { connectedAvatars, setConnectedAvatars } = useConnectedAvatars();

  const [pseudo, setPseudo] = useState("Participant");

  const { coach, isCoach, handleLogout } = useCoach();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const router = useRouter();
  const { mode, toggleTheme } = useThemeMode();
  const [comments, setComments] = useState<string[]>([]); // ✅ Ajout du state pour les commentaires
  const { currentView } = useCurrentView();
  const {
    isAvatarSelected,
    selectAvatar,
    skipAvatarSelection,
    leaveSession,
    closeAllSessions,
  } = useSession(participantAvatar, setParticipantAvatar, setConnectedAvatars);

  const renderSelectedComponent = () => {
    switch (currentView) {
      case "coaching":
        return <CoachingFourZones />;
      case "sondage":
        return <Sondage />;
      case "postit":
        return <PostIt />;
      default:
        return null;
    }
  };

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
      {/* ✅ AppBar avec menu et thème */}
      <AppBar position="static">
        <Toolbar>
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

          {/* 🔹 Avatars & Thème */}
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            {renderedAvatars}

            {/* 🌙 Bouton de changement de thème */}
            <IconButton
              color="inherit"
              onClick={toggleTheme}
              title="Changer le thème"
            >
              {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>

            {/* 🚪 Bouton de déconnexion pour les participants */}
            {!isCoach && isAvatarSelected && (
              <IconButton
                color="error"
                onClick={leaveSession}
                title="Quitter la session"
                sx={{ ml: 1 }}
              >
                <LogoutIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* ✅ Zone principale avec affichage dynamique */}
      <Box sx={{ flexGrow: 1, p: 3 }}>{renderSelectedComponent()}</Box>

      {/* ✅ Bottom Navigation avec actions */}
      <BottomNavBar
        participantAvatar={participantAvatar}
        setParticipantAvatar={setParticipantAvatar}
      />

      {/* ✅ AvatarSelector si pas d’avatar sélectionné */}
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
              onSelect={selectAvatar}
              onClose={skipAvatarSelection}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}
