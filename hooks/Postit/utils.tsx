// utils.ts - Fonctions utilitaires pour les hooks Postit

import { Postit as PostitTypes } from "@/types/types";

// Types pour la validation
export interface PostitValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PostitCompletionStatus {
  hasValidSubject: boolean;
  hasValidPractice: boolean;
  isComplete: boolean;
  completionPercentage: number;
}

/**
 * Vérifie si un sujet est valide
 */
export const hasValidSubject = (postit: PostitTypes): boolean => {
  return (
    postit?.idsujet !== null &&
    postit?.idsujet !== undefined &&
    postit?.idsujet > 0
  );
};

/**
 * Vérifie si une pratique est valide
 */
export const hasValidPractice = (postit: PostitTypes): boolean => {
  return (
    postit?.idpratique !== null &&
    postit?.idpratique !== undefined &&
    postit?.idpratique > 0
  );
};

/**
 * Vérifie si un postit est complet
 */
export const isPostitComplete = (postit: PostitTypes): boolean => {
  return hasValidSubject(postit) && hasValidPractice(postit);
};

/**
 * Obtient le statut de complétion d'un postit
 */
export const getPostitCompletionStatus = (
  postit: PostitTypes
): PostitCompletionStatus => {
  const hasSubject = hasValidSubject(postit);
  const hasPractice = hasValidPractice(postit);
  const isComplete = hasSubject && hasPractice;

  let completionPercentage = 0;
  if (postit?.text) completionPercentage += 25; // Contexte
  if (hasSubject) completionPercentage += 37.5; // Sujet
  if (hasPractice) completionPercentage += 37.5; // Pratique

  return {
    hasValidSubject: hasSubject,
    hasValidPractice: hasPractice,
    isComplete,
    completionPercentage: Math.round(completionPercentage),
  };
};

/**
 * Valide un postit avant sauvegarde
 */
export const validatePostit = (postit: PostitTypes): PostitValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validations obligatoires
  if (!hasValidSubject(postit)) {
    errors.push("Un critère qualité doit être sélectionné");
  }

  if (!hasValidPractice(postit)) {
    errors.push("Une pratique d'amélioration doit être sélectionnée");
  }

  // Validations optionnelles (warnings)
  if (!postit?.text || postit.text.trim().length === 0) {
    warnings.push("Aucun commentaire de contexte n'a été ajouté");
  }

  if (postit?.text && postit.text.length < 10) {
    warnings.push("Le commentaire de contexte semble très court");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Formate les données d'un postit pour l'envoi à l'API
 */
export const formatPostitForAPI = (postit: PostitTypes) => {
  return {
    id: postit.id,
    text: postit.text || null,
    sujet: postit.sujet || null,
    idsujet: postit.idsujet || null,
    iddomaine: postit.iddomaine || null,
    pratique: postit.pratique || null,
    idpratique: postit.idpratique || null,
  };
};

/**
 * Réinitialise un postit à son état vide
 */
export const resetPostitState = (postitId: number): Partial<PostitTypes> => {
  return {
    id: postitId,
    text: "",
    sujet: "Non Assigné",
    idsujet: null,
    iddomaine: null,
    pratique: "Non Assigné",
    idpratique: null,
  };
};

/**
 * Compare deux postits pour détecter les changements significatifs
 */
export const hasPostitChanged = (
  postit1: PostitTypes,
  postit2: PostitTypes
): boolean => {
  return (
    postit1.idsujet !== postit2.idsujet ||
    postit1.idpratique !== postit2.idpratique ||
    postit1.text !== postit2.text
  );
};

/**
 * Obtient le libellé d'état d'un postit
 */
export const getPostitStatusLabel = (postit: PostitTypes): string => {
  const status = getPostitCompletionStatus(postit);

  if (status.isComplete) {
    return "Complet";
  } else if (status.hasValidSubject && !status.hasValidPractice) {
    return "Critère assigné";
  } else if (!status.hasValidSubject && status.hasValidPractice) {
    return "Pratique assignée"; // Cas rare mais possible
  } else {
    return "En cours";
  }
};

/**
 * Obtient la couleur associée au statut d'un postit
 */
export const getPostitStatusColor = (postit: PostitTypes): string => {
  const status = getPostitCompletionStatus(postit);

  if (status.isComplete) {
    return "success";
  } else if (status.completionPercentage > 50) {
    return "warning";
  } else {
    return "error";
  }
};
