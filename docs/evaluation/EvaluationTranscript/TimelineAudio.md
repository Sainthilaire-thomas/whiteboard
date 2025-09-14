# TimeLineAudio - Documentation

## Vue d'ensemble

Le composant `TimeLineAudio` est une timeline audio interactive qui affiche des marqueurs de post-its et gère la navigation temporelle. Il s'intègre dans un écosystème d'évaluation d'appels avec gestion automatique des post-its et navigation entre les vues.

## Fonctionnalités principales

- **Timeline interactive** : Slider Material-UI pour navigation temporelle
- **Marqueurs visuels** : Cercles rouges positionnés selon le temps
- **Tooltips informatifs** : Affichage du label au survol des marqueurs
- **Gestion automatique des post-its** : Ouverture et sélection automatique
- **Protection des opérations audio** : Utilisation d'`executeWithLock`
- **Navigation automatique** : Redirection vers la vue post-it
- **Synchronisation multi-contextes** : Intégration CallData, Audio et Navigation

## Interface et Props

### TimeLineAudioProps

| Prop            | Type                     | Obligatoire | Description                                     |
| --------------- | ------------------------ | ----------- | ----------------------------------------------- |
| `duration`      | `number`                 | ✅          | Durée totale de l'audio en secondes             |
| `currentTime`   | `number`                 | ✅          | Temps actuel de lecture en secondes             |
| `markers`       | `TimelineMarker[]`       | ✅          | Tableau des marqueurs à afficher                |
| `onSeek`        | `(time: number) => void` | ✅          | Callback pour la navigation temporelle          |
| `onMarkerClick` | `(id: number) => void`   | ❌          | Callback optionnel pour les clics sur marqueurs |

### TimelineMarker

```typescript
interface TimelineMarker {
  id: number; // Identifiant unique du marqueur (correspond à l'ID du post-it)
  time: number; // Temps en secondes où placer le marqueur
  label: string; // Texte affiché dans le tooltip au survol
}
```

## Dépendances et Contextes

### Contextes utilisés

- **CallDataContext** :
  - `appelPostits` : Liste des post-its de l'appel
  - `setSelectedPostit` : Fonction pour sélectionner un post-it
- **AudioContext** :
  - `executeWithLock` : Protection des opérations audio concurrentes
- **Next.js Router** : Navigation entre les vues de l'application

### Imports Material-UI

```typescript
import { Box, Slider, Tooltip } from "@mui/material";
```

## Architecture et logique métier

### Flux d'interaction avec un marqueur

```typescript
const handleMarkerClick = (event, marker) => {
  // 1. Prévention de la propagation
  event.stopPropagation();

  // 2. Protection avec executeWithLock
  executeWithLock(async () => {
    // 3. Recherche du post-it correspondant
    const matchingPostit = appelPostits.find((p) => p.id === marker.id);
    if (!matchingPostit) {
      console.warn("⚠️ Aucun post-it trouvé pour cet ID:", marker.id);
      return;
    }

    // 4. Sélection du post-it avec toutes ses données
    setSelectedPostit({
      id: matchingPostit.id,
      timestamp: matchingPostit.timestamp,
      word: matchingPostit.word,
      wordid: matchingPostit.wordid,
      text: matchingPostit.text || "",
      sujet: matchingPostit.sujet,
      idsujet: matchingPostit.idsujet,
      iddomaine: matchingPostit.iddomaine,
      pratique: matchingPostit.pratique,
      idpratique: matchingPostit.idpratique,
      callid: matchingPostit.callid,
    });

    // 5. Navigation audio vers le marqueur
    onSeek(marker.time);

    // 6. Délai de stabilisation (150ms)
    await new Promise((resolve) => setTimeout(resolve, 150));

    // 7. Callback externe si fourni
    if (onMarkerClick) {
      onMarkerClick(marker.id);
    }

    // 8. Navigation vers la vue post-it
    router.push("/evaluation?view=postit");
  });
};
```

### Structure des données de post-it

```typescript
interface PostitData {
  id: number; // Identifiant unique
  timestamp: number; // Temps dans l'audio (secondes)
  word: string; // Mot/phrase associé
  wordid: number; // ID du mot
  text: string; // Texte du post-it
  sujet: string; // Sujet principal
  idsujet: number; // ID du sujet
  iddomaine: number; // ID du domaine
  pratique: string; // Pratique associée
  idpratique: number; // ID de la pratique
  callid: number; // ID de l'appel
}
```

