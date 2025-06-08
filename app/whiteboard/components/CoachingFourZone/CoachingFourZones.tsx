"use client";

import { useState, useCallback, useEffect } from "react";
import { Box, Grid } from "@mui/material";
import CallUploader from "./CallUploader";
import Transcript from "./Transcript";
import FourZoneNode from "./FourZoneNode";
import { useCallData } from "@/context/CallDataContext";
import { useAppContext } from "@/context/AppContext"; // Pour récupérer l'entreprise
import { supabaseClient } from "@/lib/supabaseClient";
import { Conseiller, AvatarAnonyme } from "@/types/types"; // ✅ Import des types

export default function CoachingFourZones() {
  const { selectedCall, selectCall } = useCallData();
  const { setIdActivite } = useAppContext(); // Pour créer les sessions

  // États locaux pour les données nécessaires
  const [transcript, setTranscript] = useState<string | null>(null);
  const [selectedEntreprise, setSelectedEntreprise] = useState<number>(1); // Valeur par défaut ou récupérée du contexte
  const [conseillers, setConseillers] = useState<Conseiller[]>([]);
  const [avatarsAnonymes, setAvatarsAnonymes] = useState<AvatarAnonyme[]>([]);

  // Récupération des données au montage du composant
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupération des conseillers
        const { data: conseillerData, error: conseillerError } =
          await supabaseClient.from("conseillers").select("*");

        if (!conseillerError && conseillerData) {
          setConseillers(conseillerData);
        }

        // Récupération des avatars anonymes
        const { data: avatarData, error: avatarError } = await supabaseClient
          .from("avatars")
          .select("*");

        if (!avatarError && avatarData) {
          setAvatarsAnonymes(avatarData);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      }
    };

    fetchData();
  }, []);

  const handleCallUploaded = useCallback(
    (callData: any) => {
      selectCall(callData);
      setTranscript("Texte de la transcription générée...");
    },
    [selectCall]
  );

  // Fonction pour créer une session (remplace handleCreateSession)
  const createSession = async (conseillerId: number, callId: number) => {
    if (!conseillerId) {
      console.error("Aucun conseiller sélectionné.");
      return;
    }

    const dateNow = new Date().toISOString();

    try {
      // Création de l'activité
      const { data: activiteData, error: errorActivite } = await supabaseClient
        .from("activitesconseillers")
        .insert([
          {
            idconseiller: conseillerId,
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

      // Mise à jour du contexte avec l'ID de l'activité
      setIdActivite(activiteId);

      // Création de la relation call-activité
      if (callId) {
        await supabaseClient
          .from("callactivityrelation")
          .insert({ callid: callId, activityid: activiteId });
      }

      console.log("Session créée avec succès:", {
        conseillerId,
        callId,
        activiteId,
      });
    } catch (error) {
      console.error("Erreur lors de la création de la session:", error);
    }
  };

  const addComment = (text: string) => {
    // Ajoutez ici votre logique pour traiter le commentaire
    console.log("Commentaire ajouté:", text);
  };

  return (
    <Box sx={{ p: 2, width: "100%", height: "100%" }}>
      <Grid container spacing={2}>
        {/* Uploader d'appel */}
        <Grid item xs={12}>
          <CallUploader
            selectedEntreprise={selectedEntreprise}
            conseillers={conseillers}
            avatarsAnonymes={avatarsAnonymes}
            createSession={createSession}
          />
        </Grid>

        {/* Transcription + Player */}
        {selectedCall && (
          <Grid item xs={12} md={6}>
            <Transcript transcript={transcript ?? ""} addComment={addComment} />
          </Grid>
        )}

        {/* Four Zones pour les sélections */}
        {selectedCall && (
          <Grid item xs={12} md={6}>
            <FourZoneNode />
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
