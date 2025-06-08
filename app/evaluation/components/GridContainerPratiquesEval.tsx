"use client";

import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { Tooltip } from "@mui/material";
import { useAppContext } from "@/context/AppContext";
import { useCallData } from "@/context/CallDataContext";
import { Pratique, Category, CategoriePratique } from "@/types/types";
import { useHighlightedPractices } from "@/hooks/useHighlightedPractices"; // ✅ HOOK SPÉCIALISÉ

interface GridContainerPratiquesEvalProps {
  categories: CategoriePratique[];
  items: Pratique[];
  columnConfig: {
    categoryIdKey: string;
    categoryNameKey: string;
    itemIdKey: string;
    itemNameKey: string;
  };
  onPratiqueClick?: (pratique: Pratique) => void;
  pratiquesDeLActivite: string[] | number[];
}

const GridContainerPratiquesEval: React.FC<GridContainerPratiquesEvalProps> = ({
  categories,
  items,
  columnConfig,
  onPratiqueClick,
  pratiquesDeLActivite,
}) => {
  const {
    updatePostit,
    idCallActivite,
    updatePostitToPratiqueMap,
    selectedPostit,
    setSelectedPostit,
  } = useCallData();

  const {
    idActivite,
    handleSelectPratique,
    setIdPratique,
    handleOpenDrawerWithData,
  } = useAppContext();

  // ✅ SOLUTION PROPRE : Hook spécialisé pour les pratiques mises en évidence
  const { highlightedPractices, loading: loadingRelations } =
    useHighlightedPractices(selectedPostit);

  const currentActivityId = idCallActivite || idActivite;

  // ✅ Debug pour vérifier
  console.log("🔍 GridContainerPratiquesEval - Hook spécialisé:", {
    selectedPostit: selectedPostit?.id,
    selectedPostitIdsujet: selectedPostit?.idsujet,
    highlightedPractices,
    loadingRelations,
  });

  // FONCTION ADAPTATIVE : Compatible avec ancien et nouveau comportement
  const handleItemClick = async (selectedItem: Pratique) => {
    console.log("🎯 GridContainer - Clic sur pratique:", selectedItem);

    if (!selectedPostit) {
      alert("⚠️ Aucun post-it actif !");
      return;
    }

    // NOUVEAU COMPORTEMENT : Si onPratiqueClick est fourni, l'utiliser (pour Postit)
    if (onPratiqueClick) {
      console.log("✅ Utilisation du nouveau système (onPratiqueClick)");
      onPratiqueClick(selectedItem);

      // Garder la logique locale pour l'interface
      handleSelectPratique(
        selectedPostit.idpratique === selectedItem.idpratique
          ? null
          : selectedItem
      );
      return;
    }

    // ANCIEN COMPORTEMENT : Logique originale pour compatibilité ascendante
    console.log("⚠️ Utilisation de l'ancien système (rétrocompatibilité)");

    const isSelectedForPostit =
      selectedPostit.pratique === selectedItem.nompratique;

    // 🔄 Mise à jour locale du post-it (ancien comportement)
    const updatedPostit = isSelectedForPostit
      ? { ...selectedPostit, pratique: "Non Assigné", idpratique: null }
      : {
          ...selectedPostit,
          pratique: selectedItem.nompratique,
          idpratique: selectedItem.idpratique,
        };

    // ✅ CORRECTION: Utiliser l'ID de la pratique au lieu du nom
    setSelectedPostit(updatedPostit);
    updatePostitToPratiqueMap(
      updatedPostit.id,
      isSelectedForPostit ? null : selectedItem.idpratique // ✅ FIXÉ: Utiliser l'ID au lieu du nom
    );

    // ✅ Met à jour le post-it dans Supabase (ancien comportement)
    await updatePostit(updatedPostit.id, {
      pratique: updatedPostit.pratique,
      idpratique: updatedPostit.idpratique, // ✅ Aussi mettre à jour l'ID si nécessaire
    });

    console.log("✅ Post-it mis à jour (mode rétrocompatibilité) !");
    handleSelectPratique(isSelectedForPostit ? null : selectedItem);
  };

  // ✅ Gestion du clic droit pour ouvrir le drawer (inchangé)
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
                // LOGIQUE ADAPTATIVE : Support des deux types de pratiquesDeLActivite
                const isAssociated =
                  Array.isArray(pratiquesDeLActivite) &&
                  pratiquesDeLActivite.length > 0
                    ? typeof pratiquesDeLActivite[0] === "number"
                      ? (pratiquesDeLActivite as number[]).includes(
                          item.idpratique
                        ) // IDs
                      : (pratiquesDeLActivite as string[]).includes(
                          item.nompratique
                        ) // Noms (ancien comportement)
                    : false;

                // LOGIQUE ADAPTATIVE : Support des deux modes de sélection
                const isSelectedForPostit = onPratiqueClick
                  ? selectedPostit?.idpratique === item.idpratique // Nouveau : par ID
                  : selectedPostit?.pratique === item.nompratique; // Ancien : par nom

                // ✅ SOLUTION PROPRE : Utiliser le hook spécialisé
                const isHighlighted = highlightedPractices.includes(
                  item.idpratique
                );

                // ✅ Debug pour les pratiques mises en évidence
                if (isHighlighted) {
                  console.log(
                    `🔗 Pratique ${item.nompratique} mise en évidence (hook spécialisé)`
                  );
                }

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
                        border: isHighlighted ? "2px dashed #FFA500" : "none", // ✅ Highlight du hook spécialisé
                        padding: "10px",
                        textAlign: "center",
                      }}
                    >
                      {item[columnConfig.itemNameKey]}{" "}
                      {isHighlighted ? "🔗" : ""}{" "}
                      {/* ✅ Emoji basé sur highlight du hook spécialisé */}
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
