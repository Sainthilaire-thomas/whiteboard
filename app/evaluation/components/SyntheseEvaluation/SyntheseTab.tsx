"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  SelectChangeEvent,
  CircularProgress,
  Alert,
  LinearProgress,
  Divider,
} from "@mui/material";
import { TrendingUp, Assessment, Star, Warning } from "@mui/icons-material";
import { SyntheseTabProps } from "@/types/evaluation";
import { formatMotif } from "./utils/formatters";
import { useAppContext } from "@/context/AppContext";
import { useSupabase } from "@/context/SupabaseContext";

// Types pour le calcul de score
interface PonderationSujet {
  id_ponderation?: number;
  idsujet: number;
  conforme: number;
  partiellement_conforme: number;
  non_conforme: number;
  permet_partiellement_conforme: boolean;
}

interface ScoreCalculation {
  totalPoints: number;
  maxPoints: number;
  scorePercent: number;
  detailsByCategory: {
    categoryName: string;
    categoryColor: string;
    points: number;
    maxPoints: number;
    percent: number;
    count: number;
  }[];
}

const SyntheseTab: React.FC<SyntheseTabProps> = ({
  selectedCall,
  stats,
  selectedMotif,
  setSelectedMotif,
  formState,
  handleInputChange,
  setActiveTab,
  setSelectedSujet,
  setSelectedPratique,
}) => {
  // Récupérer les données depuis le contexte global
  const {
    sujetsData,
    categoriesSujets,
    pratiques,
    categoriesPratiques,
    selectedDomain,
  } = useAppContext();
  const { supabase } = useSupabase();

  // États pour les sujets et pratiques avec leurs catégories
  const [sujetsWithCategories, setSujetsWithCategories] = useState<any[]>([]);
  const [pratiquesWithCategories, setPratiquesWithCategories] = useState<any[]>(
    []
  );

  // États pour le calcul de score
  const [ponderations, setPonderations] = useState<PonderationSujet[]>([]);
  const [scoreData, setScoreData] = useState<ScoreCalculation | null>(null);
  const [loadingScore, setLoadingScore] = useState(false);

  const motifs = [
    "STAGIAIRE__ABSENCE",
    "INFORMATION_COLLECTIVE",
    "FORMATION__CONTENU",
    "FORMATION__LIEU",
    "POST_FORMATION",
    "FORMATION__EXISTE",
  ];

  // Charger les pondérations pour le domaine sélectionné
  useEffect(() => {
    console.log("🔄 ÉTAPE 1 - useEffect loadPonderations");
    console.log("selectedDomain:", selectedDomain);
    console.log("sujetsData:", sujetsData);
    console.log("sujetsData.length:", sujetsData?.length);

    if (selectedDomain && sujetsData && sujetsData.length > 0) {
      console.log("✅ Conditions remplies - Appel loadPonderations()");
      loadPonderations();
    } else {
      console.log("❌ Conditions non remplies pour loadPonderations");
    }
  }, [selectedDomain, sujetsData]);

  // Calculer le score quand les pondérations sont chargées OU quand les sujets sont disponibles
  useEffect(() => {
    console.log("🔄 ÉTAPE 2 - useEffect calculateScore");
    console.log("sujetsWithCategories.length:", sujetsWithCategories.length);
    console.log("selectedDomain:", selectedDomain);
    console.log("ponderations.length:", ponderations.length);

    if (sujetsWithCategories.length > 0 && selectedDomain) {
      console.log("✅ Conditions remplies - Appel calculateScore()");
      calculateScore();
    } else {
      console.log("❌ Conditions non remplies pour calculateScore");
      if (sujetsWithCategories.length === 0)
        console.log("  → sujetsWithCategories est vide");
      if (!selectedDomain) console.log("  → selectedDomain manquant");
    }
  }, [ponderations, sujetsWithCategories, selectedDomain]);

  // Fonction pour charger les pondérations
  const loadPonderations = async () => {
    console.log("🔄 FONCTION loadPonderations démarrée");

    if (!selectedDomain || !sujetsData) {
      console.log("❌ loadPonderations - Données manquantes");
      console.log("selectedDomain:", selectedDomain);
      console.log("sujetsData:", sujetsData);
      return;
    }

    console.log("🔍 Debug pondérations:");
    console.log("selectedDomain:", selectedDomain, typeof selectedDomain);
    console.log("sujetsData:", sujetsData);

    try {
      setLoadingScore(true);
      console.log("⏳ loadingScore = true");

      // Récupérer les IDs des sujets du domaine sélectionné
      const sujetIds = sujetsData
        .filter((s: any) => {
          const match = s.iddomaine === parseInt(selectedDomain as string);
          console.log(
            `  📋 Sujet ${s.nomsujet} (iddomaine: ${s.iddomaine}) - Match: ${match}`
          );
          return match;
        })
        .map((s: any) => s.idsujet);

      console.log("📊 Sujets filtrés pour ce domaine:", sujetIds);

      if (sujetIds.length === 0) {
        console.log("❌ Aucun sujet trouvé pour ce domaine");
        setPonderations([]);
        return;
      }

      console.log("🗄️ Requête Supabase pour pondérations...");
      const { data, error } = await supabase
        .from("ponderation_sujets")
        .select("*")
        .in("idsujet", sujetIds);

      if (error) {
        console.log("❌ Erreur Supabase:", error);
        throw error;
      }

      console.log("✅ Pondérations trouvées:", data);
      console.log("📊 Nombre de pondérations:", data?.length || 0);
      setPonderations(data || []);
    } catch (err) {
      console.error("💥 Erreur lors du chargement des pondérations:", err);
      setPonderations([]);
    } finally {
      setLoadingScore(false);
      console.log("✅ loadingScore = false");
    }
  };

  // Fonction pour calculer le score
  const calculateScore = () => {
    console.log("🔄 FONCTION calculateScore démarrée");
    console.log("🔢 Debug calcul score:");
    console.log("sujetsWithCategories:", sujetsWithCategories);
    console.log("ponderations:", ponderations);
    console.log("sujetsData (tous les sujets du domaine):", sujetsData);

    if (!sujetsData || !sujetsData.length) {
      console.log("❌ Calcul impossible - sujetsData vide");
      setScoreData(null);
      return;
    }

    console.log(
      "✅ Démarrage du calcul de score pour TOUS les sujets du domaine"
    );

    let totalPoints = 0;
    let maxPoints = 0;
    const categoryStats: {
      [key: number]: {
        points: number;
        maxPoints: number;
        count: number;
        sujetsConformes: number;
        sujetsNonConformes: number;
      };
    } = {};

    // Filtrer les sujets du domaine sélectionné
    const sujetsInDomain = sujetsData.filter(
      (s: any) => s.iddomaine === parseInt(selectedDomain as string)
    );

    console.log(
      `📊 Traitement de ${sujetsInDomain.length} sujets du domaine ${selectedDomain}`
    );

    // Pour CHAQUE sujet du domaine (pas seulement ceux évalués)
    sujetsInDomain.forEach((sujet: any) => {
      console.log("🔍 Traitement sujet:", sujet.nomsujet);

      // Vérifier si ce sujet est présent dans les évaluations (post-its)
      const sujetEvalue = sujetsWithCategories.find(
        (s: any) => s.name === sujet.nomsujet
      );

      let pointsObtenus: number;
      let pointsMax: number;

      // Obtenir la pondération pour ce sujet
      const ponderation = ponderations.find(
        (p: any) => p.idsujet === sujet.idsujet
      );

      if (ponderation) {
        pointsMax = ponderation.conforme;
        console.log(
          `📊 Pondération trouvée pour ${sujet.nomsujet}: max=${pointsMax}`
        );
      } else {
        pointsMax = 3; // Valeur par défaut
        console.log(
          `📊 Valeur par défaut pour ${sujet.nomsujet}: max=${pointsMax}`
        );
      }

      if (sujetEvalue) {
        // Sujet présent dans les évaluations = NON CONFORME
        pointsObtenus = ponderation ? ponderation.non_conforme : 0;
        console.log(
          `❌ ${sujet.nomsujet}: NON CONFORME (${pointsObtenus} points)`
        );
      } else {
        // Sujet absent des évaluations = CONFORME
        pointsObtenus = pointsMax;
        console.log(`✅ ${sujet.nomsujet}: CONFORME (${pointsObtenus} points)`);
      }

      totalPoints += pointsObtenus;
      maxPoints += pointsMax;

      // Grouper par catégorie - TOUS les sujets de chaque catégorie
      const categoryId = sujet.idcategoriesujet;
      if (!categoryStats[categoryId]) {
        categoryStats[categoryId] = {
          points: 0,
          maxPoints: 0,
          count: 0,
          sujetsConformes: 0,
          sujetsNonConformes: 0,
        };
      }

      categoryStats[categoryId].points += pointsObtenus;
      categoryStats[categoryId].maxPoints += pointsMax;
      categoryStats[categoryId].count += 1; // Chaque sujet compte pour 1

      if (sujetEvalue) {
        categoryStats[categoryId].sujetsNonConformes += 1;
      } else {
        categoryStats[categoryId].sujetsConformes += 1;
      }

      console.log(
        `📈 Catégorie ${categoryId}: +${pointsObtenus}/${pointsMax} points (${categoryStats[categoryId].sujetsConformes}✅/${categoryStats[categoryId].sujetsNonConformes}❌)`
      );
    });

    console.log("📊 Résultats finaux:", {
      totalPoints,
      maxPoints,
      categoryStats,
    });

    // Construire les détails par catégorie - BASÉ SUR LES SUJETS ÉVALUÉS MAIS AVEC LE SCORE GLOBAL DE LA CATÉGORIE
    const detailsByCategory: any[] = [];

    // D'abord, récupérer les stats globales par catégorie (pour les pourcentages)
    const categoryGlobalStats: {
      [key: number]: { points: number; maxPoints: number; sujetsTotal: number };
    } = {};

    // Calculer les stats globales par catégorie (tous les sujets du domaine)
    sujetsInDomain.forEach((sujet: any) => {
      const categoryId = sujet.idcategoriesujet;
      if (!categoryGlobalStats[categoryId]) {
        categoryGlobalStats[categoryId] = {
          points: 0,
          maxPoints: 0,
          sujetsTotal: 0,
        };
      }

      const sujetEvalue = sujetsWithCategories.find(
        (s: any) => s.name === sujet.nomsujet
      );
      const ponderation = ponderations.find(
        (p: any) => p.idsujet === sujet.idsujet
      );
      const pointsMax = ponderation ? ponderation.conforme : 3;
      const pointsObtenus = sujetEvalue
        ? ponderation
          ? ponderation.non_conforme
          : 0
        : pointsMax;

      categoryGlobalStats[categoryId].points += pointsObtenus;
      categoryGlobalStats[categoryId].maxPoints += pointsMax;
      categoryGlobalStats[categoryId].sujetsTotal += 1;
    });

    // Ensuite, construire les détails par catégorie basés sur les sujets évalués UNIQUES
    if (categoriesSujets && sujetsWithCategories.length > 0) {
      categoriesSujets.forEach((categorie: any) => {
        // Trouver les sujets évalués de cette catégorie
        const sujetsDeCategorie = sujetsWithCategories.filter(
          (sujet: any) => sujet.idcategoriesujet === categorie.idcategoriesujet
        );

        if (sujetsDeCategorie.length > 0) {
          // Compter le nombre de SUJETS UNIQUES non conformes (pas les occurrences)
          const nombreSujetsNonConformes = sujetsDeCategorie.length;

          // Récupérer les stats globales pour le pourcentage
          const globalStats = categoryGlobalStats[categorie.idcategoriesujet];
          const percent = globalStats
            ? globalStats.maxPoints > 0
              ? (globalStats.points / globalStats.maxPoints) * 100
              : 0
            : 0;

          const categoryDetail = {
            categoryName: categorie.nomcategorie,
            categoryColor: categorie.couleur || "#666",
            points: globalStats?.points || 0,
            maxPoints: globalStats?.maxPoints || 0,
            percent: percent,
            count: nombreSujetsNonConformes, // Nombre de SUJETS uniques non conformes
          };

          console.log(
            `📊 Catégorie ${
              categorie.nomcategorie
            }: ${nombreSujetsNonConformes} sujet(s) non conforme(s), ${Math.round(
              percent
            )}% de réussite globale`
          );
          detailsByCategory.push(categoryDetail);
        }
      });
    }

    const scorePercent = maxPoints > 0 ? (totalPoints / maxPoints) * 100 : 0;

    const finalScoreData = {
      totalPoints,
      maxPoints,
      scorePercent,
      detailsByCategory,
    };

    console.log("🎯 Score final calculé:", finalScoreData);
    setScoreData(finalScoreData);
    console.log("✅ setScoreData appelé avec:", finalScoreData);
  };

  // Fonction pour obtenir la couleur du score
  const getScoreColor = (percent: number) => {
    if (percent >= 80) return "#4caf50"; // Vert
    if (percent >= 60) return "#ff9800"; // Orange
    return "#f44336"; // Rouge
  };

  // Fonction pour obtenir l'icône du score
  const getScoreIcon = (percent: number) => {
    if (percent >= 80) return <Star sx={{ color: "#4caf50" }} />;
    if (percent >= 60) return <TrendingUp sx={{ color: "#ff9800" }} />;
    return <Warning sx={{ color: "#f44336" }} />;
  };

  // Associer les catégories aux sujets/pratiques
  useEffect(() => {
    console.log("🔄 ÉTAPE 3 - useEffect traitement stats");
    console.log("stats:", stats);
    console.log("stats.sujetsDetails:", stats.sujetsDetails);
    console.log("stats.sujetsDetails?.length:", stats.sujetsDetails?.length);
    console.log("sujetsData:", sujetsData);
    console.log("sujetsData?.length:", sujetsData?.length);

    // Traitement des sujets
    if (
      stats.sujetsDetails &&
      stats.sujetsDetails.length > 0 &&
      sujetsData &&
      sujetsData.length > 0
    ) {
      console.log("✅ Conditions remplies pour traitement des sujets");

      const withCategories = stats.sujetsDetails
        .filter((sujetDetail: any) => {
          console.log("  📋 Filtrage sujetDetail:", sujetDetail);
          return sujetDetail && sujetDetail.name;
        })
        .map((sujetDetail: any) => {
          console.log("  🔍 Traitement sujetDetail:", sujetDetail);

          // Ignorer les "Non assigné"
          if (sujetDetail.name === "Non assigné") {
            console.log("  ⏭️ Ignoré: Non assigné");
            return null;
          }

          // Trouver l'objet sujet complet qui correspond au nom dans sujetsDetails
          const sujetComplete = sujetsData.find(
            (s: any) => s && s.nomsujet === sujetDetail.name
          );
          console.log("  🔎 sujetComplete trouvé:", sujetComplete);

          // Seulement inclure les sujets qui ont une catégorie valide
          if (sujetComplete && sujetComplete.idcategoriesujet) {
            const result = {
              ...sujetDetail,
              idcategoriesujet: sujetComplete.idcategoriesujet,
            };
            console.log("  ✅ Sujet avec catégorie:", result);
            return result;
          }
          console.log("  ❌ Sujet sans catégorie ou non trouvé");
          return null;
        })
        .filter((sujet: any) => {
          const isValid = sujet !== null;
          console.log("  🔄 Filtrage final, sujet valide:", isValid, sujet);
          return isValid;
        });

      console.log("📊 Résultat withCategories:", withCategories);
      setSujetsWithCategories(withCategories);
    } else {
      console.log("❌ Conditions non remplies pour traitement des sujets");
      if (!stats.sujetsDetails) console.log("  → stats.sujetsDetails manquant");
      if (stats.sujetsDetails?.length === 0)
        console.log("  → stats.sujetsDetails vide");
      if (!sujetsData) console.log("  → sujetsData manquant");
      if (sujetsData?.length === 0) console.log("  → sujetsData vide");
    }

    // Traitement des pratiques
    if (
      stats.pratiquesDetails &&
      stats.pratiquesDetails.length > 0 &&
      pratiques &&
      pratiques.length > 0
    ) {
      console.log("✅ Conditions remplies pour traitement des pratiques");

      const withCategories = stats.pratiquesDetails
        .filter((pratiqueDetail: any) => pratiqueDetail && pratiqueDetail.name)
        .map((pratiqueDetail: any) => {
          if (pratiqueDetail.name === "Non assigné") {
            return null;
          }

          const pratiqueComplete = pratiques.find(
            (p: any) => p && p.nompratique === pratiqueDetail.name
          );

          if (pratiqueComplete && pratiqueComplete.idcategoriepratique) {
            return {
              ...pratiqueDetail,
              idcategoriepratique: pratiqueComplete.idcategoriepratique,
            };
          }
          return null;
        })
        .filter((pratique: any) => pratique !== null);

      setPratiquesWithCategories(withCategories);
    } else {
      console.log("❌ Conditions non remplies pour traitement des pratiques");
    }
  }, [stats.sujetsDetails, stats.pratiquesDetails, sujetsData, pratiques]);

  const handleMotifChange = (event: SelectChangeEvent<string>) => {
    setSelectedMotif(event.target.value);
  };

  const handleSujetClick = (sujet: string) => {
    setSelectedSujet(sujet);
    setActiveTab(2); // Naviguer vers l'onglet de coaching
  };

  const handlePratiqueClick = (pratique: string) => {
    setSelectedPratique(pratique);
    setActiveTab(2); // Naviguer vers l'onglet de coaching
  };

  // Grouper les sujets par catégorie
  const sujetsByCategory =
    categoriesSujets && categoriesSujets.length > 0
      ? categoriesSujets
          .filter((categorie: any) => categorie && categorie.idcategoriesujet)
          .map((categorie: any) => {
            const sujets = sujetsWithCategories.filter(
              (sujet: any) =>
                sujet && sujet.idcategoriesujet === categorie.idcategoriesujet
            );
            return {
              ...categorie,
              sujets,
            };
          })
          .filter(
            (category: any) => category.sujets && category.sujets.length > 0
          )
      : [];

  // Grouper les pratiques par catégorie
  const pratiquesByCategory =
    categoriesPratiques && categoriesPratiques.length > 0
      ? categoriesPratiques
          .filter((categorie: any) => categorie && categorie.id)
          .map((categorie: any) => {
            const pratiquesFiltered = pratiquesWithCategories.filter(
              (pratique: any) =>
                pratique && pratique.idcategoriepratique === categorie.id
            );
            return {
              ...categorie,
              pratiques: pratiquesFiltered,
            };
          })
          .filter(
            (category: any) =>
              category.pratiques && category.pratiques.length > 0
          )
      : [];

  return (
    <Box sx={{ p: 1 }}>
      {/* Score global */}
      {selectedDomain && (
        <Card sx={{ mb: 2, borderLeft: "4px solid #2196f3" }}>
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            {loadingScore ? (
              <Box sx={{ display: "flex", alignItems: "center", py: 1 }}>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                <Typography variant="body2">Calcul en cours...</Typography>
              </Box>
            ) : scoreData ? (
              <>
                {/* En-tête compact avec score principal */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Assessment
                      sx={{ mr: 1, color: "primary.main", fontSize: 20 }}
                    />
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: "medium", color: "primary.main" }}
                    >
                      Score qualité
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      textAlign: "right",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    {getScoreIcon(scoreData.scorePercent)}
                    <Box>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: "bold",
                          color: getScoreColor(scoreData.scorePercent),
                          lineHeight: 1,
                        }}
                      >
                        {Math.round(scoreData.scorePercent)}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {scoreData.totalPoints}/{scoreData.maxPoints} pts
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Barre de progression compacte */}
                <LinearProgress
                  variant="determinate"
                  value={scoreData.scorePercent}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    mb: 2,
                    bgcolor: "grey.200",
                    "& .MuiLinearProgress-bar": {
                      bgcolor: getScoreColor(scoreData.scorePercent),
                    },
                  }}
                />

                {/* Tableau compact 2 colonnes - Scores par catégories du domaine sélectionné */}
                <Box sx={{ mt: 1 }}>
                  <Grid container spacing={2}>
                    {categoriesSujets
                      ?.filter((categorie) => {
                        // Filtrer seulement les catégories qui ont des sujets dans le domaine sélectionné
                        return sujetsData?.some(
                          (sujet) =>
                            sujet.iddomaine ===
                              parseInt(selectedDomain as string) &&
                            sujet.idcategoriesujet ===
                              categorie.idcategoriesujet
                        );
                      })
                      .map((categorie) => {
                        const categoryNonConformites =
                          sujetsWithCategories.filter(
                            (sujet) =>
                              sujet.idcategoriesujet ===
                              categorie.idcategoriesujet
                          );
                        const nombreNonConformites =
                          categoryNonConformites.length;
                        const categoryScore = scoreData.detailsByCategory.find(
                          (cat) => cat.categoryName === categorie.nomcategorie
                        );
                        const scorePercent = categoryScore
                          ? categoryScore.percent
                          : 100;

                        return (
                          <Grid item xs={6} key={categorie.idcategoriesujet}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                py: 0.5,
                                px: 1,
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 1,
                                bgcolor: "background.paper",
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "text.secondary", // Toujours gris pour le libellé
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  flex: 1,
                                  mr: 1,
                                }}
                              >
                                {categorie.nomcategorie}
                              </Typography>

                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontWeight: "bold",
                                    color:
                                      scorePercent >= 80
                                        ? "#4caf50"
                                        : scorePercent >= 60
                                        ? "#ff9800"
                                        : "#f44336",
                                  }}
                                >
                                  {Math.round(scorePercent)}%
                                </Typography>

                                {nombreNonConformites > 0 && (
                                  <Box
                                    sx={{
                                      minWidth: 16,
                                      height: 16,
                                      borderRadius: "50%",
                                      bgcolor: "error.main",
                                      color: "white",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: "0.6rem",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {nombreNonConformites}
                                  </Box>
                                )}
                              </Box>
                            </Box>
                          </Grid>
                        );
                      })}
                  </Grid>
                </Box>
              </>
            ) : (
              <Alert severity="info" sx={{ py: 1 }}>
                <Typography variant="caption">
                  Aucune pondération configurée pour ce domaine.
                </Typography>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      <Box sx={{ mb: 2 }}>
        <Typography
          variant="h6"
          sx={{ mb: 2, color: "text.primary", fontWeight: "medium" }}
        >
          Vue d'ensemble des évaluations
        </Typography>

        <Grid container spacing={2}>
          {/* STATISTIQUES DES SUJETS PAR CATÉGORIE */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: "100%", borderLeft: "4px solid #3f51b5" }}>
              <CardContent>
                <Typography
                  variant="subtitle1"
                  color="primary"
                  gutterBottom
                  fontWeight="medium"
                >
                  Critères qualité identifiés
                </Typography>

                {sujetsWithCategories.length > 0 &&
                sujetsByCategory.length > 0 ? (
                  sujetsByCategory.map((categorie: any) => (
                    <Box key={categorie.idcategoriesujet} sx={{ mb: 2 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          mb: 1,
                          fontWeight: "medium",
                          color: categorie.couleur || "#3f51b5",
                          borderLeft: `3px solid ${
                            categorie.couleur || "#3f51b5"
                          }`,
                          pl: 1,
                        }}
                      >
                        {categorie.nomcategorie}
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {categorie.sujets.map((sujet: any) => (
                          <Chip
                            key={sujet.name}
                            label={`${sujet.name} (${sujet.count})`}
                            size="small"
                            sx={{
                              m: 0.5,
                              borderColor: categorie.couleur || "#3f51b5",
                              color: categorie.couleur || "#3f51b5",
                              "&:hover": {
                                backgroundColor: `${
                                  categorie.couleur || "#3f51b5"
                                }10`,
                              },
                            }}
                            variant="outlined"
                            onClick={() => handleSujetClick(sujet.name)}
                          />
                        ))}
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Aucun critère qualité identifié
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* STATISTIQUES DES PRATIQUES PAR CATÉGORIE */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: "100%", borderLeft: "4px solid #f50057" }}>
              <CardContent>
                <Typography
                  variant="subtitle1"
                  color="secondary"
                  gutterBottom
                  fontWeight="medium"
                >
                  Pratiques à renforcer
                </Typography>

                {pratiquesWithCategories.length > 0 &&
                pratiquesByCategory.length > 0 ? (
                  pratiquesByCategory.map((categorie: any) => (
                    <Box key={categorie.id} sx={{ mb: 2 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          mb: 1,
                          fontWeight: "medium",
                          color: categorie.couleur || "#f50057",
                          borderLeft: `3px solid ${
                            categorie.couleur || "#f50057"
                          }`,
                          pl: 1,
                        }}
                      >
                        {categorie.name}
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {categorie.pratiques.map((pratique: any) => (
                          <Chip
                            key={pratique.name}
                            label={`${pratique.name} (${pratique.count})`}
                            size="small"
                            sx={{
                              m: 0.5,
                              borderColor: categorie.couleur || "#f50057",
                              color: categorie.couleur || "#f50057",
                              "&:hover": {
                                backgroundColor: `${
                                  categorie.couleur || "#f50057"
                                }10`,
                              },
                            }}
                            variant="outlined"
                            onClick={() => handlePratiqueClick(pratique.name)}
                          />
                        ))}
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Aucune pratique identifiée
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default SyntheseTab;
