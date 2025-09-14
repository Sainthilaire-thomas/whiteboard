import { useState, useEffect, ChangeEvent } from "react";
import {
  Box,
  List,
  ListItem,
  Button,
  TextField,
  Tooltip,
  Rating,
} from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import { useAppContext } from "@/context/AppContext";
import { supabaseClient } from "@/lib/supabaseClient";

// Définir le type des nudges
interface Nudge {
  nudge1?: string;
  nudge2?: string;
  nudge3?: string;
  nudge4?: string;
  nudge5?: string;
  nudge6?: string;
}

// Définir les props du composant Exercices

interface ExercicesProps {
  externalNudges: Nudge[]; // Nudges passés en props
}

const Exercices: React.FC<ExercicesProps> = ({ externalNudges }) => {
  const context = useAppContext();

  const reviews = context.reviews; // Accède directement à `reviews`
  const idActivite = context.idActivite; // Accède directement à `idActivite`
  const idPratique = context.idPratique; // Accède directement à `idPratique`

  // Tu peux aussi récupérer directement les autres valeurs :
  const activités = context.pratiques; // ou autres valeurs
  const nudges = context.nudges;
  const setNudges = context.setNudges;
  const markNudgesAsUpdated = context.markNudgesAsUpdated;

  const [editedNudges, setEditedNudges] = useState<Nudge>({});
  const [trainingDays, setTrainingDays] = useState<number>(0);

  useEffect(() => {
    if (externalNudges) {
      // Assurez-vous que vous assignez correctement les nudges avec les bonnes clés
      setEditedNudges(
        externalNudges.reduce((acc, curr, index) => {
          const key = `nudge${index + 1}` as keyof Nudge; // S'assurer que nous accédons à la clé correcte
          acc[key] = curr[key];
          return acc;
        }, {} as Nudge)
      );
    }
  }, [externalNudges]);

  const handleNudgeChange = (
    nudgeKey: keyof Nudge,
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setEditedNudges((prevNudges) => ({
      ...prevNudges,
      [nudgeKey]: event.target.value,
    }));
  };

  const handleTrainingDaysChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTrainingDays(Number(event.target.value));
  };

  const calculateNudgeDates = (totalDays: number) => {
    const today = new Date();
    const nudgeDates: Record<string, string> = {};

    // Calculer l'intervalle de jours entre chaque nudge
    const interval = totalDays / 6;

    for (let i = 1; i <= 6; i++) {
      // Calculer la date pour chaque nudge en répartissant les jours
      const nudgeDate = new Date(
        today.getTime() + i * (interval * 24 * 60 * 60 * 1000)
      );
      // Ajouter l'heure de base (9h30)
      nudgeDates[`custom_nudge${i}_date`] = addBaseTime(nudgeDate);
    }

    return nudgeDates;
  };

  // Fonction utilitaire pour ajouter l'heure de base à une date donnée
  const addBaseTime = (date: Date): string => {
    const baseTimeDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      9, // Heure
      30, // Minute
      0 // Seconde
    );
    return baseTimeDate.toISOString(); // Convertir la date en format ISO
  };

  const saveCustomNudges = async () => {
    if (!idActivite) {
      console.error("No activity ID provided.");
      return;
    }

    const nudgeDates = calculateNudgeDates(trainingDays);

    const customNudgesArray = {
      id_activite: idActivite,
      id_pratique: idPratique,
      custom_nudge1: editedNudges.nudge1 || null,
      custom_nudge2: editedNudges.nudge2 || null,
      custom_nudge3: editedNudges.nudge3 || null,
      custom_nudge4: editedNudges.nudge4 || null,
      custom_nudge5: editedNudges.nudge5 || null,
      custom_nudge6: editedNudges.nudge6 || null,
      custom_nudge1_date: String(nudgeDates.custom_nudge1_date) || "", // Assurez-vous que c'est une chaîne
      custom_nudge2_date: String(nudgeDates.custom_nudge2_date) || "", // Pareil ici
      custom_nudge3_date: String(nudgeDates.custom_nudge3_date) || "",
      custom_nudge4_date: String(nudgeDates.custom_nudge4_date) || "",
      custom_nudge5_date: String(nudgeDates.custom_nudge5_date) || "",
      custom_nudge6_date: String(nudgeDates.custom_nudge6_date) || "",
    };

    try {
      const { error } = await supabaseClient
        .from("custom_nudges")
        .upsert([customNudgesArray], {
          onConflict: "id_activite",
        });

      if (error) {
        console.error("Erreur lors de la sauvegarde des custom nudges:", error);
      } else {
        // Mise à jour de l'état de nudges avec un tableau de `Nudge[]`
        setNudges((prevNudges) => [
          ...prevNudges,
          ...Object.values(editedNudges).filter((val) => val !== undefined), // Filtrer les valeurs `undefined`
        ]);
        markNudgesAsUpdated();
      }
    } catch (error) {
      console.error("Erreur dans la fonction de sauvegarde des nudges:", error);
    }
  };

  const reviewsContent = reviews.map((review, index) => (
    <div
      key={index}
      style={{ display: "flex", alignItems: "center", gap: "10px" }}
    >
      <div>
        {review.avis} - {review.userlike} étoiles
        {/* ✅ Suppression du Tooltip avec comment */}
        <div>
          <Rating
            name={`rating-${index}`}
            value={review.userlike}
            readOnly
            size="small"
          />
        </div>
      </div>
    </div>
  ));

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
        maxHeight: "100%",
        padding: "10px",
        color: "black",
        "& .MuiTypography-root": {
          fontSize: "0.75rem",
        },
      }}
    >
      <List sx={{ overflow: "auto", maxHeight: 300, marginBottom: 2 }}>
        {Object.entries(editedNudges).map(([nudgeKey, nudgeValue]) => (
          <ListItem
            key={nudgeKey}
            sx={{
              display: "flex",
              alignItems: "flex-start",
              padding: "2px 0",
              "& .MuiListItemIcon-root": {
                minWidth: "36px",
              },
              "& .MuiListItemText-root": {
                ".MuiTypography-caption": {
                  fontSize: "0.75rem",
                },
              },
            }}
          >
            <TextField
              value={nudgeValue || ""}
              onChange={
                (event) => handleNudgeChange(nudgeKey as keyof Nudge, event) // Assurez-vous d'utiliser la bonne clé
              }
              variant="outlined"
              size="small"
              multiline
              rows={2}
              fullWidth
              sx={{
                flexGrow: 1,
                "& .MuiInputBase-input": {
                  fontSize: "0.7rem",
                },
              }}
            />
          </ListItem>
        ))}
      </List>
      <TextField
        label="Nombre de jours"
        variant="outlined"
        value={trainingDays}
        onChange={handleTrainingDaysChange}
        type="number"
        sx={{
          marginBottom: 2,
          ".MuiInputBase-input": {
            fontSize: "0.875rem",
          },
          ".MuiInputLabel-root": {
            fontSize: "0.875rem",
          },
        }}
      />
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Button
          variant="contained"
          onClick={saveCustomNudges}
          sx={{
            height: "40px",
            fontSize: "0.875rem",
          }}
        >
          Sauvegarder
        </Button>
        <Tooltip title={<div>{reviewsContent}</div>} placement="top" arrow>
          <Button>
            <ThumbUpIcon sx={{ color: "blue" }} />
          </Button>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default Exercices;
