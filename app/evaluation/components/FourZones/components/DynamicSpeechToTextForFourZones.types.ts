/**
 * Types pour le composant DynamicSpeechToTextForFourZones
 * Fichier: DynamicSpeechToTextForFourZones.types.ts
 */

/**
 * Type pour représenter un post-it dans le jeu de rôle
 */
export interface PostitType {
  id: string;
  content: string;
  zone: string;
  color: string;
  isOriginal: boolean;
}

/**
 * Interface pour les propriétés du composant de reconnaissance vocale dynamique
 */
export interface DynamicSpeechToTextForFourZonesProps {
  onAddPostits: (postits: PostitType[]) => void;
  isContextual?: boolean;
}

/**
 * Interface pour le composant de chargement
 */
export interface LoadingComponentProps {
  isContextual?: boolean;
}

/**
 * Interface pour les styles du composant de chargement
 */
export interface LoadingComponentStyles {
  padding: string;
  border: string;
  borderRadius: string;
  margin: string;
  fontSize: string;
  backgroundColor: string;
  textAlign: "center" | "left" | "right";
  color: string;
  transition?: string;
}

/**
 * Options de configuration pour le chargement dynamique
 */
export interface DynamicImportOptions {
  ssr: boolean;
  loading: (props: { isContextual?: boolean }) => React.ReactElement;
}

/**
 * Type pour les props du composant SpeechToTextForFourZones importé
 */
export interface SpeechToTextForFourZonesProps {
  onAddPostits: (postits: PostitType[]) => void;
  isContextual?: boolean;
}
