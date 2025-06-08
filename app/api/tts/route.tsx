// app/api/tts/route.ts - VERSION CORRIGÉE

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ TONS SPÉCIALISÉS POUR LE CONSEIL
const toneInstructions = {
  professionnel:
    "Parlez d'un ton professionnel et courtois, adapté au conseil clientèle.",
  chaleureux:
    "Parlez d'un ton chaleureux et bienveillant, comme un ami qui aide.",
  enthousiaste:
    "Parlez avec enthousiasme et dynamisme, montrez de l'énergie positive.",
  calme: "Parlez d'un ton calme et rassurant, avec une voix apaisante.",
  confiant: "Parlez avec confiance et assurance, transmettez de la certitude.",
  explication:
    "Adoptez un ton pédagogique et structuré pour expliquer clairement.",
  empathique:
    "Parlez avec compréhension et bienveillance, montrez de l'empathie.",
  resolution_probleme:
    "Utilisez un ton orienté solution, dynamique et rassurant.",
  instructions:
    "Adoptez un ton clair et directif pour donner des instructions.",
  urgence_controlee:
    "Transmettez l'importance tout en restant calme et maîtrisé.",
};

// ✅ ANALYSE CONTEXTUELLE SIMPLIFIÉE
const analyzeTextContext = (text: string) => {
  const patterns = {
    explication: /(donc|ainsi|c'est-à-dire|en effet|par conséquent)/i,
    empathique: /(je comprends|je vois|effectivement|désolé)/i,
    resolution_probleme: /(solution|résoudre|problème|nous allons)/i,
    instructions: /(vous devez|il faut|suivez|procédez|étape)/i,
    urgence_controlee: /(urgent|rapidement|important|attention)/i,
  };

  for (const [context, pattern] of Object.entries(patterns)) {
    if (pattern.test(text)) {
      return context;
    }
  }
  return "professionnel";
};

// ✅ PREPROCESSING SIMPLIFIÉ
const enhanceTextForProsodie = (text: string, detectedContext: string) => {
  let enhancedText = text.replace(/\s+/g, " ").trim();

  switch (detectedContext) {
    case "explication":
      enhancedText = enhancedText.replace(/(donc|ainsi)/gi, "... $1 ...");
      break;
    case "empathique":
      enhancedText = enhancedText.replace(
        /(je comprends|effectivement)/gi,
        "$1..."
      );
      break;
  }

  return enhancedText;
};

export async function POST(request: NextRequest) {
  try {
    const {
      text,
      voice = "alloy",
      speed = 1,
      model = "tts-1",
      tone,
      textEnhancement = "aucun",
      autoDetectContext = false,
    } = await request.json();

    console.log("🎙️ TTS Request:", {
      model,
      tone,
      textEnhancement,
      autoDetectContext,
    });

    let processedText = text;
    let effectiveTone = tone || "professionnel";

    // ✅ ENHANCEMENT AUTOMATIQUE DU CONTEXTE
    if (autoDetectContext || textEnhancement === "contextuel") {
      const detectedContext = analyzeTextContext(text);
      console.log(`🎭 Contexte détecté: ${detectedContext}`);

      if (!tone) {
        effectiveTone = detectedContext;
      }

      if (textEnhancement === "contextuel") {
        processedText = enhanceTextForProsodie(text, detectedContext);
        console.log(`📝 Texte enrichi: ${processedText}`);
      }
    }

    // ✅ CORRECTION: Utiliser le bon nom de modèle
    if (model === "gpt-4o-mini-tts" || model === "gpt-4o-audio") {
      // ✅ Vérifier si le modèle GPT-4o-audio est disponible
      try {
        const selectedInstruction =
          toneInstructions[effectiveTone] || toneInstructions["professionnel"];

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-audio-preview", // ✅ MODÈLE CORRECT
          modalities: ["text", "audio"],
          audio: { voice: voice, format: "mp3" },
          messages: [
            {
              role: "system",
              content: `${selectedInstruction}

Directives pour la prosodie:
- Respectez la ponctuation pour les pauses naturelles
- Modulez votre intonation selon le sens des phrases
- Gardez un ton professionnel adapté au conseil clientèle`,
            },
            {
              role: "user",
              content: processedText,
            },
          ],
        });

        const audioData = completion.choices[0].message.audio?.data;
        if (!audioData) {
          throw new Error("Pas de données audio générées");
        }

        const buffer = Buffer.from(audioData, "base64");
        return new NextResponse(buffer, {
          headers: {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "no-cache",
            "X-Enhanced-Context": effectiveTone,
          },
        });
      } catch (audioError) {
        console.warn(
          "❌ GPT-4o-audio non disponible, fallback vers TTS standard:",
          audioError
        );
        // Fallback vers TTS standard
      }
    }

    // ✅ API TTS STANDARD (toujours disponible)
    console.log("🔄 Utilisation TTS standard");
    const mp3 = await openai.audio.speech.create({
      model:
        model === "gpt-4o-mini-tts" || model === "gpt-4o-audio"
          ? "tts-1"
          : model,
      voice: voice,
      input: processedText,
      speed: speed,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-cache",
        "X-Model-Used": model === "gpt-4o-mini-tts" ? "tts-1-fallback" : model,
      },
    });
  } catch (error: any) {
    console.error("❌ Erreur TTS complète:", {
      message: error.message,
      status: error.status,
      code: error.code,
    });

    return NextResponse.json(
      {
        error: `Erreur TTS: ${error.message}`,
        details: error.code || "Unknown error",
      },
      { status: 500 }
    );
  }
}
