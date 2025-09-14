import { useBandeauEvalData } from "@/hooks/AppContext/useBandeauEvalData";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Grid,
  IconButton,
  Modal,
} from "@mui/material";
import GridContainerPratiquesEval from "../Postit/GridContainerPratiquesEval";
import GridContainerSujetsEval from "../Postit/GridContainerSujetsEval";
import Exercices from "./Exercices";
import AssessmentIcon from "@mui/icons-material/Assessment";
import dynamic from "next/dynamic";
import { useState, useMemo } from "react";
import { columnConfigPratiques, columnConfigSujets } from "@/config/gridConfig";

// Chargement dynamique de SyntheseEvaluation
const SyntheseEvaluation = dynamic(() => import("../SyntheseEvaluation"), {
  loading: () => <p>Chargement de la synthèse...</p>,
});

const BandeauEval = ({
  selectedEntreprise,
}: {
  selectedEntreprise: number | null;
}) => {
  const {
    selectedDomain,
    selectDomain,
    isLoadingDomains,
    categoriesPratiques,
    pratiques,
    categoriesSujets,
    sujetsData,
    nudges,
    filteredDomains,
    selectedPratique,
    handlePratiqueClick,
  } = useBandeauEvalData(selectedEntreprise);

  const [openModal, setOpenModal] = useState<boolean>(false);
  const handleOpen = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);

  // ✅ AJOUT : Handler pour les clics sur les sujets
  const handleSujetClick = (sujet: any) => {
    console.log("Sujet cliqué:", sujet);
    // Implémentez votre logique ici
  };

  if (isLoadingDomains) return <div>Loading...</div>;

  // Optimisation du Modal avec useMemo
  const syntheseModal = useMemo(
    () => (
      <Modal open={openModal} onClose={handleClose}>
        <Box sx={styles.modalBox}>
          <Typography variant="h6">Synthèse Évaluation</Typography>
          <SyntheseEvaluation />
        </Box>
      </Modal>
    ),
    [openModal]
  );

  // ✅ CORRECTION 1 : Convertir SujetSimple[] vers Item[] si nécessaire
  const convertedSujetsData = useMemo(() => {
    return (
      sujetsData?.map((sujet: any) => ({
        ...sujet,
        // Ajouter les propriétés manquantes si elles n'existent pas
        valeurnumérique: sujet.valeurnumérique ?? 0,
        idpratique: sujet.idpratique ?? null,
        nompratique: sujet.nompratique ?? "",
        idcategoriepratique: sujet.idcategoriepratique ?? null,
        categoriespratiques: sujet.categoriespratiques ?? "",
      })) || []
    );
  }, [sujetsData]);

  // ✅ CORRECTION 3 : S'assurer que nudges est du bon type
  const convertedNudges = useMemo(() => {
    // Conversion explicite pour résoudre le conflit de types
    return (nudges || []).map((nudge: any) => ({
      ...nudge,
      // Assurez-vous que le nudge a toutes les propriétés requises
      id: nudge.id || nudge.idnudge,
      text: nudge.text || nudge.texte,
      // Ajoutez d'autres mappings si nécessaire
    }));
  }, [nudges]);

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      {/* Onglets pour sélectionner un domaine */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          overflowX: "auto",
          backgroundColor: "rgba(138, 137, 137, 0.7)",
          padding: "10px",
          borderRadius: "8px",
        }}
      >
        <Tabs
          value={
            selectedDomain ||
            (filteredDomains.length > 0
              ? filteredDomains[0].iddomaine.toString()
              : "")
          }
          onChange={(event, newValue) => selectDomain(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {filteredDomains.map((domain) => (
            <Tab
              label={domain.nomdomaine}
              value={domain.iddomaine.toString()}
              key={domain.iddomaine}
            />
          ))}
        </Tabs>
      </Box>

      {/* Bouton de synthèse */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <IconButton onClick={handleOpen} color="primary">
          <AssessmentIcon />
        </IconButton>
      </Box>

      {/* Section Sujets */}
      <Grid container spacing={2} sx={{ mt: 3 }}>
        <Grid item xs={12}>
          <Typography variant="h6" align="center" sx={styles.title}>
            DOMAINE
          </Typography>
          {selectedDomain && (
            <GridContainerSujetsEval
              categories={categoriesSujets}
              items={convertedSujetsData}
              columnConfig={columnConfigSujets}
              handleSujetClick={handleSujetClick}
              sujetsDeLActivite={[]}
            />
          )}
        </Grid>

        {/* Section Pratiques */}
        <Grid item xs={12}>
          <Typography variant="h6" align="center" sx={styles.title}>
            PRATIQUE
          </Typography>
          <Box sx={{ mt: 1 }}>
            <GridContainerPratiquesEval
              categories={categoriesPratiques}
              items={pratiques}
              columnConfig={columnConfigPratiques}
              onPratiqueClick={handlePratiqueClick}
              pratiquesDeLActivite={[]}
            />
          </Box>
        </Grid>

        {/* Section Entraînement */}
        <Grid item xs={12}>
          <Typography variant="h6" align="center" sx={styles.title}>
            ENTRAÎNEMENT
          </Typography>
          <Box sx={{ mt: 1 }}>
            {selectedPratique && <Exercices externalNudges={convertedNudges} />}
          </Box>
        </Grid>
      </Grid>

      {/* Modal Synthèse */}
      {syntheseModal}
    </Box>
  );
};

// 📌 Styles
const styles = {
  title: {
    background: "#b1b1b1",
    color: "#ffffff",
    lineHeight: "39px",
    fontWeight: "bold",
    letterSpacing: "0.1rem",
    textShadow: "1px 1px 2px black",
    borderTop: "1px solid rgba(255,255,255,0.5)",
    borderBottom: "1px solid rgba(255,255,255,0.5)",
    boxShadow: "0px 3px 5px rgba(0,0,0,0.2)",
    margin: "0 auto",
    width: "100%",
    padding: "10px",
    borderRadius: "4px",
  },
  modalBox: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90%",
    maxHeight: "90vh",
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
    overflow: "auto",
  },
};

export default BandeauEval;
