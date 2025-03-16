"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { useCallActivity } from "@/hooks/CallDataContext/useCallActivity";

interface Conseiller {
  idconseiller: number;
  nom: string;
  prenom: string;
  estanonyme: boolean;
  avatarUrl?: string;
}

interface AvatarAnonyme {
  idavatar: number;
  nom: string;
  url?: string;
}

interface ConseillerContextProps {
  selectedConseiller: { type: "conseiller" | "avatar"; id: number } | null;
  setSelectedConseiller: (
    value: { type: "conseiller" | "avatar"; id: number } | null
  ) => void;
  conseillers: Conseiller[];
  avatarsAnonymes: AvatarAnonyme[];
  isLoadingConseillers: boolean;
  errorConseillers: string | null;
}

const ConseillerContext = createContext<ConseillerContextProps | undefined>(
  undefined
);

export const ConseillerProvider = ({ children }: { children: ReactNode }) => {
  const [selectedConseiller, setSelectedConseiller] = useState<{
    type: "conseiller" | "avatar";
    id: number;
  } | null>(null);
  const [conseillers, setConseillers] = useState<Conseiller[]>([]);
  const [avatarsAnonymes, setAvatarsAnonymes] = useState<AvatarAnonyme[]>([]);
  const [isLoadingConseillers, setIsLoadingConseillers] = useState(true);
  const [errorConseillers, setErrorConseillers] = useState<string | null>(null);

  const { idCallActivite } = useCallActivity();

  useEffect(() => {
    const fetchConseillers = async () => {
      setIsLoadingConseillers(true);
      setErrorConseillers(null);

      const { data, error } = await supabaseClient
        .from("conseillers")
        .select("idconseiller, nom, prenom, estanonyme, idavatar");

      if (error) {
        setErrorConseillers("Erreur lors du chargement des conseillers");
        console.error("❌ Erreur Supabase (conseillers) :", error);
      } else {
        setConseillers(
          data.map((c: any) => ({
            idconseiller: c.idconseiller,
            nom: c.nom,
            prenom: c.prenom,
            estanonyme: c.estanonyme,
            avatarUrl: c.idavatar
              ? supabaseClient.storage
                  .from("avatars")
                  .getPublicUrl(`avatar_${c.idavatar}.webp`).data.publicUrl // ✅ URL propre
              : undefined,
          }))
        );
      }
    };

    const fetchAvatarsAnonymes = async () => {
      const { data, error } = await supabaseClient
        .from("avatars")
        .select("idavatar, nom, filename");

      if (error) {
        console.error("❌ Erreur Supabase (avatars) :", error);
      } else {
        setAvatarsAnonymes(
          data.map((a: any) => ({
            idavatar: a.idavatar,
            nom: a.nom,
            url: `https://jregkxiwrnquslbocicz.supabase.co/storage/v1/object/public/avatars/${encodeURIComponent(
              a.filename
            )}`, // ✅ URL publique stable
          }))
        );
      }
    };

    Promise.all([fetchConseillers(), fetchAvatarsAnonymes()]).finally(() => {
      setIsLoadingConseillers(false);
    });
  }, []);

  // ✅ Charger le conseiller associé à l'activité en cours
  useEffect(() => {
    if (!idCallActivite || conseillers.length === 0) {
      console.log(
        "⏳ Attente du chargement des conseillers avant d'exécuter fetchConseillerForActivity..."
      );
      return;
    }

    console.log(
      `🔍 Recherche du conseiller pour l'activité ID: ${idCallActivite}`
    );

    const fetchConseillerForActivity = async () => {
      const { data, error } = await supabaseClient
        .from("activitesconseillers")
        .select("idconseiller")
        .eq("idactivite", idCallActivite)
        .single();

      if (error) {
        console.warn("⚠️ Aucun conseiller trouvé pour cette activité.");
        setSelectedConseiller(null);
        return;
      }

      if (data && data.idconseiller) {
        console.log(`✅ Conseiller trouvé: ${data.idconseiller}`);

        // Vérifier si le conseiller est dans la liste des conseillers après le chargement
        const conseiller = conseillers.find(
          (c) => c.idconseiller === data.idconseiller
        );

        if (conseiller) {
          setSelectedConseiller({
            type: "conseiller",
            id: conseiller.idconseiller,
          });
        } else {
          console.warn(
            "⚠️ Conseiller trouvé dans la table mais pas dans la liste locale."
          );
        }
      }
    };

    fetchConseillerForActivity();
  }, [idCallActivite, conseillers]); // 🔥 Exécuter uniquement quand `conseillers` est chargé

  return (
    <ConseillerContext.Provider
      value={{
        selectedConseiller,
        setSelectedConseiller,
        conseillers,
        avatarsAnonymes,
        isLoadingConseillers,
        errorConseillers,
      }}
    >
      {children}
    </ConseillerContext.Provider>
  );
};

export const useConseiller = () => {
  const context = useContext(ConseillerContext);
  if (!context) {
    throw new Error("useConseiller must be used within a ConseillerProvider");
  }
  return context;
};
