"use client";

import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { useAppContext } from "@/context/AppContext";
import { useCallActivity } from "@/hooks/CallDataContext/useCallActivity";
import { Pratique, Category } from "@/types/types";

interface GridContainerPratiquesEvalProps {
  categories: Category[];
  items: Pratique[];
  columnConfig: {
    categoryIdKey: keyof Pratique;
    categoryNameKey: keyof Category;
    itemIdKey: keyof Pratique;
    itemNameKey: keyof Pratique;
  };
  onPratiqueClick: (pratique: Pratique) => void;
}

const GridContainerPratiquesEval: React.FC<GridContainerPratiquesEvalProps> = ({
  categories,
  items,
  columnConfig,
  onPratiqueClick,
}) => {
  const [localItems, setLocalItems] = useState<Pratique[]>(items);

  const {
    highlightedPractices,
    idActivite,
    handleSelectPratique,
    setIdPratique,
    handleOpenDrawerWithData,
  } = useAppContext();

  const { idCallActivite } = useCallActivity();
  const currentActivityId = idCallActivite || idActivite;

  // ✅ Récupération des pratiques associées à une activité (depuis Supabase)
  useEffect(() => {
    if (!currentActivityId) return;

    const fetchPratiquesForActivite = async () => {
      const { data, error } = await supabaseClient
        .from("activitesconseillers_pratiques")
        .select("idpratique, travaille")
        .eq("idactivite", currentActivityId);

      if (error) {
        console.error("Erreur récupération pratiques:", error);
        return;
      }

      const updatedItems = items.map((item) => {
        const activitePratique = data.find(
          (d) => d.idpratique === item.idpratique
        );
        return activitePratique
          ? { ...item, valeurnumérique: activitePratique.travaille ? 0 : 1 }
          : { ...item, valeurnumérique: 1 };
      });

      setLocalItems(updatedItems);
    };

    fetchPratiquesForActivite();
  }, [currentActivityId, items]);

  // ✅ Gestion du clic sur une pratique (toggle + mise à jour Supabase)
  const handleItemClick = async (selectedItem: Pratique) => {
    handleSelectPratique(selectedItem);
    setIdPratique(selectedItem.idpratique);

    const newValue = selectedItem.valeurnumérique === 1 ? 0 : 1;
    const updatedItems = localItems.map((item) =>
      item.idpratique === selectedItem.idpratique
        ? { ...item, valeurnumérique: newValue }
        : item
    );

    setLocalItems(updatedItems);
    onPratiqueClick(selectedItem);

    if (!currentActivityId) {
      alert("Veuillez créer une activité d'abord !");
      return;
    }

    try {
      if (newValue === 1) {
        await supabaseClient
          .from("activitesconseillers_pratiques")
          .delete()
          .match({
            idactivite: currentActivityId,
            idpratique: selectedItem.idpratique,
          });
      } else {
        await supabaseClient.from("activitesconseillers_pratiques").upsert({
          idactivite: currentActivityId,
          idpratique: selectedItem.idpratique,
          travaille: true,
        });
      }
    } catch (error) {
      console.error("Erreur gestion pratiques:", error);
    }
  };

  // ✅ Gestion du clic droit pour ouvrir le drawer
  const handleRightClick = (event: React.MouseEvent, item: Pratique) => {
    event.preventDefault();
    handleOpenDrawerWithData(item.idpratique, "conseiller");
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
      sx={{ width: "100%", overflow: "auto" }}
    >
      {/* ✅ Ajout du titre des colonnes (Catégories) */}
      <Grid item xs={12} sx={{ display: "flex" }}>
        {categories.map((category) => (
          <Typography
            key={category.id}
            variant="subtitle2"
            sx={{
              flex: 1,
              fontWeight: "bold",
              textAlign: "center",
              padding: "8px",
              backgroundColor: category.couleur,
              color: "white",
              border: "1px solid white",
            }}
          >
            {category[columnConfig.categoryNameKey]}
          </Typography>
        ))}
      </Grid>

      {categories.map((category) => {
        // 🔍 Filtrer les pratiques appartenant à cette catégorie
        const pratiquesFiltrees = localItems.filter(
          (item) => item[columnConfig.categoryIdKey] === category.id
        );

        console.log(
          "📌 `highlightedPractices` mis à jour :",
          highlightedPractices
        );

        return (
          <Grid
            item
            xs={12 / categories.length}
            key={category.id}
            sx={{
              backgroundColor: category.couleur ?? "#ffffff",
              borderLeft: "1px solid white",
              borderRight: "1px solid white",
            }}
          >
            {/* 📌 Affichage des pratiques */}
            {pratiquesFiltrees.length > 0 ? (
              pratiquesFiltrees.map((item) => (
                <Tooltip
                  title={item.description || ""}
                  key={item[columnConfig.itemIdKey]}
                  placement="top"
                >
                  <Typography
                    variant="body2"
                    onClick={() => handleItemClick(item)}
                    onContextMenu={(event) => handleRightClick(event, item)}
                    sx={{
                      cursor: "pointer",
                      backgroundColor:
                        item.valeurnumérique === 0
                          ? "red"
                          : highlightedPractices.includes(item.idpratique)
                          ? "#28c30a"
                          : "inherit",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                      },
                      padding: "10px",
                      borderBottom: "1px solid white",
                      textAlign: "center",
                    }}
                  >
                    {item[columnConfig.itemNameKey]}
                  </Typography>
                </Tooltip>
              ))
            ) : (
              <Typography
                variant="body2"
                sx={{
                  textAlign: "center",
                  padding: "10px",
                  fontStyle: "italic",
                  color: "gray",
                }}
              >
                Aucune pratique
              </Typography>
            )}
          </Grid>
        );
      })}
    </Grid>
  );
};

export default GridContainerPratiquesEval;
