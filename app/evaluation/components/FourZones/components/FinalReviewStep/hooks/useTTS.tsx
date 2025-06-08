// hooks/useTTS.ts - VERSION CORRIGÉE

import { useState, useCallback, useRef, useEffect } from "react";

export interface TTSSettings {
  voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
  speed: number;
  model: "tts-1" | "tts-1-hd" | "gpt-4o-audio"; // ✅ CORRECTION: nom de modèle valide
  textEnhancement?: "aucun" | "contextuel" | "emotionnel";
  tone?:
    | "professionnel"
    | "chaleureux"
    | "enthousiaste"
    | "calme"
    | "confiant"
    | "explication"
    | "empathique"
    | "resolution_probleme"
    | "instructions"
    | "urgence_controlee";
  autoDetectContext?: boolean;
}

export interface TTSState {
  isLoading: boolean;
  isPlaying: boolean;
  error: string | null;
  progress: number;
}

export const useTTS = () => {
  const [state, setState] = useState<TTSState>({
    isLoading: false,
    isPlaying: false,
    error: null,
    progress: 0,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ GÉNÉRATION AUDIO CORRIGÉE
  const generateSpeech = useCallback(
    async (text: string, settings: TTSSettings): Promise<string | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        console.log("🎙️ generateSpeech appelé avec:", {
          textLength: text.length,
          model: settings.model,
          tone: settings.tone,
          voice: settings.voice,
        });

        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: text.trim(),
            voice: settings.voice,
            speed: settings.speed,
            model: settings.model,
            textEnhancement: settings.textEnhancement,
            tone: settings.tone,
            autoDetectContext: settings.autoDetectContext,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        console.log("✅ Audio généré avec succès");
        return audioUrl;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erreur inconnue";
        console.error("❌ Erreur generateSpeech:", errorMessage);
        setState((prev) => ({ ...prev, error: errorMessage }));
        return null;
      } finally {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    []
  );

  // ✅ LECTURE AUDIO CORRIGÉE
  const playAudio = useCallback((audioUrl: string) => {
    console.log("🔊 Début lecture audio");

    // Nettoyer l'audio précédent
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onloadstart = () => {
      console.log("📡 Chargement audio...");
      setState((prev) => ({ ...prev, isPlaying: true, progress: 0 }));
    };

    audio.ontimeupdate = () => {
      if (audio.duration) {
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        setState((prev) => ({ ...prev, progress: progressPercent }));
      }
    };

    audio.onended = () => {
      console.log("✅ Lecture terminée");
      setState((prev) => ({ ...prev, isPlaying: false, progress: 100 }));
      setTimeout(() => {
        setState((prev) => ({ ...prev, progress: 0 }));
        URL.revokeObjectURL(audioUrl);
      }, 1000);
    };

    audio.onerror = (e) => {
      console.error("❌ Erreur lecture audio:", e);
      setState((prev) => ({
        ...prev,
        isPlaying: false,
        progress: 0,
        error: "Erreur lors de la lecture audio",
      }));
      URL.revokeObjectURL(audioUrl);
    };

    audio.play().catch((err) => {
      console.error("❌ Impossible de jouer l'audio:", err);
      setState((prev) => ({
        ...prev,
        error: "Impossible de jouer l'audio: " + err.message,
        isPlaying: false,
        progress: 0,
      }));
    });
  }, []);

  // Arrêt audio (existant)
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    setState((prev) => ({ ...prev, isPlaying: false, progress: 0 }));
  }, []);

  // ✅ PARLER CORRIGÉ avec logs
  const speak = useCallback(
    async (text: string, settings: TTSSettings) => {
      console.log("🗣️ speak() appelé:", {
        textLength: text.length,
        isCurrentlyPlaying: state.isPlaying,
        settings: settings,
      });

      if (state.isPlaying) {
        console.log("🛑 Arrêt de la lecture en cours");
        stopAudio();
        return;
      }

      if (!text.trim()) {
        setState((prev) => ({ ...prev, error: "Aucun texte à lire" }));
        return;
      }

      const audioUrl = await generateSpeech(text, settings);
      if (audioUrl) {
        playAudio(audioUrl);
      }
    },
    [generateSpeech, playAudio, stopAudio, state.isPlaying]
  );

  // Nettoyage des erreurs
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Nettoyage à la destruction
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  return {
    ...state,
    speak,
    stopAudio,
    generateSpeech,
    clearError,
  };
};
