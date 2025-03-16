import { supabaseClient } from "@/lib/supabaseClient";

// Génère une URL signée pour un fichier donné
export const generateSignedUrl = async (
  filePath: string,
  expiration: number = 1200
): Promise<string> => {
  try {
    const { data, error } = await supabaseClient.storage
      .from("Calls")
      .createSignedUrl(filePath, expiration);

    if (error) {
      console.error(
        "❌ Erreur lors de la génération de l'URL signée :",
        error.message
      );
      throw new Error(error.message);
    }

    if (!data?.signedUrl) {
      console.error(
        "⚠️ Aucune URL signée retournée pour le fichier :",
        filePath
      );
      throw new Error("Aucune URL signée générée.");
    }

    return data.signedUrl;
  } catch (error) {
    console.error(
      "❌ Erreur inattendue lors de la génération de l'URL signée :",
      (error as Error).message
    );
    throw error;
  }
};
