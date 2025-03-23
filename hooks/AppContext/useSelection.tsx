import { useState, useCallback, useEffect } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { Sujet, Pratique, RelationSujetPratique, Item } from "@/types/types";
import { usePostits } from "@/hooks/CallDataContext/usePostits";
import { useCallData } from "@/context/CallDataContext";
import { Postit } from "@/types/types";

export function useSelection(
  selectedPostit: Postit | null,
  selectedCallId: number | null,
  idCallActivite: number | null
) {
  const [selectedSujet, setSelectedSujet] = useState<Sujet | null>(null);
  const [selectedPratique, setSelectedPratique] = useState<Pratique | null>(
    null
  );
  const [highlightedPractices, setHighlightedPractices] = useState<number[]>(
    []
  );
  const [avatarTexts, setAvatarTexts] = useState<Record<number, string>>({});
  const [selectedPostitIds, setSelectedPostitIds] = useState<number[]>([]);
  const [sujetsForActivite, setSujetsForActivite] = useState<number[]>([]);
  const [initialSujetsForActivite, setInitialSujetsForActivite] = useState<
    number[]
  >([]);
  const [subjectPracticeRelations, setSubjectPracticeRelations] = useState<
    RelationSujetPratique[]
  >([]);

  const { updatePostit } = usePostits(selectedCallId ?? null);

  // 📌 🚀 Récupération des relations sujet ↔ pratique
  useEffect(() => {
    const fetchRelations = async () => {
      const { data, error } = await supabaseClient
        .from("sujetspratiques")
        .select("*");
      if (error) {
        console.error(
          "❌ Erreur récupération relations sujet-pratique :",
          error
        );
        return;
      }
      setSubjectPracticeRelations(data || []);
    };

    fetchRelations();
  }, []);

  // 📝 **Mise à jour des pratiques highlightées lorsqu’un sujet est sélectionné**
  useEffect(() => {
    if (!selectedSujet) {
      setHighlightedPractices([]); // ✅ Aucune pratique highlightée si aucun sujet sélectionné

      return;
    }

    const newHighlighted = subjectPracticeRelations
      .filter((relation) => relation.idsujet === selectedSujet.idsujet)
      .map((relation) => relation.idpratique);

    setHighlightedPractices([...new Set(newHighlighted)]);
  }, [selectedSujet, subjectPracticeRelations]);

  // ✅ Mettre à jour les pratiques highlightées quand on change de post-it
  useEffect(() => {
    if (!selectedPostit || !selectedPostit.idsujet) {
      setHighlightedPractices([]); // Aucune pratique highlightée si pas de sujet
      return;
    }

    const newHighlighted = subjectPracticeRelations
      .filter((relation) => relation.idsujet === selectedPostit.idsujet)
      .map((relation) => relation.idpratique);

    setHighlightedPractices([...new Set(newHighlighted)]);
  }, [selectedPostit, subjectPracticeRelations]); // ✅ Mise à jour dès que `selectedPostit` change

  // 📌 🚀 Récupération des sujets liés à l’activité
  const fetchSujetsForActivite = useCallback(
    async (idActivite: number, updateInitial = false) => {
      const { data, error } = await supabaseClient
        .from("activitesconseillers_sujets")
        .select("idsujet")
        .eq("idactivite", idActivite);

      if (error) {
        console.error("❌ Erreur récupération sujets:", error);
        return;
      }

      console.log(
        "📥 Chargement des sujets de l’activité :",
        data.map((s) => s.idsujet)
      );

      setSujetsForActivite(data.map((s) => s.idsujet)); // 🔹 Mise à jour dynamique

      if (updateInitial) {
        setInitialSujetsForActivite(data.map((s) => s.idsujet)); // 🔹 Ne mettre à jour les initiaux qu'au chargement du post-it
      }
    },
    []
  );

  useEffect(() => {
    if (selectedPostit && selectedPostit.idactivite) {
      fetchSujetsForActivite(selectedPostit.idactivite, true); // ✅ On met à jour `initialSujetsForActivite` uniquement ici
    }
  }, [selectedPostit, fetchSujetsForActivite]);

  const loadSujetsForPostit = useCallback(async (idActivite: number) => {
    const { data, error } = await supabaseClient
      .from("activitesconseillers_sujets")
      .select("idsujet")
      .eq("idactivite", idActivite);

    if (error) {
      console.error("❌ Erreur récupération sujets initiaux :", error);
      return;
    }

    const idsujets = data.map((s) => s.idsujet);
    console.log("📥 Sujets initiaux pour ce post-it :", idsujets);

    setInitialSujetsForActivite(idsujets); // ✅ Fige les sujets initiaux pour ce post-it
    setSujetsForActivite(idsujets); // ✅ État évolutif mis à jour
  }, []);

  useEffect(() => {
    if (selectedPostit && selectedPostit.idactivite) {
      loadSujetsForPostit(selectedPostit.idactivite);
    }
  }, [selectedPostit, loadSujetsForPostit]); // ✅ Rechargé uniquement à chaque changement de post-it

  // 📝 **Sélection d’un sujet (un seul possible)**
  const handleSelectSujet = useCallback(
    (sujet: Sujet | null) => {
      setSelectedSujet(sujet);

      if (!sujet) {
        setHighlightedPractices([]); // Désélection -> plus de pratiques en vert
        return;
      }

      // Trouver les pratiques associées au sujet
      const newHighlighted = subjectPracticeRelations
        .filter((relation) => relation.idsujet === sujet.idsujet)
        .map((relation) => relation.idpratique);

      setHighlightedPractices([...new Set(newHighlighted)]);
      console.log("✅ Pratiques mises en évidence :", newHighlighted);
    },
    [subjectPracticeRelations]
  );

  // 📝 **Sélection d’une pratique**
  const handleSelectPratique = useCallback((pratique: Pratique) => {
    setSelectedPratique(pratique);
  }, []);

  // 🎯 **Calcul des pratiques mises en avant**
  const calculateHighlightedPractices = useCallback(
    (disabledSubjects: number[]) => {
      const newHighlighted = subjectPracticeRelations
        .filter((relation) => disabledSubjects.includes(relation.idsujet))
        .map((relation) => relation.idpratique);

      setHighlightedPractices([...new Set(newHighlighted)]);
    },
    [subjectPracticeRelations]
  );

  // 📌 **Activation/Désactivation d’un sujet**
  const toggleSujet = async (idActivite: number, item: Item) => {
    try {
      const isCurrentlyAssociated = sujetsForActivite.includes(item.idsujet);

      if (isCurrentlyAssociated) {
        // ❌ Suppression
        await supabaseClient
          .from("activitesconseillers_sujets")
          .delete()
          .match({ idactivite: idActivite, idsujet: item.idsujet });

        // 🔹 Mise à jour locale (supprime l'ID de la liste)
        setSujetsForActivite((prev) =>
          prev.filter((id) => id !== item.idsujet)
        );
      } else {
        // ✅ Ajout du sujet
        await supabaseClient.from("activitesconseillers_sujets").insert({
          idactivite: idActivite,
          idsujet: item.idsujet,
          travaille: true, // Valeur par défaut
        });

        // 🔹 Mise à jour locale (ajoute l'ID à la liste)
        setSujetsForActivite((prev) => [...prev, item.idsujet]);
      }

      // ✅ Met à jour le sujet actif pour le post-it
      setSelectedSujet(isCurrentlyAssociated ? null : item);
    } catch (error) {
      console.error("❌ Erreur mise à jour sujet:", error);
    }
  };

  const syncSujetsForActiviteFromMap = useCallback(
    async (
      postitToSujetMap: Record<number, number | null>,
      idActivite: number
    ) => {
      // 🧠 Extraire les IDs de sujet uniques depuis la map
      const sujetIdsFromMap = Array.from(
        new Set(
          Object.values(postitToSujetMap).filter(
            (id): id is number => id !== null
          )
        )
      );

      console.log("🔁 Sujets à synchroniser :", sujetIdsFromMap);

      try {
        // 🧹 1. Supprimer tous les sujets existants pour cette activité
        const { error: deleteError } = await supabaseClient
          .from("activitesconseillers_sujets")
          .delete()
          .eq("idactivite", idActivite);

        if (deleteError) {
          console.error("❌ Erreur suppression ancienne liste :", deleteError);
          return;
        }

        // 🧩 2. Recréer les sujets à partir de la map
        if (sujetIdsFromMap.length > 0) {
          const { error: insertError } = await supabaseClient
            .from("activitesconseillers_sujets")
            .insert(
              sujetIdsFromMap.map((id) => ({
                idactivite: idActivite,
                idsujet: id,
                travaille: true,
              }))
            );

          if (insertError) {
            console.error(
              "❌ Erreur insertion des nouveaux sujets :",
              insertError
            );
            return;
          }
        }

        console.log("✅ Synchronisation des sujets réussie !");
        setSujetsForActivite(sujetIdsFromMap);
      } catch (err) {
        console.error("❌ Erreur générale lors de la synchronisation :", err);
      }
    },
    []
  );

  const syncPratiquesForActiviteFromMap = async (
    postitToPratiqueMap: Record<number, string | null>,
    idActivite: number,
    allPratiques: Pratique[]
  ) => {
    const pratiques = [
      ...new Set(
        Object.values(postitToPratiqueMap).filter((p): p is string => !!p)
      ),
    ];

    const idsPratiques = pratiques
      .map((nom) => allPratiques.find((p) => p.nompratique === nom)?.idpratique)
      .filter((id): id is number => !!id);

    console.log("🔁 Pratiques à synchroniser :", idsPratiques);

    try {
      // 🧹 Supprimer les pratiques existantes
      const { error: deleteError } = await supabaseClient
        .from("activitesconseillers_pratiques")
        .delete()
        .eq("idactivite", idActivite);

      if (deleteError) {
        console.error("❌ Erreur lors de la suppression :", deleteError);
        return;
      }

      // ➕ Recréer les nouvelles pratiques
      if (idsPratiques.length > 0) {
        const { error: insertError } = await supabaseClient
          .from("activitesconseillers_pratiques")
          .insert(
            idsPratiques.map((idpratique) => ({
              idactivite: idActivite,
              idpratique,
            }))
          );

        if (insertError) {
          console.error("❌ Erreur lors de l'insertion :", insertError);
          return;
        }
      }

      console.log("✅ Synchronisation des pratiques réussie !");
    } catch (error) {
      console.error("❌ Erreur générale de synchronisation :", error);
    }
  };

  // ♻️ **Réinitialisation des sélections**
  const resetSelectedState = useCallback(() => {
    setSelectedSujet(null);
    setSelectedPratique(null);
    setHighlightedPractices([]);
    setSelectedPostitIds([]);
  }, []);

  // 🧑‍💻 **Gestion des avatars**
  const updateAvatarText = useCallback((index: number, text: string) => {
    setAvatarTexts((prev) => ({ ...prev, [index]: text }));
  }, []);

  return {
    selectedSujet,
    handleSelectSujet,
    selectedPratique,
    handleSelectPratique,
    highlightedPractices,
    calculateHighlightedPractices,
    subjectPracticeRelations,
    resetSelectedState,
    avatarTexts,
    updateAvatarText,
    selectedPostitIds,
    setSelectedPostitIds,

    // 📌 Ajout des sujets liés à une activité
    sujetsForActivite,
    setSujetsForActivite,
    fetchSujetsForActivite,
    initialSujetsForActivite,
    toggleSujet,
    syncSujetsForActiviteFromMap,
    syncPratiquesForActiviteFromMap,
  };
}
