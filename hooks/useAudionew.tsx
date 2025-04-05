import { useAudioPlayer } from "@/context/AudioProvider";
import { AudioContextType } from "@/types/types";

/**
 * Hook qui fournit les fonctionnalités audio de l'application.
 * Ce hook est maintenant indépendant des autres contextes et utilise
 * l'AudioProvider global.
 */
export function useAudio(): AudioContextType {
  try {
    const audioContext = useAudioPlayer();

    // Ajout de shims pour maintenir la compatibilité avec le code existant
    const enhancedContext: AudioContextType = {
      ...audioContext,
      // Alias de seekTo pour compatibilité avec l'ancien API
      setTime: audioContext.seekTo,
      seek: audioContext.seekTo,
      // Alias de audioRef pour compatibilité avec l'ancien API
      playerRef: audioContext.audioRef,
    };

    return enhancedContext;
  } catch (error) {
    console.error("Erreur lors de l'initialisation de useAudio:", error);

    // Fournir un objet fallback pour éviter les erreurs
    // C'est utile pendant la phase de transition où AudioProvider pourrait ne pas être disponible
    const dummyAudioRef = { current: null };

    // Retourner un contexte factice qui ne fait rien
    return {
      audioSrc: null,
      setAudioSrc: () => {},
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      currentWordIndex: -1,
      play: () => {},
      pause: () => {},
      seekTo: () => {},
      setVolume: () => {},
      playAudioAtTimestamp: () => {},
      updateCurrentWordIndex: () => {},
      audioRef: dummyAudioRef,
      playerRef: dummyAudioRef,
      setTime: () => {},
      seek: () => {},
    };
  }
}
