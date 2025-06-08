// Types pour les données Supabase
export interface Pratique {
  idpratique: number;
  nompratique: string;
  description: string;
  valeurnumérique: number;
  idcategoriepratique: number;
  fiche_conseiller_json?: any;
  fiche_coach_json?: any;
  jeuderole?: any;
  geste?: string;
  // Propriétés enrichies par le hook
  categoryColor?: string;
  categoryName?: string;
}

export interface Exercice {
  idexercice: number;
  idpratique: number;
  nomexercice: string;
  description: string;
  nudges?: any; // Rendre optionnel car peut être undefined
}

// Nouveau type pour les nudges personnalisés
export interface CustomNudges {
  id?: number;
  id_activite?: number;
  id_pratique: number;
  custom_nudge1?: string;
  custom_nudge2?: string;
  custom_nudge3?: string;
  custom_nudge4?: string;
  custom_nudge5?: string;
  custom_nudge6?: string;
  custom_nudge1_date?: string;
  custom_nudge2_date?: string;
  custom_nudge3_date?: string;
  custom_nudge4_date?: string;
  custom_nudge5_date?: string;
  custom_nudge6_date?: string;
}

// Types pour le planning
export interface PlanningNudge {
  nudgeNumber: number;
  content: string;
  startDate: Date;
  endDate: Date;
  dayRange: string;
}

export interface TrainingPlan {
  totalDuration: number; // en jours
  nudges: PlanningNudge[];
  startDate: Date;
}

// Types pour les thèmes de parcours
export type ThemeType =
  | "default"
  | "mountain"
  | "train"
  | "roadtrip"
  | "orienteering"
  | "desert"; // Ajouter le type "desert" qui manquait

export interface ThemeConfig {
  name: string;
  startIcon: string;
  stepIcon: (index: number) => string;
  endIcon: string;
  pathStyle: "smooth" | "mountain" | "rails" | "road" | "orienteering";
  background: "none" | "mountains" | "rails" | "road" | "map";
  description: string;
}

export interface TrainingPathProps {
  trainingPlan: TrainingPlan;
  categoryColor?: string;
  theme?: ThemeType;
  onThemeChange?: (theme: ThemeType) => void; // Signature correcte
  showThemeSelector?: boolean;
}

// Types spécifiques pour les fiches
export interface FicheCoachPratique {
  nompratique: string;
  fiche_coach_json: any; // Obligatoire pour FicheCoach
  geste?: string;
  categoryColor?: string;
}

export interface FicheConseillerPratique {
  nompratique: string;
  fiche_conseiller_json: any; // Obligatoire pour FicheConseiller
  categoryColor?: string;
}

// Types pour les ressources
export interface ResourcesPanelProps {
  pratique: Pratique | null; // Accepter null au lieu de undefined
  selectedView?: "coach" | "conseiller" | null;
  onViewChange?: (view: "coach" | "conseiller" | null) => void;
}

// Types pour les nudges avec gestion stricte des undefined
export interface NudgeData {
  index: number;
  content: string; // Non-optional car filtré dans getCurrentNudges
}

// Types pour l'interface utilisateur
export type StepType = "bilan" | "deroulement";
export type ViewType = "conseiller" | "coach" | "exercices";

export interface Step {
  id: StepType;
  label: string;
  description: string;
}

export interface EntrainementSuiviProps {
  hideHeader?: boolean;
}

// Types pour les nudges avec gestion stricte des undefined
export interface NudgeData {
  index: number;
  content: string; // Non-optional car filtré dans getCurrentNudges
}

// Type helper pour les arrays de nudges
export type NudgeArray = string[]; // Garantir que c'est un array de strings

// Type pour les fonctions de génération de planning
export type GenerateTrainingPlanFunction = (
  nudges: string[], // Array strict de strings
  duration: number
) => void;
