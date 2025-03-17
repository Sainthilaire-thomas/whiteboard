"use client";

import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { Tooltip } from "@mui/material";
import { useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { useCallActivity } from "@/hooks/CallDataContext/useCallActivity";
import { ColumnConfig, Item, Category } from "@/types/types";

interface SimplifiedGridContainerSujetsProps {
  categories?: Category[];
  items?: Item[];
  columnConfig?: ColumnConfig;
}

const SimplifiedGridContainerSujets: React.FC<
  SimplifiedGridContainerSujetsProps
> = ({ categories = [], items = [], columnConfig }) => {
  const { idActivite, fetchSujetsForActivite, toggleSujet, sujetsForActivite } =
    useAppContext();
  const { idCallActivite } = useCallActivity();

  const currentActivityId = idCallActivite || idActivite;

  useEffect(() => {
    if (currentActivityId) {
      console.log(
        "📌 Chargement des sujets liés à l'activité:",
        currentActivityId
      );
      fetchSujetsForActivite(currentActivityId);
    }
  }, [currentActivityId, fetchSujetsForActivite]);

  // ✅ Vérification de columnConfig
  if (!columnConfig) {
    console.error(
      "⚠️ `columnConfig` est `undefined` dans SimplifiedGridContainerSujets !"
    );
    return (
      <Typography
        variant="body1"
        sx={{ textAlign: "center", padding: 2, color: "red" }}
      >
        Erreur : Configuration des colonnes manquante.
      </Typography>
    );
  }

  // ✅ Debugging logs
  console.log("📌 categoriesSujets:", categories);
  console.log("📌 sujets reçus (items):", items);

  // ✅ Filtrer les catégories contenant au moins un sujet (évite d'afficher des colonnes vides)
  const filteredCategories = categories.filter((category) =>
    items.some(
      (item) =>
        item[columnConfig.categoryIdKey] ===
        category[columnConfig.categoryIdKey]
    )
  );

  console.log("📌 Catégories filtrées pour affichage:", filteredCategories);

  return (
    <Grid
      container
      spacing={0}
      alignItems="stretch"
      sx={{ width: "100%", overflow: "auto" }}
    >
      {filteredCategories.length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: "center", padding: 2 }}>
          Aucun sujet disponible.
        </Typography>
      ) : (
        filteredCategories.map((category) => (
          <Grid
            item
            xs={12 / filteredCategories.length}
            key={category[columnConfig.categoryIdKey]}
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

            {items
              .filter(
                (item) =>
                  item[columnConfig.categoryIdKey] ===
                  category[columnConfig.categoryIdKey]
              )
              .map((item) => (
                <Tooltip
                  key={item[columnConfig.itemIdKey]}
                  title={item.description || ""}
                  placement="top"
                >
                  <Typography
                    variant="body2"
                    sx={{
                      cursor: "pointer",
                      backgroundColor: sujetsForActivite.includes(item.idsujet)
                        ? "red"
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
              ))}
          </Grid>
        ))
      )}
    </Grid>
  );
};

export default SimplifiedGridContainerSujets;
