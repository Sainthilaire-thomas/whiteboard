import { useEffect, useState, useRef } from "react";
import { useCallData } from "@/context/CallDataContext";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  FormControlLabel,
  Switch,
  Popover,
} from "@mui/material";

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
}

const Transcript = ({ callId }: TranscriptProps) => {
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
    transcriptSelectionMode,
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

  const [highlightTurnOne, setHighlightTurnOne] = useState(false);

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

  // Ajoutez cette fonction pour gérer la sélection de texte
  const handleTextSelection = () => {
    console.log("handleTextSelection called, mode:", transcriptSelectionMode);
    console.log(
      "wordRefs content:",
      wordRefs.current.filter((ref) => ref !== null).length,
      "non-null refs out of",
      wordRefs.current.length
    );
    if (!transcriptSelectionMode || !transcription?.words) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const selectionText = selection.toString().trim();
    if (!selectionText) return;

    // Logique pour identifier les mots sélectionnés
    const selectedIndices: number[] = [];
    const range = selection.getRangeAt(0);

    wordRefs.current.forEach((ref, idx) => {
      if (ref) {
        const isIntersecting = range.intersectsNode(ref);

        // Si au moins un mot est sélectionné, loggez-le pour débogage
        if (isIntersecting) {
          console.log(
            "Intersecting word:",
            transcription.words[idx].text,
            "turn:",
            transcription.words[idx].turn
          );
        }
      }
      if (ref && range.intersectsNode(ref)) {
        const word = transcription.words[idx];
        console.log(
          "Word with potential intersection:",
          word.text,
          "turn:",
          word.turn
        );

        // Utiliser les fonctions utilitaires pour déterminer qui parle
        // Au lieu de vérifier uniquement "turn1" et "turn2"
        const isClientWord = isSpeakerClient(word.turn);
        const isConseillerWord = isSpeakerConseil(word.turn);

        if (
          (transcriptSelectionMode === "client" && isClientWord) ||
          (transcriptSelectionMode === "conseiller" && isConseillerWord)
        ) {
          selectedIndices.push(idx);
        }
      }
    });

    console.log("Selected indices:", selectedIndices);
    if (selectedIndices.length > 0) {
      console.log("Indices found, preparing selection data");
      // Trier les indices
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
        speaker: transcriptSelectionMode,
      };

      // Enregistrer la sélection dans le contexte
      if (transcriptSelectionMode === "client") {
        setClientSelection(selectionData);
      } else {
        setConseillerSelection(selectionData);
      }
      console.log("selectionData", selectionData);

      // Afficher un feedback à l'utilisateur
      // Vous pouvez ajouter une notification toast ou un autre élément UI

      // Effacer la sélection
      window.getSelection()?.removeAllRanges();
    }
  };

  // Ajoutez un event listener pour détecter la fin de la sélection
  useEffect(() => {
    console.log("Setting up mouseup listener, mode:", transcriptSelectionMode);
    if (!transcriptSelectionMode) return;

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mouseup", handleTextSelection);

      return () => {
        container.removeEventListener("mouseup", handleTextSelection);
      };
    }
  }, [transcriptSelectionMode, transcription]);

  // ✅ 1️⃣ Charger la transcription uniquement si elle n'est pas déjà récupérée
  useEffect(() => {
    if (callId && (!transcription || transcription.callid !== callId)) {
      fetchTranscription(callId);
    }
  }, [callId]); // ✅ `fetchTranscription` est **retiré** des dépendances

  // ✅ 2️⃣ Générer l'URL audio uniquement si `selectedCall.filepath` existe

  useEffect(() => {
    if (selectedCall?.filepath) {
      setAudioSrc(null); // 🔴 Réinitialise l'audio avant de charger le nouveau

      createAudioUrlWithToken(selectedCall.filepath).then((url) => {
        if (url) {
          setAudioSrc(url);
        }
      });
    }
  }, [selectedCall, setAudioSrc]); // 🔴 Ajoute `setAudioSrc` dans les dépendances

  // const handleWordClick = (word: Word, index: number) => {
  //   setTime(word.startTime);
  //   if (isPlaying) {
  //     pause();
  //   } else {
  //     play();
  //   }
  // };

  const handleWordClick = (word: Word, index: number) => {
    executeWithLock(async () => {
      console.log("État isPlaying avant clic:", isPlaying);

      if (isPlaying) {
        pause();
        console.log("Pause appelée");
      } else {
        seekTo(word.startTime);
        await new Promise((resolve) => setTimeout(resolve, 150));
        play();
        console.log("Play appelé");
      }
    });
  };

  const handleAddPostit = () => {
    if (!currentWord || !audioRef.current || !selectedCall?.callid) {
      console.warn("Impossible de créer un post-it, données insuffisantes.");
      return;
    }

    const wordid = currentWord.wordid ?? 0;
    const wordText = currentWord.text ?? "Post-it";
    const timestamp = Math.floor(audioRef.current.currentTime);

    addPostit(wordid, wordText, timestamp, {
      sujet: "Non assigné",
      pratique: "Non assigné",
      domaine: "Non assigné",
    });

    console.log(
      `📝 Post-it ajouté -> WordID: ${wordid}, Texte: "${wordText}", Timestamp: ${timestamp}`
    );
  };

  useEffect(() => {
    const onTimeUpdate = () => {
      const currentTime = audioRef.current?.currentTime || 0;

      // Mise à jour de l'index si la transcription est disponible
      if (transcription?.words) {
        updateCurrentWordIndex(transcription.words, currentTime);
      }
    };

    const player = audioRef.current;
    if (audioSrc && player) {
      player.addEventListener("timeupdate", onTimeUpdate);

      return () => {
        // Nettoyage du listener d'événements pour éviter les conflits
        player.removeEventListener("timeupdate", onTimeUpdate);
      };
    }
  }, [audioSrc, transcription, updateCurrentWordIndex]);

  // Ajout du useEffect pour mettre à jour currentWord lorsque currentWordIndex change
  useEffect(() => {
    if (currentWordIndex >= 0 && transcription?.words) {
      const word = transcription.words[currentWordIndex]; // Obtenez le mot actuel à partir de l'index
      updateCurrentWord(word); // Mettez à jour currentWord dans le contexte
    }
  }, [currentWordIndex, transcription, updateCurrentWord]);

  useEffect(() => {
    if (currentWordIndex >= 0 && wordRefs.current[currentWordIndex]) {
      wordRefs.current[currentWordIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "center", // 🔹 Place le mot au centre de la fenêtre
      });
    }
  }, [currentWordIndex]);

  // ✅ Styles conditionnels pour les tours de parole
  const getWordStyle = (index: number, word: Word) => {
    const speakerType = getSpeakerType(word.turn);

    return {
      fontWeight: index === currentWordIndex ? "bold" : "normal",
      color: index === currentWordIndex ? "red" : "inherit",
      backgroundColor: highlightTurnOne
        ? getSpeakerStyle(speakerType, true).backgroundColor
        : "transparent",
      padding: "2px 4px",
      borderRadius: "4px",
    };
  };

  // ✅ Filtrer les post-its pour ne garder que ceux liés à `callId`
  const postitMarkers = appelPostits.map((postit) => ({
    id: postit.id,
    time: postit.timestamp,
    label: postit.sujet || "Sans sujet",
  }));

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h6" gutterBottom>
        Transcription
      </Typography>

      {/* Indication du mode sélection si actif */}
      {transcriptSelectionMode && (
        <Typography variant="body2" color="primary" sx={{ mb: 1 }}>
          Mode sélection:{" "}
          {transcriptSelectionMode === "client"
            ? "Texte client"
            : "Texte conseiller"}{" "}
          (sélectionnez le texte avec la souris)
        </Typography>
      )}
      {/* ✅ Ajout du Toggle pour changer le fond des mots en fonction de l'interlocuteur */}
      <FormControlLabel
        control={
          <Switch
            checked={highlightTurnOne}
            onChange={() => setHighlightTurnOne(!highlightTurnOne)}
          />
        }
        label="Colorer les tours de parole"
      />

      {/* ✅ Timeline placée au-dessus du lecteur audio */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mt: 1,
        }}
      >
        {audioSrc ? (
          <AudioPlayer
            markers={postitMarkers}
            onMarkerClick={(id) => {
              // Trouver le post-it correspondant à cet ID
              const postit = appelPostits.find((p) => p.id === id);
              if (postit) {
                // Utiliser votre logique existante pour ouvrir le popover
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
      <Paper
        sx={{ padding: 2, maxHeight: "400px", overflowY: "auto" }}
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
                  cursor: transcriptSelectionMode ? "text" : "pointer",
                  userSelect: transcriptSelectionMode ? "text" : "none",
                  backgroundColor: transcriptSelectionMode
                    ? getSpeakerSelectionStyle(getSpeakerType(word.turn))
                        .backgroundColor
                    : getWordStyle(index, word).backgroundColor,
                }}
                onClick={() =>
                  !transcriptSelectionMode && handleWordClick(word, index)
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
