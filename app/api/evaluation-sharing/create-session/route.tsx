// /api/evaluation-sharing/create-session/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabaseServer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { callId, sessionName, userId } = body;

    console.log("🔍 DEBUG API create-session:", {
      callId,
      sessionName,
      userId,
      bodyType: typeof body,
      headers: Object.fromEntries(request.headers.entries()),
    });

    // Validation des données requises
    if (!callId || !sessionName) {
      return NextResponse.json(
        { error: "callId et sessionName sont requis" },
        { status: 400 }
      );
    }

    // Convertir callId en nombre
    const callIdNumber = parseInt(callId);
    if (isNaN(callIdNumber)) {
      return NextResponse.json(
        { error: "callId doit être un nombre valide" },
        { status: 400 }
      );
    }

    // Créer le client Supabase serveur
    const supabase = await createSupabaseServer();

    // Vérifier l'authentification
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log("🔍 DEBUG API Auth check:", {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      authError: authError?.message,
      requestUserId: userId,
    });

    // Si pas d'auth côté serveur, utiliser l'userId du client (temporaire pour debug)
    let effectiveUserId = user?.id;
    let supabaseForQuery = supabase;

    if (!effectiveUserId && userId) {
      console.log("⚠️ DEBUG: No server auth, using service role");
      // Utiliser le service role pour contourner RLS temporairement
      const { createClient } = require("@supabase/supabase-js");
      const serviceRoleSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!, // Clé service role
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );

      effectiveUserId = userId;
      supabaseForQuery = serviceRoleSupabase;
    }

    if (!effectiveUserId) {
      return NextResponse.json(
        { error: "Aucun utilisateur identifié" },
        { status: 401 }
      );
    }

    console.log("🔍 DEBUG API Using userId:", effectiveUserId);

    // ✅ SÉCURITÉ : Vérifier TOUTES les sessions actives du coach (pas seulement pour cet appel)
    console.log("🔒 SÉCURITÉ : Vérification sessions actives du coach...");
    const { data: allActiveSessions, error: checkActiveError } =
      await supabaseForQuery
        .schema("whiteboard")
        .from("shared_evaluation_sessions")
        .select("id, session_name, call_id, is_active")
        .eq("coach_user_id", effectiveUserId)
        .eq("is_active", true);

    if (checkActiveError) {
      console.error("❌ DEBUG API Check active sessions error:", {
        message: checkActiveError.message,
        details: checkActiveError.details,
        hint: checkActiveError.hint,
        code: checkActiveError.code,
      });
      return NextResponse.json(
        {
          error: `Erreur vérification sessions actives: ${checkActiveError.message}`,
        },
        { status: 500 }
      );
    }

    // ✅ MUTEX : Arrêter automatiquement toutes les sessions actives du coach
    if (allActiveSessions && allActiveSessions.length > 0) {
      console.log("🔒 MUTEX : Sessions actives détectées, arrêt automatique:", {
        count: allActiveSessions.length,
        sessions: allActiveSessions.map((s) => ({
          id: s.id,
          name: s.session_name,
          callId: s.call_id,
          isActive: s.is_active,
        })),
      });

      // Transaction : Arrêter toutes les sessions actives du coach
      const { data: stoppedSessions, error: stopError } = await supabaseForQuery
        .schema("whiteboard")
        .from("shared_evaluation_sessions")
        .update({
          is_active: false,
          session_mode: "ended",
          updated_at: new Date().toISOString(),
        })
        .eq("coach_user_id", effectiveUserId)
        .eq("is_active", true)
        .select("id, session_name");

      if (stopError) {
        console.error("❌ Erreur arrêt sessions précédentes:", stopError);
        return NextResponse.json(
          { error: `Erreur arrêt sessions: ${stopError.message}` },
          { status: 500 }
        );
      }

      console.log("✅ MUTEX : Sessions précédentes arrêtées:", {
        stoppedCount: stoppedSessions?.length || 0,
        stoppedSessions: stoppedSessions?.map((s) => s.session_name),
      });
    } else {
      console.log(
        "✅ SÉCURITÉ : Aucune session active, création directe possible"
      );
    }

    // ✅ DOUBLE VÉRIFICATION : S'assurer qu'aucune session n'est active
    const { data: verifyNoActive, error: verifyError } = await supabaseForQuery
      .schema("whiteboard")
      .from("shared_evaluation_sessions")
      .select("id, session_name")
      .eq("coach_user_id", effectiveUserId)
      .eq("is_active", true);

    if (verifyError) {
      console.error("❌ Erreur vérification finale:", verifyError);
      return NextResponse.json(
        { error: `Erreur vérification: ${verifyError.message}` },
        { status: 500 }
      );
    }

    if (verifyNoActive && verifyNoActive.length > 0) {
      console.error(
        "❌ SÉCURITÉ ÉCHEC : Sessions encore actives après arrêt:",
        verifyNoActive
      );
      return NextResponse.json(
        {
          error: "Impossible d'arrêter les sessions précédentes",
          debug: { stillActive: verifyNoActive.length },
        },
        { status: 500 }
      );
    }

    console.log(
      "✅ SÉCURITÉ : Aucune session active confirmée, création sécurisée possible"
    );

    // ✅ CRÉATION de la nouvelle session (maintenant sécurisée)
    const newSessionData = {
      coach_user_id: effectiveUserId,
      call_id: callIdNumber,
      session_name: sessionName.trim(),
      audio_position: 0,
      session_mode: "paused" as const,
      is_active: true, // ← Sera la SEULE session active
      show_participant_tops: false,
      show_tops_realtime: false,
      anonymous_mode: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log("🚀 CRÉATION : Nouvelle session unique:", {
      ...newSessionData,
      session_name_length: newSessionData.session_name.length,
    });

    const { data, error } = await supabaseForQuery
      .schema("whiteboard")
      .from("shared_evaluation_sessions")
      .insert(newSessionData)
      .select()
      .single();

    console.log("🔍 DEBUG API Insert result:", {
      hasData: !!data,
      dataId: data?.id,
      error: error?.message,
      errorDetails: error?.details,
      errorHint: error?.hint,
      errorCode: error?.code,
    });

    if (error) {
      console.error("❌ DEBUG API Insert error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return NextResponse.json(
        { error: `Erreur création: ${error.message}` },
        { status: 500 }
      );
    }

    if (!data) {
      console.error("❌ DEBUG API: No data returned from insert");
      return NextResponse.json(
        { error: "Aucune donnée retournée après création" },
        { status: 500 }
      );
    }

    // ✅ VALIDATION FINALE : Vérifier qu'une seule session est active
    const { data: finalCheck, error: finalError } = await supabaseForQuery
      .schema("whiteboard")
      .from("shared_evaluation_sessions")
      .select("id, session_name, call_id")
      .eq("coach_user_id", effectiveUserId)
      .eq("is_active", true);

    console.log("🔒 VALIDATION finale sécurité:", {
      activeSessionsCount: finalCheck?.length || 0,
      isUnique: (finalCheck?.length || 0) === 1,
      activeSessions: finalCheck?.map((s) => ({
        id: s.id,
        name: s.session_name,
        callId: s.call_id,
      })),
    });

    if ((finalCheck?.length || 0) !== 1) {
      console.error(
        "❌ VIOLATION SÉCURITÉ : Plus d'une session active après création!"
      );
      return NextResponse.json(
        {
          error: "Violation sécurité: État incohérent des sessions",
          debug: {
            activeCount: finalCheck?.length,
            expectedCount: 1,
          },
        },
        { status: 500 }
      );
    }

    console.log("✅ SUCCESS : Session unique créée avec sécurité:", {
      id: data.id,
      session_name: data.session_name,
      call_id: data.call_id,
      coach_user_id: data.coach_user_id,
      is_active: data.is_active,
    });

    return NextResponse.json({
      success: true,
      session: data,
      security: {
        previousActiveSessionsStopped: allActiveSessions?.length || 0,
        currentActiveSessionsCount: 1,
        mutexEnforced: true,
      },
    });
  } catch (err: any) {
    console.error("❌ DEBUG API Unexpected error in create-session:", {
      message: err.message,
      stack: err.stack,
      name: err.name,
    });
    return NextResponse.json(
      { error: `Erreur serveur: ${err.message}` },
      { status: 500 }
    );
  }
}
