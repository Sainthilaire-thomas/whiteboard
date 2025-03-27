// Types pour les données de l'évaluation

export interface Postit {
  id: string;
  timestamp?: number;
  text?: string;
  sujet?: string;
  idsujet?: number;
  pratique?: string;
  idpratique?: number;
  [key: string]: any; // Pour les propriétés additionnelles
}

export interface Sujet {
  idsujet: number;
  nomsujet: string;
  idcategoriesujet: number;
  [key: string]: any;
}

export interface CategorieSujet {
  idcategoriesujet: number;
  nomcategorie: string;
  couleur: string;
  [key: string]: any;
}

export interface Pratique {
  idpratique: number;
  nompratique: string;
  idcategoriepratique: number;
  [key: string]: any;
}

export interface CategoriePratique {
  id: number;
  nomcategorie: string;
  couleur: string;
  [key: string]: any;
}

export interface Call {
  callid: string;
  description: string;
  [key: string]: any;
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

export interface StatsData {
  totalPostits: number;
  uniqueSujets: number;
  uniquePratiques: number;
  sujetsDetails: Array<{ name: string; count: number }>;
  pratiquesDetails: Array<{ name: string; count: number }>;
}

// Types pour les props des composants
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

export interface CritereQualiteTabProps {
  selectedDomain: number | null;
  categoriesSujets: CategorieSujet[];
  sujetsData: Sujet[];
  categoriesPratiques: CategoriePratique[];
  pratiques: Pratique[];
}

export interface SimulationCoachingTabProps {
  filteredPostits: Postit[];
  sujetsData: Sujet[];
  categoriesSujets: CategorieSujet[];
  pratiques: Pratique[];
  categoriesPratiques: CategoriePratique[];
}

export interface EvaluationCardProps {
  postit: Postit;
  sujetColor?: string;
  pratiqueColor?: string;
  onSimulate: (postit: Postit) => void;
}
