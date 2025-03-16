import { Grid, Typography, Tooltip } from "@mui/material";
import { useEffect, useMemo } from "react";
import { useAppContext } from "@/context/AppContext";
import { useCallActivity } from "@/hooks/CallDataContext/useCallActivity";
import { ColumnConfig, Item, Category } from "@/types/types";

interface GridContainerSujetsEvalProps {
  categories: Category[];
  items: Item[];
  columnConfig: ColumnConfig;
}

const GridContainerSujetsEval: React.FC<GridContainerSujetsEvalProps> = ({
  categories,
  items,
  columnConfig,
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
                    onClick={() => toggleSujet(currentActivityId, item)}
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
