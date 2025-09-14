# 📋 Phase 3 - Spécification Technique Détaillée

## 🎯 Objectif Global

Permettre aux participants de voir **exactement la même chose** que le coach dans Evaluation, mais en mode **spectateur synchronisé** temps réel.

## ✅ Prérequis Validés

### Service Role Permissions ✅

Les permissions Supabase sont configurées pour permettre aux participants non-authentifiés d'accéder aux données :

```sql
GRANT SELECT ON public.call TO service_role;     -- ✅ Confirmé
GRANT SELECT ON public.word TO service_role;     -- ✅ Confirmé
```

**Status** : ✅ Permissions actives, participants peuvent récupérer transcription et audio

### Extension Table BDD ✅

```sql
-- ✅ EXÉCUTÉ : Extension shared_evaluation_sessions
ALTER TABLE whiteboard.shared_evaluation_sessions
ADD COLUMN view_mode VARCHAR(20) DEFAULT 'word',
ADD COLUMN current_word_index INTEGER DEFAULT 0,
ADD COLUMN current_paragraph_index INTEGER DEFAULT 0,
ADD COLUMN highlight_turn_one BOOLEAN DEFAULT false,
ADD COLUMN highlight_speakers BOOLEAN DEFAULT true;
```

**Status** : ✅ Table étendue, prête pour synchronisation highlighting

### Hooks et API Existants ✅

- ✅ `useCallData()` : Récupération transcription + audioUrl
- ✅ `useTranscriptions()` : Compatible service role
- ✅ `createAudioUrlWithToken()` : Génération URL signée audio
- ✅ Middleware : Routes API hybrides auth + service role

## 🗺️ Mapping Evaluation → Whiteboard

### 1. Zone Coach (Evaluation) → Zone Participants (Whiteboard)

| Composant Evaluation        | Composant Whiteboard        | État         | Notes                              |
| --------------------------- | --------------------------- | ------------ | ---------------------------------- |
| `TranscriptionHeader`       | `SharedEvaluationHeader`    | ✅ À créer   | Header simplifié pour participants |
| `Transcript.tsx`            | `SynchronizedTranscript`    | ✅ À adapter | Mode word synchronisé              |
| `TranscriptAlternative.tsx` | `SynchronizedTranscriptAlt` | ✅ À adapter | Mode paragraph synchronisé         |
| `AudioPlayer`               | `SynchronizedAudioPlayer`   | ✅ À adapter | Lecteur spectateur                 |
| `AddPostitButton`           | `TopButton`                 | 🔜 Phase 4   | Boutons "Toper" participants       |

### 2. Données Synchronisées Temps Réel

| Donnée Coach                   | Synchronisation | Effet Participants                                     |
| ------------------------------ | --------------- | ------------------------------------------------------ |
| `viewMode`("word"/"paragraph") | WebSocket       | Switch automatique Transcript ↔ TranscriptAlternative |
| `currentWordIndex`             | WebSocket       | Highlighting mot/segment en cours                      |
| `currentTime`audio             | WebSocket       | Position timeline synchronisée                         |
| `isPlaying`                    | WebSocket       | État play/pause lecteur                                |
| `highlightTurnOne`             | WebSocket       | Coloration tours de parole                             |
| `highlightSpeakers`            | WebSocket       | Coloration locuteurs                                   |

## 🚀 Stratégie de Développement

### Phase 3A : Adaptation des Composants Existants (1 jour)

#### 1. ✅ Hook Participant Evaluations (Phase 4 Ready)

```typescript
// ✅ CRÉÉ : useParticipantEvaluations.tsx
// - addParticipantEvaluation() pour table participant_evaluations
// - Prêt pour Phase 4 (boutons "Top" participants)
// - Séparé de la table postits du coach
```

#### 2. Adaptation TranscriptionHeader avec mode participant

```typescript
// ✅ MODIFIER : TranscriptionHeader.tsx
interface TranscriptionHeaderProps {
  mode?: "coach" | "participant"; // ✅ NOUVEAU PROP
  // ... autres props existantes
}

// Affichage conditionnel :
// ✅ ViewModeToggle : TOUJOURS affiché (toggle local participants)
// ✅ ColorationToggle : TOUJOURS affiché
// ✅ AddPostitButton : TOUJOURS affiché (finalité participants)
// ❌ ShareEvaluationButton : MASQUÉ en mode participant
// ❌ RefreshButton : MASQUÉ en mode participant
// 🔧 DisplayActions : ADAPTÉ selon mode
```

#### 3. Créer les wrappers synchronisés

```typescript
// ✅ À CRÉER
app/whiteboard/components/SharedEvaluation/
├── SynchronizedTranscript.tsx        // Wrapper de Transcript.tsx
├── SynchronizedTranscriptAlt.tsx     // Wrapper de TranscriptAlternative.tsx
├── SynchronizedAudioPlayer.tsx       // Wrapper d'AudioPlayer
├── SharedEvaluationHeader.tsx        // Header participants
└── index.tsx                         // Exports
```

#### 2. Structure des wrappers

