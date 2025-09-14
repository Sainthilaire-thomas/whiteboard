# 📋 Documentation des Types TypeScript

> Générée automatiquement le 13/09/2025 15:57:42

## 📊 Statistiques

- **Total**: 437 définitions
- **Interfaces**: 327
- **Types**: 27
- **Énumérations**: 1
- **Classes**: 1
- **Fonctions**: 81

### 📁 Répartition par fichiers

| Fichier | Nombre de définitions |
|---------|----------------------|
| `types\types.ts` | 59 |
| `app\evaluation\components\Postit\types.tsx` | 38 |
| `app\evaluation\admin\types\admin.tsx` | 31 |
| `app\evaluation\evaluation.types.tsx` | 28 |
| `app\evaluation\components\FourZones\types\types.tsx` | 27 |
| `app\evaluation\components\SyntheseEvaluation\syntheseEvaluation.types.tsx` | 20 |
| `app\zohoworkdrive\types\index.ts` | 20 |
| `app\evaluation\components\EntrainementSuivi\types.tsx` | 19 |
| `app\components\navigation\ActivitySidebar\types\index.tsx` | 15 |
| `hooks\Postit\types.ts` | 12 |
| `types\evaluation.tsx` | 12 |
| `utils\SpeakerUtils.tsx` | 11 |
| `app\zohoworkdrive\components\Icons.tsx` | 10 |
| `app\evaluation\components\FourZones\components\ToolBar.types.ts` | 8 |
| `app\whiteboard\components\CoachingFourZone\types.ts` | 7 |
| `app\evaluation\components\FourZones\components\DynamicSpeechToTextForFourZones.types.ts` | 6 |
| `app\evaluation\components\FourZones\components\SuggestionSection.types.ts` | 6 |
| `app\evaluation\components\FourZones\utils\generateFinalText.tsx` | 4 |
| `app\evaluation\components\ShareEvaluationButton\types.ts` | 4 |
| `app\evaluation\components\UnifiedHeader\unifiedHeader.types.ts` | 4 |
| `app\zohoworkdrive\types\zoho.ts` | 4 |
| `app\api\ponderation-sujets\route.tsx` | 3 |
| `app\evaluation\components\FourZones\components\FinalReviewStep\types\editableText.tsx` | 3 |
| `app\whiteboard\hooks\types.ts` | 3 |
| `app\evaluation\components\FourZones\components\FinalReviewStep\hooks\useTTS.tsx` | 2 |
| `app\evaluation\components\TimeLineAudio.tsx` | 2 |
| `app\whiteboard\components\CoachingFourZone\WorkDriveUtils.tsx` | 2 |
| `hooks\CallDataContext\useAudio.types.ts` | 2 |
| `hooks\Postit\utils.tsx` | 2 |
| `hooks\usePonderationSujets.tsx` | 2 |
| `hooks\whiteboard\useConnectedAvatars.tsx` | 2 |
| `app\whiteboard\components\SharedEvaluation\SessionStatusBadge.tsx` | 2 |
| `app\components\navigation\ActivitySidebar\hooks\useActivityStats.tsx` | 1 |
| `app\evaluation\components\FourZones\components\FinalReviewStep\extensions\ConversationalAgent.tsx` | 1 |
| `app\evaluation\components\FourZones\components\FinalReviewStep\extensions\SmartTextSegmentation.tsx` | 1 |
| `app\evaluation\components\FourZones\components\FinalReviewStep\extensions\VoiceByRole.tsx` | 1 |
| `app\whiteboard\components\CoachingFourZone\AudioList.tsx` | 1 |
| `context\AudioContext.tsx` | 1 |
| `context\AudioProvider.tsx` | 1 |
| `types\context\AuthContext\AuthContextTypes.tsx` | 1 |
| `types\context\SupabaseContext\SupabaseTypes.tsx` | 1 |
| `types\context\ZohoContext\ZohoContextTypes.tsx` | 1 |
| `app\evaluation\components\SyntheseEvaluation\utils\filters.tsx` | 1 |
| `app\evaluation\admin\services\adminDataService.tsx` | 1 |
| `app\api\ai\improve\route.tsx` | 1 |
| `app\api\calls\create-from-zoho\route.tsx` | 1 |
| `app\api\evaluation-sharing\active-sessions\route.tsx` | 1 |
| `app\api\evaluation-sharing\check-session\route.tsx` | 1 |
| `app\api\evaluation-sharing\create-session\route.tsx` | 1 |
| `app\api\evaluation-sharing\stop-session\route.tsx` | 1 |
| `app\api\evaluation-sharing\update-controls\route.tsx` | 1 |
| `app\api\evaluation-sharing\update-mode\route.tsx` | 1 |
| `app\api\evaluation-sharing\update-position\route.tsx` | 1 |
| `app\api\getAudioUrl\route.tsx` | 1 |
| `app\api\send-training-email\route.tsx` | 1 |
| `app\api\transcription\get\route.tsx` | 1 |
| `app\api\tts\route.tsx` | 1 |
| `app\api\zoho\auth\route.tsx` | 1 |
| `app\api\zoho\callback\route.tsx` | 1 |
| `app\api\zoho\workdrive\route.tsx` | 1 |
| `app\components\common\Theme\ThemeProvider.tsx` | 1 |
| `app\evaluation\components\Postit\hooks\usePostit.tsx` | 1 |
| `app\evaluation\components\Postit\hooks\usePostitActions.tsx` | 1 |
| `app\evaluation\components\Postit\hooks\usePostitNavigation.tsx` | 1 |
| `app\evaluation\components\Postit\hooks\usePratiqueSelection.tsx` | 1 |
| `app\evaluation\components\Postit\hooks\useSujetSelection.tsx` | 1 |
| `app\whiteboard\components\SharedEvaluation\SessionSelector.tsx` | 1 |
| `app\whiteboard\components\SharedEvaluation\SharedEvaluationContent.tsx` | 1 |
| `app\whiteboard\components\SharedEvaluation\SharedEvaluationHeader.tsx` | 1 |
| `app\whiteboard\components\SharedEvaluation\SharedEvaluationViewer.tsx` | 1 |
| `app\whiteboard\components\SharedEvaluation\SynchronizedTranscript.tsx` | 1 |
| `app\whiteboard\hooks\useSharedEvaluation.tsx` | 1 |
| `app\whiteboard\hooks\useSpectatorTranscriptions.tsx` | 1 |
| `hooks\AppContext\useActivities.tsx` | 1 |
| `hooks\AppContext\useAuth.tsx` | 1 |
| `hooks\AppContext\useBandeauEvalData.tsx` | 1 |
| `hooks\AppContext\useEntreprises.tsx` | 1 |
| `hooks\AppContext\useFetchAllData.tsx` | 1 |
| `hooks\AppContext\useFilteredDomains.tsx` | 1 |
| `hooks\AppContext\useNudges.tsx` | 1 |
| `hooks\AppContext\useSelectedPratique.tsx` | 1 |
| `hooks\AppContext\useSelection.tsx` | 1 |
| `hooks\AppContext\useUI.tsx` | 1 |
| `hooks\CallDataContext\useAudio.tsx` | 1 |
| `hooks\CallDataContext\useCallActivity.tsx` | 1 |
| `hooks\CallDataContext\useCalls.tsx` | 1 |
| `hooks\CallDataContext\usePostits.tsx` | 1 |
| `hooks\CallDataContext\useQuiz.tsx` | 1 |
| `hooks\CallDataContext\useTranscriptions.tsx` | 1 |
| `hooks\CallDataContext\useZones.tsx` | 1 |
| `hooks\Postit\usePostit.tsx` | 1 |
| `hooks\Postit\usePostitActions.tsx` | 1 |
| `hooks\Postit\useStyles.tsx` | 1 |
| `hooks\useConseillers.tsx` | 1 |
| `hooks\useDomains.tsx` | 1 |
| `hooks\useHighlightedPractices.tsx` | 1 |
| `hooks\whiteboard\useCoach.tsx` | 1 |
| `hooks\whiteboard\useSession.tsx` | 1 |
| `middleware.tsx` | 1 |

---

## 🏗️ Interfaces (327)

### `ActiveSessionsResponse`

- **Fichier**: `app\whiteboard\hooks\types.ts:30`
- **Description**: *Aucune description*

```typescript
export interface ActiveSessionsResponse {
  success: boolean;
  sessions: SharedEvaluationSession[];
  count: number;
  error?: string;
}
```

### `Activite`

- **Fichier**: `app\whiteboard\components\CoachingFourZone\types.ts:46`
- **Description**: *Aucune description*

```typescript
export interface Activite {
  idactivite: number;
  idconseiller: number;
  dateactivite: string;
  statut: "ouvert" | "fermé" | "en_cours";
  nature: "évaluation" | "formation" | "coaching";
}
```

### `Activite`

- **Fichier**: `types\types.ts:173`
- **Description**: *Aucune description*

```typescript
export interface Activite {
  idactivite: number;
  nomactivite: string;
  pratiques: Pratique[];
}
```

### `Activity`

- **Fichier**: `types\types.ts:467`
- **Description**: *Aucune description*

```typescript
export interface Activity {
  id: number;
  name: string;
  description?: string;
}
```

### `ActivitySidebarProps`

- **Fichier**: `app\evaluation\evaluation.types.tsx:355`
- **Description**: Props pour ActivitySidebar - Interface pour résoudre l'erreur de type

```typescript
export interface ActivitySidebarProps {
  entreprises: Entreprise[];
  selectedEntreprise: number | null;
  setSelectedEntreprise: (id: number | null) => void;
  calls: Call[];
  selectCall: (call: Call) => void;
  selectedCall: Call | null;
}
```

### `ActivityStats`

- **Fichier**: `app\components\navigation\ActivitySidebar\hooks\useActivityStats.tsx:5`
- **Description**: *Aucune description*

```typescript
export interface ActivityStats {
  total: number;
  withIssues: number;
  completedEvaluations: number;
  activeRolePlays: number;
  pendingActions: number;
}
```

### `ActivityStats`

- **Fichier**: `app\components\navigation\ActivitySidebar\types\index.tsx:51`
- **Description**: *Aucune description*

```typescript
export interface ActivityStats {
  total: number;
  withIssues: number;
  completedEvaluations: number;
  activeRolePlays: number;
  pendingActions: number;
}
```

### `AdminActions`

- **Fichier**: `app\evaluation\admin\types\admin.tsx:183`
- **Description**: *Aucune description*

```typescript
export interface AdminActions {
  setSelectedEntreprise: (id: string) => void;
  setSelectedDomaineQualite: (id: string) => void;
  setSelectedSujet: (id: string) => void;
  setCurrentMode: (mode: AdminMode) => void;
  setCurrentSection: (section: AdminSection) => void;
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  setError: (error: string) => void;
  setSuccess: (success: string) => void;
}
```

### `AdminFormData`

- **Fichier**: `app\evaluation\admin\types\admin.tsx:195`
- **Description**: *Aucune description*

```typescript
export interface AdminFormData {
  entreprise: Entreprise | null;
  domaineQualite: DomaineQualite | null;
  sujets: Sujet[];
  ponderations: PonderationSujet[];
}
```

### `AdminNavigationProps`

- **Fichier**: `app\evaluation\admin\types\admin.tsx:277`
- **Description**: *Aucune description*

```typescript
export interface AdminNavigationProps {
  currentSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
  counters: AdminCounters;
}
```

### `AdminPonderationSectionProps`

- **Fichier**: `app\evaluation\admin\types\admin.tsx:229`
- **Description**: *Aucune description*

```typescript
export interface AdminPonderationSectionProps {
  sujets: Sujet[];
  ponderations: PonderationSujet[];
  categories: CategorieSujet[];
  domaineNom?: string;
  loading: boolean;
  saving: boolean;
  onPonderationChange: (
    idsujet: number,
    field: keyof PonderationSujet,
    value: number | boolean
  ) => void;
  onSave: () => void;
  onRefresh: () => void;
}
```

### `AdminSectionBaseProps`

- **Fichier**: `app\evaluation\admin\types\admin.tsx:245`
- **Description**: *Aucune description*

```typescript
export interface AdminSectionBaseProps {
  loading: boolean;
  saving: boolean;
  onError: (error: string) => void;
  onSuccess: (success: string) => void;
}
```

### `AdminSelectorsProps`

- **Fichier**: `app\evaluation\admin\types\admin.tsx:252`
- **Description**: *Aucune description*

```typescript
export interface AdminSelectorsProps {
  entreprises: Entreprise[];
  domaines: DomaineQualite[];
  sujets?: Sujet[];
  selectedEntreprise: string;
  selectedDomaine: string;
  selectedSujet?: string;
  loading: boolean;
  onEntrepriseChange: (id: string) => void;
  onDomaineChange: (id: string) => void;
  onSujetChange?: (id: string) => void;
  showSujetSelector?: boolean;
}
```

### `AdminState`

- **Fichier**: `app\evaluation\admin\types\admin.tsx:171`
- **Description**: *Aucune description*

```typescript
export interface AdminState {
  selectedEntreprise: string;
  selectedDomaineQualite: string;
  selectedSujet: string;
  currentMode: AdminMode;
  currentSection: AdminSection;
  loading: boolean;
  saving: boolean;
  error: string;
  success: string;
}
```

### `AdminTraducteurSectionProps`

- **Fichier**: `app\evaluation\admin\types\admin.tsx:204`
- **Description**: *Aucune description*

```typescript
export interface AdminTraducteurSectionProps {
  sujets: Sujet[];
  pratiques: Pratique[];
  sujetsPratiques: SujetPratique[];
  categoriesPratiques: CategoriePratique[];
  categoriesSujets: CategorieSujet[]; // Compatible directement avec le context
  selectedSujet?: string;
  loading: boolean;
  saving: boolean;
  onSujetChange: (sujetId: string) => void;
  onAddPratique: (
    idsujet: number,
    idpratique: number,
    importance: number
  ) => void;
  onUpdateImportance: (
    idsujet: number,
    idpratique: number,
    importance: number
  ) => void;
  onRemovePratique: (idsujet: number, idpratique: number) => void;
  onSave: () => void;
  onRefresh: () => void;
}
```

### `ApiError`

- **Fichier**: `app\zohoworkdrive\types\index.ts:22`
- **Description**: *Aucune description*

```typescript
export interface ApiError extends Error {
  message: string;
}
```

### `AppContextType`

- **Fichier**: `types\types.ts:567`
- **Description**: *Aucune description*

```typescript
export interface AppContextType {
  // Activités et Avis
  pratiques: Pratique[];
  isLoadingPratiques: boolean;
  fetchReviewsForPractice: (pratiqueId: number) => Promise<void>;
  reviews: Review[];
  averageRating: number;
  categoriesPratiques: CategoriePratique[];

  // Domaines et Sujets - ✅ CORRIGÉ pour correspondre à l'usage réel
  domains: Domaine[]; // Utilise Domaine (avec 'e') comme dans votre import
  filteredDomains: Domaine[]; // ✅ AJOUTÉ - nécessaire pour votre hook
  selectedDomain: string | null; // ✅ CORRIGÉ - c'est une string, pas un Domain
  selectDomain: (domainId: string) => void; // ✅ CORRIGÉ - prend une string
  sujetsData: SujetSimple[];
  categoriesSujets: CategorieSujet[];
  isLoadingDomains: boolean;
  isLoadingSujets: boolean;
  isLoadingCategoriesSujets: boolean;

  // Nudges
  nudges: Nudge[];
  setNudges: (value: SetStateAction<Nudge[]>) => void;
  fetchNudgesForPractice: (idpratique: number) => Promise<Nudge[]>; // ✅ CHANGE: Retourne Promise<Nudge[]>
  fetchNudgesForActivity: (idactivite: number) => Promise<void>;
  refreshNudgesFunction: () => void; // ✅ CHANGE: Retourne void, pas Promise<void>
  refreshNudges: () => void; // ✅ CHANGE: Function, pas boolean
  updateNudgeDates: (newDates: NudgeDates) => void; // ✅ CHANGE: Prend NudgeDates, pas (nudgeId, dates)
  nudgeDates: NudgeDates; // ✅ CHANGE: Type NudgeDates au lieu de Record<number, any>
  nudgesUpdated: boolean;
  markNudgesAsUpdated: () => void;
  resetNudgesUpdated: () => void;

  // UI et Navigation
  drawerOpen: boolean;
  toggleDrawer: () => void;
  drawerContent: any;
  setDrawerContent: (content: any) => void;
  handleOpenDrawerWithContent: (content: any) => void;
  handleOpenDrawerWithData: (pratiqueId: number, type: string) => void;

  // Entreprises
  entreprises: Entreprise[];
  isLoadingEntreprises: boolean;
  errorEntreprises: any;

  // États globaux
  idActivite: number | null;
  setIdActivite: (id: number | null) => void;
  idPratique: number | null;
  setIdPratique: (id: number | null) => void;
  selectedEntreprise: number | null;
  setSelectedEntreprise: (id: number | null) => void;
  refreshKey: number;
  setRefreshKey: (key: number) => void;

  // Sélections (via useSelection)
  selectedSujet: any;
  handleSelectSujet: (sujet: any) => void;
  sujetsForActivite: any[];
  fetchSujetsForActivite: (activityId: number) => Promise<void>;
  subjectPracticeRelations: any[];
  toggleSujet: (idActivite: number, item: Item) => Promise<void>; // ✅ FIXED: Updated to match actual implementation
  selectedPratique: any;
  handleSelectPratique: (pratique: any) => void;
  highlightedPractices: number[];
  calculateHighlightedPractices: (disabledSubjects: number[]) => void;
  resetSelectedState: () => void;
  avatarTexts: Record<string, string>;
  updateAvatarText: (index: number, text: string) => void;
  selectedPostitIds: number[];
  setSelectedPostitIds: (ids: number[]) => void;
  syncSujetsForActiviteFromMap: (
    postitToSujetMap: Record<number, number | null>,
    idActivite: number
  ) => Promise<void>;

  syncPratiquesForActiviteFromMap: (
    postitToPratiqueMap: Record<number, number | null>,
    idActivite: number,
    allPratiques: Pratique[]
  ) => Promise<void>;

  // Authentification
  user: any;
  isLoading: boolean;
}
```

### `AudioContextType`

- **Fichier**: `app\evaluation\components\FourZones\types\types.tsx:82`
- **Description**: Type pour le contexte audio

```typescript
export interface AudioContextType {
  audioSrc: string | null;
  play: () => void;
  pause: () => void;
  seekTo: (time: number) => void;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}
```

### `AudioContextType`

- **Fichier**: `context\AudioContext.tsx:13`
- **Description**: *Aucune description*

```typescript
export interface AudioContextType {
  audioSrc: string | null;
  setAudioSrc: (src: string | null) => void;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  currentWordIndex: number;
  volume: number;
  muted: boolean;
  setTime: (time: number) => void;
  toggleMute: () => void;

  // Méthodes de contrôle
  play: () => void;
  pause: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  playAudioAtTimestamp: (timestamp: number) => void;
  updateCurrentWordIndex: (words: Word[], time: number) => void;
  playSegment: (startTime: number, endTime: number) => void;
  executeWithLock: (operation: () => Promise<void> | void) => Promise<void>;

  // Référence à l'élément audio
  audioRef: React.RefObject<HTMLAudioElement | null>;
}
```

### `AudioContextType`

- **Fichier**: `context\AudioProvider.tsx:13`
- **Description**: *Aucune description*

```typescript
export interface AudioContextType {
  audioSrc: string | null;
  setAudioSrc: (src: string | null) => void;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  currentWordIndex: number;
  play: () => void;
  pause: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  playAudioAtTimestamp: (timestamp: number) => void;
  updateCurrentWordIndex: (words: Word[], time: number) => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}
```

### `AudioContextType`

- **Fichier**: `types\types.ts:260`
- **Description**: *Aucune description*

```typescript
export interface AudioContextType {
  audioSrc: string | null;
  setAudioSrc: (src: string | null) => void;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  currentWordIndex: number;
  play: () => void;
  pause: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  setTime?: (time: number) => void; // Gardé pour compatibilité
  seek?: (time: number) => void; // Gardé pour compatibilité
  playAudioAtTimestamp: (timestamp: number) => void;
  updateCurrentWordIndex: (words: Word[], time: number) => void;
  audioRef: React.RefObject<HTMLAudioElement>;
  playerRef?: React.RefObject<HTMLAudioElement>; // Gardé pour compatibilité
}
```

### `AudioListProps`

- **Fichier**: `app\whiteboard\components\CoachingFourZone\AudioList.tsx:17`
- **Description**: *Aucune description*

```typescript
export interface AudioListProps {
  onFileSelect: (file: FileNode, type: "audio" | "transcription") => void;
}
```

### `AuthContextType`

- **Fichier**: `types\context\AuthContext\AuthContextTypes.tsx:1`
- **Description**: *Aucune description*

