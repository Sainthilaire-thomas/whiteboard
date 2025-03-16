import { useState, useEffect, useCallback } from "react";
import { supabaseClient } from "@lib/supabaseClient";
import { ConnectedAvatar } from "@/hooks/whiteboard/useConnectedAvatars";

export function useSession(
  participantAvatar: number | null,
  setParticipantAvatar: (id: number | null) => void,
  setConnectedAvatars: React.Dispatch<React.SetStateAction<ConnectedAvatar[]>>
) {
  const [isAvatarSelected, setIsAvatarSelected] = useState(!!participantAvatar);

  // ✅ Vérifie si une session existe déjà pour cet avatar
  const checkExistingSession = useCallback(async () => {
    const savedAvatar = localStorage.getItem("participantAvatar");
    if (!savedAvatar) return;

    const avatarId = parseInt(savedAvatar);

    const { data, error } = await supabaseClient
      .schema("whiteboard")
      .from("sessions")
      .select("idavatar, url")
      .eq("idavatar", avatarId)
      .maybeSingle();

    if (!error && data) {
      setParticipantAvatar(avatarId);
      setIsAvatarSelected(true);
    } else {
      setIsAvatarSelected(false);
    }
  }, [setParticipantAvatar]);

  useEffect(() => {
    checkExistingSession();
  }, [checkExistingSession]);

  // ✅ Sélectionne un avatar et crée une session
  const selectAvatar = useCallback(
    async (avatarId: number | null) => {
      if (!avatarId) return;

      const { data: existingSession } = await supabaseClient
        .schema("whiteboard")
        .from("sessions")
        .select("idavatar")
        .eq("idavatar", avatarId)
        .maybeSingle();

      if (existingSession) {
        alert("⚠️ Cet avatar est déjà utilisé !");
        return;
      }

      const { data, error } = await supabaseClient
        .from("avatars")
        .select("nom, url")
        .eq("idavatar", avatarId)
        .single();

      if (!error && data) {
        await supabaseClient.schema("whiteboard").from("sessions").insert({
          idavatar: avatarId,
          nom: data.nom,
          url: data.url,
        });

        setParticipantAvatar(avatarId);
        setConnectedAvatars((prev) => [
          ...prev,
          { id: avatarId, url: data.url },
        ]);
        localStorage.setItem("participantAvatar", avatarId.toString());
        setIsAvatarSelected(true);
      }
    },
    [setParticipantAvatar, setConnectedAvatars]
  );

  const skipAvatarSelection = useCallback(() => {
    setIsAvatarSelected(true); // ✅ Permet d'accéder au Whiteboard sans avatar
  }, []);

  // ✅ Quitte la session
  const leaveSession = useCallback(async () => {
    if (!participantAvatar) return;

    const { error } = await supabaseClient
      .schema("whiteboard")
      .from("sessions")
      .delete()
      .eq("idavatar", participantAvatar);

    if (!error) {
      localStorage.removeItem("participantAvatar");
      setParticipantAvatar(null);
      setIsAvatarSelected(false);
    }
  }, [participantAvatar, setParticipantAvatar]);

  // ✅ Ferme toutes les sessions (pour le coach)
  const closeAllSessions = useCallback(async () => {
    const { error } = await supabaseClient
      .schema("whiteboard")
      .rpc("delete_all_sessions");

    if (!error) {
      localStorage.clear();
      setParticipantAvatar(null);
      setIsAvatarSelected(false);
      setConnectedAvatars([]); // Vide la liste des avatars connectés
    }
  }, [setParticipantAvatar, setConnectedAvatars]);

  return {
    isAvatarSelected,
    setIsAvatarSelected,
    selectAvatar,
    skipAvatarSelection,
    leaveSession,
    closeAllSessions,
  };
}
