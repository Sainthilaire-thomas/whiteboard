import { useEffect, useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { useCallData } from "@/context/CallDataContext";
import { useAudio } from "@/hooks/CallDataContext/useAudio"; // Corrigé le chemin (vérifiez le bon chemin)
import { useAppContext } from "@/context/AppContext";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import Postit from "./Postit";
import {
  Postit as PostitType,
  AppContextType,
  Sujet,
  Pratique,
  Domaine,
} from "@/types/types";

export default function EvaluationPostits() {
  const { appelPostits, addPostit, updatePostit, transcription, currentWord } =
    useCallData();
  const { currentWordIndex } = useAudio();
  const {
    selectedPostitIds,
    setSelectedPostitIds,
    selectedSujet,
    selectedPratique,
    domains,
  } = useAppContext();

  const handleAddPostit = () => {
    if (!currentWord) {
      console.warn("Pas de mot sélectionné, impossible de créer un post-it.");
      return;
    }

    const wordid = currentWord.wordid ?? 0;
    const word = currentWord.text ?? "Post-it";
    const timestamp = currentWord.timestamp ?? 0;

    addPostit(wordid, word, timestamp);
  };

  useEffect(() => {
    console.log("Post-its actuels dans EvaluationPostits:", appelPostits);
  }, [appelPostits]);

  // Gérer la sélection avec double-clic, réinitialiser les champs
  const handleDoubleClick = (postitId: number) => {
    setSelectedPostitIds([postitId]);
    // ✅ Corrigé : updatePostit prend (id, updatedFields)
    updatePostit(postitId, {
      sujet: "Non assigné",
      pratique: "Non assigné",
      iddomaine: null,
      idsujet: null,
      idpratique: null,
    });
  };

  // Mettre à jour les champs des post-its sélectionnés
  useEffect(() => {
    if (selectedPostitIds.length > 0) {
      selectedPostitIds.forEach((postitId) => {
        // ✅ Corrigé : un seul appel updatePostit avec un objet
        updatePostit(postitId, {
          sujet: selectedSujet ? selectedSujet.nomsujet : "Non assigné",
          idsujet: selectedSujet ? selectedSujet.idsujet : null,
          pratique: selectedPratique
            ? selectedPratique.nompratique
            : "Non assigné",
          idpratique: selectedPratique ? selectedPratique.idpratique : null,
          iddomaine: selectedSujet ? selectedSujet.iddomaine : null,
        });
      });
    }
  }, [
    selectedPostitIds,
    selectedSujet,
    selectedPratique,
    domains,
    updatePostit,
  ]);

  return (
    <Box sx={{ width: "25%", p: 2, overflowY: "auto", height: "calc(100vh)" }}>
      <Typography variant="h6" gutterBottom>
        Post-its
      </Typography>
      {/* Bouton pour ajouter un nouveau post-it */}
      <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }}>
        <IconButton color="primary" onClick={handleAddPostit}>
          <NoteAddIcon />
        </IconButton>
      </Box>
      {appelPostits.map((postit: PostitType) => (
        <Postit key={postit.id} postit={postit} />
      ))}
    </Box>
  );
}