```typescript
export interface AuthContextType {
  login: () => Promise<void>;
  handleAuth0Redirect: () => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}
```

### `AuthContextType`

- **Fichier**: `types\types.ts:516`
- **Description**: *Aucune description*

```typescript
export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}
```

### `AuthUser`

- **Fichier**: `types\types.ts:502`
- **Description**: *Aucune description*

```typescript
export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl?: string | null; // ✅ Accepte `null` et `undefined`
}
```

### `AvatarAnonyme`

- **Fichier**: `app\whiteboard\components\CoachingFourZone\types.ts:20`
- **Description**: *Aucune description*

```typescript
export interface AvatarAnonyme {
  idavatar: number;
  url?: string;
  nom: string;
}
```

### `AvatarAnonyme`

- **Fichier**: `types\types.ts:236`
- **Description**: *Aucune description*

```typescript
export interface AvatarAnonyme {
  idavatar: number;
  nom: string;
  url: string;
}
```

### `AvatarText`

- **Fichier**: `types\types.ts:483`
- **Description**: *Aucune description*

```typescript
export interface AvatarText {
  [id: number]: string;
}
```

### `Avis`

- **Fichier**: `types\types.ts:462`
- **Description**: *Aucune description*

```typescript
export interface Avis {
  avis: string;
  userlike: number; // Exemple : 1-5 étoiles
}
```

### `Call`

- **Fichier**: `app\evaluation\components\SyntheseEvaluation\syntheseEvaluation.types.tsx:277`
- **Description**: *Aucune description*

```typescript
export interface Call {
  callid: string;
  description: string;
  [key: string]: any;
}
```

### `Call`

- **Fichier**: `app\evaluation\evaluation.types.tsx:18`
- **Description**: *Aucune description*

```typescript
export interface Call {
  audiourl: string | null;
  callid: number;
  filename: string;
  description?: string;
  filepath?: string;
  callactivityrelation: CallActivityRelation[]; // ✅ Propriété requise ajoutée
}
```

### `Call`

- **Fichier**: `app\whiteboard\components\CoachingFourZone\types.ts:34`
- **Description**: *Aucune description*

```typescript
export interface Call {
  callid: number;
  audiourl?: string;
  filename?: string;
  filepath?: string;
  transcription?: string;
  description?: string;
  upload: boolean;
  // Ajoutez d'autres propriétés selon vos besoins
}
```

### `Call`

- **Fichier**: `app\zohoworkdrive\types\index.ts:6`
- **Description**: *Aucune description*

```typescript
export interface Call {
  callid: number;
  filename: string;
  description?: string;
  filepath?: string;
  audiourl?: string | null;
}
```

### `Call`

- **Fichier**: `types\evaluation.tsx:42`
- **Description**: *Aucune description*

```typescript
export interface Call {
  callid: string;
  description: string;
  [key: string]: any;
}
```

### `Call`

- **Fichier**: `types\types.ts:17`
- **Description**: *Aucune description*

```typescript
export interface Call {
  audiourl: null;
  callid: number;
  filename: string;
  description?: string;
  filepath?: string;
  callactivityrelation: CallActivityRelation[]; // ✅ Bien définir comme un tableau
}
```

### `CallActivityRelation`

- **Fichier**: `app\evaluation\evaluation.types.tsx:13`
- **Description**: Interface pour un appel - Compatible avec le système existant

```typescript
export interface CallActivityRelation {
  activityid: number;
  activitesconseillers: { nature: string }[];
}
```

### `CallActivityRelation`

- **Fichier**: `app\zohoworkdrive\types\index.ts:54`
- **Description**: *Aucune description*

```typescript
export interface CallActivityRelation {
  activityid: number;
  activitesconseillers: { nature: string }[];
}
```

### `CallActivityRelation`

- **Fichier**: `types\types.ts:12`
- **Description**: *Aucune description*

```typescript
export interface CallActivityRelation {
  activityid: number;
  activitesconseillers: { nature: string }[];
}
```

### `CallData`

- **Fichier**: `app\evaluation\components\FourZones\types\types.tsx:24`
- **Description**: Type représentant les données d'un appel

```typescript
export interface CallData {
  callid: string;
  date: string;
  title?: string;
  duration?: number;
  agent?: string;
  transcription?: string;
  // Autres propriétés d'un appel
}
```

### `CallDataContextType`

- **Fichier**: `app\evaluation\components\FourZones\types\types.tsx:66`
- **Description**: Type pour le contexte des données d'appel  CORRECTION: Ajout de setTranscriptSelectionMode

```typescript
export interface CallDataContextType {
  selectedCall: CallData | null;
  selectedPostitForRolePlay: SelectedPostitType | null;
  rolePlayData: ExtendedRolePlayData | null;
  saveRolePlayData: (
    data: ExtendedRolePlayData,
    postitId: string
  ) => Promise<any>;
  isLoadingRolePlay: boolean;
  // AJOUT: Propriété manquante pour setTranscriptSelectionMode
  setTranscriptSelectionMode: (mode: "client" | "conseiller" | null) => void;
}
```

### `CallDataContextType`

- **Fichier**: `app\zohoworkdrive\types\index.ts:38`
- **Description**: *Aucune description*

```typescript
export interface CallDataContextType {
  calls: Call[];
  fetchCalls: (entrepriseId: number) => Promise<void>;
  isLoadingCalls: boolean;
  selectCall: (call: Call) => void;
}
```

### `CallDataContextType`

- **Fichier**: `types\types.ts:334`
- **Description**: *Aucune description*

```typescript
export interface CallDataContextType {
  // 📞 Appels
  calls: Call[];
  fetchCalls: (entrepriseId: number) => Promise<void>;
  selectedCall: Call | null;
  selectCall: (call: Call) => void;
  setSelectedCall: (call: Call | null) => void;
  archiveCall: (callId: number) => Promise<void>;
  deleteCall: (callId: number) => Promise<void>;
  createAudioUrlWithToken: (filepath: string) => Promise<string | null>;
  isLoadingCalls: boolean;

  // 🗒️ Post-its
  allPostits: Postit[];
  appelPostits: Postit[];
  fetchAllPostits: () => Promise<void>;
  addPostit: (
    wordid: number,
    word: string,
    timestamp: number,
    additionalData?: Record<string, any>
  ) => Promise<number | null>;
  updatePostit: (
    id: number,
    updatedFields: Record<string, any>
  ) => Promise<void>;
  deletePostit: (postitId: number) => Promise<void>;

  // ✅ FIXED: Consistent string-based mapping
  postitToSujetMap: Record<string, string | null>;
  updatePostitToSujetMap: (postitId: string, sujetId: string | null) => void;
  postitToPratiqueMap: Record<string, string | null>;
  updatePostitToPratiqueMap: (
    postitId: string,
    pratiqueId: string | null
  ) => void;

  // 🟡 Postit sélectionné
  selectedPostit: Postit | null;
  setSelectedPostit: (postit: Postit | null) => void;

  // 📚 Transcription
  transcription: any;
  fetchTranscription: (callId: number) => Promise<void>;

  // 🧠 Zones
  zoneTexts: Record<string, string>;
  selectTextForZone: (zone: string, text: string) => void;

  // 🌍 Domaines
  // ✅ FIXED: Changed to string arrays to match the conversion
  domains: string[];
  domainNames: string[];
  fetchDomains: () => Promise<void>;

  // 🗣️ Word tracking
  currentWord: Word | null;
  updateCurrentWord: (word: Word | null) => void;

  // 🔄 Activité liée à l'appel
  idCallActivite: number | null;
  fetchActivitiesForCall: (callId: number) => Promise<void>;
  createActivityForCall: (
    callId: number,
    activityType: "evaluation" | "coaching",
    idConseiller: number
  ) => Promise<void>;
  removeActivityForCall: (callId: number) => Promise<void>;

  // ✅ FIXED: Synchronous return (using cached value)
  getActivityIdFromCallId: (callId: number) => number | null;

  // Sélections de texte
  transcriptSelectionMode: "client" | "conseiller" | null;
  setTranscriptSelectionMode: (mode: "client" | "conseiller" | null) => void;
  clientSelection: TextSelection | null;
  setClientSelection: (selection: TextSelection | null) => void;
  conseillerSelection: TextSelection | null;
  setConseillerSelection: (selection: TextSelection | null) => void;

  // 🎮 Jeu de rôle
  selectedPostitForRolePlay: Postit | null;
  setSelectedPostitForRolePlay: (postit: Postit | null) => void;
  rolePlayData: RolePlayData | null;

  // ✅ FIXED: Exact signature from your useRolePlay hook
  saveRolePlayData: (data: RolePlayData, postitId: number) => Promise<void>;

  // ✅ FIXED: No parameters (wrapper function)
  fetchRolePlayData: () => Promise<void>;

  // ✅ FIXED: No parameters (wrapper function)
  deleteRolePlayData: () => Promise<void>;

  getRolePlaysByCallId: (callId: number) => Promise<
    {
      id: number;
      postit_id: number;
      note: RolePlayData;
    }[]
  >;

  isLoadingRolePlay: boolean;

  // ✅ FIXED: Changed to string | null
  rolePlayError: string | null;
}
```

### `CallSelectorProps`

- **Fichier**: `types\types.ts:26`
- **Description**: *Aucune description*

```typescript
export interface CallSelectorProps {
  calls: Call[];
  selectCall: (call: Call) => void;
  selectedEntreprise: number | null;
}
```

### `CallWithRelations`

- **Fichier**: `app\zohoworkdrive\types\index.ts:60`
- **Description**: *Aucune description*

```typescript
export interface CallWithRelations extends Call {
  callactivityrelation?: CallActivityRelation[];
}
```

### `CategorieFormData`

- **Fichier**: `app\evaluation\admin\types\admin.tsx:103`
- **Description**: *Aucune description*

```typescript
export interface CategorieFormData {
  nomcategorie: string;
  description?: string;
  couleur: string;
  ordre?: number;
}
```

### `CategorieFormErrors`

- **Fichier**: `app\evaluation\admin\types\admin.tsx:111`
- **Description**: *Aucune description*

```typescript
export interface CategorieFormErrors {
  nomcategorie?: string;
  description?: string;
  couleur?: string;
  ordre?: string;
}
```

### `CategoriePratique`

- **Fichier**: `app\evaluation\admin\types\admin.tsx:150`
- **Description**: *Aucune description*

```typescript
export interface CategoriePratique {
  idcategoriepratique: number;
  nomcategorie: string;
  description?: string;
  couleur?: string;
  ordre?: number;
  actif?: boolean;
}
```

### `CategoriePratique`

- **Fichier**: `app\evaluation\components\SyntheseEvaluation\syntheseEvaluation.types.tsx:127`
- **Description**: *Aucune description*

```typescript
export interface CategoriePratique {
  idcategoriepratique: number;
  nomcategorie: string;
  couleur?: string;
  // Propriétés alternatives pour compatibilité
  id?: number;
  name?: string;
  [key: string]: any;
}
```

### `CategoriePratique`

- **Fichier**: `types\evaluation.tsx:35`
- **Description**: *Aucune description*

```typescript
export interface CategoriePratique {
  id: number;
  nomcategorie: string;
  couleur: string;
  [key: string]: any;
}
```

### `CategoriePratique`

- **Fichier**: `types\types.ts:138`
- **Description**: *Aucune description*

```typescript
export interface CategoriePratique extends Category {
  id: number; // ✅ Normalisation : on garde `id` et `name`
  name: string; // ✅ Normalisation
  couleur: string;
}
```

### `CategorieSujet`

- **Fichier**: `app\evaluation\admin\types\admin.tsx:6`
- **Description**: *Aucune description*

```typescript
export interface CategorieSujet {
  idcategoriesujet: number;
  nomcategorie: string;
  couleur: string;
  [key: string]: string | number; // Compatible avec la signature d'index du fichier types.tsx
}
```

### `CategorieSujet`

- **Fichier**: `app\evaluation\components\SyntheseEvaluation\syntheseEvaluation.types.tsx:120`
- **Description**: *Aucune description*

```typescript
export interface CategorieSujet {
  idcategoriesujet: number;
  nomcategorie: string;
  couleur?: string;
  [key: string]: any;
}
```

### `CategorieSujet`

- **Fichier**: `types\evaluation.tsx:21`
- **Description**: *Aucune description*

```typescript
export interface CategorieSujet {
  idcategoriesujet: number;
  nomcategorie: string;
  couleur: string;
  [key: string]: any;
}
```

### `CategorieSujet`

- **Fichier**: `types\types.ts:195`
- **Description**: *Aucune description*

```typescript
export interface CategorieSujet {
  idcategoriesujet: number;
  nomcategorie: string;
  couleur: string;
  [key: string]: string | number; // Ajout de la signature d'index pour rendre compatible avec Category
}
```

### `CategoriesujetExtended`

- **Fichier**: `app\evaluation\admin\types\admin.tsx:286`
- **Description**: *Aucune description*

```typescript
export interface CategoriesujetExtended {
  idcategoriesujet: number;
  nomcategorie: string;
  couleur: string;
  description?: string;
  ordre?: number;
  actif?: boolean;
  // Propriétés étendues spécifiques à l'admin
  sujets?: Sujet[];
  domaines?: DomaineQualite[];
  nombreDomaines?: number;
}
```

### `Category`

- **Fichier**: `app\evaluation\components\SyntheseEvaluation\syntheseEvaluation.types.tsx:70`
- **Description**: *Aucune description*

```typescript
export interface Category {
  id: number;
  nomcategorie: string;
  couleur?: string;
  [key: string]: any; // Permet toute propriété supplémentaire
}
```

### `Category`

- **Fichier**: `types\types.ts:134`
- **Description**: *Aucune description*

```typescript
export interface Category {
  [key: string]: string | number; // Clé dynamique
}
```

### `CategoryDialogProps`

- **Fichier**: `app\evaluation\components\FourZones\types\types.tsx:177`
- **Description**: Interface pour les propriétés de la boîte de dialogue de catégorie

```typescript
export interface CategoryDialogProps {
  open: boolean;
  text: string;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onClose: () => void;
  onSave: () => void;
}
```

### `CategoryPractice`

- **Fichier**: `app\evaluation\components\Postit\types.tsx:112`
- **Description**: Catégorie pour pratiques

```typescript
export interface CategoryPractice {
  idcategoriepratique: number;
  nomcategorie: string;
  couleur: string;
  isActive?: boolean;
  order?: number;
}
```

### `CategorySubject`

- **Fichier**: `app\evaluation\components\Postit\types.tsx:101`
- **Description**: Catégorie pour sujets

```typescript
export interface CategorySubject {
  idcategoriesujet: number;
  nomcategorie: string;
  couleur: string;
  isActive?: boolean;
  order?: number;
}
```

### `ClientResponseSectionProps`

- **Fichier**: `app\evaluation\components\FourZones\types\types.tsx:129`
- **Description**: Interface pour les propriétés de la section de réponse client

```typescript
export interface ClientResponseSectionProps {
  selectionMode: string;
  onSelectionModeChange: (mode: string) => void;
  selectedClientText: string;
  selectedConseillerText: string;
  fontSize: number;
  zoneColors: Record<string, string>;
  hasOriginalPostits: boolean;
  onCategorizeClick: (text: string) => void;
  setSelectedClientText: (text: string) => void;
  setSelectedConseillerText: (text: string) => void;
}
```

### `ColumnConfig`

- **Fichier**: `app\evaluation\components\Postit\types.tsx:125`
- **Description**: Configuration des colonnes pour l'affichage

```typescript
export interface ColumnConfig {
  field: string;
  headerName: string;
  width?: number;
  flex?: number;
  sortable?: boolean;
  filterable?: boolean;
  renderCell?: (params: any) => React.ReactNode;
}
```

### `ColumnConfig`

- **Fichier**: `types\types.ts:144`
- **Description**: *Aucune description*

```typescript
export interface ColumnConfig {
  categoryIdKey: string;
  categoryNameKey: string;
  itemIdKey: string;
  itemNameKey: string;
}
```

### `ConfirmDeleteState`

- **Fichier**: `app\zohoworkdrive\types\index.ts:15`
- **Description**: *Aucune description*

```typescript
export interface ConfirmDeleteState {
  open: boolean;
  callId: number | null;
  filePath: string | null;
}
```

### `ConnectedAvatar`

- **Fichier**: `hooks\whiteboard\useConnectedAvatars.tsx:6`
- **Description**: *Aucune description*

```typescript
export interface ConnectedAvatar {
  id: number;
  url: string;
}
```

### `Conseiller`

- **Fichier**: `app\whiteboard\components\CoachingFourZone\types.ts:12`
- **Description**: *Aucune description*

```typescript
export interface Conseiller {
  idconseiller: number;
  avatarUrl?: string;
  nom: string;
  estanonyme: boolean;
}
```

### `Conseiller`

- **Fichier**: `types\types.ts:226`
- **Description**: *Aucune description*

```typescript
export interface Conseiller {
  idconseiller: number;
  nom: string;
  prenom: string;
  email?: string;
  avatarUrl?: string;
  estanonyme: boolean; // ✅ Correction ici
}
```

### `ContexteStepProps`

- **Fichier**: `app\evaluation\components\Postit\types.tsx:197`
- **Description**: Props pour l'étape de contexte - CORRECTED

```typescript
export interface ContexteStepProps extends PostitBaseStepProps {
  setSelectedPostit: (postit: PostitExtended) => void;
  selectedDomain: string | null;
  filteredDomains: Domain[];
  selectDomain: (domainId: string) => void; // Made required since it's being used
  onDomainChange?: (domain: Domain | null) => void;
}
```

### `ContextPanel`

- **Fichier**: `app\evaluation\evaluation.types.tsx:165`
- **Description**: Configuration d'un panneau contextuel

```typescript
export interface ContextPanel {
  component: React.ReactNode;
  width: number | string;
}
```

### `ContextualHeaderProps`

- **Fichier**: `app\evaluation\components\UnifiedHeader\unifiedHeader.types.ts:53`
- **Description**: *Aucune description*

```typescript
export interface ContextualHeaderProps {
  displayMode: "normal" | "transcript-fullwidth" | "context-fullwidth";
  view: string | null;
  filteredDomains: any[];
  selectedDomain: string;
  contextPanels: Record<string, { width: number | string }>;
  onDomainChange: (event: any) => void;
  onSave: () => void;
  onSetContextFullWidth: () => void;
  onClosePanel: () => void;

  fontSize?: number;
  increaseFontSize?: () => void;
  decreaseFontSize?: () => void;
  speechToTextVisible?: boolean;
  toggleSpeechToText?: () => void;
  isLoadingRolePlay?: boolean;
  selectedPostitForRolePlay?: any;

  onNavigateToSynthese?: () => void;

  // ✅ Ajout des props manquantes
  selectedCall?: { callid: string; description: string } | null;
  evaluationStats?: EvaluationStats | null;
}
```

### `ConversationalSettings`

- **Fichier**: `app\evaluation\components\FourZones\components\FinalReviewStep\extensions\ConversationalAgent.tsx:17`
- **Description**: *Aucune description*

```typescript
export interface ConversationalSettings {
  enabled: boolean;
  style: "professional" | "empathetic" | "enthusiastic" | "calm" | "confident";
  adaptiveness: number; // 0-100
  contextAwareness: boolean;
  emotionalIntelligence: boolean;
  customInstructions?: string;
}
```

### `CritereQualiteTabProps`

- **Fichier**: `app\evaluation\components\SyntheseEvaluation\syntheseEvaluation.types.tsx:138`
- **Description**: *Aucune description*

```typescript
export interface CritereQualiteTabProps {
  selectedDomain?: any;
  categoriesSujets: any[]; // Accepte n'importe quel format
  sujetsData: any[]; // Accepte n'importe quel format
  categoriesPratiques: any[]; // Accepte n'importe quel format
  pratiques: any[]; // Accepte n'importe quel format
}
```

### `CritereQualiteTabProps`

- **Fichier**: `types\evaluation.tsx:82`
- **Description**: *Aucune description*

```typescript
export interface CritereQualiteTabProps {
  selectedDomain: number | null;
  categoriesSujets: CategorieSujet[];
  sujetsData: Sujet[];
  categoriesPratiques: CategoriePratique[];
  pratiques: Pratique[];
}
```

### `CustomNudges`

- **Fichier**: `app\evaluation\components\EntrainementSuivi\types.tsx:26`
- **Description**: *Aucune description*

```typescript
export interface CustomNudges {
  id?: number;
  id_activite?: number;
  id_pratique: number;
  custom_nudge1?: string;
  custom_nudge2?: string;
  custom_nudge3?: string;
  custom_nudge4?: string;
  custom_nudge5?: string;
  custom_nudge6?: string;
  custom_nudge1_date?: string;
  custom_nudge2_date?: string;
  custom_nudge3_date?: string;
  custom_nudge4_date?: string;
  custom_nudge5_date?: string;
  custom_nudge6_date?: string;
}
```

### `Domain`

