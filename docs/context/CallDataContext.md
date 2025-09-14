# CallDataContext - Documentation

## Vue d'ensemble

Le `CallDataContext` est le contexte central pour la gestion des données liées aux appels téléphoniques. Il orchestre les appels, transcriptions, post-its, zones de coaching et jeux de rôle dans un écosystème d'évaluation intégré.

**Localisation :** `context/CallDataContext.tsx`

## Fonctionnalités principales

- **Gestion des appels** : CRUD complet avec sélection active
- **Post-its d'évaluation** : Annotations avec mapping sujets/pratiques
- **Transcriptions audio** : Gestion des mots et synchronisation
- **Zones de coaching** : Sélection de texte pour les 4 zones
- **Jeux de rôle** : Données de formation par post-it
- **Activités liées** : Association appel ↔ activité
- **Sélections de texte** : Mode client/conseiller pour annotation

## Interface CallDataContextType

```typescript
interface CallDataContextType {
  // 📞 Gestion des appels
  calls: Call[]; // Liste des appels
  fetchCalls: (entrepriseId: number) => Promise<void>; // Récupération appels
  selectedCall: Call | null; // Appel actuellement sélectionné
  selectCall: (call: Call) => void; // Sélection d'un appel
  setSelectedCall: (call: Call | null) => void; // Mise à jour directe
  archiveCall: (callId: number) => Promise<void>; // Archivage appel
  deleteCall: (callId: number) => Promise<void>; // Suppression appel
  createAudioUrlWithToken: (filepath: string) => Promise<string>; // URL sécurisée
  isLoadingCalls: boolean; // État de chargement

  // 🗒️ Gestion des post-its
  allPostits: Postit[]; // Tous les post-its
  appelPostits: Postit[]; // Post-its de l'appel sélectionné
  fetchAllPostits: () => Promise<void>; // Récupération tous post-its
  addPostit: (postit: Omit<Postit, "id">) => Promise<void>; // Ajout post-it
  updatePostit: (id: number, updates: Partial<Postit>) => Promise<void>; // MAJ post-it
  deletePostit: (id: number) => Promise<void>; // Suppression post-it

  // Mapping sujets/pratiques
  postitToSujetMap: Record<string, string | null>; // Post-it → Sujet
  updatePostitToSujetMap: (postitId: string, sujetId: string | null) => void;
  postitToPratiqueMap: Record<string, string | null>; // Post-it → Pratique
  updatePostitToPratiqueMap: (
    postitId: string,
    pratiqueId: string | null
  ) => void;

  // 🟡 Post-it sélectionné (NOUVEAU depuis migration AppContext)
  selectedPostit: Postit | null; // Post-it actuellement sélectionné
  setSelectedPostit: (postit: Postit | null) => void; // Sélection post-it

  // 📚 Transcriptions
  transcription: Transcription | null; // Transcription de l'appel
  fetchTranscription: (callId: number) => Promise<void>; // Récupération transcription

  // 🧠 Zones de coaching (4 zones)
  zoneTexts: Record<string, string>; // Textes par zone
  selectTextForZone: (zone: string, text: string) => void; // Sélection texte zone

  // 🌍 Domaines
  domains: string[]; // Liste des domaines (noms)
  domainNames: string[]; // Noms des domaines
  fetchDomains: () => Promise<void>; // Récupération domaines

  // 🗣️ Tracking mot courant
  currentWord: Word | null; // Mot actuellement lu
  updateCurrentWord: (word: Word | null) => void; // MAJ mot courant

  // 🔄 Activités liées aux appels
  idCallActivite: number | null; // ID activité de l'appel
  fetchActivitiesForCall: (callId: number) => Promise<void>; // Récup activités appel
  createActivityForCall: (callId: number) => Promise<void>; // Création activité
  removeActivityForCall: (callId: number) => Promise<void>; // Suppression activité
  getActivityIdFromCallId: (callId: number) => number | null; // ID activité (sync)

  // 📝 Sélections de texte pour annotation
  transcriptSelectionMode: "client" | "conseiller" | null; // Mode sélection actif
  setTranscriptSelectionMode: (mode: "client" | "conseiller" | null) => void;
  clientSelection: TextSelection | null; // Sélection client
  setClientSelection: (selection: TextSelection | null) => void;
  conseillerSelection: TextSelection | null; // Sélection conseiller
  setConseillerSelection: (selection: TextSelection | null) => void;

  // 🎮 Jeu de rôle pour coaching
  selectedPostitForRolePlay: Postit | null; // Post-it pour jeu de rôle
  setSelectedPostitForRolePlay: (postit: Postit | null) => void;
  rolePlayData: RolePlayData | null; // Données du jeu de rôle
  saveRolePlayData: (data: RolePlayData) => Promise<void>; // Sauvegarde
  fetchRolePlayData: () => Promise<void>; // Récupération
  deleteRolePlayData: () => Promise<void>; // Suppression
  getRolePlaysByCallId: (callId: number) => Promise<RolePlayData[]>; // Liste par appel
  isLoadingRolePlay: boolean; // État chargement
  rolePlayError: string | null; // Erreur jeu de rôle
}
```

