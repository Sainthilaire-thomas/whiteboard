// Types pour les données Supabase
export interface Pratique {
  idpratique: number;
  nompratique: string;
  description: string;
  valeurnumérique: number;
  idcategoriepratique: number;
  fiche_conseiller_json: any;
  fiche_coach_json: any;
  jeuderole: any;
  geste: string;
  // Propriétés enrichies par le hook
  categoryColor?: string;
  categoryName?: string;
}

export interface Exercice {
  idexercice: number;
  idpratique: number;
  nomexercice: string;
  description: string;
  nudges: any;
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
  | "orienteering";

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
  onThemeChange?: (theme: ThemeType) => void;
  showThemeSelector?: boolean;
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
