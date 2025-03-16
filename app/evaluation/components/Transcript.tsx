import { useEffect, useState } from "react";
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
import AddPostitButton from "./AddPostitButton";
import { Word } from "@/types/types";
import { useAudio } from "@/hooks/CallDataContext/useAudio"; // Utilisation du hook
import TimelineAudio from "./TimeLineAudio";
import Postit from "./Postit";
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
  } = useCallData();

  const {
    isPlaying,
    playerRef,
    play,
    pause,
    setTime,
    audioSrc,
    setAudioSrc,
    currentWordIndex,
    updateCurrentWordIndex,
  } = useAudio();

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

  const handleWordClick = async (word: Word, index: number) => {
    if (!playerRef.current) return;

    const player = playerRef.current;

    // ✅ Vérifie si l'audio est bien prêt
    if (player.readyState < 2) {
      console.warn("⏳ Audio pas encore prêt, tentative annulée.");
      return;
    }

    // ✅ Déplace la lecture AVANT de jouer ou de mettre en pause
    setTime(word.startTime);

    // ✅ Attendre un court instant pour éviter les conflits play/pause
    await new Promise((resolve) => setTimeout(resolve, 50));

    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const handleAddPostit = () => {
    if (!currentWord || !playerRef.current || !selectedCall?.callid) {
      console.warn("Impossible de créer un post-it, données insuffisantes.");
      return;
    }

    const wordid = currentWord.wordid ?? 0;
    const wordText = currentWord.text ?? "Post-it";
    const timestamp = Math.floor(playerRef.current.currentTime);

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
      const currentTime = playerRef.current?.currentTime || 0;

      // Mise à jour de l'index si la transcription est disponible
      if (transcription?.words) {
        updateCurrentWordIndex(transcription.words, currentTime);
      }
    };

    const player = playerRef.current;
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

  // ✅ Styles conditionnels pour les tours de parole
  const getWordStyle = (index: number, word: Word) => ({
    fontWeight: index === currentWordIndex ? "bold" : "normal",
    color: index === currentWordIndex ? "red" : "inherit",
    backgroundColor:
      highlightTurnOne && word.turn === "turn1"
        ? "rgba(165, 141, 4, 0.5)" // Jaune transparent pour "turn1"
        : highlightTurnOne && word.turn === "turn2"
        ? "rgba(6, 158, 208, 0.5)" // Bleu transparent pour "turn2"
        : "transparent",
    padding: "2px 4px",
    borderRadius: "4px",
  });

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
      {audioSrc && (
        <Box sx={{ marginBottom: 2 }}>
          <TimelineAudio
            duration={playerRef.current?.duration || 0} // Durée totale de l'audio
            currentTime={playerRef.current?.currentTime || 0} // Temps de lecture actuel
            markers={postitMarkers} // Marqueurs issus des post-its
            onSeek={setTime} // ✅ Met à jour le player audio quand on clique sur la timeline
            handlePostitClick={handlePostitClick} // ✅ Gestion du clic sur un marqueur
          />
        </Box>
      )}
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
      <Paper sx={{ padding: 2, maxHeight: "400px", overflowY: "auto" }}>
        <Box>
          {transcription?.words && transcription.words.length > 0 ? (
            transcription.words.map((word: Word, index: number) => (
              <span
                key={index}
                style={getWordStyle(index, word)}
                onClick={() => handleWordClick(word, index)}
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

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mt: 1,
        }}
      >
        {audioSrc ? (
          <audio id="audioPlayer" ref={playerRef} controls src={audioSrc} />
        ) : (
          <Typography variant="body2" color="textSecondary">
            Aucun audio disponible pour cette transcription.
          </Typography>
        )}

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          {currentWord && selectedCall && (
            <AddPostitButton
              timestamp={Math.floor(playerRef.current?.currentTime || 0)}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Transcript;
