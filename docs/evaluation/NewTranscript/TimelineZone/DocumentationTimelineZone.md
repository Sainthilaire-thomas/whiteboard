# Documentation TimelineZone - Architecture et Composants

## Vue d'ensemble

La TimelineZone est un composant React complexe qui affiche une timeline interactive des événements temporels (post-its, tags) synchronisée avec la lecture audio d'un transcript. Elle utilise une architecture modulaire basée sur des composants spécialisés et des hooks réutilisables.

## Architecture globale

```
Timeline/
├── index.tsx                    # Orchestrateur principal
├── types.ts                     # Types TypeScript centralisés
├── profiles.ts                  # Profils d'affichage (compact/detailed/expanded)
├── Header/                      # En-tête et contrôles
├── Progress/                    # Barre de progression et curseur
├── Layers/                      # Gestion des couches d'événements
├── hooks/                       # Logique métier réutilisable
└── utils/                       # Fonctions pures utilitaires
```

## Composant principal : TimelineZone

**Fichier** : `Timeline/index.tsx`

**Responsabilités** :

- Orchestration de tous les sous-composants
- Gestion de l'état local (hover, visibilité des couches)
- Synchronisation avec les données audio (currentTime, duration)
- Gestion des interactions utilisateur (clics, navigation)
- Application des profils d'affichage selon le mode

**Props principales** :

- `events: TemporalEvent[]` - Liste des événements à afficher
- `currentTime: number` - Temps de lecture audio actuel
- `duration: number` - Durée totale de l'audio
- `config.timelineMode` - Mode d'affichage (minimal/compact/detailed/expanded)
- `onEventClick` - Callback pour les clics sur événements
- `onTimelineClick` - Callback pour les clics sur la timeline

**Modes d'affichage** :

- `minimal` : Barre de progression uniquement
- `compact` : Header + progress + 1 rangée d'événements
- `detailed` : Header + progress + multi-rangées + labels
- `expanded` : Comme detailed + contrôles de couches

## Composants spécialisés

### 1. TimelineHeader

**Fichier** : `Header/TimelineHeader.tsx`

**Rôle** : Affiche les informations générales et contrôles optionnels

- Titre "Timeline"
- Chips avec nombre d'événements et de couches
- Contrôles de visibilité des couches (mode expanded)
- Affichage temps actuel/durée totale

**Props notables** :

- `showLayerControls` : Active les boutons de toggle des couches
- `onToggleLayer` : Callback pour masquer/afficher une couche

### 2. ProgressBar

**Fichier** : `Progress/ProgressBar.tsx`

**Rôle** : Barre de progression interactive avec graduations temporelles

- Barre de progression visuelle (% de lecture)
- Graduations toutes les 30 secondes
- Clic pour naviguer dans l'audio
- Affichage temps actuel au centre

**Fonctionnalités** :

- Conversion position ↔ temps via utilitaires
- Gestion des clics pour seek audio
- Graduations automatiques selon la durée

### 3. TimelineCursor

**Fichier** : `Progress/TimelineCursor.tsx`

**Rôle** : Curseur rouge vertical indiquant la position de lecture

- Position calculée selon currentTime/duration/width
- Indicateur visuel en forme de play button
- Traverse toute la hauteur de la timeline
- Animation fluide lors des changements de position

### 4. LayerStack

**Fichier** : `Layers/LayerStack.tsx`

**Rôle** : Groupement et distribution des événements en couches

- Utilise `groupEventsByLayer` pour organiser les événements par type
- Pattern "render prop" : accepte une fonction `children` pour rendre chaque couche
- Mémorisation des calculs pour optimiser les performances

**Logique** :

1. Groupe les événements par type (tag, postit, etc.)
2. Crée une couche par type avec métadonnées (couleur, nom, hauteur)
3. Passe chaque couche à la fonction `children` pour rendu

### 5. TimelineLayer

**Fichier** : `Layers/TimelineLayer.tsx`

**Rôle** : Affichage d'une couche d'événements avec layout anti-collision

