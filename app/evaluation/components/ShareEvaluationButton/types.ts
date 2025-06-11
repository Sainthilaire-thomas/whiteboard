// types.ts - Module Evaluation ShareEvaluationButton
// Version corrigée avec la nouvelle fonction checkActiveSessionsForCoach

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

export interface UseEvaluationSharingReturn {
  // État
  isSharing: boolean;
  isLoading: boolean;
  error: string | null;
  currentSession: SharedEvaluationSession | null;

  // Actions principales
  startSharing: (sessionName: string) => Promise<void>;
  stopSharing: () => Promise<void>;

  // Actions de contrôle
  updateAudioPosition: (position: number) => Promise<void>;
  updateSessionMode: (mode: "live" | "paused" | "ended") => Promise<void>;
  updateObjectivityControls: (controls: {
    show_participant_tops?: boolean;
    show_tops_realtime?: boolean;
    anonymous_mode?: boolean;
  }) => Promise<void>;

  // Actions utilitaires
  clearError: () => void;

  // ✅ NOUVEAU : Fonction de récupération automatique des sessions actives
  checkActiveSessionsForCoach: () => Promise<void>;
}

export interface ShareEvaluationButtonProps {
  callId: string | number | null | undefined;
  sx?: object;
}

export interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (sessionName: string) => void;
  isLoading: boolean;
}
