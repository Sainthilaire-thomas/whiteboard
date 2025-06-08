import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { handleCallSubmission } from "@/app/zohoworkdrive/lib/audioUploadUtils";

// Interface for word data structure
interface WordData {
  word: string;
  start_time?: number;
  end_time?: number;
  confidence?: number;
  speaker?: string;
  [key: string]: any; // Allow for additional properties
}

// Fonction d'upload modifiée pour utiliser le client admin
const uploadAudioAdmin = async (
  file: File,
  entrepriseId: string
): Promise<string> => {
  // Créer un client admin qui contourne les RLS
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  // Inclure l'ID d'entreprise dans le chemin du fichier
  const fileName = `${Date.now()}.${file.name.split(".").pop()}`;
  const filePath = `audio/${entrepriseId}/${fileName}`;

  const { error } = await supabaseAdmin.storage
    .from("Calls") // Utilisez le bon nom de bucket de votre app originale
    .upload(filePath, file, {
      contentType: file.type,
      upsert: true,
    });

  if (error) {
    console.error("Erreur lors de l'upload :", error.message);
    throw new Error(error.message);
  }

  return filePath;
};

// Fonction pour générer une URL signée
const generateSignedUrlAdmin = async (
  filePath: string,
  expiresIn: number = 60
): Promise<string> => {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  const { data, error } = await supabaseAdmin.storage
    .from("Calls")
    .createSignedUrl(filePath, expiresIn);

  if (error) {
    console.error("Erreur lors de la génération de l'URL signée:", error);
    throw new Error(error.message);
  }

  return data.signedUrl;
};

export async function POST(request: Request) {
  try {
    // Récupérer le token Zoho
    const zohoToken = request.headers
      .get("authorization")
      ?.replace("Bearer ", "");

    // Vérifier le token Zoho
    if (!zohoToken) {
      return NextResponse.json({ error: "Token Zoho requis" }, { status: 401 });
    }

    // Lire le corps de la requête
    const body = await request.json();

    const {
      entrepriseId,
      audioFileId,
      audioFileName,
      transcriptionFileId,
      transcriptionFileName,
      callName,
      callDescription,
      supabaseAuthToken, // Récupérer le token Supabase depuis le corps
    } = body;

    // Authentifier l'utilisateur avec le token Supabase explicite
    const {
      data: { user },
    } = await supabaseServer.auth.getUser(supabaseAuthToken);

    if (!user) {
      return NextResponse.json(
        { error: "Non autorisé: utilisateur non authentifié" },
        { status: 401 }
      );
    }

    // Vérifier les données requises
    if (!entrepriseId || !audioFileId || !callName) {
      return NextResponse.json(
        { error: "Informations manquantes" },
        { status: 400 }
      );
    }

    // 1. Télécharger le fichier audio depuis Zoho
    const audioResponse = await fetch(
      `https://workdrive.zoho.com/api/v1/download/${audioFileId}`,
      {
        headers: {
          Authorization: `Bearer ${zohoToken}`,
        },
      }
    );

    if (!audioResponse.ok) {
      throw new Error(
        `Erreur lors du téléchargement de l'audio: ${audioResponse.statusText}`
      );
    }

    const audioBlob = await audioResponse.blob();

    // Convertir le blob en fichier
    const audioFile = new File([audioBlob], audioFileName || callName, {
      type: audioResponse.headers.get("content-type") || "audio/mpeg",
    });

    // 2. Télécharger la transcription si elle existe
    let transcriptionText = null;
    if (transcriptionFileId) {
      const transcriptionResponse = await fetch(
        `https://workdrive.zoho.com/api/v1/download/${transcriptionFileId}`,
        {
          headers: {
            Authorization: `Bearer ${zohoToken}`,
          },
        }
      );

      if (transcriptionResponse.ok) {
        transcriptionText = await transcriptionResponse.text();
      }
    }

    // 3. Uploader l'audio avec notre fonction personnalisée qui contourne les RLS
    let filePath = null;
    let audioUrl = null;

    if (audioFile) {
      filePath = await uploadAudioAdmin(audioFile, entrepriseId);
      audioUrl = await generateSignedUrlAdmin(filePath, 60);
    }

    // Créer un client admin qui contourne les RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // 4. Insérer l'appel dans la base de données
    const { data: callData, error: callDataError } = await supabaseAdmin
      .from("call")
      .insert([
        {
          audiourl: audioUrl,
          filename: audioFile ? audioFile.name : null,
          filepath: filePath,
          description:
            callDescription || `Importé depuis Zoho WorkDrive: ${callName}`,
          transcription: transcriptionText
            ? JSON.parse(transcriptionText)
            : null,
          upload: !!audioFile,
          is_tagging_call: true,
          preparedfortranscript: true,
        },
      ])
      .select("*");

    if (callDataError || !callData || callData.length === 0) {
      throw new Error(
        "Erreur lors de l'insertion dans 'call': " +
          (callDataError?.message || "Aucune donnée retournée")
      );
    }

    const callId = callData[0].callid;

    // 5. Créer la relation entre l'appel et l'entreprise
    if (entrepriseId) {
      const { error: relationError } = await supabaseAdmin
        .from("entreprise_call")
        .insert([{ identreprise: entrepriseId, callid: callId }]);

      if (relationError) {
        console.error(
          "Erreur lors de la création de la relation entreprise-appel:",
          relationError
        );
        throw new Error(
          "Erreur lors de la création de la relation entreprise-appel"
        );
      }
    }

    // 6. Insérer la transcription si fournie
    if (transcriptionText) {
      const { data: transcriptData, error: transcriptError } =
        await supabaseAdmin
          .from("transcript")
          .insert([{ callid: callId }])
          .select("*");

      if (transcriptError || !transcriptData || transcriptData.length === 0) {
        throw new Error(
          "Erreur lors de l'insertion dans 'transcript': " +
            (transcriptError?.message || "Aucune donnée retournée")
        );
      }

      const transcriptId = transcriptData[0].transcriptid;

      // Insert words associated with the transcription
      const parsedData = JSON.parse(transcriptionText);
      if (parsedData.words && parsedData.words.length > 0) {
        const wordsData = parsedData.words.map((word: WordData) => ({
          transcriptid: transcriptId,
          ...word,
        }));

        const { error: wordsError } = await supabaseAdmin
          .from("word")
          .insert(wordsData);

        if (wordsError) {
          throw new Error(
            "Erreur lors de l'insertion dans 'word': " + wordsError.message
          );
        }
      }
    }

    // 7. Réponse de succès
    return NextResponse.json({
      success: true,
      callId,
      message: "Appel créé avec succès",
    });
  } catch (error) {
    console.error("Error processing call:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Une erreur inconnue est survenue",
      },
      { status: 500 }
    );
  }
}
