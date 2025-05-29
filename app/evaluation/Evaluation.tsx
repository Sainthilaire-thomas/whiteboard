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
import ActivitySidebar from "../components/navigation/ActivitySidebar";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { getPostitStatistics } from "./components/SyntheseEvaluation/utils/filters";

// IMPORT DU NOUVEAU COMPOSANT
import UnifiedHeader from "./components/UnifiedHeader";

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
    console.log("🔄 toggleHighlightTurnOne appelé");
    setHighlightTurnOne((prev) => !prev);
  }, []);

  const toggleHighlightSpeakers = useCallback(() => {
    console.log("🔄 toggleHighlightSpeakers appelé");
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
    appelPostits, // ✅ AJOUTÉ : Import de appelPostits
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
  const contextPanels: Record<
    string,
    { component: React.ReactNode; width: number | string }
  > = {
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
  };

  const router = useRouter();

  // Fonctions centralisées pour gérer l'affichage
  const setTranscriptFullWidth = useCallback(() => {
    setDisplayMode(
      displayMode === "transcript-fullwidth" ? "normal" : "transcript-fullwidth"
    );
  }, [displayMode]);

  const setContextFullWidth = useCallback(() => {
    console.log("🔄 setContextFullWidth called, current mode:", displayMode);
    const newMode =
      displayMode === "context-fullwidth" ? "normal" : "context-fullwidth";
    console.log("🔄 switching to:", newMode);
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

  // Logique pour déterminer ce qui doit être affiché
  const shouldShowTranscript = displayMode !== "context-fullwidth";
  const shouldShowContext =
    displayMode !== "transcript-fullwidth" &&
    ((view && contextPanels[view]) || selectedPostit);
  const hasRightPanel =
    Boolean(view && contextPanels[view]) || Boolean(selectedPostit);

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
    if ((view && contextPanels[view]) || selectedPostit) {
      setDisplayMode("normal");
    }
  }, [view, selectedPostit]);

  // Debug logs
  useEffect(() => {
    console.log("🔍 DisplayMode changed:", displayMode);
    console.log("📊 shouldShowTranscript:", shouldShowTranscript);
    console.log("📊 shouldShowContext:", shouldShowContext);
    console.log("📊 view:", view);
  }, [displayMode, shouldShowTranscript, shouldShowContext, view]);

  return (
    <>
      <Box sx={{ display: "flex", height: "100vh", flexDirection: "column" }}>
        <Box sx={{ display: "flex", flexGrow: 1 }}>
          <ActivitySidebar
            entreprises={entreprises}
            selectedEntreprise={selectedEntreprise}
            setSelectedEntreprise={setSelectedEntreprise}
            calls={calls}
            selectCall={selectCall}
            selectedCall={selectedCall}
          />

          {/* Zone principale avec structure fixe */}
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
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
                selectedCall={selectedCall}
                evaluationStats={evaluationStats} // ✅ Passé avec les stats calculées
                viewMode={viewMode}
                currentWord={currentWord}
                hasRightPanel={hasRightPanel}
                shouldShowContext={shouldShowContext}
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
                selectedDomain={selectedDomain || ""}
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
                  showRightPanel={shouldShowContext}
                  toggleRightPanel={toggleRightPanel}
                  hasRightPanel={hasRightPanel}
                  displayMode={displayMode}
                  setTranscriptFullWidth={setTranscriptFullWidth}
                  setContextFullWidth={setContextFullWidth}
                  viewMode={viewMode}
                  hideHeader={true}
                  highlightTurnOne={highlightTurnOne}
                  highlightSpeakers={highlightSpeakers}
                  transcriptSelectionMode={transcriptSelectionMode}
                />
              </Box>

              {/* Contenu du panneau contextuel */}
              {shouldShowContext && (
                <Box
                  sx={{
                    flex: displayMode === "context-fullwidth" ? 1 : "0 0 55%",
                    borderLeft:
                      displayMode === "context-fullwidth"
                        ? "none"
                        : "1px solid",
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
                  ) : (
                    contextPanels[view!]?.component
                  )}
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default memo(Evaluation);
