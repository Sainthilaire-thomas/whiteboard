import { Grid, Typography, Tooltip } from "@mui/material";
import { useEffect, useMemo } from "react";
import { useAppContext } from "@/context/AppContext";
import { useCallActivity } from "@/hooks/CallDataContext/useCallActivity";
import {
  ColumnConfig,
  Item,
  Category,
  Postit as PostitType,
} from "@/types/types";

interface GridContainerSujetsEvalProps {
  categories: Category[];
  items: Item[];
  columnConfig: ColumnConfig;
  selectedPostit: PostitType | null; // ✅ Ajout de selectedPostit
  setSelectedPostit: (postit: PostitType) => void; // ✅ Ajout de setSelectedPostit
}

const GridContainerSujetsEval: React.FC<GridContainerSujetsEvalProps> = ({
  categories,
  items,
  columnConfig,
  selectedPostit,
  setSelectedPostit,
}) => {
  const {
    idActivite,
    fetchSujetsForActivite,
    toggleSujet,
    sujetsForActivite, // ✅ Contient uniquement des `idsujet`
  } = useAppContext();
  const { idCallActivite } = useCallActivity();

  const currentActivityId = idCallActivite || idActivite;

  // ✅ `useMemo` est maintenant avant `useEffect`, assurant un ordre stable des Hooks
  const sujetsSet = useMemo(
    () => new Set(sujetsForActivite),
    [sujetsForActivite]
  );

  useEffect(() => {
    if (currentActivityId) {
      fetchSujetsForActivite(currentActivityId);
    }
  }, [currentActivityId, fetchSujetsForActivite]);

  if (!currentActivityId) {
    return (
      <Typography variant="body1" sx={{ textAlign: "center", padding: 2 }}>
        Veuillez sélectionner un conseiller pour créer une activité.
      </Typography>
    );
  }

  if (!categories || !sujetsForActivite) {
    return (
      <Typography variant="body1" sx={{ textAlign: "center", padding: 2 }}>
        Chargement...
      </Typography>
    );
  }

  const filteredCategories = categories.filter((category) =>
    items.some(
      (item) =>
        item[columnConfig.categoryIdKey] ===
        category[columnConfig.categoryIdKey]
    )
  );

  const handleSujetClick = (item: Item) => {
    console.log("📌 Sujet cliqué:", item.nomsujet, "ID:", item.idsujet);

    toggleSujet(currentActivityId, item); // ✅ Ajoute ou supprime le sujet dans l'activité

    // ✅ Si un post-it est sélectionné, on met à jour ses données
    if (selectedPostit) {
      console.log("✅ Avant mise à jour du post-it actif:", selectedPostit);

      setSelectedPostit({
        ...selectedPostit,
        sujet: item.nomsujet, // ✅ Associe le sujet au post-it
        idsujet: item.idsujet, // ✅ Stocke l'ID du sujet
        iddomaine: item.iddomaine, // ✅ Met à jour le domaine si nécessaire
      });

      console.log("🔄 Après mise à jour du post-it actif:", {
        sujet: item.nomsujet,
        idsujet: item.idsujet,
        iddomaine: item.iddomaine,
      });
    }
  };

  return (
    <Grid
      container
      spacing={0}
      alignItems="stretch"
      sx={{ width: "auto", maxWidth: "100%", height: "100%", overflow: "auto" }}
    >
      {filteredCategories.map((category) => (
        <Grid
          item
          xs={12 / filteredCategories.length}
          key={category[columnConfig.categoryIdKey]}
          sx={{
            backgroundColor: category.couleur,
            borderLeft: "1px solid white",
            borderRight: "1px solid white",
          }}
        >
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

          {items
            .filter(
              (item) =>
                item[columnConfig.categoryIdKey] ===
                category[columnConfig.categoryIdKey]
            )
            .map((item) => {
              const isAssociated = sujetsSet.has(item.idsujet);

              return (
                <Tooltip
                  key={item[columnConfig.itemIdKey]}
                  title={item.description || ""}
                  disableTouchListener
                  enterDelay={50}
                  leaveDelay={0}
                  placement="left"
                >
                  <Typography
                    variant="body2"
                    onClick={() => handleSujetClick(item)}
                    sx={{
                      cursor: "pointer",
                      backgroundColor: isAssociated ? "red" : "inherit",
                      "&:hover": {
                        backgroundColor: isAssociated
                          ? "red"
                          : "rgba(255, 255, 255, 0.2)", // ✅ Fix hover
                      },
                      padding: "10px",
                      borderBottom: "1px solid white",
                      textAlign: "center",
                    }}
                  >
                    {item[columnConfig.itemNameKey]}
                  </Typography>
                </Tooltip>
              );
            })}
        </Grid>
      ))}
    </Grid>
  );
};

export default GridContainerSujetsEval;