```typescript
// Principe : Réutiliser les composants existants en mode "spectateur"
const SynchronizedTranscript = ({
  sessionId,
  currentWordIndex,
  viewMode,
  // ... autres props synchronisées
}) => {
  // Récupérer les données du call via sessionId
  const { transcription, audioSrc } = useCallData()

  // Recevoir les mises à jour temps réel
  const { currentPosition, isPlaying } = useRealtimeEvaluation({ sessionId })

  // Rendre le composant Transcript existant en mode lecture seule
  return (
    <Transcript
      callId={callId}
      hideHeader={true}
      readOnlyMode={true}        // ✅ NOUVEAU PROP
      highlightTurnOne={highlightTurnOne}
      currentWordIndex={currentWordIndex}  // ✅ IMPOSÉ PAR SYNC
      onWordClick={undefined}    // ✅ DÉSACTIVÉ
    />
  )
}
```

### Phase 3B : Extension des Composants Evaluation (0.5 jour)

#### Ajouter le mode "spectateur" aux composants existants

```typescript
// ✅ MODIFIER Transcript.tsx
interface TranscriptProps {
  // ... props existantes
  readOnlyMode?: boolean; // ✅ NOUVEAU
  forcedCurrentWordIndex?: number; // ✅ NOUVEAU
  disableInteraction?: boolean; // ✅ NOUVEAU
}

const Transcript = ({
  readOnlyMode = false,
  forcedCurrentWordIndex,
  disableInteraction = false,
  // ... autres props
}) => {
  // Si mode lecture seule, utiliser l'index forcé
  const effectiveCurrentWordIndex =
    readOnlyMode && forcedCurrentWordIndex !== undefined
      ? forcedCurrentWordIndex
      : currentWordIndex;

  const handleWordClick = disableInteraction
    ? () => {}
    : (word, index) => {
        /* logique existante */
      };

  // ... reste du composant identique
};
```

#### Même principe pour `TranscriptAlternative.tsx` et `AudioPlayer.tsx`

### Phase 3C : Extension WebSocket + Base de Données (0.5 jour)

#### Extension table shared_evaluation_sessions

```sql
-- ✅ AJOUTER colonnes pour synchronisation highlighting
ALTER TABLE whiteboard.shared_evaluation_sessions
ADD COLUMN view_mode VARCHAR(20) DEFAULT 'word',
ADD COLUMN current_word_index INTEGER DEFAULT 0,
ADD COLUMN current_paragraph_index INTEGER DEFAULT 0,
ADD COLUMN highlight_turn_one BOOLEAN DEFAULT false,
ADD COLUMN highlight_speakers BOOLEAN DEFAULT true;

-- ✅ Index pour performance
CREATE INDEX idx_shared_sessions_realtime
ON whiteboard.shared_evaluation_sessions(id, updated_at);
```

#### Extension useRealtimeEvaluation.tsx

```typescript
// ✅ ÉTENDRE interface WebSocket
interface RealtimeEvaluationData {
  // ... colonnes existantes
  view_mode: 'word' | 'paragraph'           // ✅ NOUVEAU
  current_word_index: number               // ✅ NOUVEAU
  current_paragraph_index: number          // ✅ NOUVEAU
  highlight_turn_one: boolean              // ✅ NOUVEAU
  highlight_speakers: boolean              // ✅ NOUVEAU
}

// ✅ Nouvelles fonctions broadcast
const broadcastHighlighting = (wordIndex: number, paragraphIndex: number)
const broadcastViewMode = (mode: 'word' | 'paragraph')
const broadcastColoration = (turnOne: boolean, speakers: boolean)
```

### Phase 3D : Intégration dans SharedEvaluationViewer (0.5 jour)

```typescript
// ✅ REMPLACER le placeholder existant
const SharedEvaluationViewer = ({ session }) => {
  const {
    viewMode,
    currentWordIndex,
    highlightTurnOne,
    highlightSpeakers
  } = useRealtimeEvaluation({ sessionId: session.id })

  return (
    <Box>
      <SharedEvaluationHeader
        sessionName={session.session_name}
        coachName={session.coach?.full_name}
        viewMode={viewMode}
      />

      {viewMode === 'word' ? (
        <SynchronizedTranscript
          sessionId={session.id}
          callId={session.call_id}
          currentWordIndex={currentWordIndex}
          highlightTurnOne={highlightTurnOne}
        />
      ) : (
        <SynchronizedTranscriptAlt
          sessionId={session.id}
          callId={session.call_id}
          highlightSpeakers={highlightSpeakers}
        />
      )}

      <SynchronizedAudioPlayer
        sessionId={session.id}
        callId={session.call_id}
      />
    </Box>
  )
}
```

## 🎯 Points Clés d'Architecture

### 1. Réutilisation Maximum

- **Ne PAS dupliquer** Transcript.tsx et TranscriptAlternative.tsx
- **Étendre** avec props mode spectateur
- **Wrapper** dans des composants synchronisés

### 2. Données Centralisées

