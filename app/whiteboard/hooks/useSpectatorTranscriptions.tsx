// app/whiteboard/hooks/useSpectatorTranscriptions.tsx
// Version qui utilise l'API route au lieu d'accès direct Supabase

import { useState, useCallback } from "react";
import { Transcription, Word } from "@/types/types";

interface UseSpectatorTranscriptionsResult {
  transcription: Transcription | null;
  isLoading: boolean;
  error: string | null;
  fetchTranscription: (callId: number) => Promise<void>;
  clearError: () => void;
}

/**
 * Hook spécialisé pour récupérer les transcriptions en mode spectateur
 * ✅ Utilise l'API route pour contourner les problèmes d'authentification
 */
export function useSpectatorTranscriptions(): UseSpectatorTranscriptionsResult {
  const [transcription, setTranscription] = useState<Transcription | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchTranscription = useCallback(async (callId: number) => {
    if (!callId) {
      setError("ID d'appel manquant");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(
        "👁️ SpectatorTranscriptions: Fetching via API for callId:",
        callId
      );

      // ✅ Utiliser l'API route au lieu d'accès direct Supabase
      const response = await fetch(`/api/transcription/get?callId=${callId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // Pas d'authentification nécessaire pour les participants
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: `HTTP ${response.status}` }));
        console.error("❌ SpectatorTranscriptions API error:", errorData);
        setError(`Erreur API: ${errorData.error || response.statusText}`);
        return;
      }

      const result = await response.json();
      console.log("✅ SpectatorTranscriptions API response:", {
        success: result.success,
        hasTranscription: !!result.transcription,
        wordCount: result.transcription?.words?.length || 0,
      });

      if (!result.success || !result.transcription) {
        setError(result.error || "Aucune transcription trouvée");
        return;
      }

      const { transcription: apiTranscription } = result;
      const words: Word[] = apiTranscription.words || [];

      if (words.length === 0) {
        console.warn("⚠️ SpectatorTranscriptions: No words in API response");
        setError("Transcription vide - aucun mot disponible");
        return;
      }

      console.log("✅ SpectatorTranscriptions loaded via API:", {
        callId,
        wordsCount: words.length,
        firstWord: words[0]?.text,
        lastWord: words[words.length - 1]?.text,
      });

      setTranscription({
        callid: callId,
        words: words,
      });
    } catch (err: any) {
      console.error("❌ SpectatorTranscriptions exception:", err);
      setError(`Erreur de connexion: ${err.message}`);
      setTranscription(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    transcription,
    isLoading,
    error,
    fetchTranscription,
    clearError,
  };
}