## Rendu et styles

### Structure du composant

```jsx
<Box sx={{ width: "100%", position: "relative", padding: "10px 0" }}>
  {/* Timeline slider */}
  <Slider
    value={currentTime}
    min={0}
    max={duration || 100}
    onChange={(_, newValue) => onSeek(newValue)}
    aria-labelledby="audio-timeline"
    sx={{ color: "primary.main" }}
  />

  {/* Marqueurs positionnés absolument */}
  {markers.map((marker) => (
    <Tooltip key={marker.id} title={marker.label} placement="top">
      <Box
        sx={{
          position: "absolute",
          left: `${(marker.time / (duration || 1)) * 100}%`,
          /* styles du marqueur */
        }}
        onClick={(e) => handleMarkerClick(e, marker)}
      />
    </Tooltip>
  ))}
</Box>
```

### Styles des marqueurs

```css
.timeline-marker {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: red;
  border: 2px solid white;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  z-index: 2;
  transform: translateX(-50%); /* Centrage sur la position */
}

.timeline-marker:hover {
  transform: translateX(-50%) scale(1.2);
  transition: transform 0.2s;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.5);
}
```

### Calcul de position

```typescript
// Position en pourcentage basée sur le temps
const position = (marker.time / (duration || 1)) * 100;

// Exemples :
// - Marqueur à 30s sur durée 100s → 30%
// - Marqueur à 90s sur durée 180s → 50%
// - Protection division par zéro avec (duration || 1)
```

## Utilisation

### Usage basique

```tsx
import TimeLineAudio from "./TimeLineAudio";

function MyTimeline() {
  const markers = [
    { id: 1, time: 30, label: "Point important" },
    { id: 2, time: 90, label: "Question client" },
    { id: 3, time: 150, label: "Résolution" },
  ];

  const handleSeek = (time: number) => {
    console.log(`Navigation vers ${time}s`);
  };

  return (
    <TimeLineAudio
      duration={300}
      currentTime={45}
      markers={markers}
      onSeek={handleSeek}
    />
  );
}
```

### Intégration avec contextes

```tsx
import { useCallData } from "@/context/CallDataContext";
import { useAudio } from "@/context/AudioContext";

function IntegratedTimeline() {
  const { appelPostits } = useCallData();
  const { currentTime, duration, seekTo } = useAudio();

  // Transformation des post-its en marqueurs
  const markers = appelPostits
    .filter((postit) => postit.timestamp > 0)
    .map((postit) => ({
      id: postit.id,
      time: postit.timestamp,
      label: `${postit.sujet}: ${postit.text?.substring(0, 50)}...`,
    }))
    .sort((a, b) => a.time - b.time);

  const handleMarkerClick = (id: number) => {
    console.log(`Post-it ${id} sélectionné`);
    // La logique complète est gérée automatiquement par le composant
  };

  return (
    <TimeLineAudio
      duration={duration}
      currentTime={currentTime}
      markers={markers}
      onSeek={seekTo}
      onMarkerClick={handleMarkerClick}
    />
  );
}
```

### Timeline personnalisée avec données externes

```tsx
function CustomTimeline() {
  const [externalMarkers, setExternalMarkers] = useState([]);
  const { executeWithLock } = useAudio();

  // Chargement de marqueurs depuis une API
  useEffect(() => {
    fetchTimelineAnnotations().then((annotations) => {
      const markers = annotations.map((ann) => ({
        id: ann.id,
        time: ann.timestamp,
        label: ann.description,
      }));
      setExternalMarkers(markers);
    });
  }, []);

  const customSeekHandler = (time: number) => {
    executeWithLock(async () => {
      console.log(`🎵 Navigation personnalisée vers ${time}s`);
      await customAudioLogic(time);
    });
  };

  return (
    <TimeLineAudio
      duration={audioData.duration}
      currentTime={audioData.currentTime}
      markers={externalMarkers}
      onSeek={customSeekHandler}
      onMarkerClick={(id) => {
        console.log(`Marqueur externe ${id} cliqué`);
      }}
    />
  );
}
```

## Gestion des erreurs

### Validation des données

```typescript
// Vérification de l'existence du post-it
const matchingPostit = appelPostits.find((p) => p.id === marker.id);
if (!matchingPostit) {
  console.warn("⚠️ Aucun post-it trouvé pour cet ID:", marker.id);
  return; // Arrêt de l'exécution
}
```

