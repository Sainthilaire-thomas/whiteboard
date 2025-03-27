import { useEffect, useState, useRef } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Grid,
  IconButton,
  Modal,
} from "@mui/material";
import { useAppContext } from "@/context/AppContext";
import GridContainerPratiquesEval from "./GridContainerPratiquesEval";
import GridContainerSujetsEval from "./GridContainerSujetsEval";
import Exercices from "./Exercices";
import AssessmentIcon from "@mui/icons-material/Assessment"; // Icône pour la synthèse
import SyntheseEvaluation from "./SyntheseEvaluation.old";
import { useSupabase } from "@/context/SupabaseContext";
import { supabaseClient } from "@/lib/supabaseClient";
import { Domaine, Pratique } from "@/types/types";

// Définition des types pour les props
interface BandeauEvalProps {
  selectedEntreprise: string | number | null; // ou `number` si c'est un ID d'entreprise
}

const BandeauEval: React.FC<BandeauEvalProps> = ({ selectedEntreprise }) => {
  // Récupération des données du contexte AppContext
  const context = useAppContext();

  const domains = context.domains;
  const selectedDomain = context.selectedDomain;
  const selectDomain = context.selectDomain;
  const isLoadingDomains = context.isLoadingDomains;
  const categoriesSujets = context.categoriesSujets;
  const sujetsData = context.sujetsData;

  const pratiques = context.pratiques;
  const categoriesPratiques = context.categoriesPratiques;

  const nudges = context.nudges;
  const fetchNudgesForPractice = context.fetchNudgesForPractice;

  const { isSupabaseReady } = useSupabase();

  const [filteredDomains, setFilteredDomains] = useState<Domaine[]>([]);
  const [selectedPratique, setSelectedPratique] = useState<Pratique | null>(
    null
  );
  const [openModal, setOpenModal] = useState<boolean>(false);

  const exercicesRef = useRef<HTMLDivElement | null>(null);

  const handleOpen = () => {
    setOpenModal(true);
  };

  const handleClose = () => setOpenModal(false);

  // Récupérer les domaines associés à l'entreprise sélectionnée via la jointure entreprise_domaines
  useEffect(() => {
    const fetchFilteredDomains = async () => {
      if (selectedEntreprise) {
        const { data, error } = await supabaseClient
          .from("entreprise_domaines")
          .select("iddomaine")
          .eq("identreprise", selectedEntreprise);

        if (error) {
          console.error(
            "Erreur lors de la récupération des domaines associés à l'entreprise",
            error
          );
          return;
        }

        const domainIds = data.map((entry) => entry.iddomaine);
        const filtered = domains.filter((domain) =>
          domainIds.includes(domain.iddomaine)
        );

        setFilteredDomains(filtered);
      } else {
        setFilteredDomains(
          domains.filter(
            (domain) =>
              domain.nomdomaine === "escda" ||
              domain.nomdomaine === "satisfaction"
          )
        );
      }
    };

    fetchFilteredDomains();
  }, [domains, selectedEntreprise]);

  useEffect(() => {
    if (filteredDomains.length > 0 && !selectedDomain) {
      const initialDomain = filteredDomains[0];
      selectDomain(initialDomain.iddomaine.toString());
    }
  }, [filteredDomains, selectedDomain, selectDomain]);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    selectDomain(newValue);
  };

  const handlePratiqueClick = (pratique: Pratique) => {
    setSelectedPratique(pratique);
    fetchNudgesForPractice(pratique.idpratique); // On appelle la fonction sans `.then()`
    exercicesRef.current?.scrollIntoView({ behavior: "smooth" }); // On fait défiler la page
  };

  const isSubjectContext = !!selectedDomain;

  const categoriesForPratiques = categoriesPratiques;
  const itemsForPratiques = pratiques;
  const categoriesForSujets = categoriesSujets;
  const itemsForSujets = sujetsData;

  const columnConfigPratiques = {
    categoryIdKey: "idcategoriepratique",
    categoryNameKey: "nomcategorie",
    itemIdKey: "idpratique",
    itemNameKey: "nompratique",
  };

  const columnConfigSujets = isSubjectContext
    ? {
        categoryIdKey: "idcategoriesujet",
        categoryNameKey: "nomcategorie",
        itemIdKey: "idsujet",
        itemNameKey: "nomsujet",
      }
    : {
        categoryIdKey: "",
        categoryNameKey: "",
        itemIdKey: "",
        itemNameKey: "",
      };

  if (isLoadingDomains) return <div>Loading...</div>;

  return (
    <Box className="bandeau" sx={{ width: "100%" }}>
      <Box
        className="tabs-container"
        sx={{
          zIndex: 2,
          position: "absolute",
          top: "70px",
          width: "100%",
          overflowX: "auto",
        }}
      >
        <Tabs
          value={selectedDomain || filteredDomains[0]?.iddomaine.toString()}
          onChange={handleChange}
          aria-label="domain tabs"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            backgroundColor: "rgba(138, 137, 137, 0.7)",
            opacity: 0.9,
            minHeight: "35px",
            height: "35px",
            ".MuiTab-root": {
              minHeight: "35px",
              alignItems: "center",
            },
            ".MuiTabs-scrollButtons": {
              "&.Mui-disabled": { opacity: 0.3 },
            },
          }}
        >
          {filteredDomains.map((domain) => (
            <Tab
              label={domain.nomdomaine}
              value={domain.iddomaine.toString()}
              key={domain.iddomaine}
              sx={{ minWidth: 100 }}
            />
          ))}
        </Tabs>
      </Box>

      <Grid
        container
        component="div"
        direction="column"
        spacing={0}
        sx={{ mb: 1, mt: 10 }}
      >
        <Grid item xs={12}>
          <Typography variant="h6" align="center" sx={styles.title}>
            DOMAINE
          </Typography>
          {isSubjectContext && (
            <GridContainerSujetsEval
              categories={categoriesForSujets}
              items={itemsForSujets}
              columnConfig={columnConfigSujets}
            />
          )}
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" align="center" sx={styles.title}>
            PRATIQUE
          </Typography>
          <Box className="pratiques">
            <GridContainerPratiquesEval
              categories={categoriesForPratiques}
              items={itemsForPratiques}
              columnConfig={columnConfigPratiques}
              onPratiqueClick={handlePratiqueClick}
            />
          </Box>
        </Grid>

        <Grid item xs={12} ref={exercicesRef}>
          <Typography variant="h6" align="center" sx={styles.title}>
            ENTRAINEMENT
          </Typography>
          <Box className="exercices">
            {selectedPratique && <Exercices externalNudges={nudges} />}{" "}
            {/* Passer les nudges */}
          </Box>
        </Grid>
      </Grid>
      <Modal
        open={openModal}
        onClose={handleClose}
        aria-labelledby="modal-synthese-title"
        aria-describedby="modal-synthese-description"
      >
        <Box sx={styles.modalBox}>
          <Typography id="modal-synthese-title" variant="h6" component="h2">
            Synthese Evaluation
          </Typography>
          <Box id="modal-synthese-description">
            <SyntheseEvaluation />
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

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
