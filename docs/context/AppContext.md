# AppContext - Documentation

## Vue d'ensemble

Le `AppContext` est le contexte global de l'application qui gère les données métier centralisées : entreprises, domaines, activités, nudges et interface utilisateur. Il orchestre les hooks spécialisés et fournit un état cohérent à travers toute l'application.

**Localisation :** `context/AppContext.tsx`

## Fonctionnalités principales

- **Gestion des entreprises** : Sélection et données entreprise
- **Domaines filtrés** : Domaines disponibles par entreprise avec auto-sélection
- **Activités et pratiques** : CRUD complet avec avis et catégories
- **Système de nudges** : Notifications personnalisées par pratique/activité
- **Interface utilisateur** : Drawer, navigation et états UI
- **Authentification** : Gestion utilisateur et sessions
- **Sélections contextuelles** : États de sélection partagés

## Interface AppContextType

```typescript
interface AppContextType {
  // 🏢 Gestion des entreprises
  entreprises: Entreprise[]; // Liste des entreprises
  isLoadingEntreprises: boolean; // État de chargement
  errorEntreprises: Error | null; // Erreur éventuelle
  selectedEntreprise: number | null; // Entreprise sélectionnée
  setSelectedEntreprise: (id: number | null) => void; // Sélection entreprise

  // 🌍 Domaines et sujets
  domains: Domaine[]; // Tous les domaines
  selectedDomain: string | null; // Domaine sélectionné
  selectDomain: (domainId: string) => void; // Sélection domaine
  filteredDomains: Domaine[]; // Domaines filtrés par entreprise
  sujetsData: Sujet[]; // Sujets du domaine sélectionné
  categoriesSujets: CategorieSujet[]; // Catégories de sujets
  isLoadingDomains: boolean; // États de chargement
  isLoadingSujets: boolean;
  isLoadingCategoriesSujets: boolean;

  // 🎯 Activités et pratiques
  pratiques: Pratique[]; // Liste des pratiques
  isLoadingPratiques: boolean; // État de chargement
  fetchReviewsForPractice: (practiceId: number) => Promise<void>; // Récup avis
  reviews: Review[]; // Avis pour pratique
  averageRating: number; // Note moyenne
  categoriesPratiques: CategoriePratique[]; // Catégories pratiques

  // 🔔 Système de nudges
  nudges: Nudge[]; // Liste des nudges
  setNudges: (nudges: SetStateAction<Nudge[]>) => void;
  fetchNudgesForPractice: (practiceId: number) => Promise<void>; // Nudges par pratique
  fetchNudgesForActivity: (activityId: number) => Promise<void>; // Nudges par activité
  refreshNudgesFunction: () => Promise<void>; // Actualisation nudges
  refreshNudges: boolean; // Flag actualisation
  updateNudgeDates: (dates: NudgeDates) => void; // MAJ dates nudges
  nudgeDates: NudgeDates; // Dates de nudges
  nudgesUpdated: boolean; // Flag mise à jour
  markNudgesAsUpdated: () => void; // Marquer comme mis à jour
  resetNudgesUpdated: () => void; // Reset flag

  // 🎨 Interface utilisateur
  drawerOpen: boolean; // État drawer ouvert
  toggleDrawer: () => void; // Basculer drawer
  drawerContent: React.ReactNode; // Contenu du drawer
  setDrawerContent: (content: React.ReactNode) => void;
  handleOpenDrawerWithContent: (content: React.ReactNode) => void;
  handleOpenDrawerWithData: (data: any) => void; // Ouverture avec données

  // 👤 Authentification
  user: User | null; // Utilisateur connecté
  isLoading: boolean; // Chargement auth

  // 🗂️ États globaux
  idActivite: number | null; // ID activité sélectionnée
  setIdActivite: (id: number | null) => void;
  idPratique: number | null; // ID pratique sélectionnée
  setIdPratique: (id: number | null) => void;
  refreshKey: number; // Clé pour forcer refresh
  setRefreshKey: (key: number) => void;

  // 📝 Sélections contextuelles (héritées de useSelection)
  // ... autres propriétés de sélection
}
```

## Architecture interne

### Hooks spécialisés orchestrés

```typescript
// 🎯 Activités et pratiques
const activités = useActivities();

// 🌍 Domaines et sujets
const domaines = useDomains();

// 🔔 Système de nudges
const nudges = useNudges();

// 🎨 Interface utilisateur
const ui = useUI();

// 👤 Authentification
const auth = useAuth();

// 🏢 Entreprises
const { entreprises, isLoading, error } = useEntreprises();

// 📝 Sélections (délégué à useSelection)
const selection = useSelection(null, selectedCallId, idCallActivite);
```

