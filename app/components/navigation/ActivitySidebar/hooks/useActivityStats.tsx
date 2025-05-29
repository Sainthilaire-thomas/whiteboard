// hooks/useActivityStats.ts
import { useMemo } from "react";
import { useCallData } from "@/context/CallDataContext";

export interface ActivityStats {
  total: number;
  withIssues: number;
  completedEvaluations: number;
  activeRolePlays: number;
  pendingActions: number;
}

export const useActivityStats = () => {
  const { appelPostits, selectedPostitForRolePlay, rolePlayData } =
    useCallData();

  const stats = useMemo((): ActivityStats => {
    if (!appelPostits || appelPostits.length === 0) {
      return {
        total: 0,
        withIssues: 0,
        completedEvaluations: 0,
        activeRolePlays: 0,
        pendingActions: 0,
      };
    }

    // Passages avec des problèmes identifiés (sujet ou pratique assignés)
    const withIssues = appelPostits.filter((p) => p.sujet || p.pratique).length;

    // Évaluations complètes (avec sujet ET pratique)
    const completedEvaluations = appelPostits.filter(
      (p) => p.sujet && p.pratique
    ).length;

    // Jeux de rôle actifs
    const activeRolePlays = selectedPostitForRolePlay ? 1 : 0;

    // Actions en attente (passages avec problèmes non encore traités en coaching)
    // 🔧 CORRIGÉ: rolePlayData est un objet, pas un tableau
    const completedRolePlays = rolePlayData ? 1 : 0;
    const pendingActions = withIssues - completedRolePlays;

    return {
      total: appelPostits.length,
      withIssues,
      completedEvaluations,
      activeRolePlays,
      pendingActions: Math.max(0, pendingActions),
    };
  }, [appelPostits, selectedPostitForRolePlay, rolePlayData]);

  // Helpers pour les badges et états
  const getBadgeCount = (type: "issues" | "pending" | "completed") => {
    switch (type) {
      case "issues":
        return stats.withIssues > 0 ? stats.withIssues : undefined;
      case "pending":
        return stats.pendingActions > 0 ? stats.pendingActions : undefined;
      case "completed":
        return stats.completedEvaluations > 0
          ? stats.completedEvaluations
          : undefined;
      default:
        return undefined;
    }
  };

  const hasAvailableActions = (phase: "evaluation" | "coaching") => {
    switch (phase) {
      case "evaluation":
        return stats.total > 0;
      case "coaching":
        return stats.withIssues > 0;
      default:
        return false;
    }
  };

  // Calcul du pourcentage de progression
  const getProgressPercentage = () => {
    if (stats.total === 0) return 0;

    let progress = 0;

    // 40% pour l'évaluation complète
    if (stats.withIssues > 0) {
      progress += 40;
    }

    // 60% pour les actions de coaching
    // 🔧 CORRIGÉ: rolePlayData est un objet, pas un tableau
    const completedRolePlays = rolePlayData ? 1 : 0;
    const coachingProgress = completedRolePlays / Math.max(1, stats.withIssues);
    progress += coachingProgress * 60;

    return Math.min(100, Math.round(progress));
  };

  return {
    stats,
    getBadgeCount,
    hasAvailableActions,
    getProgressPercentage,
  };
};
