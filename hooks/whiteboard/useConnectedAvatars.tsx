"use client";

import { useState, useEffect, useCallback } from "react";
import { supabaseClient } from "@lib/supabaseClient";

export interface ConnectedAvatar {
  id: number;
  url: string;
}

export function useConnectedAvatars() {
  const [connectedAvatars, setConnectedAvatars] = useState<ConnectedAvatar[]>(
    []
  );

  const fetchAvatars = useCallback(async () => {
    const { data, error, status } = await supabaseClient
      .schema("whiteboard") // 🔥 Ajoute le schéma ici
      .from("sessions") // 🔥 Essaye sans `.schema("whiteboard")` d'abord
      .select("idavatar, url") // Vérifie que ces colonnes existent
      .limit(100);

    console.log("🔎 Statut de la requête :", status);

    if (error) {
      console.error("❌ Erreur lors de la récupération des avatars :", error);
    } else if (data) {
      console.log("✅ Données récupérées :", data);
      setConnectedAvatars(
        data.map((avatar) => ({
          id: avatar.idavatar,
          url: avatar.url,
        }))
      );
    } else {
      console.warn("⚠️ Aucune donnée récupérée.");
    }
  }, []);

  useEffect(() => {
    fetchAvatars();

    const channel = supabaseClient
      .channel("connected-avatars")
      .on(
        "postgres_changes",
        { event: "*", schema: "whiteboard", table: "sessions" },
        (payload) => {
          console.log("📡 Mise à jour en temps réel :", payload);
          fetchAvatars();
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [fetchAvatars]);

  return { connectedAvatars, setConnectedAvatars }; // ✅ Retourne setConnectedAvatars
}
