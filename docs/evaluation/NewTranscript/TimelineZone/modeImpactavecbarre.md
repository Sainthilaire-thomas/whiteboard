# Mode d'emploi : Modification Mode Impact avec Barres Temporelles

## Objectif

Remplacer les markers ponctuels par des barres temporelles utilisant start_time/end_time de turntagged pour une visualisation plus réaliste des tours de parole.

## Étapes de modification

### 1. Modifier useImpactAnalysis.ts

**Fichier** : `hooks/useImpactAnalysis.ts`

**Changements principaux** :

- Remplacer `events: TemporalEvent[]` par utilisation directe de `taggedTurns`
- Ajouter `calculateTurnMetrics()` pour calculer x, width, duration
- Modifier `AdjacentPair` pour utiliser `TaggedTurn` au lieu de `TemporalEvent`
- Calculer `timeDelta` comme gap réel entre fin conseiller et début client

### 2. Créer TurnBarMarker.tsx

**Nouveau fichier** : `Impact/TurnBarMarker.tsx`

**Fonctionnalités** :

- Rendu de barre rectangulaire avec largeur = durée réelle
- Gradient de couleur selon stratégie/réaction
- Label du tag si largeur suffisante (>60px)
- Tooltip avec durée et verbatim
- Largeur minimale 4px pour tours très courts

### 3. Modifier ImpactLane.tsx

**Fichier** : `Impact/ImpactLane.tsx`

**Changements** :

- Remplacer appels à `ConseillerMarker`/`ClientMarker` par `TurnBarMarker`
- Utiliser `calculateTurnMetrics()` pour chaque tour
- Augmenter hauteur des lanes (20px → 30px) pour barres plus visibles
- Gérer les chevauchements potentiels

### 4. Mettre à jour les types

**Fichier** : `types.ts`

**Modifications** :

- `AdjacentPair.conseiller` : `TemporalEvent` → `TaggedTurn`
- `AdjacentPair.client` : `TemporalEvent` → `TaggedTurn`
- Ajouter interface `TurnMetrics` avec x, width, duration, startTime, endTime

### 5. Adapter ImpactTimeline.tsx

**Fichier** : `Impact/ImpactTimeline.tsx`

**Ajustements** :

- Augmenter hauteur totale (140px → 180px)
- Adapter les positions Y des lanes
- Mettre à jour les props passées à ImpactLane

### 6. Modifier ImpactWave.tsx

**Fichier** : `Impact/ImpactWave.tsx`

**Changements** :

- Utiliser `pair.conseiller.end_time` au lieu de `start_time` pour point de départ
- Utiliser `pair.client.start_time` pour point d'arrivée
- Adapter le calcul des courbes pour les nouvelles positions

## Points d'attention

### Gestion des cas limites

- Tours très courts (<2 secondes) : largeur minimale 4px
- Tours longs (>30 secondes) : envisager troncature du label
- Chevauchements : décaler verticalement si nécessaire
- Tours sans end_time : utiliser start_time + durée estimée

### Performance

- Mémoriser les calculs de `calculateTurnMetrics()`
- Optimiser le rendu avec `React.memo()` sur `TurnBarMarker`
- Virtualisation si >50 tours sur la timeline

### Tests à effectuer

1. Vérifier alignement temporel des barres
2. Tester avec tours courts/longs/chevauchants
3. Valider les tooltips et interactions
4. Contrôler les performances avec beaucoup de données

## Ordre recommandé

1. Types (5 min)
2. useImpactAnalysis (20 min)
3. TurnBarMarker (30 min)
4. ImpactLane (15 min)
5. ImpactWave adaptations (10 min)
6. Tests et ajustements (20 min)

Total estimé : 1h40

Cette modification transformera fondamentalement la perception du mode Impact en révélant les véritables patterns temporels des conversations.
