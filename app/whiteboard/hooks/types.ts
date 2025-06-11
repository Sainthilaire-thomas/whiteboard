// app/whiteboard/hooks/types.ts
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

export interface UseSharedEvaluationReturn {
  activeSessions: SharedEvaluationSession[];
  currentSession: SharedEvaluationSession | null;
  isLoading: boolean;
  error: string | null;
  refreshSessions: () => Promise<void>;
  selectSession: (sessionId: string) => void;
  clearCurrentSession: () => void;
}

export interface ActiveSessionsResponse {
  success: boolean;
  sessions: SharedEvaluationSession[];
  count: number;
  error?: string;
}
