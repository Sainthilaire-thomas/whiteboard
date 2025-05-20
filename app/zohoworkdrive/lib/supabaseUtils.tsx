// utils/supabaseUtils.js
import { supabaseClient } from "@/lib/supabaseClient";

// Génère une URL signée pour un fichier donné
export const generateSignedUrl = async (filePath, expiration = 1200) => {
  try {
    const { data, error } = await supabaseClient.storage
      .from("Calls")
      .createSignedUrl(filePath, expiration);
    if (error) {
      console.error("Erreur lors de la génération de l'URL signée :", error);
      throw new Error(error.message);
    }
    return data.signedUrl;
  } catch (error) {
    console.error("Erreur lors de la génération de l'URL signée :", error);
    throw error;
  }
};
