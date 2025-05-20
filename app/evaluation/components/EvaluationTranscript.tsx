// 📜 components/evaluation/EvaluationTranscript.tsx
"use client";

import { useState } from "react";
import {
  Box,
  FormControlLabel,
  Switch,
  IconButton,
  Tooltip,
  Paper,
  Divider,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import TextFormatIcon from "@mui/icons-material/TextFormat";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import DomainIcon from "@mui/icons-material/Domain"; // Icône pour le domaine
import { useCallData } from "@/context/CallDataContext";
import { useAppContext } from "@/context/AppContext";
import { useFilteredDomains } from "@/hooks/AppContext/useFilteredDomains";
import { useAudio } from "@/context/AudioContext";
import Transcript from "./Transcript";
import TranscriptAlternative from "./TranscriptAlternative";
import AddPostitButton from "./AddPostitButton";

interface EvaluationTranscriptProps {
  showRightPanel: boolean;
  toggleRightPanel: () => void;
  hasRightPanel: boolean;
}

export default function EvaluationTranscript({
  showRightPanel,
  toggleRightPanel,
  hasRightPanel,
}: EvaluationTranscriptProps) {
  const { selectedCall, currentWord, fetchTranscription } = useCallData();
  const { audioRef } = useAudio();
  const { selectedEntreprise, selectedDomain, selectDomain } = useAppContext();

  // Utiliser useFilteredDomains pour obtenir les domaines filtrés
  const { filteredDomains } = useFilteredDomains(selectedEntreprise);

  const [viewMode, setViewMode] = useState<"word" | "paragraph">("word");

  // Fonction pour rafraîchir la transcription
  const handleRefreshTranscription = () => {
    if (selectedCall) {
      fetchTranscription(selectedCall.callid);
    }
  };

  // Fonction pour changer le mode d'affichage
  const toggleViewMode = () => {
    setViewMode(viewMode === "word" ? "paragraph" : "word");
  };

  // Gestion du changement de domaine
  const handleDomainChange = (event) => {
    selectDomain(event.target.value);
  };

  // Vérifier si nous avons des domaines à afficher
  const hasDomains = filteredDomains && filteredDomains.length > 0;

  // Vérifier si le domaine sélectionné existe dans les domaines filtrés
  const domainExists =
    selectedDomain &&
    filteredDomains.some(
      (domain) => String(domain.iddomaine) === String(selectedDomain)
    );

  // Valeur effective pour la sélection (première valeur si le domaine sélectionné n'existe pas)
  const effectiveSelectedDomain = domainExists
    ? selectedDomain
    : filteredDomains.length > 0
    ? String(filteredDomains[0].iddomaine)
    : "";

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        pt: 1,
        px: 4,
        overflowY: "auto",
        height: "100%",
      }}
    >
      {/* Bandeau d'outils */}
      <Paper
        elevation={1}
        sx={{
          mb: 2,
          p: 1,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "stretch", md: "center" },
          gap: { xs: 1, md: 0 },
        }}
      >
        {/* Titre */}
        <Typography variant="h6" sx={{ ml: 1, mr: 2 }}>
          Transcription
        </Typography>

        {/* Groupe sélection de domaine */}
        {hasDomains && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mx: { xs: 0, md: 2 },
              flexGrow: 1,
            }}
          >
            <DomainIcon color="primary" sx={{ mr: 1 }} />
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="domain-select-label">
                Domaine d'analyse
              </InputLabel>
              <Select
                labelId="domain-select-label"
                id="domain-select"
                value={effectiveSelectedDomain}
                onChange={handleDomainChange}
                label="Domaine d'analyse"
              >
                {filteredDomains.map((domain) => (
                  <MenuItem
                    key={domain.iddomaine}
                    value={String(domain.iddomaine)}
                  >
                    {domain.nomdomaine}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}

        <Divider
          orientation="vertical"
          flexItem
          sx={{ display: { xs: "none", md: "block" } }}
        />

        {/* Groupe d'outils */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: { xs: "space-between", md: "flex-end" },
            flexGrow: { xs: 1, md: 0 },
          }}
        >
          {/* Bouton AddPostit */}
          {currentWord && selectedCall && (
            <Tooltip title="Ajouter un post-it">
              <Box>
                <AddPostitButton
                  timestamp={Math.floor(audioRef.current?.currentTime || 0)}
                />
              </Box>
            </Tooltip>
          )}

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          {/* Basculement entre les modes d'affichage avec des icônes */}
          <Tooltip
            title={
              viewMode === "word"
                ? "Passer à la vue par paragraphe"
                : "Passer à la vue par mot"
            }
          >
            <IconButton color="primary" onClick={toggleViewMode} size="medium">
              {viewMode === "word" ? (
                <FormatAlignLeftIcon />
              ) : (
                <TextFormatIcon />
              )}
            </IconButton>
          </Tooltip>

          <Typography variant="body2" sx={{ mx: 1 }}>
            {viewMode === "word" ? "Vue par mot" : "Vue par paragraphe"}
          </Typography>

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          {/* Bouton de rafraîchissement */}
          <Tooltip title="Rafraîchir la transcription">
            <IconButton
              color="primary"
              onClick={handleRefreshTranscription}
              size="medium"
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          {/* Toggle pour le panneau droit */}
          {hasRightPanel && (
            <>
              <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

              <Tooltip
                title={
                  showRightPanel ? "Masquer le panneau" : "Afficher le panneau"
                }
              >
                <IconButton
                  color="primary"
                  onClick={toggleRightPanel}
                  size="medium"
                >
                  {showRightPanel ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      </Paper>

      {/* Affichage conditionnel en fonction du mode sélectionné */}
      {selectedCall &&
        (viewMode === "word" ? (
          <Transcript
            callId={selectedCall.callid}
            audioSrc={selectedCall.audiourl ?? ""}
          />
        ) : (
          <TranscriptAlternative
            callId={selectedCall.callid}
            audioSrc={selectedCall.audiourl ?? ""}
          />
        ))}
    </Box>
  );
}
