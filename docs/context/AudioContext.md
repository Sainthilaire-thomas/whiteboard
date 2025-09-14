# AudioContext - Documentation

## Vue d'ensemble

Le `AudioContext` est le contexte central pour la gestion de l'audio dans l'application. Il fournit un état global et des méthodes de contrôle audio avec protection contre les opérations concurrentes et support des segments temporels.

**Localisation :** `context/AudioContext.tsx`

## Fonctionnalités principales

- **Contrôle audio complet** : Lecture, pause, navigation temporelle
- **Gestion des segments** : Lecture de portions spécifiques avec arrêt automatique
- **Protection concurrentielle** : `executeWithLock` pour éviter les conflits
- **Synchronisation mot-par-mot** : Tracking du mot courant dans la transcription
- **Gestion du volume** : Contrôles volume et mute/unmute
- **État temps réel** : Synchronisation automatique avec l'élément HTML audio

## Interface AudioContextType

```typescript
interface AudioContextType {
  // État audio principal
  audioSrc: string | null; // URL source audio
  setAudioSrc: (src: string | null) => void; // Mise à jour source
  isPlaying: boolean; // État lecture
  currentTime: number; // Temps actuel (secondes)
  duration: number; // Durée totale (secondes)
  currentWordIndex: number; // Index mot courant
  volume: number; // Niveau volume (0-1)
  muted: boolean; // État sourdine

  // Contrôles audio
  play: () => void; // Démarre lecture
  pause: () => void; // Met en pause
  seekTo: (time: number) => void; // Navigation temporelle
  setVolume: (volume: number) => void; // Contrôle volume
  setTime: (time: number) => void; // Alias pour seekTo
  toggleMute: () => void; // Bascule mute/unmute

  // Fonctionnalités avancées
  playAudioAtTimestamp: (timestamp: number) => void; // Navigation + lecture
  updateCurrentWordIndex: (words: Word[], time: number) => void; // Sync transcription
  playSegment: (startTime: number, endTime: number) => void; // Lecture segment
  executeWithLock: (operation: () => Promise<void> | void) => Promise<void>; // Protection concurrentielle

  // Référence DOM
  audioRef: React.RefObject<HTMLAudioElement | null>; // Élément audio HTML
}
```

## Architecture interne

### États principaux

```typescript
// États de base
const [audioSrc, setAudioSrc] = useState<string | null>(null);
const [isPlaying, setIsPlaying] = useState<boolean>(false);
const [currentTime, setCurrentTime] = useState<number>(0);
const [duration, setDuration] = useState<number>(0);
const [volume, setVolumeState] = useState<number>(1);
const [muted, setMuted] = useState<boolean>(false);

// États spécialisés
const [currentWordIndex, setCurrentWordIndex] = useState<number>(-1);
const [currentSegment, setCurrentSegment] = useState<{
  startTime: number;
  endTime: number;
} | null>(null);

// Références et verrous
const audioRef = useRef<HTMLAudioElement>(null);
const isAudioOperationInProgress = useRef(false);
const segmentTimerRef = useRef<NodeJS.Timeout | null>(null);
```

## Fonctionnalités détaillées

### 🔒 Protection concurrentielle avec executeWithLock

```typescript
const executeWithLock = useCallback(async (operation) => {
  if (isAudioOperationInProgress.current) {
    console.log("Opération audio déjà en cours, nouvelle opération ignorée");
    return;
  }

  try {
    isAudioOperationInProgress.current = true;
    await operation();
  } catch (error) {
    console.error("Erreur lors de l'exécution de l'opération audio:", error);
  } finally {
    setTimeout(() => {
      isAudioOperationInProgress.current = false;
    }, 250); // Délai de sécurité
  }
}, []);
```

**Usage typique :**

```typescript
executeWithLock(async () => {
  seekTo(timestamp);
  await new Promise((resolve) => setTimeout(resolve, 150));
  play();
});
```

### 🎵 Gestion avancée des segments

#### Lecture de segment avec arrêt automatique

```typescript
const playSegment = useCallback((startTime: number, endTime: number) => {
  const audio = audioRef.current;
  if (!audio) return;

  console.log(
    `🎵 Lecture segment: ${startTime.toFixed(1)}s → ${endTime.toFixed(1)}s`
  );

  // Nettoyage timer précédent
  if (segmentTimerRef.current) {
    clearTimeout(segmentTimerRef.current);
    segmentTimerRef.current = null;
  }

  // Configuration du segment
  setCurrentSegment({ startTime, endTime });
  audio.currentTime = startTime;

  // Démarrage avec timer d'arrêt automatique
  audio.play().then(() => {
    const segmentDuration = (endTime - startTime) * 1000;

    segmentTimerRef.current = setTimeout(() => {
      console.log("⏹️ Fin du segment - arrêt automatique");
      audio.pause();
      setCurrentSegment(null);
      segmentTimerRef.current = null;
    }, segmentDuration);
  });
}, []);
```

