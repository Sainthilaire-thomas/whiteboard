import { useState, useEffect, useCallback } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { Postit, UsePostitsResult } from "@/types/types";

export function usePostits(selectedCallId: number | null): UsePostitsResult {
  const [allPostits, setAllPostits] = useState<Postit[]>([]);
  const [appelPostits, setAppelPostits] = useState<Postit[]>([]);

  const fetchAllPostits = useCallback(async () => {
    const { data, error } = await supabaseClient.from("postit").select("*");
    if (error) {
      console.error("Erreur lors de la récupération des post-its:", error);
      return;
    }
    setAllPostits(data as Postit[]);
  }, []);

  const getPostitsForCall = useCallback(
    (callId: number) => allPostits.filter((postit) => postit.callid === callId),
    [allPostits]
  );

  const addPostit = useCallback(
    async (wordid: number, word: string, timestamp: number) => {
      if (!selectedCallId) return null;

      const newPostit = {
        callid: selectedCallId,
        wordid,
        word,
        timestamp,
        text: "",
        iddomaine: null,
        sujet: "Non assigné",
        idsujet: null,
        pratique: "Non assigné",
      };

      const { data, error } = await supabaseClient
        .from("postit")
        .insert([newPostit])
        .select(
          "id, callid, wordid, word, timestamp, text, iddomaine, sujet, pratique"
        )
        .single(); // ✅ Ajout de .single() pour éviter de devoir utiliser data[0]

      if (error) {
        console.error("❌ Erreur lors de l'ajout du post-it:", error);
        return null;
      }

      if (data) {
        setAllPostits((prev) => [data, ...prev]);

        // ✅ Mise à jour immédiate de `appelPostits`
        if (data.callid === selectedCallId) {
          setAppelPostits((prev) => [data, ...prev]);
        }

        return data.id; // ✅ Retourne l'ID du post-it ajouté
      }

      return null;
    },
    [selectedCallId]
  );

  const updatePostit = useCallback(
    async (id: number, field: string, value: any) => {
      if (field === "iddomaine" && value === "Non assigné") {
        value = null; // ✅ Sécurisation
      }
      const { error } = await supabaseClient
        .from("postit")
        .update({ [field]: value })
        .eq("id", id);
      if (error) {
        console.error("Erreur lors de la mise à jour du post-it:", error);
        return;
      }

      setAllPostits((prev) =>
        prev.map((postit) =>
          postit.id === id ? { ...postit, [field]: value } : postit
        )
      );

      setAppelPostits((prev) =>
        prev.map((postit) =>
          postit.id === id ? { ...postit, [field]: value } : postit
        )
      );
    },
    []
  );

  const deletePostit = useCallback(async (postitId: number) => {
    const { error } = await supabaseClient
      .from("postit")
      .delete()
      .eq("id", postitId);
    if (error) {
      console.error("Erreur lors de la suppression du post-it:", error);
      return;
    }

    setAllPostits((prev) => prev.filter((postit) => postit.id !== postitId));
    setAppelPostits((prev) => prev.filter((postit) => postit.id !== postitId));
  }, []);

  useEffect(() => {
    fetchAllPostits();
  }, [fetchAllPostits]);

  useEffect(() => {
    if (selectedCallId) {
      setAppelPostits(getPostitsForCall(selectedCallId));
    } else {
      setAppelPostits([]);
    }
  }, [selectedCallId, getPostitsForCall]);

  return {
    allPostits,
    appelPostits,
    fetchAllPostits,
    getPostitsForCall,
    addPostit,
    updatePostit,
    deletePostit,
  };
}