- **Fichier**: `app\evaluation\components\Postit\types.tsx:62`
- **Description**: Domaine d'activité

```typescript
export interface Domain {
  iddomaine: number;
  nomdomaine: string;
  description?: string;
  color?: string;
  isActive?: boolean;
  order?: number;
}
```

### `Domain`

- **Fichier**: `app\evaluation\evaluation.types.tsx:60`
- **Description**: Interface pour un domaine

```typescript
export interface Domain {
  iddomaine: number;
  nomdomaine: string;
  description?: string;
  color?: string;
  isActive?: boolean;
  order?: number;
}
```

### `Domain`

- **Fichier**: `types\types.ts:186`
- **Description**: *Aucune description*

```typescript
export interface Domain {
  iddomaine: number;
  nomdomaine: string;
  description?: string;
  color?: string;
  isActive?: boolean;
  order?: number;
}
```

### `Domaine`

- **Fichier**: `app\evaluation\admin\types\admin.tsx:23`
- **Description**: *Aucune description*

```typescript
export interface Domaine {
  iddomaine: number;
  nomdomaine: string;
  description?: string;
  created_at?: string; // ✅ Ajout pour la compatibilité
}
```

### `Domaine`

- **Fichier**: `types\types.ts:180`
- **Description**: *Aucune description*

```typescript
export interface Domaine {
  iddomaine: number;
  nomdomaine: string;
}
```

### `DrawerContent`

- **Fichier**: `types\types.ts:443`
- **Description**: *Aucune description*

```typescript
export interface DrawerContent {
  type: string;
  conseiller?: any; // Peut être précisé en fonction des données réelles
  coach?: any;
  jeuDeRole?: {
    content: string;
    idpratique: number;
    nompratique: string;
    couleur: string;
  } | null;
  categoryColor?: string;
}
```

### `DroppableZoneProps`

- **Fichier**: `app\evaluation\components\FourZones\types\types.tsx:95`
- **Description**: Interface pour les propriétés de la zone de drop

```typescript
export interface DroppableZoneProps {
  id: string;
  title: string;
  backgroundColor: string;
  postits: PostitType[];
  fontSize: number;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onAddClick: (zone: string, content: string) => void;
  isEntrepriseZone?: boolean;
  improvementMode?: boolean;
  updatePostitContent?: (id: string, content: string) => void;
  // Nouvelles props pour TTS
  onPlayPostit?: (id: string, text: string) => void;
  onPlayZone?: (zoneId: string, text: string) => void;
  currentPlayingId?: string | null;
  isPlaying?: boolean;
}
```

### `DynamicImportOptions`

- **Fichier**: `app\evaluation\components\FourZones\components\DynamicSpeechToTextForFourZones.types.ts:50`
- **Description**: Options de configuration pour le chargement dynamique

```typescript
export interface DynamicImportOptions {
  ssr: boolean;
  loading: (props: { isContextual?: boolean }) => React.ReactElement;
}
```

### `DynamicSpeechToTextForFourZonesProps`

- **Fichier**: `app\evaluation\components\FourZones\components\DynamicSpeechToTextForFourZones.types.ts:20`
- **Description**: Interface pour les propriétés du composant de reconnaissance vocale dynamique

```typescript
export interface DynamicSpeechToTextForFourZonesProps {
  onAddPostits: (postits: PostitType[]) => void;
  isContextual?: boolean;
}
```

### `EditableComposition`

- **Fichier**: `app\evaluation\components\FourZones\components\FinalReviewStep\types\editableText.tsx:28`
- **Description**: *Aucune description*

```typescript
export interface EditableComposition {
  segments: EditableTextSegment[];
  flatSegments: EditableSubSegment[];
  fullText: string;
  hasChanges: boolean;
}
```

### `EditableComposition`

- **Fichier**: `app\evaluation\components\FourZones\utils\generateFinalText.tsx:725`
- **Description**: *Aucune description*

```typescript
export interface EditableComposition {
  segments: never[]; // Pas utilisé dans le modal
  flatSegments: EditableSubSegment[];
  fullText: string;
  hasChanges: boolean;
}
```

### `EditableSubSegment`

- **Fichier**: `app\evaluation\components\FourZones\components\FinalReviewStep\types\editableText.tsx:8`
- **Description**: *Aucune description*

```typescript
export interface EditableSubSegment {
  id: string;
  content: string;
  originalPostitId: string;
  sourceZone: string;
  zoneName: string;
  zoneColor: string;
  isMovable: boolean;
  order: number;
  originalPostit?: PostitType;
}
```

### `EditableSubSegment`

- **Fichier**: `app\evaluation\components\FourZones\utils\generateFinalText.tsx:714`
- **Description**: *Aucune description*

```typescript
export interface EditableSubSegment {
  id: string;
  content: string;
  originalPostitId: string;
  sourceZone: string;
  zoneName: string;
  zoneColor: string;
  isMovable: boolean;
  order: number;
}
```

### `EditableTextSegment`

- **Fichier**: `app\evaluation\components\FourZones\components\FinalReviewStep\types\editableText.tsx:20`
- **Description**: *Aucune description*

```typescript
export interface EditableTextSegment {
  id: string;
  zoneName: string;
  zoneColor: string;
  sourceZone: string;
  subSegments: EditableSubSegment[];
}
```

### `EditDialogProps`

- **Fichier**: `app\evaluation\components\FourZones\types\types.tsx:166`
- **Description**: *Aucune description*

```typescript
export interface EditDialogProps {
  open: boolean;
  content: string;
  onContentChange: (content: string) => void;
  onClose: () => void;
  onSave: () => void;
}
```

### `EditPostitDialogProps`

- **Fichier**: `app\evaluation\components\FourZones\types\types.tsx:158`
- **Description**: Interface pour les propriétés de la boîte de dialogue d'édition

```typescript
export interface EditPostitDialogProps {
  open: boolean;
  content: string;
  onContentChange: (content: string) => void;
  onClose: () => void;
  onSave: () => void;
}
```

### `EnterpriseCallsListProps`

- **Fichier**: `app\zohoworkdrive\types\index.ts:27`
- **Description**: *Aucune description*

```typescript
export interface EnterpriseCallsListProps {
  entrepriseId: number | null;
}
```

### `EntrainementSuiviProps`

- **Fichier**: `app\evaluation\components\EntrainementSuivi\types.tsx:123`
- **Description**: *Aucune description*

```typescript
export interface EntrainementSuiviProps {
  hideHeader?: boolean;
}
```

### `Entreprise`

- **Fichier**: `app\evaluation\admin\types\admin.tsx:35`
- **Description**: *Aucune description*

```typescript
export interface Entreprise {
  identreprise: number;
  nomentreprise: string;
  logo?: string;
  domaine?: string;
  created_at?: string;
}
```

### `Entreprise`

- **Fichier**: `app\evaluation\evaluation.types.tsx:82`
- **Description**: *Aucune description*

```typescript
export interface Entreprise {
  id: number;
  nom: string;
  identreprise: number;
  nomentreprise: string;
}
```

### `Entreprise`

- **Fichier**: `app\whiteboard\components\CoachingFourZone\types.ts:27`
- **Description**: *Aucune description*

```typescript
export interface Entreprise {
  identreprise: number;
  nom: string;
  // Ajoutez d'autres propriétés selon vos besoins
}
```

### `Entreprise`

- **Fichier**: `app\zohoworkdrive\types\index.ts:46`
- **Description**: *Aucune description*

```typescript
export interface Entreprise {
  id: number;
  nom: string;
  identreprise: number;
  nomentreprise: string;
}
```

### `Entreprise`

- **Fichier**: `types\types.ts:98`
- **Description**: *Aucune description*

```typescript
export interface Entreprise {
  id: number; // Ajouté pour compatibilité
  nom: string; // Ajouté pour compatibilité
  identreprise: number;
  nomentreprise: string;
}
```

### `EntrepriseCall`

- **Fichier**: `types\types.ts:7`
- **Description**: *Aucune description*

```typescript
export interface EntrepriseCall {
  id: number;
  nom: string;
}
```

### `EntrepriseDomaine`

- **Fichier**: `app\evaluation\admin\types\admin.tsx:127`
- **Description**: *Aucune description*

```typescript
export interface EntrepriseDomaine {
  identreprise: number;
  iddomaine: number;
}
```

### `EntrepriseFormData`

- **Fichier**: `app\evaluation\admin\types\admin.tsx:89`
- **Description**: *Aucune description*

```typescript
export interface EntrepriseFormData {
  nomentreprise: string;
  logo?: string;
  domaine?: string;
}
```

### `EntrepriseFormErrors`

- **Fichier**: `app\evaluation\admin\types\admin.tsx:96`
- **Description**: *Aucune description*

```typescript
export interface EntrepriseFormErrors {
  nomentreprise?: string;
  logo?: string;
  domaine?: string;
}
```

### `EntrepriseSelectEvent`

- **Fichier**: `app\zohoworkdrive\types\index.ts:130`
- **Description**: *Aucune description*

```typescript
export interface EntrepriseSelectEvent {
  target: {
    value: string | number;
  };
}
```

### `ErrorState`

- **Fichier**: `app\evaluation\components\Postit\types.tsx:404`
- **Description**: État d'erreur

```typescript
export interface ErrorState {
  hasError: boolean;
  error?: Error | string;
  errorCode?: string;
  retryable?: boolean;
}
```

### `EvaluationActions`

- **Fichier**: `app\evaluation\evaluation.types.tsx:291`
- **Description**: Actions disponibles pour la gestion de l'état Evaluation

```typescript
export interface EvaluationActions {
  setDisplayMode: (mode: DisplayMode) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleHighlightTurnOne: () => void;
  toggleHighlightSpeakers: () => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  toggleSpeechToText: () => void;
  setTranscriptFullWidth: () => void;
  setContextFullWidth: () => void;
  toggleRightPanel: () => void;
}
```

### `EvaluationCardProps`

- **Fichier**: `types\evaluation.tsx:98`
- **Description**: *Aucune description*

```typescript
export interface EvaluationCardProps {
  postit: Postit;
  sujetColor?: string;
  pratiqueColor?: string;
  onSimulate: (postit: Postit) => void;
}
```

### `EvaluationComponentProps`

- **Fichier**: `app\evaluation\evaluation.types.tsx:258`
- **Description**: Props étendues pour le composant Evaluation principal

```typescript
export interface EvaluationComponentProps extends EvaluationProps {
  // Ajout de props spécifiques si nécessaire
  initialView?: ContextView;
  defaultDisplayMode?: DisplayMode;
  enableAutoSave?: boolean;
  autoSaveInterval?: number;
}
```

### `EvaluationDrawerProps`

- **Fichier**: `types\types.ts:316`
- **Description**: *Aucune description*

```typescript
export interface EvaluationDrawerProps {
  isRightDrawerOpen: boolean;
  setIsRightDrawerOpen: (open: boolean) => void;
  darkMode: boolean;
  setDarkMode: (mode: boolean) => void;
}
```

### `EvaluationProps`

- **Fichier**: `app\evaluation\evaluation.types.tsx:92`
- **Description**: Props de base pour le composant Evaluation

```typescript
export interface EvaluationProps {
  darkMode: boolean;
  setDarkMode: (mode: boolean) => void;
}
```

### `EvaluationProps`

- **Fichier**: `types\types.ts:310`
- **Description**: *Aucune description*

```typescript
export interface EvaluationProps {
  darkMode: boolean;
  setDarkMode: (mode: boolean) => void;
}
```

### `EvaluationState`

- **Fichier**: `app\evaluation\evaluation.types.tsx:279`
- **Description**: État interne du composant Evaluation

```typescript
export interface EvaluationState {
  displayMode: DisplayMode;
  viewMode: ViewMode;
  highlightTurnOne: boolean;
  highlightSpeakers: boolean;
  fontSize: number;
  speechToTextVisible: boolean;
}
```

### `EvaluationStats`

- **Fichier**: `app\evaluation\components\UnifiedHeader\unifiedHeader.types.ts:3`
- **Description**: *Aucune description*

```typescript
export interface EvaluationStats {
  totalPostits: number;
  uniqueSujets: number;
  uniquePratiques: number;
}
```

### `EvaluationStats`

- **Fichier**: `app\evaluation\evaluation.types.tsx:179`
- **Description**: Statistiques d'évaluation calculées à partir des post-its  Compatible avec l'interface attendue par UnifiedHeader

```typescript
export interface EvaluationStats {
  totalPostits: number;
  uniqueSujets: number; // ✅ Propriété requise ajoutée
  uniquePratiques: number; // ✅ Propriété requise ajoutée
  postitsBySujet?: Record<string, number>; // Optionnel pour compatibilité étendue
  postitsByPratique?: Record<string, number>; // Optionnel pour compatibilité étendue
  averageRating?: number;
  completionRate?: number;
  lastUpdated?: string;
}
```

### `EvaluationTranscriptProps`

- **Fichier**: `app\evaluation\evaluation.types.tsx:241`
- **Description**: Props pour le composant EvaluationTranscript

```typescript
export interface EvaluationTranscriptProps {
  showRightPanel: boolean;
  toggleRightPanel: () => void;
  hasRightPanel: boolean;
  displayMode: DisplayMode;
  setTranscriptFullWidth: () => void;
  setContextFullWidth: () => void;
  viewMode: ViewMode;
  hideHeader: boolean;
  highlightTurnOne: boolean;
  highlightSpeakers: boolean;
  transcriptSelectionMode?: "client" | "conseiller" | null; // Optionnel pour gérer null
}
```

### `Exercice`

- **Fichier**: `app\evaluation\components\EntrainementSuivi\types.tsx:17`
- **Description**: *Aucune description*

```typescript
export interface Exercice {
  idexercice: number;
  idpratique: number;
  nomexercice: string;
  description: string;
  nudges?: any; // Rendre optionnel car peut être undefined
}
```

### `ExtendedRolePlayData`

- **Fichier**: `app\evaluation\components\FourZones\types\types.tsx:57`
- **Description**: Type étendu pour les données du jeu de rôle avec des informations supplémentaires

```typescript
export interface ExtendedRolePlayData extends RolePlayData {
  callId: string;
  date: string;
}
```

### `FetchAllDataResult`

- **Fichier**: `types\types.ts:525`
- **Description**: *Aucune description*

```typescript
export interface FetchAllDataResult {
  idpratique: number;
  fiche_conseiller_json: any;
  fiche_coach_json: any;
  pratiques: {
    nompratique: string;
    description: string;
    jeuderole?: string;
    idcategoriepratique: number;
  };
}
```

### `FicheCoachPratique`

- **Fichier**: `app\evaluation\components\EntrainementSuivi\types.tsx:87`
- **Description**: *Aucune description*

```typescript
export interface FicheCoachPratique {
  nompratique: string;
  fiche_coach_json: any; // Obligatoire pour FicheCoach
  geste?: string;
  categoryColor?: string;
}
```

### `FicheConseillerPratique`

- **Fichier**: `app\evaluation\components\EntrainementSuivi\types.tsx:94`
- **Description**: *Aucune description*

```typescript
export interface FicheConseillerPratique {
  nompratique: string;
  fiche_conseiller_json: any; // Obligatoire pour FicheConseiller
  categoryColor?: string;
}
```

### `FileNode`

- **Fichier**: `app\whiteboard\components\CoachingFourZone\types.ts:2`
- **Description**: *Aucune description*

```typescript
export interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder"; // ✅ Obligatoire
  mimeType?: string;
  size?: number;
  children?: FileNode[];
}
```

### `FileNode`

- **Fichier**: `app\whiteboard\components\CoachingFourZone\WorkDriveUtils.tsx:26`
- **Description**: *Aucune description*

```typescript
export interface FileNode {
  id: string;
  name: string;
  type: "files";
  mime_type: string;
  size: number;
  modified_time: string;
  download_link: string;
}
```

### `FinalReviewStepProps`

- **Fichier**: `app\evaluation\components\FourZones\types\types.tsx:235`
- **Description**: Interface pour les propriétés de l'étape finale

```typescript
export interface FinalReviewStepProps {
  mode: string;
}
```

### `FolderNode`

- **Fichier**: `app\whiteboard\components\CoachingFourZone\WorkDriveUtils.tsx:18`
- **Description**: *Aucune description*

```typescript
export interface FolderNode {
  id: string;
  name: string;
  type: "folders";
  is_folder: true;
  children: (FolderNode | FileNode)[];
}
```

### `FontControlProps`

- **Fichier**: `app\evaluation\components\FourZones\components\ToolBar.types.ts:47`
- **Description**: Interface pour les boutons de contrôle de police

```typescript
export interface FontControlProps {
  fontSize: number;
  onIncrease: () => void;
  onDecrease: () => void;
  disabled?: boolean;
}
```

### `FontSizeConfig`

- **Fichier**: `app\evaluation\evaluation.types.tsx:269`
- **Description**: Configuration pour la gestion des polices

```typescript
export interface FontSizeConfig {
  min: number;
  max: number;
  default: number;
  step: number;
}
```

### `FormState`

- **Fichier**: `app\evaluation\components\SyntheseEvaluation\syntheseEvaluation.types.tsx:291`
- **Description**: *Aucune description*

```typescript
export interface FormState {
  avancement_formation: boolean;
  avancement_lieu: boolean;
  avancement_date: boolean;
  avancement_financement: boolean;
  promotion_reseau: boolean;
  commentaire: string;
  action_client: string;
  [key: string]: any;
}
```

### `FormState`

- **Fichier**: `types\evaluation.tsx:48`
- **Description**: *Aucune description*

```typescript
export interface FormState {
  avancement_formation: boolean;
  avancement_lieu: boolean;
  avancement_date: boolean;
  avancement_financement: boolean;
  promotion_reseau: boolean;
  commentaire: string;
  action_client: string;
  [key: string]: any;
}
```

### `GridColumnConfig`

- **Fichier**: `app\evaluation\components\SyntheseEvaluation\syntheseEvaluation.types.tsx:146`
- **Description**: *Aucune description*

```typescript
export interface GridColumnConfig {
  categoryIdKey: string;
  categoryNameKey: string;
  itemIdKey: string;
  itemNameKey: string;
}
```

### `GrilleAvecEntreprises`

- **Fichier**: `app\evaluation\admin\types\admin.tsx:44`
- **Description**: *Aucune description*

```typescript
export interface GrilleAvecEntreprises {
  iddomaine: number;
  nomdomaine: string;
  description?: string;
  created_at?: string; // ✅ Ajout de la propriété manquante
  entreprises?: Entreprise[];
  nombreEntreprises?: number;
}
```

### `GrilleQualiteFormData`

- **Fichier**: `app\evaluation\admin\types\admin.tsx:56`
- **Description**: *Aucune description*

```typescript
export interface GrilleQualiteFormData {
  nomdomaine: string;
  description: string;
}
```

### `GrilleQualiteFormErrors`

- **Fichier**: `app\evaluation\admin\types\admin.tsx:62`
- **Description**: *Aucune description*

```typescript
export interface GrilleQualiteFormErrors {
  nomdomaine?: string;
  description?: string;
}
```

### `GrilleQualiteFormProps`

- **Fichier**: `app\evaluation\admin\types\admin.tsx:68`
- **Description**: *Aucune description*

```typescript
export interface GrilleQualiteFormProps {
  grille?: DomaineQualite | null;
  mode: AdminMode;
  loading?: boolean;
  onSave: (data: Partial<DomaineQualite>) => void;
  onCancel: () => void;
}
```

### `GrilleTemplate`

- **Fichier**: `app\evaluation\admin\types\admin.tsx:77`
- **Description**: *Aucune description*

```typescript
export interface GrilleTemplate {
  nom: string;
  description: string;
  categories?: string[];
  sujets?: Array<{
    nom: string;
    description?: string;
    valeurnumérique: number;
  }>;
}
```

### `ImprovementSectionProps`

- **Fichier**: `app\evaluation\components\FourZones\types\types.tsx:145`
- **Description**: Interface pour les propriétés de la section d'amélioration

```typescript
export interface ImprovementSectionProps {
  selectedClientText: string;
  postits: PostitType[];
  onAddSuggestion: (zone: string, content: string) => void;
  onEditPostit: (id: string, newContent: string) => void;
  onDeletePostit: (id: string) => void;
  fontSize: number;
  zoneColors: Record<string, string>;
}
```

### `Item`

- **Fichier**: `app\evaluation\components\SyntheseEvaluation\syntheseEvaluation.types.tsx:78`
- **Description**: *Aucune description*

```typescript
export interface Item {
  idsujet: number;
  nomsujet: string;
  valeurnumérique: number;
  idpratique: number;
  nompratique: string;
  iddomaine: number;
  idcategoriesujet: number;
  idcategoriepratique: number;
  categoriespratiques: any; // Flexible
  [key: string]: any; // Permet toute propriété supplémentaire
}
```

### `Item`

- **Fichier**: `types\types.ts:152`
- **Description**: *Aucune description*

