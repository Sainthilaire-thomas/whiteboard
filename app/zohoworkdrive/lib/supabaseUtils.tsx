// lib/supabaseUtils.ts
import { supabaseClient } from "@/lib/supabaseClient";

// ✅ Génère une URL signée pour un fichier donné
export const generateSignedUrl = async (
  filePath: string,
  expiration: number = 1200
): Promise<string> => {
  try {
    const { data, error } = await supabaseClient.storage
      .from("Calls")
      .createSignedUrl(filePath, expiration);

    if (error) {
      console.error("Erreur lors de la génération de l'URL signée :", error);
      throw new Error(error.message);
    }

    if (!data?.signedUrl) {
      throw new Error("URL signée non générée");
    }

    return data.signedUrl;
  } catch (error) {
    console.error("Erreur lors de la génération de l'URL signée :", error);
    throw error;
  }
};
