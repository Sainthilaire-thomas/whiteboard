import { supabaseClient } from "@/lib/supabaseClient";

/**
 * Supprime les fichiers audio, transcriptions et met à jour les métadonnées d'un appel.
 * @param callid - L'ID de l'appel à traiter.
 * @param filepath - Le chemin du fichier audio stocké (si disponible).
 * @returns Un objet avec `{ success: true }` si la suppression réussit.
 * @throws Lève une erreur si une étape échoue.
 */
export const removeCallUpload = async (
  callid: string,
  filepath: string | null
): Promise<{ success: boolean }> => {
  try {
    // 📝 Étape 1 : Supprimer le fichier audio si le chemin existe
    if (filepath) {
      const { error: storageError } = await supabaseClient.storage
        .from("Calls")
        .remove([filepath]);

      if (storageError) {
        console.error(
          "❌ Erreur de suppression du fichier audio :",
          storageError
        );
        throw new Error(
          `Erreur de suppression du fichier audio : ${storageError.message}`
        );
      }
    }

    // 📝 Étape 2 : Récupérer les IDs de transcription liés à l'appel
    const { data: transcripts, error: transcriptError } = await supabaseClient
      .from("transcript")
      .select("transcriptid")
      .eq("callid", callid);

    if (transcriptError) {
      console.error(
        "❌ Erreur lors de la récupération des transcriptions :",
        transcriptError
      );
      throw new Error("Erreur de récupération des transcriptions");
    }

    const transcriptIds = transcripts?.map((t) => t.transcriptid) ?? [];

    // 📝 Étape 3 : Supprimer les mots liés aux transcriptions
    if (transcriptIds.length > 0) {
      const { error: wordsDeleteError } = await supabaseClient
        .from("word")
        .delete()
        .in("transcriptid", transcriptIds);

      if (wordsDeleteError) {
        console.error("❌ Erreur de suppression des mots :", wordsDeleteError);
        throw new Error("Erreur de suppression des mots liés");
      }

      // 📝 Étape 4 : Supprimer les entrées de transcription
      const { error: transcriptDeleteError } = await supabaseClient
        .from("transcript")
        .delete()
        .in("transcriptid", transcriptIds);

      if (transcriptDeleteError) {
        console.error(
          "❌ Erreur de suppression des transcriptions :",
          transcriptDeleteError
        );
        throw new Error("Erreur de suppression des transcriptions");
      }
    }

    // 📝 Étape 5 : Réinitialiser les champs liés à l'audio dans l'entrée `call`
    const { error: callUpdateError } = await supabaseClient
      .from("call")
      .update({
        audiourl: null,
        filepath: null,
        upload: false,
        preparedfortranscript: false,
      })
      .eq("callid", callid);

    if (callUpdateError) {
      console.error("❌ Erreur de mise à jour de l'appel :", callUpdateError);
      throw new Error("Erreur de mise à jour des champs d'appel");
    }

    console.log(
      "✅ Suppression et mise à jour effectuées avec succès pour callid:",
      callid
    );
    return { success: true };
  } catch (error) {
    console.error("🔥 Erreur globale dans removeCallUpload :", error);
    throw error instanceof Error ? error : new Error("Erreur inconnue");
  }
};
