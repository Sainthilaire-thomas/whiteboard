// app/evaluation/components/ShareEvaluationButton/types.ts
// Version mise à jour avec les nouvelles méthodes Realtime Phase 3

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
