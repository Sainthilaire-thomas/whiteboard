# TaggingDataContext - Documentation

## Vue d'ensemble

Le `TaggingDataContext` est un contexte spécialisé pour la fonctionnalité de **tagging des appels** . Il gère les appels dédiés au tagging, leurs transcriptions, les tags appliqués et un lecteur audio intégré pour l'annotation temporelle des conversations.

**Localisation :** `context/TaggingDataContext.tsx`

## Fonctionnalités principales

- **Appels de tagging** : Gestion des appels spécialement marqués pour le tagging
- **Transcriptions dédiées** : Chargement et affichage des mots pour navigation
- **Système de tags** : Création, application et suppression de tags temporels
- **Lecteur audio intégré** : Player avec navigation temporelle
- **Tags enrichis** : Association tags avec couleurs et métadonnées
- **Post-its de tagging** : Annotations spécifiques aux appels de tagging

## Interface TaggingDataContextType

```typescript
interface TaggingDataContextType {
  // 📞 Appels de tagging
  taggingCalls: Call[]; // Appels dédiés au tagging
  setTaggingCalls: React.Dispatch<React.SetStateAction<Call[]>>; // Setter direct
  selectedTaggingCall: Call | null; // Appel actuellement sélectionné
  selectTaggingCall: (call: Call) => void; // Sélection avec chargement auto
  callId: string | undefined; // ID de l'appel sélectionné

  // 📚 Transcriptions
  taggingTranscription: Word[]; // Mots de la transcription
  fetchTaggingTranscription: (callId: string) => Promise<void>; // Chargement transcription

  // 🗒️ Post-its de tagging
  taggingPostits: Postit[]; // Post-its de l'appel sélectionné

  // 🎵 Lecteur audio intégré
  audioSrc: string | null; // Source audio
  setAudioSrc: (src: string | null) => void; // Changement source
  playerRef: React.RefObject<HTMLAudioElement | null>; // Référence player HTML
  playAudioAtTimestamp: (timestamp: number) => void; // Navigation + lecture
  updateCurrentWord: (word: Word) => void; // MAJ mot courant
  currentWord: Word | null; // Mot actuellement lu

  // 🏷️ Système de tags
  taggedTurns: TaggedTurn[]; // Tours de parole taggés
  fetchTaggedTurns: (callId: string) => Promise<void>; // Chargement tags existants
  addTag: (newTag: Partial<TaggedTurn>) => Promise<TaggedTurn | null>; // Ajout tag
  deleteTurnTag: (id: string) => Promise<void>; // Suppression tag
  tags: Tag[]; // Définitions des tags disponibles
  setTags: (tags: Tag[]) => void; // MAJ tags disponibles
}
```

## Types de données spécialisés

### Call (Appel de tagging)

```typescript
interface Call {
  callid: string; // ID unique de l'appel
  audiourl?: string; // URL audio directe
  [key: string]: any; // Autres propriétés flexibles
}
```

### Word (Mot de transcription)

```typescript
interface Word {
  id: string; // ID unique du mot
  transcriptid: string; // ID de la transcription parent
  startTime: number; // Temps de début (secondes)
  endTime: number; // Temps de fin (secondes)
  word: string; // Texte du mot
}
```

### TaggedTurn (Tour de parole taggé)

```typescript
interface TaggedTurn {
  id: string; // ID unique du tag
  call_id: string; // ID de l'appel
  start_time: number; // Début du segment (secondes)
  end_time: number; // Fin du segment (secondes)
  tag: string; // Label du tag appliqué
  next_turn_verbatim?: string; // Verbatim du tour suivant
  color?: string; // Couleur associée (enrichie)
}
```

### Tag (Définition de tag)

```typescript
interface Tag {
  id: string; // ID unique
  tag: string; // Label du tag
  color?: string; // Couleur hexadecimale
}
```

## Architecture interne

### États principaux

