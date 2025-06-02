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
import { AdminTraducteurSection } from "./sections/AdminTraducteurSection";
import {
  Entreprise,
  DomaineQualite,
  Sujet,
  PonderationSujet,
  Pratique,
  SujetPratique,
  CategoriePratique,
} from "../types/admin";

const AdminMainPage: React.FC = () => {
  const { categoriesSujets } = useAppContext();
  const adminState = useAdminState();

  // Service de données (singleton)
  const dataService = useMemo(() => new AdminDataService(), []);

  // États des données existants
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [domainesQualite, setDomainesQualite] = useState<DomaineQualite[]>([]);
  const [sujets, setSujets] = useState<Sujet[]>([]);
  const [ponderations, setPonderations] = useState<PonderationSujet[]>([]);

  // Nouveaux états pour le traducteur
  const [pratiques, setPratiques] = useState<Pratique[]>([]);
  const [sujetsPratiques, setSujetsPratiques] = useState<SujetPratique[]>([]);
  const [categoriesPratiques, setCategoriesPratiques] = useState<
    CategoriePratique[]
  >([]);

  // Chargement initial des entreprises
  useEffect(() => {
    loadEntreprises();
    // Charger les pratiques et catégories au démarrage
    loadPratiques();
    loadCategoriesPratiques();
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
      setSujetsPratiques([]);
    }
  }, [adminState.selectedEntreprise]);

  // Chargement des sujets quand un domaine qualité est sélectionné
  useEffect(() => {
    if (adminState.selectedEntreprise && adminState.selectedDomaineQualite) {
      loadSujetsForDomaineQualite(parseInt(adminState.selectedDomaineQualite));
    } else {
      setSujets([]);
      setPonderations([]);
      setSujetsPratiques([]);
    }
  }, [adminState.selectedDomaineQualite]);

  // Charger les sujets-pratiques quand un sujet est sélectionné (pour le traducteur)
  useEffect(() => {
    if (adminState.currentSection === "traducteur") {
      loadAllSujetsPratiques();
    }
  }, [adminState.currentSection]);

  // Fonctions de chargement des données existantes
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
      const data =
        await dataService.loadDomainesQualiteForEntreprise(entrepriseId);
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

      const sujetsData =
        await dataService.loadSujetsForDomaineQualite(domaineId);
      setSujets(sujetsData);

      // Charger les pondérations pour ces sujets
      const sujetIds = sujetsData.map((s) => s.idsujet);
      if (sujetIds.length > 0) {
        const ponderationsData =
          await dataService.loadPonderationsForSujets(sujetIds);
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

  // Nouvelles fonctions de chargement pour le traducteur
  const loadPratiques = async () => {
    try {
      const data = await dataService.loadPratiques();
      setPratiques(data);
    } catch (error) {
      console.error("Erreur lors du chargement des pratiques:", error);
    }
  };

  const loadCategoriesPratiques = async () => {
    try {
      const data = await dataService.loadCategoriesPratiques();
      setCategoriesPratiques(data);
    } catch (error) {
      console.error(
        "Erreur lors du chargement des catégories de pratiques:",
        error
      );
    }
  };

  const loadAllSujetsPratiques = async () => {
    try {
      const data = await dataService.loadAllSujetsPratiques();
      setSujetsPratiques(data);
    } catch (error) {
      console.error("Erreur lors du chargement des sujets-pratiques:", error);
    }
  };

  const loadSujetsPratiquesForSujet = async (sujetId: number) => {
    try {
      adminState.setLoading(true);
      const data = await dataService.loadSujetsPratiques(sujetId);
      setSujetsPratiques((prev) => {
        // Remplacer les données pour ce sujet spécifique
        const filtered = prev.filter((sp) => sp.idsujet !== sujetId);
        return [...filtered, ...data];
      });
    } catch (error) {
      console.error("Erreur lors du chargement des pratiques du sujet:", error);
      adminState.setError("Erreur lors du chargement des pratiques du sujet");
    } finally {
      adminState.setLoading(false);
    }
  };

  // Fonctions de gestion des pondérations (existantes)
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

  // Nouvelles fonctions pour le traducteur
  const handleAddPratique = async (
    idsujet: number,
    idpratique: number,
    importance: number
  ) => {
    try {
      adminState.setSaving(true);
      adminState.setError("");

      await dataService.addSujetPratique({ idsujet, idpratique, importance });

      // Mettre à jour l'état local
      setSujetsPratiques((prev) => [
        ...prev,
        { idsujet, idpratique, importance },
      ]);

      adminState.setSuccess("Pratique associée avec succès !");
    } catch (error) {
      console.error("Erreur lors de l'ajout de la pratique:", error);
      adminState.setError("Erreur lors de l'association de la pratique");
    } finally {
      adminState.setSaving(false);
    }
  };

  const handleUpdateImportance = async (
    idsujet: number,
    idpratique: number,
    importance: number
  ) => {
    try {
      await dataService.updateSujetPratiqueImportance(
        idsujet,
        idpratique,
        importance
      );

      // Mettre à jour l'état local
      setSujetsPratiques((prev) =>
        prev.map((sp) =>
          sp.idsujet === idsujet && sp.idpratique === idpratique
            ? { ...sp, importance }
            : sp
        )
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'importance:", error);
      adminState.setError("Erreur lors de la mise à jour de l'importance");
    }
  };

  const handleRemovePratique = async (idsujet: number, idpratique: number) => {
    try {
      adminState.setSaving(true);
      adminState.setError("");

      await dataService.deleteSujetPratique(idsujet, idpratique);

      // Mettre à jour l'état local
      setSujetsPratiques((prev) =>
        prev.filter(
          (sp) => !(sp.idsujet === idsujet && sp.idpratique === idpratique)
        )
      );

      adminState.setSuccess("Pratique dissociée avec succès !");
    } catch (error) {
      console.error("Erreur lors de la suppression de la pratique:", error);
      adminState.setError("Erreur lors de la dissociation de la pratique");
    } finally {
      adminState.setSaving(false);
    }
  };

  const handleSaveSujetsPratiques = async () => {
    try {
      adminState.setSaving(true);
      adminState.setError("");
      adminState.setSuccess("");

      await dataService.saveSujetsPratiques(sujetsPratiques);
      adminState.setSuccess(
        "Associations sujets-pratiques sauvegardées avec succès !"
      );
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      adminState.setError("Erreur lors de la sauvegarde des associations");
    } finally {
      adminState.setSaving(false);
    }
  };

  const handleRefreshTraducteur = () => {
    loadAllSujetsPratiques();
    loadPratiques();
  };

  // Gérer le changement de sujet sélectionné pour le traducteur
  const handleSujetChangeForTraducteur = (sujetId: string) => {
    adminState.setSelectedSujet(sujetId); // Correction: Utilisation directe sans ?
    if (sujetId) {
      loadSujetsPratiquesForSujet(parseInt(sujetId));
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
      pratiques: pratiques.length,
      associations: sujetsPratiques.length,
    }),
    [
      entreprises.length,
      domainesQualite.length,
      sujets.length,
      pratiques.length,
      sujetsPratiques.length,
    ]
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

      case "traducteur":
        return (
          <AdminTraducteurSection
            sujets={sujets}
            pratiques={pratiques}
            sujetsPratiques={sujetsPratiques}
            categoriesPratiques={categoriesPratiques}
            categoriesSujets={categoriesSujets} // ✅ Direct, pas d'adaptateur
            selectedSujet={adminState.selectedSujet}
            loading={adminState.loading}
            saving={adminState.saving}
            onSujetChange={handleSujetChangeForTraducteur}
            onAddPratique={handleAddPratique}
            onUpdateImportance={handleUpdateImportance}
            onRemovePratique={handleRemovePratique}
            onSave={handleSaveSujetsPratiques}
            onRefresh={handleRefreshTraducteur}
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
          grilles qualité, catégories, critères, pondérations et associations
          sujets-pratiques.
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
        adminState.currentSection === "sujets" ||
        adminState.currentSection === "traducteur") && (
        <AdminSelectors
          entreprises={entreprises}
          domaines={domainesQualite}
          sujets={
            adminState.currentSection === "traducteur" ? sujets : undefined
          }
          selectedEntreprise={adminState.selectedEntreprise}
          selectedDomaine={adminState.selectedDomaineQualite}
          selectedSujet={
            adminState.currentSection === "traducteur"
              ? adminState.selectedSujet // ✅ Maintenant accessible
              : undefined
          }
          loading={adminState.loading}
          onEntrepriseChange={adminState.setSelectedEntreprise}
          onDomaineChange={adminState.setSelectedDomaineQualite}
          onSujetChange={
            adminState.currentSection === "traducteur"
              ? handleSujetChangeForTraducteur
              : undefined
          }
          showSujetSelector={adminState.currentSection === "traducteur"}
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
