import { useState, useCallback } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { Transcription, UseTranscriptionsResult, Word } from "@/types/types";

/**
 * Hook personnalisé pour récupérer et gérer la transcription d'un appel.
 */
export function useTranscriptions(): UseTranscriptionsResult {
  const [transcription, setTranscription] = useState<Transcription | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedCallId, setLastFetchedCallId] = useState<number | null>(
    null
  );

  const fetchTranscription = useCallback(
    async (callId: number) => {
      if (callId === lastFetchedCallId) return; // ✅ Évite les requêtes répétées

      setIsLoading(true);
      setError(null);
      setLastFetchedCallId(callId); // ✅ Stocke le dernier callId récupéré

      try {
        // ✅ Récupère la transcription et les mots associés
        const { data, error } = await supabaseClient
          .from("transcript")
          .select("*, word(*)") // Sélection des mots liés
          .eq("callid", callId)
          .single();

        if (error) {
          console.error(
            "Erreur lors de la récupération de la transcription:",
            error.message
          );
          setError(error.message);
          setTranscription(null);
          setIsLoading(false);
          return;
        }

        console.log("✅ Transcription récupérée:", data);

        const words: Word[] = data?.word ?? []; // ✅ S'assure que 'words' est toujours un tableau

        setTranscription({ callid: callId, words });
      } catch (error) {
        console.error("❌ Erreur inattendue:", error);
        setError("Erreur de récupération de la transcription.");
      } finally {
        setIsLoading(false);
      }
    },
    [lastFetchedCallId]
  ); // ✅ Assure que la fonction est stable

  return {
    transcription,
    fetchTranscription,
    isLoading,
    error,
  };
}