```typescript
// 📞 Appels et sélection
const [taggingCalls, setTaggingCalls] = useState<Call[]>([]);
const [selectedTaggingCall, setSelectedTaggingCall] = useState<Call | null>(
  null
);

// 📚 Transcription et post-its
const [taggingTranscription, setTaggingTranscription] = useState<Word[]>([]);
const [taggingPostits, setTaggingPostits] = useState<Postit[]>([]);

// 🎵 Lecteur audio
const [audioSrc, setAudioSrc] = useState<string | null>(null);
const playerRef = useRef<HTMLAudioElement | null>(null);
const [currentWord, setCurrentWord] = useState<Word | null>(null);

// 🏷️ Tags
const [taggedTurns, setTaggedTurns] = useState<TaggedTurn[]>([]);
const [tags, setTags] = useState<Tag[]>([]);
```

### Initialisation automatique

```typescript
// Chargement initial des définitions de tags
useEffect(() => {
  const fetchTags = async () => {
    const { data, error } = await supabaseClient.from("lpltag").select("*");

    if (error) {
      console.error("Erreur de récupération des tags:", error.message);
    } else {
      setTags(data ?? []);
    }
  };
  fetchTags();
}, []);
```

## Fonctionnalités détaillées

### 📞 Gestion des appels de tagging

#### Récupération des appels spécialisés

```typescript
const fetchTaggingCalls = useCallback(async () => {
  const { data, error } = await supabaseClient
    .from("call")
    .select("*")
    .eq("is_tagging_call", true) // ✅ Filtre appels de tagging
    .eq("preparedfortranscript", true); // ✅ Avec transcription prête

  if (error) {
    console.error("Erreur lors du fetch des appels:", error);
  } else {
    setTaggingCalls(data ?? []);
  }
}, []);
```

#### Sélection avec chargement automatique

```typescript
const selectTaggingCall = useCallback(
  (call: Call) => {
    setSelectedTaggingCall(call);

    if (call.callid) {
      // Chargement automatique des données liées
      fetchTaggingTranscription(call.callid);
      fetchTaggingPostits(call.callid);
      fetchTaggedTurns(call.callid);

      // Configuration du lecteur audio
      setAudioSrc(call.audiourl ?? null);
    }
  },
  [fetchTaggingTranscription, fetchTaggingPostits, fetchTaggedTurns]
);
```

### 📚 Gestion des transcriptions

#### Chargement en deux étapes

```typescript
const fetchTaggingTranscription = useCallback(async (callId: string) => {
  // Étape 1 : Récupération de l'ID transcription
  const { data: transcriptData, error: transcriptError } = await supabaseClient
    .from("transcript")
    .select("transcriptid")
    .eq("callid", callId)
    .single();

  if (transcriptError || !transcriptData?.transcriptid) {
    console.warn("Transcript ID introuvable pour l'appel:", callId);
    setTaggingTranscription([]);
    return;
  }

  // Étape 2 : Récupération des mots ordonnés
  const { data: wordsData, error: wordsError } = await supabaseClient
    .from("word")
    .select("*")
    .eq("transcriptid", transcriptData.transcriptid)
    .order("startTime", { ascending: true });

  if (wordsError) {
    console.error("Erreur de récupération des mots:", wordsError);
  } else {
    setTaggingTranscription(wordsData ?? []);
  }
}, []);
```

### 🏷️ Système de tags avancé

#### Récupération avec enrichissement couleurs

```typescript
const fetchTaggedTurns = useCallback(
  async (callId: string) => {
    const { data: turnsData, error } = await supabaseClient
      .from("turntagged")
      .select(
        `
      id,
      call_id,
      start_time,
      end_time,
      tag,
      next_turn_verbatim
    `
      )
      .eq("call_id", callId);

    if (error) {
      console.error("Erreur de récupération des tags:", error);
      return;
    }

    // ✅ Enrichissement avec couleurs des tags
    const enrichedTags = (turnsData ?? []).map((turn) => {
      const matchingTag = tags.find((t) => t.tag === turn.tag);
      return {
        ...turn,
        color: matchingTag?.color ?? "transparent",
      };
    });

    setTaggedTurns(enrichedTags);
  },
  [tags]
); // ✅ Dépendance sur tags pour re-enrichir
```

#### Ajout de tags avec enrichissement

