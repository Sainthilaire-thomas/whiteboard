import { useEffect, useState, useRef, memo } from "react";

import { useCallData } from "@/context/CallDataContext";
import {
  Box,
  Paper,
  Typography,
  Popover,
  FormControlLabel,
  Switch,
  Alert,
} from "@mui/material";

import { Word, Transcription } from "@/types/types";
import { useAudio } from "@/context/AudioContext";
import AudioPlayer from "./AudioPlayer";
import PostitComponent from "../Postit"; // Import renamed to avoid namespace conflict
import {
  getSpeakerType,
  isSpeakerConseil,
  isSpeakerClient,
  SpeakerType,
  getSpeakerStyle,
  getSpeakerSelectionStyle,
} from "@/utils/SpeakerUtils";

// Add local type definitions to avoid namespace issues
interface PostitType {
  id: number;
  callid: number;
  wordid: number;
  word: string;
  text: string;
  iddomaine: number | null;
  sujet: string;
  idsujet: number | null;
  pratique: string;
  idpratique?: number | null;
  timestamp: number;
  idactivite?: number | null;
}

interface TextSelectionType {
  text: string;
  startTime: number;
  endTime: number;
  wordIndex: number;
  speaker: "client" | "conseiller";
}

// Extended props for PostitComponent to include isSelected
interface PostitComponentProps {
  postit: PostitType;
  isSelected?: boolean; // Add this prop
  onDoubleClick?: () => void; // Make this prop optional for flexibility
}

interface TranscriptProps {
  callId: number;
  hideHeader?: boolean;
  highlightTurnOne?: boolean;
  transcriptSelectionMode?: string;

  isSpectatorMode?: boolean;
  highlightedWordIndex?: number;
  highlightedParagraphIndex?: number;
  highlightSpeakers?: boolean;
  viewMode?: "word" | "paragraph";
  transcription?: Transcription | null;
}

