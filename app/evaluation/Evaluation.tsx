// 📜 app/evaluation/Evaluation.tsx - Corrections finales

"use client";

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { Box } from "@mui/material";
import { useAuth0 } from "@auth0/auth0-react";
import { useAppContext } from "@/context/AppContext";
import { useCallData } from "@/context/CallDataContext";
import { useAudio } from "@/context/AudioContext";
import { useFilteredDomains } from "@/hooks/AppContext/useFilteredDomains";
import EvaluationTranscript from "./components/EvaluationTranscript";
import SyntheseEvaluation from "./components/SyntheseEvaluation/index";
import SelectionEntrepriseEtAppel from "../components/common/SelectionEntrepriseEtAppel";
import Postit from "./components/Postit";
import FourZones from "./components/FourZones/";
import { EvaluationProps } from "@/types/types";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { getPostitStatistics } from "./components/SyntheseEvaluation/utils/filters";
import EntrainementSuivi from "./components/EntrainementSuivi";

// IMPORT DU NOUVEAU COMPOSANT
import UnifiedHeader from "./components/UnifiedHeader";

// ✅ AJOUT : Import des helpers pour corriger les types
import { EvaluationHelpers, type ContextPanelsMap } from "./evaluation.types";

// Types pour les modes d'affichage
type DisplayMode = "normal" | "transcript-fullwidth" | "context-fullwidth";

