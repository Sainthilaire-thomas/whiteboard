// types.ts
export interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder"; // ✅ Obligatoire
  mimeType?: string;
  size?: number;
  children?: FileNode[];
}

// Interfaces pour les conseillers
export interface Conseiller {
  idconseiller: number;
  avatarUrl?: string;
  nom: string;
  estanonyme: boolean;
}

// Interfaces pour les avatars anonymes
export interface AvatarAnonyme {
  idavatar: number;
  url?: string;
  nom: string;
}

// Interface pour les entreprises
export interface Entreprise {
  identreprise: number;
  nom: string;
  // Ajoutez d'autres propriétés selon vos besoins
}

// Interface pour les appels
export interface Call {
  callid: number;
  audiourl?: string;
  filename?: string;
  filepath?: string;
  transcription?: string;
  description?: string;
  upload: boolean;
  // Ajoutez d'autres propriétés selon vos besoins
}

// Interface pour les activités
export interface Activite {
  idactivite: number;
  idconseiller: number;
  dateactivite: string;
  statut: "ouvert" | "fermé" | "en_cours";
  nature: "évaluation" | "formation" | "coaching";
}

// Interface pour la sélection de conseiller (utilisée dans SelectionConseiller)
export interface SelectionConseillerData {
  type: "conseiller" | "avatar";
  id: number;
}
