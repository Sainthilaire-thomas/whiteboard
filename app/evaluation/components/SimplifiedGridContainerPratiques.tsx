"use client";

import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { Tooltip } from "@mui/material";
import { useAppContext } from "@/context/AppContext";
import { useCallActivity } from "@/hooks/CallDataContext/useCallActivity";
import { Pratique, Category } from "@/types/types";
import { supabaseClient } from "@/lib/supabaseClient";

interface SimplifiedGridContainerPratiquesProps {
  categories?: Category[]; // Ajout de `?` pour éviter `undefined`
  items?: Pratique[]; // Ajout de `?` pour éviter `undefined`
  columnConfig: {
    categoryIdKey: keyof Pratique;
    categoryNameKey: keyof Category;
    itemIdKey: keyof Pratique;
    itemNameKey: keyof Pratique;
  };
  onPratiqueClick: (pratique: Pratique) => void;
}

const SimplifiedGridContainerPratiques: React.FC<
  SimplifiedGridContainerPratiquesProps
> = ({
  categories = [], // Valeur par défaut
  items = [], // Valeur par défaut
  columnConfig,
  onPratiqueClick,
}) => {
  const [localItems, setLocalItems] = useState<Pratique[]>(items);
  const { idActivite, handleSelectPratique, setIdPratique } = useAppContext();
  const { idCallActivite } = useCallActivity();
  const currentActivityId = idCallActivite || idActivite;

  // Debugging logs
  useEffect(() => {
    console.log("📌 `categories` reçues :", categories);
    console.log("📌 `items` reçus :", items);
  }, [categories, items]);

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

  if (!categories.length || !items.length) {
    return (
      <Typography variant="body1" sx={{ textAlign: "center", padding: 2 }}>
        Chargement des données...
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
      {categories.map((category) => (
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
          <Typography
            variant="subtitle2"
            sx={{
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

          {localItems
            .filter((item) => item[columnConfig.categoryIdKey] === category.id)
            .map((item) => (
              <Tooltip
                key={item[columnConfig.itemIdKey]}
                title={item.description || ""}
                placement="top"
              >
                <Typography
                  variant="body2"
                  onClick={() => onPratiqueClick(item)}
                  sx={{
                    cursor: "pointer",
                    backgroundColor:
                      item.valeurnumérique === 0 ? "red" : "inherit",
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

export default SimplifiedGridContainerPratiques;
