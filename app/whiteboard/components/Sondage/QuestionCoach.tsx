"use client";

import { useEffect, useState } from "react";
import { Box, Typography, TextField, Button } from "@mui/material";
import { supabaseClient } from "@lib/supabaseClient";
import { useCoach } from "@/hooks/whiteboard/useCoach";

export default function QuestionCoach() {
  const { isCoach } = useCoach();
  const [question, setQuestion] = useState<string>(
    "Chargement de la question..."
  );
  const [editedQuestion, setEditedQuestion] = useState<string>("");

  // 🔄 Récupération initiale + Abonnement en temps réel
  useEffect(() => {
    const fetchQuestion = async () => {
      const { data, error } = await supabaseClient
        .schema("whiteboard")
        .from("whiteboard_question")
        .select("*")
        .single();

      if (error) {
        console.error("❌ Erreur de récupération de la question :", error);
      } else if (data) {
        setQuestion(data.question);
        setEditedQuestion(data.question); // Pré-remplit le champ pour le coach
      }
    };

    fetchQuestion();

    // 📡 Abonnement Realtime à la table whiteboard_question
    const channel = supabaseClient
      .channel("whiteboard_question_realtime")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "whiteboard", table: "whiteboard_question" },
        (payload) => {
          const updatedQuestion = payload.new.question;
          setQuestion(updatedQuestion); // 🔄 Met à jour pour tous instantanément
          console.log("📢 Question mise à jour :", updatedQuestion);
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel); // 🧹 Nettoyage
    };
  }, []);

  // ✅ Fonction de mise à jour
  const handleUpdate = async () => {
    if (!editedQuestion.trim()) return;

    const { error } = await supabaseClient
      .schema("whiteboard")
      .from("whiteboard_question")
      .update({ question: editedQuestion })
      .eq("id", 1); // Supposant que la question a toujours l'id 1

    if (error) {
      console.error("❌ Erreur de mise à jour :", error);
    } else {
      console.log("✅ Question sauvegardée !");
    }
  };

  return (
    <Box sx={{ mb: 3, textAlign: "center" }}>
      {/* 👥 Affichage pour tous */}
      <Typography variant="h5" gutterBottom>
        {question}
      </Typography>

      {/* 📝 Édition réservée au coach */}
      {isCoach && (
        <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
          <TextField
            label="Modifier la question"
            value={editedQuestion}
            onChange={(e) => setEditedQuestion(e.target.value)}
            size="small"
            sx={{ width: "60%" }}
          />
          <Button variant="contained" onClick={handleUpdate}>
            Sauvegarder
          </Button>
        </Box>
      )}
    </Box>
  );
}
