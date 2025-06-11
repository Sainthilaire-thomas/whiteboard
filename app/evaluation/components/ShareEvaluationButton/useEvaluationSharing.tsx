// app/evaluation/components/ShareEvaluationButton/useEvaluationSharing.tsx
// Version corrigée qui reset la session quand on change d'appel

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { useEvaluationSharingState } from "@/context/SharedEvaluationContext";
import type {
  SharedEvaluationSession,
  UseEvaluationSharingReturn,
} from "./types";

// ✅ Fonction API avec gestion d'erreurs robuste (inchangée)
const callServerAPI = async (
  endpoint: string,
  method: string = "GET",
  body?: any
) => {
  try {
    console.log(
      `🔍 DEBUG API Call: ${method} /api/evaluation-sharing/${endpoint}`,
      {
        body: body ? JSON.stringify(body) : "no body",
      }
    );

    const { data, error: sessionError } =
      await supabaseClient.auth.getSession();

    if (sessionError) {
      console.error("❌ DEBUG: Session error:", sessionError);
      throw new Error(`Erreur de session: ${sessionError.message}`);
    }

    if (!data.session?.access_token) {
      console.error("❌ DEBUG: No access token available");
      throw new Error("Session non valide - veuillez vous reconnecter");
    }

    console.log("✅ DEBUG: Found valid session with token for API call");

    const headers: any = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${data.session.access_token}`,
    };

    const response = await fetch(`/api/evaluation-sharing/${endpoint}`, {
      method,
      headers,
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
    });

    console.log(
      `🔍 DEBUG API Response: ${response.status} ${response.statusText}`
    );

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: `Erreur HTTP ${response.status}` };
      }

      console.error("❌ DEBUG API Error Response:", errorData);

      if (response.status === 401) {
        throw new Error("Session expirée - veuillez recharger la page");
      }

      if (response.status === 409) {
        throw new Error(
          errorData.error ||
            errorData.message ||
            "Une session de partage est déjà active pour cet appel"
        );
      }

      throw new Error(
        errorData.error || errorData.message || `Erreur ${response.status}`
      );
    }

    const responseData = await response.json();
    console.log(`✅ DEBUG API Success:`, responseData);
    return responseData;
  } catch (error) {
    console.error("❌ DEBUG API Network Error:", error);
    throw error;
  }
};

export const useEvaluationSharing = (
  callId: string | number | null | undefined
): UseEvaluationSharingReturn => {
  // États locaux
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSession, setCurrentSession] =
    useState<SharedEvaluationSession | null>(null);

  // États pour l'authentification Supabase
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // États pour l'initialisation et le recovery
  const [hasInitialized, setHasInitialized] = useState(false);
  const [recoveryAttempted, setRecoveryAttempted] = useState(false);

  // ✅ Intégration avec le Context
  const {
    isSharing: contextIsSharing,
    syncSessionCreated,
    syncSessionStopped,
    syncSessionUpdated,
  } = useEvaluationSharingState();

  // Convertir callId en string pour la cohérence
  const callIdString = useMemo(() => {
    if (callId === null || callId === undefined || callId === "") {
      return null;
    }
    const stringValue = String(callId);
    if (
      stringValue === "undefined" ||
      stringValue === "null" ||
      stringValue === ""
    ) {
      return null;
    }
    return stringValue;
  }, [callId]);

  // ✅ NOUVEAU: Effect pour reset la session quand callId change
  useEffect(() => {
    console.log("🔍 DEBUG: callIdString changed, checking session validity", {
      callIdString,
      currentSessionCallId: currentSession?.call_id,
      hasCurrentSession: !!currentSession,
    });

    // Si on a une session active mais pour un autre appel, la reset
    if (currentSession && callIdString) {
      const sessionCallId = String(currentSession.call_id);
      if (sessionCallId !== callIdString) {
        console.log("🔄 DEBUG: Call changed - resetting session state", {
          sessionCallId,
          newCallId: callIdString,
        });

        setCurrentSession(null);
        setError(null);

        // Synchroniser avec le Context
        syncSessionStopped();
      }
    }

    // Si callId devient null/undefined, reset aussi
    if (!callIdString && currentSession) {
      console.log("🔄 DEBUG: CallId is null - resetting session state");
      setCurrentSession(null);
      setError(null);
      syncSessionStopped();
    }
  }, [callIdString, currentSession, syncSessionStopped]);

  // ✅ Authentification Supabase avec retry logic (inchangé)
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("🔍 DEBUG: Initializing Supabase auth...");

        await new Promise((resolve) => setTimeout(resolve, 100));

        const { data, error: sessionError } =
          await supabaseClient.auth.getSession();

        if (sessionError) {
          console.error("❌ DEBUG: Error getting session:", sessionError);
          setUser(null);
          setIsAuthenticated(false);
        } else if (data.session?.user) {
          console.log("✅ DEBUG: Found existing session:", {
            userId: data.session.user.id,
            email: data.session.user.email,
            hasAccessToken: !!data.session.access_token,
          });
          setUser(data.session.user);
          setIsAuthenticated(true);
        } else {
          console.log("ℹ️ DEBUG: No existing session found");
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("❌ DEBUG: Error in auth initialization:", err);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setAuthLoading(false);
        console.log("✅ DEBUG: Auth initialization complete");
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((event, session) => {
      console.log("🔍 DEBUG Auth State Change:", {
        event,
        hasSession: !!session,
        userId: session?.user?.id,
        hasAccessToken: !!session?.access_token,
      });

      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);

        if (event === "SIGNED_IN" && !recoveryAttempted) {
          console.log("🚀 DEBUG: Auth reconnected, triggering recovery...");
          setRecoveryAttempted(false);
          setHasInitialized(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setCurrentSession(null);
      }
      setAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [recoveryAttempted]);

  // ✅ Auto-récupération sessions actives (inchangé)
  const checkActiveSessionsForCoach = useCallback(async () => {
    if (authLoading || !user?.id || recoveryAttempted) {
      console.log("🔍 DEBUG: Skipping session recovery", {
        authLoading,
        hasUser: !!user?.id,
        recoveryAttempted,
      });
      return;
    }

    console.log("🔍 DEBUG: Starting session recovery for coach:", user.id);
    setRecoveryAttempted(true);

    try {
      const data = await callServerAPI(
        `check-session?userId=${user.id}&checkAll=true`
      );

      console.log("🔍 DEBUG: Session recovery result:", data);

      if (data.session) {
        console.log("✅ DEBUG: Active session found, restoring state:", {
          sessionId: data.session.id,
          sessionName: data.session.session_name,
          callId: data.session.call_id,
          isActive: data.session.is_active,
        });

        setCurrentSession(data.session);
        setError(null);

        syncSessionCreated({
          sessionId: data.session.id,
          callId: data.session.call_id,
          sessionName: data.session.session_name,
          mode: data.session.session_mode,
          coachId: data.session.coach_user_id,
          audioPosition: data.session.audio_position,
          showParticipantTops: data.session.show_participant_tops,
          showTopsRealtime: data.session.show_tops_realtime,
          anonymousMode: data.session.anonymous_mode,
        });

        console.log("✅ DEBUG: Session state restored successfully");
      } else {
        console.log("ℹ️ DEBUG: No active sessions found (normal)");
        setCurrentSession(null);
      }
    } catch (err: any) {
      console.error("❌ DEBUG: Error in session recovery:", err);
      setCurrentSession(null);

      if (!err.message?.includes("Session expirée")) {
        setError(`Erreur lors de la récupération de session: ${err.message}`);
      }
    }
  }, [authLoading, user?.id, recoveryAttempted, syncSessionCreated]);

  // ✅ Initialisation automatique avec délai (inchangé)
  useEffect(() => {
    if (!authLoading && user?.id && !hasInitialized) {
      console.log("🚀 DEBUG: Triggering initial session recovery...");

      const timeoutId = setTimeout(() => {
        checkActiveSessionsForCoach();
        setHasInitialized(true);
      }, 200);

      return () => clearTimeout(timeoutId);
    }
  }, [authLoading, user?.id, hasInitialized, checkActiveSessionsForCoach]);

  // ✅ MODIFIÉ: Vérifier session pour appel spécifique seulement si nécessaire
  useEffect(() => {
    const checkExistingSession = async () => {
      if (!callIdString || authLoading || !hasInitialized || !user?.id) {
        console.log(
          "🔍 DEBUG: Skipping call-specific session check - not ready"
        );
        return;
      }

      // ✅ NOUVEAU: Si session correspond déjà à cet appel, skip
      if (currentSession && String(currentSession.call_id) === callIdString) {
        console.log("ℹ️ DEBUG: Session already matches current call");
        return;
      }

      // ✅ NOUVEAU: Si on a déjà une session pour un autre appel, skip cette vérification
      // L'effect de reset ci-dessus s'en occupe déjà
      if (currentSession && String(currentSession.call_id) !== callIdString) {
        console.log(
          "ℹ️ DEBUG: Session exists for different call, skipping check"
        );
        return;
      }

      console.log("🔍 DEBUG: Checking session for specific call...");

      try {
        const data = await callServerAPI(
          `check-session?callId=${callIdString}`
        );

        if (data.session) {
          setCurrentSession(data.session);
          setError(null);

          syncSessionCreated({
            sessionId: data.session.id,
            callId: data.session.call_id,
            sessionName: data.session.session_name,
            mode: data.session.session_mode,
            coachId: data.session.coach_user_id,
            audioPosition: data.session.audio_position,
            showParticipantTops: data.session.show_participant_tops,
            showTopsRealtime: data.session.show_tops_realtime,
            anonymousMode: data.session.anonymous_mode,
          });

          console.log("✅ DEBUG: Session found for call");
        }
      } catch (err: any) {
        console.error("❌ DEBUG: Error checking session for call:", err);
      }
    };

    checkExistingSession();
  }, [
    user?.id,
    callIdString,
    authLoading,
    hasInitialized,
    currentSession?.call_id, // ✅ MODIFIÉ: Dépendre seulement du call_id, pas de l'objet entier
    syncSessionCreated,
  ]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ✅ Actions principales (inchangées)
  const startSharing = useCallback(
    async (sessionName: string) => {
      if (!callIdString) {
        const errorMsg = `callId invalide: ${callId}`;
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      if (!sessionName?.trim()) {
        const errorMsg = "Nom de session requis";
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      if (authLoading || !user?.id) {
        const errorMsg = "Authentification en cours...";
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await callServerAPI("create-session", "POST", {
          callId: callIdString,
          sessionName: sessionName.trim(),
          userId: user?.id,
        });

        if (data.session) {
          setCurrentSession(data.session);

          syncSessionCreated({
            sessionId: data.session.id,
            callId: data.session.call_id,
            sessionName: data.session.session_name,
            mode: data.session.session_mode,
            coachId: data.session.coach_user_id,
            audioPosition: data.session.audio_position,
            showParticipantTops: data.session.show_participant_tops,
            showTopsRealtime: data.session.show_tops_realtime,
            anonymousMode: data.session.anonymous_mode,
          });

          console.log("✅ DEBUG: Session created successfully");
        } else {
          throw new Error("Aucune session retournée par l'API");
        }
      } catch (err: any) {
        console.error("❌ DEBUG: Error in startSharing:", err);
        setError(err.message || "Erreur inconnue");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id, callIdString, authLoading, syncSessionCreated]
  );

  const stopSharing = useCallback(async () => {
    if (!currentSession) return;

    setIsLoading(true);
    setError(null);

    try {
      await callServerAPI("stop-session", "POST", {
        sessionId: currentSession.id,
      });

      setCurrentSession(null);
      syncSessionStopped();
      console.log("✅ DEBUG: Session stopped successfully");
    } catch (err: any) {
      console.error("❌ DEBUG: Error stopping session:", err);
      setError(err.message || "Erreur inconnue");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentSession, syncSessionStopped]);

  // Méthodes de mise à jour (inchangées)
  const updateAudioPosition = useCallback(
    async (position: number) => {
      if (!currentSession) return;

      try {
        await callServerAPI("update-position", "POST", {
          sessionId: currentSession.id,
          position,
        });

        setCurrentSession((prev) =>
          prev ? { ...prev, audio_position: position } : null
        );
        syncSessionUpdated({ audioPosition: position });
      } catch (err: any) {
        console.error("❌ DEBUG: Error updating position:", err);
      }
    },
    [currentSession, syncSessionUpdated]
  );

  const updateSessionMode = useCallback(
    async (mode: "live" | "paused" | "ended") => {
      if (!currentSession) return;

      try {
        await callServerAPI("update-mode", "POST", {
          sessionId: currentSession.id,
          mode,
        });

        setCurrentSession((prev) =>
          prev ? { ...prev, session_mode: mode } : null
        );
        syncSessionUpdated({ mode });
      } catch (err: any) {
        console.error("❌ DEBUG: Error updating mode:", err);
      }
    },
    [currentSession, syncSessionUpdated]
  );

  const updateObjectivityControls = useCallback(
    async (controls: {
      show_participant_tops?: boolean;
      show_tops_realtime?: boolean;
      anonymous_mode?: boolean;
    }) => {
      if (!currentSession) return;

      try {
        await callServerAPI("update-controls", "POST", {
          sessionId: currentSession.id,
          controls,
        });

        setCurrentSession((prev) => (prev ? { ...prev, ...controls } : null));
        syncSessionUpdated({
          showParticipantTops: controls.show_participant_tops,
          showTopsRealtime: controls.show_tops_realtime,
          anonymousMode: controls.anonymous_mode,
        });
      } catch (err: any) {
        console.error("❌ DEBUG: Error updating controls:", err);
      }
    },
    [currentSession, syncSessionUpdated]
  );

  // ✅ CORRIGÉ: Logique isSharing basée sur la correspondance d'appel
  const isSharing = useMemo(() => {
    // Si on a une session et qu'elle correspond à l'appel actuel
    if (
      currentSession &&
      callIdString &&
      String(currentSession.call_id) === callIdString
    ) {
      return true;
    }

    // Sinon utiliser le context (pour les autres appels)
    if (contextIsSharing && (!callIdString || !currentSession)) {
      return contextIsSharing;
    }

    return false;
  }, [contextIsSharing, currentSession, callIdString]);

  console.log("🔍 DEBUG Hook Render:", {
    callId: callId,
    callIdString: callIdString,
    isAuthenticated,
    authLoading,
    hasInitialized,
    recoveryAttempted,
    userId: user?.id,
    contextIsSharing,
    computedIsSharing: isSharing,
    isLoading,
    hasCurrentSession: !!currentSession,
    sessionCallId: currentSession?.call_id,
    sessionMatchesCall:
      currentSession && callIdString
        ? String(currentSession.call_id) === callIdString
        : null,
    error,
  });

  return {
    isSharing,
    isLoading,
    error,
    currentSession,
    startSharing,
    stopSharing,
    updateAudioPosition,
    updateSessionMode,
    updateObjectivityControls,
    clearError,
    checkActiveSessionsForCoach,
  };
};