## Architecture interne

### Hooks spécialisés utilisés

```typescript
// 📞 Gestion des appels
import { useCalls } from "@/hooks/CallDataContext/useCalls";
// 🗒️ Gestion des post-its
import { usePostits } from "@/hooks/CallDataContext/usePostits";
// 📚 Gestion des transcriptions
import { useTranscriptions } from "@/hooks/CallDataContext/useTranscriptions";
// 🌍 Gestion des domaines
import { useDomains } from "@/hooks/useDomains";
// 🧠 Gestion des zones de coaching
import { useZones } from "@/hooks/CallDataContext/useZones";
// 🔄 Gestion des activités
import { useCallActivity } from "@/hooks/CallDataContext/useCallActivity";
// 🎮 Gestion du jeu de rôle
import { useRolePlay } from "@/hooks/CallDataContext/useRolePlay";
```

### États locaux du contexte

```typescript
// 🟡 Post-it sélectionné (migré depuis AppContext)
const [selectedPostit, setSelectedPostit] = useState<Postit | null>(null);

// 🎮 Post-it pour jeu de rôle
const [selectedPostitForRolePlay, setSelectedPostitForRolePlay] =
  useState<Postit | null>(null);

// 📝 Sélections de texte pour annotation
const [transcriptSelectionMode, setTranscriptSelectionMode] = useState<
  "client" | "conseiller" | null
>(null);
const [clientSelection, setClientSelection] = useState<TextSelection | null>(
  null
);
const [conseillerSelection, setConseillerSelection] =
  useState<TextSelection | null>(null);

// 🗣️ Mot courant pour synchronisation
const [currentWord, setCurrentWord] = useState<Word | null>(null);

// ✅ Cache pour ID activité (accès synchrone)
const [cachedActivityId, setCachedActivityId] = useState<number | null>(null);
```

## Fonctionnalités détaillées

### 📞 Gestion des appels

#### Auto-fetch lors du changement d'entreprise

```typescript
useEffect(() => {
  if (selectedEntreprise !== null) {
    console.log("📞 Triggering fetchCalls from CallDataProvider");
    fetchCalls(selectedEntreprise);
  }
}, [selectedEntreprise, fetchCalls]);
```

#### Création d'URL audio sécurisée

```typescript
// Usage typique pour AudioPlayer
const audioUrl = await createAudioUrlWithToken(selectedCall.filepath);
setAudioSrc(audioUrl);
```

### 🗒️ Système de post-its avancé

#### Migration selectedPostit depuis AppContext

```typescript
// 🔄 Réinitialisation lors du changement d'appel
useEffect(() => {
  if (selectedCall?.callid !== selectedPostit?.callid) {
    console.log("🔄 Changement d'appel - reset selectedPostit");
    setSelectedPostit(null);
  }
}, [selectedCall?.callid, selectedPostit?.callid]);

// 🔄 Debug synchronisation
useEffect(() => {
  if (selectedPostit) {
    console.log("🎯 CallDataContext - selectedPostit changé:", {
      id: selectedPostit.id,
      pratique: selectedPostit.pratique,
      idpratique: selectedPostit.idpratique,
      callid: selectedPostit.callid,
      selectedCallId: selectedCall?.callid,
    });
  }
}, [selectedPostit, selectedCall?.callid]);
```

#### Mapping intelligent sujets/pratiques

Le contexte gère des mappings entre post-its et leurs classifications :

```typescript
// Conversion de types pour compatibilité
postitToSujetMap: Object.fromEntries(
  Object.entries(postitToSujetMap).map(([key, value]) => [
    key,
    value?.toString() ?? null,
  ])
) as Record<string, string | null>,

// Wrapper pour mise à jour avec conversion
updatePostitToSujetMap: (postitId: string, sujetId: string | null) => {
  const numericPostitId = parseInt(postitId, 10);
  const numericSujetId = sujetId ? parseInt(sujetId, 10) : null;
  updatePostitToSujetMap(numericPostitId, numericSujetId);
},
```

