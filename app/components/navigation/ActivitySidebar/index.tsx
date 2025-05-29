// ActivitySidebar/index.ts - Point d'entrée centralisé

import { NavigationBreadcrumb } from "./components/NavigationBreadcrump";

// Export du composant principal
export { default } from "./ActivitySidebar";

// Export des composants
export { PhaseItem } from "./components/PhaseItem";
export { SubStepItem } from "./components/SubStepItem";
export { PhaseStatusChip } from "./components/PhaseStatusChip";
export { NavigationBreadcrumb } from "./components/NavigationBreadcrump";

// Export des hooks
export { usePhaseData } from "./hooks/usePhaseData";
export { usePhaseNavigation } from "./hooks/usePhaseNavigation";
export { useActivityStats } from "./hooks/useActivityStats";

// Export des types
export type {
  StepStatus,
  PhaseKey,
  SubStep,
  Phase,
  ActivityStats,
  QuickNavItem,
  PhaseItemProps,
  SubStepItemProps,
  PhaseStatusChipProps,
  NavigationBreadcrumbProps,
  UsePhaseDataReturn,
  UsePhaseNavigationReturn,
  UseActivityStatsReturn,
} from "./types";

// Export des constantes
export {
  STATUS_CONFIG,
  COLORS,
  DIMENSIONS,
  ROUTES,
  VIEWS,
  LABELS,
  ANIMATIONS,
  SHADOWS,
} from "./constants";