```typescript
const addTag = useCallback(async (newTag: Partial<TaggedTurn>) => {
  const { data, error } = await supabaseClient
    .from("turntagged")
    .insert([newTag])
    .select(
      "id, call_id, start_time, end_time, tag, next_turn_verbatim, lpltag(color)"
    );

  if (error) {
    console.error("Erreur lors de l'ajout du tag:", error);
    return null;
  }

  if (data?.length) {
    // ✅ Enrichissement immédiat avec couleur
    const enrichedTag = {
      ...data[0],
      color: data[0].lpltag[0]?.color || "transparent",
    };

    setTaggedTurns((prev) => [...prev, enrichedTag]);
    return enrichedTag;
  }

  return null;
}, []);
```

#### Suppression de tags

```typescript
const deleteTurnTag = useCallback(async (id: string) => {
  const { error } = await supabaseClient
    .from("turntagged")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erreur lors de la suppression du tag:", error.message);
  } else {
    // ✅ Mise à jour locale immédiate
    setTaggedTurns((prev) => prev.filter((tag) => tag.id !== id));
  }
}, []);
```

### 🎵 Lecteur audio intégré

#### Navigation temporelle

```typescript
const playAudioAtTimestamp = (timestamp: number) => {
  if (audioSrc && playerRef.current) {
    playerRef.current.currentTime = timestamp;
    playerRef.current.play();
  }
};
```

#### Mise à jour du mot courant

```typescript
const updateCurrentWord = (word: Word) => setCurrentWord(word);

// Usage dans les composants
const handleWordClick = (word: Word) => {
  updateCurrentWord(word);
  playAudioAtTimestamp(word.startTime);
};
```

## Provider et utilisation

### TaggingDataProvider

```typescript
interface TaggingDataProviderProps {
  children: ReactNode;
}

export const TaggingDataProvider = ({ children }: TaggingDataProviderProps) => {
  // Tous les états et fonctions détaillés ci-dessus

  return (
    <TaggingDataContext.Provider value={{
      // 📞 Appels
      taggingCalls,
      setTaggingCalls,
      selectedTaggingCall,
      selectTaggingCall,
      callId: selectedTaggingCall?.callid,

      // 📚 Transcription
      taggingTranscription,
      fetchTaggingTranscription,

      // 🗒️ Post-its
      taggingPostits,

      // 🎵 Audio
      audioSrc,
      setAudioSrc,
      playerRef,
      playAudioAtTimestamp,
      updateCurrentWord,
      currentWord,

      // 🏷️ Tags
      taggedTurns,
      fetchTaggedTurns,
      addTag,
      deleteTurnTag,
      tags,
      setTags,
    }}>
      {children}
    </TaggingDataContext.Provider>
  );
};
```

### Hook d'utilisation

```typescript
export const useTaggingData = (): TaggingDataContextType => {
  const context = useContext(TaggingDataContext);
  if (!context) {
    throw new Error("useTaggingData must be used within a TaggingDataProvider");
  }
  return context;
};
```

## Cas d'usage fréquents

### Interface de sélection d'appel

```typescript
function TaggingCallSelector() {
  const {
    taggingCalls,
    selectedTaggingCall,
    selectTaggingCall
  } = useTaggingData();

  return (
    <div className="call-selector">
      <h3>Appels de Tagging</h3>
      {taggingCalls.map(call => (
        <button
          key={call.callid}
          onClick={() => selectTaggingCall(call)}
          className={selectedTaggingCall?.callid === call.callid ? 'selected' : ''}
        >
          {call.filename || `Appel ${call.callid}`}
        </button>
      ))}
    </div>
  );
}
```

### Interface de tagging temporel

