import { Box, Slider, Tooltip } from "@mui/material";
import { TimeLineAudioProps, TimelineMarker } from "@/types/types";

const TimeLineAudio: React.FC<TimeLineAudioProps> = ({
  duration,
  currentTime,
  markers,
  onSeek,
}) => {
  const handleSeek = (_event: Event, newValue: number | number[]) => {
    if (typeof newValue === "number") {
      onSeek(newValue);
    }
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
            onClick={() => onSeek(marker.time)}
          />
        </Tooltip>
      ))}
    </Box>
  );
};

export default TimeLineAudio;