### 🔄 Gestion des activités avec cache

#### Synchronisation cache activité

```typescript
// Mise à jour du cache lors du changement d'appel
useEffect(() => {
  if (selectedCall?.callid) {
    getActivityIdFromCallId(selectedCall.callid).then((id) => {
      setCachedActivityId(id);
    });
  } else {
    setCachedActivityId(null);
  }
}, [selectedCall?.callid, getActivityIdFromCallId]);

// Méthode synchrone avec cache
getActivityIdFromCallId: (callId: number) => {
  // Retour cache si c'est l'appel sélectionné
  if (callId === selectedCall?.callid) {
    return cachedActivityId;
  }
  // Pour les autres appels, retourne null
  return null;
},
```

### 📝 Sélections de texte contextuelles

#### Structure TextSelection

```typescript
interface TextSelection {
  text: string; // Texte sélectionné
  startTime: number; // Temps de début
  endTime: number; // Temps de fin
  wordIndex: number; // Index du premier mot
  speaker: "client" | "conseiller"; // Locuteur
}
```

#### Usage dans les composants Transcript

```typescript
// Dans Transcript.tsx
const { transcriptSelectionMode, setClientSelection, setConseillerSelection } =
  useCallData();

const handleTextSelection = () => {
  if (transcriptSelectionMode === "client") {
    setClientSelection(selectionData);
  } else if (transcriptSelectionMode === "conseiller") {
    setConseillerSelection(selectionData);
  }
};
```

### 🎮 Jeu de rôle pour coaching

#### Intégration avec post-its

```typescript
// Sélection d'un post-it pour coaching
const selectPostitForRolePlay = (postit: Postit) => {
  setSelectedPostitForRolePlay(postit);
  // Le hook useRolePlay se déclenche automatiquement
  fetchRolePlayData();
};

// Wrappers pour compatibilité d'interface
fetchRolePlayData: async () => {
  if (selectedCall?.callid && selectedPostitForRolePlay?.id) {
    await fetchRolePlayData(selectedCall.callid, selectedPostitForRolePlay.id);
  }
},

deleteRolePlayData: async () => {
  if (selectedCall?.callid && selectedPostitForRolePlay?.id) {
    // Récupération ID puis suppression
    const rolePlays = await getRolePlaysByCallId(selectedCall.callid);
    const rolePlayToDelete = rolePlays.find(
      (rp) => rp.postit_id === selectedPostitForRolePlay.id
    );
    if (rolePlayToDelete) {
      await deleteRolePlayFromHook(rolePlayToDelete.id);
    }
  }
},
```

## Intégrations avec autres contextes

### Avec AppContext

```typescript
// Récupération des données entreprise
const { selectedEntreprise } = useAppContext();

// Auto-déclenchement fetch appels
useEffect(() => {
  if (selectedEntreprise !== null) {
    fetchCalls(selectedEntreprise);
  }
}, [selectedEntreprise, fetchCalls]);
```

### Avec AudioContext

```typescript
// Synchronisation mot courant
const updateCurrentWord = (word: Word | null) => setCurrentWord(word);

// Usage dans TimeLineAudio pour navigation
executeWithLock(async () => {
  onSeek(marker.time);
  await new Promise((resolve) => setTimeout(resolve, 150));

  // Navigation vers vue post-it après audio
  router.push("/evaluation?view=postit");
});
```

## Types de données principales

### Call (Appel)

```typescript
interface Call {
  callid: number; // ID unique de l'appel
  filename: string; // Nom du fichier audio
  filepath: string; // Chemin du fichier
  audiourl?: string; // URL audio directe
  description?: string; // Description de l'appel
  callactivityrelation: CallActivityRelation[]; // Relations activités
}
```

### Postit (Post-it d'évaluation)

```typescript
interface Postit {
  id: number; // ID unique
  callid: number; // ID de l'appel parent
  wordid: number; // ID du mot lié
  word: string; // Mot/phrase associé
  text: string; // Texte du post-it
  sujet: string; // Sujet principal
  idsujet: number | null; // ID du sujet
  pratique: string; // Pratique associée
  idpratique?: number | null; // ID de la pratique (nouveau)
  timestamp: number; // Temps dans l'audio
  iddomaine: number | null; // ID du domaine
  idactivite?: number | null; // ID de l'activité
}
```

