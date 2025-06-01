// types/index.ts

import { ReactElement } from "react";

// Types de base pour les phases
export type StepStatus = "à faire" | "en cours" | "réalisé";

export type PhaseKey =
  | "selection"
  | "evaluation"
  | "coaching"
  | "suivi"
  | "entrainement" // NOUVEAU
  | "feedback"
  | "admin";

// Vues disponibles - MISE À JOUR
export type ViewType =
  | "selection"
  | "synthese"
  | "postit"
  | "roleplay"
  | "entrainement";

// Interface pour les sous-étapes
export interface SubStep {
  label: string;
  route?: string;
  isBackAction?: boolean;
  badge?: number;
  disabled?: boolean;
  icon?: ReactElement;
  description?: string;
}

// Interface pour les phases

export interface Phase {
  key: PhaseKey;
  label: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  subSteps?: SubStep[];
  requiresCondition?: boolean;
  conditionKey?: string;
  adminOnly?: boolean;
}

// Interface pour les statistiques d'activité
export interface ActivityStats {
  total: number;
  withIssues: number;
  completedEvaluations: number;
  activeRolePlays: number;
  pendingActions: number;
}

// Interface pour la navigation rapide
export interface QuickNavItem {
  label: string;
  route: string;
  color: string;
  icon?: ReactElement;
}

// Types pour les couleurs de statut
export type StatusColorMap = Record<StepStatus, string>;

// Interface pour les props des composants
export interface PhaseItemProps {
  phase: Phase;
  status: StepStatus;
  isOpen: boolean;
  isActive: boolean;
  isExpanded: boolean;
  onPhaseClick: () => void;
  onStatusToggle: () => void;
  onSubStepClick: (subStep: SubStep) => void;
  isActiveSubStep: (route?: string) => boolean;
}

export interface SubStepItemProps {
  subStep: SubStep;
  isSelected: boolean;
  isAdminPhase?: boolean;
  onClick: () => void;
}

export interface PhaseStatusChipProps {
  status: StepStatus;
  onToggle: () => void;
  disabled?: boolean;
  size?: "small" | "medium";
}

export interface NavigationBreadcrumbProps {
  quickNavItems: QuickNavItem[];
  onNavigate: (route: string) => void;
  isVisible: boolean;
}

// Types pour les hooks
export interface UsePhaseDataReturn {
  phases: Phase[];
  normalPhases: Phase[];
  adminPhases: Phase[];
  evaluationStats: {
    total: number;
    withIssues: number;
  };
}

export interface UsePhaseNavigationReturn {
  currentView: string | null;
  openPhase: PhaseKey | null;
  stepStatus: Record<PhaseKey, StepStatus>;
  handlePhaseClick: (key: PhaseKey) => void;
  toggleStatus: (key: PhaseKey) => void;
  handleSubStepClick: (subStep: SubStep) => void;
  isActiveSubStep: (route?: string) => boolean;
  isActivePhase: (phaseKey: PhaseKey) => boolean;
  getQuickNavigation: () => QuickNavItem[];
}

export interface UseActivityStatsReturn {
  stats: ActivityStats;
  getBadgeCount: (
    type: "issues" | "pending" | "completed"
  ) => number | undefined;
  hasAvailableActions: (phase: "evaluation" | "coaching") => boolean;
  getProgressPercentage: () => number;
}
