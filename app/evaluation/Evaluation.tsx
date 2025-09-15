// app/evaluation/Evaluation.tsx - Intégration NewTranscript

"use client";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  memo,
  Suspense,
} from "react";
import {
  Box,
  CircularProgress,
  Switch,
  FormControlLabel,
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useAuth0 } from "@auth0/auth0-react";
import { useAppContext } from "@/context/AppContext";
import { useCallData } from "@/context/CallDataContext";
import { useAudio } from "@/context/AudioContext";
import { useFilteredDomains } from "@/hooks/AppContext/useFilteredDomains";

// Composants existants
import EvaluationTranscript from "./components/EvaluationTranscript/EvaluationTranscript";
import SyntheseEvaluation from "./components/SyntheseEvaluation/index";
import SelectionEntrepriseEtAppel from "../components/common/SelectionEntrepriseEtAppel/SelectionEntrepriseEtAppel";
import Postit from "./components/Postit";
import FourZones from "./components/FourZones/";
import UnifiedHeader from "./components/UnifiedHeader";

// NOUVEAU: Import NewTranscript
import NewTranscript from "./components/NewTranscript";
import {
  configPresets,
  applyConfigPreset,
} from "./components/NewTranscript/config";

import { EvaluationProps } from "@/types/types";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { getPostitStatistics } from "./components/SyntheseEvaluation/utils/filters";
import EntrainementSuivi from "./components/EntrainementSuivi";
import { EvaluationHelpers, type ContextPanelsMap } from "./evaluation.types";

// Types pour les modes d'affichage
type DisplayMode = "normal" | "transcript-fullwidth" | "context-fullwidth";

