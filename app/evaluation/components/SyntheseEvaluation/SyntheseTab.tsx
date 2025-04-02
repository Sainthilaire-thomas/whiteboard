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
} from "@mui/material";
import { SyntheseTabProps } from "@/types/evaluation";
import { formatMotif } from "./utils/formatters";
import { useAppContext } from "@/context/AppContext";

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
  const { sujetsData, categoriesSujets, pratiques, categoriesPratiques } =
    useAppContext();

  // État pour les sujets et pratiques avec leurs catégories
  const [sujetsWithCategories, setSujetsWithCategories] = useState([]);
  const [pratiquesWithCategories, setPratiquesWithCategories] = useState([]);

  const motifs = [
    "STAGIAIRE__ABSENCE",
    "INFORMATION_COLLECTIVE",
    "FORMATION__CONTENU",
    "FORMATION__LIEU",
    "POST_FORMATION",
    "FORMATION__EXISTE",
  ];

  // Associer les catégories aux sujets/pratiques
  useEffect(() => {
    // Traitement des sujets
    if (
      stats.sujetsDetails &&
      stats.sujetsDetails.length > 0 &&
      sujetsData &&
      sujetsData.length > 0
    ) {
      const withCategories = stats.sujetsDetails
        .filter((sujetDetail) => sujetDetail && sujetDetail.name) // Filtrer les items null ou non définis
        .map((sujetDetail) => {
          // Ignorer les "Non assigné"
          if (sujetDetail.name === "Non assigné") {
            return null;
          }

          // Trouver l'objet sujet complet qui correspond au nom dans sujetsDetails
          const sujetComplete = sujetsData.find(
            (s) => s && s.nomsujet === sujetDetail.name
          );

          // Seulement inclure les sujets qui ont une catégorie valide
          if (sujetComplete && sujetComplete.idcategoriesujet) {
            return {
              ...sujetDetail,
              idcategoriesujet: sujetComplete.idcategoriesujet,
            };
          }
          return null;
        })
        .filter((sujet) => sujet !== null); // Éliminer les entrées null

      setSujetsWithCategories(withCategories);
    }

    // Traitement des pratiques
    if (
      stats.pratiquesDetails &&
      stats.pratiquesDetails.length > 0 &&
      pratiques &&
      pratiques.length > 0
    ) {
      const withCategories = stats.pratiquesDetails
        .filter((pratiqueDetail) => pratiqueDetail && pratiqueDetail.name) // Filtrer les items null ou non définis
        .map((pratiqueDetail) => {
          // Ignorer les "Non assigné"
          if (pratiqueDetail.name === "Non assigné") {
            return null;
          }

          // Trouver l'objet pratique complet qui correspond au nom dans pratiquesDetails
          const pratiqueComplete = pratiques.find(
            (p) => p && p.nompratique === pratiqueDetail.name
          );

          // Seulement inclure les pratiques qui ont une catégorie valide
          if (pratiqueComplete && pratiqueComplete.idcategoriepratique) {
            return {
              ...pratiqueDetail,
              idcategoriepratique: pratiqueComplete.idcategoriepratique,
            };
          }
          return null;
        })
        .filter((pratique) => pratique !== null); // Éliminer les entrées null

      setPratiquesWithCategories(withCategories);
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
          .filter((categorie) => categorie && categorie.idcategoriesujet) // Filtrer les catégories invalides
          .map((categorie) => {
            const sujets = sujetsWithCategories.filter(
              (sujet) =>
                sujet && sujet.idcategoriesujet === categorie.idcategoriesujet
            );
            return {
              ...categorie,
              sujets,
            };
          })
          .filter((category) => category.sujets && category.sujets.length > 0) // Ne garder que les catégories non vides
      : [];

  // Grouper les pratiques par catégorie
  const pratiquesByCategory =
    categoriesPratiques && categoriesPratiques.length > 0
      ? categoriesPratiques
          .filter((categorie) => categorie && categorie.id) // Utiliser id au lieu de idcategoriepratique
          .map((categorie) => {
            // Faire correspondre id de la catégorie avec idcategoriepratique des pratiques
            const pratiquesFiltered = pratiquesWithCategories.filter(
              (pratique) =>
                pratique && pratique.idcategoriepratique === categorie.id
            );
            return {
              ...categorie,
              pratiques: pratiquesFiltered,
            };
          })
          .filter(
            (category) => category.pratiques && category.pratiques.length > 0
          ) // Ne garder que les catégories non vides
      : [];

  return (
    <Box sx={{ p: 1 }}>
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
                  sujetsByCategory.map((categorie) => (
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
                        {categorie.sujets.map((sujet) => (
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
                  pratiquesByCategory.map((categorie) => (
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
                        {categorie.pratiques.map((pratique) => (
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
