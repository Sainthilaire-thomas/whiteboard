# Documentation Transcript.tsx

## Vue d'ensemble

Le composant **Transcript** est le composant central d'affichage des transcriptions en **mode mot-par-mot** . Il offre une synchronisation précise entre l'audio et le texte, permettant une navigation temporelle fine et une annotation précise des conversations téléphoniques.

**Localisation :** `app/evaluation/components/EvaluationTranscript/Transcript.tsx`

## Fonctionnalités principales

### 🎯 Synchronisation Audio-Texte

- **Surlignage temps réel** du mot actuellement lu
- **Navigation par clic** : clic sur un mot = navigation audio
- **Auto-scroll intelligent** : suit automatiquement la lecture
- **Gestion des marqueurs temporels** pour les post-its

### 🎨 Modes d'affichage

- **Mode normal** : Interaction complète avec l'audio
- **Mode spectateur** : Synchronisation avec un coach distant
- **Mode sélection** : Sélection de texte par locuteur (client/conseiller)
- **Coloration des locuteurs** : Distinction visuelle client/conseiller

### 📝 Système d'annotation

- **Post-its intégrés** : Affichage en popover
- **Marqueurs timeline** : Visualisation des annotations sur la barre de progression
- **Sélection contextuelle** : Sélection de texte selon le mode actif

## Interface et Props

### Props principales

```typescript
interface TranscriptProps {
  // Identification
  callId: number; // ID de l'appel à afficher

  // Configuration d'affichage
  hideHeader?: boolean; // Masquer l'en-tête local
  highlightTurnOne?: boolean; // Colorer les tours de parole
  transcriptSelectionMode?: string; // Mode sélection ("client"|"conseiller")

  // Mode spectateur (synchronisation)
  isSpectatorMode?: boolean; // Mode observateur synchronisé
  highlightedWordIndex?: number; // Index du mot surligné (spectateur)
  highlightedParagraphIndex?: number; // Index paragraphe surligné
  highlightSpeakers?: boolean; // Coloration des locuteurs
  viewMode?: "word" | "paragraph"; // Mode de vue
  transcription?: Transcription | null; // Transcription externe (spectateur)
}
```

### Types internes

```typescript
interface PostitType {
  id: number;
  callid: number;
  wordid: number;
  word: string;
  text: string;
  iddomaine: number | null;
  sujet: string;
  idsujet: number | null;
  pratique: string;
  idpratique?: number | null;
  timestamp: number;
  idactivite?: number | null;
}

interface TextSelectionType {
  text: string;
  startTime: number;
  endTime: number;
  wordIndex: number;
  speaker: "client" | "conseiller";
}
```

## Architecture interne

### 🔗 Hooks et contextes utilisés

```typescript
const {
  transcription: contextTranscription,
  fetchTranscription,
  selectedCall,
  createAudioUrlWithToken,
  updateCurrentWord,
  appelPostits,
  transcriptSelectionMode: contextSelectionMode,
  setClientSelection,
  setConseillerSelection,
} = useCallData();

const {
  isPlaying,
  audioRef,
  play,
  pause,
  seekTo,
  audioSrc,
  setAudioSrc,
  currentWordIndex,
  updateCurrentWordIndex,
  executeWithLock,
} = useAudio();
```

### 🎛️ États locaux

```typescript
// Gestion des références DOM
const containerRef = useRef<HTMLDivElement>(null);
const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

// Gestion des post-its en popover
const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
const [selectedPostit, setSelectedPostit] = useState<PostitType | null>(null);
```

## Fonctionnalités détaillées

### 🎵 Gestion audio avancée

#### Chargement et initialisation

```typescript
useEffect(() => {
  if (selectedCall?.filepath) {
    setAudioSrc(null);
    Promise.resolve(createAudioUrlWithToken(selectedCall.filepath)).then(
      (url: string | null) => {
        if (url) setAudioSrc(url);
      }
    );
  }
}, [selectedCall, setAudioSrc]);
```

#### Synchronisation temporelle

