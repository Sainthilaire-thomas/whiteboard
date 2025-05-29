// app/evaluation/admin/components/AdminMainPage.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Box, Typography, Paper, Alert } from "@mui/material";
import { AdminPanelSettings } from "@mui/icons-material";
import { useAppContext } from "@/context/AppContext";
import { useAdminState } from "../hooks/useAdminState";
import { AdminDataService } from "../services/adminDataService";
import { AdminNavigation } from "./AdminNavigation";
import { AdminSelectors } from "./AdminSelectors";
import { AdminPonderationSection } from "./sections/AdminPonderationSection";
import { AdminEntrepriseSection } from "./sections/AdminEntrepriseSection";
import { AdminGrillesQualiteSection } from "./sections/AdminGrillesQualiteSection";
import { AdminCategoriesSection } from "./sections/AdminCategoriesSection";
import { AdminSujetsSection } from "./sections/AdminSujetsSection";
import {
  Entreprise,
  DomaineQualite,
  Sujet,
  PonderationSujet,
} from "../types/admin";

const AdminMainPage: React.FC = () => {
  const { categoriesSujets } = useAppContext();
  const adminState = useAdminState();

  // Service de données (singleton)
  const dataService = useMemo(() => new AdminDataService(), []);

  // États des données
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [domainesQualite, setDomainesQualite] = useState<DomaineQualite[]>([]);
  const [sujets, setSujets] = useState<Sujet[]>([]);
  const [ponderations, setPonderations] = useState<PonderationSujet[]>([]);

  // Chargement initial des entreprises
  useEffect(() => {
    loadEntreprises();
  }, []);

  // Chargement des domaines qualité quand une entreprise est sélectionnée
  useEffect(() => {
    if (adminState.selectedEntreprise) {
      loadDomainesQualiteForEntreprise(parseInt(adminState.selectedEntreprise));
    } else {
      adminState.setSelectedDomaineQualite("");
      setDomainesQualite([]);
      setSujets([]);
      setPonderations([]);
    }
  }, [adminState.selectedEntreprise]);

  // Chargement des sujets quand un domaine qualité est sélectionné
  useEffect(() => {
    if (adminState.selectedEntreprise && adminState.selectedDomaineQualite) {
      loadSujetsForDomaineQualite(parseInt(adminState.selectedDomaineQualite));
    } else {
      setSujets([]);
      setPonderations([]);
    }
  }, [adminState.selectedDomaineQualite]);

  // Fonctions de chargement des données
  const loadEntreprises = async () => {
    try {
      adminState.setLoading(true);
      adminState.setError("");
      const data = await dataService.loadEntreprises();
      setEntreprises(data);
    } catch (error) {
      console.error("Erreur lors du chargement des entreprises:", error);
      adminState.setError("Erreur lors du chargement des entreprises");
    } finally {
      adminState.setLoading(false);
    }
  };

  const loadDomainesQualiteForEntreprise = async (entrepriseId: number) => {
    try {
      adminState.setLoading(true);
      adminState.setError("");
      const data = await dataService.loadDomainesQualiteForEntreprise(
        entrepriseId
      );
      setDomainesQualite(data);
    } catch (error) {
      console.error("Erreur lors du chargement des grilles qualité:", error);
      adminState.setError("Erreur lors du chargement des grilles qualité");
    } finally {
      adminState.setLoading(false);
    }
  };

  const loadSujetsForDomaineQualite = async (domaineId: number) => {
    try {
      adminState.setLoading(true);
      adminState.setError("");

      const sujetsData = await dataService.loadSujetsForDomaineQualite(
        domaineId
      );
      setSujets(sujetsData);

      // Charger les pondérations pour ces sujets
      const sujetIds = sujetsData.map((s) => s.idsujet);
      if (sujetIds.length > 0) {
        const ponderationsData = await dataService.loadPonderationsForSujets(
          sujetIds
        );
        setPonderations(ponderationsData);
      } else {
        setPonderations([]);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des sujets:", error);
      adminState.setError("Erreur lors du chargement des sujets de la grille");
    } finally {
      adminState.setLoading(false);
    }
  };

  // Fonctions de gestion des pondérations
  const handlePonderationChange = (
    idsujet: number,
    field: keyof PonderationSujet,
    value: number | boolean
  ) => {
    setPonderations((prev) => {
      const existing = prev.find((p) => p.idsujet === idsujet);

      if (existing) {
        return prev.map((p) =>
          p.idsujet === idsujet ? { ...p, [field]: value } : p
        );
      } else {
        const newPonderation: PonderationSujet = {
          idsujet,
          conforme: 3,
          partiellement_conforme: 1,
          non_conforme: 0,
          permet_partiellement_conforme: true,
          [field]: value,
        };
        return [...prev, newPonderation];
      }
    });
  };

  const handleSavePonderations = async () => {
    try {
      adminState.setSaving(true);
      adminState.setError("");
      adminState.setSuccess("");

      await dataService.savePonderations(ponderations);
      adminState.setSuccess("Pondérations sauvegardées avec succès !");

      // Rafraîchir les données
      if (adminState.selectedDomaineQualite) {
        await loadSujetsForDomaineQualite(
          parseInt(adminState.selectedDomaineQualite)
        );
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      adminState.setError("Erreur lors de la sauvegarde");
    } finally {
      adminState.setSaving(false);
    }
  };

  const handleRefreshPonderations = () => {
    if (adminState.selectedDomaineQualite) {
      loadSujetsForDomaineQualite(parseInt(adminState.selectedDomaineQualite));
    }
  };

  // Obtenir le nom de la grille qualité sélectionnée
  const selectedDomaineQualiteNom = useMemo(() => {
    if (!adminState.selectedDomaineQualite) return undefined;
    const domaine = domainesQualite.find(
      (d) => d.iddomaine === parseInt(adminState.selectedDomaineQualite)
    );
    return domaine?.nomdomaine;
  }, [adminState.selectedDomaineQualite, domainesQualite]);

  // Compteurs pour la navigation
  const counters = useMemo(
    () => ({
      entreprises: entreprises.length,
      domaines: domainesQualite.length,
      sujets: sujets.length,
    }),
    [entreprises.length, domainesQualite.length, sujets.length]
  );

  // Rendu des sections
  const renderSection = () => {
    switch (adminState.currentSection) {
      case "entreprises":
        return (
          <AdminEntrepriseSection
            loading={adminState.loading}
            saving={adminState.saving}
            onError={adminState.setError}
            onSuccess={adminState.setSuccess}
          />
        );

      case "domaines":
        return (
          <AdminGrillesQualiteSection
            loading={adminState.loading}
            saving={adminState.saving}
            onError={adminState.setError}
            onSuccess={adminState.setSuccess}
          />
        );

      case "ponderations":
        return (
          <AdminPonderationSection
            sujets={sujets}
            ponderations={ponderations}
            categories={categoriesSujets}
            domaineNom={selectedDomaineQualiteNom}
            loading={adminState.loading}
            saving={adminState.saving}
            onPonderationChange={handlePonderationChange}
            onSave={handleSavePonderations}
            onRefresh={handleRefreshPonderations}
          />
        );

      case "categories":
        return (
          <AdminCategoriesSection
            loading={adminState.loading}
            saving={adminState.saving}
            onError={adminState.setError}
            onSuccess={adminState.setSuccess}
          />
        );

      case "sujets":
        return (
          <AdminSujetsSection
            loading={adminState.loading}
            saving={adminState.saving}
            onError={adminState.setError}
            onSuccess={adminState.setSuccess}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <AdminPanelSettings sx={{ mr: 2, color: "primary.main" }} />
          <Typography
            variant="h4"
            sx={{ fontWeight: "bold", color: "primary.main" }}
          >
            Administration - Gestion des Grilles Qualité
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary">
          Interface d'administration complète pour la gestion des entreprises,
          grilles qualité, catégories, critères et pondérations des évaluations.
        </Typography>
      </Paper>

      {/* Navigation entre sections */}
      <AdminNavigation
        currentSection={adminState.currentSection}
        onSectionChange={adminState.setCurrentSection}
        counters={counters}
      />

      {/* Sélecteurs (uniquement pour les sections qui en ont besoin) */}
      {(adminState.currentSection === "ponderations" ||
        adminState.currentSection === "sujets") && (
        <AdminSelectors
          entreprises={entreprises}
          domaines={domainesQualite}
          selectedEntreprise={adminState.selectedEntreprise}
          selectedDomaine={adminState.selectedDomaineQualite}
          loading={adminState.loading}
          onEntrepriseChange={adminState.setSelectedEntreprise}
          onDomaineChange={adminState.setSelectedDomaineQualite}
        />
      )}

      {/* Messages d'état */}
      {adminState.error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => adminState.setError("")}
        >
          {adminState.error}
        </Alert>
      )}

      {adminState.success && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => adminState.setSuccess("")}
        >
          {adminState.success}
        </Alert>
      )}

      {/* Section active */}
      {renderSection()}
    </Box>
  );
};

export default AdminMainPage;
