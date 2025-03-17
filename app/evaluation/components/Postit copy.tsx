// 📜 components/evaluation/Postit.tsx
"use client";

import { useState, useCallback, memo, useEffect } from "react";
import { supabaseClient } from "@/lib/supabaseClient"; // Assurez-vous que `supabaseClient` est correctement configuré

import {
  Box,
  Paper,
  TextField,
  IconButton,
  Collapse,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import TimestampInput from "./TimestampInput";
import EvalContainer from "./Evalcontainer";
import { useCallData } from "@/context/CallDataContext";
import { useAppContext } from "@/context/AppContext";
import { Postit as PostitType } from "@/types/types"; // Importation du type Postit

interface PostitProps {
  postit: PostitType;
  isSelected: boolean;
  onDoubleClick: () => void;
}

const Postit = ({ postit, isSelected, onDoubleClick }: PostitProps) => {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openAffectDialog, setOpenAffectDialog] = useState(false);
  const [localPostit, setLocalPostit] = useState<PostitType>({
    id: postit.id,
    word: postit.word || "",
    timestamp: postit.timestamp || 0,
    text: postit.text || "",
    iddomaine: postit.iddomaine || null, // S'assurer que ce soit un nombre ou null
    sujet: postit.sujet || "Non assigné",
    pratique: postit.pratique || "Non assigné",
    callid: postit.callid, // Ajouter la propriété callid
    wordid: postit.wordid, // Ajouter la propriété wordid
  });

  const { deletePostit, updatePostit } = useCallData();
  const { selectedPratique, selectedSujet, domains } = useAppContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAssigned, setIsAssigned] = useState(false);
  const [shouldReassign, setShouldReassign] = useState(false);

  const toggleExpand = useCallback(() => setIsExpanded((prev) => !prev), []);
  const toggleDeleteDialog = useCallback(
    () => setOpenDeleteDialog((prev) => !prev),
    []
  );
  const toggleAffectDialog = useCallback(
    () => setOpenAffectDialog((prev) => !prev),
    []
  );

  const handleFieldChange = useCallback(
    (field: keyof PostitType, value: string | number | null) => {
      if (field === "iddomaine" && value === "Non assigné") {
        value = null; // Assure-toi que iddomaine est soit un nombre soit null
      }

      setLocalPostit((prev) => ({
        ...prev,
        [field]: value,
      }));
      updatePostit(postit.id, field, value);
    },
    [postit.id, updatePostit]
  );

  const handleSave = useCallback(async () => {
    const { id, word, timestamp, text } = localPostit;
    const { error } = await supabaseClient
      .from("postit")
      .update({ word, timestamp, text })
      .eq("id", id);

    if (error) {
      console.error("Erreur lors de la sauvegarde du post-it:", error);
    } else {
      console.log("Post-it sauvegardé avec succès");
    }
  }, [localPostit]);

  const handleDelete = useCallback(() => {
    deletePostit(postit.id);
    setOpenDeleteDialog(false);
  }, [deletePostit, postit.id]);

  const handleTimestampChange = (newTimestamp: string) => {
    const [minutes, seconds] = newTimestamp.split(":").map(Number);
    const totalSeconds = minutes * 60 + seconds;
    handleFieldChange("timestamp", totalSeconds);
  };

  useEffect(() => {
    if (isSelected && shouldReassign) {
      setLocalPostit((prevPostit) => ({
        ...prevPostit,
        sujet: selectedSujet ? selectedSujet.nomsujet : "Non assigné",
        pratique: selectedPratique
          ? selectedPratique.nompratique
          : "Non assigné",
        // Assigner l'ID du domaine à iddomaine, et le nom du domaine à domaine
        iddomaine: selectedSujet ? selectedSujet.iddomaine : null, // ID du domaine, pas le nom
        domaine: selectedSujet
          ? domains.find((d) => d.iddomaine === selectedSujet.iddomaine)
              ?.nomdomaine || "Non assigné"
          : "Non assigné", // Affichage du nom du domaine
      }));
      setShouldReassign(false); // Désactive la réassignation
    }
  }, [isSelected, shouldReassign, selectedSujet, selectedPratique, domains]);

  // Lors de la réinitialisation des champs
  const resetFieldsOnSelect = () => {
    setIsAssigned(false); // Marquer comme non assigné
    setLocalPostit((prev) => ({
      ...prev,
      sujet: "Non assigné",
      pratique: "Non assigné",
      domaine: "Non assigné", // Affichage du nom du domaine
      iddomaine: null, // ID du domaine (null si non assigné)
    }));
  };

  useEffect(() => {
    if (isSelected && !isAssigned) {
      setShouldReassign(true);
    }
  }, [selectedSujet, selectedPratique]);

  return (
    <div
      id="Postit"
      onDoubleClick={() => {
        onDoubleClick();
        resetFieldsOnSelect();
      }}
    >
      <Paper
        sx={{
          mb: 2,
          p: 2,
          bgcolor: isSelected
            ? "lightgreen"
            : !isAssigned &&
              (!localPostit.iddomaine || localPostit.iddomaine === null) && // Utilise iddomaine ici
              (!localPostit.sujet || localPostit.sujet === "Non assigné") &&
              (!localPostit.pratique || localPostit.pratique === "Non assigné")
            ? "#a61e15"
            : "#FFF9C4",
          boxShadow: 3,
          borderRadius: 1,
        }}
      >
        {/* Le reste du contenu */}

        <IconButton size="small" onClick={toggleExpand}>
          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>

        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Paper
            sx={{ width: "100%", bgcolor: "rgba(255, 255, 255, 0.5)", p: 1 }}
          >
            <TextField
              fullWidth
              label="Passage"
              value={localPostit.word}
              onChange={(e) => handleFieldChange("word", e.target.value)}
              variant="outlined"
              size="small"
              margin="dense"
              multiline
              minRows={2}
              sx={{ backgroundColor: "transparent", color: "black" }}
              InputLabelProps={{ style: { color: "black" } }}
              InputProps={{ style: { color: "black", fontSize: "0.8rem" } }}
            />
          </Paper>
        </Box>

        <Collapse in={isExpanded}>
          <Box sx={{ mt: 1 }}>
            <Box
              sx={{
                bgcolor: "rgba(255, 249, 196, 0.8)",
                p: 1,
                borderRadius: 1,
              }}
            >
              <TimestampInput
                defaultTimestamp={
                  localPostit.timestamp && !isNaN(localPostit.timestamp)
                    ? new Date(localPostit.timestamp * 1000)
                        .toISOString()
                        .substr(14, 5)
                    : "00:00"
                }
                onTimestampChange={handleTimestampChange}
                InputProps={{
                  style: {
                    color: "black",
                    fontSize: "0.8rem",
                    backgroundColor: "transparent",
                  },
                }}
              />
            </Box>

            <Paper sx={{ bgcolor: "rgba(255, 255, 255, 0.5)", p: 1, mt: 1 }}>
              <TextField
                fullWidth
                label="Commentaire"
                value={localPostit.text || ""}
                onChange={(e) => handleFieldChange("text", e.target.value)}
                variant="outlined"
                multiline
                minRows={2}
                size="small"
                margin="dense"
                sx={{ backgroundColor: "transparent", color: "black" }}
                InputLabelProps={{ style: { color: "black" } }}
                InputProps={{ style: { color: "black", fontSize: "0.8rem" } }}
              />
            </Paper>

            <Box sx={{ mt: 1, display: "flex", flexDirection: "column" }}>
              <Typography variant="caption" sx={{ color: "black" }}>
                Domaine : {localPostit.iddomaine}
              </Typography>
              <Typography variant="caption" sx={{ color: "black" }}>
                Sujet : {localPostit.sujet || "Non assigné"}
              </Typography>
              <Typography variant="caption" sx={{ color: "black" }}>
                Pratique : {localPostit.pratique || "Non assigné"}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
              <IconButton color="primary" onClick={handleSave}>
                <SaveIcon />
              </IconButton>
              <IconButton color="error" onClick={toggleDeleteDialog}>
                <DeleteIcon />
              </IconButton>
              <Button
                variant="contained"
                color="primary"
                onClick={toggleAffectDialog}
              >
                Affecter
              </Button>
            </Box>
          </Box>
        </Collapse>

        {/* Modal pour l'affectation */}
        <Dialog
          open={openAffectDialog}
          onClose={toggleAffectDialog}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>
            Affecter critère qualité et geste à entraîner
          </DialogTitle>
          <DialogContent>
            <EvalContainer />
          </DialogContent>
          <DialogActions>
            <Button onClick={toggleAffectDialog} color="primary">
              Fermer
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog de confirmation pour la suppression */}
        <Dialog open={openDeleteDialog} onClose={toggleDeleteDialog}>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Êtes-vous sûr de vouloir supprimer ce post-it ?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={toggleDeleteDialog} color="primary">
              Annuler
            </Button>
            <Button onClick={handleDelete} color="error" autoFocus>
              Supprimer
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </div>
  );
};

export default memo(Postit);