### Filtrage intelligent des domaines

#### Logique de filtrage par entreprise

```typescript
const { data: filteredDomains = [] } = useQuery<Domaine[]>({
  queryKey: ["filteredDomains", selectedEntreprise],
  queryFn: async () => {
    if (selectedEntreprise) {
      // Récupération des domaines liés à l'entreprise
      const { data, error } = await supabaseClient
        .from("entreprise_domaines")
        .select(
          `
          iddomaine,
          domaines:iddomaine (
            iddomaine,
            nomdomaine,
            description
          )
        `
        )
        .eq("identreprise", selectedEntreprise);

      if (error) {
        console.error("Erreur filtrage domaines", error);
        return [];
      }

      // Extraction des domaines de la jointure
      return data.map((entry: any) => entry.domaines).filter(Boolean);
    } else {
      // Domaines par défaut si pas d'entreprise
      const { data, error } = await supabaseClient
        .from("domaines")
        .select("*")
        .in("nomdomaine", ["escda", "satisfaction"]);

      return data || [];
    }
  },
  enabled: true, // Toujours activé
});
```

#### Auto-sélection intelligente du domaine

```typescript
useEffect(() => {
  if (filteredDomains && filteredDomains.length > 0) {
    const isCurrentDomainValid =
      domaines.selectedDomain &&
      filteredDomains.some(
        (d) => d.iddomaine.toString() === domaines.selectedDomain
      );

    if (!domaines.selectedDomain || !isCurrentDomainValid) {
      const firstAvailableDomain = filteredDomains[0].iddomaine.toString();
      console.log(
        "🔍 AppContext - Auto-selecting domain:",
        firstAvailableDomain
      );
      domaines.selectDomain(firstAvailableDomain);
    }
  }
}, [filteredDomains, domaines.selectedDomain, domaines.selectDomain]);
```

## Fonctionnalités détaillées

### 🏢 Gestion des entreprises

#### Sélection avec effets de bord

```typescript
const [selectedEntreprise, setSelectedEntreprise] = useState<number | null>(
  null
);

// Propagation vers CallDataContext
useEffect(() => {
  // Le CallDataProvider écoute selectedEntreprise
  // et déclenche fetchCalls automatiquement
}, [selectedEntreprise]);
```

#### Debug et surveillance

```typescript
useEffect(() => {
  console.log("🔍 AppContext - Filtered domains:", {
    selectedEntreprise,
    filteredDomainsCount: filteredDomains?.length,
    selectedDomain: domaines.selectedDomain,
    filteredDomains: filteredDomains?.map((d) => ({
      id: d.iddomaine,
      nom: d.nomdomaine,
    })),
  });
}, [selectedEntreprise, filteredDomains, domaines.selectedDomain]);
```

### 🌍 Système de domaines hybride

#### Domaines filtrés vs domaines globaux

```typescript
// Exposition des deux sources
domains: domaines.domains || [],           // Tous les domaines
filteredDomains: filteredDomains || [],    // Domaines filtrés par entreprise

// Sélection intelligente
selectedDomain: domaines.selectedDomain,   // Domaine actuellement sélectionné
selectDomain: domaines.selectDomain,       // Méthode de sélection
```

#### Synchronisation avec les sujets

```typescript
// Les sujets se mettent à jour automatiquement
sujetsData: domaines.sujetsData || [],
categoriesSujets: domaines.categoriesSujets || [],
```

### 🔔 Système de nudges avancé

#### Types de nudges supportés

```typescript
interface Nudge {
  id: number;
  title: string;
  message: string;
  practiceId?: number; // Nudge lié à une pratique
  activityId?: number; // Nudge lié à une activité
  scheduledDate?: Date; // Date de programmation
  completed: boolean; // État de réalisation
}

interface NudgeDates {
  [nudgeId: string]: {
    scheduledDate: Date;
    reminderDate?: Date;
  };
}
```

#### Gestion des états et mises à jour

```typescript
// États de synchronisation
nudgesUpdated: nudges.nudgesUpdated,
markNudgesAsUpdated: nudges.markNudgesAsUpdated,
resetNudgesUpdated: nudges.resetNudgesUpdated,

// Actualisation
refreshNudges: nudges.refreshNudges,
refreshNudgesFunction: nudges.refreshNudgesFunction,

// Gestion des dates
nudgeDates: nudges.nudgeDates,
updateNudgeDates: nudges.updateNudgeDates,
```

