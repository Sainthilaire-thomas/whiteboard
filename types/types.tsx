// 📌 types.ts - Centralisation de tous les types

// 🔹 Appels
export interface EntrepriseCall {
  id: number;
  nom: string;
}

export interface CallActivityRelation {
  activityid: number;
  activitesconseillers: { nature: string }[];
}

export interface Call {
  callid: number;
  filename: string;
  description?: string;
  filepath?: string;
  callactivityrelation: CallActivityRelation[]; // ✅ Bien définir comme un tableau
}

export interface CallSelectorProps {
  calls: Call[];
  selectCall: (call: Call) => void;
  selectedEntreprise: number | null;
}

// 🔹 Transcriptions
export interface Word {
  wordid: number;
  text: string;
  startTime: number;
  endTime: number;
  timestamp?: number;
  turn?: "turn1" | "turn2"; // ✅ Ajout pour gérer le tour de parole (si applicable)
}

export interface Transcription {
  callid: number;
  words: Word[];
  audioSrc?: string;
}

// 🔹 Résultat du hook `useTranscriptions`
export interface UseTranscriptionsResult {
  transcription: Transcription | null;
  fetchTranscription: (callId: number) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

// 🔹 Post-its
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
  timestamp: number;
  idactivite?: number | null;
}

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

// 🔹 Entreprises
export interface Entreprise {
  id: number; // Ajouté pour compatibilité
  nom: string; // Ajouté pour compatibilité
  identreprise: number;
  nomentreprise: string;
}

// 🔹 Nudges
export interface Nudge {
  idnudge: number; // ✅ Correspond à id_nudge dans Supabase
  idactivite: number | null; // ✅ Correspond à id_activite
  idpratique: number | null; // ✅ Correspond à id_pratique
  contenu: string | null; // ✅ Fusionne tous les nudges
  datecreation: string; // ✅ Date de création du nudge
}

export interface NudgeDates {
  [key: number]: string; // Associe un ID de pratique à une date
}

export interface UseNudgesResult {
  nudges: Nudge[];
  fetchNudgesForPractice: (idpratique: number) => Promise<Nudge[]>;
  fetchNudgesForActivity: (idactivite: number) => Promise<void>;
  refreshNudgesFunction: () => void;
  refreshNudges: () => void;
  updateNudgeDates: (newDates: NudgeDates) => void;
  nudgeDates: NudgeDates;
  nudgesUpdated: boolean;
  markNudgesAsUpdated: () => void;
  resetNudgesUpdated: () => void;
  isLoading: boolean; // ✅ Ajouté pour correspondre au hook useNudges
}

// 🔹 Activités & Pratiques

export interface Category {
  [key: string]: string | number; // Clé dynamique
}

export interface CategoriePratique extends Category {
  id: number; // ✅ Normalisation : on garde `id` et `name`
  name: string; // ✅ Normalisation
  couleur: string;
}

export interface ColumnConfig {
  categoryIdKey: string;
  categoryNameKey: string;
  itemIdKey: string;
  itemNameKey: string;
}

export interface Pratique extends Item {
  idpratique: number;
  nompratique: string;
  description?: string;
  jeuderole?: string;
  idcategoriepratique: number; // ✅ Vérifier qu'il est bien présent
}

export interface Activite {
  idactivite: number;
  nomactivite: string;
  pratiques: Pratique[];
}

// 🔹 Sujets & Domaines
export interface Domaine {
  iddomaine: number;
  nomdomaine: string;
}

export interface CategorieSujet {
  idcategoriesujet: number;
  nomcategorie: string;
  couleur: string;
  [key: string]: string | number; // Ajout de la signature d'index pour rendre compatible avec Category
}

export interface Sujet extends Item {
  idsujet: number;
  nomsujet: string;
  iddomaine: number;
  description?: string;
  idcategoriesujet: number; // ✅ Vérifier qu'il est bien présent
  categoriesujet?: CategorieSujet;
}

export interface SujetPratiqueRelation {
  idsujet: number;
  idpratique: number;
}

