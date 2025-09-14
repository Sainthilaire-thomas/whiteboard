# Architecture NewTranscript - Conception modulaire

## 🎯 Vision d'ensemble

**NewTranscript** est conçu comme un **système universel de visualisation d'appels** permettant d'afficher, d'écouter et d'interagir avec différents types d'événements temporels dans une interface unifiée et extensible.

## 🏗️ Architecture en couches

```
┌─────────────────────────────────────────────────────────────┐
│                    NewTranscript (Orchestrateur)           │
├─────────────────────────────────────────────────────────────┤
│  AudioController     │  TranscriptViewer  │  EventsTimeline │
│  (Lecteur unifié)    │  (Affichage texte) │  (Timeline)     │
├─────────────────────────────────────────────────────────────┤
│             EventManager (Gestionnaire d'événements)       │
├─────────────────────────────────────────────────────────────┤
│  TagProvider │ PostitProvider │ AnnotationProvider │ ...   │
│  (Tags LPL)  │ (Post-its)     │ (Futures annot.)   │       │
└─────────────────────────────────────────────────────────────┘
```

## 🧩 Composants principaux

### 1. **NewTranscript** (Orchestrateur principal)

```typescript
interface NewTranscriptProps {
  callId: string;
  config: TranscriptConfig;
  mode?: "evaluation" | "tagging" | "analysis" | "spectator";
  enabledFeatures?: TranscriptFeature[];
}

interface TranscriptConfig {
  audioSrc: string;
  displayMode: "word-by-word" | "paragraphs" | "hybrid";
  timelineMode: "compact" | "detailed" | "minimal";
  eventTypes: EventTypeConfig[];
  interactions: InteractionConfig;
}
```

### 2. **EventManager** (Cœur du système)

```typescript
interface EventManager {
  // Gestion unifiée des événements temporels
  events: TemporalEvent[];
  registerEventProvider: (provider: EventProvider) => void;
  getEventsInRange: (startTime: number, endTime: number) => TemporalEvent[];
  getEventsAtTime: (time: number) => TemporalEvent[];
  subscribeToChanges: (callback: EventCallback) => void;
}

interface TemporalEvent {
  id: string;
  type: "tag" | "postit" | "annotation" | "custom";
  startTime: number;
  endTime?: number;
  data: any; // Données spécifiques au type
  metadata: EventMetadata;
}

interface EventMetadata {
  color?: string;
  priority: number;
  category?: string;
  speaker?: string;
  interactive: boolean;
}
```

### 3. **AudioController** (Lecteur unifié)

```typescript
interface AudioController {
  // API audio unifiée
  play: () => void;
  pause: () => void;
  seekTo: (time: number) => void;
  playSegment: (start: number, end: number) => void;

  // Intégration timeline
  markers: TimelineMarker[];
  onMarkerClick: (marker: TimelineMarker) => void;

  // États
  currentTime: number;
  duration: number;
  isPlaying: boolean;
}
```

### 4. **TranscriptViewer** (Affichage texte modulaire)

```typescript
interface TranscriptViewer {
  // Modes d'affichage
  displayMode: "word-by-word" | "paragraphs" | "hybrid";

  // Données
  transcription: Word[];
  events: TemporalEvent[];

  // Interactions
  onWordClick?: (word: Word) => void;
  onTextSelection?: (selection: TextSelection) => void;
  onEventClick?: (event: TemporalEvent) => void;

  // Personnalisation
  fontSize: number;
  highlighting: HighlightConfig;
}
```

### 5. **EventsTimeline** (Timeline universelle)

```typescript
interface EventsTimeline {
  // Configuration
  height: "compact" | "normal" | "expanded";
  layers: TimelineLayer[];

  // Événements
  events: TemporalEvent[];
  currentTime: number;

  // Interactions
  onEventClick: (event: TemporalEvent) => void;
  onTimelineClick: (time: number) => void;

  // Personnalisation
  colors: ColorScheme;
  grouping: GroupingConfig;
}
```

## 🔌 Système de Providers (Extensibilité)

### EventProvider Interface

```typescript
interface EventProvider {
  type: string;
  name: string;

  // Méthodes obligatoires
  fetchEvents: (callId: string) => Promise<TemporalEvent[]>;
  createEvent: (event: Partial<TemporalEvent>) => Promise<TemporalEvent>;
  updateEvent: (id: string, updates: Partial<TemporalEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;

  // Configuration
  getConfig: () => ProviderConfig;
  getTimelineConfig: () => TimelineLayerConfig;
}
```

### Providers implémentés

