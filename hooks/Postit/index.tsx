import { useSujetSelection } from "@/app/evaluation/components/Postit/hooks";

// Export all hooks from this module
export { usePostit } from "./usePostit";
export { useSujetSelection } from "@/app/evaluation/components/Postit/hooks/useSujetSelection";
export { usePratiqueSelection } from "@/app/evaluation/components/Postit/hooks/usePratiqueSelection";
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
