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
  play: () => void;
  pause: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  playAudioAtTimestamp: (timestamp: number) => void;
  updateCurrentWordIndex: (words: Word[], time: number) => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}

// Création du contexte avec une valeur par défaut undefined
const AudioContext = createContext<AudioContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte audio
export const useAudioPlayer = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error(
      "useAudioPlayer doit être utilisé à l'intérieur d'un AudioProvider"
    );
  }
  return context;
};

interface AudioProviderProps {
  children: ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  // États
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(-1);

  // Référence à l'élément audio
  const audioRef = useRef<HTMLAudioElement>(new Audio());

  // Configurer l'élément audio lorsque la source change
  useEffect(() => {
    const audio = audioRef.current;

    try {
      if (audioSrc) {
        // Vérifier que la source est valide avant de l'assigner
        if (typeof audioSrc === "string" && audioSrc.trim() !== "") {
          audio.src = audioSrc;
          audio.load();
          console.log("🎵 Source audio chargée:", audioSrc);
        } else {
          console.warn("⚠️ Source audio invalide:", audioSrc);
        }
      } else {
        // Si pas de source, nettoyer proprement
        if (audio.src) {
          audio.pause();
          audio.src = "";
          console.log("🎵 Source audio effacée");
        }
      }
    } catch (err) {
      console.error("🔴 Erreur lors du chargement audio:", err);
    }

    // Réinitialiser les états
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    setCurrentWordIndex(-1);
  }, [audioSrc]);

  // Gestion des événements de l'élément audio
  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleDurationChange = () => {
      setDuration(audio.duration || 0);
      console.log("🎵 Durée audio:", audio.duration);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      console.log("🎵 Lecture démarrée");
    };

    const handlePause = () => {
      setIsPlaying(false);
      console.log("🎵 Lecture en pause");
    };

    const handleEnded = () => {
      setIsPlaying(false);
      console.log("🎵 Lecture terminée");
    };

    const handleError = (e: Event) => {
      const audio = e.target as HTMLAudioElement;
      console.error("🔴 Erreur audio:", e);

      // Récupérer le code d'erreur si disponible
      let errorMessage = "Erreur inconnue";
      if (audio && audio.error) {
        switch (audio.error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = "La lecture a été interrompue";
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = "Erreur réseau";
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = "Erreur de décodage";
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = "Format audio non supporté";
            break;
        }
      }

      console.warn(`⚠️ Détail de l'erreur audio: ${errorMessage}`);

      // Mettre en pause et réinitialiser l'état
      setIsPlaying(false);
    };

    // Ajouter les écouteurs d'événements
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    audio.addEventListener("loadedmetadata", handleDurationChange);

    // Gestion de la visibilité de la page
    const handleVisibilityChange = () => {
      if (document.hidden && !audio.paused) {
        audio.pause();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Nettoyage des écouteurs lors du démontage
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("loadedmetadata", handleDurationChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Méthodes de contrôle de l'audio
  const play = useCallback(() => {
    const audio = audioRef.current;

    // Vérifier que l'audio et la source sont valides
    if (!audio) {
      console.warn("⚠️ Élément audio non disponible");
      return;
    }

    if (
      !audio.src ||
      audio.src === "about:blank" ||
      audio.src === window.location.href
    ) {
      console.warn("⚠️ Tentative de lecture sans source audio valide");
      return;
    }

    // Vérifier que l'audio est prêt à être lu
    if (audio.readyState < 2) {
      // HAVE_CURRENT_DATA
      console.warn(
        "⚠️ L'audio n'est pas encore prêt à être lu. État:",
        audio.readyState
      );

      // Essayer à nouveau après un délai
      const checkAndPlay = () => {
        if (audio.readyState >= 2) {
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise.catch((error) => {
              console.error("🔴 Erreur lors de la lecture:", error);
            });
          }
        } else {
          setTimeout(checkAndPlay, 100);
        }
      };

      setTimeout(checkAndPlay, 100);
      return;
    }

    // Lecture normale si tout est prêt
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.error("🔴 Erreur lors de la lecture:", error);
      });
    }
  }, []);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (audio && !audio.paused) {
      audio.pause();
    }
  }, []);

  const seekTo = useCallback((time: number) => {
    const audio = audioRef.current;
    if (audio && !isNaN(time)) {
      const validTime = Math.max(0, Math.min(time, audio.duration || 0));
      audio.currentTime = validTime;
      setCurrentTime(validTime);
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    const audio = audioRef.current;
    if (audio) {
      const validVolume = Math.max(0, Math.min(volume, 1));
      audio.volume = validVolume;
    }
  }, []);

  const playAudioAtTimestamp = useCallback(
    (timestamp: number) => {
      const audio = audioRef.current;
      if (audio && audio.src) {
        seekTo(timestamp);
        play();
      }
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
  const value: AudioContextType = {
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
  };

  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
};
