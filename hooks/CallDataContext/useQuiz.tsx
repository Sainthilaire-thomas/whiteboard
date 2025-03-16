import { useState, useCallback } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { Quiz, UseQuizResult, QuizTimestampMap } from "@/types/types";

export function useQuiz(): UseQuizResult {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizTimestampMap, setQuizTimestampMap] = useState<QuizTimestampMap>(
    {}
  );

  // 🔄 Récupérer les quiz
  const fetchQuizzes = useCallback(async () => {
    const { data, error } = await supabaseClient.from("quiz").select("*");
    if (error) {
      console.error("Erreur lors de la récupération des quiz :", error.message);
      return;
    }

    setQuizzes(data as Quiz[]);
    setQuizTimestampMap((prev: QuizTimestampMap) => {
      const newMap: QuizTimestampMap = {};
      data.forEach((quiz: Quiz) => {
        newMap[quiz.quizid] = quiz;
      });
      return newMap;
    });
  }, []);

  // ➕ Ajouter un quiz
  const addQuiz = useCallback(async (quiz: Quiz) => {
    const { data, error } = await supabaseClient
      .from("quiz")
      .insert([quiz])
      .select();
    if (error) {
      console.error("Erreur lors de l'ajout du quiz :", error.message);
      return;
    }

    if (data?.length) {
      setQuizzes((prev) => [...prev, data[0]]);
      setQuizTimestampMap((prev) => ({
        ...prev,
        [data[0].quizid]: data[0],
      }));
    }
  }, []);

  // ✏️ Mettre à jour un quiz
  const updateQuiz = useCallback(
    async (quizId: number, updatedQuiz: Partial<Quiz>) => {
      const { error } = await supabaseClient
        .from("quiz")
        .update(updatedQuiz)
        .eq("quizid", quizId);
      if (error) {
        console.error("Erreur lors de la mise à jour du quiz :", error.message);
        return;
      }

      setQuizzes((prev) =>
        prev.map((quiz) =>
          quiz.quizid === quizId ? { ...quiz, ...updatedQuiz } : quiz
        )
      );
      setQuizTimestampMap((prev) => ({
        ...prev,
        [quizId]: { ...prev[quizId], ...updatedQuiz },
      }));
    },
    []
  );

  // ❌ Supprimer un quiz
  const deleteQuiz = useCallback(async (quizId: number) => {
    const { error } = await supabaseClient
      .from("quiz")
      .delete()
      .eq("quizid", quizId);
    if (error) {
      console.error("Erreur lors de la suppression du quiz :", error.message);
      return;
    }

    setQuizzes((prev) => prev.filter((quiz) => quiz.quizid !== quizId));
    setQuizTimestampMap((prev) => {
      const newMap = { ...prev };
      delete newMap[quizId];
      return newMap;
    });
  }, []);

  return {
    quizzes,
    quizTimestampMap,
    fetchQuizzes,
    addQuiz,
    updateQuiz,
    deleteQuiz,
  };
}
