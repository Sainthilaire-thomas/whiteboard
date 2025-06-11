// /api/evaluation-sharing/update-position/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabaseServer";

export async function POST(request: NextRequest) {
  try {
    const { sessionId, position } = await request.json();

    console.log("🔍 DEBUG API update-position:", { sessionId, position });

    if (!sessionId || position === undefined) {
      return NextResponse.json(
        { error: "sessionId et position requis" },
        { status: 400 }
      );
    }

    if (typeof position !== "number" || position < 0) {
      return NextResponse.json(
        { error: "position doit être un nombre positif" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServer();

    // Utiliser service role si pas d'auth serveur
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log("🔍 DEBUG API Auth check update-position:", {
      hasUser: !!user,
      userId: user?.id,
      authError: authError?.message,
    });

    let supabaseForQuery = supabase;
    if (!user) {
      console.log(
        "⚠️ DEBUG: No server auth for update-position, using service role"
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
        audio_position: position,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId)
      .select()
      .single();

    if (error) {
      console.error("❌ DEBUG API Update position error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return NextResponse.json(
        { error: `Erreur mise à jour position: ${error.message}` },
        { status: 500 }
      );
    }

    console.log("✅ DEBUG API Position updated successfully:", {
      sessionId: data.id,
      position: data.audio_position,
    });

    return NextResponse.json({
      success: true,
      session: data,
    });
  } catch (err: any) {
    console.error("❌ DEBUG API Unexpected error in update-position:", {
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
