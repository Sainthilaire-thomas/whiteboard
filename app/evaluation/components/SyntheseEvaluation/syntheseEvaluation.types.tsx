// syntheseEvaluation.types.ts - VERSION SIMPLIFIÉE ET AUTONOME
// Types spécifiques et autonomes pour le composant SyntheseEvaluation

// ===== TYPE POSTIT UNIFIÉ =====
export interface Postit {
  id: number;
  text: string;
  timestamp: number;
  sujet?: string;
  pratique?: string;
  idsujet?: number;
  idpratique?: number;
  // Propriétés manquantes ajoutées pour compatibilité
  callid: number;
  wordid: number;
  word: string;
  iddomaine: number;
  [key: string]: any; // Permet toute propriété supplémentaire
}

// ===== TYPES MOTIFS AFPA =====
export interface MotifAfpaForm {
  avancement_formation: boolean;
  avancement_lieu: boolean;
  avancement_date: boolean;
  avancement_financement: boolean;
  promotion_reseau: boolean;
  commentaire: string;
  action_client: string;
}

export interface MotifAfpaUpsert extends MotifAfpaForm {
  callid: number;
  motifs: string | null;
}

export interface MotifAfpaRecord extends MotifAfpaForm {
  callid: number;
  motifs: string | null;
}

export type SelectedMotifType = string | string[] | null;

// ===== TYPES COMPOSANTS =====
export interface SyntheseEvaluationProps {
  hideHeader?: boolean;
}

export interface PostitStatistics {
  totalPostits: number;
  uniqueSujets: number;
  uniquePratiques: number;
}

// ===== PROPS POUR LES ONGLETS =====
export interface SimulationCoachingTabProps {
  filteredPostits: Postit[];
  sujetsData: Sujet[];
  categoriesSujets: CategorieSujet[];
  pratiques: Pratique[];
  categoriesPratiques: CategoriePratique[];
  selectedSujet?: string;
  selectedPratique?: string;
  onClearSelection?: () => void;
}

// ===== TYPES AUTONOMES POUR LES GRILLES =====

// Type Category simple et flexible
export interface Category {
  id: number;
  nomcategorie: string;
  couleur?: string;
  [key: string]: any; // Permet toute propriété supplémentaire
}

// Type Item simple et flexible pour les grilles
export interface Item {
  idsujet: number;
  nomsujet: string;
  valeurnumérique: number;
  idpratique: number;
  nompratique: string;
  iddomaine: number;
  idcategoriesujet: number;
  idcategoriepratique: number;
  categoriespratiques: any; // Flexible
  [key: string]: any; // Permet toute propriété supplémentaire
}

// Type Pratique simple avec toutes les propriétés requises obligatoires
export interface Pratique {
  idpratique: number;
  nompratique: string;
  description?: string;
  jeuderole?: string;
  geste?: string; // Ajouté pour le conseil de pratique
  idcategoriepratique: number;
  valeurnumérique: number; // Obligatoire
  idsujet: number; // Obligatoire
  nomsujet: string; // Obligatoire
  iddomaine: number; // Obligatoire
  idcategoriesujet: number; // Obligatoire
  categoriespratiques: any; // Obligatoire
  [key: string]: any;
}

// Type Sujet simple
export interface Sujet {
  idsujet: number;
  nomsujet: string;
  idcategoriesujet: number;
  iddomaine: number;
  description?: string;
  valeurnumérique?: number;
  [key: string]: any;
}

// Types pour les catégories - simples et flexibles
export interface CategorieSujet {
  idcategoriesujet: number;
  nomcategorie: string;
  couleur?: string;
  [key: string]: any;
}

export interface CategoriePratique {
  idcategoriepratique: number;
  nomcategorie: string;
  couleur?: string;
  // Propriétés alternatives pour compatibilité
  id?: number;
  name?: string;
  [key: string]: any;
}

// ===== PROPS POUR LES COMPOSANTS =====
export interface CritereQualiteTabProps {
  selectedDomain?: any;
  categoriesSujets: any[]; // Accepte n'importe quel format
  sujetsData: any[]; // Accepte n'importe quel format
  categoriesPratiques: any[]; // Accepte n'importe quel format
  pratiques: any[]; // Accepte n'importe quel format
}

export interface GridColumnConfig {
  categoryIdKey: string;
  categoryNameKey: string;
  itemIdKey: string;
  itemNameKey: string;
}

// ===== FONCTIONS DE CONVERSION SIMPLIFIÉES =====

// Normalise n'importe quelle catégorie vers le format Category
export const normalizeToCategory = (cat: any): Category => ({
  id: cat.id || cat.idcategoriesujet || cat.idcategoriepratique || 0,
  nomcategorie: cat.nomcategorie || cat.name || "",
  couleur: cat.couleur || "#ccc",
  ...cat, // Garde toutes les autres propriétés
});

