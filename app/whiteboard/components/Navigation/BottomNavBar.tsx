"use client";
import {
  BottomNavigation,
  BottomNavigationAction,
  useTheme,
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import PollIcon from "@mui/icons-material/Poll";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import LockIcon from "@mui/icons-material/Lock";
import LogoutIcon from "@mui/icons-material/Logout";
import { useCurrentView } from "@/hooks/whiteboard/useCurrentView";
import { useCoach } from "@/hooks/whiteboard/useCoach";
import { useSession } from "@/hooks/whiteboard/useSession";
import { useConnectedAvatars } from "@/hooks/whiteboard/useConnectedAvatars";
export default function BottomNavBar({
  participantAvatar,
  setParticipantAvatar,
}: {
  participantAvatar: number | null;
  setParticipantAvatar: (id: number | null) => void;
}) {
  const { currentView, changeView } = useCurrentView();
  const { isCoach, handleLogout } = useCoach();

  const { setConnectedAvatars } = useConnectedAvatars();
  const theme = useTheme();
  const { closeAllSessions } = useSession(
    participantAvatar,
    setParticipantAvatar,
    setConnectedAvatars
  );
  const handleChange = (_: React.SyntheticEvent, newValue: string) => {
    if (!isCoach) return; // 🚫 Participants ne peuvent pas changer la vue
    if (newValue === "closeSessions") closeAllSessions();
    else if (newValue === "logout") handleLogout();
    else changeView(newValue);
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
      <BottomNavigationAction
        label="Coaching 4 zones"
        value="coaching"
        icon={<DescriptionIcon />}
        disabled={!isCoach} // 🔒 Participants voient mais ne cliquent pas
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
