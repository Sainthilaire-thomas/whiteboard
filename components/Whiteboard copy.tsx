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
        .select("idavatar, url");

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
    const handleBeforeUnload = async () => {
      if (participantAvatar) {
        await supabaseClient
          .schema("whiteboard")
          .from("sessions")
          .delete()
          .eq("idavatar", participantAvatar);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [participantAvatar]);

  useEffect(() => {
    const checkExistingSession = async () => {
      const savedAvatar = localStorage.getItem("participantAvatar");

      if (savedAvatar) {
        const avatarId = parseInt(savedAvatar);

        // Vérifier si cet avatar a une session active dans Supabase
        const { data, error } = await supabaseClient
          .schema("whiteboard")
          .from("sessions")
          .select("idavatar, url")
          .eq("idavatar", avatarId)
          .single();

        if (!error && data) {
          console.log("🔄 Session existante retrouvée :", data);
          setParticipantAvatar(avatarId);
          setIsAvatarSelected(true);
        } else {
          console.log("🚫 Aucune session existante trouvée.");
          setIsAvatarSelected(false); // Demande de rechoisir un avatar
        }
      }
    };

    checkExistingSession();
  }, []);

  useEffect(() => {
    const handleUnload = async () => {
      console.log(
        "⚠️ L'utilisateur quitte l'application, suppression de la session..."
      );
      if (participantAvatar) {
        await supabaseClient
          .schema("whiteboard")
          .from("sessions")
          .delete()
          .eq("idavatar", participantAvatar);

        // Supprimer l'avatar du localStorage pour éviter une reconnexion automatique après fermeture complète
        localStorage.removeItem("participantAvatar");
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("pagehide", handleUnload); // Pour Safari sur mobile

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("pagehide", handleUnload);
    };
  }, [participantAvatar]);

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

  console.log("👤 Avatar sélectionné :", participantAvatar);
  console.log("👥 Avatars connectés :", connectedAvatars);

  console.log("🔄 Affichage AvatarSelector :", !isCoach && !isAvatarSelected);

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    setUser(null);
    router.push("/whiteboard"); // ✅ Retour sur Whiteboard après logout
  };

  const handleCallUploaded = () => {
    setTranscript("Texte de la transcription générée...");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* ✅ AppBar avec menu et mode dark/light */}
      <AppBar position="static">
        <Toolbar>
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

          <IconButton color="inherit" onClick={toggleTheme}>
            {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          {/* 🔹 Affichage des avatars des participants connectés */}
          <Box sx={{ display: "flex", gap: 1 }}>
            {connectedAvatars.map((avatar, index) => (
              <Avatar
                key={index}
                src={avatar.url} // ✅ Utilisation de l'URL correcte
                sx={{ width: 40, height: 40 }}
              />
            ))}
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

      {/* ✅ Bouton de connexion pour les participants */}
      {!isCoach && (
        <Box sx={{ position: "absolute", bottom: 16, right: 16 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push("/login")}
          >
            Se connecter (Coach)
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
            <AvatarSelector onSelect={handleAvatarSelect} />
          </Box>
        </Box>
      )}
    </Box>
  );
}
