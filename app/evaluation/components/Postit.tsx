"use client";

import { useState, useEffect, memo } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tabs,
  Tab,
  Modal,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import { useCallData } from "@/context/CallDataContext";
import { useAppContext } from "@/context/AppContext";
import { useFilteredDomains } from "@/hooks/AppContext/useFilteredDomains";
import GridContainerSujetsEval from "./GridContainerSujetsEval";
import GridContainerPratiquesEval from "./GridContainerPratiquesEval";
import { columnConfigSujets, columnConfigPratiques } from "@/config/gridConfig";
import { Postit as PostitType } from "@/types/types";

interface PostitProps {
  postit: PostitType;
  isSelected: boolean;
  onClose: () => void;
}

const Postit = ({ postit, isSelected, onClose }: PostitProps) => {
  const { deletePostit, updatePostit } = useCallData();
  const {
    selectedEntreprise,
    selectedDomain,
    selectDomain,
    categoriesSujets,
    sujetsData,
    categoriesPratiques,
    pratiques,
  } = useAppContext();

  // 🔹 Récupération des domaines liés à l'entreprise
  const { filteredDomains } = useFilteredDomains(selectedEntreprise);

  const [localPostit, setLocalPostit] = useState<PostitType>({ ...postit });

  useEffect(() => {
    console.log("📝 Mise à jour du Post-it:", localPostit);
  }, [localPostit]);

  // 🟢 Initialisation du domaine si non défini
  useEffect(() => {
    if (!localPostit.iddomaine && selectedDomain) {
      setLocalPostit((prev) => ({
        ...prev,
        iddomaine: selectedDomain ? Number(selectedDomain) : null, // ✅ Converti en number
      }));
    }
  }, [selectedDomain]);

  useEffect(() => {
    setLocalPostit((prev) => ({
      ...prev,
      sujet: postit.sujet || "", // ✅ Vérifie qu'on a bien un sujet
      idsujet: postit.idsujet || null, // ✅ Vérifie qu'on a bien un ID de sujet
    }));
  }, [postit]);

  // 🔹 Sauvegarde du post-it

  const handleSave = async () => {
    console.log("💾 Sauvegarde du Post-it:", {
      id: localPostit.id,
      text: localPostit.text,
      sujet: localPostit.sujet,
      idsujet: localPostit.idsujet,
      iddomaine: localPostit.iddomaine,
      pratique: localPostit.pratique, // ✅ Ajoute la pratique
    });

    await updatePostit(localPostit.id, {
      text: localPostit.text,
      sujet: localPostit.sujet,
      idsujet: localPostit.idsujet,
      iddomaine: localPostit.iddomaine,
      pratique: localPostit.pratique,
    });

    console.log("✅ Sauvegarde réussie !");
    onClose();
  };

  // 🔹 Suppression du post-it
  const handleDelete = () => {
    deletePostit(localPostit.id);
    onClose();
  };

  return (
    <Modal open={isSelected} onClose={onClose} sx={styles.modalBackground}>
      <Box sx={styles.modalWrapper} onClick={onClose}>
        <Box sx={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
          <DialogTitle>Évaluation du passage</DialogTitle>
          <DialogContent>
            {/* Sélection du domaine */}
            <Box sx={styles.domainSelection}>
              <Tabs
                value={selectedDomain ? String(selectedDomain) : ""} // ✅ S'assure que `value` est une string
                onChange={(event, newValue) => selectDomain(String(newValue))} // ✅ Convertit `newValue` en string
                variant="scrollable"
                scrollButtons="auto"
              >
                {filteredDomains.map((domain) => (
                  <Tab
                    key={domain.iddomaine}
                    label={domain.nomdomaine}
                    value={String(domain.iddomaine)} // ✅ Convertit `id` en string
                  />
                ))}
              </Tabs>
            </Box>

            {/* Passage affiché */}
            <Paper sx={styles.passageBox}>
              <Typography variant="h6">Passage :</Typography>
              <Typography>{localPostit.word}</Typography>
            </Paper>

            {/* Commentaire */}
            <TextField
              label="Commentaire"
              value={localPostit.text}
              onChange={(e) =>
                setLocalPostit({ ...localPostit, text: e.target.value })
              }
              fullWidth
              multiline
              rows={3}
              variant="outlined"
            />

            {/* 🏷 Grille des sujets */}
            <Typography variant="h6" sx={{ mt: 2 }}>
              Sélectionner un sujet :
            </Typography>
            <GridContainerSujetsEval
              categories={categoriesSujets}
              items={sujetsData}
              columnConfig={columnConfigSujets}
              selectedPostit={localPostit} // ✅ Passe le Post-it actif
              setSelectedPostit={setLocalPostit} // ✅ Passe le setter
            />

            {/* 🎯 Grille des pratiques */}
            <Typography variant="h6" sx={{ mt: 2 }}>
              Pratiques recommandées :
            </Typography>
            <GridContainerPratiquesEval
              categories={categoriesPratiques}
              items={pratiques}
              columnConfig={columnConfigPratiques}
              onPratiqueClick={() => {}} // Géré directement dans le composant
              selectedPostit={localPostit} // ✅ Passe le Post-it actif
              setSelectedPostit={setLocalPostit} // ✅ Passe le setter
            />
          </DialogContent>

          <DialogActions>
            <Button onClick={onClose} color="primary">
              Fermer
            </Button>
            <Button onClick={handleDelete} color="error">
              Supprimer
            </Button>
            <Button onClick={handleSave} color="primary" variant="contained">
              Enregistrer
            </Button>
          </DialogActions>
        </Box>
      </Box>
    </Modal>
  );
};

// 📌 **Styles**
const styles = {
  modalBackground: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalWrapper: {
    width: "100vw",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // ✅ Fond assombri
  },
  modalContainer: {
    width: "80%",
    maxHeight: "90vh",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
    overflow: "auto",
  },
  domainSelection: {
    position: "relative",
    width: "100%",
    overflowX: "auto",
    backgroundColor: "rgba(138, 137, 137, 0.7)",
    padding: "10px",
    borderRadius: "8px",
  },
  passageBox: {
    p: 2,
    mb: 2,
    backgroundColor: "#1c1c1c",
  },
};

export default memo(Postit);