- Utilise `useLayerLayout` pour positionner les événements sans chevauchement
- Gère la hauteur dynamique selon le nombre de rangées nécessaires
- Affiche le label de la couche (nom + nombre d'événements)

**Algorithme anti-collision** :

1. Trie les événements par startTime
2. Place chaque événement sur la première rangée disponible
3. Respecte la limite `maxRows` du profil
4. Calcule la hauteur finale selon le nombre de rangées

### 6. Markers (EventMarker, TagMarker, PostitMarker)

**Fichiers** : `Layers/EventMarker.tsx`, `Layers/markers/`

**Rôle** : Rendu visuel spécialisé pour chaque type d'événement

#### EventMarker (générique)

- Barre de base avec tooltip
- Label sous forme de pilule si assez de place
- Gestion hover/click/tooltip
- Indicateur de type dans le coin

#### TagMarker (spécialisé)

- Barre verticale pour les événements ponctuels
- Rectangle pour les plages temporelles
- Pilule avec nom du tag
- Icône "T" dans un cercle
- Couleur depuis `event.metadata.color`

#### PostitMarker (spécialisé)

- Forme ovale/cercle
- Icône emoji 📝
- Couleur selon le sujet du post-it
- Label du sujet si assez de place
- Indicateur "P" en coin

## Hooks utilitaires

### useElementWidth

**Fichier** : `hooks/useResizeObserver.ts`

**Rôle** : Observe la largeur du conteneur timeline

- Utilise ResizeObserver pour détecter les redimensionnements
- Fallback vers window.resize si ResizeObserver indisponible
- Optimisé pour ne surveiller que la largeur (pas la hauteur)

### useTimelineSync

**Fichier** : `hooks/useTimelineSync.ts`

**Rôle** : Synchronise les événements avec le temps de lecture audio

- Calcule les événements actifs au temps courant
- Détermine le prochain et précédent événement
- Fournit des métriques (temps jusqu'au suivant, progression, etc.)

**Retourne** :

- `activeEvents` : Événements en cours de lecture
- `nextEvent` : Prochain événement à venir
- `previousEvent` : Événement précédent
- `progressToNext` : Progression vers le suivant (0-1)

### useLayerLayout

**Fichier** : `hooks/useLayerLayout.ts`

**Rôle** : Algorithme anti-collision pour positionner les événements

- Algorithme greedy : place sur la première rangée disponible
- Respecte les gaps minimaux entre événements
- Limite le nombre de rangées selon le profil
- Optimisé avec useMemo pour les recalculs

**Algorithme** :

1. Trie les événements par startTime
2. Pour chaque événement :
   - Calcule position X et largeur
   - Trouve la première rangée libre
   - Met à jour la position de fin de rangée
   - Respecte maxRows du profil

## Utilitaires purs

### utils/time.ts

**Fonctions** :

- `timeToPosition` : Convertit temps → position X pixels
- `positionToTime` : Convertit position X → temps
- `formatTime` : Formate secondes → "MM:SS"
- `generateTimeGraduations` : Crée les graduations automatiques

### utils/grouping.ts

**Fonctions** :

- `groupEventsByLayer` : Groupe événements par type en couches
- `createDefaultLayer` : Crée couche avec paramètres par défaut
- `getVisibleLayers` : Filtre les couches visibles

**Logique de groupement** :

1. Si pas de config eventTypes → groupement automatique par type
2. Si config eventTypes → utilise la configuration fournie
3. Fallback vers auto-détection si aucune couche créée

## Types centralisés

### types.ts

**Types principaux** :

- `TimelineProfile` : Configuration d'affichage (maxRows, dense, showLabels)
- `TimelineLayer` : Couche d'événements avec métadonnées
- `EventMetrics` : Position et dimensions d'un événement
- `LayoutItem` : Événement positionné (x, y, rangée)

### profiles.ts

**Profils prédéfinis** :

- `minimal` : 1 rangée, dense, pas de labels
- `compact` : 1 rangée, dense, pas de labels
- `detailed` : 4 rangées, normal, avec labels
- `expanded` : 6 rangées, normal, avec labels + contrôles

## Flux de données

```
1. NewTranscript → TimelineZone (events, currentTime, config)
2. TimelineZone → useTimelineSync (calcul événements actifs)
3. TimelineZone → getProfile (détermine profil d'affichage)
4. TimelineZone → LayerStack (groupement par type)
5. LayerStack → TimelineLayer (une par type)
6. TimelineLayer → useLayerLayout (positionnement anti-collision)
7. TimelineLayer → TagMarker/PostitMarker (rendu spécialisé)
```

## Interactions utilisateur

**Clics sur événements** :

1. Marker capture le clic → `event.stopPropagation()`
2. Appelle `onEventClick(event)`
3. NewTranscript → `seekTo(event.startTime)`

**Clics sur timeline** :

1. ProgressBar capture le clic
2. Convertit position X → temps via `positionToTime`
3. Appelle `onTimelineClick(time)`
4. NewTranscript → `seekTo(time)`

**Hover sur événements** :

1. Marker capture mouseEnter
2. Affiche tooltip avec détails
3. Met à jour `hoveredEvent` state

## Performance et optimisations

**Mémorisation** :

- `useMemo` sur groupement des événements
- `useMemo` sur calculs de layout anti-collision
- `useCallback` sur tous les handlers d'événements

**Lazy rendering** :

- Couches invisibles ne sont pas rendues
- Événements hors viewport pourraient être virtualisés (future amélioration)

**Gestion des redimensionnements** :

- ResizeObserver pour détecter changements de largeur
- Recalcul automatique des positions X des événements

## Points d'extension

**Nouveaux types de markers** :

1. Créer `markers/MonNouveauMarker.tsx`
2. Ajouter le cas dans `renderEvent` de TimelineZone
3. Définir le style spécialisé

**Nouveaux profils d'affichage** :

1. Ajouter dans `profiles.ts`
2. Le système les utilise automatiquement

**Nouvelles fonctionnalités** :

- Zoom temporel (modification de la plage affichée)
- Sélection multiple d'événements
- Drag & drop pour réorganiser
- Export de la timeline en image

Cette architecture modulaire permet une maintenance facile et l'ajout progressif de nouvelles fonctionnalités.
