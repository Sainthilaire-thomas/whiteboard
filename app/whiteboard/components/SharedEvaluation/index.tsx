// app/whiteboard/components/SharedEvaluation/index.ts

// Composant principal
export { SharedEvaluationViewer } from "./SharedEvaluationViewer";

// Composants de support
export { SessionStatusBadge, SessionStatusDetail } from "./SessionStatusBadge";
export { SharedEvaluationHeader } from "./SharedEvaluationHeader";
export { SessionSelector } from "./SessionSelector";
export { SharedEvaluationContent } from "./SharedEvaluationContent";

// Types (re-export pour faciliter l'import)
export type {
  SharedEvaluationSession,
  UseSharedEvaluationReturn,
  ActiveSessionsResponse,
} from "../../hooks/types";
