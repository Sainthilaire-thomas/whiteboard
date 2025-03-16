import { useState, useRef, useCallback, useEffect } from "react";
import { AudioContextType, Word } from "@/types/types";

export function useAudio(): AudioContextType {
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const playerRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(-1); // Ajouter l'index du mot en lecture

  const play = useCallback(() => {
    if (playerRef.current) {
      // Si l'audio est déjà en train de jouer, on ne relance pas la lecture
      if (!isPlaying) {
        playerRef.current.play().catch((error) => {
          console.error("Erreur lors de la lecture de l'audio :", error);
        });
        setIsPlaying(true);
      }
    }
  }, [isPlaying]);

  const pause = useCallback(() => {
    if (playerRef.current) {
      // Si l'audio est en train de jouer, on le met en pause
      if (isPlaying) {
        playerRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [isPlaying]);

  const seek = useCallback((time: number) => {
    if (playerRef.current) {
      playerRef.current.currentTime = time;
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (playerRef.current) {
      playerRef.current.volume = volume;
    }
  }, []);

  const setTime = useCallback((time: number) => {
    if (playerRef.current) {
      playerRef.current.currentTime = time;
    }
  }, []);

  const playAudioAtTimestamp = useCallback((timestamp: number) => {
    if (playerRef.current) {
      playerRef.current.currentTime = timestamp;
      playerRef.current.play();
      setIsPlaying(true);
    }
  }, []);

  // Suivi de l'index du mot en lecture

  const updateCurrentWordIndex = useCallback(
    (transcription: Word[], currentTime: number) => {
      const index = transcription.findIndex(
        (word) => currentTime >= word.startTime && currentTime < word.endTime
      );

      setCurrentWordIndex(index); // Met à jour l'index
    },
    []
  );

  // Détection du changement de visibilité
  useEffect(() => {
    const handleVisibilityChange = () => {
      const player = playerRef.current;
      if (document.hidden && player && !player.paused) {
        pause();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pause]);

  return {
    audioSrc,
    setAudioSrc,
    playAudioAtTimestamp,
    playerRef,
    isPlaying,
    play,
    pause,
    seek,
    setVolume,
    setTime,
    currentWordIndex, // Exposer l'index des mots en lecture
    updateCurrentWordIndex, // Méthode pour mettre à jour l'index
  };
}
