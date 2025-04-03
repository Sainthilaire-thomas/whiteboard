// app/api/transcribe/route.js
import { NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import FormData from "form-data";
import fetch from "node-fetch";

export async function POST(request) {
  try {
    // Avec App Router, nous devons traiter le multipart/form-data différemment
    const formData = await request.formData();
    const audioFile = formData.get("audio");

    if (!audioFile) {
      return NextResponse.json(
        { error: "Aucun fichier audio trouvé dans la requête" },
        { status: 400 }
      );
    }

    // Créer un répertoire temporaire
    const tmpDir = join(process.cwd(), "tmp");
    if (!existsSync(tmpDir)) {
      await mkdir(tmpDir, { recursive: true });
    }

    // Générer un nom de fichier unique
    const fileName = `recording_${Date.now()}.webm`;
    const filePath = join(tmpDir, fileName);

    // Convertir le Blob en Buffer et l'écrire sur le disque
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    await writeFile(filePath, buffer);

    // Préparer la requête pour l'API Whisper
    const whisperFormData = new FormData();
    whisperFormData.append("file", buffer, {
      filename: fileName,
      contentType: audioFile.type,
    });
    whisperFormData.append("model", "whisper-1");
    whisperFormData.append("language", "fr");
    whisperFormData.append("response_format", "json");

    // Appel à l'API Whisper d'OpenAI
    const response = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          // Le Content-Type est automatiquement défini par FormData
        },
        body: whisperFormData,
      }
    );

    // Récupérer la réponse
    const data = await response.json();

    // Nettoyer le fichier temporaire
    try {
      await unlink(filePath);
    } catch (err) {
      console.warn("Erreur lors de la suppression du fichier temporaire:", err);
    }

    // Gérer les erreurs éventuelles de l'API Whisper
    if (data.error) {
      console.error("Erreur Whisper API:", data.error);
      return NextResponse.json(
        { error: data.error.message || "Erreur lors de la transcription" },
        { status: 500 }
      );
    }

    // Renvoyer la transcription
    return NextResponse.json({ transcription: data.text });
  } catch (error) {
    console.error("Erreur de transcription:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la transcription audio",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
