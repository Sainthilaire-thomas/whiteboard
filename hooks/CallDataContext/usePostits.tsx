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

  // Map pratique avec les IDs maintenant
  const [postitToPratiqueMap, setPostitToPratiqueMap] = useState<
    Record<number, number | null> // Changé de string | null vers number | null
  >({});

  const addPostit = useCallback(
    async (
      wordid: number,
      word: string,
      timestamp: number,
      additionalData: Record<string, any> = {}
    ) => {
      if (!selectedCallId) return null;

      const newPostit = {
        callid: selectedCallId,
        wordid,
        word,
        timestamp,
        text: additionalData.text || "",
        iddomaine: additionalData.iddomaine || null,
        sujet: additionalData.sujet || "Non assigné",
        idsujet: additionalData.idsujet || null,
        pratique: additionalData.pratique || "Non assigné",
        idpratique: additionalData.idpratique || null, // AJOUT
      };

      const { data, error } = await supabaseClient
        .from("postit")
        .insert([newPostit])
        .select(
          "id, callid, wordid, word, timestamp, text, iddomaine, sujet, idsujet, pratique, idpratique" // AJOUT idpratique
        )
        .single();

      if (error) {
        console.error("❌ Erreur lors de l'ajout du post-it:", error);
        return null;
      }

      if (data) {
        setAllPostits((prev) => [data, ...prev]);

        if (data.callid === selectedCallId) {
          setAppelPostits((prev) => [data, ...prev]);
        }

        return data.id;
      }

      return null;
    },
    [selectedCallId]
  );

  // FONCTION UPDATEPOSTIT CORRIGÉE
  const updatePostit = useCallback(
    async (id: number, updatedFields: Record<string, any>) => {
      console.log("💾 updatePostit appelé:", { id, updatedFields });

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

      try {
        // Construire les données sécurisées
        const safeUpdatedFields: Record<string, any> = {};

        if ("text" in updatedFields)
          safeUpdatedFields.text = updatedFields.text;
        if ("sujet" in updatedFields)
          safeUpdatedFields.sujet = updatedFields.sujet;
        if ("idsujet" in updatedFields)
          safeUpdatedFields.idsujet = updatedFields.idsujet ?? null;
        if ("iddomaine" in updatedFields)
          safeUpdatedFields.iddomaine = updatedFields.iddomaine ?? null;
        if ("pratique" in updatedFields)
          safeUpdatedFields.pratique = updatedFields.pratique;
        if ("idpratique" in updatedFields) {
          safeUpdatedFields.idpratique = updatedFields.idpratique ?? null;
          console.log("✅ idpratique inclus:", updatedFields.idpratique);
        }

        console.log("📤 Données pour Supabase:", safeUpdatedFields);

        // Mise à jour Supabase
        const { data, error } = await supabaseClient
          .from("postit")
          .update(safeUpdatedFields)
          .eq("id", id)
          .select("*");

        if (error) {
          console.error("❌ Erreur Supabase :", error);
          return;
        }

        console.log("✅ Supabase mis à jour:", data);

        // Mise à jour des états locaux avec fonction pour éviter stale closure
        setAllPostits((prevPostits) => {
          return prevPostits.map((postit) =>
            postit.id === id ? { ...postit, ...safeUpdatedFields } : postit
          );
        });

        setAppelPostits((prevPostits) => {
          return prevPostits.map((postit) =>
            postit.id === id ? { ...postit, ...safeUpdatedFields } : postit
          );
        });

        console.log("✅ États locaux mis à jour");
      } catch (error) {
        console.error("❌ Erreur dans updatePostit:", error);
      }
    },
    [] // Dépendances vides pour stabilité
  );

  // 🔁 FONCTION POUR LES SUJETS (À GARDER - utilisée ailleurs)
  const updatePostitToSujetMap = useCallback(
    (postitId: number, sujetId: number | null) => {
      setPostitToSujetMap((prev) => ({
        ...prev,
        [postitId]: sujetId,
      }));
    },
    []
  );

  // 🔁 FONCTION POUR LES PRATIQUES (CORRIGÉE pour les IDs)
  const updatePostitToPratiqueMap = useCallback(
    (postitId: number, pratiqueId: number | null) => {
      // Changé de string vers number
      console.log("🔄 updatePostitToPratiqueMap:", { postitId, pratiqueId });
      setPostitToPratiqueMap((prev) => ({
        ...prev,
        [postitId]: pratiqueId, // Stocke l'ID, pas le nom
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

  // Initialisation de la map des sujets (inchangé)
  useEffect(() => {
    if (!selectedCallId || appelPostits.length === 0) return;

    const initialMap: Record<number, number | null> = {};
    appelPostits.forEach((postit) => {
      initialMap[postit.id] = postit.idsujet ?? null;
    });

    setPostitToSujetMap(initialMap);
  }, [appelPostits, selectedCallId]);

  // EFFET CORRIGÉ : Initialiser la map pratique avec les IDs
  useEffect(() => {
    if (!selectedCallId || appelPostits.length === 0) return;

    const initialPratiqueMap: Record<number, number | null> = {}; // Changé vers number | null
    appelPostits.forEach((postit) => {
      // Stocker l'ID pratique, pas le nom
      initialPratiqueMap[postit.id] = postit.idpratique ?? null;
    });

    console.log("🔄 Initialisation pratiqueMap:", initialPratiqueMap);
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
    updatePostitToSujetMap, // ← FONCTION POUR LES SUJETS (GARDÉE)
    postitToPratiqueMap,
    updatePostitToPratiqueMap, // ← FONCTION POUR LES PRATIQUES (CORRIGÉE)
  };
}
