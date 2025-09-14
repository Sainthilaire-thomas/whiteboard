# Guide de Migration vers NewTranscript

<!--
AI_READING_CONTEXT:
Ce document décrit la migration de l'architecture transcript actuelle (EvaluationTranscript + Transcript + TranscriptAlternative)
vers la nouvelle architecture modulaire NewTranscript. Il s'appuie sur les documents architecture.md et layout.md pour définir
les étapes de transformation et les adaptations nécessaires.

MIGRATION_TYPE: Remplacement architectural avec compatibilité rétroactive
TARGET_COMPONENTS: EvaluationTranscript, Transcript, TranscriptAlternative, AudioPlayer, TimeLineAudio
NEW_ARCHITECTURE: Système modulaire basé sur zones et providers d'événements
COMPLEXITY_LEVEL: Major refactoring avec phases progressives
-->

## 🎯 Vue d'ensemble de la migration

### **Objectif** : Remplacer l'architecture actuelle par un système modulaire unifié

### **Stratégie** : Migration progressive avec compatibilité rétroactive

### **Impact** : Simplification du code, extensibilité native, performance améliorée

## 📊 État actuel vs État cible

### **AVANT** - Architecture fragmentée

```
Evaluation.tsx
└── EvaluationTranscript.tsx (Orchestrateur complexe)
    ├── Transcript.tsx (Vue mot-par-mot + logique)
    ├── TranscriptAlternative.tsx (Vue paragraphes + logique)
    ├── AudioPlayer.tsx (Lecteur + timeline)
    └── TimeLineAudio.tsx (Timeline spécialisée)
```

### **APRÈS** - Architecture modulaire

```
Evaluation.tsx
└── NewTranscript.tsx (Orchestrateur unifié)
    ├── HeaderZone.tsx (Info + contrôles audio)
    ├── TimelineZone.tsx (Timeline universelle)
    ├── TranscriptZone.tsx (Affichage unifié)
    └── ControlsZone.tsx (Outils + actions)
```

## 🗂️ Mapping des composants

<!-- AI_CONTEXT: Cette section mappe les composants existants vers la nouvelle architecture -->

### **Composants remplacés**

| Composant actuel            | Devient                             | Localisation            | Responsabilité        |
| --------------------------- | ----------------------------------- | ----------------------- | --------------------- |
| `EvaluationTranscript.tsx`  | `NewTranscript/index.tsx`           | Orchestrateur principal | Coordination générale |
| `Transcript.tsx`            | `TranscriptZone/WordByWordView.tsx` | Zone transcript         | Vue mot-par-mot       |
| `TranscriptAlternative.tsx` | `TranscriptZone/ParagraphView.tsx`  | Zone transcript         | Vue paragraphes       |
| `AudioPlayer.tsx`           | `HeaderZone/AudioControls.tsx`      | Zone header             | Contrôles audio       |
| `TimeLineAudio.tsx`         | `TimelineZone/index.tsx`            | Zone timeline           | Timeline événements   |

### **Fonctionnalités redistribuées**

```typescript
// AVANT : Dispersé dans multiple composants
interface OldArchitecture {
  EvaluationTranscript: {
    orchestration: boolean;
    stateManagement: boolean;
    layoutManagement: boolean;
  };
  Transcript: {
    wordByWordDisplay: boolean;
    audioSync: boolean;
    postItInteractions: boolean;
    textSelection: boolean;
  };
  TranscriptAlternative: {
    paragraphDisplay: boolean;
    speakerIdentification: boolean;
    turnBasedInteractions: boolean;
  };
}

// APRÈS : Organisé par zones fonctionnelles
interface NewArchitecture {
  NewTranscript: {
    orchestration: boolean;
    configurationManagement: boolean;
  };
  HeaderZone: {
    callInfo: boolean;
    audioControls: boolean;
    viewControls: boolean;
  };
  TimelineZone: {
    eventDisplay: boolean;
    temporalNavigation: boolean;
    multiLayerSupport: boolean;
  };
  TranscriptZone: {
    wordByWordDisplay: boolean;
    paragraphDisplay: boolean;
    hybridDisplay: boolean;
    eventOverlay: boolean;
  };
}
```

