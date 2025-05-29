// app/evaluation/admin/types/admin.ts
export interface PonderationSujet {
  id_ponderation?: number;
  idsujet: number;
  conforme: number;
  partiellement_conforme: number;
  non_conforme: number;
  permet_partiellement_conforme: boolean;
}

export interface Entreprise {
  identreprise: number;
  nomentreprise: string;
  logo?: string;
  domaine?: string; // Domaine internet (ex: sonear.com)
  created_at?: string;
}

export interface DomaineQualite {
  iddomaine: number;
  nomdomaine: string; // Nom de la grille qualité (ex: "Grille Poste", "Grille ESCDA")
  description?: string;
  created_at?: string;
}

export interface EntrepriseDomaine {
  identreprise: number;
  iddomaine: number; // Référence vers DomaineQualite (grille)
}

export interface Sujet {
  idsujet: number;
  iddomaine: number;
  nomsujet: string;
  description?: string;
  valeurnumérique: number;
  idcategoriesujet?: number;
  created_at?: string;
}

export interface CategoriesujetExtended {
  idcategoriesujet: number;
  nomcategorie: string;
  description?: string; // Nouveau champ ajouté
  couleur?: string;
  // Champs optionnels pour extensibilité future
  ordre?: number;
  actif?: boolean;
  sujets?: Sujet[];
  // Nouveaux champs pour liaison avec domaines
  domaines?: DomaineQualite[];
  nombreDomaines?: number;
}

export interface AdminFormData {
  entreprise: Entreprise | null;
  domaineQualite: DomaineQualite | null;
  sujets: Sujet[];
  ponderations: PonderationSujet[];
}

export type AdminMode = "view" | "edit" | "create";

export type AdminSection =
  | "entreprises"
  | "domaines"
  | "categories"
  | "sujets"
  | "ponderations";

export interface AdminState {
  selectedEntreprise: string;
  selectedDomaineQualite: string; // Grille qualité sélectionnée
  currentMode: AdminMode;
  currentSection: AdminSection;
  loading: boolean;
  saving: boolean;
  error: string;
  success: string;
}

export interface AdminActions {
  setSelectedEntreprise: (id: string) => void;
  setSelectedDomaineQualite: (id: string) => void;
  setCurrentMode: (mode: AdminMode) => void;
  setCurrentSection: (section: AdminSection) => void;
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  setError: (error: string) => void;
  setSuccess: (success: string) => void;
}
