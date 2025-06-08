import { AlertColor } from "@mui/material";

/**
 * Type pour représenter un post-it dans le jeu de rôle
 */
export interface PostitType {
  id: string;
  content: string;
  zone: string;
  color: string;
  isOriginal: boolean;
}

/**
 * Type représentant les données d'un appel
 */
export interface CallData {
  callid: string;
  date: string;
  title?: string;
  duration?: number;
  agent?: string;
  transcription?: string;
  // Autres propriétés d'un appel
}

/**
 * Type représentant un post-it sélectionné pour le jeu de rôle
 */
export interface SelectedPostitType {
  id: string;
  text: string;
  pratique?: string;
  timestamp?: number;
  // Autres propriétés du post-it
}

/**
 * Type pour les données du jeu de rôle
 */
export interface RolePlayData {
  postits: PostitType[];
  clientText?: string;
  conseillerText?: string;
}

/**
 * Type étendu pour les données du jeu de rôle avec des informations supplémentaires
 */
export interface ExtendedRolePlayData extends RolePlayData {
  callId: string;
  date: string;
}

/**
 * Type pour le contexte des données d'appel
 * CORRECTION: Ajout de setTranscriptSelectionMode
 */
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

/**
 * Type pour le contexte audio
 */
export interface AudioContextType {
  audioSrc: string | null;
  play: () => void;
  pause: () => void;
  seekTo: (time: number) => void;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}

/**
 * Interface pour les propriétés de la zone de drop
 */
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

// Nouveaux types pour TTS
export interface TTSState {
  isPlaying: boolean;
  currentPlayingId: string | null;
  currentText: string;
  playingType: "postit" | "zone" | "global" | null;
}

export interface TTSCache {
  [key: string]: string; // ID -> Audio URL blob
}

/**
 * Interface pour les propriétés de la section de réponse client
 */
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

/**
 * Interface pour les propriétés de la section d'amélioration
 */
export interface ImprovementSectionProps {
  selectedClientText: string;
  postits: PostitType[];
  onAddSuggestion: (zone: string, content: string) => void;
  onEditPostit: (id: string, newContent: string) => void;
  onDeletePostit: (id: string) => void;
  fontSize: number;
  zoneColors: Record<string, string>;
}

/**
 * Interface pour les propriétés de la boîte de dialogue d'édition
 */
export interface EditPostitDialogProps {
  open: boolean;
  content: string;
  onContentChange: (content: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export interface EditDialogProps {
  open: boolean;
  content: string;
  onContentChange: (content: string) => void;
  onClose: () => void;
  onSave: () => void;
}

/**
 * Interface pour les propriétés de la boîte de dialogue de catégorie
 */
export interface CategoryDialogProps {
  open: boolean;
  text: string;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onClose: () => void;
  onSave: () => void;
}

/**
 * Interface pour les propriétés du composant de reconnaissance vocale
 */
export interface SpeechToTextProps {
  onAddPostits: (postits: PostitType[]) => void;
  isContextual?: boolean;
}

/**
 * Interface pour les propriétés de la barre d'outils
 */
export interface ToolBarProps {
  title: string;
  fontSize: number;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  onSave: () => void;
  isLoading: boolean;
  mode: string;
}

/**
 * Interface pour les propriétés de l'en-tête des étapes
 * CORRECTION: Ajout des props manquantes
 */
export interface StepperHeaderProps {
  steps: string[];
  activeStep: number;
  mode: string;
  // AJOUT: Propriétés manquantes pour la navigation
  onStepClick: (stepIndex: number) => void;
  canNavigateToStep: (stepIndex: number) => boolean;
}

/**
 * Interface pour les propriétés de la navigation entre étapes
 */
export interface StepNavigationProps {
  activeStep: number;
  stepsLength: number;
  handleBack: () => void;
  handleNext: () => void;
  canProceedToNextStep: boolean;
  mode: string;
}

/**
 * Interface pour les propriétés de l'étape finale
 */
export interface FinalReviewStepProps {
  mode: string;
}

/**
 * Interface pour les propriétés du hook usePostits
 */
export interface UsePostitsProps {
  zoneColors: Record<string, string>;
  rolePlayData: ExtendedRolePlayData | null;
  selectedPostitForRolePlay: SelectedPostitType | null;
}

/**
 * Interface pour les propriétés du hook useDragAndDrop
 */
export interface UseDragAndDropProps {
  postits: PostitType[];
  setPostits: React.Dispatch<React.SetStateAction<PostitType[]>>;
  zoneColors: Record<string, string>;
}

/**
 * Interface pour les propriétés du hook useStepNavigation
 */
export interface UseStepNavigationProps {
  steps: string[];
  postitsState: {
    postits: PostitType[];
    selectedClientText: string;
    selectedConseillerText: string;
  };
}

/**
 * Interface pour l'état et les fonctions retournées par le hook useStepNavigation
 */
export interface StepNavigationState {
  activeStep: number;
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
  handleNext: () => void;
  handleBack: () => void;
  canProceedToNextStep: () => boolean;
}

/**
 * Interface pour l'état et les fonctions retournées par le hook useNotifications
 * CORRECTION: Changement du type severity pour être compatible
 */
export interface NotificationState {
  snackbarOpen: boolean;
  snackbarMessage: string;
  snackbarSeverity: AlertColor;
  // CORRECTION: Changement du type de severity de string à AlertColor pour la compatibilité
  showNotification: (message: string, severity?: AlertColor) => void;
  handleSnackbarClose: () => void;
}

/**
 * AJOUT: Interface pour les paramètres de renderStepContent
 * Cette interface définit les propriétés attendues par la fonction renderStepContent
 * SIMPLIFIÉE pour éviter les erreurs TypeScript
 */
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