### RolePlayData (Jeu de rôle)

```typescript
interface RolePlayData {
  id: number; // ID unique
  call_id: number; // ID de l'appel
  postit_id: number; // ID du post-it lié
  zone_data: Record<string, string>; // Données des 4 zones
  created_at: string; // Date de création
  updated_at: string; // Date de MAJ
}
```

## Provider et utilisation

### CallDataProvider

```typescript
interface CallDataProviderProps {
  children: ReactNode;
  selectedEntreprise: number | null;  // Entreprise sélectionnée
}

export const CallDataProvider = ({ children, selectedEntreprise }) => {
  // Orchestration de tous les hooks spécialisés
  const calls = useCalls();
  const postits = usePostits(selectedCall?.callid ?? null);
  const transcriptions = useTranscriptions();
  // ... autres hooks

  return (
    <CallDataContext.Provider value={{ /* toutes les valeurs */ }}>
      {children}
    </CallDataContext.Provider>
  );
};
```

### Hook d'utilisation

```typescript
export const useCallData = (): CallDataContextType => {
  const context = useContext(CallDataContext);
  if (!context) {
    throw new Error("useCallData must be used within a CallDataProvider");
  }
  return context;
};
```

## Cas d'usage fréquents

### Sélection et navigation appel

```typescript
function CallSelection() {
  const { calls, selectCall, selectedCall, fetchTranscription } = useCallData();

  const handleCallSelect = async (call: Call) => {
    selectCall(call);
    // Auto-chargement transcription
    await fetchTranscription(call.callid);
  };

  return (
    <div>
      {calls.map(call => (
        <button
          key={call.callid}
          onClick={() => handleCallSelect(call)}
          className={selectedCall?.callid === call.callid ? 'selected' : ''}
        >
          {call.filename}
        </button>
      ))}
    </div>
  );
}
```

### Gestion des post-its avec mapping

```typescript
function PostitManager() {
  const {
    appelPostits,
    addPostit,
    updatePostit,
    selectedPostit,
    setSelectedPostit,
    postitToSujetMap,
    updatePostitToSujetMap
  } = useCallData();

  const createNewPostit = async (wordId: number, text: string) => {
    const newPostit = {
      callid: selectedCall.callid,
      wordid: wordId,
      word: "mot_sélectionné",
      text: text,
      timestamp: currentTime,
      // ... autres champs
    };

    await addPostit(newPostit);
  };

  const assignSujetToPostit = (postitId: number, sujetId: string) => {
    updatePostitToSujetMap(postitId.toString(), sujetId);
  };

  return (
    <div>
      {appelPostits.map(postit => (
        <div
          key={postit.id}
          onClick={() => setSelectedPostit(postit)}
          className={selectedPostit?.id === postit.id ? 'selected' : ''}
        >
          <p>{postit.text}</p>
          <span>Sujet: {postitToSujetMap[postit.id.toString()]}</span>
        </div>
      ))}
    </div>
  );
}
```

### Sélection de texte pour annotation

```typescript
function TranscriptAnnotation() {
  const {
    transcriptSelectionMode,
    setTranscriptSelectionMode,
    clientSelection,
    conseillerSelection
  } = useCallData();

  const enableClientSelection = () => {
    setTranscriptSelectionMode("client");
  };

  const enableConseillerSelection = () => {
    setTranscriptSelectionMode("conseiller");
  };

  return (
    <div>
      <div className="selection-controls">
        <button
          onClick={enableClientSelection}
          className={transcriptSelectionMode === "client" ? 'active' : ''}
        >
          Sélectionner Client
        </button>
        <button
          onClick={enableConseillerSelection}
          className={transcriptSelectionMode === "conseiller" ? 'active' : ''}
        >
          Sélectionner Conseiller
        </button>
      </div>

      <div className="selections">
        {clientSelection && (
          <div className="client-selection">
            <h4>Sélection Client:</h4>
            <p>{clientSelection.text}</p>
            <small>{clientSelection.startTime}s - {clientSelection.endTime}s</small>
          </div>
        )}

        {conseillerSelection && (
          <div className="conseiller-selection">
            <h4>Sélection Conseiller:</h4>
            <p>{conseillerSelection.text}</p>
            <small>{conseillerSelection.startTime}s - {conseillerSelection.endTime}s</small>
          </div>
        )}
      </div>
    </div>
  );
}
```

### Jeu de rôle avec post-its

