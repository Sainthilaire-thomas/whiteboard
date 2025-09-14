// 📜 app/evaluation/components/TranscriptAlternative.tsx
import { useEffect, useState, useRef } from "react";
import { useCallData } from "@/context/CallDataContext";
import {
  Box,
  Paper,
  Typography,
  FormControlLabel,
  Switch,
  Popover,
  useTheme,
  Alert,
} from "@mui/material";
import { Word, Transcription } from "@/types/types";
import { useAudio } from "@/context/AudioContext";
import {
  SpeakerType,
  getSpeakerType,
  getSpeakerStyle,
  isSpeakerConseil,
  isSpeakerClient,
  getSpeakerDisplayName,
  groupWordsBySpeaker,
  SpeakerParagraph,
} from "@/utils/SpeakerUtils";

import AudioPlayer from "./AudioPlayer";
import Postit from "../Postit";

interface TranscriptAlternativeProps {
  callId: number;
  audioSrc?: string;
  hideHeader?: boolean;
  highlightSpeakers?: boolean;
  transcriptSelectionMode?: string; // ✅ AJOUTER cette prop

  isSpectatorMode?: boolean;
  highlightedWordIndex?: number;
  highlightedParagraphIndex?: number;
  highlightTurnOne?: boolean;
  viewMode?: "word" | "paragraph";
  transcription?: Transcription | null;
}

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

