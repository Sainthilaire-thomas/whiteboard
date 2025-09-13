# 📋 Affectation de Critères aux Passages Topés - Whiteboard

## 🎯 Vue d'ensemble

Extension du module Whiteboard permettant aux **participants** d'affecter des critères qualité aux passages d'appels qu'ils ont préalablement "topés" pendant l'écoute. Cette fonctionnalité réutilise le composant `GridContainerSujetsEval` existant et s'intègre dans le système d'évaluation collaborative temps réel.

## 🔄 Workflow utilisateur

1. **Phase d'écoute** : Les participants écoutent l'appel et "topent" les passages intéressants avec `AddPostitButton`
2. **Phase d'affectation** : Une fois l'écoute terminée, retour sur les passages topés pour les affecter aux critères qualité
3. **Synchronisation** : Les affectations sont visibles en temps réel par tous les participants et le coach

## 📊 Architecture des données

### Tables principales

#### `whiteboard.participant_evaluations` (12 colonnes) ✅ **EXISTANTE**

```sql
-- ✅ Table déjà créée en base - 12 colonnes
-- Structure exacte à récupérer pour comprendre le mapping
-- Stockage des affectations critères ↔ passages par les participants
-- Questions : participant_id, passage_reference, timestamp, idsujet ?
```

#### `activitesconseillers_sujets` (évaluations coach) ✅ **EXISTANTE**

```sql
CREATE TABLE activitesconseillers_sujets (
  idactivitesujet INTEGER PRIMARY KEY,
  idactivite INTEGER NOT NULL,           -- Référence activitesconseillers
  idsujet INTEGER NOT NULL,              -- Référence sujets (critère qualité)
  travaille BOOLEAN,                     -- Critère travaillé en coaching
  note_conformite TEXT                   -- Note de conformité du critère
);
```

#### `callactivityrelation` (relation appel ↔ activité) ✅ **EXISTANTE**

```sql
CREATE TABLE callactivityrelation (
  callid INTEGER NOT NULL,              -- Lookup table call
  activityid INTEGER NOT NULL           -- Lookup table activitesconseillers
);
```

#### `sujets` (référentiel critères qualité) ✅ **EXISTANTE**

```sql
CREATE TABLE sujets (
  idsujet INTEGER PRIMARY KEY,
  iddomaine INTEGER NOT NULL,           -- Domaine (ex: grille Poste, ESCDA)
  nomsujet TEXT NOT NULL,               -- Nom du critère (rubrique grille)
  description TEXT,                     -- Description/lexique/attendu
  valeurnumérique INTEGER DEFAULT 1,    -- Valeur par défaut (0 si non maîtrisé)
  idcategoriesujet INTEGER NOT NULL     -- Catégorie pour regroupement/couleur
);
```

### Tables whiteboard existantes

#### `whiteboard.postits` (passages topés)

```sql
-- Structure existante - 7 colonnes
-- Contient les passages "topés" par les participants
```

#### `whiteboard.shared_evaluation_sessions` (sessions collaboratives)

```sql
-- Structure existante - 17 colonnes
-- Gestion des sessions de partage temps réel
```

## 🏗️ Architecture technique proposée

### Composant principal : `PassageCriteriaAssignment`

```typescript
interface PassageCriteriaAssignmentProps {
  toppedPassages: ToppedPassage[]; // Passages déjà topés
  sessionId: string; // Session whiteboard active
  participantId?: string; // ID participant (non-auth)
  onAssignmentComplete: () => void; // Callback fin d'affectation
}

interface ToppedPassage {
  id: number;
  timestamp: number;
  text: string;
  wordIndex?: number;
  isAssigned: boolean; // A des critères affectés
  assignedCriteria: number[]; // IDs des sujets affectés
}
```

### Workflow technique détaillé

#### 1. Mode "Affectation" dans whiteboard

```typescript
// État du composant
const [mode, setMode] = useState<'listening' | 'assignment'>('listening');
const [selectedPassage, setSelectedPassage] = useState<ToppedPassage | null>(null);

// Bouton pour basculer en mode affectation
<Button
  onClick={() => setMode('assignment')}
  disabled={toppedPassages.length === 0}
>
  Affecter les critères aux passages topés ({toppedPassages.length})
</Button>
```

#### 2. Liste des passages à affecter