## 📋 Plan de migration en 4 phases

<!-- AI_CONTEXT: Plan détaillé de migration progressive pour minimiser les risques -->

### **Phase 1 : Préparation et structure** (1-2 semaines)

#### **1.1 Création de la structure NewTranscript**

```bash
# Créer l'arborescence
mkdir -p app/evaluation/components/NewTranscript/{core,components,providers,utils}
mkdir -p app/evaluation/components/NewTranscript/components/{HeaderZone,TimelineZone,TranscriptZone,ControlsZone}

# Fichiers de base
touch app/evaluation/components/NewTranscript/{index.tsx,types.ts,config.ts}
```

#### **1.2 Types et interfaces unifiés**

```typescript
// app/evaluation/components/NewTranscript/types.ts
export interface NewTranscriptProps {
  callId: string;
  config: TranscriptConfig;

  // Props de compatibilité (temporaires)
  hideHeader?: boolean;
  highlightTurnOne?: boolean;
  transcriptSelectionMode?: string;
  isSpectatorMode?: boolean;
  highlightedWordIndex?: number;
  viewMode?: "word" | "paragraph";
}

export interface TranscriptConfig {
  mode: "evaluation" | "tagging" | "analysis" | "spectator";
  audioSrc: string;
  displayMode: "word-by-word" | "paragraphs" | "hybrid";
  timelineMode: "compact" | "detailed" | "minimal";
  eventTypes: EventTypeConfig[];
  interactions: InteractionConfig;
  layout: LayoutConfig;
}

// Migration des types existants
export type LegacyTranscriptMode = "word-by-word" | "paragraphs";
export type LegacyPostit = import("../Postit/types").PostitType;
export type LegacyTimelineMarker =
  import("../TimeLineAudio/types").TimelineMarker;
```

#### **1.3 EventManager foundation**

```typescript
// app/evaluation/components/NewTranscript/core/EventManager.tsx
export class EventManager {
  private providers: Map<string, EventProvider> = new Map();
  private events: TemporalEvent[] = [];

  constructor(private callId: string) {}

  registerProvider(provider: EventProvider): void {
    this.providers.set(provider.type, provider);
  }

  async loadEvents(): Promise<TemporalEvent[]> {
    const eventPromises = Array.from(this.providers.values()).map((provider) =>
      provider.fetchEvents(this.callId)
    );

    const eventArrays = await Promise.all(eventPromises);
    this.events = eventArrays.flat().sort((a, b) => a.startTime - b.startTime);

    return this.events;
  }
}
```

### **Phase 2 : Migration des providers** (1 semaine)

#### **2.1 PostitProvider (compatible avec CallDataContext)**

```typescript
// app/evaluation/components/NewTranscript/providers/PostitProvider.ts
export class PostitProvider implements EventProvider {
  type = "postit";
  name = "Post-its Évaluation";

  constructor(
    private useCallData: () => CallDataContextType,
    private useAudio: () => AudioContextType
  ) {}

  async fetchEvents(callId: string): Promise<TemporalEvent[]> {
    const { appelPostits } = this.useCallData();

    return appelPostits.map((postit) => ({
      id: postit.id.toString(),
      type: "postit",
      startTime: postit.timestamp,
      data: {
        text: postit.text,
        sujet: postit.sujet,
        pratique: postit.pratique,
        word: postit.word,
        wordid: postit.wordid,
      },
      metadata: {
        color: this.getPostitColor(postit.sujet),
        priority: 2,
        category: postit.sujet,
        speaker: this.getSpeakerFromTimestamp(postit.timestamp),
        interactive: true,
      },
    }));
  }

  private getPostitColor(sujet: string): string {
    // Logique de couleur basée sur le sujet (reprendre de l'existant)
    const colorMap: Record<string, string> = {
      Accueil: "#ff6b6b",
      Identification: "#4ecdc4",
      Traitement: "#45b7d1",
      Conclusion: "#96ceb4",
    };
    return colorMap[sujet] || "#ff6b6b";
  }
}
```

