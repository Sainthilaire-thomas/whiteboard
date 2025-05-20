import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { Word } from "@/types/types";

// Type pour le contexte audio
export interface AudioContextType {
  audioSrc: string | null;
  setAudioSrc: (src: string | null) => void;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  currentWordIndex: number;

  // Méthodes de contrôle
  play: () => void;
  pause: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  playAudioAtTimestamp: (timestamp: number) => void;
  updateCurrentWordIndex: (words: Word[], time: number) => void;

  // Référence à l'élément audio
  audioRef: React.RefObject<HTMLAudioElement>;
}

// Création du contexte
const AudioContext = createContext<AudioContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte audio
export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error(
      "useAudio doit être utilisé à l'intérieur d'un AudioProvider"
    );
  }
  return context;
};

// Props du provider
interface AudioProviderProps {
  children: ReactNode;
}

// Implémentation du provider
export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  // États de l'audio
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(-1);
  const isAudioOperationInProgress = useRef(false);

  const executeWithLock = useCallback(
    async (operation: () => Promise<void> | void) => {
      if (isAudioOperationInProgress.current) {
        console.log(
          "Opération audio déjà en cours, nouvelle opération ignorée"
        );
        return;
      }

      try {
        isAudioOperationInProgress.current = true;
        await operation();
      } catch (error) {
        console.error(
          "Erreur lors de l'exécution de l'opération audio:",
          error
        );
      } finally {
        setTimeout(() => {
          isAudioOperationInProgress.current = false;
        }, 250);
      }
    },
    []
  );

  // Référence à l'élément audio
  const audioRef = useRef<HTMLAudioElement>(null);

  // Configuration de l'audio lors du changement de source
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Réinitialisation des états
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    setCurrentWordIndex(-1);

    // Chargement de la nouvelle source
    if (audioSrc) {
      audio.src = audioSrc;
      audio.load();
    } else {
      audio.src = "";
    }
  }, [audioSrc]);

  // Gestion des événements audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleDurationChange = () => {
      setDuration(audio.duration || 0);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    // Ajout des écouteurs d'événements
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    // Gestion de la visibilité de la page
    const handleVisibilityChange = () => {
      if (document.hidden && !audio.paused) {
        audio.pause();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Nettoyage des écouteurs
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Méthodes de contrôle audio
  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    // Vérification de l'état et de la source
    if (!audio.src || audio.src === "about:blank") {
      console.warn("Tentative de lecture sans source audio valide");
      return;
    }

    try {
      // Lecture sécurisée avec await pour attendre que la promesse soit résolue
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        await playPromise;
        // setIsPlaying est maintenant appelé après la résolution de la promesse
        // mais ce n'est pas nécessaire car l'événement 'play' le fera
      }
    } catch (error) {
      console.error("Erreur lors de la lecture :", error);
      // En cas d'erreur, s'assurer que l'état est cohérent
      setIsPlaying(false);
    }
  }, []);

  // Correction de la méthode pause dans AudioContext.tsx
  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      // S'assurer qu'on met en pause seulement si l'audio est en lecture
      if (!audio.paused) {
        audio.pause();
        // setIsPlaying est géré par l'événement 'pause'
      }
    } catch (error) {
      console.error("Erreur lors de la mise en pause :", error);
    }
  }, []);

  const seekTo = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    // Validation du temps
    const validTime = Math.max(0, Math.min(time, audio.duration || 0));
    audio.currentTime = validTime;
  }, []);

  const setVolume = useCallback((volume: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    // Validation du volume
    const validVolume = Math.max(0, Math.min(volume, 1));
    audio.volume = validVolume;
  }, []);

  const playAudioAtTimestamp = useCallback(
    (timestamp: number) => {
      const audio = audioRef.current;
      if (!audio) return;

      seekTo(timestamp);
      play();
    },
    [seekTo, play]
  );

  const updateCurrentWordIndex = useCallback(
    (words: Word[], time: number) => {
      if (!words || words.length === 0) return;

      const index = words.findIndex(
        (word) => time >= word.startTime && time < word.endTime
      );

      if (index !== currentWordIndex) {
        setCurrentWordIndex(index);
      }
    },
    [currentWordIndex]
  );

  // Valeur du contexte
  const contextValue: AudioContextType = {
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
    playAudioAtTimestamp,
    updateCurrentWordIndex,
    audioRef,
    executeWithLock,
  };

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
      <audio ref={audioRef} />
    </AudioContext.Provider>
  );
};
