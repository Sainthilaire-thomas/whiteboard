# AudioPlayer - Documentation

## Vue d'ensemble

Le composant `AudioPlayer` est un lecteur audio React complet avec une timeline intégrée, des contrôles de lecture et une gestion des marqueurs. Il utilise Material-UI pour l'interface utilisateur et s'appuie sur un contexte audio pour la gestion de l'état global.

## Fonctionnalités principales

- **Lecture/Pause** : Contrôles de base pour démarrer et arrêter la lecture
- **Timeline interactive** : Visualisation du progrès avec possibilité de navigation
- **Contrôles de volume** : Ajustement du volume avec boutons et slider
- **Marqueurs temporels** : Support des marqueurs cliquables sur la timeline
- **Mode compact** : Interface réduite pour les espaces limités
- **Formatage du temps** : Affichage au format mm:ss

## Props

### AudioPlayerProps

| Prop            | Type                   | Défaut      | Description                                      |
| --------------- | ---------------------- | ----------- | ------------------------------------------------ |
| `compact`       | `boolean`              | `false`     | Active le mode compact avec interface réduite    |
| `showVolume`    | `boolean`              | `true`      | Affiche/masque les contrôles de volume           |
| `markers`       | `TimelineMarker[]`     | `[]`        | Tableau des marqueurs à afficher sur la timeline |
| `onMarkerClick` | `(id: number) => void` | `undefined` | Callback exécuté lors du clic sur un marqueur    |

### TimelineMarker

```typescript
interface TimelineMarker {
  id: number;
  time: number; // Temps en secondes
  // Autres propriétés définies dans TimeLineAudio
}
```

## Dépendances

### Contexte AudioContext

Le composant utilise le hook `useAudio()` qui fournit :

- `isPlaying: boolean` - État de lecture
- `play: () => void` - Démarre la lecture
- `pause: () => void` - Met en pause
- `seekTo: (time: number) => void` - Navigation temporelle
- `setVolume: (volume: number) => void` - Contrôle du volume
- `currentTime: number` - Temps actuel en secondes
- `duration: number` - Durée totale en secondes
- `audioSrc: string` - Source audio

### Composants Material-UI

- `Box`, `Typography`, `IconButton`, `Paper`
- Icônes : `PlayArrowIcon`, `PauseIcon`, `VolumeUpIcon`, `VolumeDownIcon`, `VolumeMuteIcon`

### Composants internes

- `TimeLineAudio` : Composant de timeline avec support des marqueurs

## Utilisation

### Usage basique

```tsx
import AudioPlayer from "./AudioPlayer";

function MyComponent() {
  return <AudioPlayer />;
}
```

### Avec marqueurs

```tsx
const markers = [
  { id: 1, time: 30 },
  { id: 2, time: 90 },
  { id: 3, time: 150 },
];

function MyComponent() {
  const handleMarkerClick = (id: number) => {
    console.log(`Marqueur ${id} cliqué`);
  };

  return <AudioPlayer markers={markers} onMarkerClick={handleMarkerClick} />;
}
```

### Mode compact sans volume

```tsx
function CompactPlayer() {
  return <AudioPlayer compact={true} showVolume={false} />;
}
```

## Fonctions internes

### formatTime(timeInSeconds: number): string

Convertit un temps en secondes au format mm:ss.

```typescript
formatTime(125); // "2:05"
formatTime(65); // "1:05"
formatTime(5); // "0:05"
```

### Gestion du volume

- **toggleMute()** : Bascule entre muet et volume précédent
- **getVolumeIcon()** : Retourne l'icône appropriée selon le niveau
- **handleVolumeChange()** : Met à jour le volume via le slider

### Gestion des marqueurs

- **handleMarkerClick(id: number)** :
  - Si `onMarkerClick` est fourni, l'exécute
  - Sinon, navigue automatiquement vers le temps du marqueur

## États internes

- `volumeLevel: number` - Niveau de volume actuel (0-1)
- `prevVolume: number` - Volume précédent (pour fonction mute)

## Styles et responsive

### Mode normal

- `Paper` avec `elevation={1}`
- `padding: 2`
- `margin: 1`
- Boutons de taille `medium`

### Mode compact

- `Paper` avec `elevation={0}`
- `padding: 1`
- `borderRadius: 0`
- Boutons de taille `small`
- Texte en `caption`

## Gestion des erreurs

- **Aucune source audio** : Affiche un message ou ne rend rien en mode compact
- **Temps invalides** : `formatTime` gère les valeurs NaN en retournant "0:00"
- **Marqueurs inexistants** : Vérification avant navigation

## Accessibilité

- **Labels ARIA** sur les boutons (Play/Pause, Volume)
- **Contrôles clavier** via les éléments HTML natifs
- **Contraste** respecté via Material-UI

## Performance

- **Optimisations React** : Utilisation de `React.useState` pour l'état local
- **Délégation des événements** : Timeline gérée par composant dédié
- **Rendu conditionnel** : Affichage conditionnel des contrôles

## Exemples d'intégration

### Dans une interface d'évaluation

```tsx
function EvaluationTranscript() {
  const [postIts, setPostIts] = useState([]);

  const markers = postIts.map((postIt) => ({
    id: postIt.id,
    time: postIt.timestamp,
  }));

  return (
    <div>
      <AudioPlayer
        markers={markers}
        onMarkerClick={(id) => {
          // Mettre en évidence le post-it correspondant
          highlightPostIt(id);
        }}
      />
      {/* Autres composants */}
    </div>
  );
}
```

### Lecteur personnalisé

```tsx
function CustomAudioPlayer() {
  return (
    <AudioPlayer
      compact={window.innerWidth < 768}
      showVolume={!isMobile}
      markers={timelineAnnotations}
    />
  );
}
```

## Notes techniques et architecture

### Séparation des responsabilités

**AudioPlayer** se concentre sur :

- Contrôles de lecture (play/pause/volume)
- Formatage et affichage du temps
- Interface utilisateur du lecteur
- Gestion des modes d'affichage (normal/compact)

**TimeLineAudio** se concentre sur :

- Affichage de la timeline interactive
- Positionnement et rendu des marqueurs
- Gestion des interactions avec les post-its
- Navigation temporelle et synchronisation

### Flux de données

```
CallDataContext (appelPostits)
    ↓
AudioPlayer (transformation en markers)
    ↓
TimeLineAudio (affichage et interactions)
    ↓
handleMarkerClick (sélection post-it + navigation)
    ↓
Router (redirection vers vue post-it)
```

### Points d'attention

1. **Migration de contexte** : Le code montre une migration de `setSelectedPostit` depuis `AppContext` vers `CallDataContext`
2. **Protection des opérations audio** : Utilisation systématique d'`executeWithLock`
3. **Gestion des identifiants** : Les marqueurs utilisent les mêmes IDs que les post-its
4. **Délais de stabilisation** : Timeout de 150ms après les opérations de seek
5. **Structure des données** : Les post-its incluent maintenant le champ `idpratique`

### Évolutivité

Le système est conçu pour :

- **Ajout de nouveaux types de marqueurs** (différentes couleurs, formes)
- **Extension des données de post-its** (nouveaux champs métier)
- **Intégration de nouvelles vues** (graphiques, analyses)
- **Personnalisation de l'interface** (thèmes, layouts)

La séparation claire entre `AudioPlayer` et `TimeLineAudio` permet de modifier l'un sans impact sur l'autre, facilitant la maintenance et les évolutions futures.