// 🔹 Conseiller (Utilisateur qui effectue l'évaluation)
export interface Conseiller {
  idconseiller: number;
  nom: string;
  prenom: string;
  email?: string;
  avatarUrl?: string;
  estanonyme: boolean; // ✅ Correction ici
}

// 🔹 Avatar Anonyme (Alternative à un conseiller)
export interface AvatarAnonyme {
  idavatar: number;
  nom: string;
  url: string;
}

// 🔹 Quiz & Zones
export interface Quiz {
  quizid: number;
  question: string;
  answers: string[];
  correctAnswerIndex: number;
}

export interface ZoneTexts {
  zone1: string;
  zone2: string;
  zone3: string;
  zone4: string;
  zone5: string;
}

// 🔹 Audio & UI
import { RefObject } from "react";

export interface AudioContextType {
  audioSrc: string | null;
  setAudioSrc: (src: string | null) => void;
  playAudioAtTimestamp: (timestamp: number) => void;
  playerRef: React.RefObject<HTMLAudioElement | null>; // Modifiez ici pour accepter `null`
  isPlaying: boolean;
  setTime: (time: number) => void;
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  currentWordIndex: number;
  updateCurrentWordIndex: (transcription: Word[], currentTime: number) => void; // Ajout de cette méthode
}
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

export interface EvaluationProps {
  darkMode: boolean;
  setDarkMode: (mode: boolean) => void;
}

// ✨ Ajout de l'interface pour EvaluationDrawer
export interface EvaluationDrawerProps {
  isRightDrawerOpen: boolean;
  setIsRightDrawerOpen: (open: boolean) => void;
  darkMode: boolean;
  setDarkMode: (mode: boolean) => void;
}

// ✅ Types unifiés pour le contexte d'application
export interface CallDataContextType {
  calls: Call[];
  fetchCalls: (identreprise: number) => Promise<void>;
  selectedCall: Call | null;
  selectCall: (call: Call) => void;
  allPostits: Postit[];
  appelPostits: Postit[];
  fetchAllPostits: () => Promise<void>;
  addPostit: (
    wordid: number,
    word: string,
    timestamp: number
  ) => Promise<number | null>;

  updatePostit: (
    id: number,
    updatedFields: Record<string, any>
  ) => Promise<void>;
  deletePostit: (postitId: number) => Promise<void>;
  transcription: Transcription | null;
  fetchTranscription: (callId: number) => Promise<void>;
  domains: Domaine[];
  domainNames: Record<number, string>;
  fetchDomains: () => Promise<void>;
  audioSrc: string | null;
  setAudioSrc: (src: string | null) => void;
  playAudioAtTimestamp: (timestamp: number) => void;
  playerRef: React.RefObject<HTMLAudioElement>;
  zoneTexts: ZoneTexts;
  selectTextForZone: (text: string, zone: keyof ZoneTexts) => void;
  createAudioUrlWithToken: (filepath: string) => Promise<string | null>;
  currentWord: Word | null;
  updateCurrentWord: (word: Word | null) => void;
  idCallActivite: number | null; // Ajoute cette ligne si 'idCallActivite' est nécessaire

  postitToSujetMap: Record<number, number | null>;
  updatePostitToSujetMap: (postitId: number, sujetId: number | null) => void;
  postitToPratiqueMap: Record<number, string | null>;
  updatePostitToPratiqueMap: (
    postitId: number,
    pratique: string | null
  ) => void;

  isLoadingCalls: boolean;
  createActivityForCall: (
    callId: number,
    activityType: "evaluation" | "coaching",
    idConseiller: number
  ) => Promise<void>;
  archiveCall: (callId: number) => Promise<void>;
  deleteCall: (callId: number) => Promise<void>;
  removeActivityForCall: (callId: number) => Promise<void>;

  selectedPostitForRolePlay: Postit | null;
  setSelectedPostitForRolePlay: (postit: Postit | null) => void;
  rolePlayData: RolePlayData | null;
  saveRolePlayData: (data: RolePlayData, postitId: number) => Promise<void>;
  fetchRolePlayData: (callId: number, postitId: number) => Promise<void>;
  deleteRolePlayData: (rolePlayId: number) => Promise<void>;
  getRolePlaysByCallId: (
    callId: number
  ) => Promise<{ id: number; postit_id: number; note: RolePlayData }[]>;
  isLoadingRolePlay: boolean;
  rolePlayError: Error | null;
}

