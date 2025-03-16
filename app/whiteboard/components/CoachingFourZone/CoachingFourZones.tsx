// CoachingFourZones.tsx
"use client";

import { useState, useCallback } from "react";
import { Box, Grid } from "@mui/material";
import NewCallUploader from "./CallUploader";
import Transcript from "./Transcript";
import FourZoneNode from "./FourZoneNode";
import { useCallData } from "@/context/CallDataContext";

export default function CoachingFourZones() {
  const { selectedCall, selectCall } = useCallData();
  const [transcript, setTranscript] = useState<string | null>(null);

  const handleCallUploaded = useCallback(
    (callData: any) => {
      selectCall(callData);
      setTranscript("Texte de la transcription générée...");
    },
    [selectCall]
  );

  const addComment = (text: string) => {
    // Ajoutez ici votre logique pour traiter le commentaire
  };

  return (
    <Box sx={{ p: 2, width: "100%", height: "100%" }}>
      <Grid container spacing={2}>
        {/* Uploader d'appel */}
        <Grid item xs={12}>
          <NewCallUploader onUpload={handleCallUploaded} />
        </Grid>

        {/* Transcription + Player */}
        {selectedCall && (
          <Grid item xs={12} md={6}>
            <Transcript
              transcript={transcript ?? ""} // ✅ Utilise une chaîne vide si null
              addComment={addComment}
            />
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
