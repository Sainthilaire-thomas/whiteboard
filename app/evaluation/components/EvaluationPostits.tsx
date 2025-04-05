import { useEffect, useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { useCallData } from "@/context/CallDataContext";
import { useAudio } from "@/hooks/useAudionew";
import { useAppContext } from "@/context/AppContext";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import Postit from "./Postit";
import {
  Postit as PostitType,
  AppContextType,
  Sujet,
  Pratique,
  Domaine,
} from "@/types/types"; // Importation du type pour les post-its

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

  // Fonction pour créer un nouveau post-it avec des valeurs par défaut si `currentWord` n'est pas défini
  const handleAddPostit = () => {
    if (!currentWord) {
      console.warn("Pas de mot sélectionné, impossible de créer un post-it.");
      return;
    }

    const wordid = currentWord.wordid ?? 0; // Utilise 0 comme valeur par défaut
    const word = currentWord.text ?? "Post-it"; // Utilise "Post-it" comme valeur par défaut
    const timestamp = currentWord.timestamp ?? 0; // Utilise 0 comme valeur par défaut si timestamp est undefined

    addPostit(wordid, word, timestamp); // Appel de addPostit avec des valeurs garanties
  };

  useEffect(() => {
    console.log("Post-its actuels dans EvaluationPostits:", appelPostits);
  }, [appelPostits]);

  // Gérer la sélection avec double-clic, réinitialiser les champs
  const handleDoubleClick = (postitId: number) => {
    setSelectedPostitIds([postitId]); // Sélectionne uniquement ce post-it
    updatePostit(postitId, "sujet", "Non assigné"); // Passer le champ et la valeur
    updatePostit(postitId, "pratique", "Non assigné");
    updatePostit(postitId, "iddomaine", "Non assigné");
  };

  // Mettre à jour les champs `sujet`, `pratique` et `domaine` des post-its sélectionnés
  useEffect(() => {
    if (selectedPostitIds.length > 0) {
      selectedPostitIds.forEach((postitId) => {
        // Mise à jour du champ `sujet`
        updatePostit(
          postitId,
          "sujet",
          selectedSujet ? selectedSujet.nomsujet : "Non assigné"
        );
        // Mise à jour du champ `pratique`
        updatePostit(
          postitId,
          "pratique",
          selectedPratique ? selectedPratique.nompratique : "Non assigné"
        );
        // Mise à jour du champ `domaine`
        updatePostit(
          postitId,
          "iddomaine",
          selectedSujet
            ? domains.find((d) => d.iddomaine === selectedSujet.iddomaine)
                ?.nomdomaine || "Non assigné"
            : "Non assigné"
        );
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
        <Postit
          key={postit.id}
          postit={postit}
          isSelected={selectedPostitIds.includes(postit.id)}
          onDoubleClick={() => handleDoubleClick(postit.id)}
        />
      ))}
    </Box>
  );
}
