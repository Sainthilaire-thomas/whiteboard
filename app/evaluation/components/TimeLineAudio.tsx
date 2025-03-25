import { useEffect } from "react";
import { Box, Slider, Tooltip } from "@mui/material";
import {
  TimeLineAudioProps,
  TimelineMarker,
  Postit as PostitType, // ✅ Utilisation correcte du type
} from "@/types/types";
import { useCallData } from "@/context/CallDataContext";
import { useAppContext } from "@/context/AppContext";
import { useRouter } from "next/navigation";

const TimeLineAudio: React.FC<TimeLineAudioProps> = ({
  duration,
  currentTime,
  markers,
  onSeek,
}) => {
  const { fetchAllPostits, appelPostits } = useCallData(); // ou usePostits
  const router = useRouter();

  // ✅ État pour stocker le post-it sélectionné
  const { selectedPostit, setSelectedPostit } = useAppContext();

  // ✅ Fermer le post-it
  const handleClosePostit = () => {
    setSelectedPostit(null);
  };

  const handleMarkerClick = (
    event: React.MouseEvent<HTMLElement>,
    marker: TimelineMarker
  ) => {
    event.stopPropagation();

    // 🔍 Trouver le post-it correspondant
    const matchingPostit = appelPostits.find((p) => p.id === marker.id);
    if (!matchingPostit) {
      console.warn("⚠ Aucun post-it trouvé pour cet ID:", marker.id);
      return;
    }

    console.log(
      "📌 Ouverture du post-it depuis TimeLineAudio:",
      matchingPostit
    );

    setSelectedPostit({
      id: matchingPostit.id,
      timestamp: matchingPostit.timestamp,
      word: matchingPostit.word,
      wordid: matchingPostit.wordid,
      text: matchingPostit.text || "",
      sujet: matchingPostit.sujet,
      idsujet: matchingPostit.idsujet,
      iddomaine: matchingPostit.iddomaine,
      pratique: matchingPostit.pratique,
      callid: matchingPostit.callid,
    });
    router.push("/evaluation?view=postit");
    onSeek(marker.time);
  };

  useEffect(() => {
    fetchAllPostits();
  }, []);

  return (
    <Box sx={{ width: "100%", position: "relative", padding: "10px" }}>
      {/* Barre de progression */}
      <Slider
        value={currentTime}
        min={0}
        max={duration}
        onChange={(_, newValue) =>
          typeof newValue === "number" && onSeek(newValue)
        }
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
