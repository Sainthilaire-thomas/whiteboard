// app/api/transcription/get/route.ts
// Route pour récupération transcription par participants non-authentifiés
// Utilise le même pattern que check-session avec Service Role

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ✅ Configuration Supabase identique à tes autres routes
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

    console.log("🔍 DEBUG transcription GET API:", {
      callId,
      url: request.url,
      method: "GET",
    });

    // ✅ Validation callId
    if (!callId) {
      console.error("❌ DEBUG: Missing callId parameter");
      return NextResponse.json(
        {
          error: "callId est requis",
          success: false,
        },
        { status: 400 }
      );
    }

    const callIdNumber = parseInt(callId);
    if (isNaN(callIdNumber)) {
      console.error("❌ DEBUG: Invalid callId format:", callId);
      return NextResponse.json(
        {
          error: "callId doit être un nombre",
          success: false,
        },
        { status: 400 }
      );
    }

    console.log("🔍 DEBUG: Fetching transcription for callId:", callIdNumber);

    // ✅ Requête identique à useTranscriptions qui fonctionne
    const { data, error } = await supabaseAdmin
      .from("transcript")
      .select("*, word(*)")
      .eq("callid", callIdNumber)
      .single();

    if (error) {
      console.error("❌ DEBUG: Database error fetching transcription:", error);
      return NextResponse.json(
        {
          error: "Erreur lors de la récupération de la transcription",
          details: error.message,
          success: false,
        },
        { status: 500 }
      );
    }

    if (!data) {
      console.warn(
        "⚠️ DEBUG: No transcription found for callId:",
        callIdNumber
      );
      return NextResponse.json(
        {
          error: `Aucune transcription trouvée pour l'appel ${callIdNumber}`,
          success: false,
        },
        { status: 404 }
      );
    }

    // ✅ Traitement identique à useTranscriptions
    const words = data.word || [];

    if (words.length === 0) {
      console.warn("⚠️ DEBUG: Transcription found but no words:", callIdNumber);
      return NextResponse.json(
        {
          error: "Transcription trouvée mais aucun mot disponible",
          success: false,
        },
        { status: 404 }
      );
    }

    console.log("✅ DEBUG: Transcription fetched successfully:", {
      callId: callIdNumber,
      transcriptId: data.id,
      wordCount: words.length,
      firstWord: words[0]?.text?.substring(0, 20) + "...",
      accessMethod: "service_role",
    });

    // ✅ Retour structure identique à useTranscriptions
    return NextResponse.json({
      success: true,
      transcription: {
        callid: callIdNumber,
        words: words, // Pas de tri, comme dans useTranscriptions original
      },
      metadata: {
        transcriptId: data.id,
        wordCount: words.length,
        accessMethod: "service_role",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ DEBUG: Unexpected error in transcription GET:", error);
    return NextResponse.json(
      {
        error: "Erreur serveur interne",
        details: error instanceof Error ? error.message : "Unknown error",
        success: false,
      },
      { status: 500 }
    );
  }
}
