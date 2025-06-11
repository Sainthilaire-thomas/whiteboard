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
import LogoutIcon from "@mui/icons-material/Logout";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useRouter } from "next/navigation";
import CoachingFourZones from "./components/CoachingFourZone/CoachingFourZones";
import { useCoach } from "@/hooks/whiteboard/useCoach";
import Sondage from "./components/Sondage/Sondage";
import PostIt from "./components/Postits/PostIt";
import BottomNavBar from "./components/Navigation/BottomNavBar";
import { useThemeMode } from "../components/common/Theme/ThemeProvider";
import AvatarSelector from "./components/Avatar/AvatarSelector";
import { useConnectedAvatars } from "@/hooks/whiteboard/useConnectedAvatars";
import { useSession } from "@/hooks/whiteboard/useSession";
import { useCurrentView } from "@/hooks/whiteboard/useCurrentView";
// ✅ NOUVEAU : Import du composant d'évaluation partagée
import { SharedEvaluationViewer } from "./components/SharedEvaluation";

// ✅ NOUVEAU : Composant pour l'ancienne vue Transcript (si elle existe encore)
// Vous pouvez remplacer par le vrai composant Transcript
const TranscriptView = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4" gutterBottom>
      Vue Transcript
    </Typography>
    <Typography color="text.secondary">
      Composant Transcript à implémenter ou existant à importer
    </Typography>
  </Box>
);

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
  const [comments, setComments] = useState<string[]>([]);

  // ✅ Utilisation du Context Provider existant
  const { currentView, changeView } = useCurrentView();

  const {
    isAvatarSelected,
    selectAvatar,
    skipAvatarSelection,
    leaveSession,
    closeAllSessions,
  } = useSession(participantAvatar, setParticipantAvatar, setConnectedAvatars);

  // ✅ NOUVEAU : Gestion du retour vers whiteboard depuis l'évaluation partagée
  const handleBackToWhiteboard = useCallback(() => {
    changeView("coaching"); // Retour à la vue coaching
  }, [changeView]);

  // ✅ NOUVEAU : ID de la whiteboard pour filtrer les sessions (optionnel)
  const whiteboardId = useMemo(() => {
    // Vous pouvez générer un ID unique pour cette session whiteboard
    // ou utiliser l'ID du coach, ou tout autre identifiant pertinent
    return coach?.id || undefined;
  }, [coach]);

  // ✅ Fonction pour obtenir le titre selon la vue
  const getViewTitle = (view: string) => {
    switch (view) {
      case "Transcript":
        return "Transcript";
      case "coaching":
        return "Coaching 4 Zones";
      case "sondage":
        return "Sondage";
      case "postit":
        return "Post-it";
      case "shared-evaluation":
        return "Évaluation Partagée";
      default:
        return "Tableau Blanc";
    }
  };

  const renderSelectedComponent = () => {
    switch (currentView) {
      case "Transcript":
        return <TranscriptView />;
      case "coaching":
        return <CoachingFourZones />;
      case "sondage":
        return <Sondage />;
      case "postit":
        return <PostIt />;
      // ✅ NOUVEAU : Case pour l'évaluation partagée
      case "shared-evaluation":
        return (
          <SharedEvaluationViewer
            onBackToWhiteboard={handleBackToWhiteboard}
            whiteboardId={whiteboardId}
          />
        );
      default:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" color="error">
              Vue inconnue: {currentView}
            </Typography>
            <Typography color="text.secondary">
              Cette vue n'est pas encore implémentée.
            </Typography>
          </Box>
        );
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
            {/* ✅ NOUVEAU : Titre dynamique selon la vue */}
            {getViewTitle(currentView)}
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
      <Box
        sx={{
          flexGrow: 1,
          // ✅ NOUVEAU : Padding conditionnel (évaluation partagée gère son propre padding)
          p: currentView === "shared-evaluation" ? 0 : 3,
        }}
      >
        {renderSelectedComponent()}
      </Box>

      {/* ✅ Bottom Navigation avec actions */}
      <BottomNavBar
        participantAvatar={participantAvatar}
        setParticipantAvatar={setParticipantAvatar}
        whiteboardId={whiteboardId} // ✅ NOUVEAU : Passer l'ID pour détecter les sessions
      />

      {/* ✅ AvatarSelector si pas d'avatar sélectionné */}
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