### 🎨 Interface utilisateur centralisée

#### Drawer intelligent

```typescript
// États du drawer
drawerOpen: ui.drawerOpen,
toggleDrawer: ui.toggleDrawer,
drawerContent: ui.drawerContent,
setDrawerContent: ui.setDrawerContent,

// Méthodes d'ouverture simplifiées
handleOpenDrawerWithContent: ui.handleOpenDrawerWithContent,
handleOpenDrawerWithData: ui.handleOpenDrawerWithData,
```

#### Patterns d'utilisation

```typescript
// Ouverture avec contenu React
handleOpenDrawerWithContent(<CustomComponent />);

// Ouverture avec données
handleOpenDrawerWithData({
  type: 'user-profile',
  userId: 123
});
```

## Provider et architecture

### RawAppProvider

```typescript
interface RawAppProviderProps {
  children: ReactNode;
  selectedEntreprise: number | null;
  setSelectedEntreprise: (id: number | null) => void;
}

export const RawAppProvider = ({
  children,
  selectedEntreprise,
  setSelectedEntreprise
}) => {
  // Orchestration de tous les hooks
  const activités = useActivities();
  const domaines = useDomains();
  const nudges = useNudges();
  const ui = useUI();
  const auth = useAuth();

  // Logique de filtrage des domaines intégrée
  const { data: filteredDomains } = useQuery(/* ... */);

  // États globaux
  const [idActivite, setIdActivite] = useState<number | null>(null);
  const [idPratique, setIdPratique] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  return (
    <AppContext.Provider value={{ /* toutes les valeurs */ }}>
      {children}
    </AppContext.Provider>
  );
};
```

### Hook d'utilisation

```typescript
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
```

## Intégration avec QueryClient

### Configuration React Query

```typescript
// Provider racine avec QueryClient
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RawAppProvider selectedEntreprise={entreprise} setSelectedEntreprise={setEntreprise}>
        <CallDataProvider selectedEntreprise={entreprise}>
          {/* Application */}
        </CallDataProvider>
      </RawAppProvider>
    </QueryClientProvider>
  );
}
```

### Requêtes optimisées

```typescript
// Cache intelligent pour domaines filtrés
const { data: filteredDomains } = useQuery({
  queryKey: ["filteredDomains", selectedEntreprise],
  queryFn: /* ... */,
  enabled: true,
  staleTime: 5 * 60 * 1000, // Cache 5 minutes
});
```

## Cas d'usage fréquents

### Sélection d'entreprise avec cascade

```typescript
function EnterpriseSelector() {
  const {
    entreprises,
    selectedEntreprise,
    setSelectedEntreprise,
    filteredDomains
  } = useAppContext();

  const handleEnterpriseChange = (entrepriseId: number) => {
    setSelectedEntreprise(entrepriseId);
    // Les domaines se filtrent automatiquement
    // CallDataContext recharge les appels
    // Auto-sélection du premier domaine disponible
  };

  return (
    <select value={selectedEntreprise || ''} onChange={e => handleEnterpriseChange(+e.target.value)}>
      <option value="">Sélectionner une entreprise</option>
      {entreprises.map(entreprise => (
        <option key={entreprise.id} value={entreprise.id}>
          {entreprise.nom}
        </option>
      ))}
    </select>
  );
}
```

### Navigation par domaines filtrés

```typescript
function DomainNavigation() {
  const {
    filteredDomains,
    selectedDomain,
    selectDomain,
    sujetsData
  } = useAppContext();

  return (
    <div>
      <nav className="domain-tabs">
        {filteredDomains.map(domain => (
          <button
            key={domain.iddomaine}
            onClick={() => selectDomain(domain.iddomaine.toString())}
            className={selectedDomain === domain.iddomaine.toString() ? 'active' : ''}
          >
            {domain.nomdomaine}
          </button>
        ))}
      </nav>

      <div className="sujets-list">
        {sujetsData.map(sujet => (
          <div key={sujet.id}>{sujet.nom}</div>
        ))}
      </div>
    </div>
  );
}
```

### Gestion des nudges contextuels

