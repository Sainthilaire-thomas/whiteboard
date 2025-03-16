import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  CircularProgress,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Snackbar,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { supabaseClient } from "@/lib/supabaseClient";
import SelectionConseiller from "./SelectionConseiller";
import { useCallData } from "@/context/CallDataContext";

interface CallUploaderProps {
  selectedEntreprise: string | number;
  conseillers: {
    idconseiller: number;
    avatarUrl?: string;
    nom: string;
    estanonyme: boolean;
  }[];
  avatarsAnonymes: {
    idavatar: number;
    url?: string;
    nom: string;
  }[];
  createSession: (conseillerId: number, callId: number) => void;
}

const CallUploader: React.FC<CallUploaderProps> = ({
  selectedEntreprise,
  conseillers,
  avatarsAnonymes,
  createSession,
}) => {
  const { fetchCalls } = useCallData();
  const [description, setDescription] = useState<string>("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcriptionText, setTranscriptionText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedConseillerData, setSelectedConseillerData] =
    useState<any>(null);
  const [snackPack, setSnackPack] = useState<
    { message: string; key: number }[]
  >([]);
  const [open, setOpen] = useState<boolean>(false);
  const [messageInfo, setMessageInfo] = useState<
    { message: string; key: number } | undefined
  >(undefined);

  useEffect(() => {
    if (snackPack.length && !messageInfo) {
      setMessageInfo({ ...snackPack[0] });
      setSnackPack((prev) => prev.slice(1));
      setOpen(true);
    } else if (snackPack.length && messageInfo && open) {
      setOpen(false);
    }
  }, [snackPack, messageInfo, open]);

  const showMessage = (message: string) => {
    setSnackPack((prev) => [...prev, { message, key: new Date().getTime() }]);
  };

  const handleAudioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length) {
      setAudioFile(event.target.files[0]);
    }
  };

  const handleTranscriptionChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTranscriptionText(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedEntreprise) {
      showMessage(
        "Veuillez sélectionner une entreprise avant de charger un appel."
      );
      return;
    }

    if (!audioFile && !description) {
      showMessage(
        "Veuillez sélectionner un fichier audio ou fournir une description."
      );
      return;
    }

    if (!selectedConseillerData) {
      showMessage(
        "Veuillez sélectionner un conseiller avant de charger un appel."
      );
      return;
    }

    setIsLoading(true);

    try {
      let audioUrl: string | null = null;
      let filePath: string | null = null;

      if (audioFile) {
        const fileName = `${Date.now()}-${audioFile.name}`;
        filePath = `audio/${fileName}`;

        const { error: uploadError } = await supabaseClient.storage
          .from("Calls")
          .upload(filePath, audioFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: signedUrlData, error: signedUrlError } =
          await supabaseClient.storage
            .from("Calls")
            .createSignedUrl(filePath, 60);

        if (signedUrlError) throw signedUrlError;

        audioUrl = signedUrlData?.signedUrl ?? null;
      }

      const { data: callData, error: callError } = await supabaseClient
        .from("call")
        .insert([
          {
            audiourl: audioUrl,
            filename: audioFile?.name ?? null,
            filepath: filePath,
            transcription: transcriptionText || null,
            description: description || null,
            upload: !!audioFile,
          },
        ])
        .select("*");

      if (callError || !callData?.length) throw callError;

      const callId = callData[0].callid;

      await supabaseClient
        .from("entreprise_call")
        .insert([{ identreprise: Number(selectedEntreprise), callid: callId }]); // ✅ Corrige l'erreur

      const { type, id } = selectedConseillerData;

      let conseillerId: number;

      if (type === "avatar") {
        conseillerId = Number(id); // Convertit l'ID en nombre pour les avatars
      } else if (type === "conseiller") {
        conseillerId = Number(id); // Convertit également en nombre pour les conseillers
      } else {
        showMessage("Type de conseiller inconnu.");
        return;
      }

      createSession(conseillerId, callId); // ✅ Toujours un number ici

      showMessage("Chargement réussi !");
      fetchCalls(Number(selectedEntreprise)); // ✅ Convertit en nombre, supprime l'erreur

      setDescription("");
      setAudioFile(null);
      setTranscriptionText("");
      setSelectedConseillerData(null);
    } catch (error: any) {
      showMessage(`Erreur: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Charger un nouvel appel</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box component="form" onSubmit={handleSubmit}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              disabled={isLoading}
            >
              Choisir un fichier audio
              <input
                type="file"
                hidden
                accept="audio/*"
                onChange={handleAudioChange}
              />
            </Button>
            {audioFile && (
              <Typography variant="caption" color="textSecondary">
                Fichier sélectionné : {audioFile.name}
              </Typography>
            )}
            <TextField
              margin="normal"
              fullWidth
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              variant="outlined"
            />
            <TextField
              margin="normal"
              fullWidth
              label="Transcription"
              value={transcriptionText}
              onChange={handleTranscriptionChange}
              disabled={isLoading}
              multiline
              rows={4}
              variant="outlined"
            />
            <SelectionConseiller
              conseillers={conseillers ?? []} // ✅ Remplacement de undefined par []
              avatarsAnonymes={avatarsAnonymes ?? []} // ✅ Même traitement
              onSelectionChange={setSelectedConseillerData}
              selectedValue={selectedConseillerData}
            />

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isLoading}
              >
                Charger
              </Button>
              {isLoading && <CircularProgress size={24} sx={{ ml: 2 }} />}
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
      <Snackbar
        key={messageInfo?.key}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        open={open}
        autoHideDuration={6000}
        onClose={() => setOpen(false)}
        message={messageInfo?.message}
        action={
          <Button color="secondary" size="small" onClick={() => setOpen(false)}>
            Fermer
          </Button>
        }
      />
    </Box>
  );
};

export default CallUploader;