const Evaluation = ({ darkMode, setDarkMode }: EvaluationProps) => {
  const searchParams = useSearchParams();
  const view = searchParams.get("view");

  // État centralisé pour gérer l'affichage des panneaux
  const [displayMode, setDisplayMode] = useState<DisplayMode>("normal");

  // NOUVEAU : État pour le mode de vue transcription
  const [viewMode, setViewMode] = useState<"word" | "paragraph">("word");
  const [highlightTurnOne, setHighlightTurnOne] = useState(false);
  const [highlightSpeakers, setHighlightSpeakers] = useState(true);

  const toggleHighlightTurnOne = useCallback(() => {
    setHighlightTurnOne((prev) => !prev);
  }, []);

  const toggleHighlightSpeakers = useCallback(() => {
    setHighlightSpeakers((prev) => !prev);
  }, []);

  //états pour FourZones
  const [fontSize, setFontSize] = useState<number>(14);
  const [speechToTextVisible, setSpeechToTextVisible] =
    useState<boolean>(false);

  const increaseFontSize = () =>
    setFontSize((current) => Math.min(current + 1, 24));
  const decreaseFontSize = () =>
    setFontSize((current) => Math.max(current - 1, 10));
  const toggleSpeechToText = useCallback(() => {
    setSpeechToTextVisible((prev) => !prev);
  }, []);

  // CONSOLIDATION DES HOOKS - Une seule fois
  const { user, isAuthenticated } = useAuth0();
  const {
    selectedCall,
    currentWord,
    fetchTranscription,
    calls,
    selectCall,
    selectedPostitForRolePlay,
    transcriptSelectionMode,
    isLoadingRolePlay,
    selectedPostit,
    setSelectedPostit,
    appelPostits,
  } = useCallData();

  const { audioRef, setAudioSrc } = useAudio();
  const {
    resetSelectedState,
    entreprises,
    isLoadingEntreprises,
    errorEntreprises,
    selectedEntreprise,
    setSelectedEntreprise,
    selectedDomain,
    selectDomain,
  } = useAppContext();
  const { filteredDomains } = useFilteredDomains(selectedEntreprise);

  // ✅ CORRIGÉ : Calcul des stats avec appelPostits importé
  const evaluationStats = useMemo(() => {
    if (!appelPostits || appelPostits.length === 0) return null;

    const filteredPostits = appelPostits.filter(
      (postit) => postit.sujet || postit.pratique
    );

    // Convertir les postits au format attendu par getPostitStatistics
    const convertedPostits = filteredPostits.map((postit) => ({
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
    }));

    return getPostitStatistics(convertedPostits);
  }, [appelPostits]);

  // Ajout de FourZones aux panneaux contextuels
  const contextPanels: ContextPanelsMap = {
    selection: {
      component: <SelectionEntrepriseEtAppel />,
      width: 400,
    },
    synthese: {
      component: <SyntheseEvaluation hideHeader={true} />,
      width: "50%",
    },
    postit: {
      component: <Postit inline hideHeader={true} />,
      width: 700,
    },
    roleplay: {
      component: (
        <FourZones
          fontSize={fontSize}
          speechToTextVisible={speechToTextVisible}
          toggleSpeechToText={toggleSpeechToText}
          increaseFontSize={increaseFontSize}
          decreaseFontSize={decreaseFontSize}
        />
      ),
      width: "55%",
    },
    entrainement: {
      component: <EntrainementSuivi hideHeader={true} />,
      width: "60%",
    },
  };

  const router = useRouter();

  // Fonctions centralisées pour gérer l'affichage
  const setTranscriptFullWidth = useCallback(() => {
    setDisplayMode(
      displayMode === "transcript-fullwidth" ? "normal" : "transcript-fullwidth"
    );
  }, [displayMode]);

  const setContextFullWidth = useCallback(() => {
    const newMode =
      displayMode === "context-fullwidth" ? "normal" : "context-fullwidth";

    setDisplayMode(newMode);
  }, [displayMode]);

  const toggleRightPanel = useCallback(() => {
    if (displayMode === "normal") {
      setDisplayMode("transcript-fullwidth");
    } else {
      setDisplayMode("normal");
    }
  }, [displayMode]);

  const handleNavigateToSynthese = useCallback(() => {
    router.push("/evaluation?view=synthese");
  }, [router]);

  // Fonctions pour la transcription
  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => (prev === "word" ? "paragraph" : "word"));
  }, []);

  const handleRefreshTranscription = useCallback(() => {
    if (selectedCall) {
      fetchTranscription(selectedCall.callid);
    }
  }, [selectedCall, fetchTranscription]);

  const handleAddPostit = useCallback(() => {
    // Logic pour ajouter un post-it
    console.log(
      "Add postit at:",
      Math.floor(audioRef.current?.currentTime || 0)
    );
  }, [audioRef]);

  const handleDomainChange = useCallback(
    (event: any) => {
      selectDomain(event.target.value);
    },
    [selectDomain]
  );

  const handleSave = useCallback(() => {
    // Logic de sauvegarde selon le contexte
    console.log("Sauvegarde...");
  }, []);

  // ✅ CORRECTION : Utilisation des helpers pour calculer les valeurs boolean
  const shouldShowTranscript = displayMode !== "context-fullwidth";

  const shouldShowContext = EvaluationHelpers.validateShouldShowContext(
    displayMode,
    view,
    contextPanels,
    selectedPostit
  );

  const hasRightPanel =
    (view !== null &&
      EvaluationHelpers.isValidContextView(view) &&
      Boolean(contextPanels[view])) ||
    Boolean(selectedPostit);

  // ✅ CORRECTION : Conversion des types avec les helpers
  const selectedDomainString =
    EvaluationHelpers.validateSelectedDomain(selectedDomain);
  const validatedTranscriptMode =
    EvaluationHelpers.validateTranscriptSelectionMode(transcriptSelectionMode);

  useEffect(() => {
    resetSelectedState();
  }, []);

  useEffect(() => {
    if (selectedCall) {
      setAudioSrc(selectedCall.audiourl ?? null);
    }
  }, [selectedCall, setAudioSrc]);

  // Vérification des conditions de redirection
  useEffect(() => {
    if (view === "postit" && !selectedPostit) {
      router.push("/evaluation?view=synthese");
    } else if (view === "roleplay" && !selectedPostitForRolePlay) {
      router.push("/evaluation?view=synthese");
    }
  }, [view, selectedPostit, selectedPostitForRolePlay, router]);

  // Réinitialiser le mode d'affichage quand on change de vue
  useEffect(() => {
    if (
      (view &&
        EvaluationHelpers.isValidContextView(view) &&
        contextPanels[view]) ||
      selectedPostit
    ) {
      setDisplayMode("normal");
    }
  }, [view, selectedPostit]);

  return (
    <>
      {/* ✅ SIMPLIFIÉ : Structure sans ActivitySidebar et sans box imbriqués inutiles */}
      <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
        {/* CONTENEUR FIXE POUR LE HEADER */}
        <Box
          sx={{
            flexShrink: 0,
            position: "relative",
            zIndex: 10,
          }}
        >
          <UnifiedHeader
            // Transcription props
            shouldShowTranscript={shouldShowTranscript}
            displayMode={displayMode}
            selectedCall={EvaluationHelpers.convertCallForUnifiedHeader(
              selectedCall
            )}
            evaluationStats={evaluationStats}
            viewMode={viewMode}
            currentWord={currentWord}
            hasRightPanel={hasRightPanel}
            shouldShowContext={shouldShowContext} // ✅ CORRIGÉ : Boolean garanti
            highlightTurnOne={highlightTurnOne}
            highlightSpeakers={highlightSpeakers}
            // Actions transcription
            onToggleViewMode={toggleViewMode}
            onRefreshTranscription={handleRefreshTranscription}
            onAddPostit={handleAddPostit}
            onSetTranscriptFullWidth={setTranscriptFullWidth}
            onToggleRightPanel={toggleRightPanel}
            onToggleHighlightTurnOne={toggleHighlightTurnOne}
            onToggleHighlightSpeakers={toggleHighlightSpeakers}
            // Contextual props
            view={view}
            filteredDomains={filteredDomains || []}
            selectedDomain={selectedDomainString} // ✅ CORRIGÉ : String garanti
            contextPanels={contextPanels}
            // Actions contextuelles
            onDomainChange={handleDomainChange}
            onSave={handleSave}
            onSetContextFullWidth={setContextFullWidth}
            onClosePanel={() => setDisplayMode("transcript-fullwidth")}
            onNavigateToSynthese={handleNavigateToSynthese}
            fontSize={fontSize}
            increaseFontSize={increaseFontSize}
            decreaseFontSize={decreaseFontSize}
            speechToTextVisible={speechToTextVisible}
            toggleSpeechToText={toggleSpeechToText}
            isLoadingRolePlay={isLoadingRolePlay}
            selectedPostitForRolePlay={selectedPostitForRolePlay}
          />
        </Box>

        {/* CONTENU DES VOLETS avec hauteur calculée */}
        <Box
          sx={{
            display: "flex",
            flex: 1,
            overflow: "hidden",
            minHeight: 0,
          }}
        >
          {/* Contenu Transcription */}
          <Box
            sx={{
              flex: 1,
              overflow: "hidden",
              display: shouldShowTranscript ? "flex" : "none",
              flexDirection: "column",
            }}
          >
            <EvaluationTranscript
              showRightPanel={shouldShowContext} // ✅ CORRIGÉ : Boolean garanti
              toggleRightPanel={toggleRightPanel}
              hasRightPanel={hasRightPanel}
              displayMode={displayMode}
              setTranscriptFullWidth={setTranscriptFullWidth}
              setContextFullWidth={setContextFullWidth}
              viewMode={viewMode}
              hideHeader={true}
              highlightTurnOne={highlightTurnOne}
              highlightSpeakers={highlightSpeakers}
              transcriptSelectionMode={validatedTranscriptMode} // ✅ CORRIGÉ : undefined au lieu de null
            />
          </Box>

          {/* Contenu du panneau contextuel */}
          {shouldShowContext && (
            <Box
              sx={{
                flex: displayMode === "context-fullwidth" ? 1 : "0 0 55%",
                borderLeft:
                  displayMode === "context-fullwidth" ? "none" : "1px solid",
                borderColor: "divider",
                bgcolor: "background.default",
                height: "100%",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Contenu complet */}
              {view === "postit" && selectedPostit ? (
                <Box sx={{ p: 2, height: "100%", overflow: "auto" }}>
                  <Postit inline hideHeader={true} />
                </Box>
              ) : view === "synthese" ? (
                <Box sx={{ p: 2, height: "100%", overflow: "auto" }}>
                  <SyntheseEvaluation hideHeader={true} />
                </Box>
              ) : view === "roleplay" ? (
                <FourZones
                  fontSize={fontSize}
                  speechToTextVisible={speechToTextVisible}
                  toggleSpeechToText={toggleSpeechToText}
                  increaseFontSize={increaseFontSize}
                  decreaseFontSize={decreaseFontSize}
                />
              ) : view === "selection" ? (
                <Box sx={{ p: 2, height: "100%", overflow: "auto" }}>
                  <SelectionEntrepriseEtAppel />
                </Box>
              ) : view && EvaluationHelpers.isValidContextView(view) ? (
                contextPanels[view]?.component
              ) : null}
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
};

export default memo(Evaluation);
