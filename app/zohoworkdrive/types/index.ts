// zohoworkdrive/types/index.ts
// Types autonomes pour le module zohoworkdrive
// Dupliqués depuis les types globaux pour rendre le module indépendant

// ✅ Interface Call spécifique au module zohoworkdrive
export interface Call {
  callid: number;
  filename: string;
  description?: string;
  filepath?: string;
  audiourl?: string | null;
}

// ✅ Interface pour l'état de confirmation de suppression
export interface ConfirmDeleteState {
  open: boolean;
  callId: number | null;
  filePath: string | null;
}

// ✅ Interface pour les erreurs d'API
export interface ApiError extends Error {
  message: string;
}

// ✅ Props du composant EnterpriseCallsList
export interface EnterpriseCallsListProps {
  entrepriseId: number | null;
}

// ✅ Props du composant WorkdriveExplorer
export interface WorkdriveExplorerProps {
  initialToken: ZohoAuthToken | null;
  entrepriseId: number | null;
}

// ✅ Interface pour le contexte des appels (subset des méthodes utilisées)
export interface CallDataContextType {
  calls: Call[];
  fetchCalls: (entrepriseId: number) => Promise<void>;
  isLoadingCalls: boolean;
  selectCall: (call: Call) => void;
}

// ✅ Types pour les entreprises si nécessaire
export interface Entreprise {
  id: number;
  nom: string;
  identreprise: number;
  nomentreprise: string;
}

// ✅ Interface pour les activités liées aux appels
export interface CallActivityRelation {
  activityid: number;
  activitesconseillers: { nature: string }[];
}

// ✅ Version étendue de Call avec relations si nécessaire
export interface CallWithRelations extends Call {
  callactivityrelation?: CallActivityRelation[];
}

// ✅ Types Zoho Workdrive autonomes
export interface ZohoAuthToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number; // timestamp when the token expires
  api_domain?: string; // ✅ Ajout de la propriété manquante
}

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

export interface ZohoWorkdriveResponse {
  data: ZohoFile[];
  nextPageToken?: string;
}

export interface ZohoError {
  code: string;
  message: string;
  details?: any;
}

// ✅ Types pour removeCallUpload
export interface RemoveCallUploadResult {
  success: boolean;
}

export interface Transcript {
  transcriptid: number;
}

export interface Word {
  wordid: number;
  transcriptid: number;
  text: string;
  startTime: number;
  endTime: number;
}

// ✅ Types pour Supabase utilities
export interface SupabaseStorageOptions {
  expiration?: number;
  bucket?: string;
}

export interface SignedUrlResult {
  signedUrl: string;
  error?: string;
}

// ✅ Types pour les gestionnaires d'événements
export interface TabChangeEvent {
  event: React.SyntheticEvent;
  newValue: number;
}

export interface EntrepriseSelectEvent {
  target: {
    value: string | number;
  };
}
