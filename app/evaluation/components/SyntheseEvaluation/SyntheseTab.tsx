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
import { useCallData } from "@/context/CallDataContext"; // ← AJOUT

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
    selectDomain,
  } = useAppContext();

  // ✅ AJOUT : Récupérer appelPostits pour détecter les changements
  const { appelPostits } = useCallData();

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

  // ✅ AJOUT : État pour gérer la détection automatique
  const [autoDetectedDomain, setAutoDetectedDomain] = useState<number | null>(
    null
  );
  const [shouldAutoSelect, setShouldAutoSelect] = useState<boolean>(false);

  const motifs = [
    "STAGIAIRE__ABSENCE",
    "INFORMATION_COLLECTIVE",
    "FORMATION__CONTENU",
    "FORMATION__LIEU",
    "POST_FORMATION",
    "FORMATION__EXISTE",
  ];

  // ✅ NOUVEAU : Effect pour détecter intelligemment le domaine au chargement
  useEffect(() => {
    console.log("🔄 Détection intelligente du domaine depuis les post-its");

    if (appelPostits && appelPostits.length > 0) {
      // Récupérer tous les domaines présents dans les post-its
      const domainesInPostits = appelPostits
        .filter((postit) => postit.iddomaine != null)
        .map((postit) => postit.iddomaine);

      const uniqueDomaines = [...new Set(domainesInPostits)];

      console.log("🔍 Domaines détectés dans les post-its:", uniqueDomaines);
      console.log("🔍 Nombre de domaines différents:", uniqueDomaines.length);

      if (uniqueDomaines.length === 1) {
        // ✅ CAS 1 : Un seul domaine → sélection automatique
        const singleDomain = uniqueDomaines[0];
        console.log(
          "✅ UN SEUL DOMAINE détecté:",
          singleDomain,
          "→ Sélection automatique"
        );

        setAutoDetectedDomain(singleDomain);
        setShouldAutoSelect(true);

        // Mettre à jour le domaine sélectionné dans le contexte
        if (selectedDomain !== singleDomain) {
          console.log(
            "🔄 Mise à jour automatique du domaine sélectionné:",
            singleDomain
          );
          selectDomain(singleDomain.toString());
        }
      } else if (uniqueDomaines.length > 1) {
        // ✅ CAS 2 : Plusieurs domaines → laisser l'utilisateur choisir
        console.log(
          "⚠️ PLUSIEURS DOMAINES détectés:",
          uniqueDomaines,
          "→ Choix utilisateur requis"
        );

        setAutoDetectedDomain(null);
        setShouldAutoSelect(false);

        // Optionnel : afficher une alerte pour informer l'utilisateur
      } else {
        // ✅ CAS 3 : Aucun domaine dans les post-its
        console.log("❌ Aucun domaine détecté dans les post-its");
        setAutoDetectedDomain(null);
        setShouldAutoSelect(false);
      }
    } else {
      console.log("❌ Aucun post-it disponible");
      setAutoDetectedDomain(null);
      setShouldAutoSelect(false);
    }
  }, [appelPostits]); // Se déclenche au chargement et quand les post-its changent

  // ✅ AJOUT : Effect pour détecter les changements dans les post-its
  useEffect(() => {
    console.log(
      "🔄 Changement détecté dans appelPostits:",
      appelPostits?.length
    );

    // Forcer la recalculation du score quand les post-its changent
    if (sujetsData && selectedDomain && ponderations.length > 0) {
      console.log("🔄 Recalcul forcé du score après changement des post-its");
      calculateScore();
    }
  }, [appelPostits]); // ← Dépendance sur appelPostits

  // ✅ MODIFICATION : Effects avec les bonnes dépendances
  useEffect(() => {
    console.log("🔄 useEffect loadPonderations");
    console.log("selectedDomain:", selectedDomain);
    console.log("appelPostits.length:", appelPostits?.length);

    if (selectedDomain && appelPostits && appelPostits.length > 0) {
      loadPonderations();
    }
  }, [selectedDomain, appelPostits]);

  useEffect(() => {
    console.log("🔄 useEffect calculateScore");
    console.log("selectedDomain:", selectedDomain);
    console.log("ponderations.length:", ponderations.length);

    if (selectedDomain && ponderations.length >= 0 && sujetsData) {
      calculateScore();
    }
  }, [ponderations, selectedDomain, appelPostits, sujetsData]);

  // Fonction pour charger les pondérations
  // ✅ MODIFICATION : Charger les pondérations pour le domaine sélectionné (pas auto-détecté)
  const loadPonderations = async () => {
    console.log("🔄 FONCTION loadPonderations démarrée");
    console.log("selectedDomain utilisé:", selectedDomain);

    if (!selectedDomain || !appelPostits) {
      console.log("❌ loadPonderations - Données manquantes");
      console.log("  selectedDomain:", selectedDomain);
      console.log("  appelPostits:", appelPostits?.length);
      return;
    }

    try {
      setLoadingScore(true);

      // ✅ IMPORTANT : Filtrer les post-its selon le domaine SÉLECTIONNÉ
      const postitsInSelectedDomain = appelPostits.filter(
        (postit) => postit.iddomaine === parseInt(selectedDomain.toString())
      );

      console.log(
        "📊 Post-its dans le domaine sélectionné:",
        postitsInSelectedDomain.length
      );

      if (postitsInSelectedDomain.length === 0) {
        console.log("❌ Aucun post-it dans le domaine sélectionné");
        setPonderations([]);
        return;
      }

      // Récupérer les IDs des sujets des post-its du domaine sélectionné
      const sujetIdsFromPostits = [
        ...new Set(
          postitsInSelectedDomain
            .filter((postit) => postit.idsujet != null)
            .map((postit) => postit.idsujet)
        ),
      ];

      console.log(
        "📊 IDs des sujets depuis les post-its du domaine",
        selectedDomain,
        ":",
        sujetIdsFromPostits
      );

      if (sujetIdsFromPostits.length === 0) {
        console.log("❌ Aucun sujet avec ID dans le domaine sélectionné");
        setPonderations([]);
        return;
      }

      // Récupérer les pondérations
      const { data, error } = await supabase
        .from("ponderation_sujets")
        .select("*")
        .in("idsujet", sujetIdsFromPostits);

      if (error) {
        console.log("❌ Erreur Supabase:", error);
        throw error;
      }

      console.log("✅ Pondérations trouvées:", data);
      setPonderations(data || []);
    } catch (err) {
      console.error("💥 Erreur lors du chargement des pondérations:", err);
      setPonderations([]);
    } finally {
      setLoadingScore(false);
    }
  };

  // ✅ MODIFICATION : Calculer le score pour le domaine sélectionné
  const calculateScore = () => {
    console.log("🔄 FONCTION calculateScore démarrée");
    console.log("Domaine sélectionné pour le calcul:", selectedDomain);

    if (!selectedDomain || !sujetsData || !appelPostits) {
      console.log("❌ Calcul impossible - données manquantes");
      setScoreData(null);
      return;
    }

    const selectedDomainId = parseInt(selectedDomain.toString());
    console.log("✅ Calcul du score pour le domaine:", selectedDomainId);

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

    // ✅ IMPORTANT : Tous les sujets du domaine SÉLECTIONNÉ
    const sujetsInSelectedDomain = sujetsData.filter(
      (s: any) => s.iddomaine === selectedDomainId
    );

    console.log(
      `📊 TOUS les sujets du domaine ${selectedDomainId}:`,
      sujetsInSelectedDomain.length
    );

    // ✅ IMPORTANT : Sujets évalués dans les post-its du domaine SÉLECTIONNÉ
    const sujetsEvaluesIds = new Set(
      appelPostits
        .filter(
          (postit) =>
            postit.idsujet != null && postit.iddomaine === selectedDomainId
        )
        .map((postit) => postit.idsujet)
    );

    console.log(
      "📊 Sujets évalués (NON CONFORMES) dans le domaine:",
      Array.from(sujetsEvaluesIds)
    );

    // Calculer le score pour chaque sujet du domaine sélectionné
    sujetsInSelectedDomain.forEach((sujet: any) => {
      console.log(
        "🔍 Traitement sujet:",
        sujet.nomsujet,
        "(ID:",
        sujet.idsujet,
        ")"
      );

      const ponderation = ponderations.find((p) => p.idsujet === sujet.idsujet);
      const pointsMax = ponderation ? ponderation.conforme : 3;

      let pointsObtenus: number;
      if (sujetsEvaluesIds.has(sujet.idsujet)) {
        // Sujet évalué dans les post-its = NON CONFORME
        pointsObtenus = ponderation ? ponderation.non_conforme : 0;
        console.log(
          `❌ ${sujet.nomsujet}: NON CONFORME (${pointsObtenus}/${pointsMax})`
        );
      } else {
        // Sujet non évalué = CONFORME
        pointsObtenus = pointsMax;
        console.log(
          `✅ ${sujet.nomsujet}: CONFORME (${pointsObtenus}/${pointsMax})`
        );
      }

      totalPoints += pointsObtenus;
      maxPoints += pointsMax;

      // Stats par catégorie
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
      categoryStats[categoryId].count += 1;

      if (sujetsEvaluesIds.has(sujet.idsujet)) {
        categoryStats[categoryId].sujetsNonConformes += 1;
      } else {
        categoryStats[categoryId].sujetsConformes += 1;
      }
    });

    // Construire les détails par catégorie
    const detailsByCategory: any[] = [];

    if (categoriesSujets) {
      categoriesSujets.forEach((categorie: any) => {
        const hasSujetsInDomain = sujetsData.some(
          (sujet) =>
            sujet.iddomaine === selectedDomainId &&
            sujet.idcategoriesujet === categorie.idcategoriesujet
        );

        if (hasSujetsInDomain) {
          const globalStats = categoryStats[categorie.idcategoriesujet];
          const percent =
            globalStats && globalStats.maxPoints > 0
              ? (globalStats.points / globalStats.maxPoints) * 100
              : 0;

          detailsByCategory.push({
            categoryName: categorie.nomcategorie,
            categoryColor: categorie.couleur || "#666",
            points: globalStats?.points || 0,
            maxPoints: globalStats?.maxPoints || 0,
            percent: percent,
            count: globalStats?.sujetsNonConformes || 0,
          });
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
      // ✅ AJOUT : Vider sujetsWithCategories si aucun sujet n'est trouvé
      console.log(
        "❌ Conditions non remplies pour traitement des sujets - reset à []"
      );
      setSujetsWithCategories([]);

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
      // ✅ AJOUT : Vider pratiquesWithCategories si aucune pratique n'est trouvée
      console.log(
        "❌ Conditions non remplies pour traitement des pratiques - reset à []"
      );
      setPratiquesWithCategories([]);
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
      {/* ✅ AJOUT : Alerte informative sur la détection */}
      {shouldAutoSelect && autoDetectedDomain && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <Typography variant="caption">
            ✅ Domaine détecté automatiquement :{" "}
            <strong>{autoDetectedDomain}</strong>
            (tous les post-its appartiennent au même domaine)
          </Typography>
        </Alert>
      )}

      {autoDetectedDomain && !shouldAutoSelect && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="caption">
            ℹ️ Plusieurs domaines détectés dans les post-its. Veuillez
            sélectionner le domaine pour calculer le score.
          </Typography>
        </Alert>
      )}
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
