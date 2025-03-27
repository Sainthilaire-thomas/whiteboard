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
  Save,
  BarChart,
  AssessmentOutlined,
  PsychologyOutlined,
} from "@mui/icons-material";
import { useCallData } from "@/context/CallDataContext";
import { useAppContext } from "@/context/AppContext";
import { useSupabase } from "@/context/SupabaseContext";

// Import des onglets
import SyntheseTab from "./SyntheseTab";
import CritereQualiteTab from "./CritereQualiteTab";
import SimulationCoachingTab from "./SimulationCoachingTab";

// Import des utilitaires
import { getPostitStatistics } from "./utils/filters";

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

// Helper type for CallActivityRelation that seems to be referenced but not imported
type CallActivityRelation = any; // Replace with actual type if available

const SyntheseEvaluation: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isNarrow = useMediaQuery("(max-width:900px)");

  const { selectedCall, appelPostits } = useCallData();
  const { supabase } = useSupabase();
  const {
    categoriesPratiques,
    pratiques,
    categoriesSujets,
    sujetsData,
    selectedDomain,
  } = useAppContext();
  console.log("pratiques", pratiques);

  const [activeTab, setActiveTab] = useState(0);
  const [selectedSujet, setSelectedSujet] = useState<string>("");
  const [selectedPratique, setSelectedPratique] = useState<string>("");
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

  // Filtrage des post-its liés à l'appel
  const filteredPostits = appelPostits.filter(
    (postit) => postit.sujet || postit.pratique
  );

  // Statistiques - Convertissons d'abord les postits pour correspondre au type attendu par getPostitStatistics
  const tempConvertedPostits: EvaluationPostit[] = filteredPostits.map(
    (postit) => ({
      id: String(postit.id), // Conversion de number à string
      callid: postit.callid,
      wordid: postit.wordid,
      word: postit.word,
      text: postit.text,
      iddomaine: postit.iddomaine,
      sujet: postit.sujet,
      idsujet: postit.idsujet || undefined, // null to undefined conversion
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

  // Sauvegarde des données en base
  const handleSave = async () => {
    if (!selectedCall) {
      alert("Aucun appel sélectionné");
      return;
    }

    try {
      // FIX: Ensure selectedMotif is a string, not an array
      // Convert array to string if needed
      let motifValue: string | null = null;

      if (selectedMotif) {
        motifValue = Array.isArray(selectedMotif)
          ? selectedMotif.join(",") // If it's an array, join it
          : selectedMotif; // If it's already a string, use as is
      }

      const { error } = await supabase.from("motifs_afpa").upsert(
        [
          {
            ...formState,
            callid: selectedCall.callid,
            motifs: motifValue, // Now guaranteed to be string or null
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

  // Conversion des données pour qu'elles correspondent aux types attendus
  const convertedCall: EvaluationCall = {
    callid: String(selectedCall.callid), // Conversion de number à string
    filename: selectedCall.filename,
    description: selectedCall.description || "", // FIX: Ensure description is not undefined
    filepath: selectedCall.filepath,
    callactivityrelation: selectedCall.callactivityrelation || [], // FIX: Provide default empty array
  };

  // Conversion des postits pour correspondre au type attendu
  const convertedPostits: EvaluationPostit[] = filteredPostits.map(
    (postit) => ({
      id: String(postit.id), // Conversion de number à string
      callid: postit.callid,
      wordid: postit.wordid,
      word: postit.word,
      text: postit.text,
      iddomaine: postit.iddomaine,
      sujet: postit.sujet,
      idsujet: postit.idsujet || undefined, // FIX: null to undefined conversion
      pratique: postit.pratique,
      timestamp: postit.timestamp,
      idactivite: postit.idactivite,
    })
  );

  // Conversion des catégories de pratiques
  const convertedCategoriesPratiques: EvaluationCategoriePratique[] =
    categoriesPratiques.map((cat) => ({
      ...cat,
      nomcategorie: cat.name || "", // Ajout du champ manquant, utiliser une valeur par défaut
    }));

  // Conversion de selectedDomain en number si c'est un string
  const domainAsNumber =
    typeof selectedDomain === "string"
      ? parseInt(selectedDomain, 10)
      : selectedDomain;

  return (
    <Box sx={{ p: { xs: 1, md: 2 } }}>
      {/* En-tête */}
      <Paper
        sx={{
          p: { xs: 1.5, md: 2 },
          mb: 2,
          borderRadius: 1,
          position: "relative",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography
            variant={isMobile ? "h6" : "h5"}
            sx={{ fontWeight: "bold", color: "primary.main" }}
          >
            Synthèse d'évaluation
          </Typography>
          <Tooltip title="Sauvegarder les informations">
            <IconButton
              color="primary"
              onClick={handleSave}
              size={isMobile ? "small" : "medium"}
              sx={{
                bgcolor: "primary.light",
                color: "white",
                "&:hover": { bgcolor: "primary.main" },
              }}
            >
              <Save fontSize={isMobile ? "small" : "medium"} />
            </IconButton>
          </Tooltip>
        </Box>

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
          selectedMotif={selectedMotif}
          setSelectedMotif={setSelectedMotif}
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
        />
      )}
    </Box>
  );
};

export default SyntheseEvaluation;