```typescript
export interface Item {
  idsujet: number;
  valeurnumérique: number;
  idpratique: number;
  nompratique: string;
  nomsujet: string; // Ajout des propriétés manquantes
  iddomaine: number; // Ajout des propriétés manquantes
  idcategoriesujet: number; // Ajout des propriétés manquantes
  idcategoriepratique: number;
  categoriespratiques: CategoriePratique;
  [key: string]: any; // Ajout d'une signature d'index
}
```

### `LoadingComponentProps`

- **Fichier**: `app\evaluation\components\FourZones\components\DynamicSpeechToTextForFourZones.types.ts:28`
- **Description**: Interface pour le composant de chargement

```typescript
export interface LoadingComponentProps {
  isContextual?: boolean;
}
```

### `LoadingComponentStyles`

- **Fichier**: `app\evaluation\components\FourZones\components\DynamicSpeechToTextForFourZones.types.ts:35`
- **Description**: Interface pour les styles du composant de chargement

```typescript
export interface LoadingComponentStyles {
  padding: string;
  border: string;
  borderRadius: string;
  margin: string;
  fontSize: string;
  backgroundColor: string;
  textAlign: "center" | "left" | "right";
  color: string;
  transition?: string;
}
```

### `LoadingState`

- **Fichier**: `app\evaluation\components\Postit\types.tsx:395`
- **Description**: État de chargement

```typescript
export interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
  progress?: number;
}
```

### `MotifAfpaForm`

- **Fichier**: `app\evaluation\components\SyntheseEvaluation\syntheseEvaluation.types.tsx:22`
- **Description**: *Aucune description*

```typescript
export interface MotifAfpaForm {
  avancement_formation: boolean;
  avancement_lieu: boolean;
  avancement_date: boolean;
  avancement_financement: boolean;
  promotion_reseau: boolean;
  commentaire: string;
  action_client: string;
}
```

### `MotifAfpaRecord`

- **Fichier**: `app\evaluation\components\SyntheseEvaluation\syntheseEvaluation.types.tsx:37`
- **Description**: *Aucune description*

```typescript
export interface MotifAfpaRecord extends MotifAfpaForm {
  callid: number;
  motifs: string | null;
}
```

### `MotifAfpaUpsert`

- **Fichier**: `app\evaluation\components\SyntheseEvaluation\syntheseEvaluation.types.tsx:32`
- **Description**: *Aucune description*

```typescript
export interface MotifAfpaUpsert extends MotifAfpaForm {
  callid: number;
  motifs: string | null;
}
```

### `NavigationBreadcrumbProps`

- **Fichier**: `app\components\navigation\ActivitySidebar\types\index.tsx:97`
- **Description**: *Aucune description*

```typescript
export interface NavigationBreadcrumbProps {
  quickNavItems: QuickNavItem[];
  onNavigate: (route: string) => void;
  isVisible: boolean;
}
```

### `NavigationConfig`

- **Fichier**: `app\evaluation\evaluation.types.tsx:345`
- **Description**: Configuration de navigation pour les vues

```typescript
export interface NavigationConfig {
  defaultView: ContextView;
  allowedTransitions: Record<ContextView, ContextView[]>;
  requiresSelectedCall: ContextView[];
  requiresSelectedPostit: ContextView[];
}
```

### `NavigationOptions`

- **Fichier**: `hooks\Postit\types.ts:92`
- **Description**: *Aucune description*

```typescript
export interface NavigationOptions {
  skipValidation?: boolean;
  forceNavigation?: boolean;
  updateHistory?: boolean;
}
```

### `NavigationStep`

- **Fichier**: `app\evaluation\components\Postit\types.tsx:150`
- **Description**: Configuration de navigation par étapes

```typescript
export interface NavigationStep {
  id: number;
  label: string;
  icon: string;
  description?: string;
  isOptional?: boolean;
  isCompleted?: boolean;
  isAccessible?: boolean;
  content?: React.ReactNode;
  additionalInfo?: string;
}
```

### `NotificationState`

- **Fichier**: `app\evaluation\components\FourZones\types\types.tsx:284`
- **Description**: Interface pour l'état et les fonctions retournées par le hook useNotifications  CORRECTION: Changement du type severity pour être compatible

```typescript
export interface NotificationState {
  snackbarOpen: boolean;
  snackbarMessage: string;
  snackbarSeverity: AlertColor;
  // CORRECTION: Changement du type de severity de string à AlertColor pour la compatibilité
  showNotification: (message: string, severity?: AlertColor) => void;
  handleSnackbarClose: () => void;
}
```

### `Nudge`

- **Fichier**: `types\types.ts:106`
- **Description**: *Aucune description*

```typescript
export interface Nudge {
  idnudge: number; // ✅ Correspond à id_nudge dans Supabase
  idactivite: number | null; // ✅ Correspond à id_activite
  idpratique: number | null; // ✅ Correspond à id_pratique
  contenu: string | null; // ✅ Fusionne tous les nudges
  datecreation: string; // ✅ Date de création du nudge
}
```

### `NudgeData`

- **Fichier**: `app\evaluation\components\EntrainementSuivi\types.tsx:108`
- **Description**: *Aucune description*

```typescript
export interface NudgeData {
  index: number;
  content: string; // Non-optional car filtré dans getCurrentNudges
}
```

### `NudgeData`

- **Fichier**: `app\evaluation\components\EntrainementSuivi\types.tsx:128`
- **Description**: *Aucune description*

```typescript
export interface NudgeData {
  index: number;
  content: string; // Non-optional car filtré dans getCurrentNudges
}
```

### `NudgeDates`

- **Fichier**: `types\types.ts:114`
- **Description**: *Aucune description*

```typescript
export interface NudgeDates {
  [key: number]: string; // Associe un ID de pratique à une date
}
```

### `Phase`

- **Fichier**: `app\components\navigation\ActivitySidebar\types\index.tsx:38`
- **Description**: *Aucune description*

```typescript
export interface Phase {
  key: PhaseKey;
  label: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  subSteps?: SubStep[];
  requiresCondition?: boolean;
  conditionKey?: string;
  adminOnly?: boolean;
}
```

### `PhaseItemProps`

- **Fichier**: `app\components\navigation\ActivitySidebar\types\index.tsx:71`
- **Description**: *Aucune description*

```typescript
export interface PhaseItemProps {
  phase: Phase;
  status: StepStatus;
  isOpen: boolean;
  isActive: boolean;
  isExpanded: boolean;
  onPhaseClick: () => void;
  onStatusToggle: () => void;
  onSubStepClick: (subStep: SubStep) => void;
  isActiveSubStep: (route?: string) => boolean;
}
```

### `PhaseStatusChipProps`

- **Fichier**: `app\components\navigation\ActivitySidebar\types\index.tsx:90`
- **Description**: *Aucune description*

```typescript
export interface PhaseStatusChipProps {
  status: StepStatus;
  onToggle: () => void;
  disabled?: boolean;
  size?: "small" | "medium";
}
```

### `PlanningNudge`

- **Fichier**: `app\evaluation\components\EntrainementSuivi\types.tsx:45`
- **Description**: *Aucune description*

```typescript
export interface PlanningNudge {
  nudgeNumber: number;
  content: string;
  startDate: Date;
  endDate: Date;
  dayRange: string;
}
```

### `PonderationSujet`

- **Fichier**: `app\api\ponderation-sujets\route.tsx:7`
- **Description**: *Aucune description*

```typescript
export interface PonderationSujet {
  id_ponderation: number;
  idsujet: number;
  conforme: number;
  partiellement_conforme: number;
  non_conforme: number;
  permet_partiellement_conforme: boolean;
}
```

### `PonderationSujet`

- **Fichier**: `app\evaluation\admin\types\admin.tsx:118`
- **Description**: *Aucune description*

```typescript
export interface PonderationSujet {
  id_ponderation?: number;
  idsujet: number;
  conforme: number;
  partiellement_conforme: number;
  non_conforme: number;
  permet_partiellement_conforme: boolean;
}
```

### `PonderationSujet`

- **Fichier**: `hooks\usePonderationSujets.tsx:7`
- **Description**: *Aucune description*

```typescript
export interface PonderationSujet {
  id_ponderation: number;
  idsujet: number;
  conforme: number;
  partiellement_conforme: number;
  non_conforme: number;
  permet_partiellement_conforme: boolean;
}
```

### `Postit`

- **Fichier**: `app\evaluation\components\Postit\types.tsx:10`
- **Description**: Type principal pour un Postit

```typescript
export interface Postit {
  id: number;
  callid: number;
  wordid: number;
  word: string;
  text: string;
  iddomaine: number | null;
  sujet: string;
  idsujet: number | null;
  pratique: string | null;
  idpratique?: number | null;
  timestamp: number;
  idactivite?: number | null;

  // Propriétés UI optionnelles
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  zIndex?: number;
  couleur?: string;

  // Propriétés de gestion optionnelles
  dateCreation?: Date | string;
  dateModification?: Date | string;
  createdBy?: string;
  isArchived?: boolean;
  priority?: "low" | "medium" | "high";
  tags?: string[];
}
```

### `Postit`

- **Fichier**: `app\evaluation\components\SyntheseEvaluation\syntheseEvaluation.types.tsx:5`
- **Description**: *Aucune description*

```typescript
export interface Postit {
  id: number;
  text: string;
  timestamp: number;
  sujet?: string;
  pratique?: string;
  idsujet?: number;
  idpratique?: number;
  // Propriétés manquantes ajoutées pour compatibilité
  callid: number;
  wordid: number;
  word: string;
  iddomaine: number;
  [key: string]: any; // Permet toute propriété supplémentaire
}
```

### `Postit`

- **Fichier**: `app\evaluation\evaluation.types.tsx:30`
- **Description**: Interface pour un post-it

```typescript
export interface Postit {
  id: number;
  callid: number;
  wordid: number;
  word: string;
  text: string;
  iddomaine: number | null;
  sujet: string;
  idsujet: number | null;
  pratique: string;
  idpratique?: number | null;
  timestamp: number;
  idactivite?: number | null;
}
```

### `Postit`

- **Fichier**: `types\evaluation.tsx:3`
- **Description**: *Aucune description*

```typescript
export interface Postit {
  id: string;
  timestamp?: number;
  text?: string;
  sujet?: string;
  idsujet?: number;
  pratique?: string;
  idpratique?: number;
  [key: string]: any; // Pour les propriétés additionnelles
}
```

### `Postit`

- **Fichier**: `types\types.ts:57`
- **Description**: *Aucune description*

```typescript
export interface Postit {
  id: number;
  callid: number;
  wordid: number;
  word: string;
  text: string;
  iddomaine: number | null;
  sujet: string; // ✅ Sujet en texte
  idsujet: number | null; // ✅ ID du sujet (ajouté)
  pratique: string;
  idpratique?: number | null;
  timestamp: number;
  idactivite?: number | null;
  initialStep?: number;
}
```

### `PostitActions`

- **Fichier**: `hooks\Postit\types.ts:44`
- **Description**: *Aucune description*

```typescript
export interface PostitActions {
  handleSave: () => Promise<void>;
  handleDelete: () => Promise<void>;
  handleClosePostit: () => void;
  handleNext: () => void;
  handleBack: () => void;
  navigateToStep: (step: number, skipAccessCheck?: boolean) => void;
}
```

### `PostitBaseStepProps`

- **Fichier**: `app\evaluation\components\Postit\types.tsx:186`
- **Description**: Props de base partagées par toutes les étapes

```typescript
export interface PostitBaseStepProps {
  selectedPostit: PostitExtended;
  theme?: Theme;
  stepBoxStyle?: React.CSSProperties;
  onUpdatePostit?: (updates: Partial<PostitExtended>) => void;
  readOnly?: boolean;
}
```

### `PostitColorConfig`

- **Fichier**: `app\evaluation\components\Postit\types.tsx:480`
- **Description**: Configuration des couleurs

```typescript
export interface PostitColorConfig {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
}
```

### `PostitComplete`

- **Fichier**: `app\evaluation\components\Postit\types.tsx:501`
- **Description**: Type helper pour un Postit avec pratique obligatoire (pour validation finale)

```typescript
export interface PostitComplete extends Omit<Postit, "pratique"> {
  pratique: string; // Pratique obligatoire pour un postit complet
}
```

### `PostitCompletionStatus`

- **Fichier**: `app\evaluation\components\Postit\types.tsx:361`
- **Description**: Statut de complétion

```typescript
export interface PostitCompletionStatus {
  hasValidSubject: boolean;
  hasValidPractice: boolean;
  hasValidContext: boolean;
  isComplete: boolean;
  completionPercentage: number;
  missingFields: string[];
}
```

### `PostitCompletionStatus`

- **Fichier**: `hooks\Postit\types.ts:16`
- **Description**: *Aucune description*

```typescript
export interface PostitCompletionStatus {
  hasValidSubject: boolean;
  hasValidPractice: boolean;
  isComplete: boolean;
  completionPercentage: number;
}
```

### `PostitCompletionStatus`

- **Fichier**: `hooks\Postit\utils.tsx:12`
- **Description**: *Aucune description*

```typescript
export interface PostitCompletionStatus {
  hasValidSubject: boolean;
  hasValidPractice: boolean;
  isComplete: boolean;
  completionPercentage: number;
}
```

### `PostitComponentProps`

- **Fichier**: `app\evaluation\components\Postit\types.tsx:171`
- **Description**: Props du composant principal Postit

```typescript
export interface PostitComponentProps {
  postit?: Postit;
  inline?: boolean;
  hideHeader?: boolean;
  onSave?: (postit: Postit) => void;
  onCancel?: () => void;
  onDelete?: (postitId: number) => void;
  readOnly?: boolean;
  className?: string;
  style?: React.CSSProperties;
}
```

### `PostitExtended`

- **Fichier**: `app\evaluation\components\Postit\types.tsx:44`
- **Description**: Version étendue avec propriétés pour la navigation/interface

```typescript
export interface PostitExtended extends Postit {
  initialStep?: number;
  currentStep?: number;
  isEditing?: boolean;
  hasUnsavedChanges?: boolean;
  validationErrors?: string[];

  // Données liées pour l'interface
  selectedDomain?: string | null;
  availableDomains?: Domain[];
  selectedCategories?: number[];
}
```

### `PostitHookContext`

- **Fichier**: `hooks\Postit\types.ts:34`
- **Description**: *Aucune description*

```typescript
export interface PostitHookContext {
  selectedPostit: PostitWithPracticeId | null;
  idCallActivite: number | null;
  showTabs: boolean;
  isCompleted: boolean;
  activeStep: number;
  steps: PostitStep[];
}
```

### `PostitNavigationConfig`

- **Fichier**: `app\evaluation\components\Postit\types.tsx:373`
- **Description**: Configuration de navigation

```typescript
export interface PostitNavigationConfig {
  activeStep: number;
  totalSteps: number;
  steps: NavigationStep[];
  canGoNext: boolean;
  canGoPrevious: boolean;
  isCompleted: boolean;
}
```

### `PostitNavigationOptions`

- **Fichier**: `app\evaluation\components\Postit\types.tsx:385`
- **Description**: Options de navigation

```typescript
export interface PostitNavigationOptions {
  skipValidation?: boolean;
  forceNavigation?: boolean;
  saveOnNavigate?: boolean;
  showConfirmDialog?: boolean;
}
```

### `PostitState`

- **Fichier**: `app\evaluation\components\Postit\types.tsx:414`
- **Description**: État complet du composant

```typescript
export interface PostitState {
  postit: PostitExtended;
  navigation: PostitNavigationConfig;
  validation: PostitValidationResult;
  completion: PostitCompletionStatus;
  loading: LoadingState;
  error: ErrorState;

  // Données de support
  domains: Domain[];
  subjects: Subject[];
  practices: Practice[];
  categoriesSubjects: CategorySubject[];
  categoriesPractices: CategoryPractice[];
}
```

### `PostitStatistics`

- **Fichier**: `app\evaluation\components\SyntheseEvaluation\syntheseEvaluation.types.tsx:49`
- **Description**: *Aucune description*

```typescript
export interface PostitStatistics {
  totalPostits: number;
  uniqueSujets: number;
  uniquePratiques: number;
}
```

### `PostitStep`

- **Fichier**: `hooks\Postit\types.ts:24`
- **Description**: *Aucune description*

```typescript
export interface PostitStep {
  id: number;
  label: string;
  icon: string;
  isAccessible: boolean;
  isCompleted: boolean;
  additionalInfo?: string | null;
}
```

### `PostitStyles`

- **Fichier**: `app\evaluation\components\Postit\types.tsx:460`
- **Description**: Configuration des styles

```typescript
export interface PostitStyles {
  theme: Theme;
  isMobile: boolean;
  styles: {
    modalBackground: React.CSSProperties;
    modalWrapper: React.CSSProperties;
    modalContainer: React.CSSProperties;
    stepBox: React.CSSProperties;
    stepper: React.CSSProperties;
    stepperMobile: React.CSSProperties;
    content: React.CSSProperties;
    header: React.CSSProperties;
    footer: React.CSSProperties;
  };
  stepBoxStyle: React.CSSProperties;
}
```

### `PostitType`

- **Fichier**: `app\evaluation\components\FourZones\components\DynamicSpeechToTextForFourZones.types.ts:9`
- **Description**: Type pour représenter un post-it dans le jeu de rôle

```typescript
export interface PostitType {
  id: string;
  content: string;
  zone: string;
  color: string;
  isOriginal: boolean;
}
```

### `PostitType`

- **Fichier**: `app\evaluation\components\FourZones\types\types.tsx:6`
- **Description**: Type pour représenter un post-it dans le jeu de rôle

```typescript
export interface PostitType {
  id: string;
  content: string;
  zone: string;
  color: string;
  isOriginal: boolean;
}
```

### `PostitValidationResult`

- **Fichier**: `app\evaluation\components\Postit\types.tsx:351`
- **Description**: Résultat de validation

```typescript
export interface PostitValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fieldErrors: Record<string, string[]>;
}
```

### `PostitValidationResult`

- **Fichier**: `hooks\Postit\types.ts:9`
- **Description**: *Aucune description*

```typescript
export interface PostitValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
```

### `PostitValidationResult`

- **Fichier**: `hooks\Postit\utils.tsx:6`
- **Description**: *Aucune description*

```typescript
export interface PostitValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
```

### `PostitWithPracticeId`

- **Fichier**: `hooks\Postit\types.ts:4`
- **Description**: *Aucune description*

```typescript
export interface PostitWithPracticeId extends Postit {
  idpratique?: number | null;
}
```

### `Practice`

- **Fichier**: `app\evaluation\components\Postit\types.tsx:87`
- **Description**: Pratique

```typescript
export interface Practice {
  idpratique: number;
  nompratique: string;
  description?: string;
  jeuderole?: string;
  idcategoriepratique: number;
  isActive?: boolean;
  order?: number;
  difficulty?: "beginner" | "intermediate" | "advanced";
}
```

### `Pratique`

- **Fichier**: `app\evaluation\admin\types\admin.tsx:134`
- **Description**: *Aucune description*

```typescript
export interface Pratique {
  idpratique: number;
  nompratique: string;
  description?: string;
  idcategoriepratique?: number;
  created_at?: string;
  valeurnumérique?: number; // ✅ Ajouté pour compatibilité
  geste?: string; // ✅ Ajouté pour compatibilité
}
```

### `Pratique`

- **Fichier**: `app\evaluation\components\EntrainementSuivi\types.tsx:2`
- **Description**: *Aucune description*

```typescript
export interface Pratique {
  idpratique: number;
  nompratique: string;
  description: string;
  valeurnumérique: number;
  idcategoriepratique: number;
  fiche_conseiller_json?: any;
  fiche_coach_json?: any;
  jeuderole?: any;
  geste?: string;
  // Propriétés enrichies par le hook
  categoryColor?: string;
  categoryName?: string;
}
```

### `Pratique`

- **Fichier**: `app\evaluation\components\SyntheseEvaluation\syntheseEvaluation.types.tsx:92`
- **Description**: *Aucune description*

```typescript
export interface Pratique {
  idpratique: number;
  nompratique: string;
  description?: string;
  jeuderole?: string;
  geste?: string; // Ajouté pour le conseil de pratique
  idcategoriepratique: number;
  valeurnumérique: number; // Obligatoire
  idsujet: number; // Obligatoire
  nomsujet: string; // Obligatoire
  iddomaine: number; // Obligatoire
  idcategoriesujet: number; // Obligatoire
  categoriespratiques: any; // Obligatoire
  [key: string]: any;
}
```

### `Pratique`

- **Fichier**: `types\evaluation.tsx:28`
- **Description**: *Aucune description*

```typescript
export interface Pratique {
  idpratique: number;
  nompratique: string;
  idcategoriepratique: number;
  [key: string]: any;
}
```

### `Pratique`

- **Fichier**: `types\types.ts:165`
- **Description**: *Aucune description*

