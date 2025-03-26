// 📜 app/evaluation/Evaluation.tsx
"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { Box, Drawer, Tabs, Tab, IconButton, Modal } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useAuth0 } from "@auth0/auth0-react";
import { useAppContext } from "@/context/AppContext";
import { useCallData } from "@/context/CallDataContext";
import EvaluationTranscript from "./components/EvaluationTranscript";
import SyntheseEvaluation from "./components/SyntheseEvaluation";
import SelectionEntrepriseEtAppel from "../components/common/SelectionEntrepriseEtAppel";
import Postit from "./components/Postit";
import { EvaluationProps } from "@/types/types"; // ✅ Import correct
import ActivitySidebar from "../components/navigation/ActivitySidebar";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Fab } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

const Evaluation = ({ darkMode, setDarkMode }: EvaluationProps) => {
  const searchParams = useSearchParams();
  const view = searchParams.get("view");
  const contextPanels: Record<
    string,
    { component: React.ReactNode; width: number }
  > = {
    selection: {
      component: <SelectionEntrepriseEtAppel />,
      width: 400,
    },
    synthese: {
      component: <SyntheseEvaluation />,
      width: 700,
    },
    postit: {
      component: <Postit inline />,
      width: 700,
    },
  };

  const router = useRouter();
  const [showRightPanel, setShowRightPanel] = useState(true);

  const { user, isAuthenticated } = useAuth0();
  const { selectedCall, setAudioSrc, calls, selectCall } = useCallData();
  const {
    resetSelectedState,
    entreprises,
    isLoadingEntreprises,
    errorEntreprises,
    selectedEntreprise,
    setSelectedEntreprise,
    selectedPostit,
    setSelectedPostit,
  } = useAppContext();

  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(false);
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    }
  }, [view, selectedPostit, router]);

  useEffect(() => {
    if ((view && contextPanels[view]) || selectedPostit) {
      setShowRightPanel(true);
    }
  }, [view, selectedPostit]);

  return (
    <>
      <Box sx={{ display: "flex", height: "100vh" }}>
        {/* ✅ Barre latérale complète à gauche */}
        <ActivitySidebar
          entreprises={entreprises}
          selectedEntreprise={selectedEntreprise}
          setSelectedEntreprise={setSelectedEntreprise}
          calls={calls}
          selectCall={selectCall}
          selectedCall={selectedCall}
        />

        {/* ✅ Colonne principale à droite */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Box sx={{ display: "flex", flexGrow: 1 }}>
            {/* Transcript principal */}
            <Box sx={{ flex: 1 }}>
              <EvaluationTranscript />
            </Box>

            {/* Zone contextuelle */}
            {showRightPanel &&
              ((view && contextPanels[view]) || selectedPostit) && (
                <Box
                  sx={{
                    width: contextPanels[view!]?.width ?? 400,

                    borderLeft: "1px solid #ddd",
                    bgcolor: "background.default",
                    px: 2,
                    py: 2,
                    height: "100vh",
                    overflowY: "auto",
                    transition: "width 0.3s ease",
                  }}
                >
                  {view === "postit" && selectedPostit ? (
                    <Postit inline />
                  ) : (
                    contextPanels[view!]?.component
                  )}
                </Box>
              )}
          </Box>
        </Box>
      </Box>

      {/* ✅ Fab toggle */}
      {view && (
        <Fab
          color="primary"
          size="medium"
          onClick={() => setShowRightPanel((prev) => !prev)}
          sx={{
            position: "fixed",
            top: 64,
            right: 24,
            zIndex: 1000,
          }}
        >
          {showRightPanel ? <VisibilityOffIcon /> : <VisibilityIcon />}
        </Fab>
      )}
    </>
  );
};

export default memo(Evaluation);
