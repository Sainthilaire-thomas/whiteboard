"use client";

import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { Tooltip } from "@mui/material";
import { useAppContext } from "@/context/AppContext";
import { useCallData } from "@/context/CallDataContext";
import { Pratique, Category, CategoriePratique } from "@/types/types";

interface GridContainerPratiquesEvalProps {
  categories: CategoriePratique[];
  items: Pratique[];
  columnConfig: {
    categoryIdKey: string;
    categoryNameKey: string;
    itemIdKey: string;
    itemNameKey: string;
  };
  onPratiqueClick: (pratique: Pratique) => void;
  pratiquesDeLActivite: string[]; // ← ✅ AJOUT ICI
}

const GridContainerPratiquesEval: React.FC<GridContainerPratiquesEvalProps> = ({
  categories,
  items,
  columnConfig,
  pratiquesDeLActivite,
}) => {
  console.log("pratiquesdeLActivite", pratiquesDeLActivite);

  const { updatePostit, idCallActivite, updatePostitToPratiqueMap } =
    useCallData();
  const {
    highlightedPractices,
    idActivite,
    handleSelectPratique,
    setIdPratique,
    handleOpenDrawerWithData,
    selectedPostit,
    setSelectedPostit,
  } = useAppContext();

  const currentActivityId = idCallActivite || idActivite;

  // ✅ Gestion du clic sur une pratique (ajout/suppression)
  const handleItemClick = async (selectedItem: Pratique) => {
    console.log("🎯 Pratique cliquée:", selectedItem.nompratique);

    if (!selectedPostit) {
      alert("⚠️ Aucun post-it actif !");
      return;
    }

    const isSelectedForPostit =
      selectedPostit.pratique === selectedItem.nompratique;

    // 🔄 Mise à jour locale du post-it
    const updatedPostit = isSelectedForPostit
      ? { ...selectedPostit, pratique: "Non Assigné" }
      : { ...selectedPostit, pratique: selectedItem.nompratique };

    // ✅ Met à jour l'état local et le mapping
    setSelectedPostit(updatedPostit);
    updatePostitToPratiqueMap(
      updatedPostit.id,
      isSelectedForPostit ? null : updatedPostit.pratique
    );

    // ✅ Met à jour le post-it dans Supabase
    await updatePostit(updatedPostit.id, {
      pratique: updatedPostit.pratique,
    });

    console.log("✅ Post-it mis à jour !");
    handleSelectPratique(isSelectedForPostit ? null : selectedItem);
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
        const pratiquesFiltrees = items.filter(
          (item) => item[columnConfig.categoryIdKey] === category.id
        );

        return (
          <Grid
            item
            xs={12 / categories.length}
            key={category.id}
            sx={{ backgroundColor: category.couleur ?? "#ffffff" }}
          >
            {/* 📌 Affichage des pratiques */}
            {pratiquesFiltrees.length > 0 ? (
              pratiquesFiltrees.map((item) => {
                const isAssociated = pratiquesDeLActivite.includes(
                  item.nompratique
                );
                const isSelectedForPostit =
                  selectedPostit?.pratique === item.nompratique;
                const isHighlighted = highlightedPractices.includes(
                  item.idpratique
                );

                return (
                  <Tooltip
                    key={item[columnConfig.itemIdKey]}
                    title={item.description || ""}
                    placement="top"
                  >
                    <Typography
                      variant="body2"
                      onClick={() => handleItemClick(item)}
                      onContextMenu={(event) => handleRightClick(event, item)}
                      sx={{
                        cursor: "pointer",
                        backgroundColor: isSelectedForPostit
                          ? "red" // 🟥 Pratique active sur le post-it
                          : isAssociated
                          ? "gray" // 🟫 Pratique encore associée à l'activité
                          : category.couleur, // 🎨 Couleur d'origine si elle n'est plus associée
                        border: isHighlighted ? "2px dashed #FFA500" : "none", // ✨ Highlight si associée au sujet sélectionné
                        padding: "10px",
                        textAlign: "center",
                      }}
                    >
                      {item[columnConfig.itemNameKey]}{" "}
                      {isHighlighted ? "🔗" : ""}
                    </Typography>
                  </Tooltip>
                );
              })
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