export interface UIContextType {
  drawerOpen: boolean;
  toggleDrawer: () => void;
  drawerContent: any;
  setDrawerContent: (content: any) => void;
  handleOpenDrawerWithContent?: (content: any) => void; // ✅ Ajout
}

// 🔹 Contenu du Drawer
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

// 🔹 Review (Avis utilisateur)
export interface Review {
  avis: string;
  userlike: number; // Valeur numérique (ex: 1-5 étoiles)
}

export interface Avis {
  avis: string;
  userlike: number; // Exemple : 1-5 étoiles
}

export interface Activity {
  id: number;
  name: string;
  description?: string;
}

export interface UseActivitiesResult {
  pratiques: Pratique[];
  isLoadingPratiques: boolean;
  fetchReviewsForPractice: (idpratique: number) => Promise<void>;
  reviews: Avis[];
  averageRating: number;
  categoriesPratiques: CategoriePratique[]; // ✅ on aligne avec ton usage
}

// 🔹 Texte associé aux avatars
export interface AvatarText {
  [id: number]: string;
}

// 🔹 Définition d'une pratique avec sa catégorie
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

// 🔹 Définition de l'utilisateur authentifié
export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl?: string | null; // ✅ Accepte `null` et `undefined`
}

// 🔹 Définition de la relation entre Sujet et Pratique
export interface RelationSujetPratique {
  idsujet: number;
  idpratique: number;
}

// 🔹 Définition du contexte d'authentification
export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

// 🔹 Résultat de `fetchAllData`
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

// 🔹 Résultat du hook `useUI`
export interface UseUIResult {
  // 🎛️ Gestion du Drawer
  drawerOpen: boolean;
  drawerContent: DrawerContent | null;
  openDrawer: (content: DrawerContent) => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  setDrawerContent: (content: DrawerContent | null) => void;
  handleOpenDrawerWithContent: (content: DrawerContent) => void; // ✅ Ajouté
  handleOpenDrawerWithData: (
    idPratique: number,
    initialType: string
  ) => Promise<void>; // ✅ Ajouté

  // ⭐ Gestion des avis
  reviews: Review[];
  fetchReviewsForPractice: (idPratique: number) => Promise<void>;
  openReviewsDialog: boolean;
  handleOpenReviewsDialog: (idPratique: number) => Promise<void>;
  handleCloseReviewsDialog: () => void;

  // 👥 Gestion des avatars
  avatarTexts: AvatarText;
  updateAvatarText: (participantId: string, text: string) => void;
}

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

export interface Sujet {
  idsujet: number;
  nomsujet: string;
  iddomaine: number;
  idcategoriesujet: number;
  description?: string;
}
// Mise à jour dans types.tsx
export interface AppContextType {
  // Activités et Avis
  pratiques: Pratique[];
  isLoadingPratiques: boolean;
  fetchReviewsForPractice: (id: number) => void;
  reviews: any[];
  averageRating: number | null;
  categoriesPratiques: CategoriePratique[];
  subjectPracticeRelations: RelationSujetPratique[];
  sujetsForActivite: number[]; // Contient les sujets liés à l'activité actuelle
  fetchSujetsForActivite: (idActivite: number) => Promise<void>;
  syncPratiquesForActiviteFromMap: (
    postitToPratiqueMap: Record<number, string | null>,
    idActivite: number,
    allPratiques: Pratique[]
  ) => Promise<void>;

  toggleSujet: (idActivite: number, sujet: Item) => Promise<void>;

  // Domaines et Sujets
  domains: Domaine[];
  selectedDomain: string;
  selectDomain: (domain: string) => void;
  sujetsData: Sujet[];
  categoriesSujets: CategorieSujet[];
  isLoadingDomains: boolean;
  isLoadingSujets: boolean;
  isLoadingCategoriesSujets: boolean;