### Protection contre les erreurs de calcul

```typescript
// Protection division par zéro
const position = (marker.time / (duration || 1)) * 100;

// Validation des marqueurs
const validMarkers = markers.filter(
  (marker) =>
    marker &&
    typeof marker.time === "number" &&
    marker.time >= 0 &&
    marker.time <= (duration || 0)
);
```

### Gestion des opérations asynchrones

```typescript
// Protection des opérations concurrentes
executeWithLock(async () => {
  try {
    await audioOperation();
    await new Promise((resolve) => setTimeout(resolve, 150));
  } catch (error) {
    console.error("Erreur lors de l'opération audio:", error);
  }
});
```

## Performance et optimisation

### Bonnes pratiques implémentées

- **Calculs de position optimisés** : Calcul direct sans boucles
- **Rendu conditionnel** : Filtrage des marqueurs valides
- **Mémorisation des recherches** : `find()` seulement au clic
- **Délais contrôlés** : Timeout de 150ms pour stabilité
- **Prévention des événements** : `stopPropagation()` systématique

### Optimisations possibles

```typescript
// Mémorisation des marqueurs transformés
const memoizedMarkers = useMemo(() => {
  return rawMarkers
    .filter((m) => m.time >= 0 && m.time <= duration)
    .sort((a, b) => a.time - b.time);
}, [rawMarkers, duration]);

// Debounce pour les changements fréquents
const debouncedSeek = useCallback(
  debounce((time: number) => onSeek(time), 100),
  [onSeek]
);
```

## Accessibilité

### Fonctionnalités d'accessibilité

- **aria-labelledby** sur le slider principal
- **Tooltips descriptifs** avec `title` sur tous les marqueurs
- **Support clavier** via le slider Material-UI
- **Contraste élevé** avec bordures blanches sur marqueurs rouges
- **Feedback visuel** avec animations au survol

### Améliorations possibles

```typescript
// Ajout de rôles ARIA
<Box
  role="slider"
  aria-label={`Marqueur ${marker.id}: ${marker.label}`}
  aria-describedby={`marker-description-${marker.id}`}
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleMarkerClick(e, marker);
    }
  }}
>
```

## Migration et évolutivité

### Points de migration observés

Le code montre une migration importante :

```typescript
// 🔄 AVANT : setSelectedPostit depuis AppContext
// const { setSelectedPostit } = useAppContext();

// 🔄 APRÈS : setSelectedPostit depuis CallDataContext
const { setSelectedPostit } = useCallData();
```

### Structure extensible

Le composant est conçu pour supporter :

- **Nouveaux types de marqueurs** (couleurs, formes, tailles différentes)
- **Métadonnées enrichies** (catégories, priorités, états)
- **Interactions avancées** (drag & drop, édition inline)
- **Visualisations alternatives** (graphiques, heatmaps)

```typescript
// Exemple d'extension pour marqueurs typés
interface ExtendedTimelineMarker extends TimelineMarker {
  type: "note" | "question" | "action" | "warning";
  priority: "low" | "medium" | "high";
  category: string;
  color?: string;
}
```

## Intégration avec l'écosystème

### Relation avec AudioPlayer

```
AudioPlayer (contrôles)
    ↓
TimeLineAudio (timeline + marqueurs)
    ↓
handleMarkerClick (logique post-it)
    ↓
Navigation (vue post-it)
```

### Flux de données complet

```
1. CallDataContext.appelPostits (source de données)
   ↓
2. Transformation en TimelineMarker[] (parent)
   ↓
3. TimeLineAudio (affichage + interactions)
   ↓
4. handleMarkerClick (sélection + navigation)
   ↓
5. Router.push (changement de vue)
```

Cette architecture découplée permet une maintenance facilitée et une évolution indépendante de chaque composant.

## Notes techniques importantes

- **IDs cohérents** : Les marqueurs utilisent les mêmes identifiants que les post-its
- **Délai de stabilisation** : 150ms après seek pour éviter les conflits audio
- **Protection concurrentielle** : `executeWithLock` pour toutes les opérations critiques
- **Navigation automatique** : Redirection systématique vers `/evaluation?view=postit`
- **Gestion des métadonnées** : Support complet des champs post-it (sujet, domaine, pratique)

Le composant TimeLineAudio constitue le cœur interactif de l'interface audio, orchestrant la navigation temporelle et l'accès aux annotations contextuelles.
