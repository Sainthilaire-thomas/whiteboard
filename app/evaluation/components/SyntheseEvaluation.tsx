"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  TextField,
  FormControlLabel,
  Divider,
  Grid,
  IconButton,
  TableCell,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
} from "@mui/material";
import { Save } from "@mui/icons-material";
import { useCallData } from "@/context/CallDataContext";
import { useAppContext } from "@/context/AppContext";
import { useSupabase } from "@/context/SupabaseContext";
import { Postit } from "@/types/types";
import SimplifiedGridContainerSujets from "./SimplifiedGridContainerSujets";
import SimplifiedGridContainerPratiques from "./SimplifiedGridContainerPratiques";
import EvaluationCardCompact from "./EvaluationCardCompact";
import { columnConfigSujets } from "@/config/gridConfig"; // 📌 Vérifie que ce fichier existe !

export default function SyntheseEvaluation() {
  const { selectedCall, appelPostits } = useCallData();
  const { supabase } = useSupabase();
  const {
    categoriesPratiques,
    pratiques,
    categoriesSujets,
    sujetsData,
    selectedDomain,
  } = useAppContext();

  // ✅ Fonction utilitaire pour récupérer le nom du domaine
  const getDomainName = (iddomaine: number | null) => {
    const domaine = categoriesSujets.find(
      (cat) => cat.idcategoriesujet === iddomaine
    );
    return domaine ? domaine.nomcategorie : "Non défini";
  };

  // ✅ Filtrage des post-its liés à l'appel
  const filteredPostits = appelPostits.filter(
    (postit) => postit.sujet || postit.pratique
  );

  const [selectedMotif, setSelectedMotif] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    avancement_formation: false,
    avancement_lieu: false,
    avancement_date: false,
    avancement_financement: false,
    promotion_reseau: false,
    commentaire: "",
    action_client: "",
  });

  const motifs = [
    "STAGIAIRE__ABSENCE",
    "INFORMATION_COLLECTIVE",
    "FORMATION__CONTENU",
    "FORMATION__LIEU",
    "POST_FORMATION",
    "FORMATION__EXISTE",
  ];

  // 🔹 Gestion des changements du formulaire
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // 🔹 Sauvegarde des données en base
  const handleSave = async () => {
    if (!selectedCall) {
      alert("Aucun appel sélectionné");
      return;
    }

    try {
      const { error } = await supabase.from("motifs_afpa").upsert(
        [
          {
            ...formState,
            callid: selectedCall.callid,
            motifs: selectedMotif,
          },
        ],
        { onConflict: ["callid"] }
      );

      if (error) throw error;
      alert("Motif mis à jour avec succès !");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde :", error);
    }
  };

  if (!selectedCall) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6">Aucun appel sélectionné</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <IconButton color="primary" onClick={handleSave}>
          <Save />
        </IconButton>
      </Box>

      <Typography variant="h4">
        Évaluation appel {selectedCall.callid}
      </Typography>
      <Typography variant="h6">
        Description : {selectedCall.description}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Paper sx={{ my: 4, p: 2 }}>
        <Typography variant="h5">CHEMIN CLIENT</Typography>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <FormControl fullWidth>
              <InputLabel>Motif Client</InputLabel>
              <Select
                value={selectedMotif || ""}
                onChange={(e) => setSelectedMotif(e.target.value)}
                label="Motif"
              >
                {motifs.map((motif) => (
                  <MenuItem key={motif} value={motif}>
                    {motif}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="Commentaire"
              name="commentaire"
              value={formState.commentaire}
              onChange={handleInputChange}
              multiline
              fullWidth
            />
          </Grid>
        </Grid>
      </Paper>

      <Divider sx={{ my: 2 }} />

      <Paper sx={{ my: 4, p: 2 }}>
        <Typography variant="h5">ANALYSE QUALITE</Typography>
        {selectedDomain && (
          <SimplifiedGridContainerSujets
            categories={categoriesSujets || []} // ✅ Ajoute la bonne liste de catégories
            items={sujetsData} // ✅ Filtre les sujets par domaine
            columnConfig={columnConfigSujets}
          />
        )}
      </Paper>

      <Divider sx={{ my: 2 }} />

      <Paper sx={{ my: 4, p: 2 }}>
        <Typography variant="h5">PRATIQUES A RENFORCER</Typography>
        <SimplifiedGridContainerPratiques
          categories={categoriesPratiques || []} // ✅ Ajoute les bonnes catégories
          items={pratiques || []} // ✅ Pratiques disponibles
          columnConfig={{
            categoryIdKey: "idcategoriepratique",
            categoryNameKey: "nomcategorie",
            itemIdKey: "idpratique",
            itemNameKey: "nompratique",
          }}
        />
      </Paper>

      <Divider sx={{ my: 2 }} />

      {/* 📌 Détail des éléments d'évaluation */}
      <Grid container spacing={2}>
        {filteredPostits.map((postit) => {
          // 👉 Trouver la couleur du sujet via idcategoriesujet (indirectement via le sujet)
          const sujet = sujetsData.find((s) => s.idsujet === postit.idsujet);
          const couleurSujet = categoriesSujets.find(
            (cat) => cat.idcategoriesujet === sujet?.idcategoriesujet
          )?.couleur;

          const pratique = pratiques.find(
            (p) => p.nompratique === postit.pratique
          );
          const couleurPratique = categoriesPratiques.find(
            (cat) => cat.id === pratique?.idcategoriepratique
          )?.couleur;

          return (
            <Grid item xs={12} sm={6} key={postit.id}>
              <EvaluationCardCompact
                postit={postit}
                couleurSujet={couleurSujet}
                couleurPratique={couleurPratique}
                onReplay={(ts) => console.log("🔁 Rejouer à", ts)}
              />
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
