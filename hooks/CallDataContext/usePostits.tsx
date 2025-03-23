import { useState, useEffect, useCallback, useMemo } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { Postit, UsePostitsResult } from "@/types/types";
import { useAppContext } from "@/context/AppContext";

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

  const [postitToSujetMap, setPostitToSujetMap] = useState<
    Record<number, number | null>
  >({});
  const [postitToPratiqueMap, setPostitToPratiqueMap] = useState<
    Record<number, string | null>
  >({});

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
          "id, callid, wordid, word, timestamp, text, iddomaine, sujet,idsujet, pratique"
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
    async (id: number, updatedFields: Record<string, any>) => {
      if (
        !id ||
        typeof updatedFields !== "object" ||
        Array.isArray(updatedFields)
      ) {
        console.error(
          "❌ Erreur : `updatedFields` doit être un objet valide !"
        );
        return;
      }

      // ✅ Vérification si le post-it existe avant la mise à jour
      const existingPostit = allPostits.find((p) => p.id === id);
      if (!existingPostit) {
        console.warn("⚠️ Post-it introuvable, annulation de la mise à jour.");
        return;
      }

      // ✅ Assurer que `idsujet` et `iddomaine` sont bien traités
      const safeUpdatedFields: Record<string, any> = {};
      if ("text" in updatedFields) safeUpdatedFields.text = updatedFields.text;
      if ("sujet" in updatedFields)
        safeUpdatedFields.sujet = updatedFields.sujet;
      if ("idsujet" in updatedFields)
        safeUpdatedFields.idsujet = updatedFields.idsujet ?? null;
      if ("iddomaine" in updatedFields)
        safeUpdatedFields.iddomaine = updatedFields.iddomaine ?? null;
      if ("pratique" in updatedFields)
        safeUpdatedFields.pratique = updatedFields.pratique;

      // ✅ Mise à jour locale
      setAllPostits((prev) =>
        prev.map((postit) =>
          postit.id === id ? { ...postit, ...safeUpdatedFields } : postit
        )
      );

      setAppelPostits((prev) =>
        prev.map((postit) =>
          postit.id === id ? { ...postit, ...safeUpdatedFields } : postit
        )
      );

      // ✅ Mise à jour Supabase
      const { data, error } = await supabaseClient
        .from("postit")
        .update(safeUpdatedFields)
        .eq("id", id)
        .select("*");

      if (error) {
        console.error("❌ Erreur Supabase :", error);
        return;
      }
    },
    [allPostits]
  );

  // 🔁 Mettre à jour le mapping pour un post-it donné
  const updatePostitToSujetMap = useCallback(
    (postitId: number, sujetId: number | null) => {
      setPostitToSujetMap((prev) => ({
        ...prev,
        [postitId]: sujetId,
      }));
    },
    []
  );

  const updatePostitToPratiqueMap = useCallback(
    (postitId: number, nomPratique: string | null) => {
      setPostitToPratiqueMap((prev) => ({
        ...prev,
        [postitId]: nomPratique,
      }));
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

  useEffect(() => {
    if (!selectedCallId || appelPostits.length === 0) return;

    const initialMap: Record<number, number | null> = {};
    appelPostits.forEach((postit) => {
      initialMap[postit.id] = postit.idsujet ?? null;
    });

    setPostitToSujetMap(initialMap);
  }, [appelPostits, selectedCallId]);

  useEffect(() => {
    if (!selectedCallId || appelPostits.length === 0) return;

    const initialPratiqueMap: Record<number, string | null> = {};
    appelPostits.forEach((postit) => {
      initialPratiqueMap[postit.id] =
        postit.pratique && postit.pratique !== "Non Assigné"
          ? postit.pratique
          : null;
    });

    setPostitToPratiqueMap(initialPratiqueMap);
  }, [appelPostits, selectedCallId]);

  return {
    allPostits,
    appelPostits,
    fetchAllPostits,
    getPostitsForCall,
    addPostit,
    updatePostit,
    deletePostit,
    postitToSujetMap,
    updatePostitToSujetMap,
    postitToPratiqueMap,
    updatePostitToPratiqueMap,
  };
}
