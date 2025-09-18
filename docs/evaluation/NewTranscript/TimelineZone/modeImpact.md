# Documentation de Développement - Mode Timeline Impact

## 🎯 Objectif

Implémenter un nouveau mode d'affichage "Impact" dans la Timeline qui visualise l'efficacité des stratégies conseiller sur les réactions client dans les tours de parole adjacents.

## 📋 Spécifications Fonctionnelles

### Analyse des Données

- **Source** : Table `turntagged` pour les tags avec positions temporelles
- **Filtrage** : Paires adjacentes `conseiller → client` uniquement
- **Classification** :
  - Familles conseiller : `REFLET`, `ENGAGEMENT`, `OUVERTURE`, `EXPLICATION`
  - Familles client : `CLIENT` avec tags `CLIENT POSITIF/NEGATIF/NEUTRE`
  - Exclusion : Famille `AUTRES`

### Classification des Stratégies Conseiller

```typescript
NÉGATIVES (impact potentiellement négatif):
- Famille "EXPLICATION" → #a50303
- Tag "REFLET_JE" → #6c757d

POSITIVES (impact potentiellement positif):
- Famille "ENGAGEMENT" → #429309, #28a745
- Famille "OUVERTURE" → #0ed32f, #0ff135, #28a745
- Tag "REFLET_VOUS" → #21ab94

NEUTRES:
- Autres tags famille "REFLET" (REFLET_ACQ)
- Tous autres tags conseiller
```

### Visualisation - Structure à 3 Niveaux

```
┌─ RÉACTIONS CLIENT POSITIVES ─────────────────────────────────────────────────┐
│                    ●                           ●                            │
│                   ╱ ╲                         ╱ ╲                           │
├─ LIGNE CENTRALE (conseillers + neutres) ■═══════■═══════■═══■══════════════┤
│                   ╲ ╱                         ╲ ╱                           │
│                    ●                           ●                            │
└─ RÉACTIONS CLIENT NÉGATIVES ─────────────────────────────────────────────────┘
```

## 🏗️ Plan d'Implémentation

### Phase 1 : Extension Interface (30-45 min)

#### 1.1 Ajouter Option Menu Timeline

**Fichier** : `app/evaluation/components/NewTranscript/components/HeaderZone.tsx`

```typescript
// Dans le menu déroulant timeline existant
const timelineModes = [
  { value: 'minimal', label: 'Minimale', icon: <MinimizeIcon /> },
  { value: 'compact', label: 'Compacte', icon: <ViewCompactIcon /> },
  { value: 'detailed', label: 'Détaillée', icon: <ViewListIcon /> },
  { value: 'expanded', label: 'Étendue', icon: <ExpandMoreIcon /> },
  { value: 'impact', label: 'Mode Impact', icon: <TrendingUpIcon /> }, // NOUVEAU
];
```

#### 1.2 Étendre Props TimelineZone

**Fichier** : `app/evaluation/components/NewTranscript/components/Timeline/index.tsx`

```typescript
interface TimelineZoneProps {
  events: TemporalEvent[];
  currentTime: number;
  duration: number;
  config: {
    timelineMode: string; // Maintenant peut être 'impact'
    eventTypes?: EventTypeConfig[];
    layout?: {
      showControls?: boolean;
    };
  };
  onEventClick: (event: TemporalEvent) => void;
  onTimelineClick: (time: number) => void;
}
```

### Phase 2 : Logique d'Analyse Impact (45-60 min)

#### 2.1 Hook useImpactAnalysis

**Nouveau fichier** : `app/evaluation/components/NewTranscript/components/Timeline/hooks/useImpactAnalysis.ts`

