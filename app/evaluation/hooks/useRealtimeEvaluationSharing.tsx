// app/evaluation/hooks/useRealtimeEvaluationSharing.tsx
// Hook pour le coach - Version corrigée avec syntaxe fixée

import { useState, useEffect, useRef } from "react";
import { supabaseClient } from "@/lib/supabaseClient";

interface RealtimeEvaluationSharingHook {
  // État session
  isActive: boolean;
  sessionId: string | null;
  error: string | null;

  // État Realtime
  isConnected: boolean;
  connectionError: string | null;
  lastBroadcastTime: Date | null;

  // Méthodes
  broadcastPosition: (
    wordIndex: number,
    paragraphIndex: number
  ) => Promise<void>;
  broadcastMode: (mode: "word" | "paragraph") => Promise<void>;
  broadcastHighlighting: (turnOne: boolean, speakers: boolean) => Promise<void>;
  broadcastSessionMode: (mode: "live" | "paused" | "ended") => Promise<void>;
}

export const useRealtimeEvaluationSharing = (
  sessionId: string | null,
  isSessionActive: boolean
): RealtimeEvaluationSharingHook => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastBroadcastTime, setLastBroadcastTime] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const channelRef = useRef<any>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // ✅ CORRIGÉ: Fonction de broadcast générique avec syntaxe correcte
  const broadcastUpdate = async (updates: Record<string, any>) => {
    if (!sessionId || !isSessionActive) {
      console.warn("⚠️ Coach: Pas de session active pour broadcast");
      return;
    }

    try {
      console.log("📡 Coach: Broadcasting update:", updates);

      // ✅ SYNTAXE CORRIGÉE
      const { error } = await supabaseClient
        .schema("whiteboard") // ✅ Guillemets corrects
        .from("shared_evaluation_sessions")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", sessionId)
        .eq("is_active", true);

      if (error) {
        console.error("❌ Coach: Erreur broadcast:", error);
        setError(`Erreur broadcast: ${error.message}`);
        setConnectionError("Erreur de synchronisation");
      } else {
        console.log("✅ Coach: Broadcast réussi");
        setLastBroadcastTime(new Date());
        setError(null);
        setConnectionError(null);
      }
    } catch (err: any) {
      console.error("❌ Coach: Exception broadcast:", err);
      setError(`Exception broadcast: ${err.message}`);
      setConnectionError("Erreur de connexion");
    }
  };

  // Position avec debouncing pour performance
  const broadcastPosition = async (
    wordIndex: number,
    paragraphIndex: number
  ) => {
    // Debouncing pour éviter trop de requêtes
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      broadcastUpdate({
        current_word_index: wordIndex,
        current_paragraph_index: paragraphIndex,
      });
    }, 150); // 150ms debounce
  };

  // Mode vue (word/paragraph)
  const broadcastMode = async (mode: "word" | "paragraph") => {
    await broadcastUpdate({
      view_mode: mode,
    });
  };

  // Highlighting configuration
  const broadcastHighlighting = async (turnOne: boolean, speakers: boolean) => {
    await broadcastUpdate({
      highlight_turn_one: turnOne,
      highlight_speakers: speakers,
    });
  };

  // Session mode (live/paused/ended)
  const broadcastSessionMode = async (mode: "live" | "paused" | "ended") => {
    await broadcastUpdate({
      session_mode: mode,
    });
  };

  // ✅ Setup Realtime pour monitoring (optionnel pour coach)
  const setupRealtimeMonitoring = () => {
    if (!sessionId || !isSessionActive) return;

    console.log(
      "📡 Coach: Setting up Realtime monitoring for session:",
      sessionId
    );

    const channel = supabaseClient
      .channel(`shared_evaluation_coach_${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "whiteboard",
          table: "shared_evaluation_sessions",
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          console.log("📊 Coach: Session update monitoring:", payload);
          // Le coach peut surveiller les changements pour feedback
        }
      )
      .subscribe((status) => {
        console.log("📡 Coach Realtime monitoring status:", status);

        if (status === "SUBSCRIBED") {
          setIsConnected(true);
          setConnectionError(null);
          console.log("✅ Coach: Realtime monitoring connected");
        } else if (status === "CHANNEL_ERROR") {
          setIsConnected(false);
          setConnectionError("Monitoring connection error");
          console.error("❌ Coach: Realtime monitoring error");
        } else if (status === "CLOSED") {
          setIsConnected(false);
          console.log("🔌 Coach: Realtime monitoring closed");
        }
      });

    channelRef.current = channel;
  };

  // Main effect - Setup monitoring when session active
  useEffect(() => {
    if (sessionId && isSessionActive) {
      setupRealtimeMonitoring();
    } else {
      // Cleanup when session inactive
      if (channelRef.current) {
        supabaseClient.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setIsConnected(false);
    }

    // Cleanup on unmount
    return () => {
      console.log("🧹 Coach: Cleaning up Realtime monitoring");

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      if (channelRef.current) {
        supabaseClient.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      setIsConnected(false);
    };
  }, [sessionId, isSessionActive]);

  return {
    // État
    isActive: isSessionActive,
    sessionId,
    error,

    // Realtime state
    isConnected,
    connectionError,
    lastBroadcastTime,

    // Méthodes
    broadcastPosition,
    broadcastMode,
    broadcastHighlighting,
    broadcastSessionMode,
  };
};
