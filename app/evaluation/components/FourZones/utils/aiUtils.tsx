// utils/aiUtils.ts
"use client";

// Fonction pour appeler l'API ChatGPT
export const improveTextWithAI = async (text: string, prompt: string) => {
  try {
    const response = await fetch("/api/ai/improve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        prompt,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data = await response.json();
    return data.improvedText;
  } catch (error) {
    console.error("Erreur lors de l'appel à l'API:", error);
    throw error;
  }
};