#### **2.2 TagProvider (pour TranscriptLPL)**

```typescript
// app/evaluation/components/NewTranscript/providers/TagProvider.ts
export class TagProvider implements EventProvider {
  type = "tag";
  name = "Tags LPL";

  constructor(private useTaggingData: () => TaggingDataContextType) {}

  async fetchEvents(callId: string): Promise<TemporalEvent[]> {
    const { taggedTurns } = this.useTaggingData();

    return taggedTurns.map((tag) => ({
      id: tag.id,
      type: "tag",
      startTime: tag.start_time,
      endTime: tag.end_time,
      data: {
        tag: tag.tag,
        verbatim: tag.verbatim,
        nextTurnVerbatim: tag.next_turn_verbatim,
        speaker: tag.speaker,
      },
      metadata: {
        color: tag.color || "#2563eb",
        priority: 1,
        category: tag.tag,
        speaker: tag.speaker,
        interactive: true,
      },
    }));
  }
}
```

### **Phase 3 : Implémentation des zones** (2-3 semaines)

#### **3.1 HeaderZone - Migration d'AudioPlayer**

```typescript
// app/evaluation/components/NewTranscript/components/HeaderZone/index.tsx
interface HeaderZoneProps {
  callId: string;
  config: TranscriptConfig;
  audioSrc: string;
  onConfigChange: (config: Partial<TranscriptConfig>) => void;
}

export const HeaderZone: React.FC<HeaderZoneProps> = ({
  callId,
  config,
  audioSrc,
  onConfigChange
}) => {
  const { selectedCall } = useCallData();
  const { isPlaying, currentTime, duration, play, pause } = useAudio();

  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: '1fr 2fr 1fr 1fr',
      gap: 2,
      padding: 2,
      borderBottom: '1px solid',
      borderColor: 'divider'
    }}>
      {/* Call Info */}
      <CallInfo
        filename={selectedCall?.filename}
        callId={callId}
        duration={formatTime(duration)}
      />

      {/* Audio Controls - Migration des contrôles AudioPlayer */}
      <AudioControls
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        onPlay={play}
        onPause={pause}
        audioSrc={audioSrc}
      />

      {/* View Controls */}
      <ViewControls
        displayMode={config.displayMode}
        fontSize={config.fontSize}
        theme={config.theme}
        onDisplayModeChange={(mode) => onConfigChange({ displayMode: mode })}
        onFontSizeChange={(size) => onConfigChange({ fontSize: size })}
      />

      {/* Actions */}
      <Actions
        onExport={() => {/* logique export */}}
        onSettings={() => {/* logique settings */}}
      />
    </Box>
  );
};
```

#### **3.2 TimelineZone - Migration de TimeLineAudio**

```typescript
// app/evaluation/components/NewTranscript/components/TimelineZone/index.tsx
interface TimelineZoneProps {
  events: TemporalEvent[];
  currentTime: number;
  duration: number;
  config: TimelineConfig;
  onEventClick: (event: TemporalEvent) => void;
  onTimelineClick: (time: number) => void;
}

export const TimelineZone: React.FC<TimelineZoneProps> = ({
  events,
  currentTime,
  duration,
  config,
  onEventClick,
  onTimelineClick
}) => {
  const { executeWithLock, seekTo } = useAudio();

  // Grouper les événements par couches
  const eventLayers = useMemo(() => {
    return groupEventsByLayer(events, config.eventTypes);
  }, [events, config.eventTypes]);

  const handleTimelineClick = useCallback((time: number) => {
    executeWithLock(async () => {
      seekTo(time);
      onTimelineClick(time);
    });
  }, [executeWithLock, seekTo, onTimelineClick]);

  return (
    <Box sx={{
      height: getTimelineHeight(config.timelineMode),
      borderBottom: '1px solid',
      borderColor: 'divider',
      position: 'relative'
    }}>
      {/* Timeline Base - reprendre logique Slider de TimeLineAudio */}
      <TimelineSlider
        currentTime={currentTime}
        duration={duration}
        onTimeClick={handleTimelineClick}
      />

      {/* Event Layers */}
      {eventLayers.map(layer => (
        <TimelineLayer
          key={layer.id}
          layer={layer}
          events={layer.events}
          duration={duration}
          onEventClick={onEventClick}
        />
      ))}

      {/* Cursor */}
      <TimelineCursor
        position={(currentTime / duration) * 100}
        visible={true}
      />
    </Box>
  );
};
```

