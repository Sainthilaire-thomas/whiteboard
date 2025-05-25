// 📜 components/evaluation/EvaluationTranscript.tsx
"use client";

import { Box } from "@mui/material";
import { useCallData } from "@/context/CallDataContext";
import Transcript from "./Transcript";
import TranscriptAlternative from "./TranscriptAlternative";

type DisplayMode = "normal" | "transcript-fullwidth" | "context-fullwidth";

interface EvaluationTranscriptProps {
  showRightPanel: boolean;
  toggleRightPanel: () => void;
  hasRightPanel: boolean;
  displayMode: DisplayMode;
  setTranscriptFullWidth: () => void;
  setContextFullWidth: () => void;
  // NOUVELLES PROPS
  viewMode: "word" | "paragraph";
  hideHeader?: boolean;
  // PROPS DE COLORATION - AJOUTÉES
  highlightTurnOne?: boolean;
  highlightSpeakers?: boolean;
  transcriptSelectionMode?: string;
}

export default function EvaluationTranscript({
  showRightPanel,
  toggleRightPanel,
  hasRightPanel,
  displayMode,
  setTranscriptFullWidth,
  setContextFullWidth,
  viewMode,
  hideHeader = false,
  // NOUVELLES PROPS DE COLORATION
  highlightTurnOne = false,
  highlightSpeakers = true,
  transcriptSelectionMode,
}: EvaluationTranscriptProps) {
  const { selectedCall } = useCallData();

  // Si hideHeader est true, on ne rend que le contenu
  if (hideHeader) {
    return (
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          pt: 1, // Réduction du padding pour gagner de l'espace
          px: 2, // Réduction du padding horizontal
          overflowY: "auto",
          height: "100%",
        }}
      >
        {/* Affichage conditionnel en fonction du mode sélectionné */}
        {selectedCall &&
          (viewMode === "word" ? (
            <Transcript
              callId={selectedCall.callid}
              hideHeader={true} // Masquer le titre et toggle
              highlightTurnOne={highlightTurnOne} // Contrôlé depuis l'en-tête
              transcriptSelectionMode={transcriptSelectionMode} // Mode externe
            />
          ) : (
            <TranscriptAlternative
              callId={selectedCall.callid}
              hideHeader={true} // Masquer le titre et toggle
              highlightSpeakers={highlightSpeakers} // Contrôlé depuis l'en-tête
            />
          ))}
      </Box>
    );
  }

  // Code original avec bandeau (pour rétrocompatibilité si hideHeader = false)
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
      {/* Affichage conditionnel en fonction du mode sélectionné */}
      {selectedCall &&
        (viewMode === "word" ? (
          <Transcript
            callId={selectedCall.callid}
            // Pas de hideHeader en mode rétrocompatibilité
            highlightTurnOne={highlightTurnOne}
            transcriptSelectionMode={transcriptSelectionMode}
          />
        ) : (
          <TranscriptAlternative
            callId={selectedCall.callid}
            // Pas de hideHeader en mode rétrocompatibilité
            highlightSpeakers={highlightSpeakers}
          />
        ))}
    </Box>
  );
}
