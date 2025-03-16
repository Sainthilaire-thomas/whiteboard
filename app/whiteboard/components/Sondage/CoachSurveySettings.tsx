"use client";

import { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from "@mui/material";
import { Delete as DeleteIcon, Save as SaveIcon } from "@mui/icons-material";
import { supabaseClient } from "@lib/supabaseClient";

export default function CoachSurveySettings() {
  const [openQuestion, setOpenQuestion] = useState("");
  const [closedQuestions, setClosedQuestions] = useState<
    { id: number; question: string }[]
  >([]);
  const [newClosedQuestion, setNewClosedQuestion] = useState("");

  // 📥 Récupère les paramètres existants au chargement
  useEffect(() => {
    const fetchSurveySettings = async () => {
      const { data, error } = await supabaseClient
        .schema("whiteboard")
        .from("survey_settings")
        .select("*")
        .single();

      if (error) {
        console.error("❌ Erreur de récupération :", error);
      } else if (data) {
        setOpenQuestion(data.open_question || "");
        setClosedQuestions(data.closed_questions || []);
      }
    };

    fetchSurveySettings();
  }, []);

  // 💾 Sauvegarde la question ouverte
  const saveOpenQuestion = async () => {
    const { error } = await supabaseClient
      .schema("whiteboard")
      .from("survey_settings")
      .update({ open_question: openQuestion })
      .eq("id", 1); // 🎯 Utilise l’ID correspondant

    if (error) console.error("❌ Erreur sauvegarde question ouverte :", error);
    else console.log("✅ Question ouverte sauvegardée !");
  };

  // ➕ Ajoute une question fermée
  const addClosedQuestion = async () => {
    if (!newClosedQuestion.trim()) return;

    const updatedQuestions = [
      ...closedQuestions,
      { id: Date.now(), question: newClosedQuestion },
    ];
    setClosedQuestions(updatedQuestions);
    setNewClosedQuestion("");

    const { error } = await supabaseClient
      .schema("whiteboard")
      .from("survey_settings")
      .update({ closed_questions: updatedQuestions })
      .eq("id", 1);

    if (error) console.error("❌ Erreur ajout question fermée :", error);
  };

  // 🗑️ Supprime une question fermée
  const deleteClosedQuestion = async (id: number) => {
    const updatedQuestions = closedQuestions.filter((q) => q.id !== id);
    setClosedQuestions(updatedQuestions);

    const { error } = await supabaseClient
      .schema("whiteboard")
      .from("survey_settings")
      .update({ closed_questions: updatedQuestions })
      .eq("id", 1);

    if (error) console.error("❌ Erreur suppression question fermée :", error);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
      <Typography variant="h5" gutterBottom>
        🎛️ Gestion du Sondage
      </Typography>

      {/* 📝 Édition de la question ouverte */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1">Question ouverte :</Typography>
        <TextField
          fullWidth
          value={openQuestion}
          onChange={(e) => setOpenQuestion(e.target.value)}
          placeholder="Ex : Que retenez-vous de cette séance ?"
          sx={{ mt: 1 }}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={saveOpenQuestion}
          sx={{ mt: 2 }}
        >
          Sauvegarder la question
        </Button>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* 🧩 Gestion des questions fermées */}
      <Typography variant="subtitle1" gutterBottom>
        Questions fermées :
      </Typography>

      <List>
        {closedQuestions.map((q) => (
          <ListItem key={q.id} divider>
            <ListItemText primary={q.question} />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                color="error"
                onClick={() => deleteClosedQuestion(q.id)}
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      {/* ➕ Ajouter une nouvelle question fermée */}
      <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
        <TextField
          fullWidth
          value={newClosedQuestion}
          onChange={(e) => setNewClosedQuestion(e.target.value)}
          placeholder="Nouvelle question fermée..."
        />
        <Button
          variant="contained"
          color="secondary"
          onClick={addClosedQuestion}
        >
          Ajouter
        </Button>
      </Box>
    </Box>
  );
}