#### **3.3 TranscriptZone - Unification Transcript + TranscriptAlternative**

```typescript
// app/evaluation/components/NewTranscript/components/TranscriptZone/index.tsx
interface TranscriptZoneProps {
  transcription: Word[];
  events: TemporalEvent[];
  config: TranscriptConfig;
  currentWordIndex: number;
  onWordClick: (word: Word) => void;
  onTextSelection: (selection: TextSelection) => void;
  onEventClick: (event: TemporalEvent) => void;
}

export const TranscriptZone: React.FC<TranscriptZoneProps> = ({
  transcription,
  events,
  config,
  currentWordIndex,
  onWordClick,
  onTextSelection,
  onEventClick
}) => {
  // Renderer switcher basé sur le mode
  const renderTranscript = () => {
    switch (config.displayMode) {
      case 'word-by-word':
        return (
          <WordByWordView
            transcription={transcription}
            events={events}
            currentWordIndex={currentWordIndex}
            fontSize={config.fontSize}
            onWordClick={onWordClick}
            onTextSelection={onTextSelection}
            onEventClick={onEventClick}
          />
        );

      case 'paragraphs':
        return (
          <ParagraphView
            transcription={transcription}
            events={events}
            fontSize={config.fontSize}
            onWordClick={onWordClick}
            onTextSelection={onTextSelection}
            onEventClick={onEventClick}
          />
        );

      case 'hybrid':
        return (
          <HybridView
            transcription={transcription}
            events={events}
            currentWordIndex={currentWordIndex}
            fontSize={config.fontSize}
            onWordClick={onWordClick}
            onTextSelection={onTextSelection}
            onEventClick={onEventClick}
          />
        );

      default:
        return <WordByWordView {...props} />;
    }
  };

  return (
    <Paper sx={{
      flex: 1,
      overflow: 'auto',
      maxHeight: 'calc(100vh - 300px)',
      padding: 1
    }}>
      {renderTranscript()}
    </Paper>
  );
};
```

### **Phase 4 : Migration finale et optimisation** (1 semaine)

#### **4.1 NewTranscript orchestrateur principal**

