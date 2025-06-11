// app/whiteboard/hooks/useSharedEvaluation.tsx
// Version améliorée : Toujours essayer l'API même avec Context

"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { useWhiteboardSharedEvaluation } from "@/context/SharedEvaluationContext";
import type { SharedEvaluationSession as ContextSession } from "@/context/SharedEvaluationContext";
import {
  SharedEvaluationSession as WhiteboardSession,
  UseSharedEvaluationReturn,
} from "./types";

// ===================================
// FONCTION D'ADAPTATION DES TYPES
// ===================================

const adaptContextSessionToWhiteboard = (
  contextSession: ContextSession
): WhiteboardSession => {
  return {
    id: contextSession.id,
    coach_user_id: contextSession.coachId,
    coach_name: `Coach-${contextSession.coachId.slice(0, 8)}`,
    call_id: contextSession.callId,
    call_title: `Appel #${contextSession.callId}`,
    session_name: contextSession.sessionName,
    audio_position: contextSession.audioPosition,
    session_mode: contextSession.mode,
    is_active: contextSession.isActive,
    show_participant_tops: contextSession.showParticipantTops,
    show_tops_realtime: contextSession.showTopsRealtime,
    anonymous_mode: contextSession.anonymousMode,
    created_at: contextSession.createdAt,
    updated_at: contextSession.createdAt,
  };
};

// ===================================
// FONCTION API AMÉLIORÉE
// ===================================

const callAPI = async (endpoint: string) => {
  try {
    console.log(`🔍 DEBUG Whiteboard API Call: GET ${endpoint}`);

    const response = await fetch(endpoint);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `Erreur HTTP ${response.status}`,
      }));
      console.error("❌ API Error:", errorData);
      throw new Error(errorData.error || errorData.message);
    }

    const data = await response.json();
    console.log(`✅ DEBUG Whiteboard API Success:`, {
      success: data.success,
      sessionCount: data.sessions?.length || 0,
      sessions: data.sessions?.map((s: any) => ({
        id: s.id?.slice(0, 8) + "...",
        name: s.session_name,
        callId: s.call_id,
        mode: s.session_mode,
      })),
    });
    return data;
  } catch (error) {
    console.error("❌ DEBUG Whiteboard API Error:", error);
    throw error;
  }
};

// ===================================
// HOOK PRINCIPAL AMÉLIORÉ
// ===================================

export function useSharedEvaluation(
  whiteboardId?: string
): UseSharedEvaluationReturn {
  console.log("🚀 useSharedEvaluation INIT:", { whiteboardId });

  // États locaux
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiSessions, setApiSessions] = useState<WhiteboardSession[]>([]);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Context (pour sessions en cours dans le même onglet)
  const {
    activeSessions: contextSessions,
    currentSession: contextCurrentSession,
    hasActiveSessions,
  } = useWhiteboardSharedEvaluation();

  // ✅ Adapter sessions Context
  const adaptedContextSessions = useMemo((): WhiteboardSession[] => {
    const adapted = contextSessions.map(adaptContextSessionToWhiteboard);
    console.log("🔄 Adaptation Context sessions:", {
      contextCount: contextSessions.length,
      adaptedCount: adapted.length,
    });
    return adapted;
  }, [contextSessions]);

  // ✅ STRATÉGIE HYBRIDE : Context + API
  const activeSessions = useMemo(() => {
    // Si Context a des sessions, les utiliser
    if (adaptedContextSessions.length > 0) {
      console.log(
        "✅ Utilisation sessions Context:",
        adaptedContextSessions.length
      );
      return adaptedContextSessions;
    }

    // Sinon, utiliser API
    console.log("✅ Utilisation sessions API:", apiSessions.length);
    return apiSessions;
  }, [adaptedContextSessions, apiSessions]);

  // Session courante
  const currentSession = useMemo((): WhiteboardSession | null => {
    if (contextCurrentSession) {
      return adaptContextSessionToWhiteboard(contextCurrentSession);
    }
    return activeSessions.length > 0 ? activeSessions[0] : null;
  }, [contextCurrentSession, activeSessions]);

  // ===================================
  // RÉCUPÉRATION API SYSTÉMATIQUE
  // ===================================

  const refreshSessions = useCallback(async () => {
    console.log("🔄 refreshSessions appelé:", {
      hasContextSessions: adaptedContextSessions.length > 0,
      hasApiSessions: apiSessions.length > 0,
      initialLoadDone,
    });

    setIsLoading(true);
    setError(null);

    try {
      const endpoint = whiteboardId
        ? `/api/evaluation-sharing/active-sessions?whiteboardId=${whiteboardId}`
        : `/api/evaluation-sharing/active-sessions`;

      const data = await callAPI(endpoint);

      if (data.success && Array.isArray(data.sessions)) {
        console.log("✅ Sessions API récupérées avec succès:", {
          count: data.sessions.length,
          sessionIds: data.sessions.map((s: any) => s.id?.slice(0, 8) + "..."),
        });

        // Les sessions API sont déjà au bon format WhiteboardSession
        setApiSessions(data.sessions);
        setInitialLoadDone(true);
      } else {
        console.log("ℹ️ Aucune session active trouvée via API");
        setApiSessions([]);
        setInitialLoadDone(true);
      }
    } catch (err: any) {
      console.error("❌ Erreur refreshSessions:", err);
      setError(err.message || "Erreur lors de la récupération des sessions");
      setApiSessions([]);
      setInitialLoadDone(true);
    } finally {
      setIsLoading(false);
    }
  }, [
    whiteboardId,
    adaptedContextSessions.length,
    apiSessions.length,
    initialLoadDone,
  ]);

  // ✅ CHARGEMENT INITIAL SYSTÉMATIQUE
  useEffect(() => {
    console.log("🚀 useSharedEvaluation - Chargement initial");
    refreshSessions();
  }, []); // Pas de dépendances pour éviter les boucles

  // ✅ Auto-refresh périodique
  useEffect(() => {
    if (!initialLoadDone) return;

    const interval = setInterval(() => {
      console.log("⏰ Auto-refresh sessions");
      refreshSessions();
    }, 30000); // 30 secondes

    return () => clearInterval(interval);
  }, [initialLoadDone, refreshSessions]);

  // ===================================
  // ACTIONS
  // ===================================

  const selectSession = useCallback(
    (sessionId: string) => {
      console.log("📌 selectSession:", sessionId);
      const session = activeSessions.find((s) => s.id === sessionId);
      if (session) {
        console.log("✅ Session trouvée:", session.session_name);
      } else {
        console.warn("⚠️ Session non trouvée:", sessionId);
      }
    },
    [activeSessions]
  );

  const clearCurrentSession = useCallback(() => {
    console.log("🧹 clearCurrentSession");
  }, []);

  // ===================================
  // DEBUG FINAL
  // ===================================

  console.log("🔍 useSharedEvaluation STATE:", {
    contextSessions: contextSessions.length,
    adaptedContextSessions: adaptedContextSessions.length,
    apiSessions: apiSessions.length,
    totalActiveSessions: activeSessions.length,
    currentSessionId: currentSession?.id?.slice(0, 8) + "...",
    currentSessionName: currentSession?.session_name,
    currentSessionCallId: currentSession?.call_id,
    hasActiveSessions,
    isLoading,
    error,
    initialLoadDone,
  });

  return {
    activeSessions,
    currentSession,
    isLoading,
    error,
    refreshSessions,
    selectSession,
    clearCurrentSession,
  };
}

export default useSharedEvaluation;
