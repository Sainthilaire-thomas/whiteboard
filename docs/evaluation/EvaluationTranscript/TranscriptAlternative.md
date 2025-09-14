# Documentation TranscriptAlternative.tsx

## Vue d'ensemble

Le composant **TranscriptAlternative** offre une vue **par paragraphes de locuteurs** pour l'affichage des transcriptions. Contrairement à la vue mot-par-mot, cette approche privilégie la **lisibilité** et la **fluidité de lecture** en regroupant les interventions par tours de parole complets.

**Localisation :** `app/evaluation/components/EvaluationTranscript/TranscriptAlternative.tsx`

## Philosophie d'affichage

### Vue paragraphes vs Vue mot-par-mot

```
┌─────────────────────────────────────────────────────────────┐
│                    Vue TranscriptAlternative                │
├─────┬─────────────┬────────────────────────────────────────┤
│09:42│ Client:     │ Bonjour, j'appelle car j'ai un         │
│     │             │ problème avec mon compte qui s'est     │
│     │             │ retrouvé bloqué depuis hier matin...   │
├─────┼─────────────┼────────────────────────────────────────┤
│10:15│ Conseiller: │ Bonjour Monsieur, je vais examiner     │
│     │             │ votre dossier. Pouvez-vous me donner   │
│     │             │ votre numéro de client...              │
└─────┴─────────────┴────────────────────────────────────────┘
```

**Avantages :**

- **Lecture naturelle** : Paragraphes complets par locuteur
- **Identification visuelle** : Distinction claire client/conseiller
- **Contexte préservé** : Tours de parole dans leur intégralité
- **Navigation intuitive** : Clic paragraphe = navigation audio

## Interface et Props

### Props principales

```typescript
interface TranscriptAlternativeProps {
  // Identification
  callId: number; // ID de l'appel à afficher
  audioSrc?: string; // URL audio (optionnelle)

  // Configuration d'affichage
  hideHeader?: boolean; // Masquer l'en-tête local
  highlightSpeakers?: boolean; // Colorer les locuteurs
  transcriptSelectionMode?: string; // Mode sélection par locuteur

  // Mode spectateur (synchronisation)
  isSpectatorMode?: boolean; // Mode observateur synchronisé
  highlightedWordIndex?: number; // Index mot surligné (hérité)
  highlightedParagraphIndex?: number; // Index paragraphe surligné
  highlightTurnOne?: boolean; // Coloration tours de parole
  viewMode?: "word" | "paragraph"; // Mode de vue
  transcription?: Transcription | null; // Transcription externe
}
```

