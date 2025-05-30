// app/api/tts/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const {
      text,
      voice = "alloy",
      speed = 1,
      model = "tts-1",
      tone,
    } = await request.json();

    if (model === "gpt-4o-mini-tts") {
      // Utiliser Chat Completions pour le contrôle du ton
      const toneInstructions = {
        professionnel:
          "Parlez d'un ton professionnel et courtois, adapté au conseil clientèle.",
        chaleureux:
          "Parlez d'un ton chaleureux et bienveillant, comme un ami qui aide.",
        enthousiaste:
          "Parlez avec enthousiasme et dynamisme, montrez de l'énergie positive.",
        calme: "Parlez d'un ton calme et rassurant, avec une voix apaisante.",
        confiant:
          "Parlez avec confiance et assurance, transmettez de la certitude.",
      };

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-audio-preview",
        modalities: ["text", "audio"],
        audio: { voice: voice, format: "mp3" },
        messages: [
          {
            role: "system",
            content:
              toneInstructions[tone] || toneInstructions["professionnel"],
          },
          {
            role: "user",
            content: text,
          },
        ],
      });

      // Extraire l'audio de la réponse
      const audioData = completion.choices[0].message.audio?.data;
      if (!audioData) {
        throw new Error("Pas de données audio générées");
      }

      const buffer = Buffer.from(audioData, "base64");
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "no-cache",
        },
      });
    } else {
      // API TTS classique
      const mp3 = await openai.audio.speech.create({
        model: model,
        voice: voice,
        input: text,
        speed: speed,
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "no-cache",
        },
      });
    }
  } catch (error: any) {
    console.error("Erreur TTS:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
