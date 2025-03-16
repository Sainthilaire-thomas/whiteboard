// 📜 app/evaluation/Evaluation.tsx
"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { Box, Drawer, Tabs, Tab, IconButton, Modal } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useAuth0 } from "@auth0/auth0-react";
import { useAppContext } from "@/context/AppContext";
import { useCallData } from "@/context/CallDataContext";
import EntrepriseSelection from "../components/common/EntrepriseSelection";
import CallSelection from "../components/common/CallSelection";
import NewCallUploader from "../components/common/NewCallUploader";
import EvaluationPostits from "./components/EvaluationPostits";
import EvaluationTranscript from "./components/EvaluationTranscript";
import EvaluationDrawer from "./components/EvaluationDrawer";
import { EvaluationProps } from "@/types/types"; // ✅ Import correct

const Evaluation = ({ darkMode, setDarkMode }: EvaluationProps) => {
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
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      <Box
        sx={{ display: "flex", justifyContent: "space-between", px: 2, py: 1 }}
      >
        <IconButton onClick={() => setIsLeftDrawerOpen(!isLeftDrawerOpen)}>
          <MenuIcon />
        </IconButton>

        <IconButton onClick={() => setIsRightDrawerOpen(!isRightDrawerOpen)}>
          <MenuIcon />
        </IconButton>
      </Box>

      <Drawer
        anchor="left"
        open={isLeftDrawerOpen}
        onClose={() => setIsLeftDrawerOpen(false)}
        PaperProps={{ sx: { width: "65%", paddingTop: "96px" } }}
      >
        <EntrepriseSelection
          entreprises={entreprises} // ✅ On passe bien un tableau d'entreprises
          selectedEntreprise={selectedEntreprise} // ✅ On passe l'entreprise sélectionnée
          setSelectedEntreprise={setSelectedEntreprise} // ✅ Permet de modifier la sélection
        />
        <CallSelection
          calls={calls}
          selectCall={selectCall}
          selectedEntreprise={selectedEntreprise}
        />
        <NewCallUploader selectedEntreprise={selectedEntreprise} />
      </Drawer>

      <Box sx={{ display: "flex", flexGrow: 1, pt: 0 }}>
        <EvaluationPostits />
        <EvaluationTranscript />
      </Box>

      <EvaluationDrawer
        isRightDrawerOpen={isRightDrawerOpen}
        setIsRightDrawerOpen={setIsRightDrawerOpen}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

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
  );
};

export default memo(Evaluation);
