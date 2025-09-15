// app/components/common/SelectionEntrepriseEtAppel/index.ts

// composant principal (onglets)
export { default } from "./SelectionEntrepriseEtAppel";
export { default as SelectionEntrepriseEtAppel } from "./SelectionEntrepriseEtAppel";

// sous-composants
export { default as CallSelection } from "./CallSelection";
export { default as EntrepriseSelection } from "./EntrepriseSelection";
export { default as AllCallsBrowser } from "./AllCallsBrowser";

// hooks & utils (re-export pratiques)
export { useCallsSummary } from "./hooks/useCallsSummary";
export type { CallsFilters } from "./hooks/useCallsSummary";

export { fetchTagsSummaryForCalls } from "./fetchTagsSummaryForCalls";
export type { TagSummary } from "./fetchTagsSummaryForCalls";