#### Double protection pour les segments

```typescript
const handleTimeUpdate = () => {
  const time = audio.currentTime;
  setCurrentTime(time);

  // Protection supplémentaire : vérification temps réel
  if (currentSegment && time >= currentSegment.endTime) {
    console.log(`⏹️ Fin segment détectée via timeupdate`);
    audio.pause();
    setCurrentSegment(null);
    if (segmentTimerRef.current) {
      clearTimeout(segmentTimerRef.current);
      segmentTimerRef.current = null;
    }
  }
};
```

### 🎯 Synchronisation transcription

#### Mise à jour du mot courant

```typescript
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
```

#### Usage avec transcription

```typescript
// Dans un composant utilisant le contexte
useEffect(() => {
  const onTimeUpdate = () => {
    const currentTime = audioRef.current?.currentTime || 0;
    if (transcription?.words) {
      updateCurrentWordIndex(transcription.words, currentTime);
    }
  };

  const player = audioRef.current;
  if (audioSrc && player) {
    player.addEventListener("timeupdate", onTimeUpdate);
    return () => player.removeEventListener("timeupdate", onTimeUpdate);
  }
}, [audioSrc, transcription, updateCurrentWordIndex]);
```

## Gestion des événements audio

### Event listeners automatiques

```typescript
useEffect(() => {
  const audio = audioRef.current;
  if (!audio) return;

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => {
    setIsPlaying(false);
    // Nettoyage segment si pause manuelle
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
    // Nettoyage segment à la fin
    setCurrentSegment(null);
  };

  const handleVolumeChange = () => {
    setVolumeState(audio.volume);
    setMuted(audio.muted);
  };

  // Ajout des écouteurs
  audio.addEventListener("timeupdate", handleTimeUpdate);
  audio.addEventListener("play", handlePlay);
  audio.addEventListener("pause", handlePause);
  audio.addEventListener("ended", handleEnded);
  audio.addEventListener("volumechange", handleVolumeChange);

  // Nettoyage
  return () => {
    audio.removeEventListener("timeupdate", handleTimeUpdate);
    audio.removeEventListener("play", handlePlay);
    audio.removeEventListener("pause", handlePause);
    audio.removeEventListener("ended", handleEnded);
    audio.removeEventListener("volumechange", handleVolumeChange);
  };
}, [currentSegment]);
```

### Gestion de la visibilité de page

```typescript
const handleVisibilityChange = () => {
  if (document.hidden && !audio.paused) {
    audio.pause(); // Pause automatique si onglet masqué
  }
};

document.addEventListener("visibilitychange", handleVisibilityChange);
```

## Méthodes de contrôle

### Contrôles de base

```typescript
// Lecture
const play = useCallback(async () => {
  const audio = audioRef.current;
  if (!audio || !audio.src) return;

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

// Pause
const pause = useCallback(() => {
  const audio = audioRef.current;
  if (!audio || audio.paused) return;

  try {
    audio.pause();
    // handlePause s'occupe du nettoyage des segments
  } catch (error) {
    console.error("Erreur lors de la pause :", error);
  }
}, []);

// Navigation temporelle
const seekTo = useCallback(
  (time: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    // Annulation segment en cours si navigation manuelle
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
```

### Contrôles de volume

```typescript
// Réglage volume
const setVolume = useCallback((volume: number) => {
  const audio = audioRef.current;
  if (!audio) return;

  const validVolume = Math.max(0, Math.min(volume, 1));
  audio.volume = validVolume;
  setVolumeState(validVolume);
}, []);

// Toggle mute
const toggleMute = useCallback(() => {
  const audio = audioRef.current;
  if (!audio) return;

  audio.muted = !audio.muted;
  setMuted(audio.muted);
}, []);
```

### Méthodes combinées

```typescript
// Navigation + lecture immédiate
const playAudioAtTimestamp = useCallback(
  (timestamp: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    seekTo(timestamp);
    play();
  },
  [seekTo, play]
);
```

## Provider et utilisation

### AudioProvider