```typescript
// app/evaluation/components/NewTranscript/index.tsx
interface NewTranscriptProps {
  callId: string;
  config?: Partial<TranscriptConfig>;

  // Props de compatibilité (à supprimer progressivement)
  hideHeader?: boolean;
  highlightTurnOne?: boolean;
  transcriptSelectionMode?: string;
  isSpectatorMode?: boolean;
}

export const NewTranscript: React.FC<NewTranscriptProps> = ({
  callId,
  config: userConfig,
  // Props de compatibilité
  hideHeader,
  highlightTurnOne,
  transcriptSelectionMode,
  isSpectatorMode,
  ...legacyProps
}) => {
  // Merge configuration avec valeurs par défaut
  const config = useMemo(() => ({
    ...defaultTranscriptConfig,
    ...userConfig,
    // Adaptation des props legacy
    interactions: {
      ...defaultTranscriptConfig.interactions,
      highlightTurns: highlightTurnOne,
      selectionMode: transcriptSelectionMode,
      spectatorMode: isSpectatorMode
    }
  }), [userConfig, highlightTurnOne, transcriptSelectionMode, isSpectatorMode]);

  // Event Manager avec providers
  const { eventManager, events, loading } = useEventManager(callId, config);

  // Audio sync
  const { currentTime, duration } = useAudio();
  const currentWordIndex = useCurrentWordIndex(transcription, currentTime);

  // Handlers unifiés
  const handleEventClick = useCallback((event: TemporalEvent) => {
    switch (event.type) {
      case 'postit':
        handlePostitClick(event);
        break;
      case 'tag':
        handleTagClick(event);
        break;
    }
  }, []);

  const handleConfigChange = useCallback((newConfig: Partial<TranscriptConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  if (loading) {
    return <TranscriptSkeleton />;
  }

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%'
    }}>
      {/* Header Zone */}
      {!hideHeader && (
        <HeaderZone
          callId={callId}
          config={config}
          audioSrc={audioSrc}
          onConfigChange={handleConfigChange}
        />
      )}

      {/* Timeline Zone */}
      {config.timelineMode !== 'hidden' && (
        <TimelineZone
          events={events}
          currentTime={currentTime}
          duration={duration}
          config={config}
          onEventClick={handleEventClick}
          onTimelineClick={handleTimelineClick}
        />
      )}

      {/* Transcript Zone */}
      <TranscriptZone
        transcription={transcription}
        events={events}
        config={config}
        currentWordIndex={currentWordIndex}
        onWordClick={handleWordClick}
        onTextSelection={handleTextSelection}
        onEventClick={handleEventClick}
      />

      {/* Controls Zone */}
      {config.layout.showControls && (
        <ControlsZone
          config={config}
          events={events}
          onConfigChange={handleConfigChange}
        />
      )}
    </Box>
  );
};
```

#### **4.2 Migration dans Evaluation.tsx**

```typescript
// app/evaluation/Evaluation.tsx
// AVANT
// import EvaluationTranscript from './components/EvaluationTranscript';

// APRÈS
import NewTranscript from './components/NewTranscript';

export default function Evaluation() {
  // ... logique existante

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Panneau gauche - Transcript */}
      <Box sx={{
        width: leftPanelWidth,
        borderRight: '1px solid',
        borderColor: 'divider'
      }}>
        <NewTranscript
          callId={selectedCall?.callid}
          config={{
            mode: 'evaluation',
            displayMode: transcriptMode, // 'paragraphs' ou 'word-by-word'
            timelineMode: 'detailed',
            eventTypes: [
              {
                type: 'postit',
                enabled: true,
                visible: true,
                editable: true,
                layer: 'primary'
              }
            ],
            interactions: {
              wordClick: true,
              textSelection: !!transcriptSelectionMode,
              eventEditing: true,
              timelineNavigation: true
            },
            layout: {
              showControls: false, // Contrôlé par Evaluation
              audioPlayerPosition: 'integrated'
            }
          }}
          // Props de compatibilité temporaires
          hideHeader={false}
          transcriptSelectionMode={transcriptSelectionMode}
          isSpectatorMode={isSpectatorMode}
          highlightedWordIndex={highlightedWordIndex}
        />
      </Box>

      {/* Panneau droit - Context Views */}
      <Box sx={{ flex: 1 }}>
        {currentView === 'postit' && <PostitView />}
        {currentView === 'coaching' && <CoachingView />}
        {/* ... autres vues */}
      </Box>
    </Box>
  );
}
```

## 🔧 Adaptations de contextes

<!-- AI_CONTEXT: Les contextes existants nécessitent des adaptations pour l'intégration -->

### **CallDataContext - Adaptations pour EventManager**

```typescript
// Ajout d'une méthode pour récupérer les événements
export const useCallData = (): CallDataContextType => {
  const context = useContext(CallDataContext);

  // Nouvelle méthode pour NewTranscript
  const getTemporalEvents = useCallback((): TemporalEvent[] => {
    return appelPostits.map((postit) => ({
      id: postit.id.toString(),
      type: "postit",
      startTime: postit.timestamp,
      data: postit,
      metadata: {
        color: getPostitColor(postit.sujet),
        priority: 2,
        category: postit.sujet,
        interactive: true,
      },
    }));
  }, [appelPostits]);

  return {
    ...context,
    getTemporalEvents, // Nouvelle méthode
  };
};
```