```typescript
function TemporalTaggingInterface() {
  const {
    taggingTranscription,
    taggedTurns,
    addTag,
    deleteTurnTag,
    tags,
    playAudioAtTimestamp,
    currentWord,
    selectedTaggingCall
  } = useTaggingData();

  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>('');

  const handleWordClick = (word: Word, index: number) => {
    if (!selectionStart) {
      setSelectionStart(index);
    } else if (!selectionEnd) {
      setSelectionEnd(index);
    } else {
      // Reset sélection
      setSelectionStart(index);
      setSelectionEnd(null);
    }

    playAudioAtTimestamp(word.startTime);
  };

  const applyTag = async () => {
    if (selectionStart !== null && selectionEnd !== null && selectedTag && selectedTaggingCall) {
      const startWord = taggingTranscription[selectionStart];
      const endWord = taggingTranscription[selectionEnd];

      const newTag = {
        call_id: selectedTaggingCall.callid,
        start_time: startWord.startTime,
        end_time: endWord.endTime,
        tag: selectedTag,
        next_turn_verbatim: taggingTranscription
          .slice(selectionStart, selectionEnd + 1)
          .map(w => w.word)
          .join(' ')
      };

      await addTag(newTag);

      // Reset sélection
      setSelectionStart(null);
      setSelectionEnd(null);
      setSelectedTag('');
    }
  };

  return (
    <div className="temporal-tagging">
      {/* Contrôles de tagging */}
      <div className="tagging-controls">
        <select
          value={selectedTag}
          onChange={e => setSelectedTag(e.target.value)}
        >
          <option value="">Choisir un tag</option>
          {tags.map(tag => (
            <option key={tag.id} value={tag.tag}>{tag.tag}</option>
          ))}
        </select>

        <button
          onClick={applyTag}
          disabled={!selectionStart || !selectionEnd || !selectedTag}
        >
          Appliquer Tag
        </button>
      </div>

      {/* Transcription avec sélection */}
      <div className="transcription">
        {taggingTranscription.map((word, index) => (
          <span
            key={word.id}
            onClick={() => handleWordClick(word, index)}
            className={`word ${
              currentWord?.id === word.id ? 'current' :
              index >= (selectionStart || -1) && index <= (selectionEnd || -1) ? 'selected' : ''
            }`}
            style={{
              cursor: 'pointer',
              margin: '0 2px',
              padding: '2px 4px',
              backgroundColor: currentWord?.id === word.id ? 'yellow' :
                              index >= (selectionStart || -1) && index <= (selectionEnd || -1) ? 'lightblue' : 'transparent'
            }}
          >
            {word.word}
          </span>
        ))}
      </div>

      {/* Tags existants */}
      <div className="existing-tags">
        <h4>Tags appliqués:</h4>
        {taggedTurns.map(taggedTurn => (
          <div
            key={taggedTurn.id}
            className="tagged-turn"
            style={{
              borderLeft: `4px solid ${taggedTurn.color}`,
              padding: '8px',
              margin: '4px 0'
            }}
          >
            <div className="tag-info">
              <strong>{taggedTurn.tag}</strong>
              <span>({taggedTurn.start_time}s - {taggedTurn.end_time}s)</span>
              <button
                onClick={() => deleteTurnTag(taggedTurn.id)}
                className="delete-tag"
              >
                ×
              </button>
            </div>
            {taggedTurn.next_turn_verbatim && (
              <div className="verbatim">
                "{taggedTurn.next_turn_verbatim}"
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Lecteur audio avec synchronisation

```typescript
function TaggingAudioPlayer() {
  const {
    audioSrc,
    playerRef,
    currentWord,
    taggingTranscription,
    playAudioAtTimestamp
  } = useTaggingData();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const handleTimeUpdate = () => {
      const time = player.currentTime;
      setCurrentTime(time);

      // Trouver le mot courant
      const currentWordIndex = taggingTranscription.findIndex(word =>
        time >= word.startTime && time < word.endTime
      );

      if (currentWordIndex >= 0) {
        updateCurrentWord(taggingTranscription[currentWordIndex]);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    player.addEventListener('timeupdate', handleTimeUpdate);
    player.addEventListener('play', handlePlay);
    player.addEventListener('pause', handlePause);

    return () => {
      player.removeEventListener('timeupdate', handleTimeUpdate);
      player.removeEventListener('play', handlePlay);
      player.removeEventListener('pause', handlePause);
    };
  }, [taggingTranscription]);

  const togglePlayPause = () => {
    const player = playerRef.current;
    if (!player) return;

    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="tagging-audio-player">
      {/* Contrôles */}
      <div className="controls">
        <button onClick={togglePlayPause}>
          {isPlaying ? '⏸️' : '▶️'}
        </button>
        <span className="time">
          {formatTime(currentTime)}
        </span>
      </div>

      {/* Lecteur audio invisible */}
      <audio ref={playerRef} src={audioSrc || undefined} />

      {/* Timeline visuelle */}
      <div className="timeline">
        {taggedTurns.map(tag => {
          const position = (tag.start_time / (playerRef.current?.duration || 1)) * 100;
          const width = ((tag.end_time - tag.start_time) / (playerRef.current?.duration || 1)) * 100;

          return (
            <div
              key={tag.id}
              className="timeline-tag"
              style={{
                position: 'absolute',
                left: `${position}%`,
                width: `${width}%`,
                backgroundColor: tag.color,
                height: '8px',
                cursor: 'pointer',
                opacity: 0.7
              }}
              onClick={() => playAudioAtTimestamp(tag.start_time)}
              title={`${tag.tag}: ${tag.start_time}s - ${tag.end_time}s`}
            />
          );
        })}
      </div>
    </div>
  );
}
```

## Optimisations et performance

### Chargement conditionnel des données

```typescript
// Chargement seulement si appel sélectionné
const selectTaggingCall = useCallback((call: Call) => {
  setSelectedTaggingCall(call);

  if (call.callid) {
    // Parallélisation des chargements
    Promise.all([
      fetchTaggingTranscription(call.callid),
      fetchTaggingPostits(call.callid),
      fetchTaggedTurns(call.callid),
    ]);

    setAudioSrc(call.audiourl ?? null);
  }
}, []);
```

### Enrichissement en temps réel

```typescript
// Re-enrichissement automatique quand les tags changent
const fetchTaggedTurns = useCallback(
  async (callId: string) => {
    // ... récupération des données

    // Enrichissement avec couleurs actuelles
    const enrichedTags = turnsData.map((turn) => {
      const matchingTag = tags.find((t) => t.tag === turn.tag);
      return {
        ...turn,
        color: matchingTag?.color ?? "transparent",
      };
    });

    setTaggedTurns(enrichedTags);
  },
  [tags]
); // ✅ Redéclenche quand tags changent
```

### Gestion mémoire optimisée

```typescript
// Nettoyage à la désélection
const deselectCall = () => {
  setSelectedTaggingCall(null);
  setTaggingTranscription([]);
  setTaggingPostits([]);
  setTaggedTurns([]);
  setAudioSrc(null);
  setCurrentWord(null);
};
```

## Intégration avec base de données

### Structure des tables

```sql
-- Table des appels de tagging
CREATE TABLE call (
  callid varchar PRIMARY KEY,
  audiourl text,
  is_tagging_call boolean DEFAULT false,
  preparedfortranscript boolean DEFAULT false
);

