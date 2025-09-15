// app/evaluation/components/NewTranscript/components/TranscriptZone/TurnsView.tsx

import React, { useMemo, useCallback, useRef, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { useAudio } from "@/context/AudioContext";

import { Word, TemporalEvent } from "../../types";

// ✅ SOLUTION SIMPLIFIÉE : Re-implémenter la logique speakers localement
enum SpeakerType {
  CONSEILLER = "conseiller",
  CLIENT = "client",
  UNKNOWN = "unknown",
}

// Utilitaires pour TurnsView - VERSION SIMPLIFIÉE
const turnsUtils = {
  formatTime: (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  },

  // ✅ Logique speakers simplifiée (basée sur SpeakerUtils)
  getSpeakerType: (turn: string): SpeakerType => {
    const turnLower = turn.toLowerCase();
    if (["turn1", "tc", "conseiller"].includes(turnLower)) {
      return SpeakerType.CONSEILLER;
    } else if (["turn2", "app", "appelant"].includes(turnLower)) {
      return SpeakerType.CLIENT;
    }
    return SpeakerType.UNKNOWN;
  },

  getSpeakerDisplayName: (speakerType: SpeakerType): string => {
    switch (speakerType) {
      case SpeakerType.CONSEILLER:
        return "Conseiller";
      case SpeakerType.CLIENT:
        return "Client";
      default:
        return "Inconnu";
    }
  },

  getSpeakerColor: (speakerType: SpeakerType): string => {
    switch (speakerType) {
      case SpeakerType.CONSEILLER:
        return "#d4a574";
      case SpeakerType.CLIENT:
        return "#5b9bd5";
      default:
        return "#666666";
    }
  },

  // ✅ Grouper les mots par tours (logique simplifiée)
  groupWordsByTurns: (words: Word[]) => {
    if (!words || words.length === 0) return [];

    const turns: Array<{
      speaker: string;
      startTime: number;
      endTime: number;
      words: Word[];
      text: string;
      speakerType: SpeakerType;
      turn: string;
    }> = [];

    let currentTurn: any = null;

    words.forEach((word) => {
      // Utiliser le champ turn ou speaker pour déterminer le locuteur
      const turnValue = word.turn || word.speaker || "unknown";
      const speakerType = turnsUtils.getSpeakerType(turnValue);

      // Si c'est le premier mot ou si le locuteur a changé
      if (!currentTurn || currentTurn.speakerType !== speakerType) {
        // Si on avait déjà un tour, on le sauvegarde
        if (currentTurn) {
          turns.push(currentTurn);
        }

        // On crée un nouveau tour
        currentTurn = {
          speaker: turnsUtils.getSpeakerDisplayName(speakerType),
          startTime: word.start_time,
          endTime: word.end_time,
          words: [word],
          text: word.text,
          speakerType,
          turn: turnValue,
        };
      } else {
        // On ajoute le mot au tour courant
        currentTurn.words.push(word);
        currentTurn.endTime = word.end_time;
        currentTurn.text += " " + word.text;
      }
    });

    // On n'oublie pas d'ajouter le dernier tour
    if (currentTurn) {
      turns.push(currentTurn);
    }

    return turns;
  },

  getEventsForTurn: (turn: any, events: TemporalEvent[]) => {
    return events.filter(
      (event) =>
        event.startTime >= turn.startTime && event.startTime <= turn.endTime
    );
  },
};

// Composant pour afficher un événement dans un tour
interface TurnEventMarkerProps {
  event: TemporalEvent;
  onClick: (event: TemporalEvent) => void;
}

const TurnEventMarker: React.FC<TurnEventMarkerProps> = ({
  event,
  onClick,
}) => {
  return (
    <Box
      component="span"
      sx={{
        display: "inline-block",
        margin: "0 2px",
        padding: "2px 6px",
        backgroundColor: event.metadata.color + "30",
        borderLeft: "3px solid",
        borderLeftColor: event.metadata.color,
        borderRadius: "3px",
        fontSize: "0.75rem",
        cursor: "pointer",
        verticalAlign: "middle",
        fontWeight: "bold",
        color: event.metadata.color,
        "&:hover": {
          backgroundColor: event.metadata.color + "50",
        },
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(event);
      }}
      title={event.data.text || event.metadata.category}
    >
      {event.metadata.category || "Event"}
    </Box>
  );
};

// Composant pour un tour de parole individuel
interface TurnRowProps {
  turn: {
    speaker: string;
    startTime: number;
    endTime: number;
    words: Word[];
    text: string;
    speakerType: SpeakerType;
    turn: string;
  };
  turnIndex: number;
  events: TemporalEvent[];
  currentTime: number;
  speakerColors: Record<string, string>;
  fontSize: number;
  onWordClick: (word: Word) => void;
  onEventClick: (event: TemporalEvent) => void;
  onTurnClick: (time: number) => void;
}

const TurnRow: React.FC<TurnRowProps> = ({
  turn,
  turnIndex,
  events,
  currentTime,
  speakerColors,
  fontSize,
  onWordClick,
  onEventClick,
  onTurnClick,
}) => {
  const isCurrentTurn =
    currentTime >= turn.startTime && currentTime <= turn.endTime;
  const turnEvents = turnsUtils.getEventsForTurn(turn, events);

  // Utiliser les couleurs calculées
  const speakerColor = turnsUtils.getSpeakerColor(turn.speakerType);

  const handleTurnClick = useCallback(() => {
    onTurnClick(turn.startTime);
  }, [turn.startTime, onTurnClick]);

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "auto",
        marginBottom: 1,
        padding: "8px 12px",
        borderRadius: "4px",
        backgroundColor: isCurrentTurn
          ? "rgba(25, 118, 210, 0.1)"
          : "transparent",
        border: isCurrentTurn
          ? "1px solid rgba(25, 118, 210, 0.3)"
          : "1px solid transparent",
        transition: "all 0.2s ease",
        "&:hover": {
          backgroundColor: "action.hover",
        },
      }}
    >
      {/* Colonne timestamp + speaker */}
      <Box
        sx={{
          minWidth: 120,
          maxWidth: 120,
          marginRight: 2,
          cursor: "pointer",
        }}
        onClick={handleTurnClick}
      >
        {/* Timestamp */}
        <Typography
          variant="caption"
          sx={{
            display: "block",
            fontSize: "0.75rem",
            color: "text.secondary",
            fontFamily: "monospace",
            lineHeight: 1.2,
          }}
        >
          {turnsUtils.formatTime(turn.startTime)}
        </Typography>

        {/* Speaker */}
        <Typography
          variant="body2"
          sx={{
            fontSize: "0.85rem",
            fontWeight: "bold",
            color: speakerColor,
            lineHeight: 1.2,
            marginTop: 0.5,
          }}
        >
          {turn.speaker}:
        </Typography>
      </Box>

      {/* Colonne contenu */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
        }}
      >
        {/* Texte du tour */}
        <Typography
          component="div"
          sx={{
            fontSize: fontSize,
            lineHeight: 1.6,
            color: "text.primary",
            cursor: "text",
            userSelect: "text",
            wordBreak: "break-word",
          }}
        >
          {/* Rendu mot par mot pour interaction précise */}
          {turn.words.map((word, wordIndex) => {
            const wordMidTime = (word.start_time + word.end_time) / 2;
            const isCurrentWord = Math.abs(wordMidTime - currentTime) < 0.5;

            return (
              <React.Fragment key={word.id}>
                <Box
                  component="span"
                  sx={{
                    cursor: "pointer",
                    padding: "1px 2px",
                    borderRadius: "2px",
                    ...(isCurrentWord && {
                      backgroundColor: "warning.light",
                      fontWeight: "bold",
                    }),
                    "&:hover": {
                      backgroundColor: "action.selected",
                    },
                  }}
                  onClick={() => onWordClick(word)}
                  title={`${word.text} (${turnsUtils.formatTime(word.start_time)})`}
                >
                  {word.text}
                </Box>
                {wordIndex < turn.words.length - 1 && " "}
              </React.Fragment>
            );
          })}

          {/* Événements du tour */}
          {turnEvents.map((event) => (
            <TurnEventMarker
              key={event.id}
              event={event}
              onClick={onEventClick}
            />
          ))}
        </Typography>
      </Box>
    </Box>
  );
};