```typescript
import { useMemo } from "react";
import { TemporalEvent } from "../../../types";
import { Tag } from "../../../../../../context/TaggingDataContext";

export interface AdjacentPair {
  id: string;
  conseiller: TemporalEvent;
  client: TemporalEvent;
  conseillerStrategy: "positive" | "negative" | "neutral";
  clientReaction: "positive" | "negative" | "neutral";
  isCoherent: boolean; // stratégie positive → réaction positive
  timeDelta: number;
}

export interface ImpactMetrics {
  totalPairs: number;
  positiveImpacts: number;
  negativeImpacts: number;
  neutralImpacts: number;
  coherentImpacts: number;
  efficiencyRate: number; // % impacts cohérents
  avgTimeDelta: number;
}

export const useImpactAnalysis = (
  events: TemporalEvent[],
  tags: Tag[]
): { adjacentPairs: AdjacentPair[]; metrics: ImpactMetrics } => {
  return useMemo(() => {
    // 1. Filtrer événements pertinents (exclure famille AUTRES)
    const relevantEvents = filterRelevantEvents(events, tags);

    // 2. Identifier paires adjacentes conseiller → client
    const adjacentPairs = findAdjacentPairs(relevantEvents, tags);

    // 3. Calculer métriques d'efficacité
    const metrics = calculateImpactMetrics(adjacentPairs);

    return { adjacentPairs, metrics };
  }, [events, tags]);
};

// Fonctions utilitaires
const filterRelevantEvents = (
  events: TemporalEvent[],
  tags: Tag[]
): TemporalEvent[] => {
  return events.filter((event) => {
    const tag = tags.find((t) => t.label === event.tag);
    return tag && tag.family !== "AUTRES";
  });
};

const isConseillerEvent = (event: TemporalEvent, tags: Tag[]): boolean => {
  const tag = tags.find((t) => t.label === event.tag);
  return (
    tag?.originespeaker === "conseiller" &&
    ["REFLET", "ENGAGEMENT", "OUVERTURE", "EXPLICATION"].includes(tag.family)
  );
};

const isClientEvent = (event: TemporalEvent, tags: Tag[]): boolean => {
  const tag = tags.find((t) => t.label === event.tag);
  return tag?.originespeaker === "client" && tag.family === "CLIENT";
};

const findAdjacentPairs = (
  events: TemporalEvent[],
  tags: Tag[]
): AdjacentPair[] => {
  const sortedEvents = [...events].sort((a, b) => a.startTime - b.startTime);
  const pairs: AdjacentPair[] = [];

  for (let i = 0; i < sortedEvents.length - 1; i++) {
    const current = sortedEvents[i];
    const next = sortedEvents[i + 1];

    if (isConseillerEvent(current, tags) && isClientEvent(next, tags)) {
      const conseillerStrategy = classifyConseillerStrategy(current, tags);
      const clientReaction = classifyClientReaction(next);

      pairs.push({
        id: `${current.id}-${next.id}`,
        conseiller: current,
        client: next,
        conseillerStrategy,
        clientReaction,
        isCoherent:
          (conseillerStrategy === "positive" &&
            clientReaction === "positive") ||
          (conseillerStrategy === "negative" && clientReaction === "negative"),
        timeDelta: next.startTime - current.startTime,
      });
    }
  }

  return pairs;
};

const classifyConseillerStrategy = (
  event: TemporalEvent,
  tags: Tag[]
): "positive" | "negative" | "neutral" => {
  const tag = tags.find((t) => t.label === event.tag);
  if (!tag) return "neutral";

  // Règles métier
  if (tag.family === "EXPLICATION") return "negative";
  if (tag.label === "REFLET_JE") return "negative";
  if (["ENGAGEMENT", "OUVERTURE"].includes(tag.family)) return "positive";
  if (tag.label === "REFLET_VOUS") return "positive";

  return "neutral";
};

const classifyClientReaction = (
  event: TemporalEvent
): "positive" | "negative" | "neutral" => {
  if (event.tag === "CLIENT POSITIF") return "positive";
  if (event.tag === "CLIENT NEGATIF") return "negative";
  return "neutral";
};

const calculateImpactMetrics = (pairs: AdjacentPair[]): ImpactMetrics => {
  const totalPairs = pairs.length;
  const positiveImpacts = pairs.filter(
    (p) => p.clientReaction === "positive"
  ).length;
  const negativeImpacts = pairs.filter(
    (p) => p.clientReaction === "negative"
  ).length;
  const neutralImpacts = pairs.filter(
    (p) => p.clientReaction === "neutral"
  ).length;
  const coherentImpacts = pairs.filter((p) => p.isCoherent).length;

  return {
    totalPairs,
    positiveImpacts,
    negativeImpacts,
    neutralImpacts,
    coherentImpacts,
    efficiencyRate:
      totalPairs > 0 ? Math.round((coherentImpacts / totalPairs) * 100) : 0,
    avgTimeDelta:
      totalPairs > 0
        ? pairs.reduce((acc, p) => acc + p.timeDelta, 0) / totalPairs
        : 0,
  };
};
```

