"use client";

import { useState } from "react";
import {
  Box,
  IconButton,
  Tooltip,
  Popover,
  Typography,
  Button,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import BusinessIcon from "@mui/icons-material/Business";
import CallIcon from "@mui/icons-material/Call";
import PersonIcon from "@mui/icons-material/Person";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import { useCallData } from "@/context/CallDataContext";
import { useConseiller } from "@/context/ConseillerContext";
import { useCallActivity } from "@/hooks/CallDataContext/useCallActivity";

const ActivityIndicator = () => {
  const router = useRouter();
  const { selectedEntreprise } = useAppContext();
  const { selectedCall } = useCallData();
  const { selectedConseiller, conseillers } = useConseiller();
  const { idCallActivite } = useCallActivity();

  const conseiller = selectedConseiller
    ? conseillers.find((c) => c.idconseiller === selectedConseiller.id)
    : null;

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

  // Fonction pour définir l’icône correcte et sa couleur selon l’état
  const getIconState = (selectedValue: any) => {
    if (selectedValue) return <CheckCircleIcon color="success" />;
    if (selectedValue === null) return <ErrorIcon color="error" />;
    return <WarningAmberIcon color="warning" />;
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
        <Box sx={{ p: 2, minWidth: 200 }}>
          {selectedItem === "entreprise" && (
            <Typography>
              {selectedEntreprise
                ? `Entreprise sélectionnée : ${selectedEntreprise}`
                : "Aucune entreprise sélectionnée"}
              <Button onClick={() => router.push("/")}>Modifier</Button>
            </Typography>
          )}
          {selectedItem === "appel" && (
            <Typography>
              {selectedCall
                ? `Appel : ${selectedCall.filename}`
                : "Aucun appel sélectionné"}
              <Button onClick={() => router.push("/evaluation")}>
                Modifier
              </Button>
            </Typography>
          )}
          {selectedItem === "conseiller" && (
            <Typography>
              {conseiller
                ? `Conseiller : ${conseiller.nom} ${conseiller.prenom}`
                : "Aucun conseiller sélectionné"}
              <Button onClick={() => router.push("/evaluation")}>
                Modifier
              </Button>
            </Typography>
          )}
          {selectedItem === "activité" && (
            <Typography>
              {idCallActivite
                ? `Activité ID : ${idCallActivite}`
                : "Aucune activité créée"}
            </Typography>
          )}
        </Box>
      </Popover>
    </Box>
  );
};

export default ActivityIndicator;
