"use client";

import { useState, useEffect, useCallback } from "react";
import { supabaseClient } from "@lib/supabaseClient";

export function useSession(
  participantAvatar: number | null,
  setParticipantAvatar: (id: number | null) => void
) {
  const [isAvatarSelected, setIsAvatarSelected] = useState(!!participantAvatar);

  /**
   * ✅ Vérifie si l'avatar sélectionné a déjà une session active.
   */
  const checkExistingSession = useCallback(async () => {
    console.log("🔎 Démarrage de checkExistingSession...");

    const savedAvatar = localStorage.getItem("participantAvatar");
    if (!savedAvatar) {
      console.warn("🚫 Aucun avatar sauvegardé.");
      return;
    }

    const avatarId = parseInt(savedAvatar, 10);
    console.log("🔢 ID d'avatar récupéré :", avatarId);

    try {
      const { data, error, status } = await supabaseClient
        .schema("whiteboard")
        .from("sessions")
        .select("idavatar")
        .eq("idavatar", avatarId)
        .maybeSingle(); // ✅ Évite une erreur si aucune ligne n'existe

      console.log("✅ Résultat Supabase :", { data, error, status });

      if (error && status !== 406) {
        console.error("❌ Erreur inattendue lors de la requête :", error);
        return;
      }

      if (data) {
        console.log("🟢 Session trouvée :", data);
        setParticipantAvatar(avatarId);
        setIsAvatarSelected(true);
      } else {
        console.log("🔴 Aucune session pour cet avatar.");
        setIsAvatarSelected(false);
      }
    } catch (err) {
      console.error("🚨 Erreur inattendue :", err);
    }
  }, [setParticipantAvatar]);

  /**
   * ✅ Lance la vérification lors du montage ou du changement de participantAvatar.
   */
  useEffect(() => {
    checkExistingSession();
  }, [participantAvatar, checkExistingSession]);

  /**
   * 🚪 Permet de quitter une session spécifique.
   */
  const leaveSession = useCallback(async () => {
    if (!participantAvatar) {
      console.warn("⚠️ Aucun avatar sélectionné pour quitter.");
      return;
    }

    try {
      console.log(
        `🚪 Suppression de la session pour l'avatar #${participantAvatar}...`
      );
      const { error } = await supabaseClient
        .schema("whiteboard")
        .from("sessions")
        .delete()
        .eq("idavatar", participantAvatar);

      if (error) {
        console.error("❌ Échec de la suppression :", error);
        return;
      }

      console.log("✅ Session supprimée !");
      localStorage.removeItem("participantAvatar");
      setParticipantAvatar(null);
      setIsAvatarSelected(false);
    } catch (err) {
      console.error("⚠️ Problème lors de la suppression :", err);
    }
  }, [participantAvatar, setParticipantAvatar]);

  /**
   * 🧹 Permet au coach de fermer toutes les sessions.
   */
  const closeAllSessions = useCallback(async () => {
    console.log("🧹 Tentative de fermeture de toutes les sessions...");

    try {
      const { error } = await supabaseClient
        .schema("whiteboard")
        .rpc("delete_all_sessions");

      if (error) {
        console.error("❌ Erreur lors de la fermeture des sessions :", error);
        return;
      }

      console.log("✅ Toutes les sessions ont été fermées !");
      localStorage.clear();
      setParticipantAvatar(null);
      setIsAvatarSelected(false);
    } catch (err) {
      console.error("⚠️ Erreur inattendue :", err);
    }
  }, [setParticipantAvatar]);

  return {
    isAvatarSelected,
    setIsAvatarSelected,
    leaveSession,
    closeAllSessions,
  };
}