// Props pour TurnsView
interface TurnsViewProps {
  transcription: Word[];
  events: TemporalEvent[];
  fontSize: number;
  speakerColors: Record<string, string>;
  showTimestamps?: boolean;
  onWordClick: (word: Word) => void;
  onEventClick: (event: TemporalEvent) => void;
}

// Composant principal TurnsView
export const TurnsView: React.FC<TurnsViewProps> = ({
  transcription,
  events,
  fontSize,
  speakerColors,
  showTimestamps = true,
  onWordClick,
  onEventClick,
}) => {
  const { currentTime, seekTo } = useAudio();
  const containerRef = useRef<HTMLDivElement>(null);

  // Grouper les mots par tours de parole
  const turns = useMemo(() => {
    console.log("🔍 DEBUG TurnsView - Grouping words:", {
      totalWords: transcription.length,
      sampleWords: transcription.slice(0, 5).map((w) => ({
        text: w.text,
        speaker: w.speaker,
        turn: w.turn,
      })),
    });

    const grouped = turnsUtils.groupWordsByTurns(transcription);

    console.log("🔍 DEBUG TurnsView - Grouped turns:", {
      totalTurns: grouped.length,
      turns: grouped.map((t) => ({
        speaker: t.speaker,
        speakerType: t.speakerType,
        wordCount: t.words.length,
        timeRange: `${turnsUtils.formatTime(t.startTime)} - ${turnsUtils.formatTime(t.endTime)}`,
      })),
    });

    return grouped;
  }, [transcription]);

  // Auto-scroll vers le tour actuel
  useEffect(() => {
    if (containerRef.current && currentTime > 0) {
      const currentTurnIndex = turns.findIndex(
        (turn) => currentTime >= turn.startTime && currentTime <= turn.endTime
      );

      if (currentTurnIndex >= 0) {
        const currentTurnElement = containerRef.current.querySelector(
          `[data-turn-index="${currentTurnIndex}"]`
        ) as HTMLElement;

        if (currentTurnElement) {
          currentTurnElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
          });
        }
      }
    }
  }, [currentTime, turns]);

  const handleTurnClick = useCallback(
    (time: number) => {
      if (seekTo) {
        seekTo(time);
      }
    },
    [seekTo]
  );

  return (
    <Box
      ref={containerRef}
      sx={{
        padding: 2,
        backgroundColor: "background.default",
        height: "100%",
        overflow: "auto",
      }}
    >
      {turns.map((turn, turnIndex) => (
        <Box key={turnIndex} data-turn-index={turnIndex}>
          <TurnRow
            turn={turn}
            turnIndex={turnIndex}
            events={events}
            currentTime={currentTime}
            speakerColors={speakerColors}
            fontSize={fontSize}
            onWordClick={onWordClick}
            onEventClick={onEventClick}
            onTurnClick={handleTurnClick}
          />
        </Box>
      ))}

      {/* Message si aucun contenu */}
      {turns.length === 0 && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "200px",
            color: "text.secondary",
          }}
        >
          <Typography variant="body1">
            Aucune transcription disponible
          </Typography>
        </Box>
      )}

      {/* Debug info en développement */}
      {process.env.NODE_ENV === "development" && (
        <Box
          sx={{
            marginTop: 2,
            padding: 1,
            backgroundColor: "action.hover",
            borderRadius: 1,
            fontSize: "0.7rem",
            color: "text.secondary",
          }}
        >
          <div>🔍 TurnsView Debug (Simplified):</div>
          <div>Total words: {transcription.length}</div>
          <div>Total turns: {turns.length}</div>
          <div>
            Speakers:{" "}
            {Array.from(new Set(turns.map((t) => t.speaker))).join(", ")}
          </div>
          <div>Implementation: Standalone (no SpeakerUtils dependency)</div>
        </Box>
      )}
    </Box>
  );
};

export default TurnsView;