```typescript
export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  // ... toute l'implémentation ci-dessus

  const contextValue: AudioContextType = {
    audioSrc, setAudioSrc, isPlaying, currentTime, duration,
    currentWordIndex, volume, muted,
    play, pause, seekTo, setVolume, setTime, toggleMute,
    playAudioAtTimestamp, updateCurrentWordIndex, playSegment,
    executeWithLock, audioRef,
  };

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
      <audio ref={audioRef} />  {/* Élément audio intégré */}
    </AudioContext.Provider>
  );
};
```

### Hook d'utilisation

```typescript
export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error(
      "useAudio doit être utilisé à l'intérieur d'un AudioProvider"
    );
  }
  return context;
};

// Alias pour compatibilité
export const useAudioPlayer = (): AudioContextType => {
  return useAudio();
};
```

## Cas d'usage fréquents

### Navigation avec protection

```typescript
function AudioControl() {
  const { seekTo, play, executeWithLock } = useAudio();

  const handleMarkerClick = (timestamp: number) => {
    executeWithLock(async () => {
      seekTo(timestamp);
      await new Promise((resolve) => setTimeout(resolve, 150)); // Stabilisation
      play();
    });
  };
}
```

### Lecture de segment pour formation

```typescript
function TrainingSegment() {
  const { playSegment } = useAudio();

  const playPracticeSegment = () => {
    playSegment(45.5, 67.8); // Lecture de 45.5s à 67.8s avec arrêt auto
  };
}
```

### Synchronisation transcription

```typescript
function TranscriptDisplay() {
  const { currentWordIndex, updateCurrentWordIndex, audioRef } = useAudio();

  useEffect(() => {
    const onTimeUpdate = () => {
      if (transcription?.words) {
        updateCurrentWordIndex(transcription.words, audioRef.current?.currentTime || 0);
      }
    };

    audioRef.current?.addEventListener("timeupdate", onTimeUpdate);
    return () => audioRef.current?.removeEventListener("timeupdate", onTimeUpdate);
  }, [transcription]);

  return (
    <div>
      {transcription.words.map((word, index) => (
        <span
          key={index}
          style={{
            fontWeight: index === currentWordIndex ? 'bold' : 'normal',
            color: index === currentWordIndex ? 'red' : 'inherit'
          }}
        >
          {word.text}
        </span>
      ))}
    </div>
  );
}
```

## Gestion des erreurs

### Validation des opérations

```typescript
// Vérification source audio
if (!audio.src || audio.src === "about:blank") {
  console.warn("Tentative de lecture sans source audio valide");
  return;
}

// Validation temps de navigation
const validTime = Math.max(0, Math.min(time, audio.duration || 0));
```

### Nettoyage des ressources

```typescript
// Nettoyage au démontage
useEffect(() => {
  return () => {
    if (segmentTimerRef.current) {
      clearTimeout(segmentTimerRef.current);
    }
  };
}, []);

// Nettoyage lors du changement de source
useEffect(() => {
  if (segmentTimerRef.current) {
    clearTimeout(segmentTimerRef.current);
    segmentTimerRef.current = null;
  }
  setCurrentSegment(null);
  // Réinitialisation états...
}, [audioSrc]);
```

## Performance et optimisations

### Optimisations implémentées

- **useCallback** sur toutes les méthodes pour éviter re-renders
- **Refs pour verrous** : Pas de re-render lors des changements de verrou
- **Nettoyage automatique** des timers et listeners
- **Validation des valeurs** avant application (volume, temps)
- **Délais de stabilisation** pour les opérations audio critiques

### Bonnes pratiques

```typescript
// ✅ Toujours utiliser executeWithLock pour opérations critiques
executeWithLock(async () => {
  seekTo(time);
  await new Promise((resolve) => setTimeout(resolve, 150));
  play();
});

// ✅ Vérifier la disponibilité de l'audio
if (audioRef.current && audioSrc) {
  // Opération audio
}

// ✅ Nettoyer les timers dans les useEffect
useEffect(() => {
  const timer = setTimeout(/* ... */);
  return () => clearTimeout(timer);
}, []);
```

## Intégration avec d'autres contextes

### Avec CallDataContext

```typescript
// Utilisation combinée pour navigation par post-it
const { seekTo, executeWithLock } = useAudio();
const { appelPostits } = useCallData();

const navigateToPostit = (postitId: number) => {
  const postit = appelPostits.find((p) => p.id === postitId);
  if (postit) {
    executeWithLock(async () => {
      seekTo(postit.timestamp);
      await new Promise((resolve) => setTimeout(resolve, 150));
      play();
    });
  }
};
```

Cette architecture centralisée garantit une gestion audio robuste et performante à travers toute l'application, avec protection contre les conflits et support des fonctionnalités avancées comme la lecture de segments.