-- Table des définitions de tags
CREATE TABLE lpltag (
  id varchar PRIMARY KEY,
  tag varchar UNIQUE,
  color varchar
);

-- Table des tours taggés
CREATE TABLE turntagged (
  id varchar PRIMARY KEY,
  call_id varchar REFERENCES call(callid),
  start_time numeric,
  end_time numeric,
  tag varchar REFERENCES lpltag(tag),
  next_turn_verbatim text
);

-- Table des transcriptions
CREATE TABLE transcript (
  transcriptid varchar PRIMARY KEY,
  callid varchar REFERENCES call(callid)
);

-- Table des mots
CREATE TABLE word (
  id varchar PRIMARY KEY,
  transcriptid varchar REFERENCES transcript(transcriptid),
  startTime numeric,
  endTime numeric,
  word varchar
);
```

### Requêtes optimisées

```typescript
// Requête avec jointure pour enrichissement
const { data } = await supabaseClient
  .from("turntagged")
  .select(
    `
    id,
    call_id,
    start_time,
    end_time,
    tag,
    next_turn_verbatim,
    lpltag!inner(color)
  `
  )
  .eq("call_id", callId);
```

## Gestion des erreurs

### Validation des données

```typescript
const fetchTaggingTranscription = useCallback(async (callId: string) => {
  try {
    // Étape 1 : Vérification existence transcript
    const { data: transcriptData, error: transcriptError } =
      await supabaseClient
        .from("transcript")
        .select("transcriptid")
        .eq("callid", callId)
        .single();

    if (transcriptError || !transcriptData?.transcriptid) {
      console.warn("❌ Transcript ID introuvable pour l'appel:", callId);
      setTaggingTranscription([]);
      return;
    }

    // Étape 2 : Récupération des mots avec validation
    const { data: wordsData, error: wordsError } = await supabaseClient
      .from("word")
      .select("*")
      .eq("transcriptid", transcriptData.transcriptid)
      .order("startTime", { ascending: true });

    if (wordsError) {
      console.error("❌ Erreur récupération des mots:", wordsError);
      setTaggingTranscription([]);
    } else {
      // Validation des données temps
      const validWords =
        wordsData?.filter(
          (word) => word.startTime >= 0 && word.endTime > word.startTime
        ) || [];

      setTaggingTranscription(validWords);
    }
  } catch (error) {
    console.error(
      "❌ Erreur inattendue lors du chargement transcription:",
      error
    );
    setTaggingTranscription([]);
  }
}, []);
```

### États d'erreur

```typescript
// Extension possible avec états d'erreur
const [error, setError] = useState<string | null>(null);
const [isLoading, setIsLoading] = useState(false);

