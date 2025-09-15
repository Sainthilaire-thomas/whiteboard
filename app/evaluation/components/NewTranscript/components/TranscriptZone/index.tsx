// app/evaluation/components/NewTranscript/components/TranscriptZone/index.tsx

import React, {
  useMemo,
  useCallback,
  useState,
  useRef,
  useEffect,
} from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Tooltip,
  IconButton,
} from "@mui/material";
import { PlayArrow, NoteAdd, LocalOffer } from "@mui/icons-material";
import { useAudio } from "@/context/AudioContext";

import {
  TranscriptZoneProps,
  Word,
  TemporalEvent,
  TextSelection,
} from "../../types";

// Utilitaires pour le transcript
const transcriptUtils = {
  // Grouper les mots par tours de parole
  groupWordsBySpeaker: (words: Word[]) => {
    const turns: Array<{
      speaker: string;
      startTime: number;
      endTime: number;
      words: Word[];
      text: string;
    }> = [];

    let currentTurn: any = null;

    words.forEach((word) => {
      if (!currentTurn || currentTurn.speaker !== word.speaker) {
        // Nouveau tour de parole
        if (currentTurn) {
          turns.push(currentTurn);
        }
        currentTurn = {
          speaker: word.speaker || "Unknown",
          startTime: word.start_time,
          endTime: word.end_time,
          words: [word],
          text: word.text,
        };
      } else {
        // Continuer le tour actuel
        currentTurn.words.push(word);
        currentTurn.endTime = word.end_time;
        currentTurn.text += " " + word.text;
      }
    });

    if (currentTurn) {
      turns.push(currentTurn);
    }

    return turns;
  },

  // Trouver les événements associés à un mot
  getEventsForWord: (word: Word, events: TemporalEvent[]) => {
    return events.filter((event) => {
      // Vérifier si l'événement est lié à ce mot spécifiquement
      if (event.data.wordid === word.id) return true;

      // Vérifier si l'événement est dans la fenêtre temporelle du mot
      const wordMidTime = (word.start_time + word.end_time) / 2;
      const eventTime = event.startTime;

      return Math.abs(wordMidTime - eventTime) < 1; // 1 seconde de tolérance
    });
  },

  // Formater le temps pour l'affichage
  formatTime: (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  },

  // Calculer la couleur de surlignage en fonction du temps
  getHighlightIntensity: (
    wordTime: number,
    currentTime: number,
    windowSize: number = 2
  ) => {
    const distance = Math.abs(wordTime - currentTime);
    if (distance > windowSize) return 0;
    return Math.max(0, 1 - distance / windowSize);
  },
};

// Composant pour afficher un événement sur le transcript
interface EventOverlayProps {
  event: TemporalEvent;
  onClick: (event: TemporalEvent) => void;
  position?: "inline" | "overlay";
}

const EventOverlay: React.FC<EventOverlayProps> = ({
  event,
  onClick,
  position = "inline",
}) => {
  const getEventIcon = () => {
    switch (event.type) {
      case "postit":
        return <NoteAdd sx={{ fontSize: 14 }} />;
      case "tag":
        return <LocalOffer sx={{ fontSize: 14 }} />;
      default:
        return <PlayArrow sx={{ fontSize: 14 }} />;
    }
  };

  const getEventText = () => {
    return (
      event.data.text || event.data.tag || event.metadata.category || "Event"
    );
  };

  if (position === "overlay") {
    return (
      <Tooltip title={getEventText()} arrow>
        <Chip
          icon={getEventIcon()}
          label={event.metadata.category}
          size="small"
          onClick={() => onClick(event)}
          sx={{
            backgroundColor: event.metadata.color + "40",
            borderColor: event.metadata.color,
            cursor: "pointer",
            margin: "2px",
            fontSize: "0.7rem",
            height: 20,
            "&:hover": {
              backgroundColor: event.metadata.color + "60",
            },
          }}
        />
      </Tooltip>
    );
  }

  // Position inline
  return (
    <Box
      component="span"
      sx={{
        display: "inline-block",
        margin: "0 2px",
        padding: "2px 4px",
        backgroundColor: event.metadata.color + "30",
        borderLeft: "3px solid",
        borderLeftColor: event.metadata.color,
        borderRadius: "2px",
        fontSize: "0.7rem",
        cursor: "pointer",
        verticalAlign: "middle",
        "&:hover": {
          backgroundColor: event.metadata.color + "50",
        },
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(event);
      }}
      title={getEventText()}
    >
      {event.metadata.category}
    </Box>
  );
};

