"use client";

import { useState, useEffect, useCallback } from "react";
import { RolePlayData, Postit } from "@/types/types";
import { supabaseClient } from "@/lib/supabaseClient";

interface UseRolePlayProps {
  rolePlayData: RolePlayData | null;
  saveRolePlayData: (data: RolePlayData, postitId: number) => Promise<void>;
  fetchRolePlayData: (callId: number, postitId: number) => Promise<void>;
  deleteRolePlayData: (rolePlayId: number) => Promise<void>;
  getRolePlaysByCallId: (
    callId: number
  ) => Promise<{ id: number; postit_id: number; note: RolePlayData }[]>;
  isLoading: boolean;
  error: Error | null;
}

export const useRolePlay = (
  callId: number | null,
  postitId: number | null
): UseRolePlayProps => {
  const [rolePlayData, setRolePlayData] = useState<RolePlayData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Récupérer les données de jeu de rôle pour un appel et un postit spécifique
  const fetchRolePlayData = useCallback(
    async (callId: number, postitId: number) => {
      if (!callId || !postitId) return;

      setIsLoading(true);
      setError(null);

      try {
        // Récupérer le jeu de rôle le plus récent pour ce postit
        const { data, error } = await supabaseClient
          .from("roleplaydata")
          .select("*")
          .eq("call_id", callId)
          .eq("postit_id", postitId)
          .order("created_at", { ascending: false })
          .limit(1);

        if (error) {
          throw new Error(
            "Erreur lors de la récupération des données de jeu de rôle: " +
              error.message
          );
        }

        if (data && data.length > 0) {
          // La note est déjà au format JSONB dans Supabase
          setRolePlayData(data[0].note as RolePlayData);
        } else {
          setRolePlayData(null);
        }
      } catch (err) {
        console.error("Erreur:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Récupérer tous les jeux de rôle pour un appel
  const getRolePlaysByCallId = useCallback(async (callId: number) => {
    if (!callId) return [];

    try {
      const { data, error } = await supabaseClient
        .from("roleplaydata")
        .select("id, postit_id, note")
        .eq("call_id", callId)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(
          "Erreur lors de la récupération des jeux de rôle: " + error.message
        );
      }

      return data || [];
    } catch (err) {
      console.error("Erreur:", err);
      return [];
    }
  }, []);

  // Enregistrer les données de jeu de rôle
  const saveRolePlayData = useCallback(
    async (data: RolePlayData, postitId: number) => {
      if (!callId) return;

      setIsLoading(true);
      setError(null);

      try {
        // Créer une entrée dans la table roleplaydata
        const { data: insertedData, error } = await supabaseClient
          .from("roleplaydata")
          .insert([
            {
              call_id: callId,
              postit_id: postitId,
              note: data, // Supabase convertira automatiquement l'objet en JSONB
              type: "standard",
            },
          ])
          .select();

        if (error) {
          throw new Error(
            "Erreur lors de l'enregistrement des données de jeu de rôle: " +
              error.message
          );
        }

        console.log("Jeu de rôle enregistré avec succès:", insertedData);
        setRolePlayData(data);
      } catch (err) {
        console.error("Erreur:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    },
    [callId]
  );

  // Supprimer un jeu de rôle
  const deleteRolePlayData = useCallback(async (rolePlayId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabaseClient
        .from("roleplaydata")
        .delete()
        .eq("id", rolePlayId);

      if (error) {
        throw new Error(
          "Erreur lors de la suppression du jeu de rôle: " + error.message
        );
      }

      console.log("Jeu de rôle supprimé avec succès");
    } catch (err) {
      console.error("Erreur:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Charger les données de jeu de rôle au chargement du composant ou lorsque callId/postitId changent
  useEffect(() => {
    if (callId && postitId) {
      fetchRolePlayData(callId, postitId);
    } else {
      setRolePlayData(null);
    }
  }, [callId, postitId, fetchRolePlayData]);

  return {
    rolePlayData,
    saveRolePlayData,
    fetchRolePlayData,
    deleteRolePlayData,
    getRolePlaysByCallId,
    isLoading,
    error,
  };
};
