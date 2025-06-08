/**
 * Types pour le composant SuggestionSection
 * Fichier: SuggestionSection.types.ts
 */

/**
 * Interface pour les propriétés du composant SuggestionSection
 */
export interface SuggestionSectionProps {
  selectedClientText: string;
  newPostitContent: string;
  onNewPostitContentChange: (content: string) => void;
  currentZone: string;
  onCurrentZoneChange: (zone: string) => void;
  onAddPostit: () => void;
  fontSize: number;
  zoneColors: Record<string, string>;
}

/**
 * Interface pour les constantes de zones utilisées dans le composant
 */
export interface ZoneConstants {
  CLIENT: string;
  VOUS_AVEZ_FAIT: string;
  JE_FAIS: string;
  ENTREPRISE_FAIT: string;
  VOUS_FEREZ: string;
}

/**
 * Interface pour les styles du composant
 */
export interface SuggestionSectionStyles {
  container: React.CSSProperties;
  clientPaper: React.CSSProperties;
  inputContainer: React.CSSProperties;
  formControl: React.CSSProperties;
  radioButton: React.CSSProperties;
}

/**
 * Interface pour les événements du composant
 */
export interface SuggestionSectionEvents {
  onNewPostitContentChange: (content: string) => void;
  onCurrentZoneChange: (zone: string) => void;
  onAddPostit: () => void;
}

/**
 * Type pour les zones disponibles
 */
export type ZoneType =
  | "VOUS_AVEZ_FAIT"
  | "JE_FAIS"
  | "ENTREPRISE_FAIT"
  | "VOUS_FEREZ";

/**
 * Interface pour l'état du formulaire de suggestion
 */
export interface SuggestionFormState {
  content: string;
  selectedZone: string;
  isValid: boolean;
}
