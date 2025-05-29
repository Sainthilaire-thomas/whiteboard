import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Tabs, Tab } from "@mui/material";
import { Theme, alpha } from "@mui/material/styles";
import { Postit } from "@/types/types";
import { useCallData } from "@/context/CallDataContext";

interface ContexteStepProps {
  selectedPostit: Postit;
  setSelectedPostit: (postit: Postit) => void;
  selectedDomain: string | null;
  filteredDomains: any[];
  theme: Theme;
  stepBoxStyle: any;
  styles: any;
}

export const ContexteStep: React.FC<ContexteStepProps> = ({
  selectedPostit,
  setSelectedPostit,
  selectedDomain,
  showTabs,
  setShowTabs,
  filteredDomains = [], // Valeur par défaut pour éviter undefined
  selectDomain,
  theme,
  stepBoxStyle,
  styles,
}) => {
  // Accéder à la fonction updatePostit depuis le contexte
  const { updatePostit } = useCallData();

  // État local pour le texte
  const [commentText, setCommentText] = useState(selectedPostit.text || "");

  // Mettre à jour l'état local lorsque selectedPostit change
  useEffect(() => {
    setCommentText(selectedPostit.text || "");
  }, [selectedPostit.id]);

  // Vérifier que le domaine sélectionné existe dans les domaines filtrés
  const domainExists =
    selectedDomain &&
    filteredDomains.length > 0 &&
    filteredDomains.some((d) => String(d.iddomaine) === String(selectedDomain));

  // Si le domaine sélectionné n'existe pas dans les domaines filtrés,
  // utiliser le premier domaine disponible ou une chaîne vide
  const effectiveSelectedDomain = domainExists
    ? selectedDomain
    : filteredDomains[0]?.iddomaine?.toString() || null;

  // Si le domaine sélectionné n'est pas valide et qu'il y a des domaines disponibles,
  // sélectionner automatiquement le premier
  useEffect(() => {
    if (!domainExists && filteredDomains.length > 0 && selectDomain) {
      selectDomain(String(filteredDomains[0].iddomaine));
    }
  }, [domainExists, filteredDomains, selectDomain]);

  // Sauvegarder le commentaire dans la base de données
  const saveComment = () => {
    if (selectedPostit.id && commentText !== selectedPostit.text) {
      updatePostit(selectedPostit.id, { text: commentText });
      // Mettre également à jour l'état local dans le parent
      setSelectedPostit({ ...selectedPostit, text: commentText });
    }
  };

  // Debug log
  console.log("ContexteStep Debug:", {
    selectedPostit,
    selectedDomain,
    filteredDomains,
    domainExists,
    effectiveSelectedDomain,
  });

  return (
    <Box sx={stepBoxStyle}>
      <Typography variant="caption" color="text.secondary">
        Passage sélectionné :
      </Typography>
      <Typography
        variant="body2"
        sx={{
          mb: 2,
          fontStyle: "italic",
          fontWeight: 400,
          color: "text.primary",
          backgroundColor: alpha(theme.palette.warning.light, 0.1),
          p: 1,
          borderRadius: 1,
        }}
      >
        « {selectedPostit.word} »
      </Typography>

      <Typography variant="caption" color="text.secondary">
        Commentaire à chaud :
      </Typography>
      <TextField
        variant="standard"
        fullWidth
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        onBlur={saveComment} // Sauvegarder en quittant le champ
        placeholder="Note rapide à chaud..."
        sx={{ mb: 2 }}
      />

      <Typography variant="caption" color="text.secondary">
        Domaine d'analyse :
      </Typography>
      <Box sx={{ mt: 0.5, mb: 2 }}>
        <Typography variant="body2" fontWeight={500}>
          {filteredDomains.find(
            (d) => String(d.iddomaine) === String(selectedDomain)
          )?.nomdomaine || "Non spécifié"}
        </Typography>
      </Box>
    </Box>
  );
};