// Vue mot par mot
interface WordByWordViewProps {
  transcription: Word[];
  events: TemporalEvent[];
  currentWordIndex: number;
  fontSize: number;
  onWordClick: (word: Word) => void;
  onEventClick: (event: TemporalEvent) => void;
  currentTime: number;
}

const WordByWordView: React.FC<WordByWordViewProps> = ({
  transcription,
  events,
  currentWordIndex,
  fontSize,
  onWordClick,
  onEventClick,
  currentTime,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll vers le mot actuel
  useEffect(() => {
    if (containerRef.current && currentWordIndex >= 0) {
      const currentWordElement = containerRef.current.querySelector(
        `[data-word-index="${currentWordIndex}"]`
      ) as HTMLElement;

      if (currentWordElement) {
        currentWordElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
      }
    }
  }, [currentWordIndex]);

  return (
    <Box
      ref={containerRef}
      sx={{
        padding: 2,
        lineHeight: 2.2,
        fontSize: fontSize,
        maxHeight: "100%",
        overflow: "auto",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {transcription.map((word, index) => {
        const wordEvents = transcriptUtils.getEventsForWord(word, events);
        const isCurrentWord = index === currentWordIndex;
        const highlightIntensity = transcriptUtils.getHighlightIntensity(
          (word.start_time + word.end_time) / 2,
          currentTime
        );

        return (
          <React.Fragment key={word.id}>
            <Box
              component="span"
              data-word-index={index}
              sx={{
                display: "inline-block",
                margin: "2px 4px",
                padding: "4px 6px",
                borderRadius: "4px",
                cursor: "pointer",
                userSelect: "none",
                transition: "all 0.2s ease",

                // Style du mot actuel
                ...(isCurrentWord && {
                  backgroundColor: "primary.main",
                  color: "primary.contrastText",
                  fontWeight: "bold",
                  transform: "scale(1.05)",
                  boxShadow: 1,
                }),

                // Style de surlignage temporel
                ...(!isCurrentWord &&
                  highlightIntensity > 0 && {
                    backgroundColor: `rgba(25, 118, 210, ${highlightIntensity * 0.3})`,
                    fontWeight: 500,
                  }),

                // Style par défaut
                ...(!isCurrentWord &&
                  highlightIntensity === 0 && {
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                  }),

                // Style avec événements
                ...(wordEvents.length > 0 && {
                  borderBottom: "2px solid",
                  borderBottomColor: wordEvents[0].metadata.color,
                }),
              }}
              onClick={() => onWordClick(word)}
              title={`${word.text} (${transcriptUtils.formatTime(word.start_time)})`}
            >
              {word.text}
            </Box>

            {/* Événements associés au mot */}
            {wordEvents.map((event) => (
              <EventOverlay
                key={event.id}
                event={event}
                onClick={onEventClick}
                position="inline"
              />
            ))}
          </React.Fragment>
        );
      })}
    </Box>
  );
};

// Vue par paragraphes (tours de parole)
interface ParagraphViewProps {
  transcription: Word[];
  events: TemporalEvent[];
  fontSize: number;
  onWordClick: (word: Word) => void;
  onEventClick: (event: TemporalEvent) => void;
  currentTime: number;
}

const ParagraphView: React.FC<ParagraphViewProps> = ({
  transcription,
  events,
  fontSize,
  onWordClick,
  onEventClick,
  currentTime,
}) => {
  const turns = useMemo(() => {
    return transcriptUtils.groupWordsBySpeaker(transcription);
  }, [transcription]);

  const [expandedTurns, setExpandedTurns] = useState<Set<number>>(new Set());

  const toggleTurnExpansion = useCallback((index: number) => {
    setExpandedTurns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  return (
    <Box sx={{ padding: 2, backgroundColor: "background.default" }}>
      {turns.map((turn, turnIndex) => {
        const turnEvents = events.filter(
          (event) =>
            event.startTime >= turn.startTime && event.startTime <= turn.endTime
        );

        const isCurrentTurn =
          currentTime >= turn.startTime && currentTime <= turn.endTime;
        const isExpanded = expandedTurns.has(turnIndex);

        return (
          <Paper
            key={turnIndex}
            sx={{
              marginBottom: 2,
              padding: 2,
              border: "1px solid",
              borderColor: isCurrentTurn ? "primary.main" : "divider",
              backgroundColor: isCurrentTurn
                ? "action.hover"
                : "background.paper",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: 2,
              },
            }}
            elevation={isCurrentTurn ? 2 : 0}
          >
            {/* En-tête du tour */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 1,
                paddingBottom: 1,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Chip
                  label={turn.speaker}
                  size="small"
                  color={turn.speaker === "Client" ? "primary" : "secondary"}
                  sx={{ fontWeight: "bold" }}
                />
                <Typography variant="caption" color="text.secondary">
                  {transcriptUtils.formatTime(turn.startTime)} -{" "}
                  {transcriptUtils.formatTime(turn.endTime)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ({turn.words.length} mots)
                </Typography>
              </Box>

              {/* Actions */}
              <Box sx={{ display: "flex", gap: 1 }}>
                {isCurrentTurn && (
                  <IconButton size="small" color="primary">
                    <PlayArrow />
                  </IconButton>
                )}
                <IconButton
                  size="small"
                  onClick={() => toggleTurnExpansion(turnIndex)}
                >
                  <LocalOffer />
                </IconButton>
              </Box>
            </Box>

            {/* Contenu du tour */}
            <Box
              sx={{
                fontSize: fontSize,
                lineHeight: 1.8,
                cursor: "text",
                userSelect: "text",
              }}
            >
              {isExpanded ? (
                // Vue mot par mot dans le paragraphe
                <Box>
                  {turn.words.map((word, wordIndex) => {
                    const wordEvents = transcriptUtils.getEventsForWord(
                      word,
                      events
                    );
                    const wordMidTime = (word.start_time + word.end_time) / 2;
                    const isCurrentWord =
                      Math.abs(wordMidTime - currentTime) < 0.5;

                    return (
                      <React.Fragment key={word.id}>
                        <Box
                          component="span"
                          sx={{
                            display: "inline",
                            padding: "2px",
                            borderRadius: "2px",
                            cursor: "pointer",
                            ...(isCurrentWord && {
                              backgroundColor: "warning.light",
                              fontWeight: "bold",
                            }),
                            ...(wordEvents.length > 0 && {
                              textDecoration: "underline",
                              textDecorationColor: wordEvents[0].metadata.color,
                            }),
                            "&:hover": {
                              backgroundColor: "action.hover",
                            },
                          }}
                          onClick={() => onWordClick(word)}
                        >
                          {word.text}
                        </Box>
                        {wordIndex < turn.words.length - 1 && " "}
                      </React.Fragment>
                    );
                  })}
                </Box>
              ) : (
                // Vue texte complet
                <Typography
                  component="div"
                  sx={{
                    fontSize: "inherit",
                    lineHeight: "inherit",
                  }}
                >
                  {turn.text}
                </Typography>
              )}
            </Box>

            {/* Événements du tour */}
            {turnEvents.length > 0 && (
              <Box sx={{ marginTop: 1, paddingTop: 1 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", marginBottom: 0.5 }}
                >
                  Événements ({turnEvents.length}):
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {turnEvents.map((event) => (
                    <EventOverlay
                      key={event.id}
                      event={event}
                      onClick={onEventClick}
                      position="overlay"
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Paper>
        );
      })}
    </Box>
  );
};

// Vue hybride (combine les deux approches)
interface HybridViewProps {
  transcription: Word[];
  events: TemporalEvent[];
  currentWordIndex: number;
  fontSize: number;
  onWordClick: (word: Word) => void;
  onEventClick: (event: TemporalEvent) => void;
  currentTime: number;
}

const HybridView: React.FC<HybridViewProps> = (props) => {
  const [viewMode, setViewMode] = useState<"paragraph" | "word">("paragraph");

  return (
    <Box>
      {/* Toggle entre les vues */}
      <Box
        sx={{
          padding: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
          backgroundColor: "action.hover", // Amélioration dark mode
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box sx={{ display: "flex", gap: 1 }}>
          <Chip
            label="Paragraphes"
            size="small"
            color={viewMode === "paragraph" ? "primary" : "default"}
            onClick={() => setViewMode("paragraph")}
            clickable
          />
          <Chip
            label="Mots"
            size="small"
            color={viewMode === "word" ? "primary" : "default"}
            onClick={() => setViewMode("word")}
            clickable
          />
        </Box>
      </Box>

      {/* Contenu selon le mode */}
      {viewMode === "paragraph" ? (
        <ParagraphView {...props} />
      ) : (
        <WordByWordView {...props} />
      )}
    </Box>
  );
};

// Composant principal TranscriptZone
export const TranscriptZone: React.FC<TranscriptZoneProps> = ({
  transcription,
  events,
  config,
  currentWordIndex,
  onWordClick,
  onTextSelection,
  onEventClick,
}) => {
  // Connexion au vrai hook audio au lieu du mock
  const { currentTime } = useAudio();

  // Handler pour la sélection de texte
  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      const selectedText = selection.toString();
      console.log("📄 Text selected:", selectedText);

      // Créer un objet TextSelection
      const textSelection: TextSelection = {
        startWordIndex: 0, // À calculer
        endWordIndex: 0, // À calculer
        selectedText,
        startTime: 0, // À calculer
        endTime: 0, // À calculer
      };

      onTextSelection(textSelection);
    }
  }, [onTextSelection]);

  // Rendu selon le mode d'affichage
  const renderTranscript = () => {
    const commonProps = {
      transcription,
      events,
      fontSize: config.fontSize,
      onWordClick,
      onEventClick,
      currentTime, // Maintenant c'est le vrai currentTime
    };

    switch (config.displayMode) {
      case "word-by-word":
        return (
          <WordByWordView
            {...commonProps}
            currentWordIndex={currentWordIndex}
          />
        );

      case "paragraphs":
        return <ParagraphView {...commonProps} />;

      case "hybrid":
        return (
          <HybridView {...commonProps} currentWordIndex={currentWordIndex} />
        );

      default:
        return <ParagraphView {...commonProps} />;
    }
  };

  return (
    <Paper
      sx={{
        flex: 1,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        maxHeight: config.layout.transcriptHeight,
        backgroundColor: "background.default",
      }}
      elevation={0}
      onMouseUp={
        config.interactions.textSelection ? handleTextSelection : undefined
      }
    >
      {/* Header avec stats */}
      <Box
        sx={{
          padding: "8px 16px",
          borderBottom: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
          Transcript ({transcription.length} mots)
        </Typography>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Typography variant="caption" color="text.secondary">
            Mode: {config.displayMode}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {events.length} événements
          </Typography>
          {currentWordIndex >= 0 && (
            <Typography variant="caption" color="primary">
              Mot {currentWordIndex + 1}/{transcription.length}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Contenu scrollable */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          backgroundColor: "background.default",
        }}
      >
        {transcription.length > 0 ? (
          renderTranscript()
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "text.secondary",
            }}
          >
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h6" color="text.secondary">
                Aucune transcription disponible
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Les données de transcription n'ont pas pu être chargées.
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* Footer avec raccourcis clavier (mode développement) */}
      {process.env.NODE_ENV === "development" &&
        config.interactions.keyboardShortcuts && (
          <Box
            sx={{
              padding: 1,
              borderTop: "1px solid",
              borderColor: "divider",
              backgroundColor: (theme) =>
                theme.palette.mode === "dark"
                  ? "background.paper"
                  : "action.hover",
              fontSize: "0.7rem",
              color: "text.secondary",
            }}
          >
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
              <span>Space: Play/Pause</span>
              <span>←→: Navigation</span>
              <span>Ctrl+Click: Ajouter événement</span>
              {config.interactions.textSelection && (
                <span>Shift+Sélection: Annoter</span>
              )}
            </Box>
          </Box>
        )}
    </Paper>
  );
};

// Hook utilitaire pour synchroniser le transcript avec l'audio
export const useTranscriptSync = (
  transcription: Word[],
  currentTime: number
) => {
  const currentWordIndex = useMemo(() => {
    if (!transcription.length || currentTime < 0) return -1;

    // Trouver le mot correspondant au temps actuel
    const currentWord = transcription.findIndex(
      (word) => currentTime >= word.start_time && currentTime <= word.end_time
    );

    if (currentWord >= 0) return currentWord;

    // Si pas de correspondance exacte, trouver le mot le plus proche
    let closestIndex = -1;
    let minDistance = Infinity;

    transcription.forEach((word, index) => {
      const wordMidTime = (word.start_time + word.end_time) / 2;
      const distance = Math.abs(currentTime - wordMidTime);

      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    // Retourner l'index seulement si la distance est raisonnable (< 2 secondes)
    return minDistance < 2 ? closestIndex : -1;
  }, [transcription, currentTime]);

  // Calculer les statistiques du tour de parole actuel
  const currentTurnStats = useMemo(() => {
    if (currentWordIndex < 0) return null;

    const currentWord = transcription[currentWordIndex];
    const speaker = currentWord.speaker;

    // Trouver tous les mots du même locuteur dans la séquence
    let startIndex = currentWordIndex;
    let endIndex = currentWordIndex;

    // Chercher le début du tour
    while (
      startIndex > 0 &&
      transcription[startIndex - 1].speaker === speaker
    ) {
      startIndex--;
    }

    // Chercher la fin du tour
    while (
      endIndex < transcription.length - 1 &&
      transcription[endIndex + 1].speaker === speaker
    ) {
      endIndex++;
    }

    const turnWords = transcription.slice(startIndex, endIndex + 1);
    const turnText = turnWords.map((w) => w.text).join(" ");

    return {
      speaker,
      startIndex,
      endIndex,
      wordCount: turnWords.length,
      text: turnText,
      duration:
        turnWords[turnWords.length - 1].end_time - turnWords[0].start_time,
      progress: (currentWordIndex - startIndex) / (endIndex - startIndex),
    };
  }, [transcription, currentWordIndex]);

  return {
    currentWordIndex,
    currentTurnStats,
    isValidPosition: currentWordIndex >= 0,
    totalWords: transcription.length,
    progressPercentage:
      transcription.length > 0
        ? Math.round(((currentWordIndex + 1) / transcription.length) * 100)
        : 0,
  };
};

// Hook pour la navigation par mots/tours
export const useTranscriptNavigation = (
  transcription: Word[],
  currentWordIndex: number,
  onSeek?: (time: number) => void
) => {
  const goToWord = useCallback(
    (index: number) => {
      if (index >= 0 && index < transcription.length && onSeek) {
        const word = transcription[index];
        onSeek(word.start_time);
      }
    },
    [transcription, onSeek]
  );

  const goToNextWord = useCallback(() => {
    if (currentWordIndex < transcription.length - 1) {
      goToWord(currentWordIndex + 1);
    }
  }, [currentWordIndex, transcription.length, goToWord]);

  const goToPreviousWord = useCallback(() => {
    if (currentWordIndex > 0) {
      goToWord(currentWordIndex - 1);
    }
  }, [currentWordIndex, goToWord]);

  const goToNextTurn = useCallback(() => {
    if (currentWordIndex < 0) return;

    const currentSpeaker = transcription[currentWordIndex].speaker;
    let nextTurnIndex = currentWordIndex;

    // Aller à la fin du tour actuel
    while (
      nextTurnIndex < transcription.length - 1 &&
      transcription[nextTurnIndex].speaker === currentSpeaker
    ) {
      nextTurnIndex++;
    }

    // Si on est au bout, aller au prochain tour différent
    if (nextTurnIndex < transcription.length - 1) {
      goToWord(nextTurnIndex + 1);
    }
  }, [currentWordIndex, transcription, goToWord]);

  const goToPreviousTurn = useCallback(() => {
    if (currentWordIndex < 0) return;

    const currentSpeaker = transcription[currentWordIndex].speaker;
    let prevTurnIndex = currentWordIndex;

    // Aller au début du tour actuel
    while (
      prevTurnIndex > 0 &&
      transcription[prevTurnIndex].speaker === currentSpeaker
    ) {
      prevTurnIndex--;
    }

    // Si on n'est pas au début, aller au tour précédent
    if (prevTurnIndex > 0) {
      // Trouver le début du tour précédent
      const prevSpeaker = transcription[prevTurnIndex].speaker;
      while (
        prevTurnIndex > 0 &&
        transcription[prevTurnIndex - 1].speaker === prevSpeaker
      ) {
        prevTurnIndex--;
      }
      goToWord(prevTurnIndex);
    }
  }, [currentWordIndex, transcription, goToWord]);

  return {
    goToWord,
    goToNextWord,
    goToPreviousWord,
    goToNextTurn,
    goToPreviousTurn,
    canGoNext: currentWordIndex < transcription.length - 1,
    canGoPrevious: currentWordIndex > 0,
  };
};

export default TranscriptZone;
