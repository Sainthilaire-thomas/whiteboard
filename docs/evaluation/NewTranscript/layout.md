# NewTranscript - Zones d'écran et Layout

## 🖥️ Layout principal - Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────────┐
│                        📄 HEADER ZONE                              │
│  📊 Call Info    🎵 Audio Controls    ⚙️ View Controls    📋 Actions │
├─────────────────────────────────────────────────────────────────────┤
│                     🎼 TIMELINE ZONE                               │
│  ├─ Postits Layer  ■■□■□■■□─────────────────────────□■■─────────    │
│  ├─ Tags Layer     ●──●●──●────────●●──────●────────────●──────     │
│  └─ Cursor         ────────────────▲────────────────────────────     │
├─────────────────────────────────────────────────────────────────────┤
│                    📝 TRANSCRIPT ZONE                              │
│  [09:42] Client:     Bonjour, j'appelle car j'ai un [TAG:prob]     │
│                      problème avec mon compte qui                   │
│  [10:15] Conseiller: Bonjour Monsieur, je vais [POSTIT] examiner   │
│                      votre dossier...                               │
├─────────────────────────────────────────────────────────────────────┤
│                      🎛️ CONTROLS ZONE                              │
│  🔍 Zoom  📱 Mode  🎨 Theme  📤 Export  🔧 Settings                 │
└─────────────────────────────────────────────────────────────────────┘
```

## 🎯 Zone 1: HEADER ZONE (Zone d'en-tête)

### **Position** : Haut de l'écran, fixe

### **Hauteur** : 60-80px

### **Contenu** :

```typescript
interface HeaderZone {
  // Informations appel
  callInfo: {
    filename: string;
    duration: string;
    callId: string;
    status?: string;
  };

  // Contrôles audio principaux
  audioControls: {
    playPause: boolean;
    currentTime: string;
    totalTime: string;
    volume: number;
  };

  // Contrôles de vue
  viewControls: {
    displayMode: "word-by-word" | "paragraphs" | "hybrid";
    fontSize: number;
    theme: "light" | "dark";
    fullscreen: boolean;
  };

  // Actions globales
  actions: {
    export: () => void;
    share: () => void;
    settings: () => void;
  };
}
```

### **Layout responsive** :

```css
/* Desktop */
.header-zone {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr 1fr;
  gap: 16px;
  padding: 12px 24px;
}

/* Mobile */
@media (max-width: 768px) {
  .header-zone {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
  }
}
```

---

## 🎼 Zone 2: TIMELINE ZONE (Zone timeline)

### **Position** : Sous le header, fixe ou scrollable

### **Hauteur** : Variable (60-200px selon configuration)

### **Contenu** :

```typescript
interface TimelineZone {
  // Configuration des couches
  layers: TimelineLayer[];

  // Curseur temporel
  cursor: {
    position: number; // Position en %
    time: number; // Temps en secondes
    visible: boolean;
  };

  // Zoom et navigation
  viewport: {
    startTime: number;
    endTime: number;
    totalDuration: number;
    zoomLevel: number;
  };

  // Interactions
  interactions: {
    onEventClick: (event: TemporalEvent) => void;
    onTimelineClick: (time: number) => void;
    onEventHover: (event: TemporalEvent) => void;
  };
}

interface TimelineLayer {
  id: string;
  name: string;
  events: TemporalEvent[];
  height: number;
  color: string;
  visible: boolean;
  interactive: boolean;
}
```

### **Configurations de hauteur** :

- **Compact** : 60px (1-2 couches)
- **Normal** : 100px (2-4 couches)
- **Expanded** : 150-200px (4+ couches + détails)
- **Minimal** : 30px (juste curseur)

---

## 📝 Zone 3: TRANSCRIPT ZONE (Zone principale)

### **Position** : Centre, scrollable

### **Hauteur** : Reste de l'écran (flexible)

### **Contenu** :

```typescript
interface TranscriptZone {
  // Données transcription
  transcription: Word[];
  events: TemporalEvent[];

  // Mode d'affichage
  displayMode: "word-by-word" | "paragraphs" | "hybrid";

  // Interactions
  interactions: {
    wordClick: boolean;
    textSelection: boolean;
    eventClick: boolean;
  };

  // Personnalisation
  styling: {
    fontSize: number;
    lineHeight: number;
    speakerColors: Record<string, string>;
    highlighting: HighlightConfig;
  };
}
```

### **Sous-zones dans Transcript** :

#### **3a. Speakers Column** (Colonne locuteurs)

```
┌─────────────┬─────────────────────────────────┐
│ [09:42]     │ Bonjour, j'appelle car j'ai un  │
│ Client:     │ problème avec...                │
├─────────────┼─────────────────────────────────┤
│ [10:15]     │ Bonjour Monsieur, je vais      │
│ Conseiller: │ examiner votre dossier...       │
└─────────────┴─────────────────────────────────┘
```

- **Largeur** : 120-150px
- **Contenu** : Timestamp + Nom locuteur
- **Fixe** ou scrollant avec le texte

#### **3b. Text Content** (Contenu textuel)

- **Largeur** : Reste de l'espace
- **Contenu** : Mots/paragraphes avec événements intégrés
- **Scrollable** verticalement

#### **3c. Events Overlay** (Superposition événements)

- **Position** : Absolue sur le texte
- **Contenu** : Tags visuels, post-its, annotations
- **Interactions** : Clic, hover, édition

---

## 🎛️ Zone 4: CONTROLS ZONE (Zone contrôles)

### **Position** : Bas de l'écran, fixe ou flottante

### **Hauteur** : 40-60px

### **Contenu** :

```typescript
interface ControlsZone {
  // Navigation
  navigation: {
    previousEvent: () => void;
    nextEvent: () => void;
    goToTime: (time: number) => void;
  };

