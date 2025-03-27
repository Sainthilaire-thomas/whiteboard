"use client";

import { memo } from "react";
import {
  Box,
  Typography,
  Button,
  DialogContent,
  DialogTitle,
  Modal,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useFilteredDomains } from "@/hooks/AppContext/useFilteredDomains";
import { useAppContext } from "@/context/AppContext";
import { columnConfigSujets, columnConfigPratiques } from "@/config/gridConfig";

// Hooks personnalisés pour le Postit
import {
  usePostit,
  useSujetSelection,
  usePratiqueSelection,
  usePostitActions,
  useStyles,
} from "@/hooks/Postit";

// Composants pour chaque étape du stepper
import { ContexteStep } from "./PostitSteps/ContexteStep";
import { SujetStep } from "./PostitSteps/SujetStep";
import { PratiqueStep } from "./PostitSteps/PratiqueStep";
import { SummaryPanel } from "./PostitSteps/SummaryPanel";
import { StatusBadge } from "./PostitSteps/StatusBadge";

// Types
interface PostitProps {
  inline?: boolean;
}

// Composant principal
const Postit: React.FC<PostitProps> = memo(({ inline = false }) => {
  // Utilisation des hooks personnalisés
  const {
    selectedPostit,
    showTabs,
    setShowTabs,
    isCompleted,
    activeStep,
    hasRealSubject,
    handleNext,
    handleBack,
  } = usePostit();

  const { selectedEntreprise } = useAppContext();
  const { filteredDomains } = useFilteredDomains(selectedEntreprise);
  const { theme, styles, stepBoxStyle } = useStyles();
  const { selectedDomain, selectDomain } = useAppContext();

  const { handleSujetClick, sujetsDeLActivite, categoriesSujets, sujetsData } =
    useSujetSelection();
  const {
    handlePratiqueClick,
    pratiquesDeLActivite,
    categoriesPratiques,
    pratiques,
  } = usePratiqueSelection();
  const { handleSave, handleDelete, handleClosePostit } = usePostitActions();

  // Retour anticipé si pas de postit sélectionné
  if (!selectedPostit) return null;

  // Setters communs
  const { setSelectedPostit } = useAppContext();

  // Contenu du modal/inline component
  const content = (
    <>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h6" component="div">
          📝 Évaluation du passage
        </Typography>
        <StatusBadge isCompleted={isCompleted} hasSubject={hasRealSubject} />
      </DialogTitle>

      {isCompleted && (
        <Alert severity="success" sx={{ mx: 3, mb: 2 }}>
          <Typography variant="body2">
            Ce passage a été affecté au critère{" "}
            <strong>{selectedPostit.sujet}</strong> avec la pratique{" "}
            <strong>{selectedPostit.pratique}</strong> à améliorer.
          </Typography>
        </Alert>
      )}

      <DialogContent sx={{ display: "flex", flexDirection: "column" }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {/* ÉTAPE 1: CONTEXTE */}
          <Step completed={activeStep > 0 ? true : undefined}>
            <StepLabel>
              <Typography variant="subtitle1">
                🟢 Contexte du passage
              </Typography>
            </StepLabel>
            <StepContent>
              <ContexteStep
                selectedPostit={selectedPostit}
                setSelectedPostit={setSelectedPostit}
                selectedDomain={selectedDomain}
                showTabs={showTabs}
                setShowTabs={setShowTabs}
                filteredDomains={filteredDomains}
                selectDomain={selectDomain}
                theme={theme}
                stepBoxStyle={stepBoxStyle}
                styles={styles}
                onNext={handleNext}
              />
            </StepContent>
          </Step>

          {/* ÉTAPE 2: SUJET */}
          <Step
            completed={
              activeStep > 1 && selectedPostit.idsujet ? true : undefined
            }
          >
            <StepLabel>
              <Typography variant="subtitle1">
                🧭 Quel critère qualité est en défaut ?
                {selectedPostit.idsujet && activeStep !== 1 && (
                  <Typography
                    component="span"
                    variant="body2"
                    color="primary.main"
                    sx={{ ml: 1 }}
                  >
                    ({selectedPostit.sujet})
                  </Typography>
                )}
              </Typography>
            </StepLabel>
            <StepContent>
              <SujetStep
                selectedPostit={selectedPostit}
                categoriesSujets={categoriesSujets}
                sujetsData={sujetsData}
                columnConfigSujets={columnConfigSujets}
                sujetsDeLActivite={sujetsDeLActivite}
                handleSujetClick={handleSujetClick}
                stepBoxStyle={stepBoxStyle}
                onBack={handleBack}
                onNext={handleNext}
              />
            </StepContent>
          </Step>

          {/* ÉTAPE 3: PRATIQUE */}
          <Step
            completed={
              activeStep === 2 &&
              selectedPostit.pratique &&
              selectedPostit.pratique !== "Non Assigné"
                ? true
                : undefined
            }
          >
            <StepLabel>
              <Typography variant="subtitle1">
                🛠️ Quelle pratique peut améliorer ce critère ?
                {selectedPostit.pratique &&
                  selectedPostit.pratique !== "Non Assigné" &&
                  activeStep !== 2 && (
                    <Typography
                      component="span"
                      variant="body2"
                      color="primary.main"
                      sx={{ ml: 1 }}
                    >
                      ({selectedPostit.pratique})
                    </Typography>
                  )}
              </Typography>
            </StepLabel>
            <StepContent>
              <PratiqueStep
                selectedPostit={selectedPostit}
                categoriesPratiques={categoriesPratiques}
                pratiques={pratiques}
                columnConfigPratiques={columnConfigPratiques}
                pratiquesDeLActivite={pratiquesDeLActivite}
                handlePratiqueClick={handlePratiqueClick}
                stepBoxStyle={stepBoxStyle}
                onBack={handleBack}
                onSave={handleSave}
              />
            </StepContent>
          </Step>
        </Stepper>

        {/* Résumé après finalisation */}
        {isCompleted && activeStep === 2 && (
          <SummaryPanel
            selectedPostit={selectedPostit}
            theme={theme}
            stepBoxStyle={stepBoxStyle}
            onClose={handleClosePostit}
          />
        )}
      </DialogContent>

      {/* Boutons d'action */}
      <Box
        sx={{
          ...stepBoxStyle,
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          mt: 2,
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Button
            onClick={() => setSelectedPostit(null)}
            variant="outlined"
            color="inherit"
            sx={{ mr: 1 }}
          >
            Fermer
          </Button>
          <Button onClick={handleDelete} variant="outlined" color="error">
            Supprimer
          </Button>
        </Box>

        {isCompleted && (
          <Button
            onClick={handleClosePostit}
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
          >
            Terminé
          </Button>
        )}
      </Box>
    </>
  );

  // Rendu final (inline ou modal)
  if (inline) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          p: 2,
          boxSizing: "border-box",
        }}
      >
        {content}
      </Box>
    );
  }

  return (
    <Modal
      open={!!selectedPostit}
      onClose={handleClosePostit}
      sx={styles.modalBackground}
    >
      <Box sx={styles.modalWrapper} onClick={handleClosePostit}>
        <Box sx={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
          {content}
        </Box>
      </Box>
    </Modal>
  );
});

// Pour faciliter le debugging
Postit.displayName = "Postit";

export default Postit;