```typescript
export interface Pratique extends Item {
  idpratique: number;
  nompratique: string;
  description?: string;
  jeuderole?: string;
  idcategoriepratique: number; // ✅ Vérifier qu'il est bien présent
}
```

### `PratiqueSelectionConfig`

- **Fichier**: `hooks\Postit\types.ts:62`
- **Description**: *Aucune description*

```typescript
export interface PratiqueSelectionConfig {
  pratiques: any[];
  categoriesPratiques: any[];
  pratiquesDeLActivite: number[];
  handlePratiqueClick: (practice: any) => any;
}
```

### `PratiqueStepProps`

- **Fichier**: `app\evaluation\components\Postit\types.tsx:223`
- **Description**: Props pour l'étape de sélection de pratique - CORRECTED

```typescript
export interface PratiqueStepProps extends PostitBaseStepProps {
  categoriesPratiques: CategoryPractice[];
  pratiques: Practice[];
  columnConfigPratiques: ColumnConfig[];
  pratiquesDeLActivite: number[];
  handlePratiqueClick: (practice: Practice) => void;
  selectedPracticeId?: number | null;
  onPracticeSelect?: (practice: Practice) => void;
  // Removed selectedDomain, onBack and onSave as they were causing errors
}
```

### `PratiqueWithCategory`

- **Fichier**: `types\types.ts:488`
- **Description**: *Aucune description*

```typescript
export interface PratiqueWithCategory {
  idpratique: number;
  nompratique: string;
  description?: string;
  jeuderole?: string;
  idcategoriepratique: number;
  categoriespratiques: {
    idcategoriepratique: number;
    nomcategorie: string;
    couleur: string;
  };
}
```

### `QuickNavItem`

- **Fichier**: `app\components\navigation\ActivitySidebar\types\index.tsx:60`
- **Description**: *Aucune description*

```typescript
export interface QuickNavItem {
  label: string;
  route: string;
  color: string;
  icon?: ReactElement;
}
```

### `Quiz`

- **Fichier**: `types\types.ts:243`
- **Description**: *Aucune description*

```typescript
export interface Quiz {
  quizid: number;
  question: string;
  answers: string[];
  correctAnswerIndex: number;
}
```

### `Quiz`

- **Fichier**: `types\types.ts:693`
- **Description**: *Aucune description*

```typescript
export interface Quiz {
  quizid: number;
  question: string;
  answers: string[];
  correctAnswerIndex: number;
}
```

### `RelationSujetPratique`

- **Fichier**: `types\types.ts:510`
- **Description**: *Aucune description*

```typescript
export interface RelationSujetPratique {
  idsujet: number;
  idpratique: number;
}
```

### `RemoveCallUploadResult`

- **Fichier**: `app\zohoworkdrive\types\index.ts:97`
- **Description**: *Aucune description*

```typescript
export interface RemoveCallUploadResult {
  success: boolean;
}
```

### `RenderStepContentParams`

- **Fichier**: `app\evaluation\components\FourZones\types\types.tsx:298`
- **Description**: AJOUT: Interface pour les paramètres de renderStepContent  Cette interface définit les propriétés attendues par la fonction renderStepContent  SIMPLIFIÉE pour éviter les erreurs TypeScript

```typescript
export interface RenderStepContentParams {
  activeStep: number;
  selectionMode: string;
  setSelectionMode: (mode: string) => void;
  selectedClientText: string;
  selectedConseillerText: string;
  fontSize: number;
  zoneColors: Record<string, string>;
  hasOriginalPostits: boolean;
  setSelectedClientText: (text: string) => void;
  setSelectedConseillerText: (text: string) => void;
  newPostitContent: string;
  setNewPostitContent: (content: string) => void;
  currentZone: string;
  setCurrentZone: (zone: string) => void;
  setTextToCategorizze: (text: string) => void;
  setShowCategoryDialog: (show: boolean) => void;
  audioSrc: string | null;
  seekTo: (time: number) => void;
  play: () => void;
  pause?: () => void;
  speechToTextVisible: boolean;
  toggleSpeechToText: () => void;
  addPostitsFromSpeech: (postits: PostitType[]) => void;
  showNotification: (message: string, severity?: string) => void;
  renderDropZones: (improvementMode?: boolean) => React.ReactNode; // React.ReactNode au lieu de JSX.Element
  addSelectedTextAsPostit: (zone: string) => void;
  mode: string;
  handleOpenZoneMenu?: (
    event: React.MouseEvent<HTMLElement>,
    zone: string
  ) => void;
  postits: PostitType[];
  setPostits: (postits: PostitType[]) => void;
  ttsStudioVisible?: boolean;
  toggleTTSStudio?: () => void;
}
```

### `ResourcesPanelProps`

- **Fichier**: `app\evaluation\components\EntrainementSuivi\types.tsx:101`
- **Description**: *Aucune description*

```typescript
export interface ResourcesPanelProps {
  pratique: Pratique | null; // Accepter null au lieu de undefined
  selectedView?: "coach" | "conseiller" | null;
  onViewChange?: (view: "coach" | "conseiller" | null) => void;
}
```

### `Review`

- **Fichier**: `types\types.ts:457`
- **Description**: *Aucune description*

```typescript
export interface Review {
  avis: string;
  userlike: number; // Valeur numérique (ex: 1-5 étoiles)
}
```

### `RolePlayData`

- **Fichier**: `app\evaluation\components\FourZones\types\types.tsx:48`
- **Description**: Type pour les données du jeu de rôle

```typescript
export interface RolePlayData {
  postits: PostitType[];
  clientText?: string;
  conseillerText?: string;
}
```

### `RolePlayData`

- **Fichier**: `types\types.ts:727`
- **Description**: *Aucune description*

```typescript
export interface RolePlayData {
  callId: number;
  postits: RolePlayPostit[];
  clientText?: string;
  date: string;
}
```

### `RolePlayDataRecord`

- **Fichier**: `types\types.ts:734`
- **Description**: *Aucune description*

```typescript
export interface RolePlayDataRecord {
  id: number;
  call_id: number;
  postit_id: number;
  note: RolePlayData;
  type: string;
  created_at: string;
}
```

### `RolePlayPostit`

- **Fichier**: `types\types.ts:719`
- **Description**: *Aucune description*

```typescript
export interface RolePlayPostit {
  id: string;
  content: string;
  zone: string;
  color: string;
}
```

### `RoleVoiceSettings`

- **Fichier**: `app\evaluation\components\FourZones\components\FinalReviewStep\extensions\VoiceByRole.tsx:14`
- **Description**: *Aucune description*

```typescript
export interface RoleVoiceSettings {
  client: {
    voice: TTSSettings["voice"];
    speed: number;
  };
  conseiller: {
    voice: TTSSettings["voice"];
    speed: number;
  };
  enabled: boolean;
}
```

### `SaveButtonProps`

- **Fichier**: `app\evaluation\components\FourZones\components\ToolBar.types.ts:57`
- **Description**: Interface pour le bouton de sauvegarde

```typescript
export interface SaveButtonProps {
  onSave: () => void;
  isLoading: boolean;
  disabled?: boolean;
  variant?: "contained" | "outlined" | "text";
}
```

### `SelectedPostitType`

- **Fichier**: `app\evaluation\components\FourZones\types\types.tsx:37`
- **Description**: Type représentant un post-it sélectionné pour le jeu de rôle

```typescript
export interface SelectedPostitType {
  id: string;
  text: string;
  pratique?: string;
  timestamp?: number;
  // Autres propriétés du post-it
}
```

### `SelectionConseillerData`

- **Fichier**: `app\whiteboard\components\CoachingFourZone\types.ts:55`
- **Description**: *Aucune description*

```typescript
export interface SelectionConseillerData {
  type: "conseiller" | "avatar";
  id: number;
}
```

### `SharedEvaluationSession`

- **Fichier**: `app\evaluation\components\ShareEvaluationButton\types.ts:4`
- **Description**: *Aucune description*

```typescript
export interface SharedEvaluationSession {
  id: string;
  coach_user_id: string;
  coach_name?: string; // Enrichi via API
  call_id: number;
  call_title?: string; // Enrichi via API
  session_name: string;
  audio_position: number;
  session_mode: "live" | "paused" | "ended";
  is_active: boolean;
  // Contrôles objectivité
  show_participant_tops: boolean;
  show_tops_realtime: boolean;
  anonymous_mode: boolean;
  created_at: string;
  updated_at: string;
}
```

### `SharedEvaluationSession`

- **Fichier**: `app\whiteboard\hooks\types.ts:2`
- **Description**: *Aucune description*

```typescript
export interface SharedEvaluationSession {
  id: string;
  coach_user_id: string;
  coach_name?: string; // Enrichi via API
  call_id: number;
  call_title?: string; // Enrichi via API
  session_name: string;
  audio_position: number;
  session_mode: "live" | "paused" | "ended";
  is_active: boolean;
  // Contrôles objectivité
  show_participant_tops: boolean;
  show_tops_realtime: boolean;
  anonymous_mode: boolean;
  created_at: string;
  updated_at: string;
}
```

### `ShareEvaluationButtonProps`

- **Fichier**: `app\evaluation\components\ShareEvaluationButton\types.ts:65`
- **Description**: *Aucune description*

```typescript
export interface ShareEvaluationButtonProps {
  callId: string | number | null | undefined;
  sx?: object;
}
```

### `ShareModalProps`

- **Fichier**: `app\evaluation\components\ShareEvaluationButton\types.ts:70`
- **Description**: *Aucune description*

```typescript
export interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (sessionName: string) => void;
  isLoading: boolean;
}
```

### `SignedUrlResult`

- **Fichier**: `app\zohoworkdrive\types\index.ts:119`
- **Description**: *Aucune description*

```typescript
export interface SignedUrlResult {
  signedUrl: string;
  error?: string;
}
```

### `SimulationCoachingTabProps`

- **Fichier**: `app\evaluation\components\SyntheseEvaluation\syntheseEvaluation.types.tsx:56`
- **Description**: *Aucune description*

```typescript
export interface SimulationCoachingTabProps {
  filteredPostits: Postit[];
  sujetsData: Sujet[];
  categoriesSujets: CategorieSujet[];
  pratiques: Pratique[];
  categoriesPratiques: CategoriePratique[];
  selectedSujet?: string;
  selectedPratique?: string;
  onClearSelection?: () => void;
}
```

### `SimulationCoachingTabProps`

- **Fichier**: `types\evaluation.tsx:90`
- **Description**: *Aucune description*

```typescript
export interface SimulationCoachingTabProps {
  filteredPostits: Postit[];
  sujetsData: Sujet[];
  categoriesSujets: CategorieSujet[];
  pratiques: Pratique[];
  categoriesPratiques: CategoriePratique[];
}
```

### `SortablePostitProps`

- **Fichier**: `app\evaluation\components\FourZones\types\types.tsx:14`
- **Description**: *Aucune description*

```typescript
export interface SortablePostitProps {
  postit: PostitType;
  fontSize: number;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  isOriginal?: boolean;
}
```

### `SpeakerParagraph`

- **Fichier**: `utils\SpeakerUtils.tsx:134`
- **Description**: Interface pour les paragraphes regroupés par locuteur

```typescript
export interface SpeakerParagraph {
  speakerType: SpeakerType;
  turn: string; // Valeur originale du champ turn
  words: Word[]; // Liste des mots dans ce paragraphe
  startTime: number; // Temps de début du premier mot
  endTime: number; // Temps de fin du dernier mot
  text: string; // Texte concaténé
  startWordIndex: number; // 🔧 AJOUT : Index du premier mot dans transcription.words
}
```

### `SpeechToTextForFourZonesProps`

- **Fichier**: `app\evaluation\components\FourZones\components\DynamicSpeechToTextForFourZones.types.ts:58`
- **Description**: Type pour les props du composant SpeechToTextForFourZones importé

```typescript
export interface SpeechToTextForFourZonesProps {
  onAddPostits: (postits: PostitType[]) => void;
  isContextual?: boolean;
}
```

### `SpeechToTextProps`

- **Fichier**: `app\evaluation\components\FourZones\types\types.tsx:189`
- **Description**: Interface pour les propriétés du composant de reconnaissance vocale

```typescript
export interface SpeechToTextProps {
  onAddPostits: (postits: PostitType[]) => void;
  isContextual?: boolean;
}
```

### `StatsData`

- **Fichier**: `app\evaluation\components\SyntheseEvaluation\syntheseEvaluation.types.tsx:283`
- **Description**: *Aucune description*

```typescript
export interface StatsData {
  totalPostits: number;
  uniqueSujets: number;
  uniquePratiques: number;
  sujetsDetails: Array<{ name: string; count: number }>;
  pratiquesDetails: Array<{ name: string; count: number }>;
}
```

### `StatsData`

- **Fichier**: `app\evaluation\evaluation.types.tsx:72`
- **Description**: Interface pour les statistiques retournées par getPostitStatistics

```typescript
export interface StatsData {
  totalPostits: number;
  uniqueSujets: number;
  uniquePratiques: number;
  postitsBySujet?: Record<string, number>;
  postitsByPratique?: Record<string, number>;
  averageRating?: number;
  completionRate?: number;
  [key: string]: any; // Pour flexibilité avec les autres propriétés
}
```

### `StatsData`

- **Fichier**: `types\evaluation.tsx:59`
- **Description**: *Aucune description*

```typescript
export interface StatsData {
  totalPostits: number;
  uniqueSujets: number;
  uniquePratiques: number;
  sujetsDetails: Array<{ name: string; count: number }>;
  pratiquesDetails: Array<{ name: string; count: number }>;
}
```

### `StatusBadgeProps`

- **Fichier**: `app\evaluation\components\Postit\types.tsx:237`
- **Description**: Props pour le composant StatusBadge

```typescript
export interface StatusBadgeProps {
  isCompleted: boolean;
  hasSubject: boolean;
  size?: "small" | "medium" | "large";
  showText?: boolean;
}
```

### `Step`

- **Fichier**: `app\evaluation\components\EntrainementSuivi\types.tsx:117`
- **Description**: *Aucune description*

```typescript
export interface Step {
  id: StepType;
  label: string;
  description: string;
}
```

### `Step`

- **Fichier**: `app\evaluation\components\Postit\types.tsx:138`
- **Description**: Configuration de navigation par étapes - interface Step manquante

```typescript
export interface Step {
  label: string;
  icon: string;
  content: React.ReactNode;
  completed: boolean;
  additionalInfo?: string | null;
  optional: boolean;
}
```

### `StepChanges`

- **Fichier**: `hooks\Postit\types.ts:70`
- **Description**: *Aucune description*

```typescript
export interface StepChanges {
  0: boolean; // Contexte
  1: boolean; // Sujet
  2: boolean; // Pratique
  3: boolean; // Synthèse
}
```

### `StepNavigationProps`

- **Fichier**: `app\evaluation\components\FourZones\types\types.tsx:223`
- **Description**: Interface pour les propriétés de la navigation entre étapes

```typescript
export interface StepNavigationProps {
  activeStep: number;
  stepsLength: number;
  handleBack: () => void;
  handleNext: () => void;
  canProceedToNextStep: boolean;
  mode: string;
}
```

### `StepNavigationProps`

- **Fichier**: `app\evaluation\components\Postit\types.tsx:247`
- **Description**: Props pour le composant StepNavigation

```typescript
export interface StepNavigationProps {
  steps: Array<{
    label: string;
    icon: string;
    isAccessible: boolean;
    isCompleted: boolean;
    additionalInfo?: string;
  }>;
  activeStep: number;
  isCompleted: boolean;
  hasRealSubject: boolean;
  navigateToStep: (stepIndex: number) => void;
  handleNext: () => void;
  handleBack: () => void;
  temporaryEditMode: boolean;
  onDelete: () => void;
}
```

### `StepNavigationState`

- **Fichier**: `app\evaluation\components\FourZones\types\types.tsx:272`
- **Description**: Interface pour l'état et les fonctions retournées par le hook useStepNavigation

```typescript
export interface StepNavigationState {
  activeStep: number;
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
  handleNext: () => void;
  handleBack: () => void;
  canProceedToNextStep: () => boolean;
}
```

### `StepperHeaderProps`

- **Fichier**: `app\evaluation\components\FourZones\types\types.tsx:211`
- **Description**: Interface pour les propriétés de l'en-tête des étapes  CORRECTION: Ajout des props manquantes

```typescript
export interface StepperHeaderProps {
  steps: string[];
  activeStep: number;
  mode: string;
  // AJOUT: Propriétés manquantes pour la navigation
  onStepClick: (stepIndex: number) => void;
  canNavigateToStep: (stepIndex: number) => boolean;
}
```

### `StepProps`

- **Fichier**: `hooks\Postit\types.ts:78`
- **Description**: *Aucune description*

```typescript
export interface StepProps {
  selectedPostit: PostitWithPracticeId;
  theme?: any;
  stepBoxStyle?: any;
}
```

### `Subject`

- **Fichier**: `app\evaluation\components\Postit\types.tsx:74`
- **Description**: Sujet

```typescript
export interface Subject {
  idsujet: number;
  nomsujet: string;
  description?: string;
  idcategoriesujet?: number;
  iddomaine: number;
  isActive?: boolean;
  order?: number;
}
```

### `SubStep`

- **Fichier**: `app\components\navigation\ActivitySidebar\types\index.tsx:26`
- **Description**: *Aucune description*

```typescript
export interface SubStep {
  label: string;
  route?: string;
  isBackAction?: boolean;
  badge?: number;
  disabled?: boolean;
  icon?: ReactElement;
  description?: string;
}
```

### `SubStepItemProps`

- **Fichier**: `app\components\navigation\ActivitySidebar\types\index.tsx:83`
- **Description**: *Aucune description*

```typescript
export interface SubStepItemProps {
  subStep: SubStep;
  isSelected: boolean;
  isAdminPhase?: boolean;
  onClick: () => void;
}
```

### `SuggestionFormState`

- **Fichier**: `app\evaluation\components\FourZones\components\SuggestionSection.types.ts:63`
- **Description**: Interface pour l'état du formulaire de suggestion

```typescript
export interface SuggestionFormState {
  content: string;
  selectedZone: string;
  isValid: boolean;
}
```

### `SuggestionSectionEvents`

- **Fichier**: `app\evaluation\components\FourZones\components\SuggestionSection.types.ts:45`
- **Description**: Interface pour les événements du composant

```typescript
export interface SuggestionSectionEvents {
  onNewPostitContentChange: (content: string) => void;
  onCurrentZoneChange: (zone: string) => void;
  onAddPostit: () => void;
}
```

### `SuggestionSectionProps`

- **Fichier**: `app\evaluation\components\FourZones\components\SuggestionSection.types.ts:9`
- **Description**: Interface pour les propriétés du composant SuggestionSection

```typescript
export interface SuggestionSectionProps {
  selectedClientText: string;
  newPostitContent: string;
  onNewPostitContentChange: (content: string) => void;
  currentZone: string;
  onCurrentZoneChange: (zone: string) => void;
  onAddPostit: () => void;
  fontSize: number;
  zoneColors: Record<string, string>;
}
```

### `SuggestionSectionStyles`

- **Fichier**: `app\evaluation\components\FourZones\components\SuggestionSection.types.ts:34`
- **Description**: Interface pour les styles du composant

```typescript
export interface SuggestionSectionStyles {
  container: React.CSSProperties;
  clientPaper: React.CSSProperties;
  inputContainer: React.CSSProperties;
  formControl: React.CSSProperties;
  radioButton: React.CSSProperties;
}
```

### `Sujet`

- **Fichier**: `app\evaluation\admin\types\admin.tsx:13`
- **Description**: *Aucune description*

```typescript
export interface Sujet {
  idsujet: number;
  iddomaine: number;
  nomsujet: string;
  description?: string;
  valeurnumérique: number;
  idcategoriesujet: number;
  created_at?: string;
}
```

### `Sujet`

- **Fichier**: `app\evaluation\components\SyntheseEvaluation\syntheseEvaluation.types.tsx:109`
- **Description**: *Aucune description*

```typescript
export interface Sujet {
  idsujet: number;
  nomsujet: string;
  idcategoriesujet: number;
  iddomaine: number;
  description?: string;
  valeurnumérique?: number;
  [key: string]: any;
}
```

### `Sujet`

- **Fichier**: `types\evaluation.tsx:14`
- **Description**: *Aucune description*

```typescript
export interface Sujet {
  idsujet: number;
  nomsujet: string;
  idcategoriesujet: number;
  [key: string]: any;
}
```

### `Sujet`

- **Fichier**: `types\types.ts:202`
- **Description**: *Aucune description*

```typescript
export interface Sujet extends Item {
  idsujet: number;
  nomsujet: string;
  iddomaine: number;
  description?: string;
  idcategoriesujet: number; // ✅ Vérifier qu'il est bien présent
  categoriesujet?: CategorieSujet;
}
```

### `SujetPratique`

