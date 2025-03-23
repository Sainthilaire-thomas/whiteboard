"use client";

import { useState, useEffect } from "react";
import {
  Box,
  IconButton,
  Tooltip,
  Popover,
  Typography,
  Button,
  Chip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import BusinessIcon from "@mui/icons-material/Business";
import CallIcon from "@mui/icons-material/Call";
import PersonIcon from "@mui/icons-material/Person";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import { useCallData } from "@/context/CallDataContext";
import { useConseiller } from "@/context/ConseillerContext";
import { supabaseClient } from "@/lib/supabaseClient";

const ActivityIndicator = () => {
  const router = useRouter();
  const { selectedEntreprise } = useAppContext();
  const { selectedCall, idCallActivite } = useCallData();
  const { selectedConseiller, conseillers } = useConseiller();

  const [currentPhase, setCurrentPhase] = useState<string | null>(null);

  const conseiller = selectedConseiller
    ? conseillers.find((c) => c.idconseiller === selectedConseiller.id)
    : null;

  // Liste des phases
  const phaseOrder = ["evaluation", "coaching", "suivi"];

  // Récupérer la phase actuelle
  useEffect(() => {
    if (!idCallActivite) {
      setCurrentPhase(null); // ✅ Réinitialise la phase si aucune activité n'est trouvée
      return;
    }

    const fetchCurrentPhase = async () => {
      const { data, error } = await supabaseClient
        .from("activitesconseillers")
        .select("nature")
        .eq("idactivite", idCallActivite)
        .single();

      if (error) {
        console.error("❌ Erreur récupération de la phase :", error);
        setCurrentPhase(null); // ✅ Évite les valeurs non définies
        return;
      }

      setCurrentPhase(data?.nature || null);
    };

    fetchCurrentPhase();
  }, [idCallActivite]);

  // Changer la phase (avancer ou reculer)
  const changePhase = async (direction: "next" | "prev") => {
    if (
      !idCallActivite ||
      !currentPhase ||
      !phaseOrder.includes(currentPhase)
    ) {
      return; // ✅ Évite les erreurs
    }

    const currentIndex = phaseOrder.indexOf(currentPhase);
    if (currentIndex === -1) return;

    let newPhase: string | null = null;

    if (direction === "next" && currentIndex < phaseOrder.length - 1) {
      newPhase = phaseOrder[currentIndex + 1];
    } else if (direction === "prev" && currentIndex > 0) {
      newPhase = phaseOrder[currentIndex - 1];
    }

    if (newPhase) {
      const { error } = await supabaseClient
        .from("activitesconseillers")
        .update({ nature: newPhase })
        .eq("idactivite", idCallActivite);

      if (error) {
        console.error("❌ Erreur mise à jour phase :", error);
      } else {
        setCurrentPhase(newPhase);
      }
    }
  };

  // Icône de validation selon l'état de l'élément
  const getIconState = (selectedValue: any) => {
    if (selectedValue) return <CheckCircleIcon color="success" />;
    if (selectedValue === null) return <ErrorIcon color="error" />;
    return <WarningAmberIcon color="warning" />;
  };

  // Liste des phases avec couleurs
  const phaseLabels: Record<
    string,
    { label: string; color: "primary" | "secondary" | "warning" }
  > = {
    evaluation: { label: "Évaluation", color: "primary" },
    coaching: { label: "Coaching", color: "secondary" },
    suivi: { label: "Suivi", color: "warning" },
  };

  // État du popover
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<
    "entreprise" | "appel" | "conseiller" | "activité" | null
  >(null);

  const handleOpen = (
    event: React.MouseEvent<HTMLElement>,
    item: "entreprise" | "appel" | "conseiller" | "activité"
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 1,
        bgcolor: "background.paper",
        boxShadow: 3,
        borderRadius: "8px",
      }}
    >
      {/* Icônes compactes avec état et tooltip dynamique */}
      <Tooltip
        title={
          selectedEntreprise
            ? `Entreprise : ${selectedEntreprise}`
            : "Aucune entreprise sélectionnée"
        }
      >
        <IconButton onClick={(e) => handleOpen(e, "entreprise")}>
          <BusinessIcon />
          {getIconState(selectedEntreprise)}
        </IconButton>
      </Tooltip>

      <Tooltip
        title={
          selectedCall
            ? `Appel : ${selectedCall.filename}`
            : "Aucun appel sélectionné"
        }
      >
        <IconButton onClick={(e) => handleOpen(e, "appel")}>
          <CallIcon />
          {getIconState(selectedCall)}
        </IconButton>
      </Tooltip>

      <Tooltip
        title={
          conseiller
            ? `Conseiller : ${conseiller.nom} ${conseiller.prenom}`
            : "Aucun conseiller sélectionné"
        }
      >
        <IconButton onClick={(e) => handleOpen(e, "conseiller")}>
          <PersonIcon />
          {getIconState(selectedConseiller)}
        </IconButton>
      </Tooltip>

      <Tooltip
        title={
          idCallActivite
            ? `Activité ID : ${idCallActivite}`
            : "Aucune activité créée"
        }
      >
        <IconButton onClick={(e) => handleOpen(e, "activité")}>
          <AssignmentIcon />
          {getIconState(idCallActivite)}
        </IconButton>
      </Tooltip>

      {currentPhase && phaseLabels[currentPhase] ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            p: 1,
            bgcolor: "rgba(84, 83, 83, 0.9)",
            borderRadius: "8px",
            boxShadow: 2,
          }}
        >
          <Chip
            label={phaseLabels[currentPhase].label} // ✅ Vérifié avant d'être affiché
            color={phaseLabels[currentPhase].color}
            sx={{
              fontSize: "1rem",
              fontWeight: "bold",
              px: 2,
              py: 1,
              textTransform: "uppercase",
            }}
          />
          <IconButton
            onClick={() => changePhase("prev")}
            disabled={phaseOrder.indexOf(currentPhase) === 0}
          >
            <ArrowBackIcon />
          </IconButton>
          <IconButton
            onClick={() => changePhase("next")}
            disabled={
              phaseOrder.indexOf(currentPhase) === phaseOrder.length - 1
            }
          >
            <ArrowForwardIcon />
          </IconButton>
        </Box>
      ) : (
        <Typography variant="body2" color="textSecondary">
          Aucune phase en cours
        </Typography>
      )}

      {/* Popover dynamique */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <Box sx={{ p: 2, minWidth: 250 }}>
          {selectedItem === "entreprise" && (
            <>
              <Typography>
                {selectedEntreprise
                  ? `Entreprise sélectionnée : ${selectedEntreprise}`
                  : "Aucune entreprise sélectionnée"}
              </Typography>
              <Button onClick={() => router.push("/")}>Modifier</Button>
            </>
          )}
          {selectedItem === "appel" && (
            <>
              <Typography>
                {selectedCall
                  ? `Appel : ${selectedCall.filename}`
                  : "Aucun appel sélectionné"}
              </Typography>
              <Button onClick={() => router.push("/evaluation")}>
                Modifier
              </Button>
            </>
          )}
          {selectedItem === "conseiller" && (
            <>
              <Typography>
                {conseiller
                  ? `Conseiller : ${conseiller.nom} ${conseiller.prenom}`
                  : "Aucun conseiller sélectionné"}
              </Typography>
              <Button onClick={() => router.push("/evaluation")}>
                Modifier
              </Button>
            </>
          )}
        </Box>
      </Popover>
    </Box>
  );
};

export default ActivityIndicator;
