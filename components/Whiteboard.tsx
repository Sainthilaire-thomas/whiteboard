"use client";
import { useState, useEffect } from "react";
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
import { User } from "@supabase/supabase-js";
import NewCallUploader from "./NewCallUploader";
import Transcript from "./Transcript";
import { useThemeMode } from "./ThemeProvider"; // ✅ Gestion du dark/light mode
import AvatarSelector from "./AvatarSelector";

export default function Whiteboard() {
  const [participantAvatar, setParticipantAvatar] = useState<number | null>(
    null
  );
  const [connectedAvatars, setConnectedAvatars] = useState<
    { id: number; url: string }[]
  >([]);
  const [pseudo, setPseudo] = useState("Participant");
  const [user, setUser] = useState<User | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const router = useRouter();
  const { mode, toggleTheme } = useThemeMode();
  const [comments, setComments] = useState<string[]>([]); // ✅ Ajout du state pour les commentaires

  const [isAvatarSelected, setIsAvatarSelected] = useState<boolean>(
    !!participantAvatar
  );

  useEffect(() => {
    const savedAvatar = localStorage.getItem("participantAvatar");
    if (savedAvatar) {
      const avatarId = parseInt(savedAvatar);
      setParticipantAvatar(avatarId);
    }
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabaseClient.auth.getUser();
      setUser(data.user ?? null);
    };

    checkUser();

    const { data: listener } = supabaseClient.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchAvatars = async () => {
      const { data, error } = await supabaseClient
        .schema("whiteboard")
        .from("sessions")
        .select("idavatar, url", { head: false })
        .limit(100); // Limite pour éviter des requêtes lourdes

      if (!error && data) {
        setConnectedAvatars(
          data.map((avatar) => ({
            id: avatar.idavatar, // ✅ Renommage de idavatar en id
            url: avatar.url,
          }))
        );
      }
    };

    fetchAvatars();

    // 🔹 Écoute les changements en temps réel
    const channel = supabaseClient
      .channel("connected-avatars")
      .on(
        "postgres_changes",
        { event: "*", schema: "whiteboard", table: "sessions" },
        (payload) => {
          console.log("📡 Mise à jour en temps réel :", payload);
          fetchAvatars(); // Recharge les avatars connectés
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const checkExistingSession = async () => {
      const savedAvatar = localStorage.getItem("participantAvatar");

      if (savedAvatar) {
        const avatarId = parseInt(savedAvatar);

        // Vérifier si la session existe déjà dans Supabase
        const { data, error } = await supabaseClient
          .schema("whiteboard")
          .from("sessions")
          .select("idavatar, url", { head: false })
          .eq("idavatar", avatarId)
          .limit(1)
          .single();

        if (!error && data) {
          console.log("🔄 Session existante retrouvée :", data);
          setParticipantAvatar(avatarId);
          setIsAvatarSelected(true);
        } else {
          console.log("🚫 Aucune session existante trouvée.");
          setIsAvatarSelected(false);
        }
      }
    };

    checkExistingSession();
  }, []);

  const isCoach = user?.email === "thomassonear@gmail.com"; // ✅ Vérification du coach

  const handleAvatarSelect = async (avatarId: number | null) => {
    if (avatarId === null) return;

    setParticipantAvatar(avatarId);
    localStorage.setItem("participantAvatar", avatarId.toString());

    // 🔹 Récupérer l'avatar depuis Supabase
    const { data, error } = await supabaseClient
      .from("avatars")
      .select("nom, url")
      .eq("idavatar", avatarId)
      .single();

    if (!error && data) {
      setPseudo(data.nom);
      localStorage.setItem("participantPseudo", data.nom);

      // 🔹 Ajouter le participant à `sessions`
      const { error: sessionError } = await supabaseClient
        .schema("whiteboard")
        .from("sessions")
        .insert({
          idavatar: avatarId,
          nom: data.nom,
          url: data.url,
        });

      if (sessionError) {
        console.error(
          "❌ Erreur lors de l'ajout de la session :",
          sessionError
        );
      } else {
        console.log("✅ Session ajoutée avec succès !");

        // 🔹 Ajouter immédiatement l'avatar à `connectedAvatars`
        setConnectedAvatars((prev) => [
          ...prev,
          { id: avatarId, url: data.url },
        ]);
      }
    } else {
      console.error("❌ Erreur lors de la récupération de l'avatar :", error);
    }

    setIsAvatarSelected(true);
  };

  const handleSkipAvatar = () => {
    setIsAvatarSelected(true); // ✅ On considère que l'utilisateur peut accéder au Whiteboard sans avatar
  };

  console.log("👤 Avatar sélectionné :", participantAvatar);
  console.log("👥 Avatars connectés :", connectedAvatars);

  console.log("🔄 Affichage AvatarSelector :", !isCoach && !isAvatarSelected);

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    setUser(null);
    router.push("/whiteboard"); // ✅ Retour sur Whiteboard après logout
  };

  const handleLeaveSession = async () => {
    console.log("🚪 Quitter la session...");

    if (participantAvatar) {
      const { error } = await supabaseClient
        .schema("whiteboard")
        .from("sessions")
        .delete()
        .eq("idavatar", participantAvatar);

      if (error) {
        console.error(
          "❌ Erreur lors de la suppression de la session :",
          error
        );
        return;
      }

      console.log("✅ Session supprimée avec succès !");

      // Nettoyer le localStorage
      localStorage.removeItem("participantAvatar");

      // Mise à jour de l'état
      setParticipantAvatar(null);
      setIsAvatarSelected(false);

      // Filtrer l'avatar supprimé de la liste des avatars connectés
      setConnectedAvatars((prev) =>
        prev.filter((avatar) => avatar.id !== participantAvatar)
      );
    }
  };

  const handleCallUploaded = () => {
    setTranscript("Texte de la transcription générée...");
  };

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
          <Box sx={{ display: "flex", gap: 1 }}>
            {connectedAvatars.map((avatar, index) => (
              <Avatar
                key={index}
                src={avatar.url} // ✅ Utilisation de l'URL correcte
                sx={{ width: 40, height: 40 }}
              />
            ))}

            <IconButton color="inherit" onClick={toggleTheme}>
              {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>

            {/* 🔹 Icône pour quitter la session */}
            <IconButton color="error" onClick={handleLeaveSession}>
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
              onSelect={handleAvatarSelect}
              onClose={handleSkipAvatar}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}
