// app/api/evaluation-sharing/active-sessions/route.ts
// Version finale corrigée - tous problèmes résolus

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// ✅ Helper pour créer le client Service Role
const createServiceRoleClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// ✅ Fonction d'authentification hybride simplifiée
const getAuthenticatedSupabaseClient = async (request: NextRequest) => {
  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith("Bearer ")) {
    console.log("🔧 Méthode d'authentification: bearer_token");

    try {
      const token = authHeader.substring(7);
      const supabase = createServiceRoleClient();

      // Vérifier le token Bearer avec Supabase Auth
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error || !user) {
        console.log("❌ Bearer token invalide, fallback vers service role");
        return {
          supabase: createServiceRoleClient(),
          authMethod: "service_role_fallback",
        };
      }

      console.log("✅ Bearer token valide pour user:", user.id);
      return { supabase, authMethod: "bearer_token", user };
    } catch (error) {
      console.log("❌ Erreur Bearer token, fallback vers service role");
      return {
        supabase: createServiceRoleClient(),
        authMethod: "service_role_fallback",
      };
    }
  }

  // ✅ Pas de tentative cookies - directement service role pour participants
  console.log("🔄 Utilisation Service Role pour participant non authentifié");
  return {
    supabase: createServiceRoleClient(),
    authMethod: "service_role_fallback",
  };
};

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const whiteboardId = url.searchParams.get("whiteboardId");

  console.log("🔍 DEBUG API START (HYBRID):", {
    whiteboardId,
    url: request.url,
    timestamp: new Date().toISOString(),
  });

  try {
    // ✅ Authentification hybride simplifiée
    const { supabase, authMethod, user } =
      await getAuthenticatedSupabaseClient(request);

    console.log("🔧 Méthode d'authentification:", authMethod);

    // Récupérer les sessions actives
    console.log("🔍 Récupération des sessions actives...");

    const { data: sessions, error: sessionsError } = await supabase
      .schema("whiteboard")
      .from("shared_evaluation_sessions")
      .select(
        `
        id,
        session_name,
        call_id,
        session_mode,
        is_active,
        created_at,
        updated_at,
        coach_user_id,
        audio_position,
        show_participant_tops,
        show_tops_realtime,
        anonymous_mode
      `
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (sessionsError) {
      console.error("❌ ERREUR récupération sessions:", sessionsError);
      return NextResponse.json(
        { error: "Erreur lors de la récupération des sessions" },
        { status: 500 }
      );
    }

    console.log("🎯 SESSIONS ACTIVES trouvées:", {
      count: sessions?.length || 0,
      authMethod,
      sessions: sessions?.map((s) => ({
        id: s.id.substring(0, 8) + "...",
        session_name: s.session_name,
        call_id: s.call_id,
        session_mode: s.session_mode,
        is_active: s.is_active,
        created_at: s.created_at,
      })),
    });

    if (!sessions || sessions.length === 0) {
      return NextResponse.json({
        success: true,
        sessions: [],
        metadata: {
          message: "Aucune session active",
          authMethod,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // ✅ Récupérer les données des appels avec les bons champs
    const callIds = [...new Set(sessions.map((s) => s.call_id))];
    console.log("🔍 Récupération données appels pour:", callIds);

    // ✅ CORRIGÉ: Utiliser les vrais champs de la table call
    const { data: calls, error: callsError } = await supabase
      .from("call")
      .select("callid, filename, description, duree, status")
      .in("callid", callIds);

    if (callsError) {
      console.warn("⚠️ Erreur récupération calls:", callsError.message);
      // Continuer sans les données d'appels plutôt que de fail
    } else {
      console.log("✅ Données appels récupérées:", {
        foundCalls: calls?.length || 0,
        authMethod,
      });
    }

    // Créer un map des appels pour lookup rapide
    const callsMap = new Map(calls?.map((call) => [call.callid, call]) || []);

    // ✅ Enrichir les sessions avec les données d'appel (logique corrigée)
    const enrichedSessions = sessions.map((session) => {
      const callData = callsMap.get(session.call_id);

      // ✅ Logique de titre corrigée (priorité: description > filename)
      let call_title = `Appel #${session.call_id}`;
      if (callData?.description?.trim()) {
        call_title =
          callData.description.length > 50
            ? callData.description.slice(0, 50) + "..."
            : callData.description;
      } else if (callData?.filename?.trim()) {
        // Nettoyer le filename s'il contient des extensions
        const cleanFilename = callData.filename.replace(
          /\.(mp3|wav|m4a)$/i,
          ""
        );
        call_title =
          cleanFilename.length > 50
            ? cleanFilename.slice(0, 50) + "..."
            : cleanFilename;
      }

      return {
        id: session.id,
        coach_user_id: session.coach_user_id,
        call_id: session.call_id,
        session_name: session.session_name,
        audio_position: session.audio_position || 0,
        session_mode: session.session_mode || "paused",
        is_active: session.is_active,
        created_at: session.created_at,
        updated_at: session.updated_at || session.created_at,
        show_participant_tops: session.show_participant_tops || false,
        show_tops_realtime: session.show_tops_realtime || false,
        anonymous_mode: session.anonymous_mode !== false,
        coach_name: `Coach-${session.coach_user_id?.slice(0, 8) || "Unknown"}`,
        call_title: call_title,
        call_duration: callData?.duree || null,
        call_status: callData?.status || null,
      };
    });

    console.log("🎯 RÉSULTAT FINAL:", {
      success: true,
      sessionCount: enrichedSessions.length,
      authMethod,
      enrichedSessions: enrichedSessions.map((s) => ({
        id: s.id.substring(0, 8) + "...",
        session_name: s.session_name,
        call_title: s.call_title,
        is_active: s.is_active,
        session_mode: s.session_mode,
      })),
    });

    return NextResponse.json({
      success: true,
      sessions: enrichedSessions,
      metadata: {
        sessionCount: enrichedSessions.length,
        authMethod,
        callsDataFound: calls?.length || 0,
        timestamp: new Date().toISOString(),
        accessType: authMethod === "bearer_token" ? "coach" : "participant",
      },
    });
  } catch (error: any) {
    console.error("❌ ERREUR API (HYBRID):", error);
    return NextResponse.json(
      {
        error: "Erreur interne du serveur",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