#### TagProvider (pour TranscriptLPL)

```typescript
class TagProvider implements EventProvider {
  type = "tag";
  name = "Tags LPL";

  async fetchEvents(callId: string): Promise<TemporalEvent[]> {
    const taggedTurns = await fetchTaggedTurns(callId);
    return taggedTurns.map((tag) => ({
      id: tag.id,
      type: "tag",
      startTime: tag.start_time,
      endTime: tag.end_time,
      data: {
        tag: tag.tag,
        verbatim: tag.verbatim,
        speaker: tag.speaker,
        nextTurnVerbatim: tag.next_turn_verbatim,
      },
      metadata: {
        color: tag.color,
        priority: 1,
        category: tag.tag,
        speaker: tag.speaker,
        interactive: true,
      },
    }));
  }

  getTimelineConfig(): TimelineLayerConfig {
    return {
      layer: "tags",
      height: 20,
      color: "dynamic", // Couleur basée sur l'événement
      shape: "rectangle",
      showLabel: true,
    };
  }
}
```

#### PostitProvider (pour Evaluation)

```typescript
class PostitProvider implements EventProvider {
  type = "postit";
  name = "Post-its Évaluation";

  async fetchEvents(callId: string): Promise<TemporalEvent[]> {
    const postits = await fetchPostits(callId);
    return postits.map((postit) => ({
      id: postit.id.toString(),
      type: "postit",
      startTime: postit.timestamp,
      data: {
        text: postit.text,
        sujet: postit.sujet,
        pratique: postit.pratique,
        word: postit.word,
      },
      metadata: {
        color: "#ff6b6b",
        priority: 2,
        category: postit.sujet,
        interactive: true,
      },
    }));
  }

  getTimelineConfig(): TimelineLayerConfig {
    return {
      layer: "postits",
      height: 15,
      color: "#ff6b6b",
      shape: "circle",
      showLabel: false,
    };
  }
}
```

## 📱 Structure des fichiers

```
NewTranscript/
├── index.tsx                    # Orchestrateur principal
├── types.ts                     # Types partagés
├── config.ts                    # Configuration par défaut
├──
├── core/                        # Cœur du système
│   ├── EventManager.tsx         # Gestionnaire d'événements
│   └── hooks/
│       ├── useEventManager.ts   # Hook principal
│       ├── useAudioSync.ts      # Synchronisation audio
│       └── useTimelineSync.ts   # Synchronisation timeline
├──
├── components/                  # Composants d'affichage
│   ├── AudioController/         # Lecteur audio
│   │   ├── index.tsx
│   │   ├── AudioPlayer.tsx
│   │   └── AudioControls.tsx
│   │
│   ├── TranscriptViewer/        # Affichage transcription
│   │   ├── index.tsx
│   │   ├── WordByWordView.tsx
│   │   ├── ParagraphView.tsx
│   │   └── HybridView.tsx
│   │
│   └── EventsTimeline/          # Timeline événements
│       ├── index.tsx
│       ├── TimelineLayer.tsx
│       ├── EventMarker.tsx
│       └── TimelineCursor.tsx
├──
├── providers/                   # Providers d'événements
│   ├── BaseProvider.ts          # Provider de base
│   ├── TagProvider.ts           # Tags LPL
│   ├── PostitProvider.ts        # Post-its évaluation
│   └── AnnotationProvider.ts    # Annotations futures
├──
└── utils/                       # Utilitaires
    ├── timeUtils.ts            # Gestion du temps
    ├── eventUtils.ts           # Utilitaires événements
    └── colorUtils.ts           # Gestion des couleurs
```

## 🎮 API d'utilisation

### Configuration basique

```typescript
// Mode évaluation avec post-its
<NewTranscript
  callId="123"
  config={{
    audioSrc: "/audio/call123.mp3",
    displayMode: 'paragraphs',
    timelineMode: 'detailed',
    eventTypes: [
      { type: 'postit', enabled: true, visible: true },
    ]
  }}
  mode="evaluation"
  enabledFeatures={['timeline', 'annotations', 'audio-sync']}
/>

// Mode tagging avec tags LPL
<NewTranscript
  callId="456"
  config={{
    audioSrc: "/audio/call456.mp3",
    displayMode: 'word-by-word',
    timelineMode: 'compact',
    eventTypes: [
      { type: 'tag', enabled: true, visible: true, editable: true }
    ]
  }}
  mode="tagging"
  enabledFeatures={['timeline', 'tagging', 'audio-sync']}
/>
```

### Configuration avancée

