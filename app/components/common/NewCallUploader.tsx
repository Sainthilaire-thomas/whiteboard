"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useCallData } from "@/context/CallDataContext";
import { useAppContext } from "@/context/AppContext"; // ✅ Vérification d'où viennent les conseillers
import { supabaseClient } from "@/lib/supabaseClient";
import SelectionConseiller from "./SelectionConseiller";
import { Entreprise, Conseiller, AvatarAnonyme } from "@/types/types"; // ✅ Ajout des bons types

interface NewCallUploaderProps {
  selectedEntreprise: number | null;
}

export default function NewCallUploader({
  selectedEntreprise,
}: NewCallUploaderProps) {
  const { fetchCalls } = useCallData();
  const { setIdActivite } = useAppContext(); // ✅ Suppression des props inexistantes
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedConseiller, setSelectedConseiller] = useState<number | null>(
    null
  );
  const [conseillers, setConseillers] = useState<Conseiller[]>([]); // ✅ Ajout local des conseillers
  const [avatarsAnonymes, setAvatarsAnonymes] = useState<AvatarAnonyme[]>([]); // ✅ Ajout local des avatars

  // ✅ Récupération des conseillers et avatars
  useEffect(() => {
    const fetchConseillers = async () => {
      const { data, error } = await supabaseClient
        .from("conseillers")
        .select("*");
      if (!error && data) setConseillers(data);
    };

    const fetchAvatarsAnonymes = async () => {
      const { data, error } = await supabaseClient.from("avatars").select("*");
      if (!error && data) setAvatarsAnonymes(data);
    };

    fetchConseillers();
    fetchAvatarsAnonymes();
  }, []);

  useEffect(() => {
    if (selectedEntreprise) {
      fetchCalls(selectedEntreprise);
    }
  }, [selectedEntreprise, fetchCalls]);

  const handleAudioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      setAudioFile(event.target.files[0]);
    }
  };

  const createSession = async (idConseiller: number, callId: number) => {
    if (!idConseiller) {
      console.error("Aucun conseiller sélectionné.");
      return;
    }

    const dateNow = new Date().toISOString();
    try {
      const { data: activiteData, error: errorActivite } = await supabaseClient
        .from("activitesconseillers")
        .insert([
          {
            idconseiller: idConseiller,
            dateactivite: dateNow,
            statut: "ouvert",
            nature: "évaluation",
          },
        ])
        .select()
        .single();

      if (errorActivite) throw errorActivite;

      const activiteId = activiteData?.idactivite;
      if (!activiteId) {
        console.error("Erreur : activiteId est null après insertion.");
        return;
      }

      setIdActivite(activiteId);

      // ✅ Vérification avant insertion de la relation call-activity
      if (callId) {
        await supabaseClient
          .from("callactivityrelation")
          .insert({ callid: callId, activityid: activiteId });
      }
    } catch (error) {
      console.error("Erreur lors de la création de l'activité :", error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedEntreprise || !audioFile || !selectedConseiller) {
      console.warn(
        "Sélectionner un conseiller et un fichier audio avant d'uploader."
      );
      return;
    }

    setIsLoading(true);
    try {
      const filePath = `audio/${Date.now()}_${audioFile.name}`;
      const { error } = await supabaseClient.storage
        .from("Calls")
        .upload(filePath, audioFile);
      if (error) throw error;

      // Insérer l'appel dans la base
      const { data: callData, error: callError } = await supabaseClient
        .from("call")
        .insert([
          { audiourl: filePath, filename: audioFile.name, filepath: filePath },
        ])
        .select("callid")
        .single();

      if (callError) throw callError;

      // ✅ Vérification que `callData` existe avant d'accéder à `callid`
      if (!callData?.callid) {
        console.error("Erreur : callData est null après l'insertion.");
        return;
      }

      await createSession(selectedConseiller, callData.callid);
      fetchCalls(selectedEntreprise);
    } catch (error) {
      console.error("Erreur lors de l'upload :", error);
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
        <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
          <IconButton
            size="small"
            onClick={() => fetchCalls(selectedEntreprise || 0)}
          >
            <RefreshIcon />
          </IconButton>
        </Box>

        <AccordionDetails>
          {/* ✅ Ajout du composant SelectionConseiller avec les bonnes props */}
          <SelectionConseiller
            conseillers={conseillers}
            avatarsAnonymes={avatarsAnonymes}
            onSelectionChange={(data) =>
              setSelectedConseiller(data ? data.id : null)
            }
            selectedValue={
              selectedConseiller
                ? { type: "conseiller", id: selectedConseiller }
                : null
            }
          />
          <Box>
            <Button
              variant="outlined"
              component="label"
              disabled={isLoading}
              fullWidth
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
              <Typography variant="caption">
                Fichier : {audioFile.name}
              </Typography>
            )}
            <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isLoading || !audioFile || !selectedConseiller}
                onClick={handleSubmit}
              >
                Charger
              </Button>
              {isLoading && <CircularProgress size={24} sx={{ ml: 2 }} />}
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
