import { Box, Slider, Tooltip } from "@mui/material";
import { TimeLineAudioProps, TimelineMarker } from "@/types/types";
import { Postit } from "@/types/types"; // ✅ Ajoute ceci
import { useCallData } from "@/context/CallDataContext";

const TimeLineAudio: React.FC<TimeLineAudioProps> = ({
  duration,
  currentTime,
  markers,
  onSeek,
  handlePostitClick,
}) => {
  const handleSeek = (_event: Event, newValue: number | number[]) => {
    if (typeof newValue === "number") {
      onSeek(newValue);
    }
  };
  const appelPostits = useCallData().appelPostits; // ✅ Récupère les post-its

  const handleMarkerClick = (
    event: React.MouseEvent<HTMLElement>,
    marker: TimelineMarker
  ) => {
    event.stopPropagation();

    // 🔍 Trouve le post-it correspondant dans `appelPostits`
    const matchingPostit = appelPostits.find((p) => p.id === marker.id);

    if (!matchingPostit) {
      console.warn("⚠ Aucun post-it trouvé pour cet ID:", marker.id);
      return;
    }

    // ✅ Utilise les vraies données du post-it
    const postit: Postit = {
      id: matchingPostit.id,
      timestamp: matchingPostit.timestamp,
      word: matchingPostit.word,
      wordid: matchingPostit.wordid,
      text: matchingPostit.text || "",
      iddomaine: matchingPostit.iddomaine,
      sujet: matchingPostit.sujet,
      pratique: matchingPostit.pratique,
      callid: matchingPostit.callid, // ✅ Ici on récupère le vrai `callid`
    };

    // 📌 Affiche le post-it
    handlePostitClick(event, postit);

    // 🎯 Aligne l'audio avec le post-it
    onSeek(marker.time);
  };

  return (
    <Box sx={{ width: "100%", position: "relative", padding: "10px" }}>
      {/* Barre de progression */}
      <Slider
        value={currentTime}
        min={0}
        max={duration}
        onChange={handleSeek}
        aria-labelledby="audio-timeline"
        sx={{ color: "primary.main" }}
      />

      {/* Marqueurs de post-its */}
      {markers.map((marker: TimelineMarker) => (
        <Tooltip key={marker.id} title={marker.label} placement="top">
          <Box
            sx={{
              position: "absolute",
              left: `${(marker.time / duration) * 100}%`,
              transform: "translateX(-50%)",
              top: "-10px",
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: "red",
              cursor: "pointer",
            }}
            onClick={(e) => handleMarkerClick(e, marker)}
          />
        </Tooltip>
      ))}
    </Box>
  );
};

export default TimeLineAudio;
