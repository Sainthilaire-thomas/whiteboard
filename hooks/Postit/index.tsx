// Export all hooks from this module
export { usePostit } from "./usePostit";
export { useSujetSelection } from "./useSujetSelection";
export { usePratiqueSelection } from "./usePratiqueSelection";
export { usePostitActions } from "./usePostitActions";
export { useStyles } from "./useStyles";

// Export des types helpers pour validation
export type { PostitValidationResult, PostitCompletionStatus } from "./types";

// Nouvelles fonctions utilitaires exportées
export {
  validatePostit,
  isPostitComplete,
  hasValidSubject,
  hasValidPractice,
} from "./utils";