### Types spécialisés

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
```

## Architecture interne

### Regroupement intelligent des mots

La fonctionnalité clé de ce composant est le **regroupement automatique** des mots en paragraphes cohérents :

```typescript
useEffect(() => {
  if (transcription?.words && transcription.words.length > 0) {
    try {
      const grouped = groupWordsBySpeaker(transcription.words);
      setParagraphs(grouped);
    } catch (err) {
      console.error("Erreur lors du regroupement des mots:", err);
    }
  }
}, [transcription]);
```

### Structure SpeakerParagraph

```typescript
interface SpeakerParagraph {
  turn: string; // Tour de parole (turn1, turn2...)
  startTime: number; // Début du paragraphe
  endTime: number; // Fin du paragraphe
  text: string; // Texte complet du paragraphe
  words: Word[]; // Mots constituants
  startWordIndex?: number; // Index du premier mot dans la transcription
}
```

### Gestion des états spécialisés

```typescript
const [paragraphs, setParagraphs] = useState<SpeakerParagraph[]>([]);
const [currentParagraphIndex, setCurrentParagraphIndex] = useState<number>(-1);
const paragraphRefs = useRef<(HTMLDivElement | null)[]>([]);
```

## Fonctionnalités principales

### Synchronisation audio-paragraphe

#### Détection du paragraphe courant

```typescript
useEffect(() => {
  const onTimeUpdate = () => {
    const currentTime = audioRef.current?.currentTime || 0;

    // Mise à jour de l'index du mot (hérité de Transcript)
    if (transcription?.words) {
      updateCurrentWordIndex(transcription.words, currentTime);
    }

    // Trouver le paragraphe actuel
    if (paragraphs.length > 0) {
      const paragraphIndex = paragraphs.findIndex(
        (p) => currentTime >= p.startTime && currentTime <= p.endTime
      );

      if (paragraphIndex >= 0 && paragraphIndex !== currentParagraphIndex) {
        setCurrentParagraphIndex(paragraphIndex);
      }
    }
  };

  const player = audioRef.current;
  if (audioSrc && player) {
    player.addEventListener("timeupdate", onTimeUpdate);
    return () => player.removeEventListener("timeupdate", onTimeUpdate);
  }
}, [
  audioSrc,
  transcription,
  updateCurrentWordIndex,
  paragraphs,
  currentParagraphIndex,
]);
```

#### Navigation par clic sur paragraphe

```typescript
const handleParagraphClick = (paragraph: SpeakerParagraph, index: number) => {
  if (isSpectatorMode) return; // Pas d'interaction en mode spectateur

  executeWithLock(async () => {
    // Mettre à jour le mot courant (premier mot du paragraphe)
    if (paragraph.words.length > 0) {
      updateCurrentWord(paragraph.words[0]);
    }

    if (isPlaying) {
      pause();
    } else {
      seekTo(paragraph.startTime);
      await new Promise((resolve) => setTimeout(resolve, 150));
      play();
    }
  });
};
```

### Sélection de texte avancée

#### Mapping paragraphe → mots absolus

La sélection de texte dans la vue paragraphes nécessite une **reconversion précise** vers les indices absolus des mots :

```typescript
const handleTextSelection = () => {
  if (!activeSelectionMode || !transcription?.words) return;

  const selection = window.getSelection();
  const selectedWordIndices: number[] = [];
  const range = selection.getRangeAt(0);

  paragraphRefs.current.forEach((paragraphRef, paragraphIndex) => {
    if (paragraphRef && range.intersectsNode(paragraphRef)) {
      const paragraph = paragraphs[paragraphIndex];

      // Vérification du type de locuteur
      const isClientParagraph = isSpeakerClient(paragraph.turn);
      const isConseillerParagraph = isSpeakerConseil(paragraph.turn);

      if (
        (activeSelectionMode === "client" && isClientParagraph) ||
        (activeSelectionMode === "conseiller" && isConseillerParagraph)
      ) {
        paragraph.words.forEach((word: Word, wordIndexInParagraph: number) => {
          // Méthode 1 : Utiliser startWordIndex si disponible
          if (paragraph.startWordIndex !== undefined) {
            const absoluteWordIndex =
              paragraph.startWordIndex + wordIndexInParagraph;
            if (absoluteWordIndex < transcription.words.length) {
              selectedWordIndices.push(absoluteWordIndex);
            }
          } else {
            // Méthode 2 : Recherche par critères multiples
            const wordIndex = transcription.words.findIndex(
              (w: Word, idx: number) =>
                w.startTime === word.startTime &&
                w.text === word.text &&
                w.turn === word.turn &&
                !selectedWordIndices.includes(idx)
            );
            if (wordIndex !== -1) {
              selectedWordIndices.push(wordIndex);
            }
          }
        });
      }
    }
  });

  // Création de la sélection finale
  if (selectedWordIndices.length > 0) {
    selectedWordIndices.sort((a, b) => a - b);
    const firstIdx = selectedWordIndices[0];
    const lastIdx = selectedWordIndices[selectedWordIndices.length - 1];

    const selectionData = {
      text: selection.toString().trim(),
      startTime: transcription.words[firstIdx].startTime,
      endTime:
        transcription.words[lastIdx].endTime ||
        transcription.words[lastIdx].startTime + 1,
      wordIndex: firstIdx,
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

### Système de coloration adaptive

#### Adaptation au mode sombre

```typescript
const theme = useTheme();
const isDarkMode = theme.palette.mode === "dark";

// Couleurs des locuteurs adaptées au thème
const clientColor = isDarkMode ? "#4BAFD8" : "#069ED0";
const conseillerColor = isDarkMode ? "#D9BE28" : "#A58D04";

// Arrière-plans alternatifs pour les locuteurs
const altBgColor = isDarkMode
  ? isConseiller
    ? "rgba(255, 204, 0, 0.15)"
    : "rgba(75, 175, 216, 0.15)"
  : isConseiller
    ? "rgba(204, 136, 0, 0.1)"
    : "rgba(0, 120, 179, 0.07)";
```

#### Highlighting conditionnel par mode

```typescript
const isCurrentParagraph = isSpectatorMode
  ? viewMode === "paragraph" && index === highlightedParagraphIndex // Mode spectateur
  : index === currentParagraphIndex; // Mode normal

const shouldHighlightSpeakers = isSpectatorMode
  ? highlightTurnOne // Synchronisé avec le coach
  : highlightSpeakers; // Contrôlé localement
```

## Rendu optimisé des paragraphes

### Structure d'affichage

```typescript
const renderParagraphs = () => {
  return paragraphs.map((paragraph, index) => {
    const speakerType = getSpeakerType(paragraph.turn);
    const isCurrentParagraph = /* logique de détection */;
    const isConseiller = speakerType === SpeakerType.CONSEILLER;

    return (
      <Box
        key={index}
        ref={(el: HTMLDivElement | null) => {
          paragraphRefs.current[index] = el;
        }}
        onClick={() => handleParagraphClick(paragraph, index)}
        sx={{
          display: "flex",
          borderBottom: `1px solid ${theme.palette.divider}`,
          py: 0.8,
          cursor: isSpectatorMode ? "default" : "pointer",
          backgroundColor: /* logique de coloration */,
          borderLeft: isCurrentParagraph ? `4px solid ${color}` : "4px solid transparent",
          transition: "all 0.3s ease",
        }}
      >
        {/* Timestamp */}
        <Box sx={{ minWidth: "55px", /* styles */ }}>
          {formatTime(paragraph.startTime)}
        </Box>

        {/* Indicateur locuteur */}
        <Box sx={{ width: "80px", /* styles */ }}>
          {isConseiller ? "Conseiller:" : "Client:"}
        </Box>

        {/* Texte du paragraphe */}
        <Box sx={{ flex: 1, /* styles complexes */ }}>
          {paragraph.text}
        </Box>
      </Box>
    );
  });
};
```

### Formatage du temps

```typescript
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};
```

## Modes d'utilisation

### Mode Normal (Lecture interactive)

```typescript
<TranscriptAlternative
  callId={selectedCall.callid}
  hideHeader={true}
  highlightSpeakers={true}
  transcriptSelectionMode={selectionMode}
/>
```

**Fonctionnalités actives :**

- Navigation par clic sur paragraphe
- Sélection de texte par locuteur
- Auto-scroll suivant la lecture
- Coloration des locuteurs

### Mode Spectateur (Synchronisation)

```typescript
<TranscriptAlternative
  callId={callId}
  isSpectatorMode={true}
  highlightedParagraphIndex={syncedParagraphIndex}
  highlightTurnOne={syncedHighlighting}
  transcription={sharedTranscription}
/>
```

**Comportement spécialisé :**

- Highlighting paragraphe synchronisé (bleu)
- Interactions désactivées (cursor: default)
- Sélection de texte bloquée (userSelect: none)
- Réception des états depuis le coach

### Mode Sélection (Annotation par locuteur)

```typescript
<TranscriptAlternative
  callId={callId}
  transcriptSelectionMode="conseiller"
  highlightSpeakers={false}
/>
```

**Interface adaptée :**

- Zones sélectionnables mise en évidence
- Curseur texte sur les paragraphes correspondants
- Conversion automatique paragraphe → mots absolus
- Transmission au contexte d'annotation

## Intégration AudioPlayer

### Configuration identique à Transcript

```typescript
<AudioPlayer
  markers={postitMarkers}
  onMarkerClick={handleMarkerClick}
/>
```

### Gestion des marqueurs post-its

```typescript
const handleMarkerClick = (id: number) => {
  executeWithLock(async () => {
    const postit = appelPostits.find((p) => p.id === id);
    if (postit) {
      seekTo(postit.timestamp);
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Simulation événement pour popover
      const event = {
        currentTarget: document.getElementById(`marker-${id}`) || null,
      };
      handlePostitClick(event as React.MouseEvent<HTMLElement>, postit);
    }
  });
};
```

## Performance et optimisations

### Auto-scroll intelligent

```typescript
// Suivi du paragraphe courant
useEffect(() => {
  if (
    currentParagraphIndex >= 0 &&
    paragraphRefs.current[currentParagraphIndex]
  ) {
    paragraphRefs.current[currentParagraphIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }
}, [currentParagraphIndex]);

// Mode spectateur : scroll synchronisé
useEffect(() => {
  if (isSpectatorMode && highlightedParagraphIndex !== undefined) {
    const targetRef = paragraphRefs.current[highlightedParagraphIndex];
    if (targetRef) {
      targetRef.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }
}, [isSpectatorMode, highlightedParagraphIndex]);
```

### Gestion mémoire

- **Références paragraphe** : Array optimisé pour navigation
- **Regroupement dynamique** : Recalcul uniquement si transcription change
- **Event listeners** : Nettoyage automatique sur démontage

## Comparaison avec Transcript.tsx

| Aspect          | TranscriptAlternative    | Transcript          |
| --------------- | ------------------------ | ------------------- |
| **Granularité** | Paragraphe par locuteur  | Mot individuel      |
| **Lisibilité**  | Excellente (naturelle)   | Technique (précise) |
| **Navigation**  | Tours de parole complets | Navigation fine     |
| **Sélection**   | Conversion complexe      | Sélection directe   |
| **Performance** | Moins de DOM elements    | Plus de références  |
| **Usage**       | Lecture, compréhension   | Annotation précise  |

## Cas d'usage recommandés

### ✅ Utiliser TranscriptAlternative quand :

- **Lecture de contenu** pour compréhension globale
- **Révision d'appels** pour analyse qualitative
- **Formation** avec vue d'ensemble des échanges
- **Présentation** à des non-techniciens
- **Appareils mobiles** (meilleure lisibilité)

### ❌ Préférer Transcript.tsx quand :

- **Annotation précise** mot par mot nécessaire
- **Synchronisation fine** avec audio requise
- **Sélection technique** pour analyse linguistique
- **Timing critique** pour évaluation temporelle

## Évolutions futures

### Améliorations prévues

- **Résumés automatiques** par paragraphe
- **Analyse sentiment** par tour de parole
- **Statistiques** de temps de parole par locuteur
- **Export structuré** par interventions
- **Recherche sémantique** dans les paragraphes

---

_Ce composant offre une approche complémentaire à la vue mot-par-mot, privilégiant l'expérience utilisateur et la lisibilité pour une analyse qualitative efficace des conversations téléphoniques._
