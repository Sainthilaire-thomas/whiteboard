"use client";

import { useState, useEffect, useCallback, memo } from "react";
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
  } = useCallData();
  const { audioRef, setAudioSrc } = useAudio();
  const {
    resetSelectedState,
    entreprises,
    isLoadingEntreprises,
    errorEntreprises,
    selectedEntreprise,
    setSelectedEntreprise,
    selectedPostit,
    setSelectedPostit,
    selectedDomain,
    selectDomain,
  } = useAppContext();
  const { filteredDomains } = useFilteredDomains(selectedEntreprise);

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
      component: <FourZones />,
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
    setDisplayMode(
      displayMode === "context-fullwidth" ? "normal" : "context-fullwidth"
    );
  }, [displayMode]);

  const toggleRightPanel = useCallback(() => {
    if (displayMode === "normal") {
      setDisplayMode("transcript-fullwidth");
    } else {
      setDisplayMode("normal");
    }
  }, [displayMode]);

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

          {/* Zone principale avec en-tête unifié */}
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
            {/* REMPLACEMENT DE L'EN-TÊTE PAR UnifiedHeader */}
            <UnifiedHeader
              // Transcription props
              shouldShowTranscript={shouldShowTranscript}
              displayMode={displayMode}
              selectedCall={selectedCall}
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
            />

            {/* CONTENU DES VOLETS (sans en-têtes redondants) */}
            <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
              {/* Contenu Transcription */}
              {shouldShowTranscript && (
                <Box
                  sx={{
                    flex: displayMode === "transcript-fullwidth" ? 1 : 1,
                    width:
                      displayMode === "transcript-fullwidth" ? "100%" : "auto",
                    overflow: "hidden",
                  }}
                >
                  <EvaluationTranscript
                    showRightPanel={shouldShowContext}
                    toggleRightPanel={toggleRightPanel}
                    hasRightPanel={hasRightPanel}
                    displayMode={displayMode}
                    setTranscriptFullWidth={setTranscriptFullWidth}
                    setContextFullWidth={setContextFullWidth}
                    // NOUVELLES PROPS pour contrôler depuis l'en-tête
                    viewMode={viewMode}
                    hideHeader={true}
                    // PROPS DE COLORATION - AJOUTÉES
                    highlightTurnOne={highlightTurnOne}
                    highlightSpeakers={highlightSpeakers}
                    transcriptSelectionMode={transcriptSelectionMode} // Si disponible dans useCallData
                  />
                </Box>
              )}

              {/* Contenu du panneau contextuel */}
              {shouldShowContext && (
                <Box
                  sx={{
                    width:
                      displayMode === "context-fullwidth"
                        ? "100%"
                        : contextPanels[view!]?.width ?? 400,
                    borderLeft:
                      displayMode === "context-fullwidth"
                        ? "none"
                        : "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.default",
                    px: 2,
                    py: 2,
                    height: "100%",
                    overflowY: "auto",
                    transition: "width 0.3s ease",
                  }}
                >
                  {/* Contenu sans en-têtes redondants */}
                  {view === "postit" && selectedPostit ? (
                    <Postit inline hideHeader={true} />
                  ) : view === "synthese" ? (
                    <SyntheseEvaluation hideHeader={true} />
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