### **AudioContext - Compatibilité avec EventManager**

```typescript
// app/context/AudioContext.tsx
// Ajout de méthodes pour EventManager
export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  // ... implémentation existante

  // Nouvelle méthode pour la synchronisation avec events
  const getMarkersFromEvents = useCallback((events: TemporalEvent[]): TimelineMarker[] => {
    return events.map(event => ({
      id: event.id,
      time: event.startTime,
      label: event.data.text || event.data.tag || 'Event',
      color: event.metadata.color
    }));
  }, []);

  const contextValue: AudioContextType = {
    // ... valeurs existantes
    getMarkersFromEvents // Nouvelle méthode
  };

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
      <audio ref={audioRef} />
    </AudioContext.Provider>
  );
};
```

## ✅ Checklist de migration

<!-- AI_CONTEXT: Liste de vérification pour s'assurer que la migration est complète -->

### **Phase 1 - Structure**

- [ ] ✅ Création de l'arborescence NewTranscript
- [ ] ✅ Types et interfaces unifiés
- [ ] ✅ EventManager foundation
- [ ] ✅ Configuration par défaut
- [ ] ✅ Tests unitaires des types

### **Phase 2 - Providers**

- [ ] ✅ PostitProvider implémenté et testé
- [ ] ✅ TagProvider implémenté (si nécessaire)
- [ ] ✅ Intégration avec contextes existants
- [ ] ✅ Tests d'intégration providers

### **Phase 3 - Zones UI**

- [ ] ✅ HeaderZone avec migration AudioPlayer
- [ ] ✅ TimelineZone avec migration TimeLineAudio
- [ ] ✅ TranscriptZone avec unification views
- [ ] ✅ ControlsZone basique
- [ ] ✅ Tests composants individuels

### **Phase 4 - Intégration**

- [ ] ✅ NewTranscript orchestrateur complet
- [ ] ✅ Migration dans Evaluation.tsx
- [ ] ✅ Suppression anciens composants
- [ ] ✅ Tests d'intégration complets
- [ ] ✅ Performance optimisée

### **Validation finale**

- [ ] ✅ Toutes les fonctionnalités existantes préservées
- [ ] ✅ Performance égale ou meilleure
- [ ] ✅ Tests E2E passent
- [ ] ✅ Documentation mise à jour
- [ ] ✅ Formation équipe

## 🚨 Risques et mitigation

### **Risques identifiés**

1. **Régression fonctionnelle** : Perte de fonctionnalités existantes
2. **Performance dégradée** : Rendu plus lent
3. **Complexité temporaire** : Code mixte pendant migration
4. **Tests fragiles** : Modifications importantes des composants

### **Stratégies de mitigation**

1. **Tests de régression** : Suite complète avant/après
2. **Feature flags** : Activation progressive NewTranscript
3. **Rollback plan** : Possibilité de retour arrière rapide
4. **Migration progressive** : Une zone à la fois
5. **Monitoring** : Métriques performance en temps réel

## 📈 Bénéfices attendus

### **Court terme**

- ✅ Code plus maintenable et lisible
- ✅ Moins de duplication entre Transcript/TranscriptAlternative
- ✅ Tests plus simples et robustes

### **Moyen terme**

- ✅ Extensibilité native pour nouveaux événements
- ✅ Performance améliorée (moins de re-renders)
- ✅ UX cohérente entre tous les modes

### **Long terme**

- ✅ Base solide pour futures fonctionnalités
- ✅ Réutilisabilité dans autres parties app
- ✅ Maintenance facilitée (architecture claire)

Cette migration transforme une architecture complexe en système modulaire moderne, prêt pour les évolutions futures tout en préservant toutes les fonctionnalités existantes.