// Normalise n'importe quel sujet vers le format Item
export const normalizeSujetToItem = (sujet: any): Item => ({
  idsujet: sujet.idsujet || 0,
  nomsujet: sujet.nomsujet || "",
  valeurnumérique: sujet.valeurnumérique || 0,
  idpratique: sujet.idpratique || 0,
  nompratique: sujet.nompratique || "",
  iddomaine: sujet.iddomaine || 0,
  idcategoriesujet: sujet.idcategoriesujet || 0,
  idcategoriepratique: 0,
  categoriespratiques: null,
  ...sujet,
});

// Normalise n'importe quelle pratique vers le format Pratique avec valeurs par défaut
export const normalizePratique = (pratique: any): Pratique => ({
  idpratique: pratique.idpratique || 0,
  nompratique: pratique.nompratique || "",
  description: pratique.description,
  jeuderole: pratique.jeuderole,
  geste: pratique.geste,
  idcategoriepratique: pratique.idcategoriepratique || 0,
  valeurnumérique: pratique.valeurnumérique || 0, // Valeur par défaut obligatoire
  idsujet: pratique.idsujet || 0, // Valeur par défaut obligatoire
  nomsujet: pratique.nomsujet || "", // Valeur par défaut obligatoire
  iddomaine: pratique.iddomaine || 0, // Valeur par défaut obligatoire
  idcategoriesujet: pratique.idcategoriesujet || 0, // Valeur par défaut obligatoire
  categoriespratiques: pratique.categoriespratiques || {}, // Valeur par défaut obligatoire
  ...pratique,
});

// Fonction pour normaliser un Postit vers le format unifié
export const normalizePostit = (postit: any): Postit => ({
  id: postit.id || 0,
  text: postit.text || "",
  timestamp: postit.timestamp || 0,
  sujet: postit.sujet,
  pratique: postit.pratique,
  idsujet: postit.idsujet,
  idpratique: postit.idpratique,
  callid: postit.callid || 0,
  wordid: postit.wordid || 0,
  word: postit.word || "",
  iddomaine: postit.iddomaine || 0,
  ...postit,
});

// Fonctions de conversion pour les tableaux
export const convertSujetsToItems = (sujets: any[]): Item[] =>
  sujets.map(normalizeSujetToItem);

export const convertPratiquesToItems = (pratiques: any[]): Pratique[] =>
  pratiques.map(normalizePratique);

export const convertToCategories = (categories: any[]): Category[] =>
  categories.map(normalizeToCategory);

export const convertPostits = (postits: any[]): Postit[] =>
  postits.map(normalizePostit);

// Aliases pour la rétrocompatibilité
export const convertCategoriesSujetsToCategories = convertToCategories;
export const convertCategoriesPratiquesToCategories = convertToCategories;

// ===== UTILITAIRES MOTIFS =====
export const convertMotifToString = (
  motif: SelectedMotifType
): string | null => {
  if (!motif) return null;
  if (Array.isArray(motif)) {
    return motif.filter(Boolean).join(",") || null;
  }
  if (typeof motif === "string") {
    return motif.trim() || null;
  }
  return String(motif);
};

export const isStringArray = (value: any): value is string[] => {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
};

export const createMotifAfpaUpsert = (
  formState: MotifAfpaForm,
  callid: number,
  motifs: SelectedMotifType
): MotifAfpaUpsert => ({
  ...formState,
  callid,
  motifs: convertMotifToString(motifs),
});

export const validateCallId = (callid: string | number): number => {
  const parsed = typeof callid === "number" ? callid : parseInt(callid, 10);
  if (isNaN(parsed)) {
    throw new Error(`ID d'appel invalide: ${callid}`);
  }
  return parsed;
};

export const formatErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Erreur inconnue";
};

export const formatMotifForDisplay = (motif: SelectedMotifType): string => {
  if (!motif) return "";
  if (Array.isArray(motif)) return motif.join(", ");
  return String(motif);
};

export interface Call {
  callid: string;
  description: string;
  [key: string]: any;
}

export interface StatsData {
  totalPostits: number;
  uniqueSujets: number;
  uniquePratiques: number;
  sujetsDetails: Array<{ name: string; count: number }>;
  pratiquesDetails: Array<{ name: string; count: number }>;
}

export interface FormState {
  avancement_formation: boolean;
  avancement_lieu: boolean;
  avancement_date: boolean;
  avancement_financement: boolean;
  promotion_reseau: boolean;
  commentaire: string;
  action_client: string;
  [key: string]: any;
}

export interface SyntheseTabProps {
  selectedCall: Call;
  stats: StatsData;
  selectedMotif: string | null;
  setSelectedMotif: (motif: string) => void;
  formState: FormState;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  setActiveTab: (tab: number) => void;
  setSelectedSujet: (sujet: string) => void;
  setSelectedPratique: (pratique: string) => void;
}
