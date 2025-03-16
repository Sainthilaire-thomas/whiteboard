import { useState, useCallback } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { Word } from "@/types/types";

export const useQuizState = () => {
  const [quizTimestamps, setQuizTimestamps] = useState<Record<number, number>>(
    {}
  );
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
  const [activeQuizId, setActiveQuizId] = useState<number | null>(null);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);

  const updateSelectedTimestamp = useCallback(
    (quizId: number, timestamp: number) => {
      setQuizTimestamps((prev) => ({ ...prev, [quizId]: timestamp }));
    },
    []
  );

  const updateSelectedQuizId = useCallback((quizId: number) => {
    setSelectedQuizId(quizId);
  }, []);

  const updateActiveQuizId = useCallback((quizId: number) => {
    setActiveQuizId(quizId);
  }, []);

  const updateCurrentWord = useCallback((word: Word | null) => {
    setCurrentWord(word);
  }, []);

  const associateQuizWithWord = useCallback(
    async (quizId: number, wordId: number) => {
      try {
        const { data, error } = await supabaseClient
          .from("quiz")
          .update({ wordid: wordId })
          .match({ quizid: quizId });

        if (error) {
          console.error(
            "Erreur lors de l'association du quiz avec le mot:",
            error
          );
        } else {
          console.log("Association réalisée avec succès:", data);
        }
      } catch (error) {
        console.error("Erreur lors de l'appel à Supabase:", error);
      }
    },
    []
  );

  return {
    quizTimestamps,
    updateSelectedTimestamp,
    selectedQuizId,
    updateSelectedQuizId,
    activeQuizId,
    updateActiveQuizId,
    associateQuizWithWord,
    updateCurrentWord,
    currentWord,
  };
};
