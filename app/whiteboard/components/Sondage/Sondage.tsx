"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Rating,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Paper,
} from "@mui/material";
import { supabaseClient } from "@lib/supabaseClient";
import { useCoach } from "@/hooks/whiteboard/useCoach";

export default function Sondage() {
  const { isCoach } = useCoach();
  const [rating, setRating] = useState<number | null>(0);
  const [feedback, setFeedback] = useState("");
  const [email, setEmail] = useState("");
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [surveySettings, setSurveySettings] = useState({
    question_open: "Que retenez-vous de cette séance ?",
    question_closed:
      "Souhaitez-vous en savoir plus sur les outils employés pendant l'atelier ?",
    closed_options: ["Oui", "Non"],
  });

  useEffect(() => {
    const fetchSurveySettings = async () => {
      const { data, error } = await supabaseClient
        .schema("whiteboard")
        .from("survey_settings")
        .select("*")
        .single();

      if (data) setSurveySettings(data);
      if (error)
        console.error("❌ Erreur de récupération des paramètres:", error);
    };

    fetchSurveySettings();
  }, []);

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async () => {
    if (selectedOption === "Oui" && (!email || !validateEmail(email))) {
      alert("Veuillez entrer un email valide.");
      return;
    }

    const { error } = await supabaseClient
      .schema("whiteboard")
      .from("survey_responses")
      .insert({
        rating,
        feedback,
        closed_answer: selectedOption,
        email: selectedOption === "oui" ? email : null,
      });

    if (error) {
      console.error("❌ Erreur d'envoi du sondage:", error);
    } else {
      alert("✅ Merci pour votre retour !");
      setRating(0);
      setFeedback("");
      setSelectedOption("");
      setEmail("");
    }
  };

  return (
    <Box sx={{ maxWidth: 600, margin: "0 auto", p: 3 }}>
      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h6" gutterBottom>
          Notez la séance :
        </Typography>
        <Rating
          value={rating}
          onChange={(_, newValue) => setRating(newValue)}
          max={5}
          sx={{ mb: 2 }}
        />

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          {surveySettings.question_open}
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Votre retour..."
          sx={{ mb: 2 }}
        />

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          {surveySettings.question_closed}
        </Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Choisissez une réponse</InputLabel>
          <Select
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
            label="Choisissez une réponse"
          >
            {surveySettings.closed_options.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedOption.toLowerCase() === "oui" && (
          <TextField
            fullWidth
            label="Votre email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="exemple@domaine.com"
            sx={{ mb: 2 }}
            required
          />
        )}

        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleSubmit}
        >
          Envoyer le sondage
        </Button>
      </Paper>

      {isCoach && (
        <SurveySettingsEditor
          settings={surveySettings}
          setSettings={setSurveySettings}
        />
      )}
    </Box>
  );
}

// 📝 ✅ Composant Éditeur pour le coach
function SurveySettingsEditor({
  settings,
  setSettings,
}: {
  settings: any;
  setSettings: any;
}) {
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => setLocalSettings(settings), [settings]);

  const handleSave = async () => {
    const { error } = await supabaseClient
      .schema("whiteboard")
      .from("survey_settings")
      .update(localSettings)
      .eq("id", 1);

    if (error) {
      console.error("❌ Erreur lors de la sauvegarde des paramètres:", error);
    } else {
      setSettings(localSettings);
      alert("✅ Paramètres sauvegardés !");
    }
  };

  return (
    <Box sx={{ mt: 4, p: 3, border: "1px solid #ccc", borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Paramètres du sondage (Coach)
      </Typography>

      <TextField
        fullWidth
        label="Question ouverte"
        value={localSettings.question_open}
        onChange={(e) =>
          setLocalSettings({ ...localSettings, question_open: e.target.value })
        }
        sx={{ my: 2 }}
      />

      <TextField
        fullWidth
        label="Question fermée"
        value={localSettings.question_closed}
        onChange={(e) =>
          setLocalSettings({
            ...localSettings,
            question_closed: e.target.value,
          })
        }
        sx={{ my: 2 }}
      />

      <TextField
        fullWidth
        label="Options (séparées par des virgules)"
        value={localSettings.closed_options.join(", ")}
        onChange={(e) =>
          setLocalSettings({
            ...localSettings,
            closed_options: e.target.value.split(",").map((opt) => opt.trim()),
          })
        }
        sx={{ my: 2 }}
      />

      <Button variant="contained" color="secondary" onClick={handleSave}>
        Sauvegarder les paramètres
      </Button>
    </Box>
  );
}