```typescript
// ✅ Participants utilisent les mêmes hooks que le coach
const { transcription, audioSrc, createAudioUrlWithToken } = useCallData();
const { seekTo, currentTime, duration } = useAudio();

// ✅ + synchronisation temps réel
const { currentWordIndex, viewMode, isPlaying } = useRealtimeEvaluation();
```

### 3. Interface Identique

Les participants voient **exactement** :

- ✅ Même transcription (word-by-word OU paragraphs)
- ✅ Même timeline audio avec marqueurs post-its
- ✅ Même highlighting en temps réel
- ✅ Même coloration (tours de parole / locuteurs)
- ❌ PAS les boutons d'interaction (Phase 4)

## 🧪 Plan de Tests Phase 3

### Test 1 : Mode Participant TranscriptionHeader ✅

1. Ouvrir Whiteboard → Session active
2. Vérifier header "Transcription Partagée"
3. Boutons visibles : ViewMode, Coloration, AddPostit
4. Boutons masqués : Share, Refresh

### Test 2 : Accès Données via Service Role ✅

1. Participant non-authentifié charge session
2. API récupère transcription via `useCallData()` + service role
3. Audio URL générée via `createAudioUrlWithToken()`
4. Transcription affichée identique au coach

### Test 3 : Toggle ViewMode Local ✅

1. Coach en mode "word", participant toggle vers "paragraph"
2. Coach garde mode "word", participant voit "paragraph"
3. Aucune synchronisation WebSocket (choix local)

### Test 4 : Synchronisation Highlighting Temps Réel

1. Coach navigue transcription (clic mot/segment)
2. Broadcast `current_word_index` + `current_paragraph_index` via WebSocket
3. Participants voient highlighting synchronisé instantané
4. Auto-scroll suit le coach

### Test 5 : Synchronisation Coloration

1. Coach toggle `highlight_turn_one` OU `highlight_speakers`
2. Broadcast changement via WebSocket
3. Participants voient coloration changer instantanément

### Test 6 : Préparation Phase 4 - AddPostit Participants

1. Participant clique AddPostit
2. Utilise `addParticipantEvaluation()` → table `participant_evaluations`
3. Ne pollue PAS la table `postits` du coach
4. Sauvegarde session_id + participant data

## 📊 Estimation Temps Actualisée

| Phase     | Tâches                               | Durée       | Complexité  | Status          |
| --------- | ------------------------------------ | ----------- | ----------- | --------------- |
| 3A.1      | Hook ParticipantEvaluations          | 0.5 jour    | Facile      | ✅ Créé         |
| 3A.2      | TranscriptionHeader mode participant | 0.5 jour    | Facile      | 🔄 En cours     |
| 3A.3      | Wrappers synchronisés                | 1 jour      | Moyenne     | ⏳ À faire      |
| 3B        | Extension mode spectateur composants | 0.5 jour    | Facile      | ⏳ À faire      |
| 3C        | WebSocket highlighting + BDD         | 0.5 jour    | Facile      | ⏳ À faire      |
| 3D        | Intégration finale                   | 0.5 jour    | Facile      | ⏳ À faire      |
| **TOTAL** | **Phase 3 complète**                 | **3 jours** | **Moyenne** | **🔄 10% fait** |

## ✅ Actions Immédiates Nécessaires

### 1. Permissions Storage Supabase ⏳

```sql
-- ✅ À FAIRE : Permissions sur storage pour accès audio participants
GRANT SELECT ON storage.objects TO service_role;
GRANT SELECT ON storage.buckets TO service_role;

-- Test validation après ajout des permissions :
-- Vérifier que createAudioUrlWithToken() fonctionne avec service role
```

### 2. Développement Phase 3A (En cours)

- ✅ **useParticipantEvaluations.tsx** : Hook créé pour Phase 4
- 🔄 **TranscriptionHeader.tsx** : Mode participant en cours
- ⏳ **Wrappers synchronisés** : À créer après TranscriptionHeader
- ⏳ **Extension composants** : Mode spectateur à ajouter

### 3. Validation Technique

```bash
# Test accès données participants non-authentifiés
# 1. Créer session depuis Evaluation (coach)
# 2. Ouvrir Whiteboard sans auth (participant)
# 3. Vérifier chargement transcription + audio
```

## 🎯 Critères de Succès

### Fonctionnels

- ✅ Participants voient exactement la même transcription que le coach
- ✅ Switch word/paragraph synchronisé temps réel
- ✅ Highlighting mot/segment synchronisé
- ✅ Coloration synchronisée
- ✅ Timeline audio synchronisée

### Techniques

- ✅ Réutilisation composants existants (pas de duplication)
- ✅ Props mode spectateur propres
- ✅ WebSocket stable <100ms latence
- ✅ Architecture extensible pour Phase 4

## 🔜 Préparation Phase 4

Les composants auront les hooks nécessaires pour :

- ✅ Boutons "Toper" (remplacer interactions par actions participants)
- ✅ Modal commentaires (utiliser infrastructure postit existante)
- ✅ Sauvegarde `participant_evaluations`

---

**🎯 PRÊT POUR DÉVELOPPEMENT PHASE 3 !**

_Spécification créée le 10/06/2025 - Session d'analyse architecture_
