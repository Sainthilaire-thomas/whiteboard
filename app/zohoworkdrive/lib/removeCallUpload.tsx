// lib/removeCallUpload.ts
import { supabaseClient } from "@/lib/supabaseClient";
import type { RemoveCallUploadResult, Transcript } from "../types";

// ✅ Fonction avec types corrects importés depuis les types locaux
export const removeCallUpload = async (
  callid: number,
  filepath: string | null
): Promise<RemoveCallUploadResult> => {
  try {
    // Step 1: Remove the audio file from storage if the filepath exists
    if (filepath) {
      await supabaseClient.storage.from("Calls").remove([filepath]);
    }

    // Step 2: Fetch transcript IDs associated with the call
    const { data: transcripts, error: transcriptError } = await supabaseClient
      .from("transcript")
      .select("transcriptid")
      .eq("callid", callid);

    if (transcriptError) {
      console.error(
        "Error fetching transcript IDs associated with the call:",
        transcriptError
      );
      throw new Error("Error fetching transcript IDs");
    }

    // ✅ Assertion de type pour les données Supabase
    const transcriptData = transcripts as Transcript[] | null;
    const transcriptIds = transcriptData?.map((t) => t.transcriptid) || [];

    // Step 3: Remove words associated with the transcripts
    if (transcriptIds.length > 0) {
      const { error: wordDeleteError } = await supabaseClient
        .from("word")
        .delete()
        .in("transcriptid", transcriptIds);

      if (wordDeleteError) {
        console.error("Error deleting words:", wordDeleteError);
        throw new Error("Error deleting words");
      }
    }

    // Step 4: Remove the transcript entries
    if (transcriptIds.length > 0) {
      const { error: transcriptDeleteError } = await supabaseClient
        .from("transcript")
        .delete()
        .in("transcriptid", transcriptIds);

      if (transcriptDeleteError) {
        console.error(
          "Error deleting transcript entries:",
          transcriptDeleteError
        );
        throw new Error("Error deleting transcripts");
      }
    }

    // Step 5: Update the call entry to remove upload-related fields
    const { error: updateError } = await supabaseClient
      .from("call")
      .update({
        audiourl: null,
        filepath: null,
        upload: false,
        preparedfortranscript: false,
      })
      .eq("callid", callid);

    if (updateError) {
      console.error("Error updating call fields in the database:", updateError);
      throw new Error("Error updating call");
    }

    return { success: true };
  } catch (error) {
    console.error("Error in removeCallUpload:", error);
    throw error;
  }
};
