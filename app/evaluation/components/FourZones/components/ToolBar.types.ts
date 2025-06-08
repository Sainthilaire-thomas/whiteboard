/**
 * Types pour le composant ToolBar
 * Fichier: ToolBar.types.ts
 */

/**
 * Interface pour les propriétés du composant ToolBar
 */
export interface ToolBarProps {
  title: string;
  fontSize: number;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  onSave: () => void;
  isLoading: boolean;
  mode: "light" | "dark";
}

/**
 * Interface pour les styles du composant ToolBar
 */
export interface ToolBarStyles {
  container: React.CSSProperties;
  titleSection: React.CSSProperties;
  actionSection: React.CSSProperties;
  fontButton: React.CSSProperties;
  saveButton: React.CSSProperties;
}

/**
 * Interface pour les événements du composant ToolBar
 */
export interface ToolBarEvents {
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
  onSave: () => void;
}

/**
 * Type pour les modes d'affichage
 */
export type DisplayMode = "light" | "dark";

/**
 * Interface pour les boutons de contrôle de police
 */
export interface FontControlProps {
  fontSize: number;
  onIncrease: () => void;
  onDecrease: () => void;
  disabled?: boolean;
}

/**
 * Interface pour le bouton de sauvegarde
 */
export interface SaveButtonProps {
  onSave: () => void;
  isLoading: boolean;
  disabled?: boolean;
  variant?: "contained" | "outlined" | "text";
}

/**
 * Interface pour la configuration du composant ToolBar
 */
export interface ToolBarConfig {
  showFontControls: boolean;
  showSaveButton: boolean;
  enableDarkMode: boolean;
  minFontSize: number;
  maxFontSize: number;
}

/**
 * Interface pour l'état interne du composant ToolBar
 */
export interface ToolBarState {
  isHovered: boolean;
  isFocused: boolean;
  lastSaveTime: Date | null;
}
