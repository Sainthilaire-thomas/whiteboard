// /api/evaluation-sharing/update-controls/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabaseServer";

export async function POST(request: NextRequest) {
  try {
    const { sessionId, controls } = await request.json();

    console.log("🔍 DEBUG API update-controls:", { sessionId, controls });

    if (!sessionId || !controls || typeof controls !== "object") {
      return NextResponse.json(
        { error: "sessionId et controls (objet) requis" },
        { status: 400 }
      );
    }

    // Valider les propriétés des contrôles
    const validControlKeys = [
      "show_participant_tops",
      "show_tops_realtime",
      "anonymous_mode",
    ];
    const updateData: any = {};

    for (const [key, value] of Object.entries(controls)) {
      if (validControlKeys.includes(key) && typeof value === "boolean") {
        updateData[key] = value;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Aucun contrôle valide fourni" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServer();

    // Utiliser service role si pas d'auth serveur
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log("🔍 DEBUG API Auth check update-controls:", {
      hasUser: !!user,
      userId: user?.id,
      authError: authError?.message,
    });

    let supabaseForQuery = supabase;
    if (!user) {
      console.log(
        "⚠️ DEBUG: No server auth for update-controls, using service role"
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

    // Ajouter updated_at
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabaseForQuery
      .schema("whiteboard")
      .from("shared_evaluation_sessions")
      .update(updateData)
      .eq("id", sessionId)
      .select()
      .single();

    if (error) {
      console.error("❌ DEBUG API Update controls error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return NextResponse.json(
        { error: `Erreur mise à jour contrôles: ${error.message}` },
        { status: 500 }
      );
    }

    console.log("✅ DEBUG API Controls updated successfully:", {
      sessionId: data.id,
      updatedFields: Object.keys(updateData),
    });

    return NextResponse.json({
      success: true,
      session: data,
    });
  } catch (err: any) {
    console.error("❌ DEBUG API Unexpected error in update-controls:", {
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