```typescript
function RolePlayManager() {
  const {
    selectedPostitForRolePlay,
    setSelectedPostitForRolePlay,
    rolePlayData,
    saveRolePlayData,
    fetchRolePlayData,
    appelPostits
  } = useCallData();

  const selectPostitForCoaching = async (postit: Postit) => {
    setSelectedPostitForRolePlay(postit);
    await fetchRolePlayData(); // Auto-chargement données existantes
  };

  const saveZoneData = async (zoneData: Record<string, string>) => {
    if (selectedPostitForRolePlay) {
      const rolePlayDataToSave = {
        call_id: selectedCall.callid,
        postit_id: selectedPostitForRolePlay.id,
        zone_data: zoneData,
      };
      await saveRolePlayData(rolePlayDataToSave);
    }
  };

  return (
    <div>
      <div className="postit-selection">
        <h3>Sélectionner un post-it pour coaching:</h3>
        {appelPostits.map(postit => (
          <button
            key={postit.id}
            onClick={() => selectPostitForCoaching(postit)}
            className={selectedPostitForRolePlay?.id === postit.id ? 'selected' : ''}
          >
            {postit.text}
          </button>
        ))}
      </div>

      {selectedPostitForRolePlay && (
        <div className="role-play-zones">
          <h3>Données de coaching:</h3>
          {rolePlayData && (
            <pre>{JSON.stringify(rolePlayData.zone_data, null, 2)}</pre>
          )}
        </div>
      )}
    </div>
  );
}
```

## Gestion des erreurs et états

### Validation des données

```typescript
// Vérification appel sélectionné avant opérations
if (!selectedCall?.callid) {
  console.warn("Aucun appel sélectionné pour cette opération");
  return;
}

// Validation post-it avant jeu de rôle
if (!selectedPostitForRolePlay?.id) {
  console.error("Post-it requis pour le jeu de rôle");
  return;
}
```

### États de chargement

```typescript
function LoadingStates() {
  const { isLoadingCalls, isLoadingRolePlay } = useCallData();

  if (isLoadingCalls) {
    return <div>Chargement des appels...</div>;
  }

  if (isLoadingRolePlay) {
    return <div>Chargement des données de coaching...</div>;
  }

  return <div>Interface normale</div>;
}
```

### Gestion d'erreurs

```typescript
function ErrorHandling() {
  const { rolePlayError } = useCallData();

  return (
    <div>
      {rolePlayError && (
        <div className="error-message">
          Erreur jeu de rôle: {rolePlayError}
        </div>
      )}
    </div>
  );
}
```

## Performance et optimisations

### Auto-fetch intelligent

```typescript
// Fetch conditionnel basé sur selectedEntreprise
useEffect(() => {
  if (selectedEntreprise !== null) {
    fetchCalls(selectedEntreprise);
  }
}, [selectedEntreprise, fetchCalls]);

// Cache des ID activités pour accès synchrone
useEffect(() => {
  if (selectedCall?.callid) {
    getActivityIdFromCallId(selectedCall.callid).then(setCachedActivityId);
  }
}, [selectedCall?.callid]);
```

### Réinitialisation intelligente

```typescript
// Reset selectedPostit lors du changement d'appel
useEffect(() => {
  if (selectedCall?.callid !== selectedPostit?.callid) {
    setSelectedPostit(null);
  }
}, [selectedCall?.callid, selectedPostit?.callid]);
```

### Conversion de types optimisée

```typescript
// Conversion en temps réel pour compatibilité interface
domains: (domains as Domaine[]).map(domain => domain.nomdomaine),
domainNames: Object.values(domainNames),
```

## Architecture évolutive

### Points d'extension

- **Nouveaux types de post-its** : Support des catégories personnalisées
- **Sélections multiples** : Extension au-delà client/conseiller
- **Zones personnalisées** : Au-delà des 4 zones standard de coaching
- **Activités complexes** : Relations many-to-many appel-activité

### Patterns d'intégration

```typescript
// Extension pour nouveaux hooks
const newFeature = useNewFeature(selectedCall?.callid);

// Intégration dans le provider
return (
  <CallDataContext.Provider value={{
    ...existingValues,
    newFeatureData: newFeature.data,
    newFeatureActions: newFeature.actions,
  }}>
    {children}
  </CallDataContext.Provider>
);
```

Le CallDataContext constitue le hub central de données pour l'écosystème d'évaluation, orchestrant de manière cohérente les appels, annotations et outils de coaching dans une architecture extensible et performante.
