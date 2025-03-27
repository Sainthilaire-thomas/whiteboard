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
import GridContainerPratiquesEval from "./GridContainerPratiquesEval";
import GridContainerSujetsEval from "./GridContainerSujetsEval";
import Exercices from "./Exercices";
import AssessmentIcon from "@mui/icons-material/Assessment";
import dynamic from "next/dynamic";
import { useState, useMemo } from "react";
import { columnConfigPratiques, columnConfigSujets } from "@/config/gridConfig";

// Chargement dynamique de SyntheseEvaluation
const SyntheseEvaluation = dynamic(() => import("./SyntheseEvaluation.old"), {
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
              items={sujetsData}
              columnConfig={columnConfigSujets}
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
            />
          </Box>
        </Grid>

        {/* Section Entraînement */}
        <Grid item xs={12}>
          <Typography variant="h6" align="center" sx={styles.title}>
            ENTRAÎNEMENT
          </Typography>
          <Box sx={{ mt: 1 }}>
            {selectedPratique && <Exercices externalNudges={nudges} />}
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