  // Outils
  tools: {
    zoom: number;
    search: string;
    filter: EventFilter[];
  };

  // Mode/Vue
  viewMode: {
    currentMode: TranscriptMode;
    availableModes: TranscriptMode[];
    toggleMode: (mode: TranscriptMode) => void;
  };

  // Export/Actions
  actions: {
    export: ExportOptions[];
    share: ShareOptions[];
    settings: SettingsPanel;
  };
}
```

---

## 📱 Layouts adaptatifs

### **Desktop** (>1200px)

```
┌─────────────────────────────────────────────────────────────┐
│                    HEADER (80px)                           │
├─────────────────────────────────────────────────────────────┤
│                   TIMELINE (120px)                        │
├─────────────────────────────────────────────────────────────┤
│                                                            │
│                TRANSCRIPT (flexible)                      │
│                                                            │
├─────────────────────────────────────────────────────────────┤
│                   CONTROLS (50px)                         │
└─────────────────────────────────────────────────────────────┘
```

### **Tablet** (768px-1200px)

```
┌─────────────────────────────────────────────────────────────┐
│                    HEADER (70px)                           │
├─────────────────────────────────────────────────────────────┤
│                 TIMELINE (100px)                          │
├─────────────────────────────────────────────────────────────┤
│                                                            │
│                TRANSCRIPT (flexible)                      │
│                                                            │
├─────────────────────────────────────────────────────────────┤
│                   CONTROLS (45px)                         │
└─────────────────────────────────────────────────────────────┘
```

### **Mobile** (<768px)

```
┌───────────────────────────────────┐
│           HEADER (60px)           │
├───────────────────────────────────┤
│         TIMELINE (80px)           │
├───────────────────────────────────┤
│                                   │
│                                   │
│       TRANSCRIPT (flexible)       │
│                                   │
│                                   │
├───────────────────────────────────┤
│         CONTROLS (40px)           │
└───────────────────────────────────┘
```

---

## 🎨 Zones spécialisées (optionnelles)

### **Side Panel** (Panneau latéral)

```
┌─────────────────────┬─────────────────────────────────┐
│                     │        SIDE PANEL               │
│                     │  ┌─────────────────────────────┐ │
│      MAIN ZONES     │  │     Event Details           │ │
│                     │  │  ┌─────────────────────────┐ │ │
│                     │  │  │ Tag: "Problème"         │ │ │
│                     │  │  │ Time: 09:42-09:45       │ │ │
│                     │  │  │ Speaker: Client         │ │ │
│                     │  │  └─────────────────────────┘ │ │
│                     │  │                             │ │
│                     │  │     Actions                 │ │
│                     │  │  [Edit] [Delete] [Export]   │ │
│                     │  └─────────────────────────────┘ │
└─────────────────────┴─────────────────────────────────┘
```

- **Largeur** : 300-400px
- **Position** : Droite (ou gauche)
- **Contenu** : Détails événement, outils, statistiques

### **Floating Panels** (Panneaux flottants)

#### **Audio Player Floating**

```
                               ┌─────────────────┐
                               │  ♪ Audio Player │
                               │  ▶️ [====●====] │
                               │  02:45 / 15:30  │
                               │  🔊 [====●===]  │
                               └─────────────────┘
```

#### **Quick Actions**

```
              ┌─────────────┐
              │ Quick Tools │
              │  🏷️ Tag      │
              │  📝 Note     │
              │  📊 Stats    │
              │  💾 Save     │
              └─────────────┘
```

---

## 🎯 Configurations par mode d'usage

### **Mode Évaluation**

- **Timeline** : Postits + Audio markers
- **Transcript** : Paragraphes avec post-its intégrés
- **Side Panel** : Détails post-it + grille d'évaluation

### **Mode Tagging**

- **Timeline** : Tags LPL colorés
- **Transcript** : Mot-par-mot avec tags visuels
- **Side Panel** : TagSelector + statistiques tags

### **Mode Analyse**

- **Timeline** : Multi-couches (tags + postits + analyses)
- **Transcript** : Vue hybride
- **Controls** : Outils avancés (filtres, export, statistiques)

### **Mode Spectateur**

- **Timeline** : Lecture seule avec curseur synchronisé
- **Transcript** : Surlignage automatique
- **Controls** : Minimalistes (pas d'édition)

---

## 🔧 Composants techniques par zone

### **Zone Components Mapping**

```typescript
interface ZoneComponents {
  header: HeaderComponent;
  timeline: TimelineComponent;
  transcript: TranscriptComponent;
  controls: ControlsComponent;
  sidePanel?: SidePanelComponent;
  floatingPanels?: FloatingPanelComponent[];
}

// Implémentation
<NewTranscript>
  <HeaderZone {...headerConfig} />
  <TimelineZone {...timelineConfig} />
  <TranscriptZone {...transcriptConfig} />
  <ControlsZone {...controlsConfig} />
  {sidePanelEnabled && <SidePanel {...sidePanelConfig} />}
</NewTranscript>
```

Cette organisation en **4 zones principales** + **zones optionnelles** offre :

- **Flexibilité** : Chaque zone configurable indépendamment
- **Responsivité** : Adaptation automatique aux écrans
- **Extensibilité** : Ajout facile de nouvelles zones
- **Cohérence** : Layout unifié entre tous les modes
- **Performance** : Rendu optimisé par zone
