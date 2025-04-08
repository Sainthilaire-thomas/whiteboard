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
 */
export interface StepperHeaderProps {
  steps: string[];
  activeStep: number;
  mode: string;
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
 */
export interface NotificationState {
  snackbarOpen: boolean;
  snackbarMessage: string;
  snackbarSeverity: AlertColor;
  showNotification: (message: string, severity?: AlertColor) => void;
  handleSnackbarClose: () => void;
}