### Phase 3 : Composants Visuels (60-90 min)

#### 3.1 Composant ImpactTimeline

**Nouveau fichier** : `app/evaluation/components/NewTranscript/components/Timeline/Impact/ImpactTimeline.tsx`

```typescript
import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { AdjacentPair, ImpactMetrics } from '../hooks/useImpactAnalysis';
import { ImpactLane } from './ImpactLane';
import { ImpactWave } from './ImpactWave';

interface ImpactTimelineProps {
  adjacentPairs: AdjacentPair[];
  metrics: ImpactMetrics;
  width: number;
  duration: number;
  onEventClick: (event: any) => void;
}

export const ImpactTimeline: React.FC<ImpactTimelineProps> = ({
  adjacentPairs,
  metrics,
  width,
  duration,
  onEventClick
}) => {
  // Séparer les paires par type de réaction client
  const positivePairs = adjacentPairs.filter(p => p.clientReaction === 'positive');
  const negativePairs = adjacentPairs.filter(p => p.clientReaction === 'negative');
  const neutralPairs = adjacentPairs.filter(p => p.clientReaction === 'neutral');

  return (
    <Box sx={{ position: 'relative', height: 120, backgroundColor: 'background.paper' }}>
      {/* Header avec métriques */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
          Timeline Impact
        </Typography>
        <Chip
          label={`${metrics.efficiencyRate}% efficace`}
          color={metrics.efficiencyRate > 70 ? 'success' : metrics.efficiencyRate > 50 ? 'warning' : 'error'}
          size="small"
        />
        <Chip
          label={`${metrics.totalPairs} interactions`}
          variant="outlined"
          size="small"
        />
      </Box>

      {/* Ligne haute : réactions positives */}
      <ImpactLane
        level="positive"
        y={25}
        pairs={positivePairs}
        width={width}
        duration={duration}
        onEventClick={onEventClick}
        backgroundColor="rgba(18, 217, 194, 0.1)" // CLIENT POSITIF avec opacité
      />

      {/* Ligne centrale : conseillers + réactions neutres */}
      <ImpactLane
        level="central"
        y={55}
        pairs={adjacentPairs} // Tous les conseillers + neutres
        width={width}
        duration={duration}
        onEventClick={onEventClick}
        backgroundColor="rgba(108, 117, 125, 0.05)" // Gris neutre
        showAllConseillers={true}
      />

      {/* Ligne basse : réactions négatives */}
      <ImpactLane
        level="negative"
        y={85}
        pairs={negativePairs}
        width={width}
        duration={duration}
        onEventClick={onEventClick}
        backgroundColor="rgba(226, 51, 13, 0.1)" // CLIENT NEGATIF avec opacité
      />

      {/* Ondes d'impact */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
      >
        {adjacentPairs.map(pair => (
          <ImpactWave
            key={pair.id}
            pair={pair}
            width={width}
            duration={duration}
          />
        ))}
      </svg>
    </Box>
  );
};
```

#### 3.2 Composant ImpactLane

**Nouveau fichier** : `app/evaluation/components/NewTranscript/components/Timeline/Impact/ImpactLane.tsx`

