// Dans EvaluationTranscript.tsx, contrôlez spécifiquement les changements de largeur :

"use client";

import { Box } from "@mui/material";
import { useCallData } from "@/context/CallDataContext";
import { useRef, useEffect } from "react";
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
  viewMode: "word" | "paragraph";
  hideHeader?: boolean;
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
  highlightTurnOne = false,
  highlightSpeakers = true,
  transcriptSelectionMode,
}: EvaluationTranscriptProps) {
  const { selectedCall } = useCallData();

  // Ref pour le conteneur et sauvegarde de la position de scroll
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef<number>(0);
  const previousDisplayModeRef = useRef<DisplayMode>(displayMode);

  // Surveiller et sauvegarder la position de scroll
  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        scrollPositionRef.current = containerRef.current.scrollTop;
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // SOLUTION SPÉCIFIQUE : Restaurer le scroll UNIQUEMENT lors de la rétractation du volet contextuel
  useEffect(() => {
    const previousMode = previousDisplayModeRef.current;
    const currentMode = displayMode;

    // CORRECTION : Détecter quand le volet contextuel passe de fullwidth à normal
    const isContextRetractingFromFull =
      previousMode === "context-fullwidth" && currentMode === "normal";

    console.log("🔍 Display mode change:", {
      previousMode,
      currentMode,
      isContextRetractingFromFull,
    });

    if (isContextRetractingFromFull && containerRef.current) {
      console.log("🎯 Applying scroll fix for context retraction");
      // Sauvegarder la position actuelle avant le changement
      const currentScrollPosition = containerRef.current.scrollTop;
      scrollPositionRef.current = currentScrollPosition;

      // Restaurer la position après que le layout se soit stabilisé
      const timeoutId = setTimeout(() => {
        if (containerRef.current) {
          console.log("📍 Restoring scroll to:", scrollPositionRef.current);
          containerRef.current.scrollTop = scrollPositionRef.current;
        }
      }, 100); // Délai plus long pour laisser le temps au Transcript de se redessiner

      return () => clearTimeout(timeoutId);
    }

    // Mettre à jour la référence du mode précédent
    previousDisplayModeRef.current = currentMode;
  }, [displayMode]);
  // Aussi, sauvegarder la position juste avant le changement de mode
  useEffect(() => {
    // Sauvegarder la position quand on est sur le point de changer de mode
    if (containerRef.current) {
      scrollPositionRef.current = containerRef.current.scrollTop;
    }
  }, [displayMode]); // Se déclenche AVANT le changement de layout

  if (hideHeader) {
    return (
      <Box
        ref={containerRef}
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          pt: 1,
          px: 2,
          overflowY: "auto",
          height: "100%",
          // Désactiver le smooth scrolling qui peut interférer
          scrollBehavior: "auto",
        }}
      >
        {selectedCall &&
          (viewMode === "word" ? (
            <Transcript
              callId={selectedCall.callid}
              hideHeader={true}
              highlightTurnOne={highlightTurnOne}
              transcriptSelectionMode={transcriptSelectionMode}
            />
          ) : (
            <TranscriptAlternative
              callId={selectedCall.callid}
              hideHeader={true}
              highlightSpeakers={highlightSpeakers}
            />
          ))}
      </Box>
    );
  }

  // Version complète avec header (pour compatibilité)
  return (
    <Box
      ref={containerRef}
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        pt: 1,
        px: 4,
        overflowY: "auto",
        height: "100%",
        scrollBehavior: "auto",
      }}
    >
      {selectedCall &&
        (viewMode === "word" ? (
          <Transcript
            callId={selectedCall.callid}
            highlightTurnOne={highlightTurnOne}
            transcriptSelectionMode={transcriptSelectionMode}
          />
        ) : (
          <TranscriptAlternative
            callId={selectedCall.callid}
            highlightSpeakers={highlightSpeakers}
          />
        ))}
    </Box>
  );
}
