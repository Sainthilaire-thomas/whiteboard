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
import SelectionEntrepriseEtAppel from "../components/common/SelectionEntrepriseetAppel";
import { EvaluationProps } from "@/types/types"; // ✅ Import correct
import ActivitySidebar from "../components/navigation/ActivitySidebar";
import { useSearchParams } from "next/navigation";

const Evaluation = ({ darkMode, setDarkMode }: EvaluationProps) => {
  const searchParams = useSearchParams();
  const view = searchParams.get("view");
  const { user, isAuthenticated } = useAuth0();
  const { selectedCall, setAudioSrc, calls, selectCall } = useCallData();
  const {
    resetSelectedState,
    entreprises,
    isLoadingEntreprises,
    errorEntreprises,
    selectedEntreprise,
    setSelectedEntreprise,
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

  return (
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
        {/* Header droit avec bouton pour ouvrir Synthèse */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", px: 2, py: 1 }}>
          <IconButton onClick={() => setIsRightDrawerOpen(!isRightDrawerOpen)}>
            <MenuIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: "flex", flexGrow: 1 }}>
          {/* Transcript principal */}
          <Box sx={{ flex: 1 }}>
            <EvaluationTranscript />
          </Box>

          {/* Zone contextuelle */}
          {view && (
            <Box
              sx={{
                width: 400,
                borderLeft: "1px solid #ddd",
                bgcolor: "background.default",
                px: 2,
                py: 2,
                overflowY: "auto",
              }}
            >
              {view === "selection" && <SelectionEntrepriseEtAppel />}
              {view === "synthese" && <SyntheseEvaluation />}
            </Box>
          )}
        </Box>

        <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "80%",
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              overflow: "auto",
              maxHeight: "90vh",
            }}
          >
            {/* Historique de l'évaluation */}
          </Box>
        </Modal>
      </Box>
    </Box>
  );
};

export default memo(Evaluation);
