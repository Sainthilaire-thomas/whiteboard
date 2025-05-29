import { Grid, Typography, Tooltip, Box } from "@mui/material";
import { darken } from "@mui/material/styles";
import { useEffect, useMemo, memo } from "react";
import { useAppContext } from "@/context/AppContext";
import { useCallData } from "@/context/CallDataContext";
import {
  ColumnConfig,
  Item,
  Category,
  Postit as PostitType,
  Pratique,
} from "@/types/types";

interface GridContainerSujetsEvalProps {
  categories: Category[];
  items: Item[];
  columnConfig: ColumnConfig;
  handleSujetClick: (item: Item) => void;
  sujetsDeLActivite: number[];
}

const GridContainerSujetsEval: React.FC<GridContainerSujetsEvalProps> = ({
  categories,
  items,
  columnConfig,
  handleSujetClick,
  sujetsDeLActivite,
}) => {
  console.log("sujetsDeLActivite", sujetsDeLActivite);

  const {
    idActivite,
    fetchSujetsForActivite,
    handleSelectSujet,
    toggleSujet,
    sujetsForActivite, // ✅ Contient uniquement des `idsujet`
    setSujetsForActivite,
    initialSujetsForActivite,
  } = useAppContext();

  const { selectedPostit, setSelectedPostit } = useCallData();

  const { updatePostit, idCallActivite } = useCallData();

  const currentActivityId = idCallActivite || idActivite;

  // ✅ Créer un ensemble pour un accès plus rapide
  const sujetsSet = useMemo(
    () => new Set(sujetsForActivite),
    [sujetsForActivite]
  );
  const initialSujetsSet = useMemo(
    () => new Set(initialSujetsForActivite),
    [initialSujetsForActivite]
  );

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
      sx={{
        width: "auto",
        maxWidth: "100%",
        overflow: "auto",
        boxShadow: 1,
      }}
    >
      {filteredCategories.map((category) => (
        <Grid
          item
          xs={12 / filteredCategories.length}
          key={category[columnConfig.categoryIdKey]}
          sx={{
            backgroundColor: category.couleur,
            borderLeft: "0.5px solid white",
            borderRight: "0.5px solid white",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: "bold",
              backgroundColor: darken(String(category.couleur), 0.2),
              textAlign: "center",
              padding: "8px 6px", // Augmenté le padding vertical
              borderBottom: "0.5px solid white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 48, // 👈 Changé de height fixe à minHeight
              wordWrap: "break-word", // 👈 Permet le retour à la ligne
              hyphens: "auto", // 👈 Césure automatique
              lineHeight: 1.2, // 👈 Espacement des lignes optimisé
              fontSize: "0.875rem", // 👈 Taille de police légèrement réduite si nécessaire
            }}
          >
            {category[columnConfig.categoryNameKey]}
          </Typography>

          <Box sx={{ flex: 1 }}>
            {" "}
            {/* 👈 Container pour les items */}
            {items
              .filter(
                (item) =>
                  item[columnConfig.categoryIdKey] ===
                  category[columnConfig.categoryIdKey]
              )
              .map((item) => {
                const isAssociated = sujetsDeLActivite.includes(item.idsujet);
                const isSelectedForPostit =
                  selectedPostit?.idsujet === item.idsujet;

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
                        backgroundColor: isSelectedForPostit
                          ? "error.main"
                          : isAssociated
                          ? "gray"
                          : category.couleur,
                        "&:hover": {
                          backgroundColor: isSelectedForPostit
                            ? "error.main"
                            : isAssociated
                            ? "action.selected"
                            : "action.hover",
                        },
                        px: 1,
                        py: 0.5,
                        fontSize: "0.85rem",
                        lineHeight: 1.2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: 36,
                        borderBottom: "0.5px solid white",
                        textAlign: "center",
                      }}
                    >
                      {item[columnConfig.itemNameKey]}
                    </Typography>
                  </Tooltip>
                );
              })}
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};

export default memo(GridContainerSujetsEval);
