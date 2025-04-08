// app/api/ai/improve/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialiser le client OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { text, prompt } = await request.json();

    if (!text || !prompt) {
      return NextResponse.json(
        { error: "Le texte et le prompt sont requis" },
        { status: 400 }
      );
    }

    const fullPrompt = `${prompt}\n\nTexte original: "${text}"\n\nTexte amélioré:`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Vous pouvez changer pour gpt-4 si disponible
      messages: [
        {
          role: "system",
          content:
            "Vous êtes un assistant spécialisé dans l'amélioration de textes pour le service client. Optimisez le texte selon les instructions sans ajouter de commentaires ni d'explications.",
        },
        {
          role: "user",
          content: fullPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const improvedText = response.choices[0].message.content?.trim();

    return NextResponse.json({ improvedText });
  } catch (error) {
    console.error("Erreur lors de l'appel à OpenAI:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'amélioration du texte" },
      { status: 500 }
    );
  }
}
