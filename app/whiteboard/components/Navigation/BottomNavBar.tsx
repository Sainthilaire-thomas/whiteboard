"use client";
import {
  BottomNavigation,
  BottomNavigationAction,
  useTheme,
  Badge,
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import PollIcon from "@mui/icons-material/Poll";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import LockIcon from "@mui/icons-material/Lock";
import LogoutIcon from "@mui/icons-material/Logout";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
// ✅ NOUVEAU : Ajout d'une icône pour Transcript
import ArticleIcon from "@mui/icons-material/Article";

import { useCurrentView, ViewName } from "@/hooks/whiteboard/useCurrentView";
import { useCoach } from "@/hooks/whiteboard/useCoach";
import { useSession } from "@/hooks/whiteboard/useSession";
import { useConnectedAvatars } from "@/hooks/whiteboard/useConnectedAvatars";
// ✅ NOUVEAU : Hook pour détecter les sessions actives
import { useSharedEvaluation } from "../../hooks";

interface BottomNavBarProps {
  participantAvatar: number | null;
  setParticipantAvatar: (id: number | null) => void;
  whiteboardId?: string; // ✅ NOUVEAU : ID optionnel pour filtrer les sessions
}

export default function BottomNavBar({
  participantAvatar,
  setParticipantAvatar,
  whiteboardId,
}: BottomNavBarProps) {
  const { currentView, changeView } = useCurrentView();
  const { isCoach, handleLogout } = useCoach();
  const { setConnectedAvatars } = useConnectedAvatars();
  const theme = useTheme(); // ✅ Correction : useTheme au lieu de useThemeMode

  // ✅ NOUVEAU : Hook pour détecter les sessions d'évaluation actives
  const { activeSessions, currentSession } = useSharedEvaluation(whiteboardId);
  const hasActiveSessions = activeSessions.length > 0;

  const { closeAllSessions } = useSession(
    participantAvatar,
    setParticipantAvatar,
    setConnectedAvatars
  );

  const handleChange = (_: React.SyntheticEvent, newValue: string) => {
    if (newValue === "closeSessions") {
      closeAllSessions();
      return;
    }

    if (newValue === "logout") {
      handleLogout();
      return;
    }

    // ✅ NOUVEAU : Permettre aux participants d'accéder à l'évaluation partagée
    if (newValue === "shared-evaluation" && hasActiveSessions) {
      changeView(newValue as ViewName);
      return;
    }

    // Pour les autres vues, seuls les coachs peuvent changer
    if (!isCoach) return;

    // ✅ Validation du type avant changement
    const validViews: ViewName[] = [
      "Transcript",
      "coaching",
      "sondage",
      "postit",
      "shared-evaluation",
    ];

    if (validViews.includes(newValue as ViewName)) {
      changeView(newValue as ViewName);
    } else {
      console.warn(
        "⚠️ Tentative de changement vers une vue invalide:",
        newValue
      );
    }
  };

  return (
    <BottomNavigation
      value={currentView}
      onChange={handleChange}
      showLabels
      sx={{
        borderTop: "1px solid #ccc",
        bgcolor: theme.palette.mode === "dark" ? "grey.900" : "grey.100",
      }}
    >
      {/* ✅ Vue Transcript - Seulement pour les coachs */}
      <BottomNavigationAction
        label="Transcript"
        value="Transcript"
        icon={<ArticleIcon />}
        disabled={!isCoach}
      />

      {/* ✅ Vues traditionnelles - Seulement pour les coachs */}
      <BottomNavigationAction
        label="Coaching 4 zones"
        value="coaching"
        icon={<DescriptionIcon />}
        disabled={!isCoach}
      />
      <BottomNavigationAction
        label="Sondage"
        value="sondage"
        icon={<PollIcon />}
        disabled={!isCoach}
      />
      <BottomNavigationAction
        label="Post-it"
        value="postit"
        icon={<StickyNote2Icon />}
        disabled={!isCoach}
      />

      {/* ✅ NOUVEAU : Évaluation partagée - Visible si sessions actives */}
      {hasActiveSessions && (
        <BottomNavigationAction
          label="Évaluation"
          value="shared-evaluation"
          icon={
            <Badge
              badgeContent={activeSessions.length}
              color="error"
              sx={{
                "& .MuiBadge-badge": {
                  fontSize: "0.6rem",
                  minWidth: "16px",
                  height: "16px",
                },
              }}
            >
              <PlayCircleFilledIcon
                sx={{
                  color:
                    currentSession?.session_mode === "live"
                      ? "error.main"
                      : "inherit",
                }}
              />
            </Badge>
          }
          // ✅ Accessible à tous (coachs et participants)
          disabled={!isCoach}
          sx={{
            // Mise en évidence si session live
            ...(currentSession?.session_mode === "live" && {
              "& .MuiBottomNavigationAction-label": {
                color: "error.main",
                fontWeight: "bold",
              },
            }),
          }}
        />
      )}

      {/* ✅ Actions coach uniquement */}
      {isCoach && [
        <BottomNavigationAction
          key="closeSessions"
          label="Fermer sessions"
          value="closeSessions"
          icon={<LockIcon />}
        />,
        <BottomNavigationAction
          key="logout"
          label="Se déconnecter"
          value="logout"
          icon={<LogoutIcon />}
        />,
      ]}
    </BottomNavigation>
  );
}