```typescript
import React from 'react';
import { Box } from '@mui/material';
import { AdjacentPair } from '../hooks/useImpactAnalysis';
import { timeToPosition } from '../utils/time';
import { ConseillerMarker } from './ConseillerMarker';
import { ClientMarker } from './ClientMarker';

interface ImpactLaneProps {
  level: 'positive' | 'central' | 'negative';
  y: number;
  pairs: AdjacentPair[];
  width: number;
  duration: number;
  onEventClick: (event: any) => void;
  backgroundColor?: string;
  showAllConseillers?: boolean;
}

export const ImpactLane: React.FC<ImpactLaneProps> = ({
  level,
  y,
  pairs,
  width,
  duration,
  onEventClick,
  backgroundColor = 'transparent',
  showAllConseillers = false
}) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: y - 10,
        left: 0,
        width: '100%',
        height: 20,
        backgroundColor,
        borderRadius: 1,
      }}
    >
      {/* Afficher les événements conseiller (seulement sur ligne centrale ou tous si demandé) */}
      {(level === 'central' || showAllConseillers) && pairs.map(pair => {
        const x = timeToPosition(pair.conseiller.startTime, duration, width);
        return (
          <ConseillerMarker
            key={`conseiller-${pair.conseiller.id}`}
            event={pair.conseiller}
            strategy={pair.conseillerStrategy}
            x={x}
            y={10}
            onClick={onEventClick}
          />
        );
      })}

      {/* Afficher les réactions client */}
      {pairs.map(pair => {
        // Sur ligne centrale, ne montrer que les réactions neutres
        if (level === 'central' && pair.clientReaction !== 'neutral') return null;
        // Sur lignes haut/bas, ne montrer que les réactions correspondantes
        if (level === 'positive' && pair.clientReaction !== 'positive') return null;
        if (level === 'negative' && pair.clientReaction !== 'negative') return null;

        const x = timeToPosition(pair.client.startTime, duration, width);
        return (
          <ClientMarker
            key={`client-${pair.client.id}`}
            event={pair.client}
            reaction={pair.clientReaction}
            x={x}
            y={10}
            onClick={onEventClick}
          />
        );
      })}
    </Box>
  );
};
```

#### 3.3 Composants Markers

**Nouveau fichier** : `app/evaluation/components/NewTranscript/components/Timeline/Impact/ConseillerMarker.tsx`

```typescript
import React from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import { TemporalEvent } from '../../../../types';
import { formatTime } from '../utils/time';

interface ConseillerMarkerProps {
  event: TemporalEvent;
  strategy: 'positive' | 'negative' | 'neutral';
  x: number;
  y: number;
  onClick: (event: TemporalEvent) => void;
}

export const ConseillerMarker: React.FC<ConseillerMarkerProps> = ({
  event,
  strategy,
  x,
  y,
  onClick
}) => {
  const getMarkerStyle = () => {
    switch (strategy) {
      case 'positive':
        return {
          backgroundColor: '#28a745',
          clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', // Triangle vers haut
        };
      case 'negative':
        return {
          backgroundColor: '#dc3545',
          clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)', // Triangle vers bas
        };
      default:
        return {
          backgroundColor: '#6c757d',
          borderRadius: '2px', // Carré
        };
    }
  };

  return (
    <Tooltip
      title={
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            {event.tag} • {strategy.toUpperCase()}
          </Typography>
          <Typography variant="caption">
            {formatTime(event.startTime)}
          </Typography>
          {event.data?.verbatim && (
            <Typography variant="caption" sx={{ display: 'block', fontStyle: 'italic' }}>
              "{event.data.verbatim}"
            </Typography>
          )}
        </Box>
      }
      arrow
      placement="top"
    >
      <Box
        sx={{
          position: 'absolute',
          left: x - 6,
          top: y - 6,
          width: 12,
          height: 12,
          cursor: 'pointer',
          transition: 'transform 0.15s ease',
          '&:hover': {
            transform: 'scale(1.3)',
            zIndex: 20,
          },
          ...getMarkerStyle(),
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick(event);
        }}
      />
    </Tooltip>
  );
};
```