const TranscriptAlternative = ({
  callId,
  hideHeader = false,
  highlightSpeakers: externalHighlightSpeakers = true,
  transcriptSelectionMode,

  isSpectatorMode = false,
  highlightedWordIndex,
  highlightedParagraphIndex,
  highlightTurnOne = false,
  viewMode = "paragraph",
  transcription: propTranscription,
}: TranscriptAlternativeProps) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const {
    transcription: contextTranscription,
    fetchTranscription,
    selectedCall,
    createAudioUrlWithToken,
    updateCurrentWord,
    addPostit,
    appelPostits,
    currentWord,
    transcriptSelectionMode: contextSelectionMode, // ✅ AJOUTER
    setClientSelection, // ✅ AJOUTER
    setConseillerSelection, // ✅ AJOUTER
  } = useCallData();

  const transcription =
    isSpectatorMode && propTranscription
      ? propTranscription
      : contextTranscription;

  const containerRef = useRef<HTMLDivElement>(null);
  const paragraphRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeSelectionMode = transcriptSelectionMode || contextSelectionMode;

  const {
    isPlaying,
    audioRef,
    play,
    pause,
    seekTo,
    audioSrc, // IMPORTANT: Utiliser audioSrc directement depuis useAudio
    setAudioSrc,
    currentWordIndex,
    updateCurrentWordIndex,
    executeWithLock, // ✅ CORRECTION: Ajouter executeWithLock
  } = useAudio();

  const highlightSpeakers = externalHighlightSpeakers;
  const [paragraphs, setParagraphs] = useState<SpeakerParagraph[]>([]);
  const [currentParagraphIndex, setCurrentParagraphIndex] =
    useState<number>(-1);
  //selection du texte

  const handleTextSelection = () => {
    console.log(
      "handleTextSelection called in TranscriptAlternative, mode:",
      activeSelectionMode
    );
    if (!activeSelectionMode || !transcription?.words) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const selectionText = selection.toString().trim();
    if (!selectionText) return;

    const range = selection.getRangeAt(0);
    const selectedWordIndices: number[] = [];

    // 🔧 NOUVELLE APPROCHE : Utiliser les refs des paragraphes avec un mapping précis
    paragraphRefs.current.forEach((paragraphRef, paragraphIndex) => {
      if (paragraphRef && range.intersectsNode(paragraphRef)) {
        const paragraph = paragraphs[paragraphIndex];
        if (paragraph) {
          // Vérifier le type de locuteur du paragraphe
          const isClientParagraph = isSpeakerClient(paragraph.turn);
          const isConseillerParagraph = isSpeakerConseil(paragraph.turn);

          // Seulement si le paragraphe correspond au mode de sélection
          if (
            (activeSelectionMode === "client" && isClientParagraph) ||
            (activeSelectionMode === "conseiller" && isConseillerParagraph)
          ) {
            // 🔧 CORRECTION PRINCIPALE : Utiliser l'index original du mot
            paragraph.words.forEach(
              (word: Word, wordIndexInParagraph: number) => {
                // Calculer l'index absolu du mot dans transcription.words
                // en utilisant la position dans le paragraphe + l'offset du début du paragraphe

                // Méthode 1 : Utiliser startWordIndex si disponible dans SpeakerParagraph
                if (paragraph.startWordIndex !== undefined) {
                  const absoluteWordIndex =
                    paragraph.startWordIndex + wordIndexInParagraph;
                  if (absoluteWordIndex < transcription.words.length) {
                    selectedWordIndices.push(absoluteWordIndex);
                  }
                } else {
                  // Méthode 2 : Fallback avec recherche plus précise
                  // Chercher le mot en utilisant plusieurs critères pour éviter les doublons
                  const wordIndex = transcription.words.findIndex(
                    (w: Word, idx: number) =>
                      w.startTime === word.startTime &&
                      w.text === word.text &&
                      w.turn === word.turn &&
                      // Vérifier que nous n'avons pas déjà trouvé ce mot
                      !selectedWordIndices.includes(idx)
                  );

                  if (wordIndex !== -1) {
                    selectedWordIndices.push(wordIndex);
                  }
                }
              }
            );
          }
        }
      }
    });

    console.log("📊 Mots sélectionnés (indices):", selectedWordIndices);

    if (selectedWordIndices.length > 0) {
      selectedWordIndices.sort((a, b) => a - b);
      const firstIdx = selectedWordIndices[0];
      const lastIdx = selectedWordIndices[selectedWordIndices.length - 1];

      const selectionData = {
        text: selectionText,
        startTime: transcription.words[firstIdx].startTime,
        endTime:
          transcription.words[lastIdx].endTime ||
          transcription.words[lastIdx].startTime + 1,
        wordIndex: firstIdx,
        speaker: activeSelectionMode as "client" | "conseiller",
      };

      console.log(
        "✅ Sélection précise créée dans TranscriptAlternative:",
        selectionData
      );

      if (activeSelectionMode === "client") {
        setClientSelection(selectionData);
      } else {
        setConseillerSelection(selectionData);
      }

      window.getSelection()?.removeAllRanges();
    } else {
      console.warn("⚠️ Aucun mot correspondant au mode de sélection trouvé");
    }
  };

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

  // ✅ 1️⃣ Charger la transcription - EXACTEMENT comme Transcript

  useEffect(() => {
    if (
      callId &&
      !isSpectatorMode &&
      (!contextTranscription || contextTranscription.callid !== callId)
    ) {
      fetchTranscription(callId);
    }
  }, [callId, isSpectatorMode]);

  // ✅ 2️⃣ Générer l'URL audio - EXACTEMENT comme Transcript
  useEffect(() => {
    if (selectedCall?.filepath) {
      setAudioSrc(null); // Réinitialiser l'audio avant d'en charger un nouveau

      const result = createAudioUrlWithToken(selectedCall.filepath);
      Promise.resolve(result).then((url: string | null) => {
        if (url) {
          setAudioSrc(url);
        }
      });
    }
  }, [selectedCall, setAudioSrc]); // Dépendances identiques à Transcript

  // ✅ 3️⃣ Regrouper les mots par locuteur
  useEffect(() => {
    if (transcription?.words && transcription.words.length > 0) {
      try {
        const grouped = groupWordsBySpeaker(transcription.words);
        setParagraphs(grouped);
      } catch (err) {
        console.error("Erreur lors du regroupement des mots:", err);
      }
    }
  }, [transcription]);

  // ✅ AJOUTER : Event listener pour détecter la fin de la sélection
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

  // Fonction pour formater le temps au format mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // ✅ CORRECTION: Utiliser executeWithLock comme dans Transcript
  const handleParagraphClick = (paragraph: SpeakerParagraph, index: number) => {
    if (isSpectatorMode) {
      console.log("Mode spectateur - interactions désactivées");
      return; // Pas d'interaction en mode spectateur
    }
    executeWithLock(async () => {
      console.log("État isPlaying avant clic:", isPlaying);

      // Mettre à jour le mot courant (premier mot du paragraphe)
      if (paragraph.words.length > 0) {
        updateCurrentWord(paragraph.words[0]);
      }

      if (isPlaying) {
        pause();
        console.log("Pause appelée");
      } else {
        seekTo(paragraph.startTime);
        await new Promise((resolve) => setTimeout(resolve, 150));
        play();
        console.log("Play appelé");
      }
    });
  };

  // Mise à jour du mot et du paragraphe courants - Comme dans Transcript
  useEffect(() => {
    const onTimeUpdate = () => {
      const currentTime = audioRef.current?.currentTime || 0;

      // Mise à jour de l'index du mot
      if (transcription?.words) {
        updateCurrentWordIndex(transcription.words, currentTime);
      }

      // Trouver le paragraphe actuel
      if (paragraphs.length > 0) {
        const paragraphIndex = paragraphs.findIndex(
          (p) => currentTime >= p.startTime && currentTime <= p.endTime
        );

        if (paragraphIndex >= 0 && paragraphIndex !== currentParagraphIndex) {
          setCurrentParagraphIndex(paragraphIndex);
        }
      }
    };

    const player = audioRef.current;
    if (audioSrc && player) {
      player.addEventListener("timeupdate", onTimeUpdate);
      return () => player.removeEventListener("timeupdate", onTimeUpdate);
    }
  }, [
    audioSrc,
    transcription,
    updateCurrentWordIndex,
    paragraphs,
    currentParagraphIndex,
    audioRef,
  ]);

  // Auto-scroll au paragraphe courant
  useEffect(() => {
    if (
      currentParagraphIndex >= 0 &&
      paragraphRefs.current[currentParagraphIndex]
    ) {
      paragraphRefs.current[currentParagraphIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentParagraphIndex]);

  useEffect(() => {
    if (isSpectatorMode && highlightedParagraphIndex !== undefined) {
      const targetRef = paragraphRefs.current[highlightedParagraphIndex];
      if (targetRef) {
        targetRef.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [isSpectatorMode, highlightedParagraphIndex]);

  // ✅ Filtrer les post-its pour ne garder que ceux liés à `callId` - EXACTEMENT comme Transcript
  const postitMarkers = appelPostits.map((postit) => ({
    id: postit.id,
    time: postit.timestamp,
    label: postit.sujet || "Sans sujet",
  }));

  // ✅ CORRECTION: Ajouter handleMarkerClick avec executeWithLock
  const handleMarkerClick = (id: number) => {
    executeWithLock(async () => {
      // Trouver le post-it correspondant à cet ID
      const postit = appelPostits.find((p) => p.id === id);
      if (postit) {
        // Chercher le timestamp et naviguer
        seekTo(postit.timestamp);
        await new Promise((resolve) => setTimeout(resolve, 150));

        // Simuler l'événement pour le popover
        const event = {
          currentTarget: document.getElementById(`marker-${id}`) || null,
        };
        handlePostitClick(event as React.MouseEvent<HTMLElement>, postit);
      }
    });
  };

  // Fonction de rendu simplifiée
  const renderParagraphs = () => {
    if (!transcription?.words || transcription.words.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary">
          Aucune transcription disponible.
        </Typography>
      );
    }

    return paragraphs.map((paragraph, index) => {
      const speakerType = getSpeakerType(paragraph.turn);

      // ✅ MODIFIER la logique isCurrentParagraph pour mode spectateur
      const isCurrentParagraph = isSpectatorMode
        ? viewMode === "paragraph" && index === highlightedParagraphIndex
        : index === currentParagraphIndex;

      const isConseiller = speakerType === SpeakerType.CONSEILLER;

      // Couleurs adaptées au dark mode (votre code existant)
      const clientColor = isDarkMode ? "#4BAFD8" : "#069ED0";
      const conseillerColor = isDarkMode ? "#D9BE28" : "#A58D04";

      // ✅ MODIFIER altBgColor pour prendre en compte highlightTurnOne synchronisé
      const shouldHighlightSpeakers = isSpectatorMode
        ? highlightTurnOne
        : highlightSpeakers;

      const altBgColor = isDarkMode
        ? isConseiller
          ? "rgba(255, 204, 0, 0.15)"
          : "rgba(75, 175, 216, 0.15)"
        : isConseiller
          ? "rgba(204, 136, 0, 0.1)"
          : "rgba(0, 120, 179, 0.07)";

      return (
        <Box
          key={index}
          ref={(el: HTMLDivElement | null) => {
            paragraphRefs.current[index] = el;
          }}
          onClick={() => handleParagraphClick(paragraph, index)}
          sx={{
            display: "flex",
            borderBottom: `1px solid ${theme.palette.divider}`,
            py: 0.8,
            cursor: isSpectatorMode ? "default" : "pointer", // ✅ Cursor conditionnel
            backgroundColor: isCurrentParagraph
              ? isDarkMode
                ? isSpectatorMode
                  ? "rgba(37, 99, 235, 0.3)" // Bleu pour mode spectateur
                  : "rgba(255, 50, 50, 0.2)" // Rouge pour mode normal
                : isSpectatorMode
                  ? "rgba(37, 99, 235, 0.2)" // Bleu pour mode spectateur
                  : "rgba(255, 0, 0, 0.1)" // Rouge pour mode normal
              : shouldHighlightSpeakers
                ? altBgColor
                : "transparent",
            borderLeft: isCurrentParagraph
              ? `4px solid ${isSpectatorMode ? "#2563eb" : isDarkMode ? "#ff5252" : "#ff0000"}`
              : "4px solid transparent",
            transition: "all 0.3s ease",
            "&:hover": isSpectatorMode
              ? {}
              : {
                  // ✅ Pas de hover en mode spectateur
                  backgroundColor: isDarkMode
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.07)",
                },
          }}
        >
          {/* Votre code timestamp existant inchangé */}
          <Box
            sx={{
              minWidth: "55px",
              color: isCurrentParagraph
                ? isSpectatorMode
                  ? "#2563eb" // Bleu pour mode spectateur
                  : isDarkMode
                    ? "#ff7070"
                    : "#dd0000" // Rouge pour mode normal
                : "text.secondary",
              fontSize: "0.75rem",
              fontWeight: isCurrentParagraph ? "bold" : "normal",
              pt: 0.3,
              pl: 0.5,
            }}
          >
            {formatTime(paragraph.startTime)}
          </Box>

          {/* Votre code speaker indicator existant inchangé */}
          <Box
            sx={{
              width: "80px",
              fontSize: "0.75rem",
              fontWeight: "bold",
              color: isConseiller ? conseillerColor : clientColor,
              pt: 0.3,
            }}
          >
            {isConseiller ? "Conseiller:" : "Client:"}
          </Box>

          {/* ✅ MODIFIER Paragraph text pour mode spectateur */}
          <Box
            sx={{
              flex: 1,
              fontSize: "0.875rem",
              lineHeight: 1.5,
              pl: 1,
              pr: 2,
              pb: 0.5,
              color: isCurrentParagraph
                ? isSpectatorMode
                  ? "#2563eb" // Bleu pour mode spectateur
                  : isDarkMode
                    ? "#ff7070"
                    : "#dd0000" // Rouge pour mode normal
                : "text.primary",
              textAlign: "justify",
              // ✅ Curseur et sélection conditionnels
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
              // Votre logique backgroundColor existante...
              backgroundColor:
                activeSelectionMode &&
                ((activeSelectionMode === "client" && !isConseiller) ||
                  (activeSelectionMode === "conseiller" && isConseiller))
                  ? isDarkMode
                    ? "rgba(100, 200, 255, 0.1)"
                    : "rgba(0, 120, 255, 0.05)"
                  : isCurrentParagraph
                    ? isDarkMode
                      ? isSpectatorMode
                        ? "rgba(37, 99, 235, 0.3)"
                        : "rgba(255, 50, 50, 0.2)"
                      : isSpectatorMode
                        ? "rgba(37, 99, 235, 0.2)"
                        : "rgba(255, 0, 0, 0.1)"
                    : shouldHighlightSpeakers
                      ? altBgColor
                      : "transparent",
              ...(isCurrentParagraph && {
                fontWeight: "bold",
                transform: "scale(1.01)",
                transformOrigin: "left center",
              }),
            }}
            onClick={(e) => {
              if (!activeSelectionMode && !isSpectatorMode) {
                // ✅ Désactiver en mode spectateur
                handleParagraphClick(paragraph, index);
              }
            }}
          >
            {paragraph.text}
          </Box>
        </Box>
      );
    });
  };

  return (
    <Box sx={{ padding: 2 }}>
      {isSpectatorMode && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Mode spectateur</strong> - Vue alternative synchronisée avec
            le coach
          </Typography>
        </Alert>
      )}
      {!hideHeader && (
        <>
          <Typography variant="h6" gutterBottom>
            Transcription
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={highlightSpeakers}
                onChange={() => {
                  // Cette fonction ne sera plus utilisée si contrôlé depuis l'en-tête
                  console.warn(
                    "Toggle local utilisé - devrait être contrôlé depuis l'en-tête"
                  );
                }}
              />
            }
            label="Colorer les locuteurs"
          />
        </>
      )}
      {activeSelectionMode && (
        <Typography variant="body2" color="primary" sx={{ mb: 1 }}>
          Mode sélection:{" "}
          {activeSelectionMode === "client"
            ? "Texte client"
            : "Texte conseiller"}{" "}
          (sélectionnez le texte avec la souris)
        </Typography>
      )}

      {/* ✅ Timeline placée au-dessus du lecteur audio - EXACTEMENT comme Transcript */}
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
            onMarkerClick={handleMarkerClick} // ✅ CORRECTION: Utiliser la nouvelle fonction
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
        {selectedPostit && <Postit postit={selectedPostit} />}
      </Popover>

      {/* Transcription compact style - Dark Mode with alternating backgrounds */}
      <Paper
        sx={{
          padding: 1.5,
          maxHeight: "400px",
          overflowY: "auto",
          userSelect: isSpectatorMode
            ? "none"
            : activeSelectionMode
              ? "text"
              : "none", // ✅ Conditionnel
        }}
        ref={containerRef}
      >
        {renderParagraphs()}
      </Paper>
    </Box>
  );
};

export default TranscriptAlternative;
