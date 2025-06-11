// /api/evaluation-sharing/stop-session/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabaseServer";
import { supabaseServiceRole } from "@/lib/supabaseServiceRole";

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    console.log("🔍 DEBUG API stop-session:", { sessionId });

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId requis" }, { status: 400 });
    }

    // ✅ Utiliser TES instances existantes
    const supabase = await createSupabaseServer();

    // Vérifier l'authentification du coach
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log("🔍 DEBUG Auth check:", {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      authError: authError?.message,
    });

    // ✅ Utiliser Service Role pour l'opération (participants non-auth doivent voir l'arrêt)
    let supabaseForQuery = supabaseServiceRole;

    if (user) {
      console.log(
        "✅ Coach authentifié, utilisation Service Role pour compatibilité participants"
      );
    } else {
      console.log(
        "⚠️ Pas d'auth serveur, utilisation Service Role obligatoire"
      );
    }

    // ✅ DIAGNOSTIC : État avant mise à jour
    console.log("🔍 Checking session state BEFORE update...");
    const { data: beforeUpdate, error: selectError } = await supabaseForQuery
      .schema("whiteboard")
      .from("shared_evaluation_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (selectError) {
      console.error("❌ Session not found:", selectError);
      return NextResponse.json(
        { error: `Session non trouvée: ${selectError.message}` },
        { status: 404 }
      );
    }

    console.log("🔍 État AVANT mise à jour:", {
      sessionId: beforeUpdate.id,
      is_active: beforeUpdate.is_active,
      session_mode: beforeUpdate.session_mode,
      coach_user_id: beforeUpdate.coach_user_id,
      call_id: beforeUpdate.call_id,
    });

    // ✅ MISE À JOUR CRITIQUE
    console.log("🔄 Executing UPDATE with Service Role...");
    const updatePayload = {
      is_active: false, // ← CRITIQUE
      session_mode: "ended", // ← CRITIQUE
      updated_at: new Date().toISOString(),
    };

    console.log("🔍 Update payload:", updatePayload);

    const { data: afterUpdate, error: updateError } = await supabaseForQuery
      .schema("whiteboard")
      .from("shared_evaluation_sessions")
      .update(updatePayload)
      .eq("id", sessionId)
      .select("*")
      .single();

    if (updateError) {
      console.error("❌ UPDATE ERROR:", {
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
        code: updateError.code,
        sessionId,
      });
      return NextResponse.json(
        { error: `Erreur arrêt: ${updateError.message}` },
        { status: 500 }
      );
    }

    if (!afterUpdate) {
      console.error("❌ UPDATE retourné null/undefined");
      return NextResponse.json(
        { error: "Mise à jour échouée - aucune donnée retournée" },
        { status: 500 }
      );
    }

    // ✅ VÉRIFICATION des changements
    const hasChanged = beforeUpdate.is_active !== afterUpdate.is_active;
    const isCorrect = afterUpdate.is_active === false;

    console.log("✅ État APRÈS mise à jour:", {
      sessionId: afterUpdate.id,
      is_active_before: beforeUpdate.is_active,
      is_active_after: afterUpdate.is_active,
      session_mode_before: beforeUpdate.session_mode,
      session_mode_after: afterUpdate.session_mode,

      // Validation critique
      has_changed: hasChanged,
      is_correct: isCorrect,
      success: hasChanged && isCorrect,
    });

    // ✅ DOUBLE VÉRIFICATION avec nouvelle requête
    console.log("🔍 Double-checking avec nouvelle requête...");
    const { data: verification, error: verifyError } = await supabaseForQuery
      .schema("whiteboard")
      .from("shared_evaluation_sessions")
      .select("id, is_active, session_mode, updated_at")
      .eq("id", sessionId)
      .single();

    if (verification) {
      console.log("🔍 VERIFICATION finale:", {
        verification_id: verification.id,
        verification_is_active: verification.is_active,
        verification_mode: verification.session_mode,
        matches_update: verification.is_active === afterUpdate.is_active,
        final_success: verification.is_active === false,
      });
    }

    // ✅ VALIDATION finale avant retour
    if (afterUpdate.is_active !== false) {
      console.error(
        "❌ ÉCHEC CRITIQUE: is_active n'est pas false après update!"
      );
      return NextResponse.json(
        {
          error: "Échec de la mise à jour - is_active toujours true",
          debug: {
            expected: false,
            actual: afterUpdate.is_active,
            verification: verification?.is_active,
          },
        },
        { status: 500 }
      );
    }

    console.log("✅ SUCCESS: Session arrêtée avec succès");

    return NextResponse.json({
      success: true,
      session: afterUpdate,
      debug: {
        before: {
          is_active: beforeUpdate.is_active,
          session_mode: beforeUpdate.session_mode,
        },
        after: {
          is_active: afterUpdate.is_active,
          session_mode: afterUpdate.session_mode,
        },
        verification: verification,
        validation: {
          changed: hasChanged,
          correct: isCorrect,
          final_check: verification?.is_active === false,
        },
      },
    });
  } catch (err: any) {
    console.error("❌ UNEXPECTED ERROR:", {
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
