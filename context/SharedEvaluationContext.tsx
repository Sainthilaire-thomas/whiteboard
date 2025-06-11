// app/context/SharedEvaluationContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useCallData } from "./CallDataContext";

// ===================================
// TYPES
// ===================================

interface SharedEvaluationSession {
  id: string;
  sessionName: string;
  callId: number;
  coachId: string;
  mode: "live" | "paused" | "ended";
  audioPosition: number;
  isActive: boolean;
  createdAt: string;
  // Contrôles objectivité
  showParticipantTops: boolean;
  showTopsRealtime: boolean;
  anonymousMode: boolean;
}

interface SharedEvaluationContextType {
  // État principal
  activeSession: SharedEvaluationSession | null;

  // Actions principales
  setSessionActive: (sessionData: SharedEvaluationSession) => void;
  setSessionInactive: () => void;
  updateSession: (updates: Partial<SharedEvaluationSession>) => void;

  // États dérivés pour l'UI
  hasActiveSession: boolean;
  isCurrentCallShared: boolean;
  activeSessionCallId: number | null;

  // Debug/info
  lastUpdated: string | null;
}

// ===================================
// CONTEXT CREATION
// ===================================

const SharedEvaluationContext = createContext<
  SharedEvaluationContextType | undefined
>(undefined);

// Hook pour utiliser le context avec validation
export const useSharedEvaluationContext = () => {
  const context = useContext(SharedEvaluationContext);
  if (!context) {
    throw new Error(
      "useSharedEvaluationContext must be used within a SharedEvaluationProvider"
    );
  }
  return context;
};

// ===================================
// PROVIDER
// ===================================

interface SharedEvaluationProviderProps {
  children: ReactNode;
}

export const SharedEvaluationProvider = ({
  children,
}: SharedEvaluationProviderProps) => {
  // État principal : une seule session active max
  const [activeSession, setActiveSession] =
    useState<SharedEvaluationSession | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Accès au selectedCall via CallDataContext
  const { selectedCall } = useCallData();

  // ===================================
  // AUTO-CLEANUP SUR CHANGEMENT D'APPEL
  // ===================================

  useEffect(() => {
    // Si on a une session active et qu'on change d'appel vers un autre appel
    if (
      activeSession?.isActive &&
      activeSession.callId !== selectedCall?.callid &&
      selectedCall?.callid
    ) {
      console.log("🔄 SharedEvaluationContext: Changement d'appel détecté", {
        sessionCallId: activeSession.callId,
        newCallId: selectedCall.callid,
        sessionName: activeSession.sessionName,
      });

      // Auto-cleanup : nettoyer la session locale
      // (La session reste dans Supabase, juste plus dans l'état local)
      setActiveSession(null);
      setLastUpdated(new Date().toISOString());

      console.log("✅ Session nettoyée automatiquement");
    }
  }, [selectedCall?.callid, activeSession]);

  // ===================================
  // ACTIONS
  // ===================================

  const setSessionActive = useCallback(
    (sessionData: SharedEvaluationSession) => {
      console.log("🚀 SharedEvaluationContext: Activation session", {
        sessionId: sessionData.id,
        sessionName: sessionData.sessionName,
        callId: sessionData.callId,
        mode: sessionData.mode,
      });

      setActiveSession(sessionData);
      setLastUpdated(new Date().toISOString());
    },
    []
  );

  const setSessionInactive = useCallback(() => {
    console.log("🛑 SharedEvaluationContext: Désactivation session", {
      previousSessionId: activeSession?.id,
      previousCallId: activeSession?.callId,
    });

    setActiveSession(null);
    setLastUpdated(new Date().toISOString());
  }, [activeSession]);

  const updateSession = useCallback(
    (updates: Partial<SharedEvaluationSession>) => {
      if (!activeSession) {
        console.warn("⚠️ Tentative de mise à jour sans session active");
        return;
      }

      console.log("🔄 SharedEvaluationContext: Mise à jour session", {
        sessionId: activeSession.id,
        updates,
      });

      setActiveSession((prev) => (prev ? { ...prev, ...updates } : null));
      setLastUpdated(new Date().toISOString());
    },
    [activeSession]
  );

  // ===================================
  // ÉTATS DÉRIVÉS
  // ===================================

  const hasActiveSession = !!activeSession?.isActive;

  const isCurrentCallShared =
    hasActiveSession && activeSession?.callId === selectedCall?.callid;

  const activeSessionCallId = activeSession?.callId || null;

  // ===================================
  // DEBUG LOGGING
  // ===================================

  useEffect(() => {
    console.log("🔍 SharedEvaluationContext: État mis à jour", {
      hasActiveSession,
      isCurrentCallShared,
      activeSessionCallId,
      selectedCallId: selectedCall?.callid,
      sessionName: activeSession?.sessionName,
      lastUpdated,
    });
  }, [
    hasActiveSession,
    isCurrentCallShared,
    activeSessionCallId,
    selectedCall?.callid,
    activeSession,
    lastUpdated,
  ]);

  // ===================================
  // PROVIDER VALUE
  // ===================================

  const contextValue: SharedEvaluationContextType = {
    // État
    activeSession,

    // Actions
    setSessionActive,
    setSessionInactive,
    updateSession,

    // États dérivés
    hasActiveSession,
    isCurrentCallShared,
    activeSessionCallId,

    // Debug
    lastUpdated,
  };

  return (
    <SharedEvaluationContext.Provider value={contextValue}>
      {children}
    </SharedEvaluationContext.Provider>
  );
};

