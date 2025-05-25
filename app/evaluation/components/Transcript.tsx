import { useEffect, useState, useRef } from "react";
import { useCallData } from "@/context/CallDataContext";
import { Box, Paper, Typography, Popover } from "@mui/material";

import { Word } from "@/types/types";
import { useAudio } from "@/context/AudioContext";
import AudioPlayer from "./AudioPlayer";
import Postit from "./Postit";
import {
  getSpeakerType,
  isSpeakerConseil,
  isSpeakerClient,
  SpeakerType,
  getSpeakerStyle,
  getSpeakerSelectionStyle,
} from "@/utils/SpeakerUtils";

interface TranscriptProps {
  callId: number;
  hideHeader?: boolean; // Pour masquer le titre et toggle si contrôlés depuis l'en-tête
  highlightTurnOne?: boolean; // Prop externe pour contrôler la coloration
  transcriptSelectionMode?: string; // Mode de sélection depuis l'extérieur
}

const Transcript = ({
  callId,
  hideHeader = false,
  highlightTurnOne = false, // Utiliser la prop externe au lieu de l'état local
  transcriptSelectionMode,
}: TranscriptProps) => {
  const {
    transcription,
    fetchTranscription,
    selectedCall,
    createAudioUrlWithToken,
    updateCurrentWord,
    allPostits,
    addPostit,
    updatePostit,
    appelPostits,
    currentWord,
    transcriptSelectionMode: contextSelectionMode, // Renommer pour éviter conflit
    setClientSelection,
    setConseillerSelection,
  } = useCallData();

  const containerRef = useRef<HTMLDivElement>(null);

  const {
    isPlaying,
    audioRef,
    play,
    pause,
    seekTo,
    audioSrc,
    setAudioSrc,
    currentWordIndex,
    updateCurrentWordIndex,
    executeWithLock,
  } = useAudio();

  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [isProcessingAudioAction, setIsProcessingAudioAction] = useState(false);

  // SUPPRESSION DE L'ÉTAT LOCAL - maintenant contrôlé depuis l'en-tête
  // const [highlightTurnOne, setHighlightTurnOne] = useState(false);

  // ✅ Gestion du Popover (affichage du Post-it)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPostit, setSelectedPostit] = useState<Postit | null>(null);

  const handlePostitClick = (
    event: React.MouseEvent<HTMLElement>,
    postit: Postit
  ) => {
    setSelectedPostit(postit);
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopover = () => {
    setSelectedPostit(null);
    setAnchorEl(null);
  };

  // Utiliser le mode de sélection externe ou celui du contexte
  const activeSelectionMode = transcriptSelectionMode || contextSelectionMode;

  // Fonction pour gérer la sélection de texte
  const handleTextSelection = () => {
    console.log("handleTextSelection called, mode:", activeSelectionMode);
    if (!activeSelectionMode || !transcription?.words) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const selectionText = selection.toString().trim();
    if (!selectionText) return;

    const selectedIndices: number[] = [];
    const range = selection.getRangeAt(0);

    wordRefs.current.forEach((ref, idx) => {
      if (ref && range.intersectsNode(ref)) {
        const word = transcription.words[idx];
        const isClientWord = isSpeakerClient(word.turn);
        const isConseillerWord = isSpeakerConseil(word.turn);

        if (
          (activeSelectionMode === "client" && isClientWord) ||
          (activeSelectionMode === "conseiller" && isConseillerWord)
        ) {
          selectedIndices.push(idx);
        }
      }
    });

    if (selectedIndices.length > 0) {
      selectedIndices.sort((a, b) => a - b);
      const firstIdx = selectedIndices[0];
      const lastIdx = selectedIndices[selectedIndices.length - 1];

      const selectionData: TextSelection = {
        text: selectionText,
        startTime: transcription.words[firstIdx].startTime,
        endTime:
          transcription.words[lastIdx].endTime ||
          transcription.words[lastIdx].startTime + 1,
        wordIndex: firstIdx,
        speaker: activeSelectionMode,
      };

      if (activeSelectionMode === "client") {
        setClientSelection(selectionData);
      } else {
        setConseillerSelection(selectionData);
      }

      window.getSelection()?.removeAllRanges();
    }
  };

  // Event listener pour détecter la fin de la sélection
  useEffect(() => {
    if (!activeSelectionMode) return;

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mouseup", handleTextSelection);
      return () => {
        container.removeEventListener("mouseup", handleTextSelection);
      };
    }
  }, [activeSelectionMode, transcription]);

  // Charger la transcription
  useEffect(() => {
    if (callId && (!transcription || transcription.callid !== callId)) {
      fetchTranscription(callId);
    }
  }, [callId]);

  // Générer l'URL audio
  useEffect(() => {
    if (selectedCall?.filepath) {
      setAudioSrc(null);
      createAudioUrlWithToken(selectedCall.filepath).then((url) => {
        if (url) {
          setAudioSrc(url);
        }
      });
    }
  }, [selectedCall, setAudioSrc]);

  const handleWordClick = (word: Word, index: number) => {
    executeWithLock(async () => {
      if (isPlaying) {
        pause();
      } else {
        seekTo(word.startTime);
        await new Promise((resolve) => setTimeout(resolve, 150));
        play();
      }
    });
  };

  // Autres useEffect (timeupdate, currentWord, scroll)
  useEffect(() => {
    const onTimeUpdate = () => {
      const currentTime = audioRef.current?.currentTime || 0;
      if (transcription?.words) {
        updateCurrentWordIndex(transcription.words, currentTime);
      }
    };

    const player = audioRef.current;
    if (audioSrc && player) {
      player.addEventListener("timeupdate", onTimeUpdate);
      return () => {
        player.removeEventListener("timeupdate", onTimeUpdate);
      };
    }
  }, [audioSrc, transcription, updateCurrentWordIndex]);

  useEffect(() => {
    if (currentWordIndex >= 0 && transcription?.words) {
      const word = transcription.words[currentWordIndex];
      updateCurrentWord(word);
    }
  }, [currentWordIndex, transcription, updateCurrentWord]);

  useEffect(() => {
    if (currentWordIndex >= 0 && wordRefs.current[currentWordIndex]) {
      wordRefs.current[currentWordIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentWordIndex]);

  // Styles conditionnels pour les tours de parole
  const getWordStyle = (index: number, word: Word) => {
    const speakerType = getSpeakerType(word.turn);

    return {
      fontWeight: index === currentWordIndex ? "bold" : "normal",
      color: index === currentWordIndex ? "red" : "inherit",
      backgroundColor: highlightTurnOne // Utilise la prop externe
        ? getSpeakerStyle(speakerType, true).backgroundColor
        : "transparent",
      padding: "2px 4px",
      borderRadius: "4px",
    };
  };

  const postitMarkers = appelPostits.map((postit) => ({
    id: postit.id,
    time: postit.timestamp,
    label: postit.sujet || "Sans sujet",
  }));

  return (
    <Box sx={{ padding: hideHeader ? 1 : 2 }}>
      {/* TITRE ET TOGGLE - Masqués si hideHeader = true */}
      {!hideHeader && (
        <>
          <Typography variant="h6" gutterBottom>
            Transcription
          </Typography>

          {/* Toggle local seulement si pas contrôlé depuis l'en-tête */}
          <FormControlLabel
            control={
              <Switch
                checked={highlightTurnOne}
                onChange={() => {
                  // Cette fonction ne sera plus utilisée si contrôlé depuis l'en-tête
                  console.warn(
                    "Toggle local utilisé - devrait être contrôlé depuis l'en-tête"
                  );
                }}
              />
            }
            label="Colorer les tours de parole"
          />
        </>
      )}

      {/* Indication du mode sélection si actif */}
      {activeSelectionMode && (
        <Typography variant="body2" color="primary" sx={{ mb: 1 }}>
          Mode sélection:{" "}
          {activeSelectionMode === "client"
            ? "Texte client"
            : "Texte conseiller"}{" "}
          (sélectionnez le texte avec la souris)
        </Typography>
      )}

      {/* Timeline et lecteur audio */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mt: hideHeader ? 0 : 1,
          mb: 1,
        }}
      >
        {audioSrc ? (
          <AudioPlayer
            markers={postitMarkers}
            onMarkerClick={(id) => {
              const postit = appelPostits.find((p) => p.id === id);
              if (postit) {
                const event = {
                  currentTarget:
                    document.getElementById(`marker-${id}`) || null,
                };
                handlePostitClick(
                  event as React.MouseEvent<HTMLElement>,
                  postit
                );
              }
            }}
          />
        ) : (
          <Typography variant="body2" color="textSecondary">
            Aucun audio disponible pour cette transcription.
          </Typography>
        )}
      </Box>

      {/* Popover pour les post-its */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        {selectedPostit && (
          <Postit
            postit={selectedPostit}
            isSelected={true}
            onDoubleClick={handleClosePopover}
          />
        )}
      </Popover>

      {/* Transcription - Hauteur optimisée */}
      <Paper
        sx={{
          padding: 2,
          maxHeight: hideHeader ? "calc(100vh - 200px)" : "400px",
          overflowY: "auto",
        }}
        ref={containerRef}
      >
        <Box>
          {transcription?.words && transcription.words.length > 0 ? (
            transcription.words.map((word: Word, index: number) => (
              <span
                key={index}
                ref={(el) => (wordRefs.current[index] = el)}
                style={{
                  ...getWordStyle(index, word),
                  cursor: activeSelectionMode ? "text" : "pointer",
                  userSelect: activeSelectionMode ? "text" : "none",
                  backgroundColor: activeSelectionMode
                    ? getSpeakerSelectionStyle(getSpeakerType(word.turn))
                        .backgroundColor
                    : getWordStyle(index, word).backgroundColor,
                }}
                onClick={() =>
                  !activeSelectionMode && handleWordClick(word, index)
                }
              >
                {word.text}{" "}
              </span>
            ))
          ) : (
            <Typography variant="body2" color="textSecondary">
              Aucune transcription disponible.
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default Transcript;