```typescript
// Affichage des passages avec statut d'affectation
{toppedPassages.map(passage => (
  <PassageCard
    key={passage.id}
    passage={passage}
    isAssigned={passage.isAssigned}
    assignedCount={passage.assignedCriteria.length}
    onClick={() => openCriteriaModal(passage)}
  >
    <Chip
      label={passage.isAssigned ? `${passage.assignedCriteria.length} critères` : 'À évaluer'}
      color={passage.isAssigned ? 'success' : 'warning'}
    />
  </PassageCard>
))}
```

#### 3. Modal réutilisant GridContainerSujetsEval

```typescript
<Modal open={selectedPassage !== null} onClose={closeCriteriaModal}>
  <Box sx={{ width: '80vw', maxHeight: '80vh', overflow: 'auto' }}>
    {/* Contexte du passage */}
    <Typography variant="h6">
      Passage sélectionné
    </Typography>
    <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 2 }}>
      "{selectedPassage?.text}"
    </Typography>
    <Typography variant="caption" sx={{ mb: 3, display: 'block' }}>
      Timestamp : {selectedPassage?.timestamp}s
    </Typography>

    {/* Réutilisation exacte du composant existant */}
    <GridContainerSujetsEval
      categories={categories}
      items={sujets}
      columnConfig={columnConfig}
      handleSujetClick={handleAssignCriteria}        // ⚡ Adaptation ici
      sujetsDeLActivite={selectedPassage?.assignedCriteria || []}
    />

    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
      <Button onClick={closeCriteriaModal}>Fermer</Button>
      <Button variant="contained" onClick={saveAssignment}>
        Valider l'affectation
      </Button>
    </Box>
  </Box>
</Modal>
```

#### 4. Adaptation de handleSujetClick

```typescript
const handleAssignCriteria = async (sujet: Item) => {
  if (!selectedPassage) return;

  const isAlreadyAssigned = selectedPassage.assignedCriteria.includes(
    sujet.idsujet
  );

  // Toggle de l'affectation
  const newAssignedCriteria = isAlreadyAssigned
    ? selectedPassage.assignedCriteria.filter((id) => id !== sujet.idsujet)
    : [...selectedPassage.assignedCriteria, sujet.idsujet];

  // Sauvegarde en base de données
  await assignCriteriaToPassage({
    session_id: sessionId,
    participant_id: participantId,
    passage_data: {
      id: selectedPassage.id,
      timestamp: selectedPassage.timestamp,
      text: selectedPassage.text,
      word_index: selectedPassage.wordIndex,
    },
    idsujet: sujet.idsujet,
    action: isAlreadyAssigned ? "remove" : "assign",
  });

  // Mise à jour locale
  setSelectedPassage({
    ...selectedPassage,
    assignedCriteria: newAssignedCriteria,
    isAssigned: newAssignedCriteria.length > 0,
  });

  // Synchronisation temps réel
  broadcastParticipantEvaluation(sessionId, {
    passageId: selectedPassage.id,
    assignedCriteria: newAssignedCriteria,
    participantId,
  });
};
```

## 📡 APIs et synchronisation

### Nouvelle API Route : Affectation critères

```typescript
// app/api/participant-evaluations/assign/route.ts
POST /api/participant-evaluations/assign

// Request body
{
  session_id: string,
  participant_id: string,
  passage_data: {
    id: number,           // ID du postit/passage topé
    timestamp: number,    // Position temporelle dans l'appel
    text: string,         // Texte du passage
    word_index?: number   // Index du mot si applicable
  },
  idsujet: number,        // Critère qualité à affecter
  action: 'assign' | 'remove'  // Ajouter ou retirer le critère
}

// Response
{
  success: boolean,
  assignment_id?: number,
  error?: string
}
```

### Hook de synchronisation temps réel

