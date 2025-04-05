"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { Box, Drawer, Tabs, Tab, IconButton, Modal } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useAuth0 } from "@auth0/auth0-react";
import { useAppContext } from "@/context/AppContext";
import { useCallData } from "@/context/CallDataContext";
import { useAudio } from "@/context/AudioContext";
import EvaluationTranscript from "./components/EvaluationTranscript";
import SyntheseEvaluation from "./components/SyntheseEvaluation/index";
import SelectionEntrepriseEtAppel from "../components/common/SelectionEntrepriseEtAppel";
import Postit from "./components/Postit";
import FourZones from "./components/FourZones/";
import { EvaluationProps } from "@/types/types";
import ActivitySidebar from "../components/navigation/ActivitySidebar";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Fab } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

const Evaluation = ({ darkMode, setDarkMode }: EvaluationProps) => {
  const searchParams = useSearchParams();
  const view = searchParams.get("view");

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
      component: <SyntheseEvaluation />,
      width: "50%",
    },
    postit: {
      component: <Postit inline />,
      width: 700,
    },
    roleplay: {
      component: <FourZones />, // Ajout du composant FourZones
      width: "55%", // Largeur légèrement plus grande pour FourZones
    },
  };

  const router = useRouter();
  const [showRightPanel, setShowRightPanel] = useState(true);

  const { user, isAuthenticated } = useAuth0();
  const { selectedCall, calls, selectCall } = useCallData();
  const { setAudioSrc } = useAudio();
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

  // Récupérer le postit sélectionné pour le jeu de rôle
  const { selectedPostitForRolePlay } = useCallData();

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

  // Vérification des conditions de redirection
  useEffect(() => {
    if (view === "postit" && !selectedPostit) {
      router.push("/evaluation?view=synthese");
    } else if (view === "roleplay" && !selectedPostitForRolePlay) {
      // Redirection si on essaie d'accéder à la vue jeu de rôle sans postit sélectionné
      router.push("/evaluation?view=synthese");
    }
  }, [view, selectedPostit, selectedPostitForRolePlay, router]);

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
            {/* Transcript principal - masqué si on est en mode jeu de rôle plein écran */}
            <Box
              sx={{
                flex: view === "roleplay-fullscreen" ? 0 : 1,
                display: view === "roleplay-fullscreen" ? "none" : "block",
              }}
            >
              <EvaluationTranscript />
            </Box>

            {/* Zone contextuelle */}
            {showRightPanel &&
              ((view && contextPanels[view]) || selectedPostit) && (
                <Box
                  sx={{
                    width:
                      view === "roleplay-fullscreen"
                        ? "100%"
                        : contextPanels[view!]?.width ?? 400,
                    borderLeft:
                      view === "roleplay-fullscreen"
                        ? "none"
                        : "1px solid #ddd",
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
