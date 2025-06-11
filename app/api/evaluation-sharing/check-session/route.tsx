// app/api/evaluation-sharing/check-session/route.ts
// Version corrigée compatible Next.js 15 avec authentification Bearer token

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ✅ Configuration Supabase pour authentification côté serveur
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client avec service role pour les opérations serveur
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const callId = searchParams.get("callId");
    const userId = searchParams.get("userId");
    const checkAll = searchParams.get("checkAll");

    console.log("🔍 DEBUG check-session API:", {
      callId,
      userId,
      checkAll,
      url: request.url,
    });

    // ✅ AUTHENTIFICATION BEARER TOKEN CORRIGÉE
    let authenticatedUserId: string | null = null;

    // Récupérer le token Bearer depuis les headers
    const authHeader = request.headers.get("authorization");

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      console.log("🔍 DEBUG: Validating Bearer token...");

      try {
        // ✅ VALIDATION CORRECTE DU TOKEN AVEC JWT
        const { data: userData, error: userError } =
          await supabaseAdmin.auth.getUser(token);

        if (userError || !userData?.user) {
          console.error("❌ DEBUG: Invalid Bearer token:", userError?.message);
          return NextResponse.json(
            {
              error: "Token invalide",
              details: userError?.message || "Token authentication failed",
            },
            { status: 401 }
          );
        }

        authenticatedUserId = userData.user.id;
        console.log("✅ DEBUG: Bearer token validation successful:", {
          userId: authenticatedUserId,
          email: userData.user.email,
        });
      } catch (err) {
        console.error("❌ DEBUG: Bearer token validation error:", err);
        return NextResponse.json(
          {
            error: "Erreur d'authentification",
            details:
              err instanceof Error ? err.message : "Token validation failed",
          },
          { status: 401 }
        );
      }
    } else {
      console.error("❌ DEBUG: No Bearer token provided");
      return NextResponse.json(
        {
          error: "Non authentifié",
          details: "Bearer token required",
        },
        { status: 401 }
      );
    }

    // ✅ Mode "check all" - Récupérer toutes les sessions actives du coach
    if (checkAll === "true" || userId) {
      console.log(
        "🔍 DEBUG: Checking all active sessions for coach:",
        authenticatedUserId
      );

      const { data: sessions, error } = await supabaseAdmin
        .schema("whiteboard")
        .from("shared_evaluation_sessions")
        .select(
          `
          id,
          session_name,
          call_id,
          session_mode,
          is_active,
          audio_position,
          show_participant_tops,
          show_tops_realtime,
          anonymous_mode,
          coach_user_id,
          created_at,
          updated_at
        `
        )
        .eq("coach_user_id", authenticatedUserId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ DEBUG: Database error checking all sessions:", error);
        return NextResponse.json(
          {
            error: "Erreur lors de la vérification des sessions",
            details: error.message,
          },
          { status: 500 }
        );
      }

      console.log("🔍 DEBUG: All active sessions result:", {
        count: sessions?.length || 0,
        sessions: sessions?.map((s: any) => ({
          id: s.id,
          name: s.session_name,
          callId: s.call_id,
          isActive: s.is_active,
        })),
      });

      // Retourner la première session active trouvée (plus récente)
      const activeSession =
        sessions && sessions.length > 0 ? sessions[0] : null;

      return NextResponse.json({
        hasSession: !!activeSession,
        session: activeSession,
        totalActiveSessions: sessions?.length || 0,
        authMethod: "bearer_token",
      });
    }

    // ✅ Mode existant : Vérifier session pour un appel spécifique
    if (!callId) {
      console.error("❌ DEBUG: Missing callId parameter");
      return NextResponse.json({ error: "callId est requis" }, { status: 400 });
    }

    console.log("🔍 DEBUG: Checking session for specific call:", {
      callId,
      coachId: authenticatedUserId,
    });

    const { data: sessions, error } = await supabaseAdmin
      .schema("whiteboard")
      .from("shared_evaluation_sessions")
      .select(
        `
        id,
        session_name,
        call_id,
        session_mode,
        is_active,
        audio_position,
        show_participant_tops,
        show_tops_realtime,
        anonymous_mode,
        coach_user_id,
        created_at,
        updated_at
      `
      )
      .eq("coach_user_id", authenticatedUserId)
      .eq("call_id", parseInt(callId))
      .eq("is_active", true);

    if (error) {
      console.error("❌ DEBUG: Database error:", error);
      return NextResponse.json(
        {
          error: "Erreur lors de la vérification de session",
          details: error.message,
        },
        { status: 500 }
      );
    }

    console.log("🔍 DEBUG: Session query result:", {
      found: sessions && sessions.length > 0,
      count: sessions?.length || 0,
      sessions: sessions?.map((s: any) => ({
        id: s.id,
        name: s.session_name,
        isActive: s.is_active,
      })),
    });

    const activeSession = sessions && sessions.length > 0 ? sessions[0] : null;

    return NextResponse.json({
      hasSession: !!activeSession,
      session: activeSession,
      authMethod: "bearer_token",
    });
  } catch (error) {
    console.error("❌ DEBUG: Unexpected error in check-session:", error);
    return NextResponse.json(
      {
        error: "Erreur serveur interne",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
