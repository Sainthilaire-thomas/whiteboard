// /api/evaluation-sharing/update-mode/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabaseServer";

export async function POST(request: NextRequest) {
  try {
    const { sessionId, mode } = await request.json();

    console.log("🔍 DEBUG API update-mode:", { sessionId, mode });

    if (!sessionId || !mode) {
      return NextResponse.json(
        { error: "sessionId et mode requis" },
        { status: 400 }
      );
    }

    if (!["live", "paused", "ended"].includes(mode)) {
      return NextResponse.json(
        { error: "Mode doit être 'live', 'paused' ou 'ended'" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServer();

    // Utiliser service role si pas d'auth serveur
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log("🔍 DEBUG API Auth check update-mode:", {
      hasUser: !!user,
      userId: user?.id,
      authError: authError?.message,
    });

    let supabaseForQuery = supabase;
    if (!user) {
      console.log(
        "⚠️ DEBUG: No server auth for update-mode, using service role"
      );
      const { createClient } = require("@supabase/supabase-js");
      supabaseForQuery = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );
    }

    const { data, error } = await supabaseForQuery
      .schema("whiteboard")
      .from("shared_evaluation_sessions")
      .update({
        session_mode: mode,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId)
      .select()
      .single();

    if (error) {
      console.error("❌ DEBUG API Update mode error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return NextResponse.json(
        { error: `Erreur mise à jour mode: ${error.message}` },
        { status: 500 }
      );
    }

    console.log("✅ DEBUG API Mode updated successfully:", {
      sessionId: data.id,
      mode: data.session_mode,
    });

    return NextResponse.json({
      success: true,
      session: data,
    });
  } catch (err: any) {
    console.error("❌ DEBUG API Unexpected error in update-mode:", {
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
