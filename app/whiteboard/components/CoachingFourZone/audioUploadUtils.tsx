import { supabaseClient } from "@/lib/supabaseClient";
import { generateSignedUrl } from "./supabaseUtils";

// Type pour la transcription
interface Word {
  startTime: number;
  endTime: number;
  text: string;
  turn?: string;
}

interface Transcription {
  words: Word[];
}

interface Call {
  callid: string;
  audiourl?: string;
  transcription?: Transcription;
}

// Téléversement de fichier audio
export const uploadAudio = async (file: File): Promise<string> => {
  const extension = file.name.split(".").pop();
  const fileName = `${Date.now()}.${extension}`;
  const filePath = `audio/${fileName}`;

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

// Ajout de la transcription pour un appel
export const addTranscription = async (
  callid: string,
  transcriptionText?: Transcription
): Promise<string> => {
  const { data: transcriptData, error: transcriptError } = await supabaseClient
    .from("transcript")
    .insert([{ callid }])
    .select("*");

  if (transcriptError || !transcriptData?.length) {
    throw new Error(
      `Erreur lors de l'insertion dans 'transcript': ${
        transcriptError?.message ?? "Aucune donnée retournée"
      }`
    );
  }

  const transcriptId = transcriptData[0].transcriptid;

  if (transcriptionText?.words?.length) {
    const wordsData = transcriptionText.words.map((word) => ({
      transcriptid: transcriptId,
      ...word,
    }));

    const { error: wordsError } = await supabaseClient
      .from("word")
      .insert(wordsData);
    if (wordsError) {
      throw new Error(
        `Erreur lors de l'insertion dans 'word': ${wordsError.message}`
      );
    }
  }

  return transcriptId;
};

// Marquer un appel comme préparé
export const markCallAsPrepared = async (callid: string): Promise<void> => {
  const { error } = await supabaseClient
    .from("call")
    .update({ preparedfortranscript: true })
    .eq("callid", callid);

  if (error) {
    throw new Error(
      `Erreur lors de la mise à jour de 'call': ${error.message}`
    );
  }
};

// Préparer un appel pour le tagging
export const prepareCallForTagging = async ({
  call,
  showMessage,
}: {
  call: Call;
  showMessage?: (message: string) => void;
}): Promise<void> => {
  if (!call?.callid) {
    showMessage?.(
      "Erreur : Impossible de préparer l'appel car il est invalide."
    );
    throw new Error("Appel invalide.");
  }

  try {
    await addTranscription(call.callid, call.transcription);
    if (!call.audiourl)
      showMessage?.(
        "Aucun fichier audio associé. Vous pouvez le charger plus tard."
      );
    await markCallAsPrepared(call.callid);
    showMessage?.("L'appel a été préparé pour le tagging avec succès !");
  } catch (error) {
    showMessage?.(`Erreur: ${(error as Error).message}`);
    throw error;
  }
};

// Soumission d'un appel avec audio, description et transcription
interface HandleCallSubmissionProps {
  audioFile?: File;
  description?: string;
  transcriptionText?: string;
  showMessage: (message: string) => void;
  onCallUploaded?: (callId: string) => void;
}

export const handleCallSubmission = async ({
  audioFile,
  description,
  transcriptionText,
  showMessage,
  onCallUploaded,
}: HandleCallSubmissionProps): Promise<void> => {
  let filePath: string | null = null;
  let audioUrl: string | null = null;

  try {
    if (audioFile) {
      filePath = await uploadAudio(audioFile);
      audioUrl = await generateSignedUrl(filePath, 60);
    }

    const { data: callData, error: callDataError } = await supabaseClient
      .from("call")
      .insert([
        {
          audiourl: audioUrl,
          filename: audioFile?.name ?? null,
          filepath: filePath,
          description: description ?? null,
          transcription: transcriptionText
            ? JSON.parse(transcriptionText)
            : null,
          upload: Boolean(audioFile),
          is_tagging_call: true,
          preparedfortranscript: true,
        },
      ])
      .select("*");

    if (callDataError || !callData?.length) {
      throw new Error(
        `Erreur lors de l'insertion dans 'call': ${
          callDataError?.message ?? "Aucune donnée retournée"
        }`
      );
    }

    const callId = callData[0].callid;

    if (transcriptionText) {
      const transcriptId = await addTranscription(
        callId,
        JSON.parse(transcriptionText)
      );
    }

    onCallUploaded?.(callId);
    showMessage("Appel chargé avec succès !");
  } catch (error) {
    showMessage(`Erreur: ${(error as Error).message}`);
    console.error(
      "Erreur dans handleCallSubmission :",
      (error as Error).message
    );
    throw error;
  }
};
