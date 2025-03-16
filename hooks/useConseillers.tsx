import { useState, useEffect } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { Conseiller, AvatarAnonyme } from "@/types/types";

export function useConseillers() {
  const [conseillers, setConseillers] = useState<Conseiller[]>([]);
  const [avatarsAnonymes, setAvatarsAnonymes] = useState<AvatarAnonyme[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConseillers = async () => {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabaseClient
        .from("conseillers")
        .select("idconseiller, nom, prenom, estanonyme, idavatar");

      if (error) {
        console.error(
          "❌ Erreur lors de la récupération des conseillers :",
          error
        );
        setError("Erreur lors du chargement des conseillers");
      } else if (data) {
        setConseillers(
          data.map((c: any) => ({
            idconseiller: c.idconseiller,
            nom: c.nom,
            prenom: c.prenom,
            estanonyme: c.estanonyme,
            avatarUrl: c.idavatar
              ? `/path_to_avatars/${c.idavatar}.png`
              : undefined,
          }))
        );
      }
    };

    const fetchAvatarsAnonymes = async () => {
      const { data, error } = await supabaseClient
        .from("avatars")
        .select("idavatar, nom, url");

      if (!error) {
        setAvatarsAnonymes(
          data.map((a) => ({
            ...a,
            url: `https://jregkxiwrnquslbocicz.supabase.co/storage/v1/object/public/avatars/${encodeURIComponent(
              a.url
            )}`,
          }))
        );
      }
    };

    // 🔹 Exécuter les deux requêtes en parallèle
    Promise.all([fetchConseillers(), fetchAvatarsAnonymes()]).finally(() => {
      setIsLoading(false);
    });
  }, []);

  return { conseillers, avatarsAnonymes, isLoading, error };
}
