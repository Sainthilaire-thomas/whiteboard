import { NextRequest, NextResponse } from "next/server";
import { supabaseClient } from "@/lib/supabaseClient";

export async function POST(request: NextRequest) {
  try {
    const { filePath } = await request.json();

    if (!filePath) {
      return NextResponse.json(
        { error: "Chemin de fichier requis" },
        { status: 400 }
      );
    }

    // Générer une URL signée - utiliser createSignedUrls avec un tableau
    const { data, error } = await supabaseClient.storage
      .from("Calls")
      .createSignedUrls([filePath], 60);

    if (error) {
      console.error("Erreur lors de la génération de l'URL signée:", error);
      console.error("Détails:", JSON.stringify(error, null, 2));
      console.error("Chemin:", filePath);

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Retourne la première URL signée du tableau
    return NextResponse.json({ signedUrl: data.signedUrls[0] });
  } catch (error: any) {
    console.error("Erreur serveur:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