// ===================================
// HOOKS SPÉCIALISÉS
// ===================================

// Hook pour les composants Evaluation (Coach)
export const useEvaluationSharingState = () => {
  const {
    activeSession,
    hasActiveSession,
    isCurrentCallShared,
    activeSessionCallId,
    setSessionActive,
    setSessionInactive,
    updateSession,
  } = useSharedEvaluationContext();

  const { selectedCall } = useCallData();

  return {
    // États pour l'UI Evaluation
    isSharing: isCurrentCallShared,
    hasAnyActiveSession: hasActiveSession,
    activeSessionCallId,
    currentSession: activeSession,

    // Informations pour affichage de conflit
    hasConflictingSession: hasActiveSession && !isCurrentCallShared,
    conflictingSessionName:
      hasActiveSession && !isCurrentCallShared
        ? activeSession?.sessionName
        : null,

    // Actions pour synchroniser avec useEvaluationSharing existant
    syncSessionCreated: useCallback(
      (sessionData: {
        sessionId: string;
        callId: number;
        sessionName: string;
        mode: "live" | "paused" | "ended";
        coachId: string;
        audioPosition?: number;
        showParticipantTops?: boolean;
        showTopsRealtime?: boolean;
        anonymousMode?: boolean;
      }) => {
        setSessionActive({
          id: sessionData.sessionId,
          sessionName: sessionData.sessionName,
          callId: sessionData.callId,
          coachId: sessionData.coachId,
          mode: sessionData.mode,
          audioPosition: sessionData.audioPosition || 0,
          isActive: true,
          createdAt: new Date().toISOString(),
          showParticipantTops: sessionData.showParticipantTops || false,
          showTopsRealtime: sessionData.showTopsRealtime || false,
          anonymousMode: sessionData.anonymousMode !== false, // true par défaut
        });
      },
      [setSessionActive]
    ),

    syncSessionStopped: useCallback(() => {
      setSessionInactive();
    }, [setSessionInactive]),

    syncSessionUpdated: useCallback(
      (updates: {
        mode?: "live" | "paused" | "ended";
        audioPosition?: number;
        showParticipantTops?: boolean;
        showTopsRealtime?: boolean;
        anonymousMode?: boolean;
      }) => {
        updateSession(updates);
      },
      [updateSession]
    ),
  };
};

// Hook pour les composants Whiteboard (Participants)
export const useWhiteboardSharedEvaluation = () => {
  const { activeSession, hasActiveSession, updateSession } =
    useSharedEvaluationContext();

  return {
    // États pour l'UI Whiteboard
    activeSessions: hasActiveSession && activeSession ? [activeSession] : [],
    currentSession: activeSession,
    hasActiveSessions: hasActiveSession,

    // Actions spécifiques Whiteboard (si nécessaire)
    updateAudioPosition: useCallback(
      (position: number) => {
        updateSession({ audioPosition: position });
      },
      [updateSession]
    ),

    updateMode: useCallback(
      (mode: "live" | "paused" | "ended") => {
        updateSession({ mode });
      },
      [updateSession]
    ),

    // Méthodes utilitaires
    isSessionLive: activeSession?.mode === "live",
    sessionAudioPosition: activeSession?.audioPosition || 0,
  };
};

// ===================================
// EXPORTS
// ===================================

export default SharedEvaluationProvider;
export type { SharedEvaluationSession, SharedEvaluationContextType };