**Nouveau fichier** : `app/evaluation/components/NewTranscript/components/Timeline/Impact/ClientMarker.tsx`

```typescript
import React from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import { TemporalEvent } from '../../../../types';
import { formatTime } from '../utils/time';

interface ClientMarkerProps {
  event: TemporalEvent;
  reaction: 'positive' | 'negative' | 'neutral';
  x: number;
  y: number;
  onClick: (event: TemporalEvent) => void;
}

export const ClientMarker: React.FC<ClientMarkerProps> = ({
  event,
  reaction,
  x,
  y,
  onClick
}) => {
  const getMarkerConfig = () => {
    switch (reaction) {
      case 'positive':
        return {
          backgroundColor: '#12d9c2',
          emoji: '😊',
          color: 'white',
        };
      case 'negative':
        return {
          backgroundColor: '#e2330d',
          emoji: '😞',
          color: 'white',
        };
      default:
        return {
          backgroundColor: '#6c757d',
          emoji: '😐',
          color: 'white',
        };
    }
  };

  const config = getMarkerConfig();

  return (
    <Tooltip
      title={
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            {event.tag} • RÉACTION {reaction.toUpperCase()}
          </Typography>
          <Typography variant="caption">
            {formatTime(event.startTime)}
          </Typography>
          {event.data?.verbatim && (
            <Typography variant="caption" sx={{ display: 'block', fontStyle: 'italic' }}>
              "{event.data.verbatim}"
            </Typography>
          )}
        </Box>
      }
      arrow
      placement="top"
    >
      <Box
        sx={{
          position: 'absolute',
          left: x - 8,
          top: y - 8,
          width: 16,
          height: 16,
          borderRadius: '50%',
          backgroundColor: config.backgroundColor,
          border: '2px solid white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '8px',
          color: config.color,
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          transition: 'transform 0.15s ease',
          '&:hover': {
            transform: 'scale(1.3)',
            zIndex: 20,
          },
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick(event);
        }}
      >
        {config.emoji}
      </Box>
    </Tooltip>
  );
};
```

#### 3.4 Composant ImpactWave

**Nouveau fichier** : `app/evaluation/components/NewTranscript/components/Timeline/Impact/ImpactWave.tsx`

```typescript
import React from 'react';
import { AdjacentPair } from '../hooks/useImpactAnalysis';
import { timeToPosition } from '../utils/time';

interface ImpactWaveProps {
  pair: AdjacentPair;
  width: number;
  duration: number;
}

export const ImpactWave: React.FC<ImpactWaveProps> = ({ pair, width, duration }) => {
  const conseillerX = timeToPosition(pair.conseiller.startTime, duration, width);
  const clientX = timeToPosition(pair.client.startTime, duration, width);

  // Déterminer Y de destination selon réaction client
  const targetY = pair.clientReaction === 'positive' ? 25 :
                  pair.clientReaction === 'negative' ? 85 : 55;

  // Couleur selon stratégie conseiller
  const getWaveColor = () => {
    switch (pair.conseillerStrategy) {
      case 'positive': return '#28a745';
      case 'negative': return '#dc3545';
      default: return '#6c757d';
    }
  };

  // Style de ligne (solide si cohérent, pointillé si incohérent)
  const strokeDasharray = pair.isCoherent ? "none" : "4,2";

  return (
    <path
      d={`M ${conseillerX} 55 Q ${(conseillerX + clientX) / 2} ${(55 + targetY) / 2} ${clientX} ${targetY}`}
      stroke={getWaveColor()}
      strokeWidth="1.5"
      fill="none"
      opacity="0.7"
      strokeDasharray={strokeDasharray}
    />
  );
};
```

### Phase 4 : Intégration TimelineZone (15-30 min)

#### 4.1 Modifier TimelineZone

**Fichier** : `app/evaluation/components/NewTranscript/components/Timeline/index.tsx`

