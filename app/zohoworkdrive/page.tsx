"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ZohoAuthToken } from "./types";
import WorkdriveExplorer from "./components/WorkdriveExplorer";
import EnterpriseCallsList from "./components/EnterpriseCallsList";
import { useAppContext } from "@/context/AppContext";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Tabs,
  Tab,
  Paper,
  SelectChangeEvent,
} from "@mui/material";
import { SyntheticEvent } from "react";

// Composant qui utilise useSearchParams
function ZohoWorkdriveContent() {
  const [token, setToken] = useState<ZohoAuthToken | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const searchParams = useSearchParams();

  // Utilisation du contexte pour les entreprises
  const {
    entreprises,
    selectedEntreprise,
    setSelectedEntreprise,
    isLoadingEntreprises,
  } = useAppContext();

  // Récupérer le token depuis les paramètres d'URL
  useEffect(() => {
    const tokenParam = searchParams.get("token");

    if (tokenParam) {
      try {
        const parsedToken = JSON.parse(
          decodeURIComponent(tokenParam)
        ) as ZohoAuthToken;
        setToken(parsedToken);

        // Supprimer le token de l'URL
        window.history.replaceState({}, document.title, "/zohoworkdrive");
      } catch (error) {
        console.error("Failed to parse token:", error);
      }
    }
  }, [searchParams]);

  // Gestionnaires d'événements
  const handleEntrepriseChange = (
    event: SelectChangeEvent<string | number>
  ): void => {
    const entrepriseId = Number(event.target.value);
    setSelectedEntreprise(entrepriseId);
  };

  const handleTabChange = (event: SyntheticEvent, newValue: number): void => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Card sx={{ mb: 4, mt: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Gestionnaire d'appels Zoho Workdrive
          </Typography>

          {/* Sélecteur d'entreprises */}
          <Box sx={{ minWidth: 200, mb: 3 }}>
            {isLoadingEntreprises ? (
              <CircularProgress size={24} />
            ) : (
              <FormControl fullWidth>
                <InputLabel id="entreprise-select-label">Entreprise</InputLabel>
                <Select
                  labelId="entreprise-select-label"
                  id="entreprise-select"
                  value={selectedEntreprise || ""}
                  label="Entreprise"
                  onChange={handleEntrepriseChange}
                >
                  <MenuItem value="">
                    <em>Aucune</em>
                  </MenuItem>
                  {entreprises &&
                    entreprises.map((entreprise) => (
                      <MenuItem key={entreprise.id} value={entreprise.id}>
                        {entreprise.nom}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            )}
          </Box>

          {!selectedEntreprise && (
            <Typography color="textSecondary">
              Veuillez sélectionner une entreprise pour continuer
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Onglets pour naviguer entre les sections */}
      {selectedEntreprise && (
        <>
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              centered
            >
              <Tab label="Appels existants" />
              <Tab label="Importer depuis Zoho" />
            </Tabs>
          </Paper>

          {/* Contenu des onglets */}
          {activeTab === 0 ? (
            <EnterpriseCallsList entrepriseId={selectedEntreprise} />
          ) : (
            <WorkdriveExplorer
              initialToken={token}
              entrepriseId={selectedEntreprise}
            />
          )}
        </>
      )}
    </Container>
  );
}

// Composant principal avec Suspense
export default function ZohoWorkdrivePage() {
  return (
    <Suspense
      fallback={
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "50vh",
            }}
          >
            <CircularProgress />
          </Box>
        </Container>
      }
    >
      <ZohoWorkdriveContent />
    </Suspense>
  );
}