```typescript
// Hook pour synchroniser les affectations entre participants
const useRealtimeParticipantEvaluations = (sessionId: string) => {
  const [participantEvaluations, setParticipantEvaluations] = useState<
    ParticipantEvaluation[]
  >([]);

  useEffect(() => {
    // Subscription WebSocket pour les changements d'affectation
    const subscription = supabase
      .channel(`participant_evaluations_${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "whiteboard",
          table: "participant_evaluations",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          // Mise à jour des affectations en temps réel
          handleEvaluationChange(payload);
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, [sessionId]);

  return {
    participantEvaluations,
    broadcastParticipantEvaluation,
  };
};
```

## 🎨 Interface utilisateur

### Indicateurs visuels

- ✅ **Passage affecté** : Badge vert avec nombre de critères
- ⏳ **Passage non affecté** : Badge orange "À évaluer"
- 👥 **Affectations multiples** : Indicateur nombre de participants ayant évalué
- 🎯 **Critères populaires** : Mise en évidence des critères les plus sélectionnés

### Réutilisation composants existants

- **GridContainerSujetsEval** : Aucune modification nécessaire
- **Couleurs catégories** : Même système que module évaluation
- **Material-UI** : Cohérence totale avec l'existant
- **AddPostitButton** : Garde son rôle de "topage" initial

## 🔄 Intégration avec l'existant

### Hooks whiteboard étendus

```typescript
// Extension des hooks temps réel existants
const useWhiteboardEvaluation = (sessionId: string) => {
  // Combine les fonctionnalités existantes + affectation critères
  const toppedPassages = usePostits(sessionId);
  const participantEvaluations = useRealtimeParticipantEvaluations(sessionId);

  return {
    toppedPassages,
    participantEvaluations,
    assignCriteria: handleAssignCriteria,
    getPassageEvaluations: (passageId: number) =>
      participantEvaluations.filter((eval) => eval.passage_id === passageId),
  };
};
```

### Sécurité et permissions

- **Participants non-authentifiés** : Même pattern que Phase 3 (Service Role)
- **Session-based ID** : Génération d'ID temporaire pour identifier les participants
- **RLS Supabase** : Politiques pour limiter l'accès aux sessions actives

## 📋 Données manquantes pour développement

### Structure complète participant_evaluations ✅ **TABLE EXISTANTE**

```sql
-- ✅ Table déjà créée avec 12 colonnes
-- BESOIN : Structure exacte des colonnes pour mapping
-- Questions prioritaires :
-- 1. Comment identifier un participant non-authentifié ? (participant_id, session_id ?)
-- 2. Lien avec le passage topé (postit_id, word_index, timestamp ?)
-- 3. Stockage du critère affecté (idsujet ?)
-- 4. Métadonnées d'évaluation (created_at, evaluation_type ?)
```

### Points d'intégration à préciser

1. **Identification passages** : Lien entre `postits` et `participant_evaluations`
2. **Participant ID** : Stratégie pour les utilisateurs non-authentifiés
3. **Synchronisation** : Niveau de granularité temps réel (par critère ou par passage complet)
4. **Validation coach** : Le coach peut-il modifier/valider les affectations participants ?

## 🚀 Plan de développement

### Phase 1 : Composant de base (1-2 jours)

- [ ] Composant `PassageCriteriaAssignment`
- [ ] Modal avec `GridContainerSujetsEval` intégré
- [ ] Interface liste des passages topés
- [ ] Gestion état local (sans synchronisation)

### Phase 2 : Persistance et API (1 jour)

- [ ] API Route `/api/participant-evaluations/assign`
- [ ] Hook de persistance en base
- [ ] Gestion des erreurs et feedback utilisateur

### Phase 3 : Synchronisation temps réel (1 jour)

- [ ] Hook `useRealtimeParticipantEvaluations`
- [ ] WebSocket pour affectations en temps réel
- [ ] Indicateurs visuels des affectations multiples

### Phase 4 : Intégration whiteboard (0.5 jour)

- [ ] Intégration dans le workflow whiteboard existant
- [ ] Tests avec les composants Phase 3 (synchronisation transcript)
- [ ] Validation UX complète

## 🎯 Critères de succès

- ✅ **Réutilisation maximale** : `GridContainerSujetsEval` utilisé sans modification
- ✅ **Cohérence UX** : Interface identique au module évaluation
- ✅ **Temps réel** : Affectations visibles immédiatement par tous
- ✅ **Performance** : Pas de régression sur la synchronisation existante
- ✅ **Sécurité** : Participants non-auth avec accès contrôlé

## 📝 Notes pour la prochaine session

### Code à récupérer

1. **Structure exacte** `whiteboard.participant_evaluations` ✅ **TABLE EXISTANTE** (12 colonnes)
2. **Composant PostitCard/PassageCard** existant pour l'interface
3. **Hook usePostits** pour comprendre le système de topage actuel
4. **Types TypeScript** pour les passages et évaluations

### Questions à clarifier

1. **Workflow exact** : Quand basculer en mode affectation ?
2. **Granularité** : Un critère par mot, phrase ou segment ?
3. **Permissions** : Qui peut affecter quoi ?
4. **Analytics** : Agrégation des évaluations participants pour le coach ?

---

**Dernière mise à jour** : 12/06/2025
**Status** : Spécifications complètes - Prêt pour développement
**Prochaine étape** : Récupération structures BDD + développement Phase 1
