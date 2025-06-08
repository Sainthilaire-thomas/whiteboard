import { useState, useRef, useCallback, useEffect } from "react";
import { UseAudioResult, Word } from "./useAudio.types";

export function useAudio(): UseAudioResult {
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(-1);

  const play = useCallback(() => {
    if (audioRef.current) {
      if (!isPlaying) {
        audioRef.current.play().catch((error) => {
          console.error("Erreur lors de la lecture de l'audio :", error);
        });
        setIsPlaying(true);
      }
    }
  }, [isPlaying]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [isPlaying]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);

  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, []);

  const setTime = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);

  const playAudioAtTimestamp = useCallback((timestamp: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = timestamp;
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, []);

  const updateCurrentWordIndex = useCallback(
    (transcription: Word[], currentTimeParam: number) => {
      const index = transcription.findIndex(
        (word) =>
          currentTimeParam >= word.startTime && currentTimeParam < word.endTime
      );
      setCurrentWordIndex(index);
    },
    []
  );

  // Événements audio pour mettre à jour currentTime et duration
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioSrc]);

  // Détection du changement de visibilité
  useEffect(() => {
    const handleVisibilityChange = () => {
      const audio = audioRef.current;
      if (document.hidden && audio && !audio.paused) {
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
    isPlaying,
    currentTime,
    duration,
    currentWordIndex,
    play,
    pause,
    seekTo,
    setVolume,
    setTime,
    seek,
    playAudioAtTimestamp,
    updateCurrentWordIndex,
    audioRef,
    playerRef: audioRef, // Alias pour compatibilité
  };
}
