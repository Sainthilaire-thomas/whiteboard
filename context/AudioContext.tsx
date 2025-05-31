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
  playSegment: (startTime: number, endTime: number) => void;
  executeWithLock: (operation: () => Promise<void> | void) => Promise<void>;

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

  // ✅ AJOUT : État pour gérer les segments en cours
  const [currentSegment, setCurrentSegment] = useState<{
    startTime: number;
    endTime: number;
  } | null>(null);

  // ✅ AJOUT : Référence pour le timer de segment
  const segmentTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  // ✅ NOUVELLE VERSION : Méthode pour jouer un segment avec gestion améliorée
  const playSegment = useCallback((startTime: number, endTime: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    console.log(
      `🎵 Lecture segment: ${startTime.toFixed(1)}s → ${endTime.toFixed(1)}s`
    );

    // ✅ Nettoyer le timer précédent s'il existe
    if (segmentTimerRef.current) {
      clearTimeout(segmentTimerRef.current);
      segmentTimerRef.current = null;
    }

    // ✅ Définir le segment actuel
    setCurrentSegment({ startTime, endTime });

    // Aller au début du segment
    audio.currentTime = startTime;

    // Démarrer la lecture
    audio
      .play()
      .then(() => {
        // ✅ Calculer la durée du segment et programmer l'arrêt
        const segmentDuration = (endTime - startTime) * 1000; // en millisecondes

        segmentTimerRef.current = setTimeout(() => {
          console.log(
            `⏹️ Fin du segment programmée atteinte, arrêt automatique`
          );
          audio.pause();
          setCurrentSegment(null);
          segmentTimerRef.current = null;
        }, segmentDuration);
      })
      .catch((error) => {
        console.error("Erreur lors de la lecture du segment:", error);
        setCurrentSegment(null);
      });
  }, []);

  // ✅ AJOUT : Fonction pour arrêter la lecture de segment
  const stopSegment = useCallback(() => {
    if (segmentTimerRef.current) {
      clearTimeout(segmentTimerRef.current);
      segmentTimerRef.current = null;
    }
    setCurrentSegment(null);

    const audio = audioRef.current;
    if (audio && !audio.paused) {
      audio.pause();
    }
  }, []);

  // Configuration de l'audio lors du changement de source
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // ✅ Nettoyer les segments en cours lors du changement de source
    if (segmentTimerRef.current) {
      clearTimeout(segmentTimerRef.current);
      segmentTimerRef.current = null;
    }
    setCurrentSegment(null);

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

  // ✅ MODIFICATION : Gestion des événements audio avec contrôle de segment
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const time = audio.currentTime;
      setCurrentTime(time);

      // ✅ Vérifier si on dépasse la fin du segment (sécurité supplémentaire)
      if (currentSegment && time >= currentSegment.endTime) {
        console.log(
          `⏹️ Fin du segment détectée via timeupdate (${time.toFixed(
            1
          )}s >= ${currentSegment.endTime.toFixed(1)}s)`
        );
        audio.pause();
        setCurrentSegment(null);
        if (segmentTimerRef.current) {
          clearTimeout(segmentTimerRef.current);
          segmentTimerRef.current = null;
        }
      }
    };

    const handleDurationChange = () => {
      setDuration(audio.duration || 0);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
      // ✅ Si on met en pause manuellement, nettoyer le segment
      if (currentSegment) {
        setCurrentSegment(null);
        if (segmentTimerRef.current) {
          clearTimeout(segmentTimerRef.current);
          segmentTimerRef.current = null;
        }
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      // ✅ Nettoyer le segment à la fin
      if (currentSegment) {
        setCurrentSegment(null);
        if (segmentTimerRef.current) {
          clearTimeout(segmentTimerRef.current);
          segmentTimerRef.current = null;
        }
      }
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
  }, [currentSegment]); // ✅ Dépendance sur currentSegment

  // ✅ Nettoyage au démontage du composant
  useEffect(() => {
    return () => {
      if (segmentTimerRef.current) {
        clearTimeout(segmentTimerRef.current);
      }
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
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        await playPromise;
      }
    } catch (error) {
      console.error("Erreur lors de la lecture :", error);
      setIsPlaying(false);
    }
  }, []);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (!audio.paused) {
        audio.pause();
        // Le handlePause s'occupera de nettoyer currentSegment
      }
    } catch (error) {
      console.error("Erreur lors de la mise en pause :", error);
    }
  }, []);

  const seekTo = useCallback(
    (time: number) => {
      const audio = audioRef.current;
      if (!audio) return;

      // ✅ Si on cherche pendant un segment, l'annuler
      if (currentSegment) {
        setCurrentSegment(null);
        if (segmentTimerRef.current) {
          clearTimeout(segmentTimerRef.current);
          segmentTimerRef.current = null;
        }
      }

      const validTime = Math.max(0, Math.min(time, audio.duration || 0));
      audio.currentTime = validTime;
    },
    [currentSegment]
  );

  const setVolume = useCallback((volume: number) => {
    const audio = audioRef.current;
    if (!audio) return;

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
    playSegment,
  };

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
      <audio ref={audioRef} />
    </AudioContext.Provider>
  );
};