  // Nudges
  nudges: any[];
  setNudges: React.Dispatch<React.SetStateAction<Nudge[]>>;
  fetchNudgesForPractice: (idpratique: number) => Promise<Nudge[]>;
  fetchNudgesForActivity: (id: number) => void;
  refreshNudgesFunction: () => void;
  refreshNudges: () => void;
  updateNudgeDates: (newDates: any) => void;
  nudgeDates: any;
  nudgesUpdated: boolean;
  markNudgesAsUpdated: () => void;
  resetNudgesUpdated: () => void;

  // UI et Navigation
  drawerOpen: boolean;
  toggleDrawer: () => void;
  drawerContent: any;
  setDrawerContent: (content: any) => void;
  handleOpenDrawerWithContent: (content: any) => void;
  handleOpenDrawerWithData: (idPratique: number, initialType: string) => void;

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
  selectedSujet: Sujet | null;
  handleSelectSujet: (sujet: Sujet) => void;
  selectedPratique: Pratique | null;
  handleSelectPratique: (pratique: Pratique | null) => void;

  highlightedPractices: number[];
  calculateHighlightedPractices: (
    disabledSubjects: number[],
    relations: any[]
  ) => void;
  resetSelectedState: () => void;
  avatarTexts: Record<number, string>;
  updateAvatarText: (index: number, text: string) => void;
  selectedPostitIds: number[];
  setSelectedPostitIds: (ids: number[]) => void;
  postits: Postit[]; // Assurez-vous que 'postits' est bien ici

  // Post-it sélectionné
  selectedPostit: Postit | null;
  setSelectedPostit: (postit: Postit | null) => void;

  // Sujets de l’activité (initialement chargés)
  initialSujetsForActivite: number[];
  setSujetsForActivite: (ids: number[]) => void;

  // Sync depuis postitToSujetMap (hook useSelection)
  syncSujetsForActiviteFromMap: (
    postitToSujetMap: Record<number, number | null>,
    idActivite: number
  ) => Promise<void>;

  // Authentification
  user: any;
  isLoading: boolean;
}

export interface UseDomainsResult {
  domains: Domaine[];
  isLoadingDomains: boolean;
  isErrorDomains: boolean;
  domainNames: Record<number, string>;
  fetchDomains: () => Promise<void>;

  sujets: Sujet[];
  isLoadingSujets: boolean;
  categoriesSujets: CategorieSujet[];
  isLoadingCategoriesSujets: boolean;
  selectedDomain: string;
  setSelectedDomain: (domainId: string) => void;
  selectDomain: (domainId: string) => void; // Alias pour `setSelectedDomain`
  sujetsData: Sujet[];
}

// 🔹 Définition d'un marqueur sur la timeline
export interface TimelineMarker {
  id: number;
  time: number; // En secondes
  label: string;
}

// 🔹 Props attendues par TimeLineAudio
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

// 🔹 Structure d'un Quiz
export interface Quiz {
  quizid: number;
  question: string;
  answers: string[];
  correctAnswerIndex: number;
}

// 🔹 Association des timestamps aux quiz
export type QuizTimestampMap = Record<number, Quiz>; // ✅ Ajouté

// 🔹 Résultat du hook `useQuiz`
export interface UseQuizResult {
  quizzes: Quiz[]; // Liste des quiz disponibles
  quizTimestampMap: QuizTimestampMap; // Mapping des quiz par timestamp
  fetchQuizzes: () => Promise<void>;
  addQuiz: (quiz: Quiz) => Promise<void>;
  updateQuiz: (quizId: number, updatedQuiz: Partial<Quiz>) => Promise<void>;
  deleteQuiz: (quizId: number) => Promise<void>;
}

export interface UseZonesResult {
  zoneTexts: ZoneTexts;
  selectTextForZone: (text: string, zone: keyof ZoneTexts) => void;
}

// Type pour un post-it dans le jeu de rôle
export interface RolePlayPostit {
  id: string;
  content: string;
  zone: string;
  color: string;
}

// Type pour les données complètes d'un jeu de rôle
export interface RolePlayData {
  callId: number;
  postits: RolePlayPostit[];
  clientText?: string;
  date: string;
}

export interface RolePlayDataRecord {
  id: number;
  call_id: number;
  postit_id: number;
  note: RolePlayData;
  type: string;
  created_at: string;
}