- **Fichier**: `app\evaluation\admin\types\admin.tsx:144`
- **Description**: *Aucune description*

```typescript
export interface SujetPratique {
  idsujet: number;
  idpratique: number;
  importance: number;
}
```

### `SujetPratiqueRelation`

- **Fichier**: `types\types.ts:220`
- **Description**: *Aucune description*

```typescript
export interface SujetPratiqueRelation {
  idsujet: number;
  idpratique: number;
}
```

### `SujetSelectionConfig`

- **Fichier**: `hooks\Postit\types.ts:54`
- **Description**: *Aucune description*

```typescript
export interface SujetSelectionConfig {
  sujetsData: any[];
  categoriesSujets: any[];
  sujetsDeLActivite: number[];
  handleSujetClick: (item: any) => any;
}
```

### `SujetSimple`

- **Fichier**: `types\types.ts:212`
- **Description**: *Aucune description*

```typescript
export interface SujetSimple {
  idsujet: number;
  nomsujet: string;
  iddomaine: number;
  idcategoriesujet: number;
  description?: string;
}
```

### `SujetStepProps`

- **Fichier**: `app\evaluation\components\Postit\types.tsx:208`
- **Description**: Props pour l'étape de sélection de sujet - CORRECTED

```typescript
export interface SujetStepProps extends PostitBaseStepProps {
  selectedDomain?: string | null; // Made optional since it might not always be needed
  categoriesSujets: CategorySubject[];
  sujetsData: Subject[];
  columnConfigSujets: ColumnConfig[];
  sujetsDeLActivite: number[];
  handleSujetClick: (subject: Subject) => void;
  selectedSubjectId?: number | null;
  onSubjectSelect?: (subject: Subject) => void;
  // Removed onBack and onNext as they were causing errors
}
```

### `SummaryPanelProps`

- **Fichier**: `app\evaluation\components\Postit\types.tsx:268`
- **Description**: Props pour le composant SummaryPanel - CORRECTED

```typescript
export interface SummaryPanelProps extends PostitBaseStepProps {
  onEdit?: () => void;
  onClose?: () => void; // Added back as it might be needed
  // Removed duplicate theme and stepBoxStyle as they're in base props
}
```

### `SupabaseContextType`

- **Fichier**: `types\context\SupabaseContext\SupabaseTypes.tsx:3`
- **Description**: *Aucune description*

```typescript
export interface SupabaseContextType {
  supabase: SupabaseClient;
  isSupabaseReady: boolean;
  setIsSupabaseReady: (ready: boolean) => void;
  handleSupabaseLogout: (redirectTo?: string) => Promise<void>;
}
```

### `SupabaseStorageOptions`

- **Fichier**: `app\zohoworkdrive\types\index.ts:114`
- **Description**: *Aucune description*

```typescript
export interface SupabaseStorageOptions {
  expiration?: number;
  bucket?: string;
}
```

### `SyntheseEvaluationProps`

- **Fichier**: `app\evaluation\components\SyntheseEvaluation\syntheseEvaluation.types.tsx:45`
- **Description**: *Aucune description*

```typescript
export interface SyntheseEvaluationProps {
  hideHeader?: boolean;
}
```

### `SyntheseTabProps`

- **Fichier**: `app\evaluation\components\SyntheseEvaluation\syntheseEvaluation.types.tsx:302`
- **Description**: *Aucune description*

```typescript
export interface SyntheseTabProps {
  selectedCall: Call;
  stats: StatsData;
  selectedMotif: string | null;
  setSelectedMotif: (motif: string) => void;
  formState: FormState;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  setActiveTab: (tab: number) => void;
  setSelectedSujet: (sujet: string) => void;
  setSelectedPratique: (pratique: string) => void;
}
```

### `SyntheseTabProps`

- **Fichier**: `types\evaluation.tsx:68`
- **Description**: *Aucune description*

```typescript
export interface SyntheseTabProps {
  selectedCall: Call;
  stats: StatsData;
  selectedMotif: string | null;
  setSelectedMotif: (motif: string) => void;
  formState: FormState;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  setActiveTab: (tab: number) => void;
  setSelectedSujet: (sujet: string) => void;
  setSelectedPratique: (pratique: string) => void;
}
```

### `TabChangeEvent`

- **Fichier**: `app\zohoworkdrive\types\index.ts:125`
- **Description**: *Aucune description*

```typescript
export interface TabChangeEvent {
  event: React.SyntheticEvent;
  newValue: number;
}
```

### `TextSegment`

- **Fichier**: `app\evaluation\components\FourZones\components\FinalReviewStep\extensions\SmartTextSegmentation.tsx:26`
- **Description**: *Aucune description*

```typescript
export interface TextSegment {
  id: string;
  content: string;
  type: "sentence" | "paragraph" | "section" | "custom";
  isSelected: boolean;
  audioUrl?: string;
  isPlaying?: boolean;
  duration?: number;
}
```

### `TextSelection`

- **Fichier**: `types\types.ts:323`
- **Description**: *Aucune description*

```typescript
export interface TextSelection {
  text: string;
  startTime: number;
  endTime?: number;
  wordIndex: number;
  speaker: "client" | "conseiller";
}
```

### `ThemeConfig`

- **Fichier**: `app\evaluation\components\EntrainementSuivi\types.tsx:68`
- **Description**: *Aucune description*

```typescript
export interface ThemeConfig {
  name: string;
  startIcon: string;
  stepIcon: (index: number) => string;
  endIcon: string;
  pathStyle: "smooth" | "mountain" | "rails" | "road" | "orienteering";
  background: "none" | "mountains" | "rails" | "road" | "map";
  description: string;
}
```

### `TimeLineAudioProps`

- **Fichier**: `app\evaluation\components\TimeLineAudio.tsx:14`
- **Description**: *Aucune description*

```typescript
export interface TimeLineAudioProps {
  duration: number;
  currentTime: number;
  markers: TimelineMarker[];
  onSeek: (time: number) => void;
  onMarkerClick?: (id: number) => void;
}
```

### `TimeLineAudioProps`

- **Fichier**: `types\types.ts:681`
- **Description**: *Aucune description*

```typescript
export interface TimeLineAudioProps {
  duration: number; // Durée totale de l'audio en secondes
  currentTime: number; // Temps de lecture actuel en secondes
  markers: TimelineMarker[]; // Liste des marqueurs sur la timeline
  onSeek: (time: number) => void; // Fonction pour déplacer la lecture
  handlePostitClick: (
    event: React.MouseEvent<HTMLElement>,
    postit: Postit
  ) => void; // ✅ Ajouté
}
```

### `TimelineMarker`

- **Fichier**: `app\evaluation\components\TimeLineAudio.tsx:8`
- **Description**: *Aucune description*

```typescript
export interface TimelineMarker {
  id: number;
  time: number;
  label: string;
}
```

### `TimelineMarker`

- **Fichier**: `types\types.ts:674`
- **Description**: *Aucune description*

```typescript
export interface TimelineMarker {
  id: number;
  time: number; // En secondes
  label: string;
}
```

### `ToolBarConfig`

- **Fichier**: `app\evaluation\components\FourZones\components\ToolBar.types.ts:67`
- **Description**: Interface pour la configuration du composant ToolBar

```typescript
export interface ToolBarConfig {
  showFontControls: boolean;
  showSaveButton: boolean;
  enableDarkMode: boolean;
  minFontSize: number;
  maxFontSize: number;
}
```

### `ToolBarEvents`

- **Fichier**: `app\evaluation\components\FourZones\components\ToolBar.types.ts:33`
- **Description**: Interface pour les événements du composant ToolBar

```typescript
export interface ToolBarEvents {
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
  onSave: () => void;
}
```

### `ToolBarProps`

- **Fichier**: `app\evaluation\components\FourZones\components\ToolBar.types.ts:9`
- **Description**: Interface pour les propriétés du composant ToolBar

```typescript
export interface ToolBarProps {
  title: string;
  fontSize: number;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  onSave: () => void;
  isLoading: boolean;
  mode: "light" | "dark";
}
```

### `ToolBarProps`

- **Fichier**: `app\evaluation\components\FourZones\types\types.tsx:197`
- **Description**: Interface pour les propriétés de la barre d'outils

```typescript
export interface ToolBarProps {
  title: string;
  fontSize: number;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  onSave: () => void;
  isLoading: boolean;
  mode: string;
}
```

### `ToolBarState`

- **Fichier**: `app\evaluation\components\FourZones\components\ToolBar.types.ts:78`
- **Description**: Interface pour l'état interne du composant ToolBar

```typescript
export interface ToolBarState {
  isHovered: boolean;
  isFocused: boolean;
  lastSaveTime: Date | null;
}
```

### `ToolBarStyles`

- **Fichier**: `app\evaluation\components\FourZones\components\ToolBar.types.ts:22`
- **Description**: Interface pour les styles du composant ToolBar

```typescript
export interface ToolBarStyles {
  container: React.CSSProperties;
  titleSection: React.CSSProperties;
  actionSection: React.CSSProperties;
  fontButton: React.CSSProperties;
  saveButton: React.CSSProperties;
}
```

### `TrainingPathProps`

- **Fichier**: `app\evaluation\components\EntrainementSuivi\types.tsx:78`
- **Description**: *Aucune description*

```typescript
export interface TrainingPathProps {
  trainingPlan: TrainingPlan;
  categoryColor?: string;
  theme?: ThemeType;
  onThemeChange?: (theme: ThemeType) => void; // Signature correcte
  showThemeSelector?: boolean;
}
```

### `TrainingPlan`

- **Fichier**: `app\evaluation\components\EntrainementSuivi\types.tsx:53`
- **Description**: *Aucune description*

```typescript
export interface TrainingPlan {
  totalDuration: number; // en jours
  nudges: PlanningNudge[];
  startDate: Date;
}
```

### `Transcript`

- **Fichier**: `app\zohoworkdrive\types\index.ts:101`
- **Description**: *Aucune description*

```typescript
export interface Transcript {
  transcriptid: number;
}
```

### `Transcription`

- **Fichier**: `types\types.ts:42`
- **Description**: *Aucune description*

```typescript
export interface Transcription {
  callid: number;
  words: Word[];
  audioSrc?: string;
}
```

### `TranscriptionActionsProps`

- **Fichier**: `app\evaluation\components\UnifiedHeader\unifiedHeader.types.ts:79`
- **Description**: *Aucune description*

```typescript
export interface TranscriptionActionsProps {
  currentWord: any;
  selectedCall: { callid: string; description: string } | null;
  onAddPostit: () => void;
  onRefresh: () => void;
  size?: "small" | "medium"; // ✅ Ajouté ici
}
```

### `TTSCache`

- **Fichier**: `app\evaluation\components\FourZones\types\types.tsx:122`
- **Description**: *Aucune description*

```typescript
export interface TTSCache {
  [key: string]: string; // ID -> Audio URL blob
}
```

### `TTSSettings`

- **Fichier**: `app\evaluation\components\FourZones\components\FinalReviewStep\hooks\useTTS.tsx:5`
- **Description**: *Aucune description*

```typescript
export interface TTSSettings {
  voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
  speed: number;
  model: "tts-1" | "tts-1-hd" | "gpt-4o-audio"; // ✅ CORRECTION: nom de modèle valide
  textEnhancement?: "aucun" | "contextuel" | "emotionnel";
  tone?:
    | "professionnel"
    | "chaleureux"
    | "enthousiaste"
    | "calme"
    | "confiant"
    | "explication"
    | "empathique"
    | "resolution_probleme"
    | "instructions"
    | "urgence_controlee";
  autoDetectContext?: boolean;
}
```

### `TTSState`

- **Fichier**: `app\evaluation\components\FourZones\components\FinalReviewStep\hooks\useTTS.tsx:24`
- **Description**: *Aucune description*

```typescript
export interface TTSState {
  isLoading: boolean;
  isPlaying: boolean;
  error: string | null;
  progress: number;
}
```

### `TTSState`

- **Fichier**: `app\evaluation\components\FourZones\types\types.tsx:115`
- **Description**: *Aucune description*

```typescript
export interface TTSState {
  isPlaying: boolean;
  currentPlayingId: string | null;
  currentText: string;
  playingType: "postit" | "zone" | "global" | null;
}
```

### `UIContextType`

- **Fichier**: `types\types.ts:298`
- **Description**: *Aucune description*

```typescript
export interface UIContextType {
  drawerOpen: boolean;
  toggleDrawer: () => void;
  drawerContent: any;
  setDrawerContent: (content: any) => void;
  handleOpenDrawerWithContent?: (content: any) => void;
  handleOpenDrawerWithData?: (
    idPratique: number,
    initialType: string
  ) => Promise<void>; // ✅ Ajout
}
```

### `UnifiedHeaderProps`

- **Fichier**: `app\evaluation\components\UnifiedHeader\unifiedHeader.types.ts:9`
- **Description**: *Aucune description*

```typescript
export interface UnifiedHeaderProps {
  // Transcription props
  shouldShowTranscript: boolean;
  displayMode: "normal" | "transcript-fullwidth" | "context-fullwidth";
  selectedCall: { callid: string; description: string } | null;
  viewMode: "word" | "paragraph";
  currentWord: any;
  hasRightPanel: boolean;
  shouldShowContext: boolean;

  highlightTurnOne?: boolean;
  highlightSpeakers?: boolean;

  evaluationStats?: EvaluationStats | null;

  onToggleViewMode: () => void;
  onToggleHighlightTurnOne?: () => void;
  onToggleHighlightSpeakers?: () => void;
  onRefreshTranscription: () => void;
  onAddPostit: () => void;
  onSetTranscriptFullWidth: () => void;
  onToggleRightPanel: () => void;

  // Contextual
  view: string | null;
  filteredDomains: any[];
  selectedDomain: string;
  contextPanels: Record<string, { width: number | string }>;

  onDomainChange: (event: any) => void;
  onSave: () => void;
  onSetContextFullWidth: () => void;
  onClosePanel: () => void;
  onNavigateToSynthese?: () => void;

  fontSize?: number;
  increaseFontSize?: () => void;
  decreaseFontSize?: () => void;
  speechToTextVisible?: boolean;
  toggleSpeechToText?: () => void;
  isLoadingRolePlay?: boolean;
  selectedPostitForRolePlay?: any;
}
```

### `UnifiedHeaderProps`

- **Fichier**: `app\evaluation\evaluation.types.tsx:193`
- **Description**: Props pour le composant UnifiedHeader

```typescript
export interface UnifiedHeaderProps {
  // 📝 Transcription props
  shouldShowTranscript: boolean;
  displayMode: DisplayMode;
  selectedCall: Call | null;
  evaluationStats: EvaluationStats | null;
  viewMode: ViewMode;
  currentWord: Word | null;
  hasRightPanel: boolean;
  shouldShowContext: boolean;
  highlightTurnOne: boolean;
  highlightSpeakers: boolean;

  // 🎬 Actions transcription
  onToggleViewMode: () => void;
  onRefreshTranscription: () => void;
  onAddPostit: () => void;
  onSetTranscriptFullWidth: () => void;
  onToggleRightPanel: () => void;
  onToggleHighlightTurnOne: () => void;
  onToggleHighlightSpeakers: () => void;

  // 🗂️ Contextual props
  view: string | null;
  filteredDomains: Domain[];
  selectedDomain: string; // String plutôt que Domain pour compatibilité
  contextPanels: ContextPanelsMap;

  // 🎯 Actions contextuelles
  onDomainChange: (event: any) => void;
  onSave: () => void;
  onSetContextFullWidth: () => void;
  onClosePanel: () => void;
  onNavigateToSynthese: () => void;

  // 🎮 FourZones props
  fontSize: number;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  speechToTextVisible: boolean;
  toggleSpeechToText: () => void;
  isLoadingRolePlay: boolean;
  selectedPostitForRolePlay: Postit | null;
}
```

### `UseActivitiesResult`

- **Fichier**: `types\types.ts:473`
- **Description**: *Aucune description*

```typescript
export interface UseActivitiesResult {
  pratiques: Pratique[];
  isLoadingPratiques: boolean;
  fetchReviewsForPractice: (idpratique: number) => Promise<void>;
  reviews: Avis[];
  averageRating: number;
  categoriesPratiques: CategoriePratique[]; // ✅ on aligne avec ton usage
}
```

### `UseActivityStatsReturn`

- **Fichier**: `app\components\navigation\ActivitySidebar\types\index.tsx:126`
- **Description**: *Aucune description*

```typescript
export interface UseActivityStatsReturn {
  stats: ActivityStats;
  getBadgeCount: (
    type: "issues" | "pending" | "completed"
  ) => number | undefined;
  hasAvailableActions: (phase: "evaluation" | "coaching") => boolean;
  getProgressPercentage: () => number;
}
```

### `UseAppContextResult`

- **Fichier**: `app\evaluation\evaluation.types.tsx:124`
- **Description**: *Aucune description*

```typescript
export interface UseAppContextResult {
  resetSelectedState: () => void;
  entreprises: Entreprise[];
  isLoadingEntreprises: boolean;
  errorEntreprises: any;
  selectedEntreprise: number | null;
  setSelectedEntreprise: (id: number | null) => void;
  selectedDomain: Domain | string | null;
  selectDomain: (domain: string) => void;
}
```

### `UseAudioResult`

- **Fichier**: `app\evaluation\evaluation.types.tsx:119`
- **Description**: *Aucune description*

```typescript
export interface UseAudioResult {
  audioRef: RefObject<HTMLAudioElement>;
  setAudioSrc: (src: string | null) => void;
}
```

### `UseAudioResult`

- **Fichier**: `hooks\CallDataContext\useAudio.types.ts:16`
- **Description**: *Aucune description*

```typescript
export interface UseAudioResult {
  audioSrc: string | null;
  setAudioSrc: (src: string | null) => void;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  currentWordIndex: number;
  play: () => void;
  pause: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  setTime?: (time: number) => void;
  seek?: (time: number) => void;
  playAudioAtTimestamp: (timestamp: number) => void;
  updateCurrentWordIndex: (words: Word[], time: number) => void;
  // Types de refs compatibles avec useRef<HTMLAudioElement>(null)
  audioRef: RefObject<HTMLAudioElement | null>;
  playerRef?: RefObject<HTMLAudioElement | null>;
}
```

### `UseAuth0Result`

- **Fichier**: `app\evaluation\evaluation.types.tsx:100`
- **Description**: Interfaces pour les hooks/contextes utilisés par Evaluation

```typescript
export interface UseAuth0Result {
  user: any;
  isAuthenticated: boolean;
}
```

### `UseCallDataResult`

- **Fichier**: `app\evaluation\evaluation.types.tsx:105`
- **Description**: *Aucune description*

```typescript
export interface UseCallDataResult {
  selectedCall: Call | null;
  currentWord: Word | null;
  fetchTranscription: (callId: number) => Promise<void>;
  calls: Call[];
  selectCall: (call: Call) => void;
  selectedPostitForRolePlay: Postit | null;
  transcriptSelectionMode: "client" | "conseiller" | null;
  isLoadingRolePlay: boolean;
  selectedPostit: Postit | null;
  setSelectedPostit: (postit: Postit | null) => void;
  appelPostits: Postit[];
}
```

### `UseCallsResult`

- **Fichier**: `types\types.ts:279`
- **Description**: *Aucune description*

```typescript
export interface UseCallsResult {
  calls: Call[];
  fetchCalls: (identreprise: number) => Promise<void>;
  selectedCall: Call | null;
  setSelectedCall: (call: Call | null) => void; // ✅ Ajouté
  selectCall: (call: Call) => void; // ✅ On garde cette fonction !
  idCallActivite: number | null;
  createActivityForCall: (
    callId: number,
    activityType: "evaluation" | "coaching",
    idConseiller: number
  ) => Promise<void>;
  isLoadingCalls: boolean;
  isLoadingActivity: boolean;
  archiveCall: (callId: number) => Promise<void>;
  deleteCall: (callId: number) => Promise<void>;
  createAudioUrlWithToken: (filepath: string) => Promise<string | null>;
}
```

### `UseDomainsResult`

- **Fichier**: `types\types.ts:655`
- **Description**: *Aucune description*

```typescript
export interface UseDomainsResult {
  domains: Domaine[];
  isLoadingDomains: boolean;
  isErrorDomains: boolean;
  domainNames: Record<number, string>;
  fetchDomains: () => Promise<void>;

  sujets: SujetSimple[]; // ✅ FIX: Utiliser SujetSimple
  isLoadingSujets: boolean;
  categoriesSujets: CategorieSujet[];
  isLoadingCategoriesSujets: boolean;
  selectedDomain: string;
  filteredDomains?: Domaine[];
  setSelectedDomain: (domainId: string) => void;
  selectDomain: (domainId: string) => void; // Alias pour `setSelectedDomain`
  sujetsData: SujetSimple[]; // ✅ FIX: Utiliser SujetSimple
}
```

### `UseDragAndDropProps`

