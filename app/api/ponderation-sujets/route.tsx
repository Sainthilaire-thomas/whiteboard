// app/api/ponderation-sujets/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabaseServer";

// Type pour la pondération (correspond à votre table)
export interface PonderationSujet {
  id_ponderation: number;
  idsujet: number;
  conforme: number;
  partiellement_conforme: number;
  non_conforme: number;
  permet_partiellement_conforme: boolean;
}

// GET - Récupérer toutes les pondérations OU une pondération spécifique
export async function GET(request: NextRequest) {
  try {
    const supabaseServer = await createSupabaseServer();
    const { searchParams } = new URL(request.url);
    const idsujet = searchParams.get("idsujet");

    // Si idsujet est fourni, récupérer une pondération spécifique
    if (idsujet) {
      const { data: ponderation, error } = await supabaseServer
        .from("ponderation_sujets")
        .select(
          `
          id_ponderation,
          idsujet,
          conforme,
          partiellement_conforme,
          non_conforme,
          permet_partiellement_conforme
        `
        )
        .eq("idsujet", parseInt(idsujet))
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // Aucun résultat trouvé
          return NextResponse.json(
            { error: "Aucune pondération trouvée pour ce sujet" },
            { status: 404 }
          );
        }

        console.error("Erreur Supabase:", error);
        return NextResponse.json(
          { error: "Erreur lors de la récupération de la pondération" },
          { status: 500 }
        );
      }

      return NextResponse.json(ponderation);
    }

    // Sinon, récupérer toutes les pondérations
    const { data: ponderations, error } = await supabaseServer
      .from("ponderation_sujets")
      .select(
        `
        id_ponderation,
        idsujet,
        conforme,
        partiellement_conforme,
        non_conforme,
        permet_partiellement_conforme
      `
      )
      .order("idsujet", { ascending: true });

    if (error) {
      console.error(
        "Erreur Supabase lors de la récupération des pondérations:",
        error
      );
      return NextResponse.json(
        {
          error: "Erreur lors de la récupération des pondérations",
          details: error.message,
        },
        { status: 500 }
      );
    }

    // Vérifier si des données ont été trouvées
    if (!ponderations || ponderations.length === 0) {
      console.warn("Aucune pondération trouvée dans la base de données");
      return NextResponse.json([]);
    }

    return NextResponse.json(ponderations);
  } catch (error) {
    console.error("Erreur lors de la récupération des pondérations:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération des pondérations" },
      { status: 500 }
    );
  }
}

// POST - Sauvegarder le choix de conformité d'un postit
export async function POST(request: NextRequest) {
  try {
    const supabaseServer = await createSupabaseServer();
    const body = await request.json();
    const {
      postitId,
      idsujet,
      conformiteChoice,
      pointsAttribues,
      // Autres champs que vous pourriez vouloir sauvegarder
      userId,
      activiteId,
    } = body;

    // Validation des données obligatoires
    if (!postitId || !idsujet || !conformiteChoice) {
      return NextResponse.json(
        {
          error: "Données manquantes",
          required: ["postitId", "idsujet", "conformiteChoice"],
        },
        { status: 400 }
      );
    }

    // Validation du choix de conformité
    const validChoices = ["conforme", "partiellement_conforme", "non_conforme"];
    if (!validChoices.includes(conformiteChoice)) {
      return NextResponse.json(
        {
          error: "Choix de conformité invalide",
          validChoices,
        },
        { status: 400 }
      );
    }

    // Vous devrez adapter cette partie selon votre structure de table postits
    // Ici, je suppose que vous avez une table 'postits' avec ces champs
    const { data: updatedPostit, error: updateError } = await supabaseServer
      .from("postits") // Remplacez par le nom de votre table de postits
      .update({
        conformite_choice: conformiteChoice,
        points_attribues: pointsAttribues,
        updated_at: new Date().toISOString(),
        // Ajoutez d'autres champs si nécessaire
      })
      .eq("id", postitId)
      .eq("idsujet", idsujet) // Sécurité supplémentaire
      .select()
      .single();

    if (updateError) {
      console.error("Erreur lors de la mise à jour du postit:", updateError);
      return NextResponse.json(
        {
          error: "Erreur lors de la sauvegarde du choix de conformité",
          details: updateError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Choix de conformité sauvegardé avec succès",
      data: updatedPostit,
    });
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du choix:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la sauvegarde" },
      { status: 500 }
    );
  }
}