```typescript
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

#### Navigation par clic

```typescript
const handleWordClick = (word: Word, index: number) => {
  if (isSpectatorMode) return; // Pas d'interaction en mode spectateur

  executeWithLock(async () => {
    if (isPlaying) {
      pause();
    } else {
      seekTo(word.startTime);
      await new Promise((resolve) => setTimeout(resolve, 150));
      play();
    }
  });
};
```

### 🎨 Système de coloration intelligente

#### Styles conditionnels par mode

```typescript
const getWordStyle = (index: number, word: Word) => {
  const speakerType = getSpeakerType(word.turn ?? "turn1");

  let style = {
    fontWeight: "normal" as "normal" | "bold",
    color: "inherit" as string,
    backgroundColor: "transparent" as string,
    padding: "2px 4px",
    borderRadius: "4px",
  };

  if (isSpectatorMode) {
    // Mode spectateur : highlighting synchronisé (bleu)
    if (viewMode === "word" && index === highlightedWordIndex) {
      style.fontWeight = "bold";
      style.color = "white";
      style.backgroundColor = "#2563eb";
    }
  } else {
    // Mode normal : mot courant (rouge)
    if (index === currentWordIndex) {
      style.fontWeight = "bold";
      style.color = "red";
    }
  }

  // Coloration des locuteurs si activée
  if (highlightTurnOne) {
    const speakerStyle = getSpeakerStyle(speakerType, true);
    if (speakerStyle.backgroundColor) {
      style.backgroundColor = speakerStyle.backgroundColor;
    }
  }

  return style;
};
```

### 📝 Sélection de texte contextuelle

#### Gestion de la sélection par locuteur

```typescript
const handleTextSelection = () => {
  if (!activeSelectionMode || !transcription?.words) return;

  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const selectedIndices: number[] = [];
  const range = selection.getRangeAt(0);

  wordRefs.current.forEach((ref, idx) => {
    if (ref && range.intersectsNode(ref)) {
      const word = transcription.words[idx];
      const isClientWord = isSpeakerClient(word.turn);
      const isConseillerWord = isSpeakerConseil(word.turn);

      if (
        (activeSelectionMode === "client" && isClientWord) ||
        (activeSelectionMode === "conseiller" && isConseillerWord)
      ) {
        selectedIndices.push(idx);
      }
    }
  });

  // Création de l'objet sélection et transmission au contexte
  if (selectedIndices.length > 0) {
    const selectionData = {
      text: selection.toString().trim(),
      startTime: transcription.words[selectedIndices[0]].startTime,
      endTime:
        transcription.words[selectedIndices[selectedIndices.length - 1]]
          .endTime,
      wordIndex: selectedIndices[0],
      speaker: activeSelectionMode as "client" | "conseiller",
    };

    if (activeSelectionMode === "client") {
      setClientSelection(selectionData);
    } else {
      setConseillerSelection(selectionData);
    }
  }
};
```

### 📍 Système de post-its intégrés

#### Marqueurs timeline

```typescript
const postitMarkers = appelPostits.map((postit) => ({
  id: postit.id,
  time: postit.timestamp,
  label: postit.sujet || "Sans sujet",
}));
```

#### Gestion des popovers

```typescript
const handlePostitClick = (
  event: React.MouseEvent<HTMLElement>,
  postit: PostitType
) => {
  setSelectedPostit(postit);
  setAnchorEl(event.currentTarget);
};
```

## Optimisations de performance

### 🚀 Mémoïsation avec React.memo

```typescript
export default memo(Transcript, (prevProps, nextProps) => {
  return (
    prevProps.callId === nextProps.callId &&
    prevProps.hideHeader === nextProps.hideHeader &&
    prevProps.highlightTurnOne === nextProps.highlightTurnOne &&
    prevProps.transcriptSelectionMode === nextProps.transcriptSelectionMode &&
    prevProps.isSpectatorMode === nextProps.isSpectatorMode &&
    prevProps.highlightedWordIndex === nextProps.highlightedWordIndex &&
    prevProps.highlightedParagraphIndex ===
      nextProps.highlightedParagraphIndex &&
    prevProps.highlightSpeakers === nextProps.highlightSpeakers &&
    prevProps.viewMode === nextProps.viewMode
  );
});
```

### ⚡ Gestion des références optimisée

- **wordRefs.current** : Array de références pour chaque mot
- **containerRef** : Référence du conteneur pour le scroll
- **Nettoyage automatique** des event listeners

### 📊 Auto-scroll intelligent

```typescript
useEffect(() => {
  if (currentWordIndex >= 0 && wordRefs.current[currentWordIndex]) {
    wordRefs.current[currentWordIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }
}, [currentWordIndex]);
```

## Modes d'utilisation

### 🎯 Mode Normal (Coach/Évaluateur)

```typescript
<Transcript
  callId={selectedCall.callid}
  hideHeader={true}
  highlightTurnOne={highlightTurnOne}
  transcriptSelectionMode={selectionMode}
/>
```

**Caractéristiques :**

- Navigation audio interactive
- Annotation par sélection de texte
- Gestion des post-its
- Coloration des locuteurs

### 👥 Mode Spectateur (Apprenant)

```typescript
<Transcript
  callId={callId}
  isSpectatorMode={true}
  highlightedWordIndex={syncedWordIndex}
  viewMode="word"
  transcription={sharedTranscription}
  highlightTurnOne={syncedHighlighting}
/>
```

**Caractéristiques :**

- Synchronisation avec le coach
- Pas d'interaction audio (mode lecture seule)
- Highlighting reçu en temps réel
- Curseur et sélection désactivés

### 📝 Mode Sélection (Annotation)

```typescript
<Transcript
  callId={callId}
  transcriptSelectionMode="client" // ou "conseiller"
  highlightTurnOne={false}
/>
```

**Caractéristiques :**

- Sélection de texte par locuteur
- Transmission automatique au contexte
- Interface adaptée (curseur texte)
- Zones sélectionnables mises en évidence

## Intégration avec AudioPlayer

### 🎵 Timeline interactive

```typescript
<AudioPlayer
  markers={postitMarkers}
  onMarkerClick={(id) => {
    const postit = appelPostits.find((p) => p.id === id);
    if (postit) {
      const event = {
        currentTarget: document.getElementById(`marker-${id}`) || document.body,
      };
      handlePostitClick(event as React.MouseEvent<HTMLElement>, postit);
    }
  }}
/>
```

### 📍 Navigation par marqueurs

- **Clic sur marqueur** = Navigation audio + Ouverture post-it
- **Synchronisation bidirectionnelle** audio ↔ timeline
- **Gestion des conflits** avec executeWithLock

## Gestion des erreurs et cas edge

### 🛡️ Protection des interactions

```typescript
// Protection contre les actions simultanées
executeWithLock(async () => {
  // Opérations audio protégées
});

// Vérifications de sécurité
if (isSpectatorMode) {
  console.log("Mode spectateur - interactions désactivées");
  return;
}
```

### 📱 Responsive et accessibilité

```typescript
sx={{
  cursor: isSpectatorMode
    ? "default"
    : activeSelectionMode
      ? "text"
      : "pointer",
  userSelect: isSpectatorMode
    ? "none"
    : activeSelectionMode
      ? "text"
      : "none",
}}
```

## Bonnes pratiques d'utilisation

### ✅ Do

- **Utiliser hideHeader={true}** lors de l'intégration dans EvaluationTranscript
- **Passer transcriptSelectionMode** pour la sélection contextuelle
- **Gérer isSpectatorMode** pour les sessions collaboratives
- **Transmettre highlightedWordIndex** en mode spectateur

### ❌ Don't

- **Modifier directement wordRefs** sans passer par les mécanismes
- **Ignorer executeWithLock** pour les opérations audio
- **Forcer le re-render** avec des props qui changent constamment
- **Oublier de nettoyer les event listeners**

## Évolutions futures

### 🔮 Améliorations prévues

- **Mode picture-in-picture** pour affichage flottant
- **Reconnaissance vocale** en temps réel
- **Annotations collaboratives** multi-utilisateurs
- **Export de segments** avec timestamps
- **Recherche textuelle** dans la transcription
- **Raccourcis clavier** pour navigation rapide

### 🧪 Expérimentations

- **IA d'assistance** pour suggestions d'annotation
- **Analyse sentiment** en temps réel sur les mots
- **Détection automatique** des moments clés
- **Intégration avec systèmes CRM** externes

---

_Ce composant représente le cœur technique de l'expérience d'évaluation, alliant précision temporelle, flexibilité d'affichage et performance pour créer un outil professionnel d'analyse des conversations téléphoniques._