function EvaluationContent({ darkMode, setDarkMode }: EvaluationProps) {
  const searchParams = useSearchParams();
  const view = searchParams.get("view");
  const [compactMode, setCompactMode] = useState(false);

  // NOUVEAU: Feature flag pour NewTranscript
  const [useNewTranscript, setUseNewTranscript] = useState(false);
  const theme = useTheme();

  const [isClient, setIsClient] = useState(false);

  // Initialiser côté client uniquement
  useEffect(() => {
    setIsClient(true);
    const stored = localStorage.getItem("useNewTranscript");
    if (stored === "true") {
      setUseNewTranscript(true);
    }
  }, []);

  // Persister le choix dans localStorage
  const toggleNewTranscript = useCallback(() => {
    const newValue = !useNewTranscript;
    setUseNewTranscript(newValue);
    localStorage.setItem("useNewTranscript", newValue.toString());
  }, [useNewTranscript]);

  // États existants (conservés)
  const [displayMode, setDisplayMode] = useState<DisplayMode>("normal");
  const [viewMode, setViewMode] = useState<"word" | "paragraph">("word");
  const [highlightTurnOne, setHighlightTurnOne] = useState(false);
  const [highlightSpeakers, setHighlightSpeakers] = useState(true);
  const [fontSize, setFontSize] = useState<number>(14);
  const [speechToTextVisible, setSpeechToTextVisible] =
    useState<boolean>(false);

  // Hooks existants (conservés)
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

  const { audioRef, setAudioSrc, isPlaying, currentTime, duration } =
    useAudio();

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

  // Fonctions existantes (conservées)
  const toggleHighlightTurnOne = useCallback(() => {
    setHighlightTurnOne((prev) => !prev);
  }, []);

  const toggleHighlightSpeakers = useCallback(() => {
    setHighlightSpeakers((prev) => !prev);
  }, []);

  const increaseFontSize = () =>
    setFontSize((current) => Math.min(current + 1, 24));
  const decreaseFontSize = () =>
    setFontSize((current) => Math.max(current - 1, 10));

  const toggleSpeechToText = useCallback(() => {
    setSpeechToTextVisible((prev) => !prev);
  }, []);

  // Stats d'évaluation (conservées)
  const evaluationStats = useMemo(() => {
    if (!appelPostits || appelPostits.length === 0) return null;

    const filteredPostits = appelPostits.filter(
      (postit) => postit.sujet || postit.pratique
    );

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

  // Panneaux contextuels (conservés)
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

  // Fonctions de gestion d'affichage (conservées)
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

  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => (prev === "word" ? "paragraph" : "word"));
  }, []);

  const handleRefreshTranscription = useCallback(() => {
    if (selectedCall) {
      fetchTranscription(selectedCall.callid);
    }
  }, [selectedCall, fetchTranscription]);

  const handleAddPostit = useCallback(() => {
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
    console.log("Sauvegarde...");
  }, []);

  // Calculs d'affichage (conservés)
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

  const selectedDomainString =
    EvaluationHelpers.validateSelectedDomain(selectedDomain);
  const validatedTranscriptMode =
    EvaluationHelpers.validateTranscriptSelectionMode(transcriptSelectionMode);

  // NOUVEAU: Configuration pour NewTranscript
  const newTranscriptConfig = useMemo(() => {
    return applyConfigPreset("evaluationTurns", {
      // ✅ Utiliser le preset turns
      audioSrc: selectedCall?.audiourl || "",
      fontSize: fontSize,
      interactions: {
        wordClick: true,
        textSelection: !!transcriptSelectionMode,
        eventEditing: true,
        timelineNavigation: true,
        keyboardShortcuts: true,
        highlightTurns: highlightTurnOne,
      },
      layout: {
        audioPlayerPosition: "integrated",
        showControls: false, // Contrôlé par UnifiedHeader
        transcriptHeight: "calc(100vh - 200px)",
        timelineHeight: 120,
      },
    });
  }, [
    selectedCall?.audiourl,
    fontSize,
    transcriptSelectionMode,
    highlightTurnOne,
  ]);

  // Effects existants (conservés)
  useEffect(() => {
    resetSelectedState();
  }, []);

  useEffect(() => {
    if (selectedCall) {
      setAudioSrc(selectedCall.audiourl ?? null);
    }
  }, [selectedCall, setAudioSrc]);

  useEffect(() => {
    if (view === "postit" && !selectedPostit) {
      router.push("/evaluation?view=synthese");
    } else if (view === "roleplay" && !selectedPostitForRolePlay) {
      router.push("/evaluation?view=synthese");
    }
  }, [view, selectedPostit, selectedPostitForRolePlay, router]);

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
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Feature Flag Control en mode développement */}
      {process.env.NODE_ENV === "development" && isClient && (
        <Box
          sx={{
            position: "fixed",
            top: 10,
            left: 10,
            zIndex: 10000,
            backgroundColor: theme.palette.background.paper, // ✅ s'adapte au darkMode
            padding: 1,
            borderRadius: 1,
            boxShadow: 2,
            border: `2px solid ${theme.palette.primary.main}`, // ✅ utilise la couleur du thème
          }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={useNewTranscript}
                onChange={toggleNewTranscript}
                color="primary"
              />
            }
            label={`NewTranscript ${useNewTranscript ? "ON" : "OFF"}`}
          />
        </Box>
      )}

      {/* Header unifié */}
      <Box sx={{ flexShrink: 0, position: "relative", zIndex: 10 }}>
        <UnifiedHeader
          shouldShowTranscript={shouldShowTranscript}
          displayMode={displayMode}
          selectedCall={EvaluationHelpers.convertCallForUnifiedHeader(
            selectedCall
          )}
          evaluationStats={evaluationStats}
          viewMode={viewMode}
          currentWord={currentWord}
          hasRightPanel={hasRightPanel}
          shouldShowContext={shouldShowContext}
          highlightTurnOne={highlightTurnOne}
          highlightSpeakers={highlightSpeakers}
          onToggleViewMode={toggleViewMode}
          onRefreshTranscription={handleRefreshTranscription}
          onAddPostit={handleAddPostit}
          onSetTranscriptFullWidth={setTranscriptFullWidth}
          onToggleRightPanel={toggleRightPanel}
          onToggleHighlightTurnOne={toggleHighlightTurnOne}
          onToggleHighlightSpeakers={toggleHighlightSpeakers}
          view={view}
          filteredDomains={filteredDomains || []}
          selectedDomain={selectedDomainString}
          contextPanels={contextPanels}
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

      {/* Contenu principal */}
      <Box sx={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>
        {/* Zone transcript */}
        <Box
          sx={{
            flex: 1,
            overflow: "hidden",
            display: shouldShowTranscript ? "flex" : "none",
            flexDirection: "column",
          }}
        >
          {/* Notification du système actif */}
          {useNewTranscript && (
            <Alert
              severity="info"
              sx={{ margin: 1 }}
              action={
                <FormControlLabel
                  control={
                    <Switch
                      checked={useNewTranscript}
                      onChange={toggleNewTranscript}
                      size="small"
                    />
                  }
                  label="NewTranscript"
                />
              }
            >
              Nouveau système de transcript actif (Beta)
            </Alert>
          )}

          {/* NOUVEAU: Choix conditionnel entre NewTranscript et EvaluationTranscript */}
          {useNewTranscript ? (
            <NewTranscript
              callId={selectedCall?.callid?.toString() || "demo"}
              config={newTranscriptConfig}
              // Props de compatibilité avec l'ancien système
              hideHeader={false} // Header géré par UnifiedHeader
              viewMode={viewMode}
              transcriptSelectionMode={validatedTranscriptMode}
              isSpectatorMode={false}
              highlightTurnOne={highlightTurnOne}
            />
          ) : (
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
              transcriptSelectionMode={validatedTranscriptMode}
            />
          )}
        </Box>

        {/* Zone contextuelle (inchangée) */}
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
  );
}

const Evaluation = ({ darkMode, setDarkMode }: EvaluationProps) => {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <CircularProgress />
        </Box>
      }
    >
      <EvaluationContent darkMode={darkMode} setDarkMode={setDarkMode} />
    </Suspense>
  );
};

export default memo(Evaluation);
