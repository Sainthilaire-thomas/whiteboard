// app/whiteboard/hooks/useRealtimeEvaluationSync.tsx
// Hook pour les participants - Version optimisée avec gestion d'erreurs robuste

import { useState, useEffect, useRef } from "react";
import { supabaseClient } from "@/lib/supabaseClient";

interface SyncState {
  currentWordIndex: number;
  currentParagraphIndex: number;
  viewMode: "word" | "paragraph";
  highlightTurnOne: boolean;
  highlightSpeakers: boolean;
  sessionMode: "live" | "paused" | "ended";
}

interface RealtimeEvaluationSyncHook extends SyncState {
  isConnected: boolean;
  connectionError: string | null;
  lastSyncTime: Date | null;
  reconnectAttempts: number;
}

export const useRealtimeEvaluationSync = (
  sessionId: string | undefined
): RealtimeEvaluationSyncHook => {
  const [syncState, setSyncState] = useState<SyncState>({
    currentWordIndex: 0,
    currentParagraphIndex: 0,
    viewMode: "word",
    highlightTurnOne: false,
    highlightSpeakers: true,
    sessionMode: "paused",
  });

  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const channelRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isCleaningUpRef = useRef(false);

  // ✅ Fetch initial state avec gestion d'erreurs améliorée
  const fetchInitialState = async (): Promise<boolean> => {
    if (!sessionId) {
      setConnectionError("Session ID manquant");
      return false;
    }

    try {
      console.log(
        "🔄 Participant: Fetching initial state for:",
        sessionId.substring(0, 8) + "..."
      );

      const { data, error } = await supabaseClient
        .schema("whiteboard")
        .from("shared_evaluation_sessions")
        .select(
          `
          current_word_index,
          current_paragraph_index,
          view_mode,
          highlight_turn_one,
          highlight_speakers,
          session_mode,
          is_active
        `
        )
        .eq("id", sessionId)
        .eq("is_active", true)
        .single();

      if (error) {
        console.error(
          "❌ Participant: Error fetching initial state:",
          error.message
        );

        if (error.code === "PGRST116") {
          setConnectionError("Session non trouvée ou terminée");
        } else {
          setConnectionError("Session non accessible");
        }
        return false;
      }

      if (data) {
        console.log("✅ Participant: Initial state loaded:", {
          word: data.current_word_index,
          paragraph: data.current_paragraph_index,
          mode: data.view_mode,
          session_mode: data.session_mode,
        });

        setSyncState({
          currentWordIndex: data.current_word_index || 0,
          currentParagraphIndex: data.current_paragraph_index || 0,
          viewMode: (data.view_mode as "word" | "paragraph") || "word",
          highlightTurnOne: data.highlight_turn_one || false,
          highlightSpeakers: data.highlight_speakers !== false,
          sessionMode:
            (data.session_mode as "live" | "paused" | "ended") || "paused",
        });

        setLastSyncTime(new Date());
        setConnectionError(null);
        return true;
      }

      setConnectionError("Aucune donnée trouvée");
      return false;
    } catch (err: any) {
      console.error("❌ Participant: Exception fetching initial state:", err);
      setConnectionError("Erreur de connexion");
      return false;
    }
  };

  // ✅ Setup Realtime connection avec retry logic
  const setupRealtimeConnection = async (): Promise<void> => {
    if (!sessionId || isCleaningUpRef.current) return;

    console.log(
      "📡 Participant: Setting up Realtime for:",
      sessionId.substring(0, 8) + "..."
    );

    try {
      const channel = supabaseClient
        .channel(`shared_evaluation_${sessionId}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "whiteboard",
            table: "shared_evaluation_sessions",
            filter: `id=eq.${sessionId}`,
          },
          (payload) => {
            if (isCleaningUpRef.current) return;

            console.log("🔄 Participant: Received update:", {
              eventType: payload.eventType,
              hasNewData: !!payload.new,
              timestamp: new Date().toISOString(),
            });

            if (payload.new) {
              const newData = payload.new as any;

              // ✅ Validation des données avant update
              setSyncState((prev) => {
                const updated = {
                  currentWordIndex:
                    typeof newData.current_word_index === "number"
                      ? newData.current_word_index
                      : prev.currentWordIndex,
                  currentParagraphIndex:
                    typeof newData.current_paragraph_index === "number"
                      ? newData.current_paragraph_index
                      : prev.currentParagraphIndex,
                  viewMode:
                    newData.view_mode === "word" ||
                    newData.view_mode === "paragraph"
                      ? newData.view_mode
                      : prev.viewMode,
                  highlightTurnOne:
                    typeof newData.highlight_turn_one === "boolean"
                      ? newData.highlight_turn_one
                      : prev.highlightTurnOne,
                  highlightSpeakers:
                    typeof newData.highlight_speakers === "boolean"
                      ? newData.highlight_speakers
                      : prev.highlightSpeakers,
                  sessionMode: ["live", "paused", "ended"].includes(
                    newData.session_mode
                  )
                    ? newData.session_mode
                    : prev.sessionMode,
                };

                console.log("✅ Participant: State updated:", {
                  word: updated.currentWordIndex,
                  paragraph: updated.currentParagraphIndex,
                  mode: updated.viewMode,
                  session: updated.sessionMode,
                });

                return updated;
              });

              setLastSyncTime(new Date());
              setConnectionError(null);
              setReconnectAttempts(0);
            }
          }
        )
        .subscribe((status) => {
          if (isCleaningUpRef.current) return;

          console.log("📡 Participant Realtime status:", status);

          switch (status) {
            case "SUBSCRIBED":
              setIsConnected(true);
              setConnectionError(null);
              setReconnectAttempts(0);
              console.log("✅ Participant: Connected to Realtime");
              break;

            case "CHANNEL_ERROR":
              setIsConnected(false);
              setConnectionError("Connexion interrompue");
              console.error("❌ Participant: Realtime error");
              scheduleReconnect();
              break;

            case "CLOSED":
              setIsConnected(false);
              if (!isCleaningUpRef.current) {
                console.log(
                  "🔌 Participant: Connection closed, attempting reconnect"
                );
                scheduleReconnect();
              }
              break;

            case "TIMED_OUT":
              setIsConnected(false);
              setConnectionError("Timeout de connexion");
              console.error("⏰ Participant: Connection timeout");
              scheduleReconnect();
              break;
          }
        });

      channelRef.current = channel;
    } catch (err: any) {
      console.error("❌ Participant: Error setting up Realtime:", err);
      setConnectionError("Erreur d'initialisation");
      scheduleReconnect();
    }
  };

  // ✅ Auto-reconnect avec backoff exponentiel
  const scheduleReconnect = (): void => {
    if (isCleaningUpRef.current) return;

    // Clear existing timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    const maxAttempts = 8;
    const baseDelay = 1000;

    if (reconnectAttempts < maxAttempts) {
      const delay = Math.min(baseDelay * Math.pow(2, reconnectAttempts), 30000); // Max 30s

      console.log(
        `🔄 Participant: Reconnect attempt ${reconnectAttempts + 1}/${maxAttempts} in ${delay}ms`
      );

      reconnectTimeoutRef.current = setTimeout(async () => {
        if (isCleaningUpRef.current) return;

        setReconnectAttempts((prev) => prev + 1);

        // Cleanup previous connection
        if (channelRef.current) {
          supabaseClient.removeChannel(channelRef.current);
          channelRef.current = null;
        }

        // Try to fetch fresh state first
        const stateLoaded = await fetchInitialState();

        if (stateLoaded && !isCleaningUpRef.current) {
          // Setup new connection
          await setupRealtimeConnection();
        }
      }, delay);
    } else {
      console.error("❌ Participant: Max reconnect attempts reached");
      setConnectionError("Impossible de se reconnecter");
    }
  };

  // ✅ Main effect avec cleanup amélioré
  useEffect(() => {
    isCleaningUpRef.current = false;

    if (!sessionId) {
      setIsConnected(false);
      setConnectionError("Session ID manquant");
      return;
    }

    // Reset states
    setReconnectAttempts(0);
    setConnectionError(null);

    // Initialize connection
    const initializeConnection = async () => {
      const stateLoaded = await fetchInitialState();

      if (stateLoaded && !isCleaningUpRef.current) {
        await setupRealtimeConnection();
      }
    };

    initializeConnection();

    // ✅ Cleanup function
    return () => {
      console.log(
        "🧹 Participant: Cleaning up connection for:",
        sessionId.substring(0, 8) + "..."
      );

      isCleaningUpRef.current = true;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = undefined;
      }

      if (channelRef.current) {
        supabaseClient.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      setIsConnected(false);
      setReconnectAttempts(0);
    };
  }, [sessionId]);

  return {
    ...syncState,
    isConnected,
    connectionError,
    lastSyncTime,
    reconnectAttempts,
  };
};
