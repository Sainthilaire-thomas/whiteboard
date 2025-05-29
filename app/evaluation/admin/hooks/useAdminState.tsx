// app/evaluation/admin/hooks/useAdminState.ts
import { useState, useCallback } from "react";
import { AdminState, AdminMode, AdminSection } from "../types/admin";

export const useAdminState = () => {
  const [state, setState] = useState<AdminState>({
    selectedEntreprise: "",
    selectedDomaineQualite: "",
    currentMode: "view",
    currentSection: "ponderations",
    loading: false,
    saving: false,
    error: "",
    success: "",
  });

  const setSelectedEntreprise = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      selectedEntreprise: id,
      selectedDomaineQualite: "", // Reset domaine selection
      error: "",
      success: "",
    }));
  }, []);

  const setSelectedDomaineQualite = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      selectedDomaineQualite: id,
      error: "",
      success: "",
    }));
  }, []);

  const setCurrentMode = useCallback((mode: AdminMode) => {
    setState((prev) => ({
      ...prev,
      currentMode: mode,
      error: "",
      success: "",
    }));
  }, []);

  const setCurrentSection = useCallback((section: AdminSection) => {
    setState((prev) => ({
      ...prev,
      currentSection: section,
      currentMode: "view", // Reset to view mode when changing section
      error: "",
      success: "",
    }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, loading }));
  }, []);

  const setSaving = useCallback((saving: boolean) => {
    setState((prev) => ({ ...prev, saving }));
  }, []);

  const setError = useCallback((error: string) => {
    setState((prev) => ({ ...prev, error, success: "" }));
  }, []);

  const setSuccess = useCallback((success: string) => {
    setState((prev) => ({ ...prev, success, error: "" }));
  }, []);

  const clearMessages = useCallback(() => {
    setState((prev) => ({ ...prev, error: "", success: "" }));
  }, []);

  return {
    ...state,
    setSelectedEntreprise,
    setSelectedDomaineQualite,
    setCurrentMode,
    setCurrentSection,
    setLoading,
    setSaving,
    setError,
    setSuccess,
    clearMessages,
  };
};