const fetchTaggingCalls = useCallback(async () => {
  setIsLoading(true);
  setError(null);

  try {
    const { data, error } = await supabaseClient
      .from("call")
      .select("*")
      .eq("is_tagging_call", true)
      .eq("preparedfortranscript", true);

    if (error) throw error;

    setTaggingCalls(data ?? []);
  } catch (err) {
    setError(err instanceof Error ? err.message : "Erreur inconnue");
    console.error("❌ Erreur fetch appels tagging:", err);
  } finally {
    setIsLoading(false);
  }
}, []);
```

## Patterns d'architecture

### Séparation des responsabilités

```typescript
// TaggingDataContext : État et logique métier
// → Composants UI : Présentation et interaction
// → Hooks personnalisés : Logique réutilisable

// Exemple de hook personnalisé
const useTaggingSelection = () => {
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null);

  const resetSelection = () => {
    setSelectionStart(null);
    setSelectionEnd(null);
  };

  const handleWordSelection = (index: number) => {
    if (!selectionStart) {
      setSelectionStart(index);
    } else if (!selectionEnd && index !== selectionStart) {
      setSelectionEnd(Math.max(selectionStart, index));
    } else {
      setSelectionStart(index);
      setSelectionEnd(null);
    }
  };

  return {
    selectionStart,
    selectionEnd,
    resetSelection,
    handleWordSelection,
    hasSelection: selectionStart !== null && selectionEnd !== null,
  };
};
```

### Intégration avec d'autres contextes

```typescript
// Utilisation combinée avec AudioContext pour lecteur avancé
function AdvancedTaggingPlayer() {
  const {
    audioSrc,
    playerRef,
    taggedTurns,
    playAudioAtTimestamp
  } = useTaggingData();

  const {
    executeWithLock,
    playSegment
  } = useAudio(); // Réutilisation du contexte audio principal

  const playTaggedSegment = (tag: TaggedTurn) => {
    executeWithLock(async () => {
      playSegment(tag.start_time, tag.end_time);
    });
  };

  return (
    <div>
      {taggedTurns.map(tag => (
        <button
          key={tag.id}
          onClick={() => playTaggedSegment(tag)}
        >
          Écouter "{tag.tag}"
        </button>
      ))}
    </div>
  );
}
```

## Extensions et évolutions

### Nouveaux types de tags

```typescript
// Extension pour tags hiérarchiques
interface HierarchicalTag extends Tag {
  category: string; // Catégorie du tag
  subcategory?: string; // Sous-catégorie
  severity: "low" | "medium" | "high"; // Niveau de sévérité
  autoDetected: boolean; // Tag détecté automatiquement
}

