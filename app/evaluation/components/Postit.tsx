"use client";

import { useState, useEffect, memo, useMemo, useRef } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import {
  Box,
  Paper,
  TextField,
  Typography,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tabs,
  Tab,
  Modal,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Fade,
  Slide,
  Chip,
  Alert,
  Divider,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { styled } from "@mui/material/styles";
import { alpha, useTheme } from "@mui/material/styles";
import { useCallData } from "@/context/CallDataContext";
import { useAppContext } from "@/context/AppContext";
import { useFilteredDomains } from "@/hooks/AppContext/useFilteredDomains";
import GridContainerSujetsEval from "./GridContainerSujetsEval";
import GridContainerPratiquesEval from "./GridContainerPratiquesEval";
import { columnConfigSujets, columnConfigPratiques } from "@/config/gridConfig";
import { Item } from "@/types/types";
import { useRouter } from "next/navigation";
import { Postit as PostitTypes } from "@/types/types";

interface PostitProps {
  inline?: boolean;
}

const Postit: React.FC<PostitProps> = ({ inline = false }) => {
  // Hooks de contexte
  const {
    deletePostit,
    updatePostit,
    updatePostitToSujetMap,
    postitToSujetMap,
    postitToPratiqueMap,
    idCallActivite,
  } = useCallData();

  const {
    selectedEntreprise,
    selectedDomain,
    selectDomain,
    categoriesSujets,
    sujetsData,
    categoriesPratiques,
    pratiques,
    selectedPostit,
    setSelectedPostit,
    fetchSujetsForActivite,
  } = useAppContext();

  const router = useRouter();
  const theme = useTheme();
  const { filteredDomains } = useFilteredDomains(selectedEntreprise);
  const { syncSujetsForActiviteFromMap, syncPratiquesForActiviteFromMap } =
    useAppContext();

  // États locaux - Tous définis avant tout code conditionnel
  const [showTabs, setShowTabs] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [readyToDisplayGrids, setReadyToDisplayGrids] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Refs
  const pratiqueRef = useRef<HTMLDivElement | null>(null);

  // IMPORTANT: Les useMemo doivent être déclarés avant tout retour anticipé
  const sujetsDeLActivite = useMemo(() => {
    if (!postitToSujetMap || Object.keys(postitToSujetMap).length === 0) {
      return [];
    }
    return [
      ...new Set(
        Object.values(postitToSujetMap).filter(
          (id): id is number => id !== null
        )
      ),
    ];
  }, [postitToSujetMap]);

  const pratiquesDeLActivite = useMemo(() => {
    if (!postitToPratiqueMap || Object.keys(postitToPratiqueMap).length === 0) {
      return [];
    }
    return [
      ...new Set(
        Object.values(postitToPratiqueMap).filter((p): p is string => !!p)
      ),
    ];
  }, [postitToPratiqueMap]);

  // Styles constants - pas de dépendance aux hooks
  const stepBoxStyle = {
    bgcolor: alpha(
      theme.palette.grey[100],
      theme.palette.mode === "dark" ? 0.05 : 1
    ),
    borderRadius: 2,
    border: "1px solid",
    borderColor: theme.palette.divider,
    boxShadow: 1,
    p: 2,
    mb: 2,
  };

  // useEffects - doivent être déclarés avant tout retour anticipé
  useEffect(() => {
    const timeout = setTimeout(() => setReadyToDisplayGrids(true), 0);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    // Détecter si nous avons un sujet sélectionné
    if (selectedPostit && selectedPostit.idsujet) {
      console.log("Sujet détecté dans useEffect:", selectedPostit.sujet);
    }
  }, [selectedPostit]);

  useEffect(() => {
    if (selectedPostit) {
      const isFullyAssigned =
        selectedPostit.idsujet &&
        selectedPostit.pratique &&
        selectedPostit.pratique !== "Non Assigné";

      setIsCompleted(isFullyAssigned);

      // Déterminer l'étape initiale
      let initialStep = 0;
      if (
        selectedPostit.pratique &&
        selectedPostit.pratique !== "Non Assigné"
      ) {
        initialStep = 2;
      } else if (selectedPostit.idsujet) {
        initialStep = 1;
      }
      setActiveStep(initialStep);
    }
  }, [selectedPostit]);

  // Retour anticipé SEULEMENT après avoir déclaré tous les hooks
  if (!selectedPostit) return null;

  // Gestionnaire d'événements - définis après tous les hooks et le retour anticipé
  const handleNext = () => {
    if (activeStep === 1) {
      // Vérification améliorée pour détecter si un sujet est réellement sélectionné
      if (
        !selectedPostit.idsujet &&
        (!selectedPostit.sujet || selectedPostit.sujet === "Non Assigné")
      ) {
        alert("Veuillez sélectionner un sujet avant de continuer.");
        return;
      }
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSujetClick = (item: Item) => {
    if (!selectedPostit) {
      alert("⚠️ Aucun post-it sélectionné !");
      return;
    }

    console.log("Sujet cliqué:", item.nomsujet, "avec ID:", item.idsujet);
    const isCurrentlySelected = selectedPostit.idsujet === item.idsujet;

    // 🔄 Mise à jour locale du post-it
    const updatedPostit = isCurrentlySelected
      ? {
          ...selectedPostit,
          sujet: "Non Assigné",
          idsujet: null,
          iddomaine: null,
          pratique: "Non Assigné", // Réinitialiser la pratique si on désélectionne le sujet
        }
      : {
          ...selectedPostit,
          sujet: item.nomsujet,
          idsujet: item.idsujet,
          iddomaine: item.iddomaine,
        };

    console.log("Post-it mis à jour:", updatedPostit);
    setSelectedPostit(updatedPostit);

    // 🔁 Met à jour le mapping central
    updatePostitToSujetMap(updatedPostit.id, updatedPostit.idsujet ?? null);

    // 💾 Mise à jour du post-it dans Supabase
    updatePostit(updatedPostit.id, {
      sujet: updatedPostit.sujet,
      idsujet: updatedPostit.idsujet,
      iddomaine: updatedPostit.iddomaine,
      pratique: updatedPostit.pratique,
    }).then(() => {
      console.log("Sujet sauvegardé avec succès dans Supabase");
    });

    // Si on a sélectionné un sujet, on peut passer à l'étape suivante automatiquement après un court délai
    if (updatedPostit.idsujet) {
      setTimeout(() => {
        setActiveStep(2); // Aller directement à l'étape 2 (pratique)
      }, 500);
    }
  };

  const handlePratiqueClick = (practice: any) => {
    const isCurrentlySelected =
      selectedPostit.pratique === practice.nompratique;
    console.log("Pratique sélectionnée:", practice.nompratique);

    // Mise à jour du postit avec la pratique sélectionnée ou réinitialisation
    const updatedPostit = {
      ...selectedPostit,
      pratique: isCurrentlySelected ? "Non Assigné" : practice.nompratique,
    } as PostitTypes;

    setSelectedPostit(updatedPostit);

    // Mise à jour dans Supabase
    updatePostit(selectedPostit.id, {
      pratique: updatedPostit.pratique,
    });
  };

  const handleSave = async () => {
    console.log("💾 Sauvegarde du Post-it:", selectedPostit);

    await updatePostit(selectedPostit.id, {
      text: selectedPostit.text,
      sujet: selectedPostit.sujet,
      idsujet: selectedPostit.idsujet,
      iddomaine: selectedPostit.iddomaine,
      pratique: selectedPostit.pratique,
    });

    // Synchroniser les sujets et pratiques
    if (idCallActivite) {
      await syncSujetsForActiviteFromMap(postitToSujetMap, idCallActivite);
      await syncPratiquesForActiviteFromMap(
        postitToPratiqueMap,
        idCallActivite,
        pratiques
      );
    }

    console.log("✅ Sauvegarde réussie !");
    setIsCompleted(true);

    // Animation de confirmation
    setTimeout(() => {
      setSelectedPostit(null);
    }, 1500);
  };

  const handleDelete = async () => {
    if (!selectedPostit.id) return;

    try {
      const { data: otherPostits } = await supabaseClient
        .from("postit")
        .select("id")
        .eq("idsujet", selectedPostit.idsujet)
        .neq("id", selectedPostit.id);

      if (!otherPostits || otherPostits.length === 0) {
        await supabaseClient
          .from("activitesconseillers_sujets")
          .delete()
          .match({
            idactivite: idCallActivite,
            idsujet: selectedPostit.idsujet,
          });

        console.log("✅ Sujet supprimé des sujets de l'activité !");
      }

      await deletePostit(selectedPostit.id);
      console.log("✅ Post-it supprimé !");
      setSelectedPostit(null);
    } catch (error) {
      console.error("❌ Erreur lors de la suppression:", error);
    }
  };

  const handleClosePostit = () => {
    if (idCallActivite) {
      syncSujetsForActiviteFromMap(postitToSujetMap, idCallActivite);
      syncPratiquesForActiviteFromMap(
        postitToPratiqueMap,
        idCallActivite,
        pratiques
      );
    }
    setSelectedPostit(null);
    router.push("/evaluation?view=synthese");
  };

  // Status badge stylisé pour montrer l'état d'affectation du postit
  const StatusBadge = () => {
    if (isCompleted) {
      return (
        <Chip
          icon={<CheckCircleIcon />}
          label="Complet"
          color="success"
          size="small"
          sx={{ ml: 2 }}
        />
      );
    } else if (selectedPostit.idsujet) {
      return (
        <Chip
          label="Sujet affecté"
          color="primary"
          variant="outlined"
          size="small"
          sx={{ ml: 2 }}
        />
      );
    }
    return (
      <Chip
        label="Non affecté"
        color="default"
        variant="outlined"
        size="small"
        sx={{ ml: 2 }}
      />
    );
  };

  const content = (
    <>
      <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
        <Typography variant="h6" component="div">
          📝 Évaluation du passage
        </Typography>
        <StatusBadge />
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
              <Box sx={stepBoxStyle}>
                <Typography variant="caption" color="text.secondary">
                  Passage sélectionné :
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 2,
                    fontStyle: "italic",
                    fontWeight: 400,
                    color: "text.primary",
                    backgroundColor: alpha(theme.palette.warning.light, 0.1),
                    p: 1,
                    borderRadius: 1,
                  }}
                >
                  « {selectedPostit.word} »
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  Commentaire à chaud :
                </Typography>
                <TextField
                  variant="standard"
                  fullWidth
                  value={selectedPostit.text}
                  onChange={(e) =>
                    setSelectedPostit({
                      ...selectedPostit,
                      text: e.target.value,
                    })
                  }
                  placeholder="Note rapide à chaud..."
                  sx={{ mb: 2 }}
                />

                <Typography variant="caption" color="text.secondary">
                  Domaine d'analyse :
                </Typography>
                {selectedDomain && !showTabs ? (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mt: 0.5,
                    }}
                  >
                    <Typography variant="body2" fontWeight={500}>
                      {
                        filteredDomains.find(
                          (d) => d.iddomaine === Number(selectedDomain)
                        )?.nomdomaine
                      }
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setShowTabs(true)}
                    >
                      Changer
                    </Button>
                  </Box>
                ) : (
                  <Box sx={styles.domainSelection}>
                    <Tabs
                      value={selectedDomain ? String(selectedDomain) : ""}
                      onChange={(event, newValue) => {
                        selectDomain(String(newValue));
                        setShowTabs(false);
                      }}
                      variant="scrollable"
                      scrollButtons="auto"
                    >
                      {filteredDomains.map((domain) => (
                        <Tab
                          key={domain.iddomaine}
                          label={domain.nomdomaine}
                          value={String(domain.iddomaine)}
                        />
                      ))}
                    </Tabs>
                  </Box>
                )}

                <Box
                  sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}
                >
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    Continuer vers l'affectation
                  </Button>
                </Box>
              </Box>
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
              <Box sx={stepBoxStyle}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Sélectionnez le critère qualité en défaut dans la grille
                  ci-dessous.
                </Typography>

                <GridContainerSujetsEval
                  categories={categoriesSujets}
                  items={sujetsData}
                  columnConfig={columnConfigSujets}
                  handleSujetClick={handleSujetClick}
                  sujetsDeLActivite={sujetsDeLActivite}
                />

                {selectedPostit.idsujet && (
                  <Fade in timeout={500}>
                    <Typography
                      variant="body2"
                      color="primary.main"
                      sx={{ mt: 2, fontWeight: 500 }}
                    >
                      Vous avez sélectionné:{" "}
                      <strong>{selectedPostit.sujet}</strong>
                    </Typography>
                  </Fade>
                )}

                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Button onClick={handleBack} sx={{ mt: 1, mr: 1 }}>
                    Retour
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{ mt: 1, mr: 1 }}
                    disabled={!selectedPostit.idsujet}
                  >
                    Continuer
                  </Button>
                </Box>
              </Box>
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
              <Box sx={stepBoxStyle}>
                <Typography
                  variant="body2"
                  color="primary.main"
                  sx={{ mb: 2, fontWeight: 500 }}
                >
                  Vous avez sélectionné le critère{" "}
                  <strong>{selectedPostit.sujet}</strong>.
                  <br />
                  Quelle pratique le conseiller peut-il travailler pour
                  s'améliorer ?
                </Typography>

                <GridContainerPratiquesEval
                  categories={categoriesPratiques}
                  items={pratiques}
                  columnConfig={columnConfigPratiques}
                  onPratiqueClick={handlePratiqueClick}
                  pratiquesDeLActivite={pratiquesDeLActivite}
                />

                {selectedPostit.pratique &&
                  selectedPostit.pratique !== "Non Assigné" && (
                    <Fade in timeout={500}>
                      <Typography
                        variant="body2"
                        color="success.main"
                        sx={{ mt: 2, fontWeight: 500 }}
                      >
                        ✅ Pratique sélectionnée:{" "}
                        <strong>{selectedPostit.pratique}</strong>
                      </Typography>
                    </Fade>
                  )}

                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Button onClick={handleBack} sx={{ mt: 1, mr: 1 }}>
                    Retour
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    sx={{ mt: 1, mr: 1 }}
                    color="success"
                    disabled={
                      !selectedPostit.pratique ||
                      selectedPostit.pratique === "Non Assigné"
                    }
                  >
                    Finaliser et enregistrer
                  </Button>
                </Box>
              </Box>
            </StepContent>
          </Step>
        </Stepper>

        {/* Résumé après finalisation */}
        {isCompleted && activeStep === 2 && (
          <Fade in timeout={500}>
            <Box
              sx={{
                ...stepBoxStyle,
                mt: 3,
                backgroundColor: alpha(theme.palette.success.light, 0.1),
              }}
            >
              <Typography variant="subtitle2" color="success.main" gutterBottom>
                ✅ Affectation terminée!
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" gutterBottom>
                <strong>Passage:</strong> « {selectedPostit.word} »
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Critère qualité:</strong> {selectedPostit.sujet}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Pratique à améliorer:</strong> {selectedPostit.pratique}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Votre commentaire:</strong>{" "}
                {selectedPostit.text || "Aucun commentaire"}
              </Typography>
              <Button
                variant="contained"
                color="success"
                fullWidth
                sx={{ mt: 2 }}
                onClick={handleClosePostit}
              >
                Terminer et fermer
              </Button>
            </Box>
          </Fade>
        )}
      </DialogContent>

      {/* 🔘 Boutons actions pour tout le formulaire */}
      <Box
        sx={{
          ...stepBoxStyle,
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          mt: 2,
        }}
      >
        <Button
          onClick={() => setSelectedPostit(null)}
          variant="outlined"
          color="inherit"
        >
          Fermer
        </Button>
        <Button onClick={handleDelete} variant="outlined" color="error">
          Supprimer
        </Button>
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
};

// 📌 **Styles**
const styles = {
  modalBackground: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalWrapper: {
    width: "100vw",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "80%",
    maxHeight: "90vh",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
    overflow: "auto",
  },
  domainSelection: {
    position: "relative",
    width: "100%",
    overflowX: "auto",
    backgroundColor: "rgba(138, 137, 137, 0.7)",
    padding: "10px",
    borderRadius: "8px",
  },
  passageBox: {
    p: 2,
    mb: 2,
  },
};

export default memo(Postit);
