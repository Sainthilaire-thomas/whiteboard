"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Tabs,
  Tab,
  Alert,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  BarChart,
  AssessmentOutlined,
  PsychologyOutlined,
} from "@mui/icons-material";
import { useCallData } from "@/context/CallDataContext";
import { useAppContext } from "@/context/AppContext";

// Import des onglets
import SyntheseTab from "./SyntheseTab";
import CritereQualiteTab from "./CritereQualiteTab";
import SimulationCoachingTab from "./SimulationCoachingTab";

// Import des utilitaires
import { getPostitStatistics } from "./utils/filters";

// Import des nouveaux types spécifiques
import {
  MotifAfpaForm,
  SelectedMotifType,
  SyntheseEvaluationProps,
  convertMotifToString,
} from "./syntheseEvaluation.types";

// Import des types depuis evaluation.tsx
import {
  Postit as EvaluationPostit,
  Call as EvaluationCall,
  CategoriePratique as EvaluationCategoriePratique,
} from "@/types/evaluation";

// Import des types depuis types.tsx
import {
  Postit as AppPostit,
  Call as AppCall,
  CategoriePratique as AppCategoriePratique,
} from "@/types/types";

const SyntheseEvaluation: React.FC<SyntheseEvaluationProps> = ({
  hideHeader = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isNarrow = useMediaQuery("(max-width:900px)");

  const { selectedCall, appelPostits } = useCallData();
  const {
    categoriesPratiques,
    pratiques,
    categoriesSujets,
    sujetsData,
    selectedDomain,
  } = useAppContext();

  const [activeTab, setActiveTab] = useState(0);
  const [selectedSujet, setSelectedSujet] = useState<string>("");
  const [selectedPratique, setSelectedPratique] = useState<string>("");
  // Utilisation du nouveau type pour selectedMotif
  const [selectedMotif, setSelectedMotif] = useState<SelectedMotifType>(null);
  // Utilisation du nouveau type pour formState
  const [formState, setFormState] = useState<MotifAfpaForm>({
    avancement_formation: false,
    avancement_lieu: false,
    avancement_date: false,
    avancement_financement: false,
    promotion_reseau: false,
    commentaire: "",
    action_client: "",
  });

  // Filtrage des post-its liés à l'appel
  const filteredPostits = appelPostits.filter(
    (postit) => postit.sujet || postit.pratique
  );

  // Statistiques
  const tempConvertedPostits: EvaluationPostit[] = filteredPostits.map(
    (postit) => ({
      id: String(postit.id),
      callid: postit.callid,
      wordid: postit.wordid,
      word: postit.word,
      text: postit.text,
      iddomaine: postit.iddomaine,
      sujet: postit.sujet,
      idsujet: postit.idsujet || undefined,
      pratique: postit.pratique,
      timestamp: postit.timestamp,
      idactivite: postit.idactivite,
    })
  );
  const stats = getPostitStatistics(tempConvertedPostits);

  // Effet pour changer l'onglet actif en fonction des sélections
  useEffect(() => {
    if (selectedSujet || selectedPratique) {
      setActiveTab(2); // Naviguer vers l'onglet de coaching
    }
  }, [selectedSujet, selectedPratique]);

  // Gestion des changements du formulaire
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormState((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Fonction wrapper pour convertir le type pour SyntheseTab
  const handleSetSelectedMotif = (motif: string | null) => {
    setSelectedMotif(motif);
  };

  // Fonction pour effacer les sélections
  const handleClearSelection = () => {
    setSelectedSujet("");
    setSelectedPratique("");
  };

  if (!selectedCall) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6">Aucun appel sélectionné</Typography>
      </Box>
    );
  }

  // Conversion des données pour qu'elles correspondent aux types attendus
  const convertedCall: EvaluationCall = {
    callid: String(selectedCall.callid),
    filename: selectedCall.filename,
    description: selectedCall.description || "",
    filepath: selectedCall.filepath,
    callactivityrelation: selectedCall.callactivityrelation || [],
  };

  // Conversion des postits pour correspondre au type attendu
  const convertedPostits: EvaluationPostit[] = filteredPostits.map(
    (postit) => ({
      id: String(postit.id),
      callid: postit.callid,
      wordid: postit.wordid,
      word: postit.word,
      text: postit.text,
      iddomaine: postit.iddomaine,
      sujet: postit.sujet,
      idsujet: postit.idsujet || undefined,
      pratique: postit.pratique,
      timestamp: postit.timestamp,
      idactivite: postit.idactivite,
    })
  );

  // Conversion des catégories de pratiques
  const convertedCategoriesPratiques: EvaluationCategoriePratique[] =
    categoriesPratiques.map((cat) => ({
      ...cat,
      nomcategorie: cat.name || "",
    }));

  // Conversion de selectedDomain en number si c'est un string
  const domainAsNumber =
    typeof selectedDomain === "string"
      ? parseInt(selectedDomain, 10)
      : selectedDomain;

  // Conversion du motif pour SyntheseTab
  const selectedMotifForTab = convertMotifToString(selectedMotif);

  // Effet pour s'assurer qu'une seule sélection soit active à la fois
  useEffect(() => {
    // Si on sélectionne un nouveau sujet, effacer la pratique
    if (selectedSujet && selectedPratique) {
      setSelectedPratique("");
    }
  }, [selectedSujet]);

  useEffect(() => {
    // Si on sélectionne une nouvelle pratique, effacer le sujet
    if (selectedPratique && selectedSujet) {
      setSelectedSujet("");
    }
  }, [selectedPratique]);

  // RENDU CONDITIONNEL SELON HIDEHEADER
  if (hideHeader) {
    return (
      <Box sx={{ p: { xs: 1, md: 2 } }}>
        {/* VERSION SANS EN-TÊTE - Juste les onglets et le contenu */}
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            mb: 2,
            minHeight: "auto",
            "& .MuiTab-root": {
              fontWeight: "bold",
              fontSize: isMobile ? "0.75rem" : "0.85rem",
              minHeight: "auto",
              py: 1,
            },
          }}
          variant={isNarrow ? "scrollable" : "fullWidth"}
          scrollButtons="auto"
        >
          <Tab
            icon={!isMobile ? <BarChart fontSize="small" /> : undefined}
            iconPosition="start"
            label="SYNTHÈSE"
          />
          <Tab
            icon={
              !isMobile ? <AssessmentOutlined fontSize="small" /> : undefined
            }
            iconPosition="start"
            label="CRITÈRES QUALITÉ"
          />
          <Tab
            icon={
              !isMobile ? <PsychologyOutlined fontSize="small" /> : undefined
            }
            iconPosition="start"
            label="SIMULATION COACHING"
          />
        </Tabs>

        {/* Contenu des onglets */}
        {activeTab === 0 && (
          <SyntheseTab
            selectedCall={convertedCall}
            stats={stats}
            selectedMotif={selectedMotifForTab}
            setSelectedMotif={handleSetSelectedMotif}
            formState={formState}
            handleInputChange={handleInputChange}
            setActiveTab={setActiveTab}
            setSelectedSujet={setSelectedSujet}
            setSelectedPratique={setSelectedPratique}
          />
        )}

        {activeTab === 1 && (
          <CritereQualiteTab
            selectedDomain={domainAsNumber}
            categoriesSujets={categoriesSujets}
            sujetsData={sujetsData}
            categoriesPratiques={convertedCategoriesPratiques}
            pratiques={pratiques}
          />
        )}

        {activeTab === 2 && (
          <SimulationCoachingTab
            filteredPostits={convertedPostits}
            sujetsData={sujetsData}
            categoriesSujets={categoriesSujets}
            pratiques={pratiques}
            categoriesPratiques={convertedCategoriesPratiques}
            selectedSujet={selectedSujet}
            selectedPratique={selectedPratique}
            onClearSelection={handleClearSelection}
          />
        )}
      </Box>
    );
  }

  // VERSION ORIGINALE AVEC EN-TÊTE (pour rétrocompatibilité)
  return (
    <Box sx={{ p: { xs: 1, md: 2 } }}>
      {/* En-tête simplifié sans bouton Save */}
      <Paper
        sx={{
          p: { xs: 1.5, md: 2 },
          mb: 2,
          borderRadius: 1,
          position: "relative",
        }}
      >
        <Typography
          variant={isMobile ? "h6" : "h5"}
          sx={{ fontWeight: "bold", color: "primary.main", mb: 2 }}
        >
          Synthèse d'évaluation
        </Typography>

        <Typography variant="body2" sx={{ mb: 2, display: "block" }}>
          Appel #{selectedCall.callid} :{" "}
          <span style={{ fontStyle: "italic" }}>
            {selectedCall.description || ""}
          </span>
        </Typography>

        {stats.totalPostits > 0 ? (
          <Alert
            severity="info"
            sx={{ py: 0.5 }}
            icon={<BarChart fontSize="small" />}
          >
            <Typography variant="caption">
              <strong>{stats.totalPostits} passages</strong> évalués, concernant{" "}
              <strong>{stats.uniqueSujets} critères</strong> et suggérant{" "}
              <strong>{stats.uniquePratiques} pratiques</strong> d'amélioration.
            </Typography>
          </Alert>
        ) : (
          <Alert severity="warning" sx={{ py: 0.5 }}>
            <Typography variant="caption">
              Aucun passage n'a encore été évalué pour cet appel.
            </Typography>
          </Alert>
        )}
      </Paper>

      {/* Navigation par onglets */}
      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        sx={{
          mb: 2,
          minHeight: "auto",
          "& .MuiTab-root": {
            fontWeight: "bold",
            fontSize: isMobile ? "0.75rem" : "0.85rem",
            minHeight: "auto",
            py: 1,
          },
        }}
        variant={isNarrow ? "scrollable" : "fullWidth"}
        scrollButtons="auto"
      >
        <Tab
          icon={!isMobile ? <BarChart fontSize="small" /> : undefined}
          iconPosition="start"
          label="SYNTHÈSE"
        />
        <Tab
          icon={!isMobile ? <AssessmentOutlined fontSize="small" /> : undefined}
          iconPosition="start"
          label="CRITÈRES QUALITÉ"
        />
        <Tab
          icon={!isMobile ? <PsychologyOutlined fontSize="small" /> : undefined}
          iconPosition="start"
          label="SIMULATION COACHING"
        />
      </Tabs>

      {/* Contenu des onglets */}
      {activeTab === 0 && (
        <SyntheseTab
          selectedCall={convertedCall}
          stats={stats}
          selectedMotif={selectedMotifForTab}
          setSelectedMotif={handleSetSelectedMotif}
          formState={formState}
          handleInputChange={handleInputChange}
          setActiveTab={setActiveTab}
          setSelectedSujet={setSelectedSujet}
          setSelectedPratique={setSelectedPratique}
        />
      )}

      {activeTab === 1 && (
        <CritereQualiteTab
          selectedDomain={domainAsNumber}
          categoriesSujets={categoriesSujets}
          sujetsData={sujetsData}
          categoriesPratiques={convertedCategoriesPratiques}
          pratiques={pratiques}
        />
      )}

      {activeTab === 2 && (
        <SimulationCoachingTab
          filteredPostits={convertedPostits}
          sujetsData={sujetsData}
          categoriesSujets={categoriesSujets}
          pratiques={pratiques}
          categoriesPratiques={convertedCategoriesPratiques}
          selectedSujet={selectedSujet}
          selectedPratique={selectedPratique}
          onClearSelection={handleClearSelection}
        />
      )}
    </Box>
  );
};

export default SyntheseEvaluation;
