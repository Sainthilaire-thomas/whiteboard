// app/evaluation/admin/types/admin.ts
// Types autonomes pour le module admin - compatibles avec @types/types.tsx

// ===== TYPES DE BASE (exactement compatibles avec le context) =====

export interface CategorieSujet {
  idcategoriesujet: number;
  nomcategorie: string;
  couleur: string;
  [key: string]: string | number; // Compatible avec la signature d'index du fichier types.tsx
}

export interface Sujet {
  idsujet: number;
  iddomaine: number;
  nomsujet: string;
  description?: string;
  valeurnumérique: number;
  idcategoriesujet: number;
  created_at?: string;
}

export interface Domaine {
  iddomaine: number;
  nomdomaine: string;
  description?: string;
  created_at?: string; // ✅ Ajout pour la compatibilité
}

// Alias pour clarifier l'usage admin
export type DomaineQualite = Domaine;

// ===== TYPES ADMIN SPÉCIFIQUES =====

export interface Entreprise {
  identreprise: number;
  nomentreprise: string;
  logo?: string;
  domaine?: string;
  created_at?: string;
}

// ✅ Type pour les grilles avec leurs entreprises associées
export interface GrilleAvecEntreprises {
  iddomaine: number;
  nomdomaine: string;
  description?: string;
  created_at?: string; // ✅ Ajout de la propriété manquante
  entreprises?: Entreprise[];
  nombreEntreprises?: number;
}

// ===== TYPES POUR LES FORMULAIRES =====

// Données de formulaire pour les grilles qualité
export interface GrilleQualiteFormData {
  nomdomaine: string;
  description: string;
}

// Erreurs de validation pour les grilles qualité
export interface GrilleQualiteFormErrors {
  nomdomaine?: string;
  description?: string;
}

// Props pour le formulaire de grille qualité
export interface GrilleQualiteFormProps {
  grille?: DomaineQualite | null;
  mode: AdminMode;
  loading?: boolean;
  onSave: (data: Partial<DomaineQualite>) => void;
  onCancel: () => void;
}

// Template de grille prédéfinie
export interface GrilleTemplate {
  nom: string;
  description: string;
  categories?: string[];
  sujets?: Array<{
    nom: string;
    description?: string;
    valeurnumérique: number;
  }>;
}

// Données de formulaire pour les entreprises
export interface EntrepriseFormData {
  nomentreprise: string;
  logo?: string;
  domaine?: string;
}

// Erreurs de validation pour les entreprises
export interface EntrepriseFormErrors {
  nomentreprise?: string;
  logo?: string;
  domaine?: string;
}

// Données de formulaire pour les catégories
export interface CategorieFormData {
  nomcategorie: string;
  description?: string;
  couleur: string;
  ordre?: number;
}

// Erreurs de validation pour les catégories
export interface CategorieFormErrors {
  nomcategorie?: string;
  description?: string;
  couleur?: string;
  ordre?: string;
}

export interface PonderationSujet {
  id_ponderation?: number;
  idsujet: number;
  conforme: number;
  partiellement_conforme: number;
  non_conforme: number;
  permet_partiellement_conforme: boolean;
}

export interface EntrepriseDomaine {
  identreprise: number;
  iddomaine: number;
}

// ===== TYPES TRADUCTEUR =====

export interface Pratique {
  idpratique: number;
  nompratique: string;
  description?: string;
  idcategoriepratique?: number;
  created_at?: string;
  valeurnumérique?: number; // ✅ Ajouté pour compatibilité
  geste?: string; // ✅ Ajouté pour compatibilité
}

export interface SujetPratique {
  idsujet: number;
  idpratique: number;
  importance: number;
}

export interface CategoriePratique {
  idcategoriepratique: number;
  nomcategorie: string;
  description?: string;
  couleur?: string;
  ordre?: number;
  actif?: boolean;
}

// ===== ADMIN STATE & ACTIONS =====

export type AdminMode = "view" | "edit" | "create";

export type AdminSection =
  | "entreprises"
  | "domaines"
  | "categories"
  | "sujets"
  | "ponderations"
  | "traducteur";

export interface AdminState {
  selectedEntreprise: string;
  selectedDomaineQualite: string;
  selectedSujet: string;
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
  setSelectedSujet: (id: string) => void;
  setCurrentMode: (mode: AdminMode) => void;
  setCurrentSection: (section: AdminSection) => void;
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  setError: (error: string) => void;
  setSuccess: (success: string) => void;
}

export interface AdminFormData {
  entreprise: Entreprise | null;
  domaineQualite: DomaineQualite | null;
  sujets: Sujet[];
  ponderations: PonderationSujet[];
}

// ===== PROPS INTERFACES =====

export interface AdminTraducteurSectionProps {
  sujets: Sujet[];
  pratiques: Pratique[];
  sujetsPratiques: SujetPratique[];
  categoriesPratiques: CategoriePratique[];
  categoriesSujets: CategorieSujet[]; // Compatible directement avec le context
  selectedSujet?: string;
  loading: boolean;
  saving: boolean;
  onSujetChange: (sujetId: string) => void;
  onAddPratique: (
    idsujet: number,
    idpratique: number,
    importance: number
  ) => void;
  onUpdateImportance: (
    idsujet: number,
    idpratique: number,
    importance: number
  ) => void;
  onRemovePratique: (idsujet: number, idpratique: number) => void;
  onSave: () => void;
  onRefresh: () => void;
}

export interface AdminPonderationSectionProps {
  sujets: Sujet[];
  ponderations: PonderationSujet[];
  categories: CategorieSujet[];
  domaineNom?: string;
  loading: boolean;
  saving: boolean;
  onPonderationChange: (
    idsujet: number,
    field: keyof PonderationSujet,
    value: number | boolean
  ) => void;
  onSave: () => void;
  onRefresh: () => void;
}

export interface AdminSectionBaseProps {
  loading: boolean;
  saving: boolean;
  onError: (error: string) => void;
  onSuccess: (success: string) => void;
}

export interface AdminSelectorsProps {
  entreprises: Entreprise[];
  domaines: DomaineQualite[];
  sujets?: Sujet[];
  selectedEntreprise: string;
  selectedDomaine: string;
  selectedSujet?: string;
  loading: boolean;
  onEntrepriseChange: (id: string) => void;
  onDomaineChange: (id: string) => void;
  onSujetChange?: (id: string) => void;
  showSujetSelector?: boolean;
}

// ===== TYPES POUR LA NAVIGATION =====

// Type pour les compteurs de navigation (flexible)
export type AdminCounters = {
  [K in AdminSection]?: number;
} & {
  // Compteurs spécifiques qui ne correspondent pas directement aux sections
  pratiques?: number;
  associations?: number;
};

export interface AdminNavigationProps {
  currentSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
  counters: AdminCounters;
}

// ===== TYPES ÉTENDUS POUR L'ADMIN (sans signature d'index) =====

// Si vous avez besoin d'une version étendue de CategorieSujet sans la signature d'index
export interface CategoriesujetExtended {
  idcategoriesujet: number;
  nomcategorie: string;
  couleur: string;
  description?: string;
  ordre?: number;
  actif?: boolean;
  // Propriétés étendues spécifiques à l'admin
  sujets?: Sujet[];
  domaines?: DomaineQualite[];
  nombreDomaines?: number;
}
