import { useState, useCallback, useEffect } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { Sujet, Pratique, RelationSujetPratique, Item } from "@/types/types";
import { usePostits } from "@/hooks/CallDataContext/usePostits";
import { useCallData } from "@/context/CallDataContext";

export function useSelection() {
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
  const [subjectPracticeRelations, setSubjectPracticeRelations] = useState<
    RelationSujetPratique[]
  >([]);
  const { selectedCall } = useCallData();
  const selectedCallId = selectedCall ? selectedCall.callid : null;
  const { updatePostit } = usePostits(selectedCallId);

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

  // 📝 **Sélection d’un sujet (un seul possible)**
  const handleSelectSujet = useCallback(
    (sujet: Sujet) => {
      if (!selectedPostitIds.length) {
        alert("⚠️ Sélectionnez un post-it avant d'affecter un sujet.");
        return;
      }

      setSelectedSujet(sujet);

      selectedPostitIds.forEach((postitId) => {
        updatePostit(postitId, "sujet", sujet.nomsujet);
        updatePostit(postitId, "idsujet", sujet.idsujet);
      });
    },
    [selectedPostitIds, updatePostit]
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

  // 📌 **Mise à jour des sujets liés à l’activité lors du chargement**
  const fetchSujetsForActivite = useCallback(async (idActivite: number) => {
    const { data, error } = await supabaseClient
      .from("activitesconseillers_sujets")
      .select("idsujet")
      .eq("idactivite", idActivite);

    if (error) {
      console.error("❌ Erreur récupération sujets:", error);
      return;
    }

    // 📌 On stocke uniquement les `idsujet`
    setSujetsForActivite(data.map((s) => s.idsujet));
  }, []);

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
    fetchSujetsForActivite,
    toggleSujet,
  };
}
