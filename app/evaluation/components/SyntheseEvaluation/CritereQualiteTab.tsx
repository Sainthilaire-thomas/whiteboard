"use client";

import React from "react";
import {
  Box,
  Typography,
  Paper,
  Alert,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
} from "@mui/material";
import { columnConfigSujets } from "@/config/gridConfig";
import SimplifiedGridContainerSujets from "../SimplifiedGridContainerSujets";
import SimplifiedGridContainerPratiques from "../SimplifiedGridContainerPratiques";

// Import des types locaux simplifiés
import {
  CritereQualiteTabProps,
  convertSujetsToItems,
  convertPratiquesToItems,
  convertToCategories,
} from "./syntheseEvaluation.types";

const CritereQualiteTab: React.FC<CritereQualiteTabProps> = ({
  selectedDomain,
  categoriesSujets,
  sujetsData,
  categoriesPratiques,
  pratiques,
}) => {
  // Normalisation simple des données
  const normalizedSujetsAsItems = convertSujetsToItems(sujetsData || []);
  const normalizedPratiques = convertPratiquesToItems(pratiques || []);
  const normalizedCategoriesSujets = convertToCategories(
    categoriesSujets || []
  );
  const normalizedCategoriesPratiques = convertToCategories(
    categoriesPratiques || []
  );

  // Fonction handler simple
  const handlePratiqueClick = (pratique: any) => {
    console.log("Pratique sélectionnée:", pratique);
  };

  return (
    <Box sx={{ p: 1 }}>
      <Paper sx={{ p: 2, mb: 2, borderRadius: 1 }}>
        <Typography
          variant="h6"
          sx={{ mb: 1, color: "text.primary", fontWeight: "medium" }}
        >
          Critères qualité
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {selectedDomain ? (
          <SimplifiedGridContainerSujets
            categories={normalizedCategoriesSujets}
            items={normalizedSujetsAsItems}
            columnConfig={columnConfigSujets}
          />
        ) : (
          <Alert severity="info" sx={{ mb: 2 }}>
            Veuillez sélectionner un domaine pour voir les critères qualité.
          </Alert>
        )}
      </Paper>

      <Paper sx={{ p: 2, mb: 2, borderRadius: 1 }}>
        <Typography
          variant="h6"
          sx={{ mb: 1, color: "text.primary", fontWeight: "medium" }}
        >
          Pratiques à renforcer
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <SimplifiedGridContainerPratiques
          categories={normalizedCategoriesPratiques}
          items={normalizedPratiques}
          onPratiqueClick={handlePratiqueClick}
          columnConfig={{
            categoryIdKey: "idcategoriepratique",
            categoryNameKey: "nomcategorie",
            itemIdKey: "idpratique",
            itemNameKey: "nompratique",
          }}
        />
      </Paper>

      {/* Vue alternative simplifiée */}
      <Paper sx={{ p: 2, borderRadius: 1 }}>
        <Typography
          variant="h6"
          sx={{ mb: 1, color: "text.primary", fontWeight: "medium" }}
        >
          Vue par catégorie
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          {normalizedCategoriesSujets?.map((categorie) => (
            <Grid item xs={12} md={6} key={categorie.id}>
              <Card
                sx={{
                  mb: 2,
                  borderLeft: `4px solid ${categorie.couleur || "#ccc"}`,
                  boxShadow: 1,
                }}
              >
                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="medium"
                    sx={{ mb: 1, color: categorie.couleur }}
                  >
                    {categorie.nomcategorie}
                  </Typography>

                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {sujetsData
                      ?.filter(
                        (sujet) =>
                          sujet.idcategoriesujet === categorie.id ||
                          sujet.idcategoriesujet === categorie.idcategoriesujet
                      )
                      .map((sujet) => (
                        <Chip
                          key={sujet.idsujet}
                          label={sujet.nomsujet}
                          size="small"
                          sx={{
                            bgcolor: `${categorie.couleur}15`,
                            color: categorie.couleur,
                            m: 0.5,
                          }}
                        />
                      ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default CritereQualiteTab;