```typescript
function NudgeManager() {
  const {
    nudges,
    fetchNudgesForPractice,
    fetchNudgesForActivity,
    updateNudgeDates,
    nudgesUpdated,
    markNudgesAsUpdated
  } = useAppContext();

  const loadNudgesForContext = async (practiceId?: number, activityId?: number) => {
    if (practiceId) {
      await fetchNudgesForPractice(practiceId);
    } else if (activityId) {
      await fetchNudgesForActivity(activityId);
    }
  };

  const scheduleNudge = (nudgeId: number, date: Date) => {
    updateNudgeDates({
      [nudgeId]: {
        scheduledDate: date,
        reminderDate: new Date(date.getTime() - 24 * 60 * 60 * 1000) // 24h avant
      }
    });
    markNudgesAsUpdated();
  };

  return (
    <div>
      {nudges.map(nudge => (
        <div key={nudge.id}>
          <h4>{nudge.title}</h4>
          <p>{nudge.message}</p>
          <button onClick={() => scheduleNudge(nudge.id, new Date())}>
            Programmer
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Interface drawer unifiée

```typescript
function DrawerInterface() {
  const {
    drawerOpen,
    toggleDrawer,
    handleOpenDrawerWithContent,
    handleOpenDrawerWithData
  } = useAppContext();

  const openUserProfile = () => {
    handleOpenDrawerWithContent(<UserProfileComponent />);
  };

  const openSettings = () => {
    handleOpenDrawerWithData({
      type: 'settings',
      currentSettings: userPreferences
    });
  };

  return (
    <div>
      <button onClick={openUserProfile}>Profil</button>
      <button onClick={openSettings}>Paramètres</button>
      <button onClick={toggleDrawer}>
        {drawerOpen ? 'Fermer' : 'Ouvrir'} Drawer
      </button>
    </div>
  );
}
```

## Gestion des états et synchronisation

### États globaux partagés

```typescript
// États centralisés
const [idActivite, setIdActivite] = useState<number | null>(null);
const [idPratique, setIdPratique] = useState<number | null>(null);
const [refreshKey, setRefreshKey] = useState<number>(0);

// Usage pour forcer des re-renders
const forceRefresh = () => {
  setRefreshKey((prev) => prev + 1);
};
```

### Synchronisation avec CallDataContext

```typescript
// Récupération des données de l'appel sélectionné
const { idCallActivite, selectedCall } = useCallData();
const selectedCallId = selectedCall?.callid ?? null;

// Intégration dans useSelection
const selection = useSelection(null, selectedCallId, idCallActivite);

// Propagation dans le contexte
return (
  <AppContext.Provider value={{
    // ... autres valeurs
    ...selection, // Spread des propriétés de sélection
  }}>
```

## Optimisations et performance

### Mémorisation des données filtrées

```typescript
// Les domaines filtrés sont mémorisés via React Query
const { data: filteredDomains = [] } = useQuery({
  queryKey: ["filteredDomains", selectedEntreprise],
  queryFn: /* ... */,
  staleTime: 5 * 60 * 1000, // Cache 5 minutes
  cacheTime: 10 * 60 * 1000, // Garde en mémoire 10 minutes
});
```

### Synchronisation intelligente

```typescript
// Auto-sélection seulement si nécessaire
useEffect(() => {
  if (filteredDomains?.length > 0) {
    const isCurrentDomainValid =
      domaines.selectedDomain &&
      filteredDomains.some(
        (d) => d.iddomaine.toString() === domaines.selectedDomain
      );

    // Sélection automatique seulement si invalide
    if (!domaines.selectedDomain || !isCurrentDomainValid) {
      domaines.selectDomain(filteredDomains[0].iddomaine.toString());
    }
  }
}, [filteredDomains, domaines.selectedDomain]);
```

## Patterns d'architecture

### Composition avec autres contextes

```typescript
// Hierarchie des providers
function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AudioProvider>
        <RawAppProvider selectedEntreprise={entreprise}>
          <CallDataProvider selectedEntreprise={entreprise}>
            <TaggingDataProvider>
              {children}
            </TaggingDataProvider>
          </CallDataProvider>
        </RawAppProvider>
      </AudioProvider>
    </QueryClientProvider>
  );
}
```

### Délégation aux hooks spécialisés

```typescript
// Pattern de délégation pure
const nudges = useNudges();

// Exposition directe dans le contexte
nudges: nudges.nudges || [],
fetchNudgesForPractice: nudges.fetchNudgesForPractice,
fetchNudgesForActivity: nudges.fetchNudgesForActivity,
// ... autres propriétés nudges
```

## Migration et évolution

### Migration setSelectedPostit

```typescript
// ❌ SUPPRIMÉ depuis AppContext (commenté dans le code)
// import { useFilteredDomains } from "@/hooks/AppContext/useFilteredDomains";