```typescript
// Mode hybride avec multiple types d'événements
<NewTranscript
  callId="789"
  config={{
    audioSrc: "/audio/call789.mp3",
    displayMode: 'hybrid',
    timelineMode: 'expanded',
    eventTypes: [
      {
        type: 'postit',
        enabled: true,
        visible: true,
        layer: 'primary',
        color: '#ff6b6b'
      },
      {
        type: 'tag',
        enabled: true,
        visible: true,
        layer: 'secondary',
        color: 'dynamic'
      },
      {
        type: 'annotation',
        enabled: true,
        visible: false,
        layer: 'tertiary'
      }
    ],
    interactions: {
      wordClick: true,
      textSelection: true,
      eventEditing: true,
      timelineNavigation: true
    }
  }}
  mode="analysis"
  enabledFeatures={['timeline', 'annotations', 'tagging', 'audio-sync', 'export']}
/>
```

## 🔄 Flux de données

```
1. NewTranscript reçoit callId + config
   ↓
2. EventManager initialise les providers configurés
   ↓
3. Chaque provider charge ses événements
   ↓
4. EventManager unifie et synchronise les événements
   ↓
5. AudioController configure les marqueurs
   ↓
6. TranscriptViewer affiche le texte + événements
   ↓
7. EventsTimeline affiche la timeline
   ↓
8. Synchronisation temps réel entre tous les composants
```

## 🎛️ Système de configuration

### TranscriptConfig

```typescript
interface TranscriptConfig {
  // Audio
  audioSrc: string;
  autoPlay?: boolean;

  // Affichage
  displayMode: "word-by-word" | "paragraphs" | "hybrid";
  fontSize: number;
  theme: "light" | "dark" | "auto";

  // Timeline
  timelineMode: "compact" | "detailed" | "minimal" | "hidden";
  timelinePosition: "top" | "bottom" | "integrated";

  // Événements
  eventTypes: EventTypeConfig[];

  // Interactions
  interactions: {
    wordClick: boolean;
    textSelection: boolean;
    eventEditing: boolean;
    timelineNavigation: boolean;
    keyboardShortcuts: boolean;
  };

  // Layout
  layout: {
    audioPlayerPosition: "top" | "bottom" | "floating";
    transcriptHeight: string;
    timelineHeight: number;
  };
}

interface EventTypeConfig {
  type: string;
  enabled: boolean;
  visible: boolean;
  editable?: boolean;
  layer?: string;
  color?: string;
  priority?: number;
}
```

## 🚀 Extensibilité future

### Nouveaux types d'événements

```typescript
// Exemple: Provider pour analyses IA
class AIAnalysisProvider implements EventProvider {
  type = "ai-analysis";
  name = "Analyses IA";

  async fetchEvents(callId: string): Promise<TemporalEvent[]> {
    const analyses = await fetchAIAnalyses(callId);
    return analyses.map((analysis) => ({
      id: analysis.id,
      type: "ai-analysis",
      startTime: analysis.startTime,
      endTime: analysis.endTime,
      data: {
        sentiment: analysis.sentiment,
        emotions: analysis.emotions,
        topics: analysis.topics,
        confidence: analysis.confidence,
      },
      metadata: {
        color: getSentimentColor(analysis.sentiment),
        priority: 3,
        category: "AI",
        interactive: true,
      },
    }));
  }
}
```

### Nouvelles vues

```typescript
// Exemple: Vue statistiques temps réel
class StatsView implements TranscriptView {
  render() {
    return (
      <div className="stats-view">
        <SentimentChart events={aiEvents} />
        <SpeakingTimeChart events={speakerEvents} />
        <TagFrequencyChart events={tagEvents} />
      </div>
    );
  }
}
```

## 🎯 Avantages de cette architecture

### ✅ **Flexibilité**

- Ajout facile de nouveaux types d'événements
- Configuration modulaire par mode d'usage
- Providers interchangeables

### ✅ **Réutilisabilité**

- Composants indépendants réutilisables
- API unifiée pour tous les types d'événements
- Configuration déclarative

### ✅ **Maintenabilité**

- Séparation claire des responsabilités
- Tests unitaires facilitées
- Code modulaire et documenté

### ✅ **Performance**

- Rendu conditionnel des composants
- Mémorisation des calculs coûteux
- Lazy loading des données

### ✅ **Extensibilité**

- Interface provider standardisée
- Hooks réutilisables
- Système de plugins futur

Cette architecture permet de **centraliser la visualisation d'appels** tout en gardant la **flexibilité** pour les futurs développements et l'**extensibilité** pour de nouveaux types d'analyses et d'événements temporels.
