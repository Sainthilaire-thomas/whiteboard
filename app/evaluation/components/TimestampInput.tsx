import { useState, useEffect, ChangeEvent, FC } from "react";
import { Box, TextField, Typography, Slider, IconButton } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { useCallData } from "@/context/CallDataContext";

// Définition des types pour les props
interface TimestampInputProps {
  onTimestampChange: (timestamp: string) => void;
  defaultTimestamp?: string;
  InputProps?: React.InputHTMLAttributes<HTMLInputElement>; // Ajoute cette ligne
}

const TimestampInput: FC<TimestampInputProps> = ({
  onTimestampChange,
  defaultTimestamp,
}) => {
  const { playAudioAtTimestamp } = useCallData();
  const [minutes, setMinutes] = useState<string>("00");
  const [seconds, setSeconds] = useState<string>("00");
  const [offset, setOffset] = useState<number>(0); // Décalage en secondes

  // Initialisation des valeurs minutes et secondes
  useEffect(() => {
    if (defaultTimestamp) {
      const [initialMinutes, initialSeconds] = defaultTimestamp.split(":");
      setMinutes(initialMinutes.padStart(2, "0"));
      setSeconds(initialSeconds.padStart(2, "0"));
    }
  }, [defaultTimestamp]);

  const handleMinutesBlur = () => {
    const formattedMinutes = String(Math.min(Number(minutes), 59)).padStart(
      2,
      "0"
    );
    setMinutes(formattedMinutes);
    onTimestampChange(`${formattedMinutes}:${seconds}`);
  };

  const handleMinutesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\s/g, "");
    if (/^\d{0,2}$/.test(value)) {
      setMinutes(value);
    }
  };

  const handleSecondsBlur = () => {
    const formattedSeconds = String(Math.min(Number(seconds), 59)).padStart(
      2,
      "0"
    );
    setSeconds(formattedSeconds);
    onTimestampChange(`${minutes}:${formattedSeconds}`);
  };

  const handleSecondsChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\s/g, "");
    if (/^\d{0,2}$/.test(value)) {
      setSeconds(value);
    }
  };

  // Fonction pour lancer l'audio avec le décalage
  const handlePlay = () => {
    const timestampInSeconds = parseInt(minutes) * 60 + parseInt(seconds);
    const adjustedTimestamp = Math.max(timestampInSeconds - offset, 0);
    playAudioAtTimestamp(adjustedTimestamp);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <TextField
          label="Minutes"
          value={minutes}
          onChange={handleMinutesChange}
          onBlur={handleMinutesBlur}
          variant="outlined"
          size="small"
          inputProps={{ maxLength: 2 }}
          sx={{
            width: "50px",
            bgcolor: "rgba(255, 249, 196, 0.6)",
            borderRadius: 1,
          }}
          InputLabelProps={{ style: { color: "black" } }}
          InputProps={{
            style: {
              color: "black",
              fontSize: "0.75rem",
              borderWidth: "1px",
            },
          }}
        />
        <Typography variant="h6" sx={{ color: "black" }}>
          :
        </Typography>
        <TextField
          label="Secondes"
          value={seconds}
          onChange={handleSecondsChange}
          onBlur={handleSecondsBlur}
          variant="outlined"
          size="small"
          inputProps={{ maxLength: 2 }}
          sx={{
            width: "50px",
            bgcolor: "rgba(255, 249, 196, 0.6)",
            borderRadius: 1,
          }}
          InputLabelProps={{ style: { color: "black" } }}
          InputProps={{
            style: {
              color: "black",
              fontSize: "0.75rem",
              borderWidth: "1px",
            },
          }}
        />
        <IconButton onClick={handlePlay} color="primary">
          <PlayArrowIcon />
        </IconButton>
      </Box>

      <Typography variant="caption">Décalage en secondes :</Typography>
      <Slider
        value={offset}
        onChange={(e, newValue) => setOffset(newValue as number)}
        min={0}
        max={10}
        step={1}
        valueLabelDisplay="auto"
        sx={{ mt: 0, mb: 1 }}
      />
    </Box>
  );
};

export default TimestampInput;