```typescript
// Ajouter imports
import { useImpactAnalysis } from './hooks/useImpactAnalysis';
import { ImpactTimeline } from './Impact/ImpactTimeline';
import { useTaggingData } from '../../../../../context/TaggingDataContext';

// Dans le composant TimelineZone, ajouter:
export function TimelineZone({ /* props existantes */ }) {
  // ... code existant ...

  // Nouveau : récupérer les tags pour analyse
  const { tags } = useTaggingData();

  // Analyse d'impact si mode impact
  const impactAnalysis = useImpactAnalysis(events, tags);

  // ... reste du code existant ...

  // Mode impact - nouveau rendu
  if (config.timelineMode === 'impact') {
    return (
      <Paper
        ref={timelineRef}
        sx={{
          minHeight: 180, // Plus haut pour 3 niveaux
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          position: 'relative',
          overflow: 'hidden',
        }}
        elevation={0}
      >
        <ImpactTimeline
          adjacentPairs={impactAnalysis.adjacentPairs}
          metrics={impactAnalysis.metrics}
          width={width - 32}
          duration={duration}
          onEventClick={handleEventClick}
        />

        {/* Curseur temporel global */}
        {duration > 0 && width > 0 && (
          <TimelineCursor
            currentTime={currentTime}
            duration={duration}
            height={180}
            width={width - 32}
          />
        )}
      </Paper>
    );
  }

  // ... reste du code existant pour autres modes ...
}
```

## ✅ Checklist de Développement

### Phase 1 - Interface (30-45 min)

- [ ] Ajouter option "Mode Impact" au menu déroulant timeline
- [ ] Étendre props TimelineZone pour supporter mode 'impact'
- [ ] Tester switch entre modes

### Phase 2 - Logique (45-60 min)

- [ ] Créer hook `useImpactAnalysis`
- [ ] Implémenter filtrage paires adjacentes conseiller→client
- [ ] Coder classification strategies/réactions
- [ ] Calculer métriques d'efficacité
- [ ] Tester avec données réelles

### Phase 3 - Composants (60-90 min)

- [ ] Créer `ImpactTimeline` (composant principal)
- [ ] Créer `ImpactLane` (gestion des 3 niveaux)
- [ ] Créer `ConseillerMarker` (triangles/carrés)
- [ ] Créer `ClientMarker` (cercles avec emojis)
- [ ] Créer `ImpactWave` (courbes SVG)
- [ ] Tester rendu et interactions

### Phase 4 - Intégration (15-30 min)

- [ ] Intégrer dans TimelineZone avec condition mode 'impact'
- [ ] Tester curseur temporel
- [ ] Vérifier responsive
- [ ] Tests finaux

## 🧪 Tests à Effectuer

1. **Sélection mode Impact** dans menu déroulant
2. **Filtrage correct** des paires conseiller→client adjacentes
3. **Classification** stratégies positives/négatives/neutres
4. **Affichage 3 niveaux** avec répartition correcte
5. **Ondes d'impact** reliant conseiller → client
6. **Métriques d'efficacité** calculées correctement
7. **Interactions** (clics, tooltips, hover)
8. **Performance** avec beaucoup d'événements

## 📝 Notes Techniques

- **Dépendances** : Aucune nouvelle dépendance externe
- **Performance** : `useMemo` sur analyse d'impact pour éviter recalculs
- **Responsive** : Utilise `useElementWidth` existant
- **Accessibilité** : Tooltips et couleurs contrastées
- **TypeScript** : Types stricts pour toute la chaîne

## 🚀 Résultat Attendu

Une timeline à 3 niveaux montrant :

- **Ligne haute** : Réactions client positives (● verts)
- **Ligne centrale** : Stratégies conseiller + réactions neutres
- **Ligne basse** : Réactions client négatives (● rouges)
- **Ondes d'impact** : Courbes colorées conseiller → client
- **Métriques** : % d'efficacité des stratégies

Cette implémentation permettra de visualiser concrètement l'efficacité des techniques de conseil en temps réel sur la timeline !