- **Fichier**: `app\evaluation\components\FourZones\types\types.tsx:251`
- **Description**: Interface pour les propriétés du hook useDragAndDrop

```typescript
export interface UseDragAndDropProps {
  postits: PostitType[];
  setPostits: React.Dispatch<React.SetStateAction<PostitType[]>>;
  zoneColors: Record<string, string>;
}
```

### `UseEvaluationSharingReturn`

- **Fichier**: `app\evaluation\components\ShareEvaluationButton\types.ts:22`
- **Description**: *Aucune description*

```typescript
export interface UseEvaluationSharingReturn {
  // État
  isSharing: boolean;
  isLoading: boolean;
  error: string | null;
  currentSession: SharedEvaluationSession | null;

  // Actions principales
  startSharing: (sessionName: string) => Promise<void>;
  stopSharing: () => Promise<void>;

  // Actions de contrôle existantes
  updateAudioPosition: (position: number) => Promise<void>;
  updateSessionMode: (mode: "live" | "paused" | "ended") => Promise<void>;
  updateObjectivityControls: (controls: {
    show_participant_tops?: boolean;
    show_tops_realtime?: boolean;
    anonymous_mode?: boolean;
  }) => Promise<void>;

  // Actions utilitaires
  clearError: () => void;
  checkActiveSessionsForCoach: () => Promise<void>;

  // ✅ NOUVEAU Phase 3 : Méthodes de synchronisation temps réel
  updateTranscriptPosition: (
    wordIndex: number,
    paragraphIndex: number
  ) => Promise<void>;
  updateViewMode: (mode: "word" | "paragraph") => Promise<void>;
  updateHighlighting: (
    highlightTurnOne: boolean,
    highlightSpeakers: boolean
  ) => Promise<void>;
  updateSessionModeRealtime: (
    mode: "live" | "paused" | "ended"
  ) => Promise<void>;

  // ✅ NOUVEAU Phase 3 : État de connexion Realtime
  isRealtimeConnected: boolean;
  realtimeError: string | null;
}
```

### `UseEvaluationStateResult`

- **Fichier**: `app\evaluation\evaluation.types.tsx:333`
- **Description**: Hook personnalisé pour la gestion de l'état Evaluation

```typescript
export interface UseEvaluationStateResult {
  state: EvaluationState;
  actions: EvaluationActions;
  contextPanels: ContextPanelsMap;
  shouldShowTranscript: boolean;
  shouldShowContext: boolean;
  hasRightPanel: boolean;
}
```

### `UseFilteredDomainsResult`

- **Fichier**: `app\evaluation\evaluation.types.tsx:135`
- **Description**: *Aucune description*

```typescript
export interface UseFilteredDomainsResult {
  filteredDomains: Domain[];
}
```

### `UseNudgesResult`

- **Fichier**: `types\types.ts:118`
- **Description**: *Aucune description*

```typescript
export interface UseNudgesResult {
  nudges: Nudge[];
  fetchNudgesForPractice: (idpratique: number) => Promise<Nudge[]>; // ✅ Returns Nudge[]
  fetchNudgesForActivity: (idactivite: number) => Promise<void>;
  refreshNudgesFunction: () => void; // ✅ Function that returns void
  refreshNudges: () => void; // ✅ FIXED: This is a function, not a boolean
  updateNudgeDates: (newDates: NudgeDates) => void; // ✅ Takes NudgeDates object
  nudgeDates: NudgeDates;
  nudgesUpdated: boolean;
  markNudgesAsUpdated: () => void;
  resetNudgesUpdated: () => void;
  isLoading: boolean; // ✅ Added for react-query loading state
}
```

### `UsePhaseDataReturn`

- **Fichier**: `app\components\navigation\ActivitySidebar\types\index.tsx:104`
- **Description**: *Aucune description*

```typescript
export interface UsePhaseDataReturn {
  phases: Phase[];
  normalPhases: Phase[];
  adminPhases: Phase[];
  evaluationStats: {
    total: number;
    withIssues: number;
  };
}
```

### `UsePhaseNavigationReturn`

- **Fichier**: `app\components\navigation\ActivitySidebar\types\index.tsx:114`
- **Description**: *Aucune description*

```typescript
export interface UsePhaseNavigationReturn {
  currentView: string | null;
  openPhase: PhaseKey | null;
  stepStatus: Record<PhaseKey, StepStatus>;
  handlePhaseClick: (key: PhaseKey) => void;
  toggleStatus: (key: PhaseKey) => void;
  handleSubStepClick: (subStep: SubStep) => void;
  isActiveSubStep: (route?: string) => boolean;
  isActivePhase: (phaseKey: PhaseKey) => boolean;
  getQuickNavigation: () => QuickNavItem[];
}
```

### `UsePostitActionsReturn`

- **Fichier**: `app\evaluation\components\Postit\types.tsx:314`
- **Description**: Valeur de retour du hook usePostitActions

```typescript
export interface UsePostitActionsReturn {
  handleClosePostit: () => void;
  handleDelete: (postitId: number) => Promise<void>;
  handleSave: (postit: Postit) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}
```

### `UsePostitNavigationReturn`

- **Fichier**: `app\evaluation\components\Postit\types.tsx:299`
- **Description**: Valeur de retour du hook usePostitNavigation

```typescript
export interface UsePostitNavigationReturn {
  activeStep: number;
  setActiveStep: (step: number) => void;
  temporaryEditMode: boolean;
  setTemporaryEditMode: (mode: boolean) => void;
  isCompleted: boolean;
  handleNext: () => void;
  handleBack: () => void;
  handleStepClick: (stepIndex: number) => void;
  isStepAccessible: (stepIndex: number) => boolean;
}
```

### `UsePostitsProps`

- **Fichier**: `app\evaluation\components\FourZones\types\types.tsx:242`
- **Description**: Interface pour les propriétés du hook usePostits

```typescript
export interface UsePostitsProps {
  zoneColors: Record<string, string>;
  rolePlayData: ExtendedRolePlayData | null;
  selectedPostitForRolePlay: SelectedPostitType | null;
}
```

### `UsePostitsResult`

- **Fichier**: `types\types.ts:73`
- **Description**: *Aucune description*

```typescript
export interface UsePostitsResult {
  allPostits: Postit[];
  appelPostits: Postit[];
  fetchAllPostits: () => Promise<void>;
  getPostitsForCall: (callId: number) => Postit[];
  addPostit: (
    wordid: number,
    word: string,
    timestamp: number
  ) => Promise<number | null>;
  updatePostit: (
    id: number,
    updatedFields: Record<string, any>
  ) => Promise<void>; // ✅ Assure que `updatedFields` est un objet
  deletePostit: (id: number) => Promise<void>;
  postitToSujetMap: Record<number, number | null>;
  updatePostitToSujetMap: (postitId: number, sujetId: number | null) => void;
  postitToPratiqueMap: Record<string, string | null>;
  updatePostitToPratiqueMap: (
    postitId: string,
    idPratique: string | null
  ) => void;
}
```

### `UsePostitStylesReturn`

- **Fichier**: `app\evaluation\components\Postit\types.tsx:279`
- **Description**: Valeur de retour du hook usePostitStyles

```typescript
export interface UsePostitStylesReturn {
  theme: Theme;
  styles: {
    modalBackground: React.CSSProperties;
    modalWrapper: React.CSSProperties;
    modalContainer: React.CSSProperties;
    stepBox: React.CSSProperties;
    stepper: React.CSSProperties;
    stepperMobile: React.CSSProperties;
    content: React.CSSProperties;
    header: React.CSSProperties;
    footer: React.CSSProperties;
  };
  stepBoxStyle: React.CSSProperties;
  isMobile: boolean;
}
```

### `UsePratiqueSelectionReturn`

- **Fichier**: `app\evaluation\components\Postit\types.tsx:337`
- **Description**: Valeur de retour du hook usePratiqueSelection

```typescript
export interface UsePratiqueSelectionReturn {
  handlePratiqueClick: (practice: Practice) => void;
  pratiquesDeLActivite: number[];
  categoriesPratiques: CategoryPractice[];
  pratiques: Practice[];
  selectedPracticeId: number | null;
  isLoading: boolean;
}
```

### `UseQuizResult`

- **Fichier**: `types\types.ts:704`
- **Description**: *Aucune description*

```typescript
export interface UseQuizResult {
  quizzes: Quiz[]; // Liste des quiz disponibles
  quizTimestampMap: QuizTimestampMap; // Mapping des quiz par timestamp
  fetchQuizzes: () => Promise<void>;
  addQuiz: (quiz: Quiz) => Promise<void>;
  updateQuiz: (quizId: number, updatedQuiz: Partial<Quiz>) => Promise<void>;
  deleteQuiz: (quizId: number) => Promise<void>;
}
```

### `UseSharedEvaluationReturn`

- **Fichier**: `app\whiteboard\hooks\types.ts:20`
- **Description**: *Aucune description*

```typescript
export interface UseSharedEvaluationReturn {
  activeSessions: SharedEvaluationSession[];
  currentSession: SharedEvaluationSession | null;
  isLoading: boolean;
  error: string | null;
  refreshSessions: () => Promise<void>;
  selectSession: (sessionId: string) => void;
  clearCurrentSession: () => void;
}
```

### `UseStepNavigationProps`

- **Fichier**: `app\evaluation\components\FourZones\types\types.tsx:260`
- **Description**: Interface pour les propriétés du hook useStepNavigation

```typescript
export interface UseStepNavigationProps {
  steps: string[];
  postitsState: {
    postits: PostitType[];
    selectedClientText: string;
    selectedConseillerText: string;
  };
}
```

### `UseSujetSelectionReturn`

- **Fichier**: `app\evaluation\components\Postit\types.tsx:325`
- **Description**: Valeur de retour du hook useSujetSelection

```typescript
export interface UseSujetSelectionReturn {
  handleSujetClick: (subject: Subject) => void;
  sujetsDeLActivite: number[];
  categoriesSujets: CategorySubject[];
  sujetsData: Subject[];
  selectedSubjectId: number | null;
  isLoading: boolean;
}
```

### `UseTranscriptionsResult`

- **Fichier**: `types\types.ts:49`
- **Description**: *Aucune description*

```typescript
export interface UseTranscriptionsResult {
  transcription: Transcription | null;
  fetchTranscription: (callId: number) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}
```

### `UseUIResult`

- **Fichier**: `types\types.ts:538`
- **Description**: *Aucune description*

```typescript
export interface UseUIResult {
  // 🎛️ Gestion du Drawer
  drawerOpen: boolean;
  drawerContent: DrawerContent | null;
  openDrawer: (content: DrawerContent) => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  setDrawerContent: (content: DrawerContent | null) => void;
  handleOpenDrawerWithContent: (content: DrawerContent) => void;
  handleOpenDrawerWithData: (
    idPratique: number,
    initialType: string
  ) => Promise<void>;

  // ⭐ Gestion des avis
  reviews: Review[];
  fetchReviewsForPractice: (idPratique: number) => Promise<void>;
  openReviewsDialog: boolean;
  handleOpenReviewsDialog: (idPratique: number) => Promise<void>;
  handleCloseReviewsDialog: () => void;

  // 👥 Gestion des avatars
  avatarTexts: AvatarText;

  // ✅ Fix: Change from (index: number, text: string) to (participantId: string, text: string)
  updateAvatarText: (participantId: string, text: string) => void;
}
```

### `UseZonesResult`

- **Fichier**: `types\types.ts:713`
- **Description**: *Aucune description*

```typescript
export interface UseZonesResult {
  zoneTexts: ZoneTexts;
  selectTextForZone: (text: string, zone: keyof ZoneTexts) => void;
}
```

### `Word`

- **Fichier**: `app\evaluation\evaluation.types.tsx:48`
- **Description**: Interface pour un mot de transcription

```typescript
export interface Word {
  wordid: number;
  text: string;
  startTime: number;
  endTime: number;
  timestamp?: number;
  turn?: "turn1" | "turn2";
}
```

### `Word`

- **Fichier**: `app\zohoworkdrive\types\index.ts:105`
- **Description**: *Aucune description*

```typescript
export interface Word {
  wordid: number;
  transcriptid: number;
  text: string;
  startTime: number;
  endTime: number;
}
```

### `Word`

- **Fichier**: `hooks\CallDataContext\useAudio.types.ts:6`
- **Description**: *Aucune description*

```typescript
export interface Word {
  wordid: number;
  text: string;
  startTime: number;
  endTime: number;
  timestamp?: number;
  turn?: "turn1" | "turn2";
}
```

### `Word`

- **Fichier**: `types\types.ts:33`
- **Description**: *Aucune description*

```typescript
export interface Word {
  wordid: number;
  text: string;
  startTime: number;
  endTime: number;
  timestamp?: number;
  turn?: "turn1" | "turn2"; // ✅ Ajout pour gérer le tour de parole (si applicable)
}
```

### `WorkdriveExplorerProps`

- **Fichier**: `app\zohoworkdrive\types\index.ts:32`
- **Description**: *Aucune description*

```typescript
export interface WorkdriveExplorerProps {
  initialToken: ZohoAuthToken | null;
  entrepriseId: number | null;
}
```

### `ZohoAuthToken`

- **Fichier**: `app\zohoworkdrive\types\index.ts:65`
- **Description**: *Aucune description*

```typescript
export interface ZohoAuthToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number; // timestamp when the token expires
  api_domain?: string; // ✅ Ajout de la propriété manquante
}
```

### `ZohoAuthToken`

- **Fichier**: `app\zohoworkdrive\types\zoho.ts:3`
- **Description**: *Aucune description*

```typescript
export interface ZohoAuthToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number; // timestamp when the token expires
}
```

### `ZohoContextType`

- **Fichier**: `types\context\ZohoContext\ZohoContextTypes.tsx:4`
- **Description**: Définit les types pour le contexte Zoho.

```typescript
export interface ZohoContextType {
  zohoRefreshToken: string | null;
  updateZohoRefreshToken: (token: string) => Promise<void>;
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
}
```

### `ZohoError`

- **Fichier**: `app\zohoworkdrive\types\index.ts:90`
- **Description**: *Aucune description*

```typescript
export interface ZohoError {
  code: string;
  message: string;
  details?: any;
}
```

### `ZohoError`

- **Fichier**: `app\zohoworkdrive\types\zoho.ts:27`
- **Description**: *Aucune description*

```typescript
export interface ZohoError {
  code: string;
  message: string;
  details?: any;
}
```

### `ZohoFile`

- **Fichier**: `app\zohoworkdrive\types\index.ts:73`
- **Description**: *Aucune description*

```typescript
export interface ZohoFile {
  id: string;
  name: string;
  type: "file" | "folder";
  createdTime: string;
  modifiedTime: string;
  size?: string; // ✅ Changé en string pour correspondre à l'usage dans le code
  mimeType?: string;
  parentId?: string;
  thumbnailUrl?: string;
}
```

### `ZohoFile`

- **Fichier**: `app\zohoworkdrive\types\zoho.ts:10`
- **Description**: *Aucune description*

```typescript
export interface ZohoFile {
  id: string;
  name: string;
  type: "file" | "folder";
  createdTime: string;
  modifiedTime: string;
  size?: number;
  mimeType?: string;
  parentId?: string;
  thumbnailUrl?: string;
}
```

### `ZohoWorkdriveResponse`

- **Fichier**: `app\zohoworkdrive\types\index.ts:85`
- **Description**: *Aucune description*

```typescript
export interface ZohoWorkdriveResponse {
  data: ZohoFile[];
  nextPageToken?: string;
}
```

### `ZohoWorkdriveResponse`

- **Fichier**: `app\zohoworkdrive\types\zoho.ts:22`
- **Description**: *Aucune description*

```typescript
export interface ZohoWorkdriveResponse {
  data: ZohoFile[];
  nextPageToken?: string;
}
```

### `ZoneAwareTextSegment`

- **Fichier**: `app\evaluation\components\FourZones\utils\generateFinalText.tsx:6`
- **Description**: *Aucune description*

```typescript
export interface ZoneAwareTextSegment {
  id: string;
  content: string;
  type: "zone" | "sentence" | "paragraph";

  // Métadonnées d'origine
  sourceZone?: string; // Clé de la zone (VOUS_AVEZ_FAIT, JE_FAIS, etc.)
  zoneName?: string; // Nom affiché de la zone
  zoneOrder?: number; // Ordre dans la séquence (1, 2, 3, 4)
  zoneColor?: string; // Couleur associée à la zone
  isFromRework?: boolean; // Vrai si provient d'un post-it retravaillé
  postitIds?: string[]; // IDs des post-its sources
}
```

### `ZoneComposition`

- **Fichier**: `app\evaluation\components\FourZones\utils\generateFinalText.tsx:20`
- **Description**: *Aucune description*

```typescript
export interface ZoneComposition {
  segments: ZoneAwareTextSegment[];
  fullText: string;
  hasReworkedContent: boolean;
  originalText?: string;
  stats: {
    totalSegments: number;
    reworkedSegments: number;
    originalLength: number;
    finalLength: number;
    proactivityPercentage: number; // ✅ NOUVEAU
  };
}
```

### `ZoneConstants`

- **Fichier**: `app\evaluation\components\FourZones\components\SuggestionSection.types.ts:23`
- **Description**: Interface pour les constantes de zones utilisées dans le composant

```typescript
export interface ZoneConstants {
  CLIENT: string;
  VOUS_AVEZ_FAIT: string;
  JE_FAIS: string;
  ENTREPRISE_FAIT: string;
  VOUS_FEREZ: string;
}
```

### `ZoneTexts`

- **Fichier**: `types\types.ts:250`
- **Description**: *Aucune description*

```typescript
export interface ZoneTexts {
  zone1: string;
  zone2: string;
  zone3: string;
  zone4: string;
  zone5: string;
  [key: string]: string; // ✅ Signature d'index ajoutée
}
```

## 🎯 Types (27)

### `AdminCounters`

- **Fichier**: `app\evaluation\admin\types\admin.tsx:269`
- **Description**: *Aucune description*

```typescript
export type AdminCounters = {
```

### `AdminMode`

- **Fichier**: `app\evaluation\admin\types\admin.tsx:161`
- **Description**: *Aucune description*

```typescript
export type AdminMode = "view" | "edit" | "create";
```

### `AdminSection`

- **Fichier**: `app\evaluation\admin\types\admin.tsx:163`
- **Description**: *Aucune description*

```typescript
export type AdminSection =
```

### `ConformiteChoice`

- **Fichier**: `hooks\usePonderationSujets.tsx:16`
- **Description**: *Aucune description*

```typescript
export type ConformiteChoice =
```

### `ContextPanelsMap`

- **Fichier**: `app\evaluation\evaluation.types.tsx:173`
- **Description**: Map des panneaux contextuels disponibles

```typescript
export type ContextPanelsMap = Record<ContextView, ContextPanel>;
```

### `ContextView`

- **Fichier**: `app\evaluation\evaluation.types.tsx:155`
- **Description**: Types de vues contextuelles disponibles

```typescript
export type ContextView =
```

### `DisplayMode`

- **Fichier**: `app\evaluation\components\FourZones\components\ToolBar.types.ts:42`
- **Description**: Type pour les modes d'affichage

```typescript
export type DisplayMode = "light" | "dark";
```

### `DisplayMode`

- **Fichier**: `app\evaluation\evaluation.types.tsx:142`
- **Description**: Modes d'affichage pour la gestion des panneaux

```typescript
export type DisplayMode =
```

### `DomaineQualite`

- **Fichier**: `app\evaluation\admin\types\admin.tsx:31`
- **Description**: *Aucune description*

```typescript
export type DomaineQualite = Domaine;
```

### `GenerateTrainingPlanFunction`

- **Fichier**: `app\evaluation\components\EntrainementSuivi\types.tsx:137`
- **Description**: *Aucune description*

```typescript
export type GenerateTrainingPlanFunction = (
```

### `NudgeArray`

- **Fichier**: `app\evaluation\components\EntrainementSuivi\types.tsx:134`
- **Description**: *Aucune description*

```typescript
export type NudgeArray = string[]; // Garantir que c'est un array de strings
```

### `PhaseKey`

- **Fichier**: `app\components\navigation\ActivitySidebar\types\index.tsx:8`
- **Description**: *Aucune description*

```typescript
export type PhaseKey =
```

### `PostitEvent`

- **Fichier**: `app\evaluation\components\Postit\types.tsx:435`
- **Description**: Événements du cycle de vie du Postit

```typescript
export type PostitEvent =
```

### `PostitEventHandler`

- **Fichier**: `app\evaluation\components\Postit\types.tsx:453`
- **Description**: Callback pour les événements

```typescript
export type PostitEventHandler = (event: PostitEvent) => void;
```

### `PostitHookEvent`

- **Fichier**: `hooks\Postit\types.ts:85`
- **Description**: *Aucune description*

```typescript
export type PostitHookEvent =
```

### `QuizTimestampMap`

- **Fichier**: `types\types.ts:701`
- **Description**: *Aucune description*

