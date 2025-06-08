import { useState, useEffect, useCallback, useMemo } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { Postit, UsePostitsResult } from "@/types/types";
import { useAppContext } from "@/context/AppContext";

export function usePostits(selectedCallId: number | null): UsePostitsResult {
  const [allPostits, setAllPostits] = useState<Postit[]>([]);
  const [appelPostits, setAppelPostits] = useState<Postit[]>([]);

  // ✅ NOUVEAU : Maps pour la correspondance ID ↔ Nom
  const [pratiqueIdToNameMap, setPratiqueIdToNameMap] = useState<
    Record<number, string>
  >({});
  const [pratiqueNameToIdMap, setPratiqueNameToIdMap] = useState<
    Record<string, number>
  >({});

  // ✅ Récupérer les pratiques pour créer les maps de correspondance
  const fetchPratiquesMapping = useCallback(async () => {
    const { data, error } = await supabaseClient
      .from("pratiques")
      .select("idpratique, nompratique");

    if (error) {
      console.error("Erreur récupération pratiques:", error);
      return;
    }

    const idToName: Record<number, string> = {};
    const nameToId: Record<string, number> = {};

    data.forEach((pratique: any) => {
      idToName[pratique.idpratique] = pratique.nompratique;
      nameToId[pratique.nompratique] = pratique.idpratique;
    });

    setPratiqueIdToNameMap(idToName);
    setPratiqueNameToIdMap(nameToId);
  }, []);

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

  // ✅ Maps principales - gardons les numbers en interne pour la robustesse
  const [postitToSujetMap, setPostitToSujetMap] = useState<
    Record<number, number | null>
  >({});

  const [postitToPratiqueMap, setPostitToPratiqueMap] = useState<
    Record<number, number | null>
  >({});

  // ✅ UTILITAIRES DE CONVERSION pour compatibilité
  const convertPratiqueIdToName = useCallback(
    (id: number | null): string | null => {
      if (id === null) return null;
      return pratiqueIdToNameMap[id] || null;
    },
    [pratiqueIdToNameMap]
  );

  const convertPratiqueNameToId = useCallback(
    (name: string | null): number | null => {
      if (name === null) return null;
      return pratiqueNameToIdMap[name] || null;
    },
    [pratiqueNameToIdMap]
  );

  // ✅ INTERFACES LEGACY pour compatibilité avec l'ancien code
  const postitToPratiqueMapLegacy = useMemo(() => {
    const legacyMap: Record<string, string | null> = {};
    Object.entries(postitToPratiqueMap).forEach(([postitId, pratiqueId]) => {
      legacyMap[postitId] = convertPratiqueIdToName(pratiqueId);
    });
    return legacyMap;
  }, [postitToPratiqueMap, convertPratiqueIdToName]);

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
        idpratique: additionalData.idpratique || null,
      };

      const { data, error } = await supabaseClient
        .from("postit")
        .insert([newPostit])
        .select(
          "id, callid, wordid, word, timestamp, text, iddomaine, sujet, idsujet, pratique, idpratique"
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

      try {
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
        }

        const { data, error } = await supabaseClient
          .from("postit")
          .update(safeUpdatedFields)
          .eq("id", id)
          .select("*");

        if (error) {
          console.error("❌ Erreur Supabase :", error);
          return;
        }

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
      } catch (error) {
        console.error("❌ Erreur dans updatePostit:", error);
      }
    },
    []
  );

  // ✅ FONCTION MODERNE (avec IDs) - pour le nouveau code
  const updatePostitToSujetMap = useCallback(
    (postitId: number, sujetId: number | null) => {
      setPostitToSujetMap((prev) => ({
        ...prev,
        [postitId]: sujetId,
      }));
    },
    []
  );

  // ✅ FONCTION MODERNE (avec IDs) - pour le nouveau code
  const updatePostitToPratiqueMapModern = useCallback(
    (postitId: number, pratiqueId: number | null) => {
      setPostitToPratiqueMap((prev) => ({
        ...prev,
        [postitId]: pratiqueId,
      }));
    },
    []
  );

  // ✅ FONCTION LEGACY (avec noms) - pour compatibilité avec l'ancien code
  const updatePostitToPratiqueMap = useCallback(
    (postitId: string, pratiqueName: string | null) => {
      const postitIdNum = parseInt(postitId);
      const pratiqueId = convertPratiqueNameToId(pratiqueName);

      setPostitToPratiqueMap((prev) => ({
        ...prev,
        [postitIdNum]: pratiqueId,
      }));
    },
    [convertPratiqueNameToId]
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

  // ✅ Initialisation au démarrage
  useEffect(() => {
    fetchPratiquesMapping();
    fetchAllPostits();
  }, [fetchPratiquesMapping, fetchAllPostits]);

  useEffect(() => {
    if (selectedCallId) {
      setAppelPostits(getPostitsForCall(selectedCallId));
    } else {
      setAppelPostits([]);
    }
  }, [selectedCallId, getPostitsForCall]);

  // Initialisation de la map des sujets
  useEffect(() => {
    if (!selectedCallId || appelPostits.length === 0) return;

    const initialMap: Record<number, number | null> = {};
    appelPostits.forEach((postit) => {
      initialMap[postit.id] = postit.idsujet ?? null;
    });

    setPostitToSujetMap(initialMap);
  }, [appelPostits, selectedCallId]);

  // Initialisation de la map des pratiques
  useEffect(() => {
    if (!selectedCallId || appelPostits.length === 0) return;

    const initialPratiqueMap: Record<number, number | null> = {};
    appelPostits.forEach((postit) => {
      initialPratiqueMap[postit.id] = postit.idpratique ?? null;
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

    // ✅ COMPATIBILITÉ : Interface legacy pour l'ancien code
    postitToPratiqueMap: postitToPratiqueMapLegacy,
    updatePostitToPratiqueMap,

    // ✅ BONUS : Fonctions modernes pour le nouveau code (optionnel)
    // Vous pouvez les exposer si vous voulez migrer progressivement
    // postitToPratiqueMapModern: postitToPratiqueMap,
    // updatePostitToPratiqueMapModern,

    // ✅ UTILITAIRES de conversion exposés pour usage externe si nécessaire
    // convertPratiqueIdToName,
    // convertPratiqueNameToId,
  };
}
