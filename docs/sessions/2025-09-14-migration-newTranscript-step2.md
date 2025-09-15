# NewTranscript — État d’avancement & prochaines étapes (avec Contextes)

## 1) Où on en est (snapshot)

### ✅ Déjà fait

- **Architecture & layout** définis et documentés (4 zones principales + side panels).
- **Guide de migration** clair par phases (mapping ancien↔nouveau, plan par étapes).
- **Intégration côté app** : feature flag `useNewTranscript` dans `Evaluation.tsx`, bascule entre ancien et nouveau transcript.
- **Orchestrateur `NewTranscript`** : configuration dynamique, zones branchées, mock data pour transcription/events/audio.
- **Core `EventManager`** : CRUD événements, hook `useEventManager`, subscription aux updates. (TODO factory providers).
- **Zones UI** :
  - **HeaderZone** : infos appel, lecture/volume (mock audio), contrôles vue (display, font, thème, fullscreen), actions export/partage.
  - **TimelineZone** : couches d’événements, curseur, clic navigation, hover events. (Mock events).
  - **TranscriptZone** : affichage mot-par-mot / paragraphes / hybride, overlays events, auto-scroll. (Mock transcription).

### 🟡 En cours / Partiellement branché

- **Providers** : interface prête (`EventManager`), mais pas encore branchés aux contextes réels (`CallDataContext`, `TaggingDataContext`).
- **Audio** : `HeaderZone` et `NewTranscript` utilisent des mocks au lieu de `AudioContext`.
- **Transcription** : `TranscriptZone` n’est pas encore alimenté par `CallDataContext.transcription`.

### ⛏️ À faire (haut niveau)

1. **Brancher providers réels** (post-its, tags LPL, etc.) depuis les contextes (`CallDataContext`, `TaggingDataContext`).
2. **Brancher l’audio réel** avec `AudioContext` dans `HeaderZone` + propagation `currentTime/duration`.
3. **Brancher la transcription réelle** (`CallDataContext.transcription`) dans `TranscriptZone`.
4. **Factory de providers** pour `EventManager` (création auto depuis `config.eventTypes`).
5. **ControlsZone** : intégrer une version minimale (export/partage) basée sur `AppContext`.

---

## 2) Rôle des contextes dans NewTranscript

- **AppContext**

  → Fournit la sélection d’entreprise/domaine, l’état global UI (drawer, toggles), nudges.

  → Utilisation prévue dans **ControlsZone** (UI globale, export/partage, navigation activité).

- **AudioContext**

  → Source unique pour `audioSrc`, `isPlaying`, `currentTime`, `duration`, `volume`, `seekTo`, `playSegment`.

  → À brancher dans **HeaderZone** (contrôles audio) et propagé à **TimelineZone** + **TranscriptZone** .

- **CallDataContext**

  → Hub des données d’appel :

  - `selectedCall` → HeaderZone (infos appel).
  - `appelPostits` + `postitToSujetMap`/`postitToPratiqueMap` → providers d’événements (Timeline & Transcript).
  - `transcription` → TranscriptZone.
  - `selectedPostit`, `transcriptSelectionMode`, `zoneTexts` → intégrations futures (annotation, coaching).

- **TaggingDataContext**

  → Spécialisé pour le tagging LPL :

  - `taggedTurns` → provider `tags` pour TimelineZone et overlays TranscriptZone.
  - `taggingTranscription` → (optionnel) pour modes d’annotation spécifiques.

---

## 3) Prochaine étape (focus exécutable)

### 🎯 Objectif (1 incrément)

**Remplacer les mocks par les données réelles via contextes.**

- **HeaderZone** : consommer `useAudio()` + `useCallData.selectedCall`.
- **TimelineZone** : consommer `useEventManager(events)` alimenté par providers (post-its depuis `CallDataContext`, tags depuis `TaggingDataContext`).
- **TranscriptZone** : consommer `useCallData.transcription` (words) + `useAudio.currentTime` (sync).

### 🔧 Tâches concrètes

1. **Créer une `providers/factory.ts`** pour transformer `config.eventTypes` → providers (`PostitProvider`, `TaggingProvider`).
2. **Implémenter `PostitProvider`** basé sur `useCallData.appelPostits`.
3. **Implémenter `TaggingProvider`** basé sur `useTaggingData.taggedTurns`.
4. **Brancher `useAudio` dans HeaderZone** : remplacer le mock par `play`, `pause`, `seekTo`, `setVolume`, `isPlaying`, `currentTime`, `duration`.
5. **Passer `currentTime/duration` réels** depuis `useAudio` dans NewTranscript → TimelineZone + TranscriptZone.
6. **Remplacer mock transcription** par `useCallData.transcription`.
7. **Clic sur event/word** = `seekTo(timestamp)` via `AudioContext`.

---

## 4) Mini-checklist (copier/coller en TODO)

- [ ] Factory providers (`providers/factory.ts`) + enregistrement auto dans `useEventManager`.
- [ ] `PostitProvider` (events depuis `appelPostits`).
- [ ] `TaggingProvider` (events depuis `taggedTurns`).
- [ ] Brancher `useAudio` dans **HeaderZone** .
- [ ] Propager `currentTime/duration` réels dans NewTranscript.
- [ ] Brancher `transcription` réelle (CallDataContext) dans TranscriptZone.
- [ ] Vérifier clics : word/event → `seekTo`.

---

## 5) Résultat attendu après cette étape

- **Audio** contrôlé réellement depuis `HeaderZone`.
- **Timeline** affiche les post-its & tags réels (avec couleurs/hover/clic).
- **Transcript** affiche la transcription réelle et surligne le mot courant.
- **Feature flag** peut rester actif pour comparaison avec l’ancien transcript.