```typescript
export type QuizTimestampMap = Record<number, Quiz>; // ✅ Ajouté
```

### `SelectedMotifType`

- **Fichier**: `app\evaluation\components\SyntheseEvaluation\syntheseEvaluation.types.tsx:42`
- **Description**: *Aucune description*

```typescript
export type SelectedMotifType = string | string[] | null;
```

### `SortCriteria`

- **Fichier**: `app\evaluation\components\SyntheseEvaluation\utils\filters.tsx:38`
- **Description**: Type pour les critères de tri

```typescript
export type SortCriteria = "timestamp" | "alpha" | "pratique";
```

### `StatusColorMap`

- **Fichier**: `app\components\navigation\ActivitySidebar\types\index.tsx:68`
- **Description**: *Aucune description*

```typescript
export type StatusColorMap = Record<StepStatus, string>;
```

### `StepStatus`

- **Fichier**: `app\components\navigation\ActivitySidebar\types\index.tsx:6`
- **Description**: *Aucune description*

```typescript
export type StepStatus = "à faire" | "en cours" | "réalisé";
```

### `StepType`

- **Fichier**: `app\evaluation\components\EntrainementSuivi\types.tsx:114`
- **Description**: *Aucune description*

```typescript
export type StepType = "bilan" | "deroulement";
```

### `ThemeType`

- **Fichier**: `app\evaluation\components\EntrainementSuivi\types.tsx:60`
- **Description**: *Aucune description*

```typescript
export type ThemeType =
```

### `TurnValue`

- **Fichier**: `utils\SpeakerUtils.tsx:18`
- **Description**: Toutes les valeurs possibles pour le champ 'turn' dans la table word

```typescript
export type TurnValue =
```

### `ViewMode`

- **Fichier**: `app\evaluation\evaluation.types.tsx:150`
- **Description**: Modes de vue pour la transcription

```typescript
export type ViewMode = "word" | "paragraph";
```

### `ViewType`

- **Fichier**: `app\components\navigation\ActivitySidebar\types\index.tsx:18`
- **Description**: *Aucune description*

```typescript
export type ViewType =
```

### `ViewType`

- **Fichier**: `app\evaluation\components\EntrainementSuivi\types.tsx:115`
- **Description**: *Aucune description*

```typescript
export type ViewType = "conseiller" | "coach" | "exercices";
```

### `ZoneType`

- **Fichier**: `app\evaluation\components\FourZones\components\SuggestionSection.types.ts:54`
- **Description**: Type pour les zones disponibles

```typescript
export type ZoneType =
```

## 🔢 Énumérations (1)

### `SpeakerType`

- **Fichier**: `utils\SpeakerUtils.tsx:9`
- **Description**: Types de locuteurs dans une transcription

```typescript
export enum SpeakerType {
  CONSEILLER = "conseiller",
  CLIENT = "client",
  UNKNOWN = "unknown",
}
```

## 🏛️ Classes (1)

### `AdminDataService`

- **Fichier**: `app\evaluation\admin\services\adminDataService.tsx:14`
- **Description**: *Aucune description*

```typescript
export class AdminDataService {
```

## ⚡ Fonctions (81)

### `BackIcon`

- **Fichier**: `app\zohoworkdrive\components\Icons.tsx:107`
- **Description**: *Aucune description*

```typescript
export function BackIcon() {
```

### `DocumentIcon`

- **Fichier**: `app\zohoworkdrive\components\Icons.tsx:146`
- **Description**: *Aucune description*

```typescript
export function DocumentIcon() {
```

### `DownloadIcon`

- **Fichier**: `app\zohoworkdrive\components\Icons.tsx:43`
- **Description**: *Aucune description*

```typescript
export function DownloadIcon() {
```

### `FileIcon`

- **Fichier**: `app\zohoworkdrive\components\Icons.tsx:20`
- **Description**: *Aucune description*

```typescript
export function FileIcon() {
```

### `FolderIcon`

- **Fichier**: `app\zohoworkdrive\components\Icons.tsx:1`
- **Description**: *Aucune description*

```typescript
export function FolderIcon() {
```

### `GET`

- **Fichier**: `app\api\evaluation-sharing\active-sessions\route.tsx:64`
- **Description**: *Aucune description*

```typescript
export async function GET(request: NextRequest) {
```

### `GET`

- **Fichier**: `app\api\evaluation-sharing\check-session\route.tsx:19`
- **Description**: *Aucune description*

```typescript
export async function GET(request: NextRequest) {
```

### `GET`

- **Fichier**: `app\api\ponderation-sujets\route.tsx:17`
- **Description**: *Aucune description*

```typescript
export async function GET(request: NextRequest) {
```

### `GET`

- **Fichier**: `app\api\transcription\get\route.tsx:20`
- **Description**: *Aucune description*

```typescript
export async function GET(request: NextRequest) {
```

### `GET`

- **Fichier**: `app\api\zoho\auth\route.tsx:5`
- **Description**: *Aucune description*

```typescript
export async function GET() {
```

### `GET`

- **Fichier**: `app\api\zoho\callback\route.tsx:5`
- **Description**: *Aucune description*

```typescript
export async function GET(request: NextRequest) {
```

### `GET`

- **Fichier**: `app\api\zoho\workdrive\route.tsx:10`
- **Description**: *Aucune description*

```typescript
export async function GET(request: NextRequest) {
```

### `getSpeakerDisplayName`

- **Fichier**: `utils\SpeakerUtils.tsx:120`
- **Description**: Renvoie le nom d'affichage du locuteur  @param speakerType Le type de locuteur  @returns Le nom d'affichage ('Conseiller' ou 'Client')

```typescript
export function getSpeakerDisplayName(speakerType: SpeakerType): string {
```

### `getSpeakerSelectionStyle`

- **Fichier**: `utils\SpeakerUtils.tsx:104`
- **Description**: Renvoie le style de sélection pour un type de locuteur donné  @param speakerType Le type de locuteur  @returns Un objet de style React pour la sélection

```typescript
export function getSpeakerSelectionStyle(speakerType: SpeakerType) {
```

### `getSpeakerStyle`

- **Fichier**: `utils\SpeakerUtils.tsx:83`
- **Description**: Renvoie le style de couleur pour un type de locuteur donné  @param speakerType Le type de locuteur  @param highlight Indique si le style doit être mis en évidence  @returns Un objet de style React

```typescript
export function getSpeakerStyle(
```

### `getSpeakerType`

- **Fichier**: `utils\SpeakerUtils.tsx:32`
- **Description**: Détermine le type de locuteur à partir de la valeur du champ 'turn'  @param turn La valeur du champ 'turn' de la table word  @returns Le type de locuteur

```typescript
export function getSpeakerType(turn: TurnValue): SpeakerType {
```

### `groupWordsBySpeaker`

- **Fichier**: `utils\SpeakerUtils.tsx:149`
- **Description**: Regroupe les mots par locuteur pour créer des paragraphes  @param words Liste des mots de la transcription  @returns Liste des paragraphes par locuteur

```typescript
export function groupWordsBySpeaker(words: Word[]): SpeakerParagraph[] {
```

### `hasValidPractice`

- **Fichier**: `app\evaluation\components\Postit\types.tsx:526`
- **Description**: Type guard pour vérifier si un postit a une pratique valide

```typescript
export function hasValidPractice(postit: PostitExtended): boolean {
```

### `hasValidSubject`

- **Fichier**: `app\evaluation\components\Postit\types.tsx:515`
- **Description**: Type guard pour vérifier si un postit a un sujet valide

```typescript
export function hasValidSubject(postit: PostitExtended): boolean {
```

### `HomeIcon`

- **Fichier**: `app\zohoworkdrive\components\Icons.tsx:88`
- **Description**: *Aucune description*

```typescript
export function HomeIcon() {
```

### `ImageIcon`

- **Fichier**: `app\zohoworkdrive\components\Icons.tsx:125`
- **Description**: *Aucune description*

```typescript
export function ImageIcon() {
```

### `isPostitComplete`

- **Fichier**: `app\evaluation\components\Postit\types.tsx:508`
- **Description**: Type guard pour vérifier si un postit est complet

```typescript
export function isPostitComplete(postit: Postit): postit is PostitComplete {
```

### `isSpeakerClient`

- **Fichier**: `utils\SpeakerUtils.tsx:57`
- **Description**: Vérifie si le locuteur est un client  @param turn La valeur du champ 'turn' de la table word  @returns true si le locuteur est un client, false sinon

```typescript
export function isSpeakerClient(turn: TurnValue): boolean {
```

### `isSpeakerConseil`

- **Fichier**: `utils\SpeakerUtils.tsx:46`
- **Description**: Vérifie si le locuteur est un conseiller  @param turn La valeur du champ 'turn' de la table word  @returns true si le locuteur est un conseiller, false sinon

```typescript
export function isSpeakerConseil(turn: TurnValue): boolean {
```

### `LoadingIcon`

- **Fichier**: `app\zohoworkdrive\components\Icons.tsx:63`
- **Description**: *Aucune description*

```typescript
export function LoadingIcon() {
```

### `middleware`

- **Fichier**: `middleware.tsx:7`
- **Description**: *Aucune description*

```typescript
export async function middleware(request: NextRequest) {
```

### `normalizeTurnValue`

- **Fichier**: `utils\SpeakerUtils.tsx:68`
- **Description**: Normalise la valeur du champ 'turn' vers un format standard  @param turn La valeur du champ 'turn' de la table word  @returns La valeur normalisée ('conseiller' ou 'client')

```typescript
export function normalizeTurnValue(turn: TurnValue): string {
```

### `POST`

- **Fichier**: `app\api\ai\improve\route.tsx:10`
- **Description**: *Aucune description*

```typescript
export async function POST(request: NextRequest) {
```

### `POST`

- **Fichier**: `app\api\calls\create-from-zoho\route.tsx:81`
- **Description**: *Aucune description*

```typescript
export async function POST(request: Request) {
```

### `POST`

- **Fichier**: `app\api\evaluation-sharing\create-session\route.tsx:5`
- **Description**: *Aucune description*

```typescript
export async function POST(request: NextRequest) {
```

### `POST`

- **Fichier**: `app\api\evaluation-sharing\stop-session\route.tsx:6`
- **Description**: *Aucune description*

```typescript
export async function POST(request: NextRequest) {
```

### `POST`

- **Fichier**: `app\api\evaluation-sharing\update-controls\route.tsx:5`
- **Description**: *Aucune description*

```typescript
export async function POST(request: NextRequest) {
```

### `POST`

- **Fichier**: `app\api\evaluation-sharing\update-mode\route.tsx:5`
- **Description**: *Aucune description*

```typescript
export async function POST(request: NextRequest) {
```

### `POST`

- **Fichier**: `app\api\evaluation-sharing\update-position\route.tsx:5`
- **Description**: *Aucune description*

```typescript
export async function POST(request: NextRequest) {
```

### `POST`

- **Fichier**: `app\api\getAudioUrl\route.tsx:4`
- **Description**: *Aucune description*

```typescript
export async function POST(request: NextRequest) {
```

### `POST`

- **Fichier**: `app\api\ponderation-sujets\route.tsx:105`
- **Description**: *Aucune description*

```typescript
export async function POST(request: NextRequest) {
```

### `POST`

- **Fichier**: `app\api\send-training-email\route.tsx:8`
- **Description**: *Aucune description*

```typescript
export async function POST(request: NextRequest) {
```

### `POST`

- **Fichier**: `app\api\tts\route.tsx:95`
- **Description**: *Aucune description*

```typescript
export async function POST(request: NextRequest) {
```

### `PresentationIcon`

- **Fichier**: `app\zohoworkdrive\components\Icons.tsx:191`
- **Description**: *Aucune description*

```typescript
export function PresentationIcon() {
```

### `SessionSelector`

- **Fichier**: `app\whiteboard\components\SharedEvaluation\SessionSelector.tsx:15`
- **Description**: *Aucune description*

```typescript
export function SessionSelector({
```

### `SessionStatusBadge`

- **Fichier**: `app\whiteboard\components\SharedEvaluation\SessionStatusBadge.tsx:15`
- **Description**: *Aucune description*

```typescript
export function SessionStatusBadge({
```

### `SessionStatusDetail`

- **Fichier**: `app\whiteboard\components\SharedEvaluation\SessionStatusBadge.tsx:123`
- **Description**: *Aucune description*

```typescript
export function SessionStatusDetail({
```

### `SharedEvaluationContent`

- **Fichier**: `app\whiteboard\components\SharedEvaluation\SharedEvaluationContent.tsx:32`
- **Description**: *Aucune description*

```typescript
export function SharedEvaluationContent({
```

### `SharedEvaluationHeader`

- **Fichier**: `app\whiteboard\components\SharedEvaluation\SharedEvaluationHeader.tsx:30`
- **Description**: *Aucune description*

```typescript
export function SharedEvaluationHeader({
```

### `SharedEvaluationViewer`

- **Fichier**: `app\whiteboard\components\SharedEvaluation\SharedEvaluationViewer.tsx:27`
- **Description**: *Aucune description*

```typescript
export function SharedEvaluationViewer({
```

### `SpreadsheetIcon`

- **Fichier**: `app\zohoworkdrive\components\Icons.tsx:169`
- **Description**: *Aucune description*

```typescript
export function SpreadsheetIcon() {
```

### `SynchronizedTranscript`

- **Fichier**: `app\whiteboard\components\SharedEvaluation\SynchronizedTranscript.tsx:34`
- **Description**: *Aucune description*

```typescript
export function SynchronizedTranscript({
```

### `useActivities`

- **Fichier**: `hooks\AppContext\useActivities.tsx:11`
- **Description**: *Aucune description*

```typescript
export function useActivities(): UseActivitiesResult {
```

### `useAudio`

- **Fichier**: `hooks\CallDataContext\useAudio.tsx:4`
- **Description**: *Aucune description*

```typescript
export function useAudio(): UseAudioResult {
```

### `useAuth`

- **Fichier**: `hooks\AppContext\useAuth.tsx:5`
- **Description**: *Aucune description*

```typescript
export function useAuth(): AuthContextType {
```

### `useBandeauEvalData`

- **Fichier**: `hooks\AppContext\useBandeauEvalData.tsx:5`
- **Description**: *Aucune description*

```typescript
export function useBandeauEvalData(selectedEntreprise: number | null) {
```

### `useCallActivity`

- **Fichier**: `hooks\CallDataContext\useCallActivity.tsx:13`
- **Description**: *Aucune description*

```typescript
export function useCallActivity({
```

### `useCalls`

- **Fichier**: `hooks\CallDataContext\useCalls.tsx:7`
- **Description**: *Aucune description*

```typescript
export function useCalls(): UseCallsResult {
```

### `useCoach`

- **Fichier**: `hooks\whiteboard\useCoach.tsx:8`
- **Description**: *Aucune description*

```typescript
export function useCoach() {
```

### `useConnectedAvatars`

- **Fichier**: `hooks\whiteboard\useConnectedAvatars.tsx:11`
- **Description**: *Aucune description*

```typescript
export function useConnectedAvatars() {
```

### `useConseillers`

- **Fichier**: `hooks\useConseillers.tsx:5`
- **Description**: *Aucune description*

```typescript
export function useConseillers() {
```

### `useDomains`

- **Fichier**: `hooks\useDomains.tsx:11`
- **Description**: *Aucune description*

```typescript
export function useDomains(): UseDomainsResult {
```

### `useEntreprises`

- **Fichier**: `hooks\AppContext\useEntreprises.tsx:5`
- **Description**: *Aucune description*

```typescript
export function useEntreprises() {
```

### `useFetchAllData`

- **Fichier**: `hooks\AppContext\useFetchAllData.tsx:21`
- **Description**: *Aucune description*

```typescript
export function useFetchAllData() {
```

### `useFilteredDomains`

- **Fichier**: `hooks\AppContext\useFilteredDomains.tsx:6`
- **Description**: *Aucune description*

```typescript
export function useFilteredDomains(selectedEntreprise: string | number | null) {
```

### `useHighlightedPractices`

- **Fichier**: `hooks\useHighlightedPractices.tsx:10`
- **Description**: Hook spécialisé pour gérer les pratiques mises en évidence  selon le sujet sélectionné dans un post-it

```typescript
export function useHighlightedPractices(selectedPostit: Postit | null) {
```

### `useNudges`

- **Fichier**: `hooks\AppContext\useNudges.tsx:6`
- **Description**: *Aucune description*

```typescript
export function useNudges(): UseNudgesResult {
```

### `usePostit`

- **Fichier**: `app\evaluation\components\Postit\hooks\usePostit.tsx:14`
- **Description**: Hook principal pour gérer l'état et la logique du composant Postit  @returns Objet contenant l'état et les fonctions pour gérer le composant Postit

```typescript
export function usePostit() {
```

### `usePostit`

- **Fichier**: `hooks\Postit\usePostit.tsx:28`
- **Description**: Hook principal pour gérer l'état et la logique du composant Postit  @returns Objet contenant l'état et les fonctions pour gérer le composant Postit

```typescript
export function usePostit() {
```

### `usePostitActions`

- **Fichier**: `app\evaluation\components\Postit\hooks\usePostitActions.tsx:12`
- **Description**: Hook pour gérer les actions sur un Postit (sauvegarde, suppression, fermeture)

```typescript
export function usePostitActions() {
```

### `usePostitActions`

- **Fichier**: `hooks\Postit\usePostitActions.tsx:12`
- **Description**: Hook pour gérer les actions sur un Postit (sauvegarde, suppression, fermeture)

```typescript
export function usePostitActions() {
```

### `usePostitNavigation`

- **Fichier**: `app\evaluation\components\Postit\hooks\usePostitNavigation.tsx:42`
- **Description**: *Aucune description*

```typescript
export function usePostitNavigation(selectedPostit: any) {
```

### `usePostits`

- **Fichier**: `hooks\CallDataContext\usePostits.tsx:6`
- **Description**: *Aucune description*

```typescript
export function usePostits(selectedCallId: number | null): UsePostitsResult {
```

### `usePratiqueSelection`

- **Fichier**: `app\evaluation\components\Postit\hooks\usePratiqueSelection.tsx:8`
- **Description**: *Aucune description*

```typescript
export function usePratiqueSelection() {
```

### `useQuiz`

- **Fichier**: `hooks\CallDataContext\useQuiz.tsx:5`
- **Description**: *Aucune description*

```typescript
export function useQuiz(): UseQuizResult {
```

### `useSelectedPratique`

- **Fichier**: `hooks\AppContext\useSelectedPratique.tsx:5`
- **Description**: *Aucune description*

```typescript
export function useSelectedPratique() {
```

### `useSelection`

- **Fichier**: `hooks\AppContext\useSelection.tsx:8`
- **Description**: *Aucune description*

```typescript
export function useSelection(
```

### `useSession`

- **Fichier**: `hooks\whiteboard\useSession.tsx:5`
- **Description**: *Aucune description*

```typescript
export function useSession(
```

### `useSharedEvaluation`

- **Fichier**: `app\whiteboard\hooks\useSharedEvaluation.tsx:79`
- **Description**: *Aucune description*

```typescript
export function useSharedEvaluation(
```

### `useSpectatorTranscriptions`

- **Fichier**: `app\whiteboard\hooks\useSpectatorTranscriptions.tsx:19`
- **Description**: Hook spécialisé pour récupérer les transcriptions en mode spectateur  ✅ Utilise l'API route pour contourner les problèmes d'authentification

```typescript
export function useSpectatorTranscriptions(): UseSpectatorTranscriptionsResult {
```

### `useStyles`

- **Fichier**: `hooks\Postit\useStyles.tsx:9`
- **Description**: Hook pour gérer les styles du composant Postit

```typescript
export function useStyles() {
```

### `useSujetSelection`

- **Fichier**: `app\evaluation\components\Postit\hooks\useSujetSelection.tsx:11`
- **Description**: Hook pour gérer la sélection de sujets dans le Postit

```typescript
export function useSujetSelection() {
```

### `useThemeMode`

- **Fichier**: `app\components\common\Theme\ThemeProvider.tsx:8`
- **Description**: *Aucune description*

```typescript
export function useThemeMode() {
```

### `useTranscriptions`

- **Fichier**: `hooks\CallDataContext\useTranscriptions.tsx:8`
- **Description**: Hook personnalisé pour récupérer et gérer la transcription d'un appel.

```typescript
export function useTranscriptions(): UseTranscriptionsResult {
```

### `useUI`

- **Fichier**: `hooks\AppContext\useUI.tsx:6`
- **Description**: *Aucune description*

```typescript
export function useUI(): UseUIResult {
```

### `useZones`

- **Fichier**: `hooks\CallDataContext\useZones.tsx:8`
- **Description**: Gère les textes des zones avec sélection et mise à jour.

```typescript
export function useZones(): UseZonesResult {
```



---

*Cette documentation a été générée automatiquement. Ne pas modifier manuellement.*
