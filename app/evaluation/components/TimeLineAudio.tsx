import React from "react";
import { Box, Slider, Tooltip } from "@mui/material";
import { useRouter } from "next/navigation";
import { useCallData } from "@/context/CallDataContext";
import { useAppContext } from "@/context/AppContext";
import { useAudio } from "@/context/AudioContext";

export interface TimelineMarker {
  id: number;
  time: number;
  label: string;
}

export interface TimeLineAudioProps {
  duration: number;
  currentTime: number;
  markers: TimelineMarker[];
  onSeek: (time: number) => void;
  onMarkerClick?: (id: number) => void;
}

/**
 * TimeLineAudio - Displays an interactive audio timeline with post-it markers
 */
const TimeLineAudio: React.FC<TimeLineAudioProps> = ({
  duration,
  currentTime,
  markers,
  onSeek,
  onMarkerClick,
}) => {
  // 🔄 CHANGEMENT : Récupérer appelPostits ET setSelectedPostit depuis CallDataContext
  const {
    appelPostits,
    setSelectedPostit, // ← DÉPLACÉ depuis AppContext vers CallDataContext
  } = useCallData();

  const router = useRouter();

  // 🔄 CHANGEMENT : Plus besoin de récupérer setSelectedPostit d'AppContext
  // const { setSelectedPostit } = useAppContext(); // ← SUPPRIMÉ

  const { executeWithLock } = useAudio();

  const handleMarkerClick = (
    event: React.MouseEvent<HTMLElement>,
    marker: TimelineMarker
  ) => {
    event.stopPropagation();

    // Utiliser executeWithLock pour gérer toutes les actions audio
    executeWithLock(async () => {
      // Find the corresponding post-it
      const matchingPostit = appelPostits.find((p) => p.id === marker.id);
      if (!matchingPostit) {
        console.warn("⚠️ Aucun post-it trouvé pour cet ID:", marker.id);
        return;
      }

      console.log(
        "📌 Ouverture du post-it depuis TimeLineAudio:",
        matchingPostit
      );

      // 🔄 CHANGEMENT : setSelectedPostit vient maintenant de CallDataContext
      console.log("✅ setSelectedPostit depuis CallDataContext");

      // Set the selected post-it (maintenant depuis CallDataContext)
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
        idpratique: matchingPostit.idpratique, // ← AJOUT du champ idpratique
        callid: matchingPostit.callid,
      });

      // Seek to the marker position - opération audio à protéger
      onSeek(marker.time);

      // Ajouter un délai pour s'assurer que le seek est terminé
      await new Promise((resolve) => setTimeout(resolve, 150));

      // If external handler provided, also call it
      if (onMarkerClick) {
        onMarkerClick(marker.id);
      }

      // Navigate to postit view
      router.push("/evaluation?view=postit");
    });
  };

  return (
    <Box
      sx={{
        width: "100%",
        position: "relative",
        padding: "10px 0",
      }}
    >
      {/* Progress bar */}
      <Slider
        value={currentTime}
        min={0}
        max={duration || 100}
        onChange={(_, newValue) =>
          typeof newValue === "number" && onSeek(newValue)
        }
        aria-labelledby="audio-timeline"
        sx={{ color: "primary.main" }}
      />

      {/* Post-it markers */}
      {markers &&
        markers.length > 0 &&
        markers.map((marker: TimelineMarker) => {
          const position = (marker.time / (duration || 1)) * 100;

          return (
            <Tooltip key={marker.id} title={marker.label} placement="top">
              <Box
                id={`marker-${marker.id}`}
                sx={{
                  position: "absolute",
                  left: `${position}%`,
                  top: "0px",
                  transform: "translateX(-50%)",
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: "red",
                  border: "2px solid white",
                  boxShadow: "0 0 4px rgba(0,0,0,0.3)",
                  cursor: "pointer",
                  zIndex: 2,
                  "&:hover": {
                    transform: "translateX(-50%) scale(1.2)",
                    transition: "transform 0.2s",
                    boxShadow: "0 0 6px rgba(0,0,0,0.5)",
                  },
                }}
                onClick={(e) => handleMarkerClick(e, marker)}
              />
            </Tooltip>
          );
        })}
    </Box>
  );
};

export default TimeLineAudio;