// ✅ Logique intégrée directement dans RawAppProvider
const { data: filteredDomains } = useQuery(/* logique de filtrage */);

// 🔄 MIGRATION : setSelectedPostit déplacé vers CallDataContext
// Plus besoin de gérer cet état dans AppContext
```

### Points d'extension

```typescript
// Nouveaux hooks facilement intégrables
const newFeature = useNewFeature();

// Extension du contexte
return (
  <AppContext.Provider value={{
    ...existingValues,
    newFeatureData: newFeature.data,
    newFeatureActions: newFeature.actions,
  }}>
```

## Debugging et monitoring

### Logs de debug intégrés

```typescript
// Debug automatique des changements de domaines
useEffect(() => {
  console.log("🔍 AppContext - Filtered domains:", {
    selectedEntreprise,
    filteredDomainsCount: filteredDomains?.length,
    selectedDomain: domaines.selectedDomain,
    filteredDomains: filteredDomains?.map((d) => ({
      id: d.iddomaine,
      nom: d.nomdomaine,
    })),
  });
}, [selectedEntreprise, filteredDomains, domaines.selectedDomain]);
```

### États de chargement consolidés

```typescript
// Entreprises
isLoadingEntreprises: isLoading,
errorEntreprises: error,

// Domaines et sujets
isLoadingDomains: domaines.isLoadingDomains,
isLoadingSujets: domaines.isLoadingSujets,
isLoadingCategoriesSujets: domaines.isLoadingCategoriesSujets,

// Pratiques
isLoadingPratiques: activités.isLoadingPratiques,

// Authentification
isLoading: auth.isLoading,
```

## Bonnes pratiques d'utilisation

### ✅ Do

- **Utiliser selectedEntreprise** comme source de vérité pour le filtrage
- **Laisser l'auto-sélection** gérer les domaines valides
- **Exploiter filteredDomains** plutôt que domains pour l'UI entreprise
- **Utiliser les hooks spécialisés** pour des besoins spécifiques
- **Propager les états** via les props du RawAppProvider

### ❌ Don't

- **Modifier directement** selectedDomain sans passer par selectDomain
- **Ignorer les états de chargement** lors de l'affichage
- **Court-circuiter** la logique de filtrage des domaines
- **Dupliquer la logique** déjà présente dans les hooks
- **Oublier les dépendances** dans les useEffect

## Types et interfaces principales

### Entreprise

```typescript
interface Entreprise {
  id: number;
  nom: string;
  description?: string;
  domainesAssocies: number[]; // IDs des domaines liés
}
```

### Domaine

```typescript
interface Domaine {
  iddomaine: number;
  nomdomaine: string;
  description: string;
}
```

### Nudge complet

```typescript
interface Nudge {
  id: number;
  title: string;
  message: string;
  type: "practice" | "activity" | "general";
  practiceId?: number;
  activityId?: number;
  priority: "low" | "medium" | "high";
  scheduledDate?: Date;
  completedDate?: Date;
  completed: boolean;
}

interface NudgeDates {
  [nudgeId: string]: {
    scheduledDate: Date;
    reminderDate?: Date;
    completedDate?: Date;
  };
}
```

## Architecture future

### Évolutions prévues

- **Multi-tenancy** : Support de plusieurs entreprises simultanées
- **Permissions granulaires** : Droits par domaine/pratique
- **Cache avancé** : Invalidation sélective des caches
- **Offline support** : Synchronisation différée
- **Notifications push** : Intégration avec système de nudges

### Pattern d'extensibilité

```typescript
// Nouveau hook facilement intégrable
const useNewBusinessLogic = () => {
  // Logique métier spécialisée
  return { data, actions, states };
};

// Extension transparente du contexte
export const RawAppProvider = ({ children, ...props }) => {
  const existingHooks = { /* hooks actuels */ };
  const newLogic = useNewBusinessLogic();

  return (
    <AppContext.Provider value={{
      ...existingHooks,
      newLogicData: newLogic.data,
      newLogicActions: newLogic.actions,
      // Compatibilité ascendante préservée
    }}>
      {children}
    </AppContext.Provider>
  );
};
```

Le AppContext constitue la colonne vertébrale de l'application, orchestrant de manière cohérente et performante les données métier centralisées tout en préservant la flexibilité d'évolution et la séparation des responsabilités.