const Transcript = ({
  callId,
  hideHeader = false,
  highlightTurnOne = false,
  transcriptSelectionMode,

  isSpectatorMode = false,
  highlightedWordIndex,
  highlightedParagraphIndex,
  highlightSpeakers = true,
  viewMode = "word",
  transcription: propTranscription,
}: TranscriptProps) => {
  const {
    transcription: contextTranscription,
    fetchTranscription,
    selectedCall,
    createAudioUrlWithToken,
    updateCurrentWord,
    allPostits,
    addPostit,
    updatePostit,
    appelPostits,
    currentWord,
    transcriptSelectionMode: contextSelectionMode,
    setClientSelection,
    setConseillerSelection,
  } = useCallData();

  const transcription =
    isSpectatorMode && propTranscription
      ? propTranscription
      : contextTranscription;

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

  // ✅ Gestion du Popover (affichage du Post-it)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPostit, setSelectedPostit] = useState<PostitType | null>(null);

  const handlePostitClick = (
    event: React.MouseEvent<HTMLElement>,
    postit: PostitType
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

      const selectionData: TextSelectionType = {
        text: selectionText,
        startTime: transcription.words[firstIdx].startTime,
        endTime:
          transcription.words[lastIdx].endTime ||
          transcription.words[lastIdx].startTime + 1,
        wordIndex: firstIdx,
        speaker: activeSelectionMode as "client" | "conseiller",
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
    if (
      callId &&
      !isSpectatorMode &&
      (!contextTranscription || contextTranscription.callid !== callId)
    ) {
      fetchTranscription(callId);
    }
  }, [callId, isSpectatorMode]);

  // Générer l'URL audio
  useEffect(() => {
    if (selectedCall?.filepath) {
      setAudioSrc(null);
      // Fix: Type the url parameter and handle promise properly
      Promise.resolve(createAudioUrlWithToken(selectedCall.filepath)).then(
        (url: string | null) => {
          if (url) {
            setAudioSrc(url);
          }
        }
      );
    }
  }, [selectedCall, setAudioSrc]);

  const handleWordClick = (word: Word, index: number) => {
    if (isSpectatorMode) {
      console.log("Mode spectateur - interactions désactivées");
      return; // Pas d'interaction en mode spectateur
    }
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

  useEffect(() => {
    if (isSpectatorMode && highlightedWordIndex !== undefined) {
      const targetRef = wordRefs.current[highlightedWordIndex];
      if (targetRef) {
        targetRef.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [isSpectatorMode, highlightedWordIndex]);

  // Styles conditionnels pour les tours de parole
  const getWordStyle = (index: number, word: Word) => {
    const speakerType = getSpeakerType(word.turn ?? "turn1");

    let style = {
      fontWeight: "normal" as "normal" | "bold", // ✅ CORRIGER le type
      color: "inherit" as string, // ✅ CORRIGER le type
      backgroundColor: "transparent" as string, // ✅ CORRIGER le type
      padding: "2px 4px",
      borderRadius: "4px",
    };

    if (isSpectatorMode) {
      // ✅ Mode spectateur : highlighting reçu du coach
      if (viewMode === "word" && index === highlightedWordIndex) {
        style.fontWeight = "bold";
        style.color = "white";
        style.backgroundColor = "#2563eb"; // Bleu pour highlighting synchronisé
      }

      // Highlighting locuteurs si activé
      if (highlightSpeakers && highlightTurnOne) {
        const speakerStyle = getSpeakerStyle(speakerType, true);
        if (speakerStyle.backgroundColor) {
          style.backgroundColor = speakerStyle.backgroundColor;
        }
      }
    } else {
      // ✅ Mode coach : highlighting normal (votre logique existante)
      if (index === currentWordIndex) {
        style.fontWeight = "bold";
        style.color = "red";
      }

      if (highlightTurnOne) {
        const speakerStyle = getSpeakerStyle(speakerType, true);
        if (speakerStyle.backgroundColor) {
          style.backgroundColor = speakerStyle.backgroundColor;
        }
      }
    }

    return style;
  };

  const postitMarkers = appelPostits.map((postit) => ({
    id: postit.id,
    time: postit.timestamp,
    label: postit.sujet || "Sans sujet",
  }));

  return (
    <Box sx={{ padding: hideHeader ? 1 : 2 }}>
      {/* ✅ AJOUTER indicateur mode spectateur */}
      {isSpectatorMode && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Mode spectateur</strong> - Synchronisé avec le coach en
            temps réel
          </Typography>
        </Alert>
      )}
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
                    document.getElementById(`marker-${id}`) || document.body,
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
          <PostitComponent
            postit={selectedPostit}
            // onDoubleClick={handleClosePopover}
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
                ref={(el: HTMLSpanElement | null) => {
                  wordRefs.current[index] = el;
                }}
                style={{
                  ...getWordStyle(index, word), // ✅ Utilise la logique modifiée
                  cursor: isSpectatorMode
                    ? "default"
                    : activeSelectionMode
                      ? "text"
                      : "pointer",
                  userSelect: isSpectatorMode
                    ? "none"
                    : activeSelectionMode
                      ? "text"
                      : "none",
                }}
                onClick={() =>
                  !isSpectatorMode &&
                  !activeSelectionMode &&
                  handleWordClick(word, index)
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

export default memo(Transcript, (prevProps, nextProps) => {
  // Ne re-rendre QUE si ces props changent vraiment
  return (
    prevProps.callId === nextProps.callId &&
    prevProps.hideHeader === nextProps.hideHeader &&
    prevProps.highlightTurnOne === nextProps.highlightTurnOne &&
    prevProps.transcriptSelectionMode === nextProps.transcriptSelectionMode &&
    // ✅ AJOUTER les nouvelles props pour éviter re-render inutiles
    prevProps.isSpectatorMode === nextProps.isSpectatorMode &&
    prevProps.highlightedWordIndex === nextProps.highlightedWordIndex &&
    prevProps.highlightedParagraphIndex ===
      nextProps.highlightedParagraphIndex &&
    prevProps.highlightSpeakers === nextProps.highlightSpeakers &&
    prevProps.viewMode === nextProps.viewMode
  );
});