// Extension pour métadonnées enrichies
interface EnrichedTaggedTurn extends TaggedTurn {
  confidence?: number; // Confiance de l'annotation
  annotator?: string; // Qui a ajouté le tag
  validated?: boolean; // Tag validé par un expert
  notes?: string; // Notes additionnelles
}
```

### Analytics et reporting

```typescript
// Hook pour analytics des tags
const useTaggingAnalytics = (callId?: string) => {
  const { taggedTurns, tags } = useTaggingData();

  const analytics = useMemo(() => {
    if (!taggedTurns.length) return null;

    const tagCounts = taggedTurns.reduce(
      (acc, turn) => {
        acc[turn.tag] = (acc[turn.tag] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const totalDuration = taggedTurns.reduce(
      (acc, turn) => acc + (turn.end_time - turn.start_time),
      0
    );

    const averageTagDuration = totalDuration / taggedTurns.length;

    return {
      tagCounts,
      totalTaggedTime: totalDuration,
      averageTagDuration,
      uniqueTagsCount: Object.keys(tagCounts).length,
      mostUsedTag: Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0],
    };
  }, [taggedTurns]);

  return analytics;
};
```

### Export et import

```typescript
// Fonctions d'export des données de tagging
const exportTaggingData = (callId: string) => {
  const { taggedTurns, taggingTranscription } = useTaggingData();

  const exportData = {
    callId,
    exportDate: new Date().toISOString(),
    taggedTurns: taggedTurns.map((turn) => ({
      ...turn,
      verbatim: taggingTranscription
        .filter(
          (word) =>
            word.startTime >= turn.start_time && word.endTime <= turn.end_time
        )
        .map((word) => word.word)
        .join(" "),
    })),
    statistics: {
      totalTags: taggedTurns.length,
      totalTaggedTime: taggedTurns.reduce(
        (acc, turn) => acc + (turn.end_time - turn.start_time),
        0
      ),
    },
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `tagging-data-${callId}-${Date.now()}.json`;
  a.click();

  URL.revokeObjectURL(url);
};
```

## Bonnes pratiques

### ✅ Do

- **Valider les données** avant stockage (temps, IDs, etc.)
- **Enrichir les tags** avec couleurs lors de l'affichage
- **Gérer les erreurs** gracieusement avec fallbacks
- **Optimiser les requêtes** avec select spécifiques
- **Nettoyer les états** lors des changements d'appel

### ❌ Don't

- **Modifier directement** les arrays d'état sans setState
- **Oublier la validation** des timestamps audio
- **Ignorer les cas** où audioSrc est null
- **Dupliquer la logique** de lecteur audio
- **Bloquer l'UI** pendant les chargements

### Performance tips

```typescript
// ✅ Mémorisation des calculs coûteux
const enrichedTags = useMemo(() => {
  return taggedTurns.map((turn) => ({
    ...turn,
    duration: turn.end_time - turn.start_time,
    color: tags.find((t) => t.tag === turn.tag)?.color ?? "transparent",
  }));
}, [taggedTurns, tags]);

// ✅ Debouncing des sélections rapides
const debouncedSelection = useCallback(
  debounce((wordIndex: number) => {
    handleWordSelection(wordIndex);
  }, 100),
  []
);
```

Le TaggingDataContext constitue un écosystème complet et spécialisé pour l'annotation temporelle des appels, offrant une interface riche et performante pour l'analyse qualitative des conversations avec un système de tags flexible et extensible.

---

## Résumé des 4 contextes

Voici un aperçu de l'architecture complète des contextes :

- **AudioContext** : Gestion audio centrale avec protection concurrentielle et segments
- **AppContext** : État global métier (entreprises, domaines, nudges, UI)
- **CallDataContext** : Hub des données d'appels (transcriptions, post-its, coaching)
- **TaggingDataContext** : Écosystème spécialisé d'annotation temporelle

Cette architecture en couches garantit une séparation claire des responsabilités tout en permettant une intégration fluide entre les différentes fonctionnalités de la plateforme.
