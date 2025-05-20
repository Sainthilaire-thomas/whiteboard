// utils/audioUploadUtils.js
import { supabaseClient } from "@/lib/supabaseClient";
import { generateSignedUrl } from "./supabaseUtils";

export const uploadAudio = async (file, entrepriseId) => {
  // Inclure l'ID d'entreprise dans le chemin du fichier
  const fileName = `${Date.now()}.${file.name.split(".").pop()}`;
  const filePath = `audio/${entrepriseId}/${fileName}`;

  const { error } = await supabaseClient.storage
    .from("Calls")
    .upload(filePath, file, {
      contentType: file.type,
      upsert: true,
    });

  if (error) {
    console.error("Erreur lors de l'upload :", error.message);
    throw new Error(error.message);
  }

  return filePath;
};

// Ajouter une transcription pour un appel
export const addTranscription = async (callid, transcriptionText) => {
  const { data: transcriptData, error: transcriptError } = await supabaseClient
    .from("transcript")
    .insert([{ callid }])
    .select("*");

  if (transcriptError || !transcriptData || transcriptData.length === 0) {
    throw new Error(
      "Erreur lors de l'insertion dans 'transcript': " +
        (transcriptError?.message || "Aucune donnée retournée")
    );
  }

  const transcriptId = transcriptData[0].transcriptid;

  if (transcriptionText?.words) {
    const wordsData = transcriptionText.words.map((word) => ({
      transcriptid: transcriptId,
      ...word,
    }));

    const { error: wordsError } = await supabaseClient
      .from("word")
      .insert(wordsData);

    if (wordsError) {
      throw new Error(
        "Erreur lors de l'insertion dans 'word': " + wordsError.message
      );
    }
  }

  return transcriptId;
};

// Mettre à jour le statut d'un appel
export const markCallAsPrepared = async (callid) => {
  const { error } = await supabaseClient
    .from("call")
    .update({ preparedfortranscript: true })
    .eq("callid", callid);

  if (error) {
    throw new Error(
      "Erreur lors de la mise à jour de 'call': " + error.message
    );
  }
};

export const prepareCallForTagging = async ({ call, showMessage }) => {
  console.log("🔍 prepareCallForTagging - call reçu :", call);
  console.log("🔍 prepareCallForTagging - showMessage reçu :", showMessage);

  if (!call || !call.callid) {
    console.error("❌ prepareCallForTagging - call est invalide :", call);
    showMessage?.(
      "Erreur : Impossible de préparer l'appel car il est invalide."
    );
    return;
  }

  try {
    // Étape 1 : Ajouter une transcription et des mots
    console.log(
      "📄 prepareCallForTagging - Ajout de transcription pour callid :",
      call.callid
    );
    await addTranscription(call.callid, call.transcription);

    // Étape 2 : Vérifiez si l'audio est associé
    if (!call.audiourl) {
      console.warn("⚠️ prepareCallForTagging - Aucun fichier audio associé");
      showMessage?.(
        "Aucun fichier audio associé. Vous pouvez le charger plus tard."
      );
    }

    // Étape 3 : Marquer l'appel comme préparé
    console.log(
      "📌 prepareCallForTagging - Marquage comme préparé pour callid :",
      call.callid
    );
    await markCallAsPrepared(call.callid);

    // Message de succès
    showMessage?.("L'appel a été préparé pour le tagging avec succès !");
  } catch (error) {
    console.error("❌ prepareCallForTagging - Erreur :", error.message);
    showMessage?.(`Erreur: ${error.message}`);
    throw error;
  }
};

// Version modifiée pour inclure l'entrepriseId
export const handleCallSubmission = async ({
  audioFile,
  description,
  transcriptionText,
  showMessage,
  onCallUploaded,
  entrepriseId, // Nouvel argument pour l'ID d'entreprise
}) => {
  let filePath = null;
  let audioUrl = null;

  try {
    // Step 1: Upload the audio file (if provided)
    if (audioFile) {
      filePath = await uploadAudio(audioFile, entrepriseId); // Passer l'entrepriseId
      audioUrl = await generateSignedUrl(filePath, 60); // Générer l'URL signée
    }

    // Step 2: Insert the call into the database
    const { data: callData, error: callDataError } = await supabaseClient
      .from("call")
      .insert([
        {
          audiourl: audioUrl,
          filename: audioFile ? audioFile.name : null,
          filepath: filePath,
          description: description || null,
          transcription: transcriptionText
            ? JSON.parse(transcriptionText)
            : null,
          upload: !!audioFile,
          is_tagging_call: true,
          preparedfortranscript: true,
        },
      ])
      .select("*");

    if (callDataError || !callData || callData.length === 0) {
      throw new Error(
        "Erreur lors de l'insertion dans 'call': " +
          (callDataError?.message || "Aucune donnée retournée")
      );
    }

    const callId = callData[0].callid;

    // Step 3: Create the relationship between call and entreprise
    if (entrepriseId) {
      const { error: relationError } = await supabaseClient
        .from("entreprise_call")
        .insert([{ identreprise: entrepriseId, callid: callId }]);

      if (relationError) {
        console.error(
          "Erreur lors de la création de la relation entreprise-appel:",
          relationError
        );
        throw new Error(
          "Erreur lors de la création de la relation entreprise-appel"
        );
      }
    }

    // Step 4: Insert transcription (if provided)
    if (transcriptionText) {
      const { data: transcriptData, error: transcriptError } =
        await supabaseClient
          .from("transcript")
          .insert([{ callid: callId }])
          .select("*");

      if (transcriptError || !transcriptData || transcriptData.length === 0) {
        throw new Error(
          "Erreur lors de l'insertion dans 'transcript': " +
            (transcriptError?.message || "Aucune donnée retournée")
        );
      }

      const transcriptId = transcriptData[0].transcriptid;

      // Insert words associated with the transcription
      const parsedData = JSON.parse(transcriptionText);
      if (parsedData.words && parsedData.words.length > 0) {
        const wordsData = parsedData.words.map((word) => ({
          transcriptid: transcriptId,
          ...word,
        }));

        const { error: wordsError } = await supabaseClient
          .from("word")
          .insert(wordsData);

        if (wordsError) {
          throw new Error(
            "Erreur lors de l'insertion dans 'word': " + wordsError.message
          );
        }
      }
    }

    // Callback for successful upload
    if (onCallUploaded) {
      onCallUploaded(callId);
    }

    // Success message
    showMessage("Appel chargé avec succès !");

    return callId;
  } catch (error) {
    console.error("Erreur dans handleCallSubmission :", error.message);
    showMessage(`Erreur: ${error.message}`);
    throw error;
  }
};
