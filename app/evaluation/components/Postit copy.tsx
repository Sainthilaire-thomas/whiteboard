"use client";
import { useState, useEffect, memo, useMemo } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import {
  Box,
  Paper,
  TextField,
  Typography,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tabs,
  Tab,
  Modal,
} from "@mui/material";
import { useCallData } from "@/context/CallDataContext";
import { useAppContext } from "@/context/AppContext";
import { useFilteredDomains } from "@/hooks/AppContext/useFilteredDomains";
import GridContainerSujetsEval from "./GridContainerSujetsEval";
import GridContainerPratiquesEval from "./GridContainerPratiquesEval";
import { columnConfigSujets, columnConfigPratiques } from "@/config/gridConfig";
import { Item } from "@/types/types";
import { useRouter } from "next/navigation";

interface PostitProps {
  inline?: boolean; // 👈 par défaut false
}

const Postit: React.FC<PostitProps> = ({ inline = false }) => {
  const {
    deletePostit,
    updatePostit,
    updatePostitToSujetMap,
    postitToSujetMap,
    postitToPratiqueMap,
    idCallActivite,
  } = useCallData();

  const {
    selectedEntreprise,
    selectedDomain,
    selectDomain,
    categoriesSujets,
    sujetsData,
    categoriesPratiques,
    pratiques,
    selectedPostit,
    setSelectedPostit,
    fetchSujetsForActivite,
  } = useAppContext();

  const router = useRouter();
  const { filteredDomains } = useFilteredDomains(selectedEntreprise);
  const { syncSujetsForActiviteFromMap, syncPratiquesForActiviteFromMap } =
    useAppContext();
  const [showTabs, setShowTabs] = useState(false);

  const sujetsDeLActivite = useMemo(() => {
    if (!postitToSujetMap || Object.keys(postitToSujetMap).length === 0) {
      return [];
    }
    return [
      ...new Set(
        Object.values(postitToSujetMap).filter(
          (id): id is number => id !== null
        )
      ),
    ];
  }, [postitToSujetMap]);

  const pratiquesDeLActivite = useMemo(() => {
    if (!postitToPratiqueMap || Object.keys(postitToPratiqueMap).length === 0) {
      return [];
    }
    return [
      ...new Set(
        Object.values(postitToPratiqueMap).filter((p): p is string => !!p)
      ),
    ];
  }, [postitToPratiqueMap]);

  const [readyToDisplayGrids, setReadyToDisplayGrids] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setReadyToDisplayGrids(true), 0);
    return () => clearTimeout(timeout);
  }, []);

  //Selection du sujet du posit
  // Dans Postit.tsx

  if (!selectedPostit) return null;

  const handleSujetClick = (item: Item) => {
    if (!selectedPostit) {
      alert("⚠️ Aucun post-it sélectionné !");
      return;
    }

    const isCurrentlySelected = selectedPostit.idsujet === item.idsujet;

    // 🔄 Mise à jour locale du post-it
    const updatedPostit = isCurrentlySelected
      ? {
          ...selectedPostit,
          sujet: "Non Assigné",
          idsujet: null,
          iddomaine: null,
        }
      : {
          ...selectedPostit,
          sujet: item.nomsujet,
          idsujet: item.idsujet,
          iddomaine: item.iddomaine,
        };

    setSelectedPostit(updatedPostit);

    // 🔁 Met à jour le mapping central
    updatePostitToSujetMap(updatedPostit.id, updatedPostit.idsujet ?? null);

    // 💾 Mise à jour du post-it dans Supabase
    updatePostit(updatedPostit.id, {
      sujet: updatedPostit.sujet,
      idsujet: updatedPostit.idsujet,
      iddomaine: updatedPostit.iddomaine,
    });
  };

  // ✅ Sauvegarde du post-it
  const handleSave = async () => {
    console.log("💾 Sauvegarde du Post-it:", selectedPostit);

    await updatePostit(selectedPostit.id, {
      text: selectedPostit.text,
      sujet: selectedPostit.sujet,
      idsujet: selectedPostit.idsujet,
      iddomaine: selectedPostit.iddomaine,
      pratique: selectedPostit.pratique,
    });

    console.log("✅ Sauvegarde réussie !");
    setSelectedPostit(null);
  };

  // ✅ Suppression du post-it
  const handleDelete = async () => {
    if (!selectedPostit.id) return;

    try {
      const { data: otherPostits } = await supabaseClient
        .from("postit")
        .select("id")
        .eq("idsujet", selectedPostit.idsujet)
        .neq("id", selectedPostit.id);

      if (!otherPostits || otherPostits.length === 0) {
        await supabaseClient
          .from("activitesconseillers_sujets")
          .delete()
          .match({
            idactivite: idCallActivite,
            idsujet: selectedPostit.idsujet,
          });

        console.log("✅ Sujet supprimé des sujets de l'activité !");
      }

      await deletePostit(selectedPostit.id);
      console.log("✅ Post-it supprimé !");
      setSelectedPostit(null);
    } catch (error) {
      console.error("❌ Erreur lors de la suppression:", error);
    }
  };

  const handleClosePostit = () => {
    if (idCallActivite) {
      syncSujetsForActiviteFromMap(postitToSujetMap, idCallActivite);
      syncPratiquesForActiviteFromMap(
        postitToPratiqueMap,
        idCallActivite,
        pratiques
      );
    }
    setSelectedPostit(null);
    router.push("/evaluation?view=synthese");
  };

  const content = (
    <>
      <DialogTitle>📝 Évaluation du passage</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* 📌 Bloc 1 – Passage à analyser */}
        <Paper sx={styles.passageBox}>
          <Typography variant="overline" color="text.secondary">
            Passage sélectionné
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            {selectedPostit.word}
          </Typography>
        </Paper>

        {/* 🗨️ Bloc 2 – Commentaire libre */}
        <Box>
          <Typography variant="overline" color="text.secondary">
            Votre commentaire à chaud
          </Typography>
          <TextField
            value={selectedPostit.text}
            onChange={(e) =>
              setSelectedPostit({ ...selectedPostit, text: e.target.value })
            }
            fullWidth
            multiline
            rows={3}
            placeholder="Notez ici ce que vous avez remarqué..."
          />
        </Box>

        {/* 📁 Bloc 3 – Domaine d’analyse */}
        <Box sx={{ my: 2 }}>
          <Typography variant="overline" color="text.secondary">
            Domaine d’analyse
          </Typography>

          {selectedDomain && !showTabs ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
              <Typography variant="body1">
                {filteredDomains.find(
                  (d) => d.iddomaine === Number(selectedDomain) // ✅ Conversion nécessaire
                )?.nomdomaine || "Domaine inconnu"}
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setShowTabs(true)}
              >
                Changer
              </Button>
            </Box>
          ) : (
            <Box sx={styles.domainSelection}>
              <Tabs
                value={selectedDomain ? String(selectedDomain) : ""}
                onChange={(event, newValue) => {
                  selectDomain(String(newValue));
                  setShowTabs(false); // ✅ Ferme les tabs après sélection
                }}
                variant="scrollable"
                scrollButtons="auto"
              >
                {filteredDomains.map((domain) => (
                  <Tab
                    key={domain.iddomaine}
                    label={domain.nomdomaine}
                    value={String(domain.iddomaine)} // ✅ toujours des strings ici
                  />
                ))}
              </Tabs>
            </Box>
          )}
        </Box>

        {/* 🎯 Bloc 4 – Choix du sujet */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Étape 1 – Quel critère qualité est en défaut ?
          </Typography>
          <GridContainerSujetsEval
            categories={categoriesSujets}
            items={sujetsData}
            columnConfig={columnConfigSujets}
            handleSujetClick={handleSujetClick}
            sujetsDeLActivite={sujetsDeLActivite}
          />
        </Box>

        {/* 🛠️ Bloc 5 – Choix de la pratique */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Étape 2 – Quelle pratique peut améliorer ce critère ?
          </Typography>

          {selectedPostit.idsujet ? (
            <GridContainerPratiquesEval
              categories={categoriesPratiques}
              items={pratiques}
              columnConfig={columnConfigPratiques}
              onPratiqueClick={() => {}}
              pratiquesDeLActivite={pratiquesDeLActivite}
            />
          ) : (
            <Typography
              variant="body2"
              sx={{ fontStyle: "italic", color: "text.secondary", mt: 1 }}
            >
              👉 Veuillez d’abord sélectionner un sujet.
            </Typography>
          )}
        </Box>
      </DialogContent>

      {/* 🔘 Boutons actions */}
      <DialogActions>
        <Button onClick={() => setSelectedPostit(null)} color="primary">
          Fermer
        </Button>
        <Button onClick={handleDelete} color="error">
          Supprimer
        </Button>
        <Button onClick={handleSave} color="primary" variant="contained">
          Enregistrer
        </Button>
        <Button
          onClick={() =>
            idCallActivite &&
            syncSujetsForActiviteFromMap(postitToSujetMap, idCallActivite)
          }
          variant="outlined"
          color="secondary"
        >
          Enregistrer les sujets
        </Button>
        <Button
          onClick={() =>
            idCallActivite &&
            syncPratiquesForActiviteFromMap(
              postitToPratiqueMap,
              idCallActivite,
              pratiques
            )
          }
          variant="outlined"
          color="secondary"
        >
          Enregistrer les pratiques
        </Button>
      </DialogActions>
    </>
  );

  if (inline) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          p: 2,
          boxSizing: "border-box",
        }}
      >
        {content}
      </Box>
    );
  }

  return (
    <Modal
      open={!!selectedPostit}
      onClose={handleClosePostit}
      sx={styles.modalBackground}
    >
      <Box sx={styles.modalWrapper} onClick={handleClosePostit}>
        <Box sx={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
          {content}
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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
  },
};

export default memo(Postit);
