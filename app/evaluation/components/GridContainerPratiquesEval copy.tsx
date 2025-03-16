"use client";

import { Grid, Typography, Tooltip } from "@mui/material";
import { useEffect, useState, useCallback } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { useAppContext } from "@/context/AppContext";
import { useCallActivity } from "@/hooks/CallDataContext/useCallActivity";
import { Pratique, Category } from "@/types/types";

interface GridContainerPratiquesEvalProps {
  categories: Category[];
  items: Pratique[];
  columnConfig: {
    categoryIdKey: keyof Pratique;
    categoryNameKey: keyof Pratique;
    itemIdKey: keyof Pratique;
    itemNameKey: keyof Pratique;
  };
}

const GridContainerPratiquesEval: React.FC<GridContainerPratiquesEvalProps> = ({
  categories,
  items,
  columnConfig,
}) => {
  const [localItems, setLocalItems] = useState<Pratique[]>(items);

  const {
    highlightedPractices,
    idActivite,
    handleSelectPratique,
    setIdPratique,
    fetchNudgesForPractice,
    setNudges,
  } = useAppContext();

  const { idCallActivite } = useCallActivity();
  const currentActivityId = idCallActivite || idActivite;

  useEffect(() => {
    if (currentActivityId) {
      fetchPratiquesForActivite(currentActivityId);
    } else {
      setLocalItems(items);
    }
  }, [currentActivityId, items]);

  const fetchPratiquesForActivite = async (activityId: number) => {
    const { data, error } = await supabaseClient
      .from("activitesconseillers_pratiques")
      .select("idpratique, travaille")
      .eq("idactivite", activityId);

    if (error) {
      console.error("Erreur récupération pratiques:", error);
      return;
    }

    if (!Array.isArray(data) || data.length === 0) {
      setLocalItems(items);
      return;
    }

    const updatedItems = items.map((item) => {
      const activitePratique = data.find(
        (d) => d.idpratique === item.idpratique
      );
      return activitePratique
        ? { ...item, valeurnumérique: activitePratique.travaille ? 1 : 0 }
        : { ...item, valeurnumérique: 1 };
    });

    setLocalItems(updatedItems);
  };

  const handleItemClick = async (selectedItem: Pratique) => {
    handleSelectPratique(selectedItem);

    const newValue = selectedItem.valeurnumérique === 1 ? 0 : 1;

    // ✅ Mise à jour instantanée pour un feedback immédiat
    setLocalItems((prev) =>
      prev.map((item) =>
        item.idpratique === selectedItem.idpratique
          ? { ...item, valeurnumérique: newValue }
          : item
      )
    );

    if (!currentActivityId) {
      alert("Veuillez créer une activité d'abord !");
      return;
    }

    try {
      if (newValue === 0) {
        await supabaseClient
          .from("activitesconseillers_pratiques")
          .delete()
          .match({
            idactivite: currentActivityId,
            idpratique: selectedItem.idpratique,
          });
      } else {
        await supabaseClient.from("activitesconseillers_pratiques").insert({
          idactivite: currentActivityId,
          idpratique: selectedItem.idpratique,
          travaille: true,
        });

        const initialNudges = await fetchNudgesForPractice(
          selectedItem.idpratique
        );
        setNudges(initialNudges);
      }
    } catch (error) {
      console.error("Erreur gestion pratiques:", error);
    }
  };

  if (!currentActivityId) {
    return (
      <Typography variant="body1" sx={{ textAlign: "center", padding: 2 }}>
        Veuillez sélectionner un conseiller pour créer une activité.
      </Typography>
    );
  }

  if (!categories || !items) {
    return (
      <Typography variant="body1" sx={{ textAlign: "center", padding: 2 }}>
        Chargement...
      </Typography>
    );
  }

  return (
    <Grid
      container
      spacing={0}
      alignItems="stretch"
      sx={{
        width: "auto",
        maxWidth: "100%",
        height: "100%",
        overflow: "auto",
      }}
    >
      {categories.map((category) => (
        <Grid
          item
          xs={12 / categories.length}
          key={category[columnConfig.categoryIdKey]}
          sx={{
            backgroundColor: category.couleur,
            borderLeft: "1px solid white",
            borderRight: "1px solid white",
          }}
        >
          {/* Titre de la catégorie */}
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: "bold",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              textAlign: "center",
              padding: "6px",
              borderBottom: "1px solid white",
            }}
          >
            {category[columnConfig.categoryNameKey]}
          </Typography>

          {/* Liste des pratiques */}
          {localItems
            .filter(
              (item) =>
                item[columnConfig.categoryIdKey] ===
                category[columnConfig.categoryIdKey]
            )
            .map((item) => (
              <Tooltip
                key={item[columnConfig.itemIdKey]}
                title={item.description || ""}
                disableTouchListener
                enterDelay={50}
                leaveDelay={0}
                placement="top"
              >
                <Typography
                  variant="body2"
                  onClick={() => handleItemClick(item)}
                  sx={{
                    cursor: "pointer",
                    backgroundColor:
                      item.valeurnumérique === 0
                        ? "red"
                        : highlightedPractices.includes(item.idpratique)
                        ? "#28c30a"
                        : "inherit",
                    "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                    padding: "10px",
                    borderBottom: "1px solid white",
                    textAlign: "center",
                  }}
                >
                  {item[columnConfig.itemNameKey]}
                </Typography>
              </Tooltip>
            ))}
        </Grid>
      ))}
    </Grid>
  );
};

export default GridContainerPratiquesEval;
